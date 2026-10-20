// Voice in and out, for every supported language.
//
// Dialogue and teaching audio are intentionally different:
//   - dialogue uses an authored role profile (stall owner, grandparent, friend, colleague)
//   - lessons, hints and review use the steady "coach" profile
//
// Mandarin tries Amazon Polly first. Malay and Tamil use the best matching voice installed on the
// device, preferring Singapore locales and higher-quality "Natural" / "Neural" voices by name.

import { getLanguage } from '../data/languages.js';
import { matchingVoices, resolveDelivery, selectBestVoice } from './voice.js';

const player = typeof Audio !== 'undefined' ? new Audio() : null;
const urlCache = new Map();
let unlocked = false;
let pollyDownUntil = 0;
let generation = 0;
let activeFetch = null;
let speechPreferences = { style: 'natural', voiceOverrides: {} };
const voiceStatusListeners = new Set();

const publishVoiceStatus = (langId) => {
  for (const listener of voiceStatusListeners) listener(langId);
};

export function onVoiceStatusChanged(handler) {
  voiceStatusListeners.add(handler);
  return () => voiceStatusListeners.delete(handler);
}

export function configureSpeech({ style, voiceOverrides } = {}) {
  speechPreferences = {
    style: style || speechPreferences.style,
    voiceOverrides: voiceOverrides && typeof voiceOverrides === 'object' ? voiceOverrides : speechPreferences.voiceOverrides,
  };
}

const SILENT =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export function unlockAudio() {
  if (unlocked || !player) return;
  player.src = SILENT;
  player.play().then(() => {
    unlocked = true;
  }).catch(() => {});
}

function cancelPlayback() {
  activeFetch?.abort();
  activeFetch = null;
  if (player) {
    player.pause();
    try {
      player.currentTime = 0;
    } catch {
      // Some browsers reject seeking while metadata is not loaded.
    }
  }
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

export function stopSpeaking() {
  generation += 1; // invalidates a Polly response that completes after the learner moved on
  cancelPlayback();
}

function cacheUrl(key, url) {
  if (urlCache.size >= 160) {
    const oldest = urlCache.keys().next().value;
    const oldUrl = urlCache.get(oldest);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    urlCache.delete(oldest);
  }
  urlCache.set(key, url);
}

async function getPollyUrl(text, options, signal) {
  const { lang, slow, profile, style } = options;
  const key = `${lang}:${profile}:${style}:${slow ? 's' : 'n'}:${text}`;
  const cached = urlCache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ lang, text, profile, style });
  if (slow) params.set('slow', '1');
  const res = await fetch(`/api/tts?${params}`, { signal });
  if (!res.ok || !(res.headers.get('content-type') || '').includes('audio')) {
    throw new Error('tts unavailable');
  }
  const url = URL.createObjectURL(await res.blob());
  cacheUrl(key, url);
  return url;
}

function browserSynth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

export function availableVoices(langId) {
  const synth = browserSynth();
  if (!synth) return [];
  return matchingVoices(synth.getVoices(), getLanguage(langId));
}

export function selectedVoice(langId, preferredName = '') {
  const synth = browserSynth();
  if (!synth) return null;
  return selectBestVoice(synth.getVoices(), getLanguage(langId), preferredName);
}

export function selectedVoiceLabel(langId, preferredName = '') {
  const voice = selectedVoice(langId, preferredName);
  if (!voice) return null;
  return `${voice.name} · ${voice.lang.replace('_', '-')}`;
}

function speakWithBrowser(text, options, ownGeneration) {
  const synth = browserSynth();
  if (!synth || ownGeneration !== generation) return false;
  const language = getLanguage(options.lang);
  const delivery = resolveDelivery(options.profile, options.style, options.slow);
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectBestVoice(synth.getVoices(), language, options.voiceName);
  if (!voice) return false;

  utterance.lang = voice.lang;
  utterance.rate = delivery.rate;
  utterance.pitch = delivery.pitch;
  utterance.volume = delivery.volume;
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
  return true;
}

// true: a usable route exists. false: voices loaded and none matches. null: browser voices not loaded yet.
export function voiceAvailable(langId, preferredName = '') {
  const language = getLanguage(langId);
  const synth = browserSynth();
  if (!synth) return language.polly ? true : false;
  const voices = synth.getVoices();
  if (voices.length === 0) {
    if (!language.polly) return null;
    return Date.now() >= pollyDownUntil;
  }
  if (selectBestVoice(voices, language, preferredName)) return true;
  return language.polly && Date.now() >= pollyDownUntil ? true : false;
}

export function onVoicesChanged(handler) {
  const synth = browserSynth();
  if (!synth?.addEventListener) return () => {};
  synth.addEventListener('voiceschanged', handler);
  return () => synth.removeEventListener('voiceschanged', handler);
}

export async function speak(
  text,
  {
    lang = 'zh',
    slow = false,
    profile = 'coach',
    style,
    voiceName,
  } = {},
) {
  if (!text) return false;
  generation += 1;
  const ownGeneration = generation;
  cancelPlayback();

  const language = getLanguage(lang);
  const resolvedStyle = style || speechPreferences.style || 'natural';
  const resolvedVoice = voiceName || speechPreferences.voiceOverrides?.[lang] || '';
  const options = { lang, slow, profile, style: resolvedStyle, voiceName: resolvedVoice };

  if (language.polly && Date.now() >= pollyDownUntil && player) {
    const controller = new AbortController();
    activeFetch = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 6000);
    let url = null;
    try {
      url = await getPollyUrl(text, options, controller.signal);
    } catch (error) {
      if (ownGeneration !== generation || (error?.name === 'AbortError' && !timedOut)) return false;
      // A network/TTS failure gets browser speech now, then Polly can try again after a minute.
      pollyDownUntil = Date.now() + 60_000;
      publishVoiceStatus(lang);
      setTimeout(() => publishVoiceStatus(lang), 60_050);
    } finally {
      clearTimeout(timer);
      // An older aborted request must not erase the controller for a newer speak() call.
      if (activeFetch === controller) activeFetch = null;
    }

    if (url && ownGeneration === generation) {
      try {
        player.src = url;
        await player.play();
        return true;
      } catch {
        // Autoplay may be blocked even though Polly worked. Keep Polly healthy and use the browser.
      }
    }
  }
  return speakWithBrowser(text, options, ownGeneration);
}

// Per-tile audio is always neutral and slow. A tile is vocabulary, not character dialogue.
export function speakWord(word, langId, style = 'clear', voiceName = '') {
  if (!word) return;
  speak(word, { lang: langId, slow: true, profile: 'coach', style, voiceName });
}

const Recognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const canListen = Boolean(Recognition);

// Returns a function that stops listening.
export function listen({ lang = 'zh', onText, onEnd, onError }) {
  const rec = new Recognition();
  rec.lang = getLanguage(lang).speech;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  rec.onresult = (event) => {
    let text = '';
    for (const result of event.results) text += result[0].transcript;
    onText(text);
  };
  rec.onerror = (event) => onError?.(event.error);
  rec.onend = () => onEnd?.();
  rec.start();
  return () => rec.stop();
}

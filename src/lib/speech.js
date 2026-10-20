// Voice in and out, for every supported language.
// Out: Amazon Polly through /api/tts where the language has a Polly voice (Mandarin),
//      otherwise the browser's own voice (Malay, Tamil).
// In:  the browser's speech recognition (Chrome and Edge; hidden where unsupported).

import { getLanguage } from '../data/languages.js';

const player = typeof Audio !== 'undefined' ? new Audio() : null;
const urlCache = new Map();
let unlocked = false;
let pollyDown = false;

// A tiny silent clip. Playing it inside a tap "unlocks" the audio element on iOS,
// so later replies can play without another tap.
const SILENT =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export function unlockAudio() {
  if (unlocked || !player) return;
  unlocked = true;
  player.src = SILENT;
  player.play().catch(() => {});
}

export function stopSpeaking() {
  player?.pause();
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

async function getPollyUrl(text, slow, lang) {
  const key = `${lang}:${slow ? 's' : 'n'}:${text}`;
  const cached = urlCache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(
      `/api/tts?lang=${lang}&text=${encodeURIComponent(text)}${slow ? '&slow=1' : ''}`,
      { signal: controller.signal },
    );
    if (!res.ok || !(res.headers.get('content-type') || '').includes('audio')) {
      throw new Error('tts unavailable');
    }
    const url = URL.createObjectURL(await res.blob());
    urlCache.set(key, url);
    return url;
  } finally {
    clearTimeout(timer);
  }
}

const prefixOf = (speechLang) => speechLang.split('-')[0].toLowerCase();

function findVoice(speechLang) {
  const synth = window.speechSynthesis;
  const prefix = prefixOf(speechLang);
  const voices = synth.getVoices();
  return (
    voices.find((v) => v.lang.replace('_', '-').toLowerCase() === speechLang.toLowerCase()) ??
    voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix))
  );
}

function speakWithBrowser(text, slow, speechLang) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang;
  utterance.rate = slow ? 0.6 : 0.9;
  const voice = findVoice(speechLang);
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

// true: a voice exists. false: voices have loaded and none matches. null: not known yet.
export function voiceAvailable(langId) {
  const language = getLanguage(langId);
  if (typeof window === 'undefined' || !window.speechSynthesis) return language.polly ? true : false;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return language.polly ? true : null;
  if (findVoice(language.speech)) return true;
  return language.polly ? true : false;
}

// Browsers load voices asynchronously. Lets a component re-check once they arrive.
export function onVoicesChanged(handler) {
  if (typeof window === 'undefined' || !window.speechSynthesis?.addEventListener) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener('voiceschanged', handler);
  return () => synth.removeEventListener('voiceschanged', handler);
}

export async function speak(text, { lang = 'zh', slow = false } = {}) {
  if (!text) return;
  const language = getLanguage(lang);
  stopSpeaking();

  if (language.polly && !pollyDown && player) {
    let url = null;
    try {
      url = await getPollyUrl(text, slow, lang);
    } catch {
      pollyDown = true; // stop retrying Polly for the rest of the session
    }
    if (url) {
      try {
        player.src = url;
        await player.play();
        return;
      } catch {
        // autoplay blocked or interrupted: fall through to the browser voice
      }
    }
  }
  speakWithBrowser(text, slow, language.speech);
}

// Per-tile audio. Tapping tiles quickly should not queue up a pile-up of overlapping words, so
// each call cancels the last. Always slow: a single word is being inspected, not listened to.
export function speakWord(word, langId) {
  if (!word) return;
  stopSpeaking();
  speak(word, { lang: langId, slow: true });
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

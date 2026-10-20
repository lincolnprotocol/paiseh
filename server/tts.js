// Trusted SSML generation for natural Mandarin delivery.
// Caller text is always escaped; profile/style values are resolved through fixed allowlists in
// lib/voice.js, so query parameters can never inject arbitrary SSML or select an arbitrary voice.

import { isVoiceProfile, isVoiceStyle, resolveDelivery } from '../src/lib/voice.js';

export const escapeXml = (text) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function normaliseVoiceRequest({ profile, style, slow }) {
  return {
    profile: isVoiceProfile(profile) ? profile : 'coach',
    style: isVoiceStyle(style) ? style : 'natural',
    slow: Boolean(slow),
  };
}

// Keep natural punctuation, then add a small pause after it. TTS engines already pause on
// punctuation, so these values are intentionally subtle rather than theatrical.
export function buildNaturalSsml(text, options = {}) {
  const request = normaliseVoiceRequest(options);
  const delivery = resolveDelivery(request.profile, request.style, request.slow);
  const parts = String(text ?? '').split(/([，,、；;：:。！？!?]+)/u);
  const spoken = parts
    .map((part, index) => {
      if (!part) return '';
      const escaped = escapeXml(part);
      if (index % 2 === 0) return escaped;
      const sentence = /[。！？!?]/u.test(part);
      const pause = sentence ? delivery.sentencePauseMs : delivery.clausePauseMs;
      return `${escaped}<break time="${pause}ms"/>`;
    })
    .join('');

  // A tiny lead-in keeps the first syllable from feeling clipped after a UI transition.
  return `<speak><break time="70ms"/><prosody rate="${delivery.pollyRate}%">${spoken}</prosody></speak>`;
}

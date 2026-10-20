// Voice delivery is authored by role, never guessed from a person's name.
// The same profile drives browser speech, Polly prosody and the chat's typing rhythm so the
// character feels consistent even when the app falls back from AWS to a device voice.

export const VOICE_STYLES = [
  { id: 'natural', label: 'Natural', blurb: 'Everyday pace, matched to the person' },
  { id: 'clear', label: 'Extra clear', blurb: 'A little slower, steady pitch' },
  { id: 'lively', label: 'Lively', blurb: 'Quicker and more expressive' },
];

export const VOICE_PROFILES = {
  coach: {
    label: 'Learning coach',
    rate: 0.88,
    pitch: 1,
    volume: 1,
    pollyRate: 88,
    responseBaseMs: 420,
    clausePauseMs: 120,
    sentencePauseMs: 210,
  },
  stall: {
    label: 'Friendly stall owner',
    rate: 0.95,
    pitch: 1.03,
    volume: 1,
    pollyRate: 95,
    responseBaseMs: 520,
    clausePauseMs: 105,
    sentencePauseMs: 180,
  },
  elder: {
    label: 'Warm grandparent',
    rate: 0.84,
    pitch: 0.96,
    volume: 1,
    pollyRate: 84,
    responseBaseMs: 680,
    clausePauseMs: 165,
    sentencePauseMs: 280,
  },
  friend: {
    label: 'Close friend',
    rate: 1.03,
    pitch: 1.06,
    volume: 1,
    pollyRate: 103,
    responseBaseMs: 340,
    clausePauseMs: 85,
    sentencePauseMs: 150,
  },
  colleague: {
    label: 'Friendly colleague',
    rate: 0.94,
    pitch: 1,
    volume: 1,
    pollyRate: 94,
    responseBaseMs: 480,
    clausePauseMs: 115,
    sentencePauseMs: 195,
  },
};

const SCENARIO_PROFILES = {
  hawker: 'stall',
  makan: 'stall',
  prata: 'stall',
  ahma: 'elder',
  nenek: 'elder',
  paati: 'elder',
  drama: 'friend',
  jom: 'friend',
  padam: 'friend',
  work: 'colleague',
  kerja: 'colleague',
  velai: 'colleague',
};

export const profileForScenario = (scenarioId) => SCENARIO_PROFILES[scenarioId] ?? 'coach';

export function resolveDelivery(profileId = 'coach', style = 'natural', slow = false) {
  const base = VOICE_PROFILES[profileId] ?? VOICE_PROFILES.coach;
  const stylePatch =
    style === 'clear'
      ? { rate: -0.09, pitch: 1 - base.pitch, pollyRate: -9, pause: 35 }
      : style === 'lively'
        ? { rate: 0.05, pitch: 0.04, pollyRate: 5, pause: -20 }
        : { rate: 0, pitch: 0, pollyRate: 0, pause: 0 };

  const slowPatch = slow ? -0.17 : 0;
  return {
    ...base,
    rate: clamp(base.rate + stylePatch.rate + slowPatch, 0.58, 1.12),
    pitch: clamp(base.pitch + stylePatch.pitch, 0.82, 1.18),
    pollyRate: Math.round(clamp(base.pollyRate + stylePatch.pollyRate + (slow ? -17 : 0), 58, 112)),
    clausePauseMs: Math.round(clamp(base.clausePauseMs + stylePatch.pause + (slow ? 45 : 0), 60, 280)),
    sentencePauseMs: Math.round(clamp(base.sentencePauseMs + stylePatch.pause + (slow ? 60 : 0), 110, 420)),
  };
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const normaliseLocale = (locale) => String(locale ?? '').replace('_', '-').toLowerCase();
const languagePrefix = (locale) => normaliseLocale(locale).split('-')[0];
const QUALITY = /natural|neural|premium|enhanced|studio|siri|google|microsoft/i;
const ROBOTIC = /compact|espeak|festival|mbrola/i;

function voiceScore(voice, language, index = 0) {
  const locales = language.voiceLocales ?? [language.speech];
  const locale = normaliseLocale(voice.lang);
  const localeIndex = locales.findIndex((candidate) => normaliseLocale(candidate) === locale);
  const sameLanguage = languagePrefix(locale) === languagePrefix(language.speech);
  // Locale tiers are 300 points apart while every quality bonus combined is under 120. That makes
  // the order lexicographic: an available Singapore voice always beats a regional fallback, and
  // quality only decides between voices inside the same locale tier.
  let score = localeIndex >= 0 ? 2000 - localeIndex * 300 : sameLanguage ? 500 : -1000;
  if (QUALITY.test(voice.name)) score += 90;
  if (ROBOTIC.test(voice.name)) score -= 180;
  if (voice.default) score += 18;
  if (voice.localService) score += 8;
  score -= index / 1000;
  return score;
}

// Picks the best voice installed on this device. Locale comes first (Singapore, then the regional
// fallback), then explicit user choice, then names that browsers use for their higher-quality voices.
export function selectBestVoice(voices, language, preferredName = '') {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  if (preferredName) {
    const exactName = voices.find((v) => v.name === preferredName);
    if (exactName && languagePrefix(exactName.lang) === languagePrefix(language.speech)) return exactName;
  }

  const ranked = voices
    .map((voice, index) => ({ voice, score: voiceScore(voice, language, index) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice ?? null;
}

export function matchingVoices(voices, language) {
  return (voices ?? [])
    .map((voice, index) => ({ voice, score: voiceScore(voice, language, index) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.voice);
}

// A believable typing beat. Fast local fallback replies still pause; a slow network/model response
// gets no artificial wait piled on top. Longer replies get a little more time, with bounded jitter.
export function conversationDelay(text, profileId, elapsedMs = 0, rng = Math.random) {
  const profile = VOICE_PROFILES[profileId] ?? VOICE_PROFILES.coach;
  const length = [...String(text ?? '')].length;
  const punctuation = (String(text ?? '').match(/[，,。.!！？?；;]/g) ?? []).length;
  const target = clamp(profile.responseBaseMs + length * 13 + punctuation * 55 + rng() * 170, 480, 1450);
  return Math.max(0, Math.round(target - Math.max(0, elapsedMs)));
}

export const VOICE_PREVIEWS = {
  zh: '吃饱了没？等下我们一起去吃饭。',
  ms: 'Dah makan? Jom kita pergi makan nanti.',
  ta: 'சாப்பிட்டியா? அப்புறம் சேர்ந்து சாப்பிடலாம்.',
};

export const isVoiceStyle = (value) => VOICE_STYLES.some((s) => s.id === value);
export const isVoiceProfile = (value) => Object.hasOwn(VOICE_PROFILES, value);

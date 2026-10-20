// Progress lives in localStorage: no accounts, no database.
// Streak is shared across languages. XP, sessions and the phrasebook are kept per language.

const KEY = 'bilingos:v2';
const OLD_KEY = 'bilingos:v1';
const DAY = 86_400_000;

// Spaced repetition: how long to wait before a phrase comes back, by box (0 = new or forgotten).
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

const DEFAULTS = {
  streak: 0,
  lastDay: null, // local date of the last practice, "YYYY-MM-DD"
  settings: { roman: true, slow: false, lang: 'zh' },
  langs: {}, // langId -> { xp, sessions, phrases: { text -> phrase }, lessons: { scenarioId -> true } }
  outbox: [], // feedback that could not be sent yet
};

const blankLang = () => ({ xp: 0, sessions: 0, phrases: {}, lessons: {} });

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') return normalise(saved);

    // Migrate the first version (Mandarin only).
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
    if (old && typeof old === 'object') {
      const phrases = {};
      for (const [hanzi, p] of Object.entries(old.phrases ?? {})) {
        phrases[hanzi] = { text: hanzi, roman: p.pinyin ?? '', english: p.english ?? '', savedAt: p.savedAt ?? Date.now(), box: 0, due: 0 };
      }
      return normalise({
        streak: old.streak,
        lastDay: old.lastDay,
        settings: { roman: old.settings?.pinyin ?? true, slow: old.settings?.slow ?? false, lang: 'zh' },
        langs: { zh: { xp: old.xp ?? 0, sessions: old.sessions ?? 0, phrases } },
      });
    }
  } catch {
    // corrupted or blocked storage: start fresh
  }
  return normalise({});
}

function normalise(saved) {
  return {
    ...DEFAULTS,
    ...saved,
    settings: { ...DEFAULTS.settings, ...saved.settings },
    langs: saved.langs ?? {},
    outbox: Array.isArray(saved.outbox) ? saved.outbox : [],
  };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // private mode or full storage: progress just won't persist
  }
}

export const langState = (progress, lang) => ({ ...blankLang(), ...progress.langs[lang] });

function dayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

// A streak only counts while the last practice was today or yesterday.
export function currentStreak(progress) {
  if (!progress.lastDay) return 0;
  const alive = progress.lastDay === dayKey() || progress.lastDay === dayKey(daysAgo(1));
  return alive ? progress.streak : 0;
}

function touchStreak(progress) {
  const today = dayKey();
  if (progress.lastDay === today) return { streak: progress.streak, lastDay: today };
  const streak = progress.lastDay === dayKey(daysAgo(1)) ? progress.streak + 1 : 1;
  return { streak, lastDay: today };
}

function withLang(progress, lang, patch) {
  return { ...progress, langs: { ...progress.langs, [lang]: { ...langState(progress, lang), ...patch } } };
}

export function recordSession(progress, lang, { xpGained, learned }) {
  const cur = langState(progress, lang);
  const phrases = { ...cur.phrases };
  for (const item of learned) {
    if (!item?.text) continue;
    const existing = phrases[item.text];
    phrases[item.text] = existing ?? { ...item, savedAt: Date.now(), box: 0, due: 0 };
  }
  return {
    ...withLang(progress, lang, { xp: cur.xp + xpGained, sessions: cur.sessions + 1, phrases }),
    ...touchStreak(progress),
  };
}

// Finishing (or testing out of) a scenario's warm-up: save its phrases for review and unlock the chat for good.
export function completeLesson(progress, lang, scenarioId, phrases, xpGained) {
  const cur = langState(progress, lang);
  const saved = { ...cur.phrases };
  for (const item of phrases) {
    if (item?.text && !saved[item.text]) saved[item.text] = { ...item, savedAt: Date.now(), box: 0, due: 0 };
  }
  return {
    ...withLang(progress, lang, {
      xp: cur.xp + xpGained,
      phrases: saved,
      lessons: { ...cur.lessons, [scenarioId]: true },
    }),
    ...touchStreak(progress),
  };
}

export const lessonDone = (progress, lang, scenarioId) => Boolean(langState(progress, lang).lessons?.[scenarioId]);

// XP from a review or quiz session also counts towards the streak.
export function recordReview(progress, lang, { xpGained }) {
  const cur = langState(progress, lang);
  return { ...withLang(progress, lang, { xp: cur.xp + xpGained }), ...touchStreak(progress) };
}

// Move a phrase up a box when remembered, back to the start when forgotten.
export function gradePhrase(progress, lang, text, ok, now = Date.now()) {
  const cur = langState(progress, lang);
  const phrase = cur.phrases[text];
  if (!phrase) return progress;
  const box = ok ? Math.min((phrase.box ?? 0) + 1, INTERVAL_DAYS.length - 1) : 0;
  const updated = { ...phrase, box, due: now + INTERVAL_DAYS[box] * DAY };
  return withLang(progress, lang, { phrases: { ...cur.phrases, [text]: updated } });
}

export function allPhrases(progress, lang) {
  return Object.values(langState(progress, lang).phrases).sort((a, b) => b.savedAt - a.savedAt);
}

export function duePhrases(progress, lang, now = Date.now()) {
  return allPhrases(progress, lang).filter((p) => (p.due ?? 0) <= now);
}

// Level n starts at 60 * n * (n - 1) / 2 XP: 0, 60, 180, 360, 600 ...
const TITLES = ['Just starting', 'Hawker regular', 'Neighbourhood chatter', 'Family favourite', 'Confident speaker', 'Mother tongue champion'];
const levelStart = (n) => (60 * n * (n - 1)) / 2;

export function levelInfo(xp) {
  let level = 1;
  while (levelStart(level + 1) <= xp) level += 1;
  const from = levelStart(level);
  const to = levelStart(level + 1);
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    into: xp - from,
    span: to - from,
    pct: Math.round(((xp - from) / (to - from)) * 100),
  };
}

export function queueFeedback(progress, entry) {
  return { ...progress, outbox: [...progress.outbox, entry].slice(-20) };
}

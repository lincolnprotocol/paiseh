// Everything the learner has done lives in localStorage. No accounts, no server, no sign-up friction.
//
// v3 adds, on top of v2:
//   - a day-by-day XP history, so progress can actually be shown as a chart
//   - daily missions with counters, so opening the app has a point
//   - achievements
//   - lapse counts per phrase, so a phrase you keep forgetting gets flagged instead of
//     silently ping-ponging between box 0 and box 1 forever
//   - streak freezes, so one busy day does not wipe out five weeks of work
//   - export / import, because "no accounts" should not mean "lose everything with your phone"

import { ACHIEVEMENTS } from '../data/achievements.js';
import { MISSION_POOL, missionsForDay } from '../data/missions.js';

const KEY = 'bilingos:v3';
const OLD_KEYS = ['bilingos:v2', 'bilingos:v1'];
const DAY = 86_400_000;

// Spaced repetition: days to wait before a phrase comes back, indexed by box.
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
export const MAX_BOX = INTERVAL_DAYS.length - 1;

// Forget a phrase this many times and it is a "leech": the normal schedule is not working on it.
export const LEECH_LAPSES = 4;

export const DEFAULT_SETTINGS = {
  lang: 'zh',
  uiLang: 'en',
  roman: true,
  slow: false,
  layout: 'auto',
  theme: 'auto',
  fontScale: 'md',
  autoplay: true,
  naturalPacing: true,
  voiceStyle: 'natural',
  voiceOverrides: {},
  showEnglishFirst: false,
};

const DEFAULTS = {
  version: 3,
  streak: 0,
  lastDay: null,
  freezes: 2, // "life happens" tokens that keep a streak alive for one missed day
  settings: { ...DEFAULT_SETTINGS },
  history: {}, // 'YYYY-MM-DD' -> xp earned that day
  day: null, // { key, counts: { build: 0, ... }, claimed: [] }
  achievements: {}, // id -> timestamp earned
  langs: {}, // langId -> langState
  outbox: [],
};

const blankLang = () => ({
  xp: 0,
  sessions: 0,
  phrases: {}, // text -> { text, roman, english, savedAt, box, due, reps, lapses }
  lessons: {}, // scenarioId -> true
  counters: { build: 0, write: 0, say: 0, review: 0 },
});

/* ------------------------------------------------------------------ dates */

export function dayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function shiftDays(n, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + n);
  return date;
}

export const dayKeyAgo = (n) => dayKey(shiftDays(-n));

/* ------------------------------------------------------------- load / save */

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') return normalise(saved);
    for (const key of OLD_KEYS) {
      const old = JSON.parse(localStorage.getItem(key) || 'null');
      if (old && typeof old === 'object') return normalise(migrate(old, key));
    }
  } catch {
    // corrupted, blocked or full storage: start clean rather than crash on launch
  }
  return normalise({});
}

// v1 was Mandarin-only and stored pinyin under a different name. v2 was already multi-language.
function migrate(old, key) {
  if (key === 'bilingos:v2') {
    return {
      streak: old.streak,
      lastDay: old.lastDay,
      settings: { ...DEFAULT_SETTINGS, ...old.settings },
      langs: old.langs,
      outbox: old.outbox,
    };
  }
  const phrases = {};
  for (const [hanzi, p] of Object.entries(old.phrases ?? {})) {
    phrases[hanzi] = {
      text: hanzi,
      roman: p.pinyin ?? '',
      english: p.english ?? '',
      savedAt: p.savedAt ?? Date.now(),
      box: 0,
      due: 0,
      reps: 0,
      lapses: 0,
    };
  }
  return {
    streak: old.streak,
    lastDay: old.lastDay,
    settings: { ...DEFAULT_SETTINGS, roman: old.settings?.pinyin ?? true, slow: old.settings?.slow ?? false },
    langs: { zh: { ...blankLang(), xp: old.xp ?? 0, sessions: old.sessions ?? 0, phrases } },
  };
}

function normalise(saved) {
  const langs = {};
  for (const [id, state] of Object.entries(saved.langs ?? {})) {
    langs[id] = {
      ...blankLang(),
      ...state,
      counters: { ...blankLang().counters, ...(state?.counters ?? {}) },
      phrases: Object.fromEntries(
        Object.entries(state?.phrases ?? {}).map(([text, p]) => [
          text,
          { box: 0, due: 0, reps: 0, lapses: 0, savedAt: Date.now(), ...p, text },
        ]),
      ),
    };
  }
  return {
    ...DEFAULTS,
    ...saved,
    version: 3,
    settings: { ...DEFAULT_SETTINGS, ...saved.settings },
    history: saved.history && typeof saved.history === 'object' ? saved.history : {},
    achievements: saved.achievements && typeof saved.achievements === 'object' ? saved.achievements : {},
    day: saved.day ?? null,
    freezes: Number.isFinite(saved.freezes) ? saved.freezes : DEFAULTS.freezes,
    langs,
    outbox: Array.isArray(saved.outbox) ? saved.outbox : [],
  };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // private mode or quota: the session still works, it just will not persist
  }
}

// A clean, fully-formed progress object. Used on first run and by the tests, so nothing has to
// hand-build the shape and drift out of date when a field is added.
export const freshProgress = () => normalise({});

export const langState = (progress, lang) => ({ ...blankLang(), ...progress.langs[lang] });

function withLang(progress, lang, patch) {
  return { ...progress, langs: { ...progress.langs, [lang]: { ...langState(progress, lang), ...patch } } };
}

/* -------------------------------------------------------------- streaks */

// A streak survives if you practised today or yesterday. Miss two days and a freeze can cover one.
export function currentStreak(progress) {
  if (!progress.lastDay) return 0;
  if (progress.lastDay === dayKey() || progress.lastDay === dayKeyAgo(1)) return progress.streak;
  return 0;
}

export function streakAtRisk(progress) {
  return Boolean(progress.lastDay) && progress.lastDay === dayKeyAgo(1);
}

function touchStreak(progress) {
  const today = dayKey();
  if (progress.lastDay === today) return { streak: progress.streak, lastDay: today, freezes: progress.freezes };

  if (progress.lastDay === dayKeyAgo(1)) {
    return { streak: progress.streak + 1, lastDay: today, freezes: progress.freezes };
  }
  // Missed exactly one full day and has a freeze: spend it and keep the chain.
  if (progress.lastDay === dayKeyAgo(2) && progress.freezes > 0) {
    return { streak: progress.streak + 1, lastDay: today, freezes: progress.freezes - 1 };
  }
  return { streak: 1, lastDay: today, freezes: progress.freezes };
}

/* --------------------------------------------------------- daily missions */

export function today(progress) {
  const key = dayKey();
  const day = progress.day;
  if (day?.key === key) return { key, counts: day.counts ?? {}, claimed: day.claimed ?? [] };
  return { key, counts: {}, claimed: [] };
}

function withToday(progress, patch) {
  const day = today(progress);
  return { ...progress, day: { ...day, ...patch } };
}

// The three missions for today. Deterministic from the date, so they do not reshuffle on reload.
export function dailyMissions(progress) {
  const day = today(progress);
  return missionsForDay(day.key).map((m) => ({
    ...m,
    progress: Math.min(day.counts[m.id] ?? 0, m.target),
    done: (day.counts[m.id] ?? 0) >= m.target,
    claimed: day.claimed.includes(m.id),
  }));
}

export const missionsComplete = (progress) => dailyMissions(progress).every((m) => m.done);

// Called whenever the learner does something a mission might be counting.
export function bumpMission(progress, kind, amount = 1) {
  if (!MISSION_POOL.some((m) => m.id === kind)) return progress;
  const day = today(progress);
  return withToday(progress, { counts: { ...day.counts, [kind]: (day.counts[kind] ?? 0) + amount } });
}

export function claimMission(progress, id) {
  const mission = dailyMissions(progress).find((m) => m.id === id);
  if (!mission || !mission.done || mission.claimed) return progress;
  const day = today(progress);
  const claimed = withToday(progress, { claimed: [...day.claimed, id] });
  return addXp(claimed, claimed.settings.lang, mission.xp);
}

/* ---------------------------------------------------------------- XP / history */

function addHistory(progress, xp) {
  const key = dayKey();
  const history = progress.history ?? {};
  return { ...progress, history: { ...history, [key]: (history[key] ?? 0) + xp } };
}

// The single place XP is granted: updates the language total, the day history and the streak.
export function addXp(progress, lang, xp) {
  if (!xp) return progress;
  const cur = langState(progress, lang);
  const next = withLang(progress, lang, { xp: cur.xp + xp });
  return { ...addHistory(next, xp), ...touchStreak(progress) };
}

export function totalXp(progress) {
  return Object.values(progress.langs).reduce((sum, l) => sum + (l?.xp ?? 0), 0);
}

// XP per day for the last `days` days, oldest first. Used by the progress chart.
export function historySeries(progress, days = 14) {
  const history = progress.history ?? {};
  return Array.from({ length: days }, (_, i) => {
    const key = dayKeyAgo(days - 1 - i);
    return { day: key, xp: history[key] ?? 0 };
  });
}

export function activeDays(progress, days = 7) {
  return historySeries(progress, days).filter((d) => d.xp > 0).length;
}

/* ------------------------------------------------------------ phrase store */

function savePhrases(existing, items) {
  const phrases = { ...existing };
  for (const item of items ?? []) {
    if (!item?.text) continue;
    if (!phrases[item.text]) {
      phrases[item.text] = {
        text: item.text,
        roman: item.roman ?? '',
        english: item.english ?? '',
        savedAt: Date.now(),
        box: 0,
        due: 0,
        reps: 0,
        lapses: 0,
      };
    }
  }
  return phrases;
}

// Adds one phrase to the phrasebook without touching XP or the streak. Used by the Real talk
// screen, where saving a slang entry should not count as "practice".
export function savePhrase(progress, lang, phrase) {
  const cur = langState(progress, lang);
  if (!phrase?.text || cur.phrases[phrase.text]) return progress;
  return checkAchievements(withLang(progress, lang, { phrases: savePhrases(cur.phrases, [phrase]) }), lang);
}

export function recordSession(progress, lang, { xpGained, learned }) {
  const cur = langState(progress, lang);
  const next = withLang(progress, lang, {
    sessions: cur.sessions + 1,
    phrases: savePhrases(cur.phrases, learned),
  });
  return checkAchievements(bumpMission(addXp(next, lang, xpGained), 'chat'), lang);
}

export function completeLesson(progress, lang, scenarioId, phrases, xpGained) {
  const cur = langState(progress, lang);
  const next = withLang(progress, lang, {
    phrases: savePhrases(cur.phrases, phrases),
    lessons: { ...cur.lessons, [scenarioId]: true },
  });
  return checkAchievements(bumpMission(addXp(next, lang, xpGained), 'warmup'), lang);
}

export const lessonDone = (progress, lang, scenarioId) =>
  Boolean(langState(progress, lang).lessons?.[scenarioId]);

export function recordReview(progress, lang, { xpGained, reviewed = 0 }) {
  const next = reviewed > 0 ? bumpMission(progress, 'review', reviewed) : progress;
  return checkAchievements(addXp(next, lang, xpGained), lang);
}

// Counts a drill action (a sentence built, a phrase written, a phrase spoken) for missions + stats.
export function recordDrill(progress, lang, kind, amount = 1) {
  const cur = langState(progress, lang);
  const next = withLang(progress, lang, {
    counters: { ...cur.counters, [kind]: (cur.counters[kind] ?? 0) + amount },
  });
  return bumpMission(next, kind, amount);
}

// Remembered: move up a box. Forgotten: back to the start, and count the lapse.
export function gradePhrase(progress, lang, text, ok, now = Date.now()) {
  const cur = langState(progress, lang);
  const phrase = cur.phrases[text];
  if (!phrase) return progress;
  const box = ok ? Math.min((phrase.box ?? 0) + 1, MAX_BOX) : 0;
  const updated = {
    ...phrase,
    box,
    due: now + INTERVAL_DAYS[box] * DAY,
    reps: (phrase.reps ?? 0) + 1,
    lapses: (phrase.lapses ?? 0) + (ok ? 0 : 1),
    lastSeen: now,
  };
  return withLang(progress, lang, { phrases: { ...cur.phrases, [text]: updated } });
}

export function allPhrases(progress, lang) {
  return Object.values(langState(progress, lang).phrases).sort((a, b) => b.savedAt - a.savedAt);
}

export function duePhrases(progress, lang, now = Date.now()) {
  return allPhrases(progress, lang).filter((p) => (p.due ?? 0) <= now);
}

// Phrases that keep slipping away. Worth drilling differently rather than waiting for the schedule.
export function leeches(progress, lang) {
  return allPhrases(progress, lang).filter((p) => (p.lapses ?? 0) >= LEECH_LAPSES);
}

export function strongPhrases(progress, lang) {
  return allPhrases(progress, lang).filter((p) => (p.box ?? 0) >= 3);
}

/* ------------------------------------------------------------------ levels */

const TITLES = [
  'Just starting',
  'Hawker regular',
  'Neighbourhood chatter',
  'Family favourite',
  'Confident speaker',
  'Mother tongue champion',
];

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

/* ------------------------------------------------------------ achievements */

// A flat snapshot the achievement rules can read without knowing the storage shape.
export function statsFor(progress, lang) {
  const state = langState(progress, lang);
  return {
    xp: state.xp,
    totalXp: totalXp(progress),
    level: levelInfo(state.xp).level,
    sessions: state.sessions,
    phrases: Object.keys(state.phrases).length,
    strong: strongPhrases(progress, lang).length,
    lessons: Object.keys(state.lessons ?? {}).length,
    streak: currentStreak(progress),
    builds: state.counters?.build ?? 0,
    writes: state.counters?.write ?? 0,
    says: state.counters?.say ?? 0,
    languages: Object.values(progress.langs).filter((l) => (l?.xp ?? 0) > 0).length,
    activeDays: activeDays(progress, 7),
  };
}

export function checkAchievements(progress, lang) {
  const stats = statsFor(progress, lang);
  const earned = { ...(progress.achievements ?? {}) };
  let changed = false;
  for (const ach of ACHIEVEMENTS) {
    if (!earned[ach.id] && ach.test(stats)) {
      earned[ach.id] = Date.now();
      changed = true;
    }
  }
  return changed ? { ...progress, achievements: earned } : progress;
}

export function earnedAchievements(progress) {
  const earned = progress.achievements ?? {};
  return ACHIEVEMENTS.map((a) => ({ ...a, earnedAt: earned[a.id] ?? null }));
}

/* ---------------------------------------------------------------- feedback */

export function queueFeedback(progress, entry) {
  return { ...progress, outbox: [...progress.outbox, entry].slice(-20) };
}

/* ----------------------------------------------------------- export/import */

// A copy-paste backup, so switching phones does not mean starting over.
export function exportProgress(progress) {
  return JSON.stringify({ app: 'bilingos', version: 3, exportedAt: Date.now(), progress }, null, 0);
}

export function importProgress(text) {
  const parsed = JSON.parse(text);
  const payload = parsed?.progress ?? parsed;
  if (!payload || typeof payload !== 'object') throw new Error('That does not look like a BiLingos backup.');
  if (!payload.langs && !payload.settings) throw new Error('That backup has no progress in it.');
  return normalise(payload);
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
    for (const key of OLD_KEYS) localStorage.removeItem(key);
  } catch {
    // nothing to do: an unreadable store is already effectively reset
  }
  return normalise({});
}

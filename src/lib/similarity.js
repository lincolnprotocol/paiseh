// Rough "did you say it right?" scoring: compares what speech recognition heard with the phrase.
// It catches wrong or missing words. It cannot judge tone or accent, so the UI never says "perfect".
//
// The improvement over the old version: a learner reading the romanisation out loud used to be
// scored only against the script. Browser recognition for Tamil and Malay is inconsistent about
// what it returns, so we now score against the script *and* the romanisation and keep the better
// of the two. That removes a whole class of unfair zeroes.

export function normalise(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\p{P}\p{S}\s]/gu, '');
}

// Drops Latin tone marks and accents: "wǒ yào" and "wo yao" should score the same.
// Almost nobody types pinyin with diacritics, and penalising that was punishing the learner for
// their keyboard rather than their Mandarin.
//
// Only the Combining Diacritical Marks block (U+0300-U+036F) is removed. That block is Latin-only,
// so Tamil vowel signs and Chinese characters are left completely untouched.
export function foldMarks(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}

// Compares two romanisations, ignoring tone marks as well as case and punctuation.
export const romanSimilarity = (a, b) => similarity(foldMarks(a), foldMarks(b));

function editDistance(a, b) {
  const x = [...a];
  const y = [...b];
  let prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= y.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[y.length];
}

// 0 to 1, where 1 is an exact match once case, spaces and punctuation are ignored.
export function similarity(heard, target) {
  const a = normalise(heard);
  const b = normalise(target);
  if (!a || !b) return 0;
  return 1 - editDistance(a, b) / Math.max([...a].length, [...b].length);
}

// Scores against the script and the romanisation, returning whichever the learner matched better.
// The romanisation comparison ignores tone marks, since recognition rarely returns them.
export function scoreAttempt(heard, phrase) {
  const script = similarity(heard, phrase.text);
  const roman = phrase.roman ? romanSimilarity(heard, phrase.roman) : 0;
  return roman > script ? { score: roman, matched: 'roman' } : { score: script, matched: 'script' };
}

export function verdict(score) {
  if (score >= 0.85) return { label: 'Spot on!', tone: 'good' };
  if (score >= 0.55) return { label: 'Close. Try once more.', tone: 'ok' };
  return { label: 'Not quite. Listen and try again.', tone: 'low' };
}

// Writing practice. The problem statement asks for speaking *and writing*, and the old build had
// no writing at all — the learner only ever tapped tiles or spoke.
//
// The hard part is not the checking, it is the keyboard. Most young adults in Singapore do not have
// a Chinese or Tamil IME set up, and telling them to go install one is exactly the kind of friction
// that makes people give up. So:
//
//   Malay  -> type it, the Latin keyboard they already have is enough
//   Chinese / Tamil -> a character palette on screen, or type the romanisation
//
// Typing the romanisation is accepted as a near miss rather than a failure: the learner clearly
// knew the phrase, they just could not produce the script. That earns partial credit and a nudge,
// which is much better teaching than a flat red cross.

import { normalise, romanSimilarity, similarity } from './similarity.js';

export const WRITING_MODES = { ms: 'latin', zh: 'palette', ta: 'palette' };

export const writingMode = (langId) => WRITING_MODES[langId] ?? 'latin';

// Characters that carry no meaning for a correctness check.
const strip = (text) =>
  String(text ?? '')
    .normalize('NFC')
    .replace(/[\p{P}\p{S}\s]/gu, '')
    .toLowerCase();

/* ------------------------------------------------------------------ grading */

export const EXACT = 'exact';
export const CLOSE = 'close';
export const ROMAN = 'roman'; // right phrase, wrong script
export const WRONG = 'wrong';

// Grades what the learner typed against the phrase.
// Returns { verdict, score, label, hint } where score is 0..1.
export function gradeWriting(typed, phrase) {
  const target = strip(phrase.text);
  const attempt = strip(typed);

  if (!attempt) {
    return { verdict: WRONG, score: 0, label: 'Nothing typed yet.', hint: null };
  }
  if (attempt === target) {
    return { verdict: EXACT, score: 1, label: 'Exactly right.', hint: null };
  }

  const scriptScore = similarity(typed, phrase.text);
  if (scriptScore >= 0.86) {
    return {
      verdict: CLOSE,
      score: scriptScore,
      label: 'Almost — check the highlighted parts.',
      hint: null,
    };
  }

  // Did they write the romanisation instead of the script? Tone marks are ignored here, because
  // typing "wo yao" rather than "wǒ yào" is a keyboard limitation, not a language mistake.
  if (phrase.roman) {
    const romanScore = romanSimilarity(typed, phrase.roman);
    if (romanScore >= 0.72) {
      return {
        verdict: ROMAN,
        score: 0.6,
        label: 'Right phrase, wrong script.',
        hint: `You wrote the sound. Now try it in the script: ${phrase.text}`,
      };
    }
  }

  return {
    verdict: scriptScore >= 0.5 ? CLOSE : WRONG,
    score: scriptScore,
    label: scriptScore >= 0.5 ? 'Close, but not there yet.' : 'Not quite. Have another go.',
    hint: null,
  };
}

// Counts as a pass for mission and XP purposes.
export const writingPassed = (result) => result.verdict === EXACT || result.verdict === CLOSE;

/* --------------------------------------------------------------- character diff */

// Per-character marks for showing the learner *where* it went wrong, rather than just that it did.
// Uses a simple longest-common-subsequence walk so an inserted character does not mark everything
// after it as wrong.
export function charDiff(typed, target) {
  const a = [...strip(typed)];
  const b = [...strip(target)];

  // LCS table. These strings are a dozen characters at most, so the quadratic table is fine.
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ char: a[i], state: 'right' });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ char: a[i], state: 'extra' });
      i += 1;
    } else {
      out.push({ char: b[j], state: 'missing' });
      j += 1;
    }
  }
  while (i < a.length) {
    out.push({ char: a[i], state: 'extra' });
    i += 1;
  }
  while (j < b.length) {
    out.push({ char: b[j], state: 'missing' });
    j += 1;
  }
  return out;
}

/* -------------------------------------------------------------- the palette */

// Builds the on-screen palette for script languages: every character the phrase needs, plus a few
// decoys, shuffled. Deterministic given an rng, so tests can pin it.
export function paletteFor(phrase, decoyPool = [], rng = Math.random, decoys = 4) {
  const needed = [...new Set([...strip(phrase.text)])];
  const pool = [...new Set(decoyPool.flatMap((p) => [...strip(p.text)]))].filter((c) => !needed.includes(c));

  // Fisher-Yates on a copy, so we do not disturb the caller's array.
  const bag = [...pool];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  const keys = [...needed, ...bag.slice(0, decoys)];
  for (let i = keys.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

// Re-export so components only need one import for writing work.
export { normalise };

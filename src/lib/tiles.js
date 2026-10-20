// Word tiles for "build the sentence" practice. Works for any script without a keyboard:
// Malay and Tamil split on spaces, Chinese uses the browser's built-in word segmenter.

import { shuffle } from './quiz.js';

let zhSegmenter = null;

const trimPunctuation = (w) => w.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');

export function tokenize(langId, text) {
  const clean = String(text ?? '').trim();
  if (langId === 'zh') {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      zhSegmenter ??= new Intl.Segmenter('zh', { granularity: 'word' });
      return [...zhSegmenter.segment(clean)].filter((s) => s.isWordLike).map((s) => s.segment);
    }
    const chars = [...clean.replace(/[\p{P}\p{S}\s]/gu, '')];
    const chunks = [];
    for (let i = 0; i < chars.length; i += 2) chunks.push(chars.slice(i, i + 2).join(''));
    return chunks;
  }
  return clean.split(/\s+/).map(trimPunctuation).filter(Boolean);
}

// Tiles for one target phrase: all of its words, plus a couple of wrong words taken from the other options.
// Returns { answer: [labels], tiles: [{ id, label }] } with the tiles shuffled.
export function buildBank(langId, target, otherPhrases = [], rng = Math.random) {
  const answer = tokenize(langId, target.text);
  const have = new Set(answer);
  const extras = [];
  for (const other of otherPhrases) {
    for (const t of tokenize(langId, other.text)) if (!have.has(t) && !extras.includes(t)) extras.push(t);
  }
    // Cap the whole bank at 9 tiles (the invariant the README and tests promise).
  // The answer always wins its slots; distractors only fill what's left, up to 2.
  const MAX_TILES = 9;
  const distractorBudget = Math.max(0, Math.min(answer.length >= 4 ? 2 : 1, MAX_TILES - answer.length));
  const wrong = shuffle(extras, rng).slice(0, distractorBudget);
  const all = [...answer, ...wrong].map((label, id) => ({ id, label }));


  let tiles = shuffle(all, rng);
  // Do not hand over a bank that is already in the right order.
  for (let tries = 0; tries < 10 && answer.length > 1; tries += 1) {
    const firstWords = tiles.slice(0, answer.length).map((t) => t.label);
    if (firstWords.join('\u0001') !== answer.join('\u0001')) break;
    tiles = shuffle(all, rng);
  }
  return { answer, tiles };
}

// Compares the learner's tiles with the answer. marks[i] says whether position i is right.
export function checkAnswer(chosen, answer) {
  const marks = chosen.map((label, i) => (label === answer[i] ? 'right' : 'wrong'));
  return { ok: chosen.length === answer.length && marks.every((m) => m === 'right'), marks };
}

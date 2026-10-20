// Word tiles for "build the sentence" practice. The whole point is that a learner can produce a
// Tamil or Chinese sentence without owning a Tamil or Chinese keyboard.
//
// Malay and Tamil split on spaces. Chinese uses the browser's word segmenter when it exists.
//
// Two defensive details matter here, because both failure modes are invisible in Node tests:
//   1. Intl.Segmenter is missing in some browsers (Firefox until recently, older kiosk WebViews).
//      Falling back to one tile per character turns a 10-character sentence into 10 tiles, which is
//      an unusable wall. We chunk into pairs instead, which stays inside the tile budget.
//   2. buildBank used to add distractors with no ceiling, so a long answer could overflow the
//      budget. The answer now always wins its slots and distractors only fill what is left.

import { shuffle } from './quiz.js';

export const MAX_TILES = 9;
export const MIN_TILES = 2;

let zhSegmenter = null;

const trimPunctuation = (w) => w.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');

export const hasSegmenter = () => typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function';

export function tokenize(langId, text) {
  const clean = String(text ?? '').trim();
  if (langId === 'zh') {
    if (hasSegmenter()) {
      zhSegmenter ??= new Intl.Segmenter('zh', { granularity: 'word' });
      return [...zhSegmenter.segment(clean)].filter((s) => s.isWordLike).map((s) => s.segment);
    }
    // No segmenter: group characters in pairs so the bank stays buildable and bounded.
    const chars = [...clean.replace(/[\p{P}\p{S}\s]/gu, '')];
    const chunks = [];
    for (let i = 0; i < chars.length; i += 2) chunks.push(chars.slice(i, i + 2).join(''));
    return chunks;
  }
  return clean.split(/\s+/).map(trimPunctuation).filter(Boolean);
}

// How many distractor tiles a given answer length can afford.
export function distractorBudget(answerLength) {
  const wanted = answerLength >= 4 ? 2 : 1;
  return Math.max(0, Math.min(wanted, MAX_TILES - answerLength));
}

// Tiles for one target phrase: every word of the answer, plus a couple of plausible wrong words
// borrowed from the other options the learner could have picked.
// Returns { answer: [labels], tiles: [{ id, label }] }, tiles shuffled.
export function buildBank(langId, target, otherPhrases = [], rng = Math.random) {
  const answer = tokenize(langId, target.text);
  const have = new Set(answer);
  const extras = [];
  for (const other of otherPhrases) {
    for (const t of tokenize(langId, other.text)) {
      if (!have.has(t) && !extras.includes(t)) extras.push(t);
    }
  }
  const wrong = shuffle(extras, rng).slice(0, distractorBudget(answer.length));
  const all = [...answer, ...wrong].map((label, id) => ({ id, label }));

  let tiles = shuffle(all, rng);
  // Never hand over a bank that is already solved.
  for (let tries = 0; tries < 10 && answer.length > 1; tries += 1) {
    const firstWords = tiles.slice(0, answer.length).map((t) => t.label);
    if (firstWords.join('\u0001') !== answer.join('\u0001')) break;
    tiles = shuffle(all, rng);
  }
  return { answer, tiles };
}

// marks[i] says whether the tile the learner placed at position i belongs there.
export function checkAnswer(chosen, answer) {
  const marks = chosen.map((label, i) => (label === answer[i] ? 'right' : 'wrong'));
  return { ok: chosen.length === answer.length && marks.every((m) => m === 'right'), marks };
}

// Diagnostic used by the tile-budget test and by the in-app developer check: reports whether every
// phrase in a set is buildable in THIS runtime (which is what actually matters, since the answer
// depends on whether Intl.Segmenter exists here).
export function auditPhrases(langId, phrases) {
  return phrases.map((phrase) => {
    const answer = tokenize(langId, phrase.text);
    const total = answer.length + distractorBudget(answer.length);
    return {
      text: phrase.text,
      english: phrase.english,
      answerTiles: answer.length,
      bankTiles: total,
      ok: answer.length >= MIN_TILES && answer.length <= MAX_TILES && total <= MAX_TILES,
    };
  });
}

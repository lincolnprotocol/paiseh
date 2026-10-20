import test from 'node:test';
import assert from 'node:assert/strict';

import { languages } from '../src/data/languages.js';
import { scenariosFor } from '../src/data/scenarios.js';
import { tokenize, buildBank, checkAnswer } from '../src/lib/tiles.js';
import { lessonPhrases, toRounds } from '../src/lib/lesson.js';
import { buildOptions, makeQuestion, shuffle } from '../src/lib/quiz.js';
import { completeLesson, lessonDone, langState, allPhrases, freshProgress } from '../src/lib/storage.js';

const fresh = freshProgress;
const seeded = (seed) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

test('tokenize: spaces for Malay and Tamil, word segmenter for Chinese, punctuation dropped', () => {
  assert.deepEqual(tokenize('ms', 'Saya nak nasi lemak satu.'), ['Saya', 'nak', 'nasi', 'lemak', 'satu']);
  assert.deepEqual(tokenize('ms', 'Free! Kenapa?'), ['Free', 'Kenapa']);
  assert.deepEqual(tokenize('ta', 'எனக்கு ரொட்டி பிராட்டா வேணும்.'), ['எனக்கு', 'ரொட்டி', 'பிராட்டா', 'வேணும்']);
  assert.deepEqual(tokenize('ta', 'QR-ல கட்டலாமா?'), ['QR-ல', 'கட்டலாமா']);
  const zh = tokenize('zh', '我要一碗面。');
  assert.equal(zh.join(''), '我要一碗面');
  assert.ok(zh.length >= 2 && zh.length <= 5);
  assert.deepEqual(tokenize('ms', '  '), []);
});

test('every phrase the learner is asked to say can be built from tiles', () => {
  for (const lang of languages) {
    for (const s of scenariosFor(lang.id)) {
      for (const p of lessonPhrases(s)) {
        const tokens = tokenize(lang.id, p.text);
        assert.ok(tokens.length >= 2, `${lang.id}/${s.id} "${p.text}" gives ${tokens.length} tiles`);
        assert.ok(tokens.length <= 9, `${lang.id}/${s.id} "${p.text}" gives too many tiles (${tokens.length})`);
      }
    }
  }
});

test('tile bank: has every answer word, adds wrong words from the other option, never starts solved', () => {
  const [a, b] = [{ text: 'Ayam goreng, boleh?' }, { text: 'Ikan, terima kasih.' }];
  for (let seed = 1; seed <= 50; seed += 1) {
    const { answer, tiles } = buildBank('ms', a, [b], seeded(seed));
    assert.deepEqual(answer, ['Ayam', 'goreng', 'boleh']);
    for (const w of answer) assert.ok(tiles.some((t) => t.label === w), `missing ${w}`);
    const extras = tiles.filter((t) => !answer.includes(t.label));
    assert.equal(extras.length, 1, 'short phrase gets 1 wrong word');
    assert.ok(['Ikan', 'terima', 'kasih'].includes(extras[0].label));
    assert.notDeepEqual(tiles.slice(0, 3).map((t) => t.label), answer, 'bank must not start in the right order');
    assert.equal(new Set(tiles.map((t) => t.id)).size, tiles.length, 'tile ids are unique');
  }
  const long = buildBank('ms', { text: 'Hujung minggu ni free tak temankan nenek' }, [{ text: 'Ada kerja rumah lain kali' }], seeded(3));
  assert.equal(long.tiles.length, long.answer.length + 2, 'long phrase gets 2 wrong words');
  // no other options: still works
  assert.equal(buildBank('ms', a, [], seeded(1)).tiles.length, 3);
  // repeated words become separate tiles
  const dup = buildBank('ms', { text: 'sikit sikit lagi' }, [], seeded(2));
  assert.equal(dup.tiles.filter((t) => t.label === 'sikit').length, 2);
});

test('checkAnswer marks each position and requires the full sentence', () => {
  const answer = ['Saya', 'nak', 'nasi', 'lemak'];
  assert.deepEqual(checkAnswer(['Saya', 'nak', 'nasi', 'lemak'], answer), { ok: true, marks: ['right', 'right', 'right', 'right'] });
  const wrongOrder = checkAnswer(['Saya', 'nasi', 'nak', 'lemak'], answer);
  assert.equal(wrongOrder.ok, false);
  assert.deepEqual(wrongOrder.marks, ['right', 'wrong', 'wrong', 'right']);
  const partial = checkAnswer(['Saya', 'nak'], answer);
  assert.equal(partial.ok, false);
  assert.deepEqual(partial.marks, ['right', 'right']);
  assert.equal(checkAnswer(['Saya', 'nak', 'nasi', 'lemak', 'extra'], answer).ok, false);
  assert.equal(checkAnswer([], answer).ok, false);
});

test('lesson phrases: every scenario teaches 8+ unique phrases in conversation order, in rounds of ~4', () => {
  for (const lang of languages) {
    for (const s of scenariosFor(lang.id)) {
      const phrases = lessonPhrases(s);
      const unique = new Set(phrases.map((p) => p.text));
      assert.equal(unique.size, phrases.length, `${lang.id}/${s.id} has duplicate phrases`);
      assert.ok(phrases.length >= 8, `${lang.id}/${s.id} teaches only ${phrases.length}`);
      assert.equal(phrases[0].text, s.script[0].suggestions[0].text, 'conversation order');
      const rounds = toRounds(phrases);
      assert.equal(rounds.flat().length, phrases.length);
      for (const r of rounds) assert.ok(r.length >= 2 && r.length <= 5, `round size ${r.length}`);
    }
  }
  assert.deepEqual(toRounds([1, 2, 3, 4, 5]).map((r) => r.length), [5], 'a lone leftover joins the previous round');
  assert.deepEqual(toRounds([1, 2, 3, 4, 5, 6]).map((r) => r.length), [4, 2]);
});

test('quiz options: exactly one right answer, no duplicate meanings', () => {
  for (const lang of languages) {
    for (const s of scenariosFor(lang.id)) {
      const pool = lessonPhrases(s);
      for (const phrase of pool) {
        for (const kind of ['meaning', 'recall']) {
          const q = makeQuestion(kind, phrase, pool);
          assert.ok(q.options.length >= 3, 'enough options');
          assert.equal(q.options.filter((o) => o.text === phrase.text).length, 1);
          assert.equal(new Set(q.options.map((o) => o.english)).size, q.options.length, 'distinct meanings');
          assert.equal(new Set(q.options.map((o) => o.text)).size, q.options.length, 'distinct phrases');
        }
      }
    }
  }
  assert.deepEqual(shuffle([1, 2, 3], seeded(1)).sort(), [1, 2, 3]);
  assert.equal(buildOptions({ text: 'a', english: 'A' }, [], 4).length, 1, 'tiny pool still works');
});

test('completing a warm-up saves its phrases, awards XP and unlocks the chat for that scenario only', () => {
  const phrases = lessonPhrases(scenariosFor('ta')[0]);
  let p = fresh();
  assert.equal(lessonDone(p, 'ta', 'prata'), false);
  p = completeLesson(p, 'ta', 'prata', phrases, 15);
  assert.equal(lessonDone(p, 'ta', 'prata'), true);
  assert.equal(lessonDone(p, 'ta', 'paati'), false);
  assert.equal(lessonDone(p, 'ms', 'prata'), false);
  assert.equal(langState(p, 'ta').xp, 15);
  assert.equal(allPhrases(p, 'ta').length, phrases.length);
  assert.equal(p.streak, 1);
  // doing it again does not duplicate phrases or reset their review progress
  const before = langState(p, 'ta').phrases[phrases[0].text];
  p = completeLesson(p, 'ta', 'prata', phrases, 5);
  assert.equal(allPhrases(p, 'ta').length, phrases.length);
  assert.equal(langState(p, 'ta').phrases[phrases[0].text].savedAt, before.savedAt);
  assert.equal(langState(p, 'ta').xp, 20);
});

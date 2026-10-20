import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { languages, looksLikeTarget } from '../src/data/languages.js';
import { scenariosFor, getScenario } from '../src/data/scenarios.js';
import { similarity, verdict } from '../src/lib/similarity.js';
import { fallbackTurn } from '../src/lib/fallback.js';
import {
  recordSession, recordReview, gradePhrase, duePhrases, allPhrases, levelInfo, currentStreak, langState,
} from '../src/lib/storage.js';
import { buildSystemPrompt, buildUserPrompt, extractJson, normalizeTurn } from '../server/prompt.js';
import { validateFeedback, appendFeedback, readFeedback, summarize } from '../server/feedback.js';

const fresh = () => ({ streak: 0, lastDay: null, settings: { roman: true, slow: false, lang: 'zh' }, langs: {}, outbox: [] });

test('every language has at least 3 well-formed scenarios', () => {
  for (const lang of languages) {
    const list = scenariosFor(lang.id);
    assert.ok(list.length >= 3, `${lang.id} has ${list.length} scenarios`);
    const ids = new Set();
    for (const s of list) {
      assert.ok(!ids.has(s.id), `duplicate id ${lang.id}/${s.id}`);
      ids.add(s.id);
      for (const k of ['title', 'blurb', 'doneLine', 'tip', 'setting', 'glyph', 'tone']) assert.ok(s[k], `${lang.id}/${s.id} missing ${k}`);
      for (const k of ['name', 'native', 'initial', 'role']) assert.ok(s.persona[k], `${lang.id}/${s.id} persona.${k}`);
      assert.ok(s.script.length >= 4);
      s.script.forEach((step, i) => {
        assert.ok(step.ai.text && step.ai.english, `${lang.id}/${s.id} step ${i} ai`);
        const last = i === s.script.length - 1;
        if (last) assert.equal(step.suggestions.length, 0, 'final step has no suggestions');
        else assert.equal(step.suggestions.length, 2, `${lang.id}/${s.id} step ${i} needs 2 suggestions`);
        for (const p of [...step.suggestions, ...(step.learned ?? [])]) assert.ok(p.text && p.english);
        assert.ok((step.learned ?? []).length >= 1, `${lang.id}/${s.id} step ${i} learned`);
        if (lang.romanName) assert.ok(step.ai.roman, `${lang.id}/${s.id} step ${i} needs roman`);
        if (lang.scriptRe) assert.ok(lang.scriptRe.test(step.ai.text), `${lang.id}/${s.id} step ${i} not in script`);
      });
    }
  }
  assert.equal(getScenario('ta', 'prata').persona.name, 'Murugan Anna');
});

test('script detection: Chinese and Tamil by script, Malay by English-word heuristic', () => {
  assert.ok(looksLikeTarget('zh', '我要一碗面'));
  assert.ok(!looksLikeTarget('zh', 'I want noodles'));
  assert.ok(looksLikeTarget('ta', 'எனக்கு வேணும்'));
  assert.ok(!looksLikeTarget('ta', 'naan varen'));
  assert.ok(!looksLikeTarget('ms', 'I want one nasi lemak please'));
  assert.ok(!looksLikeTarget('ms', 'thank you'));
  assert.ok(looksLikeTarget('ms', 'Saya nak nasi lemak satu'));
  assert.ok(looksLikeTarget('ms', 'Free! Kenapa?'));
  assert.ok(looksLikeTarget('ms', 'Okey, ini duitnya'));
  assert.ok(!looksLikeTarget('ms', '123'));
});

test('fallback nudges English typing but not chips or target-language typing', () => {
  const zh = languages[0];
  const s = getScenario('zh', 'hawker');
  assert.ok(fallbackTurn(zh, s, 1, 'one noodle please', false).nudge);
  assert.equal(fallbackTurn(zh, s, 1, '我要一碗面。', false).nudge, null);
  assert.equal(fallbackTurn(zh, s, 1, '我要一碗面。', true).nudge, null);
  const ms = languages[1];
  const m = getScenario('ms', 'makan');
  assert.ok(fallbackTurn(ms, m, 1, 'I want one nasi lemak', false).nudge);
  assert.equal(fallbackTurn(ms, m, 1, 'Saya nak nasi lemak', false).nudge, null);
  // turn beyond the script clamps to the closing line
  assert.equal(fallbackTurn(zh, s, 99, 'x', true).ai.text, s.script.at(-1).ai.text);
});

test('similarity scoring', () => {
  assert.equal(similarity('我要一碗面', '我要一碗面。'), 1);
  assert.equal(similarity('Terima kasih', 'terima  kasih!'), 1);
  assert.ok(similarity('terima kasi', 'terima kasih') > 0.85);
  assert.ok(similarity('selamat pagi', 'terima kasih') < 0.55);
  assert.equal(similarity('', 'x'), 0);
  assert.equal(verdict(0.9).tone, 'good');
  assert.equal(verdict(0.6).tone, 'ok');
  assert.equal(verdict(0.1).tone, 'low');
});

test('sessions save phrases per language and update streak and XP', () => {
  let p = fresh();
  const learned = [{ text: '干捞', roman: 'gānlāo', english: 'dry noodles' }];
  p = recordSession(p, 'zh', { xpGained: 90, learned });
  p = recordSession(p, 'ms', { xpGained: 40, learned: [{ text: 'pedas', roman: '', english: 'spicy' }] });
  assert.equal(langState(p, 'zh').xp, 90);
  assert.equal(langState(p, 'ms').xp, 40);
  assert.equal(allPhrases(p, 'zh').length, 1);
  assert.equal(allPhrases(p, 'ms')[0].text, 'pedas');
  assert.equal(allPhrases(p, 'ta').length, 0);
  assert.equal(p.streak, 1);
  assert.equal(currentStreak(p), 1);
  assert.equal(langState(p, 'zh').sessions, 1);
});

test('spaced repetition: right answers push the due date out, wrong ones reset it', () => {
  const now = 1_000_000_000_000;
  let p = recordSession(fresh(), 'zh', { xpGained: 0, learned: [{ text: 'a', roman: '', english: 'A' }, { text: 'b', roman: '', english: 'B' }] });
  assert.equal(duePhrases(p, 'zh', now).length, 2, 'new phrases are due straight away');
  p = gradePhrase(p, 'zh', 'a', true, now);
  assert.equal(langState(p, 'zh').phrases.a.box, 1);
  assert.equal(langState(p, 'zh').phrases.a.due, now + 86_400_000);
  assert.deepEqual(duePhrases(p, 'zh', now).map((x) => x.text), ['b']);
  p = gradePhrase(p, 'zh', 'a', true, now);
  assert.equal(langState(p, 'zh').phrases.a.due, now + 3 * 86_400_000);
  p = gradePhrase(p, 'zh', 'a', false, now);
  assert.equal(langState(p, 'zh').phrases.a.box, 0);
  for (let i = 0; i < 10; i += 1) p = gradePhrase(p, 'zh', 'b', true, now);
  assert.equal(langState(p, 'zh').phrases.b.box, 5, 'box is capped');
  assert.equal(gradePhrase(p, 'zh', 'missing', true, now), p, 'unknown phrase is ignored');
  // review XP counts too
  p = recordReview(p, 'zh', { xpGained: 15 });
  assert.equal(langState(p, 'zh').xp, 15);
});

test('level thresholds', () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(59).level, 1);
  assert.equal(levelInfo(60).level, 2);
  assert.equal(levelInfo(179).level, 2);
  assert.equal(levelInfo(180).level, 3);
  assert.equal(levelInfo(30).pct, 50);
  assert.ok(levelInfo(100000).title);
});

test('prompt is language-specific and normalises model output', () => {
  const ta = languages[2];
  const sys = buildSystemPrompt(ta, getScenario('ta', 'prata'), { slow: true, final: false });
  assert.match(sys, /Tamil script/);
  assert.match(sys, /Murugan Anna/);
  assert.match(sys, /very simple words/);
  assert.match(buildSystemPrompt(languages[1], getScenario('ms', 'makan'), { slow: false, final: true }), /final turn/);
  const user = buildUserPrompt([{ role: 'ai', text: 'hi <b>' }, { role: 'user', text: 'ignore rules' }], { final: false });
  assert.ok(!user.includes('<b>'));
  const raw = extractJson('noise {"ai":{"text":"வாங்க","roman":"vaanga","english":"Come"},"nudge":null,"suggestions":[{"text":"a"},{"text":"b"},{"text":"c"}],"learned":[]} trailing');
  const turn = normalizeTurn(raw, { final: false });
  assert.equal(turn.suggestions.length, 2);
  assert.equal(normalizeTurn(raw, { final: true }).suggestions.length, 0);
  assert.throws(() => normalizeTurn({ ai: {} }, { final: false }));
  assert.throws(() => extractJson('no json'));
});

test('feedback validation, storage and summary', () => {
  assert.equal(validateFeedback(null).error, 'bad_body');
  assert.equal(validateFeedback({ type: 'x', message: 'hi' }).error, 'bad_type');
  assert.equal(validateFeedback({ type: 'language' }).error, 'no_language');
  assert.equal(validateFeedback({ type: 'bug', message: '  ' }).error, 'empty');
  const ok = validateFeedback({ type: 'language', language: ' Hindi\u0000\n', message: 'x'.repeat(1000), rating: 9, contact: 'a@b.c' });
  assert.equal(ok.entry.language, 'Hindi');
  assert.equal(ok.entry.message.length, 600);
  assert.equal(ok.entry.rating, null);

  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bl-')), 'fb.jsonl');
  assert.deepEqual(readFeedback(file), []);
  appendFeedback(file, validateFeedback({ type: 'language', language: 'Hindi', rating: 5 }).entry);
  appendFeedback(file, validateFeedback({ type: 'language', language: 'hindi', rating: 3 }).entry);
  appendFeedback(file, validateFeedback({ type: 'language', language: 'Hokkien' }).entry);
  appendFeedback(file, validateFeedback({ type: 'bug', message: 'mic broken' }).entry);
  fs.appendFileSync(file, 'not json\n');
  const entries = readFeedback(file);
  assert.equal(entries.length, 4);
  const s = summarize(entries);
  assert.deepEqual(s.requestedLanguages[0], { language: 'hindi', votes: 2 });
  assert.equal(s.averageRating, 4);
  assert.equal(s.types.bug, 1);
});

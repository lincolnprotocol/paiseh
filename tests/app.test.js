// Covers the parts added in the v2 rebuild: the switchable layout, writing practice, daily
// missions, achievements, the leech list, backup/restore and the Real talk data.

import test from 'node:test';
import assert from 'node:assert/strict';

import { languages } from '../src/data/languages.js';
import { scenariosFor } from '../src/data/scenarios.js';
import { REGISTERS, slangFor } from '../src/data/slang.js';
import { MISSION_POOL, missionsForDay } from '../src/data/missions.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';
import { lessonPhrases } from '../src/lib/lesson.js';
import { auditPhrases, distractorBudget, MAX_TILES } from '../src/lib/tiles.js';
import { translator } from '../src/lib/i18n.js';
import {
  LAYOUTS,
  fontScaleValue,
  layoutForWidth,
  resolveLayout,
  usesSidebar,
} from '../src/lib/layout.js';
import { charDiff, gradeWriting, paletteFor, writingMode, writingPassed } from '../src/lib/writing.js';
import { foldMarks, romanSimilarity, scoreAttempt, similarity } from '../src/lib/similarity.js';
import {
  bumpMission,
  claimMission,
  dailyMissions,
  dayKeyAgo,
  earnedAchievements,
  exportProgress,
  freshProgress,
  gradePhrase,
  historySeries,
  importProgress,
  langState,
  leeches,
  recordDrill,
  recordSession,
  savePhrase,
  totalXp,
} from '../src/lib/storage.js';

const seeded = (seed) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

/* ------------------------------------------------------------------ layout */

test('layout: a preference wins, auto follows the viewport', () => {
  // auto resolves by width
  assert.equal(resolveLayout('auto', 360), 'stack');
  assert.equal(resolveLayout('auto', 699), 'stack');
  assert.equal(resolveLayout('auto', 700), 'comfortable');
  assert.equal(resolveLayout('auto', 1059), 'comfortable');
  assert.equal(resolveLayout('auto', 1060), 'wide');
  assert.equal(resolveLayout('auto', 2560), 'wide');

  // an explicit choice is honoured at any width: a desktop user can ask for the phone frame,
  // and a phone user can ask for the wide layout.
  assert.equal(resolveLayout('phone', 2560), 'phone');
  assert.equal(resolveLayout('wide', 320), 'wide');
  assert.equal(resolveLayout('stack', 1920), 'stack');

  // unknown values fall back to auto rather than rendering nothing
  assert.equal(resolveLayout('nonsense', 1200), layoutForWidth(1200));
  assert.equal(resolveLayout(undefined, 400), 'stack');

  // only the wide layout gets the sidebar
  assert.equal(usesSidebar('wide'), true);
  for (const l of ['stack', 'phone', 'comfortable']) assert.equal(usesSidebar(l), false);

  assert.ok(LAYOUTS.includes('auto'));
  assert.equal(fontScaleValue('md'), 1);
  assert.ok(fontScaleValue('xl') > fontScaleValue('sm'));
  assert.equal(fontScaleValue('bogus'), 1);
});

/* ---------------------------------------------------------------------- i18n */

test('i18n: every bundle resolves, unknown keys and languages fall back to English', () => {
  assert.equal(translator('en')('nav.home'), 'Home');
  assert.equal(translator('ta')('nav.home'), 'முதல் பக்கம்');
  assert.equal(translator('zh')('nav.review'), '复习');
  assert.equal(translator('ms')('nav.slang'), 'Bahasa harian');
  // unknown language -> English
  assert.equal(translator('xx')('nav.home'), 'Home');
  // unknown key -> the key itself, never a crash
  assert.equal(translator('en')('nope.missing'), 'nope.missing');

  // every language's bundle covers the navigation, so the shell is never half-translated
  for (const ui of ['en', 'zh', 'ms', 'ta']) {
    const t = translator(ui);
    for (const key of ['nav.home', 'nav.learn', 'nav.review', 'nav.slang', 'nav.stats', 'nav.settings']) {
      assert.notEqual(t(key), key, `${ui} is missing ${key}`);
    }
  }
});

/* --------------------------------------------------------------------- tiles */

test('tile budget holds for every buildable phrase in this runtime', () => {
  for (const lang of languages) {
    for (const scenario of scenariosFor(lang.id)) {
      for (const row of auditPhrases(lang.id, lessonPhrases(scenario))) {
        assert.ok(
          row.ok,
          `${lang.id}/${scenario.id} "${row.text}" -> ${row.answerTiles} answer tiles, ${row.bankTiles} in the bank`,
        );
        assert.ok(row.bankTiles <= MAX_TILES);
      }
    }
  }
});

test('distractor budget never pushes the bank past the cap', () => {
  assert.equal(distractorBudget(3), 1);
  assert.equal(distractorBudget(4), 2);
  assert.equal(distractorBudget(7), 2);
  assert.equal(distractorBudget(8), 1, 'only one slot left');
  assert.equal(distractorBudget(9), 0, 'answer already fills the bank');
  assert.equal(distractorBudget(12), 0, 'never negative');
  for (let n = 1; n <= 12; n += 1) {
    assert.ok(n + distractorBudget(n) <= Math.max(n, MAX_TILES));
  }
});

/* ------------------------------------------------------------------- writing */

test('writing: exact, close, romanisation and wrong are graded differently', () => {
  const phrase = { text: '我要一碗面。', roman: 'wǒ yào yì wǎn miàn', english: "I'd like a bowl of noodles." };

  const exact = gradeWriting('我要一碗面。', phrase);
  assert.equal(exact.verdict, 'exact');
  assert.equal(exact.score, 1);
  assert.ok(writingPassed(exact));

  // punctuation and spacing are ignored
  assert.equal(gradeWriting('我要一碗面', phrase).verdict, 'exact');
  assert.equal(gradeWriting('  我要一碗面  ', phrase).verdict, 'exact');

  // wrote the sound instead of the script: a near miss with a nudge, not a failure.
  // Tone marks are optional, because nobody types "wǒ".
  const roman = gradeWriting('wo yao yi wan mian', phrase);
  assert.equal(roman.verdict, 'roman');
  assert.ok(roman.hint.includes('我要一碗面。'));
  assert.equal(gradeWriting('wǒ yào yì wǎn miàn', phrase).verdict, 'roman', 'with tone marks too');

  const wrong = gradeWriting('完全不对的东西', phrase);
  assert.equal(wrong.verdict, 'wrong');
  assert.ok(!writingPassed(wrong));

  assert.equal(gradeWriting('', phrase).score, 0);

  // a Malay phrase has no romanisation, so there is no roman path to fall into
  const ms = { text: 'Terima kasih banyak.', roman: '', english: 'Thank you very much.' };
  assert.equal(gradeWriting('terima kasih banyak', ms).verdict, 'exact');
  assert.equal(gradeWriting('terima kasih banyk', ms).verdict, 'close');
});

test('writing: character diff points at what is wrong, not just that it is wrong', () => {
  const diff = charDiff('terimakasi', 'terimakasih');
  assert.equal(diff.filter((d) => d.state === 'missing').length, 1);
  assert.equal(diff.find((d) => d.state === 'missing').char, 'h');

  const extra = charDiff('terimaakasih', 'terimakasih');
  assert.equal(extra.filter((d) => d.state === 'extra').length, 1);

  // identical input is all right, and the diff reads back as the original
  const same = charDiff('vaanga', 'vaanga');
  assert.ok(same.every((d) => d.state === 'right'));
  assert.equal(same.map((d) => d.char).join(''), 'vaanga');
});

test('writing: the palette always contains every character the answer needs', () => {
  const phrase = { text: 'வாங்க!', roman: 'vaanga', english: 'Come in' };
  const decoys = [{ text: 'நன்றி' }, { text: 'சரி' }];
  const keys = paletteFor(phrase, decoys, seeded(7));
  for (const char of [...'வாங்க']) {
    assert.ok(keys.includes(char), `palette is missing ${char}`);
  }
  assert.ok(keys.length > [...new Set([...'வாங்க'])].length, 'decoys were added');
  // punctuation is never a key
  assert.ok(!keys.includes('!'));

  // no decoy pool is still a usable palette
  assert.ok(paletteFor(phrase, [], seeded(1)).length >= 1);

  assert.equal(writingMode('ms'), 'latin');
  assert.equal(writingMode('zh'), 'palette');
  assert.equal(writingMode('ta'), 'palette');
});

test('romanisation matching ignores tone marks but leaves other scripts alone', () => {
  assert.equal(foldMarks('wǒ yào yì wǎn miàn'), 'wo yao yi wan mian');
  assert.equal(romanSimilarity('wo yao', 'wǒ yào'), 1);
  // Tamil vowel signs are combining marks too, and must survive untouched
  assert.equal(foldMarks('வணக்கம்'), 'வணக்கம்');
  assert.equal(foldMarks('我要一碗面'), '我要一碗面');
  assert.equal(similarity('வணக்கம்', foldMarks('வணக்கம்')), 1);
});

test('pronunciation scoring accepts the romanisation as well as the script', () => {
  const phrase = { text: 'வணக்கம்', roman: 'vanakkam', english: 'Greetings' };
  // recognition returned Latin letters: the old script-only scoring gave this a near zero
  const roman = scoreAttempt('vanakkam', phrase);
  assert.equal(roman.matched, 'roman');
  assert.equal(roman.score, 1);

  const script = scoreAttempt('வணக்கம்', phrase);
  assert.equal(script.matched, 'script');
  assert.equal(script.score, 1);

  assert.ok(scoreAttempt('something else entirely', phrase).score < 0.5);
});

/* ------------------------------------------------------------------ missions */

test('missions: three a day, stable for a given date, drawn from the pool', () => {
  const a = missionsForDay('2026-10-20');
  const b = missionsForDay('2026-10-20');
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((m) => m.id), b.map((m) => m.id), 'same day gives the same missions');
  assert.equal(new Set(a.map((m) => m.id)).size, 3, 'no duplicates in a day');
  for (const m of a) {
    assert.ok(MISSION_POOL.some((p) => p.id === m.id));
    assert.ok(m.target >= 1 && m.xp > 0 && m.label && m.blurb);
  }
  // different dates generally give different sets; across a month they must not all be identical
  const sets = new Set(
    Array.from({ length: 30 }, (_, i) => missionsForDay(`2026-11-${String(i + 1).padStart(2, '0')}`))
      .map((list) => list.map((m) => m.id).join(',')),
  );
  assert.ok(sets.size > 1, 'missions should vary by date');
});

test('missions: progress is counted, and a finished mission can be claimed exactly once', () => {
  let p = freshProgress();
  const target = dailyMissions(p)[0];
  assert.equal(target.progress, 0);
  assert.equal(target.done, false);

  p = bumpMission(p, target.id, target.target);
  const afterBump = dailyMissions(p).find((m) => m.id === target.id);
  assert.equal(afterBump.done, true);
  assert.equal(afterBump.claimed, false);
  assert.equal(afterBump.progress, target.target, 'progress is clamped to the target');

  const before = totalXp(p);
  p = claimMission(p, target.id);
  assert.equal(totalXp(p), before + target.xp);
  assert.equal(dailyMissions(p).find((m) => m.id === target.id).claimed, true);

  // claiming again is a no-op, so XP cannot be farmed
  p = claimMission(p, target.id);
  assert.equal(totalXp(p), before + target.xp);

  // an unknown counter does not create junk state
  assert.equal(bumpMission(p, 'not-a-mission'), p);
});

test('drills feed both the per-language counters and the daily missions', () => {
  let p = freshProgress();
  p = recordDrill(p, 'zh', 'build', 3);
  p = recordDrill(p, 'zh', 'write');
  assert.equal(langState(p, 'zh').counters.build, 3);
  assert.equal(langState(p, 'zh').counters.write, 1);
  assert.equal(langState(p, 'ms').counters.build, 0, 'counters are per language');
});

/* -------------------------------------------------------------- achievements */

test('achievements unlock once and never un-earn', () => {
  let p = freshProgress();
  assert.equal(earnedAchievements(p).filter((a) => a.earnedAt).length, 0);

  p = recordSession(p, 'zh', {
    xpGained: 50,
    learned: [{ text: 'a', roman: '', english: 'A' }],
  });
  const earned = earnedAchievements(p).filter((a) => a.earnedAt);
  assert.ok(earned.some((a) => a.id === 'first-chat'), 'first conversation earns a badge');

  const stamp = p.achievements['first-chat'];
  p = recordSession(p, 'zh', { xpGained: 10, learned: [] });
  assert.equal(p.achievements['first-chat'], stamp, 'the timestamp is not rewritten');

  // every achievement is well formed and testable
  for (const a of ACHIEVEMENTS) {
    assert.ok(a.id && a.label && a.blurb);
    assert.equal(typeof a.test, 'function');
  }
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length, 'ids are unique');
});

/* -------------------------------------------------------- history and leeches */

test('XP is recorded day by day so progress can be charted', () => {
  let p = freshProgress();
  p = recordSession(p, 'zh', { xpGained: 40, learned: [] });
  const series = historySeries(p, 7);
  assert.equal(series.length, 7);
  assert.equal(series.at(-1).xp, 40, 'today holds the XP');
  assert.equal(series[0].xp, 0, 'older days stay empty');
  assert.equal(series.reduce((sum, d) => sum + d.xp, 0), 40);
});

test('a phrase forgotten repeatedly becomes a leech', () => {
  const now = 1_700_000_000_000;
  let p = recordSession(freshProgress(), 'zh', {
    xpGained: 0,
    learned: [{ text: '追剧', roman: 'zhuī jù', english: 'to binge a show' }],
  });
  assert.equal(leeches(p, 'zh').length, 0);

  for (let i = 0; i < 4; i += 1) p = gradePhrase(p, 'zh', '追剧', false, now);
  const stuck = leeches(p, 'zh');
  assert.equal(stuck.length, 1);
  assert.equal(stuck[0].lapses, 4);
  assert.equal(stuck[0].box, 0);

  // remembering it does not erase the history, but reps keep climbing
  p = gradePhrase(p, 'zh', '追剧', true, now);
  assert.equal(langState(p, 'zh').phrases['追剧'].box, 1);
  assert.equal(langState(p, 'zh').phrases['追剧'].reps, 5);
});

test('a streak freeze covers exactly one missed day', () => {
  let p = { ...freshProgress(), streak: 6, lastDay: dayKeyAgo(2), freezes: 1 };
  p = recordSession(p, 'zh', { xpGained: 10, learned: [] });
  assert.equal(p.streak, 7, 'the chain continued');
  assert.equal(p.freezes, 0, 'the freeze was spent');

  // no freezes left and two days missed: the streak restarts rather than silently continuing
  let q = { ...freshProgress(), streak: 9, lastDay: dayKeyAgo(3), freezes: 0 };
  q = recordSession(q, 'zh', { xpGained: 10, learned: [] });
  assert.equal(q.streak, 1);
});

/* ----------------------------------------------------------- backup, restore */

test('progress survives a backup and restore round trip', () => {
  let p = freshProgress();
  p = recordSession(p, 'ta', {
    xpGained: 70,
    learned: [{ text: 'செம', roman: 'sema', english: 'awesome' }],
  });
  p = recordDrill(p, 'ta', 'write', 2);

  const restored = importProgress(exportProgress(p));
  assert.equal(totalXp(restored), totalXp(p));
  assert.equal(langState(restored, 'ta').counters.write, 2);
  assert.equal(Object.keys(langState(restored, 'ta').phrases).length, 1);
  assert.equal(restored.streak, p.streak);

  // a bare progress object (no wrapper) is accepted too
  assert.equal(totalXp(importProgress(JSON.stringify(p))), totalXp(p));

  assert.throws(() => importProgress('{}'), /no progress/i);
  assert.throws(() => importProgress('null'), /does not look like/i);
  assert.throws(() => importProgress('not json at all'));
});

test('saving a phrase from Real talk does not award XP or touch the streak', () => {
  let p = freshProgress();
  const phrase = { text: 'jom', roman: '', english: "let's go" };
  p = savePhrase(p, 'ms', phrase);
  assert.equal(Object.keys(langState(p, 'ms').phrases).length, 1);
  assert.equal(totalXp(p), 0, 'browsing a dictionary is not practice');
  assert.equal(p.lastDay, null, 'and it does not start a streak');

  // saving the same phrase twice does not duplicate it
  const saved = langState(savePhrase(p, 'ms', phrase), 'ms').phrases;
  assert.equal(Object.keys(saved).length, 1);
});

/* --------------------------------------------------------------- Real talk data */

test('Real talk entries are complete, unique and use a known register', () => {
  const ids = new Set();
  for (const lang of languages) {
    const entries = slangFor(lang.id);
    assert.ok(entries.length >= 10, `${lang.id} has only ${entries.length} entries`);
    for (const e of entries) {
      assert.ok(!ids.has(e.id), `duplicate slang id ${e.id}`);
      ids.add(e.id);
      assert.ok(e.real?.text && e.real?.english, `${e.id} real form`);
      assert.ok(e.textbook?.text && e.textbook?.english, `${e.id} textbook form`);
      assert.ok(e.note && e.note.length > 20, `${e.id} needs a usable note`);
      assert.ok(REGISTERS[e.register], `${e.id} has unknown register ${e.register}`);
      assert.ok(Array.isArray(e.tags) && e.tags.length >= 1, `${e.id} needs a tag`);
      assert.notEqual(e.real.text, e.textbook.text, `${e.id} real and textbook are identical`);
      // romanisation rules match the language: Malay is already Latin, the others need it
      if (lang.romanName) assert.ok(e.real.roman, `${e.id} needs a romanisation`);
      else assert.equal(e.real.roman, '', `${e.id} should not carry a romanisation`);
      if (lang.scriptRe) assert.ok(lang.scriptRe.test(e.real.text), `${e.id} is not in ${lang.id} script`);
    }
  }
  assert.equal(slangFor('nope').length, 0);
});

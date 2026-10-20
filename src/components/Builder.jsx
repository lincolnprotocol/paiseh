import { useState } from 'react';
import { speak } from '../lib/speech.js';
import { buildBank, checkAnswer } from '../lib/tiles.js';

// Replaces "tap the answer". The learner says WHAT they want to say (in English), then builds the phrase
// from word tiles. A wrong order gets feedback, and there is a hint ladder before the answer is shown.
export default function Builder({ language, settings, options, onSend }) {
  const [choice, setChoice] = useState(null);
  const [bank, setBank] = useState(null); // { answer, tiles }
  const [chosen, setChosen] = useState([]); // tile ids, in the order tapped
  const [marks, setMarks] = useState(null);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(0); // 0 none, 1 first word, 2 sound and pronunciation
  const [revealed, setRevealed] = useState(false);

  const labelOf = (id) => bank.tiles.find((t) => t.id === id).label;

  function pickIntent(phrase) {
    setChoice(phrase);
    setBank(buildBank(language.id, phrase, options.filter((o) => o.text !== phrase.text)));
    setChosen([]);
    setMarks(null);
    setTries(0);
    setHint(0);
    setRevealed(false);
  }

  function backToIntents() {
    setChoice(null);
    setBank(null);
  }

  const tap = (id) => {
    setMarks(null);
    setChosen((c) => (c.includes(id) ? c : [...c, id]));
  };
  const untap = (id) => {
    setMarks(null);
    setRevealed(false);
    setChosen((c) => c.filter((x) => x !== id));
  };

  function check() {
    const labels = chosen.map(labelOf);
    const result = checkAnswer(labels, bank.answer);
    if (result.ok) {
      onSend(choice, revealed);
      return;
    }
    setMarks(result.marks);
    setTries((n) => n + 1);
    if (tries + 1 >= 2 && hint < 1) setHint(1); // two misses unlock the first hint automatically
  }

  function nextHint() {
    const level = Math.min(2, hint + 1);
    setHint(level);
    if (level === 2) speak(choice.text, { lang: language.id, slow: true });
  }

  function showAnswer() {
    const used = new Set();
    const ids = bank.answer.map((label) => {
      const tile = bank.tiles.find((t) => t.label === label && !used.has(t.id));
      used.add(tile.id);
      return tile.id;
    });
    setChosen(ids);
    setMarks(null);
    setRevealed(true);
  }

  if (!choice) {
    return (
      <div className="builder">
        <p className="build-title">Your turn. What do you want to say?</p>
        <div className="intents">
          {options.map((o) => (
            <button key={o.text} className="intent" onClick={() => pickIntent(o)}>
              {o.english}
            </button>
          ))}
        </div>
        <p className="build-note">Pick one, then build it from the words. Hints are there if you get stuck.</p>
      </div>
    );
  }

  const unused = bank.tiles.filter((t) => !chosen.includes(t.id));
  const incomplete = chosen.length < bank.answer.length;

  return (
    <div className="builder">
      <p className="build-title">
        Say: <b>“{choice.english}”</b>
      </p>

      <div className={`answer-line ${marks ? 'checked' : ''}`} aria-label="Your sentence">
        {chosen.length === 0 && <span className="placeholder">Tap the words in order</span>}
        {chosen.map((id, i) => (
          <button
            key={id}
            className={`tile ${marks?.[i] ?? ''}`}
            lang={language.htmlLang}
            onClick={() => untap(id)}
            aria-label={`${labelOf(id)}, tap to remove`}
          >
            {labelOf(id)}
          </button>
        ))}
      </div>

      <div className="bank" aria-label="Word tiles">
        {unused.map((t) => (
          <button key={t.id} className="tile" lang={language.htmlLang} onClick={() => tap(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {marks && (
        <p className="feedback low" role="status">
          {incomplete && marks.every((m) => m === 'right')
            ? 'Good start. Keep going, there are more words.'
            : 'Not quite. The red words are in the wrong place. Tap one to move it.'}
        </p>
      )}
      {hint >= 1 && (
        <p className="hint" role="status">
          Starts with <b lang={language.htmlLang}>{bank.answer[0]}</b>
          {hint >= 2 && choice.roman ? (
            <>
              {' '}
              · sounds like <b>{choice.roman}</b>
            </>
          ) : null}
        </p>
      )}

      <div className="build-actions">
        <button className="ghost small" onClick={backToIntents}>
          Change
        </button>
        {hint < 2 && !revealed && (
          <button className="ghost small" onClick={nextHint}>
            Hint
          </button>
        )}
        {hint >= 2 && !revealed && (
          <button className="ghost small" onClick={() => speak(choice.text, { lang: language.id, slow: true })}>
            Hear it
          </button>
        )}
        {(tries >= 1 || hint >= 1) && !revealed && (
          <button className="ghost small" onClick={showAnswer}>
            Show answer
          </button>
        )}
        <button className="primary small" onClick={check} disabled={chosen.length === 0}>
          {revealed ? 'Send answer' : 'Check'}
        </button>
      </div>
      {revealed && <p className="build-note">Answer shown. Read it aloud, then send it. It counts for less XP.</p>}
    </div>
  );
}

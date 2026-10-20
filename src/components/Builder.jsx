import { useEffect, useRef, useState } from 'react';
import { speak, speakWord } from '../lib/speech.js';
import { buildBank, checkAnswer } from '../lib/tiles.js';
import { Backspace, Check, Speaker } from './Icons.jsx';

// The learner says WHAT they want to say (in English), then builds the phrase from word tiles.
// No answer buttons anywhere, so finishing a turn means actually producing the sentence.
//
// Added since the first version:
//   - word-level audio ("tap to hear"), because for a non-Latin script the sound-to-symbol link is
//     the whole lesson and hearing the full sentence does not teach which tile is which
//   - keyboard control (1-9 place, Backspace remove, Enter check), which matters now that the app
//     is usable on a laptop
export default function Builder({ language, options, onSend, onBuilt }) {
  const [choice, setChoice] = useState(null);
  const [bank, setBank] = useState(null); // { answer, tiles }
  const [chosen, setChosen] = useState([]); // tile ids, in tap order
  const [marks, setMarks] = useState(null);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(0); // 0 none, 1 first word, 2 sound and pronunciation
  const [revealed, setRevealed] = useState(false);
  const [hearMode, setHearMode] = useState(false);
  const rootRef = useRef(null);

  const labelOf = (id) => bank.tiles.find((t) => t.id === id)?.label ?? '';

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
    setHearMode(false);
  }

  const tap = (id) => {
    if (hearMode) {
      speakWord(labelOf(id), language.id);
      return;
    }
    setMarks(null);
    setChosen((c) => (c.includes(id) ? c : [...c, id]));
  };

  const untap = (id) => {
    if (hearMode) {
      speakWord(labelOf(id), language.id);
      return;
    }
    setMarks(null);
    setRevealed(false);
    setChosen((c) => c.filter((x) => x !== id));
  };

  const removeLast = () => {
    setMarks(null);
    setRevealed(false);
    setChosen((c) => c.slice(0, -1));
  };

  function check() {
    const result = checkAnswer(chosen.map(labelOf), bank.answer);
    if (result.ok) {
      onBuilt?.();
      onSend(choice, revealed);
      return;
    }
    setMarks(result.marks);
    setTries((n) => n + 1);
    if (tries + 1 >= 2 && hint < 1) setHint(1); // two misses unlock the first hint on their own
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

  // Keyboard shortcuts. Scoped to this component so they never fight the free-text input below it.
  useEffect(() => {
    if (!bank) return undefined;
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const unusedTiles = bank.tiles.filter((t) => !chosen.includes(t.id));
      if (/^[1-9]$/.test(e.key)) {
        const tile = unusedTiles[Number(e.key) - 1];
        if (tile) {
          e.preventDefault();
          tap(tile.id);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLast();
      } else if (e.key === 'Enter' && chosen.length > 0) {
        e.preventDefault();
        check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, chosen, hearMode, revealed, tries, hint]);

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
    <div className="builder" ref={rootRef}>
      <div className="build-head">
        <p className="build-title">
          Say: <b>“{choice.english}”</b>
        </p>
        <button
          type="button"
          className={`chip-toggle ${hearMode ? 'on' : ''}`}
          aria-pressed={hearMode}
          onClick={() => setHearMode((v) => !v)}
          title="Tap tiles to hear each word instead of placing it"
        >
          <Speaker width={15} height={15} /> {hearMode ? 'Tap to hear: on' : 'Tap to hear'}
        </button>
      </div>

      <div className={`answer-line ${marks ? 'checked' : ''}`} aria-label="Your sentence">
        {chosen.length === 0 && <span className="placeholder">Tap the words in order</span>}
        {chosen.map((id, i) => (
          <button
            key={id}
            className={`tile ${marks?.[i] ?? ''}`}
            lang={language.htmlLang}
            onClick={() => untap(id)}
            aria-label={hearMode ? `Hear ${labelOf(id)}` : `${labelOf(id)}, tap to remove`}
          >
            {labelOf(id)}
          </button>
        ))}
        {chosen.length > 0 && !hearMode && (
          <button className="icon-btn small undo" onClick={removeLast} aria-label="Remove the last word">
            <Backspace width={18} height={18} />
          </button>
        )}
      </div>

      <div className="bank" aria-label="Word tiles">
        {unused.map((t, i) => (
          <button
            key={t.id}
            className="tile"
            lang={language.htmlLang}
            onClick={() => tap(t.id)}
            aria-label={hearMode ? `Hear ${t.label}` : `Add ${t.label}`}
          >
            {t.label}
            {i < 9 && <kbd aria-hidden="true">{i + 1}</kbd>}
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
          <button
            className="ghost small"
            onClick={() => speak(choice.text, { lang: language.id, slow: true })}
          >
            Hear it
          </button>
        )}
        {(tries >= 1 || hint >= 1) && !revealed && (
          <button className="ghost small" onClick={showAnswer}>
            Show answer
          </button>
        )}
        <button className="primary small" onClick={check} disabled={chosen.length === 0}>
          <Check width={17} height={17} /> {revealed ? 'Send answer' : 'Check'}
        </button>
      </div>

      {revealed && <p className="build-note">Answer shown. Read it aloud, then send it. It counts for less XP.</p>}
      <p className="build-note kbd-hint">
        Keyboard: <kbd>1</kbd>–<kbd>9</kbd> place a word, <kbd>⌫</kbd> remove the last, <kbd>Enter</kbd> check.
      </p>
    </div>
  );
}

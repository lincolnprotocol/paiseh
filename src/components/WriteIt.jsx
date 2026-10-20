import { useEffect, useMemo, useRef, useState } from 'react';
import { speak } from '../lib/speech.js';
import { CLOSE, EXACT, ROMAN, charDiff, gradeWriting, paletteFor, writingMode, writingPassed } from '../lib/writing.js';
import { Backspace, Check, Keyboard, Speaker } from './Icons.jsx';

// Writing drill. The learner is shown the meaning and has to produce the phrase in writing.
//
// Chinese and Tamil get an on-screen character palette, because expecting a young adult in
// Singapore to have installed a Tamil IME before they can practise is exactly the kind of friction
// that kills the habit. The palette holds every character the phrase needs plus a few decoys.
//
// Typing the romanisation instead of the script is treated as a near miss with a nudge, not a
// failure: they knew the phrase, they just could not produce the script yet.
export default function WriteIt({ phrase, language, decoyPool = [], settings, onResult, onNext, index, total }) {
  const mode = writingMode(language.id);
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  const palette = useMemo(
    () => (mode === 'palette' ? paletteFor(phrase, decoyPool) : []),
    // Rebuild only when the phrase changes, so the keys do not jump around mid-attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phrase.text, mode],
  );

  useEffect(() => {
    setValue('');
    setResult(null);
    setRevealed(false);
  }, [phrase.text]);

  function submit(e) {
    e?.preventDefault();
    if (!value.trim()) return;
    const graded = gradeWriting(value, phrase);
    setResult(graded);
    onResult?.(writingPassed(graded), graded);
    if (writingPassed(graded)) speak(phrase.text, { lang: language.id, slow: settings.slow });
  }

  function reveal() {
    setValue(phrase.text);
    setRevealed(true);
    setResult(null);
    speak(phrase.text, { lang: language.id, slow: true });
  }

  const append = (char) => {
    setResult(null);
    setValue((v) => v + char);
    inputRef.current?.focus();
  };

  const backspace = () => {
    setResult(null);
    setValue((v) => [...v].slice(0, -1).join(''));
  };

  const diff = result && result.verdict !== EXACT ? charDiff(value, phrase.text) : null;

  return (
    <form className="writeit" onSubmit={submit}>
      <p className="note">
        {typeof index === 'number' ? `Writing · ${index + 1} of ${total}` : 'Writing practice'}
      </p>

      <div className="flashcard write-card">
        <small>How do you write…</small>
        <p className="flash-q">{phrase.english}</p>
        {settings.roman && phrase.roman && <p className="pinyin write-roman">{phrase.roman}</p>}
        <button
          type="button"
          className="share"
          onClick={() => speak(phrase.text, { lang: language.id, slow: true })}
        >
          <Speaker width={16} height={16} /> Hear it
        </button>
      </div>

      <label className="label write-label" htmlFor="write-input">
        <Keyboard width={16} height={16} />{' '}
        {mode === 'palette'
          ? 'Tap the characters, or type if you have the keyboard'
          : 'Type the phrase'}
      </label>
      <input
        id="write-input"
        ref={inputRef}
        className="field write-input"
        lang={language.htmlLang}
        value={value}
        onChange={(e) => {
          setResult(null);
          setRevealed(false);
          setValue(e.target.value);
        }}
        placeholder={mode === 'palette' ? 'Your answer appears here' : `Write it in ${language.name}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        maxLength={80}
      />

      {mode === 'palette' && (
        <div className="palette" aria-label="Character palette">
          {palette.map((char, i) => (
            <button
              key={`${char}-${i}`}
              type="button"
              className="key"
              lang={language.htmlLang}
              onClick={() => append(char)}
            >
              {char}
            </button>
          ))}
          <button type="button" className="key key-wide" onClick={backspace} aria-label="Delete the last character">
            <Backspace width={18} height={18} />
          </button>
        </div>
      )}

      {result && (
        <div className={`write-result ${result.verdict === EXACT ? 'good' : result.verdict === CLOSE || result.verdict === ROMAN ? 'ok' : 'low'}`} role="status">
          <b>{result.label}</b>
          {result.hint && <span className="write-hint">{result.hint}</span>}
          {diff && (
            <span className="diff" lang={language.htmlLang} aria-label="Character by character comparison">
              {diff.map((d, i) => (
                <span key={i} className={`diff-${d.state}`}>
                  {d.char}
                </span>
              ))}
            </span>
          )}
          {result.verdict !== EXACT && (
            <span className="write-answer">
              Answer: <b lang={language.htmlLang}>{phrase.text}</b>
            </span>
          )}
        </div>
      )}

      {revealed && (
        <p className="hint" role="status">
          Answer filled in. Read it, then clear it and try writing it yourself.
        </p>
      )}

      <div className="build-actions">
        {!revealed && !result && (
          <button type="button" className="ghost small" onClick={reveal}>
            Show answer
          </button>
        )}
        {value && (
          <button type="button" className="ghost small" onClick={() => setValue('')}>
            Clear
          </button>
        )}
        {result && onNext ? (
          <button type="button" className="primary small" onClick={onNext}>
            Next
          </button>
        ) : (
          <button className="primary small" disabled={!value.trim()}>
            <Check width={17} height={17} /> Check
          </button>
        )}
      </div>
    </form>
  );
}

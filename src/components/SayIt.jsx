import { useEffect, useRef, useState } from 'react';
import { canListen, listen, stopSpeaking } from '../lib/speech.js';
import { similarity, verdict } from '../lib/similarity.js';
import { Mic } from './Icons.jsx';

// "Say it" button: records the learner, then compares what the browser heard with the phrase.
export default function SayIt({ phrase, language }) {
  const [state, setState] = useState({ phase: 'idle' });
  const stop = useRef(null);

  useEffect(() => () => stop.current?.(), []);
  useEffect(() => setState({ phase: 'idle' }), [phrase.text]);

  if (!canListen) return null;

  function start() {
    stopSpeaking();
    let heard = '';
    let failed = false;
    setState({ phase: 'listening', heard: '' });
    try {
      stop.current = listen({
        lang: language.id,
        onText: (t) => {
          heard = t;
          setState({ phase: 'listening', heard: t });
        },
        onError: (code) => {
          failed = true;
          setState({ phase: 'error', code });
        },
        onEnd: () => {
          if (failed) return;
          setState(
            heard
              ? { phase: 'result', heard, score: similarity(heard, phrase.text) }
              : { phase: 'error', code: 'no-speech' },
          );
        },
      });
    } catch {
      setState({ phase: 'error', code: 'unsupported' });
    }
  }

  const listening = state.phase === 'listening';
  const v = state.phase === 'result' ? verdict(state.score) : null;

  return (
    <div className="sayit">
      <button
        type="button"
        className={`share ${listening ? 'live' : ''}`}
        onClick={listening ? () => stop.current?.() : start}
        aria-pressed={listening}
      >
        <Mic width={16} height={16} /> {listening ? 'Listening… tap to stop' : 'Say it'}
      </button>
      {v && (
        <p className={`sayit-result ${v.tone}`} role="status">
          <b>
            {v.label} {Math.round(state.score * 100)}%
          </b>
          <span>
            I heard:{' '}
            <span lang={language.htmlLang} className="heard">
              {state.heard}
            </span>
          </span>
        </p>
      )}
      {state.phase === 'error' && (
        <p className="sayit-result low" role="status">
          {state.code === 'not-allowed' || state.code === 'service-not-allowed'
            ? 'Mic is blocked in this browser.'
            : state.code === 'no-speech'
              ? "Didn't catch that. Try again."
              : `Couldn't listen in ${language.name} on this device.`}
        </p>
      )}
    </div>
  );
}

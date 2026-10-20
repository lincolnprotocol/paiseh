import { speak } from '../lib/speech.js';
import { Speaker } from './Icons.jsx';
import Phrase from './Phrase.jsx';

// One multiple-choice question, shared by the warm-up lesson and every quiz mode.
//   meaning   show the phrase, pick the English
//   recall    show the English, pick the phrase
//   listening hear it only, pick the phrase — trains the ear instead of the eye
export default function Question({ q, language, settings, picked, onPick }) {
  const hear = () => speak(q.phrase.text, { lang: language.id, slow: settings.slow });

  return (
    <>
      <div className="flashcard">
        {q.kind === 'meaning' && (
          <>
            <small>What does this mean?</small>
            <Phrase
              phrase={{ ...q.phrase, english: '' }}
              lang={language.htmlLang}
              showRoman={settings.roman}
              size="lg"
            />
          </>
        )}
        {q.kind === 'recall' && (
          <>
            <small>How do you say…</small>
            <p className="flash-q">{q.phrase.english}</p>
          </>
        )}
        {q.kind === 'listening' && (
          <>
            <small>Listen and pick what you heard</small>
            <button type="button" className="big-speaker" onClick={hear} aria-label="Play the phrase">
              <Speaker width={34} height={34} />
            </button>
            <small className="muted">Tap to play again</small>
          </>
        )}
      </div>

      <div className="options">
        {q.options.map((o) => {
          const state =
            picked === null ? '' : o.text === q.phrase.text ? 'right' : o.text === picked ? 'wrong' : 'dim';
          return (
            <button
              key={o.text}
              className={`option ${state}`}
              disabled={picked !== null}
              onClick={() => onPick(o)}
            >
              {q.kind === 'meaning' ? (
                <span>{o.english}</span>
              ) : (
                <Phrase
                  phrase={{ ...o, english: q.kind === 'listening' ? o.english : '' }}
                  lang={language.htmlLang}
                  showRoman={settings.roman}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

import Phrase from './Phrase.jsx';

// One multiple-choice question, used by the warm-up lesson and by the quiz.
// kind 'meaning': shows the phrase, pick the English. kind 'recall': shows the English, pick the phrase.
export default function Question({ q, language, settings, picked, onPick }) {
  return (
    <>
      <div className="flashcard">
        {q.kind === 'meaning' ? (
          <>
            <small>What does this mean?</small>
            <Phrase phrase={{ ...q.phrase, english: '' }} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
          </>
        ) : (
          <>
            <small>How do you say…</small>
            <p className="flash-q">{q.phrase.english}</p>
          </>
        )}
      </div>
      <div className="options">
        {q.options.map((o) => {
          const state =
            picked === null ? '' : o.text === q.phrase.text ? 'right' : o.text === picked ? 'wrong' : 'dim';
          return (
            <button key={o.text} className={`option ${state}`} disabled={picked !== null} onClick={() => onPick(o)}>
              {q.kind === 'meaning' ? (
                <span>{o.english}</span>
              ) : (
                <Phrase phrase={{ ...o, english: '' }} lang={language.htmlLang} showRoman={settings.roman} />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

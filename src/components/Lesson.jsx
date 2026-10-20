import { useEffect, useMemo, useState } from 'react';
import { lessonPhrases, toRounds } from '../lib/lesson.js';
import { makeQuestion, shuffle } from '../lib/quiz.js';
import { speak, stopSpeaking } from '../lib/speech.js';
import { Back, Check, Speaker } from './Icons.jsx';
import Phrase from './Phrase.jsx';
import Question from './Question.jsx';
import SayIt from './SayIt.jsx';
import WriteIt from './WriteIt.jsx';

// The warm-up before a conversation: learn the phrases you will need, then practise until you get
// them right. Nothing here assumes you already know the language.
//
// Each round now ends with one writing question, so the warm-up covers recognising, recalling and
// producing a phrase rather than only recognising it.
export default function Lesson({ language, scenario, settings, onDone, onExit, onDrill }) {
  const phrases = useMemo(() => lessonPhrases(scenario), [scenario]);
  const rounds = useMemo(() => toRounds(phrases), [phrases]);
  const [phase, setPhase] = useState('intro'); // intro | check | learn | practise | write | done
  const [round, setRound] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [known, setKnown] = useState([]);

  const finish = () => onDone({ phrases: skipped ? known : phrases, skipped });

  const afterWrite = () => {
    if (round + 1 < rounds.length) {
      setRound(round + 1);
      setPhase('learn');
    } else {
      setPhase('done');
    }
  };

  const pct = Math.round(
    ((round + (phase === 'practise' ? 0.4 : phase === 'write' ? 0.8 : 0)) / rounds.length) * 100,
  );

  return (
    <div className="immersive">
      <header className="immersive-head">
        <button className="icon-btn" onClick={onExit} aria-label="Back to home">
          <Back />
        </button>
        <b className="head-title">Warm-up · {scenario.title}</b>
        {(phase === 'learn' || phase === 'practise' || phase === 'write') && (
          <div
            className="meter"
            role="progressbar"
            aria-label="Warm-up progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
        )}
      </header>

      <div className="immersive-body">
        <div className="immersive-inner">
          {phase === 'intro' && (
            <div className="empty left-align">
              <h2>Learn it first, then chat</h2>
              <p>
                In this chat you will say {phrases.length} short {language.name} phrases. You will hear
                each one, see what it means, practise it, then write it. About{' '}
                {Math.max(2, Math.round(phrases.length / 3))} minutes.
              </p>
              <button className="primary wide" onClick={() => setPhase('learn')}>
                Start the warm-up
              </button>
              <button className="ghost wide" onClick={() => setPhase('check')}>
                I already know some of this
              </button>
            </div>
          )}

          {phase === 'check' && (
            <Check3
              language={language}
              settings={settings}
              pool={phrases}
              onPass={(proven) => {
                setKnown(proven);
                setSkipped(true);
                setPhase('done');
              }}
              onFail={() => setPhase('learn')}
            />
          )}

          {phase === 'learn' && (
            <Learn
              key={`learn-${round}`}
              language={language}
              settings={settings}
              cards={rounds[round]}
              part={`Part ${round + 1} of ${rounds.length}`}
              onDrill={onDrill}
              onDone={() => setPhase('practise')}
            />
          )}

          {phase === 'practise' && (
            <Practise
              key={`practise-${round}`}
              language={language}
              settings={settings}
              cards={rounds[round]}
              pool={phrases}
              part={`Part ${round + 1} of ${rounds.length}`}
              onDone={() => setPhase('write')}
            />
          )}

          {phase === 'write' && (
            <WriteStep
              key={`write-${round}`}
              language={language}
              settings={settings}
              cards={rounds[round]}
              onDrill={onDrill}
              onDone={afterWrite}
            />
          )}

          {phase === 'done' && (
            <div className="empty">
              <div className="badge" aria-hidden="true">
                <Check width={36} height={36} strokeWidth={3} />
              </div>
              <h2>{skipped ? 'You already know this!' : "You're ready to chat"}</h2>
              <p>
                {skipped
                  ? 'Nice. Skipping the warm-up.'
                  : `You learned ${phrases.length} phrases. They are saved in your phrasebook for review.`}{' '}
                In the chat you will build each reply from word tiles. Hints are there if you get stuck.
              </p>
              <button className="primary wide" onClick={finish}>
                Start the conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Learn({ language, settings, cards, part, onDone, onDrill }) {
  const [i, setI] = useState(0);
  const card = cards[i];
  const last = i === cards.length - 1;

  useEffect(() => {
    if (settings.autoplay) speak(card.text, { lang: language.id, slow: settings.slow });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="flash">
      <p className="note">
        {part} · new phrase {i + 1} of {cards.length}
      </p>
      <div className="flashcard learn-card">
        <small>Learn this</small>
        <Phrase phrase={card} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
        <span className="flash-tools">
          <button
            className="icon-btn"
            aria-label="Hear it again"
            onClick={() => speak(card.text, { lang: language.id, slow: settings.slow })}
          >
            <Speaker />
          </button>
          <SayIt
            phrase={card}
            language={language}
            onScore={(score) => score >= 0.85 && onDrill?.('say')}
          />
        </span>
      </div>
      <p className="note">Listen, then say it out loud a couple of times. Next, we practise it.</p>
      <button className="primary wide" onClick={last ? onDone : () => setI(i + 1)}>
        {last ? 'Practise these' : 'Next phrase'}
      </button>
    </div>
  );
}

// Practise until every phrase in the round has been answered correctly. Wrong answers come back.
function Practise({ language, settings, cards, pool, part, onDone }) {
  const [queue, setQueue] = useState(() => [
    ...shuffle(cards).map((p) => makeQuestion('meaning', p, pool)),
    ...shuffle(cards).map((p) => makeQuestion('recall', p, pool)),
  ]);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const total = cards.length * 2;
  const q = queue[0];

  function pick(option) {
    if (picked !== null) return;
    const ok = option.text === q.phrase.text;
    setPicked(option.text);
    if (ok) setRight((n) => n + 1);
    else setQueue((list) => [...list, makeQuestion(q.kind === 'meaning' ? 'recall' : 'meaning', q.phrase, pool)]);
    speak(q.phrase.text, { lang: language.id, slow: settings.slow });
  }

  function next() {
    stopSpeaking();
    setPicked(null);
    if (queue.length === 1) onDone();
    else setQueue((list) => list.slice(1));
  }

  const wrong = picked !== null && picked !== q.phrase.text;
  return (
    <div className="quiz">
      <p className="note">
        {part} · {right} of {total} correct
      </p>
      <Question q={q} language={language} settings={settings} picked={picked} onPick={pick} />
      {picked !== null && (
        <>
          <p className={`feedback ${wrong ? 'low' : 'good'}`} role="status">
            {wrong ? "Not quite. This one will come back, and that's how it sticks." : 'Correct!'}
          </p>
          <button className="primary wide" onClick={next}>
            Continue
          </button>
        </>
      )}
    </div>
  );
}

// One writing question per round. Producing the script is a different skill from recognising it.
function WriteStep({ language, settings, cards, onDone, onDrill }) {
  const [target] = useState(() => shuffle(cards)[0]);
  return (
    <WriteIt
      phrase={target}
      language={language}
      decoyPool={cards.filter((c) => c.text !== target.text)}
      settings={settings}
      onResult={(ok) => ok && onDrill?.('write')}
      onNext={onDone}
    />
  );
}

// "I already know some": three questions in a row. All right means you skip the warm-up.
function Check3({ language, settings, pool, onPass, onFail }) {
  const [questions] = useState(() =>
    shuffle(pool)
      .slice(0, 3)
      .map((p, i) => makeQuestion(i === 1 ? 'listening' : 'recall', p, pool)),
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = questions[i];

  if (!q) {
    const passed = score === questions.length;
    return (
      <div className="empty">
        <h2>{passed ? 'You know this already' : "Let's warm up first"}</h2>
        <p>
          {passed
            ? `${score} of ${questions.length} correct.`
            : `${score} of ${questions.length} correct. A short warm-up will make the chat much easier.`}
        </p>
        <button className="primary wide" onClick={() => (passed ? onPass(questions.map((x) => x.phrase)) : onFail())}>
          {passed ? 'Continue' : 'Start the warm-up'}
        </button>
      </div>
    );
  }

  function pick(option) {
    if (picked !== null) return;
    setPicked(option.text);
    if (option.text === q.phrase.text) setScore((n) => n + 1);
  }

  return (
    <div className="quiz">
      <p className="note">
        Quick check · {i + 1} of {questions.length}
      </p>
      <Question q={q} language={language} settings={settings} picked={picked} onPick={pick} />
      {picked !== null && (
        <button
          className="primary wide"
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          {i + 1 === questions.length ? 'See result' : 'Next'}
        </button>
      )}
    </div>
  );
}

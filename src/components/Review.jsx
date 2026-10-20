import { useState } from 'react';
import { makeQuestion, shuffle } from '../lib/quiz.js';
import { speak, stopSpeaking } from '../lib/speech.js';
import { Back, Book, Check, Speaker } from './Icons.jsx';
import Phrase from './Phrase.jsx';
import Question from './Question.jsx';
import SayIt from './SayIt.jsx';

const MIN_FOR_QUIZ = 4;

export default function Review({ language, phrases, due, settings, onGrade, onXp, onExit }) {
  const [mode, setMode] = useState('menu'); // menu | cards | quiz
  const [deck, setDeck] = useState([]);
  const [runId, setRunId] = useState(0);

  const startCards = () => {
    setDeck(shuffle(due.length > 0 ? due : phrases).slice(0, 10));
    setRunId((n) => n + 1);
    setMode('cards');
  };
  const startQuiz = () => {
    setRunId((n) => n + 1);
    setMode('quiz');
  };
  const finish = ({ xp }) => {
    if (xp > 0) onXp(xp);
    setMode('menu');
  };

  return (
    <main className="screen">
      <header className="chat-head plain-head">
        <button className="icon-btn" onClick={mode === 'menu' ? onExit : () => setMode('menu')} aria-label="Back">
          <Back />
        </button>
        <b className="head-title">
          {mode === 'cards' ? 'Flashcards' : mode === 'quiz' ? 'Quiz' : `Review · ${language.name}`}
        </b>
      </header>

      <div className="scroll">
        {mode === 'menu' && (
          <Menu
            phrases={phrases}
            due={due}
            onCards={startCards}
            onQuiz={startQuiz}
            onExit={onExit}
            language={language}
          />
        )}
        {mode === 'cards' && (
          <Flashcards
            key={runId}
            language={language}
            deck={deck}
            settings={settings}
            onGrade={onGrade}
            onFinish={finish}
          />
        )}
        {mode === 'quiz' && (
          <Quiz key={runId} language={language} phrases={phrases} settings={settings} onGrade={onGrade} onFinish={finish} />
        )}
      </div>
    </main>
  );
}

function Menu({ phrases, due, onCards, onQuiz, onExit, language }) {
  if (phrases.length === 0) {
    return (
      <div className="empty">
        <Book width={36} height={36} />
        <h2>Your {language.name} phrasebook is empty</h2>
        <p>Finish a chat and the phrases you meet are saved here for review, flashcards and quizzes.</p>
        <button className="primary" onClick={onExit}>
          Start a chat
        </button>
      </div>
    );
  }
  return (
    <div className="menu">
      <div className="tiles">
        <div className="tile">
          <b>{phrases.length}</b>
          <span>phrases</span>
        </div>
        <div className="tile">
          <b>{due.length}</b>
          <span>due now</span>
        </div>
        <div className="tile">
          <b>{phrases.filter((p) => (p.box ?? 0) >= 3).length}</b>
          <span>well known</span>
        </div>
      </div>

      <button className="mode" onClick={onCards}>
        <b>Flashcards</b>
        <span>
          See the meaning, recall the {language.name}, then check yourself and say it out loud.{' '}
          {due.length > 0 ? `${due.length} due.` : 'Nothing due, but you can practise anyway.'}
        </span>
      </button>

      <button className="mode" onClick={onQuiz} disabled={phrases.length < MIN_FOR_QUIZ}>
        <b>Quiz</b>
        <span>
          {phrases.length < MIN_FOR_QUIZ
            ? `Needs ${MIN_FOR_QUIZ} phrases. You have ${phrases.length}. Finish another chat to unlock it.`
            : 'Pick the right meaning or phrase. Up to 8 questions.'}
        </span>
      </button>

      <p className="note">
        Phrases you remember come back later and later (1, 3, 7, 14 then 30 days). Ones you forget come back
        sooner.
      </p>
    </div>
  );
}

function Flashcards({ language, deck, settings, onGrade, onFinish }) {
  const [queue, setQueue] = useState(deck);
  const [revealed, setRevealed] = useState(false);
  const [got, setGot] = useState(0);
  const [retried, setRetried] = useState(() => new Set());
  const total = deck.length;
  const card = queue[0];

  function reveal() {
    setRevealed(true);
    speak(card.text, { lang: language.id, slow: settings.slow });
  }

  function grade(ok) {
    stopSpeaking();
    onGrade(card.text, ok);
    const again = !ok && !retried.has(card.text); // a forgotten card gets one more go this session
    if (ok) setGot((g) => g + 1);
    if (again) setRetried(new Set(retried).add(card.text));
    setQueue((q) => (again ? [...q.slice(1), card] : q.slice(1)));
    setRevealed(false);
  }

  if (!card) {
    const xp = got * 3 + 5;
    return (
      <div className="empty">
        <div className="badge" aria-hidden="true">
          <Check width={36} height={36} strokeWidth={3} />
        </div>
        <h2>
          {got} of {total} remembered
        </h2>
        <p>+{xp} XP. Cards you missed will come back sooner.</p>
        <button className="primary" onClick={() => onFinish({ xp })}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flash">
      <p className="note">{queue.length} left</p>
      <div className="flashcard">
        <small>How do you say…</small>
        <p className="flash-q">{card.english}</p>
        {revealed ? (
          <div className="flash-a">
            <Phrase phrase={{ ...card, english: '' }} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
            <span className="flash-tools">
              <button
                className="icon-btn"
                aria-label="Hear it"
                onClick={() => speak(card.text, { lang: language.id, slow: settings.slow })}
              >
                <Speaker />
              </button>
              <SayIt phrase={card} language={language} />
            </span>
          </div>
        ) : (
          <button className="primary" onClick={reveal}>
            Show answer
          </button>
        )}
      </div>
      {revealed && (
        <div className="grade">
          <button className="ghost" onClick={() => grade(false)}>
            Again
          </button>
          <button className="primary" onClick={() => grade(true)}>
            Got it
          </button>
        </div>
      )}
    </div>
  );
}

function buildQuiz(phrases) {
  return shuffle(phrases)
    .slice(0, 8)
    .map((phrase, n) => makeQuestion(n % 2 === 0 ? 'meaning' : 'recall', phrase, phrases));
}

function Quiz({ language, phrases, settings, onGrade, onFinish }) {
  const [questions] = useState(() => buildQuiz(phrases));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = questions[i];

  if (!q) {
    const xp = score * 5;
    return (
      <div className="empty">
        <div className="badge" aria-hidden="true">
          <Check width={36} height={36} strokeWidth={3} />
        </div>
        <h2>
          {score} of {questions.length} correct
        </h2>
        <p>+{xp} XP. {score === questions.length ? 'Perfect round!' : 'The ones you missed will come back soon.'}</p>
        <button className="primary" onClick={() => onFinish({ xp })}>
          Done
        </button>
      </div>
    );
  }

  function answer(option) {
    if (picked !== null) return;
    const ok = option.text === q.phrase.text;
    setPicked(option.text);
    if (ok) setScore((s) => s + 1);
    onGrade(q.phrase.text, ok);
    speak(q.phrase.text, { lang: language.id, slow: settings.slow });
  }

  const next = () => {
    stopSpeaking();
    setPicked(null);
    setI((n) => n + 1);
  };

  return (
    <div className="quiz">
      <p className="note">
        Question {i + 1} of {questions.length}
      </p>
      <Question q={q} language={language} settings={settings} picked={picked} onPick={answer} />
      {picked !== null && (
        <button className="primary wide" onClick={next}>
          {i + 1 === questions.length ? 'See score' : 'Next'}
        </button>
      )}
    </div>
  );
}

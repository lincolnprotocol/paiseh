import { useState } from 'react';
import { makeQuestion, mixedQuestions, shuffle } from '../../lib/quiz.js';
import { speak, stopSpeaking } from '../../lib/speech.js';
import { Back, Book, Check, Ear, Pencil, Speaker, Target } from '../Icons.jsx';
import Phrase from '../Phrase.jsx';
import Question from '../Question.jsx';
import SayIt from '../SayIt.jsx';
import WriteIt from '../WriteIt.jsx';

const MIN_FOR_QUIZ = 4;

// Review hub. The old build had flashcards and one quiz; this adds writing and listening drills,
// plus a dedicated pass for "leeches" — the phrases you keep forgetting, which the normal schedule
// is clearly not fixing on its own.
export default function ReviewScreen({
  language,
  phrases,
  due,
  leeches,
  settings,
  t,
  onGrade,
  onXp,
  onDrill,
  onRoute,
}) {
  const [mode, setMode] = useState('menu');
  const [deck, setDeck] = useState([]);
  const [runId, setRunId] = useState(0);

  const begin = (next, cards = []) => {
    setDeck(cards);
    setRunId((n) => n + 1);
    setMode(next);
  };

  const finish = ({ xp = 0, reviewed = 0 }) => {
    if (xp > 0 || reviewed > 0) onXp({ xpGained: xp, reviewed });
    setMode('menu');
  };

  const pool = due.length > 0 ? due : phrases;

  if (phrases.length === 0) {
    return (
      <div className="page">
        <header className="page-head">
          <h1 className="page-title">{t('review.title')}</h1>
        </header>
        <div className="empty">
          <Book width={36} height={36} />
          <h2>
            {t('review.empty')} ({language.name})
          </h2>
          <p>
            Finish a warm-up or a conversation and every phrase you meet is saved here for flashcards,
            quizzes, writing and listening practice.
          </p>
          <button className="primary" onClick={() => onRoute('learn')}>
            Pick a scenario
          </button>
        </div>
      </div>
    );
  }

  if (mode !== 'menu') {
    const titles = {
      cards: t('review.flashcards'),
      quiz: t('review.quiz'),
      writing: t('review.writing'),
      listening: t('review.listening'),
      leech: 'Tricky phrases',
    };
    return (
      <div className="page">
        <header className="page-head row">
          <button className="icon-btn" onClick={() => setMode('menu')} aria-label={t('action.back')}>
            <Back />
          </button>
          <h1 className="page-title small">{titles[mode]}</h1>
        </header>

        {mode === 'cards' && (
          <Flashcards
            key={runId}
            language={language}
            deck={deck}
            settings={settings}
            onGrade={onGrade}
            onDrill={onDrill}
            onFinish={finish}
          />
        )}
        {mode === 'leech' && (
          <Flashcards
            key={runId}
            language={language}
            deck={deck}
            settings={settings}
            onGrade={onGrade}
            onDrill={onDrill}
            onFinish={finish}
            leechMode
          />
        )}
        {mode === 'quiz' && (
          <Quiz
            key={runId}
            language={language}
            phrases={phrases}
            settings={settings}
            onGrade={onGrade}
            onFinish={finish}
          />
        )}
        {mode === 'listening' && (
          <Quiz
            key={runId}
            language={language}
            phrases={phrases}
            settings={settings}
            kinds={['listening']}
            onGrade={onGrade}
            onFinish={finish}
          />
        )}
        {mode === 'writing' && (
          <WritingDrill
            key={runId}
            language={language}
            deck={deck}
            settings={settings}
            onGrade={onGrade}
            onDrill={onDrill}
            onFinish={finish}
          />
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            {t('review.title')} · {language.name}
          </h1>
          <p className="page-sub">
            Phrases you remember come back later and later (1, 3, 7, 14 then 30 days). Ones you forget
            come back sooner.
          </p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-box">
          <b>{phrases.length}</b>
          <span>{t('stats.phrases')}</span>
        </div>
        <div className="stat-box">
          <b>{due.length}</b>
          <span>{t('home.due')}</span>
        </div>
        <div className="stat-box">
          <b>{phrases.filter((p) => (p.box ?? 0) >= 3).length}</b>
          <span>well known</span>
        </div>
        <div className="stat-box">
          <b>{leeches.length}</b>
          <span>tricky</span>
        </div>
      </div>

      <div className="mode-grid">
        <button className="mode" onClick={() => begin('cards', shuffle(pool).slice(0, 10))}>
          <span className="mode-icon">
            <Book width={20} height={20} />
          </span>
          <b>{t('review.flashcards')}</b>
          <span>
            See the meaning, recall the {language.name}, check yourself, say it out loud.{' '}
            {due.length > 0 ? `${due.length} due.` : 'Nothing due, practise anyway.'}
          </span>
        </button>

        <button className="mode" onClick={() => begin('quiz')} disabled={phrases.length < MIN_FOR_QUIZ}>
          <span className="mode-icon">
            <Check width={20} height={20} />
          </span>
          <b>{t('review.quiz')}</b>
          <span>
            {phrases.length < MIN_FOR_QUIZ
              ? `Needs ${MIN_FOR_QUIZ} phrases, you have ${phrases.length}.`
              : 'Pick the right meaning or the right phrase. Up to 8 questions.'}
          </span>
        </button>

        <button className="mode" onClick={() => begin('writing', shuffle(pool).slice(0, 6))}>
          <span className="mode-icon">
            <Pencil width={20} height={20} />
          </span>
          <b>{t('review.writing')}</b>
          <span>
            Write the phrase yourself.{' '}
            {language.id === 'ms'
              ? 'Your normal keyboard is all you need.'
              : 'Tap the characters, no special keyboard required.'}
          </span>
        </button>

        <button className="mode" onClick={() => begin('listening')} disabled={phrases.length < MIN_FOR_QUIZ}>
          <span className="mode-icon">
            <Ear width={20} height={20} />
          </span>
          <b>{t('review.listening')}</b>
          <span>
            {phrases.length < MIN_FOR_QUIZ
              ? `Needs ${MIN_FOR_QUIZ} phrases, you have ${phrases.length}.`
              : 'Audio only. Hear it and pick what was said.'}
          </span>
        </button>

        {leeches.length > 0 && (
          <button className="mode warn" onClick={() => begin('leech', shuffle(leeches).slice(0, 8))}>
            <span className="mode-icon">
              <Target width={20} height={20} />
            </span>
            <b>Tricky phrases</b>
            <span>
              {leeches.length} {leeches.length === 1 ? 'phrase keeps' : 'phrases keep'} slipping away.
              Slower pass, audio first, no scoring pressure.
            </span>
          </button>
        )}
      </div>

      <section className="panel" aria-labelledby="book-head">
        <div className="panel-head">
          <h2 id="book-head">
            <Book width={18} height={18} /> {t('label.phrasebook')}{' '}
            <span className="count">{phrases.length}</span>
          </h2>
        </div>
        <ul className="book">
          {phrases.slice(0, 12).map((p) => (
            <li key={p.text}>
              <Phrase phrase={p} lang={language.htmlLang} showRoman={settings.roman} />
              <span className="book-right">
                <span className={`box-pip box-${p.box ?? 0}`} title={`Review box ${p.box ?? 0} of 5`}>
                  {p.box ?? 0}
                </span>
                <button
                  className="icon-btn"
                  aria-label={`Hear ${p.text}`}
                  onClick={() => speak(p.text, { lang: language.id, slow: settings.slow })}
                >
                  <Speaker />
                </button>
              </span>
            </li>
          ))}
        </ul>
        {phrases.length > 12 && <p className="note">Showing the 12 most recent of {phrases.length}.</p>}
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- flashcards */

function Flashcards({ language, deck, settings, onGrade, onDrill, onFinish, leechMode = false }) {
  const [queue, setQueue] = useState(deck);
  const [revealed, setRevealed] = useState(false);
  const [got, setGot] = useState(0);
  const [seen, setSeen] = useState(0);
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
    setSeen((n) => n + 1);
    const again = !ok && !retried.has(card.text);
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
        <p>Cards you missed will come back sooner. Nothing is lost.</p>
        <button className="primary" onClick={() => onFinish({ xp, reviewed: seen })}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flash">
      <p className="note">{queue.length} left</p>
      {leechMode && (
        <p className="hint">
          These keep slipping. Listen first, then recall — there is no score on this pass.
        </p>
      )}
      <div className="flashcard">
        <small>How do you say…</small>
        <p className="flash-q">{card.english}</p>
        {leechMode && !revealed && (
          <button
            type="button"
            className="share"
            onClick={() => speak(card.text, { lang: language.id, slow: true })}
          >
            <Speaker width={16} height={16} /> Hear it first
          </button>
        )}
        {revealed ? (
          <div className="flash-a">
            <Phrase
              phrase={{ ...card, english: '' }}
              lang={language.htmlLang}
              showRoman={settings.roman}
              size="lg"
            />
            <span className="flash-tools">
              <button
                className="icon-btn"
                aria-label="Hear it"
                onClick={() => speak(card.text, { lang: language.id, slow: settings.slow })}
              >
                <Speaker />
              </button>
              <SayIt phrase={card} language={language} onScore={(score) => score >= 0.85 && onDrill('say')} />
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

/* --------------------------------------------------------------------- quiz */

function Quiz({ language, phrases, settings, kinds = ['meaning', 'recall'], onGrade, onFinish }) {
  const [questions] = useState(() => mixedQuestions(phrases, { length: 8, kinds }));
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
        <p>
          {score === questions.length ? 'Every phrase landed.' : 'The ones you missed will come back soon.'}
        </p>
        <button className="primary" onClick={() => onFinish({ xp, reviewed: questions.length })}>
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

/* ------------------------------------------------------------------ writing */

function WritingDrill({ language, deck, settings, onGrade, onDrill, onFinish }) {
  const [i, setI] = useState(0);
  const [passed, setPassed] = useState(0);
  const phrase = deck[i];

  if (!phrase) {
    const xp = passed * 4 + 5;
    return (
      <div className="empty">
        <div className="badge" aria-hidden="true">
          <Check width={36} height={36} strokeWidth={3} />
        </div>
        <h2>
          {passed} of {deck.length} written
        </h2>
        <p>Writing it is a different skill from reading it, and it sticks harder.</p>
        <button className="primary" onClick={() => onFinish({ xp, reviewed: deck.length })}>
          Done
        </button>
      </div>
    );
  }

  return (
    <WriteIt
      key={phrase.text}
      phrase={phrase}
      language={language}
      decoyPool={deck.filter((p) => p.text !== phrase.text)}
      settings={settings}
      index={i}
      total={deck.length}
      onResult={(ok) => {
        onGrade(phrase.text, ok);
        if (ok) {
          setPassed((n) => n + 1);
          onDrill('write');
        }
      }}
      onNext={() => setI((n) => n + 1)}
    />
  );
}

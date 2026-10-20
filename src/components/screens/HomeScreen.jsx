import { languages } from '../../data/languages.js';
import { scenariosFor } from '../../data/scenarios.js';
import {
  allPhrases,
  duePhrases,
  langState,
} from '../../lib/storage.js';
import { Book, Forward, Sparkles } from '../Icons.jsx';

// Home is organised around places the learner can use their mother tongue, not around a score.
// Points and milestones still exist for learners who enjoy them, but they live in Progress rather
// than defining the first screen everybody sees.
export default function HomeScreen({ progress, language, live, t, onRoute, onStart, onLanguage }) {
  const state = langState(progress, language.id);
  const phrases = allPhrases(progress, language.id);
  const due = duePhrases(progress, language.id);
  const scenarios = scenariosFor(language.id);
  const nextScenario = scenarios.find((s) => !state.lessons?.[s.id]) ?? scenarios[0];
  const warmed = scenarios.filter((s) => state.lessons?.[s.id]).length;
  const outsidePhrase =
    phrases[0] ??
    {
      zh: { text: '最近怎么样？', english: 'How have you been lately?' },
      ms: { text: 'Dah makan?', english: 'Have you eaten?' },
      ta: { text: 'சாப்பிட்டியா?', english: 'Have you eaten?' },
    }[language.id];

  return (
    <div className="page">
      <header className="page-head home-intro">
        <span className="eyebrow">REAL-LIFE MOTHER TONGUE</span>
        <h1 className="page-title">
          Your mother tongue, <span className="hl">where life actually happens.</span>
        </h1>
        <p className="page-sub">
          Hawker stalls, family dinners, group chats and first days at work. Learn the words, hear the
          rhythm, then use {language.name} without the paiseh.
        </p>
      </header>

      <div className="langs mobile-only" role="group" aria-label="Choose a language">
        {languages.map((l) => (
          <button
            key={l.id}
            className={`lang ${l.id === language.id ? 'on' : ''}`}
            aria-pressed={l.id === language.id}
            onClick={() => onLanguage(l.id)}
          >
            <span lang={l.htmlLang}>{l.chip}</span>
          </button>
        ))}
      </div>

      <div className="page-grid">
        <div className="col-main">
          <button className="cta-card" onClick={() => onStart(nextScenario.id)}>
            <span className={`glyph tone-${nextScenario.tone}`} lang={language.htmlLang} aria-hidden="true">
              {nextScenario.glyph}
            </span>
            <span className="cta-body">
              <small>{state.lessons?.[nextScenario.id] ? 'CONTINUE THIS MOMENT' : 'YOUR NEXT REAL-LIFE MOMENT'}</small>
              <b>{nextScenario.title}</b>
              <span>{nextScenario.blurb}</span>
            </span>
            <Forward />
          </button>

          <section className="moments" aria-labelledby="pick-head">
            <div className="section-head">
              <span>
                <span className="eyebrow">PRACTISE WHERE IT COUNTS</span>
                <h2 id="pick-head">{t('home.pickMoment')}</h2>
              </span>
              <button className="link-btn" onClick={() => onRoute('learn')}>
                See every moment
              </button>
            </div>
            <ul className="scenario-grid compact">
              {scenarios.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <button className={`scenario-card tone-${s.tone}`} onClick={() => onStart(s.id)}>
                    <span className="glyph" lang={language.htmlLang} aria-hidden="true">
                      {s.glyph}
                    </span>
                    <span className="scenario-body">
                      <b>{s.title}</b>
                      <small>{s.blurb}</small>
                      <small className="scenario-meta">
                        with {s.persona.name} · {s.minutes} {t('label.minutes')} ·{' '}
                        <b className={state.lessons?.[s.id] ? 'ok' : ''}>
                          {state.lessons?.[s.id] ? 'ready to revisit' : 'learn the lines first'}
                        </b>
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel phrase-shelf" aria-labelledby="words-head">
            <div className="panel-head">
              <h2 id="words-head">
                <Book width={18} height={18} /> Words you can take into real life
              </h2>
              <button className="link-btn" onClick={() => onRoute('review')}>
                Open phrasebook
              </button>
            </div>
            {phrases.length === 0 ? (
              <p className="muted small-text">
                Your first useful phrases will live here after one warm-up — ready for a family chat,
                lunch order or message to a friend.
              </p>
            ) : (
              <ul className="phrase-preview">
                {phrases.slice(0, 4).map((phrase) => (
                  <li key={phrase.text}>
                    <b lang={language.htmlLang}>{phrase.text}</b>
                    <span>{phrase.english}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="col-side">
          <button className="real-talk-card" onClick={() => onRoute('slang')}>
            <Sparkles width={21} height={21} />
            <span>
              <small>TEXTBOOK → REAL LIFE</small>
              <b>How people actually say it</b>
              <span>Slang, code-switching and who each phrase is safe with.</span>
            </span>
            <Forward width={18} height={18} />
          </button>

          <button className="review-cta" onClick={() => onRoute('review')}>
            <Book />
            <span>
              <b>Keep your phrases fresh</b>
              <small>
                {phrases.length === 0
                  ? 'Your phrasebook starts after one warm-up'
                  : due.length > 0
                    ? `${due.length} ${due.length === 1 ? 'phrase wants' : 'phrases want'} another look`
                    : 'Nothing due — browse what you already know'}
              </small>
            </span>
            {due.length > 0 && <i className="due">{due.length}</i>}
          </button>

          <section className="panel language-footprint" aria-labelledby="footprint-head">
            <div className="panel-head">
              <h2 id="footprint-head">Your {language.name} footprint</h2>
            </div>
            <div className="footprint-grid">
              <span>
                <b>{state.sessions}</b>
                <small>real-life conversations</small>
              </span>
              <span>
                <b>{phrases.length}</b>
                <small>phrases kept</small>
              </span>
              <span>
                <b>{warmed}</b>
                <small>moments ready</small>
              </span>
            </div>
          </section>

          <section className="panel outside-card" aria-labelledby="outside-head">
            <span className="eyebrow">TAKE IT OUTSIDE THE APP</span>
            <h2 id="outside-head">Use one line with a real person</h2>
            <div className="outside-phrase">
              <b lang={language.htmlLang}>{outsidePhrase.text}</b>
              <span>{outsidePhrase.english}</span>
            </div>
            <p className="muted small-text">
              Try it in a family chat, over lunch, or with someone beside you. Nothing to tick off and
              nobody is keeping score.
            </p>
            <button className="link-btn" onClick={() => onRoute(phrases.length > 0 ? 'review' : 'learn')}>
              {phrases.length > 0 ? 'Pick another phrase' : 'Learn a few useful lines'}
            </button>
          </section>

          <p className="foot">
            <span className={`dot ${live ? 'live' : ''}`} aria-hidden="true" />
            {live ? 'Live conversation' : 'Scripted demo, ready offline'}
          </p>
        </div>
      </div>
    </div>
  );
}

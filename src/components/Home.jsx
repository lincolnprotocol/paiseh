import { languages } from '../data/languages.js';
import { scenariosFor } from '../data/scenarios.js';
import { allPhrases, duePhrases, langState, levelInfo } from '../lib/storage.js';
import { speak } from '../lib/speech.js';
import { Book, Flame, Speaker, Star } from './Icons.jsx';
import Phrase from './Phrase.jsx';

export default function Home({
  progress,
  language,
  streak,
  live,
  onStart,
  onSettings,
  onLanguage,
  onReview,
  onFeedback,
}) {
  const { settings } = progress;
  const state = langState(progress, language.id);
  const level = levelInfo(state.xp);
  const phrases = allPhrases(progress, language.id);
  const due = duePhrases(progress, language.id).length;
  const scenarios = scenariosFor(language.id);
  const totalXp = Object.values(progress.langs).reduce((sum, l) => sum + (l?.xp ?? 0), 0);

  return (
    <main className="screen">
      <div className="scroll">
        <header className="topbar">
          <div className="brand">
            <img src="/icon.svg" alt="" width="32" height="32" />
            <span>BiLingos</span>
          </div>
          <div className="stats" aria-label="Your progress">
            <span className="stat" title="Day streak">
              <Flame className="ico-flame" />
              <b>{streak}</b>
              <span className="sr-only"> day streak</span>
            </span>
            <span className="stat" title="Total experience points">
              <Star className="ico-star" />
              <b>{totalXp}</b>
              <span className="sr-only"> XP</span>
            </span>
          </div>
        </header>

        <section className="hero">
          <h1>
            Speak your mother tongue.
            <br />
            <span className="hl">No paiseh.</span>
          </h1>
          <p>
            Pick a real-life moment and chat. Reply in English, Singlish or broken{' '}
            {language.name}. We will never mark you wrong, we just show you how people really say it.
          </p>
        </section>

        <div className="langs" role="group" aria-label="Choose a language">
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
          <button className="lang more" onClick={() => onFeedback('language')}>
            + Suggest
          </button>
        </div>

        <section className="level" aria-label={`${language.name} level`}>
          <div className="level-top">
            <span className="level-badge">{level.level}</span>
            <span className="level-text">
              <b>{level.title}</b>
              <small>
                {language.name} · {state.sessions} chat{state.sessions === 1 ? '' : 's'} ·{' '}
                {phrases.length} phrase{phrases.length === 1 ? '' : 's'}
              </small>
            </span>
          </div>
          <div
            className="meter slim"
            role="progressbar"
            aria-label="Progress to next level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={level.pct}
          >
            <span style={{ width: `${level.pct}%` }} />
          </div>
          <small className="level-foot">
            {level.span - level.into} XP to level {level.level + 1}
          </small>
        </section>

        <button className="review-cta" onClick={onReview}>
          <Book />
          <span>
            <b>Review and quiz</b>
            <small>
              {phrases.length === 0
                ? 'Finish a chat to start your phrasebook'
                : due > 0
                  ? `${due} phrase${due === 1 ? '' : 's'} ready to review`
                  : 'All caught up. Practise anyway'}
            </small>
          </span>
          {due > 0 && <i className="due">{due}</i>}
        </button>

        <section aria-labelledby="pick">
          <h2 id="pick" className="section-title">
            Pick a moment
          </h2>
          <ul className="cards">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button className={`card tone-${s.tone}`} onClick={() => onStart(s.id)}>
                  <span className="glyph" lang={language.htmlLang} aria-hidden="true">
                    {s.glyph}
                  </span>
                  <span className="card-body">
                    <span className="card-title">{s.title}</span>
                    <span className="card-blurb">{s.blurb}</span>
                    <span className="card-meta">
                      with {s.persona.name} · {s.minutes} min ·{' '}
                      <b className={state.lessons?.[s.id] ? 'ok' : ''}>
                        {state.lessons?.[s.id] ? 'Warm-up done' : 'Starts with a warm-up'}
                      </b>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="settings" aria-labelledby="set">
          <h2 id="set" className="section-title">
            Make it comfy
          </h2>
          <label className="toggle">
            <span>
              <b>Show romanisation</b>
              <small>Pinyin for Mandarin, Latin letters for Tamil</small>
            </span>
            <input
              type="checkbox"
              checked={settings.roman}
              onChange={(e) => onSettings({ roman: e.target.checked })}
            />
          </label>
          <label className="toggle">
            <span>
              <b>Grandparent mode</b>
              <small>Slower voice and simpler words</small>
            </span>
            <input
              type="checkbox"
              checked={settings.slow}
              onChange={(e) => onSettings({ slow: e.target.checked })}
            />
          </label>
        </section>

        {phrases.length > 0 && (
          <section aria-labelledby="book">
            <h2 id="book" className="section-title">
              <Book /> Your {language.name} phrasebook <span className="count">{phrases.length}</span>
            </h2>
            <ul className="book">
              {phrases.slice(0, 6).map((p) => (
                <li key={p.text}>
                  <Phrase phrase={p} lang={language.htmlLang} showRoman={settings.roman} />
                  <button
                    className="icon-btn"
                    aria-label={`Hear ${p.text}`}
                    onClick={() => speak(p.text, { lang: language.id, slow: settings.slow })}
                  >
                    <Speaker />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button className="ghost wide feedback-link" onClick={() => onFeedback('feature')}>
          Send feedback or suggest a language
        </button>

        <footer className="foot">
          <span className={`dot ${live ? 'live' : ''}`} aria-hidden="true" />
          {live ? 'Live AI conversation' : 'Demo mode: scripted replies'}
        </footer>
      </div>
    </main>
  );
}

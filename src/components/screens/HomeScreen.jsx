import { languages } from '../../data/languages.js';
import { scenariosFor } from '../../data/scenarios.js';
import {
  allPhrases,
  dailyMissions,
  duePhrases,
  earnedAchievements,
  historySeries,
  langState,
  levelInfo,
  streakAtRisk,
} from '../../lib/storage.js';
import MissionList from '../MissionList.jsx';
import Sparkline from '../Sparkline.jsx';
import { Book, Flame, Forward, Snow, Trophy } from '../Icons.jsx';

export default function HomeScreen({ progress, language, streak, live, t, onRoute, onStart, onClaim, onLanguage }) {
  const state = langState(progress, language.id);
  const level = levelInfo(state.xp);
  const phrases = allPhrases(progress, language.id);
  const due = duePhrases(progress, language.id);
  const missions = dailyMissions(progress);
  const series = historySeries(progress, 14);
  const achievements = earnedAchievements(progress).filter((a) => a.earnedAt);
  const scenarios = scenariosFor(language.id);
  const atRisk = streakAtRisk(progress);

  // The next thing worth doing, so the home screen always has one obvious action.
  const nextScenario = scenarios.find((s) => !state.lessons?.[s.id]) ?? scenarios[0];

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            Speak your mother tongue. <span className="hl">No paiseh.</span>
          </h1>
          <p className="page-sub">
            Learn the phrases first, then use them in a real conversation. Reply in English, Singlish or
            broken {language.name} — nothing here marks you wrong.
          </p>
        </div>
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
          <section className="panel level-panel" aria-label={`${language.name} level`}>
            <div className="level-top">
              <span className="level-badge">{level.level}</span>
              <span className="level-text">
                <b>{level.title}</b>
                <small>
                  {language.name} · {state.sessions} {state.sessions === 1 ? 'chat' : 'chats'} ·{' '}
                  {phrases.length} {phrases.length === 1 ? 'phrase' : 'phrases'}
                </small>
              </span>
              <span className="level-xp">{state.xp} XP</span>
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

          <button className="cta-card" onClick={() => onStart(nextScenario.id)}>
            <span className={`glyph tone-${nextScenario.tone}`} lang={language.htmlLang} aria-hidden="true">
              {nextScenario.glyph}
            </span>
            <span className="cta-body">
              <small>{state.lessons?.[nextScenario.id] ? 'Jump back in' : 'Start here'}</small>
              <b>{nextScenario.title}</b>
              <span>{nextScenario.blurb}</span>
            </span>
            <Forward />
          </button>

          <MissionList missions={missions} onClaim={onClaim} title={t('home.missions')} />

          <section className="panel" aria-labelledby="pick-head">
            <div className="panel-head">
              <h2 id="pick-head">{t('home.pickMoment')}</h2>
              <button className="link-btn" onClick={() => onRoute('learn')}>
                See all {scenarios.length}
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
                        {s.persona.name} · {s.minutes} {t('label.minutes')} ·{' '}
                        <b className={state.lessons?.[s.id] ? 'ok' : ''}>
                          {state.lessons?.[s.id] ? t('label.warmupDone') : t('label.startsWarmup')}
                        </b>
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-side">
          <section className={`panel streak-panel ${atRisk ? 'warn' : ''}`} aria-label="Streak">
            <div className="streak-top">
              <Flame className="ico-flame" width={26} height={26} />
              <b className="streak-num">{streak}</b>
              <span>{t('home.streak')}</span>
            </div>
            <Sparkline series={series} />
            <small className="muted">
              {atRisk
                ? 'Practise today to keep the streak alive.'
                : streak > 0
                  ? 'Already counted for today. Nice.'
                  : 'Finish anything today to start a streak.'}
            </small>
            {progress.freezes > 0 && (
              <small className="freeze">
                <Snow width={14} height={14} /> {progress.freezes} streak{' '}
                {progress.freezes === 1 ? 'freeze' : 'freezes'} left — one missed day is covered
                automatically.
              </small>
            )}
          </section>

          <button className="review-cta" onClick={() => onRoute('review')}>
            <Book />
            <span>
              <b>{t('review.title')}</b>
              <small>
                {phrases.length === 0
                  ? 'Finish a warm-up to start your phrasebook'
                  : due.length > 0
                    ? `${due.length} ${due.length === 1 ? 'phrase' : 'phrases'} ready`
                    : 'All caught up. Practise anyway'}
              </small>
            </span>
            {due.length > 0 && <i className="due">{due.length}</i>}
          </button>

          <section className="panel" aria-labelledby="ach-head">
            <div className="panel-head">
              <h2 id="ach-head">
                <Trophy width={18} height={18} /> Badges
              </h2>
              <button className="link-btn" onClick={() => onRoute('stats')}>
                All
              </button>
            </div>
            {achievements.length === 0 ? (
              <p className="muted small-text">
                No badges yet. Finishing your first warm-up earns one straight away.
              </p>
            ) : (
              <ul className="ach-row">
                {achievements.slice(-6).map((a) => (
                  <li key={a.id} className="ach-chip" title={a.blurb}>
                    <Trophy width={14} height={14} /> {a.label}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="foot">
            <span className={`dot ${live ? 'live' : ''}`} aria-hidden="true" />
            {live ? 'Live AI conversation' : 'Demo mode: scripted replies'}
          </p>
        </div>
      </div>
    </div>
  );
}

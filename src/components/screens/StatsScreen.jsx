import { languages } from '../../data/languages.js';
import {
  activeDays,
  allPhrases,
  currentStreak,
  earnedAchievements,
  historySeries,
  langState,
  levelInfo,
  totalXp,
} from '../../lib/storage.js';
import Sparkline from '../Sparkline.jsx';
import { Flame, Lock, Pencil, Mic, Star, Trophy } from '../Icons.jsx';

const BOX_LABELS = ['New', '1 day', '3 days', '1 week', '2 weeks', '1 month'];

export default function StatsScreen({ progress, language, t }) {
  const state = langState(progress, language.id);
  const level = levelInfo(state.xp);
  const phrases = allPhrases(progress, language.id);
  const series = historySeries(progress, 30);
  const achievements = earnedAchievements(progress);
  const earned = achievements.filter((a) => a.earnedAt);
  const weekXp = historySeries(progress, 7).reduce((sum, d) => sum + d.xp, 0);

  const boxes = BOX_LABELS.map((label, i) => ({
    label,
    count: phrases.filter((p) => (p.box ?? 0) === i).length,
  }));
  const maxBox = Math.max(1, ...boxes.map((b) => b.count));

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('stats.title')}</h1>
          <p className="page-sub">
            Everything here lives on this device only. No account, no leaderboard, nobody watching.
          </p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-box">
          <Flame className="ico-flame" />
          <b>{currentStreak(progress)}</b>
          <span>{t('home.streak')}</span>
        </div>
        <div className="stat-box">
          <Star className="ico-star" />
          <b>{totalXp(progress)}</b>
          <span>total XP</span>
        </div>
        <div className="stat-box">
          <b>{weekXp}</b>
          <span>XP {t('stats.thisWeek').toLowerCase()}</span>
        </div>
        <div className="stat-box">
          <b>
            {activeDays(progress, 7)}
            <small>/7</small>
          </b>
          <span>days active</span>
        </div>
      </div>

      <section className="panel" aria-labelledby="chart-head">
        <div className="panel-head">
          <h2 id="chart-head">Last 30 days</h2>
        </div>
        <Sparkline series={series} label="XP per day over the last 30 days" />
        <p className="note">Each bar is one day. Gaps are fine — the point is coming back, not perfection.</p>
      </section>

      <div className="page-grid">
        <div className="col-main">
          <section className="panel" aria-labelledby="lang-head">
            <div className="panel-head">
              <h2 id="lang-head">By language</h2>
            </div>
            <ul className="lang-stats">
              {languages.map((l) => {
                const s = langState(progress, l.id);
                const lv = levelInfo(s.xp);
                return (
                  <li key={l.id} className={l.id === language.id ? 'on' : ''}>
                    <span className="lang-chip" lang={l.htmlLang}>
                      {l.chip}
                    </span>
                    <span className="lang-stat-body">
                      <b>
                        {l.name} · {t('stats.level')} {lv.level}
                      </b>
                      <small>
                        {s.xp} XP · {Object.keys(s.phrases).length} {t('stats.phrases')} · {s.sessions}{' '}
                        {t('stats.sessions')}
                      </small>
                      <span className="meter slim">
                        <span style={{ width: `${lv.pct}%` }} />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel" aria-labelledby="box-head">
            <div className="panel-head">
              <h2 id="box-head">
                {language.name} memory boxes <span className="count">{phrases.length}</span>
              </h2>
            </div>
            {phrases.length === 0 ? (
              <p className="muted small-text">Nothing saved yet in {language.name}.</p>
            ) : (
              <ul className="box-chart">
                {boxes.map((b, i) => (
                  <li key={b.label}>
                    <span className="box-label">{b.label}</span>
                    <span className="box-track">
                      <span
                        className={`box-fill box-${i}`}
                        style={{ width: `${Math.round((b.count / maxBox) * 100)}%` }}
                      />
                    </span>
                    <span className="box-count">{b.count}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="note">
              A phrase moves one box to the right each time you remember it, and back to New when you
              forget it. Further right means longer until you see it again.
            </p>
          </section>
        </div>

        <div className="col-side">
          <section className="panel" aria-labelledby="drill-head">
            <div className="panel-head">
              <h2 id="drill-head">Practice in {language.name}</h2>
            </div>
            <ul className="counter-list">
              <li>
                <Star width={17} height={17} />
                <span>Sentences built</span>
                <b>{state.counters?.build ?? 0}</b>
              </li>
              <li>
                <Pencil width={17} height={17} />
                <span>Phrases written</span>
                <b>{state.counters?.write ?? 0}</b>
              </li>
              <li>
                <Mic width={17} height={17} />
                <span>Said out loud</span>
                <b>{state.counters?.say ?? 0}</b>
              </li>
            </ul>
          </section>

          <section className="panel" aria-labelledby="badge-head">
            <div className="panel-head">
              <h2 id="badge-head">
                <Trophy width={18} height={18} /> Badges
              </h2>
              <span className="count">
                {earned.length}/{achievements.length}
              </span>
            </div>
            <ul className="ach-grid">
              {achievements.map((a) => (
                <li key={a.id} className={`ach ${a.earnedAt ? 'on' : 'off'}`}>
                  <span className="ach-icon">
                    {a.earnedAt ? <Trophy width={18} height={18} /> : <Lock width={16} height={16} />}
                  </span>
                  <span>
                    <b>{a.label}</b>
                    <small>{a.blurb}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

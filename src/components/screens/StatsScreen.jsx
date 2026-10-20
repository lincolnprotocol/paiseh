import { languages } from '../../data/languages.js';
import {
  activeDays,
  allPhrases,
  earnedAchievements,
  historySeries,
  langState,
} from '../../lib/storage.js';
import Sparkline from '../Sparkline.jsx';
import { Book, Chat, Mic, Pencil, Sparkles } from '../Icons.jsx';

const BOX_LABELS = ['New', '1 day', '3 days', '1 week', '2 weeks', '1 month'];

// Progress is evidence of language use — conversations, phrases retained, writing and speaking —
// rather than a league table. The internal point history is retained for storage compatibility but
// rendered only as an unlabeled activity rhythm.
export default function StatsScreen({ progress, language }) {
  const state = langState(progress, language.id);
  const phrases = allPhrases(progress, language.id);
  const series = historySeries(progress, 30);
  const milestones = earnedAchievements(progress).filter((item) => item.earnedAt);

  const boxes = BOX_LABELS.map((label, index) => ({
    label,
    count: phrases.filter((phrase) => (phrase.box ?? 0) === index).length,
  }));
  const maxBox = Math.max(1, ...boxes.map((box) => box.count));

  return (
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">PRIVATE TO YOU</span>
        <h1 className="page-title">The language you have actually used</h1>
        <p className="page-sub">
          No leaderboard and nobody watching. This is simply a record of conversations attempted,
          phrases retained, and the days you came back.
        </p>
      </header>

      <div className="stat-grid evidence-grid">
        <div className="stat-box">
          <Chat />
          <b>{state.sessions}</b>
          <span>conversations attempted</span>
        </div>
        <div className="stat-box">
          <Book />
          <b>{phrases.length}</b>
          <span>phrases kept</span>
        </div>
        <div className="stat-box">
          <Pencil />
          <b>{state.counters?.write ?? 0}</b>
          <span>phrases written</span>
        </div>
        <div className="stat-box">
          <Mic />
          <b>{state.counters?.say ?? 0}</b>
          <span>said out loud</span>
        </div>
      </div>

      <section className="panel activity-panel" aria-labelledby="chart-head">
        <div className="panel-head">
          <h2 id="chart-head">Your last 30 days</h2>
          <span className="muted small-text">{activeDays(progress, 30)} active days</span>
        </div>
        <Sparkline series={series} label="Practice activity over the last 30 days" />
        <p className="note">Each bar is a day you used the app. Gaps are part of a real life, not a failure.</p>
      </section>

      <div className="page-grid">
        <div className="col-main">
          <section className="panel" aria-labelledby="lang-head">
            <div className="panel-head">
              <h2 id="lang-head">Your languages</h2>
            </div>
            <ul className="lang-stats plain">
              {languages.map((item) => {
                const itemState = langState(progress, item.id);
                return (
                  <li key={item.id} className={item.id === language.id ? 'on' : ''}>
                    <span className="lang-chip" lang={item.htmlLang}>
                      {item.chip}
                    </span>
                    <span className="lang-stat-body">
                      <b>{item.name}</b>
                      <small>
                        {itemState.sessions} {itemState.sessions === 1 ? 'conversation' : 'conversations'} ·{' '}
                        {Object.keys(itemState.phrases).length} phrases kept ·{' '}
                        {Object.keys(itemState.lessons ?? {}).length} moments ready
                      </small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel" aria-labelledby="box-head">
            <div className="panel-head">
              <h2 id="box-head">
                How firmly your {language.name} phrases have stuck <span className="count">{phrases.length}</span>
              </h2>
            </div>
            {phrases.length === 0 ? (
              <p className="muted small-text">Nothing saved yet in {language.name}.</p>
            ) : (
              <ul className="box-chart">
                {boxes.map((box, index) => (
                  <li key={box.label}>
                    <span className="box-label">{box.label}</span>
                    <span className="box-track">
                      <span
                        className={`box-fill box-${index}`}
                        style={{ width: `${Math.round((box.count / maxBox) * 100)}%` }}
                      />
                    </span>
                    <span className="box-count">{box.count}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="note">
              Remembering a phrase spaces its next appearance further out. Forgetting it simply brings it
              back sooner.
            </p>
          </section>
        </div>

        <div className="col-side">
          <section className="panel" aria-labelledby="practice-head">
            <div className="panel-head">
              <h2 id="practice-head">Ways you have practised</h2>
            </div>
            <ul className="counter-list">
              <li>
                <Sparkles width={17} height={17} />
                <span>Sentences assembled</span>
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

          <section className="panel" aria-labelledby="milestone-head">
            <div className="panel-head">
              <h2 id="milestone-head">
                <Sparkles width={18} height={18} /> Moments worth remembering
              </h2>
            </div>
            {milestones.length === 0 ? (
              <p className="muted small-text">
                Your first one appears after a real conversation. There is no locked list to chase.
              </p>
            ) : (
              <ul className="memory-list">
                {milestones.map((item) => (
                  <li key={item.id}>
                    <Sparkles width={16} height={16} />
                    <span>
                      <b>{item.label}</b>
                      <small>{item.blurb}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

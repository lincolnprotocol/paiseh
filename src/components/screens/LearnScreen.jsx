import { scenariosFor } from '../../data/scenarios.js';
import { lessonPhrases } from '../../lib/lesson.js';
import { langState } from '../../lib/storage.js';
import { Check, Forward } from '../Icons.jsx';

export default function LearnScreen({ progress, language, t, onStart }) {
  const state = langState(progress, language.id);
  const scenarios = scenariosFor(language.id);
  const doneCount = scenarios.filter((s) => state.lessons?.[s.id]).length;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('home.pickMoment')}</h1>
          <p className="page-sub">
            Each one teaches you the phrases first, then lets you use them in a conversation where you
            build every reply yourself. {doneCount} of {scenarios.length} warmed up in {language.name}.
          </p>
        </div>
      </header>

      <ul className="scenario-grid">
        {scenarios.map((s) => {
          const phrases = lessonPhrases(s);
          const warmedUp = Boolean(state.lessons?.[s.id]);
          return (
            <li key={s.id}>
              <button className={`scenario-card large tone-${s.tone}`} onClick={() => onStart(s.id)}>
                <span className="glyph" lang={language.htmlLang} aria-hidden="true">
                  {s.glyph}
                </span>
                <span className="scenario-body">
                  <b>{s.title}</b>
                  <small>{s.blurb}</small>
                  <span className="scenario-tags">
                    <span className="pill-tag">
                      with {s.persona.name} · {s.persona.role}
                    </span>
                    <span className="pill-tag">
                      {phrases.length} phrases · {s.minutes} {t('label.minutes')}
                    </span>
                    <span className={`pill-tag ${warmedUp ? 'done' : ''}`}>
                      {warmedUp ? (
                        <>
                          <Check width={13} height={13} strokeWidth={3} /> {t('label.warmupDone')}
                        </>
                      ) : (
                        t('label.startsWarmup')
                      )}
                    </span>
                  </span>
                </span>
                <Forward className="scenario-go" />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="note">
        The warm-up only happens once per scenario. After that, tapping a card goes straight into the
        conversation.
      </p>
    </div>
  );
}

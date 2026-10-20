import { useMemo, useState } from 'react';
import { REGISTERS, slangFor, slangTags } from '../../data/slang.js';
import { speak } from '../../lib/speech.js';
import { Check, Sparkles, Speaker } from '../Icons.jsx';
import Phrase from '../Phrase.jsx';

// "Real talk": the textbook form next to the form people actually use.
//
// This is the half of the problem statement a chat scenario cannot reach on its own. A learner can
// pass their O-level MTL paper and still freeze when the auntie opens with "吃饱了没". Each entry
// also says who the phrase is safe with, because the fastest route back to feeling paiseh is using
// friend-slang on an elder.
export default function SlangScreen({ language, settings, savedTexts, onSave, t }) {
  const [tag, setTag] = useState('all');
  const [register, setRegister] = useState('all');
  const entries = slangFor(language.id);
  const tags = slangTags(language.id);

  const shown = useMemo(
    () =>
      entries.filter(
        (e) => (tag === 'all' || e.tags.includes(tag)) && (register === 'all' || e.register === register),
      ),
    [entries, tag, register],
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            <Sparkles width={22} height={22} /> {t('nav.slang')}
          </h1>
          <p className="page-sub">
            What the textbook taught you, and what people in Singapore actually say. Every entry also
            tells you who it is safe to say it to.
          </p>
        </div>
      </header>

      <div className="filters">
        <div className="pills" role="group" aria-label="Filter by topic">
          <button className={`pill ${tag === 'all' ? 'on' : ''}`} onClick={() => setTag('all')}>
            All topics
          </button>
          {tags.map((tg) => (
            <button key={tg} className={`pill ${tag === tg ? 'on' : ''}`} onClick={() => setTag(tg)}>
              {tg}
            </button>
          ))}
        </div>
        <div className="pills" role="group" aria-label="Filter by who you can say it to">
          <button
            className={`pill ${register === 'all' ? 'on' : ''}`}
            onClick={() => setRegister('all')}
          >
            Anyone
          </button>
          {Object.entries(REGISTERS).map(([id, r]) => (
            <button
              key={id}
              className={`pill ${register === id ? 'on' : ''}`}
              onClick={() => setRegister(id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="note">Nothing matches those filters. Try widening them.</p>
      ) : (
        <ul className="slang-grid">
          {shown.map((e) => {
            const saved = savedTexts.has(e.real.text);
            return (
              <li key={e.id} className={`slang-card tone-${REGISTERS[e.register]?.tone ?? 'teal'}`}>
                <div className="slang-head">
                  <span className="pill-tag">{REGISTERS[e.register]?.label}</span>
                  <button
                    className="icon-btn small"
                    aria-label={`Hear ${e.real.text}`}
                    onClick={() => speak(e.real.text, { lang: language.id, slow: settings.slow })}
                  >
                    <Speaker />
                  </button>
                </div>

                <div className="slang-real">
                  <small>People say</small>
                  <Phrase phrase={e.real} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
                </div>

                <div className="slang-book">
                  <small>Textbook</small>
                  <Phrase phrase={e.textbook} lang={language.htmlLang} showRoman={settings.roman} />
                </div>

                <p className="slang-note">{e.note}</p>

                <div className="slang-foot">
                  <span className="slang-tags">
                    {e.tags.map((tg) => (
                      <span key={tg} className="mini-tag">
                        {tg}
                      </span>
                    ))}
                  </span>
                  <button
                    className={`share ${saved ? 'is-saved' : ''}`}
                    disabled={saved}
                    onClick={() => onSave(e.real)}
                  >
                    {saved ? (
                      <>
                        <Check width={15} height={15} strokeWidth={3} /> In phrasebook
                      </>
                    ) : (
                      'Save for review'
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="note">
        These are starting points, not rules. Register varies by family and by neighbourhood — if an
        elder says it to you, it is safe to say back.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { speak } from '../lib/speech.js';
import { Book, Check, Flame, Share, Speaker, Star } from './Icons.jsx';
import Phrase from './Phrase.jsx';
import SayIt from './SayIt.jsx';

export default function Summary({
  language,
  scenario,
  result,
  settings,
  onAgain,
  onReview,
  onHome,
  onReport,
  onDrill,
}) {
  const { xpGained, learned, streak } = result;
  const [note, setNote] = useState('');

  async function share(p) {
    const roman = p.roman ? ` (${p.roman})` : '';
    const message = `I learnt this in ${language.name} today: ${p.text}${roman}\n${p.english}\n- BiLingos`;
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        return;
      }
      await navigator.clipboard.writeText(message);
      setNote('Copied. Paste it to your family chat.');
    } catch (err) {
      if (err?.name !== 'AbortError') setNote('Could not share from this browser.');
    }
  }

  return (
    <div className="immersive">
      <div className="immersive-body">
        <div className="immersive-inner summary">
          <div className="badge" aria-hidden="true">
            <Check width={36} height={36} strokeWidth={3} />
          </div>
          <h1>Shiok! Session done.</h1>
          <p className="lede">{scenario.doneLine}</p>

          <div className="stat-grid three">
            <div className="stat-box">
              <Star className="ico-star" />
              <b>+{xpGained}</b>
              <span>XP</span>
            </div>
            <div className="stat-box">
              <Flame className="ico-flame" />
              <b>{streak}</b>
              <span>day streak</span>
            </div>
            <div className="stat-box">
              <b>{learned.length}</b>
              <span>phrases</span>
            </div>
          </div>

          {scenario.tip && (
            <aside className="tip">
              <b>Good to know</b>
              <p lang="en">{scenario.tip}</p>
            </aside>
          )}

          <h2 className="section-title">Real-life phrases you just learned</h2>
          <ul className="learned">
            {learned.map((p) => (
              <li key={p.text}>
                <Phrase phrase={p} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
                <span className="actions">
                  <button
                    className="icon-btn"
                    aria-label={`Hear ${p.text}`}
                    onClick={() => speak(p.text, { lang: language.id, slow: settings.slow })}
                  >
                    <Speaker />
                  </button>
                  <SayIt
                    phrase={p}
                    language={language}
                    onScore={(score) => score >= 0.85 && onDrill?.('say')}
                  />
                  <button className="share" onClick={() => share(p)}>
                    <Share width={16} height={16} /> Send to {language.grandma}
                  </button>
                  <button
                    className="link-btn tiny"
                    onClick={() => onReport(p.text)}
                    title="Tell us if this line sounds unnatural"
                  >
                    Sounds off?
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="note" role="status">
            {note}
          </p>

          <div className="cta">
            <button className="primary wide" onClick={onReview}>
              <Book width={18} height={18} /> Review these phrases
            </button>
            <button className="ghost wide" onClick={onAgain}>
              Practise again
            </button>
            <button className="ghost wide" onClick={onHome}>
              Pick another moment
            </button>
          </div>

          <p className="note">
            Spotted a line that a native speaker would never say? Tap “Sounds off?” — corrections go
            straight to the team.
          </p>
        </div>
      </div>
    </div>
  );
}

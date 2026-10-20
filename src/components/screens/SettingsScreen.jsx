import { useEffect, useState } from 'react';
import { languages } from '../../data/languages.js';
import { scenariosFor } from '../../data/scenarios.js';
import { UI_LANGUAGES } from '../../lib/i18n.js';
import { FONT_SCALES, THEMES } from '../../lib/layout.js';
import { lessonPhrases } from '../../lib/lesson.js';
import { auditPhrases, hasSegmenter } from '../../lib/tiles.js';
import { availableVoices, onVoicesChanged, selectedVoiceLabel, speak, stopSpeaking } from '../../lib/speech.js';
import { VOICE_PREVIEWS, VOICE_STYLES } from '../../lib/voice.js';
import LayoutPicker from '../layout/LayoutPicker.jsx';
import { Check, Download, Globe, Moon, Sun, Trash, Upload } from '../Icons.jsx';

export default function SettingsScreen({
  language,
  settings,
  onSettings,
  resolvedLayout,
  t,
  onExport,
  onImport,
  onReset,
  onRoute,
}) {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [audit, setAudit] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function copyBackup() {
    const text = onExport();
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Backup copied. Paste it somewhere safe — a note to yourself works.');
      setError('');
    } catch {
      setError('Could not reach the clipboard. Select the text in the box below instead.');
      setImportText(text);
    }
  }

  function restore() {
    try {
      onImport(importText);
      setMessage('Progress restored.');
      setError('');
      setImportText('');
    } catch (err) {
      setError(err.message || 'That backup could not be read.');
      setMessage('');
    }
  }

  // The productised version of a one-off console check: does every phrase the learner will be asked
  // to build actually fit the tile budget in *this* browser? The answer depends on whether
  // Intl.Segmenter exists here, which no Node test can tell you.
  function runAudit() {
    const rows = [];
    for (const lang of languages) {
      for (const scenario of scenariosFor(lang.id)) {
        for (const row of auditPhrases(lang.id, lessonPhrases(scenario))) {
          if (!row.ok) rows.push({ ...row, lang: lang.id, scenario: scenario.id });
        }
      }
    }
    setAudit({ segmenter: hasSegmenter(), failures: rows, checked: true });
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-sub">Make the app fit your screen, your eyes and how you like to learn.</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="layout-head">
        <div className="panel-head">
          <h2 id="layout-head">{t('settings.layout')}</h2>
        </div>
        <p className="muted small-text">
          BiLingos is built mobile-first, but it should not force a phone shape onto a laptop. Pick
          whichever fits what you are using right now.
        </p>
        <LayoutPicker
          value={settings.layout}
          resolved={resolvedLayout}
          onChange={(layout) => onSettings({ layout })}
        />
      </section>

      <section className="panel" aria-labelledby="look-head">
        <div className="panel-head">
          <h2 id="look-head">{t('settings.appearance')}</h2>
        </div>

        <div className="setting-row">
          <span className="setting-label">
            <b>Theme</b>
            <small>Dark mode is easier at night, and on a hall projector</small>
          </span>
          <div className="seg">
            {THEMES.map((th) => (
              <button
                key={th.id}
                className={`seg-btn ${settings.theme === th.id ? 'on' : ''}`}
                aria-pressed={settings.theme === th.id}
                onClick={() => onSettings({ theme: th.id })}
              >
                {th.id === 'light' ? <Sun width={16} height={16} /> : null}
                {th.id === 'dark' ? <Moon width={16} height={16} /> : null}
                {th.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-label">
            <b>Text size</b>
            <small>Tamil and Chinese script benefit from a bigger size</small>
          </span>
          <div className="seg">
            {FONT_SCALES.map((f) => (
              <button
                key={f.id}
                className={`seg-btn ${settings.fontScale === f.id ? 'on' : ''}`}
                aria-pressed={settings.fontScale === f.id}
                onClick={() => onSettings({ fontScale: f.id })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-label">
            <b>
              <Globe width={16} height={16} /> Interface language
            </b>
            <small>The menus and buttons, not the lessons</small>
          </span>
          <div className="seg">
            {UI_LANGUAGES.map((l) => (
              <button
                key={l.id}
                className={`seg-btn ${settings.uiLang === l.id ? 'on' : ''}`}
                aria-pressed={settings.uiLang === l.id}
                onClick={() => onSettings({ uiLang: l.id })}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <VoiceSettings language={language} settings={settings} onSettings={onSettings} />

      <section className="panel" aria-labelledby="learn-head">
        <div className="panel-head">
          <h2 id="learn-head">{t('settings.learning')}</h2>
        </div>
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
        <label className="toggle">
          <span>
            <b>Play audio automatically</b>
            <small>Turn this off in a quiet lecture theatre</small>
          </span>
          <input
            type="checkbox"
            checked={settings.autoplay}
            onChange={(e) => onSettings({ autoplay: e.target.checked })}
          />
        </label>
      </section>

      <section className="panel" aria-labelledby="data-head">
        <div className="panel-head">
          <h2 id="data-head">{t('settings.data')}</h2>
        </div>
        <p className="muted small-text">
          Progress lives in this browser's storage. There are no accounts, which also means clearing
          your browser data clears your streak. A backup is a long line of text you can paste back in
          on another device.
        </p>
        <div className="button-row">
          <button className="ghost small" onClick={copyBackup}>
            <Download width={16} height={16} /> Copy backup
          </button>
          <button className="ghost small" onClick={() => onRoute('feedback')}>
            Send feedback
          </button>
        </div>

        <label className="label">
          Paste a backup to restore it
          <textarea
            className="field"
            rows={3}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"app":"bilingos",...}'
            spellCheck="false"
          />
        </label>
        <div className="button-row">
          <button className="ghost small" disabled={!importText.trim()} onClick={restore}>
            <Upload width={16} height={16} /> Restore
          </button>
          {confirmReset ? (
            <>
              <button
                className="ghost small danger"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                  setMessage('Everything cleared.');
                }}
              >
                Yes, erase everything
              </button>
              <button className="ghost small" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="ghost small danger" onClick={() => setConfirmReset(true)}>
              <Trash width={16} height={16} /> Reset progress
            </button>
          )}
        </div>

        {message && (
          <p className="feedback good" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="panel" aria-labelledby="check-head">
        <div className="panel-head">
          <h2 id="check-head">Device check</h2>
        </div>
        <p className="muted small-text">
          Confirms every phrase can be built from word tiles in <b>this</b> browser. Chinese word
          splitting depends on a browser feature that is missing in some browsers, so this is worth
          running on any machine you are about to present on.
        </p>
        <div className="button-row">
          <button className="ghost small" onClick={runAudit}>
            Run the check
          </button>
        </div>
        {audit && (
          <div className={`feedback ${audit.failures.length === 0 ? 'good' : 'low'}`} role="status">
            <b>
              {audit.failures.length === 0 ? (
                <>
                  <Check width={16} height={16} strokeWidth={3} /> All phrases build correctly here.
                </>
              ) : (
                `${audit.failures.length} phrase(s) outside the tile budget here.`
              )}
            </b>
            <br />
            Chinese word segmenter: {audit.segmenter ? 'available' : 'missing, using the fallback'}.
            {audit.failures.length > 0 && (
              <ul className="audit-list">
                {audit.failures.slice(0, 8).map((f) => (
                  <li key={`${f.lang}-${f.text}`}>
                    <b>{f.lang}</b> / {f.scenario}: “{f.text}” → {f.answerTiles} tiles
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


function VoiceSettings({ language, settings, onSettings }) {
  const [voices, setVoices] = useState(() => availableVoices(language.id));
  const override = settings.voiceOverrides?.[language.id] ?? '';

  useEffect(() => {
    const refresh = () => setVoices(availableVoices(language.id));
    refresh();
    const off = onVoicesChanged(refresh);
    return () => {
      off();
      stopSpeaking();
    };
  }, [language.id]);

  const selected = selectedVoiceLabel(language.id, override);
  const setOverride = (name) =>
    onSettings({ voiceOverrides: { ...(settings.voiceOverrides ?? {}), [language.id]: name } });

  return (
    <section className="panel" aria-labelledby="voice-head">
      <div className="panel-head">
        <h2 id="voice-head">Voice and conversation</h2>
      </div>
      <p className="muted small-text">
        Dialogue has a different rhythm for a friend, grandparent, stall owner and colleague. Teaching
        audio stays steady and clear. BiLingos prefers a Singapore voice when this device provides one.
      </p>

      <div className="setting-row">
        <span className="setting-label">
          <b>Voice style</b>
          <small>Changes pace and expression without changing the words</small>
        </span>
        <div className="seg">
          {VOICE_STYLES.map((style) => (
            <button
              key={style.id}
              className={`seg-btn ${settings.voiceStyle === style.id ? 'on' : ''}`}
              aria-pressed={settings.voiceStyle === style.id}
              title={style.blurb}
              onClick={() => onSettings({ voiceStyle: style.id })}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row voice-row">
        <span className="setting-label">
          <b>{language.name} device voice</b>
          <small>
            {language.polly
              ? 'AWS Polly neural is primary; this is the offline fallback'
              : selected
                ? `Using ${selected}`
                : `No ${language.name} voice has loaded on this device`}
          </small>
        </span>
        <select
          className="field voice-select"
          value={override}
          onChange={(event) => setOverride(event.target.value)}
          aria-label={`${language.name} device voice`}
        >
          <option value="">Automatic — best match</option>
          {voices.map((voice) => (
            <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
              {voice.name} · {voice.lang.replace('_', '-')}
              {voice.localService ? ' · on device' : ''}
            </option>
          ))}
        </select>
      </div>

      <label className="toggle">
        <span>
          <b>Natural conversation timing</b>
          <small>Short human pause before a reply instead of instant robot timing</small>
        </span>
        <input
          type="checkbox"
          checked={settings.naturalPacing}
          onChange={(event) => onSettings({ naturalPacing: event.target.checked })}
        />
      </label>

      <div className="button-row">
        <button
          className="ghost small"
          onClick={() =>
            speak(VOICE_PREVIEWS[language.id], {
              lang: language.id,
              profile: 'friend',
              style: settings.voiceStyle,
              voiceName: override,
            })
          }
        >
          Preview a casual Singapore line
        </button>
      </div>
      <p className="note">
        Voice quality still depends on this device. Chrome and Edge usually expose the best system voices;
        installing a high-quality {language.name} voice in the operating system makes the biggest difference.
      </p>
    </section>
  );
}

import { useState } from 'react';
import { languages } from '../../data/languages.js';
import { scenariosFor } from '../../data/scenarios.js';
import { UI_LANGUAGES } from '../../lib/i18n.js';
import { FONT_SCALES, THEMES } from '../../lib/layout.js';
import { lessonPhrases } from '../../lib/lesson.js';
import { auditPhrases, hasSegmenter } from '../../lib/tiles.js';
import LayoutPicker from '../layout/LayoutPicker.jsx';
import { Check, Download, Globe, Moon, Sun, Trash, Upload } from '../Icons.jsx';

export default function SettingsScreen({
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

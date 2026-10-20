import { useEffect, useRef, useState } from 'react';
import { looksLikeTarget } from '../data/languages.js';
import { fetchTurn } from '../lib/api.js';
import { fallbackTurn } from '../lib/fallback.js';
import {
  canListen,
  listen,
  onVoicesChanged,
  onVoiceStatusChanged,
  speak,
  stopSpeaking,
  voiceAvailable,
} from '../lib/speech.js';
import { conversationDelay, profileForScenario } from '../lib/voice.js';
import Builder from './Builder.jsx';
import { Back, Book, Mic, Send, Speaker } from './Icons.jsx';
import Phrase from './Phrase.jsx';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Chat({ language, scenario, settings, layout, onExit, onFinish, onDrill }) {
  const { persona, script } = scenario;
  const totalReplies = script.length - 1; // the last scripted step is the closing line
  const opener = script[0];
  const voiceName = settings.voiceOverrides?.[language.id] ?? '';
  const personaProfile = profileForScenario(scenario.id);
  const personaSpeakOpts = {
    lang: language.id,
    slow: settings.slow,
    profile: personaProfile,
    style: settings.voiceStyle,
    voiceName,
  };
  const coachSpeakOpts = {
    lang: language.id,
    slow: settings.slow,
    profile: 'coach',
    style: settings.voiceStyle,
    voiceName,
  };
  const wide = layout === 'wide';

  const [messages, setMessages] = useState([{ id: 0, role: 'ai', ...opener.ai }]);
  const [suggestions, setSuggestions] = useState(opener.suggestions ?? []);
  const [learned, setLearned] = useState(opener.learned ?? []);
  const [replies, setReplies] = useState(0);
  const [targetReplies, setTargetReplies] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState('');
  const [voiceOk, setVoiceOk] = useState(() => voiceAvailable(language.id, voiceName));

  const nextId = useRef(1);
  const sending = useRef(false);
  const stopMic = useRef(null);
  const logEnd = useRef(null);
  const autoVoiceTimer = useRef(null);
  const mounted = useRef(true);

  const autoSpeak = (text) => {
    if (!settings.autoplay || !mounted.current) return;
    clearTimeout(autoVoiceTimer.current);
    // Let React paint the bubble before the character starts speaking. The tiny visual lead-in is
    // what makes this feel like a reply rather than a screen reader firing on a state update.
    autoVoiceTimer.current = setTimeout(() => speak(text, personaSpeakOpts), 110);
  };

  useEffect(() => {
    mounted.current = true;
    autoSpeak(opener.ai.text);
    const refreshVoice = () => setVoiceOk(voiceAvailable(language.id, voiceName));
    const off = onVoicesChanged(refreshVoice);
    const offStatus = onVoiceStatusChanged((changedLang) => changedLang === language.id && refreshVoice());
    return () => {
      mounted.current = false;
      off();
      offStatus();
      clearTimeout(autoVoiceTimer.current);
      stopSpeaking();
      stopMic.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, done]);

  async function send(raw, chip = null, assisted = false) {
    const value = raw.trim();
    if (!value || busy || done || sending.current) return;
    sending.current = true;
    stopSpeaking();
    stopMic.current?.();

    const turn = replies + 1;
    const final = turn >= totalReplies;
    const userMsg = chip
      ? { id: nextId.current++, role: 'user', ...chip }
      : { id: nextId.current++, role: 'user', text: value };

    const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setSuggestions([]);
    setText('');
    setMicNote('');
    setBusy(true);
    const requestedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    let data;
    try {
      data = await fetchTurn({
        languageId: language.id,
        scenarioId: scenario.id,
        history,
        final,
        slow: settings.slow,
      });
    } catch {
      data = fallbackTurn(language, scenario, turn, value, Boolean(chip));
    }

    if (settings.naturalPacing) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const pause = conversationDelay(data.ai.text, personaProfile, now - requestedAt);
      if (pause > 0) await wait(pause);
    }
    if (!mounted.current) return;

    const aiId = nextId.current++;
    setMessages((m) => [
      ...m.map((x) => (x.id === userMsg.id ? { ...x, nudge: data.nudge } : x)),
      { id: aiId, role: 'ai', ...data.ai },
    ]);
    setSuggestions(data.suggestions ?? []);
    setLearned((prev) => {
      const seen = new Set(prev.map((p) => p.text));
      return [...prev, ...(data.learned ?? []).filter((p) => !seen.has(p.text))];
    });
    setReplies(turn);
    if ((chip && !assisted) || (!chip && looksLikeTarget(language.id, value))) setTargetReplies((n) => n + 1);
    if (final) setDone(true);
    setBusy(false);
    sending.current = false;
    autoSpeak(data.ai.text);
  }

  function toggleMic() {
    if (listening) {
      stopMic.current?.();
      return;
    }
    stopSpeaking();
    setMicNote('');
    setListening(true);
    try {
      stopMic.current = listen({
        lang: language.id,
        onText: setText,
        onEnd: () => setListening(false),
        onError: (code) => {
          setListening(false);
          setMicNote(
            code === 'not-allowed' || code === 'service-not-allowed'
              ? 'Mic is blocked. You can type instead.'
              : code === 'no-speech'
                ? "Didn't catch that. Try again or type."
                : `Mic can't listen in ${language.name} here. You can type instead.`,
          );
        },
      });
    } catch {
      setListening(false);
      setMicNote('Mic is not working here. You can type instead.');
    }
  }

  const progressPct = Math.round((replies / totalReplies) * 100);

  const log = (
    <div className="log" role="log" aria-live="polite">
      {messages.map((m) =>
        m.role === 'ai' ? (
          <div key={m.id} className="row ai">
            <span className={`avatar sm tone-${scenario.tone}`} lang={language.htmlLang} aria-hidden="true">
              {persona.initial}
            </span>
            <div className="bubble">
              <Phrase phrase={m} lang={language.htmlLang} showRoman={settings.roman} size="lg" />
              <button className="icon-btn small" aria-label="Hear this again" onClick={() => speak(m.text, personaSpeakOpts)}>
                <Speaker />
              </button>
            </div>
          </div>
        ) : (
          <div key={m.id} className="row user">
            <div className="bubble">
              {m.roman || m.english ? (
                <Phrase phrase={m} lang={language.htmlLang} showRoman={settings.roman} />
              ) : (
                <span className="plain">{m.text}</span>
              )}
            </div>
            {m.nudge && (
              <div className="nudge">
                <span className="nudge-label">People usually say it like this</span>
                <div className="nudge-body">
                  <Phrase phrase={m.nudge} lang={language.htmlLang} showRoman={settings.roman} />
                  <button
                    className="icon-btn small"
                    aria-label="Hear the natural version"
                    onClick={() => speak(m.nudge.text, coachSpeakOpts)}
                  >
                    <Speaker />
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      )}
      {busy && (
        <div className="row ai">
          <span className={`avatar sm tone-${scenario.tone}`} lang={language.htmlLang} aria-hidden="true">
            {persona.initial}
          </span>
          <div className="bubble typing" aria-label={`${persona.name} is typing`}>
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      <div ref={logEnd} />
    </div>
  );

  const composer = (
    <div className="composer">
      {done ? (
        <button
          className="primary wide"
          onClick={() => onFinish({ scenarioId: scenario.id, replies, targetReplies, learned })}
        >
          See what you learned
        </button>
      ) : (
        <>
          {suggestions.length > 0 && !busy && (
            <Builder
              key={replies}
              language={language}
              options={suggestions}
              onBuilt={() => onDrill?.('build')}
              onSend={(phrase, assisted) => send(phrase.text, phrase, assisted)}
            />
          )}
          {micNote && <p className="mic-note">{micNote}</p>}
          {suggestions.length > 0 && !busy && <p className="or-type">Or type or say your own reply</p>}
          <form
            className="input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            {canListen && (
              <button
                type="button"
                className={`icon-btn round ${listening ? 'live' : ''}`}
                onClick={toggleMic}
                disabled={busy}
                aria-pressed={listening}
                aria-label={listening ? 'Stop listening' : `Speak in ${language.name}`}
              >
                <Mic />
              </button>
            )}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={listening ? 'Listening…' : `Reply in English or ${language.name}`}
              maxLength={120}
              disabled={busy}
              enterKeyHint="send"
              autoComplete="off"
              aria-label="Your reply"
            />
            <button className="send" disabled={busy || !text.trim()} aria-label="Send">
              <Send />
            </button>
          </form>
        </>
      )}
    </div>
  );

  return (
    <div className="immersive">
      <header className="immersive-head chat-head">
        <button className="icon-btn" onClick={onExit} aria-label="Back to home">
          <Back />
        </button>
        <span className={`avatar tone-${scenario.tone}`} lang={language.htmlLang} aria-hidden="true">
          {persona.initial}
        </span>
        <div className="who">
          <b>{persona.name}</b>
          <small>{persona.role}</small>
        </div>
        <div
          className="meter"
          role="progressbar"
          aria-label="Conversation progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
        >
          <span style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      {voiceOk === false && (
        <p className="voice-note" role="status">
          This device has no {language.name} voice installed, so you will not hear audio. You can still
          read and reply. Chrome or Edge on a phone usually has one.
        </p>
      )}

      {/* On a big screen the conversation and the composer sit side by side, with a running list of
          what the learner has picked up. On small screens it is the familiar single column. */}
      <div className={`chat-shell ${wide ? 'split' : ''}`}>
        <div className="chat-main">
          <div className="chat-scroll">{log}</div>
          {!wide && composer}
        </div>

        {wide && (
          <aside className="chat-side">
            <div className="chat-side-scroll">
              <section className="panel">
                <div className="panel-head">
                  <h2>
                    <Book width={17} height={17} /> Picked up so far
                  </h2>
                  <span className="count">{learned.length}</span>
                </div>
                {learned.length === 0 ? (
                  <p className="muted small-text">New words appear here as the conversation goes on.</p>
                ) : (
                  <ul className="book">
                    {learned.map((p) => (
                      <li key={p.text}>
                        <Phrase phrase={p} lang={language.htmlLang} showRoman={settings.roman} />
                        <button
                          className="icon-btn small"
                          aria-label={`Hear ${p.text}`}
                          onClick={() => speak(p.text, coachSpeakOpts)}
                        >
                          <Speaker />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="panel">
                <div className="panel-head">
                  <h2>Where you are</h2>
                </div>
                <p className="muted small-text">{scenario.setting}</p>
              </section>
            </div>
            {composer}
          </aside>
        )}
      </div>
    </div>
  );
}

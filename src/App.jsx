import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLanguage } from './data/languages.js';
import { getScenario } from './data/scenarios.js';
import { postFeedback } from './lib/api.js';
import { translator, uiHtmlLang } from './lib/i18n.js';
import { stopSpeaking, unlockAudio } from './lib/speech.js';
import {
  allPhrases,
  claimMission,
  completeLesson,
  currentStreak,
  duePhrases,
  exportProgress,
  gradePhrase,
  importProgress,
  leeches,
  lessonDone,
  loadProgress,
  queueFeedback,
  recordDrill,
  recordReview,
  recordSession,
  resetProgress,
  savePhrase,
  saveProgress,
  totalXp,
} from './lib/storage.js';
import { useAppearance, useLayout } from './lib/useViewport.js';
import AppShell from './components/layout/AppShell.jsx';
import Chat from './components/Chat.jsx';
import Lesson from './components/Lesson.jsx';
import Summary from './components/Summary.jsx';
import FeedbackScreen from './components/screens/FeedbackScreen.jsx';
import HomeScreen from './components/screens/HomeScreen.jsx';
import LearnScreen from './components/screens/LearnScreen.jsx';
import ReviewScreen from './components/screens/ReviewScreen.jsx';
import SettingsScreen from './components/screens/SettingsScreen.jsx';
import SlangScreen from './components/screens/SlangScreen.jsx';
import StatsScreen from './components/screens/StatsScreen.jsx';

const TABS = ['home', 'learn', 'review', 'slang', 'stats'];

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [route, setRoute] = useState('home');
  const [flow, setFlow] = useState(null); // { name: 'lesson' | 'chat' | 'summary', ... }
  const [feedback, setFeedback] = useState(null); // { type, phrase }
  const [runId, setRunId] = useState(0);
  const [live, setLive] = useState(false);

  const { settings } = progress;
  const language = getLanguage(settings.lang);
  const t = useMemo(() => translator(settings.uiLang), [settings.uiLang]);
  const { layout } = useLayout(settings.layout);

  useAppearance({
    theme: settings.theme,
    fontScale: settings.fontScale,
    htmlLang: uiHtmlLang(settings.uiLang),
  });

  useEffect(() => saveProgress(progress), [progress]);

  // Is Bedrock answering, or are we on scripted demo replies?
  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => setLive(Boolean(h?.bedrock)))
      .catch(() => setLive(false));
  }, []);

  // Retry any feedback that could not be sent last time.
  useEffect(() => {
    if (progress.outbox.length === 0) return undefined;
    let cancelled = false;
    (async () => {
      const sent = new Set();
      for (const entry of progress.outbox) {
        try {
          await postFeedback(entry);
          sent.add(entry.at);
        } catch {
          break;
        }
      }
      if (sent.size > 0 && !cancelled) {
        setProgress((p) => ({ ...p, outbox: p.outbox.filter((e) => !sent.has(e.at)) }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSettings = useCallback(
    (patch) => setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } })),
    [],
  );

  // Alt + 1-5 jumps between tabs. Cheap, and genuinely useful once the app is on a laptop.
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > TABS.length) return;
      e.preventDefault();
      setFlow(null);
      setFeedback(null);
      setRoute(TABS[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------------------------------------------------------------- actions */

  const goHome = () => {
    stopSpeaking();
    setFlow(null);
    setFeedback(null);
    setRoute('home');
  };

  const navigate = (next) => {
    stopSpeaking();
    setFlow(null);
    if (next === 'feedback') {
      setFeedback({ type: 'feature', phrase: '' });
      return;
    }
    setFeedback(null);
    setRoute(next);
  };

  const startChat = (scenarioId) => {
    unlockAudio(); // inside a tap, so iOS lets later replies play on their own
    setRunId((n) => n + 1);
    setFlow({ name: 'chat', scenarioId });
  };

  // A scenario always begins with its warm-up, until that warm-up has been done once.
  const start = (scenarioId) => {
    if (lessonDone(progress, language.id, scenarioId)) startChat(scenarioId);
    else {
      unlockAudio();
      setFlow({ name: 'lesson', scenarioId });
    }
  };

  const finishLesson = ({ phrases, skipped }) => {
    setProgress((p) => completeLesson(p, language.id, flow.scenarioId, phrases, skipped ? 5 : 15));
    startChat(flow.scenarioId);
  };

  const finishChat = ({ scenarioId, replies, targetReplies, learned }) => {
    const xpGained = replies * 10 + targetReplies * 5 + 20;
    setProgress((p) => {
      const next = recordSession(p, language.id, { xpGained, learned });
      setFlow({ name: 'summary', scenarioId, xpGained, learned, streak: currentStreak(next) });
      return next;
    });
  };

  const drill = useCallback(
    (kind) => setProgress((p) => recordDrill(p, p.settings.lang, kind)),
    [],
  );

  const reportPhrase = (phrase) => {
    stopSpeaking();
    setFlow(null);
    setFeedback({ type: 'correction', phrase });
  };

  /* ----------------------------------------------------------------- render */

  const streak = currentStreak(progress);
  const xp = totalXp(progress);
  const due = duePhrases(progress, language.id).length;
  const scenario = flow?.scenarioId ? getScenario(language.id, flow.scenarioId) : null;
  const immersive = Boolean(flow && scenario);

  let content;
  if (immersive && flow.name === 'lesson') {
    content = (
      <Lesson
        key={`lesson-${scenario.id}`}
        language={language}
        scenario={scenario}
        settings={settings}
        onExit={goHome}
        onDone={finishLesson}
        onDrill={drill}
      />
    );
  } else if (immersive && flow.name === 'chat') {
    content = (
      <Chat
        key={runId}
        language={language}
        scenario={scenario}
        settings={settings}
        layout={layout}
        onExit={goHome}
        onFinish={finishChat}
        onDrill={drill}
      />
    );
  } else if (immersive && flow.name === 'summary') {
    content = (
      <Summary
        language={language}
        scenario={scenario}
        result={flow}
        settings={settings}
        onAgain={() => startChat(scenario.id)}
        onReview={() => navigate('review')}
        onHome={goHome}
        onReport={reportPhrase}
        onDrill={drill}
      />
    );
  } else if (feedback) {
    content = (
      <FeedbackScreen
        initialType={feedback.type}
        initialPhrase={feedback.phrase}
        appLanguage={language.id}
        onBack={goHome}
        onQueue={(entry) => setProgress((p) => queueFeedback(p, entry))}
      />
    );
  } else if (route === 'learn') {
    content = <LearnScreen progress={progress} language={language} t={t} onStart={start} />;
  } else if (route === 'review') {
    content = (
      <ReviewScreen
        language={language}
        phrases={allPhrases(progress, language.id)}
        due={duePhrases(progress, language.id)}
        leeches={leeches(progress, language.id)}
        settings={settings}
        t={t}
        onGrade={(text, ok) => setProgress((p) => gradePhrase(p, language.id, text, ok))}
        onXp={({ xpGained, reviewed }) =>
          setProgress((p) => recordReview(p, language.id, { xpGained, reviewed }))
        }
        onDrill={drill}
        onRoute={navigate}
      />
    );
  } else if (route === 'slang') {
    content = (
      <SlangScreen
        language={language}
        settings={settings}
        savedTexts={new Set(allPhrases(progress, language.id).map((p) => p.text))}
        onSave={(phrase) => setProgress((p) => savePhrase(p, language.id, phrase))}
        t={t}
      />
    );
  } else if (route === 'stats') {
    content = <StatsScreen progress={progress} language={language} t={t} />;
  } else if (route === 'settings') {
    content = (
      <SettingsScreen
        settings={settings}
        onSettings={setSettings}
        resolvedLayout={layout}
        t={t}
        onExport={() => exportProgress(progress)}
        onImport={(text) => setProgress(importProgress(text))}
        onReset={() => setProgress(resetProgress())}
        onRoute={navigate}
      />
    );
  } else {
    content = (
      <HomeScreen
        progress={progress}
        language={language}
        streak={streak}
        live={live}
        t={t}
        onRoute={navigate}
        onStart={start}
        onClaim={(id) => setProgress((p) => claimMission(p, id))}
        onLanguage={(id) => setSettings({ lang: id })}
      />
    );
  }

  return (
    <AppShell
      layout={layout}
      layoutPreference={settings.layout}
      onLayout={(l) => setSettings({ layout: l })}
      route={feedback ? 'settings' : route}
      onRoute={navigate}
      language={language}
      onLanguage={(id) => setSettings({ lang: id })}
      streak={streak}
      xp={xp}
      due={due}
      immersive={immersive}
      t={t}
    >
      {content}
    </AppShell>
  );
}

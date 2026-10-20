import { useEffect, useState } from 'react';
import { getLanguage } from './data/languages.js';
import { getScenario } from './data/scenarios.js';
import { postFeedback } from './lib/api.js';
import { stopSpeaking, unlockAudio } from './lib/speech.js';
import {
  allPhrases,
  completeLesson,
  currentStreak,
  duePhrases,
  gradePhrase,
  lessonDone,
  loadProgress,
  queueFeedback,
  recordReview,
  recordSession,
  saveProgress,
} from './lib/storage.js';
import Chat from './components/Chat.jsx';
import Feedback from './components/Feedback.jsx';
import Home from './components/Home.jsx';
import Lesson from './components/Lesson.jsx';
import Review from './components/Review.jsx';
import Summary from './components/Summary.jsx';

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [view, setView] = useState({ name: 'home' });
  const [runId, setRunId] = useState(0);
  const [live, setLive] = useState(false);

  const language = getLanguage(progress.settings.lang);

  useEffect(() => saveProgress(progress), [progress]);

  // Tells the home screen whether Bedrock is answering or we are in scripted demo mode.
  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => setLive(Boolean(h?.bedrock)))
      .catch(() => setLive(false));
  }, []);

  // Feedback that could not be sent earlier is retried when the app opens.
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

  const setSettings = (patch) => setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  const startChat = (scenarioId) => {
    unlockAudio(); // inside a tap, so iOS lets later replies play on their own
    setRunId((n) => n + 1);
    setView({ name: 'chat', scenarioId });
  };

  // A new scenario starts with its warm-up. Once that is done, the chat opens straight away.
  const start = (scenarioId) => {
    if (lessonDone(progress, language.id, scenarioId)) startChat(scenarioId);
    else {
      unlockAudio();
      setView({ name: 'lesson', scenarioId });
    }
  };

  const finishLesson = ({ phrases, skipped }) => {
    const xp = skipped ? 5 : 15;
    setProgress((p) => completeLesson(p, language.id, view.scenarioId, phrases, xp));
    startChat(view.scenarioId);
  };

  const goHome = () => {
    stopSpeaking();
    setView({ name: 'home' });
  };

  const finish = ({ scenarioId, replies, targetReplies, learned }) => {
    const xpGained = replies * 10 + targetReplies * 5 + 20;
    const next = recordSession(progress, language.id, { xpGained, learned });
    setProgress(next);
    setView({ name: 'summary', scenarioId, xpGained, learned, streak: next.streak });
  };

  const scenario = view.scenarioId ? getScenario(language.id, view.scenarioId) : null;

  return (
    <div className="shell">
      {view.name === 'home' && (
        <Home
          progress={progress}
          language={language}
          streak={currentStreak(progress)}
          live={live}
          onStart={start}
          onSettings={setSettings}
          onLanguage={(id) => setSettings({ lang: id })}
          onReview={() => {
            unlockAudio();
            setView({ name: 'review' });
          }}
          onFeedback={(type) => setView({ name: 'feedback', type })}
        />
      )}
      {view.name === 'lesson' && scenario && (
        <Lesson
          key={`lesson-${scenario.id}`}
          language={language}
          scenario={scenario}
          settings={progress.settings}
          onExit={goHome}
          onDone={finishLesson}
        />
      )}
      {view.name === 'chat' && scenario && (
        <Chat
          key={runId}
          language={language}
          scenario={scenario}
          settings={progress.settings}
          onExit={goHome}
          onFinish={finish}
        />
      )}
      {view.name === 'summary' && scenario && (
        <Summary
          language={language}
          scenario={scenario}
          result={view}
          settings={progress.settings}
          onAgain={() => startChat(scenario.id)}
          onReview={() => setView({ name: 'review' })}
          onHome={goHome}
        />
      )}
      {view.name === 'review' && (
        <Review
          language={language}
          phrases={allPhrases(progress, language.id)}
          due={duePhrases(progress, language.id)}
          settings={progress.settings}
          onGrade={(text, ok) => setProgress((p) => gradePhrase(p, language.id, text, ok))}
          onXp={(xpGained) => setProgress((p) => recordReview(p, language.id, { xpGained }))}
          onExit={goHome}
        />
      )}
      {view.name === 'feedback' && (
        <Feedback
          initialType={view.type}
          appLanguage={language.id}
          onBack={goHome}
          onQueue={(entry) => setProgress((p) => queueFeedback(p, entry))}
        />
      )}
    </div>
  );
}

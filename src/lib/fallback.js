// Offline demo brain: replays the scripted conversation when the AI server is unreachable.
// `turn` is the number of replies the learner has sent so far (1-based).

import { looksLikeTarget } from '../data/languages.js';

export function fallbackTurn(language, scenario, turn, userText, viaChip) {
  const last = scenario.script.length - 1;
  const step = scenario.script[Math.min(turn, last)];
  const previous = scenario.script[Math.min(turn - 1, last)];

  // Only nudge when the learner typed something that is not in the language being learnt.
  const needsNudge = !viaChip && !looksLikeTarget(language.id, userText);
  const nudge = needsNudge ? previous.suggestions?.[0] ?? null : null;

  return {
    ai: step.ai,
    nudge,
    suggestions: step.suggestions ?? [],
    learned: step.learned ?? [],
  };
}

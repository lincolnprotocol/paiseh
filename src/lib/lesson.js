// What a scenario's warm-up teaches: every phrase the learner will be asked to say, in the order
// the conversation will need them.

// The phrases the learner has to produce. These are the ones the warm-up drills, because these are
// the ones the chat will ask for.
export function lessonPhrases(scenario) {
  const seen = new Set();
  const out = [];
  for (const step of scenario.script) {
    for (const p of step.suggestions ?? []) {
      if (!seen.has(p.text)) {
        seen.add(p.text);
        out.push(p);
      }
    }
  }
  return out;
}

// Everything the scenario exposes, including the vocabulary notes attached to each turn. Used for
// the scenario preview and for saving to the phrasebook.
export function scenarioPhrases(scenario) {
  const seen = new Set();
  const out = [];
  for (const step of scenario.script) {
    for (const p of [...(step.suggestions ?? []), ...(step.learned ?? [])]) {
      if (!seen.has(p.text)) {
        seen.add(p.text);
        out.push(p);
      }
    }
  }
  return out;
}

// Small rounds are easier to remember: learn 4, practise those 4, then the next 4.
// A trailing round of one is folded back, because a round with a single card feels broken.
export function toRounds(phrases, size = 4) {
  const rounds = [];
  for (let i = 0; i < phrases.length; i += size) rounds.push(phrases.slice(i, i + size));
  if (rounds.length > 1 && rounds.at(-1).length === 1) {
    const [last] = rounds.pop();
    rounds.at(-1).push(last);
  }
  return rounds;
}

export const estimatedMinutes = (phrases) => Math.max(2, Math.round(phrases.length / 3));

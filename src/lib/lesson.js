// What a scenario's warm-up teaches: every phrase the learner will be asked to say, in conversation order.

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

// Small rounds are easier to remember: learn 4, practise 4, then the next 4.
export function toRounds(phrases, size = 4) {
  const rounds = [];
  for (let i = 0; i < phrases.length; i += size) rounds.push(phrases.slice(i, i + size));
  if (rounds.length > 1 && rounds.at(-1).length === 1) {
    const [last] = rounds.pop();
    rounds.at(-1).push(last);
  }
  return rounds;
}

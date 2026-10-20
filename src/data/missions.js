// Three small missions a day. The point is a reason to open the app for five minutes, not a grind:
// every mission is reachable inside one short session, and nothing is lost by skipping a day.

export const MISSION_POOL = [
  { id: 'warmup', target: 1, xp: 15, label: 'Finish a warm-up', blurb: 'Learn the phrases for any scenario' },
  { id: 'chat', target: 1, xp: 20, label: 'Finish a conversation', blurb: 'Any scenario, any language' },
  { id: 'build', target: 5, xp: 15, label: 'Build 5 sentences', blurb: 'Tap the word tiles in the right order' },
  { id: 'write', target: 3, xp: 15, label: 'Write 3 phrases', blurb: 'Type them out, script and all' },
  { id: 'say', target: 3, xp: 15, label: 'Say 3 phrases out loud', blurb: 'Nobody is listening but your phone' },
  { id: 'review', target: 8, xp: 15, label: 'Review 8 phrases', blurb: 'Flashcards or quiz, your pick' },
];

// Stable per-day shuffle: the same date always produces the same three missions, so they do not
// reshuffle every time the app reloads.
function seedFrom(dayKey) {
  let hash = 2166136261;
  for (let i = 0; i < dayKey.length; i += 1) {
    hash ^= dayKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function missionsForDay(dayKey, count = 3) {
  const seed = seedFrom(dayKey);
  const pool = [...MISSION_POOL];
  const picked = [];
  let n = seed;
  while (picked.length < Math.min(count, MISSION_POOL.length)) {
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
    picked.push(pool.splice(n % pool.length, 1)[0]);
  }
  return picked;
}

export const missionById = (id) => MISSION_POOL.find((m) => m.id === id);

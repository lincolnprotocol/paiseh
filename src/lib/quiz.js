// Shared helpers for questions in lessons and quizzes.

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The right phrase plus up to `count - 1` wrong ones, shuffled.
// Wrong options never repeat the same text or the same English meaning, so there is exactly one right answer.
export function buildOptions(phrase, pool, count = 4, rng = Math.random) {
  const options = [phrase];
  for (const other of shuffle(pool, rng)) {
    if (options.length >= count) break;
    const clash = options.some((o) => o.text === other.text || o.english === other.english);
    if (!clash) options.push(other);
  }
  return shuffle(options, rng);
}

// kind 'meaning': show the phrase, pick the English. kind 'recall': show the English, pick the phrase.
export const makeQuestion = (kind, phrase, pool, rng) => ({
  kind,
  phrase,
  options: buildOptions(phrase, pool, 4, rng),
});

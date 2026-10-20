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
// Wrong options never repeat the same text or the same English meaning, so there is always exactly
// one defensible right answer.
export function buildOptions(phrase, pool, count = 4, rng = Math.random) {
  const options = [phrase];
  for (const other of shuffle(pool, rng)) {
    if (options.length >= count) break;
    const clash = options.some((o) => o.text === other.text || o.english === other.english);
    if (!clash) options.push(other);
  }
  return shuffle(options, rng);
}

// Question kinds:
//   meaning   show the phrase, pick the English
//   recall    show the English, pick the phrase
//   listening play the audio only, pick the phrase   (new: trains the ear, not the eye)
export const QUESTION_KINDS = ['meaning', 'recall', 'listening'];

export const makeQuestion = (kind, phrase, pool, rng) => ({
  kind,
  phrase,
  options: buildOptions(phrase, pool, 4, rng),
});

// A mixed set, so a quiz is not four of the same thing in a row.
export function mixedQuestions(phrases, { length = 8, kinds = ['meaning', 'recall'], rng } = {}) {
  return shuffle(phrases, rng)
    .slice(0, length)
    .map((phrase, n) => makeQuestion(kinds[n % kinds.length], phrase, phrases, rng));
}

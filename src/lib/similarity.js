// Rough "did you say it right?" check: compares what speech recognition heard with the target phrase.
// It catches wrong or missing words. It cannot judge tones or accent, so the UI says "close" not "perfect".

export function normalise(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\p{P}\p{S}\s]/gu, '');
}

function editDistance(a, b) {
  const x = [...a];
  const y = [...b];
  let prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= y.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[y.length];
}

// 0 to 1, where 1 is an exact match after ignoring case, spaces and punctuation.
export function similarity(heard, target) {
  const a = normalise(heard);
  const b = normalise(target);
  if (!a || !b) return 0;
  return 1 - editDistance(a, b) / Math.max([...a].length, [...b].length);
}

export function verdict(score) {
  if (score >= 0.85) return { label: 'Spot on!', tone: 'good' };
  if (score >= 0.55) return { label: 'Close. Try once more.', tone: 'ok' };
  return { label: 'Not quite. Listen and try again.', tone: 'low' };
}

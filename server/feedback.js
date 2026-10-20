// Feedback storage: one JSON object per line in a local file. No database needed.
// Kept free of Express and AWS so it can be tested on its own.

import fs from 'node:fs';

const TYPES = ['language', 'feature', 'bug', 'other'];

// Strips control characters, trims and caps the length.
const clip = (v, max) =>
  typeof v === 'string' ? v.replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, max) : '';

// Returns { entry } or { error }.
export function validateFeedback(body) {
  if (!body || typeof body !== 'object') return { error: 'bad_body' };
  const type = TYPES.includes(body.type) ? body.type : null;
  if (!type) return { error: 'bad_type' };

  const message = clip(body.message, 600);
  const language = clip(body.language, 40);
  if (type === 'language' && !language) return { error: 'no_language' };
  if (!message && !language) return { error: 'empty' };

  const rating = Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
  return {
    entry: {
      type,
      language,
      message,
      contact: clip(body.contact, 100),
      rating,
      appLanguage: clip(body.appLanguage, 10),
      at: new Date().toISOString(),
    },
  };
}

export function appendFeedback(file, entry) {
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`);
}

export function readFeedback(file, limit = 500) {
  if (!fs.existsSync(file)) return [];
  const out = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // skip a damaged line
    }
  }
  return out.slice(-limit);
}

export function summarize(entries) {
  const languages = {};
  const types = {};
  let ratingSum = 0;
  let ratingCount = 0;
  for (const e of entries) {
    types[e.type] = (types[e.type] ?? 0) + 1;
    if (e.type === 'language' && e.language) {
      const key = e.language.toLowerCase();
      languages[key] = (languages[key] ?? 0) + 1;
    }
    if (e.rating) {
      ratingSum += e.rating;
      ratingCount += 1;
    }
  }
  const requestedLanguages = Object.entries(languages)
    .map(([language, votes]) => ({ language, votes }))
    .sort((a, b) => b.votes - a.votes);
  return {
    total: entries.length,
    types,
    requestedLanguages,
    averageRating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
  };
}

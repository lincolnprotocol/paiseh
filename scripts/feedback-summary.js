// Prints what learners have sent: npm run feedback
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFeedback, summarize } from '../server/feedback.js';

const file = process.env.FEEDBACK_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'server', 'feedback.jsonl');
const entries = readFeedback(file);
if (entries.length === 0) {
  console.log(`No feedback yet (${file}).`);
} else {
  const s = summarize(entries);
  console.log(`${s.total} message(s). Average rating: ${s.averageRating ?? 'none yet'}`);
  console.log('Languages people asked for:');
  for (const { language, votes } of s.requestedLanguages) console.log(`  ${votes} x ${language}`);
  console.log('\nLatest messages:');
  for (const e of entries.slice(-10).reverse()) console.log(`  [${e.type}] ${e.language ? e.language + ': ' : ''}${e.message}`);
}

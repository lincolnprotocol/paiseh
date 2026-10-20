// BiLingos API: Amazon Bedrock for the conversation, Amazon Polly for Mandarin voice,
// and a small feedback inbox. All optional: if Bedrock or Polly is not configured the app
// falls back to demo mode on its own.

import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { languages } from '../src/data/languages.js';
import { buildNaturalSsml, normaliseVoiceRequest } from './tts.js';
import { getScenario } from '../src/data/scenarios.js';
import { buildSystemPrompt, buildUserPrompt, extractJson, normalizeTurn } from './prompt.js';
import { appendFeedback, readFeedback, summarize, validateFeedback } from './feedback.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;
const REGION = process.env.AWS_REGION || 'ap-southeast-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || '';
const FEEDBACK_FILE = process.env.FEEDBACK_FILE || path.join(here, 'feedback.jsonl');
const ADMIN_KEY = process.env.ADMIN_KEY || '';

let bedrock = null;
let polly = null;
const bedrockClient = () => (bedrock ??= new BedrockRuntimeClient({ region: REGION }));
const pollyClient = () =>
  (polly ??= new PollyClient({ region: process.env.POLLY_REGION || REGION }));

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// Small per-IP rate limits so a public demo link cannot burn through AWS credits or fill the disk.
function makeLimiter(maxPerMinute) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, times] of hits) if (!times.some((t) => now - t < 60_000)) hits.delete(ip);
  }, 300_000).unref();
  return (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) ?? []).filter((t) => now - t < 60_000);
    if (recent.length >= maxPerMinute) return res.status(429).json({ error: 'slow_down' });
    recent.push(now);
    hits.set(req.ip, recent);
    next();
  };
}
const apiLimit = makeLimiter(60);
const feedbackLimit = makeLimiter(6);

app.get('/api/health', (_req, res) => {
  res.json({ bedrock: Boolean(MODEL_ID), region: REGION, languages: languages.map((l) => l.id) });
});

app.post('/api/chat', apiLimit, async (req, res) => {
  if (!MODEL_ID) return res.status(503).json({ error: 'not_configured' });

  const { languageId = 'zh', scenarioId, history, final = false, slow = false } = req.body ?? {};
  const language = languages.find((l) => l.id === languageId);
  const scenario = language && getScenario(language.id, scenarioId);
  if (!scenario || !Array.isArray(history) || history.length === 0 || history.length > 30) {
    return res.status(400).json({ error: 'bad_request' });
  }

  try {
    const out = await bedrockClient().send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: buildSystemPrompt(language, scenario, { slow: Boolean(slow), final: Boolean(final) }) }],
        messages: [
          { role: 'user', content: [{ text: buildUserPrompt(history, { final: Boolean(final) }) }] },
        ],
        inferenceConfig: { maxTokens: 800, temperature: 0.6 },
      }),
    );
    const text = (out.output?.message?.content ?? []).map((c) => c.text ?? '').join('');
    res.json(normalizeTurn(extractJson(text), { final: Boolean(final) }));
  } catch (err) {
    console.error('chat failed:', err?.name, err?.message);
    res.status(502).json({ error: 'model_failed' });
  }
});

const ttsCache = new Map();

// Polly currently covers Mandarin in this app. Profile and style are allowlisted server-side;
// clients cannot choose arbitrary voices or inject SSML.
app.get('/api/tts', apiLimit, async (req, res) => {
  const langId = String(req.query.lang ?? 'zh');
  const language = languages.find((l) => l.id === langId);
  if (!language) return res.status(400).json({ error: 'bad_language' });
  if (!language.polly) return res.status(404).json({ error: 'no_voice' });

  const text = String(req.query.text ?? '').trim().slice(0, 300);
  if (!text) return res.status(400).json({ error: 'no_text' });
  const voice = normaliseVoiceRequest({
    profile: String(req.query.profile ?? ''),
    style: String(req.query.style ?? ''),
    slow: req.query.slow === '1',
  });
  const key = `${language.id}:${voice.profile}:${voice.style}:${voice.slow ? 's' : 'n'}:${text}`;

  let audio = ttsCache.get(key);
  if (!audio) {
    try {
      const out = await pollyClient().send(
        new SynthesizeSpeechCommand({
          Engine: process.env.POLLY_ENGINE || 'neural',
          LanguageCode: 'cmn-CN',
          VoiceId: process.env.POLLY_VOICE || 'Zhiyu',
          OutputFormat: 'mp3',
          TextType: 'ssml',
          Text: buildNaturalSsml(text, voice),
        }),
      );
      audio = Buffer.from(await out.AudioStream.transformToByteArray());
      if (ttsCache.size > 500) ttsCache.clear();
      ttsCache.set(key, audio);
    } catch (err) {
      console.error('tts failed:', err?.name, err?.message);
      return res.status(502).json({ error: 'tts_failed' });
    }
  }
  res.set({ 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' });
  res.send(audio);
});

// Learners send feedback and language suggestions here. Stored in a local file.
app.post('/api/feedback', feedbackLimit, (req, res) => {
  const { entry, error } = validateFeedback(req.body);
  if (error) return res.status(400).json({ error });
  try {
    appendFeedback(FEEDBACK_FILE, entry);
    res.json({ ok: true });
  } catch (err) {
    console.error('feedback save failed:', err?.message);
    res.status(500).json({ error: 'save_failed' });
  }
});

// Organisers read feedback with /api/feedback?key=ADMIN_KEY. Off unless ADMIN_KEY is set.
const sameKey = (a, b) =>
  crypto.timingSafeEqual(
    crypto.createHash('sha256').update(String(a)).digest(),
    crypto.createHash('sha256').update(String(b)).digest(),
  );

app.get('/api/feedback', (req, res) => {
  if (!ADMIN_KEY || !sameKey(req.query.key ?? '', ADMIN_KEY)) return res.status(404).json({ error: 'not_found' });
  const entries = readFeedback(FEEDBACK_FILE);
  res.json({ summary: summarize(entries), entries });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

// In production, serve the built React app from the same server.
const dist = path.join(here, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`BiLingos API on http://localhost:${PORT}`);
  console.log(
    MODEL_ID
      ? `Bedrock: on (${REGION}, ${MODEL_ID})`
      : 'Bedrock: off. Set BEDROCK_MODEL_ID in .env. The app will use scripted demo replies.',
  );
  console.log(`Feedback file: ${FEEDBACK_FILE}${ADMIN_KEY ? ' (admin view on)' : ''}`);
});

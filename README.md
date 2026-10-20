# BiLingos

Mobile-first web app for HackIT 2026 (AWS track: Integrating Mother Tongue into the Daily Lives of Young Adults).
Practise **Mandarin, Malay and Tamil** through real-life chats, without the paiseh.

## Run it in VS Code

Needs Node 18+ (https://nodejs.org). Open the folder that contains `package.json`, then:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (not 8787, that is the API). To try it on your phone, use the "Network" URL Vite prints (same Wi-Fi).

It works immediately in **demo mode**: scripted replies and the browser's own voice. No keys needed.

## How a learner is taught (no prior knowledge needed)

1. **Warm-up first.** A new scenario opens a short lesson, not the chat. It teaches every phrase the learner will say
   (audio, meaning, optional pronunciation check) in rounds of about 4, then practises them with multiple choice.
   A wrong answer comes back later in the round, so the learner cannot tap through it.
   "I already know some of this" runs a 3-question check. All correct skips the warm-up.
2. **The chat is practice, not guessing.** There are no answer buttons. The learner picks what they want to say in
   English, then builds the phrase from word tiles (works for Tamil and Chinese without a keyboard). A wrong order turns the
   misplaced tiles red. Hints go: first word, then slow audio and pronunciation, then the full answer.
   Using the answer earns less XP. Typing or speaking a free reply is still allowed.
3. **Spaced review.** Lesson and chat phrases go into the phrasebook and come back as flashcards and quizzes.

## What is in the app

- **3 languages x 3 real-life scenarios** (hawker/prata stall, dinner with grandma, chatting with a friend).
- **Gentle corrections**: reply in English or Singlish and get "People usually say it like this".
- **Phrasebook + spaced repetition**: every phrase you meet is saved per language and comes back at 1, 3, 7, 14 and 30 days.
- **Flashcards**, **quiz** (meaning and recall), and **Say it** pronunciation check (microphone, Chrome/Edge).
- **Levels and XP per language**, one shared daily streak, a "Good to know" language tip after each chat.
- **Feedback and "Suggest a language"** form. Saved to `server/feedback.jsonl`. Read it with `npm run feedback`,
  or set `ADMIN_KEY` in `.env` and open `/api/feedback?key=YOUR_KEY`. If the server is down, feedback is kept on the
  device and sent next time.

## Turn on the AWS parts (optional)

1. Copy `.env.example` to `.env`.
2. In the AWS console, enable a Claude model in Amazon Bedrock and paste its exact model ID into `BEDROCK_MODEL_ID`.
3. Provide AWS credentials (`aws configure`, or the variables in `.env`).
4. Restart `npm run dev`. The home footer changes to "Live AI conversation".

Amazon Polly (voice "Zhiyu") is used for Mandarin speech. Polly has no Malay or Tamil voice, so those use the
browser's built-in voice. If a device has no Tamil or Malay voice installed, the chat shows a note instead of silently
doing nothing. If anything fails, the app falls back to demo mode, so the demo never dies on stage.

## Add or edit content

| File | What it does |
|---|---|
| `src/data/zh.js`, `ms.js`, `ta.js` | Scenarios, personas, scripted lines and tips for each language. **Have a native speaker proof-read these.** |
| `src/data/languages.js` | Language list: names, voice and recognition codes, script detection, suggested languages for feedback |
| `src/data/scenarios.js` | Registers each language's scenarios |
| `src/components/` | Home, Lesson (warm-up), Chat, Builder (word tiles), Summary, Review (flashcards and quiz), Feedback, Say it |
| `src/lib/` | AI calls, offline fallback, voice in/out, progress and spaced repetition, pronunciation scoring, word tiles, lesson and quiz helpers |
| `server/` | Express API: Bedrock chat, Polly voice, feedback inbox |

To add a language: add an entry in `languages.js`, create `src/data/<id>.js` with scenarios (copy `ms.js`), register it
in `scenarios.js`, and add a rule for it in `server/prompt.js`.

## Tests

`npm test` runs checks on scenario data (every line has text, English and the right script, every phrase can be built
from 2 to 9 tiles), the lesson and word-tile logic, spaced repetition, levels, pronunciation scoring, prompts and the
feedback inbox. Run it after editing any scenario file.

## Deploy for the showcase

`npm run build`, then `npm start` serves the app and API together on one port (`PORT`, default 8787).
Works on any Node host (AWS App Runner, Elastic Beanstalk, Render, Railway). Set the env vars from `.env` there.
Never commit `.env`. Note that `server/feedback.jsonl` lives on the server's disk, so on hosts with temporary disks
download it before redeploying.

## Notes

- Progress (XP, streak, phrasebook) is stored in the browser's localStorage. No accounts.
- Pronunciation check compares what the browser heard with the phrase. It catches wrong or missing words, not tones or accent.

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

## It fits your screen, not just a phone

BiLingos is designed mobile-first, but it no longer forces a phone shape onto a laptop. The layout is a
setting the learner controls, in the top bar (or the sidebar) and in **Settings → Screen layout**:

| Layout | What you get |
|---|---|
| **Auto** (default) | Follows the window: narrow column under 700px, one roomy column up to 1060px, sidebar layout above that |
| **Phone width** | One narrow column, edge to edge |
| **Phone frame** | A phone-shaped frame centred on the page — handy for demos and screenshots |
| **Comfortable** | One roomy column, good on a tablet or small laptop |
| **Wide** | Persistent sidebar plus content, two-column dashboards, side-by-side chat |

In the wide layout the conversation gets a side panel showing the words you have picked up so far, and the
sentence builder shows keyboard shortcuts: <kbd>1</kbd>–<kbd>9</kbd> place a word, <kbd>⌫</kbd> removes the
last one, <kbd>Enter</kbd> checks. <kbd>Alt</kbd>+<kbd>1</kbd>–<kbd>5</kbd> switches tabs anywhere in the app.

Theme (light / dark / match system), text size and the interface language are all in Settings too.

## A BiLingos identity of its own

The interface is built around **real-life conversation**, not a mascot or competitive language-game ladder. The
mark is an abstract `B` made from three conversation ribbons — coral, mango and cyan for the three mother-tongue
paths. Real-life scenarios look like conversation tickets; the home screen leads with places to use the
language and phrases the learner has retained. Instead of daily goals or reward claims, Home offers one untracked
**take it outside the app** prompt: a useful line to try with a real person. Progress is evidence such as
conversations attempted, phrases kept, writing and speaking — and only milestones already reached are shown.
There is no mascot, streak counter on Home, locked reward wall, leaderboard, league, public ranking or punishment
loop.

The zero-day overlap on the rhythm chart was caused by a CSS class collision: zero bars accidentally inherited
full-page `.empty` padding. Sparkline bars now use a private `is-empty` state, reset their own box geometry and
clip chart overflow, so the heading stays clear in Stack, Phone frame, Comfortable and Wide layouts.

## Natural, Singapore-style voices

BiLingos does not use one identical robot voice for every screen anymore:

- **Character dialogue is role-directed.** Stall owners sound brisk and friendly, grandparents warm and
  unhurried, friends quicker and more expressive, and colleagues relaxed but polite. These are explicit
  authored profiles — the app never guesses a voice from somebody's name.
- **Teaching audio stays neutral and clear.** Word tiles, hints, flashcards and pronunciation practice use a
  separate coach profile so character acting never gets in the way of learning.
- **Singapore voices are preferred.** For browser speech the selector tries `zh-SG`, `ms-SG` or `ta-SG` first,
  then falls back to the best regional voice (`zh-CN`, `ms-MY`, `ta-IN` / `ta-LK`). Voice names containing
  Natural, Neural, Premium, Enhanced, Google or Microsoft are ranked above obviously compact voices.
- **The learner can override the choice.** Settings → Voice and conversation shows every matching voice on the
  current device, lets the learner pick one, previews a casual local line, and offers Natural / Extra clear /
  Lively delivery.
- **Conversation has human timing.** Fast scripted replies pause long enough for the typing beat to feel real;
  a slow Bedrock response does not get an artificial pause piled on top. The reply bubble paints before speech
  begins.
- **Mandarin Polly has natural SSML phrasing.** Punctuation gets subtle, profile-specific pauses and each role
  gets a controlled speech rate. All SSML is generated from allowlisted profiles on the server; learner text is
  escaped and cannot inject markup.

The actual accent still depends on the voices installed on the device. Chrome and Edge commonly expose the best
system voices. The app cannot manufacture a Singaporean Tamil or Malay accent from a low-quality operating-system
voice, but the picker makes the best available option visible instead of silently taking the first voice returned.

## How a learner is taught (no prior knowledge needed)

1. **Warm-up first.** A new scenario opens a short lesson, not the chat. It teaches every phrase the learner
   will say (audio, meaning, optional pronunciation check) in rounds of about 4, practises them with multiple
   choice, then asks them to **write** one. A wrong answer comes back later in the round, so the learner cannot
   tap through it. "I already know some of this" runs a 3-question check. All correct skips the warm-up.
2. **The chat is practice, not guessing.** There are no answer buttons. The learner picks what they want to say
   in English, then builds the phrase from word tiles (works for Tamil and Chinese without a keyboard). A wrong
   order turns the misplaced tiles red. "Tap to hear" plays individual words, because for a non-Latin script the
   sound-to-symbol link is the whole lesson. Hints go: first word, then slow audio and pronunciation, then the
   full answer. Using the answer earns fewer practice points. Typing or speaking a free reply is still allowed.
3. **Spaced review.** Lesson and chat phrases go into the phrasebook and come back as flashcards, quizzes,
   **writing** drills and **listening** drills. Anything you forget four times is flagged as tricky and gets a
   gentler pass of its own.

## What is in the app

- **3 languages x 4 real-life scenarios** — hawker/prata stall, dinner with grandma, chatting with a friend, and
  first day at the office.
- **Real talk** — a dictionary pairing the textbook form with what people actually say (你好 vs 吃饱了没, *Apa
  khabar* vs *Dah makan?*, வணக்கம் vs சாப்பிட்டியா?). Every entry says **who it is safe to say it to**, because
  the fastest way back to feeling paiseh is using friend-slang on your grandmother's sister.
- **Writing practice** — type the phrase yourself. Malay uses your normal keyboard; Chinese and Tamil get an
  on-screen character palette, so nobody has to install an IME first. Typing the romanisation instead of the
  script counts as a near miss with a nudge, not a failure.
- **Listening practice** — audio only, pick what you heard.
- **Gentle corrections** — reply in English or Singlish and get "People usually say it like this".
- **Phrasebook + spaced repetition** — every phrase you meet is saved per language and comes back at 1, 3, 7, 14
  and 30 days. The progress screen shows which memory box everything is sitting in.
- **Take it outside the app** — Home offers one useful, untracked phrase to try in a family chat, over lunch, or
  with somebody beside you. There is no target meter or reward to claim.
- **Evidence-led progress** — conversations attempted, phrases kept, writing and speaking counts, activity days,
  and the phrases that have settled into long-term memory. Only milestones already reached are shown.
- **Backup and restore** — progress lives in localStorage with no accounts, so Settings lets you copy a backup
  and paste it back on another device.
- **Feedback, "Suggest a language" and "Fix a phrase"** forms. Saved to `server/feedback.jsonl`. Read it with
  `npm run feedback`, or set `ADMIN_KEY` in `.env` and open `/api/feedback?key=YOUR_KEY`. If the server is down,
  feedback is kept on the device and sent next time.
- **Device check** (Settings) — confirms every phrase can be built from word tiles in *this* browser. Chinese word
  splitting depends on `Intl.Segmenter`, which some browsers do not have, so run this on any machine you are about
  to present on.

## Turn on the AWS parts (optional)

1. Copy `.env.example` to `.env`.
2. In the AWS console, enable a Claude model in Amazon Bedrock and paste its exact model ID into `BEDROCK_MODEL_ID`.
3. Provide AWS credentials (`aws configure`, or the variables in `.env`).
4. Restart `npm run dev`. The home footer changes to "Live AI conversation".

Amazon Polly (neural voice "Zhiyu") is used for Mandarin dialogue, with role-specific speech rates and
punctuation-aware SSML pauses. Polly has no Malay or Tamil voice in this app, so those use the best matching
Singapore or regional voice exposed by the browser. Settings lets the learner preview and override that choice.
If a device has no Tamil or Malay voice installed, the chat shows a note instead of silently doing nothing. If
anything fails, the app falls back to browser speech and scripted conversation, so the demo never dies on stage.

## Add or edit content

| File | What it does |
|---|---|
| `src/data/zh.js`, `ms.js`, `ta.js` | Scenarios, personas, scripted lines and tips for each language. **Have a native speaker proof-read these.** |
| `src/data/slang.js` | Real talk entries: textbook form, everyday form, usage note, who it is safe with. **Also needs a native speaker.** |
| `src/data/languages.js` | Language list: names, voice and recognition codes, script detection, suggested languages for feedback |
| `src/data/scenarios.js` | Registers each language's scenarios |
| `src/data/missions.js`, `achievements.js` | Internal practice counters and private milestone rules |
| `src/components/screens/` | Home, Practise, Review, Real talk, Progress, Settings, Feedback |
| `src/components/` | Lesson (warm-up), Chat, Builder (word tiles), WriteIt (writing), Summary, Question, SayIt |
| `src/components/layout/` | App shell, sidebar and bottom bar, layout picker |
| `src/lib/` | AI calls, offline fallback, voice selection and persona delivery, progress and spaced repetition, pronunciation scoring, word tiles, writing checks, lesson and quiz helpers, layout resolution, UI strings |
| `server/tts.js` | Safe SSML builder for natural Mandarin role profiles and punctuation-aware pauses |
| `server/` | Express API: Bedrock chat, Polly voice, feedback inbox |

To add a language: add an entry in `languages.js`, create `src/data/<id>.js` with scenarios (copy `ms.js`), add a
`slang.js` section, register it in `scenarios.js`, and add a rule for it in `server/prompt.js`.

## Tests

`npm test` runs 35 checks covering scenario data (every line has text, English and the right script, every phrase
can be built from 2 to 9 tiles), Real talk data, the lesson and word-tile logic, writing grading and the character
palette, pronunciation scoring, spaced repetition and leeches, daily practice moves, milestones, quiet-day passes,
backup/restore, layout resolution, UI strings, prompts and the feedback inbox. Run it after editing any scenario
or slang file.

Note that `npm test` runs in Node, which always has `Intl.Segmenter`. The browser you present on might not — that
is what the in-app **Device check** is for.

## Deploy for the showcase

`npm run build`, then `npm start` serves the app and API together on one port (`PORT`, default 8787).
Works on any Node host (AWS App Runner, Elastic Beanstalk, Render, Railway). Set the env vars from `.env` there.
Never commit `.env`. Note that `server/feedback.jsonl` lives on the server's disk, so on hosts with temporary disks
download it before redeploying.

## Notes

- Progress (XP, streak, phrasebook, badges) is stored in the browser's localStorage. No accounts. Use the backup
  in Settings before clearing your browser data.
- Pronunciation check compares what the browser heard with the phrase, against both the script and the
  romanisation, ignoring tone marks. It catches wrong or missing words, not tones or accent.
- The scenario and Real talk content is **not yet proof-read by native speakers**. The "Fix a phrase" feedback
  form exists so the people who speak these languages can correct it in one tap.

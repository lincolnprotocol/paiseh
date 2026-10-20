// Tamil content, in colloquial spoken Tamil. Same shape as zh.js and ms.js.
// `roman` is a simple Latin transliteration so beginners who cannot read the script yet can still say it.
// NOTE: not yet checked by a native speaker. Have someone proof-read every line.

const p = (text, roman, english) => ({ text, roman, english });

export const ta = [
  {
    id: 'prata',
    tone: 'kaya',
    glyph: 'உ',
    title: 'Order at a roti prata stall',
    blurb: 'Prata, curry and a hot tea.',
    doneLine: 'You just ordered a full meal in Tamil.',
    tip: "Adding -ங்க (-nga) makes a request polite: 'குடுங்க' (kudunga, please give) is polite, while 'குடு' (kudu) is for close friends and family.",
    minutes: 3,
    persona: { name: 'Murugan Anna', native: 'முருகன் அண்ணா', initial: 'மு', role: 'Prata stall owner' },
    setting:
      'The learner is a customer at your roti prata stall in Singapore. Guide them through ordering: how many pratas, curry (kuzhambu) or not, a drink such as tea or coffee, then the total (about five dollars) and where to sit. Address the learner in friendly, respectful colloquial Tamil.',
    script: [
      {
        ai: p('வாங்க! என்ன வேணும்?', 'vaanga! enna venum?', 'Come in! What would you like?'),
        suggestions: [
          p('எனக்கு ரொட்டி பிராட்டா வேணும்.', 'enakku rotti piraattaa venum.', 'I want roti prata.'),
          p('என்ன இருக்கு?', 'enna irukku?', 'What do you have?'),
        ],
        learned: [p('என்ன வேணும்?', 'enna venum?', 'what do you want?')],
      },
      {
        ai: p('எத்தனை பிராட்டா வேணும்?', 'ettanai piraattaa venum?', 'How many pratas?'),
        suggestions: [
          p('ரெண்டு போதும்.', 'rendu pothum.', 'Two is enough.'),
          p('மூணு குடுங்க.', 'moonu kudunga.', 'Give me three.'),
        ],
        learned: [p('எத்தனை?', 'ettanai?', 'how many?')],
      },
      {
        ai: p('குழம்பு வேணுமா?', 'kuzhambu venumaa?', 'Do you want curry?'),
        suggestions: [
          p('ஆமா, குழம்பு குடுங்க.', 'aamaa, kuzhambu kudunga.', 'Yes, give me curry.'),
          p('வேண்டாம், நன்றி.', 'vendaam, nandri.', 'No thanks.'),
        ],
        learned: [p('குழம்பு', 'kuzhambu', 'curry, gravy')],
      },
      {
        ai: p('குடிக்க என்ன வேணும்? டீ, காபி?', 'kudikka enna venum? tee, kaapi?', 'What to drink? Tea or coffee?'),
        suggestions: [
          p('ஒரு டீ குடுங்க.', 'oru tee kudunga.', 'One tea, please.'),
          p('காபி, சர்க்கரை கம்மியா.', 'kaapi, sarkkarai kammiyaa.', 'Coffee, less sugar.'),
        ],
        learned: [p('கம்மியா', 'kammiyaa', 'less (casual)')],
      },
      {
        ai: p('மொத்தம் அஞ்சு டாலர்.', 'mottham anju daalar.', "That's five dollars in total."),
        suggestions: [
          p('இந்தாங்க, காசு.', 'indhaanga, kaasu.', 'Here you go, the money.'),
          p('QR-ல கட்டலாமா?', 'QR-la kattalaamaa?', 'Can I pay by QR code?'),
        ],
        learned: [p('மொத்தம்', 'mottham', 'total')],
      },
      {
        ai: p('நன்றி! உக்காருங்க, சூடா கொண்டு வரேன்.', "nandri! ukkaarunga, soodaa kondu varen.", "Thank you! Please sit, I'll bring it hot."),
        suggestions: [],
        learned: [p('உக்காருங்க', 'ukkaarunga', 'please sit')],
      },
    ],
  },
  {
    id: 'paati',
    tone: 'blush',
    glyph: 'ப',
    title: 'Dinner with Paati',
    blurb: 'Warm small talk with your grandmother.',
    doneLine: 'You just caught up with Paati in Tamil.',
    tip: "பாட்டி (paatti) means grandmother and தாத்தா (thaathaa) means grandfather. 'சாப்பிட்டியா?' (saappittiyaa?) is how many Tamil families say hello: it literally asks 'have you eaten?'.",
    minutes: 3,
    persona: { name: 'Paati', native: 'பாட்டி', initial: 'பா', role: 'Your grandmother' },
    setting:
      "You are the learner's grandmother (Paati), chatting over dinner at home in Singapore in warm colloquial Tamil. A little nosy, always telling them to eat more. Topics: how their day was, whether they have eaten, going to the shop together on Saturday, what movies they watch, going to bed early.",
    script: [
      {
        ai: p('கண்ணு, இன்னைக்கு எப்படி இருந்துச்சு?', 'kannu, innaikku eppadi irundhuchu?', 'Dear, how was your day today?'),
        suggestions: [
          p('நல்லா இருந்துச்சு, பாட்டி.', 'nallaa irundhuchu, paatti.', 'It was good, Paati.'),
          p('கொஞ்சம் டயர்டா இருக்கு.', 'konjam dayardaa irukku.', "I'm a bit tired."),
        ],
        learned: [p('எப்படி இருந்துச்சு?', 'eppadi irundhuchu?', 'how was it?')],
      },
      {
        ai: p('சாப்பிட்டியா? இன்னும் கொஞ்சம் சாப்பிடு.', 'saappittiyaa? innum konjam saappidu.', 'Have you eaten? Eat a little more.'),
        suggestions: [
          p('சாப்பிட்டேன், பாட்டி.', 'saappitten, paatti.', 'I ate, Paati.'),
          p('சாப்பாடு ரொம்ப நல்லா இருக்கு!', 'saappaadu romba nallaa irukku!', 'The food is really good!'),
        ],
        learned: [p('சாப்பிட்டியா?', 'saappittiyaa?', 'have you eaten?')],
      },
      {
        ai: p('சனிக்கிழமை என்கூட கடைக்கு வரியா?', 'sanikkizhamai enkooda kadaikku variyaa?', 'Will you come to the shop with me on Saturday?'),
        suggestions: [
          p('ஆமா, நானும் வரேன்.', 'aamaa, naanum varen.', "Yes, I'll come too."),
          p('வேலை இருக்கு, அடுத்த தடவை வரேன்.', 'velai irukku, aduththa thadavai varen.', "I have work, I'll come next time."),
        ],
        learned: [
          p('என்கூட', 'enkooda', 'with me'),
          p('கடை', 'kadai', 'shop'),
        ],
      },
      {
        ai: p('இப்போ என்ன படம் பார்க்கிற?', 'ippo enna padam paarkkira?', 'What movie are you watching now?'),
        suggestions: [
          p('ஒரு நல்ல படம் பார்க்கிறேன்.', 'oru nalla padam paarkkiren.', "I'm watching a good movie."),
          p('எதுவும் இல்ல, போன் பார்க்கிறேன்.', 'ethuvum illa, phone paarkkiren.', "Nothing, I'm on my phone."),
        ],
        learned: [p('படம்', 'padam', 'movie')],
      },
      {
        ai: p('சரி, சீக்கிரம் தூங்கு. ரொம்ப நேரம் முழிச்சிருக்காத.', "sari, seekkiram thoongu. romba neram muzhichchirukkaadha.", "Okay, sleep early. Don't stay up too late."),
        suggestions: [
          p('சரி பாட்டி, சீக்கிரம் தூங்குறேன்.', 'sari paatti, seekkiram thoongureen.', "Okay Paati, I'll sleep early."),
          p('பாட்டியும் ரெஸ்ட் எடுங்க.', 'paattiyum rest edunga.', 'You rest too, Paati.'),
        ],
        learned: [p('சீக்கிரம்', 'seekkiram', 'quickly, early')],
      },
      {
        ai: p('இன்னைக்கு உன்கூட பேசினது ரொம்ப சந்தோஷம்.', 'innaikku unkooda pesinadhu romba santhosham.', "I'm very happy to have talked with you today."),
        suggestions: [],
        learned: [p('சந்தோஷம்', 'santhosham', 'happiness, joy')],
      },
    ],
  },
  {
    id: 'padam',
    tone: 'teal',
    glyph: 'ச',
    title: 'Chat with a friend about a movie',
    blurb: 'Slang for spoilers, climax and weekend plans.',
    doneLine: 'You just chatted about a movie in Tamil.',
    tip: "Spoken Tamil mixes in English words freely (spoiler, climax, weekend, deal). That is natural, not 'wrong'. 'செம' (sema) is popular slang for 'awesome'.",
    minutes: 2,
    persona: { name: 'Karthi', native: 'கார்த்தி', initial: 'கா', role: 'Friend on WhatsApp' },
    setting:
      "You are the learner's close friend Karthi, texting casually in colloquial Tamil (mixing in English words like spoiler, climax, weekend is natural). Topics: whether they watched the new movie, what they like, no spoilers, watching together this weekend over bubble tea.",
    script: [
      {
        ai: p('நேத்து அந்த புது படம் பார்த்தியா?', 'naethu andha pudhu padam paarththiyaa?', 'Did you watch that new movie yesterday?'),
        suggestions: [
          p('ஆமா, பார்த்தேன்!', 'aamaa, paarththen!', 'Yes, I watched it!'),
          p('இல்ல, நல்லா இருக்கா?', 'illa, nallaa irukkaa?', 'No, is it good?'),
        ],
        learned: [p('பார்த்தியா?', 'paarththiyaa?', 'did you watch?')],
      },
      {
        ai: p('சூப்பர் படம்! உனக்கு எந்த நடிகரைப் பிடிக்கும்?', 'super padam! unakku endha nadigarai pidikkum?', 'Great movie! Which actor do you like?'),
        suggestions: [
          p('எனக்கு காமெடி படம் பிடிக்கும்.', 'enakku comedy padam pidikkum.', 'I like comedy movies.'),
          p('இன்னும் பார்க்கல, ஸ்பாய்லர் சொல்லாதே!', 'innum paarkkala, spoiler sollaadhe!', "I haven't watched it yet, no spoilers!"),
        ],
        learned: [p('பிடிக்கும்', 'pidikkum', '(I) like')],
      },
      {
        ai: p('சரி சரி, சொல்ல மாட்டேன். ஆனா கிளைமாக்ஸ் செம!', 'sari sari, solla maattaen. aanaa climax sema!', "Okay okay, I won't tell. But the climax is awesome!"),
        suggestions: [
          p('நிஜமாவா? நான் இப்பவே பார்க்கப்போறேன்!', 'nijamaavaa? naan ippavae paarkkapporen!', "Really? I'm going to watch it right now!"),
          p('நானும் கேள்விப்பட்டேன்.', 'naanum kelvippatten.', 'I heard that too.'),
        ],
        learned: [
          p('செம', 'sema', 'awesome (slang)'),
          p('நிஜமாவா?', 'nijamaavaa?', 'really?'),
        ],
      },
      {
        ai: p('வீக்எண்ட் ஒண்ணா பார்க்கலாமா? நான் பப்பிள் டீ வாங்கித் தரேன்.', 'weekend onna paarkkalaamaa? naan bubble tea vaangi tharen.', "Shall we watch together this weekend? I'll buy you bubble tea."),
        suggestions: [
          p('சரி, டீல்!', 'sari, deal!', "Okay, deal!"),
          p('வீக்எண்ட் வேலை இருக்கு, இன்னொரு நாள்?', 'weekend velai irukku, innoru naal?', "I'm busy this weekend, another day?"),
        ],
        learned: [p('வாங்கித் தரேன்', 'vaangi tharen', "I'll buy it for you")],
      },
      {
        ai: p('சூப்பர்! அப்போ வீக்எண்ட்ல பார்க்கலாம்!', 'super! appo weekendla paarkkalaam!', "Great! See you on the weekend then!"),
        suggestions: [],
        learned: [p('பார்க்கலாம்', 'paarkkalaam', "let's see / let's meet")],
      },
    ],
  },
  {
    id: 'velai',
    tone: 'sky',
    glyph: 'வே',
    title: 'First day at the office',
    blurb: 'Introduce yourself, survive the lunch invite.',
    doneLine: 'You just handled a first day in Tamil.',
    tip: "Keep the -ங்க (-nga) ending at work: 'கேளுங்க' (kelunga) rather than 'கேளு' (kelu). It costs one syllable and it is the difference between friendly and abrupt with a colleague you have just met.",
    minutes: 3,
    persona: { name: 'Priya', native: 'பிரியா', initial: 'பி', role: 'Colleague at the next desk' },
    setting:
      'You are a friendly colleague welcoming the learner on their first day at a Singapore office, speaking warm colloquial Tamil. Keep it light and practical: confirm they are new, ask which team, invite them to lunch, offer help with questions, then excuse yourself for a meeting. Mixing in English words like team and meeting is completely natural.',
    script: [
      {
        ai: p('ஹாய், நீங்க புதுசா வந்தீங்களா?', 'haay, neenga pudhusaa vandheengalaa?', 'Hi, are you new here?'),
        suggestions: [
          p('ஆமா, இன்னைக்கு முதல் நாள்.', 'aamaa, innaikku mudhal naal.', 'Yes, today is my first day.'),
          p('ஹாய், நான் அருண்.', 'haay, naan Arun.', "Hi, I'm Arun."),
        ],
        learned: [p('முதல் நாள்', 'mudhal naal', 'first day')],
      },
      {
        ai: p('வெல்கம்! எந்த டீம்ல இருக்கீங்க?', 'welcome! endha team-la irukkeenga?', 'Welcome! Which team are you in?'),
        suggestions: [
          p('நான் மார்க்கெட்டிங் டீம்.', 'naan marketing team.', "I'm in the marketing team."),
          p('இன்னும் தெரியல.', 'innum theriyala.', "I don't know yet."),
        ],
        learned: [p('எந்த', 'endha', 'which')],
      },
      {
        ai: p('மதியம் சேர்ந்து சாப்பிடலாமா?', 'madhiyam serndhu saappidalaamaa?', 'Shall we eat lunch together?'),
        suggestions: [
          p('சரி, நன்றி!', 'sari, nandri!', 'Okay, thanks!'),
          p('நான் சாப்பாடு கொண்டு வந்தேன்.', 'naan saappaadu kondu vandhen.', 'I brought food.'),
        ],
        learned: [p('மதியம்', 'madhiyam', 'midday')],
      },
      {
        ai: p('சந்தேகம் இருந்தா கேளுங்க.', 'sandhegam irundhaa kelunga.', 'If you have any questions, do ask.'),
        suggestions: [
          p('ரொம்ப நன்றி.', 'romba nandri.', 'Thank you very much.'),
          p('சரி, கேட்கிறேன்.', 'sari, ketkiren.', "Okay, I'll ask."),
        ],
        learned: [p('சந்தேகம்', 'sandhegam', 'doubt, question')],
      },
      {
        ai: p('எனக்கு மீட்டிங் இருக்கு, அப்புறம் பேசலாம்.', 'enakku meeting irukku, appuram pesalaam.', "I have a meeting, let's talk later."),
        suggestions: [
          p('சரி, அப்புறம் பேசலாம்.', 'sari, appuram pesalaam.', "Okay, let's talk later."),
          p('மீட்டிங் நல்லா போகட்டும்!', 'meeting nallaa pogattum!', 'Hope the meeting goes well!'),
        ],
        learned: [p('அப்புறம்', 'appuram', 'later, afterwards')],
      },
      {
        ai: p('முதல் நாள் நல்லா இருக்கும்!', 'mudhal naal nallaa irukkum!', 'Your first day will go well!'),
        suggestions: [],
        learned: [p('நல்லா', 'nallaa', 'well, nicely')],
      },
    ],
  },
];

// "Real talk": the gap between what the textbook taught and what people actually say.
//
// This is the part of the problem statement that a chat scenario alone cannot fix. A learner can
// pass an exam knowing 您好 and still freeze when an auntie opens with 吃饱了没有. Each entry pairs
// the textbook form with the everyday form, and — just as importantly — says who you can say it to,
// because the fastest way to feel paiseh is using friend-slang on your grandmother's sister.
//
// `register` is the safety rail:
//   anyone  - safe everywhere
//   friends - people your own age only
//   family  - relaxed, for family and close company
//   elders  - respectful, use with older people
//
// NOTE: not yet checked by a native speaker. Have someone proof-read every line.

const entry = (id, real, textbook, note, register, tags = []) => ({
  id,
  real,
  textbook,
  note,
  register,
  tags,
});

const p = (text, roman, english) => ({ text, roman, english });

export const SLANG = {
  zh: [
    entry(
      'zh-greet',
      p('吃饱了没？', 'chī bǎo le méi?', 'Eaten yet?'),
      p('你好', 'nǐ hǎo', 'Hello'),
      'In Singapore this is a greeting, not a real question about food. "吃了" (chī le, "I ate") is a complete answer. 你好 is not wrong, it just sounds like a textbook.',
      'anyone',
      ['greeting'],
    ),
    entry(
      'zh-paiseh',
      p('不好意思', 'bù hǎoyìsi', 'Sorry / excuse me / how embarrassing'),
      p('对不起', 'duìbuqǐ', 'I apologise'),
      'The everyday "sorry" for small things: squeezing past someone, being late, asking a favour. 对不起 is for actually serious apologies. This is the Mandarin cousin of paiseh.',
      'anyone',
      ['politeness'],
    ),
    entry(
      'zh-tapau',
      p('打包', 'dǎbāo', 'To take away'),
      p('带走', 'dài zǒu', 'To take away'),
      'What you say at every hawker stall: 我要打包 (wǒ yào dǎbāo). Same word Singaporeans use in English as "tapau".',
      'anyone',
      ['food'],
    ),
    entry(
      'zh-kopi',
      p('咖啡乌', 'kāfēi wū', 'Black coffee with sugar'),
      p('黑咖啡', 'hēi kāfēi', 'Black coffee'),
      'The 乌 is Hokkien for black. Hawker-centre Mandarin borrows from Hokkien constantly, and that is normal, not sloppy.',
      'anyone',
      ['food'],
    ),
    entry(
      'zh-zenyang',
      p('怎样？', 'zěnyàng?', "What's up? / how is it?"),
      p('你好吗？', 'nǐ hǎo ma?', 'How are you?'),
      '你好吗 is almost never said between people who know each other. 怎样 is the real opener with friends.',
      'friends',
      ['greeting'],
    ),
    entry(
      'zh-dengxia',
      p('等下', 'děng xià', 'Hold on / later'),
      p('请稍等', 'qǐng shāo děng', 'Please wait a moment'),
      'Short and everyday. 请稍等 is what a receptionist says, not what you say to a friend.',
      'family',
      ['time'],
    ),
    entry(
      'zh-gaoding',
      p('搞定', 'gǎodìng', 'Sorted / done'),
      p('完成了', 'wánchéng le', 'Completed'),
      'Useful at work and with friends when something is handled. 完成了 sounds like a progress report.',
      'friends',
      ['work'],
    ),
    entry(
      'zh-zan',
      p('很赞', 'hěn zàn', 'Awesome'),
      p('非常好', 'fēicháng hǎo', 'Very good'),
      'For food, films, anything you liked. 非常好 is what a teacher writes on your homework.',
      'friends',
      ['opinion'],
    ),
    entry(
      'zh-haihao',
      p('还好啦', 'hái hǎo la', "It's okay lah / not bad"),
      p('还可以', 'hái kěyǐ', 'Acceptable'),
      'The 啦 softens it. Dropping Singlish particles into Mandarin is extremely normal here.',
      'friends',
      ['opinion'],
    ),
    entry(
      'zh-zhuiju',
      p('追剧', 'zhuī jù', 'To binge a show'),
      p('看电视剧', 'kàn diànshìjù', 'To watch a TV drama'),
      'Literally "chase a show". The fastest way into a conversation with anyone your age.',
      'friends',
      ['culture'],
    ),
    entry(
      'zh-mafan',
      p('麻烦你', 'máfan nǐ', 'Sorry to trouble you'),
      p('请帮我', 'qǐng bāng wǒ', 'Please help me'),
      'The polite way to ask for anything, at a counter or in an office. Softer than a direct request.',
      'elders',
      ['politeness', 'work'],
    ),
    entry(
      'zh-eryi',
      p('而已', 'éryǐ', "That's all / only"),
      p('只是', 'zhǐshì', 'Only'),
      'Tacked on the end: 五块而已 (only five dollars). Very common in speech, rare in textbooks.',
      'anyone',
      ['grammar'],
    ),
  ],

  ms: [
    entry(
      'ms-makan',
      p('Dah makan?', '', 'Eaten yet?'),
      p('Apa khabar?', '', 'How are you?'),
      'The everyday opener. Apa khabar is correct but formal, the kind of thing you say in a speech.',
      'anyone',
      ['greeting'],
    ),
    entry(
      'ms-jom',
      p('Jom!', '', "Let's go!"),
      p('Mari kita pergi', '', 'Let us go'),
      'One syllable, does all the work. Mari kita pergi is grammatically perfect and nobody says it.',
      'friends',
      ['invitation'],
    ),
    entry(
      'ms-lepak',
      p('Lepak', '', 'To hang out, chill'),
      p('Berehat', '', 'To rest'),
      'Lepak is doing nothing in good company. There is no neat textbook equivalent, which is the point.',
      'friends',
      ['social'],
    ),
    entry(
      'ms-tapao',
      p('Tapau', '', 'To take away'),
      p('Bungkus', '', 'To wrap / pack'),
      'Bungkus is the proper word and is still widely used at stalls. Tapau is the borrowed everyday one.',
      'anyone',
      ['food'],
    ),
    entry(
      'ms-alamak',
      p('Alamak!', '', 'Oh no!'),
      p('Oh, tidak', '', 'Oh, no'),
      'Pure reflex word for a small disaster. Works in Malay and in Singlish without changing anything.',
      'friends',
      ['reaction'],
    ),
    entry(
      'ms-takapa',
      p('Tak apa', '', "It's fine / never mind"),
      p('Tidak mengapa', '', 'It does not matter'),
      'Spoken Malay shortens tidak to tak almost always. Using the full form sounds like reading aloud.',
      'anyone',
      ['politeness'],
    ),
    entry(
      'ms-bolehlah',
      p('Boleh lah', '', 'Sure / that works'),
      p('Ya, boleh', '', 'Yes, it is possible'),
      'The -lah is not lazy, it carries tone. It turns a flat yes into a friendly yes.',
      'friends',
      ['agreement'],
    ),
    entry(
      'ms-weh',
      p('Weh', '', 'Hey'),
      p('Hai', '', 'Hi'),
      'Attention-getter between close friends your own age. Never to an elder, a lecturer or a customer.',
      'friends',
      ['greeting'],
    ),
    entry(
      'ms-belanja',
      p('Aku belanja', '', "It's on me"),
      p('Saya akan bayar', '', 'I will pay'),
      'Belanja means treating someone. Note aku rather than saya: that is the register shift to a close friend.',
      'friends',
      ['money'],
    ),
    entry(
      'ms-sedap',
      p('Sedap gila!', '', 'Insanely good!'),
      p('Sangat lazat', '', 'Very delicious'),
      'Gila (crazy) as an intensifier is everywhere in speech. Sangat lazat belongs on a menu.',
      'friends',
      ['food', 'opinion'],
    ),
    entry(
      'ms-kejap',
      p('Kejap', '', 'One sec'),
      p('Tunggu sebentar', '', 'Please wait a moment'),
      'Sometimes written "jap". Short, casual, constant in text messages.',
      'friends',
      ['time'],
    ),
    entry(
      'ms-kak',
      p('Kak / Bang', '', 'Older sister / older brother'),
      p('Cik / Tuan', '', 'Miss / Sir'),
      'How you address someone slightly older at a stall or shop. Warmer and far more natural than Cik or Tuan.',
      'anyone',
      ['politeness'],
    ),
  ],

  ta: [
    entry(
      'ta-saapta',
      p('சாப்பிட்டியா?', 'saappittiyaa?', 'Eaten yet?'),
      p('வணக்கம்', 'vanakkam', 'Greetings'),
      'In many Tamil families this is the real hello. Vanakkam is respectful and correct, but it is for occasions, not for walking into the kitchen.',
      'family',
      ['greeting'],
    ),
    entry(
      'ta-sema',
      p('செம', 'sema', 'Awesome'),
      p('மிகவும் நல்லது', 'migavum nalladhu', 'Very good'),
      'The single most useful slang word for anything you liked. Migavum nalladhu is textbook-only.',
      'friends',
      ['opinion'],
    ),
    entry(
      'ta-apdiya',
      p('அப்படியா?', 'appadiyaa?', 'Oh really?'),
      p('உண்மையாகவா?', 'unmaiyaagavaa?', 'Is that true?'),
      'The natural reaction noise in conversation. Keeps the other person talking.',
      'anyone',
      ['reaction'],
    ),
    entry(
      'ta-seri',
      p('சரி', 'sari', 'Okay / fine'),
      p('நல்லது', 'nalladhu', 'Good / very well'),
      'Does everything: agreement, acknowledgement, wrapping up a conversation.',
      'anyone',
      ['agreement'],
    ),
    entry(
      'ta-konjam',
      p('கொஞ்சம்', 'konjam', 'A little'),
      p('சிறிதளவு', 'siridhalavu', 'A small quantity'),
      'Order food, ask for help, soften a request. Siridhalavu is a written word.',
      'anyone',
      ['quantity'],
    ),
    entry(
      'ta-nga',
      p('குடுங்க', 'kudunga', 'Please give'),
      p('கொடுங்கள்', 'kodungal', 'Give (formal)'),
      'Spoken Tamil trims the ending. The -ங்க still carries the politeness, so you are not being rude.',
      'anyone',
      ['politeness'],
    ),
    entry(
      'ta-bore',
      p('போர் அடிக்குது', 'bore adikkudhu', "I'm bored"),
      p('சலிப்பாக இருக்கிறது', 'salippaaga irukkiradhu', 'It is tedious'),
      'English words slot straight into spoken Tamil. That is natural bilingualism, not bad Tamil.',
      'friends',
      ['feeling'],
    ),
    entry(
      'ta-machan',
      p('மச்சான்', 'machaan', 'Bro / mate'),
      p('நண்பரே', 'nanbare', 'Friend'),
      'Strictly for close friends your own age. Nanbare is what a character says in an old film.',
      'friends',
      ['social'],
    ),
    entry(
      'ta-pothum',
      p('போதும்', 'pothum', "That's enough"),
      p('அது போதுமானது', 'adhu podhumaanadhu', 'That is sufficient'),
      'Essential at a dinner table when someone keeps adding rice to your plate.',
      'family',
      ['food'],
    ),
    entry(
      'ta-vanga',
      p('வாங்க', 'vaanga', 'Come / come in'),
      p('வருக', 'varuga', 'Welcome (formal)'),
      'How you are greeted at a stall or a front door. Warm and ordinary.',
      'anyone',
      ['greeting'],
    ),
    entry(
      'ta-paaka',
      p('பார்க்கலாம்', 'paarkkalaam', "Let's see / see you"),
      p('பின்னர் சந்திப்போம்', 'pinnar sandhippom', 'We shall meet later'),
      'A soft way to end a chat or leave plans open.',
      'anyone',
      ['farewell'],
    ),
    entry(
      'ta-romba',
      p('ரொம்ப', 'romba', 'Very / a lot'),
      p('மிகவும்', 'migavum', 'Very'),
      'Romba is the spoken intensifier. Migavum is the written one. Same meaning, totally different feel.',
      'anyone',
      ['grammar'],
    ),
  ],
};

export const REGISTERS = {
  anyone: { label: 'Safe with anyone', tone: 'teal' },
  friends: { label: 'Friends your age', tone: 'blush' },
  family: { label: 'Family and close company', tone: 'kaya' },
  elders: { label: 'Respectful, good for elders', tone: 'teal' },
};

export const slangFor = (langId) => SLANG[langId] ?? [];

export function slangTags(langId) {
  const tags = new Set();
  for (const item of slangFor(langId)) for (const tag of item.tags) tags.add(tag);
  return [...tags].sort();
}

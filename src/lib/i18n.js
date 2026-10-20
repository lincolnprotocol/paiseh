// UI language. The old build had English-only chrome, which is a strange thing to put around a
// mother-tongue app. The learner can now switch the interface into the language they are learning.
//
// Only the shell is translated (navigation, buttons, headings). Teaching copy stays in English on
// purpose: if you cannot read the instructions yet, the lesson is useless.
//
// NOTE: the zh / ms / ta strings below still want a native speaker's eye before a public release.

const en = {
  'nav.home': 'Home',
  'nav.learn': 'Practise',
  'nav.review': 'Review',
  'nav.slang': 'Real talk',
  'nav.stats': 'Progress',
  'nav.settings': 'Settings',

  'action.start': 'Start',
  'action.continue': 'Continue',
  'action.done': 'Done',
  'action.back': 'Back',
  'action.next': 'Next',
  'action.check': 'Check',
  'action.hint': 'Hint',
  'action.showAnswer': 'Show answer',
  'action.hear': 'Hear it',
  'action.sayIt': 'Say it',
  'action.skip': 'Skip',
  'action.close': 'Close',

  'home.greeting': 'Ready when you are',
  'home.streak': 'day streak',
  'home.xp': 'XP',
  'home.due': 'due',
  'home.pickMoment': 'Pick a moment',
  'home.missions': "Today's missions",
  'home.keepGoing': 'Keep going',

  'review.title': 'Review',
  'review.flashcards': 'Flashcards',
  'review.quiz': 'Quiz',
  'review.writing': 'Writing',
  'review.listening': 'Listening',
  'review.empty': 'Your phrasebook is empty',

  'stats.title': 'Your progress',
  'stats.level': 'Level',
  'stats.phrases': 'phrases',
  'stats.sessions': 'chats',
  'stats.thisWeek': 'This week',

  'settings.title': 'Settings',
  'settings.layout': 'Screen layout',
  'settings.appearance': 'Appearance',
  'settings.learning': 'Learning',
  'settings.data': 'Your data',

  'chat.yourTurn': 'Your turn. What do you want to say?',
  'chat.orType': 'Or type or say your own reply',
  'chat.buildIt': 'Build it from the words',

  'label.phrasebook': 'Phrasebook',
  'label.minutes': 'min',
  'label.warmupDone': 'Warm-up done',
  'label.startsWarmup': 'Starts with a warm-up',
};

const zh = {
  'nav.home': '首页',
  'nav.learn': '练习',
  'nav.review': '复习',
  'nav.slang': '地道说法',
  'nav.stats': '进度',
  'nav.settings': '设置',

  'action.start': '开始',
  'action.continue': '继续',
  'action.done': '完成',
  'action.back': '返回',
  'action.next': '下一个',
  'action.check': '检查',
  'action.hint': '提示',
  'action.showAnswer': '显示答案',
  'action.hear': '听一听',
  'action.sayIt': '说一说',
  'action.skip': '跳过',
  'action.close': '关闭',

  'home.greeting': '随时可以开始',
  'home.streak': '天连续',
  'home.xp': '经验',
  'home.due': '待复习',
  'home.pickMoment': '选一个场景',
  'home.missions': '今天的任务',
  'home.keepGoing': '继续加油',

  'review.title': '复习',
  'review.flashcards': '卡片',
  'review.quiz': '测验',
  'review.writing': '书写',
  'review.listening': '听力',
  'review.empty': '你的短语本还是空的',

  'stats.title': '你的进度',
  'stats.level': '等级',
  'stats.phrases': '个短语',
  'stats.sessions': '次对话',
  'stats.thisWeek': '本周',

  'settings.title': '设置',
  'settings.layout': '屏幕布局',
  'settings.appearance': '外观',
  'settings.learning': '学习',
  'settings.data': '你的数据',

  'chat.yourTurn': '轮到你了。你想说什么？',
  'chat.orType': '也可以自己打字或说话',
  'chat.buildIt': '用词块拼出来',

  'label.phrasebook': '短语本',
  'label.minutes': '分钟',
  'label.warmupDone': '热身完成',
  'label.startsWarmup': '先做热身',
};

const ms = {
  'nav.home': 'Utama',
  'nav.learn': 'Latihan',
  'nav.review': 'Ulang kaji',
  'nav.slang': 'Bahasa harian',
  'nav.stats': 'Kemajuan',
  'nav.settings': 'Tetapan',

  'action.start': 'Mula',
  'action.continue': 'Teruskan',
  'action.done': 'Siap',
  'action.back': 'Kembali',
  'action.next': 'Seterusnya',
  'action.check': 'Periksa',
  'action.hint': 'Petunjuk',
  'action.showAnswer': 'Tunjuk jawapan',
  'action.hear': 'Dengar',
  'action.sayIt': 'Cuba sebut',
  'action.skip': 'Langkau',
  'action.close': 'Tutup',

  'home.greeting': 'Sedia bila-bila masa',
  'home.streak': 'hari berturut',
  'home.xp': 'XP',
  'home.due': 'perlu diulang',
  'home.pickMoment': 'Pilih satu situasi',
  'home.missions': 'Misi hari ini',
  'home.keepGoing': 'Teruskan',

  'review.title': 'Ulang kaji',
  'review.flashcards': 'Kad',
  'review.quiz': 'Kuiz',
  'review.writing': 'Menulis',
  'review.listening': 'Mendengar',
  'review.empty': 'Buku frasa anda masih kosong',

  'stats.title': 'Kemajuan anda',
  'stats.level': 'Tahap',
  'stats.phrases': 'frasa',
  'stats.sessions': 'perbualan',
  'stats.thisWeek': 'Minggu ini',

  'settings.title': 'Tetapan',
  'settings.layout': 'Susun atur skrin',
  'settings.appearance': 'Paparan',
  'settings.learning': 'Pembelajaran',
  'settings.data': 'Data anda',

  'chat.yourTurn': 'Turn anda. Apa you nak cakap?',
  'chat.orType': 'Atau taip / sebut jawapan sendiri',
  'chat.buildIt': 'Bina dari perkataan',

  'label.phrasebook': 'Buku frasa',
  'label.minutes': 'min',
  'label.warmupDone': 'Pemanasan siap',
  'label.startsWarmup': 'Mula dengan pemanasan',
};

const ta = {
  'nav.home': 'முதல் பக்கம்',
  'nav.learn': 'பயிற்சி',
  'nav.review': 'மீள்பார்வை',
  'nav.slang': 'பேச்சு வழக்கு',
  'nav.stats': 'முன்னேற்றம்',
  'nav.settings': 'அமைப்புகள்',

  'action.start': 'தொடங்கு',
  'action.continue': 'தொடரு',
  'action.done': 'முடிந்தது',
  'action.back': 'பின்',
  'action.next': 'அடுத்து',
  'action.check': 'சரிபார்',
  'action.hint': 'குறிப்பு',
  'action.showAnswer': 'பதிலைக் காட்டு',
  'action.hear': 'கேளு',
  'action.sayIt': 'சொல்லு',
  'action.skip': 'விடு',
  'action.close': 'மூடு',

  'home.greeting': 'எப்போ வேணும்னாலும் ஆரம்பிக்கலாம்',
  'home.streak': 'நாள் தொடர்ச்சி',
  'home.xp': 'XP',
  'home.due': 'மீள்பார்வைக்கு',
  'home.pickMoment': 'ஒரு சூழ்நிலையைத் தேர்ந்தெடு',
  'home.missions': 'இன்றைய இலக்குகள்',
  'home.keepGoing': 'தொடர்ந்து செய்',

  'review.title': 'மீள்பார்வை',
  'review.flashcards': 'அட்டைகள்',
  'review.quiz': 'வினாடி வினா',
  'review.writing': 'எழுதுதல்',
  'review.listening': 'கேட்டல்',
  'review.empty': 'உங்கள் சொற்றொடர் புத்தகம் காலியாக இருக்கு',

  'stats.title': 'உங்கள் முன்னேற்றம்',
  'stats.level': 'நிலை',
  'stats.phrases': 'சொற்றொடர்கள்',
  'stats.sessions': 'உரையாடல்கள்',
  'stats.thisWeek': 'இந்த வாரம்',

  'settings.title': 'அமைப்புகள்',
  'settings.layout': 'திரை அமைப்பு',
  'settings.appearance': 'தோற்றம்',
  'settings.learning': 'கற்றல்',
  'settings.data': 'உங்கள் தரவு',

  'chat.yourTurn': 'உங்க முறை. என்ன சொல்ல விரும்புறீங்க?',
  'chat.orType': 'அல்லது நீங்களே தட்டச்சு செய்யுங்க',
  'chat.buildIt': 'வார்த்தைகளால் அமைக்கவும்',

  'label.phrasebook': 'சொற்றொடர் புத்தகம்',
  'label.minutes': 'நிமிடம்',
  'label.warmupDone': 'பயிற்சி முடிந்தது',
  'label.startsWarmup': 'பயிற்சியுடன் தொடங்கும்',
};

const BUNDLES = { en, zh, ms, ta };

export const UI_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '华语' },
  { id: 'ms', label: 'Melayu' },
  { id: 'ta', label: 'தமிழ்' },
];

// Always falls back to English, so a missing key shows real words instead of "nav.home".
export function translator(uiLang) {
  const bundle = BUNDLES[uiLang] ?? en;
  return (key) => bundle[key] ?? en[key] ?? key;
}

export const uiHtmlLang = (uiLang) =>
  ({ en: 'en', zh: 'zh-Hans', ms: 'ms', ta: 'ta' })[uiLang] ?? 'en';

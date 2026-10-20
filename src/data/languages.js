// One place that describes every language the app supports.
// To add a language: add an entry here, add src/data/<id>.js, and register it in scenarios.js.

export const languages = [
  {
    id: 'zh',
    name: 'Mandarin',
    native: '华语',
    chip: '华语',
    htmlLang: 'zh-Hans',
    speech: 'zh-CN', // recognition locale: broad browser support
    voiceLocales: ['zh-SG', 'zh-CN'], // synthesis: prefer a Singapore voice when the device has one
    polly: true, // Amazon Polly neural voice (Zhiyu), with scenario-specific prosody
    romanName: 'Pinyin',
    grandma: 'Ah Ma',
    scriptRe: /[一-鿿]/,
  },
  {
    id: 'ms',
    name: 'Malay',
    native: 'Bahasa Melayu',
    chip: 'Melayu',
    htmlLang: 'ms',
    speech: 'ms-MY', // recognition locale: more widely available than ms-SG
    voiceLocales: ['ms-SG', 'ms-MY'],
    polly: false, // best matching Singapore/Malaysia device voice
    romanName: null, // Malay already uses the Latin alphabet
    grandma: 'Nenek',
    scriptRe: null,
  },
  {
    id: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    chip: 'தமிழ்',
    htmlLang: 'ta',
    speech: 'ta-IN', // recognition locale: broadest Tamil support
    voiceLocales: ['ta-SG', 'ta-IN', 'ta-LK'],
    polly: false, // best matching Singapore/Indian/Lankan device voice
    romanName: 'Romanised',
    grandma: 'Paati',
    scriptRe: /[஀-௿]/,
  },
];

// Shown as one-tap options on the feedback form.
export const SUGGESTED_LANGUAGES = [
  'Hindi',
  'Cantonese',
  'Hokkien',
  'Teochew',
  'Bengali',
  'Punjabi',
  'Burmese',
  'Indonesian',
  'Japanese',
  'Korean',
];

export const getLanguage = (id) => languages.find((l) => l.id === id) ?? languages[0];

// Common English words, used only to tell "the learner typed English" from "typed Malay"
// when the offline demo has to decide whether to show a correction.
// Words that Malay speakers also use in everyday chat (ok, free, hi) are left out on purpose.
const ENGLISH = new Set(
  (
    'i a an the is am are was were be to of and or you me my we us it its this that these those ' +
    'please want would like one two three four five can could do does did dont not yes thanks thank ' +
    'how what where when why who which give get have has had with for from at on in out ' +
    'im ill your here there much many some more very good bad eat eating drink drinking rice chicken ' +
    'fish tea coffee sleep early late tired hungry school movie watch watching friend weekend today ' +
    'tomorrow yesterday going go come see need help sorry hello'
  ).split(' '),
);

// True if the text looks like it is written in the language being learnt.
export function looksLikeTarget(langId, text) {
  const lang = getLanguage(langId);
  if (lang.scriptRe) return lang.scriptRe.test(text);
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  if (words.length === 0) return false;
  const english = words.filter((w) => ENGLISH.has(w.replace(/'/g, ''))).length;
  return english / words.length < 0.3;
}

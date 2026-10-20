// A phrase with optional romanisation and English hint.
// `lang` is the HTML language code, so each script gets the right font.
export default function Phrase({ phrase, lang, showRoman = true, size = 'md' }) {
  return (
    <span className={`phrase phrase-${size}`}>
      <span className="ptext" lang={lang}>
        {phrase.text}
      </span>
      {showRoman && phrase.roman ? <span className="pinyin">{phrase.roman}</span> : null}
      {phrase.english ? <span className="english">{phrase.english}</span> : null}
    </span>
  );
}

// One lock-up for every shell. The mark is an abstract B made from three conversation ribbons —
// one for each mother tongue — rather than a mascot or a generic speech-bubble app icon.
export default function BrandMark({ compact = false }) {
  return (
    <span className={`brand-lockup ${compact ? 'compact' : ''}`}>
      <img src="/bilingos-mark.svg" alt="" width={compact ? 30 : 38} height={compact ? 30 : 38} />
      <span className="brand-words">
        <b>BiLingos</b>
        {!compact && <small>Real talk. No paiseh.</small>}
      </span>
    </span>
  );
}

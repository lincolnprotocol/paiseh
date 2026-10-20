// A tiny XP-per-day bar chart. The old build stored no history at all, so "progress" was a single
// number that only ever went up. Seeing the gaps is what makes a streak feel real.
export default function Sparkline({ series, label = 'XP per day' }) {
  const max = Math.max(10, ...series.map((d) => d.xp));
  const today = series.at(-1)?.day;

  return (
    <div className="sparkline" role="img" aria-label={`${label}: ${series.map((d) => `${d.day} ${d.xp}`).join(', ')}`}>
      {series.map((d) => {
        const height = Math.round((d.xp / max) * 100);
        return (
          <span key={d.day} className="spark-col" title={`${d.day}: ${d.xp} XP`}>
            <span
              className={`spark-bar ${d.xp === 0 ? 'empty' : ''} ${d.day === today ? 'today' : ''}`}
              style={{ height: `${Math.max(height, d.xp > 0 ? 8 : 3)}%` }}
            />
          </span>
        );
      })}
    </div>
  );
}

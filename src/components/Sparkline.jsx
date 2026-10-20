// A tiny practice-points-per-day chart. Seeing the gaps makes a rhythm feel real without turning
// practice into a leaderboard.
export default function Sparkline({ series, label = 'Practice points per day' }) {
  const max = Math.max(10, ...series.map((d) => d.xp));
  const today = series.at(-1)?.day;

  return (
    <div className="sparkline" role="img" aria-label={`${label}: ${series.map((d) => `${d.day} ${d.xp}`).join(', ')}`}>
      {series.map((d) => {
        const height = Math.round((d.xp / max) * 100);
        return (
          <span key={d.day} className="spark-col" title={`${d.day}: ${d.xp} practice points`}>
            <span
              className={`spark-bar ${d.xp === 0 ? 'is-empty' : ''} ${d.day === today ? 'today' : ''}`}
              style={{ height: `${Math.max(height, d.xp > 0 ? 8 : 3)}%` }}
            />
          </span>
        );
      })}
    </div>
  );
}

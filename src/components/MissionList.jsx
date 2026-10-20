import { Check, Star, Target } from './Icons.jsx';

// Three small daily missions. Deliberately gentle: every one is reachable in a single short
// session, and missing a day costs nothing but the streak (which a freeze can cover).
export default function MissionList({ missions, onClaim, title = "Today's missions" }) {
  const allDone = missions.every((m) => m.done);

  return (
    <section className="panel" aria-labelledby="missions-head">
      <div className="panel-head">
        <h2 id="missions-head">
          <Target width={18} height={18} /> {title}
        </h2>
        {allDone && <span className="pill-tag done">All done</span>}
      </div>

      <ul className="mission-list">
        {missions.map((m) => (
          <li key={m.id} className={`mission ${m.done ? 'done' : ''}`}>
            <span className={`mission-check ${m.done ? 'on' : ''}`} aria-hidden="true">
              {m.done ? <Check width={16} height={16} strokeWidth={3} /> : null}
            </span>
            <span className="mission-body">
              <b>{m.label}</b>
              <small>{m.blurb}</small>
              <span
                className="meter slim"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={m.target}
                aria-valuenow={m.progress}
                aria-label={`${m.label} progress`}
              >
                <span style={{ width: `${Math.round((m.progress / m.target) * 100)}%` }} />
              </span>
              <small className="mission-count">
                {m.progress} / {m.target}
              </small>
            </span>
            {m.done && !m.claimed ? (
              <button className="primary small claim" onClick={() => onClaim(m.id)}>
                <Star width={15} height={15} /> +{m.xp}
              </button>
            ) : (
              <span className={`mission-xp ${m.claimed ? 'claimed' : ''}`}>
                {m.claimed ? 'Claimed' : `+${m.xp} XP`}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

import { LAYOUTS, LAYOUT_HINTS, LAYOUT_LABELS } from '../../lib/layout.js';
import { Auto, Columns, Laptop, Monitor, Phone } from '../Icons.jsx';

const ICONS = { auto: Auto, stack: Phone, phone: Phone, comfortable: Laptop, wide: Monitor };

// Compact version for the top bar: icon-only buttons.
export function LayoutToggle({ value, resolved, onChange }) {
  return (
    <div className="seg seg-icons" role="group" aria-label="Screen layout">
      {LAYOUTS.map((id) => {
        const Icon = ICONS[id] ?? Columns;
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            className={`seg-btn ${active ? 'on' : ''}`}
            aria-pressed={active}
            title={`${LAYOUT_LABELS[id]} — ${LAYOUT_HINTS[id]}`}
            onClick={() => onChange(id)}
          >
            <Icon width={18} height={18} />
            <span className="sr-only">{LAYOUT_LABELS[id]}</span>
          </button>
        );
      })}
      <span className="sr-only" role="status">
        Currently showing the {LAYOUT_LABELS[resolved]} layout
      </span>
    </div>
  );
}

// Full version for the settings screen: label, hint and a live note about what "auto" resolved to.
export default function LayoutPicker({ value, resolved, onChange }) {
  return (
    <div className="layout-picker">
      <div className="layout-options">
        {LAYOUTS.map((id) => {
          const Icon = ICONS[id] ?? Columns;
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              className={`layout-option ${active ? 'on' : ''}`}
              aria-pressed={active}
              onClick={() => onChange(id)}
            >
              <Icon width={22} height={22} />
              <b>{LAYOUT_LABELS[id]}</b>
              <small>{LAYOUT_HINTS[id]}</small>
            </button>
          );
        })}
      </div>
      {value === 'auto' && (
        <p className="note" role="status">
          Auto is showing the <b>{LAYOUT_LABELS[resolved]}</b> layout at this window size. Resize the window
          and it will follow.
        </p>
      )}
    </div>
  );
}

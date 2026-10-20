import { languages } from '../../data/languages.js';
import { usesSidebar } from '../../lib/layout.js';
import BrandMark from './BrandMark.jsx';
import { Cog } from '../Icons.jsx';
import { LayoutToggle } from './LayoutPicker.jsx';
import { BOTTOM_NAV, NAV } from './nav.js';

// The shell decides *where* things sit for the chosen layout. Screens below it never need to know
// which layout is active, which is what keeps this maintainable.
//
// wide        -> persistent sidebar, content beside it
// comfortable -> one centred column with a top bar and a bottom bar
// stack       -> the same, edge to edge (what a phone sees)
// phone       -> the same, inside a device frame (handy for demos and screenshots)
//
// `immersive` is for the lesson, chat and summary flows: the navigation gets out of the way so the
// learner is not tempted to wander off mid-conversation.
export default function AppShell({
  layout,
  layoutPreference,
  onLayout,
  route,
  onRoute,
  language,
  onLanguage,
  due,
  immersive = false,
  t,
  children,
}) {
  const sidebar = usesSidebar(layout);
  const framed = layout === 'phone';

  const body = (
    <div className={`app layout-${layout} ${immersive ? 'is-immersive' : ''}`} data-layout={layout}>
      {sidebar && !immersive && (
        <nav className="sidebar" aria-label="Main">
          <div className="sidebar-brand">
            <BrandMark />
          </div>

          <div className="sidebar-langs" role="group" aria-label="Choose a language">
            {languages.map((l) => (
              <button
                key={l.id}
                className={`lang ${l.id === language.id ? 'on' : ''}`}
                aria-pressed={l.id === language.id}
                onClick={() => onLanguage(l.id)}
              >
                <span lang={l.htmlLang}>{l.chip}</span>
              </button>
            ))}
          </div>

          <ul className="sidebar-nav">
            {NAV.map(({ id, key, Icon }) => (
              <li key={id}>
                <button
                  className={`navlink ${route === id ? 'on' : ''}`}
                  aria-current={route === id ? 'page' : undefined}
                  onClick={() => onRoute(id)}
                >
                  <Icon width={20} height={20} />
                  <span>{t(key)}</span>
                  {id === 'review' && due > 0 && <i className="due">{due}</i>}
                </button>
              </li>
            ))}
          </ul>

          <div className="sidebar-foot">
            <LayoutToggle value={layoutPreference} resolved={layout} onChange={onLayout} />
          </div>
        </nav>
      )}

      <div className="app-body">
        {!sidebar && !immersive && (
          <header className="appbar">
            <div className="brand">
              <BrandMark compact />
            </div>
            <div className="appbar-right">
              <button
                className={`icon-btn ${route === 'settings' ? 'on' : ''}`}
                aria-label={t('nav.settings')}
                aria-current={route === 'settings' ? 'page' : undefined}
                onClick={() => onRoute('settings')}
              >
                <Cog />
              </button>
            </div>
          </header>
        )}

        <main className="app-content" id="main">
          {children}
        </main>

        {!sidebar && !immersive && (
          <nav className="bottom-nav" aria-label="Main">
            {BOTTOM_NAV.map(({ id, key, Icon }) => (
              <button
                key={id}
                className={`tab ${route === id ? 'on' : ''}`}
                aria-current={route === id ? 'page' : undefined}
                onClick={() => onRoute(id)}
              >
                <span className="tab-icon">
                  <Icon width={21} height={21} />
                  {id === 'review' && due > 0 && <i className="dot-badge" aria-hidden="true" />}
                </span>
                <span>{t(key)}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );

  if (!framed) return body;
  return (
    <div className="frame-stage">
      <div className="device-frame">{body}</div>
      <p className="frame-note">
        Phone frame. Switch to <b>Wide</b> or <b>Auto</b> to use the whole screen.
      </p>
    </div>
  );
}

import { Book, Chart, Chat, Cog, Home, Sparkles } from '../Icons.jsx';

// One list, used by the sidebar on big screens and the bottom bar on small ones.
export const NAV = [
  { id: 'home', key: 'nav.home', Icon: Home },
  { id: 'learn', key: 'nav.learn', Icon: Chat },
  { id: 'review', key: 'nav.review', Icon: Book },
  { id: 'slang', key: 'nav.slang', Icon: Sparkles },
  { id: 'stats', key: 'nav.stats', Icon: Chart },
  { id: 'settings', key: 'nav.settings', Icon: Cog },
];

// The bottom bar drops Settings (it lives in the top bar on small screens) to stay thumb-friendly.
export const BOTTOM_NAV = NAV.filter((n) => n.id !== 'settings');

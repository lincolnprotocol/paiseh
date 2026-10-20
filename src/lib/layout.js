// Layout is a user choice, not just a screen size.
//
// The old build hard-locked a 420px phone frame on anything wider than 600px, so laptop and
// desktop users were stuck looking at a phone. Now the learner picks how the app should sit on
// their screen, and "auto" simply follows the viewport.
//
//   auto        follow the viewport (default)
//   stack       one narrow column, full height  (what a phone gets)
//   phone       the 420px device frame, centred  (nice for demos and screenshots)
//   comfortable one column, ~760px, full height  (tablet / small laptop)
//   wide        sidebar + content, up to 1440px  (laptop / desktop)

export const LAYOUTS = ['auto', 'stack', 'phone', 'comfortable', 'wide'];

export const LAYOUT_LABELS = {
  auto: 'Auto',
  stack: 'Phone width',
  phone: 'Phone frame',
  comfortable: 'Comfortable',
  wide: 'Wide',
};

export const LAYOUT_HINTS = {
  auto: 'Follows your screen size',
  stack: 'One narrow column, edge to edge',
  phone: 'A phone-shaped frame in the middle',
  comfortable: 'One roomy column, good on a tablet',
  wide: 'Sidebar plus content, built for a big screen',
};

export const BREAKPOINTS = { comfortable: 700, wide: 1060 };

// What "auto" resolves to at a given width.
export function layoutForWidth(width) {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.comfortable) return 'comfortable';
  return 'stack';
}

// The layout actually applied: the preference, unless it is "auto".
export function resolveLayout(preference, width) {
  if (!LAYOUTS.includes(preference) || preference === 'auto') return layoutForWidth(width);
  return preference;
}

// Only the wide layout has a persistent sidebar; the rest use the bottom bar.
export const usesSidebar = (layout) => layout === 'wide';

// Font scale, so the app is readable on a 27" monitor and on a cracked phone.
export const FONT_SCALES = [
  { id: 'sm', label: 'Small', value: 0.94 },
  { id: 'md', label: 'Default', value: 1 },
  { id: 'lg', label: 'Large', value: 1.1 },
  { id: 'xl', label: 'Extra large', value: 1.22 },
];

export const fontScaleValue = (id) => FONT_SCALES.find((f) => f.id === id)?.value ?? 1;

export const THEMES = [
  { id: 'auto', label: 'Match system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

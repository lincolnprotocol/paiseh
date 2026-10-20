import { useEffect, useState } from 'react';
import { fontScaleValue, resolveLayout } from './layout.js';

// Tracks the window width so "auto" layout can resolve to a real layout.
export function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return width;
}

export function useLayout(preference) {
  const width = useViewportWidth();
  return { layout: resolveLayout(preference, width), width };
}

// Theme, font scale and the html lang attribute all live on <html>, so CSS can key off them and
// assistive tech reads the right language.
export function useAppearance({ theme, fontScale, htmlLang }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.setProperty('--font-scale', String(fontScaleValue(fontScale)));
    return undefined;
  }, [theme, fontScale]);

  useEffect(() => {
    document.documentElement.lang = htmlLang;
  }, [htmlLang]);
}

// Media-query hook, used for reduced motion.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

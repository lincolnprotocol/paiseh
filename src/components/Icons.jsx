const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

const make = (children) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {children}
      </svg>
    );
  };

/* --- conversation and audio --- */
export const Speaker = make(
  <>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </>,
);
export const Mic = make(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </>,
);
export const Send = make(
  <>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </>,
);
export const Ear = make(
  <>
    <path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 6a2.5 2.5 0 0 1-5 0" />
    <path d="M10 9a2 2 0 0 1 4 0" />
  </>,
);

/* --- navigation --- */
export const Back = make(<path d="M15 5l-7 7 7 7" />);
export const Forward = make(<path d="M9 5l7 7-7 7" />);
export const Close = make(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </>,
);
export const Home = make(
  <>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
  </>,
);
export const Chat = make(
  <>
    <path d="M4 5h16v10H9l-5 4z" />
    <path d="M8 9h8" />
  </>,
);
export const Book = make(
  <>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 21V5" />
  </>,
);
export const Sparkles = make(
  <>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" />
  </>,
);
export const Chart = make(
  <>
    <path d="M4 20h16" />
    <path d="M7 20v-6" />
    <path d="M12 20V7" />
    <path d="M17 20v-9" />
  </>,
);
export const Cog = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </>,
);

/* --- progress and reflection --- */
export const Rhythm = make(
  <>
    <path d="M3 12h3l2-5 4 10 3-7 2 2h4" />
    <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="21" cy="12" r="1" fill="currentColor" stroke="none" />
  </>,
);
export const Star = make(
  <polygon points="12 3 14.8 9 21 9.8 16.5 14 17.8 20.5 12 17.2 6.2 20.5 7.5 14 3 9.8 9.2 9" />,
);
export const Check = make(<path d="M5 12l5 5 9-10" />);
export const Target = make(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const Lock = make(
  <>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
);
export const Snow = make(
  <>
    <path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />
  </>,
);
export const Share = make(
  <>
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v13" />
  </>,
);

/* --- writing --- */
export const Pencil = make(
  <>
    <path d="M4 20h4L20 8l-4-4L4 16z" />
    <path d="M14 6l4 4" />
  </>,
);
export const Keyboard = make(
  <>
    <rect x="2" y="7" width="20" height="11" rx="2" />
    <path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M8 15h8" />
  </>,
);
export const Backspace = make(
  <>
    <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9L2 12z" />
    <path d="M12 9l5 6M17 9l-5 6" />
  </>,
);

/* --- layout switching --- */
export const Phone = make(
  <>
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <path d="M11 18.5h2" />
  </>,
);
export const Laptop = make(
  <>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </>,
);
export const Monitor = make(
  <>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M9 21h6M12 17v4" />
  </>,
);
export const Columns = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </>,
);
export const Auto = make(
  <>
    <rect x="2" y="5" width="13" height="10" rx="1.5" />
    <rect x="17" y="10" width="5" height="9" rx="1.5" />
  </>,
);

/* --- data --- */
export const Download = make(
  <>
    <path d="M12 3v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </>,
);
export const Upload = make(
  <>
    <path d="M12 20V8" />
    <path d="M7 12l5-5 5 5" />
    <path d="M5 4h14" />
  </>,
);
export const Trash = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </>,
);
export const Sun = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </>,
);
export const Moon = make(<path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z" />);
export const Globe = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3 3 15 0 18-3-3-3-15 0-18z" />
  </>,
);

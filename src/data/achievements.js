// Achievements are deliberately low-pressure: they reward turning up and trying, never speed or
// perfection. Each `test` reads the flat stats snapshot from lib/storage.js statsFor().

export const ACHIEVEMENTS = [
  {
    id: 'first-words',
    label: 'First words',
    blurb: 'Finished your first warm-up',
    test: (s) => s.lessons >= 1,
  },
  {
    id: 'first-chat',
    label: 'No more paiseh',
    blurb: 'Finished your first conversation',
    test: (s) => s.sessions >= 1,
  },
  {
    id: 'chatty',
    label: 'Chatty',
    blurb: 'Finished 5 conversations',
    test: (s) => s.sessions >= 5,
  },
  {
    id: 'phrasebook-10',
    label: 'Pocket phrasebook',
    blurb: '10 phrases saved',
    test: (s) => s.phrases >= 10,
  },
  {
    id: 'phrasebook-50',
    label: 'Walking dictionary',
    blurb: '50 phrases saved',
    test: (s) => s.phrases >= 50,
  },
  {
    id: 'sticky-10',
    label: 'It stuck',
    blurb: '10 phrases reached the long-term box',
    test: (s) => s.strong >= 10,
  },
  {
    id: 'streak-3',
    label: 'Three in a row',
    blurb: 'Practised 3 days running',
    test: (s) => s.streak >= 3,
  },
  {
    id: 'streak-7',
    label: 'One whole week',
    blurb: 'Practised 7 days running',
    test: (s) => s.streak >= 7,
  },
  {
    id: 'streak-30',
    label: 'A month of mother tongue',
    blurb: 'Practised 30 days running',
    test: (s) => s.streak >= 30,
  },
  {
    id: 'builder-50',
    label: 'Tile master',
    blurb: 'Built 50 sentences from word tiles',
    test: (s) => s.builds >= 50,
  },
  {
    id: 'writer-25',
    label: 'Writing it down',
    blurb: 'Wrote 25 phrases correctly',
    test: (s) => s.writes >= 25,
  },
  {
    id: 'speaker-25',
    label: 'Out loud',
    blurb: 'Said 25 phrases out loud',
    test: (s) => s.says >= 25,
  },
  {
    id: 'level-5',
    label: 'Confident speaker',
    blurb: 'Reached level 5 in a language',
    test: (s) => s.level >= 5,
  },
  {
    id: 'bilingual-plus',
    label: 'Why stop at one',
    blurb: 'Practised in two languages',
    test: (s) => s.languages >= 2,
  },
  {
    id: 'trilingual',
    label: 'Singapore mode',
    blurb: 'Practised in all three languages',
    test: (s) => s.languages >= 3,
  },
  {
    id: 'week-active',
    label: 'Every single day',
    blurb: 'Practised on all 7 days of a week',
    test: (s) => s.activeDays >= 7,
  },
];

export const achievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);

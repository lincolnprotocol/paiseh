// Malay content. Same shape as zh.js and ta.js. Malay uses the Latin alphabet, so `roman` is empty.
// NOTE: not yet checked by a native speaker. Have someone proof-read every line.

const p = (text, english) => ({ text, roman: '', english });

export const ms = [
  {
    id: 'makan',
    tone: 'kaya',
    glyph: 'M',
    title: 'Order at a Malay food stall',
    blurb: 'Nasi lemak, sambal and teh tarik.',
    doneLine: 'You just ordered a full meal in Malay.',
    tip: "Teh tarik means 'pulled tea': it is poured back and forth between two cups to make it frothy. 'Kurang manis' (less sweet) is the phrase to remember when you order drinks.",
    minutes: 3,
    persona: { name: 'Kak Ana', native: 'Kak Ana', initial: 'A', role: 'Food stall auntie' },
    setting:
      'The learner is a customer at your Malay food stall in a Singapore hawker centre. Guide them through ordering: nasi lemak or similar, ayam goreng or ikan, sambal pedas or not, a drink such as teh tarik or teh o ais, then the total (about seven dollars) and where to sit.',
    script: [
      {
        ai: p('Selamat datang! Nak makan apa?', 'Welcome! What would you like to eat?'),
        suggestions: [
          p('Saya nak nasi lemak satu.', "I'd like one nasi lemak."),
          p('Ada apa yang sedap?', 'Is there anything tasty?'),
        ],
        learned: [p('Nak makan apa?', 'What would you like to eat?')],
      },
      {
        ai: p('Nak ayam goreng atau ikan?', 'Fried chicken or fish?'),
        suggestions: [
          p('Ayam goreng, boleh?', 'Fried chicken, please?'),
          p('Ikan, terima kasih.', 'Fish, thank you.'),
        ],
        learned: [p('ayam goreng', 'fried chicken')],
      },
      {
        ai: p('Nak sambal pedas tak?', 'Do you want spicy sambal?'),
        suggestions: [
          p('Ya, tambah sikit pedas.', 'Yes, a little more spicy.'),
          p('Tak nak pedas, terima kasih.', 'No spice, thank you.'),
        ],
        learned: [p('pedas', 'spicy')],
      },
      {
        ai: p('Nak minum apa? Teh tarik atau teh o ais?', 'What to drink? Teh tarik or iced black tea?'),
        suggestions: [
          p('Teh tarik satu.', 'One teh tarik.'),
          p('Teh o ais, kurang manis.', 'Iced tea, less sweet.'),
        ],
        learned: [p('kurang manis', 'less sweet')],
      },
      {
        ai: p('Semua sekali tujuh dolar.', "That's seven dollars altogether."),
        suggestions: [
          p('Okey, ini duitnya.', "Okay, here's the money."),
          p('Boleh bayar guna QR?', 'Can I pay with a QR code?'),
        ],
        learned: [p('semua sekali', 'altogether')],
      },
      {
        ai: p('Terima kasih! Sila duduk dulu, nanti saya hantar.', "Thank you! Please sit first, I'll bring it over."),
        suggestions: [],
        learned: [p('sila duduk', 'please sit')],
      },
    ],
  },
  {
    id: 'nenek',
    tone: 'blush',
    glyph: 'N',
    title: 'Dinner with Nenek',
    blurb: 'Small talk that makes grandparents smile.',
    doneLine: 'You just caught up with Nenek in Malay.',
    tip: "Family words: Nenek (grandmother), Atuk (grandfather), Mak (mum), Ayah (dad). Adding '-lah' softens a sentence and makes it warmer, like 'Makanlah' (do eat).",
    minutes: 3,
    persona: { name: 'Nenek', native: 'Nenek', initial: 'N', role: 'Your grandmother' },
    setting:
      "You are the learner's grandmother (Nenek), chatting over dinner at home in Singapore. Warm, a little nosy, always telling them to eat more. Topics: how their day was, whether they have eaten enough, weekend plans such as going to the market, what dramas they watch, going to bed early.",
    script: [
      {
        ai: p('Cucu nenek, hari ini macam mana?', 'My grandchild, how was your day?'),
        suggestions: [
          p('Baik, nenek. Banyak kelas hari ini.', 'Good, Nenek. Lots of classes today.'),
          p('Penat sikit.', 'A bit tired.'),
        ],
        learned: [p('macam mana?', 'how is it? / how was it?')],
      },
      {
        ai: p('Dah makan belum? Makanlah lagi.', 'Have you eaten yet? Eat some more.'),
        suggestions: [
          p('Dah kenyang, terima kasih nenek.', "I'm full, thank you Nenek."),
          p('Masakan nenek memang sedap!', 'Your cooking is really delicious!'),
        ],
        learned: [p('Dah makan belum?', 'have you eaten yet?')],
      },
      {
        ai: p('Hujung minggu ni free tak? Temankan nenek ke pasar.', 'Free this weekend? Come with Nenek to the market.'),
        suggestions: [
          p('Free, saya temankan nenek.', "I'm free, I'll go with you, Nenek."),
          p('Ada kerja rumah, lain kali boleh?', 'I have homework, next time okay?'),
        ],
        learned: [
          p('temankan', 'to accompany'),
          p('pasar', 'market'),
        ],
      },
      {
        ai: p('Kamu tengok drama apa sekarang?', 'What drama are you watching these days?'),
        suggestions: [
          p('Saya tengok satu drama yang best.', "I'm watching a really good drama."),
          p('Tak tengok apa-apa, main telefon.', "Nothing, I'm on my phone."),
        ],
        learned: [p('best', 'great, cool (casual)')],
      },
      {
        ai: p('Okey, tidur awal tau. Jangan lewat sangat.', "Okay, sleep early. Don't stay up too late."),
        suggestions: [
          p('Okey, saya tidur awal.', "Okay, I'll sleep early."),
          p('Nenek pun rehatlah awal.', 'Nenek, you rest early too.'),
        ],
        learned: [p('jangan lewat sangat', "don't be too late")],
      },
      {
        ai: p('Nenek gembira dapat berbual dengan kamu hari ini.', 'Nenek is happy to chat with you today.'),
        suggestions: [],
        learned: [p('berbual', 'to chat')],
      },
    ],
  },
  {
    id: 'jom',
    tone: 'teal',
    glyph: 'J',
    title: 'Plan the weekend with a friend',
    blurb: 'Casual chat: movies, makan and lepak.',
    doneLine: 'You just made weekend plans in Malay.',
    tip: "'Jom' is the casual way to say 'let's go', and 'weh' is a friendly attention-getter between close friends. Save both for friends your age, not for elders.",
    minutes: 2,
    persona: { name: 'Aiman', native: 'Aiman', initial: 'A', role: 'Friend on WhatsApp' },
    setting:
      "You are the learner's close friend Aiman, texting casually on WhatsApp in relaxed spoken Malay (words like weh, jom, lepak, best are fine). Topics: whether they are free this weekend, going to a movie, a scary movie, what to eat afterwards, meeting on Saturday.",
    script: [
      {
        ai: p('Weh, hujung minggu ni kau free tak?', 'Hey, are you free this weekend?'),
        suggestions: [
          p('Free! Kenapa?', 'Free! Why?'),
          p('Tak pasti lagi. Ada apa?', 'Not sure yet. What is it?'),
        ],
        learned: [
          p('weh', 'hey (casual, between friends)'),
          p('free tak?', 'are you free?'),
        ],
      },
      {
        ai: p('Jom tengok wayang! Ada cerita baru yang best.', "Let's watch a movie! There's a good new one."),
        suggestions: [
          p('Jom! Cerita apa?', "Let's go! Which movie?"),
          p('Wayang mahal, kita lepak je?', 'Movies are pricey, shall we just hang out?'),
        ],
        learned: [
          p('Jom!', "Let's go!"),
          p('wayang', 'movie, cinema'),
        ],
      },
      {
        ai: p('Cerita seram. Kau berani tak?', 'A horror movie. Are you brave?'),
        suggestions: [
          p('Berani lah!', "Of course I'm brave!"),
          p('Aduh, saya takut sikit.', "Aiyo, I'm a little scared."),
        ],
        learned: [
          p('seram', 'scary, horror'),
          p('berani', 'brave'),
        ],
      },
      {
        ai: p('Okey! Lepas tu kita makan. Kau nak makan apa?', 'Okay! Afterwards we eat. What do you want to eat?'),
        suggestions: [
          p('Kita makan nasi goreng.', "Let's eat fried rice."),
          p('Saya belanja kau teh tarik!', "I'll treat you to teh tarik!"),
        ],
        learned: [p('belanja', 'to treat someone')],
      },
      {
        ai: p('Setuju! Jumpa hari Sabtu tau!', 'Agreed! See you on Saturday!'),
        suggestions: [],
        learned: [p('setuju', 'agree')],
      },
    ],
  },
];

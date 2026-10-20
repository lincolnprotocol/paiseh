// Mandarin content. Same shape as ms.js and ta.js.
// - `script` is the offline demo AND the fallback if the AI server is unreachable.
// - `persona` and `setting` feed the Bedrock prompt.
// - `tip` is a short language / culture note shown after the session.
//
// NOTE: not yet checked by a native speaker. Have someone proof-read every line.

const p = (text, roman, english) => ({ text, roman, english });

export const zh = [
  {
    id: 'hawker',
    tone: 'kaya',
    glyph: '吃',
    title: 'Order at a hawker stall',
    blurb: 'Noodles, kopi and how to ask for chilli.',
    doneLine: 'You just ordered a full meal in Mandarin.',
    tip: "咖啡乌 (kāfēi wū): the 乌 (wū) means 'black' and comes from Hokkien. Hawker-centre Mandarin borrows from Hokkien and English all the time, and that is normal.",
    minutes: 3,
    persona: { name: 'Auntie Chen', native: '陈阿姨', initial: '陈', role: 'Noodle stall auntie' },
    setting:
      'The learner is a customer at your noodle stall in a Singapore hawker centre. Guide them through ordering: noodles, dry (干捞) or soup (汤), chilli or no chilli, a drink such as kopi-o (咖啡乌) or tea, then the total (about six or seven dollars) and where to wait.',
    script: [
      {
        ai: p('你好！想吃什么？', 'nǐ hǎo! xiǎng chī shénme?', 'Hello! What would you like to eat?'),
        suggestions: [
          p('我要一碗面。', 'wǒ yào yì wǎn miàn.', "I'd like a bowl of noodles."),
          p('有什么推荐吗？', 'yǒu shénme tuījiàn ma?', 'Any recommendations?'),
        ],
        learned: [p('想吃什么？', 'xiǎng chī shénme?', 'What would you like to eat?')],
      },
      {
        ai: p('好的！要干捞还是汤的？', 'hǎo de! yào gānlāo háishi tāng de?', 'Okay! Dry or soup?'),
        suggestions: [
          p('我要干捞。', 'wǒ yào gānlāo.', 'Dry, please.'),
          p('汤的，谢谢。', 'tāng de, xièxie.', 'Soup, thanks.'),
        ],
        learned: [p('干捞', 'gānlāo', 'dry noodles, tossed in sauce with no soup')],
      },
      {
        ai: p('要加辣吗？', 'yào jiā là ma?', 'Want to add chilli?'),
        suggestions: [
          p('要，加一点辣。', 'yào, jiā yìdiǎn là.', 'Yes, a little chilli.'),
          p('不要辣，谢谢。', 'bú yào là, xièxie.', 'No chilli, thanks.'),
        ],
        learned: [p('加辣', 'jiā là', 'add chilli')],
      },
      {
        ai: p('要喝什么吗？咖啡乌还是茶？', 'yào hē shénme ma? kāfēi wū háishi chá?', 'Want a drink? Kopi-o or tea?'),
        suggestions: [
          p('我要一杯咖啡乌。', 'wǒ yào yì bēi kāfēi wū.', 'One kopi-o, please.'),
          p('茶，少糖。', 'chá, shǎo táng.', 'Tea, less sugar.'),
        ],
        learned: [p('咖啡乌', 'kāfēi wū', 'kopi-o: black coffee with sugar')],
      },
      {
        ai: p('一共六块五。', 'yígòng liù kuài wǔ.', "That's $6.50 in total."),
        suggestions: [
          p('好的，给你。', 'hǎo de, gěi nǐ.', 'Okay, here you go.'),
          p('可以扫码付款吗？', 'kěyǐ sǎomǎ fùkuǎn ma?', 'Can I pay by scanning a QR code?'),
        ],
        learned: [p('一共', 'yígòng', 'in total')],
      },
      {
        ai: p('谢谢！请先坐，面好了我叫你。', "xièxie! qǐng xiān zuò, miàn hǎo le wǒ jiào nǐ.", "Thanks! Please sit first, I'll call you when the noodles are ready."),
        suggestions: [],
        learned: [p('请先坐', 'qǐng xiān zuò', 'please sit first')],
      },
    ],
  },
  {
    id: 'ahma',
    tone: 'blush',
    glyph: '家',
    title: 'Dinner with Ah Ma',
    blurb: 'Small talk that makes grandparents light up.',
    doneLine: 'You just caught up with Ah Ma in Mandarin.',
    tip: "阿嬷 (āmā) is a Hokkien-influenced word many Singaporeans use. In standard Mandarin you would say 奶奶 (nǎinai) for a father's mother or 外婆 (wàipó) for a mother's mother.",
    minutes: 3,
    persona: { name: 'Ah Ma', native: '阿嬷', initial: '嬷', role: 'Your grandmother' },
    setting:
      "You are the learner's grandmother, chatting over dinner at home in Singapore. Warm, a little nosy, always telling them to eat more. Topics: how school or work was, whether they have eaten enough, weekend plans such as the wet market, what shows they watch, going to bed early.",
    script: [
      {
        ai: p('乖孙，今天在学校怎么样？', 'guāi sūn, jīntiān zài xuéxiào zěnmeyàng?', 'Dear grandchild, how was school today?'),
        suggestions: [
          p('很好，今天上了很多课。', 'hěn hǎo, jīntiān shàng le hěn duō kè.', 'Good, I had lots of classes today.'),
          p('有点累。', 'yǒudiǎn lèi.', 'A bit tired.'),
        ],
        learned: [p('怎么样？', 'zěnmeyàng?', 'how is it? / how was it?')],
      },
      {
        ai: p('你吃饱了没有？多吃一点。', 'nǐ chī bǎo le méiyǒu? duō chī yìdiǎn.', 'Have you eaten enough? Eat a bit more.'),
        suggestions: [
          p('吃饱了，谢谢阿嬷。', 'chī bǎo le, xièxie āmā.', "I'm full, thanks Ah Ma."),
          p('阿嬷煮的菜很好吃！', 'āmā zhǔ de cài hěn hǎochī!', 'The food you cooked is delicious, Ah Ma!'),
        ],
        learned: [p('吃饱了没有？', 'chī bǎo le méiyǒu?', 'have you eaten enough?')],
      },
      {
        ai: p('周末有空吗？陪阿嬷去菜市场。', 'zhōumò yǒu kòng ma? péi āmā qù càishìchǎng.', 'Free this weekend? Come with Ah Ma to the wet market.'),
        suggestions: [
          p('有空，我陪你去。', 'yǒu kòng, wǒ péi nǐ qù.', "I'm free, I'll go with you."),
          p('周末要做功课，下次好吗？', 'zhōumò yào zuò gōngkè, xiàcì hǎo ma?', 'I have homework this weekend, next time okay?'),
        ],
        learned: [
          p('有空', 'yǒu kòng', 'to be free, to have time'),
          p('菜市场', 'càishìchǎng', 'wet market'),
        ],
      },
      {
        ai: p('你最近在看什么电视剧？', 'nǐ zuìjìn zài kàn shénme diànshìjù?', 'What shows have you been watching lately?'),
        suggestions: [
          p('我在看一部很好看的剧。', 'wǒ zài kàn yí bù hěn hǎokàn de jù.', "I'm watching a really good show."),
          p('没看什么，我在玩手机。', 'méi kàn shénme, wǒ zài wán shǒujī.', "Nothing much, I'm on my phone."),
        ],
        learned: [p('最近', 'zuìjìn', 'recently')],
      },
      {
        ai: p('好，要早点睡，别太晚。', 'hǎo, yào zǎodiǎn shuì, bié tài wǎn.', "Okay, sleep early, don't stay up too late."),
        suggestions: [
          p('好，我会早点睡。', 'hǎo, wǒ huì zǎodiǎn shuì.', "Okay, I'll sleep early."),
          p('阿嬷也要早点休息。', 'āmā yě yào zǎodiǎn xiūxi.', 'Ah Ma should rest early too.'),
        ],
        learned: [p('别太晚', 'bié tài wǎn', "don't be too late")],
      },
      {
        ai: p('阿嬷今天很高兴，跟你聊天。', 'āmā jīntiān hěn gāoxìng, gēn nǐ liáotiān.', 'Ah Ma is happy to chat with you today.'),
        suggestions: [],
        learned: [p('聊天', 'liáotiān', 'to chat')],
      },
    ],
  },
  {
    id: 'drama',
    tone: 'teal',
    glyph: '追',
    title: 'Text a friend about a drama',
    blurb: 'Slang for spoilers, heartbreak and bubble tea plans.',
    doneLine: 'You just chatted about a drama in Mandarin.',
    tip: "追剧 (zhuī jù) literally means 'chase a show', like binge-watching. 太...了 (tài ... le) is a handy frame: 太好看了, 太虐了, 太帅了.",
    minutes: 2,
    persona: { name: 'Xiaoyu', native: '小雨', initial: '雨', role: 'Friend on WhatsApp' },
    setting:
      "You are the learner's close friend, texting casually about a Chinese drama you are both into. Use everyday slang naturally: 追剧, 剧透, 太虐了, 真的假的. Topics: whether they follow the show, favourite characters, no spoilers, plans to watch together over bubble tea.",
    script: [
      {
        ai: p('你有在追最近那部剧吗？我已经看到第十集了！', 'nǐ yǒu zài zhuī zuìjìn nà bù jù ma? wǒ yǐjīng kàndào dì shí jí le!', "Are you following that show? I'm already on episode 10!"),
        suggestions: [
          p('有啊！我也在追。', 'yǒu a! wǒ yě zài zhuī.', "Yes! I'm following it too."),
          p('还没，好看吗？', 'hái méi, hǎokàn ma?', 'Not yet, is it good?'),
        ],
        learned: [p('追剧', 'zhuī jù', 'to follow or binge a show')],
      },
      {
        ai: p('太好看了，男主角超帅的！你喜欢哪个角色？', 'tài hǎokàn le, nánzhǔjué chāo shuài de! nǐ xǐhuan nǎ ge juésè?', 'So good, the male lead is super handsome! Which character do you like?'),
        suggestions: [
          p('我喜欢女主角，她很搞笑。', 'wǒ xǐhuan nǚzhǔjué, tā hěn gǎoxiào.', "I like the female lead, she's hilarious."),
          p('我还没看，你先别剧透！', 'wǒ hái méi kàn, nǐ xiān bié jùtòu!', "I haven't watched it, no spoilers yet!"),
        ],
        learned: [p('超帅', 'chāo shuài', 'super handsome')],
      },
      {
        ai: p('哈哈，好啦，不剧透。但是第八集真的太虐了！', 'hā hā, hǎo la, bù jùtòu. dànshì dì bā jí zhēn de tài nüè le!', 'Haha okay, no spoilers. But episode 8 was really heart-wrenching!'),
        suggestions: [
          p('真的假的？我要去看了！', 'zhēn de jiǎ de? wǒ yào qù kàn le!', "Really?! I'm going to watch it now!"),
          p('我看到哭了。', 'wǒ kàn dào kū le.', 'I cried while watching it.'),
        ],
        learned: [
          p('剧透', 'jùtòu', 'spoiler'),
          p('太虐了', 'tài nüè le', 'so heart-wrenching'),
        ],
      },
      {
        ai: p('周末要不要一起看？我请你喝奶茶！', 'zhōumò yào bú yào yìqǐ kàn? wǒ qǐng nǐ hē nǎichá!', "Want to watch together this weekend? My treat, bubble tea!"),
        suggestions: [
          p('好啊，一言为定！', 'hǎo a, yì yán wéi dìng!', "Okay, it's a deal!"),
          p('周末有事，改天可以吗？', 'zhōumò yǒu shì, gǎitiān kěyǐ ma?', "I'm busy this weekend, another day?"),
        ],
        learned: [p('我请你', 'wǒ qǐng nǐ', "my treat")],
      },
      {
        ai: p('太好了！那就这么说定了，周末见！', 'tài hǎo le! nà jiù zhème shuōdìng le, zhōumò jiàn!', "Great! It's settled then, see you this weekend!"),
        suggestions: [],
        learned: [p('一言为定', 'yì yán wéi dìng', "it's a deal")],
      },
    ],
  },
];


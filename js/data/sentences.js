// Sentences & grammar. tokens are tapped in order for "build" questions;
// `blank` is the index of the particle hidden in "particle" questions.

export const GRAMMAR = {
  desu:     { ja: '〜です',         en: '"It is ~"', tip: 'です goes at the end to say what something is.' },
  korewa:   { ja: 'これは 〜です',  en: '"This is ~"', tip: 'これ = this. は (said "wa") marks the topic.' },
  nan:      { ja: '〜は なんですか', en: '"What is ~?"', tip: 'か at the end makes a question.' },
  suki:     { ja: '〜が すきです',  en: '"I like ~"', tip: 'が comes before すき (like).' },
  adj:      { ja: '〜は おおきいです', en: 'describing words', tip: 'Describing words come before です.' },
  no:       { ja: '〜の 〜',        en: '"~\'s ~" (belongs to)', tip: 'の links two things: わたしの ねこ = my cat.' },
  kudasai:  { ja: '〜を ください',  en: '"~, please"', tip: 'を (said "o") marks the thing you want.' },
  wo:       { ja: '〜を 〜ます',    en: 'doing something', tip: 'を marks what you eat, drink or see.' },
  ni:       { ja: '〜に いきます',  en: '"go to ~"', tip: 'に marks where you are going.' },
  masen:    { ja: '〜ません',       en: '"don\'t ~"', tip: 'ます → ません makes it "not".' },
  mashita:  { ja: '〜ました',       en: '"did ~"', tip: 'ます → ました makes it past.' },
  to:       { ja: '〜と 〜',        en: '"~ and ~"', tip: 'と joins two things.' },
};

const S = [
  // unit 1 — です
  ['s_ringo_desu',  1, 'desu',    'りんご です',            "It's an apple.",           '🍎',  -1],
  ['s_neko_desu',   1, 'desu',    'ねこ です',              "It's a cat.",              '🐱',  -1],
  ['s_inu_desu',    1, 'desu',    'いぬ です',              "It's a dog.",              '🐶',  -1],
  ['s_kasa_desu',   1, 'desu',    'かさ です',              "It's an umbrella.",        '☂️',  -1],
  ['s_hai',         1, 'desu',    'はい そう です',          'Yes, that\'s right.',      '⭕',  -1],

  // unit 2 — これは 〜です / なんですか
  ['s_kore_ringo',  2, 'korewa',  'これ は りんご です',     'This is an apple.',        '👇🍎', 1],
  ['s_kore_tokei',  2, 'korewa',  'これ は とけい です',     'This is a clock.',         '👇⏰', 1],
  ['s_kore_hoshi',  2, 'korewa',  'これ は ほし です',       'This is a star.',          '👇⭐', 1],
  ['s_kore_sakana', 2, 'korewa',  'これ は さかな です',     'This is a fish.',          '👇🐟', 1],
  ['s_kore_nan',    2, 'nan',     'これ は なん です か',    'What is this?',            '👇❓', 1],
  ['s_are_nan',     2, 'nan',     'あれ は なん です か',    'What is that over there?', '👉❓', 1],
  ['s_aka_desu',    2, 'desu',    'りんご は あか です',     'The apple is red.',        '🍎🔴', 1],
  ['s_ao_desu',     2, 'desu',    'そら は あお です',       'The sky is blue.',         '🌤️🔵', 1],

  // unit 3 — すき / adjectives / の
  ['s_suki_ichigo', 3, 'suki',    'いちご が すき です',     'I like strawberries.',     '🍓❤️', 1],
  ['s_suki_neko',   3, 'suki',    'ねこ が すき です',       'I like cats.',             '🐱❤️', 1],
  ['s_suki_umi',    3, 'suki',    'うみ が すき です',       'I like the sea.',          '🌊❤️', 1],
  ['s_suki_sushi',  3, 'suki',    'すし が だいすき です',   'I love sushi.',            '🍣💖', 1],
  ['s_ookii_zou',   3, 'adj',     'ぞう は おおきい です',   'Elephants are big.',       '🐘⬆️', 1],
  ['s_chiisai_ari', 3, 'adj',     'あり は ちいさい です',   'Ants are small.',          '🐜⬇️', 1],
  ['s_kawaii_neko', 3, 'adj',     'ねこ は かわいい です',   'Cats are cute.',           '🐱🥰', 1],
  ['s_no_neko',     3, 'no',      'わたし の ねこ です',     "It's my cat.",             '🙋🐱', 1],
  ['s_no_kasa',     3, 'no',      'せんせい の かさ です',   "It's the teacher's umbrella.", '🧑‍🏫☂️', 1],
  ['s_mittsu',      3, 'desu',    'りんご が みっつ',        'Three apples.',            '🍎🍎🍎', 1],

  // unit 4 — ください / weather / hot & cold
  ['s_kudasai_onigiri', 4, 'kudasai', 'おにぎり を ください', 'An onigiri, please.',   '🍙🙏', 1],
  ['s_kudasai_mizu',    4, 'kudasai', 'みず を ください',     'Water, please.',        '🚰🙏', 1],
  ['s_kudasai_mikan',   4, 'kudasai', 'みかん を ください',   'A mandarin, please.',   '🍊🙏', 1],
  ['s_kudasai_kusuri',  4, 'kudasai', 'おくすり を ください', 'Medicine, please.',     '💊🙏', 1],
  ['s_hare',        4, 'desu',    'きょう は はれ です',     "It's sunny today.",        '☀️',  1],
  ['s_ame',         4, 'desu',    'きょう は あめ です',     "It's rainy today.",        '☔',  1],
  ['s_atsui',       4, 'adj',     'なつ は あつい です',     'Summer is hot.',           '🥵',  1],
  ['s_samui',       4, 'adj',     'ふゆ は さむい です',     'Winter is cold.',          '🥶',  1],
  ['s_oishii',      4, 'adj',     'みかん は おいしい です', 'Mandarins are tasty.',     '🍊😋', 1],

  // unit 5 — を 〜ます / に いきます
  ['s_taberu_ringo', 5, 'wo',     'りんご を たべます',      'I eat an apple.',          '🍎😋', 1],
  ['s_taberu_gohan', 5, 'wo',     'ごはん を たべます',      'I eat rice.',              '🍚😋', 1],
  ['s_nomu_mizu',    5, 'wo',     'みず を のみます',        'I drink water.',           '🚰🥤', 1],
  ['s_nomu_ocha',    5, 'wo',     'おちゃ を のみます',      'I drink tea.',             '🍵🥤', 1],
  ['s_miru_hoshi',   5, 'wo',     'ほし を みます',          'I look at the stars.',     '⭐👀', 1],
  ['s_miru_hon',     5, 'wo',     'ほん を よみます',        'I read a book.',           '📖👀', 1],
  ['s_iku_umi',      5, 'ni',     'うみ に いきます',        'I go to the sea.',         '🌊🚶', 1],
  ['s_iku_gakkou',   5, 'ni',     'がっこう に いきます',    'I go to school.',          '🏫🚶', 1],
  ['s_iku_yama',     5, 'ni',     'やま に いきます',        'I go to the mountain.',    '⛰️🚶', 1],
  ['s_iku_mise',     5, 'ni',     'みせ に いきます',        'I go to the shop.',        '🏪🚶', 1],

  // unit 6 — ません / ました / と
  ['s_tabemasen',    6, 'masen',  'にんじん を たべません',  "I don't eat carrots.",     '🥕🙅', 1],
  ['s_nomimasen',    6, 'masen',  'ぎゅうにゅう を のみません', "I don't drink milk.",   '🥛🙅', 1],
  ['s_ikimasen',     6, 'masen',  'がっこう に いきません',  "I don't go to school.",    '🏫🙅', 1],
  ['s_tabemashita',  6, 'mashita','すし を たべました',      'I ate sushi.',             '🍣✅', 1],
  ['s_ikimashita',   6, 'mashita','うみ に いきました',      'I went to the sea.',       '🌊✅', 1],
  ['s_mimashita',    6, 'mashita','にじ を みました',        'I saw a rainbow.',         '🌈✅', 1],
  ['s_to_inu_neko',  6, 'to',     'いぬ と ねこ が すき です', 'I like dogs and cats.',   '🐶🐱', 1],
  ['s_to_okaasan',   6, 'to',     'おかあさん と うみ に いきました', 'I went to the sea with Mom.', '👩🌊', 1],
  ['s_ojiichan',     6, 'no',     'おじいちゃん の めがね です', "It's Grandpa's glasses.", '👴👓', 1],
];

export const SENTENCES = S.map(([id, unit, gram, ja, en, pic, blank]) => ({
  id, unit, gram, ja, en, pic, tokens: ja.split(' '), blank,
}));
export const SEN = Object.fromEntries(SENTENCES.map(s => [s.id, s]));

export const PARTICLES = ['は', 'が', 'を', 'に', 'の', 'と', 'で', 'も'];

// Situations for greeting questions: what do you say when…
export const SITUATIONS = [
  { pic: '🌅👋', en: 'You meet a friend in the morning.', answer: 'おはよう' },
  { pic: '☀️👋', en: 'You meet someone in the afternoon.', answer: 'こんにちは' },
  { pic: '🌙👋', en: 'You meet someone in the evening.', answer: 'こんばんは' },
  { pic: '🎁😊', en: 'Someone gives you a present.', answer: 'ありがとう' },
  { pic: '🏠👋', en: 'You are leaving to go home.', answer: 'さようなら' },
  { pic: '🛏️😴', en: 'You are going to bed.', answer: 'おやすみ' },
  { pic: '🍚🥢', en: 'You are about to eat.', answer: 'いただきます', unit: 2 },
  { pic: '🍽️😋', en: 'You finished eating.', answer: 'ごちそうさま', unit: 2 },
  { pic: '💥😣', en: 'You bumped into someone.', answer: 'ごめんね', unit: 2 },
  { pic: '🤝🙂', en: 'You meet someone for the first time.', answer: 'はじめまして' },
];

// Everyday vocabulary beyond the creature names.
// pic: emoji, or {color:'#hex'} swatch, or {count:n} dots. unit: lesson unit that unlocks it.

const V = [
  // greetings — unit 1
  ['ohayou',     'おはよう',     'good morning',  '🌅', 'greet', 1],
  ['konnichiwa', 'こんにちは',   'hello',         '☀️', 'greet', 1],
  ['konbanwa',   'こんばんは',   'good evening',  '🌙', 'greet', 1],
  ['arigatou',   'ありがとう',   'thank you',     '🙏', 'greet', 1],
  ['sayounara',  'さようなら',   'goodbye',       '👋', 'greet', 1],
  ['oyasumi',    'おやすみ',     'good night',    '😴', 'greet', 1],
  ['itadakimasu','いただきます', "let's eat!",    '🍚', 'greet', 2],
  ['gochisousama','ごちそうさま','thanks for the meal', '😋', 'greet', 2],
  ['gomenne',    'ごめんね',     'sorry',         '🙇', 'greet', 2],
  ['hajimemashite','はじめまして','nice to meet you','🤝', 'greet', 1],

  // colors — unit 2
  ['aka',        'あか',         'red',           { color: '#e83b3b' }, 'color', 2],
  ['ao',         'あお',         'blue',          { color: '#3b7be8' }, 'color', 2],
  ['kiiro',      'きいろ',       'yellow',        { color: '#f7d038' }, 'color', 2],
  ['midori',     'みどり',       'green',         { color: '#3fb34f' }, 'color', 2],
  ['shiro',      'しろ',         'white',         { color: '#ffffff' }, 'color', 2],
  ['kuro',       'くろ',         'black',         { color: '#222222' }, 'color', 2],
  ['chairo',     'ちゃいろ',     'brown',         { color: '#8b5a2b' }, 'color', 3],
  ['murasaki',   'むらさき',     'purple',        { color: '#8e44ad' }, 'color', 3],

  // numbers — unit 2
  ['ichi',  'いち',  'one',   { count: 1 }, 'number', 2],
  ['ni',    'に',    'two',   { count: 2 }, 'number', 2],
  ['san',   'さん',  'three', { count: 3 }, 'number', 2],
  ['yon',   'よん',  'four',  { count: 4 }, 'number', 2],
  ['go',    'ご',    'five',  { count: 5 }, 'number', 2],
  ['roku',  'ろく',  'six',   { count: 6 }, 'number', 3],
  ['nana',  'なな',  'seven', { count: 7 }, 'number', 3],
  ['hachi_n','はち', 'eight', { count: 8 }, 'number', 3],
  ['kyuu',  'きゅう','nine',  { count: 9 }, 'number', 3],
  ['juu',   'じゅう','ten',   { count: 10 }, 'number', 3],

  // counting things — unit 3
  ['hitotsu', 'ひとつ', 'one (thing)',   { count: 1, thing: '🍎' }, 'count', 3],
  ['futatsu', 'ふたつ', 'two (things)',  { count: 2, thing: '🍎' }, 'count', 3],
  ['mittsu',  'みっつ', 'three (things)',{ count: 3, thing: '🍎' }, 'count', 3],
  ['yottsu',  'よっつ', 'four (things)', { count: 4, thing: '🍎' }, 'count', 3],
  ['itsutsu', 'いつつ', 'five (things)', { count: 5, thing: '🍎' }, 'count', 3],

  // body — unit 3
  ['me',    'め',    'eye',   '👁️', 'body', 3],
  ['te',    'て',    'hand',  '✋', 'body', 3],
  ['ashi',  'あし',  'foot',  '🦶', 'body', 3],
  ['mimi',  'みみ',  'ear',   '👂', 'body', 3],
  ['hana_b','はな',  'nose',  '👃', 'body', 3],
  ['kuchi', 'くち',  'mouth', '👄', 'body', 3],
  ['atama', 'あたま','head',  '🙆', 'body', 3],

  // adjectives — unit 3/4
  ['ookii',   'おおきい', 'big',      '🐘', 'adj', 3],
  ['chiisai', 'ちいさい', 'small',    '🐜', 'adj', 3],
  ['atsui',   'あつい',   'hot',      '🥵', 'adj', 4],
  ['samui',   'さむい',   'cold',     '🥶', 'adj', 4],
  ['kawaii',  'かわいい', 'cute',     '🥰', 'adj', 3],
  ['oishii',  'おいしい', 'tasty',    '😋', 'adj', 4],
  ['hayai',   'はやい',   'fast',     '💨', 'adj', 4],
  ['tanoshii','たのしい', 'fun',      '😄', 'adj', 4],
  ['tsuyoi',  'つよい',   'strong',   '💪', 'adj', 4],

  // weather — unit 4
  ['hare',   'はれ',   'sunny',  '☀️', 'weather', 4],
  ['ame',    'あめ',   'rain',   '☔', 'weather', 4],
  ['kumori', 'くもり', 'cloudy', '🌥️', 'weather', 4],
  ['kaze',   'かぜ',   'wind',   '🌬️', 'weather', 4],

  // places — unit 4/5
  ['ie',      'いえ',     'house',   '🏠', 'place', 2],
  ['gakkou',  'がっこう', 'school',  '🏫', 'place', 5],
  ['kouen',   'こうえん', 'park',    '🛝', 'place', 5],
  ['mise',    'みせ',     'shop',    '🏪', 'place', 2],
  ['eki',     'えき',     'station', '🚉', 'place', 4],
  ['kawa',    'かわ',     'river',   '🏞️', 'place', 3],
  ['machi',   'まち',     'town',    '🏘️', 'place', 3],
  ['byouin',  'びょういん','hospital','🏥', 'place', 2],

  // food & drink — unit 2/4
  ['mizu',    'みず',     'water',   '🚰', 'food', 2],
  ['ocha',    'おちゃ',   'tea',     '🍵', 'food', 6],
  ['gyuunyuu','ぎゅうにゅう','milk', '🥛', 'food', 6],
  ['niku',    'にく',     'meat',    '🍖', 'food', 4],
  ['yasai',   'やさい',   'vegetables','🥬', 'food', 4],
  ['okashi',  'おかし',   'sweets',  '🍬', 'food', 4],
  ['okusuri', 'おくすり', 'medicine','💊', 'food', 2],

  // family — unit 6
  ['okaasan', 'おかあさん','mom',          '👩', 'family', 6],
  ['otousan', 'おとうさん','dad',          '👨', 'family', 6],
  ['oneesan', 'おねえさん','big sister',   '👧', 'family', 6],
  ['oniisan', 'おにいさん','big brother',  '👦', 'family', 6],
  ['obaachan','おばあちゃん','grandma',    '👵', 'family', 6],
  ['ojiichan','おじいちゃん','grandpa',    '👴', 'family', 6],
  ['akachan', 'あかちゃん','baby',         '👶', 'family', 6],
  ['tomodachi','ともだち','friend',        '🧑‍🤝‍🧑', 'family', 4],

  // verbs (polite) — unit 5
  ['tabemasu', 'たべます', 'eat',   '🍽️', 'verb', 5],
  ['nomimasu', 'のみます', 'drink', '🥤', 'verb', 5],
  ['mimasu',   'みます',   'see / watch', '👀', 'verb', 5],
  ['ikimasu',  'いきます', 'go',    '🚶', 'verb', 5],
  ['nemasu',   'ねます',   'sleep', '🛌', 'verb', 5],
  ['hashirimasu','はしります','run', '🏃', 'verb', 5],
  ['oyogimasu','およぎます','swim', '🏊', 'verb', 5],
  ['yomimasu', 'よみます', 'read',  '📖', 'verb', 5],
  ['asobimasu','あそびます','play', '🤸', 'verb', 5],
  ['utaimasu', 'うたいます','sing', '🎤', 'verb', 5],

  // days of the week — unit 5 (each tied to a daily bonus)
  ['nichiyoubi','にちようび','Sunday',    '☀️', 'day', 5],
  ['getsuyoubi','げつようび','Monday',    '🌙', 'day', 5],
  ['kayoubi',   'かようび',  'Tuesday',   '🔥', 'day', 5],
  ['suiyoubi',  'すいようび','Wednesday', '💧', 'day', 5],
  ['mokuyoubi', 'もくようび','Thursday',  '🌳', 'day', 5],
  ['kinyoubi',  'きんようび','Friday',    '🪙', 'day', 5],
  ['doyoubi',   'どようび',  'Saturday',  '🪨', 'day', 5],

  // time of day
  ['asa',   'あさ',  'morning', '🌄', 'time', 3],
  ['hiru',  'ひる',  'noon',    '🌞', 'time', 3],
  ['yoru_t','よる',  'night',   '🌃', 'time', 3],

  // little words
  ['watashi','わたし','I / me',  '🙋', 'pron', 4],
  ['boku',   'ぼく',  'I (boy)', '🙋‍♂️', 'pron', 5],
  ['kore',   'これ',  'this',    '👇', 'pron', 2],
  ['nani',   'なに',  'what',    '❓', 'pron', 2],
  ['doko',   'どこ',  'where',   '🗺️', 'pron', 4],
  ['hai',    'はい',  'yes',     '⭕', 'pron', 1],
  ['iie',    'いいえ','no',      '❌', 'pron', 1],
  ['en',     'えん',  'yen',     '💴', 'pron', 2],
];

export const VOCAB = V.map(([id, word, en, pic, cat, unit]) => ({ id, word, en, pic, cat, unit }));
export const VOC = Object.fromEntries(VOCAB.map(v => [v.id, v]));

// Day-of-week bonuses: index = Date.getDay(). Favoured creature categories / ids.
export const DAYS = [
  { id: 'nichiyoubi', ja: 'にちようび', en: 'Sunday',    icon: '☀️', bonus: { ids: ['niji', 'hoshi'], cats: [] },        tip: 'にじもんに あえるかも！', tipEn: 'You might meet a rainbow!' },
  { id: 'getsuyoubi', ja: 'げつようび', en: 'Monday',    icon: '🌙', bonus: { ids: ['tsuki', 'mangetsu'], cats: [] },    tip: 'つきもんが でやすいよ！', tipEn: 'Moon kanamon appear more!' },
  { id: 'kayoubi',    ja: 'かようび',   en: 'Tuesday',   icon: '🔥', bonus: { ids: ['rousoku', 'chouchin'], cats: ['fire'] }, tip: 'ひの かなもんが げんき！', tipEn: 'Fire kanamon are lively!' },
  { id: 'suiyoubi',   ja: 'すいようび', en: 'Wednesday', icon: '💧', bonus: { ids: [], cats: ['sea'] },                 tip: 'うみの かなもんが いっぱい！', tipEn: 'Lots of sea kanamon!' },
  { id: 'mokuyoubi',  ja: 'もくようび', en: 'Thursday',  icon: '🌳', bonus: { ids: [], cats: ['nature'] },              tip: 'しぜんの かなもんが いっぱい！', tipEn: 'Lots of nature kanamon!' },
  { id: 'kinyoubi',   ja: 'きんようび', en: 'Friday',    icon: '🪙', bonus: { ids: [], cats: ['ride', 'home'] },        tip: 'おかねが にばい！', tipEn: 'Double coins today!' },
  { id: 'doyoubi',    ja: 'どようび',   en: 'Saturday',  icon: '🪨', bonus: { ids: ['ishi', 'iwa', 'yama'], cats: [] }, tip: 'いわの かなもんが でやすいよ！', tipEn: 'Rock kanamon appear more!' },
];

// Items, shop stock, garden seeds and the creatures that hide in houses.

export const ITEMS = {
  onigiri: { ja: 'おにぎり',   en: 'Rice ball',     icon: '🍙', price: 50,  desc: 'HPを 30 かいふく', descEn: 'Heals 30 HP', heal: 30 },
  kusuri:  { ja: 'おくすり',   en: 'Medicine',      icon: '💊', price: 150, desc: 'HPを ぜんぶ かいふく', descEn: 'Fully heals', heal: 999 },
  ami:     { ja: 'あみ',       en: 'Net',           icon: '🥅', price: 100, desc: 'つかまえやすく なる', descEn: 'Easier catching' },
  ame:     { ja: 'げんきあめ', en: 'Power candy',   icon: '🍬', price: 400, desc: 'レベルが 1 あがる', descEn: 'Raises level by 1' },
  ichigo_f:{ ja: 'いちご',     en: 'Strawberry',    icon: '🍓', price: 0,   desc: 'HPを 50 かいふく', descEn: 'Heals 50 HP', heal: 50, fruit: true },
  mikan_f: { ja: 'みかん',     en: 'Mandarin',      icon: '🍊', price: 0,   desc: 'HPを 60 かいふく', descEn: 'Heals 60 HP', heal: 60, fruit: true },
  momo_f:  { ja: 'もも',       en: 'Peach',         icon: '🍑', price: 0,   desc: 'HPを 80 かいふく', descEn: 'Heals 80 HP', heal: 80, fruit: true },
  budou_f: { ja: 'ぶどう',     en: 'Grapes',        icon: '🍇', price: 0,   desc: 'HPを ぜんぶ かいふく', descEn: 'Fully heals', heal: 999, fruit: true },
};

export const SHOP = ['onigiri', 'kusuri', 'ami', 'ame'];

// Garden seeds: grow in real time; harvest by spelling the fruit.
export const SEEDS = {
  ichigo: { ja: 'いちごの たね', en: 'Strawberry seed', fruit: 'ichigo_f', word: 'いちご', icon: '🍓', price: 30, hours: 2 },
  mikan:  { ja: 'みかんの たね', en: 'Mandarin seed',   fruit: 'mikan_f',  word: 'みかん', icon: '🍊', price: 40, hours: 4 },
  momo:   { ja: 'ももの たね',   en: 'Peach seed',      fruit: 'momo_f',   word: 'もも',   icon: '🍑', price: 60, hours: 8 },
  budou:  { ja: 'ぶどうの たね', en: 'Grape seed',      fruit: 'budou_f',  word: 'ぶどう', icon: '🍇', price: 80, hours: 12 },
};

// Household kanamon that hide inside houses (one find per house per day).
export const HOUSE_POOL = ['megane', 'enpitsu', 'rappa', 'tegami', 'hon', 'hasami', 'reizouko', 'tokei', 'kasa', 'makura', 'yakan', 'rousoku', 'nuigurumi'];

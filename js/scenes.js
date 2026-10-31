// Building interiors: home, lab (story start), hospital, shop, dojo (teachers), houses, station, onsen, tower.
import { MAPS, MASTERS, STORY, LOOK, BUILDING_SIZE } from './data/maps.js';
import { MON, KANAMON, STARTERS } from './data/kanamon.js';
import { ITEMS, SHOP, SEEDS, HOUSE_POOL } from './data/items.js';
import { LINES } from './data/lines.js';
import { st, save, makeMon, addMon, healAll, caughtCount, unit, maxHp, today } from './state.js';
import { W, fadeSwap, loadMap, refreshGates, setPlayer } from './world.js';
import { battle } from './battle.js';
import { overlay, closeOverlay, dialog, choose, yesNo, toast, onTap, $, $$, sleep, esc, en, askQuestion, celebrate, kanaKeyboard, picHtml } from './ui.js';
import { say, sfx, music, jingle } from './audio.js';
import { portraitUrl } from './art/people.js';
import { painted } from './art/painted.js';
import { monTag, monUrl } from './art/creatures.js';
import { catchCard } from './screens/card.js';
import { lesson } from './screens/lesson.js';
import { giveEgg } from './daily.js';
import { updateHud } from './hud.js';
import { loseFlow } from './events.js';
import { shuffle } from './srs.js';

const said = (lines, who) => lines.map(l => ({ ...l, who }));
const TITLES = {
  home: ['きみの いえ', 'Your house'], lab: ['けんきゅうじょ', 'Laboratory'], hospital: ['びょういん', 'Hospital'], shop: ['みせ', 'Shop'],
  dojo: ['どうじょう', 'Dojo'], house: ['いえ', 'House'], station: ['えき', 'Station'], onsen: ['おんせん', 'Hot spring'], tower: ['かなの とう', 'Kana Tower'],
};
const HOST = {
  home: { look: { pid: 'mom', kind: 'adult', hair: '#5a3220', hairStyle: 'bun', shirt: '#ffb26b', pants: '#6b4f8a' }, name: 'おかあさん' },
  lab: { look: { pid: 'professor', kind: 'old', hair: '#eeeeee', hairStyle: 'bald', shirt: '#ffffff', pants: '#5b6b8a' }, name: 'ことば はかせ' },
  hospital: { look: { pid: 'nurse', kind: 'adult', hair: '#c45c7a', hairStyle: 'bun', shirt: '#ffc2d6', pants: '#ffffff', hat: '#ffffff' }, name: 'かんごしさん' },
  shop: { look: { pid: 'shopkeeper', kind: 'adult', hair: '#2b1d16', hairStyle: 'short', shirt: '#3f8fe0', pants: '#2f3b55' }, name: 'てんいんさん' },
  station: { look: { pid: 'stationmaster', kind: 'adult', hair: '#2b1d16', hairStyle: 'short', shirt: '#2c7d61', pants: '#1f3b30', hat: '#2c7d61' }, name: 'えきいんさん' },
  onsen: { look: { pid: 'grandma', kind: 'old', hair: '#dcdcdc', hairStyle: 'bun', shirt: '#7a5a9e', pants: '#5e4580' }, name: 'おばあさん' },
  tower: { look: LOOK.man, name: 'とうの ばんにん' },
};

const DECO = {
  home: ['🪴', '🖼️', '📺', '🧸', '🪴'], lab: ['📚', '🔬', '🧪', '🖥️', '📚'], hospital: ['💊', '🩹', '💖', '🩺', '💊'],
  shop: ['🍙', '💊', '🥅', '🍬', '🌱'], dojo: ['🎌', '🥋', '🏮', '🥋', '🎌'], house: ['🪴', '🖼️', '🕰️', '📚', '🪴'],
  station: ['🚃', '🕰️', '🗺️', '🎫', '🚄'], onsen: ['🎋', '🧺', '♨️', '🪣', '🎋'], tower: ['🏮', '⚔️', '🗼', '⚔️', '🏮'],
};

// room: which painted backdrop to use when it differs from kind (the dojo scene also serves the castle and observatory).
function sceneShell(kind, title, host, room = kind) {
  const [ja, e] = title || TITLES[kind] || TITLES.house;
  const bg = painted('bg/in_' + room);
  return overlay(`<div class="scene kind-${kind}${bg ? ' painted' : ''}">
    ${bg ? `<img class="sc-paint" src="${bg}" alt="">` : ''}
    <div class="sc-wall"><div class="sc-window"></div><div class="sc-shelf">${(DECO[kind] || DECO.house).map(d => `<span>${d}</span>`).join('')}</div><div class="sc-window"></div></div>
    <div class="sc-title">${esc(ja)}${en(e)}</div>
    <div class="sc-room"><div class="sc-host">${host ? `<img src="${portraitUrl(host, 220)}" alt="">` : ''}</div><div class="sc-counter"></div></div>
    <div class="sc-actions"></div>
    <button class="sc-exit">でる ✕</button>
  </div>`, 'scene-overlay');
}

function actions(o, list) {
  return new Promise(res => {
    const box = $('.sc-actions', o);
    box.innerHTML = list.map((a, i) => `<button class="btn big" data-i="${i}">${a.icon || ''} ${esc(a.ja)}${en(a.en)}</button>`).join('');
    $$('button', box).forEach(b => onTap(b, () => { sfx('tap'); box.innerHTML = ''; res(list[+b.dataset.i].id); }));
    onTap($('.sc-exit', o), () => { box.innerHTML = ''; res('exit'); });
  });
}

const exitScene = (o) => { sfx('door'); closeOverlay(o); };

export async function enterScene(b) {
  W.busy++;
  sfx('door');
  try {
    const fn = { home, lab, hospital, shop, dojo, house, station, onsen, tower }[b.scene];
    if (fn) await fn(b);
  } finally { W.busy--; updateHud(); save(); }
}

function setHeal(b) {
  const [w, h] = BUILDING_SIZE[b.kind];
  st().heal = { map: W.mapId, x: b.x + Math.floor(w / 2), y: b.y + h };
}

// ── home ──────────────────────────────────────────────────
async function home(b) {
  const o = sceneShell('home', null, HOST.home.look);
  setHeal(b);
  if (!st().flags.starter) {
    await dialog(said([STORY.extra[3]], HOST.home.name));
    return exitScene(o);
  }
  await dialog(said(STORY.home, HOST.home.name));
  healAll(); sfx('heal');
  toast('💖 みんな げんきに なった！ <small>Everyone is healed!</small>');
  if (!st().flags.garden_tip) { st().flags.garden_tip = true; await dialog(said(STORY.home_garden, HOST.home.name)); }
  exitScene(o);
}

// ── lab & the opening ─────────────────────────────────────
async function lab(b) {
  const s = st();
  const o = sceneShell('lab', null, HOST.lab.look);
  const who = HOST.lab.name;
  if (!s.flags.starter) {
    music('town');
    await dialog(said(STORY.lab_intro, who));
    if (!s.name) s.name = await kanaKeyboard({ title: 'なまえを いれてね', titleEn: 'Type your name in hiragana', max: 6 });
    await dialog(said([{ ja: `${s.name}！ いい なまえ じゃ！ では、 なかまを ひとり えらんで おくれ。`, en: `${s.name}! What a nice name! Now, choose a partner.`, audio: STORY.lab_choose[0].ja }], who));
    const id = await chooseStarter();
    const m = makeMon(id, 5);
    addMon(m);
    s.flags.starter = true; s.flags.starterId = id;
    s.dex[id].first = Date.now();
    save();
    await catchCard(id, { isNew: true });
    const nick = await yesNo({ ja: 'ニックネームを つける？', en: 'Give it a nickname?' });
    if (nick) {
      m.nick = await kanaKeyboard({ title: 'ニックネーム', titleEn: id === 'hinoko' ? 'Nickname (how about ぽかこ?)' : 'Nickname', max: 6, initial: '' });
      save();
    }
    await dialog(said(STORY.lab_after_choose, who));
    $('.sc-host img', o).src = portraitUrl(LOOK.sora, 220);
    await dialog(said(STORY.sora_intro, 'そら'));
    $('.sc-host img', o).src = portraitUrl(HOST.lab.look, 220);
    await dialog(said([STORY.extra[4]], who));
    closeOverlay(o);
    await lesson(1);
    refreshGates();
    toast('📖 かなもんずかんを もらった！ <small>Got the Kanamon Dex!</small>', 3000);
    s.heal = { map: 'sakura', x: 5, y: 10 };
    save();
    return;
  }
  const n = caughtCount();
  await dialog([{ who, ja: `ずかんは ${n}ひき！ ${n >= 90 ? 'すばらしい！' : n >= 50 ? 'すごいぞ！' : n >= 20 ? 'いいね！' : 'その ちょうし じゃ！'}`, en: `Your dex has ${n}! ${n >= 50 ? 'Amazing!' : 'Keep it up!'}`, voice: false }]);
  if (s.badges.length >= 1 && !s.flags.egg1) {
    s.flags.egg1 = true; giveEgg();
    await dialog(said([STORY.extra[5]], who));
    toast('🥚 たまごを もらった！');
  }
  if (s.flags.champion && n >= 80 && !s.dex.n?.caught) await dialog(said(STORY.lab_dexdone, who));
  else await dialog(said(STORY.lab_later, who));
  exitScene(o);
}

function chooseStarter() {
  return new Promise(res => {
    const o = overlay(`<div class="starter">
      <div class="st-title">なかまを えらぼう！${en('Choose your partner!')}</div>
      <div class="st-row">${STARTERS.map(id => `<button class="st-card" data-id="${id}">${monTag(id)}<b>${MON[id].name}</b><small>${MON[id].word} = ${MON[id].en}</small></button>`).join('')}</div>
    </div>`, 'starter-overlay');
    $$('.st-card', o).forEach(b => onTap(b, async () => {
      const id = b.dataset.id;
      sfx('tap'); say([MON[id].name]);
      $$('.st-card', o).forEach(x => x.classList.toggle('sel', x === b));
      await sleep(400);
      const ok = await yesNo({ ja: `${MON[id].name}に する？`, en: `Choose ${MON[id].en}-mon?` });
      if (ok) { closeOverlay(o); res(id); }
      else $$('.st-card', o).forEach(x => x.classList.remove('sel'));
    }));
  });
}

// ── hospital ──────────────────────────────────────────────
async function hospital(b) {
  const s = st(), who = HOST.hospital.name;
  const o = sceneShell('hospital', null, HOST.hospital.look);
  setHeal(b);
  await dialog(said(STORY.hospital, who));
  healAll(); sfx('heal');
  $('.sc-room', o).classList.add('healing');
  await sleep(900);
  await dialog(said(STORY.hospital_done, who));
  if (s.flags.train) {
    const id = await actions(o, [{ id: 'travel', icon: '🚃', ja: 'でんしゃで ほかの まちへ', en: 'Take the train to another town' }, { id: 'exit', icon: '👋', ja: 'さようなら', en: 'Goodbye' }]);
    if (id === 'travel') { closeOverlay(o); return travel(); }
  }
  exitScene(o);
}

// ── shop: build "X を ください" ──────────────────────────
async function shop() {
  const s = st(), who = HOST.shop.name;
  const o = sceneShell('shop', null, HOST.shop.look);
  await dialog(said(STORY.shop, who));
  for (;;) {
    const goods = [...SHOP.map(k => ({ k, type: 'item', ja: ITEMS[k].ja, en: ITEMS[k].en, icon: ITEMS[k].icon, price: ITEMS[k].price, desc: ITEMS[k].desc })),
      ...Object.entries(SEEDS).filter(([k]) => k !== 'budou' || s.badges.length >= 3).map(([k, v]) => ({ k, type: 'seed', ja: v.ja, word: v.word, en: v.en, icon: v.icon, price: v.price, desc: `${v.hours}じかんで そだつ` }))];
    const pick = await new Promise(res => {
      const box = $('.sc-actions', o);
      box.innerHTML = `<div class="shopgrid">${goods.map((g, i) => `<button class="good" data-i="${i}"><span class="gi">${g.icon}</span><span class="gn">${esc(g.ja)}${en(g.en)}</span><span class="gp">${g.price}えん</span><span class="gd">${esc(g.desc)}</span></button>`).join('')}</div><div class="wallet">💴 ${s.coins}えん</div>`;
      $$('.good', box).forEach(b2 => onTap(b2, () => { sfx('tap'); res(goods[+b2.dataset.i]); }));
      onTap($('.sc-exit', o), () => res(null));
    });
    $('.sc-actions', o).innerHTML = '';
    if (!pick) break;
    // say it in Japanese
    const word = pick.type === 'seed' ? `${pick.word}の たね` : pick.ja;
    const tokens = [word, 'を', 'ください'];
    await dialog(said(STORY.shop_say, who));
    const qo = overlay(`<div class="quizbox"><div class="qz-head">🗣️ ${esc(pick.icon)} ${en('Build the sentence to ask for it!')}</div><div class="qz-host"></div></div>`, 'quiz-overlay');
    await askQuestion({ key: 's:s_kudasai_onigiri', kind: 'tiles', layout: 'words', prompt: { ja: 'ならべて みよう！', en: `"${pick.en}, please."`, pic: pick.icon, audio: [] }, tiles: shuffle([...tokens, 'は']), answer: tokens, explain: { ja: tokens.join(' '), audio: [tokens.join(' ')] } }, $('.qz-host', qo));
    closeOverlay(qo);
    const counts = [['ひとつ', 1], ['みっつ', 3], ['いつつ', 5]].filter(([, n]) => n * pick.price <= s.coins);
    if (!counts.length) { await dialog(said(STORY.shop_poor, who)); continue; }
    const ci = await choose([...counts.map(([w, n]) => ({ ja: `${w} (${n * pick.price}えん)`, en: `${n} for ${n * pick.price} yen` })), { ja: 'やめる', en: 'Never mind' }], { prompt: { ja: 'いくつ？', en: 'How many?' } });
    if (ci >= counts.length) continue;
    const n = counts[ci][1];
    say(counts[ci][0]);
    s.coins -= n * pick.price;
    if (pick.type === 'seed') s.seeds[pick.k] = (s.seeds[pick.k] || 0) + n;
    else s.items[pick.k] = (s.items[pick.k] || 0) + n;
    sfx('coin'); save(); updateHud();
    await dialog(said(STORY.shop_thanks, who));
  }
  exitScene(o);
}

// ── dojo: teachers ────────────────────────────────────────
async function dojo(b) {
  const s = st(), M = MASTERS[b.master];
  const o = sceneShell('dojo', b.master === 'm6' ? ['かなの しろ', 'Kana Castle'] : b.master === 'm5' ? ['てんもんだい', 'Observatory'] : null, M.look,
    b.master === 'm6' ? 'castle' : b.master === 'm5' ? 'observatory' : 'dojo');
  const who = M.name;
  const beaten = s.badges.includes(b.master);
  if (!s.party.length) { await dialog(said([STORY.extra[7]], who)); return exitScene(o); }

  if (beaten) {
    await dialog(said(M.after, who));
    const opts = [{ id: 'rematch', icon: '⚔️', ja: 'もう いちど しょうぶ！', en: 'Rematch! (stronger team)' }, { id: 'lesson', icon: '📖', ja: 'ひらがなを ふくしゅう', en: 'Review the lesson' }];
    if (b.master === 'm6' && caughtCount() >= 80 && !s.dex.n?.caught) opts.unshift({ id: 'legend', icon: '🌀', ja: 'おしろの うえへ…', en: 'To the top of the castle…' });
    opts.push({ id: 'exit', icon: '👋', ja: 'さようなら', en: 'Goodbye' });
    const id = await actions(o, opts);
    if (id === 'lesson') { closeOverlay(o); return lesson(M.unit); }
    if (id === 'legend') { closeOverlay(o); return legend(); }
    if (id === 'rematch') {
      closeOverlay(o);
      const bump = Math.min(25, 8 + (s.flags['re_' + b.master] || 0) * 3);
      const res = await battle({ kind: 'master', enemies: M.team.map(([mid, lv]) => makeMon(mid, Math.min(60, lv + bump))), trainer: { name: M.name, look: M.look }, reward: Math.round(M.reward * 0.6), focusUnit: M.unit });
      if (res === 'win') { s.flags['re_' + b.master] = (s.flags['re_' + b.master] || 0) + 1; await dialog(said([STORY.extra[8]], who)); }
      else if (res === 'lose') await loseFlow();
      return;
    }
    return exitScene(o);
  }

  await dialog(said(M.pre, who));
  closeOverlay(o);
  const res = await battle({ kind: 'master', enemies: M.team.map(([mid, lv]) => makeMon(mid, lv)), trainer: { name: M.name, look: M.look }, reward: M.reward, focusUnit: M.unit });
  if (res !== 'win') {
    await dialog(said(M.lose, who));
    if (res === 'lose') await loseFlow();
    return;
  }
  s.badges.push(b.master);
  save();
  await dialog(said(M.win, who));
  jingle('jingle_badge');
  await celebrate(LINES.badge, { pic: `<div class="stampbig">${M.stamp}</div>`, sub: `${esc(M.name)}の はんこ<br><small>${s.badges.length} / 6</small>` });
  refreshGates();
  updateHud();
  if (b.master === 'm6') return ending();
  await dialog(said([STORY.extra[6]], who));
  await lesson(unit());
  await dialog(said(M.after, who));
}

async function ending() {
  const s = st();
  s.flags.champion = true; save();
  music('title');
  await dialog(said(STORY.ending, 'ことば はかせ'));
  await celebrate({ ja: 'やったね！', en: 'Great job!' }, { pic: '<div class="stampbig">👑</div>', sub: `${esc(s.name)}は かなもんの めいじん！<br><small>${esc(s.name)} is a Kanamon Master!</small>` });
  toast('🗼 かなの とうに はいれるように なった！ <small>The Kana Tower is open!</small>', 3500);
}

async function legend() {
  const s = st();
  await dialog(STORY.legend);
  const res = await battle({ kind: 'master', enemies: [makeMon('n', 50)], trainer: null, reward: 3000, focusUnit: 6, music: 'master' });
  if (res === 'win') {
    // the legend always joins after being defeated
    const m = makeMon('n', 50);
    addMon(m); save();
    await catchCard('n', { isNew: true });
    await celebrate({ ja: 'ぜんぶ あつめた！', en: 'You collected them all!' }, { pic: picHtml({ mon: 'n' }) });
  } else if (res === 'lose') await loseFlow();
}

// ── houses: hide-and-seek kanamon ─────────────────────────
async function house(b) {
  const s = st();
  const idx = [...(b.id || 'h')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const line = STORY.houses[idx % STORY.houses.length];
  const look = [LOOK.woman, LOOK.man, LOOK.girl, LOOK.boy2, LOOK.grandma, LOOK.grandpa][idx % 6];
  const o = sceneShell('house', b.label ? [b.label.ja, b.label.en] : null, look);
  await dialog([{ ...line, who: '' }]);
  if (s.daily.houses[b.id]) { closeOverlay(o); return; }
  s.daily.houses[b.id] = true; save();
  const found = Math.random() < 0.7;
  if (!found) { await dialog(said(STORY.house_empty, '')); return exitScene(o); }
  $('.sc-counter', o).innerHTML = '<div class="peek">❗</div>';
  sfx('encounter');
  await dialog(said(STORY.house_find, ''));
  closeOverlay(o);
  const pool = HOUSE_POOL.filter(id => MON[id].rare < 3 || Math.random() < 0.25);
  const id = pool[Math.floor(Math.random() * pool.length)];
  const lv = Math.max(4, Math.min(40, 4 + s.badges.length * 6 + Math.floor(Math.random() * 3)));
  const res = await battle({ kind: 'wild', enemies: [makeMon(id, lv, Math.random() < 1 / 40)] });
  if (res === 'lose') await loseFlow();
}

// ── station & travel ──────────────────────────────────────
async function station() {
  const s = st(), who = HOST.station.name;
  const o = sceneShell('station', null, HOST.station.look);
  if (!s.flags.train) { s.flags.train = true; save(); toast('🚃 びょういんからも でんしゃに のれるよ！ <small>You can also take the train from any hospital!</small>', 3500); }
  await dialog(said(STORY.station, who));
  closeOverlay(o);
  return travel();
}

async function travel() {
  const s = st();
  const towns = Object.entries(MAPS).filter(([id, m]) => m.town && s.flags['visited_' + id] && id !== W.mapId);
  if (!towns.length) return dialog([{ ja: 'まだ ほかの まちに いったことが ないね。', en: "You haven't visited other towns yet.", voice: false }]);
  const i = await choose([...towns.map(([, m]) => ({ ja: `🚃 ${m.name.ja}`, en: m.name.en })), { ja: 'やめる', en: 'Cancel' }], { prompt: { ja: 'どこへ いく？', en: 'Where to?' } });
  if (i >= towns.length) return;
  const [id, m] = towns[i];
  say(m.name.ja);
  await fadeSwap(() => { loadMap(id, m.heal.x, m.heal.y, 'down'); });
}

// ── onsen ─────────────────────────────────────────────────
async function onsen(b) {
  const o = sceneShell('onsen', null, HOST.onsen.look);
  setHeal(b);
  await dialog(said(STORY.onsen, HOST.onsen.name));
  healAll(); sfx('heal');
  $('.sc-room', o).classList.add('steam');
  toast('♨️ ぽかぽか！ みんな げんき！ <small>Toasty! Everyone is healed!</small>');
  await sleep(1200);
  exitScene(o);
}

// ── tower: endless floors (post-game) ─────────────────────
async function tower() {
  const s = st(), who = HOST.tower.name;
  const o = sceneShell('tower', null, HOST.tower.look);
  if (!s.flags.champion) { await dialog(said(STORY.tower_locked, who)); return exitScene(o); }
  await dialog([...said(STORY.tower, who), { who, ja: `いままでの さいこうは ${s.tower.best}かい。`, en: `Your best is floor ${s.tower.best}.`, voice: false }]);
  const go = await yesNo({ ja: 'のぼる？', en: 'Climb the tower?' });
  closeOverlay(o);
  if (!go) return;
  healAll();
  const pool = KANAMON.filter(m => m.id !== 'n');
  for (let floor = 1; ; floor++) {
    toast(`🗼 ${floor}かい <small>Floor ${floor}</small>`, 1500);
    const lv = Math.min(60, 30 + floor);
    const team = Array.from({ length: floor % 5 === 0 ? 3 : 1 }, () => makeMon(pool[Math.floor(Math.random() * pool.length)].id, lv));
    const res = await battle({ kind: 'tower', enemies: team, trainer: floor % 5 === 0 ? { name: `${floor}かいの ぬし`, look: LOOK.man2 } : null, reward: 50 + floor * 10, focusUnit: 1 + (floor % 6) });
    if (res !== 'win' && res !== 'caught') {
      if (floor - 1 > s.tower.best) s.tower.best = floor - 1;
      save();
      await dialog([{ ja: `${floor - 1}かいまで のぼった！`, en: `You climbed ${floor - 1} floors!`, voice: false }]);
      healAll();
      return;
    }
    if (floor > s.tower.best) s.tower.best = floor;
    if (floor % 5 === 0) { s.items.ame = (s.items.ame || 0) + 1; toast('🍬 げんきあめを もらった！'); }
    for (const m of s.party) m.hp = Math.min(maxHp(m), m.hp + Math.round(maxHp(m) * 0.3));
    save();
    const more = await yesNo({ ja: 'つぎの かいへ？', en: 'Go up to the next floor?' });
    if (!more) { healAll(); return; }
  }
}

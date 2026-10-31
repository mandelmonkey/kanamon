// Story & interaction logic: wires the world hooks to dialogs, battles and scenes.
import { MAPS, RIVAL, STORY, npcLook } from './data/maps.js';
import { MON, STARTERS } from './data/kanamon.js';
import { ITEMS, SEEDS } from './data/items.js';
import { LINES } from './data/lines.js';
import { st, save, makeMon, healAll, caughtCount, today, monName } from './state.js';
import { W, setHooks, loadMap, fadeSwap, setPlayer, refreshGates, isNight, showBubble, hideBubble, walkNpcTo, faceEachOther, seesPlayer } from './world.js';
import { battle } from './battle.js';
import { dialog, choose, yesNo, toast, overlay, closeOverlay, onTap, $, $$, sleep, esc, en, askQuestion, celebrate, picHtml } from './ui.js';
import { say, sfx, music, jingle } from './audio.js';
import { nextQuestion, spellTiles } from './srs.js';
import { progress, dayInfo, eggStep } from './daily.js';
import { enterScene } from './scenes.js';
import { catchCard } from './screens/card.js';
import { fishing } from './screens/fishing.js';
import { updateHud, locationBanner } from './hud.js';

const NAMES = { girl: 'はな', boy: 'けんた', boy2: 'ゆうと', girl2: 'みく', woman: 'おねえさん', woman2: 'おねえさん', man: 'おにいさん', man2: 'おじさん', grandpa: 'おじいさん', grandma: 'おばあさん', guard: 'もんばん', fox: 'きつね', sora: 'そら' };
export const npcName = (n) => n.name || NAMES[n.look] || '';
const said = (lines, who) => lines.map(l => ({ ...l, who }));

let grace = 0;

export function installHooks() {
  setHooks({ interact, stepped, warp, entered, gateOpen, gardenStage });
}

export function gateOpen(g) {
  const s = st();
  if (g.flag) return !!s.flags[g.flag];
  if (g.badges) return s.badges.length >= g.badges;
  return false;
}

export function gardenStage(plot, now = Date.now()) {
  const seed = SEEDS[plot.seed];
  const p = (now - plot.planted) / (seed.hours * 3600e3);
  return p >= 1 ? 3 : p >= 0.4 ? 2 : 1;
}

// ── map transitions ───────────────────────────────────────
async function warp(w) {
  await fadeSwap(() => { loadMap(w.to, w.tx, w.ty, st().dir); });
  grace = 2;
}

function entered(id) {
  const s = st(), m = MAPS[id];
  const first = !s.flags['visited_' + id];
  s.flags['visited_' + id] = true;
  music(m.alwaysNight ? 'night' : m.music === 'town' && isNight() ? 'night' : m.music);
  locationBanner(m.name, first);
  updateHud();
  save();
}

// ── stepping ──────────────────────────────────────────────
async function stepped(x, y, ch) {
  const s = st();
  s.stats.steps++;
  progress('steps');
  if (s.eggs.length) {
    const hatched = eggStep();
    if (hatched) { W.busy++; await hatchScene(hatched); W.busy--; }
  }
  // scripted zones (rival)
  for (const ev of W.map.events || []) {
    const [zx, zy, zw, zh] = ev.zone;
    if (x >= zx && x < zx + zw && y >= zy && y < zy + zh && !s.flags[ev.id] && needMet(ev.need)) {
      W.player.path = [];
      return rivalBattle(ev.id);
    }
  }
  // trainers who can see us
  for (const n of W.npcs) {
    if (n.trainer && !s.flags['tr_' + n.id] && seesPlayer(n)) { W.player.path = []; return trainerBattle(n, true); }
  }
  if (grace > 0) { grace--; return; }
  if (ch === '"' && s.party.length) {
    const rate = W.map.encounters?.rate || 0.1;
    if (Math.random() < rate) { W.player.path = []; grace = 3; await wildBattle('grass'); }
  }
}

function needMet(need) {
  const s = st();
  if (!need) return true;
  if (need === 'starter') return !!s.flags.starter;
  const m = need.match(/^badge(\d)$/);
  if (m) return s.badges.length >= +m[1];
  return !!s.flags[need];
}

// ── wild battles ──────────────────────────────────────────
export function rollWild(kind = 'grass', mapId = W.mapId) {
  const s = st(), table = MAPS[mapId].encounters?.[kind];
  if (!table?.length) return null;
  const night = isNight(), day = dayInfo(), rare = s.daily.rare;
  const opts = table.filter(e => e[4] !== 'night' || night || MAPS[mapId].alwaysNight).map(e => {
    let w = e[3];
    const m = MON[e[0]];
    if (day.bonus.ids.includes(e[0]) || day.bonus.cats.includes(m.cat)) w *= 3;
    if (rare && rare[0] === e[0] && rare[1] === mapId) w *= 5;
    if (!s.dex[e[0]]?.caught) w *= 1.3;
    return [e, w];
  });
  let x = Math.random() * opts.reduce((a, [, w]) => a + w, 0);
  let pick = opts[0][0];
  for (const [e, w] of opts) { x -= w; if (x <= 0) { pick = e; break; } }
  const lv = pick[1] + Math.floor(Math.random() * (pick[2] - pick[1] + 1));
  return makeMon(pick[0], lv, Math.random() < 1 / 40);
}

export async function wildBattle(kind = 'grass', mon = null) {
  const wildMon = mon || rollWild(kind);
  if (!wildMon) return;
  const res = await battle({ kind: 'wild', enemies: [wildMon] });
  await afterBattle(res);
  return res;
}

async function afterBattle(res) {
  updateHud();
  music(W.map.alwaysNight ? 'night' : W.map.music === 'town' && isNight() ? 'night' : W.map.music);
  if (res === 'lose') await loseFlow();
}

export async function loseFlow() {
  const s = st(), h = s.heal || { map: 'sakura', x: 5, y: 10 };
  await fadeSwap(() => { loadMap(h.map, h.x, h.y, 'down'); healAll(); });
  sfx('heal');
  await dialog(said(STORY.hospital_done, 'かんごしさん'));
  updateHud(); save();
}

// ── trainers & rival ──────────────────────────────────────
async function trainerBattle(n, spotted) {
  const s = st();
  W.busy++;
  if (spotted) {
    showBubble(n); sfx('encounter');
    await sleep(700); hideBubble();
    await walkNpcTo(n, W.player.x, W.player.y);
  }
  faceEachOther(n);
  W.player.dir = n.x > W.player.x ? 'right' : n.x < W.player.x ? 'left' : n.y > W.player.y ? 'down' : 'up';
  await dialog(said(n.talk, npcName(n)));
  W.busy--;
  const res = await battle({
    kind: 'trainer', enemies: n.trainer.team.map(([id, lv]) => makeMon(id, lv)),
    trainer: { name: npcName(n), look: npcLook(n) }, reward: n.trainer.reward,
  });
  if (res === 'win') { s.flags['tr_' + n.id] = true; save(); await dialog(said(n.win, npcName(n))); }
  await afterBattle(res);
}

async function rivalBattle(id) {
  const s = st(), r = RIVAL[id];
  W.busy++;
  const starter = s.flags.starterId || 'tane';
  const counter = STARTERS[(STARTERS.indexOf(starter) + 1) % 3];
  const stage = id === 'rival1' ? 0 : id === 'rival2' ? 1 : 2;
  let cid = counter;
  for (let i = 0; i < stage; i++) cid = MON[cid].evo?.to || cid;
  sfx('encounter');
  await dialog(said(r.pre, RIVAL.name));
  W.busy--;
  const res = await battle({
    kind: 'rival', enemies: r.team.map(([tid, lv]) => makeMon(tid === 'STARTER' ? cid : tid, lv)),
    trainer: { name: RIVAL.name, look: RIVAL.look }, reward: r.reward,
  });
  s.flags[id] = true; save();
  await dialog(said(res === 'win' ? r.win : r.lose, RIVAL.name));
  if (res === 'lose') { healAll(); updateHud(); }
  else await afterBattle(res);
}

// ── interactions ──────────────────────────────────────────
async function interact(t) {
  if (W.busy) return;
  W.busy++;
  try {
    if (t.type === 'npc') await talkTo(t.npc);
    else if (t.type === 'sign') await readSign(t.sign);
    else if (t.type === 'treasure') await openTreasure(t.treasure);
    else if (t.type === 'building') { W.busy--; await enterScene(t.b); W.busy++; }
    else if (t.type === 'garden') await gardenPlot(t.index);
    else if (t.type === 'water') { W.busy--; await fishHere(); W.busy++; }
  } finally { W.busy--; updateHud(); }
}

async function talkTo(n) {
  const s = st(), who = npcName(n);
  if (n.look !== 'fox') faceEachOther(n);
  if (n.trainer && !s.flags['tr_' + n.id]) { W.busy--; await trainerBattle(n, false); W.busy++; return; }
  if (n.trainer) return dialog(said(n.win, who));
  if (n.quiz) return foxQuiz(n);
  if (n.gate) {
    if (gateOpen(n.gate)) return dialog(said(n.after || [{ ja: 'きを つけてね！', en: 'Take care!', voice: n.voice }], who));
    return dialog(said(n.talk, who));
  }
  if (n.special === 'rod') {
    if (s.flags.rod) return dialog(said(n.after, who));
    if (caughtCount() >= 5) {
      await dialog(said(n.give, who));
      s.flags.rod = true; save();
      sfx('fanfare');
      toast('🎣 つりざおを もらった！ <small>Got a fishing rod!</small>', 3000);
      return;
    }
    return dialog(said(n.talk, who));
  }
  return dialog(said(n.talk, who));
}

async function readSign(sg) {
  if (!sg.quiz) return dialog([{ ja: sg.ja, en: sg.en }]);
  // trailer-style signpost: 「もり」は どっち？
  const s = st(), q = sg.quiz, key = `sign_${W.mapId}_${sg.x}_${sg.y}`;
  const o = overlay(`<div class="signquiz">
    <div class="sq-q"><button class="qspeak">🔊</button><div><div class="qja">「${esc(q.word)}」は どっち？</div>${en(`Which way is "${q.word}" (${q.en})? Tap it!`)}</div></div>
    <div class="sq-arrows"><button class="sq-btn left">◀ ${esc(q.left)}</button><button class="sq-btn right">${esc(q.right)} ▶</button></div>
  </div>`, 'sq-overlay');
  say([q.word, LINES.whichway.ja]);
  onTap($('.qspeak', o), () => say(q.word));
  const pickSide = await new Promise(r => { onTap($('.sq-btn.left', o), () => r('left')); onTap($('.sq-btn.right', o), () => r('right')); });
  const ok = pickSide === q.answer;
  $(`.sq-btn.${pickSide}`, o).classList.add(ok ? 'good' : 'bad');
  if (ok) {
    sfx('correct');
    await say(LINES.correct.ja);
    if (s.flags[key] !== today()) {
      s.flags[key] = today(); s.coins += 30; save();
      toast('💴 30えん もらった！ <small>Got 30 yen!</small>');
    }
  } else { sfx('wrong'); $(`.sq-btn.${q.answer}`, o).classList.add('reveal'); await say(q[q.answer]); }
  await sleep(800);
  closeOverlay(o);
}

async function openTreasure(tr) {
  const s = st(), k = 't_' + tr.id;
  if (s.flags[k]) return dialog([{ ja: 'からっぽ だ。', en: "It's empty.", voice: false }]);
  s.flags[k] = true;
  s.items[tr.item] = (s.items[tr.item] || 0) + tr.n;
  save();
  sfx('fanfare');
  const it = ITEMS[tr.item];
  await dialog([{ ja: `${it.ja}を ${tr.n}こ みつけた！`, en: `Found ${tr.n} × ${it.en}!` }]);
}

async function foxQuiz(n) {
  const s = st(), key = `${W.mapId}_${n.id}`;
  s.daily.quiz ||= {};
  if (s.daily.quiz[key]) return dialog(said(STORY.fox_done, 'きつね'));
  await dialog(said(n.talk, 'きつね'));
  const total = n.quiz;
  const o = overlay(`<div class="quizbox"><div class="qz-head">🦊 <span class="qz-n">1</span> / ${total}</div><div class="qz-host"></div></div>`, 'quiz-overlay');
  let right = 0;
  for (let i = 0; i < total; i++) {
    $('.qz-n', o).textContent = i + 1;
    const r = await askQuestion(nextQuestion({ mode: 'practice' }), $('.qz-host', o));
    if (r.correct) { right++; progress('correct'); }
  }
  closeOverlay(o);
  s.daily.quiz[key] = true;
  progress('quiz');
  const coins = right * 40;
  s.coins += coins;
  if (right === total) {
    s.items.ami = (s.items.ami || 0) + 1;
    await dialog(said(STORY.fox_win, 'きつね'));
    toast(`💴 ${coins}えん と 🥅 あみ！`, 2600);
  } else if (right > 0) {
    await dialog([{ ja: `${right}もん せいかい！ ${coins}えん あげる。`, en: `${right} correct! Here's ${coins} yen.`, who: 'きつね', voice: false }]);
  } else await dialog(said(STORY.fox_lose, 'きつね'));
  save();
}

async function gardenPlot(i) {
  const s = st();
  const plot = s.garden[i];
  if (!plot) {
    const have = Object.entries(s.seeds).filter(([, n]) => n > 0);
    if (!have.length) return dialog([{ ja: 'はたけ だ。 たねは みせで かえるよ。', en: 'A garden plot. You can buy seeds at the shop.' }]);
    const idx = await choose([...have.map(([k, n]) => ({ ja: `${SEEDS[k].icon} ${SEEDS[k].ja} ×${n}`, en: SEEDS[k].en })), { ja: 'やめる', en: 'Cancel' }], { prompt: { ja: 'どの たねを うえる？', en: 'Which seed will you plant?' } });
    if (idx >= have.length) return;
    const seed = have[idx][0];
    s.seeds[seed]--;
    s.garden[i] = { seed, planted: Date.now(), icon: SEEDS[seed].icon };
    save(); sfx('tile');
    return dialog(STORY.garden_plant);
  }
  const stage = gardenStage(plot);
  const seed = SEEDS[plot.seed];
  if (stage < 3) {
    const left = Math.max(1, Math.ceil((plot.planted + seed.hours * 3600e3 - Date.now()) / 60e3));
    const t = left >= 60 ? `${Math.ceil(left / 60)}じかん` : `${left}ぷん`;
    return dialog([{ ja: `${seed.word}が そだっている。 あと ${t}。`, en: `The ${seed.en.replace(' seed', '')} is growing. About ${left >= 60 ? Math.ceil(left / 60) + ' hours' : left + ' minutes'} left.`, voice: false }]);
  }
  // harvest: spell the fruit
  const o = overlay(`<div class="quizbox"><div class="qz-head">${seed.icon} しゅうかく！ <small>Harvest!</small></div><div class="qz-host"></div></div>`, 'quiz-overlay');
  const { answer, tiles } = spellTiles(seed.word, 2);
  await askQuestion({ key: null, kind: 'tiles', layout: 'tiles', prompt: { ja: 'なまえを つくろう！', en: `Spell "${seed.word}" to pick it!`, pic: seed.icon, audio: [seed.word] }, tiles, answer, explain: { ja: seed.word, audio: [seed.word] } }, $('.qz-host', o));
  closeOverlay(o);
  const n = 2 + Math.floor(Math.random() * 2);
  s.items[seed.fruit] = (s.items[seed.fruit] || 0) + n;
  s.garden[i] = null;
  progress('harvest');
  save();
  sfx('fanfare');
  await say(LINES.grew.ja);
  toast(`${seed.icon} ${ITEMS[seed.fruit].ja} ×${n}！`, 2600);
}

async function fishHere() {
  const s = st();
  if (!s.flags.rod) { W.busy++; await dialog(STORY.rod_need); W.busy--; return; }
  if (!s.party.some(m => m.hp > 0)) return;
  const got = await fishing();
  progress('fish');
  if (got) await wildBattle('fish');
}

async function hatchScene(m) {
  await celebrate(LINES.hatched, { pic: picHtml({ mon: m.id, shiny: m.shiny }) });
  await catchCard(m.id, { shiny: m.shiny, isNew: (st().dex[m.id]?.caught || 0) <= 1 });
}

// After loading a save or new game.
export function placePlayer() {
  const s = st();
  loadMap(s.map, s.x, s.y, s.dir);
  refreshGates();
}

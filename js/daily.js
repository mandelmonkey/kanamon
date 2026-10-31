// Daily loop: missions (おつかい), login stamps & streaks, house finds, today's rare, eggs.
import { st, today, save, makeMon, addMon } from './state.js';
import { MAPS } from './data/maps.js';
import { MON } from './data/kanamon.js';
import { DAYS } from './data/vocab.js';
import { toast } from './ui.js';
import { sfx } from './audio.js';

const MISSION_TYPES = [
  { type: 'catch',   ja: (n) => `かなもんを ${n}ひき つかまえる`, en: (n) => `Catch ${n} kanamon`, n: [2, 3], coins: 150, icon: '🥅' },
  { type: 'win',     ja: (n) => `${n}かい しょうぶに かつ`, en: (n) => `Win ${n} battles`, n: [3, 5], coins: 120, icon: '⚔️' },
  { type: 'correct', ja: (n) => `${n}もん せいかい する`, en: (n) => `Get ${n} answers right`, n: [15, 25], coins: 120, icon: '⭕' },
  { type: 'steps',   ja: (n) => `${n}ぽ あるく`, en: (n) => `Walk ${n} steps`, n: [250, 400], coins: 80, icon: '👟' },
  { type: 'spell',   ja: (n) => `なまえを ${n}かい つくる`, en: (n) => `Spell ${n} names`, n: [2, 3], coins: 120, icon: '🔤' },
  { type: 'quiz',    ja: () => `きつねの クイズに こたえる`, en: () => `Answer a fox quiz`, n: [1, 1], coins: 150, icon: '🦊' },
  { type: 'fish',    ja: () => `つりを する`, en: () => `Go fishing`, n: [1, 1], coins: 120, icon: '🎣', need: (s) => s.flags.rod },
  { type: 'study',   ja: (n) => `あいうえお ひょうで ${n}もん れんしゅう`, en: (n) => `Practise ${n} on the kana chart`, n: [10, 10], coins: 100, icon: '📖' },
];

function seeded(seed) { let x = seed; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }

export function dayInfo(d = new Date()) { return DAYS[d.getDay()]; }

// Call at boot and whenever the game resumes. Returns { newDay, streak, firstEver }.
export function ensureDaily() {
  const s = st(), d = s.daily, t = today();
  if (d.date === t) return { newDay: false, streak: d.streak };
  const yesterday = today(new Date(Date.now() - 864e5));
  const firstEver = !d.lastDay;
  d.streak = d.lastDay === yesterday ? d.streak + 1 : 1;
  d.lastDay = t; d.date = t;
  const ym = t.slice(0, 7);
  (d.stamps[ym] ||= []);
  if (!d.stamps[ym].includes(+t.slice(8))) d.stamps[ym].push(+t.slice(8));
  d.houses = {}; d.quiz = {};
  d.claimedAll = false;
  s.stats.days++;
  // three missions, seeded by the date so they're stable through the day
  const rnd = seeded(+t.replace(/-/g, ''));
  const pool = MISSION_TYPES.filter(m => !m.need || m.need(s));
  const picks = [];
  while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  d.missions = picks.map(m => {
    const n = m.n[0] + Math.floor(rnd() * (m.n[1] - m.n[0] + 1));
    return { type: m.type, n, have: 0, done: false, claimed: false, coins: m.coins, ja: m.ja(n), en: m.en(n), icon: m.icon };
  });
  // today's rare: an uncommon creature from somewhere the child has been
  const rares = [];
  for (const [id, m] of Object.entries(MAPS)) if (s.flags['visited_' + id]) for (const e of m.encounters?.grass || []) if (MON[e[0]].rare >= 2) rares.push([e[0], id]);
  d.rare = rares.length ? rares[Math.floor(rnd() * rares.length)] : null;
  // keep a short history for the parent page
  s.log.push({ date: t, correct: s.stats.correct, wrong: s.stats.wrong, caught: s.stats.caught });
  if (s.log.length > 60) s.log.shift();
  save();
  return { newDay: true, streak: d.streak, firstEver };
}

export function progress(type, n = 1) {
  const s = st();
  if (!s?.daily?.missions) return;
  for (const m of s.daily.missions) {
    if (m.type !== type || m.done) continue;
    m.have = Math.min(m.n, m.have + n);
    if (m.have >= m.n) {
      m.done = true;
      sfx('coin');
      toast(`${m.icon} おつかい できた！ <small>Errand done!</small>`);
    }
  }
}

export function claimMission(i) {
  const s = st(), m = s.daily.missions[i];
  if (!m?.done || m.claimed) return 0;
  m.claimed = true;
  const coins = m.coins * (new Date().getDay() === 5 ? 2 : 1);
  s.coins += coins;
  save();
  return coins;
}

export function allClaimed() { const ms = st().daily.missions || []; return ms.length && ms.every(m => m.claimed); }

// Streak rewards for the calendar.
export function streakReward(streak) {
  if (streak % 7 === 0) return { item: 'ame', n: 1, egg: true, ja: 'げんきあめ と たまご', en: 'Power candy + an egg' };
  if (streak % 3 === 0) return { item: 'ami', n: 3, ja: 'あみ ×3', en: '3 nets' };
  return { item: 'onigiri', n: 2, ja: 'おにぎり ×2', en: '2 rice balls' };
}

// Eggs hatch after walking. Prefer creatures the child hasn't caught yet.
export function giveEgg() {
  const s = st();
  const pool = [];
  for (const [id, m] of Object.entries(MAPS)) {
    if (!s.flags['visited_' + id]) continue;
    for (const e of m.encounters?.grass || []) pool.push(e[0]);
  }
  if (!pool.length) pool.push('tamago');
  const unseen = pool.filter(id => !s.dex[id]?.caught);
  const list = unseen.length && Math.random() < 0.75 ? unseen : pool;
  const id = list[Math.floor(Math.random() * list.length)];
  s.eggs.push({ id, steps: 0, need: 180 + Math.floor(Math.random() * 120) });
  save();
}

// Called every step; returns a hatched mon (or null).
export function eggStep() {
  const s = st();
  for (let i = 0; i < s.eggs.length; i++) {
    const e = s.eggs[i];
    e.steps++;
    if (e.steps >= e.need) {
      s.eggs.splice(i, 1);
      const lv = Math.max(3, Math.min(20, (s.badges.length + 1) * 5));
      const m = makeMon(e.id, lv, Math.random() < 1 / 20);
      addMon(m);
      save();
      return m;
    }
  }
  return null;
}

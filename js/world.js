// Overworld: map rendering, tap-to-walk movement, NPCs, and hooks for interactions.
import { MAPS, BUILDING_SIZE, npcLook } from './data/maps.js';
import { WALKABLE } from './data/tiles.js';
import { tileImages, buildingImage, toriiImage, signImage, chestImage, gateImage, themeOf } from './art/tiles.js';
import { personImage, PLAYER_LOOK } from './art/people.js';
import { monImg } from './art/creatures.js';
import { st, leadMon, save } from './state.js';
import { sfx } from './audio.js';

export const W = {
  mapId: null, map: null, S: 64, dpr: 1, vw: 0, vh: 0,
  player: null, follower: null, npcs: [], buildings: [], busy: 0, t: 0, frame: 0,
  particles: [], target: null, bubble: null, held: null,
};
let hooks = {};
export const setHooks = (h) => { hooks = h; };

let canvas, ctx;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const SPEED = 4.6; // tiles per second

export const isNight = () => W.map?.alwaysNight || (() => { const h = new Date().getHours(); return h >= 19 || h < 6; })();

export function initWorld(cv) {
  canvas = cv; ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  setupInput();
  requestAnimationFrame(loop);
}

function resize() {
  const r = canvas.getBoundingClientRect();
  W.dpr = Math.min(window.devicePixelRatio || 1, 2);
  W.vw = r.width; W.vh = r.height;
  canvas.width = Math.round(r.width * W.dpr); canvas.height = Math.round(r.height * W.dpr);
  W.S = Math.max(40, Math.min(96, Math.floor(Math.min(r.width / 14, r.height / 10))));
}

// ── map loading ───────────────────────────────────────────
export function loadMap(id, x, y, dir = 'down') {
  const m = MAPS[id];
  W.mapId = id; W.map = m;
  W.buildings = (m.buildings || []).map(b => {
    const [w, h] = BUILDING_SIZE[b.kind];
    return { ...b, size: [w, h], door: [b.x + Math.floor(w / 2), b.y + h - 1] };
  });
  W.npcs = (m.npcs || []).map(n => ({ ...n, home: [n.x, n.y], px: n.x, py: n.y, from: null, t: 0, frame: 0, wanderT: 1 + Math.random() * 3 }));
  W.player = { x, y, dir, from: null, t: 0, frame: 0, path: [], after: null, stepsHere: 0 };
  W.follower = { x, y, from: null, t: 0, trail: [] };
  W.particles = [];
  W.target = null;
  const s = st(); s.map = id; s.x = x; s.y = y; s.dir = dir;
  refreshGates();
  hooks.entered?.(id);
}

export function refreshGates() {
  for (const n of W.npcs) {
    if (!n.gate) continue;
    n.open = hooks.gateOpen ? hooks.gateOpen(n.gate) : false;
    if (n.gate.moveTo) { const [gx, gy] = n.open ? n.gate.moveTo : n.home; n.x = n.px = gx; n.y = n.py = gy; }
  }
}

// ── occupancy ─────────────────────────────────────────────
const tileAt = (x, y) => (W.map.tiles[y] || '')[x];
function buildingAt(x, y) {
  return W.buildings.find(b => x >= b.x && x < b.x + b.size[0] && y >= b.y && y < b.y + b.size[1]);
}
function thingAt(x, y) {
  const m = W.map;
  const npc = W.npcs.find(n => n.x === x && n.y === y);
  if (npc) return { type: 'npc', npc };
  for (const n of W.npcs) if (n.block && !n.open && n.block.some(([bx, by]) => bx === x && by === y)) return { type: 'npc', npc: n };
  const sign = (m.signs || []).find(s => s.x === x && s.y === y);
  if (sign) return { type: 'sign', sign };
  const tr = (m.treasure || []).find(t => t.x === x && t.y === y);
  if (tr) return { type: 'treasure', treasure: tr };
  const b = buildingAt(x, y);
  if (b) return { type: 'building', b };
  for (const d of m.decor || []) if (d.t === 'torii' && d.y === y && (d.x === x || d.x + 3 === x)) return { type: 'decor' };
  const ch = tileAt(x, y);
  if (ch === 'g') return { type: 'garden', x, y, index: gardenIndex(x, y) };
  if (ch === '~') return { type: 'water', x, y };
  return null;
}
export function gardenIndex(x, y) {
  let i = 0;
  for (let yy = 0; yy < W.map.tiles.length; yy++) for (let xx = 0; xx < W.map.tiles[yy].length; xx++) {
    if (W.map.tiles[yy][xx] === 'g') { if (xx === x && yy === y) return i; i++; }
  }
  return -1;
}
function passable(x, y) {
  const ch = tileAt(x, y);
  if (!ch || !WALKABLE.has(ch) || ch === 'g') return false;
  return !thingAt(x, y) || thingAt(x, y).type === 'water';
}
const inMap = (x, y) => y >= 0 && y < W.map.tiles.length && x >= 0 && x < W.map.tiles[0].length;

function bfs(sx, sy, goal, maxN = 900) {
  const key = (x, y) => x + ',' + y;
  const prev = new Map([[key(sx, sy), null]]);
  const q = [[sx, sy]];
  while (q.length && prev.size < maxN) {
    const [x, y] = q.shift();
    if (goal(x, y)) {
      const path = [];
      let k = key(x, y);
      while (prev.get(k)) { const [px, py] = k.split(',').map(Number); path.unshift([px, py]); k = prev.get(k); }
      return path;
    }
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (prev.has(k) || !inMap(nx, ny) || !passable(nx, ny)) continue;
      prev.set(k, key(x, y)); q.push([nx, ny]);
    }
  }
  return null;
}

// ── input ─────────────────────────────────────────────────
function setupInput() {
  canvas.addEventListener('pointerdown', (e) => {
    if (W.busy || !W.map) return;
    const r = canvas.getBoundingClientRect();
    const wx = e.clientX - r.left + W.camX, wy = e.clientY - r.top + W.camY;
    const tx = Math.floor(wx / W.S), ty = Math.floor(wy / W.S);
    tapTile(tx, ty, wy / W.S);
  });
  window.addEventListener('keydown', (e) => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
    if (map[e.key]) { W.held = map[e.key]; e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && !W.busy) { interactFacing(); e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
    if (map[e.key] === W.held) W.held = null;
  });
}

export function holdDir(d) { W.held = d; if (d) W.player.path = []; }

export function interactFacing() {
  if (W.busy) return;
  const p = W.player, [dx, dy] = DIRS[p.dir];
  const t = thingAt(p.x + dx, p.y + dy);
  if (t && t.type !== 'decor') {
    if (t.type === 'building' && !(p.x === t.b.door[0] && p.y === t.b.door[1] + 1 && p.dir === 'up')) return;
    hooks.interact?.(t);
  }
}

function tapTile(tx, ty, fy) {
  if (!inMap(tx, ty)) return;
  const p = W.player;
  // tapping on a building's roof area counts as the building
  let thing = thingAt(tx, ty);
  if (!thing && inMap(tx, ty + 1)) { const below = thingAt(tx, ty + 1); if (below?.type === 'building' || below?.type === 'npc') thing = below; }
  if (thing?.type === 'decor') thing = null;
  if (thing) {
    let goals;
    if (thing.type === 'building') { const [dx, dy] = thing.b.door; goals = [[dx, dy + 1]]; }
    else {
      const ox = thing.npc ? thing.npc.x : thing.sign ? thing.sign.x : thing.treasure ? thing.treasure.x : thing.x;
      const oy = thing.npc ? thing.npc.y : thing.sign ? thing.sign.y : thing.treasure ? thing.treasure.y : thing.y;
      goals = [[ox, oy + 1], [ox, oy - 1], [ox - 1, oy], [ox + 1, oy]];
      if (thing.npc?.block && !thing.npc.open) goals = thing.npc.block.flatMap(([bx, by]) => [[bx - 1, by], [bx + 1, by], [bx, by + 1], [bx, by - 1]]).concat(goals);
    }
    const ok = new Set(goals.filter(([x, y]) => inMap(x, y) && passable(x, y)).map(g => g.join(',')));
    const cur = p.from ? null : `${p.x},${p.y}`;
    const face = () => {
      const ox = thing.type === 'building' ? thing.b.door[0] : thing.npc ? thing.npc.x : thing.sign ? thing.sign.x : thing.treasure ? thing.treasure.x : thing.x;
      const oy = thing.type === 'building' ? thing.b.door[1] : thing.npc ? thing.npc.y : thing.sign ? thing.sign.y : thing.treasure ? thing.treasure.y : thing.y;
      let fx = ox, fy2 = oy;
      if (thing.npc?.block && !thing.npc.open) {
        const nb = thing.npc.block.find(([bx, by]) => Math.abs(bx - p.x) + Math.abs(by - p.y) === 1);
        if (nb) [fx, fy2] = nb;
      }
      const dx = Math.sign(fx - p.x), dy = Math.sign(fy2 - p.y);
      p.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      hooks.interact?.(thing);
    };
    if (cur && ok.has(cur)) { face(); return; }
    const path = bfs(p.x, p.y, (x, y) => ok.has(`${x},${y}`));
    if (path) { p.path = path; p.after = face; W.target = { x: path.at(-1)[0], y: path.at(-1)[1], t: 0 }; }
    return;
  }
  if (!passable(tx, ty)) return;
  const path = bfs(p.x, p.y, (x, y) => x === tx && y === ty);
  if (path && path.length) { p.path = path; p.after = null; W.target = { x: tx, y: ty, t: 0 }; }
}

// ── update ────────────────────────────────────────────────
let last = 0;
function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  W.t += dt;
  if (W.map) { update(dt); render(); }
  requestAnimationFrame(loop);
}

function startStep(ent, dir) {
  const [dx, dy] = DIRS[dir];
  ent.dir = dir;
  ent.from = [ent.x, ent.y];
  ent.x += dx; ent.y += dy; ent.t = 0;
}

function update(dt) {
  const p = W.player;
  if (W.target) W.target.t += dt;
  // player movement
  if (p.from) {
    p.t += dt * SPEED;
    if (p.t >= 1) { p.from = null; p.t = 0; arrive(); }
  }
  if (!p.from && !W.busy) {
    let dir = null;
    if (W.held) {
      dir = W.held;
      const [dx, dy] = DIRS[dir];
      if (!passable(p.x + dx, p.y + dy)) {
        if (p.dir !== dir) p.dir = dir;
        // walking up into a door enters the building
        const t = thingAt(p.x + dx, p.y + dy);
        if (t?.type === 'building' && dir === 'up' && t.b.door[0] === p.x && t.b.door[1] === p.y - 1) { W.held = null; hooks.interact?.(t); }
        else if (t?.type === 'water' || !t) { /* bump */ }
        dir = null;
      }
    } else if (p.path.length) {
      const [nx, ny] = p.path[0];
      if (!passable(nx, ny)) { p.path = []; W.target = null; }
      else {
        p.path.shift();
        dir = nx > p.x ? 'right' : nx < p.x ? 'left' : ny > p.y ? 'down' : 'up';
      }
    }
    if (dir) {
      W.follower.trail.unshift([p.x, p.y]);
      W.follower.trail.length = Math.min(W.follower.trail.length, 3);
      startStep(p, dir);
      const f = W.follower, [tx, ty] = W.follower.trail[0];
      if (f.x !== tx || f.y !== ty) { f.from = [f.x, f.y]; f.x = tx; f.y = ty; f.t = 0; }
    } else if (!p.path.length && p.after) {
      const fn = p.after; p.after = null; W.target = null; fn();
    }
  }
  const f = W.follower;
  if (f.from) { f.t += dt * SPEED; if (f.t >= 1) { f.from = null; f.t = 0; } }
  p.frame = p.from ? (Math.floor(W.t * 8) % 4) : 0;

  // NPC wandering
  for (const n of W.npcs) {
    if (n.from) { n.t += dt * 2.6; if (n.t >= 1) { n.from = null; n.t = 0; } }
    if (!n.wander || W.busy || n.from) continue;
    n.wanderT -= dt;
    if (n.wanderT <= 0) {
      n.wanderT = 2 + Math.random() * 3;
      const opts = Object.entries(DIRS).filter(([d, [dx, dy]]) => {
        const nx = n.x + dx, ny = n.y + dy;
        return Math.abs(nx - n.home[0]) <= 2 && Math.abs(ny - n.home[1]) <= 2 && passable(nx, ny) &&
          !(nx === p.x && ny === p.y) && !(p.from && nx === p.from[0] && ny === p.from[1]) && !(nx === f.x && ny === f.y);
      });
      if (opts.length && Math.random() < 0.7) startStep(n, opts[Math.floor(Math.random() * opts.length)][0]);
      else n.dir = Object.keys(DIRS)[Math.floor(Math.random() * 4)];
    }
    n.frame = n.from ? Math.floor(W.t * 6) % 4 : 0;
  }
  updateParticles(dt);
}

function arrive() {
  const p = W.player, s = st();
  s.x = p.x; s.y = p.y; s.dir = p.dir;
  const ch = tileAt(p.x, p.y);
  if (ch === '"') sfx('grass');
  const warp = (W.map.warps || []).find(w => w.x === p.x && w.y === p.y);
  if (warp) { p.path = []; p.after = null; W.target = null; hooks.warp?.(warp); return; }
  hooks.stepped?.(p.x, p.y, ch);
}

// Programmatic NPC walk (e.g. trainer approaches the player).
export function walkNpcTo(n, tx, ty) {
  return new Promise(res => {
    const tick = () => {
      if (n.from) return requestAnimationFrame(tick);
      if (Math.abs(n.x - tx) + Math.abs(n.y - ty) <= 1) return res();
      const dir = tx > n.x ? 'right' : tx < n.x ? 'left' : ty > n.y ? 'down' : 'up';
      const [dx, dy] = DIRS[dir];
      if (!passable(n.x + dx, n.y + dy)) return res();
      startStep(n, dir);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export function faceEachOther(n) {
  const p = W.player;
  const dx = p.x - n.x, dy = p.y - n.y;
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}

// Can this trainer see the player (straight line, within range, nothing in between)?
export function seesPlayer(n, range = 4) {
  const p = W.player, [dx, dy] = DIRS[n.dir];
  for (let i = 1; i <= range; i++) {
    const x = n.x + dx * i, y = n.y + dy * i;
    if (x === p.x && y === p.y) return true;
    if (!passable(x, y)) return false;
  }
  return false;
}

export function showBubble(n, text = '!') { W.bubble = { n, text, t: 0 }; }
export function hideBubble() { W.bubble = null; }

// ── particles (petals, snow, fireflies) ───────────────────
function updateParticles(dt) {
  const th = W.map.theme, night = isNight();
  const want = th === 'spring' ? 14 : th === 'snow' || th === 'mountain' ? 22 : night ? 14 : th === 'forest' ? 6 : 0;
  while (W.particles.length < want) {
    W.particles.push({ x: Math.random() * W.vw, y: Math.random() * W.vh, vx: 0, vy: 0, r: Math.random(), t: Math.random() * 10 });
  }
  if (W.particles.length > want) W.particles.length = want;
  for (const q of W.particles) {
    q.t += dt;
    if (th === 'spring' || th === 'forest') { q.x += (18 + q.r * 12) * dt + Math.sin(q.t * 1.5) * 0.4; q.y += (22 + q.r * 16) * dt; }
    else if (th === 'snow' || th === 'mountain') { q.x += Math.sin(q.t + q.r * 6) * 10 * dt; q.y += (26 + q.r * 22) * dt; }
    else { q.x += Math.sin(q.t * 0.7 + q.r * 9) * 14 * dt; q.y += Math.cos(q.t * 0.5 + q.r * 5) * 10 * dt; }
    if (q.y > W.vh + 10) { q.y = -10; q.x = Math.random() * W.vw; }
    if (q.x > W.vw + 10) q.x = -10;
    if (q.x < -12) q.x = W.vw + 8;
    if (q.y < -12) q.y = W.vh + 8;
  }
}

// ── render ────────────────────────────────────────────────
function lerpPos(e) {
  if (!e.from) return [e.x, e.y];
  const t = Math.min(1, e.t);
  return [e.from[0] + (e.x - e.from[0]) * t, e.from[1] + (e.y - e.from[1]) * t];
}

function render() {
  const S = W.S, dpr = W.dpr, m = W.map;
  const mw = m.tiles[0].length * S, mh = m.tiles.length * S;
  const [ppx, ppy] = lerpPos(W.player);
  let camX = (ppx + 0.5) * S - W.vw / 2, camY = (ppy + 0.5) * S - W.vh / 2;
  camX = mw <= W.vw ? (mw - W.vw) / 2 : Math.max(0, Math.min(mw - W.vw, camX));
  camY = mh <= W.vh ? (mh - W.vh) / 2 : Math.max(0, Math.min(mh - W.vh, camY));
  W.camX = Math.round(camX); W.camY = Math.round(camY);
  const th = themeOf(m.theme);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = m.theme === 'snow' ? '#dfe9f3' : th.grass2;
  ctx.fillRect(0, 0, W.vw, W.vh);
  ctx.translate(-W.camX, -W.camY);

  const x0 = Math.max(0, Math.floor(W.camX / S) - 1), x1 = Math.min(m.tiles[0].length - 1, Math.ceil((W.camX + W.vw) / S) + 1);
  const y0 = Math.max(0, Math.floor(W.camY / S) - 1), y1 = Math.min(m.tiles.length - 1, Math.ceil((W.camY + W.vh) / S) + 2);
  const frame = Math.floor(W.t * 2.2) % 4;
  const ts = Math.round(S * dpr);
  const imgs = [];
  for (let y = y0; y <= y1; y++) {
    imgs[y] = [];
    for (let x = x0; x <= x1; x++) {
      const im = tileImages(m, x, y, ts, m.tiles[y][x] === '"' ? (frame % 2) : frame);
      imgs[y][x] = im;
      ctx.drawImage(im.ground, x * S, y * S, S + 0.5, S + 0.5);
    }
  }
  // garden crops
  drawGarden(S);

  // object pass, sorted by foot row
  const objs = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const im = imgs[y][x];
    if (im.tall) objs.push({ y: y + 0.01, draw: () => ctx.drawImage(im.tall, x * S, (y - 0.5) * S, S, S * 1.5) });
  }
  for (const b of W.buildings) {
    const [w, h] = b.size;
    objs.push({ y: b.y + h - 1 + 0.2, draw: () => ctx.drawImage(buildingImage(b, ts), b.x * S, (b.y - 1.2) * S, w * S, (h + 1.2) * S) });
  }
  for (const d of m.decor || []) if (d.t === 'torii') objs.push({ y: d.y + 0.3, draw: () => ctx.drawImage(toriiImage(ts), d.x * S, (d.y - 1.4) * S, 4 * S, 2.4 * S) });
  for (const sg of m.signs || []) objs.push({ y: sg.y, draw: () => ctx.drawImage(signImage(ts, !!sg.quiz), sg.x * S, (sg.y - 0.5) * S, S, S * 1.5) });
  for (const tr of m.treasure || []) {
    const open = !!st().flags['t_' + tr.id];
    objs.push({ y: tr.y, draw: () => ctx.drawImage(chestImage(ts, open), tr.x * S, (tr.y - 0.5) * S, S, S * 1.5) });
  }
  for (const n of W.npcs) {
    if (n.block && !n.open) for (const [bx, by] of n.block) objs.push({ y: by, draw: () => ctx.drawImage(gateImage(ts), bx * S, (by - 0.5) * S, S, S * 1.5) });
    const [nx, ny] = lerpPos(n);
    const look = npcLook(n);
    objs.push({ y: ny + 0.05, draw: () => ctx.drawImage(personImage(look, n.dir, n.frame, ts), nx * S, (ny - 0.5) * S - S * 0.08, S, S * 1.5) });
  }
  // follower kanamon
  const lead = leadMon();
  if (lead) {
    const [fx, fy] = lerpPos(W.follower);
    const same = Math.abs(fx - ppx) < 0.01 && Math.abs(fy - ppy) < 0.01;
    if (!same) {
      const img = monImg(lead.id, lead.shiny);
      const bob = Math.abs(Math.sin(W.t * 6)) * S * 0.06;
      objs.push({ y: fy, draw: () => { if (img.complete && img.naturalWidth) ctx.drawImage(img, fx * S + S * 0.06, fy * S - S * 0.04 - bob, S * 0.88, S * 0.88); } });
    }
  }
  // player
  objs.push({ y: ppy + 0.06, draw: () => {
    ctx.drawImage(personImage(PLAYER_LOOK, W.player.dir, W.player.frame, ts), ppx * S, (ppy - 0.5) * S - S * 0.08, S, S * 1.5);
    // grass in front of legs
    if (tileAt(W.player.x, W.player.y) === '"' && !W.player.from) {
      const g = imgs[W.player.y]?.[W.player.x]?.ground;
      if (g) ctx.drawImage(g, 0, g.height * 0.55, g.width, g.height * 0.45, W.player.x * S, (W.player.y + 0.55) * S, S, S * 0.45);
    }
  } });
  objs.sort((a, b) => a.y - b.y);
  for (const o of objs) o.draw();

  // tap target ring
  if (W.target) {
    const a = Math.max(0, 1 - W.target.t * 1.5);
    if (a > 0) { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse((W.target.x + 0.5) * S, (W.target.y + 0.75) * S, S * (0.25 + W.target.t * 0.2), S * (0.1 + W.target.t * 0.08), 0, 0, 7); ctx.stroke(); }
  }
  // speech bubble
  if (W.bubble) {
    const n = W.bubble.n, [bx, by] = lerpPos(n);
    W.bubble.t += 1 / 60;
    const pop = Math.min(1, W.bubble.t * 6);
    const cx = (bx + 0.5) * S, cy = (by - 0.75) * S;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#5a3b2b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, S * 0.28 * pop, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2483d'; ctx.font = `900 ${S * 0.36 * pop}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(W.bubble.text, cx, cy + 1);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // dim forests, night tint
  if (m.dim) { ctx.fillStyle = `rgba(20,50,30,${m.dim})`; ctx.fillRect(0, 0, W.vw, W.vh); }
  const night = isNight();
  if (night) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = m.alwaysNight ? '#7b80c9' : '#a2a7de';
    ctx.fillRect(0, 0, W.vw, W.vh);
    ctx.globalCompositeOperation = 'source-over';
    // soft light around the player
    const g = ctx.createRadialGradient((ppx + 0.5) * S - W.camX, (ppy + 0.4) * S - W.camY, S * 0.5, (ppx + 0.5) * S - W.camX, (ppy + 0.4) * S - W.camY, S * 3.2);
    g.addColorStop(0, 'rgba(255,240,200,0.22)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W.vw, W.vh);
  }
  // particles
  for (const q of W.particles) {
    const th2 = m.theme;
    if (th2 === 'spring' || th2 === 'forest') {
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.t * 1.3 + q.r * 5);
      ctx.fillStyle = th2 === 'forest' ? 'rgba(140,200,90,0.8)' : 'rgba(255,190,210,0.9)';
      ctx.beginPath(); ctx.ellipse(0, 0, 5 + q.r * 3, 3 + q.r * 1.5, 0, 0, 7); ctx.fill(); ctx.restore();
    } else if (th2 === 'snow' || th2 === 'mountain') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(q.x, q.y, 2 + q.r * 2.5, 0, 7); ctx.fill();
    } else if (night) {
      const a = 0.5 + Math.sin(q.t * 3 + q.r * 10) * 0.5;
      ctx.fillStyle = `rgba(255,240,140,${a})`; ctx.beginPath(); ctx.arc(q.x, q.y, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,240,140,${a * 0.25})`; ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, 7); ctx.fill();
    }
  }
}

function drawGarden(S) {
  const g = st().garden;
  if (!g) return;
  let i = 0;
  const now = Date.now();
  for (let y = 0; y < W.map.tiles.length; y++) for (let x = 0; x < W.map.tiles[y].length; x++) {
    if (W.map.tiles[y][x] !== 'g') continue;
    const plot = g[i++];
    if (!plot) continue;
    const stage = hooks.gardenStage ? hooks.gardenStage(plot, now) : 0;
    const icon = stage >= 3 ? plot.icon : stage === 2 ? '🌿' : '🌱';
    ctx.font = `${S * (stage >= 3 ? 0.6 : 0.5)}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const bob = stage >= 3 ? Math.sin(W.t * 4 + x) * S * 0.04 : 0;
    ctx.fillText(icon, (x + 0.5) * S, (y + 0.48) * S + bob);
  }
}

// Fade the screen out/in around a callback (map changes).
export async function fadeSwap(fn) {
  const f = document.getElementById('fade');
  W.busy++;
  f.classList.add('on');
  await new Promise(r => setTimeout(r, 260));
  await fn();
  f.classList.remove('on');
  await new Promise(r => setTimeout(r, 200));
  W.busy--;
}

export function setPlayer(x, y, dir) {
  const p = W.player;
  p.x = x; p.y = y; p.from = null; p.path = []; p.after = null; if (dir) p.dir = dir;
  W.follower.x = x; W.follower.y = y; W.follower.from = null; W.follower.trail = [];
  const s = st(); s.x = x; s.y = y;
  save();
}

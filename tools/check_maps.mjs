// Validate maps: node tools/check_maps.mjs
import { MAPS, BUILDING_SIZE, MASTERS } from '../js/data/maps.js';
import { WALKABLE } from '../js/data/tiles.js';
import { KANAMON, MON, STARTERS } from '../js/data/kanamon.js';
import { HOUSE_POOL } from '../js/data/items.js';

let errors = 0;
const err = (m, s) => { errors++; console.log(`✗ [${m}] ${s}`); };

for (const [id, m] of Object.entries(MAPS)) {
  const H = m.tiles.length, W = m.tiles[0].length;
  m.tiles.forEach((r, y) => { if ([...r].length !== W) err(id, `row ${y} has ${[...r].length} cols, expected ${W}: ${r}`); });
  const at = (x, y) => (m.tiles[y] || '')[x];
  const blocked = new Map(); // "x,y" -> what
  const mark = (x, y, what) => {
    const k = x + ',' + y;
    if (blocked.has(k)) err(id, `${what} overlaps ${blocked.get(k)} at ${k}`);
    blocked.set(k, what);
  };
  const doors = [];
  for (const b of m.buildings || []) {
    const [w, h] = BUILDING_SIZE[b.kind];
    if (b.x < 0 || b.y < 0 || b.x + w > W || b.y + h > H) err(id, `${b.kind} out of bounds`);
    for (let y = b.y; y < b.y + h; y++) for (let x = b.x; x < b.x + w; x++) mark(x, y, b.kind);
    const dx = b.x + Math.floor(w / 2), dy = b.y + h;
    doors.push([dx, dy, b.kind]);
    if (!WALKABLE.has(at(dx, dy))) err(id, `${b.kind} door front ${dx},${dy} is '${at(dx, dy)}'`);
  }
  for (const d of m.decor || []) if (d.t === 'torii') { mark(d.x, d.y, 'torii'); mark(d.x + 3, d.y, 'torii'); }
  const things = [];
  for (const n of m.npcs || []) {
    const pos = n.gate?.moveTo ? n.gate.moveTo : [n.x, n.y];
    if (!WALKABLE.has(at(...pos))) err(id, `npc ${n.id} on '${at(...pos)}' at ${pos}`);
    mark(...pos, 'npc ' + n.id); things.push([...pos, n.id]);
    if (n.gate?.moveTo) { if (!WALKABLE.has(at(...n.gate.moveTo))) err(id, `npc ${n.id} moveTo blocked`); }
    for (const b of n.block || []) if (!WALKABLE.has(at(...b))) err(id, `gate ${n.id} block on '${at(...b)}'`);
  }
  for (const s of m.signs || []) { if (!WALKABLE.has(at(s.x, s.y))) err(id, `sign on '${at(s.x, s.y)}' at ${s.x},${s.y}`); mark(s.x, s.y, 'sign'); things.push([s.x, s.y, 'sign']); }
  for (const t of m.treasure || []) { if (!WALKABLE.has(at(t.x, t.y))) err(id, `treasure ${t.id} on '${at(t.x, t.y)}'`); mark(t.x, t.y, 'treasure'); things.push([t.x, t.y, t.id]); }
  for (const w of m.warps || []) {
    if (!(w.x === 0 || w.y === 0 || w.x === W - 1 || w.y === H - 1)) err(id, `warp ${w.x},${w.y} not on edge`);
    if (!WALKABLE.has(at(w.x, w.y))) err(id, `warp tile ${w.x},${w.y} is '${at(w.x, w.y)}'`);
    const t = MAPS[w.to];
    if (!t) { err(id, `warp to unknown map ${w.to}`); continue; }
    if (!WALKABLE.has((t.tiles[w.ty] || '')[w.tx])) err(id, `warp dest ${w.to} ${w.tx},${w.ty} is '${(t.tiles[w.ty] || '')[w.tx]}'`);
  }
  // reachability from start/heal (gates open)
  const start = m.start || m.heal || (m.warps[0] && { x: m.warps[0].x, y: m.warps[0].y });
  const seen = new Set([start.x + ',' + start.y]);
  const q = [[start.x, start.y]];
  const passable = (x, y) => WALKABLE.has(at(x, y)) && !blocked.has(x + ',' + y);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (!seen.has(k) && passable(nx, ny)) { seen.add(k); q.push([nx, ny]); }
    }
  }
  const near = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
  for (const w of m.warps || []) if (!seen.has(w.x + ',' + w.y)) err(id, `warp ${w.x},${w.y} unreachable`);
  for (const [x, y, k] of doors) if (!seen.has(x + ',' + y)) err(id, `${k} door ${x},${y} unreachable`);
  for (const [x, y, k] of things) if (!near(x, y)) err(id, `${k} at ${x},${y} unreachable`);
  const grass = m.tiles.join('').split('"').length - 1;
  console.log(`✓ ${id} ${W}×${H}, reachable ${seen.size} tiles, grass ${grass}`);
}

// every creature obtainable?
const got = new Set(STARTERS);
for (const m of Object.values(MAPS)) for (const k of ['grass', 'fish']) for (const e of m.encounters?.[k] || []) got.add(e[0]);
for (const id of HOUSE_POOL) got.add(id);
let changed = true;
while (changed) { changed = false; for (const m of KANAMON) if (m.evo && got.has(m.id) && !got.has(m.evo.to)) { got.add(m.evo.to); changed = true; } }
got.add('n');
const missing = KANAMON.filter(m => !got.has(m.id)).map(m => m.id);
if (missing.length) err('dex', 'not obtainable: ' + missing.join(', '));
else console.log('✓ all', KANAMON.length, 'kanamon obtainable');
for (const [k, ms] of Object.entries(MASTERS)) for (const [mid] of ms.team) if (!MON[mid]) err('masters', `${k} unknown ${mid}`);
console.log(errors ? `${errors} problems` : 'all good');

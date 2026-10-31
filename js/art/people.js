// Chibi character sprites for the overworld (canvas), with 4 directions and a 4-frame walk.

const OUT = '#4a3022';
export const PLAYER_LOOK = { kind: 'kid', skin: '#ffe0c4', hair: '#2b1d16', hairStyle: 'short', shirt: '#2f9e7a', pants: '#8a6a45', hat: 'school', bag: '#d9443a' };

const cache = new Map();
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
function ol(c, w) { c.strokeStyle = OUT; c.lineWidth = w; c.lineJoin = 'round'; c.stroke(); }

export function personImage(look, dir, frame, s) {
  const key = JSON.stringify(look) + dir + frame + '|' + s;
  let cv = cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = Math.ceil(s); cv.height = Math.ceil(s * 1.5);
    const c = cv.getContext('2d');
    if (look.kind === 'fox') drawFox(c, s, frame); else drawPerson(c, look, dir, frame, s);
    cache.set(key, cv);
  }
  return cv;
}

export function portraitUrl(look, size = 160) {
  const cv = personImage(look, 'down', 0, size);
  return cv.toDataURL();
}

function drawPerson(c, L, dir, frame, s) {
  const skin = L.skin || '#ffe0c4';
  const old = L.kind === 'old', adult = L.kind === 'adult' || old;
  const cx = s / 2, ground = s * 1.42;
  const bob = frame % 2 ? -s * 0.025 : 0;
  const headR = adult ? s * 0.25 : s * 0.29;
  const headY = (adult ? s * 0.62 : s * 0.72) + bob;
  const bodyTop = headY + headR * 0.78, bodyBot = ground - s * 0.16;

  // shadow
  c.fillStyle = 'rgba(40,30,20,0.2)'; c.beginPath(); c.ellipse(cx, ground, s * 0.26, s * 0.07, 0, 0, 7); c.fill();

  // legs
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  c.fillStyle = L.pants;
  const legW = s * 0.11, legH = ground - bodyBot + s * 0.02;
  if (dir === 'left' || dir === 'right') {
    const f = dir === 'right' ? 1 : -1;
    rr(c, cx - legW / 2 + step * f * s * 0.07, bodyBot - s * 0.02, legW, legH, s * 0.04); c.fill(); ol(c, s * 0.025);
    rr(c, cx - legW / 2 - step * f * s * 0.07, bodyBot - s * 0.02, legW, legH, s * 0.04); c.fill(); ol(c, s * 0.025);
  } else {
    rr(c, cx - s * 0.13, bodyBot - s * 0.02 - (step > 0 ? s * 0.03 : 0), legW, legH, s * 0.04); c.fill(); ol(c, s * 0.025);
    rr(c, cx + s * 0.02, bodyBot - s * 0.02 - (step < 0 ? s * 0.03 : 0), legW, legH, s * 0.04); c.fill(); ol(c, s * 0.025);
  }
  // shoes
  c.fillStyle = '#5a3b2b';
  if (dir === 'left' || dir === 'right') {
    c.beginPath(); c.ellipse(cx + (dir === 'right' ? s * 0.03 : -s * 0.03), ground - s * 0.03, s * 0.09, s * 0.045, 0, 0, 7); c.fill();
  } else {
    c.beginPath(); c.ellipse(cx - s * 0.075, ground - s * 0.03, s * 0.07, s * 0.04, 0, 0, 7); c.ellipse(cx + s * 0.075, ground - s * 0.03, s * 0.07, s * 0.04, 0, 0, 7); c.fill();
  }

  // bag (behind body when facing down)
  if (L.bag && dir === 'up') { rr(c, cx - s * 0.13, bodyTop + s * 0.06, s * 0.26, s * 0.22, s * 0.05); c.fillStyle = L.bag; c.fill(); ol(c, s * 0.025); }

  // body
  const bw = adult ? s * 0.4 : s * 0.38;
  rr(c, cx - bw / 2, bodyTop, bw, bodyBot - bodyTop + s * 0.04, s * 0.1);
  c.fillStyle = L.shirt; c.fill(); ol(c, s * 0.03);
  // arms swing
  c.fillStyle = L.shirt;
  const sw = step * s * 0.05;
  if (dir !== 'left') { rr(c, cx + bw / 2 - s * 0.06, bodyTop + s * 0.04 + sw, s * 0.1, s * 0.22, s * 0.05); c.fill(); ol(c, s * 0.025); }
  if (dir !== 'right') { rr(c, cx - bw / 2 - s * 0.04, bodyTop + s * 0.04 - sw, s * 0.1, s * 0.22, s * 0.05); c.fill(); ol(c, s * 0.025); }
  c.fillStyle = skin;
  if (dir !== 'left') { c.beginPath(); c.arc(cx + bw / 2 - s * 0.01, bodyTop + s * 0.27 + sw, s * 0.045, 0, 7); c.fill(); }
  if (dir !== 'right') { c.beginPath(); c.arc(cx - bw / 2 + s * 0.01, bodyTop + s * 0.27 - sw, s * 0.045, 0, 7); c.fill(); }
  // bag strap + bag
  if (L.bag && dir !== 'up') {
    c.strokeStyle = L.bag; c.lineWidth = s * 0.04;
    c.beginPath(); c.moveTo(cx - bw * 0.35, bodyTop + s * 0.02); c.lineTo(cx + bw * 0.4, bodyBot - s * 0.06); c.stroke();
    if (dir === 'down' || dir === 'right') { rr(c, cx + bw * 0.22, bodyBot - s * 0.14, s * 0.15, s * 0.13, s * 0.03); c.fillStyle = L.bag; c.fill(); ol(c, s * 0.02); }
  }

  // head
  c.beginPath(); c.arc(cx, headY, headR, 0, 7); c.fillStyle = skin; c.fill(); ol(c, s * 0.03);

  // hair
  c.fillStyle = L.hair;
  const hs = L.hairStyle;
  if (hs !== 'bald') {
    if (dir === 'up') {
      c.beginPath(); c.arc(cx, headY, headR * 1.02, 0, 7); c.fill(); ol(c, s * 0.03);
    } else {
      c.beginPath();
      c.arc(cx, headY - headR * 0.05, headR * 1.04, Math.PI * 1.02, Math.PI * 1.98);
      if (dir === 'down') { c.quadraticCurveTo(cx + headR * 0.4, headY - headR * 0.25, cx, headY - headR * 0.35); c.quadraticCurveTo(cx - headR * 0.5, headY - headR * 0.2, cx - headR * 1.0, headY + headR * 0.1); }
      else { const f = dir === 'right' ? -1 : 1; c.lineTo(cx + f * headR * 0.9, headY + headR * 0.3); c.quadraticCurveTo(cx + f * headR * 0.2, headY - headR * 0.2, cx - f * headR * 0.6, headY - headR * 0.4); }
      c.closePath(); c.fill(); ol(c, s * 0.03);
    }
    if (hs === 'spiky') {
      c.beginPath();
      for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); c.moveTo(cx + Math.cos(a) * headR * 0.8, headY + Math.sin(a) * headR * 0.8); c.lineTo(cx + Math.cos(a) * headR * 1.35, headY + Math.sin(a) * headR * 1.35); c.lineTo(cx + Math.cos(a + 0.18) * headR * 0.9, headY + Math.sin(a + 0.18) * headR * 0.9); }
      c.fill();
    }
    if (hs === 'pigtails' && dir !== 'up') {
      for (const f of [-1, 1]) { c.beginPath(); c.ellipse(cx + f * headR * 1.05, headY + headR * 0.2, headR * 0.28, headR * 0.42, f * 0.3, 0, 7); c.fill(); ol(c, s * 0.025); }
    }
    if (hs === 'bun') { c.beginPath(); c.arc(cx, headY - headR * 1.05, headR * 0.36, 0, 7); c.fill(); ol(c, s * 0.025); }
    if (hs === 'long' && dir !== 'up') {
      for (const f of [-1, 1]) { rr(c, cx + f * headR * 0.95 - headR * 0.22, headY - headR * 0.1, headR * 0.44, headR * 1.3, headR * 0.2); c.fill(); }
    }
    if (hs === 'bob' && dir !== 'up') {
      for (const f of [-1, 1]) { rr(c, cx + f * headR * 0.92 - headR * 0.2, headY - headR * 0.2, headR * 0.4, headR * 0.9, headR * 0.2); c.fill(); }
    }
  } else {
    c.beginPath(); c.arc(cx - headR * 0.9, headY + headR * 0.1, headR * 0.22, 0, 7); c.arc(cx + headR * 0.9, headY + headR * 0.1, headR * 0.22, 0, 7);
    c.fillStyle = L.hair; c.fill();
  }

  // face
  if (dir !== 'up') {
    const eyeY = headY + headR * 0.18;
    c.fillStyle = '#2b1d16';
    const eye = (x) => { c.beginPath(); c.ellipse(x, eyeY, headR * 0.12, headR * 0.17, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + headR * 0.04, eyeY - headR * 0.06, headR * 0.05, 0, 7); c.fill(); c.fillStyle = '#2b1d16'; };
    if (dir === 'down') { eye(cx - headR * 0.36); eye(cx + headR * 0.36); }
    else eye(cx + (dir === 'right' ? headR * 0.45 : -headR * 0.45));
    if (old) { c.strokeStyle = '#2b1d16'; c.lineWidth = s * 0.015; c.beginPath(); c.arc(cx - headR * 0.36, eyeY, headR * 0.2, 0, 7); c.arc(cx + headR * 0.36, eyeY, headR * 0.2, 0, 7); if (dir === 'down') c.stroke(); }
    c.fillStyle = 'rgba(255,120,140,0.45)';
    if (dir === 'down') { c.beginPath(); c.ellipse(cx - headR * 0.6, eyeY + headR * 0.3, headR * 0.16, headR * 0.09, 0, 0, 7); c.ellipse(cx + headR * 0.6, eyeY + headR * 0.3, headR * 0.16, headR * 0.09, 0, 0, 7); c.fill(); }
    c.strokeStyle = '#7a3b2b'; c.lineWidth = s * 0.018; c.lineCap = 'round';
    const mx = dir === 'down' ? cx : cx + (dir === 'right' ? headR * 0.35 : -headR * 0.35);
    c.beginPath(); c.arc(mx, eyeY + headR * 0.32, headR * 0.12, 0.2, Math.PI - 0.2); c.stroke();
  }

  // hats
  if (L.hat === 'school') {
    c.fillStyle = '#ffd23e';
    c.beginPath(); c.ellipse(cx, headY - headR * 0.25, headR * 1.3, headR * 0.38, 0, 0, 7); c.fill(); ol(c, s * 0.028);
    c.beginPath(); c.arc(cx, headY - headR * 0.32, headR * 0.92, Math.PI, 0); c.closePath(); c.fill(); ol(c, s * 0.028);
    c.fillStyle = '#e8b51f'; c.fillRect(cx - headR * 0.9, headY - headR * 0.42, headR * 1.8, headR * 0.12);
    if (dir !== 'up') { c.fillStyle = '#6cc24a'; c.beginPath(); c.ellipse(cx + headR * 0.3, headY - headR * 0.95, headR * 0.22, headR * 0.12, -0.6, 0, 7); c.fill(); }
  } else if (L.hat) {
    c.fillStyle = L.hat;
    c.beginPath(); c.arc(cx, headY - headR * 0.2, headR * 0.98, Math.PI, 0); c.closePath(); c.fill(); ol(c, s * 0.028);
    if (dir !== 'up') { c.beginPath(); c.ellipse(cx + (dir === 'left' ? -headR * 0.5 : dir === 'right' ? headR * 0.5 : 0), headY - headR * 0.2, headR * 0.7, headR * 0.16, 0, 0, 7); c.fill(); ol(c, s * 0.022); }
  }
  if (L.crown) {
    c.fillStyle = '#f2c230';
    c.beginPath(); c.moveTo(cx - headR * 0.6, headY - headR * 0.7); c.lineTo(cx - headR * 0.6, headY - headR * 1.25); c.lineTo(cx - headR * 0.3, headY - headR * 0.95);
    c.lineTo(cx, headY - headR * 1.35); c.lineTo(cx + headR * 0.3, headY - headR * 0.95); c.lineTo(cx + headR * 0.6, headY - headR * 1.25); c.lineTo(cx + headR * 0.6, headY - headR * 0.7); c.closePath();
    c.fill(); ol(c, s * 0.025);
  }
}

// White shrine fox (quiz spirit) sitting with a red bib.
function drawFox(c, s, frame) {
  const cx = s / 2, ground = s * 1.42, bob = frame % 2 ? -s * 0.02 : 0;
  c.fillStyle = 'rgba(40,30,20,0.2)'; c.beginPath(); c.ellipse(cx, ground, s * 0.26, s * 0.07, 0, 0, 7); c.fill();
  // tail
  c.beginPath(); c.moveTo(cx + s * 0.12, ground - s * 0.1); c.quadraticCurveTo(cx + s * 0.48, ground - s * 0.2, cx + s * 0.38, ground - s * 0.6 + bob);
  c.quadraticCurveTo(cx + s * 0.26, ground - s * 0.36, cx + s * 0.08, ground - s * 0.28); c.closePath();
  c.fillStyle = '#fffaf2'; c.fill(); ol(c, s * 0.03);
  c.fillStyle = '#ff9a3c'; c.beginPath(); c.arc(cx + s * 0.38, ground - s * 0.56 + bob, s * 0.05, 0, 7); c.fill();
  // body
  c.beginPath(); c.ellipse(cx, ground - s * 0.22, s * 0.2, s * 0.22, 0, 0, 7); c.fillStyle = '#fffaf2'; c.fill(); ol(c, s * 0.03);
  c.fillStyle = '#e2483d'; c.beginPath(); c.moveTo(cx - s * 0.16, ground - s * 0.38); c.lineTo(cx + s * 0.16, ground - s * 0.38); c.lineTo(cx, ground - s * 0.22); c.closePath(); c.fill();
  // head
  const hy = ground - s * 0.56 + bob;
  for (const f of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + f * s * 0.08, hy - s * 0.14); c.lineTo(cx + f * s * 0.2, hy - s * 0.36); c.lineTo(cx + f * s * 0.24, hy - s * 0.06); c.closePath();
    c.fillStyle = '#fffaf2'; c.fill(); ol(c, s * 0.028);
    c.fillStyle = '#ff8fa8'; c.beginPath(); c.moveTo(cx + f * s * 0.11, hy - s * 0.14); c.lineTo(cx + f * s * 0.19, hy - s * 0.29); c.lineTo(cx + f * s * 0.21, hy - s * 0.1); c.closePath(); c.fill();
  }
  c.beginPath(); c.ellipse(cx, hy, s * 0.22, s * 0.18, 0, 0, 7); c.fillStyle = '#fffaf2'; c.fill(); ol(c, s * 0.03);
  c.strokeStyle = '#e2483d'; c.lineWidth = s * 0.025; c.lineCap = 'round';
  for (const f of [-1, 1]) { c.beginPath(); c.moveTo(cx + f * s * 0.13, hy - s * 0.02); c.quadraticCurveTo(cx + f * s * 0.08, hy - s * 0.06, cx + f * s * 0.04, hy - s * 0.01); c.stroke(); }
  c.fillStyle = '#2b1d16'; c.beginPath(); c.ellipse(cx, hy + s * 0.07, s * 0.03, s * 0.02, 0, 0, 7); c.fill();
}

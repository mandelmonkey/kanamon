// SVG battle backdrops per map theme (like the trailer's dusky cherry-blossom clearing).
import { painted } from './painted.js';

const SKY = {
  spring:   ['#ffd6e8', '#c9b6f2', '#9d8fd8'],
  forest:   ['#d8f0c8', '#a8d8a0', '#7fbf86'],
  beach:    ['#bfe8ff', '#8fd3f5', '#5fbde8'],
  mountain: ['#d6ecff', '#b4d4f2', '#93bde6'],
  snow:     ['#eef6ff', '#d4e6f7', '#b8d2ec'],
  night:    ['#2a2a6a', '#3d3580', '#5a4a96'],
  castle:   ['#ffe6c4', '#ffc9a8', '#f2a68f'],
};

function trees(color, light, y, n, seed, scale = 1) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (1000 / n) + Math.sin(seed + i * 7.3) * 30, r = (46 + Math.sin(seed * 3 + i) * 12) * scale;
    s += `<rect x="${x - 7 * scale}" y="${y - r * 0.2}" width="${14 * scale}" height="${r * 1.4}" fill="#8a6a55" opacity=".6"/>` +
      `<circle cx="${x}" cy="${y - r * 0.6}" r="${r}" fill="${color}"/><circle cx="${x - r * 0.5}" cy="${y - r * 0.3}" r="${r * 0.7}" fill="${color}"/>` +
      `<circle cx="${x + r * 0.5}" cy="${y - r * 0.35}" r="${r * 0.72}" fill="${color}"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.9}" r="${r * 0.35}" fill="${light}" opacity=".7"/>`;
  }
  return s;
}

function platform(cx, cy, rx, top, side) {
  return `<ellipse cx="${cx}" cy="${cy + 14}" rx="${rx}" ry="${rx * 0.22}" fill="${side}"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.22}" fill="${top}"/>` +
    `<ellipse cx="${cx - rx * 0.25}" cy="${cy - rx * 0.05}" rx="${rx * 0.45}" ry="${rx * 0.07}" fill="#fff" opacity=".18"/>`;
}

// Painted round platform the creatures stand on (null until that theme's art exists).
export function battlePad(theme) { return painted('bg/' + theme + '_pad'); }

export function battleBg(theme, night = false) {
  const p = painted('bg/' + theme);
  if (p) return `<img class="b-paint" src="${p}" alt="">${night && theme !== 'night' ? '<div class="b-night"></div>' : ''}`;
  const t = night && theme !== 'night' ? 'night' : theme;
  const [a, b, c] = SKY[t] || SKY.spring;
  let far = '', near = '', ground = '#9fd27a', ground2 = '#86bd62', ptop = '#a7d97f', pside = '#6f9f4f', extra = '';
  switch (theme) {
    case 'spring':
      far = trees('#f7b8d0', '#ffe0ec', 330, 9, 1, 1.1); near = trees('#f29dbd', '#ffd6e6', 400, 6, 4, 1.5);
      break;
    case 'forest':
      far = trees('#5fa860', '#8fcf7f', 320, 10, 2, 1.1); near = trees('#4a9150', '#77bb6a', 400, 6, 5, 1.6);
      ground = '#8cc76c'; ground2 = '#76b058';
      break;
    case 'beach':
      far = `<rect x="0" y="260" width="1000" height="90" fill="#4fb6e3"/><path d="M0 270 Q250 255 500 270 T1000 270" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`;
      ground = '#f6e2a8'; ground2 = '#ecd28f'; ptop = '#f8e8b8'; pside = '#d9bd7c';
      extra = `<circle cx="820" cy="110" r="44" fill="#fff6b0"/>`;
      break;
    case 'mountain':
      far = `<path d="M0 330 L180 160 L300 260 L450 120 L640 300 L780 180 L1000 330Z" fill="#9db4d1"/><path d="M450 120 L500 165 L470 160 L440 175 L410 160Z" fill="#fff"/>`;
      near = trees('#3f8a5a', '#66aa77', 400, 7, 3, 1.2);
      break;
    case 'snow':
      far = `<path d="M0 320 L200 150 L340 260 L520 110 L700 280 L860 170 L1000 300 L1000 360 L0 360Z" fill="#c8d8ea"/>`;
      near = trees('#2f7a4f', '#e8f2fb', 400, 7, 6, 1.3);
      ground = '#eef5fb'; ground2 = '#dbe7f3'; ptop = '#f6faff'; pside = '#c4d4e6';
      break;
    case 'night':
      far = trees('#3d3a7a', '#5b55a0', 330, 9, 7, 1.1);
      ground = '#5d7f6a'; ground2 = '#4c6b58'; ptop = '#6c907a'; pside = '#3f5a4a';
      break;
    case 'castle':
      far = `<rect x="380" y="150" width="240" height="180" fill="#f4efe4"/><path d="M350 160 L500 90 L650 160Z" fill="#3c8a6e"/><rect x="420" y="70" width="160" height="90" fill="#f4efe4"/><path d="M400 80 L500 30 L600 80Z" fill="#3c8a6e"/>` + trees('#f7b8d0', '#ffe0ec', 360, 6, 9, 1.2);
      ground = '#cfc8b8'; ground2 = '#bdb5a3'; ptop = '#ddd6c6'; pside = '#a59d8c';
      break;
  }
  const stars = t === 'night' ? Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 1000}" cy="${(i * 53) % 250}" r="${1 + (i % 3) * 0.7}" fill="#fff" opacity="${0.4 + (i % 5) * 0.12}"/>`).join('') + '<circle cx="820" cy="80" r="30" fill="#fff8d6"/><circle cx="834" cy="72" r="28" fill="#3d3580"/>' : '';
  const petals = theme === 'spring' ? Array.from({ length: 16 }, (_, i) => `<ellipse cx="${(i * 131) % 1000}" cy="${60 + (i * 71) % 380}" rx="6" ry="3.5" fill="#ffd0e0" opacity=".85" transform="rotate(${i * 37} ${(i * 131) % 1000} ${60 + (i * 71) % 380})"/>`).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
    <linearGradient id="bgnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground}"/><stop offset="1" stop-color="${ground2}"/></linearGradient></defs>
    <rect width="1000" height="600" fill="url(#bsky)"/>${stars}${extra}${far}
    <rect y="330" width="1000" height="270" fill="url(#bgnd)"/>${near}
    ${platform(730, 300, 170, ptop, pside)}${platform(270, 520, 210, ptop, pside)}${petals}
  </svg>`;
}

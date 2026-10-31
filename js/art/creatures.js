// Creature art registry: SVG strings for the DOM, cached <img>s for the canvas.
import { makeToolkit, wrapSvg } from './parts.js';
import core from './mon_core.js';
import a from './mon_a.js';
import b from './mon_b.js';
import c from './mon_c.js';
import { MON } from '../data/kanamon.js';

export const ART = { ...a, ...b, ...c, ...core };

// Placeholder for any creature without art yet: a soft blob wearing its first kana.
function placeholder(P, id) {
  const m = MON[id];
  return P.shadow() + P.ell(50, 62, 30, 27, P.fill('#ffffff', '#e8e0ff', '#bfb2ee')) +
    `<text x="50" y="44" font-size="20" text-anchor="middle" font-weight="900" fill="#5a3b2b" font-family="sans-serif">${m ? m.word[0] : '?'}</text>` +
    P.eyes(50, 62, 16, 5) + P.blush(50, 69, 26) + P.mouth(50, 70, 'smile');
}

export function monSvg(id, { shiny = false } = {}) {
  const P = makeToolkit();
  let body;
  try { body = (ART[id] || ((P) => placeholder(P, id)))(P); }
  catch (e) { console.warn('art failed', id, e); body = placeholder(makeToolkit(), id); }
  return wrapSvg(P, body, { shiny });
}

const urlCache = new Map();
export function monUrl(id, shiny = false) {
  const key = id + (shiny ? '*' : '');
  if (!urlCache.has(key)) {
    const svg = monSvg(id, { shiny });
    urlCache.set(key, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }
  return urlCache.get(key);
}

const imgCache = new Map();
export function monImg(id, shiny = false) {
  const key = id + (shiny ? '*' : '');
  if (!imgCache.has(key)) {
    const img = new Image();
    img.src = monUrl(id, shiny);
    imgCache.set(key, img);
  }
  return imgCache.get(key);
}

// <img> element markup for menus and cards.
export function monTag(id, { shiny = false, cls = '', silhouette = false } = {}) {
  return `<img class="mon ${cls}${silhouette ? ' sil' : ''}" src="${monUrl(id, shiny)}" alt="" draggable="false">`;
}

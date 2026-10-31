// The word card (trailer style) and the しんか evolution scene.
import { MON, CATS } from '../data/kanamon.js';
import { splitKana, toRomaji, ROMAJI } from '../data/kana.js';
import { monTag, monUrl } from '../art/creatures.js';
import { overlay, closeOverlay, onTap, $, $$, sleep, esc, en } from '../ui.js';
import { say, sfx, jingle } from '../audio.js';
import { st } from '../state.js';
import { LINES } from '../data/lines.js';

export function cardHtml(id, { shiny = false, count = null, showDesc = false } = {}) {
  const m = MON[id], cat = CATS[m.cat];
  const first = splitKana(m.word)[0];
  return `<div class="wcard" style="--cc:${cat.color};--cs:${cat.soft}">
    <div class="wc-top"><span class="wc-tag">${cat.ja} <small>${cat.en}</small></span><button class="wc-speak">🔊</button></div>
    <div class="wc-art">${monTag(id, { shiny })}</div>
    <div class="wc-name">${esc(m.name)}${shiny ? ' ✨' : ''}</div>
    <div class="wc-romaji">${toRomaji(m.name)}</div>
    <div class="wc-mean"><b>${esc(m.word)}</b> = ${esc(m.en)}</div>
    <div class="wc-first"><span class="wc-badge">${first}</span><span><b>${first} の おと</b><small>first sound: ${ROMAJI[first] || ''}</small></span></div>
    ${showDesc ? `<div class="wc-desc"><button class="wc-dspeak">🔊</button><div>${esc(m.d.ja)}${en(m.d.en)}</div></div>` : ''}
    ${count !== null ? `<div class="wc-count">No.${String(m.no).padStart(3, '0')}${count ? ` · つかまえた かず ${count}` : ''}</div>` : ''}
  </div>`;
}

export function wireCard(root, id) {
  const m = MON[id];
  root.querySelectorAll('.wc-speak').forEach(b => onTap(b, (e) => { e.stopPropagation(); say([m.name, m.word]); }));
  root.querySelectorAll('.wc-dspeak').forEach(b => onTap(b, (e) => { e.stopPropagation(); say(m.d.ja); }));
}

// After a catch: tiles assemble the word, "+もん", then the card flips in.
export async function catchCard(id, { shiny = false, isNew = true } = {}) {
  const m = MON[id], cat = CATS[m.cat];
  const tiles = splitKana(m.word);
  const o = overlay(`<div class="catchcard" style="--cc:${cat.color};--cs:${cat.soft}">
    <div class="sunburst"></div>
    <div class="cc-left">
      <div class="cc-tiles">${tiles.map(t => `<span class="cc-tile">${t}</span>`).join('')}</div>
      <div class="cc-name"></div><div class="cc-plus">＋もん で モンスター！</div>
    </div>
    <div class="cc-right">${cardHtml(id, { shiny })}</div>
    ${isNew ? '<div class="cc-new">NEW!</div>' : ''}
    <div class="tapnext">タップ ▶</div>
  </div>`, 'card-overlay');
  wireCard(o, id);
  const tileEls = $$('.cc-tile', o);
  await sleep(350);
  for (let i = 0; i < tileEls.length; i++) {
    tileEls[i].classList.add('show'); sfx('tile');
    await say(tiles[i], { gap: 0 });
    await sleep(120);
  }
  await sleep(200);
  $('.cc-name', o).textContent = m.name;
  $('.cc-name', o).classList.add('show');
  $('.cc-plus', o).classList.add('show');
  sfx('sparkle');
  await say(m.name);
  $('.cc-right', o).classList.add('show');
  jingle('jingle_catch');
  await say([m.word, m.en ? null : null].filter(Boolean));
  if (isNew) setTimeout(() => say(LINES.newword.ja), 300);
  await new Promise(r => onTap(o, r));
  closeOverlay(o);
}

// しんか! sequence.
export async function evolveScene(fromId, toId, lv, shiny = false) {
  const a = MON[fromId], b = MON[toId];
  const o = overlay(`<div class="evolve">
    <div class="ev-rays"></div><div class="ev-title">しんか！</div>
    <div class="ev-stage"><img class="ev-a" src="${monUrl(fromId, shiny)}"><img class="ev-b" src="${monUrl(toId, shiny)}"></div>
    <div class="ev-name">${esc(a.name)}</div><div class="ev-lv">Lv.${lv}</div>
    ${en('Evolution!')}
  </div>`, 'evolve-overlay');
  await say(LINES.evolving.ja);
  o.classList.add('glow');
  jingle('jingle_evolve');
  await sleep(2600);
  o.classList.add('done');
  sfx('sparkle');
  $('.ev-name', o).textContent = b.name;
  $('.ev-lv', o).innerHTML = `Lv.${lv} <span class="star">★</span>`;
  await say([LINES.evolve.ja, b.name]);
  await new Promise(r => onTap(o, r));
  closeOverlay(o);
}

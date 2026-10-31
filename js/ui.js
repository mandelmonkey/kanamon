// DOM UI helpers: overlays, dialog boxes, choices, toasts, pictures and the shared question panel.
import { say, sfx, stopVoice } from './audio.js';
import { st } from './state.js';
import { record } from './srs.js';
import { monUrl } from './art/creatures.js';
import { LINES } from './data/lines.js';
import { ROWS } from './data/kana.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const en = (text) => st()?.settings?.english !== false && text ? `<div class="en">${esc(text)}</div>` : '';

// Fast taps on iPad: use pointerup, ignore drags.
export function onTap(node, fn) {
  let sx = 0, sy = 0, down = false;
  node.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sy = e.clientY; });
  node.addEventListener('pointerup', e => {
    if (!down) return; down = false;
    if (Math.hypot(e.clientX - sx, e.clientY - sy) > 18) return;
    fn(e);
  });
  node.addEventListener('pointercancel', () => { down = false; });
}

// ── overlays ──────────────────────────────────────────────
const layer = () => $('#layer');
export function overlay(html, cls = '') {
  const o = el(`<div class="overlay ${cls}">${html}</div>`);
  layer().appendChild(o);
  setTimeout(() => o.classList.add("in"), 16);
  return o;
}
export function closeOverlay(o) {
  if (!o || !o.parentNode) return;
  o.classList.remove('in'); o.classList.add('out');
  setTimeout(() => o.remove(), 220);
}
export const overlayOpen = () => layer().children.length > 0;

export function toast(html, ms = 2200) {
  const t = el(`<div class="toast">${html}</div>`);
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add("in"), 16);
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, ms);
}

// ── pictures ──────────────────────────────────────────────
export function picHtml(pic, cls = '') {
  if (!pic) return '';
  if (typeof pic === 'string') return `<span class="pic emoji ${cls}">${pic}</span>`;
  if (pic.mon) return `<img class="pic mon ${cls}" src="${monUrl(pic.mon, pic.shiny)}" alt="" draggable="false">`;
  if (pic.color) return `<span class="pic swatch ${cls}" style="--c:${pic.color}"></span>`;
  if (pic.count) {
    const dot = pic.thing ? `<i>${pic.thing}</i>` : '<b></b>';
    return `<span class="pic dots ${cls} n${pic.count}">${dot.repeat(pic.count)}</span>`;
  }
  return '';
}

// ── dialog box ────────────────────────────────────────────
// lines: [{ ja, en, who, voice:false }] — resolves when the child taps through all of them.
export function dialog(lines, { who = '', portrait = '' } = {}) {
  if (!Array.isArray(lines)) lines = [lines];
  return new Promise(resolve => {
    const box = el(`<div class="dialog">
      ${portrait ? `<div class="portrait">${portrait}</div>` : ''}
      <div class="dbody"><div class="who"></div><div class="ja"></div><div class="dsub"></div></div>
      <button class="speak" aria-label="play">🔊</button>
      <div class="next"><svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg></div></div>`);
    $('#dialogs').appendChild(box);
    setTimeout(() => box.classList.add("in"), 16);
    let i = 0, typing = 0, full = false;
    const show = () => {
      const L = typeof lines[i] === 'string' ? { ja: lines[i] } : lines[i];
      const name = L.who ?? who;
      $('.who', box).textContent = name;
      $('.who', box).style.display = name ? '' : 'none';
      $('.dsub', box).innerHTML = en(L.en);
      const ja = $('.ja', box);
      ja.textContent = ''; full = false; box.classList.remove('ready');
      const chars = [...L.ja];
      let n = 0;
      clearInterval(typing);
      typing = setInterval(() => {
        n += 1; ja.textContent = chars.slice(0, n).join('');
        if (n >= chars.length) { clearInterval(typing); full = true; box.classList.add('ready'); }
      }, 28);
      if (L.voice !== false || L.audio) say(L.audio || L.ja);
    };
    const advance = () => {
      if (!full) { clearInterval(typing); const L = typeof lines[i] === 'string' ? { ja: lines[i] } : lines[i]; $('.ja', box).textContent = L.ja; full = true; box.classList.add('ready'); return; }
      sfx('tap');
      i++;
      if (i >= lines.length) {
        clearInterval(typing); stopVoice();
        box.classList.remove('in'); setTimeout(() => box.remove(), 180);
        resolve();
      } else show();
    };
    onTap($('.speak', box), (e) => { e.stopPropagation(); const L = typeof lines[i] === 'string' ? { ja: lines[i] } : lines[i]; say(L.audio || L.ja); });
    $('.speak', box).addEventListener('pointerup', e => e.stopPropagation());
    onTap(box, (e) => { if (!e.target.closest('.speak')) advance(); });
    show();
  });
}

// Choice buttons (e.g. はい / いいえ). options: [{ja, en}] → index
export function choose(options, { prompt = null } = {}) {
  return new Promise(resolve => {
    const box = el(`<div class="choices">${prompt ? `<div class="cprompt">${esc(prompt.ja)}${en(prompt.en)}</div>` : ''}
      ${options.map((o, i) => `<button class="btn choice" data-i="${i}">${esc(o.ja)}${en(o.en)}</button>`).join('')}</div>`);
    $('#dialogs').appendChild(box);
    setTimeout(() => box.classList.add("in"), 16);
    if (prompt?.ja) say(prompt.ja);
    $$('.choice', box).forEach(b => onTap(b, () => {
      sfx('tap'); box.remove(); resolve(+b.dataset.i);
    }));
  });
}
export const yesNo = (prompt) => choose([{ ja: 'はい', en: 'Yes' }, { ja: 'いいえ', en: 'No' }], { prompt }).then(i => i === 0);

// ── question panel ────────────────────────────────────────
const PRAISE = ['correct', 'great', 'nice', 'yatta', 'exactly'];
const TILE_COLORS = ['#ffd2dc', '#d4ecff', '#d9f5d0', '#fff1b8', '#eadcff', '#ffe0c2'];

// Renders q into `host` and resolves { correct, ms } once answered.
export function askQuestion(q, host, { onFirstAnswer } = {}) {
  window.__q = q; // handy when testing in the browser console
  return new Promise(resolve => {
    const P = q.prompt;
    const promptJa = P.sentence ? `<div class="qja sentence">${esc(P.ja)}</div>` : `<div class="qja">${esc(P.ja)}</div>`;
    const panel = el(`<div class="qpanel layout-${q.layout}">
      <div class="qprompt">
        <button class="qspeak ${P.audio?.length ? '' : 'dim'}" aria-label="listen">🔊</button>
        <div class="qtext">${promptJa}${en(P.en)}</div>
        ${P.pic ? `<div class="qpic">${picHtml(P.pic)}</div>` : ''}
        ${P.big ? `<div class="qbig">${esc(P.big)}</div>` : ''}
      </div>
      <div class="qanswers"></div>
      <div class="qexplain"></div>
    </div>`);
    host.innerHTML = '';
    host.appendChild(panel);
    const answers = $('.qanswers', panel);
    const t0 = performance.now();
    let done = false, wrongTries = 0;
    const playPrompt = () => P.audio?.length && say(P.audio);
    onTap($('.qspeak', panel), () => { playPrompt(); });
    setTimeout(playPrompt, 250);

    const finish = async (correct, chosenEl) => {
      done = true;
      const ms = performance.now() - t0;
      if (q.key) record(q.key, correct, ms);
      onFirstAnswer?.(correct, ms);
      if (correct) {
        sfx('correct');
        const line = ms < 2200 ? LINES.fast : LINES[PRAISE[Math.floor(Math.random() * PRAISE.length)]];
        panel.classList.add('right');
        await say([line.ja, ...(q.explain?.audio && q.kind === 'tiles' ? q.explain.audio : [])]);
        await sleep(250);
      } else {
        sfx('wrong');
        panel.classList.add('wrongans');
        const ex = q.explain || {};
        $('.qexplain', panel).innerHTML = `<div class="exbox"><span class="exlabel">こたえ</span> ${esc(ex.ja || '')}${en(ex.en)}</div>`;
        await sleep(350);
        await say(ex.audio || []);
        await sleep(900);
      }
      resolve({ correct, ms });
    };

    if (q.kind === 'choice') {
      q.options.forEach((o, i) => {
        const b = el(`<button class="opt" style="--tc:${TILE_COLORS[i % TILE_COLORS.length]}">
          ${o.pic ? picHtml(o.pic) : ''}${o.label ? `<span class="olabel">${esc(o.label)}</span>` : ''}
          ${o.sub && st().settings.english && q.layout === 'pic' && false ? `<span class="osub">${esc(o.sub)}</span>` : ''}</button>`);
        answers.appendChild(b);
        onTap(b, () => {
          if (done) return;
          const ok = o.value === q.answer;
          b.classList.add(ok ? 'good' : 'bad');
          if (!ok) $$('.opt', answers)[q.options.findIndex(x => x.value === q.answer)].classList.add('reveal');
          finish(ok, b);
        });
      });
    } else {
      // tiles: spell a word or order a sentence
      const slots = el(`<div class="slots"></div>`), poolEl = el(`<div class="tilepool"></div>`);
      answers.append(slots, poolEl);
      const filled = [];
      q.answer.forEach(() => slots.appendChild(el('<div class="slot"></div>')));
      const tiles = q.tiles.map((t, i) => {
        const b = el(`<button class="tile ${q.layout === 'words' ? 'word' : ''}" style="--tc:${TILE_COLORS[i % TILE_COLORS.length]}">${esc(t)}</button>`);
        poolEl.appendChild(b);
        onTap(b, () => {
          if (done || b.classList.contains('used') || filled.length >= q.answer.length) return;
          sfx('tile');
          if (q.layout !== 'words') say(t);
          b.classList.add('used');
          filled.push({ t, b });
          render();
          if (filled.length === q.answer.length) check();
        });
        return b;
      });
      const render = () => {
        $$('.slot', slots).forEach((s, i) => {
          s.textContent = filled[i]?.t || '';
          s.classList.toggle('full', !!filled[i]);
        });
      };
      $$('.slot', slots).forEach((s, i) => onTap(s, () => {
        if (done || !filled[i]) return;
        const removed = filled.splice(i);
        removed.forEach(f => f.b.classList.remove('used'));
        render();
      }));
      const check = async () => {
        const ok = filled.every((f, i) => f.t === q.answer[i]);
        if (ok) {
          slots.classList.add('good');
          return finish(wrongTries === 0);
        }
        wrongTries++;
        sfx('wrong');
        slots.classList.add('shake');
        await sleep(500);
        slots.classList.remove('shake');
        // keep the correct prefix, return the rest
        let keep = 0;
        while (keep < filled.length && filled[keep].t === q.answer[keep]) keep++;
        filled.splice(keep).forEach(f => f.b.classList.remove('used'));
        // after a miss, glow the next correct tile as a hint
        const next = q.answer[filled.length];
        const hintTile = tiles.find(b => !b.classList.contains('used') && b.textContent === next);
        hintTile?.classList.add('hint');
        setTimeout(() => hintTile?.classList.remove('hint'), 1800);
        render();
        if (q.explain?.audio && wrongTries >= 1) say(q.explain.audio);
      };
    }
  });
}

// ── kana keyboard (names & nicknames) ─────────────────────
export function kanaKeyboard({ title, titleEn, max = 6, initial = '' }) {
  return new Promise(resolve => {
    const rows = ROWS.filter(r => !r.dakuten);
    const extra = ['が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ','だ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ','ゃ','ゅ','ょ','っ','ー'];
    const o = overlay(`<div class="kbd">
      <div class="kbd-title">${esc(title)}${en(titleEn)}</div>
      <div class="kbd-out"><span class="val"></span><span class="caret">|</span></div>
      <div class="kbd-grid">${rows.map(r => `<div class="kcol">${r.kana.map(k => k ? `<button class="key">${k}</button>` : '<span class="key gap"></span>').join('')}</div>`).join('')}</div>
      <div class="kbd-extra">${extra.map(k => `<button class="key small">${k}</button>`).join('')}</div>
      <div class="kbd-actions"><button class="btn del">けす ⌫</button><button class="btn ok primary">けってい ✓</button></div>
    </div>`, 'kbd-overlay');
    let val = initial;
    const out = $('.val', o);
    const render = () => { out.textContent = val; $('.ok', o).disabled = !val.length; };
    $$('.key:not(.gap)', o).forEach(k => onTap(k, () => {
      if ([...val].length >= max) return;
      sfx('tile'); val += k.textContent; say(k.textContent); render();
    }));
    onTap($('.del', o), () => { val = [...val].slice(0, -1).join(''); sfx('tap'); render(); });
    onTap($('.ok', o), () => { if (!val) return; sfx('open'); closeOverlay(o); resolve(val); });
    render();
  });
}

// Fullscreen celebration banner (やったね！ etc.)
export async function celebrate(line, { pic = null, sub = '' } = {}) {
  const o = overlay(`<div class="celebrate">
    <div class="rays"></div>
    <div class="cel-title">${esc(line.ja)}</div>${en(line.en)}
    ${pic ? `<div class="cel-pic">${pic}</div>` : ''}
    ${sub ? `<div class="cel-sub">${sub}</div>` : ''}
    <div class="confetti">${Array.from({ length: 36 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${(Math.random() * 1.6).toFixed(2)}s;--h:${Math.floor(Math.random() * 360)}"></i>`).join('')}</div>
  </div>`, 'celebrate-overlay');
  say(line.ja);
  await new Promise(r => onTap(o, r));
  closeOverlay(o);
}

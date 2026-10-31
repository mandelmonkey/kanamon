// Lessons: introduce a unit's new hiragana (tap to hear) + its grammar tip, then a short practice.
import { kanaForUnit, ROMAJI, splitKana } from '../data/kana.js';
import { KANAMON } from '../data/kanamon.js';
import { VOCAB } from '../data/vocab.js';
import { GRAMMAR, SENTENCES } from '../data/sentences.js';
import { LINES } from '../data/lines.js';
import { overlay, closeOverlay, onTap, $, $$, sleep, esc, en, askQuestion, celebrate, picHtml } from '../ui.js';
import { say, sfx } from '../audio.js';
import { nextQuestion, wordPic } from '../srs.js';

function exampleFor(k) {
  const all = [...KANAMON.filter(m => m.emoji), ...VOCAB.filter(v => typeof v.pic === 'string' && !['pron', 'adj', 'verb', 'time', 'day', 'greet'].includes(v.cat))];
  return all.find(w => splitKana(w.word)[0] === k) || null;
}

export async function lesson(u) {
  const kana = kanaForUnit(u);
  const o = overlay(`<div class="lesson">
    <div class="ls-title">あたらしい ひらがな！${en('New hiragana! Tap each one to hear it.')}</div>
    <div class="ls-grid ${kana.length > 12 ? 'dense' : ''}">${kana.map(k => {
      const ex = exampleFor(k);
      return `<button class="ls-k" data-k="${k}"><span class="lk">${k}</span><span class="lr">${ROMAJI[k]}</span>${ex ? `<span class="lx">${picHtml(wordPic(ex))}<small>${esc(ex.word)}</small></span>` : ''}</button>`;
    }).join('')}</div>
    <div class="ls-foot"><span class="ls-count"></span><button class="btn primary ls-go" disabled>れんしゅう する！ ▶</button></div>
  </div>`, 'lesson-overlay');
  const heard = new Set();
  const count = () => { $('.ls-count', o).textContent = `${heard.size} / ${kana.length}`; $('.ls-go', o).disabled = heard.size < kana.length; };
  $$('.ls-k', o).forEach(b => onTap(b, () => {
    const k = b.dataset.k, ex = exampleFor(k);
    heard.add(k); b.classList.add('heard'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
    sfx('tile');
    say(ex ? [k, ex.word] : [k]);
    count();
  }));
  count();
  await say(LINES.listen.ja);
  await new Promise(r => onTap($('.ls-go', o), () => { if (heard.size >= kana.length) r(); }));
  sfx('open');

  // grammar tip for this unit
  const grams = [...new Set(SENTENCES.filter(s => s.unit === u).map(s => s.gram))];
  if (grams.length) {
    const g = GRAMMAR[grams[0]], ex = SENTENCES.find(s => s.unit === u && s.gram === grams[0]);
    $('.lesson', o).innerHTML = `<div class="ls-title">ことばの ルール${en('A word rule')}</div>
      <div class="gram"><div class="g-pat">${esc(g.ja)}</div>${en(g.en)}<div class="g-tip">${esc(g.tip)}</div>
      <button class="g-ex"><span class="g-pic">${ex.pic}</span><span><b>${esc(ex.ja)}</b>${en(ex.en)}</span><span>🔊</span></button></div>
      <div class="ls-foot"><span></span><button class="btn primary ls-go">つぎへ ▶</button></div>`;
    onTap($('.g-ex', o), () => say(ex.ja));
    say(ex.ja);
    await new Promise(r => onTap($('.ls-go', o), r));
    sfx('open');
  }

  // practice
  $('.lesson', o).innerHTML = `<div class="ls-title">れんしゅう <span class="ls-n">1</span> / 6</div><div class="qz-host"></div>`;
  const only = kana.map(k => 'k:' + k);
  for (let i = 0; i < 6; i++) {
    $('.ls-n', o).textContent = i + 1;
    await askQuestion(nextQuestion({ mode: 'practice', only, types: ['kana'] }), $('.qz-host', o));
  }
  closeOverlay(o);
  await celebrate(LINES.welldone);
}

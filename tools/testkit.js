// Browser-console helpers for playtesting: await import('/tools/testkit.js')
const sl = (ms) => new Promise(r => setTimeout(r, ms));
window.sl = sl;
window.__tap = (el) => {
  if (typeof el === 'string') el = document.querySelector(el);
  if (!el) return 'missing';
  const r = el.getBoundingClientRect();
  const o = { clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, bubbles: true, pointerId: 1 };
  el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o));
  return 'ok';
};
window.__adv = async (n = 1) => {
  for (let i = 0; i < n; i++) {
    const d = document.querySelector('#dialogs .dialog');
    if (!d) return 'no dialog after ' + i;
    __tap(d); await sl(60); __tap(d); await sl(250);
  }
  return 'done';
};
window.__answer = async (correct = true) => {
  const q = window.__q; if (!q) return 'no q';
  if (q.kind === 'choice') {
    const i = q.options.findIndex(o => (o.value === q.answer) === correct);
    __tap(document.querySelectorAll('.qanswers .opt')[i]);
  } else {
    const tiles = [...document.querySelectorAll('.tilepool .tile')];
    const seq = correct ? q.answer : [...q.answer].reverse();
    for (const t of seq) { const el = tiles.find(b => b.textContent === t && !b.classList.contains('used')); __tap(el); await sl(120); }
  }
  return q.kind + ' ' + JSON.stringify(q.answer);
};
window.__layers = () => [...document.querySelectorAll('#layer > *, #dialogs > *')].map(e => e.className);
window.__mods = async () => ({
  w: await import('/js/world.js'), s: await import('/js/state.js'), ev: await import('/js/events.js'),
  menu: await import('/js/screens/menu.js'), srs: await import('/js/srs.js'), b: await import('/js/battle.js'),
});
export default 'testkit ready';

// Drive whatever is on screen: fight & answer correctly, tap through dialogs/cards/celebrations.
// Returns a log of what happened. Stops when nothing is open or after `max` steps.
window.__auto = async (max = 80, { wrong = 0, choice = 0 } = {}) => {
  const log = [];
  let lastQ = null;
  for (let i = 0; i < max; i++) {
    await sl(450);
    const qp = document.querySelector('.qpanel');
    if (qp && window.__q && window.__q !== lastQ && !qp.classList.contains('right') && !qp.classList.contains('wrongans')) {
      lastQ = window.__q;
      const bad = Math.random() < wrong;
      log.push('Q ' + (window.__q.prompt.ja || '').slice(0, 16) + (bad ? ' ✗' : ' ✓'));
      await __answer(!bad); await sl(1500); continue;
    }
    if (qp) continue;
    const ch = document.querySelector('#dialogs .choices .choice');
    if (ch) { const all = document.querySelectorAll('#dialogs .choices .choice'); log.push('choose ' + all[Math.min(choice, all.length - 1)].textContent.slice(0, 14)); __tap(all[Math.min(choice, all.length - 1)]); continue; }
    const d = document.querySelector('#dialogs .dialog');
    if (d) { log.push('say ' + d.querySelector('.ja').textContent.slice(0, 18)); await __adv(1); continue; }
    const fight = document.querySelector('.b-fight');
    if (fight) { __tap(fight); continue; }
    const tapAway = document.querySelector('.card-overlay, .celebrate-overlay, .evolve-overlay.done, .welcome-overlay');
    if (tapAway) { log.push('tap ' + tapAway.className.split(' ')[1]); __tap(tapAway); await sl(400); continue; }
    if (document.querySelector('.ls-go:not([disabled])')) { __tap('.ls-go'); log.push('lesson next'); continue; }
    const lk = [...document.querySelectorAll('.ls-k:not(.heard)')];
    if (lk.length) { for (const k of lk) { __tap(k); await sl(40); } log.push('heard ' + lk.length); continue; }
    if (document.querySelector('.battle-overlay, .evolve-overlay, .lesson-overlay, .quiz-overlay')) continue;
    if (!document.querySelector('#layer > *')) { log.push('idle'); break; }
  }
  return log;
};

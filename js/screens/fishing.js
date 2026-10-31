// Fishing mini-game: wait for the bite, tap fast. Resolves true if something is hooked.
import { overlay, closeOverlay, onTap, $, sleep, en } from '../ui.js';
import { say, sfx } from '../audio.js';
import { LINES } from '../data/lines.js';
import { W } from '../world.js';

export async function fishing() {
  W.busy++;
  const o = overlay(`<div class="fishing">
    <div class="fs-water"><div class="fs-ripple"></div><div class="fs-bobber"></div><div class="fs-bang">！</div></div>
    <div class="fs-msg">しずかに まってね…${en('Wait quietly…')}</div>
    <button class="btn fs-cancel">やめる</button>
  </div>`, 'fishing-overlay');
  let state = 'wait', resolve;
  const done = new Promise(r => (resolve = r));
  onTap($('.fs-cancel', o), () => { state = 'off'; resolve(false); });
  onTap($('.fs-water', o), () => {
    if (state === 'bite') { state = 'off'; resolve(true); }
    else if (state === 'wait') { $('.fs-msg', o).innerHTML = `まだ だよ！${en('Not yet!')}`; sfx('bump'); }
  });
  sfx('throw');
  (async () => {
    await sleep(1500 + Math.random() * 3000);
    if (state !== 'wait') return;
    state = 'bite';
    o.classList.add('bite'); sfx('encounter');
    $('.fs-msg', o).innerHTML = `ひいてる！ タップ！${en("It's biting! Tap!")}`;
    say(LINES.bite.ja);
    await sleep(1600);
    if (state === 'bite') { state = 'off'; resolve(false); }
  })();
  const got = await done;
  if (got) { o.classList.add('hooked'); sfx('correct'); $('.fs-msg', o).innerHTML = `${LINES.fished.ja}${en('Hooked one!')}`; await say(LINES.fished.ja); }
  else if (!o.querySelector('.fs-cancel').disabled) { $('.fs-msg', o).innerHTML = `にげられた…${en('It got away…')}`; await sleep(900); }
  closeOverlay(o);
  W.busy--;
  return got;
}

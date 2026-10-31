// Battles: answer questions to attack, spell names to catch.
import { MON, CATS } from './data/kanamon.js';
import { ITEMS } from './data/items.js';
import { LINES } from './data/lines.js';
import { st, save, maxHp, needXp, monName, addMon, seeMon, makeMon } from './state.js';
import { nextQuestion, spellTiles } from './srs.js';
import { overlay, closeOverlay, askQuestion, onTap, $, $$, sleep, esc, en, choose, picHtml } from './ui.js';
import { say, sfx, music, jingle, preload, stopVoice } from './audio.js';
import { monUrl } from './art/creatures.js';
import { battleBg, battlePad } from './art/scenes.js';
import { portraitUrl } from './art/people.js';
import { catchCard, evolveScene } from './screens/card.js';
import { progress } from './daily.js';
import { isNight, W } from './world.js';

const MAX_LV = 60;

export async function battle(opts) {
  const s = st();
  const kind = opts.kind || 'wild';
  const wild = kind === 'wild';
  const enemies = opts.enemies.map(e => ({ ...e, hp: maxHp(e) }));
  let ei = 0, enemy = enemies[0];
  let ally = s.party.find(m => m.hp > 0) || s.party[0];
  let combo = 0, netBoost = 0, result = null;
  const participants = new Set([ally.uid]);

  W.busy++;
  stopVoice();
  sfx('encounter');
  jingle('sfx_encounter');
  music(opts.music || (kind === 'master' || kind === 'rival' ? 'master' : 'battle'));
  for (const e of enemies) seeMon(e.id);

  const theme = opts.theme || W.map?.theme || 'spring', pad = battlePad(theme);
  const padTag = pad ? `<img class="b-pad" src="${pad}" alt="">` : '';
  const o = overlay(`<div class="battle${pad ? ' painted' : ''}">
    <div class="b-bg">${battleBg(theme, isNight())}</div>
    <div class="b-enemy">${padTag}<img class="b-mon enemy" alt=""></div>
    <div class="b-ally">${padTag}<img class="b-mon ally" alt=""></div>
    <div class="b-plate enemy"><div class="b-row"><span class="b-name"></span><span class="b-lv"></span></div><div class="hp"><i></i></div><div class="b-party"></div></div>
    <div class="b-plate ally"><div class="b-row"><span class="b-name"></span><span class="b-lv"></span></div><div class="hp"><i></i></div><div class="b-hpnum"></div><div class="xp"><i></i></div></div>
    <div class="b-fx"></div>
    <div class="b-combo"></div>
    ${opts.trainer ? `<div class="b-trainer"><img src="${portraitUrl(opts.trainer.look, 200)}" alt=""><div class="b-tname">${esc(opts.trainer.name)}</div></div>` : ''}
    <div class="b-bottom"><div class="b-msg"></div><div class="b-menu"></div><div class="b-q"></div></div>
  </div>`, 'battle-overlay');

  const E = $('.b-mon.enemy', o), A = $('.b-mon.ally', o);
  const msgEl = $('.b-msg', o), menuEl = $('.b-menu', o), qEl = $('.b-q', o), fx = $('.b-fx', o);

  const setEnemy = () => {
    E.src = monUrl(enemy.id, enemy.shiny);
    $('.b-plate.enemy .b-name', o).textContent = MON[enemy.id].name + (enemy.shiny ? ' ✨' : '');
    $('.b-plate.enemy .b-lv', o).textContent = 'Lv.' + enemy.lv;
    $('.b-plate.enemy .b-party', o).innerHTML = enemies.length > 1 ? enemies.map((x, i) => `<i class="${x.hp <= 0 ? 'out' : i === ei ? 'cur' : ''}"></i>`).join('') : '';
    bar('enemy');
  };
  const setAlly = () => {
    A.src = monUrl(ally.id, ally.shiny);
    $('.b-plate.ally .b-name', o).textContent = monName(ally);
    $('.b-plate.ally .b-lv', o).textContent = 'Lv.' + ally.lv;
    bar('ally');
  };
  const bar = (who) => {
    const m = who === 'enemy' ? enemy : ally;
    const r = Math.max(0, m.hp / maxHp(m));
    const i = $(`.b-plate.${who} .hp i`, o);
    i.style.width = (r * 100) + '%';
    i.className = r > 0.5 ? '' : r > 0.2 ? 'mid' : 'low';
    if (who === 'ally') {
      $('.b-hpnum', o).textContent = `${Math.max(0, Math.ceil(ally.hp))} / ${maxHp(ally)}`;
      $('.b-plate.ally .xp i', o).style.width = Math.min(100, ally.xp / needXp(ally.lv) * 100) + '%';
    }
  };

  async function msg(ja, enText, voice = null, min = 650) {
    msgEl.innerHTML = `<div class="ja">${esc(ja)}</div>${en(enText)}`;
    msgEl.classList.add('show'); menuEl.innerHTML = ''; qEl.innerHTML = '';
    const t0 = Date.now();
    if (voice) await say(voice);
    const wait = min - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
  }

  function popText(text, cls, target) {
    const t = document.createElement('div');
    t.className = 'pop ' + cls;
    t.textContent = text;
    (target === 'ally' ? $('.b-ally', o) : $('.b-enemy', o)).appendChild(t);
    setTimeout(() => t.remove(), 1400);
  }

  function bigWord(text, color) {
    const t = document.createElement('div');
    t.className = 'bigword';
    t.style.setProperty('--wc', color);
    t.textContent = text;
    fx.appendChild(t);
    setTimeout(() => t.remove(), 1300);
  }

  async function hit(targetEl, dmg, who, big) {
    targetEl.classList.remove('hit'); void targetEl.offsetWidth; targetEl.classList.add('hit');
    sfx(big ? 'bigHit' : 'hit');
    popText('-' + dmg, big ? 'dmg big' : 'dmg', who);
    await sleep(380);
  }

  const ratio = (a, b) => Math.max(0.45, Math.min(2.2, (a.lv + 5) / (b.lv + 5)));

  async function allyAttack(ms) {
    const m = MON[ally.id];
    const fast = ms < 2200;
    combo++;
    const comboMul = 1 + Math.min(combo - 1, 5) * 0.08;
    let dmg = Math.round(maxHp(enemy) * 0.34 * Math.pow(ratio(ally, enemy), 0.85) * (0.9 + Math.random() * 0.2) * (fast ? 1.35 : 1) * comboMul);
    dmg = Math.max(1, dmg);
    A.classList.remove('lunge'); void A.offsetWidth; A.classList.add('lunge');
    bigWord(m.atk, CATS[m.cat].color);
    say(m.atk);
    $('.b-combo', o).textContent = combo >= 2 ? `れんぞく ${combo}！` : '';
    $('.b-combo', o).classList.toggle('show', combo >= 2);
    await sleep(320);
    enemy.hp = Math.max(0, enemy.hp - dmg);
    await hit(E, dmg, 'enemy', fast);
    bar('enemy');
    if (fast) popText('はやい！', 'tag', 'enemy');
    await sleep(350);
  }

  async function enemyAttack(scale = 1) {
    const m = MON[enemy.id];
    combo = 0; $('.b-combo', o).classList.remove('show');
    let dmg = Math.max(1, Math.round(maxHp(ally) * 0.2 * scale * Math.pow(ratio(enemy, ally), 0.85) * (0.85 + Math.random() * 0.3)));
    E.classList.remove('lunge'); void E.offsetWidth; E.classList.add('lunge');
    await msg(`${m.name}の ${m.atk}！`, `${m.en}-mon attacks!`, [m.atk], 300);
    ally.hp = Math.max(0, ally.hp - dmg);
    await hit(A, dmg, 'ally', false);
    bar('ally');
  }

  function menu() {
    return new Promise(res => {
      msgEl.classList.remove('show');
      qEl.innerHTML = '';
      const canCatch = wild;
      const glow = wild && enemy.hp / maxHp(enemy) < 0.5;
      const btns = [
        ['fight', '⚔️', 'たたかう', 'Fight'],
        ...(canCatch ? [['catch', '🥅', 'つかまえる', 'Catch']] : []),
        ['bag', '🎒', 'かばん', 'Bag'],
        ['swap', '🔄', 'いれかえ', 'Switch'],
        ...(wild || kind === 'tower' ? [['run', '🏃', 'にげる', 'Run']] : []),
      ];
      menuEl.innerHTML = btns.map(([id, icon, ja, e]) => `<button class="bbtn b-${id} ${id === 'catch' && glow ? 'glow' : ''}" data-id="${id}"><span class="bi">${icon}</span><span class="bj">${ja}</span>${en(e)}</button>`).join('');
      if (!s.flags.tut_battle) menuEl.insertAdjacentHTML('afterbegin', `<div class="tut">「たたかう」を タップ！${en('Tap FIGHT and answer to attack!')}</div>`);
      $$('.bbtn', menuEl).forEach(b => onTap(b, () => { sfx('tap'); res(b.dataset.id); }));
    });
  }

  async function chooseMember(forced) {
    const list = s.party.map((m, i) => ({ m, i })).filter(({ m }) => m !== ally);
    if (!list.some(({ m }) => m.hp > 0)) return null;
    return new Promise(res => {
      const p = overlay(`<div class="sheet"><div class="sheet-title">だれに する？${en('Who will you send out?')}</div>
        <div class="partylist">${list.map(({ m, i }) => `<button class="pmem ${m.hp <= 0 ? 'out' : ''}" data-i="${i}"><img src="${monUrl(m.id, m.shiny)}"><span class="pn">${esc(monName(m))}</span><span class="pl">Lv.${m.lv}</span>
        <span class="hp"><i style="width:${m.hp / maxHp(m) * 100}%"></i></span></button>`).join('')}</div>
        ${forced ? '' : '<button class="btn close">もどる</button>'}</div>`, 'sheet-overlay');
      $$('.pmem:not(.out)', p).forEach(b => onTap(b, () => { sfx('tap'); closeOverlay(p); res(s.party[+b.dataset.i]); }));
      const c = $('.close', p); if (c) onTap(c, () => { closeOverlay(p); res(null); });
    });
  }

  async function sendOut(m) {
    ally = m; participants.add(m.uid);
    A.classList.remove('enter'); void A.offsetWidth; A.classList.add('enter');
    setAlly();
    await msg(`いけ！ ${monName(m)}！`, `Go, ${MON[m.id].en}-mon!`, [LINES.go.ja, MON[m.id].name], 500);
  }

  async function useBag() {
    const items = Object.entries(s.items).filter(([k, n]) => n > 0 && ITEMS[k] && (ITEMS[k].heal || (k === 'ami' && wild)));
    if (!items.length) { await msg('つかえる どうぐが ないよ。', 'No usable items.', null, 900); return false; }
    return new Promise(res => {
      const p = overlay(`<div class="sheet"><div class="sheet-title">かばん${en('Bag')}</div>
        <div class="itemlist">${items.map(([k, n]) => `<button class="item" data-k="${k}"><span class="ii">${ITEMS[k].icon}</span><span class="in">${ITEMS[k].ja}${en(ITEMS[k].en)}</span><span class="ic">×${n}</span><span class="id">${ITEMS[k].desc}</span></button>`).join('')}</div>
        <button class="btn close">もどる</button></div>`, 'sheet-overlay');
      $$('.item', p).forEach(b => onTap(b, async () => {
        const k = b.dataset.k, it = ITEMS[k];
        closeOverlay(p);
        s.items[k]--;
        if (k === 'ami') { netBoost = 0.3; await msg('あみを じゅんび した！', 'Net ready — easier to catch!', null, 900); }
        else {
          const before = ally.hp;
          ally.hp = Math.min(maxHp(ally), ally.hp + it.heal);
          sfx('heal'); bar('ally');
          popText('+' + Math.round(ally.hp - before), 'heal', 'ally');
          await msg(`${it.ja}で げんきに なった！`, `Healed with ${it.en}!`, [it.ja], 900);
        }
        res(true);
      }));
      onTap($('.close', p), () => { closeOverlay(p); res(false); });
    });
  }

  // spell the creature's name; returns true when caught
  async function tryCatch(forced) {
    const m = MON[enemy.id];
    const { answer, tiles } = spellTiles(m.word, Math.min(3, 1 + s.badges.length));
    msgEl.classList.remove('show'); menuEl.innerHTML = '';
    const r = await askQuestion({
      key: 'm:' + enemy.id, kind: 'tiles', layout: 'tiles',
      prompt: { ja: 'なまえを つくろう！', en: `Spell its name to catch it! (${m.en})`, pic: { mon: enemy.id, shiny: enemy.shiny }, audio: [m.word] },
      tiles, answer, explain: { ja: m.word, audio: [m.word] },
    }, qEl);
    progress('spell');
    const hpR = enemy.hp / maxHp(enemy);
    const chance = forced ? 1 : Math.min(0.97, 1 - hpR * 0.85 + netBoost + (r.correct ? 0.15 : 0));
    netBoost = 0;
    // throw!
    sfx('throw');
    E.classList.add('catching');
    await sleep(700);
    const ok = Math.random() < chance;
    const shakes = ok ? 3 : 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < shakes; i++) { sfx('shake'); E.classList.remove('shake'); void E.offsetWidth; E.classList.add('shake'); await sleep(520); }
    if (!ok) {
      E.classList.remove('catching', 'shake');
      await msg('あと すこし！ にげられた！', 'So close! It broke free!', [LINES.close.ja], 700);
      return false;
    }
    sfx('sparkle');
    E.classList.add('caught');
    await msg(`${m.name}を つかまえた！`, `Caught ${m.en}-mon!`, [m.name, LINES.caught.ja], 600);
    const isNew = !s.dex[enemy.id]?.caught;
    const caught = makeMon(enemy.id, enemy.lv, enemy.shiny);
    caught.hp = Math.max(1, Math.round(maxHp(caught) * Math.max(0.3, hpR)));
    addMon(caught);
    progress('catch');
    save();
    await catchCard(enemy.id, { shiny: enemy.shiny, isNew });
    return true;
  }

  async function giveXp() {
    const base = Math.round(enemy.lv * 12 * (wild ? 1 : 1.5));
    const lines = [];
    for (const m of s.party) {
      if (m.hp <= 0 && m !== ally) continue;
      const share = m === ally ? base : participants.has(m.uid) ? Math.round(base * 0.6) : Math.round(base * 0.3);
      if (!share || m.lv >= MAX_LV) continue;
      m.xp += share;
      let ups = 0;
      while (m.lv < MAX_LV && m.xp >= needXp(m.lv)) {
        m.xp -= needXp(m.lv);
        const before = maxHp(m);
        m.lv++; ups++;
        m.hp += maxHp(m) - before;
      }
      if (ups) lines.push(m);
    }
    bar('ally');
    for (const m of lines) {
      jingle('jingle_levelup');
      if (m === ally) { setAlly(); popText('LEVEL UP!', 'tag', 'ally'); }
      await msg(`${monName(m)}は レベル ${m.lv}に なった！`, `${MON[m.id].en}-mon grew to level ${m.lv}!`, [LINES.stronger.ja], 900);
    }
  }

  // ── intro ──
  setEnemy();
  A.style.visibility = 'hidden';
  preload([MON[enemy.id].name, MON[enemy.id].word, MON[enemy.id].atk, LINES.appeared.ja]);
  await sleep(500);
  if (opts.trainer) {
    o.classList.add('trainer-in');
    await msg(`${opts.trainer.name}が しょうぶを しかけてきた！`, `${opts.trainer.en || opts.trainer.name} wants to battle!`, null, 1100);
    o.classList.remove('trainer-in');
    await msg(`${opts.trainer.name}は ${MON[enemy.id].name}を だした！`, `They sent out ${MON[enemy.id].en}-mon!`, [MON[enemy.id].name], 500);
  } else {
    E.classList.add('appear');
    if (enemy.shiny) { sfx('sparkle'); await msg(LINES.shiny.ja, LINES.shiny.en, [LINES.shiny.ja], 400); }
    await msg(`${MON[enemy.id].name}が あらわれた！`, `A wild ${MON[enemy.id].en}-mon appeared!`, [MON[enemy.id].name, LINES.appeared.ja], 400);
  }
  A.style.visibility = '';
  await sendOut(ally);

  // ── turns ──
  while (!result) {
    const choice = await menu();
    if (choice === 'fight') {
      s.flags.tut_battle = true;
      msgEl.classList.remove('show'); menuEl.innerHTML = '';
      const q = nextQuestion({ mode: kind, enemyId: enemy.id, focusUnit: opts.focusUnit });
      const r = await askQuestion(q, qEl);
      qEl.innerHTML = '';
      if (r.correct) {
        progress('correct');
        await allyAttack(r.ms);
        if (enemy.hp > 0 && (kind === 'master' || kind === 'rival' || kind === 'tower') && Math.random() < 0.35) await enemyAttack(0.55);
      } else {
        await enemyAttack(1);
      }
    } else if (choice === 'catch') {
      const caught = await tryCatch(false);
      if (caught) { await giveXp(); result = 'caught'; break; }
      await enemyAttack(0.8);
    } else if (choice === 'bag') {
      await useBag();
      continue;
    } else if (choice === 'swap') {
      const m = await chooseMember(false);
      if (m) await sendOut(m);
      continue;
    } else if (choice === 'run') {
      sfx('close');
      await msg(LINES.getaway.ja, LINES.getaway.en, [LINES.getaway.ja], 600);
      result = 'run'; break;
    }

    // enemy down?
    if (enemy.hp <= 0) {
      E.classList.add('faint');
      sfx('close');
      if (wild) {
        await msg(`${MON[enemy.id].name}は へとへとだ！`, `${MON[enemy.id].en}-mon is worn out!`, null, 800);
        await giveXp();
        const owned = s.dex[enemy.id]?.caught;
        let doCatch = true;
        if (owned && !enemy.shiny) doCatch = (await choose([{ ja: 'つかまえる', en: 'Catch it' }, { ja: 'にがして あげる', en: 'Let it go' }], { prompt: { ja: 'もう もっているよ。 つかまえる？', en: 'You already have one. Catch it?' } })) === 0;
        E.classList.remove('faint');
        if (doCatch) { await tryCatch(true); result = 'caught'; }
        else { await msg('ばいばい！', 'Bye bye!', ['ばいばい！'], 500); result = 'win'; }
      } else {
        await giveXp();
        if (ei < enemies.length - 1) {
          ei++; enemy = enemies[ei];
          E.classList.remove('faint', 'hit', 'lunge');
          setEnemy();
          E.classList.remove('appear'); void E.offsetWidth; E.classList.add('appear');
          await msg(`${opts.trainer?.name || ''}は ${MON[enemy.id].name}を だした！`, `They sent out ${MON[enemy.id].en}-mon!`, [MON[enemy.id].name], 500);
        } else result = 'win';
      }
      if (result) break;
    }

    // ally down?
    if (ally.hp <= 0) {
      A.classList.add('faint');
      await msg(`${monName(ally)}は つかれちゃった…`, `${MON[ally.id].en}-mon is worn out…`, [LINES.tired.ja], 700);
      const next = await chooseMember(true);
      A.classList.remove('faint');
      if (!next) {
        await msg(LINES.rest.ja, "Let's rest at the hospital.", [LINES.rest.ja], 900);
        result = 'lose'; break;
      }
      await sendOut(next);
    }
  }

  // ── rewards ──
  if (result === 'win' || result === 'caught') {
    s.stats.battles++;
    progress('win');
    const fri = new Date().getDay() === 5 ? 2 : 1;
    const coins = (opts.reward || (5 + enemies.reduce((a, e) => a + e.lv, 0) * 2)) * fri;
    s.coins += coins;
    if (!wild) { jingle('jingle_win'); await msg(`かった！ ${coins}えん もらった！`, `You won! Got ${coins} yen!`, [LINES.win.ja], 1000); }
    else if (result === 'win') { sfx('coin'); await msg(`${coins}えん みつけた！`, `Found ${coins} yen!`, null, 700); }
    else s.coins += 0;
  }
  save();
  W.busy--;
  closeOverlay(o);
  await sleep(250);
  await checkEvolutions();
  return result;
}

export async function checkEvolutions() {
  const s = st();
  for (const m of [...s.party]) {
    const d = MON[m.id];
    if (d.evo && m.lv >= d.evo.lv) {
      const from = m.id;
      const ratio = m.hp / maxHp(m);
      m.id = d.evo.to;
      m.hp = Math.round(maxHp(m) * ratio);
      const dex = s.dex[m.id] || (s.dex[m.id] = { seen: true, caught: 0 });
      dex.seen = true; dex.caught++;
      if (m.shiny) dex.shiny = true;
      save();
      await evolveScene(from, m.id, m.lv, m.shiny);
    }
  }
}

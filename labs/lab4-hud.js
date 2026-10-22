// Lab 4: a live map that grows with each finished scene (10 XP each) and can be played like the real one:
// tap room 1 to count visits, use the doors, and see that the variable remembers while the room resets.
(() => {
  const hud = document.querySelector('[data-l4-hud]');
  if (!hud) return;
  const DONE_KEY = 'dik105-c3w-done';
  const IDS = ['l4-open', 'l4-var', 'l4-add', 'l4-show', 'l4-if', 'l4-test1', 'l4-arrow', 'l4-clone', 'l4-room2', 'l4-back', 'l4-test2', 'l4-save'];
  const RANKS = [[0, 'Visitor'], [30, 'Mapmaker'], [60, 'Room builder'], [100, 'World builder'], [120, 'Game maker']];
  const $ = sel => hud.querySelector(sel);
  const msg = $('.hud-msg');
  let done = new Set(), visits = 0, room = 1, thought = false, lastXp = null;

  const has = id => done.has(id);
  function read() {
    try { done = new Set((JSON.parse(localStorage.getItem(DONE_KEY)) || []).filter(id => IDS.includes(id))); } catch { done = new Set(); }
  }
  function paint() {
    const xp = done.size * 10;
    const rank = RANKS.filter(r => xp >= r[0]).at(-1)[1];
    $('[data-hud-xp]').textContent = xp;
    $('[data-hud-rank]').textContent = rank;
    $('.hud-xpbar span').style.width = `${xp / 1.2}%`;
    if (lastXp !== null && xp > lastXp) {
      const pop = document.createElement('span');
      pop.className = 'hud-pop';
      pop.textContent = `+${xp - lastXp} XP`;
      $('.hud-top').append(pop);
      setTimeout(() => pop.remove(), 1400);
    }
    lastXp = xp;
    hud.querySelectorAll('[data-need]').forEach(el => el.classList.toggle('is-on', has(el.dataset.need)));
    $('[data-hud-room="2"] .hud-place').textContent = has('l4-room2') ? 'MapOption2' : 'locked';
    $('[data-hud-v]').textContent = visits;
    const txt = $('[data-hud-text]');
    txt.textContent = has('l4-if') && visits >= 3 ? 'You know this place now.' : `Visits: ${visits}`;
    $('[data-hud-thought]').hidden = !thought || room !== 1;
    hud.querySelectorAll('[data-hud-room]').forEach(r => r.classList.toggle('is-here', Number(r.dataset.hudRoom) === room));
    hud.querySelectorAll('[data-hud-go]').forEach(d => { d.disabled = !d.classList.contains('is-on') || Number(d.dataset.hudGo) === room; });
    hud.classList.toggle('is-playable', has('l4-add'));
  }
  function say(text) { msg.textContent = text; }

  $('[data-hud-room="1"]').addEventListener('click', () => {
    if (room !== 1) return;
    if (!has('l4-add')) { say(has('l4-open') ? 'Nothing counts yet. Finish "Count each visit".' : 'Finish scene 1 to load your map.'); return; }
    visits++;
    thought = true;
    try { window.labAudio?.play('star'); } catch {}
    say(has('l4-if') && visits === 3 ? 'visits reached 3. The rule fired.' : `Tap rule: visits is now ${visits}.`);
    paint();
  });
  hud.querySelectorAll('[data-hud-go]').forEach(d => d.addEventListener('click', () => {
    room = Number(d.dataset.hudGo);
    // Go to layout: objects start fresh, global variables keep their value.
    if (room === 1) { thought = false; say(`Back in room 1. visits still ${visits}. The thought is hidden again.`); }
    else say(has('l4-back') ? 'Room 2. Find the way back.' : 'Room 2. No way back yet: finish "Close the loop".');
    paint();
  }));

  // c3-play stores the tick first; read it right after.
  document.addEventListener('click', e => {
    if (!e.target.closest('.l4w .c3w-done')) return;
    setTimeout(() => {
      const before = done.size;
      read();
      if (done.size > before) say(done.size === IDS.length ? 'Map complete. Play it, then go to the final gate.' : 'New piece on your map.');
      paint();
    }, 0);
  });

  // A link straight to a side quest opens its tile.
  function openTarget() {
    const t = location.hash && document.getElementById(location.hash.slice(1));
    const tile = t?.closest('details.sq');
    if (tile) { tile.open = true; t.scrollIntoView({block: 'start'}); }
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();

  read();
  paint();
  if (done.size) say(done.size === IDS.length ? 'Map complete. Tap your place, use the doors.' : 'Tap your place to play what you have built.');
})();

// Power-ups: two decks of tip cards, one card at a time. Seen cards count as collected.
(() => {
  const box = document.querySelector('[data-l4-power]');
  if (!box) return;
  const KEY = 'dik105-l4-power';
  const cards = [...box.querySelectorAll('.pw-card')];
  cards.forEach((c, i) => { c.dataset.pw = i; });
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch {}
  let deck = 'c3', at = 0;
  const inDeck = () => cards.filter(c => c.dataset.deck === deck);
  box.classList.add('pw-js');
  box.querySelector('.pw-decks').hidden = false;
  box.querySelector('.pw-nav').hidden = false;
  function show() {
    const list = inDeck();
    at = (at + list.length) % list.length;
    cards.forEach(c => { c.hidden = c !== list[at]; });
    got.add(list[at].dataset.pw);
    try { localStorage.setItem(KEY, JSON.stringify([...got])); } catch {}
    const n = list.filter(c => got.has(c.dataset.pw)).length;
    box.querySelector('.pw-count').textContent = n === list.length ? `${list.length} of ${list.length} collected ✓` : `${n} of ${list.length} collected`;
    box.querySelectorAll('[data-pw-deck]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pwDeck === deck)));
  }
  box.querySelectorAll('[data-pw-deck]').forEach(b => b.addEventListener('click', () => { deck = b.dataset.pwDeck; at = 0; show(); }));
  box.querySelector('[data-pw-prev]').addEventListener('click', () => { at--; show(); });
  box.querySelector('[data-pw-next]').addEventListener('click', () => {
    const before = got.size;
    at++;
    show();
    if (got.size > before) { try { window.labAudio?.play('star'); } catch {} }
  });
  show();
})();

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
    $('[data-hud-room="1"] .hud-place').textContent = hud.dataset.project || 'your place';
    $('[data-hud-v]').textContent = visits;
    const txt = $('[data-hud-text]');
    txt.textContent = has('l4-if') && visits >= 3 ? 'You know this place now.' : `Visits: ${visits}`;
    $('[data-hud-thought]').hidden = !thought || room !== 1;
    hud.querySelectorAll('[data-hud-room]').forEach(r => r.classList.toggle('is-here', Number(r.dataset.hudRoom) === room));
    hud.querySelectorAll('[data-hud-go]').forEach(d => { d.disabled = !d.classList.contains('is-on') || Number(d.dataset.hudGo) === room; });
    hud.classList.toggle('is-playable', has('l4-add'));
  }
  function say(text) {
    msg.textContent = text;
    // Dr. Turing nods when he has something new to say.
    const talk = hud.querySelector('.hud-talk');
    talk?.classList.remove('is-talking');
    void talk?.offsetWidth;
    talk?.classList.add('is-talking');
  }

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
    const t = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    const tile = t?.closest('details.sq');
    if (tile) { tile.open = true; t.scrollIntoView({block: 'start'}); }
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();

  // The project card names the place on the map.
  document.addEventListener('l4-project', e => { hud.dataset.project = e.detail.name; paint(); });

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

// Your project: pick what you are building, and every scene shows how its power fits your own work.
// The three-line plan in the final gate is saved here too, and can be copied into the Discussions post.
(() => {
  const pick = document.querySelector('[data-l4-pick]');
  if (!pick) return;
  const KEY = 'dik105-l4-project';
  const LABEL = {story: 'a story', game: 'a game', place: 'a place or tour', poem: 'a poem or artwork', sound: 'a sound piece', any: 'something new'};
  const TIPS = {
    any: ['Not sure yet? Pick the power you liked most today. Your project can grow from that one rule.',
      'A good first question: what should your work remember about the person using it?'],
    story: ['Stories love memory. Let chapter 2 remember a choice from chapter 1.',
      'A variable called trust can change how a character speaks to the reader.'],
    game: ['Score, lives and keys are all variables. A level is a layout.',
      'Make one rule that waits: keysFound ≥ 3 opens the door.'],
    place: ['A tour can remember where the visitor has been: roomsSeen.',
      'Unlock the last room only when every object has been found.'],
    poem: ['A poem that changes the more it is read: linesRead.',
      'Return to the first page and let it say something new.'],
    sound: ['A variable can be a volume, a layer count or a mood.',
      'Let the sound remember the listener: what played before changes what plays next.'],
  };
  const COMMON = ['Your final work is about speculative digital futures. Ask: what will the future remember?',
    'Small and working beats big and broken. One variable, one rule, two rooms.',
    'Read your sheet like a sentence: when this happens, if this is true, do that.',
    'Test with someone else. Say nothing, watch their hands.'];
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const msg = document.querySelector('[data-l4-hostmsg]');
  const name = pick.querySelector('[data-l4-pname]');
  const plans = [...document.querySelectorAll('[data-l4-plan]')];
  const copy = document.querySelector('[data-l4-copy]');
  const ask = document.querySelector('[data-l4-ask]');
  let tip = 0;

  function say(text) {
    msg.textContent = text;
    msg.classList.remove('is-new');
    void msg.offsetWidth;
    msg.classList.add('is-new');
  }
  function apply() {
    const t = st.type || 'any';
    pick.querySelectorAll('[data-l4-pt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l4Pt === st.type)));
    document.querySelectorAll('[data-l4-yours]').forEach(p => {
      const spans = [...p.querySelectorAll('[data-pt]')];
      const show = spans.find(s => s.dataset.pt === t) || spans.find(s => s.dataset.pt === 'any');
      spans.forEach(s => { s.hidden = s !== show; });
    });
    const title = (st.name || '').trim();
    document.querySelectorAll('[data-l4-pshow]').forEach(b => { b.textContent = title || 'your project'; });
    document.dispatchEvent(new CustomEvent('l4-project', {detail: {name: title}}));
  }

  pick.hidden = false;
  ask.hidden = false;
  copy.hidden = false;
  name.value = st.name || '';
  plans.forEach(i => { i.value = st[i.dataset.l4Plan] || ''; });

  pick.querySelectorAll('[data-l4-pt]').forEach(b => b.addEventListener('click', () => {
    st.type = b.dataset.l4Pt;
    save();
    apply();
    tip = 0;
    say(`You are building ${LABEL[st.type]}. Look for YOUR PROJECT under each scene. ${TIPS[st.type][0]}`);
    try { window.labAudio?.play('star'); } catch {}
  }));
  name.addEventListener('input', () => { st.name = name.value; save(); apply(); });
  plans.forEach(i => i.addEventListener('input', () => { st[i.dataset.l4Plan] = i.value; save(); }));
  ask.addEventListener('click', () => {
    const list = [...TIPS[st.type || 'any'], ...COMMON];
    say(list[tip % list.length]);
    tip++;
  });
  copy.addEventListener('click', async () => {
    const out = document.querySelector('[data-l4-copied]');
    const v = k => (st[k] || '').trim() || '...';
    const text = `${(st.name || '').trim() || 'My project'} (${LABEL[st.type || 'any']}). It remembers: ${v('var')}. When it reaches: ${v('rule')}. Room 2 is: ${v('room')}. Its future: ${v('future')}.`;
    try { await navigator.clipboard.writeText(text); out.textContent = 'Copied. Paste it under your screenshot.'; }
    catch { out.textContent = text; }
  });
  apply();
})();

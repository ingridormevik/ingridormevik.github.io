// Lab 02: VIBE//CODE. A replay of one AI coding session. The prompt forge lives in vibe-arena.js.
(() => {
  const root = document.querySelector('[data-vibe]');
  if (!root) return;
  const reduced = () => document.documentElement.classList.contains('access-no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(done => setTimeout(done, reduced() ? 0 : ms));
  const $ = sel => root.querySelector(sel);

  // ---------- Replay ----------
  const INTENT = 'Click the button to show a future version of the bus stop. Click again to return to the present.';
  const PROMPT = 'When someone clicks #future, change #story to “In 2040, this stop plays memories left by strangers.” Plain JavaScript in script.js. Explain each line.';
  const FUTURE = 'In 2040, this stop plays memories left by strangers.';
  const NOW = 'I hear rain at the bus stop.';
  // flag: a decision nobody asked for. why: what the student learns when they catch it.
  const AI_CODE = [
    {t: 'const story = document.querySelector("#story");'},
    {t: 'const button = document.querySelector("#future");'},
    {t: ''},
    {t: 'button.addEventListener("click", () => {'},
    {t: '  story.textContent = "In 2040, this stop plays memories left by strangers.";'},
    {t: '  document.body.style.background = "#ff00ff";', flag: 'Colour. You never asked for magenta.'},
    {t: '  story.style.fontFamily = "Comic Sans MS";', flag: 'Font. It replaced your typography.'},
    {t: '  alert("Welcome to the future!");', flag: 'Pop-up. A new feature, and new words, you did not write.'},
    {t: '});'},
    {t: ''}
  ];
  const MINE = [
    {t: 'const story = document.querySelector("#story");'},
    {t: 'const button = document.querySelector("#future");'},
    {t: 'const nowText = story.textContent;', add: 1},
    {t: 'let showingFuture = false;', add: 1},
    {t: ''},
    {t: 'button.addEventListener("click", () => {'},
    {t: '  showingFuture = !showingFuture;', add: 1},
    {t: '  story.textContent = showingFuture', add: 1},
    {t: '    ? "In 2040, this stop plays memories left by strangers."', add: 1},
    {t: '    : nowText;', add: 1},
    {t: '  button.textContent = showingFuture ? "Back to now" : "See a possible future";', add: 1},
    {t: '});'}
  ];

  const BEATS = [
    {name: 'INTEND', text: 'Decide first: one click shows the future, the next brings you back.'},
    {name: 'ASK', text: 'One small request. Name the button, the text and the limits.'},
    {name: 'MACHINE WRITES', text: 'Green lines are only suggestions until you press Keep.'},
    {name: 'READ', text: 'Your turn: click the 3 lines nobody asked for.'},
    {name: 'TEST', text: 'Click the preview button twice. Does it come back?'},
    {name: 'MAKE IT YOURS', text: 'Unwanted lines out, a toggle in, tested twice. Logged.'}
  ];

  const code = $('[data-code]'), chat = $('[data-chat]'), promptBox = $('[data-prompt]');
  const story = $('[data-page-story]'), pageBtn = $('[data-page-btn]'), page = $('[data-page]'), alertBox = $('[data-alert]');
  const playBtn = $('[data-play]'), label = $('[data-beat-label]'), narr = $('[data-beat-text]');
  const hunt = $('[data-hunt]'), huntCount = $('[data-hunt-count]'), review = $('[data-review]'), badge = $('[data-diff-badge]');
  const sticky = $('[data-sticky-text]');
  let beat = 0, run = 0, behaviour = 'none', future = false, caught = 0, huntDone = false;

  async function type(el, text, speed = 18) {
    const id = run;
    if (reduced()) { el.textContent = text; return; }
    el.textContent = '';
    for (const ch of text) { if (id !== run) return; el.textContent += ch; await wait(speed); }
  }
  function line(item, cls = '') {
    const li = document.createElement('li');
    li.className = cls;
    li.innerHTML = '<code></code>';
    li.firstChild.textContent = item.t || ' ';
    code.append(li);
    return li;
  }
  function msg(who, text) {
    const p = document.createElement('p');
    p.className = `vb-msg vb-msg-${who}`;
    p.textContent = text;
    chat.append(p);
    chat.scrollTop = chat.scrollHeight;
    return p;
  }
  function resetPage() {
    future = false; story.textContent = NOW; pageBtn.textContent = 'See a possible future';
    page.classList.remove('is-magenta', 'is-comic'); alertBox.hidden = true;
  }
  function baseScene(upTo) {
    // Rebuild the static state reached at the start of beat `upTo`, so Back and jumps work.
    run++;
    code.textContent = ''; chat.textContent = ''; promptBox.textContent = ''; sticky.textContent = '';
    hunt.hidden = true; review.hidden = true; badge.hidden = true; behaviour = 'none'; resetPage();
    root.querySelector('.vb-stage').dataset.beat = upTo;
    if (upTo >= 1) sticky.textContent = INTENT;
    if (upTo < 2) { line({t: '// script.js is empty. Nothing happens yet.'}, 'is-comment'); return; }
    msg('me', PROMPT);
    msg('ai', 'Here is a click handler for script.js. Line 1 and 2 find your elements, line 4 waits for a click, line 5 swaps the text…');
    if (upTo >= 2 && upTo < 5) {
      AI_CODE.forEach((item, i) => { const li = line(item, 'is-add'); li.dataset.i = i; });
      review.hidden = false; badge.hidden = false;
      behaviour = 'ai';
    }
    if (upTo >= 4) markAll();
    if (upTo >= 5) { MINE.forEach(item => line(item, item.add ? 'is-mine' : '')); behaviour = 'mine'; }
  }
  function markAll() {
    code.querySelectorAll('li').forEach(li => {
      const item = AI_CODE[li.dataset.i];
      if (item && item.flag) flag(li, item.flag);
    });
    caught = 3; huntDone = true;
  }
  function flag(li, why) {
    if (li.classList.contains('is-flag')) return false;
    li.classList.add('is-flag');
    const note = document.createElement('span');
    note.className = 'vb-flag-note';
    note.textContent = `⚠ ${why}`;
    li.append(note);
    return true;
  }

  async function play(n) {
    baseScene(n);
    const id = run;
    label.textContent = `BEAT ${String(n + 1).padStart(2, '0')} / 06 · ${BEATS[n].name}`;
    narr.textContent = BEATS[n].text;
    root.querySelectorAll('[data-beat-jump]').forEach((b, i) => { b.classList.toggle('is-on', i === n); b.classList.toggle('is-past', i < n); b.setAttribute('aria-current', i === n ? 'step' : 'false'); });
    playBtn.disabled = true;
    if (n === 0) await type(sticky, INTENT, 28);
    if (n === 1) {
      await type(promptBox, PROMPT, 22);
      if (id !== run) return;
      await wait(400); promptBox.textContent = ''; msg('me', PROMPT);
      await wait(500); if (id === run) msg('ai', 'Thinking…').classList.add('is-thinking');
    }
    if (n === 2) {
      const ai = msg('ai', '');
      await type(ai, 'Here is a click handler for script.js. Line 1 and 2 find your elements, line 4 waits for a click, line 5 swaps the text…', 12);
      for (const [i, item] of AI_CODE.entries()) {
        if (id !== run) return;
        const li = line(item, 'is-add is-new'); li.dataset.i = i;
        await wait(160);
      }
      review.hidden = false; badge.hidden = false; behaviour = 'ai';
    }
    if (n === 3) startHunt();
    if (n === 4) {
      await wait(700); if (id !== run) return;
      await press(); await wait(1600); if (id !== run) return;
      alertBox.hidden = true; await wait(500); await press();
      if (id === run) narr.textContent = `${BEATS[4].text} Try the preview button yourself.`;
    }
    if (n === 5) {
      code.textContent = '';
      for (const item of MINE) { if (id !== run) return; line(item, item.add ? 'is-mine is-new' : ''); await wait(120); }
      await wait(500); await press(); await wait(1200); await press();
      if (id !== run) return;
      msg('me', 'LOG · Tool: Copilot, Ask mode · Asked: one click handler · Kept: querySelector + click listener · Changed: removed colour, font and pop-up; added a toggle by hand.').classList.add('is-log');
      narr.textContent = `${BEATS[5].text} Try the corrected button in the preview.`;
    }
    if (id !== run) return;
    playBtn.disabled = n === 3 && !huntDone;
    beat = n;
    playBtn.textContent = n < 5 ? `▶ Play beat ${String(n + 2).padStart(2, '0')}` : '↺ Watch again';
  }

  function startHunt() {
    caught = 0; huntDone = false; hunt.hidden = false; huntCount.textContent = '0';
    code.querySelectorAll('li').forEach(li => {
      if (!li.textContent.trim()) return;
      li.tabIndex = 0; li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Line ${Number(li.dataset.i) + 1}: ${li.textContent}`);
    });
  }
  function judge(li) {
    if (beat !== 3 && root.querySelector('.vb-stage').dataset.beat !== '3') return;
    if (huntDone || !li.dataset.i) return;
    const item = AI_CODE[li.dataset.i];
    if (item.flag) {
      if (flag(li, item.flag)) { caught++; huntCount.textContent = caught; window.labAudio?.play?.('star'); }
    } else {
      li.classList.add('is-ok'); setTimeout(() => li.classList.remove('is-ok'), 900);
      narr.textContent = 'That line you asked for: it finds an element, listens for the click or swaps the words. Keep looking.';
    }
    if (caught === 3) endHunt('All three caught. Colour, font and pop-up: none of them were in the prompt. Now test it.');
  }
  function endHunt(text) {
    huntDone = true; narr.textContent = text; playBtn.disabled = false; beat = 3;
    playBtn.textContent = '▶ Play beat 05';
    code.querySelectorAll('li').forEach(li => { li.removeAttribute('tabindex'); li.removeAttribute('role'); li.removeAttribute('aria-label'); });
  }
  code.addEventListener('click', e => { const li = e.target.closest('li'); if (li) judge(li); });
  code.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('li')) { e.preventDefault(); judge(e.target); } });
  $('[data-hunt-reveal]').addEventListener('click', () => { markAll(); huntCount.textContent = '3'; endHunt('Here they are. Each one changes your page in a way you never asked for.'); });

  // The preview runs whichever version of the code is on screen.
  async function press() {
    pageBtn.classList.add('is-pressed'); setTimeout(() => pageBtn.classList.remove('is-pressed'), 250);
    if (behaviour === 'ai') {
      if (future) { narr.dataset.bug = '1'; return; }
      future = true; story.textContent = FUTURE;
      page.classList.add('is-magenta', 'is-comic'); alertBox.hidden = false;
    } else if (behaviour === 'mine') {
      future = !future;
      story.textContent = future ? FUTURE : NOW;
      pageBtn.textContent = future ? 'Back to now' : 'See a possible future';
    }
  }
  pageBtn.addEventListener('click', press);
  $('[data-alert-ok]').addEventListener('click', () => { alertBox.hidden = true; });

  playBtn.addEventListener('click', () => {
    const stage = root.querySelector('.vb-stage');
    if (!stage.dataset.started) { stage.dataset.started = '1'; play(0); return; }
    play(beat >= 5 ? 0 : beat + 1);
  });
  $('[data-prev]').addEventListener('click', () => { root.querySelector('.vb-stage').dataset.started = '1'; play(Math.max(0, beat - 1)); });
  $('[data-restart]').addEventListener('click', () => { root.querySelector('.vb-stage').dataset.started = '1'; play(0); });
  $('[data-skip]').addEventListener('click', () => {
    const n = beat; run++;
    baseScene(n);
    if (n === 0) sticky.textContent = INTENT;
    if (n === 1) msg('me', PROMPT);
    if (n === 3) startHunt();
    if (n === 4) { future = false; press(); alertBox.hidden = true; }
    if (n === 5) msg('me', 'LOG · Tool: Copilot, Ask mode · Kept: querySelector + click listener · Changed: removed colour, font and pop-up; added a toggle.').classList.add('is-log');
    playBtn.disabled = n === 3 && !huntDone;
    playBtn.textContent = n < 5 ? `▶ Play beat ${String(n + 2).padStart(2, '0')}` : '↺ Watch again';
  });
  root.querySelectorAll('[data-beat-jump]').forEach(b => b.addEventListener('click', () => { root.querySelector('.vb-stage').dataset.started = '1'; play(Number(b.dataset.beatJump)); }));
  baseScene(0);
  playBtn.textContent = '▶ Play';

})();

// Lab 02: VIBE ARENA. Loadout, slop-or-solid warm-up, three build rounds in the student's own project,
// test bingo, exhibit label and the Lab 2078 unlock. Stage switching stays in vibe-guide.js.
(() => {
  const root = document.getElementById('ai-coding');
  if (!root?.querySelector('[data-va-hud]')) return;
  const $ = sel => root.querySelector(sel);
  const $$ = sel => [...root.querySelectorAll(sel)];
  const calm = () => document.documentElement.classList.contains('access-no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sound = cue => window.labAudio?.play?.(cue);
  const go = index => $(`[data-guide-select="${index}"]`)?.click();

  // ---------- Saved state ----------
  // Project, goal and prompt fields keep the key used before the arena existed.
  const FIELD_KEY = 'dik105-vibecoding-project-v1', ARENA_KEY = 'dik105-vibe-arena-v1';
  const load = key => { try { const v = JSON.parse(localStorage.getItem(key) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (_) { return {}; } };
  const fields = load(FIELD_KEY);
  const arena = Object.assign({xp: 0, round: 0, rounds: [], quests: [], cones: 0, warm: null, tester: '', unlocked: false}, load(ARENA_KEY));
  const saveArena = () => { try { localStorage.setItem(ARENA_KEY, JSON.stringify(arena)); } catch (_) {} };
  const inputs = $$('[data-vibe-project], [data-f], [data-va-r2], [data-va-r3]');
  const fieldKey = i => i.dataset.vibeProject || (i.dataset.f && `prompt-${i.dataset.f}`) || (i.matches('[data-va-r2]') ? 'r2' : 'r3');
  inputs.forEach(i => { if (typeof fields[fieldKey(i)] === 'string') i.value = fields[fieldKey(i)]; });
  const ownCode = $('[data-vibe-code]');
  ownCode.value = typeof fields.code === 'string' ? fields.code : '';
  const saveFields = () => { inputs.forEach(i => { fields[fieldKey(i)] = i.value; }); fields.code = ownCode.value; try { localStorage.setItem(FIELD_KEY, JSON.stringify(fields)); } catch (_) {} };
  const val = name => ($(`[data-vibe-project="${name}"]`)?.value || '').trim();

  function note(text) {
    const box = document.querySelector('#lab-2-workbench [data-mission] textarea');
    if (!box || box.value.includes(text)) return;
    box.value = `${box.value.trim()}\n${text}`.trim();
    box.dispatchEvent(new Event('input', {bubbles: true}));
  }

  // ---------- HUD: XP, timer, round label ----------
  const xpOut = $('[data-va-xp]');
  function xp(points) {
    arena.xp += points; saveArena(); xpOut.textContent = arena.xp;
    if (points > 0 && !calm()) { xpOut.parentElement.classList.remove('is-pop'); void xpOut.offsetWidth; xpOut.parentElement.classList.add('is-pop'); }
  }
  xpOut.textContent = arena.xp;

  const timeOut = $('[data-va-time]'), timerBtn = $('[data-va-timer]'), clock = $('[data-va-clock]');
  let left = 480, ticking = 0;
  const show = () => { timeOut.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`; clock.classList.toggle('is-low', left <= 60); };
  function stop() { clearInterval(ticking); ticking = 0; timerBtn.textContent = '▶'; }
  function start() {
    if (ticking) return; timerBtn.textContent = '❚❚';
    ticking = setInterval(() => {
      left = Math.max(0, left - 1); show();
      if (!left) { stop(); clock.classList.add('is-done'); sound('unlock'); }
    }, 1000);
  }
  function resetTimer(seconds = 480) { stop(); left = seconds; clock.classList.remove('is-done'); show(); }
  timerBtn.addEventListener('click', () => ticking ? stop() : start());
  $('[data-va-plus]').addEventListener('click', () => { left += 120; clock.classList.remove('is-done'); show(); });
  show();

  const LABELS = ['LOADOUT', 'WATCH IT HAPPEN', 'WARM-UP', 'BUILD', 'TEST BINGO', 'FINISH', 'LAB 2078'];
  const stages = $$('[data-guide-stage]');
  let current = -1;
  function onStage() {
    const i = stages.findIndex(s => !s.hidden);
    if (i === current) return;
    current = i;
    const label = i === 3 ? `ROUND ${arena.round + 1} / 3` : LABELS[i] || '';
    $('[data-va-round-label]').textContent = label;
    root.dataset.vaStage = i;
    if (i === 3) renderRound(); if (i === 5) renderLabel();
    if (i === 4) resetTimer(300);
    if (i === 2) startWarm();
  }
  const watch = new MutationObserver(onStage);
  stages.forEach(s => watch.observe(s, {attributes: true, attributeFilter: ['hidden']}));

  // ---------- Loadout ----------
  const startBtn = $('[data-va-start]'), startHint = $('[data-va-start-hint]');
  function loadoutReady() {
    const ok = val('project').length >= 3 && val('goal').length >= 5;
    startBtn.disabled = !ok; startHint.hidden = ok;
    $('[data-va-project-name]').textContent = val('project') || 'Your project';
  }
  // The cold-open line types itself once.
  const typed = $('[data-va-type]');
  if (!calm() && typed) { const full = typed.textContent; typed.textContent = ''; [...full].forEach((ch, i) => setTimeout(() => { typed.textContent += ch; }, 300 + i * 55)); }
  startBtn.addEventListener('click', () => { sound('unlock'); if (!arena.started) { arena.started = true; xp(50); } });
  $('[data-vibe-import]').addEventListener('click', () => {
    const work = load('dik105-javascript-journey-v1'), status = $('[data-vibe-import-status]');
    if (!work.values?.project && !work.code) { status.textContent = 'No saved JavaScript work found. Type your project and one change above.'; return; }
    if (work.values?.project) $('[data-vibe-project="project"]').value = work.values.project;
    if (!val('goal')) $('[data-vibe-project="goal"]').value = 'Change the button label to match what is showing.';
    ownCode.value = typeof work.code === 'string' ? work.code : '';
    status.textContent = 'Loaded. Change the goal if you want something else today.';
    saveFields(); loadoutReady(); forge();
  });
  $('[data-vibe-copy-code]').addEventListener('click', async () => {
    const status = $('[data-vibe-import-status]');
    if (!ownCode.value.trim()) { status.textContent = 'Nothing saved yet. Copy the code from your project in VS Code instead.'; return; }
    try { await navigator.clipboard.writeText(ownCode.value); status.textContent = 'Copied. Paste only the part you want to change.'; }
    catch (_) { ownCode.focus(); ownCode.select(); status.textContent = 'Selected. Copy with Ctrl+C or Cmd+C.'; }
  });

  // ---------- Warm-up: slop or solid ----------
  const PAGE = (body, css = '', js = '') => `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;font:16px/1.4 Georgia,serif;background:#f4efe6;color:#12343b}button{font:600 14px system-ui,sans-serif;background:#12343b;color:#fff;border:0;padding:8px 14px;cursor:pointer}.fake-alert{position:fixed;left:50%;top:10px;transform:translateX(-50%);background:#fff;border:1px solid #999;box-shadow:0 8px 24px #0006;padding:10px 14px;font:14px system-ui,sans-serif;border-radius:8px}${css}</style>${body}<script>window.alert=m=>{const d=document.createElement('div');d.className='fake-alert';d.textContent='Pop-up: '+m;document.body.append(d)};${js}<\/script>`;
  const BUS = '<p id="story">I hear rain at the bus stop.</p><button id="go">Click me</button>';
  const CARDS = [
    {req: 'When someone clicks the button, change the text to “The bus is late again.”', verdict: 'slop',
      code: `const button = document.querySelector("#go");\nconst story = document.querySelector("#story");\n\nbutton.addEventListener("click", () => {\n  story.textContent = "The bus is late again.";\n  document.body.style.background =\n    "linear-gradient(135deg, #ff00cc, #3333ff)";\n  alert("🎉 Welcome to the future!");\n});`,
      why: 'SLOP. You asked for one sentence. It also painted a gradient and added a pop-up.'},
    {req: 'When someone clicks, the sauna room should turn warm.', verdict: 'solid',
      code: `/* style.css */\n.warm { background: #ffb347; }\n\n/* script.js */\nconst room = document.querySelector("#room");\ndocument.querySelector("#go").addEventListener("click", () => {\n  room.classList.add("warm");\n});`,
      page: PAGE('<div id="room" style="padding:12px;border:2px solid #12343b"><p>The sauna room.</p><button id="go">Add heat</button></div>', '.warm{background:#ffb347}', 'const room=document.querySelector("#room");document.querySelector("#go").addEventListener("click",()=>{room.classList.add("warm")});'),
      why: 'SOLID. One class, one colour, exactly what was asked.'},
    {req: 'Add a heading to my sauna page.', verdict: 'slop',
      code: `<h1 class="hero-title">✨ Welcome to Your Ultimate\n   Sauna Experience ✨</h1>\n\n.hero-title {\n  background: linear-gradient(90deg, #ff6ec4, #7873f5);\n  -webkit-background-clip: text;\n  color: transparent;\n  animation: glow 2s infinite alternate;\n}`,
      page: PAGE('<h1 class="hero-title">✨ Welcome to Your Ultimate Sauna Experience ✨</h1>', '.hero-title{font:800 26px system-ui,sans-serif;background:linear-gradient(90deg,#ff6ec4,#7873f5);-webkit-background-clip:text;background-clip:text;color:transparent;animation:glow 2s infinite alternate}@keyframes glow{to{filter:drop-shadow(0 0 8px #ff6ec4)}}'),
      why: 'SLOP. Invented marketing words, emoji and a glowing gradient. Your page never said “ultimate”.'},
    {req: 'The second click should bring the first text back.', verdict: 'solid',
      code: `const story = document.querySelector("#story");\nconst nowText = story.textContent;\nlet showingFuture = false;\n\ndocument.querySelector("#go").addEventListener("click", () => {\n  showingFuture = !showingFuture;\n  story.textContent = showingFuture\n    ? "The bus is late again."\n    : nowText;\n});`,
      js: 'const story=document.querySelector("#story");const nowText=story.textContent;let f=false;document.querySelector("#go").addEventListener("click",()=>{f=!f;story.textContent=f?"The bus is late again.":nowText});',
      why: 'SOLID. It remembers one thing, showingFuture, and nothing else changes.'},
    {req: 'Play a rain sound when someone clicks.', verdict: 'slop',
      code: `<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>\n\n<div class="sound-panel">🔊 Sound settings\n  <input type="range" id="volume">\n  <label><input type="checkbox" checked> Background music</label>\n</div>\n\nconst music = new Howl({ src: ["lofi.mp3"], autoplay: true, loop: true });`,
      page: PAGE(BUS + '<div style="margin-top:12px;padding:10px;border:1px solid #999;background:#fff;font:14px system-ui">🔊 Sound settings<br><input type="range"> <label><input type="checkbox" checked> Background music</label></div>'),
      why: 'SLOP. A whole sound library, autoplaying music and a settings panel. You asked for one rain sound on click.'},
    {req: 'Play my rain sound when someone clicks.', verdict: 'slop',
      code: `const rain = new Audio("C:/Users/anna/Downloads/rain-sound (1).mp3");\n\ndocument.querySelector("#go").addEventListener("click", () => {\n  rain.play();\n});`,
      page: PAGE(BUS + '<p style="font:13px Consolas,monospace;color:#c33f5a">✖ Failed to load: C:/Users/anna/Downloads/rain-sound (1).mp3</p>'),
      why: 'SLOP. The file sits in Downloads, outside the project folder. It plays on one laptop and nowhere else. Put it in assets/ and use assets/rain.mp3.'},
    {req: 'Make my button easier to tap on phones.', verdict: 'solid',
      code: `@media (max-width: 600px) {\n  #go {\n    padding: 16px 24px;\n    font-size: 18px;\n  }\n}`,
      page: PAGE(BUS, '@media (max-width:600px){#go{padding:16px 24px;font-size:18px}}'),
      why: 'SOLID. One media query, only the button, only on small screens.'}
  ];
  CARDS[0].js = 'const b=document.querySelector("#go"),s=document.querySelector("#story");b.addEventListener("click",()=>{s.textContent="The bus is late again.";document.body.style.background="linear-gradient(135deg,#ff00cc,#3333ff)";alert("🎉 Welcome to the future!")});';
  let card = 0, streak = 0, right = 0, fuse = 0, judged = false;
  const frame = $('[data-va-frame]'), verdict = $('[data-va-verdict]'), nextBtn = $('[data-va-next]');
  function showCard() {
    const c = CARDS[card]; judged = false;
    $('[data-va-card-n]').textContent = card + 1;
    $('[data-va-request]').textContent = c.req;
    $('[data-va-code]').textContent = c.code;
    frame.srcdoc = c.page || PAGE(BUS, '', c.js || '');
    verdict.textContent = ''; verdict.className = 'va-verdict'; nextBtn.hidden = true;
    $$('[data-va-judge]').forEach(b => { b.disabled = false; });
    clearInterval(fuse);
    const bar = $('[data-va-fuse]'); let t = 20; bar.style.width = '100%';
    if (!calm()) fuse = setInterval(() => { t -= 1; bar.style.width = `${t * 5}%`; if (t <= 0) { clearInterval(fuse); if (!judged) judge(null); } }, 1000);
  }
  function judge(choice) {
    if (judged) return; judged = true; clearInterval(fuse);
    const c = CARDS[card], ok = choice === c.verdict;
    streak = ok ? streak + 1 : 0; if (ok) { right++; xp(20 + streak * 5); sound('star'); }
    verdict.textContent = `${choice === null ? '⏱ TOO SLOW. ' : ok ? '✔ RIGHT. ' : '✖ NOPE. '}${c.why}`;
    verdict.classList.add(ok ? 'is-right' : 'is-wrong');
    $('[data-va-streak]').textContent = `STREAK ${streak}${streak >= 3 ? ' 🔥' : ''}`;
    $$('[data-va-judge]').forEach(b => { b.disabled = true; });
    nextBtn.hidden = false; nextBtn.textContent = card < CARDS.length - 1 ? 'Next answer →' : 'See my score →'; nextBtn.focus();
  }
  $$('[data-va-judge]').forEach(b => b.addEventListener('click', () => judge(b.dataset.vaJudge)));
  nextBtn.addEventListener('click', () => {
    if (card < CARDS.length - 1) { card++; showCard(); return; }
    $('[data-va-card]').hidden = true; $('[data-va-warm-end]').hidden = false;
    arena.warm = right; saveArena();
    $('[data-va-warm-score]').textContent = `${right} / ${CARDS.length} ${right >= 5 ? 'SLOP HUNTER' : right >= 3 ? 'SHARP EYE' : 'EYES WARMING UP'}`;
  });
  let warmStarted = false;
  function startWarm() { if (warmStarted) return; warmStarted = true; card = 0; streak = 0; right = 0; showCard(); }

  // ---------- Build rounds ----------
  const forgeIn = $$('[data-f]'), chips = $$('[data-chip]'), kinds = $$('[data-va-r3-kind]');
  const out = $('[data-forge-out]'), power = $('[data-power]'), powerLabel = $('[data-power-label]');
  const LEVELS = ['EMPTY', 'VAGUE WISH', 'GETTING THERE', 'CLEAR BRIEF', "AUTHOR'S BRIEF"];
  const limits = () => chips.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.chip).join(' ');
  function forge() {
    let text = '', score = 0;
    if (arena.round === 0) {
      const [who, what, why] = forgeIn.map(f => f.value.trim());
      score = [who, what, why].filter(Boolean).length * 2 + Math.min(chips.filter(c => c.getAttribute('aria-pressed') === 'true').length, 4);
      if (who || what) text = `In my project “${val('project') || 'my page'}”: when someone ${who || '___'}, the page should ${what || '___'}, because ${why || '___'}. ${limits()}`;
    } else if (arena.round === 1) {
      const second = $('[data-va-r2]').value.trim();
      score = second ? 9 : 0;
      if (second) text = `Keep what the first click does now. When someone clicks a second time, the page should ${second}. Use one variable to remember which state it is in. Do not change anything else. Explain every line.`;
    } else {
      const feel = $('[data-va-r3]').value.trim(), kind = kinds.find(k => k.getAttribute('aria-pressed') === 'true')?.dataset.vaR3Kind || 'one detail';
      score = feel ? 10 : 0;
      if (feel) text = `Add only ${kind} to my click interaction so it feels ${feel}. Keep my colours, fonts and layout. No libraries. Explain every line, and tell me which lines I can change myself.`;
    }
    power.style.width = `${Math.min(100, score * 10)}%`;
    powerLabel.textContent = LEVELS[score === 0 ? 0 : score < 4 ? 1 : score < 7 ? 2 : score < 10 ? 3 : 4];
    out.textContent = text || 'Fill in the blanks. Your prompt appears here.';
    return text;
  }
  inputs.forEach(i => i.addEventListener('input', () => { saveFields(); loadoutReady(); forge(); }));
  chips.forEach(c => c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); forge(); }));
  kinds.forEach(k => k.addEventListener('click', () => { kinds.forEach(o => o.setAttribute('aria-pressed', String(o === k))); forge(); }));
  $('[data-forge-copy]').addEventListener('click', async () => {
    const text = forge(), status = $('[data-forge-status]');
    if (!text) { status.textContent = 'Fill in the blanks first.'; return; }
    try { await navigator.clipboard.writeText(text); status.textContent = 'Copied. Ctrl+Alt+I in VS Code, paste, send.'; }
    catch (_) { status.textContent = 'Select the prompt and copy it with Ctrl+C.'; }
    if (!arena.copied?.[arena.round]) { arena.copied = Object.assign({}, arena.copied, {[arena.round]: true}); xp(15); }
    start();
  });

  const NAMES = ['REACT', 'REMEMBER', 'FEEL'];
  let decision = '';
  function renderRound() {
    const r = Math.min(arena.round, 2);
    $$('[data-va-round]').forEach(el => { el.hidden = Number(el.dataset.vaRound) !== r; });
    $$('[data-va-round-tab]').forEach(el => { const n = Number(el.dataset.vaRoundTab); el.classList.toggle('is-on', n === r); el.classList.toggle('is-done', !!arena.rounds[n]); });
    $('[data-va-round-n]').textContent = r + 1;
    $('[data-va-project-name]').textContent = val('project') || 'Your project';
    $('[data-va-round-label]').textContent = `ROUND ${r + 1} / 3 · ${NAMES[r]}`;
    decision = ''; $$('[data-va-decision]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('[data-va-why]').value = ''; $('[data-va-round-status]').textContent = '';
    if (!ticking) resetTimer();
    forge();
  }
  $$('[data-va-decision]').forEach(b => b.addEventListener('click', () => {
    decision = b.dataset.vaDecision;
    $$('[data-va-decision]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  }));
  $$('[data-va-quest]').forEach(q => {
    if (arena.quests.includes(q.dataset.vaQuest)) q.setAttribute('aria-pressed', 'true');
    q.addEventListener('click', () => {
      if (arena.quests.includes(q.dataset.vaQuest)) return;
      arena.quests.push(q.dataset.vaQuest); q.setAttribute('aria-pressed', 'true'); xp(25); sound('star');
    });
  });
  $('[data-va-finish-round]').addEventListener('click', () => {
    const status = $('[data-va-round-status]'), why = $('[data-va-why]').value.trim();
    if (!decision) { status.textContent = 'Choose what you did: kept, undid or rewrote.'; return; }
    if (why.length < 4) { status.textContent = 'Add one line on why. That line is your authorship.'; $('[data-va-why]').focus(); return; }
    const r = Math.min(arena.round, 2);
    arena.rounds[r] = {prompt: forge(), decision, why};
    note(`Vibe Arena round ${r + 1} (${NAMES[r].toLowerCase()}): ${decision}. Why: ${why}`);
    xp(100); sound('complete'); stop();
    if (r < 2) { arena.round = r + 1; saveArena(); renderRound(); $('[data-va-build-title]')?.focus(); root.querySelector('#vibe-forge').scrollIntoView({behavior: calm() ? 'instant' : 'smooth'}); }
    else { arena.round = 3; saveArena(); go(4); }
  });

  // ---------- Test bingo (solo) ----------
  arena.bingo = Array.isArray(arena.bingo) ? arena.bingo : [];
  const squares = $$('[data-va-sq]');
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const isOn = i => squares[i].getAttribute('aria-pressed') === 'true';
  const lines = () => LINES.filter(l => l.every(isOn)).length;
  const ticked = () => squares.filter((_, i) => i !== 4 && isOn(i));
  function confetti() {
    if (calm()) return;
    const box = $('[data-va-confetti]'); box.textContent = '';
    const colours = ['#c6f15b', '#ffd23f', '#ff5fd2', '#6fb7ff', '#ff7a59'];
    for (let i = 0; i < 60; i++) {
      const bit = document.createElement('i');
      bit.style.cssText = `left:${Math.random() * 100}%;background:${colours[i % 5]};animation-delay:${Math.random() * .4}s;--drift:${Math.round((Math.random() - .5) * 200)}px`;
      box.append(bit);
    }
    setTimeout(() => { box.textContent = ''; }, 2600);
  }
  function bingoStatus() {
    const n = ticked().length, l = lines();
    $('[data-va-bingo-status]').textContent = l ? `BINGO ×${l} 🎉 ${n} squares` : `${n} square${n === 1 ? '' : 's'}. ${n >= 2 ? 'So close.' : 'No bingo yet.'}`;
    root.querySelector('.va-bingo').classList.toggle('is-bingo', l > 0);
    if (l) $('[data-va-duel-status]').textContent = 'BINGO. Now one glow and one level up for yourself.';
  }
  squares.forEach((sq, i) => {
    if (i === 4) return;
    if (arena.bingo.includes(i)) sq.setAttribute('aria-pressed', 'true');
    sq.addEventListener('click', () => {
      const before = lines(), on = !isOn(i);
      sq.setAttribute('aria-pressed', String(on));
      arena.bingo = squares.map((_, k) => k).filter(k => k !== 4 && isOn(k)); saveArena();
      if (on) { xp(10); sound('star'); }
      if (lines() > before) { xp(50); sound('complete'); confetti(); }
      bingoStatus();
    });
  });
  bingoStatus();
  const glow = $('[data-va-glow]'), grow = $('[data-va-grow]');
  glow.value = arena.glow || ''; grow.value = arena.grow || '';
  glow.addEventListener('input', () => { arena.glow = glow.value; saveArena(); });
  grow.addEventListener('input', () => { arena.grow = grow.value; saveArena(); });
  $('[data-va-duel-done]').addEventListener('click', () => {
    const status = $('[data-va-duel-status]');
    if (!lines()) { status.textContent = 'Almost: get three in a row. Every square is something you learn by doing it.'; return; }
    if (glow.value.trim().length < 4 || grow.value.trim().length < 4) { status.textContent = 'Write one glow and one level up. That is how you see your own progress.'; (glow.value.trim().length < 4 ? glow : grow).focus(); return; }
    note(`Test bingo. Glow: ${glow.value.trim()}. Level up: ${grow.value.trim()}. Bingo: ${ticked().map(s => s.dataset.vaSq).join(', ')}.`);
    if (!arena.dueled) { arena.dueled = true; xp(75); }
    saveArena(); go(5);
  });

  // ---------- Exhibit label + unlock ----------
  function renderLabel() {
    $('[data-va-label-title]').textContent = val('project') || 'Your project';
    $('[data-va-label-goal]').textContent = val('goal') || 'Click the button.';
    const log = $('[data-va-label-log]'); log.textContent = '';
    arena.rounds.forEach((r, i) => { if (!r) return; const li = document.createElement('li'); li.innerHTML = '<b></b> <span></span>'; li.firstChild.textContent = `${NAMES[i]} · ${r.decision}`; li.lastChild.textContent = r.why; log.append(li); });
  }
  $('[data-va-fullscreen]').addEventListener('click', () => {
    const label = $('[data-va-label]');
    if (label.requestFullscreen) label.requestFullscreen().catch(() => label.classList.toggle('is-big'));
    else label.classList.toggle('is-big');
  });
  $('[data-vibe-save-review]').addEventListener('click', () => {
    const lines = arena.rounds.map((r, i) => r && `Round ${i + 1}: asked “${r.prompt}” → ${r.decision} (${r.why})`).filter(Boolean);
    const status = $('[data-vibe-review-status]');
    if (!lines.length) { status.textContent = 'Finish at least one round first.'; return; }
    note(`AI-assisted coding: ${val('project')}\nMy goal: ${val('goal')}\n${lines.join('\n')}`);
    status.textContent = 'Saved to your Lab 2 note.'; sound('complete');
  });
  $('[data-va-unlock]').addEventListener('click', () => {
    const t = $('[data-va-transmission]'); t.hidden = false; sound('unlock');
    if (!arena.unlocked) { arena.unlocked = true; xp(200); }
    setTimeout(() => { go(6); }, calm() ? 0 : 1600);
  });

  // ---------- Projector mode: ?projector=1 shows the HUD big for the room ----------
  if (new URLSearchParams(location.search).has('projector')) document.documentElement.classList.add('va-projector');

  loadoutReady(); forge(); onStage();
})();

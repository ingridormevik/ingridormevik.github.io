// Lab 02 extra level: Dr. Turing's Laboratory 2078. Feelings transmitter, pinecone game, vibe brief.
(() => {
  const root = document.getElementById('vibe-extra');
  if (!root) return;
  const $ = sel => root.querySelector(sel);
  const reduced = () => document.documentElement.classList.contains('access-no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(done => setTimeout(done, reduced() ? 0 : ms));



  let stored={};try{stored=JSON.parse(localStorage.getItem('dik105-lab78-v1')||'{}')||{};}catch(_){}
  const valid=(a,max)=>Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=0&&n<=max):[];
  const completed = new Set(valid(stored.completed,4));
  const discoveries = new Set(valid(stored.discoveries,7));
  function save(){try{localStorage.setItem('dik105-lab78-v1',JSON.stringify({completed:[...completed],discoveries:[...discoveries],current:Number(root.dataset.activeMission)}));}catch(_){} }

  let missionXP = completed.size * 20;
  const treasureNames = ['1843 / Lovelace’s instruction patterns', '1936 / Turing’s rule machine', '1951 / Manchester computer music', '1947 / Mark II debugging', '1989 / connected information', '1950 / Turing’s question', '1837 / Babbage’s mechanical engine', '1968 / Engelbart’s linked ideas'];
  const treasureIcons = ['◉', '◎', '♨', '⚙', '♧', '◆', '≈', '✦'];
  discoveries.forEach(id=>{
    root.querySelector(`[data-l78-discover="${id}"]`)?.classList.add('is-discovered');
    const tray=root.querySelector('[data-l78-badges]');
    if(tray){const badge=document.createElement('span');badge.textContent=treasureIcons[id];badge.title=treasureNames[id];badge.setAttribute('aria-label',treasureNames[id]);tray.append(badge);}
  });
  const savedCount=root.querySelector('[data-l78-found]');if(savedCount)savedCount.textContent=`Discoveries / ${discoveries.size} of 8`;
  function score() {
    const xp = missionXP + discoveries.size * 10;
    const big = root.querySelector('[data-l78-xp]');
    if (big) big.textContent = `LAB XP / ${xp}`;
    const mini = root.querySelector('[data-l78-xp-mini]');
    if (mini) mini.textContent = `XP / ${xp}`;
  }
  function discover(id) {
    if (discoveries.has(id)) return;
    discoveries.add(id); score();save();
    const count = root.querySelector('[data-l78-found]');
    if (count) count.textContent = `Discoveries / ${discoveries.size} of 8`;
    const tray = root.querySelector('[data-l78-badges]');
    if (tray) {
      const badge = document.createElement('span');
      badge.textContent = treasureIcons[id]; badge.title = treasureNames[id];
      badge.setAttribute('aria-label', treasureNames[id]); tray.append(badge);
    }
    const status = root.querySelector('[data-l78-discovery-status]');
    if (status) status.textContent = `+10 XP · ${treasureNames[id]} found!`;
    root.querySelector(`[data-l78-discover="${id}"]`)?.classList.add('is-discovered');
    window.labAudio?.play?.('secret');
  }
  root.querySelectorAll('[data-l78-discover]').forEach(button => button.addEventListener('click', () => discover(Number(button.dataset.l78Discover))));
  root.querySelector('[data-l78-pine-secret]')?.addEventListener('click', () => discover(5));
  new IntersectionObserver(([entry]) => root.classList.toggle('is-in-view', entry.isIntersecting)).observe(root);

  // Mission navigation: progressive enhancement keeps all content readable without JS.
  const missionPanels = [...root.querySelectorAll('[data-l78-panel]')];
  const missionButtons = [...root.querySelectorAll('[data-l78-select]')];
  if (missionPanels.length) {
    const intro = root.querySelector('.lab78-top');
    const navigation = root.querySelector('.lab78-missions');

    let current = -1;
    root.classList.add('lab78-mission-mode');
    missionPanels.forEach(panel => { panel.hidden = true; });
    function selectMission(index, focus = true, sound = true) {
      current = index;
      intro.hidden = true; navigation.hidden = false;
      missionPanels.forEach((panel, i) => { panel.hidden = i !== index; });
      missionButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      root.dataset.activeMission = String(index);save();
      if (focus) {
        const title = missionPanels[index].querySelector('h5');
        title.tabIndex = -1; title.focus({preventScroll: true});
        root.scrollIntoView({behavior: reduced() ? 'instant' : 'smooth', block: 'start'});
      }
      if (sound) window.labAudio?.play?.('unlock');
    }
    completed.forEach(i=>{missionButtons[i].classList.add('is-done');root.querySelector(`[data-l78-state="${i}"]`).textContent='DONE ✓';});
    root.querySelector('[data-l78-progress]').textContent=`${completed.size} / 5 missions marked done`;
    if(Number.isInteger(stored.current)&&stored.current>=0&&stored.current<missionPanels.length)selectMission(stored.current,false,false);
    score();
    root.querySelector('[data-l78-start]').addEventListener('click', () => selectMission(current < 0 ? 0 : current));
    missionButtons.forEach((button, i) => button.addEventListener('click', () => selectMission(i)));
    root.querySelector('[data-l78-overview]').addEventListener('click', () => {
      intro.hidden = false; navigation.hidden = true;
      missionPanels.forEach(panel => { panel.hidden = true; });
      root.querySelector('[data-l78-start]').focus({preventScroll:true});
      root.scrollIntoView({behavior: reduced() ? 'instant' : 'smooth', block:'start'});
    });
    root.querySelectorAll('[data-l78-done]').forEach((button, i) => button.addEventListener('click', () => {
      if (!completed.has(i)) { missionXP += 20; score(); }
      completed.add(i);save();
      missionButtons[i].classList.add('is-done');
      root.querySelector(`[data-l78-state="${i}"]`).textContent = 'DONE ✓';
      root.querySelector('[data-l78-progress]').textContent = `${completed.size} / 5 missions marked done`;
      root.querySelector('[data-l78-feedback]').textContent = completed.size === 5 ? 'All five missions marked done. Take your brief into your own project.' : `Mission ${i + 1} marked done.`;
      window.labAudio?.play?.('complete');
      if (i < 4) selectMission(i + 1, true, false);
    }));
  }


  // Modern device narration, explicitly labelled as such on the page.
  const listen = root.querySelector('[data-l78-listen]');
  if (listen) {
    const stop = root.querySelector('[data-l78-stop]');
    const voiceStatus = root.querySelector('[data-l78-voice-status]');
    const speech = window.speechSynthesis;
    const finish = () => { stop.hidden = true; listen.disabled = false; root.classList.remove('is-reading'); };
    if (!speech || !window.SpeechSynthesisUtterance) {
      listen.disabled = true;
      voiceStatus.textContent = 'Voice playback is unavailable in this browser. The complete quote is printed above.';
    } else {
      listen.addEventListener('click', () => {
        speech.cancel();
        const utterance = new window.SpeechSynthesisUtterance(root.querySelector('.lab78-quote blockquote').textContent);
        utterance.lang = 'en-GB'; utterance.rate = 0.86;
        const voice = speech.getVoices().find(v => v.lang === 'en-GB');
        if (voice) utterance.voice = voice;
        utterance.onend = () => { finish(); voiceStatus.textContent = 'Reading finished.'; };
        utterance.onerror = () => { finish(); voiceStatus.textContent = 'Playback stopped or unavailable. You can read the quote above.'; };
        stop.hidden = false; listen.disabled = true; root.classList.add('is-reading');
        voiceStatus.textContent = 'Reading the quote…';
        speech.speak(utterance);
      });
      stop.addEventListener('click', () => { speech.cancel(); finish(); voiceStatus.textContent = 'Reading stopped.'; });
      root.querySelector('[data-l78-start]')?.addEventListener('click', () => { speech.cancel(); finish(); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) { speech.cancel(); finish(); } });
      window.addEventListener('pagehide', () => { speech.cancel(); finish(); });
    }
  }

  function addToNote(text, status) {
    const note = document.querySelector('[data-mission="2"] textarea');
    if (!note) { status.textContent = 'Copy it into your experiment note below.'; return; }
    note.value = note.value.trim() ? `${note.value.trim()}\n${text}` : text;
    note.dispatchEvent(new Event('input', {bubbles: true}));
    status.textContent = 'Added to your experiment note.';
  }
  async function copy(text, status) {
    try { await navigator.clipboard.writeText(text); status.textContent = 'Copied. Paste it into the chat in VS Code.'; }
    catch { status.textContent = 'Select the text and copy it with Ctrl + C.'; }
  }

  // ---------- Level A: feelings transmitter ----------
  const FEELINGS = [
    [/sauna|badstu/i, 'SAUNA', 'warm wood tones · steam that rises slowly · a water button that changes the heat and sound'],
    [/lone|alone|lonely|ensom/i, 'LONELINESS', 'one small character in a wide, empty space · cold blues · slow, quiet sound · lots of distance'],
    [/empower|strong|power|brave|sterk|mestring/i, 'EMPOWERMENT', 'every action leaves something behind · the light grows when you act · warm colours spread'],
    [/sad|grief|trist/i, 'SADNESS', 'muted colours · things drift slowly downward · soft rain sound'],
    [/ang(ry|er)|rage|sint/i, 'ANGER', 'red and black · fast, shaky movement · sharp edges · loud clicks'],
    [/calm|peace|rolig/i, 'CALM', 'soft greens · a slow breathing animation · round shapes · no timers'],
    [/anx|stress|nervous|panic/i, 'ANXIETY', 'too much on screen at once · a ticking timer · the view never rests'],
    [/happy|joy|glad/i, 'JOY', 'bright yellow · things bounce · a small burst of confetti on success'],
    [/nostalg|memor|minne/i, 'NOSTALGIA', 'faded film grain · an old pixel font · sounds from an old console'],
    [/free|freedom|fri/i, 'FREEDOM', 'no walls · you can go anywhere · the edges wrap around'],
    [/love|kjærlighet/i, 'LOVE', 'two things that move toward each other · pink warmth · closeness is rewarded'],
    [/html5|game|spill|canvas/i, 'HTML5 GAME', 'one <canvas>, one button, plain JavaScript · small enough to finish today']
  ];
  const readout = $('[data-readout]'), feel = $('[data-feel]');
  let transmission = 0;
  async function transmit() {
    const id = ++transmission;
    const text = feel.value.trim();
    window.labAudio?.play?.('transmit');
    if (/sauna|badstu/i.test(text)) discover(6);
    readout.textContent = '';
    const out = (line, cls = '') => { const li = document.createElement('li'); li.className = cls; readout.append(li); return li; };
    out('', 'is-sys').textContent = `> received: “${text || '…'}”`;
    await wait(500);
    if (id !== transmission) return;
    const hits = FEELINGS.filter(([re]) => re.test(text));
    if (!hits.length) {
      out('', 'is-warn').textContent = '> No matching word in this demo. Try lonely, strong, calm or nostalgic, or describe your own design choices in the brief below.';
      return;
    }
    for (const [, name, design] of hits) {
      if (id !== transmission) return;
      const li = out('', 'is-hit');
      li.innerHTML = '<b></b><span></span>';
      li.firstChild.textContent = `${name} →`;
      li.lastChild.textContent = ` ${design}`;
      await wait(650);
    }
    if (id === transmission) out('', 'is-sys').textContent = '> These are possible design choices, not rules. Keep, change or reject them.';
  }
  $('[data-transmit]').addEventListener('click', transmit);

  // ---------- Level B: loneliness meets empowerment ----------
  const canvas = $('[data-game]'), ctx = canvas.getContext('2d'), caption = $('[data-game-caption]');
  canvas.addEventListener('keydown', e => {
    const moves = {ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24]};
    if (!moves[e.key]) return;
    e.preventDefault();
    const [dx, dy] = moves[e.key];
    target = {x: Math.max(12, Math.min(W - 12, target.x + dx)), y: Math.max(12, Math.min(H - 12, target.y + dy))};
    wake();
  });
  const W = canvas.width, H = canvas.height;
  const stars = Array.from({length: 70}, () => ({x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .3, p: Math.random() * 6}));
  let hero, target, lights, raf = 0;
  const MESSAGES = [
    [0, 'One small light in a very big dark.'],
    [1, 'You pressed the pinecone. Something stays where you stood.'],
    [3, 'The dark is still big. You are less small.'],
    [6, 'Still alone. No longer powerless.'],
    [10, 'Alone, and lighting up the whole field.']
  ];
  function reset() {
    hero = {x: W / 2, y: H * .62}; target = {...hero}; lights = [];
    caption.textContent = MESSAGES[0][1];
    draw(performance.now());
  }
  const mix = (a, b, t) => Math.round(a + (b - a) * t);
  function draw(now) {
    const warmth = Math.min(1, lights.length / 10);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${mix(4, 42, warmth)},${mix(9, 14, warmth)},${mix(26, 48, warmth)})`);
    g.addColorStop(1, `rgb(${mix(10, 120, warmth)},${mix(26, 52, warmth)},${mix(58, 40, warmth)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.globalAlpha = .35 + .35 * Math.sin(now / 900 + s.p);
      ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const l of lights) {
      const age = Math.min(1, (now - l.t) / 900);
      const r = 14 + age * 46 + Math.sin(now / 700 + l.p) * 3;
      const glow = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
      glow.addColorStop(0, 'rgba(255,190,90,.75)'); glow.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(l.x, l.y, r, 0, 7); ctx.fill();
      cone(l.x, l.y, 5 + age * 5);
    }
    hero.x += (target.x - hero.x) * .06; hero.y += (target.y - hero.y) * .06;
    const size = 6 + Math.min(lights.length, 10) * .7;
    const halo = ctx.createRadialGradient(hero.x, hero.y, 0, hero.x, hero.y, size * 4);
    halo.addColorStop(0, 'rgba(255,255,255,.55)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(hero.x, hero.y, size * 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hero.x, hero.y + (lights.length ? 0 : Math.sin(now / 160) * .8), size, 0, 7); ctx.fill();
  }
  function cone(x, y, s) {
    ctx.fillStyle = '#6b3d1c'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, s * .7, s, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(x, y, s * .7, s, 0, -1.2, .9); ctx.stroke();
  }
  function loop(now) {
    draw(now);
    raf = reduced() ? 0 : requestAnimationFrame(loop);
  }
  function wake() { if (!raf) raf = requestAnimationFrame(loop); if (reduced()) setTimeout(() => { hero = {...target}; draw(performance.now() + 2000); }, 30); }
  canvas.addEventListener('pointerdown', e => {
    const box = canvas.getBoundingClientRect();
    target = {x: (e.clientX - box.left) / box.width * W, y: (e.clientY - box.top) / box.height * H};
    wake();
  });
  $('[data-cone]').addEventListener('click', () => {
    lights.push({x: hero.x, y: hero.y, t: performance.now(), p: Math.random() * 6});
    if (lights.length >= 10) discover(7);
    caption.textContent = MESSAGES.filter(([n]) => lights.length >= n).pop()[1];
    $('[data-cone]').classList.remove('is-pop'); void $('[data-cone]').offsetWidth; $('[data-cone]').classList.add('is-pop');
    window.labAudio?.play?.('star');
    wake();
  });
  $('[data-game-reset]').addEventListener('click', () => { reset(); wake(); });
  // Only animate while the game is on screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) wake(); else { cancelAnimationFrame(raf); raf = 0; }
  }).observe(canvas);
  reset();
  const motionChange = () => {
    cancelAnimationFrame(raf); raf = 0;
    if (reduced()) { hero = {...target}; draw(performance.now() + 2000); }
    else wake();
  };
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', motionChange);
  new MutationObserver(motionChange).observe(document.documentElement, {attributes: true, attributeFilter: ['class']});

  const conePrompt = $('[data-cone-prompt]').textContent, coneStatus = $('[data-cone-status]');
  $('[data-copy-cone]').addEventListener('click', () => copy(conePrompt, coneStatus));

  // ---------- Level E: vibe brief ----------
  const kit = name => $(`[data-kit="${name}"]`);
  const brief = $('[data-kit-out]'), hex = $('[data-kit-hex]'), kitStatus = $('[data-kit-status]');
  function build() {
    const f = kit('feel').value.trim() || 'lonely and strong at the same time';
    const song = kit('song').value.trim() || 'the song on repeat this week';
    const image = kit('image').value.trim() || 'a pinecone in the snow from my feed';
    const interest = kit('interest').value.trim();
    const action = kit('action').value.trim();
    const personal = `${interest ? `Explore ${interest}.\n` : ''}${action ? `When someone interacts, let them ${action}.\n` : ''}`;
    const colour = kit('colour').value;
    hex.textContent = colour;
    brief.style.borderLeftColor = colour;
    brief.textContent = `My vibe brief:\n${personal}The page should feel ${f}.\nUse ${colour} as the main colour.\nUse the pace and mood of ${song} as a reference for timing.\nUse ${image} as a visual reference; make an original interpretation.\nStart with one small interaction. Ask who can use it and what the action communicates. Keep my existing style. Plain JavaScript. Explain the changes and how to test them.`;
    return brief.textContent;
  }
  root.querySelectorAll('[data-kit]').forEach(i => i.addEventListener('input', build));
  $('[data-kit-copy]').addEventListener('click', () => copy(build(), kitStatus));
  $('[data-kit-note]').addEventListener('click', () => addToNote(build().replace(/\n/g, ' '), kitStatus));
  build();
})();

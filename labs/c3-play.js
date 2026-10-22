// Lab 3 walkthrough extras: "I did it" checkpoints with a Construct licence, a Find it! game on the
// real editor screenshot, and a full-screen screenshot viewer. Everything degrades to the plain page.
(() => {
  const sound = cue => { try { window.labAudio?.play(cue); } catch {} };
  document.querySelectorAll('[data-c3w]').forEach(root => {
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- 1. Checkpoints and the Construct licence ---------- */
  const DONE_KEY = 'dik105-c3w-done';
  const done = new Set(store.get(DONE_KEY, []));
  const scenes = [...root.querySelectorAll('[data-c3w-scene]')];
  const core = scenes.filter(s => !s.closest('.c3w-levelup'));
  const part = root.dataset.c3wPart || (core[0]?.dataset.c3wLabel?.startsWith('Part 1') ? 'Part 1' : 'Part 2');

  const meter = document.createElement('div');
  meter.className = 'c3w-meter';
  meter.innerHTML = '<div class="c3w-meter-bar" aria-hidden="true"><span></span></div><p class="c3w-meter-text" role="status"></p>';
  root.querySelector('.c3w-head').append(meter);

  const licence = document.createElement('section');
  licence.className = 'c3w-licence';
  licence.hidden = true;
  licence.setAttribute('aria-label', 'Construct licence');
  root.append(licence);

  const SKILL = {
    'z-new': 'New project', 'z-screen': 'The six areas', 'z-object': 'Insert new object', 'z-draw': 'Image editor',
    'z-move': 'Move, size, turn', 'z-undo': 'Undo', 'z-behavior': 'Behaviors', 'z-when': 'Conditions', 'z-then': 'Actions',
    'z-play': 'Preview and save', 'z-remember': 'The ten rules',
    open: 'Open a .c3p', lock: 'Lock', place: 'Text objects', secret: 'Initially visible', ears: 'Touch',
    listen: 'On tap object', act: 'Set visible', play: 'Preview layout', save: 'Download a copy', show: 'Obligatory Task 4',
    'l4-open': 'Open a .c3p', 'l4-var': 'Global variable', 'l4-add': 'Add to', 'l4-show': 'Expressions with &', 'l4-if': 'Compare variable', 'l4-test1': 'Testing a rule',
    'l4-arrow': 'Go to layout', 'l4-clone': 'Clone an object type', 'l4-room2': 'Event sheet per layout', 'l4-back': 'On start of layout', 'l4-test2': 'What rooms forget', 'l4-save': 'Download a copy'
  };
  const skills = () => core.map(s => SKILL[s.dataset.c3wScene] || s.querySelector('h4').textContent);
  function render(celebrate) {
    const count = core.filter(s => done.has(s.dataset.c3wScene)).length;
    meter.querySelector('span').style.width = `${Math.round(count / core.length * 100)}%`;
    meter.querySelector('.c3w-meter-text').textContent = count === core.length
      ? `${part} complete: ${count} of ${core.length} scenes done`
      : `${part}: ${count} of ${core.length} scenes done`;
    scenes.forEach(s => {
      const id = s.dataset.c3wScene, on = done.has(id);
      const btn = s.querySelector('.c3w-done');
      btn.setAttribute('aria-pressed', String(on));
      const level = !core.includes(s);
      btn.textContent = level ? (on ? '✓ Done' : 'It works ✓') : (on ? '✓ Done · Next →' : 'It works ✓ Next →');
      root.querySelector(`[data-c3w-tab="${id}"]`)?.classList.toggle('is-done', on);
    });
    const complete = count === core.length;
    licence.hidden = !complete;
    if (complete) {
      const next = root.dataset.c3wLicenceHref
        ? `<a class="primary" href="${root.dataset.c3wLicenceHref}">${root.dataset.c3wLicenceLabel}</a>`
        : part === 'Part 1'
          ? '<a class="primary" href="lab3-alinta-map.html#c3w-open">Use it on Alinta\'s map →</a>'
          : '<a class="primary" href="#map-obligatory">Post your screenshot: Obligatory Task 4 →</a>';
      licence.innerHTML = `<p class="c3w-licence-kicker">CONSTRUCT LICENCE · ${part.toUpperCase()}</p>`
        + `<h4>${root.dataset.c3wLicenceTitle || (part === 'Part 1' ? 'You can use Construct now.' : 'Your map keeps a secret.')}</h4>`
        + `<p>Skills unlocked today:</p><ul>${skills().map(k => `<li>${k}</li>`).join('')}</ul>${next}`;
      if (celebrate) {
        sound('complete');
        licence.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      }
    }
  }
  scenes.forEach(s => {
    // The checkpoint sits in NEXT UP: confirm this scene works, then move straight on.
    const isLevel = !core.includes(s);
    const host = s.querySelector('.c3w-nextup') || s;
    const row = document.createElement('div');
    row.className = 'c3w-done-row';
    row.innerHTML = '<button type="button" class="c3w-done" aria-pressed="false"></button><span>Works on your screen?</span>';
    host.append(row);
    row.querySelector('button').addEventListener('click', () => {
      const id = s.dataset.c3wScene;
      const wasComplete = core.every(c => done.has(c.dataset.c3wScene));
      const first = !done.has(id);
      if (first) { done.add(id); sound('star'); }
      store.set(DONE_KEY, [...done]);
      const nowComplete = core.every(c => done.has(c.dataset.c3wScene));
      render(nowComplete && !wasComplete);
      // Finishing a part shows the licence; otherwise go to the next scene.
      if (!isLevel && !(nowComplete && !wasComplete)) root.querySelector('[data-c3w-next]')?.click();
    });
  });
  render(false);

  /* ---------- 2. Find it! on the real editor screenshot ---------- */
  const screen = root.querySelector('img[src*="b02-your-screen"]');
  if (screen) {
    // Areas of the real screenshot (1584 × 905 px), smallest first so overlaps resolve sensibly.
    const W = 1584, H = 905;
    const AREAS = [
      {name: 'the Preview and Save buttons', short: 'Toolbar', box: [324, 0, 250, 36]},
      {name: 'the Layout and Event sheet tabs', short: 'Tabs', box: [650, 0, 262, 36]},
      {name: 'the Layers panel', short: 'Layers', box: [1265, 475, 319, 62]},
      {name: 'the Project Bar', short: 'Project Bar', box: [1265, 0, 319, 472]},
      {name: 'the Properties panel', short: 'Properties', box: [0, 0, 322, 905]},
      {name: 'the Layout', short: 'Layout', box: [340, 60, 920, 600]}
    ];
    const fig = screen.closest('.c3w-shot');
    const link = screen.closest('a');
    const game = document.createElement('div');
    game.className = 'c3w-game';
    game.innerHTML = '<p class="c3w-game-kicker">MINI GAME · ABOUT 1 MIN</p><p class="c3w-game-q" role="status">Can you find all six areas on the real screen?</p><button type="button" class="c3w-game-go">Play: Find it!</button>';
    fig.after(game);
    let order = [], round = 0, score = 0, tries = 0, playing = false;
    const q = game.querySelector('.c3w-game-q'), go = game.querySelector('.c3w-game-go');
    const mark = (box, cls) => {
      const m = document.createElement('span');
      m.className = 'c3w-hit ' + cls;
      Object.assign(m.style, {left: box[0] / W * 100 + '%', top: box[1] / H * 100 + '%', width: box[2] / W * 100 + '%', height: box[3] / H * 100 + '%'});
      link.append(m);
      if (cls === 'is-miss') setTimeout(() => m.remove(), 900);
    };
    function ask() {
      if (round === order.length) {
        playing = false;
        fig.classList.remove('is-playing');
        q.textContent = `${score} of ${order.length} on the first try. ${score === order.length ? 'You know your screen.' : 'Play again to beat it.'}`;
        go.hidden = false; go.textContent = 'Play again';
        sound(score === order.length ? 'complete' : 'star');
        return;
      }
      tries = 0;
      q.innerHTML = `${round + 1} / ${order.length} · Tap <b>${order[round].name}</b> on the screenshot.`;
    }
    go.addEventListener('click', () => {
      link.querySelectorAll('.c3w-hit').forEach(m => m.remove());
      order = [...AREAS].sort(() => Math.random() - .5);
      round = 0; score = 0; playing = true; go.hidden = true;
      fig.classList.add('is-playing');
      ask();
      fig.scrollIntoView({block: 'nearest'});
    });
    link.addEventListener('click', e => {
      if (!playing) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const r = screen.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      const hit = AREAS.find(a => x >= a.box[0] && x <= a.box[0] + a.box[2] && y >= a.box[1] && y <= a.box[1] + a.box[3]);
      const want = order[round];
      if (hit === want) {
        if (tries === 0) score++;
        mark(want.box, 'is-hit');
        sound('star');
        round++;
        ask();
      } else {
        tries++;
        if (hit) mark(hit.box, 'is-miss');
        q.innerHTML = `${round + 1} / ${order.length} · ${hit ? `That is ${hit.name}.` : 'Not quite.'} Tap <b>${want.name}</b>.`;
      }
    }, true);
  }
  });

  /* ---------- 3. Full-screen screenshot viewer ---------- */
  const lb = document.createElement('div');
  lb.className = 'c3w-lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Screenshot');
  lb.innerHTML = '<div class="c3w-lb-bar"><p class="c3w-lb-count"></p><a class="c3w-lb-full" target="_blank" rel="noopener">Open full size ↗</a><button type="button" class="c3w-lb-close" aria-label="Close">×</button></div>'
    + '<div class="c3w-lb-stage"><img alt=""/></div><p class="c3w-lb-cap"></p><p class="c3w-lb-hint">Tap the picture to zoom in. Tap again to fit.</p>'
    + '<div class="c3w-lb-nav"><button type="button" data-lb="-1">← Previous</button><button type="button" data-lb="1">Next →</button></div>';
  document.body.append(lb);
  let list = [], at = 0, opener = null;
  const img = lb.querySelector('img');
  // Tap the picture to zoom in and pan; tap again to fit the screen.
  img.addEventListener('click', () => lb.classList.toggle('is-zoom'));
  function showShot(i) {
    at = (i + list.length) % list.length;
    lb.classList.remove('is-zoom');
    const a = list[at], src = a.querySelector('img');
    img.src = a.href; img.alt = src.alt;
    lb.querySelector('.c3w-lb-full').href = a.href;
    lb.querySelector('.c3w-lb-cap').textContent = a.closest('figure').querySelector('figcaption')?.textContent || src.alt;
    lb.querySelector('.c3w-lb-count').textContent = list.length > 1 ? `Picture ${at + 1} of ${list.length}` : 'Picture';
    lb.querySelectorAll('[data-lb]').forEach(b => { b.hidden = list.length < 2; });
  }
  function close() {
    lb.hidden = true;
    document.documentElement.classList.remove('c3w-lb-open');
    opener?.focus();
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('.c3w .c3w-shot a');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    opener = a;
    list = [...(a.closest('.c3w-scene') || a.closest('.c3w')).querySelectorAll('.c3w-shot a')];
    showShot(list.indexOf(a));
    lb.hidden = false;
    document.documentElement.classList.add('c3w-lb-open');
    lb.querySelector('.c3w-lb-close').focus();
  });
  lb.addEventListener('click', e => {
    if (e.target.closest('.c3w-lb-close') || e.target === lb) close();
    const d = e.target.closest('[data-lb]');
    if (d) showShot(at + Number(d.dataset.lb));
  });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' && list.length > 1) { e.stopPropagation(); showShot(at + 1); }
    if (e.key === 'ArrowLeft' && list.length > 1) { e.stopPropagation(); showShot(at - 1); }
    if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('a,button')].filter(x => !x.hidden);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
})();

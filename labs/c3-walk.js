// Lab 3 map workshop: show one Construct scene at a time, with tabs, Back/Next and remembered progress.
// Without JavaScript every scene stays visible in order.
(() => {
  document.querySelectorAll('[data-c3w]').forEach(root => {
  const KEY = 'dik105-c3w-seen';
  const scenes = [...root.querySelectorAll('[data-c3w-scene]')];
  const main = scenes.filter(s => !s.closest('.c3w-levelup'));
  const tabs = [...root.querySelectorAll('[data-c3w-tab]')];
  const prev = root.querySelector('[data-c3w-prev]');
  const next = root.querySelector('[data-c3w-next]');
  const progress = root.querySelector('.c3w-progress');
  const levelBand = root.querySelector('.c3w-levelup > .eyebrow');
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
  let current = scenes[0].dataset.c3wScene;

  // Put each picture directly under the step it shows: do this, see this, next step.
  const PAIR = {
    'z-new': [3], 'z-screen': [4], 'z-object': [2], 'z-draw': [3], 'z-move': [1], 'z-undo': [1],
    'z-behavior': [0, 1, 2], 'z-when': [2, 3], 'z-then': [2, 2], 'z-play': [0, 2], 'z-remember': [9],
    open: [1, 2], lock: [1], place: [0, 1, 3], secret: [2], ears: [0, 0], listen: [0, 1, 2, 3],
    act: [2, 3, 3], play: [0, 1], save: [0], show: [1], toggle: [1, 1], visited: [2, 2, 2], travel: [0, 2, 3, 3]
  };
  root.querySelectorAll('[data-c3w-scene]').forEach(scene => {
    const map = PAIR[scene.dataset.c3wScene];
    const shots = scene.querySelector('.c3w-shots');
    const steps = scene.querySelectorAll('.c3w-do > ol > li');
    if (!map || !shots || map.length !== shots.children.length) return;
    [...shots.children].forEach((shot, i) => {
      const li = steps[Math.min(map[i], steps.length - 1)];
      if (!li) return;
      shot.classList.add('c3w-step-shot');
      li.append(shot);
    });
    shots.remove();
    scene.querySelector('.c3w-grid').classList.add('is-paired');
  });

  root.classList.add('c3w-js');
  root.querySelector('.c3w-controls').hidden = false;

  function show(id, focus = false) {
    const scene = scenes.find(s => s.dataset.c3wScene === id);
    if (!scene) return;
    current = id;
    seen.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch {}
    scenes.forEach(s => { s.hidden = s !== scene; });
    const isLevel = !main.includes(scene);
    if (levelBand) levelBand.hidden = !isLevel;
    tabs.forEach(t => {
      const on = t.dataset.c3wTab === id;
      t.setAttribute('aria-current', on ? 'step' : 'false');
      t.classList.toggle('is-seen', seen.has(t.dataset.c3wTab) && !on);
    });
    const i = main.indexOf(scene);
    prev.disabled = i === 0;
    if (isLevel) {
      progress.textContent = 'Level up · optional';
      next.textContent = 'Back to the scenes';
    } else {
      progress.textContent = scene.dataset.c3wLabel || `Scene ${i + 1} of ${main.length}`;
      const nextScene = main[i + 1];
      next.textContent = !nextScene ? (root.dataset.c3wNextLabel || 'Level up →') : nextScene.dataset.c3wScene === 'open' ? "Part 2: Alinta's map →" : 'Next scene →';
    }
    if (focus) {
      const h = scene.querySelector('h4');
      h.tabIndex = -1;
      h.focus({preventScroll: true});
      root.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  function step(dir) {
    const scene = scenes.find(s => s.dataset.c3wScene === current);
    const i = main.indexOf(scene);
    if (i === -1) { show(dir < 0 ? main[main.length - 1].dataset.c3wScene : main[0].dataset.c3wScene, true); return; }
    const target = main[i + dir] || (dir > 0 ? scenes[main.length] : null);
    if (target) show(target.dataset.c3wScene, true);
    else if (dir > 0 && root.dataset.c3wNextPage) location.href = root.dataset.c3wNextPage;
  }

  tabs.forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    show(t.dataset.c3wTab, true);
    history.replaceState(null, '', '#c3w-' + t.dataset.c3wTab);
  }));
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  root.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  function fromHash() {
    const id = location.hash.startsWith('#c3w-') ? location.hash.slice(5) : null;
    if (id && scenes.some(s => s.dataset.c3wScene === id)) { show(id); return true; }
    return false;
  }
  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) show(current);
  });
})();

// Lab 3 map workshop: show one Construct scene at a time, with tabs, Back/Next and remembered progress.
// Without JavaScript every scene stays visible in order.
(() => {
  const root = document.querySelector('[data-c3w]');
  if (!root) return;
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
      next.textContent = !nextScene ? 'Level up →' : nextScene.dataset.c3wScene === 'open' ? "Part 2: Alinta's map →" : 'Next scene →';
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
})();

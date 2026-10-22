// Lab 4, Part 3: a hand-in checklist that remembers ticks and opens the posting link when everything is ready.
(() => {
  const box = document.querySelector('#l4-ready');
  if (!box) return;
  const KEY = 'dik105-l4-ready';
  const checks = [...box.querySelectorAll('[data-l4-check]')];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const render = () => {
    const n = checks.filter(c => c.checked).length;
    box.querySelector('.l4-meter span').style.width = `${Math.round(n / checks.length * 100)}%`;
    box.querySelector('.l4-status').textContent = n === checks.length ? `All ${n} ready.` : `${n} of ${checks.length} ready`;
    box.querySelector('.l4-done').hidden = n !== checks.length;
    checks.forEach(c => c.closest('li').classList.toggle('is-done', c.checked));
  };
  checks.forEach(c => {
    c.checked = !!saved[c.dataset.l4Check];
    c.addEventListener('change', () => {
      saved[c.dataset.l4Check] = c.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
      if (c.checked) { try { window.labAudio?.play(checks.every(x => x.checked) ? 'complete' : 'star'); } catch {} }
      render();
    });
  });
  render();
})();

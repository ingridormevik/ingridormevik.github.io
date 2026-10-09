(() => {
  // Self-running introduction: each panel plays for its data-seconds, then the next one starts. Loops forever.
  const panels = [...document.querySelectorAll('[data-panel]')], tabs = [...document.querySelectorAll('[data-stage]')];
  const bar = document.querySelector('[data-progress]'), autoBtn = document.querySelector('[data-autoplay]');
  let current = 0, auto = true, started = 0, elapsed = 0;

  function select(index, focus = false) {
    current = (index + panels.length) % panels.length;
    panels.forEach((p, i) => { p.hidden = i !== current; p.classList.remove('is-live'); });
    tabs.forEach((t, i) => t.setAttribute('aria-pressed', String(i === current)));
    void panels[current].offsetWidth; panels[current].classList.add('is-live');
    if (focus) { const title = panels[current].querySelector('h1,h2'); title.tabIndex = -1; title.focus({preventScroll: true}); }
    window.scrollTo({top: 0, behavior: 'auto'});
    elapsed = 0; started = performance.now(); bar.style.width = '0%';
  }
  function tick(now) {
    if (auto) {
      const total = Number(panels[current].dataset.seconds || 20) * 1000;
      const done = elapsed + (now - started);
      bar.style.width = `${Math.min(100, done / total * 100)}%`;
      if (done >= total) select(current + 1);
    }
    requestAnimationFrame(tick);
  }
  function setAuto(on) {
    if (on && !auto) started = performance.now();
    if (!on && auto) elapsed += performance.now() - started;
    auto = on; document.body.classList.toggle('is-auto', on);
    autoBtn.setAttribute('aria-pressed', String(!on));
    autoBtn.textContent = on ? '❚❚ Pause autoplay' : '▶ Resume autoplay';
  }
  autoBtn.addEventListener('click', () => setAuto(!auto));
  tabs.forEach(t => t.addEventListener('click', () => select(Number(t.dataset.stage), true)));
  document.querySelectorAll('[data-next]').forEach(t => t.addEventListener('click', () => select(Number(t.dataset.next), true)));
  document.querySelectorAll('[data-restart]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('details').forEach(d => { d.open = false; }); setAuto(true); select(0, true); }));
  function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); }
  document.querySelector('[data-fullscreen]').addEventListener('click', fullscreen);
  document.addEventListener('keydown', e => {
    if (e.target.matches('textarea,input')) return;
    if (e.key === ' ') { e.preventDefault(); setAuto(!auto); }
    if (e.key === 'ArrowRight') select(current + 1);
    if (e.key === 'ArrowLeft') select(current - 1);
    if (e.key === 'f' || e.key === 'F') fullscreen();
  });

  // Live countdown to the opening, 15 October 2026 at 17:00 in Bergen.
  const out = document.querySelector('[data-countdown]'), opening = Date.parse('2026-10-15T17:00:00+02:00');
  const pad = n => String(n).padStart(2, '0');
  function count() {
    let s = Math.max(0, Math.floor((opening - Date.now()) / 1000));
    if (!s) { out.textContent = 'OPEN NOW'; return; }
    const d = Math.floor(s / 86400); s %= 86400;
    out.textContent = `${pad(d)}:${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
  }
  count(); setInterval(count, 1000);

  // Typing an idea pauses the show so nobody loses their sentence mid-thought.
  const input = document.getElementById('idea'), status = document.getElementById('saved');
  try { input.value = localStorage.getItem('cdn-biff-intro-idea') || ''; } catch (_) {}
  input.addEventListener('focus', () => setAuto(false));
  input.addEventListener('input', () => { try { localStorage.setItem('cdn-biff-intro-idea', input.value); status.textContent = 'Your idea is saved in this browser.'; } catch (_) { status.textContent = 'Copy your idea before continuing.'; } });

  const motion = document.getElementById('motion');
  motion.addEventListener('click', () => { const paused = document.body.classList.toggle('paused'); motion.setAttribute('aria-pressed', String(paused)); motion.textContent = paused ? 'Resume motion' : 'Pause motion'; });

  select(0); requestAnimationFrame(tick);
})();

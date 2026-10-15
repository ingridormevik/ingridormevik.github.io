// "Now" bar: on a lab day, show only the one thing to do right now, minutes left and what comes next.
// Test any moment with ?now=2026-10-16T08:50 in the address.
(() => {
  const GROUPS = [495, 855], LENGTH = 105, BREAKS = [[45, 55], [85, 90]];
  const HIDE_KEY = 'dik105-now-hidden';
  const pad = n => String(n).padStart(2, '0');
  const clock = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  let manualGroup = null;

  function now() {
    const forced = new URLSearchParams(location.search).get('now');
    if (forced) {
      const t = new Date(forced);
      if (!isNaN(t)) {
        // Keep a forced time ticking so the bar can be rehearsed live.
        now.base ??= [t.getTime(), Date.now()];
        return new Date(now.base[0] + Date.now() - now.base[1]);
      }
    }
    return new Date();
  }
  function pickGroup(minutes) {
    if (manualGroup) return manualGroup;
    const near = GROUPS.find(g => minutes >= g - 30 && minutes <= g + LENGTH + 20);
    if (near) return near;
    try { const saved = Number(localStorage.getItem('dik105-clock-group')); if (GROUPS.includes(saved)) return saved; } catch {}
    return 495;
  }

  const bar = document.createElement('aside');
  bar.className = 'now-bar';
  bar.setAttribute('aria-label', 'What to do now');
  bar.hidden = true;
  bar.innerHTML = `
    <div class="now-clock"><span class="now-label">NOW</span><strong data-now-time></strong></div>
    <div class="now-main">
      <p class="now-title" data-now-title></p>
      <p class="now-prompt" data-now-prompt></p>
      <div class="now-track" aria-hidden="true"><span class="now-fill" data-now-fill></span>${BREAKS.map(([a, b]) => `<i class="now-break" style="left:${a / LENGTH * 100}%;width:${(b - a) / LENGTH * 100}%"></i>`).join('')}</div>
    </div>
    <div class="now-side"><p class="now-left" data-now-left></p><p class="now-next" data-now-next></p></div>
    <a class="now-go" data-now-go href="#">Show me</a>
    <button type="button" class="now-close" aria-label="Hide the now bar until the page is reloaded">×</button>
    <p class="now-sr" role="status" aria-live="polite"></p>`;
  document.body.append(bar);
  const $ = sel => bar.querySelector(sel);
  let hiddenByUser = false;
  try { hiddenByUser = sessionStorage.getItem(HIDE_KEY) === 'yes'; } catch {}
  let lastAnnounced = '';

  function show(view) {
    if (!view || hiddenByUser) { bar.hidden = true; document.body.classList.remove('has-now-bar'); document.documentElement.style.scrollPaddingBottom = ''; return; }
    bar.hidden = false;
    document.body.classList.add('has-now-bar');
    document.documentElement.style.scrollPaddingBottom = (bar.offsetHeight + 16) + 'px';
    bar.dataset.kind = view.kind;
    $('[data-now-time]').textContent = view.time;
    $('[data-now-title]').textContent = view.title;
    $('[data-now-prompt]').textContent = view.prompt;
    $('[data-now-left]').textContent = view.left || '';
    $('[data-now-next]').textContent = view.next || '';
    $('[data-now-fill]').style.width = `${Math.max(0, Math.min(100, view.progress * 100))}%`;
    const go = $('[data-now-go]');
    go.hidden = !view.href;
    if (view.href) {
      // On a sub-page, jump to a matching place here, or back to the lab page.
      let href = view.href;
      if (view.kind === 'task' && document.querySelector('.obligatory-banner')) href = '#' + document.querySelector('.obligatory-banner').id;
      else if (href.startsWith('#') && (document.querySelector('[data-now-schedule]') || !document.getElementById(href.slice(1)))) href = 'lab-programme.html' + href;
      go.href = href;
    }
    if (view.title !== lastAnnounced) { lastAnnounced = view.title; $('.now-sr').textContent = `Now: ${view.title}. ${view.left || ''}`; }
  }

  function compute() {
    const t = now();
    const today = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    const lab = document.querySelector(`.lab[data-unlock-date="${today}"], [data-now-schedule][data-unlock-date="${today}"]`);
    if (!lab) return null;
    const minutes = t.getHours() * 60 + t.getMinutes();
    const start = pickGroup(minutes);
    const elapsed = minutes - start;
    const time = clock(minutes);
    const labName = lab.querySelector('.lab-title h2')?.textContent.trim() || 'Today\'s lab';
    if (elapsed < -30 || elapsed > LENGTH + 20) return null;
    if (elapsed < 0) return {kind: 'before', time, title: `${labName} starts at ${clock(start)}`, prompt: 'Open your project files. Find a seat with a charger.', left: `${-elapsed} min to go`, progress: 0, href: `#${lab.id}`};
    if (elapsed >= LENGTH) return {kind: 'after', time, title: 'Lab finished for today', prompt: 'Save your project files somewhere you can find again. See you next Friday.', progress: 1, href: `#${lab.id}-finish`};

    const rows = [...lab.querySelectorAll('.agenda-row')].filter(r => r.dataset.extension !== 'true');
    let from = 0, current = null, next = null;
    for (const r of rows) {
      const to = from + Number(r.dataset.minutes);
      if (current && !next) next = {row: r, at: from};
      if (!current && elapsed >= from && elapsed < to) current = {row: r, from, to};
      from = to;
    }
    if (!current) return null;
    const isBreak = current.row.classList.contains('break-row');
    // Last quarter of the lab: the screenshot for the obligatory task comes first.
    const task = lab.dataset.obligatory;
    if (task && !isBreak && elapsed >= 85 && elapsed < 100) return {
      kind: 'task', time, title: `Screenshot → Obligatory Task ${task}`,
      prompt: `Post a screenshot of today's work on Mitt UiB under Discussions › Obligatory Task ${task}.`,
      left: `${LENGTH - elapsed} min left`, next: `Ends ${clock(start + LENGTH)}`, progress: elapsed / LENGTH, href: `#${lab.id}-obligatory`};
    const chip = [...lab.querySelectorAll('.time-chip[data-from]')].filter(c => elapsed >= Number(c.dataset.from) && elapsed < Number(c.dataset.to)).pop();
    const section = chip?.closest('[id]');
    return {
      kind: isBreak ? 'break' : 'work',
      time,
      title: current.row.querySelector('h4')?.textContent.trim() || '',
      prompt: isBreak ? `Step away from the screen. Back at ${clock(start + current.to)}.` : current.row.querySelector('.row-prompt')?.textContent.trim() || '',
      left: `${current.to - elapsed} min left`,
      next: next ? `Next ${clock(start + next.at)} · ${next.row.querySelector('h4')?.textContent.trim()}` : `Ends ${clock(start + LENGTH)}`,
      progress: elapsed / LENGTH,
      href: isBreak || !section ? null : `#${section.id}`
    };
  }

  const tick = () => show(compute());
  $('.now-close').addEventListener('click', () => {
    hiddenByUser = true;
    try { sessionStorage.setItem(HIDE_KEY, 'yes'); } catch {}
    tick();
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-clock-group]');
    if (b) { manualGroup = Number(b.dataset.clockGroup); tick(); }
  });
  tick();
  setInterval(tick, 15000);
})();

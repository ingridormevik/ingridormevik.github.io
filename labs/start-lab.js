(() => {
  // Start page level map: 3 stars per lab (pass, experiment, finish), a lab rank and a candy path between levels.
  const map = document.querySelector('.sl-map');
  if (!map) return;
  const levels = [...map.querySelectorAll('a.lv')];
  const RANKS = ['Lab intern', 'Junior Lab Technician', 'Interaction Engineer', 'Game Mechanic', 'Archive Hacker', 'Lab Director'];
  const WHAT = ['Pass created', 'Experiment done', 'Lab complete'];
  const labFor = a => document.getElementById(a.getAttribute('href').slice(1));

  function starsFor(lab) {
    if (!lab) return 0;
    const pass = lab.querySelector('[data-checkin]')?.dataset.checkinReady === 'true';
    const checks = [...lab.querySelectorAll('[data-check]')];
    const note = lab.querySelector('.mission-actions textarea');
    const experiment = pass && checks.length > 0 && checks.every(x => x.checked) && (note?.value.trim().length || 0) >= 10;
    const done = lab.dataset.questComplete === 'true';
    return done ? 3 : experiment ? 2 : pass ? 1 : 0;
  }

  let toast;
  function cheer(n, star) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'sl-toast'; toast.setAttribute('role', 'status'); toast.hidden = true;
      document.body.append(toast);
    }
    toast.hidden = true; void toast.offsetWidth;
    toast.innerHTML = `<b aria-hidden="true">★</b><span>+1 star · Experiment 0${n} · ${WHAT[star - 1]}</span>`;
    toast.hidden = false;
    clearTimeout(cheer.t); cheer.t = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  const last = new Map();
  function update() {
    let total = 0, complete = 0, next = null;
    levels.forEach((a, i) => {
      const count = starsFor(labFor(a));
      total += count; if (count === 3) complete++; else if (!next) next = {a, i, count};
      a.querySelectorAll('.lv-stars i').forEach((star, k) => {
        const on = k < count;
        // Stars restored while the page loads count silently; only new stars get a cheer.
        if (on && !star.classList.contains('on') && last.has(a) && performance.now() > 2500) { star.classList.add('pop'); cheer(i + 1, k + 1); }
        star.classList.toggle('on', on);
      });
      a.classList.toggle('is-done', count === 3);
      last.set(a, count);
    });
    map.closest('.start-lab').querySelector('[data-rank-name]').textContent = RANKS[complete];
    map.closest('.start-lab').querySelector('[data-xp-fill]').style.width = `${total / 15 * 100}%`;
    map.closest('.start-lab').querySelector('[data-xp-text]').textContent = `${total} / 15 stars
${complete} / 5 labs complete`;
    const go = document.querySelector('[data-go]');
    if (next) { go.href = next.a.getAttribute('href'); go.textContent = `▶ ${next.count ? 'Continue' : 'Start'} experiment 0${next.i + 1}`; }
    else { go.href = '#lab-5'; go.textContent = '★ All 15 stars. Lab Director.'; }
  }

  // Draw the candy path through the centre of each level orb.
  const svg = map.querySelector('.sl-path');
  function drawPath() {
    const box = map.getBoundingClientRect();
    const pts = levels.map(a => { const r = a.querySelector('.lv-orb').getBoundingClientRect(); return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2]; });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2;
      d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
    }
    svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
  }

  let queued = false;
  const soon = () => { if (queued) return; queued = true; setTimeout(() => { queued = false; update(); }, 60); };
  ['input', 'change', 'click', 'lab-progress'].forEach(type => document.addEventListener(type, soon));
  const watch = new MutationObserver(soon);
  document.querySelectorAll('.lab, [data-checkin]').forEach(el => watch.observe(el, {attributes: true, attributeFilter: ['data-quest-complete', 'data-checkin-ready']}));
  addEventListener('resize', drawPath);
  addEventListener('load', drawPath);
  if ('ResizeObserver' in window) new ResizeObserver(drawPath).observe(map);
  drawPath();
  update();
})();

(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  const view = document.getElementById('view');
  try {
    const saved = JSON.parse(sessionStorage.getItem('dik105-session-options') || 'null');
    if (saved && ['495','855'].includes(saved.group)) group.value = saved.group;
    if (saved && ['105','120'].includes(saved.duration)) duration.value = saved.duration;
  } catch {}
  // Which group's clock to show. Display only: the #group select keys saved passes, so it never changes here.
  const CLOCK_KEY = 'dik105-clock-group';
  let clockGroup = group.value;
  try { const v = localStorage.getItem(CLOCK_KEY); if (v === '495' || v === '855') clockGroup = v; } catch {}
  const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  function update() {
    const start = Number(clockGroup);
    const length = Number(duration.value);
    const groupName = start === 495 ? 'Morning' : 'Afternoon';
    document.querySelectorAll('.lab').forEach(lab => {
      let elapsed = 0;
      lab.querySelectorAll('.agenda-row').forEach(row => {
        row.hidden = length === 105 && row.dataset.extension === 'true';
        if (row.hidden) return;
        const minutes = Number(row.dataset.minutes);
        row.querySelector('.clock').textContent = `${clock(start + elapsed)}–${clock(start + elapsed + minutes)}`;
        row.querySelector('.elapsed').textContent = `${elapsed}–${elapsed + minutes} min`;
        elapsed += minutes;
      });
      lab.querySelector('.session-window').textContent = `${groupName} · ${clock(start)}–${clock(start + length)} · ${length} minutes`;
    });
    // Time labels on each part of the lab. The break (45-60 min) is not working time.
    document.querySelectorAll('.time-chip[data-from]').forEach(chip => {
      const from = Number(chip.dataset.from), to = Math.min(Number(chip.dataset.to), length);
      const spansBreak = from < 60 && to > 45;
      const work = to - from - (spansBreak ? 15 : 0);
      chip.textContent = `⏱ ${clock(start + from)}–${clock(start + to)} · ${work} min${spansBreak ? ' + break' : ''}`;
    });
    document.querySelectorAll('[data-clock-group]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.clockGroup === clockGroup)));
    document.body.classList.add('student-view');
    document.getElementById('schedule-status').textContent = `${groupName}: ${clock(start)}–${clock(start + length)}. ` +
      (length === 120 ? 'The 120-minute version needs 15 minutes beyond the listed slot.' : 'Fits the listed slot. Extra project time is omitted; the break and completion evidence time are retained.');
  }
  [group, duration].forEach(control => control.addEventListener('change', update));
  [group, duration].forEach(control => control.addEventListener('change', () => {
    try { sessionStorage.setItem('dik105-session-options', JSON.stringify({group:group.value,duration:duration.value})); } catch {}
  }));
  document.querySelectorAll('[data-clock-group]').forEach(b => b.addEventListener('click', () => {
    clockGroup = b.dataset.clockGroup;
    try { localStorage.setItem(CLOCK_KEY, clockGroup); } catch {}
    update();
  }));
  document.getElementById('print-programme').addEventListener('click', () => window.print());
  update();
})();

(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  if (!group || !duration) return;
  try {
    const saved = JSON.parse((localStorage.getItem('dik105-session-options') ?? sessionStorage.getItem('dik105-session-options')) || 'null');
    if (saved && ['495', '855'].includes(saved.group)) group.value = saved.group;
  } catch {}
  // Old 120-minute preferences must not extend the actual teaching slot.
  duration.value = '105';
  const CLOCK_KEY = 'dik105-clock-group';
  let clockGroup = group.value;
  try { const saved = localStorage.getItem(CLOCK_KEY); if (['495', '855'].includes(saved)) clockGroup = saved; } catch {}
  const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  function update() {
    const start = Number(clockGroup), length = 105;
    const groupName = start === 495 ? 'Morning' : 'Afternoon';
    document.querySelectorAll('.lab').forEach(lab => {
      const labStart = Number(lab.dataset.sessionStart || start);
      const labLength = Number(lab.dataset.sessionMinutes || length);
      let elapsed = 0;
      lab.querySelectorAll('.agenda-row').forEach(row => {
        row.hidden = row.dataset.extension === 'true';
        if (row.hidden) return;
        const minutes = Number(row.dataset.minutes);
        row.querySelector('.clock').textContent = `${clock(labStart + elapsed)}-${clock(labStart + elapsed + minutes)}`;
        row.querySelector('.elapsed').textContent = `${elapsed}-${elapsed + minutes} min`;
        elapsed += minutes;
      });
      lab.querySelector('.session-window').textContent = `${lab.dataset.sessionStart ? 'Today' : groupName} · ${clock(labStart)}-${clock(labStart + labLength)} · ${labLength} minutes${lab.dataset.sessionBreaks === 'none' ? ' · no scheduled breaks' : ''}`;
    });
    document.querySelectorAll('.time-chip[data-from]').forEach(chip => {
      const lab = chip.closest('.lab');
      const chipStart = Number(lab?.dataset.sessionStart || start);
      const chipLength = Number(lab?.dataset.sessionMinutes || length);
      const from = Number(chip.dataset.from), to = Math.min(Number(chip.dataset.to), chipLength);
      const overlap = (a, b) => Math.max(0, Math.min(to, b) - Math.max(from, a));
      const breaks = lab?.dataset.sessionBreaks === 'none' ? 0 : overlap(45, 55) + overlap(85, 90);
      chip.textContent = `⏱ ${clock(chipStart + from)}-${clock(chipStart + to)} · ${to - from - breaks} min${breaks ? ' + breaks' : ''}`;
    });
    document.querySelectorAll('[data-clock-group]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.clockGroup === clockGroup)));
    document.body.classList.add('student-view');
    document.getElementById('schedule-status').textContent = `${groupName}: ${clock(start)}-${clock(start + length)}. Two breaks: ${clock(start + 45)}-${clock(start + 55)} and ${clock(start + 85)}-${clock(start + 90)}.`;
  }
  group.addEventListener('change', () => {
    clockGroup = group.value;
    try { localStorage.setItem(CLOCK_KEY, clockGroup); localStorage.setItem('dik105-session-options', JSON.stringify({group: group.value, duration: '105'})); } catch {}
    update();
  });
  duration.addEventListener('change', () => { duration.value = '105'; update(); });
  document.querySelectorAll('[data-clock-group]').forEach(b => b.addEventListener('click', () => {
    clockGroup = b.dataset.clockGroup;
    try { localStorage.setItem(CLOCK_KEY, clockGroup); } catch {}
    update();
  }));
  document.getElementById('print-programme')?.addEventListener('click', () => window.print());
  update();
})();

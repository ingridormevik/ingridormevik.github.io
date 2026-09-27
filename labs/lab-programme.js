(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  const view = document.getElementById('view');
  try {
    const saved = JSON.parse(sessionStorage.getItem('dik105-session-options') || 'null');
    if (saved && ['495','855'].includes(saved.group)) group.value = saved.group;
    if (saved && ['105','120'].includes(saved.duration)) duration.value = saved.duration;
  } catch {}
  const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  function update() {
    const start = Number(group.value);
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
    document.body.classList.toggle('student-view', view.value === 'student');
    document.getElementById('schedule-status').textContent = `${groupName}: ${clock(start)}–${clock(start + length)}. ` +
      (length === 120 ? 'The 120-minute version needs 15 minutes beyond the listed slot.' : 'Fits the listed slot. Extra project time is omitted; both breaks and completion evidence time are retained.');
  }
  [group, duration, view].forEach(control => control.addEventListener('change', update));
  [group, duration].forEach(control => control.addEventListener('change', () => {
    try { sessionStorage.setItem('dik105-session-options', JSON.stringify({group:group.value,duration:duration.value})); } catch {}
  }));
  document.getElementById('print-programme').addEventListener('click', () => window.print());
  update();
})();

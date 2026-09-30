(() => {
  const key = 'dik105-lab-notebook-v1';
  let state = {};
  let storageWorks = true;
  const valid = value => value && typeof value === 'object' && !Array.isArray(value);
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    if (valid(parsed)) state = parsed;
  } catch { storageWorks = false; }
  const panels = [...document.querySelectorAll('[data-mission]')];
  function entry(id) {
    if (!valid(state[id])) state[id] = {};
    const item = state[id];
    item.checks = Array.from({length:3}, (_, i) => item.checks?.[i] === true);
    item.note = typeof item.note === 'string' ? item.note.slice(0,3000) : '';
    return item;
  }
  function storageMessage() {
    panels.forEach(panel => {
      panel.querySelector('.mission-storage').textContent = storageWorks
        ? 'Saved only in this browser. Nothing is sent anywhere.'
        : 'Browser saving is unavailable. Your work stays for this visit only.';
    });
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); storageWorks = true; }
    catch { storageWorks = false; }
    storageMessage();
  }
  function render(panel) {
    const id = panel.dataset.mission;
    const item = entry(id);
    const count = item.checks.filter(Boolean).length;
    panel.querySelectorAll('[data-check]').forEach((input, i) => {
      input.checked = item.checks[i];
      input.closest('label').classList.toggle('is-done', item.checks[i]);
    });
    panel.querySelector('progress').value = count;
    panel.querySelector('.mission-count').textContent = `${count} / 3 milestones`;
    panel.querySelector('.mission-state').textContent = count === 3 ? 'Experiment logged' : count ? 'Experiment in progress' : 'Ready when you are';
    panel.classList.toggle('mission-complete', count === 3);
    const stamp = document.querySelector(`[data-mission-status="${id}"]`);
    if (stamp) stamp.textContent = count === 3 ? '✓ Experiment logged' : `${count} / 3 milestones`;
  }
  panels.forEach(panel => {
    const id = panel.dataset.mission;
    const item = entry(id);
    const note = panel.querySelector('textarea');
    note.value = item.note;
    panel.querySelectorAll('input, textarea, button').forEach(control => {control.disabled = false;});
    panel.querySelectorAll('[data-check]').forEach((input, i) => {
      input.addEventListener('change', () => {entry(id).checks[i] = input.checked; save(); render(panel);});
    });
    note.addEventListener('input', () => {entry(id).note = note.value.slice(0,3000); save();});
    const reset = panel.querySelector('.mission-reset');
    panel.querySelector('[data-reset]').addEventListener('click', () => {
      reset.hidden = false; panel.querySelector('[data-cancel-reset]').focus();
    });
    panel.querySelector('[data-cancel-reset]').addEventListener('click', () => {
      reset.hidden = true; panel.querySelector('[data-reset]').focus();
    });
    panel.querySelector('[data-confirm-reset]').addEventListener('click', () => {
      state[id] = {checks:[false,false,false],note:''}; note.value = ''; save(); render(panel);
      reset.hidden = true; panel.querySelector('[data-reset]').focus();
      panel.querySelector('.mission-feedback').textContent = 'This experiment’s personal log was cleared.';
    });
    render(panel);
  });
  // Check write access too: some browsers permit reads while blocking writes.
  save();
})();

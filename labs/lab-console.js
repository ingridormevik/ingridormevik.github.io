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
        ? 'Saved only in this browser. Nothing is sent anywhere. Download a copy before changing devices or clearing browser data.'
        : 'Browser saving is unavailable. Your work stays for this visit; download your log before leaving.';
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
  function download(panel) {
    const lines = ['DIKULT105 — My lab notebook', '', 'Personal notes, not proof of submission. Follow the current MittUiB task.', ''];
    panels.forEach(current => {
      const item = entry(current.dataset.mission);
      lines.push(current.closest('.lab').querySelector('.lab-title h2').textContent);
      current.querySelectorAll('.mission-check').forEach((label, i) => {
        lines.push(`${item.checks[i] ? '[x]' : '[ ]'} ${label.querySelector('span').textContent}`);
      });
      lines.push('My notes:', item.note || '(No note yet.)', '');
    });
    try {
      const url = URL.createObjectURL(new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url; link.download = 'my-dik105-lab-notebook.txt';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      panel.querySelector('.mission-feedback').textContent = 'Your notebook download has started.';
    } catch {
      panel.querySelector('.mission-feedback').textContent = 'The download could not start. Copy your notes before leaving this page.';
    }
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
    panel.querySelector('[data-export]').addEventListener('click', () => download(panel));
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

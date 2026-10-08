(() => {
  const root = document.querySelector('.repair-console');
  if (!root) return;
  const key = 'dik105-repair-mission-v1';
  const stages = [...root.querySelectorAll('[data-repair-stage]')];
  const fields = [...root.querySelectorAll('textarea')];
  const checks = [...root.querySelectorAll('[data-repair-check]')];
  const status = root.querySelector('[data-repair-status]');
  const done = document.querySelector('[data-l78-done="3"]');
  let state = {}; try { state = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  let step = Number.isInteger(state.step) ? Math.max(0, Math.min(3, state.step)) : 0;
  fields.forEach((field, i) => { field.value = typeof state.values?.[i] === 'string' ? state.values[i] : ''; });
  checks.forEach((check, i) => { check.checked = state.checks?.[i] === true; });
  const ready = () => fields.every(f => f.value.trim().length >= 8) && checks.every(c => c.checked);
  function save() { try { localStorage.setItem(key, JSON.stringify({step, values: fields.map(f => f.value), checks: checks.map(c => c.checked)})); } catch (_) {} }
  function show() {
    stages.forEach((panel, i) => { panel.hidden = i !== step; });
    root.querySelectorAll('.repair-track li').forEach((item, i) => { item.classList.toggle('is-current', i === step); item.classList.toggle('is-finished', i < step); });
    root.querySelector('[data-repair-back]').disabled = step === 0;
    done.disabled = !ready();
    status.textContent = ready() ? 'Repair verified. Your next mission is ready.' : `Checkpoint ${step + 1} / 4 · Your work is saved on this browser.`;
    save();
  }
  root.querySelectorAll('[data-repair-next]').forEach(button => button.addEventListener('click', () => {
    if (fields[step].value.trim().length < 8) { status.textContent = 'Write a specific observation before continuing.'; fields[step].focus(); return; }
    step++; show(); window.labAudio?.play?.('unlock');
    const heading = stages[step].querySelector('h6'); heading.tabIndex = -1; heading.focus({preventScroll:true});
  }));
  root.querySelector('[data-repair-back]').addEventListener('click', () => { step = Math.max(0, step - 1); show(); });
  fields.forEach(field => field.addEventListener('input', () => { save(); done.disabled = !ready(); }));
  checks.forEach(check => check.addEventListener('change', show));
  root.querySelector('[data-repair-log]').addEventListener('click', () => {
    if (!ready()) { status.textContent = 'Complete all three final checks first.'; return; }
    const note = document.querySelector('[data-mission="2"] textarea');
    const log = `Repair mission\nGoal: ${fields[0].value.trim()}\nObserved: ${fields[1].value.trim()}\nChanged: ${fields[2].value.trim()}\nVerified: repeat clicks, phone layout and saved version.`;
    if (note && !note.value.includes(log)) { note.value = `${note.value.trim()}\n\n${log}`.trim(); note.dispatchEvent(new Event('input', {bubbles:true})); }
    status.textContent = note ? 'Repair log saved to your project note. Mission cleared!' : 'Mission cleared. Keep your saved repair notes here.';
    root.classList.add('is-verified'); window.labAudio?.play?.('complete');
  });
  show();
})();

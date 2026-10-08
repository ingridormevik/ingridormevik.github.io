(() => {
  const root = document.getElementById('ai-coding');
  if (!root?.querySelector('[data-vibe-project]')) return;
  const key = 'dik105-vibecoding-project-v1';
  let state = {}; try { state = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  const inputs = [...root.querySelectorAll('[data-vibe-project], [data-vibe-review], [data-f]')];
  const fieldKey = input => input.dataset.vibeProject || input.dataset.vibeReview || `prompt-${input.dataset.f}`;
  const entryStatus = root.querySelector('[data-vibe-import-status]');
  const reviewStatus = root.querySelector('[data-vibe-review-status]');
  const ownCode = root.querySelector('[data-vibe-code]');
  ownCode.value = typeof state.code === 'string' ? state.code : '';
  inputs.forEach(input => {
    if (typeof state[fieldKey(input)] === 'string') input.value = state[fieldKey(input)];
    input.dispatchEvent(new Event('input', {bubbles:true}));
  });
  function save() {
    inputs.forEach(input => { state[fieldKey(input)] = input.value; }); state.code = ownCode.value;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {}
  }
  const read = k => root.querySelector(`[data-vibe-project="${k}"]`).value.trim();
  function update() {
    root.querySelector('#vibe-project [data-guide-next]').disabled = read('project').length < 3 || read('goal').length < 5;
    root.querySelector('#vibe-forge [data-guide-next]').disabled = ![...root.querySelectorAll('[data-f]')].every(f=>f.value.trim().length > 2);
    const complete = [...root.querySelectorAll('[data-vibe-review]')].every(f=>f.value.trim().length > 5);
    root.querySelector('#vibe-verify [data-guide-next]').disabled = !complete;
    save();
  }
  inputs.forEach(input => input.addEventListener('input', update));
  root.querySelector('[data-vibe-use-goal]').addEventListener('click', () => {
    const who = root.querySelector('[data-f="who"]');
    const what = root.querySelector('[data-f="what"]');
    who.value = 'clicks the button in my project';
    what.value = read('goal');
    [who, what].forEach(input=>input.dispatchEvent(new Event('input', {bubbles:true})));
    root.querySelector('[data-f="why"]').focus();
  });
  root.querySelector('[data-vibe-import]').addEventListener('click', () => {
    let work = {}; try { work = JSON.parse(localStorage.getItem('dik105-javascript-journey-v1') || '{}') || {}; } catch (_) {}
    if (!work.values?.project && !work.code) { entryStatus.textContent = 'No saved JavaScript mission found. Enter your own project and one small change above.'; return; }
    root.querySelector('[data-vibe-project="project"]').value = work.values?.project || '';
    root.querySelector('[data-vibe-project="goal"]').value = 'Change the button label to match the perspective showing.';
    ownCode.value = typeof work.code === 'string' ? work.code : '';
    entryStatus.textContent = 'Your JavaScript work is here. Change the suggested goal if you want a different next step.';
    update();
  });
  root.querySelector('[data-vibe-copy-code]').addEventListener('click', async () => {
    if (!ownCode.value.trim()) { entryStatus.textContent = 'Import your tested code first, or select it in your own project.'; return; }
    try { await navigator.clipboard.writeText(ownCode.value); entryStatus.textContent = 'Code copied. Share only this relevant part with your AI tool.'; }
    catch (_) { ownCode.focus(); ownCode.select(); entryStatus.textContent = 'Code selected. Copy with Ctrl+C or Cmd+C.'; }
  });
  root.querySelector('[data-vibe-save-review]').addEventListener('click', () => {
    const fields = [...root.querySelectorAll('[data-vibe-review]')];
    if (fields.some(f=>f.value.trim().length < 6)) { reviewStatus.textContent = 'Record the suggestion, your decision and the actual test results first.'; return; }
    const note = document.getElementById('vibe-project-note');
    const log = `AI-assisted coding: ${read('project')}\nMy goal: ${read('goal')}\nSuggested: ${fields[0].value.trim()}\nMy decisions: ${fields[1].value.trim()}\nMy tests: ${fields[2].value.trim()}`;
    if (!note.value.includes(log)) { note.value = `${note.value.trim()}\n\n${log}`.trim(); note.dispatchEvent(new Event('input', {bubbles:true})); }
    reviewStatus.textContent = 'Experiment recorded. Your decisions and tests are in your Lab 2 project note.';
    window.labAudio?.play?.('complete'); update();
  });
  update();
})();

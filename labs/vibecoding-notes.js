(() => {
  const note = document.getElementById('vibe-project-note');
  if (!note) return;
  const key = 'dik105-lab-notebook-v1';
  const status = document.querySelector('[data-vibe-note-status]');
  let state = {};
  function read() {
    try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch (_) { return {}; }
  }
  state = read(); note.value = typeof state['2']?.note === 'string' ? state['2'].note : '';
  note.addEventListener('input', () => {
    state = read();
    if (!state['2'] || typeof state['2'] !== 'object') state['2'] = {checks:[false,false,false]};
    state['2'].note = note.value.slice(0,3000);
    try { localStorage.setItem(key, JSON.stringify(state)); status.textContent = 'Saved to your Lab 2 note in this browser.'; }
    catch (_) { status.textContent = 'Saving is unavailable. Copy your note before leaving.'; }
  });
})();

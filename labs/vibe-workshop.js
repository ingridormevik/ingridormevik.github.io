(() => {
  const root = document.querySelector('.vw');
  if (!root) return;
  const checks = [...root.querySelectorAll('[data-vw-done]')];
  const output = root.querySelector('[data-vw-progress]');
  const update = () => { output.textContent = `${checks.filter(x => x.checked).length} / 3 builds checked`; };
  checks.forEach(x => x.addEventListener('change', update));
  root.querySelector('[data-vw-copy]').addEventListener('click', async () => {
    const input = root.querySelector('#vw-idea');
    const status = root.querySelector('[data-vw-status]');
    if (!input.value.trim()) { status.textContent = 'Write your idea first, then copy it to your AI chat.'; input.focus(); return; }
    try { await navigator.clipboard.writeText(input.value.trim()); status.textContent = 'Copied. Paste it into your AI chat in VS Code.'; }
    catch { input.focus(); input.select(); status.textContent = 'Select and copy your request, then paste it into your AI chat.'; }
  });
})();

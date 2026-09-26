document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = document.getElementById(button.dataset.copy + '-status');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Copied. Paste into the file or editor named above.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Code selected. Press Ctrl+C (Windows) or Cmd+C (Mac) to copy.';
    }
  });
});

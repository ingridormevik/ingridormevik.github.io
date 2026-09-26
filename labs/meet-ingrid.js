(() => {
  const button = document.getElementById('fullscreen');
  const status = document.getElementById('fullscreen-status');
  if (!document.documentElement.requestFullscreen) {
    button.hidden = true;
    return;
  }
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      status.textContent = '';
    } catch {
      status.textContent = 'Fullscreen is unavailable here. You can still use the introduction in this tab.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    button.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Go fullscreen';
  });
})();

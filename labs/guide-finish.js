(() => {
  document.querySelectorAll('[data-guide-finish]').forEach(button => button.addEventListener('click', () => {
    const target=button.dataset.finishTarget;
    if(window.labVictory)window.labVictory(2,{practice:button.dataset.guideFinish,target,opener:button});
    else if(target)location.hash=target;
  }));
})();

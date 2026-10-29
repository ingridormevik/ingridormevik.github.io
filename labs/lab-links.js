// Run after each page's room/filter controllers have revealed the destination.
(() => {
  // Keep the Final Assignment round trip within the student's library room.
  const params = new URLSearchParams(location.search);
  if (location.pathname.endsWith('/final-assessment.html') && params.get('from') === 'library') {
    const room = params.get('room');
    if (['ls-make','ls-notice','ls-find','ls-connect'].includes(room)) {
      const link = document.querySelector('.studio-header nav a[href^="academic-library.html"]');
      if (link) { link.href = 'academic-library.html#'+room; link.textContent = 'Back to library session'; }
    }
  }
  let pending = 0;
  function land() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!id) return;
    let target = document.getElementById(id);
    if (!target && ['cards','tape','bug','sound','pointer','web'].includes(id)) {
      target = document.getElementById('hr-console');
    }
    if (!target) return;
    if (target.closest('.al-book')?.hidden) document.getElementById('al-reset')?.click();
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    // Never expose arbitrary hidden content, such as quiz answers.
    if (target.closest('[hidden]')) return;
    target.scrollIntoView({block:'start', behavior:'instant'});
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
  }
  function queue() {
    const ticket = ++pending;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (ticket === pending) land(); }));
  }
  addEventListener('hashchange', queue);
  addEventListener('load', queue);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    // Clicking the current fragment does not emit hashchange, but a tab/filter may have changed.
    if (url.hash === location.hash) dispatchEvent(new Event('hashchange'));
    queue();
  });
  queue();
})();

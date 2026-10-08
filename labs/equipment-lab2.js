/* Isolated practice instruments; course progress is never changed. */
(() => {
  'use strict';
  const room = document.querySelector('.eq-room');
  if (!room) return;
  const one = selector => room.querySelector(selector);
  const all = selector => [...room.querySelectorAll(selector)];
  const completed = new Set();
  const sound = cue => window.labAudio?.play?.(cue);
  function calibrate(index) {
    if (completed.has(index)) return;
    completed.add(index);
    one(`[data-eq-badge="${index}"]`).textContent = 'CALIBRATED';
    one(`[data-eq-select="${index}"]`).classList.add('is-calibrated');
    one('[data-eq-progress]').textContent = `${completed.size} / 6 calibrated`;
    one('[data-eq-power]').value = completed.size;
    const lessons=['Your HTML button now has a JavaScript response.', 'Your CSS selector can find an element for JavaScript too.', 'A state value lets the second click undo the first.', 'A queued action can be cancelled before it runs.', 'Matching the selector to the HTML fixed the error.', 'Responsive width keeps the story inside its screen.'];
    one('[data-eq-feedback]').textContent = completed.size === 6
      ? 'All six instruments online. Choose one technique and try it in your own Lab 2 page.'
      : `${lessons[index]} Try the change in your own Lab 1 page, or open the next machine.`;
    sound(completed.size === 6 ? 'unlock' : 'complete');
  }
  function select(index, focus = false) {
    all('[data-eq-station]').forEach(node => { node.hidden = Number(node.dataset.eqStation) !== index; });
    all('[data-eq-select]').forEach(node => node.setAttribute('aria-pressed', String(Number(node.dataset.eqSelect) === index)));
    if (focus) {
      const title = one(`#eq-title-${index}`);
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
      one(`#eq-station-${index}`).scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }
  all('[data-eq-select]').forEach(node => node.addEventListener('click', () => select(Number(node.dataset.eqSelect), true)));
  all('[data-eq-next]').forEach(node => node.addEventListener('click', () => select(Number(node.dataset.eqNext), true)));
  select(0);

  let clicks = 0;
  one('[data-eq-click]').addEventListener('click', () => {
    one('[data-eq-click-out]').textContent = `Signals received / ${++clicks}`;
    if (clicks >= 3) calibrate(0);
    else sound('transmit');
  });
  const scans = new Set();
  all('[data-eq-scan]').forEach(button => button.addEventListener('click', () => {
    const selector = button.dataset.eqScan;
    all('.eq-found').forEach(node => node.classList.remove('eq-found'));
    const match = one(selector);
    if (match) match.classList.add('eq-found');
    one('[data-eq-scan-code]').textContent = `document.querySelector("${selector}");`;
    one('[data-eq-scan-out]').textContent = match ? `Found <${match.tagName.toLowerCase()}>. This is the element your code can change.` : 'null: no element matches this selector. Check the HTML before changing it.';
    scans.add(selector);
    if (scans.size === 3) calibrate(1);
    else sound('star');
  }));
  let showingFuture = false, switches = 0;
  one('[data-eq-state]').addEventListener('click', () => {
    showingFuture = !showingFuture;
    one('[data-eq-state-story]').textContent = showingFuture ? 'In 2040, this stop shares stories left by strangers.' : 'The bus stop is quiet.';
    one('[data-eq-state-scene]').classList.toggle('is-future', showingFuture);
    one('[data-eq-state]').textContent = showingFuture ? 'Return to now ←' : 'See the future →';
    one('[data-eq-state]').setAttribute('aria-pressed', String(showingFuture));
    one('[data-eq-state-out]').textContent = `showingFuture = ${showingFuture}`;
    if (++switches >= 2) calibrate(2);
    else sound('transmit');
  });
  let timer = null, delivered = false, cancelled = false;
  function timerReady(message) {
    timer = null;
    room.classList.remove('is-timing');
    one('[data-eq-timer]').disabled = false;
    one('[data-eq-cancel]').disabled = true;
    one('[data-eq-timer-out]').textContent = message;
  }
  one('[data-eq-timer]').addEventListener('click', () => {
    if (timer !== null) return;
    room.classList.add('is-timing');
    one('[data-eq-timer]').disabled = true;
    one('[data-eq-cancel]').disabled = false;
    one('[data-eq-timer-out]').textContent = 'Signal queued. Two seconds until arrival…';
    timer = setTimeout(() => {
      delivered = true;
      timerReady('Signal arrived. Now send another and cancel it.');
      if (cancelled) calibrate(3);
      else sound('transmit');
    }, 2000);
  });
  one('[data-eq-cancel]').addEventListener('click', () => {
    if (timer === null) return;
    clearTimeout(timer);
    cancelled = true;
    timerReady('Signal cancelled. clearTimeout stopped this queued action.');
    if (delivered) calibrate(3);
  });
  const stopTimer = () => {
    if (timer !== null) { clearTimeout(timer); timerReady('Relay paused. Send a new signal when you return.'); }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTimer(); });
  window.addEventListener('pagehide', stopTimer);

  let encounteredError = false;
  const debugSelect = one('[data-eq-debug-select]');
  const debugCode = () => { one('[data-eq-debug-code]').textContent = `document.querySelector("${debugSelect.value}").textContent = "Signal received";`; };
  debugSelect.addEventListener('change', debugCode);
  one('[data-eq-debug]').addEventListener('click', () => {
    debugCode();
    try {
      one(debugSelect.value).textContent = 'Signal received';
      one('[data-eq-debug-out]').textContent = 'Working. # selects an id; your line can now change this paragraph.';
      if (encounteredError) calibrate(4);
      else sound('star');
    } catch (error) {
      encounteredError = true;
      one('[data-eq-debug-out]').textContent = 'TypeError: the selector returned null. This paragraph has an id. Replace the dot with # and run again.';
    }
  });

  const widths = new Set();
  let sawOverflow = false;
  function testWidth(interacted = true) {
    const width = Number(one('[data-eq-width]').value);
    const fixed = one('[data-eq-fixed]').checked;
    one('[data-eq-width-out]').textContent = `${width}px`;
    one('[data-eq-viewport]').style.width = `${width}px`;
    one('[data-eq-sample]').style.width = fixed ? '640px' : '100%';
    one('[data-eq-width-code]').textContent = fixed ? 'width: 640px; /* breaks narrow screens */' : 'width: 100%;\nmax-width: 720px;';
    const overflow = fixed && width < 640;
    one('[data-eq-width-status]').textContent = overflow
      ? `Overflow: 640px of content will not fit a ${width}px screen. Switch off the fixed-width mistake.`
      : `Fits at ${width}px. This tests the sample; test your own page on a phone too.`;
    if (!interacted) return;
    if (width <= 400) widths.add('phone');
    if (width >= 900) widths.add('laptop');
    if (overflow) sawOverflow = true;
    if (!fixed && sawOverflow && widths.size === 2) calibrate(5);
  }
  one('[data-eq-width]').addEventListener('input', () => testWidth());
  one('[data-eq-fixed]').addEventListener('change', () => testWidth());
  testWidth(false);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => room.classList.toggle('eq-visible', entries[0].isIntersecting));
    observer.observe(room);
  } else room.classList.add('eq-visible');
})();

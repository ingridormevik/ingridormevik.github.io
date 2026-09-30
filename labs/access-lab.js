(() => {
  // "Build the ramp": four barriers; each repair builds one ramp segment.
  const lab = document.querySelector('.access-lab');
  if (!lab) return;
  const ORDER = ['readable', 'reachable', 'calm', 'described'];
  const done = new Set();
  const meter = lab.querySelector('[data-ramp-meter]');
  const hero = lab.querySelector('.ramp-hero');
  const status = key => lab.querySelector(`[data-status="${key}"]`);
  lab.querySelectorAll('button[disabled]').forEach(b => { b.disabled = false; });

  function build(key) {
    if (done.has(key)) return;
    done.add(key);
    lab.querySelector(`.ramp-lights [data-goal="${key}"]`).classList.add('is-on');
    lab.querySelector(`.ramp-seg[data-seg="${ORDER.indexOf(key) + 1}"]`).classList.add('is-built');
    lab.querySelector(`[data-station="${key}"]`).classList.add('is-fixed');
    meter.textContent = done.size === 4 ? 'RAMP 4 / 4 · EVERYONE IS IN' : `RAMP ${done.size} / 4 · a new piece of the ramp is built`;
    if (done.size === 4) {
      hero.classList.add('is-complete');
      const finale = lab.querySelector('[data-finale]');
      finale.hidden = false;
    }
  }

  // 01 Readable: darken the text until the notice passes 4.5 : 1.
  const notice = lab.querySelector('[data-notice]');
  const dark = lab.querySelector('[data-dark]');
  const read = lab.querySelector('[data-contrast-read]');
  const BG = [201, 206, 211];
  const lum = rgb => rgb.map(c => c / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
  function readable() {
    const d = Number(dark.value) / 100;
    const grey = Math.round(170 - d * 150);
    const text = [grey, grey + 6, grey + 12].map(v => Math.max(0, Math.min(255, v)));
    notice.style.color = `rgb(${text.join(',')})`;
    const r = ratio(text, BG);
    const pass = r >= 4.5;
    read.textContent = `Contrast: ${r.toFixed(1)} : 1 · ${r >= 7 ? 'excellent' : pass ? 'readable' : 'too faint for many people'}`;
    read.dataset.level = pass ? 'pass' : 'fail';
    status('readable').textContent = pass
      ? 'Readable. The same words, and now far more people can read them. That is the whole repair.'
      : 'Drag the slider to darken the text. The notice needs at least 4.5 : 1.';
    if (pass) build('readable');
  }
  dark.addEventListener('input', readable);
  const sun = lab.querySelector('[data-sun]');
  sun.addEventListener('click', () => {
    const on = sun.getAttribute('aria-pressed') !== 'true';
    sun.setAttribute('aria-pressed', String(on));
    notice.classList.toggle('in-sun', on);
    sun.textContent = on ? 'Back indoors' : 'Simulate bright sunlight';
  });
  readable();

  // 02 Reachable: a fake div door and a real button door.
  let keyboard = false;
  document.addEventListener('keydown', e => { if (e.key === 'Tab') keyboard = true; });
  document.addEventListener('pointerdown', () => { keyboard = false; });
  const doors = lab.querySelector('.doors');
  const wireFake = fake => fake.addEventListener('click', () => {
    fake.classList.add('is-open');
    status('reachable').textContent = 'Door A opened, but only because you used a pointer. Try reaching it with Tab: you cannot. It is a div pretending to be a button.';
  });
  wireFake(lab.querySelector('[data-fake-door]'));
  function wireReal(button, name) {
    button.addEventListener('click', e => {
      button.classList.add('is-open');
      if (e.detail === 0 || keyboard) {
        status('reachable').textContent = `You opened ${name} without a mouse. A real button works for everyone, for free.`;
        build('reachable');
      } else if (matchMedia('(hover: none)').matches) {
        status('reachable').textContent = `${name} opened with a tap. Door A only works with a pointer: tap Repair door A to fix it for keyboard and screen-reader users.`;
      } else {
        status('reachable').textContent = `${name} opened with a pointer. Now try it with the keyboard: Tab until it has a ring, then Enter.`;
      }
    });
  }
  wireReal(lab.querySelector('[data-real-door]'), 'Door B');
  const repair = lab.querySelector('[data-repair]');
  repair.addEventListener('click', () => {
    const fake = doors.querySelector('[data-fake-door]');
    if (!fake) return;
    const real = document.createElement('button');
    real.type = 'button';
    real.className = 'door-card real repaired';
    real.innerHTML = '<span class="door-icon" aria-hidden="true"></span>Door A';
    fake.replaceWith(real);
    wireReal(real, 'Door A');
    repair.disabled = true;
    repair.textContent = 'Door A repaired';
    status('reachable').textContent = 'Repaired: door A is now a real <button>. Press Tab and it gets a ring and opens with Enter.';
    if (matchMedia('(hover: none)').matches) build('reachable');
    real.focus();
  });
  status('reachable').textContent = matchMedia('(hover: none)').matches
    ? 'No keyboard on this device? Tap Repair door A to see what changes.'
    : 'Waiting for a door to open with the keyboard.';

  // 03 Calm: a stage that moves until someone pauses it.
  const stage = lab.querySelector('[data-stage]');
  const pause = lab.querySelector('[data-pause]');
  const osCalm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('access-no-motion');
  if (osCalm) {
    stage.classList.add('is-paused');
    status('calm').textContent = 'Your device already asks for less motion, so this stage is still. Respecting that setting is the repair. Press the button to confirm.';
  } else {
    status('calm').textContent = 'Everything is moving. Find a way to make it stop.';
  }
  pause.addEventListener('click', () => {
    const paused = pause.getAttribute('aria-pressed') !== 'true';
    pause.setAttribute('aria-pressed', String(paused));
    stage.classList.toggle('is-paused', paused || osCalm);
    pause.textContent = paused ? 'Play the movement' : 'Pause the movement';
    if (paused) {
      status('calm').textContent = 'Still. A pause control is a promise: you decide what moves on your screen.';
      build('calm');
    }
  });

  // 04 Described: alt text that carries the poster's message.
  const poster = lab.querySelector('[data-poster]');
  const alt = lab.querySelector('[data-alt]');
  const says = lab.querySelector('[data-sr-says]');
  function described() {
    const text = alt.value.trim();
    if (text) poster.setAttribute('alt', text); else poster.removeAttribute('alt');
    says.textContent = text ? `“image, ${text}”` : '“image, ramp-poster.svg”';
    const lower = text.toLowerCase();
    const hasMessage = /room\s*2|room two/.test(lower);
    if (!text) status('described').textContent = 'Right now a screen reader can only read the file name. Write what the poster says.';
    else if (/^(image|picture|photo) of/.test(lower)) status('described').textContent = 'Skip “image of”: the screen reader already says it is an image. Go straight to what matters.';
    else if (!hasMessage) status('described').textContent = 'A screen reader user still does not know where to go. What is the one fact on the poster?';
    else {
      status('described').textContent = 'Described. The message now reaches people who cannot see the picture.';
      build('described');
    }
  }
  alt.addEventListener('input', described);
  const speak = lab.querySelector('[data-speak]');
  if (!('speechSynthesis' in window)) { speak.hidden = true; }
  // Always read in English, even when the device's default voice is Norwegian.
  const englishVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^en-GB/i.test(v.lang)) || voices.find(v => /^en-US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  speak.addEventListener('click', () => {
    const text = alt.value.trim() ? `image, ${alt.value.trim()}` : 'image, ramp poster dot s v g';
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = englishVoice();
      utterance.lang = voice ? voice.lang : 'en-GB';
      if (voice) utterance.voice = voice;
      speechSynthesis.speak(utterance);
    } catch {}
  });
  described();

  // Your own project: copy the sentence.
  const note = lab.querySelector('[data-note]');
  const noteStatus = lab.querySelector('[data-note-status]');
  lab.querySelector('[data-note-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(note.value); noteStatus.textContent = 'Copied. Paste it into your process notes.'; }
    catch { note.select(); noteStatus.textContent = 'Selected. Press Ctrl + C (Mac: Cmd + C) to copy.'; }
  });
})();

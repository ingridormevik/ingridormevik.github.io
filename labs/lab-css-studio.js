(() => {
  const studio = document.querySelector('.css-studio');
  if (!studio) return;
  studio.classList.add('is-live');

  // 02 / Rule anatomy: one explanation at a time, driven by the clicked part.
  const explain = studio.querySelector('[data-part-explain]');
  const parts = [...studio.querySelectorAll('[data-part]')];
  const copy = {
    selector: '<strong>Selector: <code>body</code></strong> chooses <em>which</em> HTML to style. <code>body</code> means the whole visible page. <code>h1</code> would mean only your heading, <code>p</code> every paragraph.',
    braces: '<strong>Braces: <code>{ }</code></strong> open and close the rule. Everything between them applies to the selector in front. Every <code>{</code> needs its <code>}</code>.',
    property: '<strong>Property: <code>background</code></strong> is <em>what</em> you change. Here it is the colour behind everything. Its partner <code>color</code> changes the text.',
    value: '<strong>Value: <code>#f3f0e8</code></strong> is <em>how</em> it changes. A warm off-white, like paper. Swap it for any hex code and the whole page changes mood.',
    semicolon: '<strong>Semicolon: <code>;</code></strong> ends one instruction so the next can begin. Forget it and CSS often ignores the line after, without any error message.'
  };
  parts.forEach(part => part.addEventListener('click', () => {
    parts.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.part === part.dataset.part)));
    explain.innerHTML = `<p>${copy[part.dataset.part]}</p>`;
  }));

  // 04 / Colour studio.
  const hexPattern = /^#?[0-9a-f]{6}$/i;
  const clean = value => '#' + value.replace('#', '').toLowerCase();
  const preview = studio.querySelector('[data-preview]');
  const output = studio.querySelector('[data-css-output]');
  const meter = studio.querySelector('[data-contrast]');
  const bar = studio.querySelector('[data-contrast-bar]');
  const colours = {bg: '#f3f0e8', text: '#18242d'};

  function luminance(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function ratio(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  function render() {
    preview.style.setProperty('--pv-bg', colours.bg);
    preview.style.setProperty('--pv-text', colours.text);
    ['bg', 'text'].forEach(key => {
      studio.querySelector(`[data-colour="${key}"]`).value = colours[key];
      const hex = studio.querySelector(`[data-hex-for="${key}"]`);
      if (document.activeElement !== hex) hex.value = colours[key].toUpperCase();
    });
    output.textContent = `  color: ${colours.text};\n  background: ${colours.bg};`;
    const r = ratio(colours.bg, colours.text);
    const verdict = r >= 7 ? 'Very readable' : r >= 4.5 ? 'Readable' : r >= 3 ? 'Only for large headings' : 'Too faint to read';
    meter.textContent = `${r.toFixed(1)} : 1 · ${verdict}`;
    meter.dataset.level = r >= 4.5 ? 'pass' : r >= 3 ? 'large' : 'fail';
    bar.style.width = `${Math.min(100, (r / 21) * 100)}%`;
  }
  function set(key, value) {
    if (!hexPattern.test(value)) return;
    colours[key] = clean(value);
    render();
  }
  studio.querySelectorAll('[data-colour]').forEach(input =>
    input.addEventListener('input', () => set(input.dataset.colour, input.value)));
  studio.querySelectorAll('[data-hex-for]').forEach(input => {
    input.addEventListener('input', () => set(input.dataset.hexFor, input.value.trim()));
    input.addEventListener('blur', () => { input.value = colours[input.dataset.hexFor].toUpperCase(); });
  });

  // "My pass colour" borrows the colour chosen on the Lab 1 arrival pass.
  function passColour() {
    const panel = document.querySelector('[data-checkin="1"]');
    const live = panel && getComputedStyle(panel).getPropertyValue('--pass-colour').trim();
    return hexPattern.test(live || '') ? clean(live) : '#ff7a59';
  }
  const passChip = studio.querySelector('.pass-chip');
  const paintPassChip = () => { if (passChip) passChip.style.background = passColour(); };
  paintPassChip();
  studio.querySelectorAll('[data-mood]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mood === 'pass') {
      const bg = passColour();
      colours.bg = bg;
      colours.text = luminance(bg) > 0.18 ? '#161616' : '#ffffff';
    } else {
      [colours.text, colours.bg] = button.dataset.mood.split(',');
    }
    render();
  }));
  document.addEventListener('lab-progress', paintPassChip);

  const copyButton = studio.querySelector('[data-copy-css]');
  const copyStatus = studio.querySelector('[data-copy-status]');
  copyButton.disabled = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      copyStatus.textContent = 'Copied. Paste it inside body { } in style.css, replacing the old color and background lines.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(output);
      const selection = getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      copyStatus.textContent = 'The code is selected. Press Ctrl + C (Mac: Cmd + C) to copy it.';
    }
  });

  // 06 / Say why: append to the Lab 1 experiment note, which saves itself on input.
  const why = studio.querySelector('[data-why]');
  const whyButton = studio.querySelector('[data-add-why]');
  const whyStatus = studio.querySelector('[data-why-status]');
  whyButton.disabled = false;
  whyButton.addEventListener('click', () => {
    const sentence = why.value.trim();
    if (!sentence || sentence.includes('______')) {
      whyStatus.textContent = 'Fill in the blanks first: your hex code, what it colours, and what it means.';
      why.focus();
      return;
    }
    const note = document.querySelector('#lab-1-workbench [data-mission] textarea');
    if (!note) { whyStatus.textContent = 'Copy your sentence into your experiment note below.'; return; }
    note.value = note.value.trim() ? `${note.value.trim()}\n${sentence}` : sentence;
    note.dispatchEvent(new Event('input', {bubbles: true}));
    whyStatus.textContent = 'Added to your experiment note below. Now tick off your milestones.';
  });

  render();
})();

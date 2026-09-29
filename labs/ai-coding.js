(() => {
  async function copyText(text, fallbackNode, status, done) {
    try { await navigator.clipboard.writeText(text); status.textContent = done; }
    catch {
      const range = document.createRange();
      range.selectNodeContents(fallbackNode);
      const selection = getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'The text is selected. Copy with Ctrl + C (Mac: Cmd + C).';
    }
  }

  // Step checkmarks, kept in this browser only.
  const boxes = [...document.querySelectorAll('[data-step]')];
  const key = 'dik105-ai-guide-progress-v1';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) boxes.forEach(b => { b.checked = saved.includes(b.dataset.step); });
  } catch {}
  function update() {
    const done = boxes.filter(b => b.checked);
    document.getElementById('progress').value = done.length;
    document.getElementById('progress-text').textContent = `${done.length} of ${boxes.length} steps`;
    boxes.forEach(b => b.closest('.step').classList.toggle('done', b.checked));
    document.getElementById('finish-status').textContent = done.length === boxes.length
      ? 'All eight steps are checked. You used AI and stayed the author.'
      : `You have checked ${done.length} of ${boxes.length} steps. Return to the steps where you need help.`;
    try { localStorage.setItem(key, JSON.stringify(done.map(b => b.dataset.step))); } catch {}
  }
  boxes.forEach(b => b.addEventListener('change', update));
  document.getElementById('reset-progress').addEventListener('click', () => { boxes.forEach(b => { b.checked = false; }); update(); });
  update();

  // 04 / Prompt builder: where + what + why + limits.
  const builder = document.querySelector('[data-prompt-builder]');
  if (builder) {
    const field = name => builder.querySelector(`[data-pb="${name}"]`);
    const limits = [...builder.querySelectorAll('[data-pb-limit]')];
    const output = builder.querySelector('[data-pb-output]');
    const copy = builder.querySelector('[data-pb-copy]');
    const status = builder.querySelector('[data-pb-status]');
    const tidy = text => text.trim().replace(/[.\s]+$/, '');
    function build() {
      const goal = tidy(field('goal').value);
      const why = tidy(field('why').value);
      const chosen = limits.filter(l => l.checked).map(l => l.dataset.pbLimit);
      let prompt = `In ${field('file').value}, ${goal || '…'}`;
      if (why) prompt += `, because ${why}`;
      prompt += '.';
      if (chosen.length) prompt += ' ' + chosen.join(' ');
      output.textContent = prompt;
      const have = {file: true, goal: !!goal, why: !!why, limits: chosen.length > 0};
      builder.querySelectorAll('[data-ingredient]').forEach(chip => chip.classList.toggle('is-on', have[chip.dataset.ingredient]));
      const missing = Object.keys(have).filter(k => !have[k]).map(k => ({goal: 'what', why: 'why', limits: 'limits'})[k]);
      status.textContent = missing.length ? `Still missing: ${missing.join(', ')}.` : 'All four ingredients are in. Copy it into the chat.';
    }
    builder.addEventListener('input', build);
    builder.addEventListener('change', build);
    copy.disabled = false;
    copy.addEventListener('click', () => copyText(output.textContent, output, status, 'Copied. Paste it into the chat in VS Code and press Enter.'));
    build();
  }

  // 05 / Spot what the AI decided without being asked.
  const spot = document.querySelector('[data-spot]');
  if (spot) {
    const lines = [...spot.querySelectorAll('[data-line]')];
    const check = spot.querySelector('[data-spot-check]');
    const reset = spot.querySelector('[data-spot-reset]');
    const result = spot.querySelector('[data-spot-result]');
    lines.forEach(line => line.addEventListener('click', () => {
      if (spot.classList.contains('is-checked')) return;
      line.setAttribute('aria-pressed', String(line.getAttribute('aria-pressed') !== 'true'));
    }));
    check.disabled = false; reset.disabled = false;
    check.addEventListener('click', () => {
      const extras = lines.filter(l => l.dataset.line === 'extra');
      const found = extras.filter(l => l.getAttribute('aria-pressed') === 'true').length;
      const wrong = lines.filter(l => l.dataset.line === 'ok' && l.getAttribute('aria-pressed') === 'true').length;
      spot.classList.add('is-checked');
      lines.forEach(l => l.closest('li').classList.toggle('is-extra', l.dataset.line === 'extra'));
      const notes = lines.filter(l => l.dataset.why).map(l => `<li><code>${l.textContent.trim()}</code> ${l.dataset.why}</li>`).join('');
      const verdict = found === extras.length && !wrong
        ? `You found all ${extras.length}. That is exactly the reading you should do on every answer.`
        : `You found ${found} of ${extras.length}${wrong ? `, and marked ${wrong} line${wrong === 1 ? '' : 's'} that ${wrong === 1 ? 'was' : 'were'} fine` : ''}. The marked lines below show the rest.`;
      result.innerHTML = `<p><strong>${verdict}</strong></p><ul>${notes}</ul>`;
    });
    reset.addEventListener('click', () => {
      spot.classList.remove('is-checked');
      lines.forEach(l => { l.setAttribute('aria-pressed', 'false'); l.closest('li').classList.remove('is-extra'); });
      result.textContent = '';
    });
  }

  // 08 / Process log: never stored, only downloaded or copied.
  const log = document.querySelector('[data-log]');
  if (log) {
    const status = log.querySelector('[data-log-status]');
    const text = () => ['DIKULT105 / AI process log', new Date().toLocaleDateString('en-GB'), '',
      ...[...log.querySelectorAll('[data-log-field]')].map(f => `${f.dataset.logField}:\n${f.value.trim() || '(empty)'}\n`)].join('\n');
    const download = log.querySelector('[data-log-download]');
    const copy = log.querySelector('[data-log-copy]');
    download.disabled = false; copy.disabled = false;
    download.addEventListener('click', () => {
      try {
        const url = URL.createObjectURL(new Blob([text()], {type: 'text/plain;charset=utf-8'}));
        const link = document.createElement('a');
        link.href = url; link.download = 'my-ai-process-log.txt';
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Download started. Keep the file with your project.';
      } catch { status.textContent = 'The download could not start. Use Copy my log instead.'; }
    });
    copy.addEventListener('click', () => {
      const holder = document.createElement('pre');
      holder.className = 'log-copy-holder'; holder.textContent = text();
      log.append(holder);
      copyText(holder.textContent, holder, status, 'Copied. Paste it into your experiment note or process log.').then(() => {
        if (!status.textContent.startsWith('The text is selected')) holder.remove();
      });
    });
  }
})();

(() => {
  const group = document.getElementById('group');
  const duration = document.getElementById('duration');
  document.querySelectorAll('[data-checkin]').forEach(panel => {
    const form = panel.querySelector('form');
    const name = form.querySelector('[name="student-name"]');
    const idea = form.querySelector('[name="experiment"]');
    const picker = form.querySelector('[name="pass-colour"]');
    const hexField = form.querySelector('[data-hex]');
    const privateThought = form.querySelector('[data-private-thought]');
    const swatches = [...form.querySelectorAll('[data-swatch]')];
    const result = panel.querySelector('.checkin-result');
    const card = panel.querySelector('.lab-pass');
    const feedback = panel.querySelector('.checkin-feedback');
    const lab = panel.closest('.lab');
    const hexPattern = /^#?[0-9a-f]{6}$/i;
    const cleanHex = value => '#' + value.replace('#','').toUpperCase();
    let colour = picker ? cleanHex(picker.value) : '#775699';
    let redaction = '';
    let snapshot;
    form.querySelector('button[type="submit"]').disabled = false;
    panel.querySelector('.checkin-hint').textContent = 'Complete the fields to create your on-screen lab note.';
    const savedKey = () => `dik105-pass-v1-${panel.dataset.checkin}-${group.value}`;
    const announce = () => document.dispatchEvent(new Event('lab-progress'));
    function setColour(value) {
      if (!hexPattern.test(value)) return;
      colour = cleanHex(value);
      panel.style.setProperty('--pass-colour', colour);
      if (picker) picker.value = colour.toLowerCase();
      if (hexField && document.activeElement !== hexField) hexField.value = colour;
      swatches.forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch.dataset.swatch.toUpperCase() === colour)));
    }
    swatches.forEach(swatch => swatch.addEventListener('click', () => setColour(swatch.dataset.swatch)));
    picker?.addEventListener('input', () => setColour(picker.value));
    hexField?.addEventListener('input', () => setColour(hexField.value.trim()));
    hexField?.addEventListener('blur', () => { hexField.value = colour; });
    form.querySelectorAll('[data-starter]').forEach(starter => starter.addEventListener('click', () => {
      const current = idea.value.trimEnd();
      idea.value = (current ? current + ' ' : '') + starter.dataset.starter;
      idea.setCustomValidity('');
      idea.focus();
      idea.setSelectionRange(idea.value.length, idea.value.length);
    }));
    function showPass(fresh) {
      card.querySelector('.pass-name').textContent = snapshot.name;
      card.querySelector('.pass-session').textContent = snapshot.session;
      card.querySelector('.pass-idea').textContent = snapshot.idea;
      const hex = card.querySelector('.pass-hex');
      if (hex) hex.textContent = snapshot.colour;
      // The private thought is only measured, never copied: the pass shows bars, not words.
      const redacted = card.querySelector('.pass-redacted');
      if (redacted) {
        redacted.hidden = !redaction;
        redacted.querySelector('.redaction').textContent = redaction;
      }
      panel.dataset.checkinReady = 'true';
      form.hidden = true; result.hidden = false;
      if (fresh) { card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new'); }
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(savedKey()) || 'null');
      if (saved && typeof saved.name === 'string' && saved.name.trim() && saved.name.length <= 100 && typeof saved.idea === 'string' && saved.idea.trim().length >= 10 && saved.idea.length <= 280) {
        name.value = saved.name; idea.value = saved.idea;
        if (typeof saved.colour === 'string') setColour(saved.colour);
        snapshot = {name:saved.name,idea:saved.idea,colour,session:lab.querySelector('.lab-title .eyebrow').textContent+' · '+lab.querySelector('.session-window').textContent};
        showPass(false);
      }
    } catch { /* The note remains available on this page without storage. */ }
    function invalidate() {
      snapshot = null; result.hidden = true; form.hidden = false;
      panel.dataset.checkinReady = 'false';
      try { sessionStorage.removeItem(savedKey()); } catch {}
      feedback.textContent = '';
      announce();
    }
    [group,duration].forEach(control => control.addEventListener('change', invalidate));
    form.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
      idea.setCustomValidity(idea.value.trim().length >= 10 ? '' : 'Add your observation and what you want to try.');
      if (!form.reportValidity()) return;
      snapshot = {name:name.value.trim(),idea:idea.value.trim(),colour,session:lab.querySelector('.lab-title .eyebrow').textContent+' · '+lab.querySelector('.session-window').textContent};
      const hidden = privateThought ? privateThought.value.trim().length : 0;
      redaction = hidden ? '█'.repeat(Math.min(36, Math.max(4, Math.ceil(hidden / 4)))) : '';
      showPass(true);
      try { sessionStorage.setItem(savedKey(),JSON.stringify({name:snapshot.name,idea:snapshot.idea,colour:snapshot.colour})); }
      catch { feedback.textContent='This browser cannot keep your note while you visit a guide. Copy it into your own notes before leaving this page.'; }
      announce(); card.focus();
    });
    [name,idea].forEach(input => input.addEventListener('input',()=>input.setCustomValidity('')));
    panel.querySelector('[data-edit-pass]').addEventListener('click',()=>{invalidate();idea.focus();});
  });
})();

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
    panel.querySelector('.checkin-hint').textContent = 'Complete the fields and create your pass to unlock the experiment. Download the card for your MittUiB submission.';
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
    } catch { /* A pass can still be downloaded without storage. */ }
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
      catch { feedback.textContent='This browser cannot keep your pass while you visit a guide. Download it now; you may need to check in again when returning.'; }
      announce(); card.focus();
    });
    [name,idea].forEach(input => input.addEventListener('input',()=>input.setCustomValidity('')));
    panel.querySelector('[data-edit-pass]').addEventListener('click',()=>{invalidate();idea.focus();});
    panel.querySelector('[data-download-pass]').addEventListener('click',()=>{
      if (!snapshot) return;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw Error('Canvas unavailable');
        const width = 1040, margin = 60;
        function lines(text,font) {
          ctx.font = font;
          const output=[]; const max=width-margin*2;
          for (const paragraph of text.split('\n')) {
            let line='';
            for (const word of paragraph.split(/(\s+)/)) {
              if (line && ctx.measureText(line+word).width>max) { output.push(line.trimEnd()); line=word.trimStart(); }
              else line+=word;
              // A single word wider than the card still breaks by character.
              while (ctx.measureText(line).width>max) {
                let cut=line.length-1;
                while (cut>1 && ctx.measureText(line.slice(0,cut)).width>max) cut--;
                output.push(line.slice(0,cut)); line=line.slice(cut);
              }
            }
            output.push(line);
          }
          return output;
        }
        const names=lines(snapshot.name,'bold 40px Arial');
        const sessions=lines(snapshot.session,'24px Arial');
        const ideas=lines(snapshot.idea,'30px Arial');
        canvas.width=width;canvas.height=270+names.length*52+sessions.length*36+ideas.length*44;
        const band = snapshot.colour || '#ffcf67';
        const rgb = [1,3,5].map(i => parseInt(band.slice(i,i+2),16));
        const bandInk = (rgb[0]*299+rgb[1]*587+rgb[2]*114)/1000 > 140 ? '#161616' : '#ffffff';
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,canvas.height);
        ctx.fillStyle=band;ctx.fillRect(0,0,width,80);
        ctx.fillStyle=bandInk;ctx.font='bold 26px Arial';ctx.fillText('DIKULT105 / LAB PASS',margin,51);
        ctx.textAlign='right';ctx.fillText(band,width-margin,51);ctx.textAlign='left';
        ctx.fillStyle='#192f3c';
        let y=135;
        function draw(items,font,step){ctx.font=font;for(const line of items){ctx.fillText(line,margin,y);y+=step;}}
        draw(names,'bold 40px Arial',52);y+=12;
        draw(sessions,'24px Arial',36);y+=25;
        draw(ideas,'30px Arial',44);y+=25;
        ctx.font='bold 22px Arial';ctx.fillText('TASK COMPLETED · READY TO SUBMIT',margin,y);y+=34;
        ctx.font='20px Arial';ctx.fillText('Submit this card in the MittUiB task identified by Ingrid.',margin,y);
        const link=document.createElement('a');
        link.href=canvas.toDataURL('image/png');link.download=`dik105-lab-${panel.dataset.checkin}-pass.png`;
        document.body.append(link);link.click();link.remove();
        feedback.textContent='Download started. Upload the PNG to MittUiB to finish your check-in.';
      } catch {feedback.textContent='Image download is unavailable. Take a screenshot of your card and submit that instead.';}
    });
  });
})();

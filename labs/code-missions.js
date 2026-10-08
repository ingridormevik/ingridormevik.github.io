(() => {
  // Code missions: the CSS Reactor (Lab 1) and the Signal Control Room (Lab 2).
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('access-no-motion');
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  // Shared: line numbers beside a code textarea.
  function gutter(mission) {
    const code = mission.querySelector('.ce-code');
    const numbers = mission.querySelector('[data-gutter]');
    const sync = () => {
      numbers.textContent = Array.from({length: code.value.split('\n').length}, (_, i) => i + 1).join('\n');
      numbers.scrollTop = code.scrollTop;
    };
    code.addEventListener('input', sync);
    code.addEventListener('scroll', () => { numbers.scrollTop = code.scrollTop; });
    sync();
    return code;
  }

  // Shared: mission lights, power meter and a small glyph pop when a light turns on.
  function lightsFor(mission) {
    const lamps = [...mission.querySelectorAll('.mission-lights li')];
    const bar = mission.querySelector('[data-power]');
    const label = mission.querySelector('[data-power-label]');
    const seen = new Set();
    return function set(goal, on) {
      const item = lamps.find(li => li.dataset.goal === goal);
      if (!item) return false;
      item.classList.toggle('is-on', on);
      const first = on && !seen.has(goal);
      if (first) {
        seen.add(goal);
        if (!reduced()) {
          ['</>', '{ }', '✓', '#', ';'].forEach((glyph, i) => {
            const bit = document.createElement('i');
            bit.className = 'pop'; bit.textContent = glyph; bit.style.setProperty('--a', `${i * 72}deg`);
            item.querySelector('.lamp').append(bit);
            setTimeout(() => bit.remove(), 900);
          });
        }
      }
      const count = lamps.filter(li => li.classList.contains('is-on')).length;
      const power = Math.round(count / lamps.length * 100);
      bar.style.width = `${power}%`;
      label.textContent = `POWER ${power}%`;
      mission.classList.toggle('is-full', count === lamps.length);
      return first;
    };
  }

  // Shared: copy a sentence into this lab's experiment note (which saves itself on input).
  function defendTo(mission, labId) {
    const text = mission.querySelector('[data-defend]');
    const button = mission.querySelector('[data-defend-add]');
    const status = mission.querySelector('[data-defend-status]');
    button.disabled = false;
    button.addEventListener('click', () => {
      const answer = text.value.trim();
      if (answer.length < 10) { status.textContent = 'Write a full sentence first: your choice and your reason.'; text.focus(); return; }
      const note = document.querySelector(`#${labId}-workbench [data-mission] textarea`);
      if (!note) { status.textContent = 'Copy your answer into your experiment note below.'; return; }
      note.value = note.value.trim() ? `${note.value.trim()}\n${answer}` : answer;
      note.dispatchEvent(new Event('input', {bubbles: true}));
      status.textContent = 'Added to your experiment note. That is your design argument, in your words.';
    });
  }

  // Shared with field-missions.js (Labs 3 to 5), which loads after this file.
  window.labMissions = {reduced, gutter, lightsFor, defendTo};

  // ---------- Lab 1: CSS Reactor ----------
  const reactor = document.querySelector('[data-mission-kind="css"]');
  if (reactor) {
    const code = gutter(reactor);
    const starter = code.value;
    const frame = reactor.querySelector('[data-css-preview]');
    const lint = reactor.querySelector('[data-lint]');
    const status = reactor.querySelector('[data-mission-status]');
    const setLight = lightsFor(reactor);
    const PAGE = '<h1>A place I know</h1><p>I notice the sound of rain at the bus stop.</p><details open><summary>What if this changes in the future?</summary><p>What if we have to pay to hear the sounds of our city?</p></details>';
    const START_BG = 'rgb(243, 240, 232)';
    let lastContrast = 0;
    const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
    function luminance([r, g, b]) {
      return [r, g, b].map(c => c / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    }
    function contrast(a, b) {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    }
    function checkSyntax(css) {
      const lines = css.split('\n');
      let open = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        open += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        if (open < 0) return `Line ${i + 1} has a } without a matching {.`;
        const hex = line.match(/#([0-9a-f]+)\b/i);
        if (hex && ![3, 6, 8].includes(hex[1].length)) return `Line ${i + 1}: a hex code needs # plus 6 characters, like #b3122e.`;
        if (/:\s*[0-9a-f]{6}\s*;?$/i.test(line) && !line.includes('#')) return `Line ${i + 1} looks like a hex code without its #.`;
        if (open > 0 && line.includes(':') && !/[;{}]$/.test(line) && !line.startsWith('/*')) {
          const next = (lines[i + 1] || '').trim();
          if (!next.startsWith('}')) return `Line ${i + 1} looks like it is missing a ; at the end.`;
        }
      }
      return open > 0 ? 'A { is missing its closing }.' : '';
    }
    function evaluate() {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      const view = doc.defaultView;
      const body = view.getComputedStyle(doc.body);
      const h1 = view.getComputedStyle(doc.querySelector('h1'));
      const p = view.getComputedStyle(doc.querySelector('p'));
      let bg = body.backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = view.getComputedStyle(doc.documentElement).backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = 'rgb(255, 255, 255)';
      const bgChanged = bg !== START_BG;
      lastContrast = contrast(rgb(p.color), rgb(bg));
      const rebel = [body, h1, p].some(s => s.letterSpacing !== 'normal' || s.textTransform !== 'none' || !/system-ui/.test(s.fontFamily) || s.fontStyle === 'italic');
      const results = [['bg', bgChanged], ['h1', h1.color !== body.color], ['contrast', bgChanged && lastContrast >= 4.5], ['rebel', rebel]];
      const fresh = results.filter(([goal, on]) => setLight(goal, on)).map(([goal]) => goal);
      const names = {bg: 'Power on', h1: 'Heading has a voice', contrast: 'Readable for everyone', rebel: 'Convention broken on purpose'};
      if (reactor.classList.contains('is-full')) status.textContent = 'REACTOR AT FULL POWER. You just wrote real CSS. Copy it into VS Code and make it yours.';
      else if (fresh.length) status.textContent = `Mission complete: ${names[fresh[0]]}.`;
      else if (bgChanged && lastContrast < 4.5) status.textContent = `Contrast is ${lastContrast.toFixed(1)} : 1. Too faint to read for many people. Aim for 4.5 or more.`;
    }
    const render = () => {
      const css = code.value;
      lint.textContent = checkSyntax(css);
      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/<\/style/gi, '<\\/style')}</style></head><body>${PAGE}</body></html>`;
    };
    frame.addEventListener('load', evaluate);
    code.addEventListener('input', debounce(render, 250));
    const HINTS = {
      bg: 'Change the value after <code>background:</code> on the last line of the body rule, for example <code>background: #1d2b3a;</code>',
      h1: 'Under the closing <code>}</code>, add a new rule: <code>h1 { color: #ff7a59; }</code>',
      contrast: () => `Your text and background are too close (${lastContrast.toFixed(1)} : 1). Make one much lighter or darker, for example <code>color: #f4f6f8;</code> on a dark background.`,
      rebel: 'Inside your <code>h1</code> rule, try <code>letter-spacing: 0.15em;</code> or <code>text-transform: uppercase;</code>'
    };
    const buttons = ['[data-mission-hint]', '[data-mission-reset]', '[data-mission-copy]'].map(s => reactor.querySelector(s));
    buttons.forEach(b => { b.disabled = false; });
    buttons[0].addEventListener('click', () => {
      const next = [...reactor.querySelectorAll('.mission-lights li')].find(li => !li.classList.contains('is-on'));
      if (!next) { status.textContent = 'All missions are on. Now try a colour that is completely yours.'; return; }
      const hint = HINTS[next.dataset.goal];
      status.innerHTML = `Hint: ${typeof hint === 'function' ? hint() : hint}`;
    });
    buttons[1].addEventListener('click', () => { code.value = starter; code.dispatchEvent(new Event('input')); render(); status.textContent = 'Code reset to the starter. Your lights stay as proof of what you did.'; });
    buttons[2].addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.value); status.textContent = 'Copied. In VS Code, select everything in style.css, paste, and save with Ctrl + S (Mac: Cmd + S).'; }
      catch { code.select(); status.textContent = 'The code is selected. Press Ctrl + C (Mac: Cmd + C) to copy it.'; }
    });
    status.textContent = 'Reactor online. Start typing: change the background colour on the last line.';
    defendTo(reactor, 'lab-1');
    render();
  }

  // ---------- Lab 2: Signal Control Room ----------
  const room = document.querySelector('[data-mission-kind="js"]');
  if (room) {
    const setLight = lightsFor(room);
    const START = 'I hear rain at the bus stop.';
    const EXAMPLE = 'In 2040, this stop plays memories left by strangers.';

    // Stage 1: boot sequence, acted out on the mini page.
    const runs = [...room.querySelectorAll('[data-run-line]')];
    const page = room.querySelector('[data-sr-page]');
    const story = room.querySelector('[data-sr-story]');
    const live = room.querySelector('[data-sr-button]');
    const beam = room.querySelector('[data-sr-beam]');
    const boot = room.querySelector('[data-boot-status]');
    const say = {
      1: '<code>futureText</code> stores the new sentence. The preview still shows the present. Next: find the paragraph to change.',
      2: '<code>story</code> refers to the highlighted paragraph. <code>#story</code> matches its HTML id. Next: find the button.',
      3: '<code>button</code> refers to the highlighted button. Next: tell it what to do when clicked.',
      4: 'The button is <strong>listening</strong>. Nothing happens until someone clicks. Go on: click the button on the page.'
    };
    function scanTo(target) {
      page.querySelectorAll('.is-locked').forEach(el => el.classList.remove('is-locked'));
      target.classList.add('is-locked');
      if (reduced()) return;
      beam.style.top = `${target.offsetTop}px`;
      beam.style.height = `${target.offsetHeight}px`;
      beam.classList.remove('is-scanning'); void beam.offsetWidth; beam.classList.add('is-scanning');
    }
    runs[0].disabled = false;
    boot.textContent = 'Start with Run line 1: store the sentence.';
    runs.forEach((button, i) => button.addEventListener('click', () => {
      const n = i + 1;
      button.closest('li').classList.add('is-run');
      button.disabled = true; button.textContent = 'Done ✓';
      if (n === 1) room.querySelector('[data-sr-box]').hidden = false;
      if (n === 2) scanTo(story);
      if (n === 3) scanTo(live);
      if (n === 4) { live.disabled = false; live.classList.add('is-listening'); page.querySelectorAll('.is-locked').forEach(el => el.classList.remove('is-locked')); }
      if (runs[n]) runs[n].disabled = false;
      boot.innerHTML = say[n];
    }));
    live.addEventListener('click', () => {
      story.textContent = EXAMPLE;
      live.classList.remove('is-listening');
      boot.innerHTML = '<strong>Signal received.</strong> The click was an <em>event</em>; your listener answered it by changing the words. That is interaction. Stage 2 is unlocked.';
      setLight('boot', true);
    });

    // Stages 2 and 3: run the student's code for real in a sandboxed iframe.
    const code = gutter(room);
    const starter = code.value;
    const consoleOut = room.querySelector('[data-js-console]');
    const result = room.querySelector('[data-js-result] em');
    const bossStatus = room.querySelector('[data-js-boss-status]');
    function runInSandbox(source) {
      return new Promise(resolve => {
        const token = Math.random().toString(36).slice(2);
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.className = 'sr-sandbox'; frame.title = 'Code sandbox'; frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
        const safe = source.replace(/<\/script/gi, '<\\/script');
        frame.srcdoc = `<!doctype html><meta charset="utf-8"><p id="story">${START}</p><button id="future">See a possible future</button>
<script>const T=${JSON.stringify(token)};const send=o=>parent.postMessage(Object.assign({token:T},o),'*');let failed=false;
window.onerror=(m)=>{failed=true;send({error:String(m)});return true;};<\/script>
<script>${safe}<\/script>
<script>if(!failed){try{const s=document.querySelector('#story'),b=document.querySelector('#future');const before=s.textContent;b.click();const one=s.textContent;b.click();const two=s.textContent;send({before,one,two});}catch(e){send({error:e.message});}}<\/script>`;
        const done = data => { window.removeEventListener('message', listen); clearTimeout(timer); frame.remove(); resolve(data); };
        function listen(event) { if (event.source === frame.contentWindow && event.data && event.data.token === token) done(event.data); }
        const timer = setTimeout(() => done({error: 'timeout'}), 2000);
        window.addEventListener('message', listen);
        document.body.append(frame);
      });
    }
    function explain(error, source) {
      const ids = [...source.matchAll(/querySelector\(\s*["']#([^"']+)["']\s*\)/g)].map(m => m[1]).filter(id => !['story', 'future'].includes(id));
      if (ids.length) return `Could not find #${ids[0]} on the page. The HTML has id="story" and id="future". Check the spelling.`;
      if (error === 'timeout') return 'Your code did not finish. Look for a missing ) or } near the end.';
      if (/Unexpected end of input|missing \) |Unexpected token/i.test(error)) return 'Something is not closed. Every ( needs a ), every { needs a }, and every " needs a partner.';
      if (/is not defined/.test(error)) return `${error.replace(/^Uncaught ReferenceError: /, '')}. Check the spelling: JavaScript is case-sensitive.`;
      if (/already been declared/.test(error)) return 'The same name is declared twice with const. Each const name can only be used once.';
      return error.replace(/^Uncaught /, '');
    }
    const runButton = room.querySelector('[data-js-run]');
    const resetButton = room.querySelector('[data-js-reset]');
    const bossButton = room.querySelector('[data-js-boss]');
    const hintButton = room.querySelector('[data-js-hint]');
    [runButton, resetButton, bossButton, hintButton].forEach(b => { b.disabled = false; });
    runButton.addEventListener('click', async () => {
      consoleOut.textContent = '> running story.js …';
      const out = await runInSandbox(code.value);
      if (out.error) {
        consoleOut.textContent = `> ✕ ${explain(out.error, code.value)}`;
        consoleOut.classList.add('is-error'); result.textContent = 'The page did not change.';
        return;
      }
      consoleOut.classList.remove('is-error');
      result.textContent = out.one;
      if (out.one === out.before) consoleOut.textContent = '> The code ran, but a click did not change the text. Is the listener on the button, and does it set story.textContent?';
      else if (out.one === EXAMPLE) consoleOut.textContent = '> ✓ It works! Now make it yours: change the words between the quotes on line 1 and run again.';
      else { consoleOut.textContent = '> ✓ It works, and the words are yours. Stage 3 is waiting.'; setLight('rewire', true); }
    });
    resetButton.addEventListener('click', () => { code.value = starter; code.dispatchEvent(new Event('input')); consoleOut.textContent = '> code reset'; consoleOut.classList.remove('is-error'); });
    const HINTS = [
      'The code needs to know which sentence is showing right now. That is called <strong>state</strong>.',
      'Inside the click listener, ask a question: <code>if (story.textContent === futureText) { … } else { … }</code>',
      `Replace your existing button.addEventListener block with this block. Keep the three const lines above it. Then press Test both clicks:<pre>button.addEventListener("click", () =&gt; {
  if (story.textContent === futureText) {
    story.textContent = "${START}";
  } else {
    story.textContent = futureText;
  }
});</pre>`
    ];
    let hint = 0;
    hintButton.addEventListener('click', () => {
      bossStatus.innerHTML = `<div class="sr-hint"><strong>Hint ${hint + 1} of ${HINTS.length}:</strong> ${HINTS[hint]}</div>`;
      hint = Math.min(hint + 1, HINTS.length - 1);
    });
    bossButton.addEventListener('click', async () => {
      const out = await runInSandbox(code.value);
      if (out.error) { bossStatus.innerHTML = `<p class="is-error">✕ ${explain(out.error, code.value)}</p>`; return; }
      if (out.one !== out.before && out.two === out.before) {
        bossStatus.innerHTML = '<p class="is-win"><strong>SIGNAL MASTERED.</strong> Click one shows the future, click two brings the rain back. Your code remembers its state: that is how every menu, like button and game switch works.</p>';
        setLight('toggle', true);
      } else if (out.one === out.before) {
        bossStatus.innerHTML = '<p>The first click did not change anything. Get stage 2 working first.</p>';
      } else {
        bossStatus.innerHTML = `<p>Click one worked. Click two still says <em>“${out.two.replace(/[<>&]/g, '')}”</em>. The words need to go back to <em>“${START}”</em>. Try a hint.</p>`;
      }
    });
    defendTo(room, 'lab-2');
  }
})();

(() => {
  // Field missions for Labs 3, 4 and 5. Shared helpers come from code-missions.js.
  const M = window.labMissions;
  if (!M) return;
  const {reduced, lightsFor, defendTo} = M;
  const wait = ms => new Promise(r => setTimeout(r, reduced() ? Math.min(ms, 30) : ms));
  const enable = root => root.querySelectorAll('button[disabled]').forEach(b => { b.disabled = false; });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

  // ---------- Lab 3: Gate Engine ----------
  const gate = document.querySelector('[data-mission-kind="gate"]');
  if (gate) {
    enable(gate);
    const light = lightsFor(gate);
    const keys = gate.querySelector('[data-keys]'), out = gate.querySelector('[data-keys-out]');
    const op = gate.querySelector('[data-op]'), need = gate.querySelector('[data-need]');
    const icons = gate.querySelector('[data-key-icons]'), gateEl = gate.querySelector('[data-gate]');
    const cn = gate.querySelector('[data-cn]'), ruleStatus = gate.querySelector('[data-rule-status]');
    const seen = new Set();
    const symbol = {'>=': '≥', '>': '>', '==': '=', '<': '<'};
    const test = (k, o, n) => ({'>=': k >= n, '>': k > n, '==': k === n, '<': k < n})[o];
    function rule() {
      const k = Number(keys.value), n = Math.max(0, Math.min(5, Number(need.value) || 0)), o = op.value;
      const pass = test(k, o, n);
      out.textContent = k;
      icons.innerHTML = Array.from({length: k}, () => '<span></span>').join('');
      gateEl.classList.toggle('is-open', pass);
      cn.textContent = `System ▸ keys ${symbol[o]} ${n}   →   Gate ▸ ${pass ? 'Open' : 'stays shut'}`;
      ruleStatus.textContent = pass
        ? `TRUE: ${k} ${symbol[o]} ${n}, so the action runs and the gate opens.`
        : `FALSE: ${k} ${symbol[o]} ${n} is not true, so the action never runs. The gate stays shut.`;
      seen.add(pass);
      if (seen.size === 2 && light('rule', true)) ruleStatus.textContent += ' You have seen it fail and pass: that is how you test a condition.';
    }
    [keys, op, need].forEach(el => el.addEventListener('input', rule));
    rule();

    // Event sheet: two rows of condition → action, run on a little track.
    const sheetStatus = gate.querySelector('[data-sheet-status]');
    const player = gate.querySelector('[data-track-player]'), hud = gate.querySelector('[data-run-keys]');
    const trackGate = gate.querySelector('[data-track-gate]');
    const trackKeys = [...gate.querySelectorAll('[data-track-key]')];
    let running = false;
    const pairs = () => [1, 2].map(n => [gate.querySelector(`[data-ev-cond="${n}"]`).value, gate.querySelector(`[data-ev-act="${n}"]`).value]);
    const has = (list, c, a) => list.some(([x, y]) => x === c && y === a);
    function reset() {
      player.style.transform = 'translateX(0)'; hud.textContent = '0';
      trackKeys.forEach(k => k.classList.remove('is-taken')); trackGate.classList.remove('is-open');
    }
    gate.querySelector('[data-gate-run]').addEventListener('click', async () => {
      if (running) return;
      running = true; reset();
      const list = pairs();
      const collect = has(list, 'collide', 'addkey'), destroy = has(list, 'collide', 'destroy');
      const opens = has(list, 'keys', 'open'), tickOpen = has(list, 'tick', 'open'), tickAdd = has(list, 'tick', 'addkey');
      if (list.some(([c, a]) => !c || !a)) { sheetStatus.textContent = 'Choose a condition and an action for both events first.'; running = false; return; }
      let count = 0;
      if (tickOpen) trackGate.classList.add('is-open');
      for (let step = 1; step <= 4; step++) {
        player.style.transform = `translateX(${step * 22}%)`;
        await wait(420);
        if (tickAdd) { count += 60; hud.textContent = count; }
        const key = trackKeys[step - 1];
        if (key) {
          if (collect) { count += 1; hud.textContent = count; }
          if (collect || destroy) key.classList.add('is-taken');
        }
        if (opens && count >= 3) trackGate.classList.add('is-open');
      }
      if (tickAdd) {
        for (let i = 0; i < 6; i++) { count += 60; hud.textContent = count; await wait(60); }
        sheetStatus.textContent = `Keys: ${count}. “Every tick” runs about 60 times a second, so the counter exploded and the challenge is gone. Use a trigger that happens once: Player ▸ On collision with Key.`;
      } else if (tickOpen) {
        sheetStatus.textContent = 'The gate was open before the player even moved. “Every tick” is always true, so there is no challenge left. A rule needs a condition that can be false.';
      } else if (list.some(([c]) => c === 'click')) {
        sheetStatus.textContent = 'Nothing happened: there is no button in this scene, so “On clicked” never fires. Conditions only run when their event actually happens.';
      } else if (collect && opens) {
        sheetStatus.textContent = 'GATE OPEN. Two events, one rule system: every key adds 1, and at 3 the gate opens. That is exactly how an event sheet works in Construct.';
        light('sheet', true);
      } else if (collect) {
        sheetStatus.textContent = `The player collected ${count} keys, but nothing tells the gate to open. Add an event: System ▸ keys ≥ 3 → Gate ▸ Open.`;
      } else if (opens) {
        sheetStatus.textContent = 'The gate is waiting for 3 keys, but nothing ever adds a key. Add an event: Player ▸ On collision with Key → System ▸ Add 1 to keys.';
      } else if (destroy) {
        sheetStatus.textContent = 'The keys vanished when touched, but nobody counted them. Destroying a key is fine, but you still need Add 1 to keys.';
      } else {
        sheetStatus.textContent = 'The player walked to the gate, but these events never changed anything. Which event should count a key, and which should open the gate?';
      }
      running = false;
    });
    const hints = ['Event 1 should count keys: what happens when the player touches a key?', 'Event 1: Player ▸ On collision with Key → System ▸ Add 1 to keys.', 'Event 2: System ▸ keys ≥ 3 → Gate ▸ Open.'];
    let hint = 0;
    gate.querySelector('[data-gate-hint]').addEventListener('click', () => { sheetStatus.textContent = `Hint ${hint + 1} of 3: ${hints[hint]}`; hint = Math.min(hint + 1, 2); });

    // Your rule: a live two-event sheet.
    const own = name => gate.querySelector(`[data-own="${name}"]`);
    const ownSheet = gate.querySelector('[data-own-sheet]');
    function ownRule() {
      const thing = own('thing').value.trim(), result = own('result').value.trim(), n = own('need').value || '1';
      const noun = thing || 'Star', counter = (thing || 'star').toLowerCase().replace(/\s+/g, '_') + 's';
      ownSheet.innerHTML = `<p><b>EVENT 1</b> Player ▸ On collision with <em>${esc(noun)}</em> → System ▸ Add 1 to <em>${esc(counter)}</em></p><p><b>EVENT 2</b> System ▸ <em>${esc(counter)}</em> ≥ <em>${esc(n)}</em> → <em>${esc(result || 'Show message: The night bus arrives')}</em></p>`;
      if (thing && result) light('own', true);
    }
    gate.querySelectorAll('[data-own]').forEach(el => el.addEventListener('input', ownRule));
    defendTo(gate, 'lab-3');
  }

  // ---------- Lab 4: The Stacks ----------
  const stacks = document.querySelector('[data-mission-kind="stacks"]');
  if (stacks) {
    enable(stacks);
    const light = lightsFor(stacks);
    const books = JSON.parse(stacks.querySelector('[data-books]').textContent);
    const ORIA = 'https://bibsys-d.primo.exlibrisgroup.com/discovery/search?lang=en&vid=47BIBSYS_UBB:UBB&query=any,contains,';
    const THEMES = {
      games: {re: /game|play/i, terms: ['game studies', 'play']},
      identity: {re: /queer|gender|identity|race|justice|women|normative/i, terms: ['queer', 'identity']},
      story: {re: /literat|\btexts?\b|reading|hypertext|narrative|\bstor(y|ies)\b/i, terms: ['electronic literature', 'narrative']},
      algorithms: {re: /algorithm|search|artificial|\bai\b|data|classification|engine/i, terms: ['algorithms', 'data']},
      art: {re: /\bart\b|artistic|media|installation|interface|cinema/i, terms: ['digital art', 'new media']},
      history: {re: /history|computing|labour|programming/i, terms: ['history of computing']},
      design: {re: /design|participation|community|power/i, terms: ['design justice', 'participation']}
    };
    const chosenThemes = new Set();
    let chosenBook = null;
    const forge = name => stacks.querySelector(`[data-forge="${name}"]`);
    const q = stacks.querySelector('[data-forge-q]'), termsOut = stacks.querySelector('[data-forge-terms]'), oria = stacks.querySelector('[data-oria]');
    function currentTerms() {
      const words = forge('understand').value.toLowerCase().replace(/[^a-zæøå\s-]/g, '').split(/\s+/)
        .filter(w => w.length > 4 && !['about', 'there', 'their', 'which', 'would', 'could', 'people', 'things'].includes(w)).slice(0, 2);
      const fromThemes = [...chosenThemes].flatMap(t => THEMES[t].terms.slice(0, 1));
      return [...new Set([...fromThemes, ...words])].slice(0, 4);
    }
    function forgeUpdate() {
      const making = forge('making').value.trim(), understand = forge('understand').value.trim();
      q.textContent = making || understand ? `I am making ${making || '…'}, and I need to understand ${understand || '…'}.` : 'Your research question appears here.';
      const terms = currentTerms();
      termsOut.textContent = terms.length ? terms.join(' · ') : 'choose a theme';
      if (terms.length) { oria.href = ORIA + encodeURIComponent(terms.slice(0, 2).join(' ')); oria.textContent = `Search UiB Oria for “${terms.slice(0, 2).join(' ')}” ↗`; }
      if (making.length > 2 && understand.length > 2 && chosenThemes.size) light('question', true);
      renderShelf();
    }
    stacks.querySelectorAll('[data-forge]').forEach(el => el.addEventListener('input', forgeUpdate));
    stacks.querySelectorAll('[data-theme]').forEach(chip => chip.addEventListener('click', () => {
      const on = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(on));
      on ? chosenThemes.add(chip.dataset.theme) : chosenThemes.delete(chip.dataset.theme);
      forgeUpdate();
    }));

    const shelf = stacks.querySelector('[data-shelf]'), shelfStatus = stacks.querySelector('[data-shelf-status]');
    const matches = b => ![...chosenThemes].length || [...chosenThemes].some(t => THEMES[t].re.test(`${b.category} ${b.title} ${b.question} ${b.terms}`));
    function renderShelf() {
      const list = books.map((b, i) => ({...b, i})).filter(matches);
      shelf.innerHTML = list.map(b => `<article class="shelf-card${chosenBook === b.i ? ' is-chosen' : ''}" style="--spine:${['#ff7a59', '#c6f15b', '#ffd23f', '#f29bcd', '#6fb7ff', '#b7a6e3'][b.i % 6]}">
        <p class="sc-cat">${esc(b.category)}</p><h5>${esc(b.title)}</h5><p class="sc-by">${esc(b.author)} · ${esc(b.year)}</p>
        <div class="sc-back" hidden><p><b>Ask this book:</b> ${esc(b.question)}</p><p><b>Try searching:</b> ${esc(b.terms)}</p><p><a href="${ORIA + encodeURIComponent(b.title)}" rel="noopener" target="_blank">Find it in Oria ↗</a></p></div>
        <div class="sc-actions"><button data-flip="${b.i}" type="button" aria-expanded="false">Flip</button><button data-choose="${b.i}" type="button">${chosenBook === b.i ? 'Chosen ✓' : 'Choose this book'}</button></div></article>`).join('');
      shelfStatus.textContent = chosenBook !== null ? `You chose ${books[chosenBook].title}.` : `${list.length} of ${books.length} books match your themes. Flip one, then choose it.`;
    }
    shelf.addEventListener('click', e => {
      const flip = e.target.closest('[data-flip]'), choose = e.target.closest('[data-choose]');
      if (flip) {
        const back = flip.closest('.shelf-card').querySelector('.sc-back');
        back.hidden = !back.hidden; flip.setAttribute('aria-expanded', String(!back.hidden)); flip.textContent = back.hidden ? 'Flip' : 'Flip back';
      }
      if (choose) {
        chosenBook = Number(choose.dataset.choose);
        renderShelf(); light('shelf', true); cite();
      }
    });
    renderShelf();

    const myths = [...stacks.querySelectorAll('[data-myth]')];
    myths.forEach(card => card.addEventListener('click', () => {
      card.setAttribute('aria-pressed', 'true'); card.classList.add('is-flipped');
      if (myths.every(c => c.classList.contains('is-flipped'))) light('traps', true);
    }));

    // Citation lab, in the library guide's Chicago author-date format.
    const citeField = name => stacks.querySelector(`[data-cite="${name}"]`);
    const refOut = stacks.querySelector('[data-cite-ref]'), inOut = stacks.querySelector('[data-cite-intext]');
    const citeStatus = stacks.querySelector('[data-cite-status]'), citeBook = stacks.querySelector('[data-cite-book]');
    const nameParts = author => { const parts = author.trim().split(/\s+/); return {last: parts.pop(), first: parts.join(' ')}; };
    let citation = null;
    function reference(b) {
      const {last, first} = nameParts(b.author);
      const [publisher, edition] = b.publisher.split(/;\s*/);
      const ed = edition ? ` ${edition.replace(/\s*edition$/i, ' ed')}.` : '';
      return {last, html: `${esc(last)}, ${esc(first)}. ${esc(b.year)}. <em>${esc(b.title)}</em>.${esc(ed)} ${esc(publisher)}.`};
    }
    function cite() {
      if (chosenBook === null) return;
      const b = books[chosenBook], ref = reference(b);
      citeBook.innerHTML = `Your book: <strong>${esc(b.title)}</strong> by ${esc(b.author)}.`;
      refOut.innerHTML = ref.html;
      const page = citeField('page').value.trim(), idea = citeField('idea').value.trim();
      const pageOk = /^\d{1,4}(\s*[–-]\s*\d{1,4})?$/.test(page);
      inOut.textContent = `(${ref.last} ${b.year}${pageOk ? ', ' + page.replace(/\s*-\s*/, '–') : ', page?'})`;
      if (!page) citeStatus.textContent = 'Add the page you actually read. Never invent a page number.';
      else if (!pageOk) citeStatus.textContent = 'Use a page number or a range, like 45 or 45–52.';
      else if (idea.length < 10) citeStatus.textContent = 'Now write the author’s idea in your own words.';
      else {
        citeStatus.textContent = 'Reference and in-text citation are ready. Check them against the book in your hands.';
        citation = {b, ref, page: page.replace(/\s*-\s*/, '–'), idea}; light('citation', true); return;
      }
      citation = null;
    }
    stacks.querySelectorAll('[data-cite]').forEach(el => el.addEventListener('input', cite));

    // Bridge + research card.
    const bridge = name => stacks.querySelector(`[data-bridge="${name}"]`);
    const defendBox = stacks.querySelector('[data-defend]'), defendStatus = stacks.querySelector('[data-defend-status]');
    stacks.querySelector('[data-bridge-build]').addEventListener('click', () => {
      if (!citation) { defendStatus.textContent = 'Finish the citation lab first: choose a book, add a page and the idea.'; return; }
      const will = bridge('will').value.trim(), because = bridge('because').value.trim();
      if (!will || !because) { defendStatus.textContent = 'Fill in both parts: what you will do, and why.'; return; }
      defendBox.value = `${citation.ref.last} argues that ${citation.idea.replace(/\.$/, '')} (${citation.ref.last} ${citation.b.year}, ${citation.page}). In my project this means I will ${will.replace(/\.$/, '')}, because ${because.replace(/\.$/, '')}.`;
      defendStatus.textContent = 'Your sentence is ready. Edit it, then add it to your experiment note.';
      light('bridge', true);
      defendBox.focus();
    });
    defendTo(stacks, 'lab-4');
  }

  // ---------- Lab 5: Test Lab ----------
  const lab = document.querySelector('[data-mission-kind="testlab"]');
  if (lab) {
    enable(lab);
    const light = lightsFor(lab);
    const proto = lab.querySelector('[data-proto]'), cursor = lab.querySelector('[data-cursor]'), bubble = lab.querySelector('[data-bubble]');
    const timer = lab.querySelector('[data-timer]');
    const part = name => proto.querySelector(`[data-p="${name}"]`);
    let busy = false;
    async function moveTo(el, text, seconds, from) {
      const box = proto.getBoundingClientRect(), r = el.getBoundingClientRect();
      cursor.style.transform = `translate(${r.left - box.left + r.width / 2}px, ${r.top - box.top + r.height / 2}px)`;
      await wait(650);
      el.classList.add('is-poked'); setTimeout(() => el.classList.remove('is-poked'), 400);
      bubble.textContent = text; bubble.classList.add('is-on');
      const target = from + seconds, steps = 12;
      for (let i = 1; i <= steps; i++) { timer.textContent = `${Math.round(from + (seconds * i) / steps)} s`; await wait(70); }
      await wait(900);
      bubble.classList.remove('is-on');
      return target;
    }
    async function play(fixed) {
      busy = true; cursor.classList.add('is-on'); cursor.style.transform = 'translate(20px, 20px)'; timer.textContent = '0 s';
      let t = 0;
      if (!fixed) {
        t = await moveTo(part('title'), '“I clicked the title because I thought it would start.”', 12, t);
        t = await moveTo(part('icon'), '“Is this the menu? Or the start? No idea.”', 14, t);
        t = await moveTo(part('start'), '“Oh… “start” was this pale little word? I almost missed it.”', 15, t);
      } else {
        t = await moveTo(part('start'), '“Found it straight away.”', 9, t);
      }
      cursor.classList.remove('is-on'); busy = false;
      return t;
    }
    let before = 41;
    const watchStatus = lab.querySelector('[data-watch-status]');
    lab.querySelector('[data-play-test]').addEventListener('click', async () => {
      if (busy) return;
      watchStatus.textContent = 'Watching… stay quiet, no hints.';
      before = await play(false);
      watchStatus.textContent = `It took the tester ${before} seconds to start the game. Three things confused them. Now sort what they said.`;
      light('watch', true);
    });

    const sortStatus = lab.querySelector('[data-sort-status]');
    lab.querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => {
      b.closest('[role="group"]').querySelectorAll('[data-sort]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    lab.querySelector('[data-sort-check]').addEventListener('click', () => {
      const cards = [...lab.querySelectorAll('[data-fb]')];
      const answered = cards.filter(c => c.querySelector('[aria-pressed="true"]'));
      if (answered.length < cards.length) { sortStatus.textContent = `Sort all six first (${answered.length} of 6 done).`; return; }
      let right = 0;
      cards.forEach(c => {
        const ok = c.querySelector('[aria-pressed="true"]').dataset.sort === c.dataset.fb;
        c.classList.toggle('is-right', ok); c.classList.toggle('is-wrong', !ok); if (ok) right++;
      });
      sortStatus.textContent = right === 6
        ? '6 of 6. Useful feedback says what someone did and what they expected, so you know exactly what to fix. “It looks good” is kind, but you cannot act on it.'
        : `${right} of 6. Look again at the red ones: does the comment tell you what the person did, or only how they felt?`;
      if (right === 6) light('sort', true);
    });

    const fixStatus = lab.querySelector('[data-fix-status]');
    const fixed = () => ['title', 'start', 'icon'].every(k => lab.querySelector(`[data-fix="${k}"][value="1"]`).checked);
    lab.querySelectorAll('[data-fix]').forEach(r => r.addEventListener('change', () => {
      ['title', 'start', 'icon'].forEach(k => proto.classList.toggle(`fix-${k}`, lab.querySelector(`[data-fix="${k}"][value="1"]`).checked));
      if (fixed()) { fixStatus.textContent = 'All three repaired. Look at the page: now retest it.'; light('fix', true); }
      else fixStatus.textContent = `${['title', 'start', 'icon'].filter(k => lab.querySelector(`[data-fix="${k}"][value="1"]`).checked).length} of 3 repaired.`;
    }));

    const retestStatus = lab.querySelector('[data-retest-status]'), score = lab.querySelector('[data-retest-score]');
    lab.querySelector('[data-retest]').addEventListener('click', async () => {
      if (busy) return;
      if (!fixed()) { retestStatus.textContent = 'Repair all three problems in stage 3 first. Retesting the same page tells you nothing new.'; return; }
      retestStatus.textContent = 'Retesting with the same task…';
      const after = await play(true);
      score.innerHTML = `<span>BEFORE <b>${before} s</b></span><span aria-hidden="true">→</span><span>AFTER <b>${after} s</b></span>`;
      retestStatus.textContent = `From ${before} seconds to ${after}. You did not guess what was wrong: you watched, changed and tested again. That is revision.`;
      light('retest', true);
    });

    const plan = name => lab.querySelector(`[data-plan="${name}"]`), card = lab.querySelector('[data-test-card]');
    const planStatus = lab.querySelector('[data-plan-status]');
    function planCard() {
      const task = plan('task').value.trim(), watchFor = plan('watch').value.trim();
      card.textContent = ['MY FIVE-MINUTE TEST', '', `1. Say: “Please try to ${task || '…'}. Think out loud. I will not help.”`,
        `2. Watch for ${watchFor || 'where they click first, and when they hesitate'}.`, '3. Write down what they DO and what they EXPECTED.',
        '4. Do not explain or defend your design while they try.', '5. Afterwards ask: “What did you expect would happen?”',
        '6. Change one thing. Test again.'].join('\n');
      if (task) { light('plan', true); planStatus.textContent = 'Your test card is ready. Copy it, and run the test before you leave today.'; }
    }
    lab.querySelectorAll('[data-plan]').forEach(el => el.addEventListener('input', planCard));
    planCard();
    lab.querySelector('[data-plan-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(card.textContent); planStatus.textContent = 'Copied. Paste it into your notes or print it for the test.'; }
      catch { const r = document.createRange(); r.selectNodeContents(card); const s = getSelection(); s.removeAllRanges(); s.addRange(r); planStatus.textContent = 'Selected. Press Ctrl + C (Mac: Cmd + C) to copy.'; }
    });
    defendTo(lab, 'lab-5');
  }
})();

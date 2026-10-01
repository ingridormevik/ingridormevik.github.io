(() => {
  // Full-screen "experiment complete" scene, shown when a student marks a lab quest complete.
  // Test without completing a lab: lab-programme.html?victory=1 (1 to 5). Not linked on the site.
  const LABS = {
    1: {rank: 'Junior Lab Technician', title: 'A place became a webpage', skills: ['Built a page from HTML structure', 'Styled it with CSS selectors, properties and values', 'Read and chose hex colours on purpose', 'Checked contrast so everyone can read it', 'Explained what a colour says'], legend: {who: 'Ada Lovelace, 1843', quote: 'The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.'}},
    2: {rank: 'Interaction Engineer', title: 'A choice became a consequence', skills: ['Made a page respond to a click', 'Tracked state: what changed, and why', 'Wrote a prompt with where, what, why and limits', 'Read AI code line by line before keeping it', 'Logged what the AI did and what you did'], legend: {who: 'Alan Turing, 1950', quote: 'I propose to consider the question, ‘Can machines think?’'}},
    3: {rank: 'Game Mechanic', title: 'The same idea, in Construct', skills: ['Built events: condition → action', 'Turned a rule into a consequence', 'Tested, saved and reopened a Construct project', 'Debugged with a screenshot, a forum or a person', 'Compared how a tool changes an idea'], legend: {who: 'Charles Babbage, 1864', quote: 'On two occasions I have been asked, ‘Pray, Mr. Babbage, if you put into the machine wrong figures, will the right answers come out?’'}},
    4: {rank: 'Archive Hacker', title: 'Your project met the library', skills: ['Found a real record in the catalogue', 'Read a passage in context, not just a title', 'Cited a source in Chicago style', 'Turned a source into a design decision', 'Knew which questions to ask a book'], legend: {who: 'Ada Lovelace, 1841', quote: 'Imagination is the Discovering Faculty, pre-eminently.'}},
    5: {rank: 'Lab Director', title: 'Someone else understood your work', skills: ['Watched someone use your work without help', 'Turned an observation into a revision', 'Explained your decisions in your own words', 'Retested after changing', 'Finished five experiments'], legend: {who: 'Alan Turing, 1950', quote: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.'}}
  };
  const AI_LINES = [
    'ANALYSIS COMPLETE. The AI wrote suggestions. The human made the decisions.',
    'SUBJECT IS NO LONGER A BEGINNER. Recommend: more experiments.',
    'WARNING: creativity levels exceed lab safety limits.',
    'CONCLUSION: the software gave possibilities. You gave it a reason.'
  ];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('access-no-motion');
  const group = () => document.getElementById('group')?.value || '495';

  function passFor(n) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`dik105-pass-v1-${n}-${group()}`) || 'null');
      if (saved && typeof saved.name === 'string') return {name: saved.name.slice(0, 100), colour: /^#[0-9a-f]{6}$/i.test(saved.colour || '') ? saved.colour : null};
    } catch {}
    return {name: '', colour: null};
  }
  function completedCount() {
    let count = 0;
    for (let n = 1; n <= 5; n++) { try { if (sessionStorage.getItem(`dik105-complete-lab-${n}-${group()}`) === 'yes') count++; } catch {} }
    return count;
  }

  function burst(canvas, colour) {
    if (reduced()) return;
    const ctx = canvas.getContext('2d');
    const glyphs = ['</>', '{ }', '#', '01', '✓', ';', '=>', 'AI', '⚗', '★'];
    const palette = [colour || '#ff7a59', '#c6f15b', '#ffd23f', '#f29bcd', '#6fb7ff', '#ffffff'];
    const w = canvas.width = innerWidth, h = canvas.height = innerHeight;
    const bits = Array.from({length: 90}, () => ({x: w / 2, y: h * 0.42, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4, r: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3, g: glyphs[Math.random() * glyphs.length | 0], c: palette[Math.random() * palette.length | 0], s: 16 + Math.random() * 18}));
    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, w, h);
      bits.forEach(b => {
        b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.r += b.spin;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.font = `800 ${b.s}px Consolas, monospace`; ctx.fillStyle = b.c; ctx.fillText(b.g, 0, 0); ctx.restore();
      });
      if (++frame < 150 && canvas.isConnected) requestAnimationFrame(tick); else ctx.clearRect(0, 0, w, h);
    })();
  }


  function show(n) {
    const data = LABS[n]; if (!data) return;
    document.querySelector('.victory')?.remove();
    const pass = passFor(n);
    const done = completedCount();
    const opener = document.activeElement;
    const root = document.createElement('div');
    root.className = 'victory'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'victory-title');
    if (pass.colour) root.style.setProperty('--v-pass', pass.colour);
    const skills = data.skills.map((s, i) => `<li style="--i:${i}"><span aria-hidden="true">✓</span>${s}</li>`).join('');
    const meter = [1, 2, 3, 4, 5].map(i => `<span class="${i === n || i <= done ? 'is-on' : ''}${i === n ? ' is-now' : ''}">0${i}</span>`).join('');
    root.innerHTML = `<canvas class="victory-burst" aria-hidden="true"></canvas>
      <div class="victory-card">
        <div class="victory-bar"><span>DIKULT105 / THE LAB</span><span>EXPERIMENT 0${n} / ${data.title.toUpperCase()}</span></div>
        <div class="victory-stage">
          <div class="victory-machine" aria-hidden="true"><div class="flask f1"><i></i></div><div class="flask f2"><i></i></div><div class="flask f3"><i></i></div><div class="machine-lights"><b></b><b></b><b></b><b></b></div></div>
          <div class="victory-copy">
            <p class="victory-stamp">ACCESS GRANTED</p>
            <h2 id="victory-title">Experiment<br>successful.</h2>
            <p class="victory-name">${pass.name ? `${pass.name.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch])}, you` : 'You'} are now a <strong>${data.rank}</strong>.</p>
          </div>
        </div>
        <div class="victory-body">
          <div><p class="victory-label">SKILLS UNLOCKED</p><ul class="victory-skills">${skills}</ul></div>
          <div><p class="victory-label">LAB AI / FINAL REPORT</p><p class="victory-ai"></p><p class="victory-label">YOUR LAB PROGRESS</p><div class="victory-meter">${meter}</div><blockquote class="victory-legend"><p class="victory-label">FROM THE HALL OF LAB LEGENDS</p><p>“${data.legend.quote}”</p><cite>${data.legend.who}</cite></blockquote><p class="victory-proud">You walked in with an idea. You walk out knowing how to build it. Be proud of that.</p></div>
        </div>
        <div class="victory-actions"><button type="button" data-victory-next>${n < 5 ? `Lab 0${n + 1} unlocked. Continue` : `All five labs complete. View my map`}</button><button type="button" data-victory-close>View my progress map</button></div>
      </div>`;
    document.body.append(root);
    document.body.classList.add('victory-open');

    const ai = root.querySelector('.victory-ai');
    const line = AI_LINES[(n - 1) % AI_LINES.length];
    if (reduced()) ai.textContent = line;
    else { let k = 0; const type = setInterval(() => { ai.textContent = line.slice(0, ++k) + (k < line.length ? '▌' : ''); if (k >= line.length || !root.isConnected) clearInterval(type); }, 28); }
    burst(root.querySelector('.victory-burst'), pass.colour);

    const close = () => { root.remove(); document.body.classList.remove('victory-open'); document.removeEventListener('keydown', keys); const map=document.querySelector('.start-lab'); map?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'}); document.querySelector('[data-go]')?.focus({preventScroll:true}); };
    function keys(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const items = [...root.querySelectorAll('button')];
        const first = items[0], last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keys);
    root.querySelector('[data-victory-close]').addEventListener('click', close);
    root.querySelector('[data-victory-next]').addEventListener('click',()=>{if(n<5)window.labAudio?.play('unlock');close();location.hash=n<5?`lab-${n+1}-arrival`:'programme';});
    root.querySelector('[data-victory-next]').focus();
  }

  // lab-navigation.js marks the quest complete in its own click handler; this runs after it (bubbling).
  document.addEventListener('click', event => {
    const button = event.target.closest('.quest-complete-button');
    const lab = button?.closest('.lab');
    if (lab?.dataset.questComplete === 'true') show(Number(lab.id.split('-')[1]));
  });
  const preview = Number(new URLSearchParams(location.search).get('victory'));
  if (preview >= 1 && preview <= 5) addEventListener('load', () => show(preview));
  window.labVictory = show;
})();

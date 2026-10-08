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
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('access-no-motion') || document.documentElement.classList.contains('access-calm');
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
    const glyphs = ['READ', 'WRITE', '0', '1', 'ADD', 'PRINT', '1843', '1936', '1968', '1989'];
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


  function show(n, options = {}) {
    const practice = options.practice;
    const practiceData = {
      briefing: {rank:'ready to build',title:'Your idea is ready for a first version',skills:['Choose one action for your page', 'Ask for that change with clear limits', 'Read the suggested code before keeping it', 'Test the action and explain what changed', 'Record your own edits and decisions']},
      web: {rank:'webpage interaction builder',title:'The click became a change',skills:['Connected HTML to a JavaScript file', 'Found the paragraph and button', 'Ran a click listener in Live Preview', 'Tested the change in the browser', 'Saved the working webpage']},
      construct: {rank:'interaction builder in two tools',title:'The same idea works in a new tool',skills:['Placed objects in a Construct layout', 'Connected a button condition to an action', 'Used Construct’s runtime to change text', 'Tested the interaction in Preview', 'Saved the Construct project']}
    };
    const base = LABS[n]; if (!base) return;
    const data = practice && practiceData[practice] ? {...base,...practiceData[practice]} : base;
    document.querySelector('.victory')?.remove();
    const pass = passFor(n);
    const done = completedCount();
    const opener = options.opener || document.activeElement;
    const root = document.createElement('div');
    root.className = 'victory'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'victory-title');
    if (pass.colour) root.style.setProperty('--v-pass', pass.colour);
    const skills = data.skills.map((s, i) => `<li style="--i:${i}"><span aria-hidden="true">✓</span>${s}</li>`).join('');
    const meter = [1, 2, 3, 4, 5].map(i => `<span class="${i === n || i <= done ? 'is-on' : ''}${i === n ? ' is-now' : ''}">0${i}</span>`).join('');
    root.innerHTML = `<canvas class="victory-burst" aria-hidden="true"></canvas>
      <div class="victory-card">
        <div class="victory-bar"><span>DIKULT105 / THE LAB</span><span>${practice ? 'GUIDE CHECKPOINT' : `EXPERIMENT 0${n}`} / ${data.title.toUpperCase()}</span></div>
        <div class="victory-stage">
          <div class="victory-machine victory-engine" aria-hidden="true"><svg viewBox="0 0 330 250"><g stroke="#12151f" stroke-width="6" stroke-linejoin="round"><rect x="18" y="26" width="294" height="196" rx="8" fill="#8aa0b8"/><rect x="38" y="43" width="254" height="53" fill="#12151f"/><text x="165" y="78" text-anchor="middle" font-family="monospace" font-size="22" fill="#c6f15b" stroke="none">BUILD / TEST / SAVE</text><g class="victory-gear"><circle cx="95" cy="157" r="45" fill="#e9ca85" stroke-dasharray="12 6" stroke-width="12"/><circle cx="95" cy="157" r="17" fill="#12151f"/></g><g class="victory-gear reverse"><circle cx="174" cy="157" r="35" fill="#f29bcd" stroke-dasharray="10 6" stroke-width="10"/><circle cx="174" cy="157" r="13" fill="#12151f"/></g><path class="victory-output" d="M246 123v94m-20-69h43m-43 22h43m-43 22h43" stroke="#edf4dd" stroke-width="10"/><path d="m219 46 16 17 30-31" stroke="#c6f15b" stroke-width="9" fill="none"/></g></svg></div>
          <div class="victory-copy">
            <p class="victory-stamp">${practice === 'briefing' ? 'BUILD MODE READY' : 'MISSION COMPLETE'}</p>
            <h2 id="victory-title">${practice === 'briefing' ? 'Your next move:<br>make it real.' : n === 5 && !practice ? 'Five labs.<br>You built it.' : 'Experiment<br>complete.'}</h2>
            <p class="victory-name">${pass.name ? `${pass.name.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch])}, you` : 'You'}${practice === 'briefing' ? ' are ready to build one interaction.' : ` earned the role <strong>${data.rank}</strong>.`}</p>
          </div>
        </div>
        <div class="victory-body">
          <div><p class="victory-label">${practice === 'briefing' ? 'YOUR BUILD PLAN' : 'YOUR PRACTICE RECORD'}</p><ul class="victory-skills">${skills}</ul></div>
          <div><p class="victory-label">LAB AI / FINAL REPORT</p><p class="victory-ai"></p>${practice ? '<p class="victory-label">PRACTICE CHECKPOINT / LAB CHECKLIST STILL TO FINISH</p>' : `<p class="victory-label">YOUR LAB PROGRESS</p><div class="victory-meter">${meter}</div>`}<blockquote class="victory-legend"><p class="victory-label">FROM THE HALL OF LAB LEGENDS</p><p>“${data.legend.quote}”</p><cite>${data.legend.who}</cite></blockquote><p class="victory-proud">${practice === 'briefing' ? 'Start small. Make one change, test it, and decide what to keep.' : 'Keep the version you tested. Write what changed and what you want to try next.'}</p></div>
        </div>
        <div class="victory-actions"><button type="button" data-victory-next>${practice ? (practice === 'briefing' ? 'Build my JavaScript page →' : practice === 'web' ? 'Meet Construct before continuing →' : 'Return to my Lab 2 checklist →') : n < 5 ? `Continue to Lab 0${n + 1} →` : 'View my completed lab map'}</button><button type="button" data-victory-close>${practice ? 'Back to this checkpoint' : 'View my progress map'}</button></div>
      </div>`;
    document.body.append(root);
    document.body.classList.add('victory-open');

    const ai = root.querySelector('.victory-ai');
    const line = practice ? (practice === 'briefing' ? 'BRIEFING COMPLETE. Next: one action, one test, your own decisions.' : 'PRACTICE CHECKPOINT. Return to your project and record what changed. This does not mark a course lab complete.') : 'PROJECT SAVED. Reflect on what changed, what you tested and your next step.';
    if (reduced()) ai.textContent = line;
    else { let k = 0; const type = setInterval(() => { ai.textContent = line.slice(0, ++k) + (k < line.length ? '▌' : ''); if (k >= line.length || !root.isConnected) clearInterval(type); }, 28); }
    window.labAudio?.play?.('complete');
    burst(root.querySelector('.victory-burst'), pass.colour);

    let dismissed=false;
    const close = () => { if(dismissed)return;dismissed=true;if(!practice&&document.getElementById(`lab-${n}`)?.dataset.questComplete==='true')setTimeout(()=>document.dispatchEvent(new CustomEvent('victory-dismissed',{detail:{lab:n}})),0);root.remove(); document.body.classList.remove('victory-open'); document.removeEventListener('keydown', keys); if(practice){opener?.focus({preventScroll:true});}else{const map=document.querySelector('.start-lab'); map?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'}); document.querySelector('[data-go]')?.focus({preventScroll:true});} };
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
    root.querySelector('[data-victory-next]').addEventListener('click',()=>{close();if(practice){if(practice === 'construct') location.href='lab-programme.html#lab-2-workbench';else location.hash=options.target || 'lab-2-sec-2';}else{if(n<5)window.labAudio?.play('unlock');location.hash=n<5?`lab-${n+1}-arrival`:'programme';}});
    root.querySelector('[data-victory-next]').focus();
  }

  // Only the authoritative completion event opens a course victory.
  document.addEventListener('lab-completed', event => {
    const lab = document.getElementById(event.detail?.id);
    if(lab?.dataset.questComplete === 'true')show(Number(lab.id.split('-')[1]));
  });
  const preview = Number(new URLSearchParams(location.search).get('victory'));
  if (preview >= 1 && preview <= 5) addEventListener('load', () => show(preview));
  window.labVictory = show;
})();

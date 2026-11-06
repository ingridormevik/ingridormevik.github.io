(() => {
  function start() {
    const root = document.getElementById('submission-lab');
    if (!root || root.dataset.slReady) return;
    root.dataset.slReady = 'true';
    const q = s => root.querySelector(s), all = s => [...root.querySelectorAll(s)];
    const ids = ['future', 'action', 'evidence', 'delivery'];
    const key = 'dik105-submission-practice-v1';
    const tried = new Set();
    let storageWorks = true;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) saved.filter(id => ids.includes(id)).forEach(id => tried.add(id));
    } catch { storageWorks = false; }
    function paint() {
      q('[data-sl-count]').textContent = tried.size + ' / 4';
      q('[data-sl-progress]').value = tried.size;
      ids.forEach(id => {
        q('[data-sl-station="' + id + '"]').classList.toggle('is-tried', tried.has(id));
        q('[data-sl-lamp="' + id + '"]').classList.toggle('is-tried', tried.has(id));
        q('[data-sl-mark="' + id + '"]').textContent = tried.has(id) ? '✓ Tried' : 'Try';
      });
      q('[data-sl-storage]').textContent = (storageWorks ? 'Practice progress stays in this browser. ' : 'Progress lasts for this visit only. ') + 'Not grades or submission approval.';
      q('[data-sl-result]').textContent = tried.size === 4 ? 'Four stations tried. Choose one fix for your real project.' : 'Start anywhere. Every station stays open.';
    }
    function done(id) {
      tried.add(id);
      try { localStorage.setItem(key, JSON.stringify([...tried])); } catch { storageWorks = false; }
      paint();
    }
    // Keep the current activity in view without locking any station.
    all('[data-sl-station]').forEach(station => station.addEventListener('toggle', () => {
      if (!station.open) return;
      all('[data-sl-station]').filter(other => other !== station).forEach(other => { other.open = false; });
    }));
    const policies = new Set();
    all('[data-sl-rule]').forEach(button => button.addEventListener('click', () => {
      const shared = button.dataset.slRule === 'shared';
      policies.add(button.dataset.slRule);
      [shared ? 1 : 3, shared ? 1 : 0, shared ? 1 : 0].forEach((value, i) => { const tank=q('[data-sl-water="' + i + '"]'); tank.textContent=String(value);tank.parentElement.style.setProperty('--sl-water',value); });
      all('[data-sl-rule]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      q('[data-sl-water-status]').textContent = shared ? '1 + 1 + 1. Every home receives water.' : '3 + 0 + 0. The first home takes it all. Two receive nothing.';
      if (policies.size === 2) done('future');
    }));
    let clearLabel = false, vagueTried = false, explicitTried = false;
    q('[data-sl-open]').addEventListener('click', () => {
      if (clearLabel) explicitTried = true; else vagueTried = true;
      q('[data-sl-story]').textContent = '“Before the water ran out, we used to leave the tap running.”';
      q('[data-sl-action-status]').textContent = clearLabel ? 'The label named the action. Was the response what you expected?' : 'The arrow opened a memory. Could you predict that?';
      if (vagueTried && explicitTried) done('action');
    });
    q('[data-sl-label]').addEventListener('click', () => {
      clearLabel = !clearLabel;
      q('[data-sl-open]').textContent = clearLabel ? 'Open the last memory' : '→';
      q('[data-sl-label]').textContent = clearLabel ? 'Use the arrow again' : 'Give it a clear label';
      q('[data-sl-label]').setAttribute('aria-pressed', String(clearLabel));
      q('[data-sl-story]').textContent = 'The room holds one memory.';
      q('[data-sl-action-status]').textContent = 'Same action, different label. Try it now.';
    });
    q('[data-sl-restart]').addEventListener('click', () => {
      q('[data-sl-story]').textContent = 'The room holds one memory.';
      q('[data-sl-action-status]').textContent = 'Scene restarted. Your practice progress stays saved.';
    });
    all('[data-sl-source]').forEach(button => button.addEventListener('click', () => {
      const read = button.dataset.slSource === 'read';
      all('[data-sl-source]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      q('[data-sl-evidence-status]').textContent = read ? 'Useful: a checked passage, a locator and your own design connection. Do this with a real source next.' : 'A title can help you find a source. Read the relevant passage before using it to support a claim.';
      if (read) done('evidence');
    }));
    function packageView() {
      const prefix = q('[data-sl-root]').checked ? '' : 'project/\n  ';
      const indent = q('[data-sl-root]').checked ? '' : '  ';
      q('[data-sl-files]').textContent = prefix + 'index.html\n' + indent + (q('[data-sl-assets]').checked ? 'assets/' : '(assets missing)');
    }
    all('.sl-package input').forEach(input => input.addEventListener('change', packageView));
    q('[data-sl-package-test]').addEventListener('click', () => {
      const atRoot = q('[data-sl-root]').checked, assets = q('[data-sl-assets]').checked;
      q('[data-sl-package-status]').textContent = !atRoot ? 'Entry page is inside an extra folder. Put index.html at the ZIP’s root.' : !assets ? 'Entry page found. Its assets are missing; include the files it needs.' : 'Practice package ready. Now test your real work and video URLs while signed out.';
      if (atRoot && assets) done('delivery');
    });
    const tips = {
      code: [
        ['Save. Reload. Check the first error.', 'Read the Console’s first error and its file/line. Change one cause, then repeat the same test.', '#recap-debug'],
        ['Check which event sheet is active.', 'In Construct, check the layout, event sheet and selected object instances before rewriting an event.', '#recap-debug'],
        ['Find the file quickly.', 'Ctrl+P on Windows/Linux or Cmd+P on Mac opens a file by name. Open the whole project folder first.', '#recap-vscode']
      ],
      design: [
        ['Make the first action obvious.', 'A verb such as “Open the memory” tells a visitor more than an unexplained arrow.', '#recap-css'],
        ['Try it at 200%.', 'Zoom in and use Tab. Can you read the page and reach every control?', 'accessibility-lab.html'],
        ['Keep one visual rule.', 'Reuse the same type, spacing and button states. Remove one effect that adds no meaning.', '#recap-css']
      ],
      test: [
        ['Let someone try it silently.', 'Watch their first action before explaining. Keep one observation and make one repair.', 'week11-feedback-clinic.html'],
        ['Try the second click.', 'Test first action, repeated action, restart and return. Your state should make sense each time.', '#recap-debug'],
        ['Check sound on the hosted version.', 'Start it with a deliberate click. Keep a mute route and a readable alternative for essential speech.', '#recap-performance']
      ],
      handin: [
        ['Keep the four parts together.', 'Interactive work, your analysis, public work URL and walkthrough should describe the same version.', 'final-assessment.html#brief'],
        ['Keep a real process example.', 'Save a screenshot or note of one problem, your change and the result. Explain it yourself.', 'final-assessment.html#doc'],
        ['Check the actual instructions.', 'Use the current brief and Inspera for deadline and upload details. Lab progress is not eligibility approval.', 'final-assessment.html#seals']
      ]
    };
    const positions = { code: 0, design: 0, test: 0, handin: 0 };
    all('[data-sl-tip]').forEach(button => button.addEventListener('click', () => {
      const topic = button.dataset.slTip, list = tips[topic], tip = list[positions[topic]++ % list.length];
      all('[data-sl-tip]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      q('[data-sl-tip-text]').replaceChildren();
      const title = document.createElement('strong'); title.textContent = tip[0];
      q('[data-sl-tip-text]').append(title, document.createElement('br'), tip[1]);
      q('[data-sl-tip-link]').href = tip[2];
      q('[data-sl-tip-link]').textContent = 'Need more? Open the guide →';
    }));
    all('button,input').forEach(control => { control.disabled = false; });
    packageView(); paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

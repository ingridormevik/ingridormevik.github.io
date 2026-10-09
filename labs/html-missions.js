(() => {
  const answers = {'1': 'button', '2': 'after'};
  const key = 'dik105-html-field-missions-v1';
  let completed = [];
  try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) completed = saved.filter(id => id === '1' || id === '2'); } catch {}
  document.querySelectorAll('[data-html-mission]').forEach(root => {
    const id = root.dataset.htmlMission;
    const badge = root.querySelector('[data-html-badge]');
    const feedback = root.querySelector('[data-html-feedback]');
    const mark = () => {
      root.classList.add('is-complete');
      badge.textContent = id === '1' ? 'Control identified ✓' : 'Circuit connected ✓';
    };
    if (completed.includes(id)) mark();
    root.querySelectorAll('[data-html-choice]').forEach(button => {
      button.disabled = false;
      button.addEventListener('click', () => {
        const correct = button.dataset.htmlChoice === answers[id];
        root.querySelectorAll('[data-html-choice]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
        if (!correct) {
          feedback.textContent = id === '1'
            ? 'Look again: p holds the text, and id names an element. Which tag creates the control?'
            : 'The script needs to find your paragraph and button. Follow the circuit from the HTML to story.js.';
          return;
        }
        mark();
        feedback.textContent = id === '1'
          ? 'Control identified. The button is the control; JavaScript gives it an action. Now change its label in VS Code.'
          : 'Circuit connected. The HTML is parsed before this deferred script runs. Now check the two filenames in VS Code.';
        if (!completed.includes(id)) completed.push(id);
        try { localStorage.setItem(key, JSON.stringify(completed)); } catch {}
      });
    });
    const demo = root.querySelector('[data-html-demo]');
    if (demo) demo.addEventListener('click', () => {
      root.querySelector('[data-html-demo-text]').textContent = 'Someone else remembers this place differently.';
    });
  });
})();

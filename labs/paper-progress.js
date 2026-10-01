(() => {
  const group = document.getElementById('group');
  document.querySelectorAll('.lab').forEach(lab => {
    const controls = [];
    const key = () => `dik105-paper-${lab.id}-${group.value}`;
    function add(where, attribute, text) {
      const label = document.createElement('label');
      label.className = 'mission-check';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute(attribute, '');
      label.append(checkbox, document.createTextNode(' ' + text));
      where.prepend(label);
      controls.push(checkbox);
    }
    add(lab.querySelector('.attendance-content'), 'data-paper-arrival', 'I wrote my arrival note on paper. Count my first star.');
    add(lab.querySelector('.mission-actions'), 'data-paper-reflection', 'I wrote my experiment reflection on paper. Use it instead of the text field below.');
    const help = document.createElement('p');
    help.className = 'mission-small';
    help.textContent = 'Your three stars: arrival note ready; all three milestones and a reflection ready; saved files and Mark this quest complete. Paper notes count too.';
    lab.querySelector('.attendance-content').prepend(help);
    function restore() {
      let saved;
      try { saved = JSON.parse(sessionStorage.getItem(key()) || 'null'); } catch {}
      controls.forEach((control, index) => { control.checked = saved?.[index] === true; });
    }
    controls.forEach(control => control.addEventListener('change', () => {
      try { sessionStorage.setItem(key(), JSON.stringify(controls.map(input => input.checked))); } catch {}
      document.dispatchEvent(new Event('lab-progress'));
    }));
    lab.querySelector('[data-confirm-reset]').addEventListener('click', () => {
      controls[1].checked = false;
      controls[1].dispatchEvent(new Event('change', {bubbles: true}));
    });
    group.addEventListener('change', restore);
    restore();
  });
})();

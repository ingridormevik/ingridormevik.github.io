(() => {
  const room = document.getElementById('signal-room');
  if (!room) return;
  const panels = [...room.querySelectorAll('.sr-stage')];
  const goals = [...room.querySelectorAll('.mission-lights li')];
  const editor = document.createElement('div');
  editor.className = 'sr-shared-editor';
  ['.code-editor', '.mission-actions', '.sr-output'].forEach(selector => editor.append(panels[1].querySelector(selector)));
  const nav = document.createElement('div');
  nav.className = 'sr-guided-nav';
  nav.innerHTML = '<button type="button" data-signal-back>← Previous task</button><p role="status" data-signal-task></p><button type="button" data-signal-next></button>';
  room.querySelector('.defend').before(nav);
  const back = nav.querySelector('[data-signal-back]');
  const next = nav.querySelector('[data-signal-next]');
  const status = nav.querySelector('[data-signal-task]');
  const instructions = ['Connect all four lines, then click the preview button.', 'Change the sentence in line 1, then run your code.', 'Edit the same code below. Test that click two restores the present.'];
  let step = 0;
  function update() {
    const verified = goals[step].classList.contains('is-on');
    next.disabled = !verified;
    next.textContent = ['Button connected: write my future →', 'My future works: add the return journey →', 'Take this interaction into my project →'][step];
    status.textContent = verified ? `Task ${step + 1} / 3 verified. Continue when ready.` : instructions[step];
  }
  function show(index) {
    step = index;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    goals.forEach((goal, i) => goal.classList.toggle('is-current-task', i === index));
    if (index === 1) panels[1].append(editor);
    if (index === 2) panels[2].querySelector('.mission-actions').before(editor);
    editor.hidden = index === 0;
    back.disabled = index === 0;
    room.querySelector('.defend').hidden = index !== 2;
    update();
  }
  back.addEventListener('click', () => show(Math.max(0, step - 1)));
  next.addEventListener('click', () => {
    if (step < 2) {
      show(step + 1);
      const title = panels[step].querySelector('h4'); title.tabIndex = -1; title.focus({preventScroll:true});
      panels[step].scrollIntoView({block:'start', behavior:'auto'});
      window.labAudio?.play?.('unlock');
    } else {
      location.hash = 'lab-2-sec-1';
    }
  });
  new MutationObserver(update).observe(room.querySelector('.mission-lights'), {subtree:true, attributes:true, attributeFilter:['class']});
  show(0);
})();

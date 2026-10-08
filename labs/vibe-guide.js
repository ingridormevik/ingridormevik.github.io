// Guided presentation only. Course milestones and notes remain owned by their existing modules.
(() => {
  const root = document.getElementById('ai-coding');
  if (!root) return;
  const calm = () => document.documentElement.classList.contains('access-no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stages = [...root.querySelectorAll('[data-guide-stage]')];
  const buttons = [...root.querySelectorAll('[data-guide-select]')];
  function selectStage(index, focus = true) {
    if (!stages[index]) return;
    const dialog = root.querySelector('[data-zoom-dialog]');
    if (dialog?.open) dialog.close();
    stages.forEach((stage, i) => { stage.hidden = i !== index; });
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const status = root.querySelector('[data-guide-status]');
    if (status) status.textContent = `Stage ${index + 1} of ${stages.length}`;
    if (focus) {
      const heading = stages[index].querySelector('h4,h5') || stages[index];
      heading.tabIndex = -1; heading.focus({preventScroll:true});
      stages[index].scrollIntoView({behavior:calm()?'instant':'smooth',block:'start'});
    }
  }
  buttons.forEach((button,i) => { button.setAttribute('aria-controls',stages[i].id); button.addEventListener('click',()=>selectStage(i)); });
  root.querySelectorAll('[data-guide-next]').forEach(button=>button.addEventListener('click',()=>selectStage(Number(button.dataset.guideNext))));
  function revealHash() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    const index = stages.findIndex(stage=>stage === target || stage.contains(target));
    if (index >= 0) {
      selectStage(index,false);
      const mission = target?.closest('[data-l78-panel]');
      if (mission) root.querySelector(`[data-l78-select="${mission.dataset.l78Panel}"]`)?.click();
    }
  }
  if (stages.length) {
    selectStage(0,false);
    window.addEventListener('hashchange',revealHash);
    root.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
      const target = document.getElementById(a.getAttribute('href').slice(1));
      const index = stages.findIndex(stage=>stage === target || stage.contains(target));
      if (index >= 0) selectStage(index,false);
    }));
    revealHash();
  }
  const shots = [...root.querySelectorAll('.vb-shot')];
  if (shots.length) {
    const controls = document.createElement('div'); controls.className = 'vb-tool-controls';
    const back = document.createElement('button'), next = document.createElement('button'), position = document.createElement('span');
    back.type = next.type = 'button'; back.textContent = '← Previous'; position.setAttribute('role','status');
    controls.append(back,position,next); root.querySelector('.vb-film').after(controls);
    let current = 0;
    function show(index) {
      current = index; shots.forEach((shot,i)=>{shot.hidden=i!==index;});
      back.disabled=index===0; next.textContent=index===shots.length-1?'Build my request →':'Next task →';
      position.textContent=`Tool task ${index+1} / ${shots.length}`;
    }
    back.addEventListener('click',()=>show(Math.max(0,current-1)));
    next.addEventListener('click',()=>current===shots.length-1?selectStage(2):show(current+1)); show(0);
  }
  const rooms = [...root.querySelectorAll('[data-sims-room]')];
  if (rooms.length) {
    root.querySelector('.lab78-rooms').classList.add('is-guided');
    const back = root.querySelector('[data-room-back]'), next = root.querySelector('[data-room-next]');
    let current=0;
    function show(index) {
      current=index; rooms.forEach((room,i)=>{room.hidden=i!==index;});
      back.disabled=index===0; next.disabled=index===rooms.length-1;
      next.textContent=index===0?'Look again →':'Make it yours →';
      root.querySelector('[data-room-position]').textContent=`Room ${index+1} / ${rooms.length}`;
    }
    back.addEventListener('click',()=>show(Math.max(0,current-1)));
    next.addEventListener('click',()=>show(Math.min(rooms.length-1,current+1))); show(0);
  }
})();

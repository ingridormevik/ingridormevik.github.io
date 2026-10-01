(() => {
  const labels=['Check in','Experiment','Save & reflect'];
  const labs=[...document.querySelectorAll('.lab')];
  const active=new Map(labs.map(lab=>[lab.id,0]));
  const completeKey=lab=>`dik105-complete-${lab.id}-${document.getElementById('group').value}`;
  // Reveal one new lab at a time as the preceding lab is completed.
  const OPEN_ALL=false;
  function available(lab){
    const index=labs.indexOf(lab);
    return index===0 || labs.slice(0,index).every(item=>item.dataset.questComplete==='true');
  }
  function ready(lab){return lab.querySelector('[data-paper-arrival]')?.checked || lab.querySelector('[data-checkin]').dataset.checkinReady==='true';}
  function experimentDone(lab){return [...lab.querySelectorAll('[data-check]')].every(x=>x.checked)&&(lab.querySelector('[data-paper-reflection]')?.checked || lab.querySelector('.mission-actions textarea').value.trim().length>=10);}
  function earned(lab){return ready(lab)&&experimentDone(lab);}
  function allowed(lab){return OPEN_ALL?2:!ready(lab)?0:experimentDone(lab)?2:1;}
  function finalReady(lab){return [...lab.querySelectorAll('[data-final]')].every(x=>x.checked);}
  function updateFinal(lab){
    const done=available(lab)&&earned(lab)&&finalReady(lab);
    lab.querySelector('.quest-complete-button').disabled=!done;
    if(!done&&lab.dataset.questComplete==='true'){
      lab.dataset.questComplete='false';
      try{sessionStorage.removeItem(completeKey(lab));}catch{}
      lab.querySelector('.quest-completion-status').textContent='Complete the required steps and confirmations to mark this quest complete.';
    }
  }
  function render(lab,index=active.get(lab.id)||0){
    const open=available(lab),limit=allowed(lab);index=Math.min(index,limit);active.set(lab.id,index);
    lab.classList.toggle('quest-locked',!open);
    lab.querySelector('.quest-content').hidden=!open;lab.querySelector('.quest-preview').hidden=open;
    const previous=labs.indexOf(lab);
    const lockedText=`Complete Lab ${String(previous).padStart(2,'0')} to unlock this experiment.`;
    lab.querySelector('.quest-date-status').textContent=open?'Experiment unlocked':lockedText;
    lab.querySelectorAll('.journey-panel').forEach((panel,i)=>{panel.hidden=!open||i!==index;});
    lab.querySelectorAll('.journey-nav a').forEach((a,i)=>{
      const locked=!open||i>limit;
      a.setAttribute('aria-disabled',String(locked));a.classList.toggle('step-locked',locked);
      if(i===index&&open)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');
      a.querySelector('small').textContent=locked?(i===1?'Confirm your arrival note first':'Complete experiment first'):['Write your arrival note','Your project + guides','Finish your session'][i];
    });
    lab.querySelector('.journey-location').textContent=open?`Step ${index+1} of 3 · ${labels[index]}`:lockedText;
    const hints=lab.querySelectorAll('.quest-requirements');
    hints[0].textContent=ready(lab)?(OPEN_ALL?'Your lab note is ready.':'Experiment unlocked. Your lab note is ready.'):OPEN_ALL?'All steps are open. Write your arrival note on paper and confirm below, or create an on-screen note.':'Write your arrival note on paper and confirm it below, or create an on-screen note to earn your first star.';
    const remaining=[...lab.querySelectorAll('[data-check]')].filter(x=>!x.checked).length;
    const noteOK=lab.querySelector('[data-paper-reflection]')?.checked || lab.querySelector('.mission-actions textarea').value.trim().length>=10;
    hints[1].textContent=experimentDone(lab)?(OPEN_ALL?'All experiment requirements complete.':'All experiment requirements complete. Save & reflect is unlocked.'):`Still needed: ${remaining} milestone${remaining===1?'':'s'}${noteOK?'':', and a reflection on paper or in the note field'}.`;
    hints[2].textContent='Save your files, keep a short reflection and confirm below.';
    lab.querySelectorAll('.journey-next a').forEach((a,i)=>{const locked=!open||i+1>limit;a.setAttribute('aria-disabled',String(locked));a.classList.toggle('step-locked',locked);});
    updateFinal(lab);
    const stamp=document.querySelector(`[data-mission-status="${lab.id.split('-')[1]}"]`);
    if(stamp)stamp.textContent=!open?lockedText:lab.dataset.questComplete==='true'?'✓ Marked complete by you':`Unlocked · Step ${index+1} of 3`;
    const mapLink=document.querySelector(`.lab-nav a[href="#${lab.id}"]`);
    mapLink?.classList.toggle('map-locked',!open);
    mapLink?.setAttribute('aria-describedby',`${lab.id}-lock-status`);
    if(stamp)stamp.id=`${lab.id}-lock-status`;
  }
  function follow(target,focus=false){
    const lab=target?.closest('.lab');if(!lab)return;
    const panel=target.closest('.journey-panel');
    const requested=panel?[...lab.querySelectorAll('.journey-panel')].indexOf(panel):active.get(lab.id)||0;
    render(lab,requested);
    const actual=active.get(lab.id);
    if(!available(lab)||actual!==requested)history.replaceState(null,'','#'+(!available(lab)?lab.id:lab.querySelectorAll('.journey-panel')[actual].id));
    if(focus){const heading=(!available(lab)?lab.querySelector('.quest-preview'):lab.querySelectorAll('.journey-panel')[actual]).querySelector('h3,h4');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  }
  function revealHash(){
    let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}
    follow(target);
    if(!target?.closest('.quest-locked'))for(let el=target;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;
  }
  labs.forEach(lab=>{
    try{
      if(sessionStorage.getItem(completeKey(lab))==='yes'&&ready(lab)&&experimentDone(lab)){
        lab.querySelectorAll('[data-final]').forEach(x=>{x.checked=true;});lab.dataset.questComplete='true';
        lab.querySelector('.quest-completion-status').textContent='Quest marked complete by you. Your progress is recorded in this browser tab.';
      }
    }catch{}
    render(lab);
    lab.querySelectorAll('.journey-nav a,.journey-next a,.finish-mission a').forEach(a=>a.addEventListener('click',event=>{
      const target=document.getElementById(a.getAttribute('href').split('#')[1]);
      if(target?.classList.contains('journey-panel')){
        const requested=[...lab.querySelectorAll('.journey-panel')].indexOf(target);
        if(!available(lab)||requested>allowed(lab)){event.preventDefault();render(lab);lab.querySelectorAll('.quest-requirements')[active.get(lab.id)].scrollIntoView({block:'nearest'});return;}
        follow(target,true);
      }
    }));
    lab.querySelectorAll('[data-check],.mission-actions textarea,[data-final]').forEach(input=>{input.addEventListener('change',()=>labs.forEach(item=>render(item)));input.addEventListener('input',()=>labs.forEach(item=>render(item)));});
    lab.querySelector('[data-confirm-reset]').addEventListener('click',()=>labs.forEach(item=>render(item)));
    lab.querySelector('.quest-complete-button').addEventListener('click',()=>{
      if(!available(lab)||!earned(lab)||!finalReady(lab))return;
      lab.dataset.questComplete='true';lab.querySelector('.quest-completion-status').textContent='Quest marked complete by you. Your progress is recorded in this browser tab.';labs.forEach(item=>render(item));
      try{sessionStorage.setItem(completeKey(lab),'yes');}catch{}
      document.dispatchEvent(new CustomEvent('lab-completed',{detail:{id:lab.id}}));
    });
  });
  document.addEventListener('lab-progress',()=>labs.forEach(lab=>render(lab)));
  window.addEventListener('hashchange',revealHash);revealHash();
  document.getElementById('view')?.addEventListener('change',()=>labs.forEach(lab=>render(lab)));
  document.getElementById('group')?.addEventListener('change',()=>labs.forEach(lab=>{
    lab.querySelectorAll('[data-final]').forEach(x=>{x.checked=false;});lab.dataset.questComplete='false';render(lab);
  }));
  if(labs.length){setInterval(()=>labs.forEach(lab=>render(lab)),30000);document.addEventListener('visibilitychange',()=>labs.forEach(lab=>render(lab)));}
  document.body.classList.add('journey-enabled');
  const origin=new URLSearchParams(location.search).get('lab');
  if(/^[1-5]$/.test(origin||''))document.querySelectorAll('.guide-return').forEach(a=>{a.href=`lab-programme.html#lab-${origin}-workbench`;a.textContent=`← Back to Lab ${origin}: experiment`;});
})();

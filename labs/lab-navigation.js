(() => {
  const labels=['Check in','Experiment','Save & reflect'];
  const labs=[...document.querySelectorAll('.lab')];
  const active=new Map(labs.map(lab=>[lab.id,0]));
  const completeKey=lab=>`dik105-complete-${lab.id}-${document.getElementById('group').value}`;
  const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'});
  const displayDate=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Oslo',day:'numeric',month:'long',year:'numeric'});
  function today() {
    const p=Object.fromEntries(dateFormat.formatToParts(new Date()).map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  }
  // Review mode: every lab and every step is open to everyone. Set to false to restore the date and step gates.
  const OPEN_ALL=true;
  function available(lab){return OPEN_ALL||lab.dataset.openEarly==='true'||today()>=lab.dataset.unlockDate;}
  function ready(lab){return lab.querySelector('[data-checkin]').dataset.checkinReady==='true';}
  function experimentDone(lab){return [...lab.querySelectorAll('[data-check]')].every(x=>x.checked)&&lab.querySelector('.mission-actions textarea').value.trim().length>=10;}
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
    const date=displayDate.format(new Date(lab.dataset.unlockDate+'T12:00:00Z'));
    lab.querySelector('.quest-preview time').textContent=date;
    lab.querySelector('.quest-date-status').textContent=`Opens ${date} · Europe/Oslo`;
    lab.querySelectorAll('.journey-panel').forEach((panel,i)=>{panel.hidden=!open||i!==index;});
    lab.querySelectorAll('.journey-nav a').forEach((a,i)=>{
      const locked=!open||i>limit;
      a.setAttribute('aria-disabled',String(locked));a.classList.toggle('step-locked',locked);
      if(i===index&&open)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');
      a.querySelector('small').textContent=locked?(i===1?'Create your pass first':'Complete experiment first'):['Create your lab pass','Your project + guides','Finish your session'][i];
    });
    lab.querySelector('.journey-location').textContent=open?`Step ${index+1} of 3 · ${labels[index]}`:`Locked until ${date}`;
    const hints=lab.querySelectorAll('.quest-requirements');
    hints[0].textContent=ready(lab)?(OPEN_ALL?'Your lab note is ready.':'Experiment unlocked. Your lab note is ready.'):OPEN_ALL?'All steps are open. Create your on-screen lab note when you are ready.':'Required: your name, an observation of at least 10 characters, and a generated lab pass.';
    const remaining=[...lab.querySelectorAll('[data-check]')].filter(x=>!x.checked).length;
    const noteOK=lab.querySelector('.mission-actions textarea').value.trim().length>=10;
    hints[1].textContent=experimentDone(lab)?(OPEN_ALL?'All experiment requirements complete.':'All experiment requirements complete. Save & reflect is unlocked.'):`Still needed: ${remaining} milestone${remaining===1?'':'s'}${noteOK?'':', and a project note of at least 10 characters'}.`;
    hints[2].textContent='Save your files, keep a short reflection and confirm below.';
    lab.querySelectorAll('.journey-next a').forEach((a,i)=>{const locked=!open||i+1>limit;a.setAttribute('aria-disabled',String(locked));a.classList.toggle('step-locked',locked);});
    updateFinal(lab);
    const stamp=document.querySelector(`[data-mission-status="${lab.id.split('-')[1]}"]`);
    if(stamp)stamp.textContent=!open?`🔒 Opens ${date}`:lab.dataset.questComplete==='true'?'✓ Marked complete by you':`Unlocked · Step ${index+1} of 3`;
    document.querySelector(`.lab-nav a[href="#${lab.id}"]`)?.classList.toggle('map-locked',!open);
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
    lab.querySelectorAll('[data-check],.mission-actions textarea,[data-final]').forEach(input=>{input.addEventListener('change',()=>render(lab));input.addEventListener('input',()=>render(lab));});
    lab.querySelector('[data-confirm-reset]').addEventListener('click',()=>render(lab));
    lab.querySelector('.quest-complete-button').addEventListener('click',()=>{
      if(!available(lab)||!earned(lab)||!finalReady(lab))return;
      lab.dataset.questComplete='true';lab.querySelector('.quest-completion-status').textContent='Quest marked complete by you. Your progress is recorded in this browser tab.';render(lab);
      try{sessionStorage.setItem(completeKey(lab),'yes');}catch{}
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

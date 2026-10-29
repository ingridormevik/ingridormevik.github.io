// A route is a bookmark, not a grade or a gate. No notes or personal details are stored.
(() => {
  const KEY='dik105-halloween-route';
  const picker=document.querySelector('[data-hl-picker]');
  const buttons=[...document.querySelectorAll('[data-hl-route]')];
  const plans=[...document.querySelectorAll('[data-hl-plan]')];
  const labels={build:'Build in the lab',browse:'Browse the library',mix:'A bit of both'};
  const choose=(route,remember=false)=>{
    if(!Object.hasOwn(labels,route)) route='build';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.hlRoute===route)));
    plans.forEach(plan=>{plan.hidden=plan.dataset.hlPlan!==route;});
    document.body.dataset.hhRoom=route;
    document.querySelector('[data-hl-route-status]').textContent=`Your route: ${labels[route]}. You can change it at any time. The library visit is optional.`;
    if(remember){try{localStorage.setItem(KEY,route);}catch{}}
  };
  if(picker){
    document.querySelector('[data-hl-controls]').hidden=false;
    buttons.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.hlRoute,true)));
    let saved='build';try{saved=localStorage.getItem(KEY)||'build';}catch{}
    choose(saved);
  }
  const hints=[
    'Start with the work you already have. One useful next step is plenty.',
    'Not sure what to search for? Describe what someone does in your project.',
    'The shelves can cross subjects. Games, philosophy, art and belonging can meet in one project.',
    'You can peek at the Final Assignment, then come back to what you are making today.',
    'A reference is a way back to an idea. Keep the page you actually read.',
    'The library visit is optional. Building, browsing and a mix are all welcome.'
  ];
  let hint=0;
  const familiar=document.querySelector('[data-hl-familiar]');
  if(familiar){
    familiar.hidden=false;
    familiar.addEventListener('click',()=>{document.querySelector('[data-hl-hint]').textContent=hints[hint++%hints.length];});
  }
  const calm=document.querySelector('[data-hl-calm]');
  if(calm){
    calm.hidden=false;
    calm.addEventListener('click',()=>{
      const quiet=document.body.classList.toggle('hl-quiet');
      calm.setAttribute('aria-pressed',String(quiet));
      calm.textContent=quiet?'Room is quiet · restore motion':'Quiet the room';
    });
  }
  const wake=document.querySelector('[data-hh-wake]');
  if(wake){
    wake.hidden=false;
    wake.addEventListener('click',()=>{
      const awake=document.body.classList.toggle('hh-awake');
      wake.setAttribute('aria-pressed',String(awake));
      wake.textContent=awake?'Let the machine idle':'Wake the machine';
    });
  }
  // A curious ghost follows the pointer gently, without moving navigation or text.
  const moves=()=>!document.body.classList.contains('hl-quiet')&&!document.documentElement?.classList.contains('access-no-motion')&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hl-scene').forEach(scene=>{
    let frame=0;
    scene.addEventListener('pointermove',event=>{
      if(!moves()||frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        const box=scene.getBoundingClientRect();
        scene.style.setProperty('--hh-look-x',`${Math.max(-4,Math.min(4,(event.clientX-box.left)/box.width*8-4))}px`);
        scene.style.setProperty('--hh-look-y',`${Math.max(-3,Math.min(3,(event.clientY-box.top)/box.height*6-3))}px`);
      });
    },{passive:true});
    scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--hh-look-x','0px');scene.style.setProperty('--hh-look-y','0px');});
  });
  // Native details must also open when an old saved link points into the eight-week map.
  const reveal=()=>{
    let node;
    try{node=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;}catch{return;}
    while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
  };
  addEventListener('hashchange',reveal);reveal();
})();

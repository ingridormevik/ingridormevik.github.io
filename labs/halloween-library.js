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
  // Native details must also open when an old saved link points into the eight-week map.
  const reveal=()=>{
    let node;
    try{node=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;}catch{return;}
    while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
  };
  addEventListener('hashchange',reveal);reveal();
})();

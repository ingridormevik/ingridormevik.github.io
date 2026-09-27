(() => {
  const labels=['Check in','Experiment','Save & submit'];
  const labs=[...document.querySelectorAll('.lab')];
  const view=document.getElementById('view');
  const active=new Map(labs.map(lab=>[lab.id,0]));
  function render(lab,index) {
    active.set(lab.id,index);
    const teaching=view?.value==='teacher';
    lab.querySelectorAll('.journey-panel').forEach((panel,i)=>{panel.hidden=!teaching&&i!==index;});
    lab.querySelectorAll('.journey-nav a').forEach((a,i)=>{
      if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');
    });
    lab.querySelector('.journey-location').textContent=teaching?'Teaching view · all three steps shown':`Step ${index+1} of 3 · ${labels[index]}`;
  }
  function revealHash() {
    let target;
    try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}
    const lab=target?.closest('.lab');
    if(lab){
      const panel=target.closest('.journey-panel');
      if(panel)render(lab,[...lab.querySelectorAll('.journey-panel')].indexOf(panel));
      else if(target===lab)render(lab,0);
    }
    for(let el=target;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;
  }
  labs.forEach(lab=>{
    render(lab,0);
    lab.querySelectorAll('.journey-nav a,.journey-next a,.finish-mission a').forEach(a=>{
      a.addEventListener('click',()=>{
        const target=document.getElementById(a.hash.slice(1));
        const panels=[...lab.querySelectorAll('.journey-panel')];
        if(panels.includes(target)){
          render(lab,panels.indexOf(target));
          const heading=target.querySelector('h3,h4');
          if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
        }
      });
    });
  });
  view?.addEventListener('change',()=>labs.forEach(lab=>render(lab,active.get(lab.id))));
  window.addEventListener('hashchange',revealHash);revealHash();
  document.body.classList.add('journey-enabled');
  // Only a whitelisted lab number may set guide return links.
  const origin=new URLSearchParams(location.search).get('lab');
  if(/^[1-5]$/.test(origin||''))document.querySelectorAll('.guide-return').forEach(a=>{
    a.href=`lab-programme.html#lab-${origin}-workbench`;
    a.textContent=`← Back to Lab ${origin}: experiment`;
  });
})();

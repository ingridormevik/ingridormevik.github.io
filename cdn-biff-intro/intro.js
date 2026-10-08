(() => {
  const panels=[...document.querySelectorAll('[data-panel]')],tabs=[...document.querySelectorAll('[data-stage]')];
  function select(index){panels.forEach((p,i)=>p.hidden=i!==index);tabs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===index)));const title=panels[index].querySelector('h1,h2');title.tabIndex=-1;title.focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});}
  tabs.forEach(t=>t.addEventListener('click',()=>select(Number(t.dataset.stage))));document.querySelectorAll('[data-next]').forEach(t=>t.addEventListener('click',()=>select(Number(t.dataset.next))));
  document.querySelectorAll('[data-restart]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('details').forEach(d=>d.open=false);select(0);}));
  const input=document.getElementById('idea'),status=document.getElementById('saved');try{input.value=localStorage.getItem('cdn-biff-intro-idea')||'';}catch(_){}
  input.addEventListener('input',()=>{try{localStorage.setItem('cdn-biff-intro-idea',input.value);status.textContent='Your idea is saved in this browser.';}catch(_){status.textContent='Copy your idea before continuing.';}});
  const motion=document.getElementById('motion');motion.addEventListener('click',()=>{const paused=document.body.classList.toggle('paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume motion':'Pause motion';});
})();

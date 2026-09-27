(() => {
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let chosen=null;
 try{const saved=localStorage.getItem('dik105-motion');if(saved==='on'||saved==='off')chosen=saved;}catch{}
 const enabled=()=>!reduced.matches&&chosen!=='off';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='motion-toggle';
 const status=document.createElement('p');status.className='lab-motion-status';status.setAttribute('role','status');
 document.body.append(status);
 document.querySelector('.studio-header nav')?.append(toggle);
 let clear;
 const animate=(el,frames,options)=>{if(enabled()&&el?.animate)el.animate(frames,options);};
 function sync(){
  document.body.classList.toggle('lab-motion-on',enabled());
  toggle.textContent=enabled()?'Motion: on':'Motion: off';toggle.setAttribute('aria-pressed',String(enabled()));
  toggle.title=reduced.matches?'Reduced motion is enabled on your device.':'Turn decorative movement on or off';
  if(!enabled()){
   document.getAnimations?.().forEach(animation=>{if(animation.effect?.target?.closest?.('.journey-panel,.lab-apparatus,.mission-check'))animation.cancel();});
   document.querySelectorAll('.lab-apparatus').forEach(el=>{el.style.transform='';});
  }
 }
 toggle.addEventListener('click',()=>{chosen=enabled()?'off':'on';try{localStorage.setItem('dik105-motion',chosen);}catch{}sync();});
 reduced.addEventListener('change',sync);sync();
 function unlocked(text){
  status.textContent=text;status.classList.add('show');
  clearTimeout(clear);clear=setTimeout(()=>status.classList.remove('show'),3200);
 }
 const observer=new MutationObserver(records=>{
  for(const record of records){
   const el=record.target;
   if(record.attributeName==='hidden'&&record.oldValue!==null&&!el.hidden&&el.matches('.journey-panel')){
    animate(el,[{opacity:.4,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
   }
   if(record.attributeName==='aria-disabled'&&record.oldValue==='true'&&el.getAttribute('aria-disabled')==='false'&&el.matches('.journey-nav a')&&!el.closest('.lab')?.hidden){
    unlocked(`${el.querySelector('strong').textContent} unlocked`);
    animate(el,[{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:380,easing:'ease-out'});
   }
   if(record.attributeName==='data-quest-complete'&&record.oldValue!=='true'&&el.dataset.questComplete==='true')unlocked('Quest marked complete. Your work is ready for Ingrid to review in MittUiB.');
  }
 });
 document.querySelectorAll('.lab').forEach(lab=>observer.observe(lab,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden','aria-disabled','data-quest-complete']}));
 document.querySelectorAll('.mission-check input').forEach(input=>input.addEventListener('change',()=>{
  if(input.checked)animate(input.closest('label'),[{transform:'scale(.99)'},{transform:'scale(1)'}],{duration:200,easing:'ease-out'});
 }));
 document.querySelectorAll('.exhibition-opening').forEach(hero=>{
  const apparatus=hero.querySelector('.lab-apparatus');if(!apparatus)return;
  hero.addEventListener('pointermove',event=>{
   if(!enabled()||event.pointerType==='touch')return;
   const rect=hero.getBoundingClientRect();
   const x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
   apparatus.style.transform=`translate(${Math.round(x*10)}px,${Math.round(y*8)}px)`;
  });
  hero.addEventListener('pointerleave',()=>{apparatus.style.transform='';});
 });
})();

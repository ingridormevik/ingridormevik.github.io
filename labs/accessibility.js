(() => {
 const bar=document.querySelector('.access-bar');if(!bar)return;
 if(!bar.querySelector('.access-resource-tabs')){const links=document.createElement('nav');links.className='access-resource-tabs';links.setAttribute('aria-label','Lab resources');const credit=document.createElement('a');credit.href='credits.html';credit.textContent='Notes & sources ↗';links.append(credit);bar.append(links);}
 const root=document.documentElement;
 const key='dik105-accessibility-v1';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let preferences={size:100,contrast:false,calm:false};
 try{
  const saved=JSON.parse(localStorage.getItem(key)||'null');
  if(saved&&[100,125,150,200].includes(saved.size))preferences.size=saved.size;
  if(saved){preferences.contrast=saved.contrast===true;preferences.calm=saved.calm===true;}
 }catch{}
 const size=bar.querySelector('[data-access-size]');
 const contrast=bar.querySelector('[data-access-contrast]');
 const calm=bar.querySelector('[data-access-calm]');
 const motion=bar.querySelector('[data-access-motion]');
 const status=bar.querySelector('[data-access-status]');
 let pending=false;
 let motionChoice=null;try{motionChoice=localStorage.getItem('dik105-motion');}catch{}
 function resizeText(){
  pending=false;
  root.style.setProperty('--access-text-scale','1');
  document.querySelectorAll('.access-scalable').forEach(el=>el.classList.remove('access-scalable'));
  if(preferences.size!==100){
   const elements=[...document.body.querySelectorAll('*')].filter(el=>
    !el.closest('svg,script,style,noscript')&&
    (el.matches('input:not([type=checkbox]):not([type=radio]),textarea,select,button')||[...el.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()))
   );
   const bases=elements.map(el=>parseFloat(window.getComputedStyle(el).fontSize));
   elements.forEach((el,i)=>{if(Number.isFinite(bases[i])){el.style.setProperty('--access-base-font',bases[i]+'px');el.classList.add('access-scalable');}});
  }
  root.style.setProperty('--access-text-scale',String(preferences.size/100));
 }
 function queueResize(){if(!pending){pending=true;window.requestAnimationFrame(resizeText);}}
 function motionState(){
  const off=motionChoice==='off';
  motion.checked=reduced.matches||off;
  motion.disabled=reduced.matches;
  root.classList.toggle('access-no-motion',motion.checked);
  bar.querySelector('[data-motion-help]').textContent=reduced.matches?'Your device requests reduced motion; this is respected automatically.':'Turn off decorative motion and animated transitions.';
 }
 function apply(announce=false){
  root.classList.toggle('access-contrast',preferences.contrast);
  root.classList.toggle('access-calm',preferences.calm);
  root.classList.toggle('access-large',preferences.size>100);
  size.value=String(preferences.size);contrast.checked=preferences.contrast;calm.checked=preferences.calm;
  motionState();resizeText();
  let saved=true;try{localStorage.setItem(key,JSON.stringify(preferences));}catch{saved=false;}
  if(announce)status.textContent=`Text ${preferences.size}%. ${preferences.contrast?'High contrast on. ':''}${preferences.calm?'Calm layout on. ':''}${saved?'Preferences saved in this browser.':'Changes apply for this visit; browser saving is unavailable.'}`;
 }
 bar.querySelectorAll('select,input,button').forEach(control=>{control.disabled=false;});
 size.addEventListener('change',()=>{preferences.size=Number(size.value);apply(true);});
 contrast.addEventListener('change',()=>{preferences.contrast=contrast.checked;apply(true);});
 calm.addEventListener('change',()=>{preferences.calm=calm.checked;apply(true);});
 motion.addEventListener('change',()=>{
  const off=motion.checked;motionChoice=off?'off':'on';
  try{localStorage.setItem('dik105-motion',off?'off':'on');}catch{}
  root.classList.toggle('access-no-motion',off);
  document.dispatchEvent(new CustomEvent('lab-preferences-change',{detail:{choice:motionChoice}}));
  status.textContent=off?'Reduced motion on.':'Reduced motion off. Device preferences still take priority.';
 });
 bar.querySelector('[data-access-reset]').addEventListener('click',()=>{
  preferences={size:100,contrast:false,calm:false};motionChoice=null;
  try{localStorage.removeItem('dik105-motion');}catch{}
  root.classList.toggle('access-no-motion',reduced.matches);
  document.dispatchEvent(new CustomEvent('lab-preferences-change',{detail:{choice:motionChoice}}));
  apply(true);status.textContent='Reading preferences reset. Your lab progress and notes are unchanged.';
 });
 document.addEventListener('lab-motion-change',event=>{motionChoice=event.detail.choice;motionState();});
 reduced.addEventListener('change',motionState);
 window.addEventListener('storage',event=>{if(event.key==='dik105-motion'){motionChoice=event.newValue;motionState();document.dispatchEvent(new CustomEvent('lab-preferences-change',{detail:{choice:motionChoice}}));}});
 window.addEventListener('resize',queueResize);
 new MutationObserver(records=>{if(preferences.size!==100&&records.some(record=>record.addedNodes.length))queueResize();}).observe(document.body,{childList:true,subtree:true});
 apply();
 status.textContent='Preferences apply across the lab guides in this browser. Browser zoom also works.';
 const test=document.getElementById('keyboard-example');
 if(test){
  let count=0;test.addEventListener('click',()=>{count++;document.getElementById('keyboard-result').textContent=`Gate opened ${count} ${count===1?'time':'times'}. The same button works with keyboard, touch or pointer.`;});
 }
})();

(() => {
  'use strict';
  const effects=new Set(),timers=new Set();
  const allowed=()=>!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.matches('.access-no-motion,.access-calm')&&!document.body.matches('.access-no-motion,.access-calm');
  function animate(node,frames,options){if(!allowed()||!node?.animate)return;const a=node.animate(frames,options);effects.add(a);a.finished.catch(()=>{}).finally(()=>effects.delete(a));}
  function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);}
  function signal(button){
    animate(button,[{transform:'translateY(0)'},{transform:'translateY(2px)'},{transform:'translateY(0)'}],{duration:180});
    const machine=button.closest('.hr-console,.eq-station,.signal-room,.dc-chamber');
    const art=machine?.querySelector('svg,.sr-page');
    animate(art,[{filter:'brightness(1)'},{filter:'brightness(1.15)'},{filter:'brightness(1)'}],{duration:400});
    if(!allowed())return;
    const rect=button.getBoundingClientRect(),bit=document.createElement('span');bit.className='lab-signal-bit';bit.textContent='01';bit.setAttribute('aria-hidden','true');bit.style.left=`${rect.left+rect.width/2}px`;bit.style.top=`${rect.top}px`;document.body.append(bit);
    animate(bit,[{opacity:0,transform:'translate(-50%,0)'},{opacity:1,offset:.2},{opacity:0,transform:'translate(-50%,-45px)'}],{duration:650});later(()=>bit.remove(),700);
  }
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(button&&!button.disabled&&button.matches('.hr-controls button,.dc-choices button,[data-run-line],[data-sr-button],[data-js-run],[data-js-boss],.eq-station button'))signal(button);});
  let previous=Number(document.querySelector('[data-history-reactor]')?.dataset.restored)||0;
  document.addEventListener('history-restored',event=>{
    const count=Number(event.detail?.count);if(count<=previous)return;previous=count;
    const root=document.querySelector('[data-history-reactor]');if(!root)return;
    const stamp=document.createElement('div');stamp.className='lab-calibration-stamp';stamp.setAttribute('aria-hidden','true');stamp.innerHTML='<span>ARCHIVE RESTORED</span><strong>+40 XP</strong>';root.querySelector('.hr-visual')?.append(stamp);
    animate(stamp,[{opacity:0,transform:'scale(1.1) rotate(-6deg)'},{opacity:1,transform:'scale(1) rotate(-6deg)'}],{duration:280,fill:'both'});
    animate(root.querySelector('.hr-power'),[{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:400});later(()=>stamp.remove(),2300);
  });
  function stop(){effects.forEach(a=>a.cancel());effects.clear();document.querySelectorAll('.lab-signal-bit').forEach(n=>n.remove());}
  document.addEventListener('lab-motion-change',()=>{if(!allowed())stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',()=>{stop();timers.forEach(clearTimeout);timers.clear();});
})();

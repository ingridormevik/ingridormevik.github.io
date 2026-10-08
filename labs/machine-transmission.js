(() => {
  'use strict';
  const channels={1:['1843','cards','The card engine','Instructions become action.'],2:['1936','tape','The tape machine','A rule changes the state. The next action remembers.'],3:['1947 + 1951','bug','Relay detective + sound machine','Inspect, repair, test. Then hear instructions become sound.'],4:['1989','web','The connected world','Follow a link. Find the evidence behind an idea.'],5:['1968','pointer','The pointing machine','Give another person a clear way into your work.']};
  let open=false;
  document.addEventListener('victory-dismissed',event=>{
    const n=event.detail?.lab;if(!channels[n]||open)return;
    const key=`dik105-transmission-seen-${n}`;try{if(localStorage.getItem(key)==='yes')return;}catch(_){}
    open=true;const [year,route,name,lesson]=channels[n],previous=document.activeElement;
    const dialog=document.createElement('dialog');dialog.className='machine-transmission';dialog.setAttribute('aria-labelledby','transmission-title');
    dialog.innerHTML=`<div class="mt-bar"><span>TURING’S LAB / RECEIVER 2058</span><span>INCOMING SIGNAL</span></div><div class="mt-body"><svg viewBox="0 0 360 250" aria-hidden="true"><g stroke="#12151f" stroke-width="6"><rect x="20" y="30" width="320" height="200" rx="8" fill="#8aa0b8"/><rect x="40" y="48" width="280" height="60" fill="#12151f"/><path class="mt-wave" d="M50 78h30l12-18 16 36 16-30 14 20 14-8h155" fill="none" stroke="#c6f15b"/><circle class="mt-dial" cx="265" cy="170" r="40" fill="#e9ca85"/><path d="m265 170 18-26"/><path d="M50 135h130m-130 16h130m-130 16h130m-130 16h130m-130 16h130"/><text x="180" y="94" text-anchor="middle" stroke="none" fill="#c6f15b" font-family="monospace" font-size="12">${year} → 2058</text></g></svg><div><p class="mt-label">ARCHIVE FREQUENCY / ${year}</p><h2 id="transmission-title">You unlocked a whisper<br>from the past.</h2><p class="mt-name">${name}</p><p>${lesson}</p>${n===2?'<p class="mt-catchup">Two signals ready: Lab 1’s card engine and Lab 2’s tape machine.</p>':''}<p class="mt-small">An optional experiment for your next project session. Your saved work stays yours.</p></div></div><div class="mt-actions"><a href="computing-history.html#${route}">Tune into the machine →</a><button type="button" data-mt-later>Keep the signal for later</button><button type="button" data-mt-sound>Replay tuning sound</button></div>`;
    document.body.append(dialog);
    function close(){try{localStorage.setItem(key,'yes');}catch(_){}dialog.close();}
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('close',()=>{open=false;dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true});});
    dialog.querySelector('[data-mt-later]').addEventListener('click',close);
    dialog.querySelector('a').addEventListener('click',()=>{try{localStorage.setItem(key,'yes');}catch(_){}});
    dialog.querySelector('[data-mt-sound]').addEventListener('click',()=>window.labAudio?.play?.('radio'));
    dialog.showModal();dialog.querySelector('[data-mt-later]').focus();window.labAudio?.play?.('radio');
  });
})();

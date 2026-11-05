// Eight small practice machines. No network calls or assessment artefact generation.
(() => {
  const root=document.getElementById('lab-6-machines');if(!root)return;
  const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
  const tabs=all('[data-fm-select]'),panels=all('[data-fm-panel]');
  if(tabs.length!==8||panels.length!==8)return;
  const key='dik105-future-stations-v1',completed=new Set();
  try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=8).forEach(n=>completed.add(n));}catch{}
  const names=['Light room','Switchboard','Hidden archive','Gate engine','Evidence desk','Future simulator','Test chamber','Export bay'];let current=1;
  function paint(){
    $('[data-fm-count]').textContent=completed.size+' / 8 stations tried';$('[data-fm-progress]').value=completed.size;
    $('[data-fm-next]').textContent=completed.size===8?'Take a discovery into my project →':'Next station →';
    tabs.forEach((tab,i)=>{const done=completed.has(i+1);tab.classList.toggle('is-tested',done);tab.setAttribute('aria-label',names[i]+(done?', tried':''));$('[data-fm-mark="'+(i+1)+'"]').textContent=done?'✓':'○';});
  }
  function done(id,message){if(completed.has(id))return;completed.add(id);paint();try{window.labAudio?.play(completed.size===8?'complete':'star');}catch{}$('[data-fm-discovery]').textContent=completed.size===8?'All eight stations tried. Choose one discovery to use in your own work.':message;try{localStorage.setItem(key,JSON.stringify([...completed]));}catch{}}
  function select(id,focus=false){current=id;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i+1===id));tab.tabIndex=i+1===id?0:-1;});panels.forEach((panel,i)=>{panel.hidden=i+1!==id;});if(focus)tabs[id-1].focus();}
  tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');tab.addEventListener('click',()=>select(i+1));tab.addEventListener('keydown',event=>{let id;if(event.key==='ArrowRight'||event.key==='ArrowDown')id=current%8+1;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')id=(current+6)%8+1;else if(event.key==='Home')id=1;else if(event.key==='End')id=8;if(id){event.preventDefault();select(id,true);}});});
  panels.forEach((panel,i)=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tabs[i].id);panel.tabIndex=0;});
  $('[data-fm-nav]').setAttribute('role','tablist');$('[data-fm-next]').addEventListener('click',()=>{if(completed.size===8)location.hash='lab-6-sec-2';else select(current%8+1,true);});
  function fromHash(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}const panel=target?.closest('[data-fm-panel]');if(panel&&root.contains(panel))select(Number(panel.dataset.fmPanel));}
  window.addEventListener('hashchange',fromHash);
  const tuned=new Set();
  function tune(kind){const input=$('[data-fm-'+kind+']');const value=Number(input.value);$('[data-fm-specimen]').style.setProperty('--fm-'+kind,value+'px');$('[data-fm-'+kind+'-out]').textContent=value+'px';tuned.add(kind);$('[data-fm-style-status]').textContent='Text '+$('[data-fm-type]').value+'px; space '+$('[data-fm-space]').value+'px. Which combination would you keep?';if(tuned.size===2)done(1,'Light room tried. Keep one visual decision and reuse it.');}
  $('[data-fm-type]').addEventListener('input',()=>tune('type'));$('[data-fm-space]').addEventListener('input',()=>tune('space'));
  let playing=false,switched=false;
  $('[data-fm-switch]').addEventListener('click',()=>{playing=!playing;switched=true;$('[data-fm-signal]').dataset.state=playing?'on':'off';$('[data-fm-transmission]').textContent=playing?'Someone remembers a summer when this room was a garden.':'No message on the screen. The channel is closed.';$('[data-fm-switch-state]').textContent='transmitting = '+playing;$('[data-fm-switch]').textContent=playing?'Close the transmission':'Transmit the memory';$('[data-fm-switch]').setAttribute('aria-pressed',String(playing));$('[data-fm-switch-status]').textContent=playing?'The state changed. What will the next click do?':'You returned to the starting state.';if(switched&&!playing)done(2,'Switchboard tried. You tested both directions of a state change.');});
  const places=new Set(),thoughts={window:'The window looks onto a square that no longer exists.',shelf:'Hidden thought found: “I left this memory where someone else might need it.”',desk:'A note on the desk: this archive is arranged by feeling, not by date.'};
  all('[data-fm-place]').forEach(button=>button.addEventListener('click',()=>{const place=button.dataset.fmPlace;places.add(place);all('[data-fm-place]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('[data-fm-found]').textContent=thoughts[place];if(places.has('shelf')&&places.size>=2)done(3,'Archive explored. A place and an action revealed a piece of story.');}));
  let keys=2,lockedTried=false;
  function gatePaint(open=false){$('[data-fm-keys]').textContent=String(keys);$('[data-fm-door]').dataset.open=String(open);$('[data-fm-door-sign]').textContent=open?'OPEN':'LOCKED';$('[data-fm-key]').disabled=keys>=5;}
  $('[data-fm-gate]').addEventListener('click',()=>{const open=keys>=3;if(!open)lockedTried=true;gatePaint(open);$('[data-fm-gate-status]').textContent=open?'The condition is true. The same action now opens the door.':'The condition is false: 2 is less than 3. Add a key, then try again.';if(open&&lockedTried)done(4,'Gate engine tried. You tested a rule on both sides of its threshold.');});
  $('[data-fm-key]').addEventListener('click',()=>{keys=Math.min(5,keys+1);gatePaint();$('[data-fm-gate-status]').textContent='The state changed. Try the door again.';});
  $('[data-fm-gate-reset]').addEventListener('click',()=>{keys=2;lockedTried=false;gatePaint();$('[data-fm-gate-status]').textContent='Back to two keys. Try the locked route first.';});
  const books=new Set(),records={interface:['Jørgensen’s book is a starting point for investigating how game interfaces communicate possible actions and rules. What in your work tells someone what they can do?','https://mitpress.mit.edu/9780262026864/gameworld-interfaces/','Open Gameworld Interfaces at MIT Press →'],narrative:['Murray’s book is a starting point for participatory narrative. What does the visitor’s action add to the story you are making? Read the relevant passage before building an argument around it.','https://mitpress.mit.edu/9780262533485/hamlet-on-the-holodeck/','Open Hamlet on the Holodeck at MIT Press →']};
  all('[data-fm-book]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.fmBook,record=records[id];books.add(id);all('[data-fm-book]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('[data-fm-evidence]').textContent=record[0];$('[data-fm-book-link]').href=record[1];$('[data-fm-book-link]').textContent=record[2];if(books.size===2)done(5,'Evidence desk tried. Two research directions compared; reading and source checking come next.');}));
  let policy='all',visitor='visitor',exclusionSeen=false;
  function future(){const permitted=policy==='all'||policy==='contributor'&&visitor==='contributor';if(!permitted)exclusionSeen=true;const frame=$('[data-fm-access]');frame.dataset.fmAccess=permitted?'granted':'denied';$('[data-fm-access-icon]').textContent=permitted?'◉':'⊘';$('[data-fm-access-result]').textContent=permitted?(policy==='all'?'The memory opens. Everyone can enter.':'The memory opens because you contributed one.'):policy==='member'?'The memory stays closed. Neither visitor has registered membership.':'The memory stays closed. You have not contributed one.';if(permitted&&exclusionSeen)done(6,'Future simulator tried. One rule changed who could participate. What does your rule imply?');}
  all('[data-fm-policy]').forEach(button=>button.addEventListener('click',()=>{policy=button.dataset.fmPolicy;all('[data-fm-policy]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));future();}));
  all('[data-fm-visitor]').forEach(button=>button.addEventListener('click',()=>{visitor=button.dataset.fmVisitor;all('[data-fm-visitor]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));future();}));
  let clarity=0,firstVersionTried=false;
  $('[data-fm-clarity]').addEventListener('input',()=>{clarity=Number($('[data-fm-clarity]').value);$('[data-fm-bus]').textContent=['→','Begin','Start the story'][clarity];$('[data-fm-clarity-out]').textContent=['Version 1: an arrow','Version 2: a verb','Version 3: the action and its purpose'][clarity];$('[data-fm-bus-story]').textContent='You are the last person at the stop.';$('[data-fm-test-status]').textContent='The mechanism is unchanged. Try this label and compare.';});
  $('[data-fm-bus]').addEventListener('click',()=>{if(clarity===0)firstVersionTried=true;$('[data-fm-bus-story]').textContent='The night bus arrives. Someone has kept a seat for you.';$('[data-fm-test-status]').textContent='The story started. What did the label lead you to expect?';if(firstVersionTried&&clarity===2)done(7,'Test chamber tried. Compare a revision, then test your real work with another person.');});
  const files=new Set(),fileNames={index:'index.html',style:'styles.css',image:'assets/room.png'};
  function packageView(){const wrapped=$('[data-fm-wrapper]').checked,lines=[...files].map(id=>(wrapped?'  ':'')+fileNames[id]);$('[data-fm-package]').textContent=(wrapped?'project/\n':'')+(lines.length?lines.join('\n'):(wrapped?'  ':'')+'(empty)');}
  all('[data-fm-file]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.fmFile;files.has(id)?files.delete(id):files.add(id);button.setAttribute('aria-pressed',String(files.has(id)));button.textContent=(files.has(id)?'✓ ':'+ ')+fileNames[id];packageView();}));
  $('[data-fm-wrapper]').addEventListener('change',packageView);
  $('[data-fm-export-test]').addEventListener('click',()=>{const status=$('[data-fm-export-status]');if(!files.has('index'))status.textContent='No entry page. Add index.html so the host has somewhere to start.';else if($('[data-fm-wrapper]').checked)status.textContent='The entry page is inside an extra folder. Put index.html at the root of the upload.';else if(files.size<3)status.textContent='The page is there, but its styles or image are missing. Include the assets it needs.';else{status.textContent='Package check passed: index.html and its assets are together. Next: publish and test the real URL signed out.';done(8,'Export bay tried. You checked the delivery package; the real published link still needs testing.');}});
  all('.fm-apparatus button,.fm-apparatus input').forEach(control=>{control.disabled=false;});
  $('[data-fm-fallback]').hidden=true;$('[data-fm-nav]').hidden=false;$('[data-fm-footer]').hidden=false;
  paint();select(1);fromHash();root.classList.add('fm-ready');
})();

// Native details work without JavaScript. These buttons only change their view.
(() => {
  const recap=document.getElementById('lab-6-recap');if(!recap)return;
  const controls=recap.querySelector('[data-recap-controls]');
  const reminders=recap.querySelectorAll('.recap-lab');
  if(!controls||!reminders.length)return;
  recap.querySelector('[data-recap-expand]').addEventListener('click',()=>reminders.forEach(item=>{item.open=true;}));
  recap.querySelector('[data-recap-collapse]').addEventListener('click',()=>reminders.forEach(item=>{item.open=false;}));
  controls.hidden=false;
})();

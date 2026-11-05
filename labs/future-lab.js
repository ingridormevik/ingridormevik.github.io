(() => {
  let started=false,observer;
  function start(){
    if(started||!document.querySelector('[data-fm-markup-ready]'))return;
    started=true;observer?.disconnect();
    try{
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
    root.dataset.fmDiscoveries=String(completed.size);$('[data-fm-count]').textContent=completed.size+' / 8 stations tried';$('[data-fm-progress]').value=completed.size;
    $('[data-fm-next]').textContent=completed.size===8?'Take a discovery into my project →':'Next station →';
    tabs.forEach((tab,i)=>{const done=completed.has(i+1);tab.classList.toggle('is-tested',done);tab.setAttribute('aria-label',names[i]+(done?', tried':''));$('[data-fm-mark="'+(i+1)+'"]').textContent=done?'✓':'○';});
  }
  function done(id,message){if(completed.has(id))return;completed.add(id);paint();root.dispatchEvent(new CustomEvent('fm-discovery',{detail:{id,count:completed.size}}));try{window.labAudio?.play(completed.size===8?'complete':'star');}catch{}$('[data-fm-discovery]').textContent=completed.size===8?'All eight stations tried. Choose one discovery to use in your own work.':message;try{localStorage.setItem(key,JSON.stringify([...completed]));}catch{}}
  function select(id,focus=false){current=id;root.dataset.fmActive=String(id);tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i+1===id));tab.tabIndex=i+1===id?0:-1;});panels.forEach((panel,i)=>{panel.hidden=i+1!==id;});if(focus)tabs[id-1].focus();}
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
  function packageView(){const wrapped=$('[data-fm-wrapper]').checked;$('.fm-export-machine').dataset.fmPackageState=files.size===3&&!wrapped?'ready':files.size?'partial':'empty';const lines=[...files].map(id=>(wrapped?'  ':'')+fileNames[id]);$('[data-fm-package]').textContent=(wrapped?'project/\n':'')+(lines.length?lines.join('\n'):(wrapped?'  ':'')+'(empty)');}
  all('[data-fm-file]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.fmFile;files.has(id)?files.delete(id):files.add(id);button.setAttribute('aria-pressed',String(files.has(id)));button.textContent=(files.has(id)?'✓ ':'+ ')+fileNames[id];packageView();}));
  $('[data-fm-wrapper]').addEventListener('change',packageView);
  $('[data-fm-export-test]').addEventListener('click',()=>{const status=$('[data-fm-export-status]');if(!files.has('index'))status.textContent='No entry page. Add index.html so the host has somewhere to start.';else if($('[data-fm-wrapper]').checked)status.textContent='The entry page is inside an extra folder. Put index.html at the root of the upload.';else if(files.size<3)status.textContent='The page is there, but its styles or image are missing. Include the assets it needs.';else{$('.fm-export-machine').dataset.fmPackageState='verified';status.textContent='Package check passed: index.html and its assets are together. Next: publish and test the real URL signed out.';done(8,'Export bay tried. You checked the delivery package; the real published link still needs testing.');}});
  // These are controls for the original illustrated engines, not extra lab milestones.
  let cardStep=0,tapeHead=0;
  $('[data-fm-card]')?.addEventListener('click',()=>{
    cardStep=(cardStep+1)%4;
    const labels=['Read a card','Add the values','Print the result','Start another card'];
    $('[data-fm-card]').textContent=labels[cardStep];
    $('[data-fm-card-output]').textContent=['Input: 2 + 3','READ: 2 and 3 are in memory','ADD: 2 + 3 = 5','PRINT: 5'][cardStep];
    root.dataset.fmCard=String(cardStep);
  });
  $('[data-fm-tape]')?.addEventListener('click',()=>{
    tapeHead=tapeHead===4?1:tapeHead+1;
    $('[data-fm-tape-output]').textContent=Array.from({length:4},(_,i)=>(i===tapeHead?'[':'')+(i<tapeHead?'1':'0')+(i===tapeHead?']':'')).join(' ')+(tapeHead===4?' · done':'');
    root.dataset.fmTape=String(tapeHead);
  });
  all('.fm-apparatus button,.fm-apparatus input,.fm-engine-controls button').forEach(control=>{control.disabled=false;});
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

// The existing lab motion controls govern the cabinet loops as well as its artwork.
(() => {
  const root=document.getElementById('lab-6-machines');if(!root)return;
  const lab=root.closest('.lab'),workbench=root.closest('.journey-panel');
  const html=document.documentElement||document.body;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let inView=true,queued=false,rewardTimer,localPaused=false;
  let waitingMotionOff=false,waitingCalm=false;
  try{waitingMotionOff=localStorage.getItem('dik105-motion')==='off';waitingCalm=JSON.parse(localStorage.getItem('dik105-accessibility-v1')||'null')?.calm===true;}catch{}
  const motionStatus=root.querySelector('[data-fm-motion-status]'),motionToggle=root.querySelector('[data-fm-motion-toggle]');
  function reason(){
    if(reduced?.matches)return 'device';
    if(html.classList.contains('access-calm')||(waitingCalm&&document.querySelector('[data-access-calm]')?.disabled!==false))return 'calm';
    if(html.classList.contains('access-no-motion')||(waitingMotionOff&&!document.querySelector('.motion-toggle')))return 'settings';
    if(localPaused)return 'local';
    if(document.hidden||!inView||lab?.hidden||workbench?.hidden)return 'hidden';
    return '';
  }
  const paused=()=>Boolean(reason());
  function sync(){
    const why=reason(),off=Boolean(why);root.classList.toggle('fm-motion-paused',off);root.dataset.fmMotion=off?'paused':'running';root.dataset.fmMotionReason=why;
    if(motionStatus)motionStatus.textContent={device:'Your device requests reduced motion. The controls still work.',calm:'Calm layout is on. The controls still work.',settings:'Motion is off in your saved lab settings.',local:'Machinery paused. The controls still work.',hidden:'Machinery waits while this room is out of view.'}[why]||'Machinery running';
    if(motionToggle){motionToggle.textContent=why==='device'||why==='calm'?'Motion settings':off?'Resume machinery':'Pause machinery';motionToggle.setAttribute('aria-pressed',String(!off));}
  }
  function queue(){if(queued)return;queued=true;const update=()=>{queued=false;sync();};if(window.requestAnimationFrame)window.requestAnimationFrame(update);else update();}
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('lab-motion-change',sync);
  document.addEventListener('lab-preferences-change',queue);
  motionToggle?.addEventListener('click',()=>{
    const why=reason();
    if(why==='device'||why==='calm'){
      const settings=document.querySelector('.access-console');if(settings){settings.open=true;settings.querySelector('summary')?.focus();settings.scrollIntoView?.({block:'center'});}return;
    }
    if(why==='settings'){
      const native=document.querySelector('.motion-toggle');
      if(native){native.click();localPaused=false;sync();return;}
      const control=document.querySelector('[data-access-motion]');
      if(control&&!control.disabled){control.checked=false;control.dispatchEvent(new Event('change',{bubbles:true}));localPaused=false;sync();return;}
      // The older preference controllers can still be loading. Record this
      // explicit choice so they read it when they start, without waiting for them.
      waitingMotionOff=false;localPaused=false;html.classList.remove('access-no-motion');
      try{localStorage.setItem('dik105-motion','on');}catch{}
      document.dispatchEvent(new CustomEvent('lab-preferences-change',{detail:{choice:'on'}}));sync();return;
    }
    localPaused=!localPaused;sync();
  });
  reduced?.addEventListener?.('change',sync);
  if(typeof MutationObserver!=='undefined'){
    const observer=new MutationObserver(queue);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    if(document.body!==html)observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    if(lab)observer.observe(lab,{attributes:true,attributeFilter:['hidden']});
    if(workbench)observer.observe(workbench,{attributes:true,attributeFilter:['hidden']});
  }
  if(window.IntersectionObserver){const observer=new window.IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{rootMargin:'100px'});observer.observe(root);}
  root.addEventListener('fm-discovery',()=>{
    if(paused())return;
    clearTimeout(rewardTimer);root.classList.toggle('fm-reward-active',false);
    if(root.offsetWidth!==undefined)void root.offsetWidth;
    root.classList.toggle('fm-reward-active',true);
    rewardTimer=setTimeout(()=>root.classList.toggle('fm-reward-active',false),1100);
  });
  window.addEventListener('pagehide',()=>{root.classList.toggle('fm-motion-paused',true);root.dataset.fmMotion='paused';clearTimeout(rewardTimer);});
  window.addEventListener('pageshow',sync);
  const controls=root.querySelector('[data-fm-motion-controls]');if(controls)controls.hidden=false;
  sync();
})();

// Physical feedback and optional room controls. The original machines own rules.
(() => {
 const root=document.getElementById('lab-6-machines');if(!root)return;
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],tried=new Set(),timers=new Map();let awake=false,frame=0;
 const allowed=()=>root.dataset.fmMotion==='running'&&!document.hidden;
 function check(id,index){const key=id+'-'+index,node=q('[data-fm-checkpoint="'+key+'"]');if(node){node.classList.add('is-on');tried.add(key);}}
 function complete(id){all('[data-fm-panel="'+id+'"] [data-fm-checkpoint]').forEach((node,index)=>check(id,index));}
 all('[data-fm-select].is-tested').forEach(tab=>complete(tab.dataset.fmSelect));
 root.addEventListener('fm-discovery',event=>{if(event.detail?.id)complete(event.detail.id);});
 root.addEventListener('input',event=>{if(event.target.matches('[data-fm-type]'))check(1,0);if(event.target.matches('[data-fm-space]'))check(1,1);if(event.target.matches('[data-fm-clarity]'))delete q('.fm-test-machine').dataset.fmJourney;});
 root.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||b.disabled)return;
  const machine=b.closest('.fm-apparatus,.fm-engine-port');
  if(machine&&allowed()){clearTimeout(timers.get(machine));machine.classList.remove('fm-operated');void machine.offsetWidth;machine.classList.add('fm-operated');timers.set(machine,setTimeout(()=>{machine.classList.remove('fm-operated');timers.delete(machine);},600));}
  const id=Number(b.closest('[data-fm-panel]')?.dataset.fmPanel);
  if(b.matches('[data-fm-switch]')){if(q('[data-fm-signal]').dataset.state==='on')check(2,0);else if(tried.has('2-0'))check(2,1);}
  if(b.matches('[data-fm-place]')){check(3,b.dataset.fmPlace==='shelf'?0:1);root.dataset.fmArchive=b.dataset.fmPlace;}
  if(b.matches('[data-fm-gate]'))check(4,q('[data-fm-door]').dataset.open==='true'?1:0);
  if(id===4){const keys=Number(q('[data-fm-keys]').textContent);all('.fm-key-rack i').forEach((key,index)=>key.classList.toggle('is-held',index<keys));}
  if(b.matches('[data-fm-book]'))check(5,b.dataset.fmBook==='interface'?0:1);
  if(id===6){if(q('[data-fm-access]').dataset.fmAccess==='denied')check(6,0);else if(tried.has('6-0'))check(6,1);}
  if(b.matches('[data-fm-bus]')){const version=Number(q('[data-fm-clarity]').value);if(version===0)check(7,0);if(version===2&&tried.has('7-0'))check(7,1);b.closest('.fm-test-machine').dataset.fmJourney='arrived';}
  if(id===8){if(q('[data-fm-file=index]').getAttribute('aria-pressed')==='true')check(8,0);if(q('[data-fm-file=style]').getAttribute('aria-pressed')==='true'&&q('[data-fm-file=image]').getAttribute('aria-pressed')==='true')check(8,1);if(q('.fm-export-machine').dataset.fmPackageState==='verified')check(8,2);}
 });
 function power(){root.dataset.fmPower=awake?'awake':'idle';const b=q('[data-fm-wake]');b.setAttribute('aria-pressed',String(awake));b.textContent=awake?'Let the lab idle':'Wake the lab';q('[data-fm-power-status]').textContent=awake?(allowed()?'The equipment picks up speed. Choose an experiment below.':'Power is on; animation is paused in the motion controls below.'):'The equipment is idling. Try its controls.';}
 function energy(){const n=Number(root.dataset.fmDiscoveries)||0;all('.fm-current>i').forEach((lamp,index)=>lamp.classList.toggle('is-earned',index<n));}
 q('[data-fm-wake]').addEventListener('click',()=>{awake=!awake;power();if(awake&&allowed())try{window.labAudio?.play('transmit');}catch{}});
 q('[data-fm-room-controls]').hidden=false;power();energy();
 new MutationObserver(records=>{if(records.some(r=>r.attributeName==='data-fm-motion'))power();if(records.some(r=>r.attributeName==='data-fm-discoveries'))energy();}).observe(root,{attributes:true,attributeFilter:['data-fm-motion','data-fm-discoveries']});
 const art=q('[data-native-lab-art]');
 function clear(){if(frame){cancelAnimationFrame(frame);frame=0;}art.style.removeProperty('--fm-look-x');art.style.removeProperty('--fm-look-y');}
 art.addEventListener('pointermove',event=>{if(!allowed()||event.pointerType==='touch'||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!allowed())return;const box=art.getBoundingClientRect();if(!box.width||!box.height)return;art.style.setProperty('--fm-look-x',Math.max(-4,Math.min(4,(event.clientX-box.left)/box.width*8-4))+'px');art.style.setProperty('--fm-look-y',Math.max(-3,Math.min(3,(event.clientY-box.top)/box.height*6-3))+'px');});},{passive:true});
 art.addEventListener('pointerleave',clear);
 function stop(){clear();timers.forEach(clearTimeout);timers.clear();all('.fm-operated').forEach(node=>node.classList.remove('fm-operated'));}
 document.addEventListener('lab-motion-change',stop);document.addEventListener('lab-preferences-change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});addEventListener('pagehide',stop);
})();

// Six forms, six small actions. Nothing is generated for an assessed project.
document.querySelectorAll('[data-genre-playground]').forEach(root=>{
  const q=s=>root.querySelector(s),stage=q('[data-genre-stage]');let mode='art',turn=0,palette=0,moves=0,notes=[],layers=new Set();
  const specs={art:['What changes when the composition moves?','ART / FORM + MOVEMENT',1,'Try the Light room for scale and spacing.'],game:['Can you reach the exit?','GAME / STATE + RULES',4,'Try the Gate engine to test a condition.'],literature:['Which memory do you keep?','E-LIT / CHOICE + LANGUAGE',3,'Try the Hidden archive to connect place and story.'],sound:['What can three notes suggest?','SOUND / SEQUENCE + TIME',2,'Try the Switchboard to connect an action with a response.'],documentary:['How does the viewpoint change the account?','WEBDOC / VIEWPOINT + EVIDENCE',5,'Try the Evidence desk to connect a question with a source.'],hybrid:['What happens when forms meet?','HYBRID / COMBINE + TEST',6,'Try the Future simulator to connect form with a question.']};
  function report(text){q('[data-genre-status]').textContent=text;root.dispatchEvent(new CustomEvent('genre-action',{bubbles:true,detail:{genre:mode}}));}
  function button(label,action,pressed){const b=document.createElement('button');b.type='button';b.textContent=label;if(pressed!==undefined)b.setAttribute('aria-pressed',String(pressed));b.addEventListener('click',()=>action(b));q('[data-genre-actions]').append(b);return b;}
  function load(name){
    mode=name;stage.dataset.mode=name;delete stage.dataset.ending;delete stage.dataset.playing;stage.style.removeProperty('--genre-turn');stage.style.removeProperty('--genre-player');
    notes=[];moves=0;turn=0;palette=0;layers.clear();stage.dataset.palette='0';stage.dataset.layers='';
    root.querySelectorAll('[data-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.genre===name)));
    const [question,stamp,station,bridge]=specs[name];q('[data-genre-question]').textContent=question;q('[data-genre-stamp]').textContent=stamp;q('[data-genre-bridge]').textContent=bridge;
    const route=q('[data-genre-route]');route.href=(root.closest('.coding-lab')?'lab-programme.html':'')+'#fm-station-'+station;
    q('[data-genre-actions]').replaceChildren();const words=q('[data-genre-words]');
    if(name==='art'){
      words.textContent='A composition you can change.';q('[data-genre-status]').textContent='Rotate it or change its palette. Compare both versions.';
      button('Rotate',()=>{turn=(turn+1)%4;stage.style.setProperty('--genre-turn',turn*90+'deg');report('Same shapes, different relationships. What draws your eye now?');});
      button('Change palette',()=>{palette=1-palette;stage.dataset.palette=String(palette);report('The colours changed. Which version fits your intention?');});
    }else if(name==='game'){
      words.textContent='0 / 3 moves';q('[data-genre-status]').textContent='Each move changes a value. The exit opens at three.';
      button('Make a move',()=>{if(moves===3){report('You reached the exit. Restart to test the rule again.');return;}moves++;stage.style.setProperty('--genre-player',moves*100+'%');words.textContent=moves+' / 3 moves';stage.dataset.ending=moves===3?'open':'locked';report(moves===3?'The condition is true. The exit opens.':'The value changed; the exit is still closed.');});
      button('Restart',()=>load('game'));
    }else if(name==='literature'){
      words.textContent='At the station, you find a letter addressed to your future self.';q('[data-genre-status]').textContent='Choose what the reader does. Read the consequence.';
      button('Keep the letter',()=>{words.textContent='You keep the letter unopened. Its weight stays with you all the way home.';stage.dataset.ending='keep';report('The reader chose to keep it. What could the next scene remember?');});
      button('Read it here',()=>{words.textContent='Only one line: “You are allowed to begin again.” The train arrives.';stage.dataset.ending='read';report('The choice revealed a different passage. Your words carry the consequence.');});
    }else if(name==='sound'){
      words.textContent='Choose three notes';q('[data-genre-status]').textContent='Build a sequence. Play shows the score; sound follows the lab’s sound setting.';
      ['Low','Mid','High'].forEach((label,index)=>button(label,()=>{if(notes.length===3)notes=[];notes.push(index);words.textContent=notes.map(n=>['LOW','MID','HIGH'][n]).join(' → ');q('.genre-score').dataset.score=notes.join('');q('.genre-score').querySelectorAll('i').forEach((bar,i)=>bar.style.setProperty('--note-height',notes[i]===undefined?'10%':[25,55,90][notes[i]]+'%'));report(notes.length===3?'Three notes ready. Play and compare their order.':'Add another note.');}));
      button('Play',()=>{if(notes.length!==3){q('[data-genre-status]').textContent='Choose three notes first.';return;}stage.dataset.playing=stage.dataset.playing==='a'?'b':'a';try{window.labAudio?.play('history-'+notes.join(''));}catch{}report('Playing '+notes.map(n=>['low','mid','high'][n]).join(' → ')+'. The score remains visible with sound off.');});
    }else if(name==='documentary'){
      words.textContent='One square. Three ways to approach it.';q('[data-genre-status]').textContent='These are fictional examples. Choose a viewpoint and notice what evidence it would need.';
      [['Place','A map marks the bench where people used to wait.','A map needs a maker, date and a clear source.'],['Witness','“I remember meeting everyone here.”','A recorded account needs context, consent and attribution.'],['Sequence','Before: a meeting place. After: an empty route through the square.','A before/after claim needs dated evidence; sequence alone is not proof.']].forEach(([label,text,status])=>button(label,()=>{words.textContent=text;stage.dataset.ending=label.toLowerCase();report(status);}));
    }else{
      words.textContent='Choose the layers you want to combine.';q('[data-genre-status]').textContent='Turn layers on and off. Keep the combination that communicates your idea.';
      ['art','text','score'].forEach(layer=>button({art:'Visual layer',text:'Text layer',score:'Score layer'}[layer],b=>{layers.has(layer)?layers.delete(layer):layers.add(layer);stage.dataset.layers=[...layers].join(' ');b.setAttribute('aria-pressed',String(layers.has(layer)));words.textContent=layers.has('text')?'The same place holds more than one story.':'Choose the layers you want to combine.';report(layers.size>1?'You combined '+layers.size+' forms. Which layer is doing useful work?':'One form can be enough. Try another layer if it adds meaning.');},false));
    }
  }
  root.querySelectorAll('[data-genre]').forEach(b=>b.addEventListener('click',()=>load(b.dataset.genre)));
  load('art');root.classList.add('genre-ready');
});

    }catch(error){
      const fallback=document.querySelector('[data-fm-fallback]');
      if(fallback){fallback.hidden=false;fallback.textContent='The machine controls could not start. Reload this lab to try again. The experiments and guides remain readable below.';}
      console.error('Future lab could not start',error);
    }
  }
  start();
  if(!started){observer=new MutationObserver(start);observer.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',start,{once:true});}
})();

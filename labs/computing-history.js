(() => {
  'use strict';
  const eras = [
    {year:'1843',name:'The card engine',person:'Ada Lovelace / Babbage’s Analytical Engine',fact:'Lovelace’s 1843 notes included an algorithm for the proposed Analytical Engine. Instructions could become a pattern a machine follows.',task:'Load the cards in order: READ → ADD → PRINT.',link:'cards'},
    {year:'1936',name:'The tape machine',person:'Alan Turing',fact:'Turing described a theoretical machine that reads and writes symbols on a tape. A small set of rules can carry out a computation.',task:'Apply this rule to all four cells: read 0, write 1, move right.',link:'tape'},
    {year:'1947',name:'The relay detective',person:'Harvard Mark II team',fact:'The team found a moth in a relay and taped it into the logbook. Engineers already used the word “bug” before this incident.',task:'Inspect the three relays. Find the jam, remove it, then test the circuit.',link:'bug'},
    {year:'1951',name:'The sound machine',person:'Christopher Strachey / Manchester computer',fact:'Strachey programmed music on the Manchester computer. A 1951 recording survives: computing was becoming something you could hear.',task:'Program three notes, then play your sequence. Sound is optional.',link:'sound'},
    {year:'1968',name:'The pointing machine',person:'Doug Engelbart and team',fact:'Their live demonstration showed a mouse, linked text and collaboration. Computing could help people work with ideas together.',task:'Use the pointer or keyboard to open two linked ideas.',link:'pointer'},
    {year:'1989',name:'The connected world',person:'Tim Berners-Lee / CERN',fact:'Berners-Lee proposed a linked information system at CERN. The first browser and server followed in 1990.',task:'Connect the author’s page to the archive, then connect the archive to the reader.',link:'web'}
  ];
  const nav = document.querySelector('.studio-header nav');
  if (nav && !nav.querySelector('[data-history-route]')) {
    const route = document.createElement('a'); route.href='computing-history.html'; route.dataset.historyRoute=''; route.textContent='Time machine ↗'; nav.append(route);
  }
  // These are visual references, not claims that the fantasy machines are replicas.
  const references=[['.mega-lab,.lab-apparatus',0,'CARD ENGINE / gears, instructions and output'],['.lab78-art-gear',0,'1843 / patterns become instructions'],['.lab78-art-wave,.m-wave',3,'1951 / computing becomes sound'],['.lab78-art-code,.lg-tape',1,'1936 / a machine follows rules'],['.eq-bug',2,'1947 / inspect, repair, test'],['.eq-scan,.m-cursor',4,'1968 / pointing at information'],['.eq-orbit,.ml-flow',5,'1989 / connected information']];
  const annotated = new Set();
  references.forEach(([selector,index,label])=> document.querySelectorAll(selector).forEach(node=> {
    const host=node.closest('.eq-machine,.lab-machine,.lab78-part,.studio-hero,.lg-card') || node.parentElement;
    if (!host || annotated.has(host) || host.closest('.history-reactor')) return;
    annotated.add(host);host.dataset.computingReference=eras[index].year;
    // Do not insert an interactive link inside an existing button or link.
    const trace=document.createElement(host.matches('button,a')?'span':'a'); trace.className='history-trace';trace.textContent=label;
    if(trace.tagName==='A')trace.href=`computing-history.html#${eras[index].link}`;
    host.append(trace);
  }));
  const root=document.querySelector('[data-history-reactor]'); if(!root)return;
  const complete=new Set();let current=0,cardStep=0,tapeStep=0,inspected=new Set(),removed=false,notes=[],opened=new Set(),connections=0;
  let saved={};try{saved=JSON.parse(localStorage.getItem('dik105-history-v1')||'{}')||{};}catch(_){}
  const ints=(a,max)=>Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=0&&n<=max):[];
  ints(saved.complete,5).forEach(n=>complete.add(n));
  current=ints([saved.current],5)[0]||0;cardStep=Number.isInteger(saved.cardStep)&&saved.cardStep>=0?saved.cardStep:0;
  tapeStep=ints([saved.tapeStep],4)[0]||0;inspected=new Set(ints(saved.inspected,3));removed=saved.removed===true;
  notes=ints(saved.notes,2).slice(0,3);opened=new Set(ints(saved.opened,1));connections=Number.isInteger(saved.connections)&&saved.connections>=0?saved.connections:0;
  function save(){try{localStorage.setItem('dik105-history-v1',JSON.stringify({complete:[...complete],current,cardStep,tapeStep,inspected:[...inspected],removed,notes,opened:[...opened],connections}));}catch(_){one('[data-hr-total]').textContent='Progress works here, but this browser cannot save it. Keep this tab open.';}}
  const sound=cue=>window.labAudio?.play?.(cue);
  const glyphs=['⚙','▣','⌁','♫','↖','⤴'];
  const graphics=[
    '<g class="hr-gear"><circle cx="125" cy="115" r="58" fill="#e9ca85" stroke-dasharray="14 9" stroke-width="14"/><path d="M75 115h100m-50-50v100"/></g><g class="hr-card"><rect x="210" y="58" width="90" height="110" fill="#edf4dd"/><path d="M228 79h15m20 0h15m-50 25h15m-15 25h15m20 0h15" stroke-width="10"/></g>',
    '<rect x="35" y="86" width="310" height="68" fill="#edf4dd"/><g class="hr-tape"><path d="M85 86v68m52-68v68m52-68v68m52-68v68m52-68v68"/><text x="56" y="131" fill="#080e15" stroke="none" font-size="32" font-family="monospace">0 0 0 0 1</text></g><path d="m178 56 20 30 20-30" fill="#ff9164"/>',
    '<rect x="45" y="58" width="280" height="120" fill="#9fb5f1"/><path d="M65 118h250" stroke="#edf4dd" stroke-width="9"/><g class="hr-moth"><ellipse cx="190" cy="108" rx="18" ry="40" fill="#080e15"/><path d="M180 110Q104 38 141 139L180 126m20-16Q276 38 239 139l-39-13" fill="#e9ca85"/><path d="m186 73-15-16m23 16 15-16"/></g>',
    '<rect x="54" y="43" width="266" height="155" rx="8" fill="#8cdec5"/><circle cx="126" cy="120" r="51" fill="#12252b"/><circle cx="126" cy="120" r="24" fill="#e9ca85"/><g class="hr-wave" stroke="#080e15" stroke-width="10"><path d="M212 84v68m23-47v28m23-58v86m23-53v20"/></g>',
    '<rect x="48" y="38" width="206" height="145" fill="#9fb5f1"/><rect x="64" y="55" width="174" height="108" fill="#12252b"/><path d="M80 82h124m-124 25h90m-90 25h124" stroke="#8cdec5"/><g class="hr-pointer"><path d="m175 100 0 62 17-14 15 24 13-8-16-23 23-5Z" fill="#edf4dd"/></g><rect x="277" y="130" width="47" height="65" rx="12" fill="#e9ca85"/>',
    '<g class="hr-network"><path d="m82 70 201 106m-201-106 188-18m-69 124 69-124" stroke="#8cdec5" stroke-width="8"/><rect x="44" y="41" width="78" height="75" fill="#e9ca85"/><rect x="240" y="25" width="78" height="75" fill="#9fb5f1"/><rect x="164" y="142" width="78" height="75" fill="#ff9164"/><path d="M60 63h43m-43 20h28m170-35h43m-43 20h28m-107 99h43m-43 20h28"/></g>'
  ];
  root.innerHTML=`<header class="hr-heading"><div><p class="hr-kicker">OPTIONAL SIDE QUEST / COMPUTING HISTORY</p><h2>Boot the time machine.</h2><p>Six machines. Six ideas you still use when you code.</p></div><div class="hr-power"><strong data-hr-progress>0 / 6 restored</strong><progress max="6" value="0" aria-label="History machines restored" data-hr-power></progress></div></header><nav class="hr-eras" aria-label="Choose a history machine">${eras.map((era,i)=>`<button type="button" data-hr-era="${i}" aria-controls="hr-console"><span aria-hidden="true">${glyphs[i]}</span><b>${era.year}</b><small>${era.name}</small></button>`).join('')}</nav><section id="hr-console" class="hr-console"><div class="hr-visual" aria-hidden="true" data-hr-visual></div><div class="hr-copy"><p class="hr-kicker" data-hr-person></p><h3 tabindex="-1" data-hr-title></h3><p data-hr-fact></p><p class="hr-task" data-hr-task></p><div class="hr-controls" data-hr-controls></div><p class="hr-status" role="status" data-hr-status></p></div></section><footer><button type="button" data-hr-next>Next machine →</button><p data-hr-total role="status">Practice here, then bring one idea into your own project.</p><a href="credits.html#computing-history-sources">Notes &amp; sources ↗</a></footer>`;
  const hostButton=document.querySelector('[data-host-tip]');
  const tips=['Put instructions in order. Read before you calculate; calculate before you print.', 'Follow the rule exactly. Read the cell, write its new symbol, then move.', 'Inspect before you change anything. Test again after the repair.', 'A sequence can become sound. Program three notes, then listen or follow the visual score.', 'A click can choose a path. Open both ideas with the pointer or keyboard.', 'Links make a route for someone else. Connect the author, archive and reader.'];
  hostButton?.addEventListener('click',()=>{const message=document.querySelector('[data-host-message]');if(message)message.textContent=`MISSION CONTROL / ${eras[current].year}: ${tips[current]}`;sound('transmit');});
  const heading=root.querySelector('.hr-heading h2');
  if(heading){const title=document.createElement('h2');title.textContent=heading.textContent;heading.replaceWith(title);}
  const one=selector=>root.querySelector(selector);
  function run(){ root.classList.remove('hr-running'); void root.offsetWidth; root.classList.add('hr-running'); }
  function status(text){one('[data-hr-status]').textContent=text;}
  function restore(audible=true){
    if(complete.has(current))return;
    complete.add(current);root.querySelector(`[data-hr-era="${current}"]`).classList.add('is-restored');
    one('[data-hr-progress]').textContent=`${complete.size} / 6 restored`;one('[data-hr-power]').value=complete.size;
    one('[data-hr-total]').textContent=complete.size===6?'Six machines restored. Final quiz unlocked.':'Machine restored. Its idea is still part of the tools you use today.';
    if(complete.size===6)one('[data-hr-next]').textContent='Enter the final quiz';
    if(audible)sound(complete.size===6?'unlock':'complete');
    document.dispatchEvent(new CustomEvent('history-restored',{detail:{count:complete.size}}));
  }
  function button(text,fn,parent=one('[data-hr-controls]')){const node=document.createElement('button');node.type='button';node.textContent=text;node.addEventListener('click',()=>{fn();save();});parent.append(node);return node;}
  function load(index,focus=false){
    current=index;root.dataset.era=String(index);root.classList.remove('hr-running');
    document.querySelectorAll('.hr-era-strip span').forEach((node,i)=>node.classList.toggle('is-current',i===index));
    root.querySelectorAll('[data-hr-era]').forEach(node=>node.setAttribute('aria-pressed',String(Number(node.dataset.hrEra)===index)));
    const era=eras[index];one('[data-hr-person]').textContent=`${era.year} / ${era.person}`;one('[data-hr-title]').textContent=era.name;
    one('[data-hr-fact]').textContent=era.fact;one('[data-hr-task]').textContent=era.task;
    one('[data-hr-visual]').innerHTML=`<svg viewBox="0 0 380 250"><g stroke="#080e15" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${graphics[index]}</g></svg><span class="hr-year">${era.year}</span>`;
    const controls=one('[data-hr-controls]');controls.replaceChildren();status(complete.has(index)?'Restored. You can keep experimenting.':'Machine waiting for your input.');
    if(index===0){
      ['READ','ADD','PRINT'].forEach((text,i)=>button(text,()=>{if(i!==cardStep%3){cardStep=0;status('Wrong order. Start with READ: the machine needs input before it can add.');return;}cardStep++;run();status(['Input loaded: 2 + 3.','Computed: 5. Now PRINT.','Output: 5. Instructions made the result.'][(cardStep-1)%3]);if(cardStep%3===0)restore();else sound('transmit');}));
    }else if(index===1){
      const readout=document.createElement('div');readout.className='hr-tape-readout';readout.setAttribute('aria-label','Tape contents');controls.append(readout);
      const tape=()=>readout.textContent=Array.from({length:4},(_,i)=>`${i===tapeStep?'[':''}${i<tapeStep?'1':'0'}${i===tapeStep?']':''}`).join(' ');tape();
      button('Read → write → move',()=>{if(tapeStep>=4){tapeStep=0;}tapeStep++;tape();run();status(`Cell ${tapeStep}: read 0, wrote 1, moved right.${tapeStep===4?' Tape: 1 1 1 1.':''}`);if(tapeStep===4)restore();else sound('transmit');});
    }else if(index===2){
      if(removed)one('.hr-moth').classList.add('is-removed');
      [1,2,3].forEach(n=>button(`Inspect relay ${n}`,()=>{inspected.add(n);status(n===2&&!removed?'Relay 2 is jammed by a moth. Remove it before testing.':`Relay ${n}: contacts clear.`);if(n===2)run();}));
      button('Remove moth',()=>{if(!inspected.has(2)){status('Inspect relay 2 before repairing it.');return;}removed=true;one('.hr-moth').classList.add('is-removed');status('Moth removed. Test the circuit to confirm the repair.');sound('secret');});
      button('Test circuit',()=>{if(!removed){status('Circuit interrupted. Inspect the relays before testing again.');return;}status('Circuit working. Inspect → repair → test: that is still debugging.');restore();});
    }else if(index===3){
      ['LOW','MID','HIGH'].forEach((text,i)=>button(text,()=>{if(notes.length>=3)notes=[];notes.push(i);status(`Program: ${notes.map(n=>['LOW','MID','HIGH'][n]).join(' → ')}. ${notes.length<3?'Add another note.':'Ready to play.'}`);}));
      button('Play sequence',()=>{if(notes.length!==3){status('Load three notes first.');return;}run();sound('history-'+notes.join(''));status('Three instructions become three notes. The visual score works with sound muted too.');one('.hr-wave').setAttribute('data-score',notes.join(''));restore(false);});
    }else if(index===4){
      ['Idea: a mouse','Idea: linked text'].forEach((text,i)=>button(text,()=>{opened.add(i);run();status(i===0?'The pointer makes a place on the screen an action. Your click listeners do that too.':'A link lets readers choose a path through information. Try the other idea.');if(opened.size===2)restore();else sound('star');}));
    }else{
      ['Author → Archive','Archive → Reader'].forEach((text,i)=>button(text,()=>{if(i!==connections%2){connections=0;status('Start with the author’s page. The second link belongs in the archive.');return;}connections++;run();status(i===0?'The author’s page now links to the archive. Add the reader’s path.':'Connected: author → archive → reader. A website is a set of paths people can follow.');if(connections%2===0)restore();else sound('transmit');}));
    }
    if(focus){one('[data-hr-title]').focus({preventScroll:true});save();}
  }
  root.querySelectorAll('[data-hr-era]').forEach(node=>node.addEventListener('click',()=>load(Number(node.dataset.hrEra),true)));
  one('[data-hr-next]').addEventListener('click',()=>{const quiz=root.querySelector('[data-hr-quiz]');if(complete.size===6&&quiz&&!quiz.hidden)quiz.click();else load((current+1)%6,true);});
  function fromHash(){const i=eras.findIndex(era=>location.hash==='#'+era.link);load(i<0?current:i);}
  window.addEventListener('hashchange',fromHash);fromHash();
  complete.forEach(i=>root.querySelector(`[data-hr-era="${i}"]`).classList.add('is-restored'));
  one('[data-hr-progress]').textContent=`${complete.size} / 6 restored`;one('[data-hr-power]').value=complete.size;
  if(complete.size===6){one('[data-hr-next]').textContent='Enter the final quiz';one('[data-hr-total]').textContent='Six machines restored. Final quiz unlocked.';}
  root.dataset.restored=String(complete.size);

  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>root.classList.toggle('is-visible',entry.isIntersecting)).observe(root);
  else root.classList.add('is-visible');
})();

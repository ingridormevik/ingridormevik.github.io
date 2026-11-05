(() => {
  'use strict';
  const root=document.querySelector('[data-coding-museum]');if(!root)return;
  const conversations={
    begin:[['ada','You do not need to know every command. Start with something you want someone to encounter. What should they notice?'],['turing','Then describe one action precisely. What is there before the action, and what should change afterwards?'],['ada','Give the idea a form. A heading, a colour, a pause or a rule can each carry part of its meaning.'],['turing','Run it. Compare the result with your prediction. If they differ, you have a specific question to investigate.']],
    web:[['turing','HTML names the things in the document. A button should be a button, so a visitor can use it with a keyboard too.'],['ada','CSS gives those things their relationships: space, scale, contrast and movement. Choose those relationships for your work.'],['turing','JavaScript can listen for an action, remember a value and change the document. The browser runs it; VS Code is where you edit it.'],['ada','Try the four controls below. Notice which decisions belong to structure, presentation, behaviour and time.']],
    debug:[['ada','The page is suddenly plain white. Before redesigning it, check whether the stylesheet loaded.'],['turing','Look at the first useful error. Read its file and line. A wrong filename is enough to stop the intended result.'],['ada','Keep the last working version. Change one thing, reload, and compare. You can undo a failed experiment.'],['turing','A useful question is: I expected this action to change this value. Instead, this happened. Can you reproduce it?']],
    style:[['ada','When you find a visual language that fits, keep a small record: type, spacing, colour and interaction.'],['turing','Put repeated decisions into shared CSS. Check that every page actually loads that same file.'],['ada','Individual works can need their own composition. Reuse the parts that support them, and explain the exceptions.'],['turing','Consistency also means behaviour. A link should go somewhere; a button should do what its label promises.']],
    judgement:[['turing','A convincing appearance does not prove that a claim or a program is correct. What evidence would let you check it?'],['ada','Generic output becomes a problem when it avoids the particular work. Can you connect each choice to the thing you are making?'],['turing','Try the controls, inspect the code and follow the sources. Record what actually happens.'],['ada','You can change your mind after a test. Keep the parts you can defend, rewrite the vague parts, and make the next version yours.']]
  };
  let topic='begin',step=0;
  const scene=root.querySelector('[data-museum-scene]'),speaker=root.querySelector('[data-speaker-label]'),line=root.querySelector('[data-dialogue-line]'),next=root.querySelector('[data-dialogue-next]');
  function speak(){const [person,words]=conversations[topic][step];scene.dataset.speaker=person;speaker.textContent=person==='ada'?'Ada Lovelace · imagined dialogue':'Alan Turing · imagined dialogue';line.textContent=words;root.querySelector('[data-dialogue-count]').textContent=`${step+1} / ${conversations[topic].length}`;next.textContent=step===conversations[topic].length-1?'Replay conversation':'Continue conversation';root.querySelectorAll('[data-dialogue-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dialogueTopic===topic)));}
  root.querySelectorAll('[data-dialogue-topic]').forEach(b=>b.addEventListener('click',()=>{topic=b.dataset.dialogueTopic;step=0;speak();}));
  next.addEventListener('click',()=>{step=(step+1)%conversations[topic].length;speak();});
  const pause=root.querySelector('[data-museum-pause]');let paused=matchMedia('(prefers-reduced-motion: reduce)').matches||Boolean(document.documentElement?.classList.contains('access-no-motion'));
  const setPause=()=>{root.classList.toggle('museum-paused',paused);if(pause){pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Motion paused':'Pause motion';}};
  pause?.addEventListener('click',()=>{paused=!paused;setPause();});setPause();
  document.addEventListener('lab-motion-change',()=>{paused=Boolean(document.documentElement?.classList.contains('access-no-motion'));setPause();});
  document.addEventListener('lab-preferences-change',event=>{paused=event.detail.choice==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;setPause();});
  document.addEventListener('visibilitychange',()=>root.classList.toggle('museum-offscreen',document.hidden));
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>entries.forEach(entry=>root.classList.toggle('museum-offscreen',!entry.isIntersecting)),{rootMargin:'80px'}).observe(root.querySelector('.specimen-stage'));}
  const specimen=root.querySelector('[data-specimen]'),heading=root.querySelector('[data-specimen-title]'),message=root.querySelector('[data-specimen-message]'),action=root.querySelector('[data-specimen-action]'),code=root.querySelector('[data-bench-code]');
  const text=root.querySelector('[data-title-input]'),spacing=root.querySelector('[data-gap-input]'),border=root.querySelector('[data-border-input]'),colour=root.querySelector('[data-colour-input]'),speed=root.querySelector('[data-speed-input]'),motion=root.querySelector('[data-specimen-motion]');
  let count=0,moving=false,lesson='html';
  const render=()=>{
    heading.textContent=text.value||'My experiment';
    specimen.style.setProperty('--demo-gap',spacing.value+'px');specimen.style.setProperty('--demo-border',border.value+'px');specimen.style.setProperty('--demo-colour',colour.value);specimen.style.setProperty('--demo-speed',speed.value+'s');specimen.classList.toggle('is-moving',moving);
    root.querySelector('[data-gap-value]').textContent=spacing.value+'px';root.querySelector('[data-border-value]').textContent=border.value+'px';root.querySelector('[data-speed-value]').textContent=speed.value+'s';
    message.textContent=count===0?'No visits recorded yet.':`Visits recorded: ${count}.`;action.textContent='Record a visit';motion.setAttribute('aria-pressed',String(moving));motion.textContent=moving?'Stop specimen movement':'Try specimen movement';
    const snippets={html:'<article class="specimen">\n  <h2>'+heading.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</h2>\n  <p id="visits">No visits recorded yet.</p>\n  <button type="button">Record a visit</button>\n</article>',css:'.specimen {\n  display: grid;\n  gap: '+spacing.value+'px;\n  border: '+border.value+'px solid #101114;\n  background: '+colour.value+';\n}',javascript:'let visits = 0;\nbutton.addEventListener("click", () => {\n  visits += 1;\n  message.textContent = "Visits recorded: " + visits;\n});\n// button and message refer to selected elements.\n// Reloading this page resets this example.',animation:'.specimen.is-moving {\n  animation: float '+speed.value+'s ease-in-out infinite;\n}\n@keyframes float {\n  50% { transform: translateY(-12px); }\n}\n@media (prefers-reduced-motion: reduce) {\n  .specimen.is-moving { animation: none; }\n}'};
    code.textContent=snippets[lesson];
    root.querySelectorAll('[data-lesson-panel]').forEach(panel=>panel.hidden=panel.dataset.lessonPanel!==lesson);root.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lesson===lesson)));
  };
  root.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{lesson=b.dataset.lesson;render();}));
  [text,spacing,border,colour,speed].forEach(input=>input.addEventListener('input',render));
  action.addEventListener('click',()=>{count++;render();});root.querySelector('[data-count-reset]').addEventListener('click',()=>{count=0;render();});motion.addEventListener('click',()=>{moving=!moving;render();});
  root.querySelector('[data-bench-controls]').hidden=false;const ownControls=root.querySelector('[data-museum-controls]');if(ownControls)ownControls.hidden=false;root.querySelector('[data-bench-fallback]').hidden=true;
  speak();render();root.classList.add('museum-ready');
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

// Optional browser practice. The station interfaces simulate editor tasks;
// they do not access VS Code, a repository, hosting or a student's files.
(() => {
  const root=document.querySelector('[data-workflow]');if(!root)return;
  const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],tabs=all('[data-flow-tab]'),panels=all('[data-flow-panel]'),done=new Set();let current=0;
  function finish(id){
    if(done.has(id))return;done.add(id);q('[data-flow-tab="'+id+'"]').classList.add('is-tried');
    q('[data-flow-progress]').textContent=done.size+' / 12 tried';q('[data-flow-feedback]').textContent=done.size===12?'Twelve stations tried. Choose one habit to use in your own project.':'Station tried. Keep experimenting, or choose another.';
  }
  function select(index,focus=false){current=index;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});panels.forEach((panel,i)=>panel.hidden=i!==index);if(focus)tabs[index].focus();}
  tabs.forEach((tab,index)=>{tab.setAttribute('role','tab');tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(current+1)%tabs.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(current+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();select(next,true);}});panels[index].setAttribute('role','tabpanel');panels[index].setAttribute('aria-labelledby',tab.id='flow-tab-'+tab.dataset.flowTab);});
  q('[data-flow-map]').setAttribute('role','tablist');q('[data-flow-map]').hidden=false;q('[data-flow-next]').addEventListener('click',()=>select((current+1)%tabs.length,true));
  root.addEventListener('genre-action',()=>finish('genres'));
  function filter(input,buttons){input.addEventListener('input',()=>buttons.forEach(button=>button.hidden=!button.textContent.toLowerCase().includes(input.value.trim().toLowerCase())));}
  filter(q('[data-flow-find]'),all('[data-flow-file]'));
  all('[data-flow-file]').forEach(button=>button.addEventListener('click',()=>{const correct=button.dataset.flowFile===q('[data-flow-job]').value;q('[data-flow-file-result]').textContent=correct?'Opened '+button.dataset.flowFile+'. This file owns your chosen change.':button.dataset.flowFile+' has another job. Check what you wanted to change.';if(correct)finish('files');}));
  const webActions=new Set();q('[data-flow-web]').addEventListener('input',event=>{if(event.target.matches('input,select')){webActions.add(event.target.dataset.titleInput!==undefined?'words':'style');if(webActions.size>1)finish('web');}});
  q('[data-flow-web]').addEventListener('click',event=>{if(event.target.closest('[data-specimen-action]')){webActions.add('event');if(webActions.size>1)finish('web');}});
  filter(q('[data-flow-command]'),all('[data-flow-command-choice]'));
  all('[data-flow-command-choice]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.flowCommandChoice==='format'){q('[data-flow-format-code]').textContent='<article>\n  <h2>My room</h2>\n  <p>Someone is here.</p>\n</article>';q('[data-flow-format-status]').textContent='The nesting is visible. Now you can inspect the structure.';finish('palette');}else q('[data-flow-format-status]').textContent='Useful for another task. Which command formats the document?';}));
  q('[data-flow-connect-css]').addEventListener('click',()=>{const connected=q('[data-flow-css-path]').value==='styles.css';q('[data-flow-path-demo]').classList.toggle('is-connected',connected);q('[data-flow-path-result]').textContent=connected?'Practice log: styles.css found. The specimen now uses its styles.':'Practice log: '+q('[data-flow-css-path]').value+' not found. Check spelling and case.';if(connected)finish('paths');});
  const styleChanges=new Set();function shared(kind){const demo=q('[data-flow-shared]');demo.style.setProperty('--flow-accent',q('[data-flow-accent]').value);demo.style.setProperty('--flow-space',q('[data-flow-space]').value+'px');q('[data-flow-space-value]').textContent=q('[data-flow-space]').value+'px';styleChanges.add(kind);q('[data-flow-style-result]').textContent='All three rooms use this accent and spacing. One shared rule changed them together.';if(styleChanges.size===2)finish('style');}
  q('[data-flow-accent]').addEventListener('change',()=>shared('accent'));q('[data-flow-space]').addEventListener('input',()=>shared('space'));
  const layouts=new Set(['grid']);let resized=false;function layoutCheck(){if(layouts.size===2&&resized){q('[data-flow-layout-result]').textContent='Two layouts compared at a narrower width. Test your real composition with its actual text.';finish('layout');}}
  all('[data-flow-layout]').forEach(button=>button.addEventListener('click',()=>{q('[data-flow-layout-demo]').dataset.layout=button.dataset.flowLayout;all('[data-flow-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));layouts.add(button.dataset.flowLayout);layoutCheck();}));
  q('[data-flow-width]').addEventListener('input',()=>{q('[data-flow-layout-demo]').style.maxWidth=q('[data-flow-width]').value+'px';q('[data-flow-width-value]').textContent=q('[data-flow-width]').value+'px';if(Number(q('[data-flow-width]').value)<350)resized=true;layoutCheck();});
  let connectedSignal=null,signals=0;
  function receive(){signals++;q('[data-flow-signal-count]').textContent=signals+' '+(signals===1?'signal':'signals');q('[data-flow-debug-result]').textContent='The listener received the click and changed the value. Try it again.';finish('debug');}
  q('[data-flow-wire]').addEventListener('click',()=>{
    if(connectedSignal){connectedSignal.removeEventListener('click',receive);connectedSignal=null;}
    const value=q('[data-flow-selector]').value.trim();
    if(value!=='#flow-signal'){q('[data-flow-debug-result]').textContent='Practice error: the selector found no matching button. Compare the id and selector character by character.';return;}
    connectedSignal=q('#flow-signal');connectedSignal.addEventListener('click',receive);q('[data-flow-debug-result]').textContent='Listener connected. Now activate Send a signal.';
  });
  let kept=null,edited=false;
  q('[data-flow-save]').addEventListener('click',()=>{kept=q('[data-flow-draft]').value;edited=false;q('[data-flow-version-result]').textContent='Practice checkpoint kept. Change the sentence, then restore it.';});
  q('[data-flow-draft]').addEventListener('input',()=>{if(kept!==null&&q('[data-flow-draft]').value!==kept)edited=true;});
  q('[data-flow-restore]').addEventListener('click',()=>{if(kept===null){q('[data-flow-version-result]').textContent='Keep a version first.';return;}q('[data-flow-draft]').value=kept;q('[data-flow-version-result]').textContent='The kept sentence is restored. A real project needs saved files and a real checkpoint.';if(edited)finish('version');});
  const effectsChanges=new Set();function effects(kind){const stage=q('[data-flow-effects]'),count=Number(q('[data-flow-parts]').value);stage.replaceChildren();for(let i=0;i<count;i++){const part=document.createElement('i');part.style.setProperty('--part-delay',(-i*.19)+'s');stage.append(part);}stage.style.setProperty('--flow-blur',q('[data-flow-blur]').value+'px');q('[data-flow-parts-value]').textContent=String(count);q('[data-flow-blur-value]').textContent=q('[data-flow-blur]').value+'px';if(kind)effectsChanges.add(kind);if(effectsChanges.size===2){q('[data-flow-effects-result]').textContent='Compare the effect with and without blur. Measure real performance in your own browser.';finish('speed');}}
  q('[data-flow-parts]').addEventListener('input',()=>effects('parts'));q('[data-flow-blur]').addEventListener('input',()=>effects('blur'));effects();
  q('[data-flow-effects-pause]').addEventListener('click',()=>{const paused=q('[data-flow-effects]').classList.toggle('is-paused');q('[data-flow-effects-pause]').setAttribute('aria-pressed',String(paused));q('[data-flow-effects-pause]').textContent=paused?'Resume the effect':'Pause the effect';});
  let testedBroken=false,opened=false;
  q('[data-flow-copy]').addEventListener('input',()=>{q('[data-flow-copy-preview]').textContent=q('[data-flow-copy]').value||'Revolutionising digital experiences';});
  q('[data-flow-weak-button]').addEventListener('click',()=>{
    if(!q('[data-flow-connect-weak]').checked){testedBroken=true;q('[data-flow-weak-result]').textContent='The label promised an archive, but no response was connected.';return;}
    opened=!opened;q('[data-flow-weak-result]').textContent=opened?'Archive open: your memory is here.':'Archive closed.';
    if(testedBroken&&q('[data-flow-copy]').value.trim().length>=8){q('[data-flow-critique-result]').textContent='You replaced a vague claim and tested a working response. Check sources and purpose in your own work too.';finish('critique');}
  });
  let visibility='private',privateTested=false;
  all('[data-flow-visibility]').forEach(button=>button.addEventListener('click',()=>{visibility=button.dataset.flowVisibility;all('[data-flow-visibility]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  q('[data-flow-guest]').addEventListener('click',()=>{q('[data-flow-guest-screen]').dataset.access=visibility;if(visibility==='private'){privateTested=true;q('[data-flow-guest-result]').textContent='Guest view: access denied. Your own login hid this problem.';}else{q('[data-flow-guest-result]').textContent='Guest view: the work opens. Test the main action and ending next.';if(privateTested)finish('publish');}});
  function fromHash(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}const panel=target?.closest('[data-flow-panel]');if(panel&&root.contains(panel))select(panels.indexOf(panel));while(target){if(target.tagName==='DETAILS')target.open=true;target=target.parentElement;}}
  addEventListener('hashchange',fromHash);select(0);fromHash();root.classList.add('workflow-ready');
})();

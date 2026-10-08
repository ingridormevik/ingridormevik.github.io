(() => {
  'use strict';
  const root=document.querySelector('[data-history-reactor]');if(!root)return;
  const questions=[
    {q:'Which idea did the program cards demonstrate?',choices:['A machine follows ordered instructions','A machine invents its own goal','CSS changes the order of instructions'],correct:0,why:'The order matters: read input, perform the operation, then produce output.',glyphs:['▤','?','{ }']},
    {q:'What does the Turing tape machine do?',choices:['Only stores pictures','Reads a symbol, follows a rule, writes and moves','Chooses a new rule by itself'],correct:1,why:'A Turing machine is a theoretical model that manipulates symbols according to rules.',glyphs:['▧','0 → 1','★']},
    {q:'Your interaction fails. What is the useful debugging loop?',choices:['Change everything at once','Ask again without looking at the error','Inspect → repair → test'],correct:2,why:'Find the specific problem, make a change, and test whether that change fixed it.',glyphs:['↯','?','⌕ → ✓']},
    {q:'What did the sound machine turn into notes?',choices:['A sequence of instructions','The colour of the screen','A photograph of Turing'],correct:0,why:'Instructions can control sound as well as text. Our three-note player is a modern demonstration.',glyphs:['▤ → ♫','■','▧']},
    {q:'What did Engelbart’s team demonstrate in 1968?',choices:['The first World Wide Web browser','Only an automatic calculator','A mouse, linked text and collaboration'],correct:2,why:'The demonstration showed ways people could work with information and each other.',glyphs:['WWW','123','↖ + ↗']},
    {q:'How does a link connect your Lab 1 page to another page?',choices:['It changes the font','It gives the reader a path to another document','It removes the need for HTML'],correct:1,why:'Links let readers move between documents. Berners-Lee’s 1989 proposal connected information through hypertext.',glyphs:['Aa','PAGE → PAGE','×']}
  ];
  let restored=0,index=0,answered=false,finished=false;
  const correct=new Set();
  const shell=document.createElement('section');shell.className='hr-quiz';shell.hidden=true;shell.setAttribute('aria-labelledby','hr-quiz-title');
  shell.innerHTML='<p class="hr-kicker">FINAL CHECK / SIX QUICK QUESTIONS</p><h2 id="hr-quiz-title" tabindex="-1">Point. Choose. Explain.</h2><p data-hq-position role="status"></p><h3 data-hq-question></h3><div class="hq-options" data-hq-options></div><p class="hr-status" data-hq-feedback role="status"></p><button type="button" data-hq-next disabled>Next question →</button><button type="button" data-hq-back>Back to the machines</button>';
  root.append(shell);
  const one=s=>shell.querySelector(s);
  const launch=document.createElement('button');launch.type='button';launch.disabled=true;launch.dataset.hrQuiz='';launch.textContent='Restore all six machines to unlock the final quiz';root.querySelector('footer').prepend(launch);
  const xp=document.createElement('p');xp.className='hr-xp';xp.setAttribute('role','status');root.querySelector('.hr-power').append(xp);
  function score(){xp.textContent=`TIME LAB XP / ${restored*40+correct.size*15}`;}
  score();
  document.addEventListener('history-restored',event=>{
    restored=event.detail.count;score();launch.disabled=restored!==6;launch.textContent=restored===6?'Final quiz unlocked. Enter →':`${restored} / 6 machines restored. Final quiz locked.`;
  });
  function render(){
    answered=correct.has(index);const q=questions[index];one('[data-hq-position]').textContent=`Question ${index+1} / 6 · ${correct.size} understood`;
    one('[data-hq-question]').textContent=q.q;const options=one('[data-hq-options]');options.replaceChildren();
    q.choices.forEach((label,i)=>{
      const button=document.createElement('button');button.type='button';button.className='hq-option';
      const symbol=document.createElement('span');symbol.textContent=q.glyphs[i];symbol.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.textContent=label;button.append(symbol,text);button.disabled=answered;
      if(answered&&i===q.correct){button.classList.add('is-correct');button.setAttribute('aria-label',`${label}. Correct answer.`);}
      button.addEventListener('click',()=>{
        if(answered)return;
        if(i!==q.correct){button.classList.add('is-retry');one('[data-hq-feedback]').textContent=`Try again. ${q.why}`;return;}
        answered=true;correct.add(index);score();options.querySelectorAll('button').forEach(b=>b.disabled=true);button.classList.add('is-correct');
        one('[data-hq-feedback]').textContent=`Correct. +15 XP. ${q.why}`;one('[data-hq-next]').disabled=false;window.labAudio?.play?.('star');
      });options.append(button);
    });
    one('[data-hq-feedback]').textContent=answered?`Correct. ${q.why}`:'Choose one answer. You can retry.';
    one('[data-hq-next]').disabled=!answered;one('[data-hq-next]').textContent=index===5?'Launch the time-lab finale →':'Next question →';
  }
  function open(){if(restored!==6)return;shell.hidden=false;root.querySelector('.hr-console').hidden=true;root.querySelector('.hr-eras').hidden=true;render();one('#hr-quiz-title').focus({preventScroll:true});shell.scrollIntoView({block:'start',behavior:'auto'});}
  launch.addEventListener('click',open);
  one('[data-hq-back]').addEventListener('click',()=>{shell.hidden=true;root.querySelector('.hr-console').hidden=false;root.querySelector('.hr-eras').hidden=false;launch.focus();});
  one('[data-hq-next]').addEventListener('click',()=>{
    if(!answered)return;
    if(index<5){index++;render();one('[data-hq-question]').setAttribute('tabindex','-1');one('[data-hq-question]').focus({preventScroll:true});return;}
    if(correct.size!==6)return;
    if(!finished){finished=true;window.labAudio?.play?.('unlock');}
    shell.hidden=true;launch.hidden=true;root.querySelector('[data-hr-next]').hidden=true;
    let finale=root.querySelector('.hr-finale');
    if(!finale){finale=document.createElement('section');finale.className='hr-finale';finale.setAttribute('aria-labelledby','hr-finale-title');finale.innerHTML='<p class="hr-kicker">TIME MACHINE ONLINE / HISTORY DECODED</p><div class="hr-seal" aria-hidden="true">✓<span>330 XP</span></div><h2 id="hr-finale-title" tabindex="-1">Past decoded.<br>Future yours.</h2><p>Six machines restored. Six ideas understood.</p><div class="hr-takeaways"><span>Instructions</span><span>Rules &amp; state</span><span>Debugging</span><span>Sound</span><span>Interfaces</span><span>Links</span></div><p>Bring one idea back into your own page. Make an action, test its result, and decide what the reader can do next.</p><a class="primary" href="lab-programme.html#lab-2-workbench">Return to my Lab 2 project →</a><a href="credits.html#computing-history-sources">Notes &amp; sources ↗</a>';root.append(finale);}
    finale.querySelector('h2').focus({preventScroll:true});finale.scrollIntoView({block:'start',behavior:'auto'});
  });
})();

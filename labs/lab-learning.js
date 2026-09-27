(() => {
 document.querySelectorAll('.learning-challenge').forEach(chamber=>{
  const feedback=chamber.querySelector('.prediction-feedback');
  const check=chamber.querySelector('[data-test-prediction]');
  const run=chamber.querySelector('[data-run-demo]');
  const reset=chamber.querySelector('[data-reset-demo]');
  const sample=chamber.querySelector('.training-sample');
  const initial=sample.textContent;
  let attempts=0;
  [check,run,reset].forEach(button=>{button.disabled=false});
  feedback.textContent='Choose a prediction, then test it. You can change your answer.';
  check.addEventListener('click',()=>{
   const answer=chamber.querySelector('input:checked');
   if(!answer){feedback.textContent='Choose one prediction first.';return;}
   const correct=answer.value===chamber.dataset.correct;
   feedback.textContent=correct?'That prediction fits. Try the example, then explain the result in your own words.':'That is a useful prediction to test. Open the hint, try the example and compare what happens.';
   chamber.querySelector(correct?'.training-explanation':'.training-hint').open=true;
  });
  run.addEventListener('click',()=>{
   attempts++;
   if(chamber.dataset.kind==='1'){sample.style.color='#b9ef86';}
   else if(chamber.dataset.kind==='3')sample.textContent=`Keys: ${2+attempts} · Gate open`;
   else sample.textContent=run.dataset.result;
   chamber.querySelector('.training-attempts').textContent=`Example run ${attempts} ${attempts===1?'time':'times'}. ${chamber.dataset.kind==='2'&&attempts>1?'The assignment keeps setting the same sentence.':'Compare what happened with your prediction.'}`;
  });
  reset.addEventListener('click',()=>{
   attempts=0;sample.textContent=initial;sample.style.color='';sample.style.backgroundColor='';
   chamber.querySelector('.training-attempts').textContent='Example reset. Try another prediction.';
  });
 });
})();

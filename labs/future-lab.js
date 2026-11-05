// Optional questions. Students write and save their own idea in the existing notebook.
(() => {
  const lab=document.getElementById('lab-6');if(!lab)return;
  const controls=lab.querySelector('[data-future-controls]');if(!controls)return;
  const question=lab.querySelector('[data-future-question]');
  const own=lab.querySelector('[data-future-own]');
  const fallback=lab.querySelector('[data-future-fallback]');
  const questions={
    care:'Choose a place or activity you care about. What needs repairing in its future? What could a visitor do that makes a difference?',
    access:'Choose one rule people live with. Who benefits from it? What happens when a visitor follows it, refuses it or changes it?',
    memory:'Choose something someone wants to keep, share or forget. Who decides what remains? What action lets a visitor experience that decision?'
  };
  const initial=question.textContent;
  const choose=key=>{
    lab.querySelectorAll('[data-future-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.futureDirection===key)));
    question.textContent=questions[key]||initial;
  };
  lab.querySelectorAll('[data-future-direction]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.futureDirection)));
  own.addEventListener('click',()=>choose(null));
  controls.hidden=false;own.hidden=false;fallback.hidden=true;
})();

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

(() => {
  const boxes=[...document.querySelectorAll('[data-step]')];
  const key='dik105-setup-progress-v1';
  try { const saved=JSON.parse(localStorage.getItem(key)||'[]'); if(Array.isArray(saved)) boxes.forEach(b=>{b.checked=saved.includes(b.dataset.step)}); } catch {}
  function update(){
    const done=boxes.filter(b=>b.checked);
    document.getElementById('progress').value=done.length;
    document.getElementById('progress-text').textContent=done.length+' of 7 steps';
    boxes.forEach(b=>b.closest('.step').classList.toggle('done',b.checked));
    document.getElementById('finish-status').textContent=done.length===7?'All seven steps are checked. You have a starting point to make your own.':'You have checked '+done.length+' of 7 steps. Return to the steps where you need help.';
    try {localStorage.setItem(key,JSON.stringify(done.map(b=>b.dataset.step)))} catch {}
  }
  boxes.forEach(b=>b.addEventListener('change',update));update();
  document.getElementById('reset-progress').addEventListener('click',()=>{boxes.forEach(b=>{b.checked=false});update()});
  document.getElementById('copy-code').addEventListener('click',async()=>{
    const code=document.getElementById('starter-code');
    const status=document.getElementById('copy-status');
    try {await navigator.clipboard.writeText(code.textContent);status.textContent='Copied! Open index.html in VS Code, paste the code and save.'}
    catch {const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='The code is selected. Copy with Ctrl+C (Windows) or Cmd+C (Mac), then paste into VS Code.'}
  });
})();

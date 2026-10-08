(() => {
  const drawers=[...document.querySelectorAll('.archive-drawer')],input=document.getElementById('source-search'),status=document.querySelector('[data-source-status]');
  input?.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();let found=0;drawers.forEach(d=>{const match=d.textContent.toLowerCase().includes(q);d.hidden=!match;if(q&&match)d.open=true;if(match)found++;});status.textContent=`${found} source drawers available`;});
  function reveal(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target){const drawer=target.closest('.archive-drawer');if(drawer){drawer.hidden=false;drawer.open=true;}target.scrollIntoView({block:'start'});}}
  window.addEventListener('hashchange',reveal);reveal();
})();

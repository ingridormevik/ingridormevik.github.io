(() => {
  const buttons=[...document.querySelectorAll('[data-ge-filter]')];
  const cards=[...document.querySelectorAll('[data-ge-family]')];
  const count=document.querySelector('#ge-count');
  if(!count) return;
  const choose = button => {
    const family=button.dataset.geFilter;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    cards.forEach(card=>{card.hidden=family!=='all'&&card.dataset.geFamily!==family;});
    const visible=cards.filter(card=>!card.hidden).length;
    count.textContent=`${visible} ${visible===1?'route':'routes'} to explore · Open a card to see a research question and search words.`;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>choose(button)));
  const initial = buttons.find(button=>button.getAttribute('aria-pressed')==='true');
  if (initial) choose(initial);
  const reveal = () => {
    let target;
    try { target=document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    while(target){if(target.tagName==='DETAILS')target.open=true;target=target.parentElement;}
  };
  window.addEventListener('hashchange',reveal);
  reveal();
})();

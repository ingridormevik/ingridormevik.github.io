// Library lab mode follows a creation into research. Rooms are navigation, never assessment gates.
(() => {
  const root=document.getElementById('library-session');if(!root)return;
  const panels=[...root.querySelectorAll('[data-ls-panel]')];
  const roomLinks=[...root.querySelectorAll('.ls-room-map [data-ls-go]')];
  const names=['Your creation','Look closer','Find a source','Find meaning'];
  let current=0;
  const go=(index,focus=false,bookmark=false)=>{
    current=Number.isInteger(index)?Math.max(0,Math.min(panels.length-1,index)):0;
    panels.forEach((panel,i)=>{panel.hidden=i!==current;});
    roomLinks.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    document.querySelectorAll('[data-ls-return]').forEach(link=>{link.href='#'+panels[current].id;link.textContent='← Back to room '+(current+1)+': '+names[current];});
    root.querySelector('[data-ls-position]').textContent=`Room ${current+1} of ${panels.length} · ${names[current]}. You can visit any room.`;
    if(bookmark){try{history.replaceState(null,'','#'+panels[current].id);}catch{}}
    if(focus){const heading=panels[current].querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});panels[current].scrollIntoView({block:'start'});}
  };
  root.querySelectorAll('[data-ls-controls]').forEach(node=>{node.hidden=false;});
  root.querySelectorAll('[data-ls-go]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();go(Number(link.dataset.lsGo),true,true);}));
  root.querySelectorAll('[data-ls-next]').forEach(button=>button.addEventListener('click',()=>go(current+1,true,true)));
  root.querySelectorAll('[data-ls-back]').forEach(button=>button.addEventListener('click',()=>go(current-1,true,true)));
  const lenses=[...root.querySelectorAll('[data-ls-lens]')];
  const query=root.querySelector('#ls-query');
  const syncSearch=()=>{
    const words=query.value.trim();
    const oria=root.querySelector('[data-ls-oria]');
    if(oria)oria.href='https://bibsys-d.primo.exlibrisgroup.com/discovery/search?vid=47BIBSYS_UBB%3AUBB&lang=en&tab=default_slot&search_scope=MyInst_and_CI&query='+encodeURIComponent('any,contains,'+words);
    root.querySelectorAll('[data-ls-search-guide]').forEach(link=>{link.href='research-guide.html?q='+encodeURIComponent(words)+'#search-start';});
  };
  query.addEventListener('input',syncSearch);syncSearch();
  lenses.forEach(button=>button.addEventListener('click',()=>{
    lenses.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    root.querySelector('[data-ls-question]').textContent=button.dataset.lsQuestion;
    root.querySelector('[data-ls-words]').textContent=button.dataset.lsQuery;
    root.querySelector('#ls-query').value=button.dataset.lsQuery;
    syncSearch();
    const book=root.querySelector('[data-ls-book]');book.href=button.dataset.lsHref;book.textContent=button.dataset.lsTitle;
    root.querySelector('[data-ls-author]').textContent=button.dataset.lsAuthor;
  }));
  function choice(buttonSelector,panelSelector,key,value){
    const buttons=[...root.querySelectorAll(buttonSelector)],items=[...root.querySelectorAll(panelSelector)];
    const select=selected=>{
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[key]===selected)));
      items.forEach(item=>{item.hidden=item.dataset[value]!==selected;});
    };
    buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset[key])));
    if(buttons.length)select((buttons.find(button=>button.getAttribute('aria-pressed')==='true')||buttons[0]).dataset[key]);
  }
  choice('[data-ls-channel]','[data-ls-channel-panel]','lsChannel','lsChannelPanel');
  choice('[data-ls-book-tab]','[data-ls-book-page]','lsBookTab','lsBookPage');
  const meanings={
    change:'Choose one thing to change because of the reading. Try it, then compare what happens with the version you started from.',
    understand:'Keep the work if it still fits your intention. Use the source to explain an effect, assumption or tension you can now see more clearly.',
    question:'Follow the part that does not fit your first interpretation. Try another search term, a related chapter or an author in the bibliography.'
  };
  const meaningButtons=[...root.querySelectorAll('[data-ls-meaning]')];
  meaningButtons.forEach(button=>button.addEventListener('click',()=>{
    meaningButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    root.querySelector('[data-ls-meaning-text]').textContent=meanings[button.dataset.lsMeaning];
  }));
  const demo=root.querySelector('[data-ls-demo]'),demoAction=root.querySelector('[data-ls-demo-action]');
  if(demo&&demoAction){
    demoAction.hidden=false;demoAction.setAttribute('aria-expanded','false');
    demoAction.addEventListener('click',()=>{
      const open=demo.dataset.lsDemo!=='open';demo.dataset.lsDemo=open?'open':'closed';
      demoAction.textContent=open?'Close the door':'Open the door';demoAction.setAttribute('aria-expanded',String(open));
      root.querySelector('[data-ls-demo-story]').textContent=open?'Inside is a room you recognise. A memory has become visible.':'A closed door. A little light underneath.';
    });
  }
  const follow=()=>{
    let target;try{target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;}catch{return;}
    const panel=target?.closest('[data-ls-panel]');
    if(panel&&panels.includes(panel))go(panels.indexOf(panel));
    if(target?.closest('.al-book')&&current===0)go(2);
    for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
  };
  go(0);addEventListener('hashchange',follow);follow();
})();

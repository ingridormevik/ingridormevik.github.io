(() => {
 const root=document.getElementById('shelf-catalogue');if(!root)return;
 const q=s=>root.querySelector(s),books=[...root.querySelectorAll('.sc-book')];
 const search=q('#sc-search'),topic=q('#sc-topic'),priority=q('#sc-priority'),found=q('#sc-checked'),savedOnly=q('#sc-saved');
 const key='dik105-reading-list-v1',saved=new Set(),size=8;let page=0,storage=true;
 const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[øØ]/g,'o').toLocaleLowerCase();
 try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))value.filter(id=>Number.isInteger(id)&&books.some(b=>b.id==='shelf-book-'+id)).forEach(id=>saved.add(id));}catch{storage=false;}
 function paintSaved(){
  books.forEach(book=>{const button=book.querySelector('[data-sc-save]'),on=saved.has(Number(button.dataset.scSave));button.setAttribute('aria-pressed',String(on));button.textContent=on?'✓ Saved to my list':'Save to my list';});
  q('[data-sc-saved-status]').textContent=saved.size+' saved'+(storage?' in this browser.':' for this visit only.')+' Saving does not mean you have read or checked the source.';
  q('[data-sc-download]').disabled=saved.size===0;
 }
 function render(reset=false){
  if(reset)page=0;
  const terms=fold(search.value.trim()).split(/\s+/).filter(Boolean);
  const filtered=books.filter(book=>(!priority.checked||book.dataset.scPriority==='true')&&(!found.checked||book.dataset.scFound==='true')&&(!topic.value||book.dataset.scTopic===topic.value)&&(!savedOnly.checked||saved.has(Number(book.id.replace('shelf-book-',''))))&&terms.every(term=>fold(book.querySelector('strong').textContent+' '+book.querySelector('small').textContent).includes(term)));
  const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages-1);
  const visible=new Set(filtered.slice(page*size,(page+1)*size));books.forEach(book=>{book.hidden=!visible.has(book);});
  q('[data-sc-count]').textContent=filtered.length?(page*size+1)+'–'+Math.min((page+1)*size,filtered.length)+' of '+filtered.length+' matching records':'No matches. Clear a filter or try another word.';
  q('[data-sc-page]').textContent='Page '+(page+1)+' of '+pages;
  q('[data-sc-prev]').disabled=page===0;q('[data-sc-next]').disabled=page>=pages-1;
  q('.sc-pagination').hidden=filtered.length<=size;
 }
 q('form').addEventListener('submit',event=>event.preventDefault());
 search.addEventListener('input',()=>render(true));[topic,priority,found].forEach(control=>control.addEventListener('change',()=>render(true)));
 savedOnly.addEventListener('change',()=>{if(savedOnly.checked){priority.checked=false;found.checked=false;topic.value='';search.value='';}render(true);});
 q('form').addEventListener('reset',event=>{event.preventDefault();search.value='';topic.value='';priority.checked=false;found.checked=false;savedOnly.checked=false;render(true);search.focus();});
 q('[data-sc-prev]').addEventListener('click',()=>{page--;render();q('[data-sc-count]').scrollIntoView({block:'center'});});
 q('[data-sc-next]').addEventListener('click',()=>{page++;render();q('[data-sc-count]').scrollIntoView({block:'center'});});
 root.querySelectorAll('[data-sc-save]').forEach(button=>button.addEventListener('click',()=>{
  const id=Number(button.dataset.scSave);saved.has(id)?saved.delete(id):saved.add(id);
  try{localStorage.setItem(key,JSON.stringify([...saved]));}catch{storage=false;}
  paintSaved();if(savedOnly.checked)render();
 }));
 q('[data-sc-download]').addEventListener('click',()=>{
  const text=['MY READING LIST','Check the edition, year and pages before citing. These are reading leads, not finished references.',''];
  books.filter(b=>saved.has(Number(b.id.replace('shelf-book-','')))).forEach(book=>{text.push(book.querySelector('strong').textContent,book.querySelector('small').textContent);book.querySelectorAll('a').forEach(link=>text.push(link.textContent+': '+link.href));text.push('My edition / year / pages: __________________','');});
  const url=URL.createObjectURL(new Blob([text.join('\n')],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='my-reading-list.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 function fromHash(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  if(id==='shelf-catalogue'){root.open=true;return;}
  const book=books.find(b=>b.id===id);if(!book)return;
  root.open=true;priority.checked=false;found.checked=false;savedOnly.checked=false;topic.value='';search.value=book.querySelector('strong').textContent;render(true);book.open=true;
 }
 root.querySelectorAll('input,select,button').forEach(control=>{control.disabled=false;});
 paintSaved();render();fromHash();addEventListener('hashchange',fromHash);
})();

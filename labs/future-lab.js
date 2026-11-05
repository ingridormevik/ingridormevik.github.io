/* A classroom illustration, not a resource simulation or student submission. */
(() => {
  const demo=document.querySelector('[data-future-demo]');
  if(!demo)return;
  const budget=8, names=['homes','garden','server'];
  const values={homes:3,garden:3,server:2};
  const total=()=>names.reduce((sum,name)=>sum+values[name],0);
  const render=()=>{
    const remaining=budget-total();
    demo.querySelector('[data-remaining]').textContent=String(remaining);
    for(const name of names){
      demo.querySelector(`[data-value="${name}"]`).textContent=String(values[name]);
      demo.querySelector(`[data-add="${name}"]`).disabled=remaining===0;
      demo.querySelector(`[data-remove="${name}"]`).disabled=values[name]===0;
    }
    const effects=[];
    if(values.homes<3)effects.push('Homes: the fictional neighbourhood has water restrictions.');
    else effects.push('Homes: the fictional neighbourhood has its usual supply.');
    if(values.garden<3)effects.push('Garden: fewer growing beds can be watered.');
    else effects.push('Garden: all its growing beds can be watered.');
    if(values.server<2)effects.push('Server: the fictional archive is offline.');
    else effects.push('Server: the fictional archive is online.');
    demo.querySelector('[data-consequence]').textContent=effects.join(' ');
  };
  demo.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button||!demo.contains(button))return;
    const add=button.dataset.add,remove=button.dataset.remove;
    if(names.includes(add)&&total()<budget)values[add]++;
    if(names.includes(remove)&&values[remove]>0)values[remove]--;
    if(button.hasAttribute('data-demo-reset'))Object.assign(values,{homes:3,garden:3,server:2});
    render();
  });
  demo.querySelector('[data-demo-controls]').hidden=false;
  demo.querySelector('[data-demo-fallback]').hidden=true;
  render();
})();

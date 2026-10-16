(() => {
  const preview=document.querySelector('[data-ae-preview]');
  const buttons=[...document.querySelectorAll('[data-ae-style]')];
  const descriptions={calm:'Calm: quiet colours, generous space and a simple type style.',arcade:'Arcade: strong contrast, bold lettering and a button with a hard shadow.',editorial:'Editorial: a warm page, serif heading and a quieter text link.'};
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const style=button.dataset.aeStyle;
    preview.dataset.aePreview=style;
    buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.querySelector('#ae-status').textContent=descriptions[style];
  }));
  const form=document.querySelector('#rf-form');
  if(!form) return;
  const fields=[...form.querySelectorAll('fieldset')];
  let current=0;
  const bar=document.createElement('div');bar.className='rf-step-bar';
  const status=document.createElement('span');status.setAttribute('role','status');
  const previous=document.createElement('button');previous.type='button';previous.textContent='← Back';
  const next=document.createElement('button');next.type='button';next.textContent='Next question →';
  bar.append(previous,status,next);form.prepend(bar);
  const render=focus=>{
    fields.forEach((field,index)=>{field.hidden=index!==current;});
    status.textContent=`Step ${current+1} of ${fields.length} · Skip anything you are unsure about`;
    previous.disabled=current===0;next.disabled=current===fields.length-1;
    if(focus){const legend=fields[current].querySelector('legend');legend.tabIndex=-1;legend.focus();}
  };
  previous.addEventListener('click',()=>{if(current>0){current--;render(true);}});
  next.addEventListener('click',()=>{if(current<fields.length-1){current++;render(true);}});
  form.addEventListener('reset',()=>{current=0;render(false);});
  render(false);
})();

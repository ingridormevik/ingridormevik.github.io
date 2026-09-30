(() => {
  const make = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const button = text => {
    const el = make('button', text);
    el.type = 'button';
    return el;
  };
  const hashTarget = () => {
    try { return document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
    catch { return null; }
  };
  function revealDetails() {
    let el = hashTarget();
    while (el) {
      if (el.tagName === 'DETAILS') el.open = true;
      el = el.parentElement;
    }
    const target = hashTarget();
    if (target) {
      const direct = [...target.children].find(el => el.tagName === 'DETAILS');
      if (direct) direct.open = true;
    }
  }

  const labs = [...document.querySelectorAll('.lab')];
  if (labs.length) {
    const navLinks = [...document.querySelectorAll('.lab-nav a')];
    let current = 0;
    let all = false;
    const controls = make('div', '', 'lab-switch-controls');
    const previous = button('← Previous lab');
    const next = button('Next lab →');
    const mode = button('Show all labs');
    controls.append(previous, mode, next);
    document.querySelector('.programme-controls').after(controls);
    function select(index, focus = false) {
      current = Math.max(0, Math.min(labs.length - 1, index));
      labs.forEach((lab, i) => { lab.hidden = !all && i !== current; });
      navLinks.forEach((link, i) => {
        if (i === current) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      previous.disabled = current === 0;
      next.disabled = current === labs.length - 1;
      mode.textContent = all ? 'Show one lab' : 'Show all labs';
      mode.setAttribute('aria-pressed', String(all));
      if (focus) {
        const heading = labs[current].querySelector('h2');
        heading.tabIndex = -1;
        heading.focus({preventScroll: true});
        labs[current].scrollIntoView({block:'start'});
      }
    }
    function fromHash() {
      const target = hashTarget();
      const lab = target?.closest('.lab');
      if (lab) select(labs.indexOf(lab));
      revealDetails();
    }
    navLinks.forEach((link, i) => link.addEventListener('click', () => select(i)));
    previous.addEventListener('click', () => {
      select(current - 1, true);
      window.history.replaceState(null, '', '#' + labs[current].id);
    });
    next.addEventListener('click', () => {
      select(current + 1, true);
      window.history.replaceState(null, '', '#' + labs[current].id);
    });
    mode.addEventListener('click', () => { all = !all; select(current); });
    window.addEventListener('hashchange', fromHash);
    select(0);fromHash();
  }

  const steps = [...document.querySelectorAll('[data-reader-step]')];
  if (steps.length) {
    let current = 0;
    let all = false;
    const bar = make('div', '', 'reader-bar');
    const previous = button('← Back');
    const next = button('Next →');
    const mode = button('Show every step');
    mode.className = 'reader-mode';
    const label = make('label', 'Choose a step');
    const select = make('select');
    select.id = 'reader-step';
    label.htmlFor = 'reader-step';
    const status = make('p');status.setAttribute('role','status');
    steps.forEach((step, i) => {
      const option = make('option', `${i + 1}. ${step.querySelector('h2').textContent}`);
      option.value = String(i);
      select.append(option);
    });
    label.append(select);bar.append(previous,label,next,mode,status);
    document.getElementById('steps').before(bar);
    const footer = make('div', '', 'reader-footer');
    const continueButton = button('Continue →');
    footer.append(continueButton);
    document.getElementById('steps').after(footer);
    const ownContinue = steps.every(step => [...step.querySelectorAll('a')].some(a => /^Continue/.test(a.textContent.trim())));
    function show(index, move = false) {
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach((step, i) => {
        step.hidden = !all && i !== current;
        step.classList.toggle('reader-active', i === current);
      });
      select.value = String(current);
      previous.disabled = current === 0;
      next.disabled = current === steps.length - 1;
      continueButton.disabled = current === steps.length - 1;
      footer.hidden = all || ownContinue;
      continueButton.textContent = current === steps.length - 1 ? 'You reached the final step' : 'Continue to the next step →';
      mode.textContent = all ? 'Show one step' : 'Show every step';
      mode.setAttribute('aria-pressed', String(all));
      status.textContent = `Step ${current + 1} of ${steps.length}. Go at your own pace.`;
      document.querySelectorAll('main > .finish').forEach(section => {
        section.hidden = !all && current !== steps.length - 1;
      });
      if (move) {
        const heading = steps[current].querySelector('h2');
        heading.tabIndex = -1;heading.focus({preventScroll:true});
        bar.scrollIntoView({block:'start'});
      }
    }
    function go(index) {
      show(index,true);
      window.history.replaceState(null,'','#'+steps[current].id);
    }
    previous.addEventListener('click',()=>go(current-1));
    next.addEventListener('click',()=>go(current+1));
    continueButton.addEventListener('click',()=>go(current+1));
    select.addEventListener('change',()=>go(Number(select.value)));
    mode.addEventListener('click',()=>{all=!all;show(current);});
    function fromHash() {
      const target=hashTarget();
      const step=target?.closest('[data-reader-step]');
      if(step)show(steps.indexOf(step));
      else if(target?.closest('main > .finish'))show(steps.length-1);
      revealDetails();
    }
    document.querySelectorAll('a[href^="#step-"]').forEach(link=>link.addEventListener('click',()=>{
      const step=document.getElementById(link.getAttribute('href').slice(1));
      if(steps.includes(step))show(steps.indexOf(step));
    }));
    window.addEventListener('hashchange',fromHash);
    show(0);fromHash();
  }

  const search=document.getElementById('book-search');
  if(search){
    const books=[...document.querySelectorAll('.book')];
    const content=books.map(book=>book.textContent.toLowerCase());
    search.addEventListener('input',()=>{
      const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown=0;
      books.forEach((book,i)=>{book.hidden=!terms.every(term=>content[i].includes(term));if(!book.hidden)shown++;});
      document.getElementById('book-status').textContent=shown ? `${shown} ${shown===1?'book matches':'books match'}. Choose what helps your work.` : 'No matches. Try a broader word, such as games, art, history or justice.';
    });
  }
  // Deep links and printing still expose the complete, unabridged guidance.
  window.addEventListener('hashchange',revealDetails);revealDetails();
  let printDetails=[];
  window.addEventListener('beforeprint',()=>{
    printDetails=[...document.querySelectorAll('details')].filter(d=>!d.open);
    printDetails.forEach(d=>{d.open=true;});
  });
  window.addEventListener('afterprint',()=>{
    printDetails.forEach(d=>{d.open=false;});printDetails=[];
  });
})();

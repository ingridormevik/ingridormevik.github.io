// Update Friday's route wherever this shared navigation appears.
(() => {
  const nav=document.querySelector('.studio-header nav');if(!nav)return;
  const map=nav.querySelector('.wf-map-tab'),friday=nav.querySelector('.wf-friday-tab');
  if(!map||!friday)return;
  friday.href='lab-programme.html#lab-6-workbench';
  friday.textContent='6 Nov / Future lab';
  if(!location.pathname.endsWith('/lab-programme.html'))return;
  const follow=()=>{
    let target=null;
    try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
    const currentFriday=document.getElementById(new URL(friday.href,location.href).hash.slice(1))?.closest('.lab');
    const inFriday=Boolean(currentFriday&&target?.closest('.lab')===currentFriday);
    [map,friday].forEach(link=>link.removeAttribute('aria-current'));
    (inFriday?friday:map).setAttribute('aria-current','page');
  };
  addEventListener('hashchange',follow);follow();
})();

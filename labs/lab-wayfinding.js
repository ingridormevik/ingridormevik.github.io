// The map is the home view. Friday is one room within that course map.
(() => {
  const nav=document.querySelector('.studio-header nav');
  if(!nav||!location.pathname.endsWith('/lab-programme.html'))return;
  const map=nav.querySelector('.wf-map-tab'),friday=nav.querySelector('.wf-friday-tab');
  if(!map||!friday)return;
  const follow=()=>{
    let target=null;
    try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
    const inFriday=Boolean(target?.closest('#lab-5'));
    [map,friday].forEach(link=>link.removeAttribute('aria-current'));
    (inFriday?friday:map).setAttribute('aria-current','page');
  };
  addEventListener('hashchange',follow);follow();
})();

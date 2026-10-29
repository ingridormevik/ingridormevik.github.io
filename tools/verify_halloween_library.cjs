const fs=require('fs'),vm=require('vm'),assert=require('assert');
const element=dataset=>({dataset,hidden:true,attrs:{},textContent:'',events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});
function run(saved,blocked=false){
 const buttons=['build','browse','mix'].map(hlRoute=>element({hlRoute}));
 const plans=['build','browse','mix'].map(hlPlan=>element({hlPlan}));
 const controls=element({}),status=element({}),calm=element({}),familiar=element({}),hint=element({});
 const classes=new Set();const writes=[];let hashchange;
 const drawer={tagName:'DETAILS',open:false,parentElement:null};const destination={tagName:'SECTION',parentElement:drawer};
 const location={hash:'#old-map'};
 const nodes={'[data-hl-picker]':{},'[data-hl-controls]':controls,'[data-hl-route-status]':status,'[data-hl-calm]':calm,'[data-hl-familiar]':familiar,'[data-hl-hint]':hint};
 vm.runInNewContext(fs.readFileSync('labs/halloween-library.js','utf8'),{
  document:{querySelector:s=>nodes[s]||null,querySelectorAll:s=>s==='[data-hl-route]'?buttons:plans,getElementById:id=>id==='old-map'?destination:null,body:{classList:{toggle(key){if(classes.has(key)){classes.delete(key);return false;}classes.add(key);return true;}}}},
  localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;},setItem(k,v){if(blocked)throw Error('blocked');writes.push([k,v]);}},
  location,addEventListener:(_,fn)=>{hashchange=fn;}
 });
 assert(!controls.hidden&&!calm.hidden&&!familiar.hidden);assert(drawer.open);
 assert.equal(plans.filter(p=>!p.hidden).length,1);
 const initial=plans.find(p=>!p.hidden).dataset.hlPlan;
 for(let i=0;i<3;i++){
  buttons[i].events.click();assert(!plans[i].hidden);assert.equal(plans.filter(p=>!p.hidden).length,1);
  assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
 }
 calm.events.click();assert(classes.has('hl-quiet'));assert.equal(calm.attrs['aria-pressed'],'true');
 calm.events.click();assert(!classes.has('hl-quiet'));
 familiar.events.click();const first=hint.textContent;for(let i=0;i<6;i++)familiar.events.click();assert.equal(hint.textContent,first);
 location.hash='#%broken';assert.doesNotThrow(hashchange);location.hash='#missing';assert.doesNotThrow(hashchange);
 assert(writes.every(([k])=>k==='dik105-halloween-route'));
 return initial;
}
assert.equal(run('browse'),'browse');
assert.equal(run('__proto__'),'build');assert.equal(run(null,true),'build');
// The library page has hints but no route picker; the same script must work there.
assert.doesNotThrow(()=>vm.runInNewContext(fs.readFileSync('labs/halloween-library.js','utf8'),{document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},location:{hash:''},addEventListener(){}}));
console.log('PASS: all three routes, one visible plan, invalid saved values, blocked storage, calm control, hints, archive deep links and library-only use.');

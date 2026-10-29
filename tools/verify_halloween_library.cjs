const fs=require('fs'),vm=require('vm'),assert=require('assert');
const element=dataset=>({dataset,hidden:true,attrs:{},textContent:'',events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});
function run(saved,blocked=false,reduced=false){
 const buttons=['build','browse','mix'].map(hlRoute=>element({hlRoute}));
 const plans=['build','browse','mix'].map(hlPlan=>element({hlPlan}));
 const controls=element({}),status=element({}),calm=element({}),familiar=element({}),hint=element({}),wake=element({}),scene=element({});
 scene.properties={};scene.style={setProperty(k,v){scene.properties[k]=v;}};scene.getBoundingClientRect=()=>({left:0,top:0,width:1200,height:620});
 const classes=new Set();const writes=[];let hashchange;
 const drawer={tagName:'DETAILS',open:false,parentElement:null};const destination={tagName:'SECTION',parentElement:drawer};
 const location={hash:'#old-map'};
 const nodes={'[data-hl-picker]':{},'[data-hl-controls]':controls,'[data-hl-route-status]':status,'[data-hl-calm]':calm,'[data-hl-familiar]':familiar,'[data-hl-hint]':hint,'[data-hh-wake]':wake};
 vm.runInNewContext(fs.readFileSync('labs/halloween-library.js','utf8'),{
  document:{querySelector:s=>nodes[s]||null,querySelectorAll:s=>s==='[data-hl-route]'?buttons:s==='[data-hl-plan]'?plans:s==='.hl-scene'?[scene]:[],getElementById:id=>id==='old-map'?destination:null,documentElement:{classList:{contains:()=>false}},body:{dataset:{},classList:{contains:k=>classes.has(k),toggle(key){if(classes.has(key)){classes.delete(key);return false;}classes.add(key);return true;}}}},
  localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;},setItem(k,v){if(blocked)throw Error('blocked');writes.push([k,v]);}},
  location,matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{fn();return 1;},addEventListener:(_,fn)=>{hashchange=fn;}
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
 wake.events.click();assert(classes.has('hh-awake'));assert.equal(wake.attrs['aria-pressed'],'true');wake.events.click();assert(!classes.has('hh-awake'));
 scene.events.pointermove({clientX:1200,clientY:620});
 if(reduced)assert.equal(scene.properties['--hh-look-x'],undefined);else assert.equal(scene.properties['--hh-look-x'],'4px');
 scene.events.pointerleave();assert.equal(scene.properties['--hh-look-x'],'0px');
 familiar.events.click();const first=hint.textContent;for(let i=0;i<6;i++)familiar.events.click();assert.equal(hint.textContent,first);
 location.hash='#%broken';assert.doesNotThrow(hashchange);location.hash='#missing';assert.doesNotThrow(hashchange);
 assert(writes.every(([k])=>k==='dik105-halloween-route'));
 return initial;
}
assert.equal(run('browse'),'browse');
assert.equal(run('__proto__'),'build');assert.equal(run(null,true),'build');
run('mix',false,true);
// The library page has hints but no route picker; the same script must work there.
assert.doesNotThrow(()=>vm.runInNewContext(fs.readFileSync('labs/halloween-library.js','utf8'),{document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},location:{hash:''},addEventListener(){}}));
console.log('PASS: routes, storage fallback, quiet mode, machine switch, pointer response, reduced motion, hints and archive links.');

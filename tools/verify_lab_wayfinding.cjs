const fs=require('fs'),vm=require('vm'),assert=require('assert');
function run(hash){
 const link=()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}});
 const map=link(),friday=link(),location={pathname:'/labs/lab-programme.html',hash};let follow;
 const nav={querySelector:s=>s==='.wf-map-tab'?map:friday};
 vm.runInNewContext(fs.readFileSync('labs/lab-wayfinding.js','utf8'),{
  document:{querySelector:()=>nav,getElementById:id=>id==='programme'||id==='lab-5-workbench'?{closest:s=>s==='#lab-5'?{}:null}:id==='all-labs'?{closest:()=>null}:null},
  location,addEventListener:(_,fn)=>{follow=fn;}
 });
 const selected=()=>map.attrs['aria-current']?'map':'friday';
 assert.equal(selected(),['#programme','#lab-5-workbench'].includes(hash)?'friday':'map');
 location.hash='#programme';follow();assert.equal(selected(),'friday');
 location.hash='#all-labs';follow();assert.equal(selected(),'map');
 location.hash='#lab-6';follow();assert.equal(selected(),'map');
 location.hash='#%bad';assert.doesNotThrow(follow);assert.equal(selected(),'map');
}
for(const hash of ['','#all-labs','#programme','#lab-5-workbench'])run(hash);
console.log('PASS: original-map tab, dated Halloween tab, return trip, later labs and malformed fragments.');

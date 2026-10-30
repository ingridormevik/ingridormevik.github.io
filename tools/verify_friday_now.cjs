// Exercise the actual now-bar computation at the changed session boundaries.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fixture=JSON.parse(fs.readFileSync('schedule-test-fixture.json','utf8'));
const source=fs.readFileSync('labs/friday-now.js','utf8').replace(/\r\n/g,'\n');
function run(time,index=4){
 const selectors=new Map();
 const node=()=>({hidden:true,style:{},dataset:{},addEventListener(){},setAttribute(){}});
 const bar=node();bar.querySelector=s=>{if(!selectors.has(s))selectors.set(s,node());return selectors.get(s);};
 const classes={contains:()=>false,add(){},remove(){}};
 const data=fixture.sessions[index];
 const lab={id:'lab-'+(index+1),dataset:{sessionStart:data['session-start'],sessionMinutes:data['session-minutes'],sessionBreaks:data['session-breaks']},querySelector:()=>({textContent:'Test lab'}),querySelectorAll:s=>s==='.agenda-row'?fixture.rows[index].map(minutes=>({dataset:{minutes},classList:classes,querySelector:s=>({textContent:s==='h4'?'Work together':'Open your project.'})})):[]};
 const document={createElement:()=>bar,body:{append(){},classList:classes},documentElement:{style:{}},querySelector:s=>s.startsWith('.lab[')?lab:null,getElementById:()=>null,addEventListener(){}};
 const clock=new Date(time).getTime();
 class FixedDate extends Date{constructor(value){super(value===undefined?clock:value);}static now(){return clock;}}
 const context={document,Date:FixedDate,URLSearchParams,location:{search:'?now='+time},localStorage:{getItem:()=> '495'},sessionStorage:{getItem:()=>null},setTimeout(){},setInterval(){}};
 const exported=source.replace('  tick();\n  setInterval(tick, 15000);','  globalThis.computeForTest=compute;');
 assert(source!==exported,'Test must use the real computation');
 vm.runInNewContext(exported,context);
 return {view:context.computeForTest(),bar};
}
let result=run('2026-10-30T15:00');
assert.equal(result.view.kind,'work');assert.equal(result.bar.dataset.noBreaks,'true');
assert.equal(result.view.title,'Work together');
result=run('2026-10-30T15:25');assert.equal(result.view.kind,'work');assert.equal(result.view.next,'Ends 15:30');
assert.equal(run('2026-10-30T15:29').view.kind,'work');
assert.equal(run('2026-10-30T15:30').view.kind,'after');
assert.equal(run('2026-10-30T15:51').view,null);
assert.equal(run('2026-10-30T14:14').view.kind,'before');
result=run('2026-10-23T09:30',3);assert.equal(result.bar.dataset.noBreaks,'false');assert.equal(result.view.kind,'work');
console.log('PASS: Halloween now bar stays on work at 15:00, ends at 15:30 despite stale morning settings, hides later, and preserves other session lengths.');

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../labs/html-missions.js'),'utf8');
function run(blocked){
  const writes=[];
  function make(id,answers){
    const badge={textContent:''},feedback={textContent:''},text={textContent:'Original'};
    const choices=answers.map(answer=>({dataset:{htmlChoice:answer},disabled:true,setAttribute(){},addEventListener(type,fn){this.click=fn;}}));
    const demo=id==='1'?{addEventListener(type,fn){this.click=fn;}}:null;
    return {dataset:{htmlMission:id},done:false,badge,feedback,choices,text,demo,classList:{add(){}},querySelectorAll(){return choices;},querySelector(s){return {'[data-html-badge]':badge,'[data-html-feedback]':feedback,'[data-html-demo]':demo,'[data-html-demo-text]':text}[s];}};
  }
  const roots=[make('1',['p','button','id']),make('2',['before','after'])];
  roots.forEach(root=>root.classList={add(){root.done=true;}});
  const storage={getItem(){if(blocked)throw Error('blocked');return '["unrelated"]';},setItem(key,value){if(blocked)throw Error('blocked');writes.push([key,JSON.parse(value)]);}};
  vm.runInNewContext(source,{document:{querySelectorAll(){return roots;}},localStorage:storage});
  roots[0].choices[0].click();assert.equal(roots[0].done,false);assert.equal(roots[1].done,false);
  roots[0].choices[1].click();assert.equal(roots[0].done,true);assert.equal(roots[1].done,false);
  roots[0].demo.click();assert.notEqual(roots[0].text.textContent,'Original');
  roots[1].choices[1].click();assert.equal(roots[1].done,true);
  assert(roots.every(root=>root.choices.every(choice=>!choice.disabled)));
  if(!blocked){assert.equal(writes.at(-1)[0],'dik105-html-field-missions-v1');assert.deepEqual(writes.at(-1)[1],['1','2']);}
}
run(false);run(true);
console.log('PASS: incorrect answers do not earn a badge, missions are independent, demo responds and blocked storage does not prevent completion.');

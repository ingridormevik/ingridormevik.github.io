const fs=require('fs'),vm=require('vm'),assert=require('assert');
function el(){return {dataset:{},style:{},textContent:'',value:'',hidden:false,events:{},classList:{toggle(){}},addEventListener(k,fn){this.events[k]=fn;}};}
function run(count){
 const saved={att:{labs:['lab-1','lab-2','lab-3','lab-4'],lect:10},doc:{theme:Array(count).fill('word').join(' ')}};
 const boxes=Array.from({length:8},(_,i)=>{const b=el();b.dataset.fqLab='lab-'+(i+1);b.closest=()=>el();return b;});
 const lect=el();lect.max=10;const attOut=el(),attBar=el();
 const att={querySelectorAll:()=>boxes,querySelector:s=>({'[data-fq-lect]':lect,'[data-fq-att-out]':attOut,'.fq-meter span':attBar})[s]};
 const parts=['link','theme','genre','process','frame'].map(key=>{const p=el();p.dataset={fqPart:key,title:key};p.closest=()=>({querySelector:()=>el()});return p;});
 const total=el(),status=el(),pin=el(),copy=el(),clear=el(),msg=el();
 const doc={querySelectorAll:()=>parts,querySelector:s=>({'[data-fq-total]':total,'[data-fq-status]':status,'.fq-pin':pin,'[data-fq-copy]':copy,'[data-fq-clear]':clear,'[data-fq-docmsg]':msg})[s]};
 let stored;
 vm.runInNewContext(fs.readFileSync('labs/final-quest.js','utf8'),{URLSearchParams,Date,location:{search:''},
  localStorage:{getItem:()=>JSON.stringify(saved),setItem:(_k,v)=>{stored=JSON.parse(v);}},
  document:{querySelector:s=>s==='[data-fq-att]'?att:s==='[data-fq-doc]'?doc:null,querySelectorAll:()=>[]}
 });
 assert.equal(boxes.filter(b=>b.checked).length,4);assert.equal(lect.value,10);
 assert(attOut.textContent.includes('does not confirm exam eligibility'));assert(!attOut.textContent.includes('over 75%'));
 assert.equal(total.textContent,count);assert.equal(parts[1].value,saved.doc.theme);
 assert.equal(status.textContent.includes('In the band'),count>=1800&&count<=2200);
 parts[2].value='A genre observation';parts[2].events.input();
 assert.equal(stored.doc.theme,saved.doc.theme);assert.equal(stored.doc.genre,'A genre observation');
 assert.equal(stored.att.lect,10);assert.deepEqual(stored.att.labs,saved.att.labs);
}
[1799,1800,2200,2201].forEach(run);
console.log('PASS: 1800–2200 word boundaries, existing draft restoration, saved attendance notes and no automatic eligibility claim.');

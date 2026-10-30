const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(){return {hidden:true,dataset:{},textContent:'',href:'',events:{},addEventListener(type,fn){this.events[type]=fn;}};}
const keys=['draw','title','task','link','number','announcement','boo','boo-status'];
const nodes=Object.fromEntries(keys.map(k=>['[data-ff-'+k+']',element()]));
const room={querySelector:s=>nodes[s]};
const code=fs.readFileSync('labs/friday-social.js','utf8');
vm.runInNewContext(code,{document:{getElementById:()=>room},Math});
const button=nodes['[data-ff-draw]'];
assert(!button.hidden&&!nodes['[data-ff-boo]'].hidden);
const headings=[];
for(let i=0;i<18;i++){
 button.events.click();const title=nodes['[data-ff-title]'].textContent;headings.push(title);
 assert(nodes['[data-ff-task]'].textContent.length>50);
 assert.match(nodes['[data-ff-link]'].href,/^(#lab-5-workbench|academic-library\.html#ls-(find|notice))$/);
 assert(nodes['[data-ff-announcement]'].textContent.includes(title));
 if(i)assert.notEqual(title,headings[i-1]);
}
for(let i=0;i<18;i+=6)assert.equal(new Set(headings.slice(i,i+6)).size,6);
for(let i=0;i<4;i++){nodes['[data-ff-boo]'].events.click();assert(nodes['[data-ff-boo-status]'].textContent);}
assert.doesNotThrow(()=>vm.runInNewContext(code,{document:{getElementById:()=>null}}));
console.log('PASS: optional task deck cycles through all six ideas without adjacent repeats, working destinations, live announcements, pumpkin interaction and no-root fallback.');

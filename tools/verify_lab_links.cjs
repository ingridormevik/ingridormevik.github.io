const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('labs/lab-links.js','utf8');
function node(tag='SECTION',parent=null){return {tagName:tag,parentElement:parent,attrs:{},hidden:false,open:false,closest(selector){if(selector==='.al-book')return this.book||null;if(selector==='[hidden]'){for(let n=this;n;n=n.parentElement)if(n.hidden)return n;return null;}return null;},hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;},scrollIntoView(){this.scrolled=(this.scrolled||0)+1;},focus(){this.focused=true;}};}
function run(hash,ids={},search='',path='/labs/academic-library.html'){
 const location={hash,search,pathname:path,origin:'https://example.com',href:'https://example.com'+path+search+hash};
 const events={},clicks={},frames=[];let library=node('A');
 const addEventListener=(k,fn)=>(events[k]??=[]).push(fn);
 const dispatchEvent=event=>(events[event.type]||[]).forEach(fn=>fn(event));
 vm.runInNewContext(source,{URL,URLSearchParams,location,Event:class{constructor(type){this.type=type;}},
  requestAnimationFrame:fn=>frames.push(fn),addEventListener,dispatchEvent,
  document:{getElementById:id=>ids[id]||null,querySelector:()=>library,addEventListener:(k,fn)=>{clicks[k]=fn;}}});
 function flush(){while(frames.length)frames.shift()();}
 return {flush,events,clicks,location,library,dispatchEvent};
}
const outer=node('DETAILS'),inner=node('DETAILS',outer),target=node('SECTION',inner),unrelated=node('DETAILS');
let r=run('#inside',{inside:target});assert(!target.scrolled);r.flush();assert(outer.open&&inner.open&&target.focused);assert(!unrelated.open);
// Page-specific controllers reveal their panel before the deferred landing.
const panel=node(),child=node('H3',panel);panel.hidden=true;r=run('#child',{child});panel.hidden=false;r.flush();assert(child.scrolled);
// A filtered-out book is restored through the existing reset control.
const book=node('ARTICLE');book.hidden=true;const passage=node('H2',book);passage.book=book;let reset=0;
r=run('#book',{book:passage,'al-reset':{click(){reset++;book.hidden=false;}}});r.flush();assert.equal(reset,1);assert(passage.focused);
const secret=node();secret.hidden=true;r=run('#answer',{answer:secret});r.flush();assert(secret.hidden&&!secret.scrolled);
const consolePanel=node();r=run('#pointer',{'hr-console':consolePanel});r.flush();assert(consolePanel.scrolled);
r=run('#%bad',{});assert.doesNotThrow(r.flush);
// Re-clicking a current fragment asks controllers to reveal it again, without hijacking links.
r=run('#inside',{inside:target});r.flush();let follows=0;r.events.hashchange.push(()=>{follows++;});
const anchor={href:'https://example.com/labs/academic-library.html#inside',hasAttribute:()=>false,target:''};
const event={button:0,target:{closest:()=>anchor}};r.clicks.click(event);r.flush();assert.equal(follows,1);
r.clicks.click({...event,ctrlKey:true});r.clicks.click({...event,defaultPrevented:true});assert.equal(follows,1);
anchor.href='https://elsewhere.test/#inside';r.clicks.click(event);r.flush();assert.equal(follows,1);
r=run('#brief',{},'?from=library&room=ls-connect','/labs/final-assessment.html');assert.equal(r.library.href,'academic-library.html#ls-connect');
r=run('#brief',{},'?from=library&room=https://elsewhere.test','/labs/final-assessment.html');assert(!r.library.href);
assert(!fs.readFileSync('labs/studio.js','utf8').includes('target.children'));
console.log('PASS: delayed fragment landing, details ancestors, filtered books, hidden answers, virtual history links, same-fragment clicks, external links and library round trip.');

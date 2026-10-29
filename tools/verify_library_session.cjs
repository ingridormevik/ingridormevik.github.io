const fs=require('fs'),vm=require('vm'),assert=require('assert');
const element=(dataset={})=>({dataset,hidden:false,attrs:{},events:{},textContent:'',setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},removeAttribute(k){delete this.attrs[k];},addEventListener(k,fn){this.events[k]=fn;},focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;}});
function run(hash=''){
 const ids=['ls-make','ls-notice','ls-find','ls-connect'];
 const panels=ids.map((id,i)=>{const p=element({lsPanel:String(i)});p.id=id;p.heading=element();p.querySelector=()=>p.heading;p.closest=()=>p;return p;});
 const links=panels.map((_,i)=>element({lsGo:String(i)}));const skip=element({lsGo:'2'});
 const next=[element()],back=[element()],controls=[element()];const position=element();
 const lens=element({lsLens:'choice',lsQuery:'player agency',lsQuestion:'What did the choice change?',lsHref:'#jorgensen-start',lsTitle:'Gameworld Interfaces',lsAuthor:'Kristine Jørgensen'});
 const query=element();query.value='digital interaction';const question=element(),words=element(),book=element(),author=element(),oria=element(),guide=element(),returnLink=element();
 const channel=['shelf','online'].map(lsChannel=>element({lsChannel}));channel[0].attrs['aria-pressed']='true';
 const channelPanels=['shelf','online'].map(lsChannelPanel=>element({lsChannelPanel}));
 const tabs=['contents','index','references'].map(lsBookTab=>element({lsBookTab}));tabs[1].attrs['aria-pressed']='true';
 const pages=['contents','index','references'].map(lsBookPage=>element({lsBookPage}));
 const meanings=['change','understand','question'].map(lsMeaning=>element({lsMeaning})),meaning=element();
 const demo=element({lsDemo:'closed'}),demoButton=element(),story=element();
 const singles={'[data-ls-position]':position,'[data-ls-question]':question,'[data-ls-words]':words,'#ls-query':query,'[data-ls-book]':book,'[data-ls-author]':author,'[data-ls-meaning-text]':meaning,'[data-ls-demo]':demo,'[data-ls-demo-action]':demoButton,'[data-ls-demo-story]':story};
 const lists={'[data-ls-panel]':panels,'.ls-room-map [data-ls-go]':links,'[data-ls-controls]':controls,'[data-ls-go]':[...links,skip],'[data-ls-next]':next,'[data-ls-back]':back,'[data-ls-lens]':[lens],'[data-ls-channel]':channel,'[data-ls-channel-panel]':channelPanels,'[data-ls-book-tab]':tabs,'[data-ls-book-page]':pages,'[data-ls-meaning]':meanings};
 singles['[data-ls-oria]']=oria;lists['[data-ls-search-guide]']=[guide];
 const root={querySelector:key=>singles[key]||null,querySelectorAll:key=>lists[key]||[],closest:()=>null};
 const collection={tagName:'DETAILS',open:false,parentElement:null};
 const station={tagName:'DETAILS',open:false,parentElement:collection};
 const source={tagName:'SECTION',parentElement:station,closest:()=>null};
 const location={hash};let follow;
 vm.runInNewContext(fs.readFileSync('labs/library-session.js','utf8'),{
  document:{querySelectorAll:key=>key==='[data-ls-return]'?[returnLink]:[],getElementById:id=>id==='library-session'?root:id==='jorgensen-start'?source:panels.find(p=>p.id===id)},
  location,history:{replaceState(_a,_b,h){location.hash=h;}},addEventListener:(_,fn)=>{follow=fn;}
 });
 const visible=()=>panels.findIndex(p=>!p.hidden);
 assert.equal(panels.filter(p=>!p.hidden).length,1);
 assert.equal(pages.find(p=>!p.hidden).dataset.lsBookPage,'index');
 demoButton.events.click();assert.equal(demo.dataset.lsDemo,'open');assert.equal(demoButton.attrs['aria-expanded'],'true');assert(story.textContent.includes('memory'));
 demoButton.events.click();assert.equal(demo.dataset.lsDemo,'closed');
 skip.events.click({preventDefault(){}});assert.equal(visible(),2);assert(panels[2].heading.focused);assert(panels[2].scrolled);
 back[0].events.click();assert.equal(visible(),1);
 lens.events.click();assert.equal(query.value,'player agency');assert.equal(book.href,'#jorgensen-start');assert.equal(author.textContent,'Kristine Jørgensen');
 assert(oria.href.includes('47BIBSYS_UBB%3AUBB'));assert(oria.href.includes('player%20agency'));
 assert.equal(guide.href,'research-guide.html?q=player%20agency#search-start');
 query.value='sound & belonging';query.events.input();assert(guide.href.includes('sound%20%26%20belonging'));
 next[0].events.click();assert.equal(visible(),2);
 channel[1].events.click();assert(channelPanels[0].hidden&&!channelPanels[1].hidden);
 tabs[2].events.click();assert.equal(pages.find(p=>!p.hidden).dataset.lsBookPage,'references');
 next[0].events.click();assert.equal(visible(),3);assert(position.textContent.includes('Room 4'));
 meanings[2].events.click();assert(meaning.textContent.includes('bibliography'));
 links[0].events.click({preventDefault(){}});assert.equal(visible(),0);
 location.hash='#jorgensen-start';follow();assert(collection.open&&station.open);
 location.hash='#ls-find';follow();assert.equal(visible(),2);
 assert.equal(returnLink.href,'#ls-find');assert(returnLink.textContent.includes('room 3'));
 location.hash='#%broken';assert.doesNotThrow(follow);
 assert.equal(links.filter(l=>l.attrs['aria-current']==='step').length,1);
 return visible();
}
run();run('#ls-find');
console.log('PASS: open rooms, direct shelf entry, focus, creation demo, research leads, source links, channel/book controls, meaning and collection deep links.');

const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('labs/research-finder.js','utf8');
const start=source.indexOf('  const recommend =');
const end=source.indexOf("  form.addEventListener('submit'",start);
const context={};vm.createContext(context);
vm.runInContext("const glossary='https://glossary.cdn.uib.no/';"+source.slice(start,end)+';globalThis.recommend=recommend;',context);
const titles=answers=>context.recommend(answers).map(x=>x.title);
assert(!titles({agency:'meaning'}).some(t=>t.startsWith('Electronic literature')));
assert(titles({structure:'branch',language:'literary',rules:'game'}).some(t=>t.startsWith('Game studies')));
assert(titles({structure:'branch',language:'literary',rules:'game'}).some(t=>t.startsWith('Electronic literature')));
assert(titles({rules:'points'}).includes('Gamification and motivation'));
assert(!titles({rules:'points'}).some(t=>t.startsWith('Game studies')));
assert(context.recommend({world:'interface'})[0].url==='#jorgensen-start');
assert(titles({values:'belong'}).includes('Inclusion, ethics and design justice'));
assert(titles({world:'media'}).includes('Transmedia storytelling'));
assert.equal(titles({}).length,1);
assert.equal(titles({agency:'unsure',language:'unsure'}).length,1);
for (const format of ['game','text','art','video','audio','documentary','data','social','fan','immersive','app','client']) {
  const result=context.recommend({formats:[format]});
  assert(result.length>0);
  assert(!result.some(r=>r.title==='Describe one action before choosing a label'));
}
assert(titles({formats:['video','audio','documentary']}).length>=3);
console.log('PASS: overlapping routes, no agency-only e-lit classification, gamification distinction, Jørgensen, values and unsure fallback.');

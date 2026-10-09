const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'labs/javascript-first-example/story.js'),'utf8');
function execute(source, original) {
  const story={textContent:original};
  const button={addEventListener(event,fn){assert.equal(event,'click');this.click=fn;}};
  const document={querySelector(selector){return {'#story':story,'#future':button}[selector]||null;}};
  vm.runInNewContext(source,{document});
  assert.equal(story.textContent,original,'The action must wait for a click');
  assert.equal(typeof button.click,'function');
  button.click(); const first=story.textContent;
  assert.notEqual(first,original);
  button.click(); assert.equal(story.textContent,first,'The beginner action repeats; it does not toggle');
  return first;
}
assert.equal(execute(code,'I know this place.'),'Someone else remembers this place differently.');
assert.equal(execute(code.replace('Someone else remembers this place differently.','This is my own remembered place.'),'My first sentence.'),'This is my own remembered place.');
const broken=code.replace('"#future"','"#missing"');
assert.throws(()=>execute(broken,'Initial text'),/addEventListener/);
console.log('PASS: first-click code waits for click, changes text, repeats on click two, accepts personalised text, and exposes a mismatched ID.');

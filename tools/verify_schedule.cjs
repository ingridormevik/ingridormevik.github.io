// Run the real schedule script against the parsed programme, including stale storage.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'schedule-test-fixture.json'), 'utf8'));
const code = fs.readFileSync(path.join(root, 'labs/lab-programme.js'), 'utf8');
function control(value) {
  return {value, listeners:{}, textContent:'', addEventListener(type, fn) {this.listeners[type]=fn;}, change() {this.listeners.change?.();}};
}
function run(blockStorage) {
  const group=control('495'), duration=control('120'), status=control('');
  const rows=fixture.rows.map(list=>list.map(minutes=>({dataset:{minutes:String(minutes)}, hidden:false, clock:control(''), elapsed:control(''), querySelector(s) {return s==='.clock'?this.clock:this.elapsed;}})));
  const labs=rows.map((list,i)=>({dataset:{sessionStart:fixture.sessions[i]['session-start'],sessionMinutes:fixture.sessions[i]['session-minutes'],sessionBreaks:fixture.sessions[i]['session-breaks']},window:control(''),querySelectorAll(){return list;},querySelector(){return this.window;}}));
  const chips=fixture.chips.map(dataset=>({dataset,textContent:'',closest(){return labs[Number(dataset.lab.split('-')[1])-1];}}));
  const buttons=['495','855'].map(v=>({dataset:{clockGroup:v},setAttribute(){},addEventListener(t,fn){this.click=fn;}}));
  const document={getElementById(id){return {group,duration,'schedule-status':status}[id]||null;},querySelectorAll(s){return {'.lab':labs,'.time-chip[data-from]':chips,'[data-clock-group]':buttons}[s]||[];},body:{classList:{add(){}}}};
  const memory={'dik105-session-options':JSON.stringify({group:'495',duration:'120'})};
  const storage={getItem(k){if(blockStorage)throw Error('blocked');return memory[k]||null;},setItem(k,v){if(blockStorage)throw Error('blocked');memory[k]=v;}};
  vm.runInNewContext(code,{document,localStorage:storage,sessionStorage:storage});
  assert.equal(duration.value,'105');
  assert.match(labs[2].window.textContent,/08:15-10:00/);
  assert.match(status.textContent,/09:00-09:10 and 09:40-09:45/);
  assert.equal(rows[2].at(-1).clock.textContent,'09:55-10:00');
  assert.match(labs[4].window.textContent,/Today · 14:15-15:30 · 75 minutes · no scheduled breaks/);
  assert.equal(rows[4].at(-1).clock.textContent,'15:25-15:30');
  assert(chips.filter(c=>c.dataset.lab==='lab-5').every(c=>!c.textContent.includes('+ breaks')));
  assert(chips.find(c=>c.dataset.lab==='lab-5'&&c.dataset.from==='5').textContent.includes('65 min'));
  const spanning=chips.find(c=>c.dataset.from==='25'&&c.dataset.to==='90');
  if(spanning) assert.match(spanning.textContent,/50 min \+ breaks/);
  buttons[1].click();
  assert.match(labs[2].window.textContent,/14:15-16:00/);
  assert.match(status.textContent,/15:00-15:10 and 15:40-15:45/);
  group.value='855'; group.change();
  assert.equal(rows[2].at(-1).clock.textContent,'15:55-16:00');
  assert.equal(rows[4].at(-1).clock.textContent,'15:25-15:30');
}
run(false); run(true);
console.log('PASS: fixed Halloween finish at 15:30 and no breaks, original schedules for seven other labs, stale storage, group switching and time chips.');

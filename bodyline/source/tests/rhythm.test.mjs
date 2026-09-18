import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun, strike, expire, BEAT, END_BEAT, accuracy} from '../app/rhythm.ts';

test('both charts can be completed perfectly, including simultaneous chords',()=>{
  for(const easy of [true,false]) {
    const run=createRun(easy);
    for(const note of run.notes) assert.equal(strike(run,note.lane,note.beat*BEAT).grade,'PERFECT');
    assert.equal(run.perfect,run.notes.length); assert.equal(run.miss,0);
    assert.equal(run.best,run.notes.length); assert.equal(accuracy(run),100);
    assert.ok(run.notes.every(n=>n.beat>=4 && n.beat<END_BEAT));
  }
});
test('wrong lanes, spam and duplicate presses cannot earn points',()=>{
  const run=createRun(); const first=run.notes[0];
  assert.equal(strike(run,(first.lane+1)%4,first.beat*BEAT).grade,'EMPTY');
  assert.equal(run.score,0); assert.equal(first.judged,false);
  strike(run,first.lane,first.beat*BEAT); const score=run.score;
  assert.equal(strike(run,first.lane,first.beat*BEAT).grade,'EMPTY');
  assert.equal(run.score,score); assert.equal(run.combo,0); assert.ok(accuracy(run)<100);
});
test('timing windows distinguish early, perfect, late and missed notes',()=>{
  for(const delta of [-.14,-.06,0,.06,.14]) {
    const run=createRun(); const n=run.notes[0];
    const result=strike(run,n.lane,n.beat*BEAT+delta);
    assert.equal(result.grade,Math.abs(delta)<=.065?'PERFECT':'GOOD');
    assert.ok(Math.abs(result.delta-delta)<1e-8);
  }
  const run=createRun();const n=run.notes[0];
  assert.equal(strike(run,n.lane,n.beat*BEAT-.2).grade,'EMPTY');
  assert.equal(n.judged,false);
  assert.equal(expire(run,n.beat*BEAT+.15),1);
  assert.equal(expire(run,n.beat*BEAT+.2),0);
  assert.equal(run.miss,1);
});
test('no-input run ends with all notes missed and zero accuracy',()=>{
  const run=createRun();expire(run,END_BEAT*BEAT+1);
  assert.equal(run.miss,run.notes.length);assert.equal(run.score,0);assert.equal(accuracy(run),0);
});
test('chart never overlaps two notes on the same lane and beat',()=>{
  const run=createRun();const unique=new Set(run.notes.map(n=>`${n.beat}:${n.lane}`));
  assert.equal(unique.size,run.notes.length);assert.ok(run.notes.length>createRun(true).notes.length);
});

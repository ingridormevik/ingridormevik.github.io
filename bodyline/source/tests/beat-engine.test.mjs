import test from 'node:test';
import assert from 'node:assert/strict';
import { BeatEngine } from '../app/beat-engine.ts';

class AudioContextMock {
  currentTime = 0;
  state = 'suspended';
  sampleRate = 100;
  destination = {};
  createDynamicsCompressor() {
    return { threshold: {}, knee: {}, ratio: {}, attack: {}, release: {}, connect() {} };
  }
  createGain() {
    return { gain: { value: 0, cancelScheduledValues() {}, linearRampToValueAtTime(v) { this.value = v; } }, connect() {} };
  }
  createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
}

test('mute chosen before Start is honoured on the first audio frame', async () => {
  globalThis.AudioContext = AudioContextMock;
  const engine = new BeatEngine();
  engine.setMuted(true);
  await engine.start();
  assert.equal(engine.master.gain.value, 0);
  engine.setMuted(false);
  assert.equal(engine.master.gain.value, 0.36);
  engine.stop();
});

test('pause suspends the clock and resume preserves the beat origin', async () => {
  globalThis.AudioContext = AudioContextMock;
  const engine = new BeatEngine();
  await engine.start();
  engine.context.currentTime = 2;
  const phase = engine.phase(0);
  await engine.pause();
  assert.equal(engine.context.state, 'suspended');
  await engine.resume();
  assert.equal(engine.phase(0), phase);
  engine.stop();
  assert.equal(engine.context, null);
  await engine.start();
  assert.equal(engine.phase(0), 0);
  engine.stop();
});

test('silent mode retains a usable visual beat and distinguishes an off-beat action', () => {
  const engine = new BeatEngine();
  assert.equal(engine.timing(60 / 128).grade, 'PERFECT');
  assert.equal(engine.timing(30 / 128).grade, 'OFF GRID');
});

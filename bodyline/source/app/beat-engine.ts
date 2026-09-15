const BPM = 128;
const BEAT_SECONDS = 60 / BPM;
const STEP_SECONDS = BEAT_SECONDS / 4;

export const BODYLINE_SCORE = "INGRID_6023_0519 / A MINOR / LIVE CODE";

type ScoreState = { flow: number; speed: number; altitude: number; shield: number; airborne: boolean };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function hashIdentity(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function euclideanPulse(step: number, hits: number, length: number, rotation = 0) {
  const position = (step + rotation + length) % length;
  return (position * hits) % length < hits;
}

export class BeatEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private nextStep = 0;
  private stepIndex = 0;
  private origin = 0;
  private muted = false;
  private noiseBuffer: AudioBuffer | null = null;
  private wind: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private randomState = hashIdentity("INGRID_ORMEVIK|MOUNT_MEDIA|60.23|5.19|HULDRA|BERGEN");

  private random() {
    let value = this.randomState;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.randomState = value >>> 0;
    return this.randomState / 4294967296;
  }

  async start() {
    if (!this.context) {
      this.context = new AudioContext();
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 16;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.006;
      compressor.release.value = 0.2;
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : 0.36;
      this.master.connect(compressor);
      compressor.connect(this.context.destination);
      this.noiseBuffer = this.makeNoise(2);
    }
    await this.context.resume();
    this.origin = this.context.currentTime + 0.08;
    this.nextStep = this.origin;
    this.stepIndex = 0;
  }

  private makeNoise(seconds: number) {
    const context = this.context!;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = this.random() * 2 - 1;
    return buffer;
  }

  private startMountainAir() {
    if (!this.context || !this.master || !this.noiseBuffer) return;
    const wind = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.45;
    gain.gain.value = 0.045;
    wind.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    wind.start();
    this.wind = wind;
    this.windGain = gain;
    this.windFilter = filter;
  }

  private kick(time: number, accent: boolean) {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(accent ? 148 : 122, time);
    oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.17);
    gain.gain.setValueAtTime(accent ? 0.9 : 0.67, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
    oscillator.connect(gain);
    gain.connect(this.master!);
    oscillator.start(time);
    oscillator.stop(time + 0.25);
  }

  private noiseHit(time: number, kind: "shaker" | "clap" | "rain") {
    if (!this.noiseBuffer) return;
    const context = this.context!;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = kind === "clap" ? "bandpass" : "highpass";
    filter.frequency.value = kind === "clap" ? 1650 : kind === "rain" ? 3900 : 6500;
    filter.Q.value = kind === "clap" ? 0.8 : 0.3;
    const duration = kind === "clap" ? 0.1 : kind === "rain" ? 0.12 : 0.045;
    const volume = kind === "clap" ? 0.13 : kind === "rain" ? 0.035 : 0.075;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    source.start(time);
    source.stop(time + duration + 0.01);
  }

  private conga(time: number, step: number, flow: number) {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const frequencies = [172, 194, 218, 164];
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequencies[(step + 1) % frequencies.length], time);
    oscillator.frequency.exponentialRampToValueAtTime(112, time + 0.085);
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 1.6;
    gain.gain.setValueAtTime(0.08 + flow * 0.055, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    oscillator.start(time);
    oscillator.stop(time + 0.11);
  }

  private bass(time: number, quarter: number, flow: number) {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const notes = [55, 55, 65.41, 49, 55, 73.42, 65.41, 49];
    oscillator.type = "sawtooth";
    oscillator.frequency.value = notes[quarter % notes.length];
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(190 + flow * 230, time);
    filter.frequency.exponentialRampToValueAtTime(82, time + BEAT_SECONDS * 0.82);
    filter.Q.value = 4.5;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.11 + flow * 0.045, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, time + BEAT_SECONDS * 0.84);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    oscillator.start(time);
    oscillator.stop(time + BEAT_SECONDS * 0.86);
  }

  private mountainTone(time: number, bar: number, altitude: number, airborne: boolean) {
    const context = this.context!;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const chords = [[220, 261.63, 329.63], [196, 246.94, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63]];
    filter.type = "lowpass";
    filter.frequency.value = 620 + (320 - altitude) * 2.3 + (airborne ? 900 : 0);
    filter.Q.value = 0.55;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(airborne ? 0.038 : 0.026, time + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + BEAT_SECONDS * 3.8);
    filter.connect(gain);
    gain.connect(this.master!);
    chords[bar % chords.length].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (index - 1) * 5;
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + BEAT_SECONDS * 3.9);
    });
  }

  private machineMisread(time: number, amount: number, step: number) {
    if (amount < 0.18 || step % 8 !== 6) return;
    const context = this.context!;
    const carrier = context.createOscillator();
    const modulator = context.createOscillator();
    const modGain = context.createGain();
    const gain = context.createGain();
    carrier.type = "square";
    carrier.frequency.value = 82.41;
    modulator.frequency.value = 31 + amount * 67;
    modGain.gain.value = 18 + amount * 90;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.018 + amount * 0.04, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(gain);
    gain.connect(this.master!);
    carrier.start(time);
    modulator.start(time);
    carrier.stop(time + 0.12);
    modulator.stop(time + 0.12);
  }

  private danceLead(time: number, step: number) {
    const context = this.context!;
    const phrase = [440, 440, 659.25, 587.33, 523.25, 523.25, 392, 440,
      440, 659.25, 880, 783.99, 659.25, 587.33, 523.25, 392];
    const frequency = phrase[Math.floor(step / 2) % phrase.length];
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(450, time + .18);
    envelope.gain.setValueAtTime(.001, time);
    envelope.gain.exponentialRampToValueAtTime(.055, time + .012);
    envelope.gain.exponentialRampToValueAtTime(.001, time + .19);
    filter.connect(envelope); envelope.connect(this.master!);
    for (const detune of [-6, 6]) {
      const oscillator = context.createOscillator();
      oscillator.type = "sawtooth"; oscillator.frequency.value = frequency;
      oscillator.detune.value = detune; oscillator.connect(filter);
      oscillator.start(time); oscillator.stop(time + .2);
    }
  }

  tick(state: ScoreState) {
    if (!this.context || this.context.state !== "running") return;
    const flow = clamp(state.flow, 0, 1);
    const misread = clamp((100 - state.shield) / 100, 0, 1);
    const now = this.context.currentTime;
    this.windGain?.gain.setTargetAtTime(0.025 + clamp((state.speed - 60) / 60, 0, 1) * 0.07, now, 0.12);
    this.windFilter?.frequency.setTargetAtTime(430 + state.speed * 5.2 + (state.airborne ? 380 : 0), now, 0.16);
    while (this.nextStep < now + 0.14) {
      const step = this.stepIndex;
      const barStep = step % 16;
      if (barStep % 4 === 0) {
        this.kick(this.nextStep, barStep === 0);
        this.bass(this.nextStep, Math.floor(step / 4), flow);
      }
      if (barStep === 4 || barStep === 12) this.noiseHit(this.nextStep, "clap");
      if (barStep % 2 === 0) this.noiseHit(this.nextStep, "shaker");
      if (euclideanPulse(barStep, 5, 16, 3)) this.conga(this.nextStep, barStep, flow);
      if (barStep === 0) this.mountainTone(this.nextStep, Math.floor(step / 16), state.altitude, state.airborne);
      if (step >= 64 && barStep % 2 === 0) this.danceLead(this.nextStep, step);
      this.machineMisread(this.nextStep, misread, barStep);
      this.nextStep += STEP_SECONDS;
      this.stepIndex += 1;
    }
  }

  phase(fallbackSeconds: number) {
    if (!this.context || this.context.state !== "running") return fallbackSeconds * (BPM / 60);
    return Math.max(0, (this.context.currentTime - this.origin) / BEAT_SECONDS);
  }

  timing(fallbackSeconds: number) {
    const phase = this.phase(fallbackSeconds);
    const fraction = phase - Math.floor(phase);
    const distance = Math.min(fraction, 1 - fraction);
    if (distance < 0.18) return { grade: "PERFECT", bonus: 2, distance } as const;
    if (distance < 0.42) return { grade: "GOOD", bonus: 1.35, distance } as const;
    return { grade: "OFF GRID", bonus: 0.75, distance } as const;
  }

  hit(grade: "PERFECT" | "GOOD" | "OFF GRID") {
    if (!this.context || !this.master) return;
    const time = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = grade === "PERFECT" ? "sine" : grade === "GOOD" ? "triangle" : "square";
    oscillator.frequency.setValueAtTime(grade === "PERFECT" ? 880 : grade === "GOOD" ? 659.25 : 77.78, time);
    oscillator.frequency.exponentialRampToValueAtTime(grade === "PERFECT" ? 1320 : grade === "GOOD" ? 880 : 58.27, time + 0.08);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(grade === "PERFECT" ? 0.12 : grade === "GOOD" ? 0.075 : 0.035, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + 0.2);
  }

  pickup(index: number, grade: "PERFECT" | "GOOD" | "OFF GRID") {
    if (!this.context || !this.master) return;
    const time = this.context.currentTime;
    const notes = [440, 523.25, 659.25, 783.99, 880];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    oscillator.type = grade === "PERFECT" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(notes[index % notes.length], time);
    oscillator.frequency.exponentialRampToValueAtTime(notes[(index + 2) % notes.length], time + 0.1);
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 1.8;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(grade === "PERFECT" ? 0.13 : 0.085, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + 0.25);
  }

  takeoff(power: number, grade: "PERFECT" | "GOOD" | "OFF GRID") {
    if (!this.context || !this.master) return;
    const time = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(92, time);
    oscillator.frequency.exponentialRampToValueAtTime(270 + power * 280, time + 0.2);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, time);
    filter.frequency.exponentialRampToValueAtTime(950, time + 0.2);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(grade === "PERFECT" ? 0.09 : 0.06, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + 0.25);
  }

  landing(force: number, stable: boolean) {
    if (!this.context || !this.master) return;
    const time = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(stable ? 92 : 68, time);
    oscillator.frequency.exponentialRampToValueAtTime(36, time + 0.15);
    gain.gain.setValueAtTime(clamp(0.045 + force * 0.009, 0.05, 0.14), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + 0.21);
  }

  async pause() { if (this.context?.state === "running") await this.context.suspend(); }

  async resume() { if (this.context?.state === "suspended") await this.context.resume(); }

  setMuted(value: boolean) {
    this.muted = value;
    if (this.master && this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.36, this.context.currentTime + 0.08);
    }
    return this.muted;
  }

  toggleMute() { return this.setMuted(!this.muted); }

  stop() {
    this.wind?.stop();
    this.wind = null;
    void this.context?.close();
    this.context = null;
    this.master = null;
  }
}

export const BODYLINE_BPM = BPM;

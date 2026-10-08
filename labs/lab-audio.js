(() => {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  let enabled = true;
  try { enabled = localStorage.getItem('dik105-sound') !== 'off'; } catch {}
  let context, master, revision = 0;
  const voices = new Set();
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lab-sound-toggle';
  const nav = document.querySelector('.studio-header nav');
  if (!nav) return;
  nav.append(toggle);
  function sync() {
    toggle.textContent = enabled ? 'Sound: on' : 'Sound: off';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? 'Lab sound effects on. Mute sound.' : 'Lab sound effects off. Enable sound.');
  }
  function stop() {
    revision++;
    voices.forEach(voice => { try { voice.stop(); } catch {} });
    voices.clear();
  }
  async function unlock() {
    if (!enabled || document.hidden) return false;
    try {
      if (!context) {
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0.16;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') await context.resume();
      return context.state === 'running';
    } catch { return false; }
  }
  function tone(freq, offset, duration, strength = 0.35, type = 'sine', endFreq) {
    const voice = context.createOscillator(), envelope = context.createGain();
    const time = context.currentTime + offset;
    voice.type = type;
    voice.frequency.setValueAtTime(freq, time);
    if (endFreq) voice.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(strength, time + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    voice.connect(envelope); envelope.connect(master);
    voices.add(voice);
    voice.onended = () => { voices.delete(voice); voice.disconnect(); envelope.disconnect(); };
    voice.start(time); voice.stop(time + duration + 0.03);
  }
  async function play(cue) {
    const version = revision;
    if (!enabled || document.hidden || !await unlock() || version !== revision || !enabled) return;
    if (/^history-[0-2]{3}$/.test(cue)) {
      cue.slice(8).split('').forEach((note,i)=>tone([261.63,329.63,392][Number(note)],i*.32,.25,.25,'square'));
    } else if (cue === 'star') {
      tone(784, 0, 0.22, 0.45, 'triangle');
      tone(1175, 0.08, 0.35, 0.35);
      tone(1568, 0.15, 0.48, 0.2);
    } else if (cue === 'complete') {
      // Soft impact, ascending arpeggio, then a warm major chord.
      tone(130, 0, 0.35, 0.6, 'sine', 65);
      [523.25,659.25,783.99,1046.5].forEach((freq, i) => tone(freq, 0.12 + i * 0.12, 0.45, 0.4, 'triangle'));
      [261.63,392,523.25,659.25].forEach(freq => tone(freq, 0.65, 1.1, 0.22));
      tone(1568, 0.83, 0.7, 0.15);
    } else if (cue === 'transmit') {
      [330,440,660].forEach((freq,i)=>tone(freq,i*.09,.13,.18,'triangle'));
    } else if (cue === 'secret') {
      [523,784,1046,1318].forEach((freq,i)=>tone(freq,i*.10,.3,.22,'triangle'));
    } else if (cue === 'unlock') {
      tone(220, 0, 0.3, 0.3, 'sine', 880);
      tone(880, 0.2, 0.3, 0.25, 'triangle');
      tone(1318.5, 0.31, 0.48, 0.3);
    }
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('dik105-sound', enabled ? 'on' : 'off'); } catch {}
    stop(); sync();
    if (enabled) play('star');
  });
  // Resume during a real input gesture for Safari and mobile autoplay rules.
  document.addEventListener('pointerdown', () => { unlock(); }, {capture: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') unlock();
  }, {capture: true});
  document.addEventListener('lab-star-earned', event => { if (event.detail.star < 3) play('star'); });
  document.addEventListener('lab-completed', () => { stop(); play('complete'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  window.labAudio = {play};
  sync();
})();

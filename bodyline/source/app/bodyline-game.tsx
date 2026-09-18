"use client";
import { useEffect, useRef, useState } from 'react';
import { BeatEngine } from './beat-engine';
import { accuracy, BEAT, BPM, createRun, END_BEAT, expire, strike } from './rhythm';

const COLORS = ['#c0ff48','#ffae53','#fa62da','#8a8dff'];
const KEYS = ['D','F','J','K'];
type Mode = 'ready' | 'playing' | 'paused' | 'finished';
export default function BodylineGame(_props: {assetBase?: string}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<BeatEngine | null>(null);
  const run = useRef(createRun());
  const modeRef = useRef<Mode>('ready');
  const [mode, setMode] = useState<Mode>('ready');
  const [easy, setEasy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [quiet, setQuiet] = useState(false);
  const quietRef = useRef(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hud, setHud] = useState({score:0, combo:0, progress:0, count:4});
  const pulses = useRef([0,0,0,0]);
  const held = useRef(new Set<number>());
  const feedback = useRef({label:'', detail:'', until:0, lane:0});
  const sparks = useRef<{lane:number;born:number;good:boolean}[]>([]);
  const current = useRef(0);
  const transition = (next:Mode) => { modeRef.current = next; setMode(next); };
  async function start() {
    if (busy) return;
    setBusy(true); setError('');
    engine.current?.stop();
    const audio = new BeatEngine(); engine.current = audio;
    audio.setMuted(muted);
    try {
      await audio.start(); run.current = createRun(easy); current.current = 0;
      held.current.clear(); sparks.current = []; pulses.current = [0,0,0,0];
      feedback.current = {label:'',detail:'',until:0,lane:0};
      setHud({score:0,combo:0,progress:0,count:4}); transition('playing');
    } catch { audio.stop(); setError('Audio could not start. Please try again in a browser with Web Audio support.'); }
    finally { setBusy(false); }
  }
  async function pause() {
    if (modeRef.current !== 'playing') return;
    transition('paused'); held.current.clear(); await engine.current?.pause();
  }
  async function resume() {
    if (busy) return;
    setBusy(true);
    try { await engine.current?.resume(); transition('playing'); setError(''); }
    catch { setError('Audio could not resume. Try again.'); }
    finally { setBusy(false); }
  }
  function press(lane:number) {
    if (modeRef.current !== 'playing' || held.current.has(lane)) return;
    held.current.add(lane); pulses.current[lane] = performance.now();
    const seconds = (engine.current?.phase(0) ?? 0) * BEAT - offsetRef.current / 1000;
    if (seconds < 4 * BEAT - .145) return;
    const result = strike(run.current, lane, seconds);
    const good = result.grade !== 'EMPTY';
    if (good) engine.current?.pickup(lane,result.grade === 'PERFECT' ? 'PERFECT' : 'GOOD');
    sparks.current.push({lane,born:performance.now(),good});
    feedback.current = {label: good ? result.grade : 'OFF BEAT',detail:good && result.grade !== 'PERFECT' ? result.delta < 0 ? 'A little early' : 'A little late' : '',until:performance.now()+650,lane};
  }
  const handlers = useRef({press,pause}); handlers.current = {press,pause};
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    quietRef.current = media.matches; setQuiet(media.matches);
    const down = (e:KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches('input,select,textarea')) return;
      const lane = ['KeyD','KeyF','KeyJ','KeyK'].indexOf(e.code);
      if (lane >= 0) { e.preventDefault(); if (!e.repeat) handlers.current.press(lane); }
      if (e.code === 'Escape') void handlers.current.pause();
    };
    const up = (e:KeyboardEvent) => held.current.delete(['KeyD','KeyF','KeyJ','KeyK'].indexOf(e.code));
    const blur = () => { held.current.clear(); void handlers.current.pause(); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener('keydown',down); window.addEventListener('keyup',up);
    window.addEventListener('blur',blur); document.addEventListener('visibilitychange',visibility);
    return () => { window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);engine.current?.stop(); };
  },[]);
  useEffect(() => {
    const element = canvas.current!; const ctx = element.getContext('2d'); if (!ctx) return;
    let frame = 0; let lastHud = 0;
    function draw(now:number) {
      const c = ctx!;
      const w = element.clientWidth, h = element.clientHeight, dpr = Math.min(devicePixelRatio || 1,2);
      if (element.width !== Math.round(w*dpr) || element.height !== Math.round(h*dpr)) {element.width=Math.round(w*dpr);element.height=Math.round(h*dpr);}
      c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,w,h);
      if (modeRef.current === 'playing') {
        engine.current?.tick({flow:Math.min(1,run.current.combo/32),speed:80,altitude:200,shield:100,airborne:false});
        current.current = (engine.current?.phase(0) ?? 0) * BEAT;
        if (expire(run.current,current.current-offsetRef.current/1000)) feedback.current={label:'MISSED',detail:'Find the next beat',until:now+500,lane:2};
        if (current.current > END_BEAT*BEAT+.5) { transition('finished'); void engine.current?.pause(); }
      }
      const t = current.current, beat = t/BEAT;
      const horizon = h*.16, hit = h*.79, width = Math.min(w*.92,680), left=(w-width)/2, laneW=width/4;
      c.fillStyle='#090b13';c.fillRect(0,0,w,h);
      // Colour remains tied to input, with slow falloff instead of full-screen flashing.
      for(let lane=0;lane<4;lane++) {
        const strength=Math.max(0,1-(now-pulses.current[lane])/850);
        if(strength>0) {const g=c.createRadialGradient(left+laneW*(lane+.5),hit,0,w/2,h*.55,Math.max(w,h)*.8);g.addColorStop(0,COLORS[lane]+Math.round((quietRef.current?.14:.32)*strength*255).toString(16).padStart(2,'0'));g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);}
      }
      // Mountain ridge / twin funicular rails: a restrained Fløyen silhouette.
      c.strokeStyle='#333747'; c.lineWidth=1;
      for(let ridge=0;ridge<3;ridge++){c.beginPath();for(let x=0;x<=w;x+=8){const y=h*(.17+ridge*.07)+Math.sin(x/w*9+ridge*2)*h*.035+Math.cos(x/w*21+ridge)*h*.018; x===0?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
      c.fillStyle='#a1a2ae';c.font='10px system-ui';c.textAlign='center'; c.fillText('FLØYEN  →  BERGEN',w/2,horizon-25);
      for(let lane=0;lane<4;lane++) {
        const x=left+lane*laneW;const strength=Math.max(0,1-(now-pulses.current[lane])/360);
        const g=c.createLinearGradient(0,horizon,0,hit);g.addColorStop(0,'transparent');g.addColorStop(1,COLORS[lane]+(held.current.has(lane)?'33':'0b'));c.fillStyle=g;c.fillRect(x+3,horizon,laneW-6,hit-horizon);
        c.strokeStyle='#ffffff10';c.beginPath();c.moveTo(x,horizon);c.lineTo(x,hit+45);c.stroke();
        c.fillStyle=COLORS[lane];c.globalAlpha=.4+strength*.6;c.shadowColor=COLORS[lane];c.shadowBlur=quietRef.current?0:16+strength*20;c.fillRect(x+9,hit,laneW-18,3);c.shadowBlur=0;c.globalAlpha=1;
      }
      const approach=BEAT*4;
      for(const n of run.current.notes) {
        if(n.judged) continue;
        const until=n.beat*BEAT-(t-offsetRef.current/1000);
        if(until>approach || until<-.22) continue;
        const p=1-until/approach,y=horizon+(hit-horizon)*p;
        c.globalAlpha=Math.min(1,Math.max(0,p*4));c.fillStyle=COLORS[n.lane];c.shadowColor=COLORS[n.lane];c.shadowBlur=quietRef.current?0:18;
        c.beginPath();c.roundRect(left+n.lane*laneW+10,y-8,laneW-20,16,4);c.fill();c.shadowBlur=0;
        c.fillStyle='#ffffffa0';c.fillRect(left+n.lane*laneW+15,y-6,laneW-30,2);c.globalAlpha=1;
      }
      sparks.current=sparks.current.filter(s=>now-s.born<750);
      if(!quietRef.current) for(const s of sparks.current) {
        const age=(now-s.born)/750;if(!s.good) continue;c.globalAlpha=(1-age)*.8;c.strokeStyle=COLORS[s.lane];c.lineWidth=2;
        c.beginPath();c.ellipse(left+(s.lane+.5)*laneW,hit,12+age*laneW,5+age*35,0,0,Math.PI*2);c.stroke();
        for(let j=0;j<6;j++){const a=j*2.4+s.lane;c.fillStyle=COLORS[s.lane];c.fillRect(left+(s.lane+.5)*laneW+Math.sin(a)*age*100,hit-age*(60+j*17),3,8*(1-age));}c.globalAlpha=1;
      }
      const f=feedback.current;
      if(now<f.until && modeRef.current==='playing') {c.textAlign='center';c.fillStyle=f.label==='MISSED'||f.label==='OFF BEAT'?'#a3a4b4':COLORS[f.lane];c.font='700 17px system-ui';c.fillText(f.label,w/2,h*.39);c.fillStyle='#b8bac8';c.font='12px system-ui';c.fillText(f.detail,w/2,h*.39+22);}
      if(now-lastHud>60){lastHud=now;setHud({score:run.current.score,combo:run.current.combo,progress:Math.min(1,beat/END_BEAT),count:Math.max(0,4-Math.floor(beat))});}
      frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
  },[]);
  return <main className="game">
    <canvas ref={canvas} aria-hidden="true" />
    <header className="top"><a className="wordmark" href="#" onClick={e=>e.preventDefault()}>BODYLINE<span>BERGEN / 01</span></a><div className="score"><strong>{hud.score.toLocaleString()}</strong><span>{hud.combo ? `${hud.combo} COMBO` : 'FIND YOUR RHYTHM'}</span></div><button className="icon" aria-label={muted?'Unmute music':'Mute music'} onClick={()=>{const next=!muted;setMuted(next);engine.current?.setMuted(next);}}>{muted?'Sound off':'Sound on'}</button>{mode==='playing' && <button className="icon" onClick={()=>void pause()}>Pause</button>}</header>
    <div className="progress" role="progressbar" aria-label="Track progress" aria-valuenow={Math.round(hud.progress*100)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${hud.progress*100}%`}}/></div>
    {mode==='playing' && hud.count>0 && <div className="count"><strong>{hud.count}</strong><span>Feel the beat</span></div>}
    <div className="pads" aria-label="Rhythm lanes">{KEYS.map((key,lane)=><button key={key} aria-label={`Lane ${lane+1}, ${key}`} style={{'--lane':COLORS[lane]} as React.CSSProperties} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);press(lane);}} onPointerUp={()=>held.current.delete(lane)} onPointerCancel={()=>held.current.delete(lane)} onLostPointerCapture={()=>held.current.delete(lane)}><span>{key}</span><small>{lane+1}</small></button>)}</div>
    <footer><span>FLØYEN / EARTH FREQUENCY</span><span>{BPM} BPM · ORIGINAL DEMO</span></footer>
    {mode!=='playing' && <div className="veil"><section className="menu" aria-label={mode==='finished'?'Run results':'Game menu'}>
      <p className="eyebrow">MOUNT MEDIA PRESENTS</p>
      <h1>{mode==='ready'?<>Find your<br/><em>frequency.</em></>:mode==='paused'?'Take a breath.':'You lit it up.'}</h1>
      {mode==='ready'?<p>Four lanes. Tap as the colour hits the line.<br/>Follow the beat all the way down.</p>:mode==='paused'?<p>Your run is waiting right here.</p>:<div className="results"><div><strong>{hud.score.toLocaleString()}</strong><span>Score</span></div><div><strong>{accuracy(run.current)}%</strong><span>Accuracy</span></div><div><strong>{run.current.best}</strong><span>Best combo</span></div><p>{run.current.perfect} perfect · {run.current.good} good · {run.current.miss} missed · {run.current.stray} off beat</p></div>}
      {mode!=='paused' && <div className="difficulty" aria-label="Difficulty"><button aria-pressed={easy} onClick={()=>setEasy(true)}>Flow <small>Quarter notes</small></button><button aria-pressed={!easy} onClick={()=>setEasy(false)}>Rush <small>Offbeats + chords</small></button></div>}
      <button className="start" disabled={busy} onClick={()=>void(mode==='paused'?resume():start())}>{busy?'Starting…':mode==='paused'?'Back to the beat':mode==='finished'?'Go again':'Play'} <span>↗</span></button>
      <p className="controls">D F J K on keyboard · tap the four pads on mobile</p>
      <details><summary>Timing & motion</summary><label>Audio delay <output>{offset} ms</output><input type="range" min="-200" max="200" step="5" value={offset} onChange={e=>{setOffset(+e.target.value);offsetRef.current=+e.target.value;}}/></label><p className="hint">If your taps read late, increase the delay. Wired audio gives the most consistent timing.</p><label className="motion"><input type="checkbox" checked={quiet} onChange={e=>{setQuiet(e.target.checked);quietRef.current=e.target.checked;}}/> Softer light, fewer effects</label></details>
      {error && <p role="alert">{error}</p>}
    </section></div>}
  </main>;
}

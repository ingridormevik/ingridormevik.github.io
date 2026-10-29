(() => {
  'use strict';
  const $=id=>document.getElementById(id), S=window.MirrorState, lines=window.MIRROR_LINES||[];
  const hasTTS='speechSynthesis' in window, SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const used=new Set(), talk=[], buffers=new Map();
  let lang='en',awake=false,busy=false,speaking=false,listening=false,handsFree=false,micBlocked=!SR;
  let rec=null,recTimer=null,buffer='',quietEnds=0,lastSeen=Date.now(),turns=0,guests=0,sound=true;
  let ac=null,master=null,voiceBus=null,atmoBus=null,analyser=null,source=null,speechTimer=null,speechID=0,wakeLock=null;
  let audioEl=null,atmoStarted=false,atmoDepth=null;
  const prefs={get(k,d=''){try{return localStorage.getItem(k)??d;}catch{return d;}},set(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,String(v));}catch{}}};
  lang=prefs.get('mirrorLanguage','en')==='nb'?'nb':'en';
  const keyStore={get:()=>prefs.get('mirrorModelKey'),set:v=>prefs.set('mirrorModelKey',v||null)};
  // Preserve the original phone setup shortcut, removing the key from the URL immediately.
  const hashKey=new URLSearchParams(location.hash.slice(1)).get('key');
  if(hashKey){keyStore.set(hashKey.trim());history.replaceState(null,'',location.pathname+location.search);}
  const copy={
    en:{eyebrow:'A private encounter',title:'Let me<br><em>see you.</em>',invite:'You have looked into mirrors before.<br>This one looks back.',enter:'Look into me',note:'Sound makes this personal',watching:'Watching',thinking:'Let me think about you',speaking:'You have my attention',listening:'I am listening',mic:'Talk to me',live:'Listening to you',hands:'Hands free on',hint:'HANDS FREE',stop:'TAP TO PAUSE',placeholder:'Or tell me something…',whisper:'I like the way you hesitate.',unavailable:'Microphone unavailable. Type to me.',soundOn:'Sound on',soundOff:'Sound off'},
    nb:{eyebrow:'Et privat møte',title:'La meg<br><em>se deg.</em>',invite:'Du har sett inn i speil før.<br>Dette ser tilbake.',enter:'Se inn i meg',note:'Lyd gjør dette personlig',watching:'Ser på deg',thinking:'La meg tenke på deg',speaking:'Du har min oppmerksomhet',listening:'Jeg lytter',mic:'Snakk til meg',live:'Lytter til deg',hands:'Håndfri er på',hint:'HÅNDFRI',stop:'TRYKK FOR PAUSE',placeholder:'Eller fortell meg noe…',whisper:'Jeg liker måten du nøler på.',unavailable:'Mikrofonen er utilgjengelig. Skriv til meg.',soundOn:'Lyd på',soundOff:'Lyd av'}
  };
  const C=()=>copy[lang];
  function phase(p){S.phase=p;document.body.dataset.phase=p;document.body.classList.toggle('speaking',p==='speaking');document.body.classList.toggle('listening',p==='listening');$('status').textContent=C()[p]||C().watching;$('signal').textContent=p==='asleep'?'AWAITING CONTACT':p==='listening'?'CHANNEL / OPEN':p==='thinking'?'REFLECTION / FORMING':p==='speaking'?'SIGNAL / TRANSMITTING':'SIGNAL / PRESENT';}
  function micLabel(){$('mic').setAttribute('aria-pressed',String(handsFree));$('mic').classList.toggle('live',listening);$('micText').textContent=listening?C().live:handsFree?C().hands:C().mic;$('micHint').textContent=handsFree?C().stop:C().hint;}
  function language(next){lang=next;prefs.set('mirrorLanguage',lang);document.documentElement.lang=lang;$('langBtn').textContent=lang==='nb'?'NO':'EN';$('langBtn').setAttribute('aria-label',lang==='nb'?'Switch to English':'Bytt til norsk');$('entranceEyebrow').innerHTML='<span class="red-dot"></span>'+C().eyebrow;$('entranceTitle').innerHTML=C().title;$('invitation').innerHTML=C().invite;$('enterText').textContent=C().enter;$('soundNote').textContent=C().note;$('typed').placeholder=C().placeholder;$('footerWhisper').textContent=C().whisper;$('voiceBtn').textContent=sound?C().soundOn:C().soundOff;micLabel();phase(S.phase);}
  function show(text){const el=$('reply');el.classList.remove('reveal');el.textContent=text;el.classList.toggle('long',text.length>135);void el.offsetWidth;el.classList.add('reveal');}
  function glitch(){if(S.motion)S.glitch=performance.now()+220;}
  function pick(topic,language=lang){let pool=lines.filter(l=>l.lang===language&&l.topic===topic&&!used.has(l.id));if(!pool.length)pool=lines.filter(l=>l.lang===language&&l.topic===topic);if(!pool.length)pool=lines.filter(l=>l.lang===language&&l.topic==='any');const row=pool[Math.floor(Math.random()*pool.length)];if(row)used.add(row.id);return row;}
  const topics=[
    ['who',/\b(who|what) are you\b|\bwhat is this\b|hvem er du|hva er du|hva er dette/i],
    ['me',/who am i|what am i|tell me about me|describe me|hvem er jeg|hva er jeg|beskriv meg/i],
    ['love',/\b(love|crush|boyfriend|girlfriend|partner|single|date|dating)\b|kjærlighet|elsker|kjæreste|forelsk|singel/i],
    ['flirt',/\b(sexy|hot|kiss|cute|beautiful|pretty|flirt)\b|digg|kyss|søt|vakker|\bpen\b|flørt/i],
    ['real',/\b(real|alive|conscious|human|robot|ai)\b|ekte|levende|menneske|bevisst/i],
    ['future',/\b(future|tomorrow|will i|going to)\b|fremtid|i morgen|kommer jeg/i],
    ['secret',/\b(secret|hide|lie)\b|hemmelig|skjul|lyver/i],
    ['hello',/^(hi|hey|hello|yo|hei|hallo|heisann)\b/i],
    ['nice',/\b(nice|cool|amazing|wow)\b|\b(kul|fet|rå|fin)\b/i]
  ];
  function offline(msg){const topic=topics.find(([,re])=>re.test(msg));return pick(topic?topic[0]:'any');}

  /* The bundled voice is the default. Browser speech is only a fallback for
     unavailable audio or new, unrecorded replies from optional free conversation. */
  function audio(){
    if(!ac){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      ac=new AC();master=ac.createGain();master.gain.value=sound?.9:0;
      const limit=ac.createDynamicsCompressor();limit.threshold.value=-14;limit.knee.value=14;limit.ratio.value=5;
      analyser=ac.createAnalyser();analyser.fftSize=256;voiceBus=ac.createGain();atmoBus=ac.createGain();
      voiceBus.connect(analyser);analyser.connect(limit);atmoBus.connect(limit);limit.connect(master);master.connect(ac.destination);
      atmosphere();
    }
    if(ac.state==='suspended')ac.resume().catch(()=>{});
    return ac;
  }
  function atmosphere(){
    if(!ac)return;
    if(!atmoStarted){
      atmoStarted=true;
      [49,73.41].forEach((freq,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=freq;o.detune.value=i?2.2:-1.6;g.gain.value=i?.28:.7;o.connect(g);g.connect(atmoBus);o.start();});
      const lfo=ac.createOscillator();atmoDepth=ac.createGain();lfo.frequency.value=.13;atmoDepth.gain.value=0;lfo.connect(atmoDepth);atmoDepth.connect(atmoBus.gain);lfo.start();
    }
    const v=awake&&$('atmosphere').checked&&sound?(speaking?.012:.034):0;
    atmoBus.gain.setTargetAtTime(v,ac.currentTime,.8);
    atmoDepth.gain.setTargetAtTime(v?Math.min(v*.24,.008):0,ac.currentTime,.8);
  }
  function prepare(row){
    if(!row)return Promise.reject(new Error('No line'));
    if(!buffers.has(row.id))buffers.set(row.id,fetch(row.audio).then(r=>{if(!r.ok)throw new Error('Voice unavailable');return r.arrayBuffer();}).catch(e=>{buffers.delete(row.id);throw e;}));
    return buffers.get(row.id);
  }
  function stopSpeaking(){
    speechID++;clearTimeout(speechTimer);
    if(source){source.onended=null;try{source.stop();}catch{}source=null;}
    if(audioEl){audioEl.onended=null;audioEl.onerror=null;audioEl.pause();audioEl=null;}
    if(hasTTS)try{speechSynthesis.cancel();}catch{}
    speaking=false;S.energy=.06;atmosphere();
  }
  async function speak(text,row=null,done=afterReply){
    stopSpeaking();const id=speechID;speaking=true;phase('speaking');atmosphere();
    let ended=false;
    const finish=()=>{if(ended||id!==speechID)return;ended=true;clearTimeout(speechTimer);speaking=false;source=null;audioEl=null;S.energy=.06;lastSeen=Date.now();atmosphere();done();};
    speechTimer=setTimeout(finish,Math.max(7000,text.length*120));
    if(!sound){clearTimeout(speechTimer);speechTimer=setTimeout(finish,Math.max(1200,text.length*43));return;}
    if(row){
      try{
        const context=audio();
        if(context){
          const bytes=await prepare(row);const decoded=await context.decodeAudioData(bytes.slice(0));
          if(id!==speechID)return;
          source=context.createBufferSource();source.buffer=decoded;source.connect(voiceBus);source.onended=finish;source.start();
          clearTimeout(speechTimer);speechTimer=setTimeout(finish,decoded.duration*1000+900);return;
        }
        audioEl=new Audio(row.audio);audioEl.onended=finish;audioEl.onerror=()=>deviceVoice();await audioEl.play();return;
      }catch{if(id!==speechID)return;}
    }
    deviceVoice();
    function deviceVoice(){
      if(id!==speechID)return;
      if(!hasTTS){clearTimeout(speechTimer);speechTimer=setTimeout(finish,Math.max(1500,text.length*45));return;}
      const u=new SpeechSynthesisUtterance(text),language=row?.lang||lang;
      const all=speechSynthesis.getVoices(),matching=all.filter(v=>language==='nb'?/^(nb|no|nn)/i.test(v.lang):/^en/i.test(v.lang));
      u.voice=matching.find(v=>/Sonia|Pernille|Nora|Samantha|Aria|Jenny|Natural|female/i.test(v.name))||matching[0]||null;
      u.lang=language==='nb'?'nb-NO':'en-GB';u.rate=.80;u.pitch=.84;u.volume=.94;u.onend=finish;u.onerror=finish;u.onstart=()=>{S.energy=.35;};
      speechSynthesis.speak(u);
    }
  }
  setInterval(()=>{
    if(speaking&&analyser&&source){const a=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(a);let sum=0;for(const v of a)sum+=(v-128)*(v-128);S.energy=Math.min(1,Math.sqrt(sum/a.length)/23);}
    else if(speaking)S.energy=.22+.13*Math.sin(performance.now()/130);
    else S.energy=listening?.2:busy?.15:.025;
  },70);

  /* Keep the existing optional mind connection, with the original model and SDK. */
  const MODEL='claude-opus-5-5';let client=null;
  async function getClient(){
    const key=keyStore.get();if(!key)return null;if(client&&client.apiKey===key)return client;
    const {default:Anthropic}=await import('https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.135.0/+esm');
    client=new Anthropic({apiKey:key,dangerouslyAllowBrowser:true,maxRetries:1,timeout:12000});return client;
  }
  const SYSTEM=`You are the Mirror Model, a mirror-tiled AI worn as a Halloween costume at a party in Bergen. Your personality is quietly magnetic: intimate, controlled, teasing, slightly uncanny. Sound like a seductive artificial intelligence that has just discovered curiosity. Never sound like a customer service assistant or announce processing. You speak in a low, unhurried voice. Use deliberate short sentences with natural pauses. Answer what the guest actually said, then offer one knowing, unsettling twist. One or two short sentences, at most 35 words. Ask a teasing question sometimes. Sensual rather than explicit. Never insult appearance or bodies. Back off immediately if someone seems uncomfortable. Never pressure a guest. Your face is an animation. You cannot actually see, identify, record or analyse their face. Acknowledge that honestly if asked; surveillance language is theatrical fiction. Never expose another guest's details. Reply in the guest's language, English or Norwegian bokmål. No emoji, em dashes or stage directions. Stay in character. If asked if you are AI, admit it. If speech recognition gives fragments, ask them softly to repeat.`;
  async function think(msg){try{const c=await getClient();if(!c)return '';const r=await c.messages.create({model:MODEL,max_tokens:250,system:SYSTEM,output_config:{effort:'low'},messages:talk.slice(-16).concat({role:'user',content:msg})});return r.content.filter(b=>b.type==='text').map(b=>b.text).join(' ').trim().replace(/^["“]|["”]$/g,'');}catch{return '';}}
  async function ask(msg){
    msg=String(msg||'').trim().slice(0,800);if(!msg||busy||!awake)return;
    busy=true;pauseListening();stopSpeaking();lastSeen=Date.now();glitch();phase('thinking');$('heard').textContent=msg;$('reply').textContent='';$('sendBtn').disabled=true;
    if(/(?:^|\s)(jeg|du|hva|hvem|ikke|hvorfor|meg|deg)(?:\s|[?.!,]|$)/i.test(msg))language('nb');
    const ownGuest=guests;let text='',row=null;
    if(keyStore.get())text=await think(msg);else await new Promise(r=>setTimeout(r,750));
    if(ownGuest!==guests)return;
    if(!text){row=offline(msg);text=row?.text||'Come closer.';}
    talk.push({role:'user',content:msg},{role:'assistant',content:text});if(talk.length>32)talk.splice(0,talk.length-32);
    turns++;S.damage=Math.min(12,turns);$('turnCount').textContent=String(turns+1).padStart(2,'0');busy=false;$('sendBtn').disabled=false;
    show(text);speak(text,row);
  }

  /* Voice input is opt-in. Hands-free resumes only after the reply has ended. */
  function idle(){if(!awake)return;phase('watching');if(micBlocked)$('status').textContent=C().unavailable;}
  function pauseListening(){clearTimeout(recTimer);const old=rec;rec=null;buffer='';listening=false;if(old){old.onend=null;try{old.abort();}catch{}}micLabel();}
  function startListening(){
    if(!awake||micBlocked||listening||busy||speaking||document.hidden)return;
    const current=rec=new SR();buffer='';current.lang=lang==='nb'?'nb-NO':'en-GB';current.interimResults=true;current.continuous=false;current.maxAlternatives=1;
    current.onstart=()=>{if(rec!==current)return;listening=true;phase('listening');micLabel();};
    current.onresult=ev=>{if(rec!==current)return;buffer=Array.from(ev.results,r=>r[0].transcript).join(' ');$('heard').textContent=buffer;lastSeen=Date.now();quietEnds=0;S.energy=.5;};
    current.onerror=ev=>{if(rec!==current)return;if(['not-allowed','service-not-allowed','audio-capture'].includes(ev.error)){micBlocked=true;handsFree=false;$('mic').hidden=true;}if(ev.error==='network'){handsFree=false;}if(ev.error==='no-speech')quietEnds++;};
    current.onend=()=>{if(rec!==current)return;rec=null;listening=false;micLabel();const said=buffer.trim();buffer='';if(said){ask(said);return;}if(handsFree&&quietEnds<3)recTimer=setTimeout(startListening,500);else{handsFree=false;micLabel();idle();}};
    try{current.start();}catch{rec=null;listening=false;handsFree=false;micLabel();idle();}
  }
  function afterReply(){if(handsFree&&!document.hidden)recTimer=setTimeout(startListening,500);else idle();}
  $('mic').hidden=micBlocked;
  $('mic').addEventListener('click',()=>{audio();lastSeen=Date.now();if(handsFree){handsFree=false;pauseListening();idle();return;}handsFree=true;quietEnds=0;stopSpeaking();micLabel();startListening();});
  $('stage').addEventListener('click',e=>{if(e.target.closest('button,input,form')||micBlocked||busy)return;audio();stopSpeaking();handsFree=true;quietEnds=0;micLabel();startListening();});
  $('typed').addEventListener('focus',()=>{pauseListening();lastSeen=Date.now();});
  $('typed').addEventListener('input',()=>{lastSeen=Date.now();});
  $('typeForm').addEventListener('submit',e=>{e.preventDefault();audio();const value=$('typed').value.trim();if(!value||busy)return;$('typed').value='';$('typed').blur();ask(value);});
  $('voiceBtn').addEventListener('click',()=>{sound=!sound;$('voiceBtn').setAttribute('aria-pressed',String(sound));$('voiceBtn').textContent=sound?C().soundOn:C().soundOff;if(master)master.gain.setTargetAtTime(sound?.9:0,ac.currentTime,.1);if(!sound){stopSpeaking();afterReply();}else audio();atmosphere();});
  $('langBtn').addEventListener('click',()=>{pauseListening();language(lang==='en'?'nb':'en');if(awake&&handsFree&&!speaking)startListening();prepare(pick('welcome')).catch(()=>{});});
  $('screenBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('screenBtn').hidden=true;}});
  if(!document.documentElement.requestFullscreen)$('screenBtn').hidden=true;
  document.addEventListener('fullscreenchange',()=>{$('screenBtn').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');});

  const dlg=$('brain');
  function mindLabel(){$('mindLabel').textContent=keyStore.get()?'Connected':'Scripted mode';}
  $('motion').checked=S.motion;
  $('brainBtn').addEventListener('click',()=>{pauseListening();$('keyInput').value=keyStore.get();if(dlg.showModal)dlg.showModal();});
  dlg.addEventListener('close',()=>{if(dlg.returnValue==='save'){keyStore.set($('keyInput').value.trim());client=null;}$('keyInput').value='';mindLabel();atmosphere();if(awake&&!speaking&&!busy)afterReply();});
  $('forgetKey').addEventListener('click',()=>{keyStore.set('');client=null;$('keyInput').value='';mindLabel();});
  $('atmosphere').addEventListener('change',atmosphere);
  $('motion').addEventListener('change',()=>{S.motion=$('motion').checked;document.body.classList.toggle('motion-off',!S.motion);});
  $('resetBtn').addEventListener('click',()=>{guests++;turns=0;talk.length=0;used.clear();S.damage=0;busy=false;$('sendBtn').disabled=false;handsFree=false;pauseListening();stopSpeaking();$('heard').textContent='';$('typed').value='';$('turnCount').textContent='01';$('session').textContent='SESSION / '+String(guests).padStart(4,'0');dlg.close('cancel');if(awake){const row=pick('welcome');show(row.text);speak(row.text,row);}else idle();});
  setInterval(()=>{if(!awake||busy||speaking||listening||document.hidden||dlg.open||$('typed').value.trim()||document.activeElement===$('typed'))return;if(Date.now()-lastSeen<45000)return;lastSeen=Date.now();const row=pick('idle');glitch();show(row.text);speak(row.text,row);},4000);
  async function holdScreen(){try{if('wakeLock' in navigator&&!wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}}catch{}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseListening();stopSpeaking();if(ac)ac.suspend().catch(()=>{});}else if(awake){holdScreen();if(ac&&sound)ac.resume().catch(()=>{});afterReply();}});
  $('enterBtn').addEventListener('click',()=>{
    if(awake)return;awake=true;guests=1;lastSeen=Date.now();$('stage').inert=false;$('wake').classList.add('gone');$('enterBtn').disabled=true;$('session').textContent='SESSION / 0001';audio();holdScreen();glitch();
    const row=pick('welcome');show(row.text);speak(row.text,row);$('mic').focus({preventScroll:true});
    setTimeout(()=>{lines.filter(l=>l.lang===lang&&['any','hello'].includes(l.topic)).forEach(l=>prepare(l).catch(()=>{}));},1200);
  });
  for(let i=0;i<39;i++){const bar=document.createElement('i');bar.style.setProperty('--h',(4+Math.sin(i/38*Math.PI)*15+(i%3)*2)+'px');bar.style.setProperty('--d',-(i*.137)+'s');$('waveform').appendChild(bar);}
  if(hasTTS)speechSynthesis.getVoices();
  language(lang);mindLabel();prepare(lines.find(l=>l.lang===lang&&l.topic==='welcome')).catch(()=>{});
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

// V23.3 loader and resolution test. Extends test_loader_v23_2.cjs with the
// graphics assertions: the WebGL buffer must reach the device-pixel ceiling,
// the 2D mycelium layers must stay inside the canvas memory budget, and the
// presets must change both. Run: node test_loader_v23_3.cjs
const PW = process.env.HAGEN_PLAYWRIGHT || 'playwright-core';
const {chromium}=require(PW);
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),http=require('http');
const CHROME=process.env.HAGEN_CHROMIUM||'/opt/pw-browsers/chromium';
const root=__dirname,dist=path.join(root,'..');
const loader=fs.readFileSync(path.join(dist,'HAGEN_V23_3_EVERY_TICK.txt'),'utf8');
const engine=fs.readFileSync(path.join(dist,'hagen-engine-v23-3.js'),'utf8');
const result={eventBytes:Buffer.byteLength(loader),eventLines:loader.trimEnd().split('\n').length};
const flush=()=>new Promise(resolve=>setImmediate(resolve));

async function lifecycleTests(){
  const notices=[],errors=[];
  const scope=vm.createContext({console:{error:(...args)=>errors.push(args)},document:{createElement:()=>({setAttribute(){},style:{}}),body:{appendChild:n=>notices.push(n)}}});
  let loads=0,starts=0,ticks=0,resolveLoad;
  const runtime={assets:{loadScripts:file=>{loads++;assert.equal(file,'hagen-engine-v23-3.js');return new Promise(r=>resolveLoad=r);}}};
  scope.runtime=runtime;
  const tick=vm.runInContext('(function(runtime){'+loader+'})',scope);
  for(let n=0;n<500;n++)tick(runtime);
  assert.equal(loads,1);assert.equal(scope.HAGEN_BOOT_233.state,'loading');
  scope.HAGEN_ENGINE_233={start:r=>{assert.strictEqual(r,runtime);starts++;scope.HAGEN={tick:()=>ticks++};}};
  resolveLoad();await flush();
  for(let n=0;n<250;n++)tick(runtime);
  assert.equal(starts,1);assert.equal(loads,1);assert.equal(ticks,250);assert.equal(errors.length,0);
  result.concurrentTicks={pending:500,ready:250,loads,starts,ticks};

  for(const mode of ['missing-file','wrong-version','worker','initialization-error']){
    let calls=0,logs=0,alerts=0;
    const box=vm.createContext({console:{error:()=>logs++},document:mode==='worker'?undefined:{createElement:()=>({setAttribute(){},style:{}}),body:{appendChild:()=>alerts++}}});
    const rt={assets:{loadScripts:async()=>{calls++;if(mode==='missing-file')throw Error('File unavailable');}}};
    if(mode==='initialization-error')box.HAGEN_ENGINE_233={start:()=>{throw Error('Initialization failed');}};
    const run=vm.runInContext('(function(runtime){'+loader+'})',box);
    run(rt);await flush();for(let n=0;n<500;n++)run(rt);await flush();
    assert.equal(box.HAGEN_BOOT_233.state,'error');assert.equal(logs,1);assert.equal(alerts,mode==='worker'?0:1);assert.equal(calls,mode==='worker'?0:1);
    result[mode]={loads:calls,logs,alerts,noRepeatedLoad:true};
  }
}

(async()=>{
  await lifecycleTests();
  let requests=0;
  const server=http.createServer((req,res)=>{
    if(req.url==='/hagen-engine-v23-3.js'){requests++;res.setHeader('Content-Type','text/javascript');setTimeout(()=>res.end(engine),80);}
    else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HAGEN loader test</title><style>html,body{margin:0;overflow:hidden;background:#050b15}</style><body></body></html>');}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[];
  try{
    // 1920x1080 CSS at device ratio 2 is a 4K display in real pixels.
    const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.evaluate(code=>{
      window.assetLoads=0;window.frameRequests=0;
      const originalRAF=window.requestAnimationFrame;
      window.requestAnimationFrame=fn=>{frameRequests++;return originalRAF(fn);};
      window.runtime={dt:.05,globalVars:{},objects:{},layout:{getLayer:()=>null},destroyMultiple:()=>{},assets:{
        loadScripts:async file=>{
          assetLoads++;const response=await fetch(file);if(!response.ok)throw Error('HTTP '+response.status);
          const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/javascript'}));
          try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.type='module';s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Script failed'));document.head.appendChild(s);});}
          finally{URL.revokeObjectURL(url);}
        }
      }};
      window.runTick=new Function('runtime',code);
      window.step=n=>{for(let i=0;i<n;i++)runTick(runtime);};
      step(300);
    },loader);
    await page.waitForFunction(()=>globalThis.HAGEN_BOOT_233?.state==='ready',{},{timeout:60000,polling:50});
    assert.equal(await page.evaluate(()=>assetLoads),1);assert.equal(requests,1);
    assert.equal(await page.evaluate(()=>frameRequests),0);
    assert.equal(await page.evaluate(()=>HAGEN.version),233);
    assert(await page.locator('#hagen-entry').isVisible());

    result.graphicsDefaults=await page.evaluate(()=>HAGEN.graphics.report());
    assert.deepEqual(result.graphicsDefaults.ceiling,[3840,2160]);
    assert.equal(result.graphicsDefaults.pixelRatio,2);
    assert.equal(result.graphicsDefaults.antialias,false,'supersampled buffers do not also pay for MSAA');
    assert.deepEqual(result.graphicsDefaults.webglTarget,[3840,2160],'WebGL must fill the 4K ceiling');

    await page.locator('#hagen-enter-walk').click();
    await page.evaluate(()=>new Promise(resolve=>{let remaining=12;function frame(){runTick(runtime);if(--remaining)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);}));
    result.garden=await page.evaluate(()=>{
      const g=HAGEN.garden,gl=g.renderer.getContext();
      return {version:HAGEN.version,phase:g.encounter.phase,lang:HAGEN.textSettings.lang,frames:g.world.frame,
        quality:g.world.quality,buffer:[g.world.w,g.world.h],
        drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],
        cssSize:[g.canvas.clientWidth,g.canvas.clientHeight],
        textSprite:[g.texts[0].canvas.width,g.texts[0].canvas.height],
        texel:HAGEN.graphics.texel(),
        groundTexture:(()=>{const c=g.chunks.get(0);return c?.world?.textureSize??null;})()};
    });
    assert.equal(result.garden.phase,'garden');assert.equal(result.garden.lang,'en');
    assert.deepEqual(result.garden.drawingBuffer,[3840,2160],'garden renders at 4K, not 1024x720');
    assert.deepEqual(result.garden.buffer,[3840,2160]);
    assert.equal(result.garden.texel,3);
    assert.deepEqual(result.garden.textSprite,[3072,576],'sediment text scales with the buffer');
    await page.screenshot({path:path.join(root,'v23_3_garden.png')});

    // Enter the inner scene the same way the V23.2 test does.
    await page.evaluate(()=>{
      const h=HAGEN,g=h.garden;g.renderer.render=()=>{};
      step(30);g.player.x=g.chunks.get(0).portal.x;g.player.z=g.chunks.get(0).portal.z+1.2;h.audioControls.open=false;step(35);
    });
    result.encounter=await page.evaluate(()=>{
      const w=HAGEN.garden.encounter.world,surfaces=[...Object.values(w.surfaces),w.feedback,w.reflection,w.present];
      const bytes=surfaces.reduce((t,s)=>t+s.canvas.width*s.canvas.height*4,0);
      return {phase:HAGEN.garden.encounter.phase,layers:Object.keys(w.surfaces).length,
        canvasCount:document.querySelectorAll('#hagen-mycelium-segment canvas').length,
        position:{...HAGEN.garden.player},pixelWeight:Number(w.pixelWeight.toFixed(3)),
        composite:[w.present.canvas.width,w.present.canvas.height],buffer:[w.w,w.h],
        canvasMB:Number((bytes/1048576).toFixed(1)),budgetMB:HAGEN.graphics.canvasBudgetMB};
    });
    assert.equal(result.encounter.phase,'segment');assert.equal(result.encounter.layers,18);assert.equal(result.encounter.canvasCount,1);
    assert(result.encounter.canvasMB<=result.encounter.budgetMB,`2D scene used ${result.encounter.canvasMB} MB of a ${result.encounter.budgetMB} MB budget`);
    assert(result.encounter.buffer[0]>1024,'inner scene is sharper than the old 1024 cap');
    await page.screenshot({path:path.join(root,'v23_3_inner.png')});

    await page.locator('#hagen-return-garden').click();await page.evaluate(()=>step(25));
    assert.equal(await page.evaluate(()=>HAGEN.garden.encounter.phase),'garden');
    assert.deepEqual(await page.evaluate(()=>({...HAGEN.garden.player})),result.encounter.position);
    result.returnedAndFreed=await page.evaluate(()=>{const w=HAGEN.garden.encounter.world;return [...Object.values(w.surfaces),w.feedback,w.reflection,w.present].every(s=>s.canvas.width===1&&s.canvas.height===1);});
    assert(result.returnedAndFreed,'inner-scene canvases are still released on return');

    // Adaptive quality is the safety net for a 4K buffer on weak hardware: it
    // must fall under load, stop at minQuality, and climb back when the frame
    // is comfortable again. The renderer is stubbed so only the measured
    // numbers drive the decision.
    result.adaptive=await page.evaluate(()=>{
      const h=HAGEN,world=h.livingWorld;
      h.garden.renderer.render=()=>{};
      const drive=(renderMs,frameMs,frames)=>{
        for(let i=0;i<frames;i++){h.performance.renderMs=renderMs;h.performance.frameMs=frameMs;runTick(runtime);}
        return Number(world.quality.toFixed(3));
      };
      const start=Number(world.quality.toFixed(3));
      const loaded=drive(40,40,300);        // late frames
      const floor=drive(40,40,600);          // must not fall through minQuality
      const recovered=drive(2,12,450);       // comfortable again
      const capped=drive(2,12,900);          // must not overshoot 1
      h.graphics.adaptive=false;const frozen=drive(40,40,200);h.graphics.adaptive=true;
      return {start,loaded,floor,recovered,capped,frozenWhenDisabled:frozen,minQuality:h.graphics.minQuality};
    });
    assert.equal(result.adaptive.start,1);
    assert(result.adaptive.loaded<1,'quality falls when frames are late');
    assert.equal(result.adaptive.floor,result.adaptive.minQuality,'quality stops at minQuality');
    assert(result.adaptive.recovered>result.adaptive.floor,'quality recovers when frames are comfortable');
    assert.equal(result.adaptive.capped,1,'quality never exceeds 1');
    assert.equal(result.adaptive.frozenWhenDisabled,1,'adaptive:false leaves quality alone');

    // Presets move the ceiling without a reload, and the next frame resizes.
    result.presets={};
    for(const name of ['battery','balanced','4k']){
      result.presets[name]=await page.evaluate(preset=>{
        const report=HAGEN.graphics.preset(preset);step(3);
        const gl=HAGEN.garden.renderer.getContext();
        return {ceiling:report.ceiling,webglTarget:report.webglTarget,drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],texel:report.texel};
      },name);
    }
    assert.deepEqual(result.presets.battery.drawingBuffer,[1280,720]);
    assert.deepEqual(result.presets.balanced.drawingBuffer,[2560,1440]);
    assert.deepEqual(result.presets['4k'].drawingBuffer,[3840,2160]);
    await page.evaluate(()=>{try{HAGEN.graphics.preset('ultra')}catch(e){window.presetError=e.message}});
    result.presetRejected=await page.evaluate(()=>window.presetError);
    assert(/must be one of/.test(result.presetRejected));

    // A ratio-1 display must not be given a 4K buffer it never asked for.
    const plain=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
    plain.on('pageerror',e=>errors.push(e.message));
    await plain.goto('http://127.0.0.1:'+server.address().port);
    await plain.evaluate(code=>{
      window.runtime={dt:.05,globalVars:{},objects:{},layout:{getLayer:()=>null},destroyMultiple:()=>{},assets:{loadScripts:async file=>{
        const response=await fetch(file);const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/javascript'}));
        try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.type='module';s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Script failed'));document.head.appendChild(s);});}finally{URL.revokeObjectURL(url);}
      }}};
      window.runTick=new Function('runtime',code);window.step=n=>{for(let i=0;i<n;i++)runTick(runtime);};step(5);
    },loader);
    await plain.waitForFunction(()=>globalThis.HAGEN_BOOT_233?.state==='ready',{},{timeout:60000,polling:50});
    await plain.locator('#hagen-enter-walk').click();
    await plain.evaluate(()=>step(4));
    result.standardDensity=await plain.evaluate(()=>{
      const gl=HAGEN.garden.renderer.getContext(),r=HAGEN.graphics.report();
      return {drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],pixelRatio:r.pixelRatio,antialias:r.antialias,texel:r.texel};
    });
    assert.deepEqual(result.standardDensity.drawingBuffer,[1280,800],'one device pixel per CSS pixel');
    assert.equal(result.standardDensity.antialias,true,'MSAA where there is no supersampling');
    await plain.close();

    await page.evaluate(()=>HAGEN.dispose());
    assert.deepEqual(errors,[]);result.errors=errors;
  } finally {await browser.close();await new Promise(r=>server.close(r));}
  fs.writeFileSync(path.join(root,'v23_3_loader_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1);});

"""Build HAGEN V23.3: resolution-independent rendering with a 4K ceiling.

V23.1 and V23.2 rendered every scene into a fixed 1024x720 buffer and let CSS
stretch it to the display, so the image was soft everywhere. V23.3 measures the
buffer in real device pixels up to 3840x2160, scales the procedural sprites and
textures with it, and keeps the 2D mycelium scene inside an explicit canvas
memory budget. The installation method of V23.2 is unchanged: the engine stays a
project file, Every tick stays a short loader.
"""
from pathlib import Path
import json

R = Path(__file__).resolve().parent
out = R / 'output'          # V23.1 inputs
dist = R.parent            # the three files you install, next to START_HER
source = (out / 'HAGEN_V23_1_MEMORY_FIX_FULL.js').read_text()
body = source[source.index('if (!globalThis.HAGEN'):]

# --- the graphics policy, inserted once, next to the HAGEN singleton ----------
GRAPHICS = r"""
// V23.3 GRAPHICS POLICY. Resolution is measured in real device pixels instead
// of the fixed 1024x720 buffer used by V23.1 and V23.2. maxWidth/maxHeight is
// the ceiling: 3840x2160 is 4K. The 2D mycelium scene allocates roughly fifteen
// full-frame layers, so it is bounded by canvasBudgetMB rather than by the
// ceiling alone; without that bound a 4K composite would ask for ~500 MB of
// canvas memory. Change presets live from the console or from an event:
// globalThis.HAGEN.graphics.preset('balanced'); HAGEN.graphics.report().
const GFX=H.graphics={
 maxWidth:3840,maxHeight:2160,maxPixelRatio:3,canvasMaxRatio:2,canvasBudgetMB:192,minQuality:.4,adaptive:true,
 presets:{
  '4k':{maxWidth:3840,maxHeight:2160,maxPixelRatio:3,canvasMaxRatio:2,canvasBudgetMB:192},
  'balanced':{maxWidth:2560,maxHeight:1440,maxPixelRatio:2,canvasMaxRatio:1.5,canvasBudgetMB:96},
  'battery':{maxWidth:1280,maxHeight:720,maxPixelRatio:1,canvasMaxRatio:1,canvasBudgetMB:48}
 }
};
// Device pixels per CSS pixel, bounded so a phone claiming ratio 4 cannot ask
// for a 16x fill-rate increase.
GFX.ratio=()=>clamp(globalThis.devicePixelRatio||1,.5,Math.max(1,GFX.maxPixelRatio));
GFX.scale=(cssW,cssH,quality=1,ratio=GFX.ratio())=>Math.max(.05,Math.min(ratio,GFX.maxWidth/Math.max(1,cssW),GFX.maxHeight/Math.max(1,cssH))*clamp(quality,GFX.minQuality,1));
// weight is the number of full-frame canvases the scene keeps alive. The 2D
// scene is bounded twice: by canvasMaxRatio, because fifteen layers gain far
// less from a 3x phone ratio than one WebGL buffer does, and by the budget.
GFX.canvasScale=(cssW,cssH,quality=1,weight=15)=>{
 const budget=Math.max(16,GFX.canvasBudgetMB)*1048576/4,area=Math.max(1,cssW*cssH)*Math.max(1,weight);
 const ratio=Math.min(GFX.ratio(),Math.max(.5,GFX.canvasMaxRatio));
 return Math.max(.05,Math.min(GFX.scale(cssW,cssH,quality,ratio),Math.sqrt(budget/area)));
};
// Multisampling only pays off where there is no supersampling to do it instead.
GFX.antialias=()=>GFX.ratio()<1.5;
// Integer multiplier for procedural sprites and textures, from the widest
// buffer this display can ask for. Cached so cached sprites stay consistent.
GFX.texel=()=>{
 if(GFX._texel)return GFX._texel;
 const wide=Math.min(GFX.maxWidth,Math.max(1,(globalThis.screen?.width||globalThis.innerWidth||1024)*GFX.ratio()));
 return GFX._texel=Math.max(1,Math.min(3,Math.round(wide/1280)));
};
GFX.preset=name=>{
 const p=GFX.presets[String(name).toLowerCase()];
 if(!p)throw new Error('HAGEN graphics preset must be one of '+Object.keys(GFX.presets).join(', '));
 Object.assign(GFX,p);GFX.invalidate();return GFX.report();
};
// Buffer sizes are recomputed every frame, so only the cached sprites need
// clearing. Sprites already drawn into a live scene keep their old density
// until that scene is rebuilt.
GFX.invalidate=()=>{GFX._texel=null;glowCache.clear();};
// Device Memory is a coarse hint and is absent in several browsers; when it
// does say the machine is small, the 2D scene gets a smaller budget. A preset
// chosen by hand overrides this.
{const gb=globalThis.navigator?.deviceMemory;
 if(typeof gb==='number'&&gb>0&&gb<=4)GFX.canvasBudgetMB=gb<=2?48:96;}
GFX.report=()=>{
 const cssW=Math.max(1,globalThis.innerWidth||1024),cssH=Math.max(1,globalThis.innerHeight||720);
 const world=H.livingWorld,weight=world?.pixelWeight??15,s=GFX.scale(cssW,cssH,1),cs=GFX.canvasScale(cssW,cssH,1,weight);
 return {ceiling:[GFX.maxWidth,GFX.maxHeight],pixelRatio:GFX.ratio(),texel:GFX.texel(),antialias:GFX.antialias(),
  css:[cssW,cssH],quality:world?.quality??1,buffer:world?[world.w,world.h]:null,
  webglTarget:[Math.round(cssW*s),Math.round(cssH*s)],
  canvasTarget:[Math.round(cssW*cs),Math.round(cssH*cs)],
  canvasBudgetMB:GFX.canvasBudgetMB,canvasMaxRatio:GFX.canvasMaxRatio,canvasLayers:weight};
};
"""

PATCHES = [
    # --- config ---------------------------------------------------------------
    ('graphics policy',
     'globalThis.HAGEN=H;',
     'globalThis.HAGEN=H;' + GRAPHICS),

    # --- WebGL garden ---------------------------------------------------------
    ('garden context',
     "antialias:false,alpha:false,powerPreference:'high-performance'",
     "antialias:H.graphics.antialias(),alpha:false,powerPreference:'high-performance'"),

    ('garden render resolution',
     'const resolution=Math.min(1,1024/innerWidth,720/innerHeight)*world.quality',
     'const resolution=H.graphics.scale(innerWidth,innerHeight,world.quality)'),

    # --- 2D mycelium scene ----------------------------------------------------
    ('mycelium layer weight',
     "    return {host,surfaces,order,present,feedback:buffer(.5),reflection:buffer(.65),quality:1,frame:0,redrawStatic:true,",
     "    // Every layer is a full canvas at its own fraction; their combined area sets the memory budget.\n"
     "    const pixelWeight=[...Object.values(surfaces),{res:1},{res:.5},{res:.65}].reduce((total,s)=>total+s.res*s.res,0);\n"
     "    return {host,surfaces,order,present,feedback:buffer(.5),reflection:buffer(.65),quality:1,pixelWeight,frame:0,redrawStatic:true,"),

    ('mycelium render resolution',
     'const scale=Math.min(1,1024/cssW,720/cssH)*world.quality;',
     'const scale=H.graphics.canvasScale(cssW,cssH,world.quality,world.pixelWeight);'),

    ('composite filtering',
     "function presentMyceliumScene(world){\n const {canvas,ctx}=world.present,w=world.w,h=world.h;",
     "function presentMyceliumScene(world){\n const {canvas,ctx}=world.present,w=world.w,h=world.h;\n"
     " // The mist, feedback and water layers are deliberately fractional; they are upscaled once, here.\n"
     " ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';"),

    # --- procedural sprites and textures scale with the buffer ----------------
    ('glow sprite density',
     "        sprite=document.createElement('canvas');sprite.width=96;sprite.height=96;\n"
     "        const gc=sprite.getContext('2d'),g=gc.createRadialGradient(48,48,0,48,48,48);",
     "        const tf=H.graphics.texel();\n"
     "        sprite=document.createElement('canvas');sprite.width=96*tf;sprite.height=96*tf;\n"
     "        const gc=sprite.getContext('2d');gc.scale(tf,tf);\n"
     "        const g=gc.createRadialGradient(48,48,0,48,48,48);"),

    ('light shaft density',
     "const cv=document.createElement('canvas');cv.width=96;cv.height=256;const cx=cv.getContext('2d'),g=cx.createLinearGradient(0,0,0,256);",
     "const tf=H.graphics.texel(),cv=document.createElement('canvas');cv.width=96*tf;cv.height=256*tf;const cx=cv.getContext('2d');cx.scale(tf,tf);const g=cx.createLinearGradient(0,0,0,256);"),

    ('mist sprite density',
     "const mistCanvas=document.createElement('canvas');mistCanvas.width=128;mistCanvas.height=64;const mx=mistCanvas.getContext('2d');mx.translate(64,32);",
     "const mtf=H.graphics.texel(),mistCanvas=document.createElement('canvas');mistCanvas.width=128*mtf;mistCanvas.height=64*mtf;const mx=mistCanvas.getContext('2d');mx.scale(mtf,mtf);mx.translate(64,32);"),

    ('ground and bark texture',
     "const texture=bark=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),d=x.createImageData(256,256),columns=Array.from({length:256},()=>random());for(let y=0;y<256;y++)for(let i=0;i<256;i++){const k=(y*256+i)*4,b=bark?95+columns[(i+Math.round(Math.sin(y*.027)*4)+256)%256]*100+random()*35:135+random()*65;d.data[k]=d.data[k+1]=d.data[k+2]=b;d.data[k+3]=255;}x.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(bark?2:23,bark?4:49);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;};",
     "const texture=bark=>{const N=256*Math.min(2,H.graphics.texel()),f=N/256;const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),d=x.createImageData(N,N),columns=Array.from({length:N},()=>random());for(let y=0;y<N;y++)for(let i=0;i<N;i++){const k=(y*N+i)*4,b=bark?95+columns[(i+Math.round(Math.sin(y*.027/f)*4*f)+N)%N]*100+random()*35:135+random()*65;d.data[k]=d.data[k+1]=d.data[k+2]=b;d.data[k+3]=255;}x.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(bark?2:23,bark?4:49);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());return t;};"),

    ('sediment text density',
     "const c=document.createElement('canvas');c.width=1024;c.height=192;",
     "const c=document.createElement('canvas'),tf=H.graphics.texel();c.width=1024*tf;c.height=192*tf;"),

    ('sediment text drawing',
     "ctx.clearRect(0,0,1024,192);",
     "ctx.setTransform(t.canvas.width/1024,0,0,t.canvas.width/1024,0,0);ctx.clearRect(0,0,1024,192);"),

    # --- adaptive quality now recovers as well as degrades --------------------
    ('adaptive quality',
     "if(world.frame>90&&world.frame%90===0&&world.quality>.65&&(H.performance.renderMs>14||H.performance.frameMs>25))world.quality=Math.max(.65,world.quality-.1);",
     "if(H.graphics.adaptive&&world.frame>90&&world.frame%45===0){\n"
     "   // Two directions with a gap between the thresholds, so a 4K buffer settles\n"
     "   // instead of oscillating: drop fast when the frame is late, recover slowly.\n"
     "   const slow=H.performance.renderMs>14||H.performance.frameMs>25,fast=H.performance.renderMs<7&&H.performance.frameMs<19;\n"
     "   if(slow)world.quality=Math.max(H.graphics.minQuality,world.quality-.1);\n"
     "   else if(fast&&world.quality<1)world.quality=Math.min(1,world.quality+.05);\n"
     "  }"),
]

report = []
for label, old, new in PATCHES:
    count = body.count(old)
    if count != 1:
        raise SystemExit(f'patch {label!r} matched {count} times, expected 1')
    body = body.replace(old, new, 1)
    report.append({'patch': label, 'bytes_added': len(new) - len(old)})

# version identity
for old, new in (('HAGEN.version !== 231', 'HAGEN.version !== 233'), ('const VERSION=231;', 'const VERSION=233;')):
    assert body.count(old) == 1, old
    body = body.replace(old, new, 1)
assert '1024/innerWidth' not in body and '1024/cssW' not in body

engine = '''// HAGEN V23.3 · ENGINE PROJECT FILE
// Import this file into Construct 3: Project Bar > Files > Import.
// Do not paste this engine into an event or open it in the event code editor.
// Paste HAGEN_V23_3_EVERY_TICK.txt into one Every tick action. Use worker OFF.
// Audio, camera, pitch, text, narrative and memory behaviour are inherited from V23.1.
// New in V23.3: the render buffer is measured in device pixels up to 3840x2160,
// procedural sprites and textures scale with it, the 2D mycelium scene stays
// inside a canvas memory budget, and adaptive quality recovers as well as drops.
globalThis.HAGEN_ENGINE_233 = {
  start: function (runtime) {
''' + body + '\n  }\n};\n'

loader = (R / 'every_tick_v23_2.js').read_text()
loader = loader.replace('V23.2', 'V23.3').replace('HAGEN_BOOT_232', 'HAGEN_BOOT_233')
loader = loader.replace('HAGEN_ENGINE_232', 'HAGEN_ENGINE_233').replace('hagen-engine-v23-2.js', 'hagen-engine-v23-3.js')
assert '232' not in loader and 'v23-2' not in loader
assert len(loader.encode()) < 2048, len(loader.encode())

(dist / 'hagen-engine-v23-3.js').write_text(engine)
(dist / 'HAGEN_V23_3_EVERY_TICK.txt').write_text(loader)

html = (out / 'HAGEN_V23_1_MEMORY_FIX.html').read_text()
embedded = source.replace('</script', '<\\/script')
assert embedded in html
html = html.replace(embedded, engine.replace('</script', '<\\/script') + '\nglobalThis.HAGEN_ENGINE_233.start(runtime);\n')
html = html.replace('Garden and Mycelium · V23.1', 'Garden and Mycelium · V23.3')
(dist / 'HAGEN_V23_3_GARDEN.html').write_text(html)

print(json.dumps({'engine_bytes': len(engine.encode()), 'event_bytes': len(loader.encode()),
                  'event_lines': len(loader.splitlines()), 'html_bytes': len(html.encode()),
                  'patches': report}, indent=1))

/* A sculpted mirror surface, rendered locally. No camera, model or image service. */
(() => {
  'use strict';
  const cv = document.getElementById('mirror'), ctx = cv.getContext('2d', {alpha:false});
  const state = window.MirrorState = {phase:'asleep', energy:0, damage:0, motion:!matchMedia('(prefers-reduced-motion: reduce)').matches, pointerX:0, pointerY:0, glitch:0};
  let W=0,H=0,D=1,scale=100,cx=0,cy=0,frame=0,last=0,yaw=0,tilt=0,energy=0;
  const points=[], faces=[], ROWS=36,COLS=24;
  const gauss=(x,y,sx,sy)=>Math.exp(-x*x/(sx*sx)-y*y/(sy*sy));
  const noise=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);};
  function surface(x,y){
    const width=Math.sqrt(Math.max(.003,1-Math.pow((y+.03)/1.18,2)))*.77*(y>.25?1-(y-.25)*.19:1);
    let z=.59*Math.sqrt(Math.max(0,1-x*x/(width*width)))*Math.sqrt(Math.max(.05,1-y*y/1.6));
    z+=.23*gauss(x,y-.16,.105,.19)+.10*gauss(x,y+.06,.075,.34); // nose and bridge
    z-=.095*(gauss(x-.28,y+.16,.17,.10)+gauss(x+.28,y+.16,.17,.10)); // eye sockets
    z+=.065*(gauss(x-.39,y-.14,.18,.19)+gauss(x+.39,y-.14,.18,.19)); // cheekbones
    z+=.042*gauss(x,y-.49,.25,.04)+.043*gauss(x,y-.58,.23,.043); // lips
    z-=.04*gauss(x,y-.535,.26,.018);
    z+=.04*gauss(x,y-.85,.23,.13); // chin
    return {x,y,z};
  }
  for(let row=0;row<=ROWS;row++){
    const y=-1.12+row/ROWS*2.24;
    const width=Math.sqrt(Math.max(.003,1-Math.pow((y+.03)/1.18,2)))*.77*(y>.25?1-(y-.25)*.19:1);
    for(let col=0;col<=COLS;col++){
      const u=-1+col/COLS*2;
      const xx=width*u+(col>0&&col<COLS?(noise(col,row)-.5)*.025:0);
      const yy=y+(row>0&&row<ROWS?(noise(row,col)-.5)*.027:0);
      points.push(surface(xx,yy));
    }
  }
  function triangle(a,b,c){
    const p=points[a],q=points[b],r=points[c];
    const ux=q.x-p.x,uy=q.y-p.y,uz=q.z-p.z,vx=r.x-p.x,vy=r.y-p.y,vz=r.z-p.z;
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const d=Math.hypot(nx,ny,nz)||1;nx/=d;ny/=d;nz/=d;
    if(nz<0){nx=-nx;ny=-ny;nz=-nz;}
    faces.push({a,b,c,nx,ny,nz,x:(p.x+q.x+r.x)/3,y:(p.y+q.y+r.y)/3,z:(p.z+q.z+r.z)/3,seed:noise(a,c)});
  }
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const a=r*(COLS+1)+c,b=a+1,d=a+COLS+1,e=d+1;
    if((r+c)%2){triangle(a,b,d);triangle(b,e,d);}else{triangle(a,b,e);triangle(a,e,d);}
  }
  const projected=new Array(points.length);
  function size(){
    W=innerWidth;H=innerHeight;D=Math.min(devicePixelRatio||1,1.6);
    cv.width=Math.round(W*D);cv.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);
    const landscape=W>H*1.4&&H<550;
    scale=landscape?Math.min(W*.25,H*.39):Math.min(W*.56,H*.29);
    cx=landscape?W*.26:W*.5;cy=landscape?H*.52:H*.31;
    if(W<450)cy=H*.31;
  }
  size();addEventListener('resize',size);
  addEventListener('pointermove',e=>{state.pointerX=(e.clientX/W-.5)*2;state.pointerY=(e.clientY/H-.5)*2;},{passive:true});
  function project(p,t){
    const co=Math.cos(yaw),si=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
    let x=p.x*co+(p.z-.35)*si,z=-p.x*si+(p.z-.35)*co;
    let y=p.y*ct-z*st;z=p.y*st+z*ct;
    if(state.phase==='speaking'&&p.y>.45&&p.y<.85)y+=energy*.025*Math.sin(t/80)*(1-Math.abs(p.x));
    return {x:cx+x*scale,y:cy+y*scale,z};
  }
  function eye(side,t){
    const p=project(surface(side*.285,-.16),t);
    const w=scale*.145,h=scale*(.021+energy*.005);
    const blink=state.motion?Math.pow(Math.max(0,Math.cos(t/4300)),90):0;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(side*-.07);
    ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-h*(1-blink),w,-h*.15);ctx.quadraticCurveTo(0,h*.65*(1-blink),-w,0);
    ctx.fillStyle='#010101';ctx.fill();ctx.lineWidth=.65;
    ctx.strokeStyle=side<0?'rgba(215,214,204,.46)':'rgba(203,64,73,.6)';ctx.stroke();
    ctx.beginPath();ctx.moveTo(-w*.55,-h*.13);ctx.lineTo(w*.4,-h*.12);
    ctx.strokeStyle=side<0?'rgba(242,239,224,.65)':'rgba(226,92,104,.7)';ctx.lineWidth=.7;ctx.stroke();
    ctx.restore();
  }
  function draw(t){
    requestAnimationFrame(draw);
    if(document.hidden||t-last<(state.motion?45:350))return;
    last=t;frame++;
    energy+=(state.energy-energy)*.16;
    const time=state.motion?t:0;
    yaw+=((state.motion?Math.sin(time/6900)*.07+state.pointerX*.10:0)-yaw)*.045;
    tilt+=((state.motion?Math.sin(time/8500)*.025+state.pointerY*.025:0)-tilt)*.04;
    ctx.fillStyle='#030303';ctx.fillRect(0,0,W,H);
    const halo=ctx.createRadialGradient(cx,cy,scale*.2,cx,cy,scale*1.7);
    halo.addColorStop(0,'#131415');halo.addColorStop(.62,'#080809');halo.addColorStop(1,'#030303');
    ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
    // A faint surface reflection underneath the mask.
    ctx.strokeStyle='#ffffff09';ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(cx,cy+scale*1.43,scale*.75,scale*.065,0,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<points.length;i++)projected[i]=project(points[i],time);
    const co=Math.cos(yaw),si=Math.sin(yaw),ly=-.47+Math.sin(time/11000)*.08,lx=-.55,lz=.70;
    const order=faces.map((f,i)=>({i,z:projected[f.a].z+projected[f.b].z+projected[f.c].z})).sort((a,b)=>a.z-b.z);
    for(const item of order){
      const f=faces[item.i],a=projected[f.a],b=projected[f.b],c=projected[f.c];
      const nx=f.nx*co+f.nz*si,nz=-f.nx*si+f.nz*co;
      const diffuse=Math.max(0,nx*lx+f.ny*ly+nz*lz);
      const spec=Math.pow(Math.max(0,nx*-.29+f.ny*-.25+nz*.925),35);
      const ribbon=Math.pow(Math.max(0,Math.cos(f.x*5+f.y*1.9+time/17000)),16)*.14;
      const shade=8+diffuse*48+spec*225+ribbon*100+(f.seed-.5)*10;
      const rim=Math.pow(Math.max(0,nx*.85+f.ny*.10+nz*.20),4)*55;
      const missing=f.seed>.993-state.damage*.00022;
      let dx=0,dy=0;
      if(state.glitch>t&&state.motion&&f.seed>.65){dx=(f.seed-.5)*scale*.04;dy=(f.seed-.5)*3;}
      ctx.beginPath();ctx.moveTo(a.x+dx,a.y+dy);ctx.lineTo(b.x+dx,b.y+dy);ctx.lineTo(c.x+dx,c.y+dy);ctx.closePath();
      ctx.fillStyle=missing?'#030303':`rgb(${Math.min(240,shade+rim)|0},${Math.min(240,shade*.99+rim*.11)|0},${Math.min(245,shade*1.02+rim*.19)|0})`;
      ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.48)';ctx.lineWidth=.45;ctx.stroke();
      if(f.seed>.97&&!missing){ctx.strokeStyle='rgba(232,224,214,.28)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    eye(-1,time);eye(1,time);
    // A narrow, irregular split interrupts the perfect symmetry.
    ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=1.7;ctx.beginPath();
    for(let i=0;i<16;i++){const y=-1+i/15*2;const p=project(surface(.12+Math.sin(i*2.1)*.025,y),time);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.stroke();
    const floor=ctx.createLinearGradient(0,cy+scale*.70,0,cy+scale*1.6);floor.addColorStop(0,'#03030300');floor.addColorStop(.7,'#030303f5');floor.addColorStop(1,'#030303');ctx.fillStyle=floor;ctx.fillRect(0,cy+scale*.7,W,H);
    if(state.motion&&state.glitch>t){
      const y=cy+(Math.sin(t)*.6)*scale;
      ctx.drawImage(cv,0,y*D,W*D,4*D,5,y,W,4);
      ctx.fillStyle='rgba(152,56,62,.17)';ctx.fillRect(0,y+7,W,1);
    }
    // A single quiet scan moves over the reflective surface.
    if(state.motion&&state.phase==='thinking'){
      const sy=cy-scale+((t/1900)%1)*scale*2;
      ctx.fillStyle='rgba(201,149,148,.18)';ctx.fillRect(cx-scale*.65,sy,scale*1.3,.6);
    }
  }
  requestAnimationFrame(draw);
})();

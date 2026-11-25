(() => {
  'use strict';
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-explorer]').forEach(root=>{
    const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
    if(!ctx)return;
    const atoms=[],bonds=[],seen=new Map();
    const spacing=23;
    function addAtom(x,y,z,type){const k=`${x.toFixed(3)},${y.toFixed(3)},${z},${type}`;if(seen.has(k))return seen.get(k);const i=atoms.length;atoms.push({x,y,z,type});seen.set(k,i);return i;}
    // Exact regular honeycomb geometry, in arbitrary educational units.
    for(let col=-4;col<=4;col++)for(let row=-3;row<=3;row++){
      const cx=1.5*spacing*col,cy=Math.sqrt(3)*spacing*(row+(col%2)*.5);
      if(Math.abs(cy)>130)continue;
      for(let vertex=0;vertex<6;vertex++){
        const angle=vertex*Math.PI/3;
        const x=cx+spacing*Math.cos(angle),y=cy+spacing*Math.sin(angle);
        if(Math.abs(x)<160&&Math.abs(y)<135)addAtom(x,y,0,0);
      }
    }
    const carbonCount=atoms.length;
    for(let i=0;i<carbonCount;i++)for(let j=i+1;j<carbonCount;j++){
      if(Math.abs(Math.hypot(atoms[i].x-atoms[j].x,atoms[i].y-atoms[j].y)-spacing)<.15)bonds.push([i,j,0]);
    }
    // Illustrative Se–metal–Se stack; arbitrary units, not a relaxed supercell.
    for(let row=-3;row<=3;row++)for(let col=-4;col<=4;col++){
      const x=col*34+(Math.abs(row)%2)*17,y=row*29.4;
      if(Math.abs(x)>145)continue;
      addAtom(x,y,0,row===0&&col===0?3:1);
      addAtom(x+10,y+6,15,2);addAtom(x+10,y+6,-15,2);
    }
    for(let i=carbonCount;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
      const a=atoms[i],b=atoms[j];
      if((a.type===2)!==(b.type===2)&&Math.hypot(a.x-b.x,a.y-b.y)<28)bonds.push([i,j,1]);
    }
    let yaw=-.28,tilt=.72,separation=50,substrate=true,mode='3d',rotating=false,dragging=false,visible=true,raf=0,lastTime=0,width=600,height=400,lastX=0,lastY=0;
    const sep=root.querySelector('[data-separation]'),sub=root.querySelector('[data-substrate]'),rotate=root.querySelector('[data-rotate]');
    function project(atom){
      const z=(atom.type===0?separation*.75:-separation*.75)+atom.z;
      const x=atom.x*Math.cos(yaw)-atom.y*Math.sin(yaw),y=atom.x*Math.sin(yaw)+atom.y*Math.cos(yaw);
      const py=y*Math.cos(tilt)-z*Math.sin(tilt),depth=y*Math.sin(tilt)+z*Math.cos(tilt);
      const scale=Math.min(width/460,height/450)*(mode==='2d'?1.1:1);
      const perspective=mode==='2d'?1:640/(640+depth);
      return {x:width/2+x*scale*perspective,y:height*.48+py*scale*perspective,z:depth,r:(atom.type===0?4.4:6.3)*scale*perspective,type:atom.type};
    }
    function draw(){
      ctx.clearRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.5,height*.5,10,width*.5,height*.5,width*.62);
      glow.addColorStop(0,'#203d53');glow.addColorStop(1,'#0d1e31');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='#8eada40a';ctx.lineWidth=.7;for(let x=0;x<width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}for(let y=0;y<height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
      const projected=atoms.map(project),items=[];
      bonds.forEach(([a,b,type])=>{if(type&&!substrate)return;items.push({kind:0,a:projected[a],b:projected[b],z:(projected[a].z+projected[b].z)/2,type});});
      projected.forEach(a=>{if(a.type&&!substrate)return;items.push({kind:1,a,z:a.z});});
      items.sort((a,b)=>b.z-a.z);
      items.forEach(item=>{
        if(item.kind===0){ctx.beginPath();ctx.moveTo(item.a.x,item.a.y);ctx.lineTo(item.b.x,item.b.y);const bond=ctx.createLinearGradient(item.a.x,item.a.y,item.b.x,item.b.y);bond.addColorStop(0,item.type?'#568da7':'#7194a9');bond.addColorStop(.5,item.type?'#c9bd94':'#d1e2eb');bond.addColorStop(1,item.type?'#7d9caa':'#7194a9');ctx.strokeStyle=bond;ctx.lineWidth=item.type?1.6:2;ctx.stroke();}
        else{const a=item.a,r=a.r;const gradient=ctx.createRadialGradient(a.x-r*.38,a.y-r*.4,r*.08,a.x,a.y,r);const colors=a.type===0?['#ffffff','#b7ced9','#4b7187']:a.type===1?['#c5ecff','#4c9fc8','#214967']:a.type===2?['#fff6c3','#d5ad62','#6c542d']:['#f3dfff','#bc83e3','#5d3379'];gradient.addColorStop(0,colors[0]);gradient.addColorStop(.4,colors[1]);gradient.addColorStop(1,colors[2]);ctx.beginPath();ctx.arc(a.x,a.y,r,0,Math.PI*2);ctx.fillStyle=gradient;ctx.shadowColor='#061323bb';ctx.shadowBlur=4;ctx.shadowOffsetY=2;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;}
      });
      ctx.font='10px Segoe UI, sans-serif';ctx.fillStyle='#b4c9d8';ctx.fillText(mode==='2d'?'TOP VIEW · x–y':'PERSPECTIVE · x–y–z',20,height-20);
      ctx.textAlign='right';ctx.fillStyle='#89a6bb';ctx.fillText('ILLUSTRATIVE GEOMETRY',width-20,height-20);ctx.textAlign='left';
    }
    function frame(time){raf=0;if(!visible||document.hidden)return;if(rotating&&!dragging&&!reducedMotion.matches){yaw+=Math.min((time-lastTime)||16,40)*.00016;draw();}lastTime=time;if(rotating&&!reducedMotion.matches)raf=requestAnimationFrame(frame);}
    function start(){if(!raf&&rotating&&visible&&!document.hidden&&!reducedMotion.matches){lastTime=0;raf=requestAnimationFrame(frame);}}
    function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function setView(value){mode=value;yaw=value==='2d'?0:-.28;tilt=value==='2d'?0:.72;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===value)));sep.disabled=mode==='2d';root.querySelector('.slider-label').style.opacity=mode==='2d'?'.5':'1';draw();}
    root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    sep.addEventListener('input',()=>{separation=Number(sep.value);root.querySelector('[data-separation-value]').textContent=separation+'%';draw();});
    sub.addEventListener('change',()=>{substrate=sub.checked;draw();});
    rotate.addEventListener('click',()=>{if(reducedMotion.matches){rotate.textContent='Reduced motion enabled';return;}rotating=!rotating;rotate.setAttribute('aria-pressed',String(rotating));rotate.textContent=rotating?'Pause rotation':'Auto-rotate';start();});
    root.querySelector('[data-reset]').addEventListener('click',()=>{rotating=false;rotate.textContent='Auto-rotate';rotate.setAttribute('aria-pressed','false');separation=50;sep.value='50';root.querySelector('[data-separation-value]').textContent='50%';substrate=true;sub.checked=true;setView('3d');});
    canvas.addEventListener('pointerdown',event=>{dragging=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener('pointermove',event=>{if(!dragging)return;yaw+=(event.clientX-lastX)*.008;if(mode==='3d')tilt=Math.max(-1.4,Math.min(1.4,tilt+(event.clientY-lastY)*.008));lastX=event.clientX;lastY=event.clientY;draw();});
    function end(){dragging=false;start();}canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
    canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')yaw-=.12;if(event.key==='ArrowRight')yaw+=.12;if(mode==='3d'){if(event.key==='ArrowUp')tilt=Math.max(-1.4,tilt-.12);if(event.key==='ArrowDown')tilt=Math.min(1.4,tilt+.12);}draw();});
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw();start();}},{threshold:.05});observer.observe(canvas);
    new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',start);reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){rotating=false;rotate.setAttribute('aria-pressed','false');rotate.textContent='Auto-rotate';}else start();});resize();
  });
})();

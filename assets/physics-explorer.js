/*
 * Interactive graphene/V-doped WSe2 visualization, v2.
 * Offline, dependency-free Canvas 2D renderer projecting an educational 3D atom model.
 * Schematic atomic arrangement and separation — NOT relaxed DFT geometry.
 */
(() => {
  'use strict';
  const root = document.querySelector('[data-physics-explorer]');
  if (!root) return;

  const canvas = root.querySelector('canvas.physics-canvas');
  const ctx = canvas && canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const slider = root.querySelector('[data-gap]');
  const gapValue = root.querySelector('[data-gap-output]');
  const tags = root.querySelector('[data-view-label]');
  const rotateButton = root.querySelector('[data-action="rotate"]');
  const viewButtons = [...root.querySelectorAll('[data-angle]')];
  const dopantInput = root.querySelector('[data-show-v]');
  const glowInput = root.querySelector('[data-show-field]');
  const state = {
    gap: 3.5, yaw: -0.53, pitch: 0.50, zoom: 1,
    autoRotate: false, showV: true, showField: true, view: '3d',
    dirty: true
  };
  const widthState = { w: 900, h: 490, dpr: 1 };
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sphereColors = {
    C: ['#ffffff', '#c4d0d9', '#4c6277', '#182c3d'],
    W: ['#f0fcff', '#3aa9ed', '#1f5e9a', '#112c57'],
    Se: ['#fff7cf', '#f2bb57', '#bd752e', '#643a25'],
    V: ['#f8e9ff', '#bd84e6', '#6d3b9b', '#3b1f62']
  };

  const model = { atoms: [], bonds: [] };
  const addAtom = (type, x, y, z, r = 0.10) => {
    const atom = { id: model.atoms.length, type, x, y, z, radius: r };
    model.atoms.push(atom);
    return atom;
  };
  const addBond = (a, b, kind) => model.bonds.push({ a, b, kind });
  const sqrt3 = Math.sqrt(3);
  // Honeycomb graphene layer; positions are centered after construction.
  const carbonAtoms = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      const a = 0.71;
      const x = i * sqrt3 * a + j * sqrt3 * a / 2;
      const z = j * 1.5 * a;
      carbonAtoms.push(addAtom('C', x, 0, z, 0.13));
      carbonAtoms.push(addAtom('C', x, 0, z + a, 0.13));
    }
  }
  const cxMean = carbonAtoms.reduce((v, a) => v + a.x, 0) / carbonAtoms.length;
  const czMean = carbonAtoms.reduce((v, a) => v + a.z, 0) / carbonAtoms.length;
  carbonAtoms.forEach(a => { a.x -= cxMean; a.z -= czMean; });
  const cbondLength = 0.71;
  for (let i = 0; i < carbonAtoms.length; i++) {
    for (let j = i + 1; j < carbonAtoms.length; j++) {
      const d = Math.hypot(carbonAtoms[i].x - carbonAtoms[j].x, carbonAtoms[i].z - carbonAtoms[j].z);
      if (d > 0.60 && d < cbondLength * 1.10) addBond(carbonAtoms[i], carbonAtoms[j], 'C');
    }
  }

  // W atoms form a triangular plane. Selenium planes are above and below it.
  // V is illustrated substitutionally on a small number of W sites.
  const ws = [], topSe = [], bottomSe = [];
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 1; j++) {
      const a = 1.13;
      const x = (i + j / 2) * a;
      const z = (sqrt3 * j / 2) * a;
      ws.push(addAtom((i === 0 && j === 0) || (i === -2 && j === 1) ? 'V' : 'W', x, -0.57, z, 0.175));
      // two triangular Se sublayers: illustration of a Se–W–Se sandwich.
      topSe.push(addAtom('Se', x + a / 2, 0, z + a / (2 * sqrt3), 0.15));
      bottomSe.push(addAtom('Se', x + a / 2, -1.10, z + a / (2 * sqrt3), 0.15));
    }
  }
  const substrate = [...ws, ...topSe, ...bottomSe];
  const subX = substrate.reduce((v, a) => v + a.x, 0) / substrate.length;
  const subZ = substrate.reduce((v, a) => v + a.z, 0) / substrate.length;
  substrate.forEach(a => { a.x -= subX; a.z -= subZ; });
  // Draw metal–chalcogen bonds to the closest three selenium positions in each plane.
  for (const w of ws) {
    for (const plane of [topSe, bottomSe]) {
      const nearest = plane.map(se => ({ se, d: Math.hypot(se.x - w.x, se.z - w.z) }))
        .sort((a, b) => a.d - b.d).slice(0, 3);
      nearest.forEach(n => { if (n.d < 1.32) addBond(w, n.se, 'WSe'); });
    }
  }

  const carbonLabel = { text: 'GRAPHENE  ·  C', x: 24, y: 0 };
  const layerLabel = { text: 'V-DOPED WSe₂  ·  Se–W–Se', x: 24, y: 0 };

  const ease = (v, a, b) => Math.min(b, Math.max(a, v));
  let dragging = false, startX = 0, startY = 0;
  let pointerId = null;
  let lastPaint = 0, lastFrame = 0;
  let animationId = null;

  function map3d(a) {
    const { yaw, pitch, zoom } = state;
    const yy = a.type === 'C' ? state.gap * .65 + .42 : a.y;
    const rx = Math.cos(yaw) * a.x - Math.sin(yaw) * a.z;
    const rz = Math.sin(yaw) * a.x + Math.cos(yaw) * a.z;
    const ry = yy * Math.cos(pitch) - rz * Math.sin(pitch);
    const depth = yy * Math.sin(pitch) + rz * Math.cos(pitch);
    const w = widthState.w, h = widthState.h;
    const sc = Math.min(w / 13.6, h / 8.7) * zoom;
    const perspective = state.view === 'top' ? 1 : 1 / (1 + depth * 0.022);
    const midY = state.view === 'top' ? h * .49 : h * .58;
    return { x: w * .5 + rx * sc * perspective, y: midY - ry * sc * perspective,
      depth, r: Math.max(3.1, a.radius * sc * perspective * 1.14) };
  }

  function drawBackground(w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0e2034'); bg.addColorStop(.48, '#152e43'); bg.addColorStop(1, '#0a1a2a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * .50, h * .45, 5, w * .50, h * .48, w * .46);
    glow.addColorStop(0, 'rgba(103,176,191,.16)'); glow.addColorStop(.48, 'rgba(42,120,152,.085)'); glow.addColorStop(1, 'rgba(2,24,46,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(167,204,216,.065)'; ctx.lineWidth = 1;
    const step = Math.max(30, w / 17);
    for (let x = (w % step) / 2; x < w; x += step) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke(); }
    for (let y = h * .04; y < h; y += step) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke(); }
    // Floor reflection beneath the atomically thin sheets.
    ctx.save(); ctx.translate(w*.50,h*.76); ctx.scale(1,.17);
    const floor = ctx.createRadialGradient(0,0,w*.04,0,0,w*.42);
    floor.addColorStop(0,'rgba(108,177,198,.16)');floor.addColorStop(1,'rgba(108,177,198,0)');
    ctx.fillStyle = floor;ctx.beginPath();ctx.arc(0,0,w*.42,0,2*Math.PI);ctx.fill(); ctx.restore();
  }

  function drawBond(p1, p2, kind) {
    const thick = kind === 'C' ? 3.2 : 3.8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = kind === 'C' ? 'rgba(4,18,30,.92)' : 'rgba(7,33,48,.95)';
    ctx.lineWidth = thick + 2.7;
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    ctx.strokeStyle = kind === 'C' ? 'rgba(145,178,192,.82)' : 'rgba(115,162,184,.74)';
    ctx.lineWidth = thick;
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    ctx.strokeStyle = 'rgba(242,255,255,.25)'; ctx.lineWidth = .8;
    ctx.beginPath();ctx.moveTo(p1.x,p1.y - .85);ctx.lineTo(p2.x,p2.y - .85);ctx.stroke();
  }

  function drawSphere(a, p) {
    const palette = sphereColors[a.type];
    const r = p.r * (a.type === 'W' || a.type === 'V' ? 1.06 : 1);
    const grad = ctx.createRadialGradient(p.x - r*.42, p.y - r*.47, r*.04,p.x,p.y,r*1.2);
    grad.addColorStop(0, palette[0]);grad.addColorStop(.18,palette[1]);grad.addColorStop(.64,palette[2]);grad.addColorStop(1,palette[3]);
    ctx.beginPath();ctx.arc(p.x+1.6,p.y+2,r*1.07,0,2*Math.PI);
    ctx.fillStyle = 'rgba(0,8,19,.55)';ctx.fill();
    ctx.beginPath();ctx.arc(p.x,p.y,r,0,2*Math.PI);ctx.fillStyle=grad;ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.28)';ctx.lineWidth=.75;ctx.stroke();
    ctx.beginPath();ctx.arc(p.x-r*.29,p.y-r*.33,r*.20,0,2*Math.PI);ctx.fillStyle='rgba(255,255,255,.30)';ctx.fill();
    if (a.type === 'V' && state.showV) {
      ctx.beginPath();ctx.arc(p.x,p.y,r+3.5,0,2*Math.PI);
      ctx.strokeStyle='rgba(218,160,255,.36)';ctx.lineWidth=1.4;ctx.stroke();
    }
  }

  function drawField(w, h) {
    if (!state.showField || state.view === 'top') return;
    ctx.save();ctx.globalCompositeOperation = 'screen';
    const top = map3d({type:'C',x:0,z:0,radius:.1});
    const bottom = map3d({type:'Se',x:0,y:0,z:0,radius:.1});
    const cy = (top.y + bottom.y)*.5;
    const grad = ctx.createRadialGradient(w*.50,cy,0,w*.50,cy,w*.30);
    grad.addColorStop(0,'rgba(184,123,255,.33)');grad.addColorStop(.40,'rgba(147,102,240,.11)');grad.addColorStop(1,'rgba(109,93,240,0)');
    ctx.fillStyle=grad;ctx.fillRect(w*.15,cy-w*.30,w*.7,w*.6);
    for(let i=0;i<13;i++) {
      const x=-3.15 + i*.525, z=(i%3-1)*.4;
      const p1=map3d({type:'C',x,z});const p2=map3d({type:'Se',x,y:0,z});
      ctx.strokeStyle=`rgba(197,153,254,${.08 + (i%4)*.032})`;
      ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    }
    ctx.restore();
  }

  function roundedRect(x,y,w,h,r=9) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);
  }
  function drawChip(text,x,y,opts={}) {
    ctx.save();ctx.font=`${opts.bold?700:600} ${opts.font||12}px Inter, Arial, sans-serif`;
    const measured=ctx.measureText(text).width;
    const bw=measured+23;
    const xx=ease(x,8,widthState.w - bw-8);
    roundedRect(xx,y,bw,31,9);
    ctx.fillStyle=opts.bg||'rgba(9,24,42,.78)';ctx.fill();
    ctx.strokeStyle=opts.stroke||'rgba(184,209,219,.30)';ctx.stroke();
    ctx.fillStyle=opts.color||'#e2f4f7';ctx.textBaseline='middle';ctx.fillText(text,xx+11,y+15.5);ctx.restore();
  }
  function drawArrow(p1, p2, color) {
    const dx=p2.x-p1.x,dy=p2.y-p1.y;
    const l=Math.hypot(dx,dy)||1;
    const nx=dx/l,ny=dy/l;
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();ctx.setLineDash([]);
    for(const [pt,sign] of [[p1,-1],[p2,1]]) {
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pt.x,pt.y);
      ctx.lineTo(pt.x-sign*nx*10-ny*5,pt.y-sign*ny*10+nx*5);
      ctx.lineTo(pt.x-sign*nx*10+ny*5,pt.y-sign*ny*10-nx*5);
      ctx.closePath();ctx.fill();
    }
  }

  function drawMeasurements() {
    if (state.view === 'top') {
      drawChip('TOP VIEW · LATTICE ALIGNMENT', Math.max(12,widthState.w*.29), 24,{bg:'rgba(7,30,49,.70)',font:10});
      return;
    }
    const p1 = map3d({type:'C',x:3.65,z:-.65});
    const p2 = map3d({type:'Se',x:3.65,y:0,z:-.65});
    const x = p1.x+20;
    const start = {x, y:p1.y+8},end={x,y:p2.y-7};
    const col='#d5bd86';
    drawArrow(start,end,col);
    drawChip(`${state.gap.toFixed(1)} Å`,x+14,((p1.y+p2.y)*.5)-15,{bg:'rgba(14,35,48,.86)',color:'#ffefd0',stroke:'rgba(223,177,114,.65)',font:13,bold:true});
  }

  function drawScene() {
    const {w,h,dpr}=widthState;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawBackground(w,h);
    drawField(w,h);
    const visible = model.atoms.map(a=>{
      const type = a.type==='V' && !state.showV?'W':a.type;
      return { a, type, p: map3d(a) };
    });
    const lookup = new Map(visible.map(o=>[o.a.id,o]));
    const queue = [];
    for(const bond of model.bonds) {
      const p1=lookup.get(bond.a.id), p2=lookup.get(bond.b.id);
      if(!p1 || !p2) continue;
      queue.push({k:'bond',z:(p1.p.depth+p2.p.depth)/2,one:p1,two:p2,kind:bond.kind});
    }
    for(const atom of visible) queue.push({k:'atom',z:atom.p.depth,data:atom});
    // Farther atoms and bonds are painted first, producing a 3D depth cue.
    queue.sort((a,b)=>a.z-b.z);
    for(const item of queue) {
      if(item.k==='bond') drawBond(item.one.p,item.two.p,item.kind);
      else drawSphere({...item.data.a,type:item.data.type},item.data.p);
    }
    drawMeasurements();
    drawChip('C · GRAPHENE', 21, h*.20,{bg:'rgba(9,25,44,.80)',font:11,bold:true});
    drawChip('Se–W–Se · V-DOPED WSe₂', 21, h*.75,{bg:'rgba(9,25,44,.80)',font:11,bold:true});
    ctx.font='500 10px Inter, Arial, sans-serif';ctx.textBaseline='alphabetic';ctx.fillStyle='rgba(196,214,225,.72)';
    ctx.fillText('SCHEMATIC / NOT DFT-RELAXED',w-196,h-15);
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(280,Math.round(rect.width)),h=Math.max(300,Math.round(rect.height));
    const dpr=Math.min(window.devicePixelRatio||1,2);
    widthState.w=w;widthState.h=h;widthState.dpr=dpr;
    if(canvas.width !== Math.round(w*dpr)) canvas.width=Math.round(w*dpr);
    if(canvas.height!==Math.round(h*dpr)) canvas.height=Math.round(h*dpr);
    drawScene();
  }
  function refresh() { drawScene(); }
  function setView(view) {
    state.view=view;
    if(view==='top'){state.pitch=1.55;state.yaw=-.1;}
    else {state.pitch=.50;state.yaw=-.53;}
    state.zoom=1;
    viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.angle===view)));
    if(tags) tags.textContent=view==='top'?'TOP VIEW':'3D PERSPECTIVE';
    refresh();
  }
  function stopRotation() {
    state.autoRotate=false;rotateButton.setAttribute('aria-pressed','false');
    rotateButton.textContent='↻ Auto-rotate';
  }
  slider.addEventListener('input',()=>{
    state.gap=parseFloat(slider.value);gapValue.textContent=`${state.gap.toFixed(1)} Å`;refresh();
  });
  viewButtons.forEach(b=>b.addEventListener('click',()=>{stopRotation();setView(b.dataset.angle);}));
  dopantInput.addEventListener('change',()=>{ state.showV=dopantInput.checked;refresh(); });
  glowInput.addEventListener('change',()=>{ state.showField=glowInput.checked;refresh(); });
  rotateButton.addEventListener('click',()=>{
    state.autoRotate=!state.autoRotate;
    rotateButton.textContent=state.autoRotate?'Ⅱ Pause rotation':'↻ Auto-rotate';
    rotateButton.setAttribute('aria-pressed',String(state.autoRotate));
    if(state.autoRotate){state.view='3d';state.pitch=.50;viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.angle==='3d')));if(tags)tags.textContent='3D PERSPECTIVE';}
    refresh();
  });
  root.querySelector('[data-action="reset"]').addEventListener('click',()=>{
    stopRotation();state.gap=3.5;state.zoom=1;slider.value='3.5';gapValue.textContent='3.5 Å';
    state.showV=true;state.showField=true;dopantInput.checked=true;glowInput.checked=true;setView('3d');
  });
  canvas.addEventListener('pointerdown',e=>{stopRotation();dragging=true;pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(!dragging || e.pointerId!==pointerId)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;startX=e.clientX;startY=e.clientY;
    state.view='3d';state.yaw+=dx*.009;state.pitch=ease(state.pitch+dy*.006,.04,1.56);
    viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.angle==='3d')));
    if(tags)tags.textContent='CUSTOM 3D VIEW';refresh();
  });
  const pointerEnd=e=>{if(e.pointerId===pointerId){dragging=false;pointerId=null;}};
  canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=ease(state.zoom+(e.deltaY<0?.065:-.065),.63,1.55);refresh();},{passive:false});
  canvas.addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-'].includes(e.key)){e.preventDefault();stopRotation();
      if(e.key==='ArrowLeft')state.yaw-=.11;if(e.key==='ArrowRight')state.yaw+=.11;
      if(e.key==='ArrowUp')state.pitch=ease(state.pitch+.1,.04,1.56);
      if(e.key==='ArrowDown')state.pitch=ease(state.pitch-.1,.04,1.56);
      if(e.key==='+')state.zoom=ease(state.zoom+.08,.63,1.55);
      if(e.key==='-')state.zoom=ease(state.zoom-.08,.63,1.55);
      refresh();}
  });
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize',resize);
  // Work only while visible; rotation defaults off and honors reduced-motion preference.
  let visibleOnPage=true;
  if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(entries=>{visibleOnPage=entries[0].isIntersecting;},{threshold:0.03}).observe(root);
  function frame(t) {
    if(state.autoRotate && visibleOnPage && !reducedMotion && t-lastPaint>30) {
      const dt=Math.min(t-lastFrame,80);state.yaw+=dt*.00036;
      drawScene();lastPaint=t;
    }
    lastFrame=t;
    animationId=requestAnimationFrame(frame);
  }
  resize();
  animationId=requestAnimationFrame(frame);
})();

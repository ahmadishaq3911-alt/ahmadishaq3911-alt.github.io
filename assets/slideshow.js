(() => {
  'use strict';
  document.querySelectorAll('[data-deck]').forEach(viewer => {
    const deck=window.PORTFOLIO_DECKS?.[viewer.dataset.deck];
    if(!deck)return;
    const prefix=viewer.dataset.prefix||'',image=viewer.querySelector('[data-slide-image]'),select=viewer.querySelector('[data-slide-select]');
    const prev=viewer.querySelector('[data-slide-prev]'),next=viewer.querySelector('[data-slide-next]'),count=viewer.querySelector('[data-slide-count]'),expand=viewer.querySelector('[data-slide-expand]');
    let index=0,touchX=null,touchY=null,request=0;
    function show(value){
      index=Math.max(0,Math.min(deck.slides.length-1,value));
      const slide=deck.slides[index],token=++request;
      image.style.opacity='.65';
      const ready=new Image();
      ready.onload=()=>{if(token!==request)return;image.src=ready.src;image.alt=`${deck.title} — slide ${index+1}: ${slide.title}`;image.style.opacity='1';};
      ready.onerror=()=>{if(token===request){image.style.opacity='1';count.textContent='Slide could not load. Try Next or download the deck.';}};
      ready.src=prefix+slide.image;
      select.value=String(index);prev.disabled=index===0;next.disabled=index===deck.slides.length-1;
      count.textContent=`Slide ${index+1} of ${deck.slides.length}`;
      viewer.querySelector('[data-slide-text]').textContent=slide.text||'This slide contains visual content. Use the slide image above.';
      viewer.querySelector('[data-slide-progress]').style.width=`${(index+1)/deck.slides.length*100}%`;
      if(deck.slides[index+1]){const preload=new Image();preload.src=prefix+deck.slides[index+1].image;}
    }
    prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));select.addEventListener('change',()=>show(Number(select.value)));
    viewer.addEventListener('keydown',e=>{
      if(e.target.matches('select,input,textarea'))return;
      if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}
      if(e.key==='Home'){e.preventDefault();show(0);}if(e.key==='End'){e.preventDefault();show(deck.slides.length-1);}
    });
    const screen=viewer.querySelector('.slide-screen');
    screen.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
    screen.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4)show(index+(dx<0?1:-1));touchX=null;},{passive:true});
    const originalRole=viewer.getAttribute('role');
    function expanded(open){
      viewer.classList.toggle('is-expanded',open);
      document.body.classList.toggle('deck-open',open);
      expand.textContent=open?'Close view ×':'Expand ⤢';
      if(open){viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');expand.focus();}
      else{if(originalRole)viewer.setAttribute('role',originalRole);else viewer.removeAttribute('role');viewer.removeAttribute('aria-modal');expand.focus();}
    }
    expand.addEventListener('click',()=>expanded(!viewer.classList.contains('is-expanded')));
    viewer.addEventListener('keydown',e=>{
      if(!viewer.classList.contains('is-expanded'))return;
      if(e.key==='Escape'){e.preventDefault();expanded(false);}
      if(e.key==='Tab'){
        const controls=Array.from(viewer.querySelectorAll('button:not(:disabled),select,a,summary')).filter(el=>el.offsetParent!==null);
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  });
})();

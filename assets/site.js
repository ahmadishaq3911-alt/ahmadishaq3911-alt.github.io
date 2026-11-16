(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-nav');
  function closeMenu() { navigation?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open navigation'); }
  menuButton?.addEventListener('click',()=>{ const open=menuButton.getAttribute('aria-expanded')!=='true'; navigation.classList.toggle('open',open); menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  const dialog=document.getElementById('figure-dialog');
  let previousFocus;
  document.querySelectorAll('.figure-open').forEach(button=>button.addEventListener('click',()=>{
    previousFocus=button; const sourceImage=button.querySelector('img');
    document.getElementById('figure-image').src=sourceImage.src;
    document.getElementById('figure-image').alt=sourceImage.alt;
    document.getElementById('figure-title').textContent=button.dataset.title||sourceImage.alt;
    document.getElementById('figure-caption').textContent=button.dataset.caption||'';
    const source=document.getElementById('figure-source');source.hidden=!button.dataset.source;
    if(button.dataset.source)source.href=button.dataset.source;
    dialog.showModal();document.body.style.overflow='hidden';
  }));
  document.querySelector('.close-dialog')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>{document.body.style.overflow='';previousFocus?.focus();});

  const filters=document.querySelectorAll('[data-filter]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    let count=0;document.querySelectorAll('#figure-collection [data-category]').forEach(card=>{const show=button.dataset.filter==='all'||card.dataset.category===button.dataset.filter;card.hidden=!show;if(show)count++;});
    document.getElementById('figure-count').textContent=`${count} figures`;
  }));

  document.getElementById('publication-search')?.addEventListener('input',event=>{
    const query=event.target.value.trim().toLowerCase();let count=0;
    document.querySelectorAll('.publication[data-search]').forEach(pub=>{pub.hidden=!pub.dataset.search.includes(query);if(!pub.hidden)count++;});
    document.getElementById('no-publications').hidden=count>0;
  });

  let toastTimer; function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
  async function copyText(text){
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw new Error('Copy unavailable');}return true;}catch{return false;}
  }
  document.querySelectorAll('.copy-citation,[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const text=button.dataset.citation||button.dataset.copy;
    if(await copyText(text))notify(button.dataset.citation?'Citation copied':'Email address copied');
    else{notify('Automatic copy is unavailable. Select and copy the text.');if(button.dataset.citation){const p=document.createElement('p');p.className='fineprint';p.textContent=text;button.closest('.pub-actions').after(p);} }
  }));
})();

const bits=document.querySelectorAll('[data-bit]');bits.forEach(b=>b.addEventListener('change',()=>{const a=Number(bits[0].checked),b=Number(bits[1].checked),c=Number(bits[2].checked);document.getElementById('logic-output').textContent='Sum: '+(a^b^c)+' | Carry out: '+((a&b)|(c&(a^b)));}));

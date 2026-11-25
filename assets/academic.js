(() => {
 'use strict';
 const theme = document.querySelector('[data-theme-toggle]');
 function setTheme(dark) {
   document.documentElement.dataset.theme = dark ? 'dark' : 'light';
   theme?.setAttribute('aria-pressed', String(dark));
   theme?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
 }
 let saved; try { saved = localStorage.getItem('ishaq-theme'); } catch {}
 setTheme(saved === 'dark');
 theme?.addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; setTheme(dark); try { localStorage.setItem('ishaq-theme', dark ? 'dark' : 'light'); } catch {} });
 const menu = document.querySelector('[data-menu-toggle]'), nav = document.querySelector('.academic-nav');
 function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Open navigation'); }
 menu?.addEventListener('click', () => { const open = !nav.classList.contains('open'); nav.classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
 nav?.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
 document.addEventListener('keydown', e => { if(e.key === 'Escape')closeMenu(); });
 document.addEventListener('click', e => { if(!e.target.closest('.academic-header'))closeMenu(); });
 const dialog = document.querySelector('[data-site-search]'), query = document.querySelector('#site-query'), results = document.querySelector('.search-results');
 const pages = [
 ['Biography & education','index.html#home','Physics PhD, University of Maine, MPhil, BS'],
 ['Graphene interfaces and proximity effects','projects/graphene-proximity.html','DFT QuantumATK OpenMX WSe2 magnetism spin orbit topology'],
 ['Research overview','research.html','First-principles calculations, electronic structure, materials'],
 ['Publications and citations','publications.html','Papers, Ga-doped and In-doped AlSb, supercapacitors'],
 ['Ph.D. proposal presentation','index.html#slides','Talks, slides, quantum anomalous Hall effect'],
 ['Arduino ultrasonic scanner','projects/arduino-radar.html','Radar project, sensor, servo, Processing'],
 ['Digital electronics laboratory','projects/digital-electronics.html','Logic gates, adders, subtractors, flip-flops'],
 ['Recommendations','index.html#recommendations','Liping Yu, Majid Niaz Akhtar, Mostafizur Rahman, Samuel Hess, John Thompson'],
 ['Experience','experience.html','Research assistant, teaching assistant, lecturer'],
 ['Teaching','teaching.html','PASCO Capstone, physics laboratories, student support'],
 ['Graduate coursework','coursework.html','University of Maine classes, microelectronics'],
 ['Visual research gallery','gallery.html','Figures, materials, electronics'],
 ['Contact','contact.html','Email, LinkedIn, summer 2027 internship'],
 ['Curriculum vitae','files/Muhammad_Ahmad_Ishaq_CV.pdf','CV, resume, download']
 ];
 function search() {
  const term=query.value.trim().toLowerCase(); results.replaceChildren();
  const matches=pages.filter(p=>p.join(' ').toLowerCase().includes(term));
  matches.forEach(([title,url,description])=>{const a=document.createElement('a');a.href=dialog.dataset.prefix+url;a.textContent=title;const small=document.createElement('small');small.textContent=description;a.append(small);a.addEventListener('click',()=>dialog.close());results.append(a);});
  if(!matches.length){const p=document.createElement('p');p.textContent='No matches. Try “graphene”, “papers”, or “teaching”.';results.append(p);}
 }
 document.querySelector('[data-search-open]')?.addEventListener('click',()=>{query.value='';search();dialog.showModal();query.focus();});
 document.querySelector('[data-search-close]')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 query?.addEventListener('input',search);
 document.querySelector('[data-email-copy]')?.addEventListener('click',async e=>{const b=e.currentTarget;try{await navigator.clipboard.writeText('muhammad.ishaq@maine.edu');b.textContent='Email copied';}catch{b.textContent='Select the email link to copy';}setTimeout(()=>b.textContent='Copy email',3000);});
 const sections=document.querySelectorAll('.academic-home main > section[id]');
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){nav?.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-10% 0px -65% 0px'});sections.forEach(s=>observer.observe(s));}
})();

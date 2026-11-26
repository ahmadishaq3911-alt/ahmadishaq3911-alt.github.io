/* Muhammad Ahmad Ishaq — editable homepage showcase.
   To add a new talk/photo/certificate later, add one new entry to the relevant array.
   Upload the image/PDF to GitHub first, then edit THIS ONE file.
   No need to replace index.html for routine updates. */
(function () {
  'use strict';
  const {talks,hobbies,gallery,certificates,recommendations}=window.PORTFOLIO_CONTENT;
  function el(tag, cls, text) {
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!=null)node.textContent=text;
    return node;
  }
  function appendImage(container, path, alt, fallback) {
    if(!path) {container.appendChild(el('div','showcase-art-fallback',fallback || '✦'));return;}
    const img=el('img'); img.src=path; img.alt=alt||'';img.loading='lazy';
    img.addEventListener('error',function(){
      const fall=el('div','showcase-art-fallback',fallback||'✦');img.replaceWith(fall);
    },{once:true});
    container.appendChild(img);
  }
  function card(item,kind) {
    const art=el('article','showcase-card');
    const photo=el('div','showcase-card-image'+(kind==='hobby'?' showcase-hobby-art':''));
    if(kind==='hobby' && !item.image) {
      photo.appendChild(el('span','showcase-emoji',item.emoji||'✨'));
    } else appendImage(photo,item.image,item.imageAlt||item.title,kind==='talk'?'🎓':'🏅');
    art.appendChild(photo);
    const body=el('div','showcase-content');
    body.appendChild(el('span','showcase-category',item.category||item.organization||'Training'));
    body.appendChild(el('h3','',item.title));
    if(item.description)body.appendChild(el('p','',item.description));
    const footer=el('div','showcase-footer');
    footer.appendChild(el('span','',item.date||''));
    if(item.link){const a=el('a','',item.linkText||'View details ↗');a.href=item.link;footer.appendChild(a);}
    body.appendChild(footer);art.appendChild(body);return art;
  }
  function render() {
    const talksRoot=document.getElementById('portfolio-talks-list');
    const hobbiesRoot=document.getElementById('portfolio-hobbies-list');
    const galleryRoot=document.getElementById('portfolio-gallery-list');
    const certRoot=document.getElementById('portfolio-certificates-list');
    if(!talksRoot)return;
    const recRoot=document.getElementById('portfolio-recommendations-list');
    recommendations.forEach(item=>{
      const card=el('article','finish-rec-card'), top=el('div','finish-rec-top');
      top.append(el('span','finish-rec-label',item.category),el('span','finish-rec-date',item.date));
      const author=el('div','finish-rec-author'), info=el('span');
      info.append(el('strong','',item.name),el('small','',item.affiliation));
      author.append(el('span','finish-author-icon',item.initials),info);
      card.append(top,el('h3','',item.title),el('p','',item.description),author);recRoot.append(card);
    });
    talks.forEach(item=>talksRoot.appendChild(card(item,'talk')));
    hobbies.forEach(item=>hobbiesRoot.appendChild(card(item,'hobby')));
    gallery.forEach(item=>{
      const a=el('a','showcase-gallery-item');a.href=item.link||item.image;
      a.setAttribute('aria-label',item.title);appendImage(a,item.image,item.title,'🖼');
      const caption=el('div','showcase-gallery-caption',item.title);
      if(item.caption)caption.appendChild(el('small','',item.caption));
      a.appendChild(caption);galleryRoot.appendChild(a);
    });
    certificates.forEach(item=>{
      const itemCard=card({...item,category:item.organization||'Verified certificate',description:item.description||'',linkText:'View certificate'},'certificate');
      certRoot.appendChild(itemCard);
    });
    const empty=document.getElementById('portfolio-certificates-empty');
    if(empty && certificates.length)empty.hidden=true;
    const prev=document.getElementById('portfolio-talks-prev');
    const next=document.getElementById('portfolio-talks-next');
    const progress=document.getElementById('portfolio-talks-progress');
    function scrollCards(direction){
      const one=talksRoot.querySelector('.showcase-card');
      if(!one)return;
      const gap=parseFloat(getComputedStyle(talksRoot).columnGap)||18;
      talksRoot.scrollBy({left:direction*(one.getBoundingClientRect().width+gap),behavior:'smooth'});
    }
    function updateButtons(){
      const max=Math.max(0,talksRoot.scrollWidth-talksRoot.clientWidth);
      prev.disabled=talksRoot.scrollLeft<5;
      next.disabled=talksRoot.scrollLeft>=max-5;
      const fraction=max?talksRoot.scrollLeft/max:0;
      if(progress)progress.style.transform='translateX('+(fraction*200)+'%)';
    }
    prev.addEventListener('click',()=>scrollCards(-1));next.addEventListener('click',()=>scrollCards(1));
    talksRoot.addEventListener('scroll',updateButtons,{passive:true});
    window.addEventListener('resize',updateButtons);
    updateButtons();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);
  else render();
})();

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

function esc(v='') { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function youtubeEmbed(url='') { const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/); return m ? `https://www.youtube.com/embed/${m[1]}` : ''; }
function responsiveImageData(src='') {
  if (!src || !src.startsWith('/images/uploads/')) return {src, srcset:''};
  const file=src.split('/').pop(), dot=file.lastIndexOf('.'), stem=dot>-1?file.slice(0,dot):file;
  const base='/images/optimized/'+stem;
  return {src:`${base}-960.webp`, srcset:`${base}-480.webp 480w, ${base}-960.webp 960w, ${base}-1600.webp 1600w`};
}
function applyResponsiveImage(img,src,sizes='(max-width: 700px) 100vw, 50vw') {
  const r=responsiveImageData(src); img.src=r.src||src; if(r.srcset){img.srcset=r.srcset;img.sizes=sizes;} img.onerror=()=>{img.onerror=null;img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=src;};
}
function vimeoEmbed(url='') { const m=url.match(/vimeo\.com\/(?:video\/)?(\d+)/); return m ? `https://player.vimeo.com/video/${m[1]}` : ''; }
function mediaMarkup(x,key,i) {
  const caption=esc(x.caption||'');
  const isVideo=String(x.type||'Photo').toLowerCase()==='video' || x.video_file || x.video_url;
  if(!isVideo && x.image) { const r=responsiveImageData(x.image); return `<figure class="tile photo-tile"><img src="${esc(r.src||x.image)}"${r.srcset?` srcset="${esc(r.srcset)}" sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"`:''} data-original="${esc(x.image)}" alt="${caption||esc(key+' portfolio image '+(i+1))}" loading="lazy" decoding="async" onerror="if(this.src!==this.dataset.original){this.removeAttribute('srcset');this.src=this.dataset.original}" onload="this.closest('.photo-tile').classList.toggle('landscape',this.naturalWidth>this.naturalHeight);this.closest('.photo-tile').classList.toggle('portrait',this.naturalWidth<=this.naturalHeight)"><figcaption>${caption}</figcaption></figure>`; }
  const src=x.video_file||x.video_url||''; if(!src) return '';
  const embed=youtubeEmbed(src)||vimeoEmbed(src);
  if(embed) return `<figure class="tile"><div class="video-frame"><iframe src="${esc(embed)}" title="${caption||'Portfolio video'}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><figcaption>${caption}</figcaption></figure>`;
  return `<figure class="tile"><video controls playsinline preload="metadata" src="${esc(src)}"></video><figcaption>${caption}</figcaption></figure>`;
}
function setHeroVideo(url='') {
  const hero=document.querySelector('.hero'); if(!hero||!url) return;
  const yt=youtubeEmbed(url), vm=vimeoEmbed(url), wrap=document.querySelector('[data-highlight-embed]'), vid=document.querySelector('[data-highlight-video]');
  if(yt||vm){
    const src=yt ? `${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt.split('/').pop()}&playsinline=1&rel=0` : `${vm}?background=1&autoplay=1&muted=1&loop=1&autopause=0`;
    if(wrap){wrap.innerHTML=`<iframe src="${esc(src)}" title="AB Media highlight reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`; wrap.hidden=false;} if(vid) vid.hidden=true;
  } else if(vid){ vid.src=url; vid.hidden=false; vid.load(); vid.play().catch(()=>{}); if(wrap) wrap.hidden=true; }
}
(async function(){
  try {
    const r=await fetch('content/site.json',{cache:'no-store'}); if(!r.ok) return; const d=await r.json();
    const theme=d.appearance?.theme==='light'?'light':'dark'; document.documentElement.dataset.theme=theme;
    const setText=(sel,v)=>{const e=document.querySelector(sel); if(e&&v)e.textContent=v};
    setText('[data-hero-headline]',d.hero?.headline); setText('[data-hero-tagline]',d.hero?.tagline); setHeroVideo(d.hero?.highlight_reel);
    ['fashion','property','music','commercial'].forEach(k=>{
      const cat=d.categories?.[k]||{};
      document.querySelectorAll(`[data-nav-category="${k}"], [data-card-category="${k}"], [data-category-title="${k}"]`).forEach(e=>{if(cat.title)e.textContent=cat.title;});
      document.querySelectorAll(`[data-category-caption="${k}"]`).forEach(e=>{if(cat.caption)e.textContent=cat.caption;});
      const e=document.querySelector(`[data-cover="${k}"]`); if(e&&d.covers?.[k]) applyResponsiveImage(e,d.covers[k],'(max-width: 800px) 100vw, 50vw');
    });
    const email=document.querySelector('[data-email]'); if(email&&d.contact?.email){email.textContent=d.contact.email; email.href='mailto:'+d.contact.email;}
    const insta=document.querySelector('[data-instagram]'); if(insta){if(d.contact?.instagram){let v=d.contact.instagram.trim(); insta.href=v.startsWith('@')?'https://instagram.com/'+v.slice(1):v; insta.style.display='inline-block';}else insta.style.display='none';}
    const head=document.querySelector('[data-headshot]'); if(head){if(d.contact?.headshot){applyResponsiveImage(head,d.contact.headshot,'(max-width: 700px) 80vw, 420px');head.hidden=false;}else head.hidden=true;}
    setText('[data-bio]',d.contact?.bio); setText('[data-cta]',d.contact?.cta);
    const gallery=document.querySelector('[data-gallery]');
    if(gallery){
      const key=gallery.dataset.gallery,cat=d.categories?.[key]||{},items=cat.items||[],subs=cat.subcategories||[];
      const validSubs=subs.filter(s=>s&&s.id&&s.title);
      const render=(filter='all')=>{
        const shown=filter==='all'?items:items.filter(x=>(x.subcategory||'sub1')===filter);
        gallery.innerHTML=shown.map((x,i)=>mediaMarkup(x,key,i)).filter(Boolean).join('')||`<div class="empty-gallery">No work has been assigned to this subcategory yet.</div>`;
      };
      if(validSubs.length>1){
        const nav=document.createElement('div');nav.className='subcategory-nav';
        nav.innerHTML=`<button class="subcategory-btn active" data-sub="all">All</button>`+validSubs.map(s=>`<button class="subcategory-btn" data-sub="${esc(s.id)}">${esc(s.title)}</button>`).join('');
        gallery.parentNode.insertBefore(nav,gallery);
        nav.addEventListener('click',ev=>{const b=ev.target.closest('[data-sub]');if(!b)return;nav.querySelectorAll('.subcategory-btn').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.sub);});
      }
      render();
    }
  } catch(e){console.warn('Site content could not be loaded.',e);}
})();

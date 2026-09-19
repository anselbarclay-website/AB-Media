document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

function esc(v='') { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function youtubeEmbed(url='') {
  const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : '';
}
function vimeoEmbed(url='') {
  const m=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : '';
}
function mediaMarkup(x,key,i) {
  const caption=esc(x.caption||'');
  const isVideo=String(x.type||'Photo').toLowerCase()==='video' || x.video_file || x.video_url;
  if(!isVideo && x.image) return `<figure class="tile"><img src="${esc(x.image)}" alt="${caption||esc(key+' portfolio image '+(i+1))}"><figcaption>${caption}</figcaption></figure>`;
  const src=x.video_file||x.video_url||'';
  if(!src) return '';
  const embed=youtubeEmbed(src)||vimeoEmbed(src);
  if(embed) return `<figure class="tile"><div class="video-frame"><iframe src="${esc(embed)}" title="${caption||'Portfolio video'}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><figcaption>${caption}</figcaption></figure>`;
  return `<figure class="tile"><video controls playsinline preload="metadata" src="${esc(src)}"></video><figcaption>${caption}</figcaption></figure>`;
}

(async function(){
  try {
    const r = await fetch('content/site.json', {cache:'no-store'});
    if(!r.ok) return;
    const d = await r.json();
    const setText=(sel,v)=>{const e=document.querySelector(sel); if(e&&v)e.textContent=v};
    setText('[data-hero-headline]', d.hero?.headline);
    setText('[data-hero-tagline]', d.hero?.tagline);
    if(d.hero?.highlight_reel){ const s=document.querySelector('[data-highlight-source]'); if(s){s.src=d.hero.highlight_reel; s.parentElement.load();}}
    ['fashion','property','music'].forEach(k=>{const e=document.querySelector(`[data-cover="${k}"]`); if(e&&d.covers?.[k]) e.src=d.covers[k];});
    const email=document.querySelector('[data-email]'); if(email&&d.contact?.email){email.textContent=d.contact.email; email.href='mailto:'+d.contact.email;}
    const insta=document.querySelector('[data-instagram]'); if(insta){ if(d.contact?.instagram){insta.href=d.contact.instagram; insta.style.display='inline-block';} else insta.style.display='none';}
    const gallery=document.querySelector('[data-gallery]');
    if(gallery){ const key=gallery.dataset.gallery; const items=d[key]||[]; const html=items.map((x,i)=>mediaMarkup(x,key,i)).filter(Boolean).join(''); gallery.innerHTML=html||`<div class="empty-gallery">Add photos or videos from the site editor at <b>/admin/</b>.</div>`; }
  } catch(e){ console.warn('Site content could not be loaded. When hosted, the editor content will appear here.', e); }
})();

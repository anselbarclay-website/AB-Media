document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function videoEmbed(url='') {
  try {
    const u = new URL(url, window.location.href);
    const host = u.hostname.replace(/^www\./,'');
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${escapeHtml(u.pathname.slice(1))}`;
    if (host.includes('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://www.youtube.com/embed/${escapeHtml(id)}`;
    }
    if (host.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).findLast(x => /^\d+$/.test(x));
      if (id) return `https://player.vimeo.com/video/${escapeHtml(id)}`;
    }
  } catch(e) {}
  return '';
}
function renderItem(x, key, i) {
  const caption = escapeHtml(x.caption || '');
  const figcap = caption ? `<figcaption>${caption}</figcaption>` : '';
  const isVideo = String(x.type || '').toLowerCase() === 'video' || x.video_file || x.video_url;
  if (isVideo) {
    const url = x.video_url || x.video_file || '';
    const embed = x.video_url ? videoEmbed(x.video_url) : '';
    if (embed) return `<figure class="tile video-tile"><iframe src="${embed}" title="${caption || escapeHtml(key+' portfolio video '+(i+1))}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>${figcap}</figure>`;
    if (url) return `<figure class="tile video-tile"><video src="${escapeHtml(url)}" controls playsinline preload="metadata"></video>${figcap}</figure>`;
    return `<figure class="tile"><div class="placeholder">Video item: add a Video URL or Video File in the editor.</div>${figcap}</figure>`;
  }
  if (x.image) return `<figure class="tile"><img src="${escapeHtml(x.image)}" alt="${caption || escapeHtml(key+' portfolio image '+(i+1))}" loading="lazy">${figcap}</figure>`;
  return `<figure class="tile"><div class="placeholder">Photo item: add a Photo in the editor.</div>${figcap}</figure>`;
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
    if(gallery){ const key=gallery.dataset.gallery; const items=d[key]||[]; gallery.innerHTML=items.length?items.map((x,i)=>renderItem(x,key,i)).join(''):`<div class="empty-gallery">Add photos or videos from the site editor at <b>/admin/</b>.</div>`;}
  } catch(e){ console.warn('Site content could not be loaded. When hosted, the editor content will appear here.', e); }
})();

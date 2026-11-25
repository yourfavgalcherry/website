// Show /work and /works/<slug>/ in the address bar instead of the .html file names (only when served over http)
if (location.protocol.startsWith('http')) {
  const clean = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (clean !== location.pathname) history.replaceState(null, '', clean + location.search + location.hash);
}

// No selecting or dragging text and images on the Work and project pages
document.addEventListener('contextmenu', (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); });
document.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());

// Project pages with a mouse: a click outside a link goes back to Work
const backLink = document.querySelector('.proj') && document.querySelector('.nav a[href$="work.html"]');
if (backLink && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.body.classList.add('click-back');
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.target.closest('a, button')) return;
    const from = document.referrer ? new URL(document.referrer) : null;
    if (from && from.origin === location.origin && /\/work(\.html)?$/.test(from.pathname)) history.back();
    else location.href = backLink.href;
  });
}

const list = document.querySelector('.work-list');

// Work index on phones: a + on each row opens the project's photos and text, read from its own page
if (list) {
  for (const li of list.querySelectorAll('li')) {
    const a = li.querySelector('a');
    const title = li.querySelector('.w-title').textContent;
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'w-more';
    more.textContent = '+';
    more.setAttribute('aria-expanded', 'false');
    more.setAttribute('aria-label', 'Show ' + title);
    const detail = document.createElement('div');
    detail.className = 'w-detail';
    detail.hidden = true;
    li.append(more, detail);
    more.addEventListener('click', () => {
      const open = detail.hidden;
      detail.hidden = !open;
      more.textContent = open ? '–' : '+';
      more.setAttribute('aria-expanded', String(open));
      if (open && !detail.dataset.loaded) { detail.dataset.loaded = '1'; loadDetail(a.href, detail, a.dataset.cover); }
    });
  }
}
async function loadDetail(url, detail, cover) {
  const open = document.createElement('a');
  open.className = 'w-open';
  open.href = url;
  open.textContent = 'Open project →';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const abs = (v) => new URL(v, url).href;
    const imgs = [...doc.querySelectorAll('.proj-images img')].map((im) => ({ src: abs(im.getAttribute('src')), alt: im.alt }));
    // The Work list cover (the desktop hover image) opens the slider: moved to the front if it is one of the photos, added if not
    if (cover) {
      const c = new URL(cover, location.href).href, i = imgs.findIndex((im) => im.src === c);
      if (i > 0) imgs.unshift(imgs.splice(i, 1)[0]);
      else if (i < 0) imgs.unshift({ src: c, alt: imgs[0] ? imgs[0].alt : '' });
    }
    if (imgs.length) {
      const slides = document.createElement('div');
      slides.className = 'w-slides';
      for (const im of imgs) {
        const img = document.createElement('img');
        img.src = im.src;
        img.alt = im.alt;
        img.loading = 'lazy';
        slides.append(img);
      }
      const count = document.createElement('p');
      count.className = 'w-count';
      const n = imgs.length;
      count.textContent = `1 / ${n}`;
      slides.addEventListener('scroll', () => { count.textContent = `${Math.round(slides.scrollLeft / slides.clientWidth) + 1} / ${n}`; }, { passive: true });
      detail.append(slides, count);
    }
    const text = doc.querySelector('.proj-text');
    if (text) {
      const t = document.createElement('div');
      t.className = 'w-text';
      t.innerHTML = text.innerHTML;
      for (const l of t.querySelectorAll('a[href]')) l.href = abs(l.getAttribute('href'));
      detail.append(t);
    }
  } catch (e) {
    // Opened from disk (no fetch over file://) or offline: just offer the project page
  }
  detail.append(open);
}

// Work index: the hovered project's cover follows the cursor
if (list && matchMedia('(hover: hover)').matches) {
  const preview = document.createElement('img');
  preview.className = 'preview';
  preview.alt = '';
  preview.addEventListener('error', () => preview.classList.remove('on'));
  document.body.appendChild(preview);
  for (const a of list.querySelectorAll('a[data-cover]')) {
    new Image().src = a.dataset.cover;
    a.addEventListener('mouseenter', () => {
      if (!preview.src.endsWith(a.dataset.cover)) preview.src = a.dataset.cover;
      if (preview.complete && !preview.naturalWidth) return;
      preview.classList.add('on');
    });
    a.addEventListener('mouseleave', () => preview.classList.remove('on'));
  }
  addEventListener('mousemove', (e) => {
    const w = preview.offsetWidth || 300, h = preview.offsetHeight || 200;
    const x = Math.min(e.clientX + 24, innerWidth - w - 12), y = Math.min(Math.max(12, e.clientY - h / 2), innerHeight - h - 12);
    preview.style.transform = `translate(${x}px, ${y}px)`;
  });
}

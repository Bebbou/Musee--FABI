/* ── SCRIPTCATA.JS — catalogue.html uniquement ── */

/* ─── CONFIG ─────────────────────────────────── */
const CT_PLACEHOLDER  = '../assets/img/guerrier.png';
const CT_BAND_SPEEDS  = [0.08, -0.05, 0.12, -0.03];
const CT_BAND_OFFSETS = [0, -60, 40, -90];

/* ─── ÉTAT GLOBAL ─────────────────────────────── */
let ALL_OEUVRES   = [];
let ALL_ARTISTES  = [];

let sortArtistes  = 'popularite';
let sortOeuvres   = 'nom-az';
let searchQuery   = '';

/* Cache des portraits Wikipedia */
const portraitCache = new Map();

/* ─── HELPERS ─────────────────────────────────── */
function parseDate(str) {
  if (!str) return Infinity;
  const m = String(str).match(/\d{3,4}/);
  return m ? parseInt(m[0]) : Infinity;
}

/* Résout le chemin image d'une œuvre (local ou externe) */
function oeuvreImgSrc(o) {
  if (!o.image_url) return CT_PLACEHOLDER;
  if (o.image_url.startsWith('http')) return o.image_url;
  return o.image_url; /* chemin relatif depuis catalogue.html */
}

/* ─── WIKIPEDIA PORTRAIT ──────────────────────── */
async function fetchWikiPortrait(auteur) {
  if (portraitCache.has(auteur)) return portraitCache.get(auteur);

  const name = auteur.trim().replace(/ /g, '_');
  const url  = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
  try {
    const r    = await fetch(url);
    const data = await r.json();
    const pages = data.query?.pages || {};
    const src   = Object.values(pages)[0]?.thumbnail?.source || null;
    portraitCache.set(auteur, src);
    return src;
  } catch {
    portraitCache.set(auteur, null);
    return null;
  }
}

/* ─── OBSERVER pour chargement paresseux des portraits ── */
const portraitObserver = new IntersectionObserver((entries) => {
  entries.forEach(async entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const auteur = el.dataset.auteur;
    if (!auteur || el.dataset.loaded) return;
    el.dataset.loaded = '1';
    portraitObserver.unobserve(el);

    const src = await fetchWikiPortrait(auteur);
    if (src) {
      el.style.backgroundImage = `url('${src}')`;
      el.classList.add('ct-art--loaded');
    }
  });
}, { rootMargin: '200px' });

/* ─── BANDE STRIP (5 premières œuvres vedettes) ── */
function ctRenderStrip(oeuvres) {
  const strip = document.getElementById('ct-strip');
  if (!strip) return;
  strip.innerHTML = oeuvres.slice(0, 5).map(o => {
    const img = oeuvreImgSrc(o);
    return `
    <a class="ct-plate" href="../common/info_oeuvre.html?id=${o.id}" aria-label="Voir ${o.nom_tableau}">
      <div class="ct-art ct-art--loaded"
           style="background-image:url('${img}');background-size:cover;background-position:center;"></div>
      <div class="ct-veil"></div>
      <div class="ct-cap">
        <h3>${o.nom_tableau}</h3>
        <p>${o.auteur} · ${o.date}</p>
      </div>
    </a>`;
  }).join('');
}

/* ─── RENDU BANDES PARALLAXES ────────────────── */
function ctRenderBands(containerId, items, labelKey, subKey, isOeuvre = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const N = 4;
  const cols = Array.from({ length: N }, () => []);
  items.forEach((item, i) => cols[i % N].push(item));

  const speed  = ci => searchQuery ? 0 : CT_BAND_SPEEDS[ci];
  const offset = ci => searchQuery ? 0 : CT_BAND_OFFSETS[ci];

  container.innerHTML = cols.map((col, ci) => `
    <div class="ct-band" data-speed="${speed(ci)}"
         style="transform:translateY(${offset(ci)}px);">
      ${col.map(item => {
        const ratio = ci % 2 === 0 ? '3/4' : '2/3';

        if (isOeuvre) {
          /* ── Carte ŒUVRE : image locale + lien ── */
          const img = oeuvreImgSrc(item);
          return `
          <a class="ct-face" href="../common/info_oeuvre.html?id=${item.id}"
             aria-label="Voir ${item[labelKey]}">
            <div class="ct-art ct-art--loaded"
                 style="background-image:url('${img}');background-size:cover;background-position:center;aspect-ratio:${ratio};"></div>
            <figcaption class="ct-name">
              <span class="ct-name-main">${item[labelKey]}</span>
              ${subKey && item[subKey] ? `<span class="ct-name-sub">${item[subKey]}</span>` : ''}
            </figcaption>
          </a>`;
        } else {
          /* ── Carte ARTISTE : portrait Wikipedia lazy ── */
          return `
          <figure class="ct-face">
            <div class="ct-art"
                 data-auteur="${item[labelKey]}"
                 style="background-image:url('${CT_PLACEHOLDER}');background-size:cover;background-position:center top;aspect-ratio:${ratio};"></div>
            <figcaption class="ct-name">
              <span class="ct-name-main">${item[labelKey]}</span>
              ${subKey && item[subKey] ? `<span class="ct-name-sub">${item[subKey]}</span>` : ''}
            </figcaption>
          </figure>`;
        }
      }).join('')}
    </div>`).join('');

  /* Observer les cartes artiste */
  if (!isOeuvre) {
    container.querySelectorAll('.ct-art[data-auteur]').forEach(el => {
      portraitObserver.observe(el);
    });
  }

  ctRefreshBands();
}

/* ─── TRI : ARTISTES ─────────────────────────── */
function getSortedArtistes() {
  let list = ALL_ARTISTES.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.auteur.toLowerCase().includes(q);
  });

  switch (sortArtistes) {
    case 'nom-az':      list.sort((a,b) => a.auteur.localeCompare(b.auteur, 'fr')); break;
    case 'nom-za':      list.sort((a,b) => b.auteur.localeCompare(a.auteur, 'fr')); break;
    case 'date':        list.sort((a,b) => a.date_min - b.date_min); break;
    case 'popularite':
    default:            list.sort((a,b) => b.count - a.count); break;
  }
  return list;
}

/* ─── TRI : ŒUVRES ───────────────────────────── */
function getSortedOeuvres() {
  let list = ALL_OEUVRES.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.nom_tableau.toLowerCase().includes(q) ||
      o.auteur.toLowerCase().includes(q) ||
      (o.mouvement || '').toLowerCase().includes(q)
    );
  });

  switch (sortOeuvres) {
    case 'nom-za':      list.sort((a,b) => b.nom_tableau.localeCompare(a.nom_tableau, 'fr')); break;
    case 'artiste-az':  list.sort((a,b) => a.auteur.localeCompare(b.auteur, 'fr')); break;
    case 'artiste-za':  list.sort((a,b) => b.auteur.localeCompare(a.auteur, 'fr')); break;
    case 'date':        list.sort((a,b) => parseDate(a.date) - parseDate(b.date)); break;
    case 'mouvement':   list.sort((a,b) => (a.mouvement||'').localeCompare(b.mouvement||'', 'fr')); break;
    case 'nom-az':
    default:            list.sort((a,b) => a.nom_tableau.localeCompare(b.nom_tableau, 'fr')); break;
  }
  return list;
}

/* ─── MISE À JOUR AFFICHAGE ──────────────────── */
function ctUpdate() {
  const artistes = getSortedArtistes();
  const oeuvres  = getSortedOeuvres();
  const searching = searchQuery.length > 0;

  ctRenderBands('ct-mosaic-artistes', artistes, 'auteur', null, false);
  ctRenderBands('ct-mosaic-oeuvres',  oeuvres,  'nom_tableau', 'auteur', true);

  document.querySelectorAll('.ct-mosaic').forEach(m => {
    m.classList.toggle('ct-mosaic--search', searching);
  });

  const countEl = document.getElementById('ct-search-count');
  if (countEl) {
    if (searching) {
      const total = artistes.length + oeuvres.length;
      countEl.textContent = `${total} résultat${total > 1 ? 's' : ''}`;
      countEl.style.opacity = '1';
    } else {
      countEl.style.opacity = '0';
    }
  }
}

/* ─── PARALLAXE ──────────────────────────────── */
function ctRefreshBands() { /* no-op */ }

function ctInitParallax() {
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const frame = document.getElementById('ct-frame');
  let pageTick = false;
  window.addEventListener('scroll', () => {
    if (pageTick) return;
    pageTick = true;
    requestAnimationFrame(() => {
      if (frame) frame.style.transform = `translateY(${window.scrollY * 0.45}px)`;
      pageTick = false;
    });
  }, { passive: true });
}

function ctBindMosaicParallax(mosaicEl) {
  if (!mosaicEl) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  let tick = false;
  mosaicEl.addEventListener('scroll', () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      if (mosaicEl.classList.contains('ct-mosaic--search')) { tick = false; return; }
      const y = mosaicEl.scrollTop;
      mosaicEl.querySelectorAll('.ct-band').forEach((band, i) => {
        const speed = parseFloat(band.dataset.speed) || 0;
        const base  = CT_BAND_OFFSETS[i % CT_BAND_OFFSETS.length] ?? 0;
        band.style.transform = `translateY(${base + y * speed}px)`;
      });
      tick = false;
    });
  }, { passive: true });
}

/* ─── COLLAPSE ───────────────────────────────── */
function ctInitCollapse() {
  document.querySelectorAll('.ct-cat-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.closest('.ct-cat');
      const wasCollapsed = cat.classList.contains('ct-collapsed');
      cat.classList.toggle('ct-collapsed');
      btn.setAttribute('aria-expanded', String(wasCollapsed));

      if (wasCollapsed) {
        setTimeout(() => {
          cat.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  });
}

/* ─── CONTRÔLES TRI ──────────────────────────── */
function ctInitSort() {
  document.querySelectorAll('.ct-sort').forEach(bar => {
    bar.querySelectorAll('.ct-sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.ct-sort-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        if (bar.dataset.target === 'artistes') sortArtistes = btn.dataset.sort;
        else                                   sortOeuvres  = btn.dataset.sort;
        ctUpdate();
      });
    });
  });
}

/* ─── RECHERCHE ──────────────────────────────── */
function ctInitSearch() {
  const input = document.getElementById('ct-search');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchQuery = input.value.trim();
      ctUpdate();
    }, 220);
  });
}

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res  = await fetch('../database/collection_musee.json');
    const data = await res.json();
    ALL_OEUVRES = data.oeuvres ?? [];

    const map = new Map();
    ALL_OEUVRES.forEach(o => {
      if (!map.has(o.auteur)) {
        map.set(o.auteur, { auteur: o.auteur, count: 0, date_min: Infinity });
      }
      const a = map.get(o.auteur);
      a.count++;
      const d = parseDate(o.date);
      if (d < a.date_min) a.date_min = d;
    });
    ALL_ARTISTES = [...map.values()];

    ctRenderStrip(ALL_OEUVRES);
    ctUpdate();
  } catch (e) {
    console.error('Erreur chargement collection :', e);
  }

  ctInitCollapse();
  ctInitSort();
  ctInitSearch();
  ctInitParallax();
  ctBindMosaicParallax(document.getElementById('ct-mosaic-artistes'));
  ctBindMosaicParallax(document.getElementById('ct-mosaic-oeuvres'));
});

/* ══ SECTION FAVORIS — œuvres notées par l'utilisateur ══ */

let FAV_ALL    = [];   // toutes les cartes (données complètes)
let FAV_SHOWN  = [];   // cartes après filtre/tri
let FAV_SORT   = 'date';
let FAV_SEARCH = '';

/* ── Construction des colonnes d'étoiles ── */
function buildStarCols(note) {
  /* 5 colonnes, hauteur proportionnelle (16px à 80px) */
  const MIN_H = 14;
  const MAX_H = 76;
  const step  = (MAX_H - MIN_H) / 4; // écart entre chaque colonne de base

  return Array.from({ length: 5 }, (_, i) => {
    const starNum   = i + 1;
    const colHeight = MIN_H + i * step;

    let cls = 'fav-star-col';
    if (note >= starNum)           cls += ' filled';
    else if (note >= starNum - 0.5) cls += ' half';

    return `<div class="${cls}" style="height:${colHeight}px"></div>`;
  }).join('');
}

/* ── Rendu d'une carte ── */
function renderFavCard(item) {
  const noteLabel = item.note !== null
    ? `<span class="fav-card-note-val">${item.note.toFixed(1)} / 5</span>`
    : '<span class="fav-card-note-val" style="opacity:.4">—</span>';

  return `
    <a class="fav-card" href="../common/info_oeuvre.html?id=${item.id}" title="${item.nom}">
      <img class="fav-card-img" src="${item.image_url}" alt="${item.nom}" loading="lazy">
      <div class="fav-card-body">
        <div>
          <div class="fav-card-title">${item.nom}</div>
          <div class="fav-card-author">${item.auteur}</div>
        </div>
        <div>
          <div class="fav-card-note-label">Ma note</div>
          ${noteLabel}
        </div>
      </div>
      <div class="fav-star-cols">
        ${buildStarCols(item.note ?? 0)}
      </div>
    </a>
  `;
}

/* ── Filtre + tri ── */
function applyFavFilter() {
  const q = FAV_SEARCH.toLowerCase();

  FAV_SHOWN = FAV_ALL.filter(item =>
    !q ||
    item.nom.toLowerCase().includes(q) ||
    item.auteur.toLowerCase().includes(q)
  );

  if (FAV_SORT === 'note-desc') {
    FAV_SHOWN.sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
  } else if (FAV_SORT === 'note-asc') {
    FAV_SHOWN.sort((a, b) => (a.note ?? 0) - (b.note ?? 0));
  } else if (FAV_SORT === 'alpha') {
    FAV_SHOWN.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }
  /* 'date' = ordre d'arrivée de l'API (déjà trié DESC par date_note) */

  const grid  = document.getElementById('fav-grid');
  const empty = document.getElementById('fav-empty');

  if (!FAV_SHOWN.length) {
    grid.innerHTML = '';
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = FAV_SHOWN.map(renderFavCard).join('');
}

/* ── Chargement des données ── */
async function loadFavoris() {
  const grid    = document.getElementById('fav-grid');
  const loading = document.getElementById('fav-loading');
  const empty   = document.getElementById('fav-empty');

  try {
    /* 1. Notes de l'utilisateur */
    const rNotes = await fetch(`${API}/user_notes.php`, { credentials: 'include' });
    const dNotes = await rNotes.json();
    const userNotes = dNotes.notes ?? []; // [{oeuvre_id, note, date_note}]

    /* 2. Collection complète */
    const rCol  = await fetch(`${BASE}/res/database/collection_musee.json`);
    const dCol  = await rCol.json();
    const oeuvreMap = Object.fromEntries((dCol.oeuvres ?? []).map(o => [o.id, o]));

    /* 3. Fusionner */
    FAV_ALL = userNotes
      .map(n => {
        const o = oeuvreMap[n.oeuvre_id];
        if (!o) return null;
        return {
          id:        o.id,
          nom:       o.nom_tableau,
          auteur:    o.auteur,
          image_url: o.image_url,
          note:      n.note,
          date_note: n.date_note,
        };
      })
      .filter(Boolean);

    loading?.remove();

    if (!FAV_ALL.length) {
      empty.style.display = '';
      return;
    }

    applyFavFilter();

    /* 4. Mettre à jour le couloir avec les œuvres notées */
    updateCorridorWithFavs(FAV_ALL);

  } catch (err) {
    loading?.remove();
    console.error('Erreur chargement favoris', err);
    empty.style.display = '';
  }
}

/* ── Mise à jour du couloir ── */
function updateCorridorWithFavs(items) {
  if (!items.length) return;

  /* Prendre les 4 mieux notées (ou les premières si <4) */
  const sorted = [...items].sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
  const picks  = sorted.slice(0, 4);

  const slots = [
    document.getElementById('painting-0'),
    document.getElementById('painting-1'),
    document.getElementById('painting-2'),
    document.getElementById('painting-3'),
  ];

  picks.forEach((item, i) => {
    const slot  = slots[i];
    if (!slot) return;

    const img   = slot.querySelector('.painting-img');
    const title = slot.querySelector('.painting-title');

    if (img)   img.src = item.image_url;
    if (title) title.textContent = item.nom;
  });
}

/* ── Init contrôles ── */
function initFavControls() {
  document.getElementById('fav-search').addEventListener('input', e => {
    FAV_SEARCH = e.target.value.trim();
    applyFavFilter();
  });

  document.querySelectorAll('.fav-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fav-sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      FAV_SORT = btn.dataset.sort;
      applyFavFilter();
    });
  });
}

/* ── Lancement ── */
initFavControls();
loadFavoris();

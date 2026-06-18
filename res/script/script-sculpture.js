/* script-sculpture.js — charge la sculpture par ?id= et peuple le template */

(async function () {
  const params = new URLSearchParams(location.search);
  const idParam = parseInt(params.get('id'), 10);

  let sculptures;
  try {
    /* Essaie d'abord la BDD MySQL via PHP, sinon le JSON statique */
    let res = await fetch('/res/api/sculptures_bdd.php');
    if (!res.ok) res = await fetch('/res/database/bdd_sculpture.json');
    sculptures = (await res.json()).sculptures;
  } catch (e) {
    console.error('Impossible de charger les sculptures', e);
    return;
  }

  let s;
  if (!isNaN(idParam) && idParam >= 1) {
    s = sculptures.find(sc => sc.id === idParam);
  }
  if (!s) {
    s = sculptures[Math.floor(Math.random() * sculptures.length)];
  }

  populate(s);
})();


function populate(s) {
  /* Titre de l'onglet */
  document.getElementById('sc-page-title').textContent = `${s.nom_sculpture} — Musée FABI`;

  /* Viewer 3D */
  const model = document.getElementById('sc-model');
  if (s.modele_3d?.disponible && s.modele_3d.chemin) {
    model.setAttribute('src', '/' + s.modele_3d.chemin);
    model.setAttribute('alt', `${s.nom_sculpture}, ${s.materiau}, ${s.date}`);
  } else {
    /* Pas de modèle : on cache le viewer et on affiche un message */
    model.style.display = 'none';
    const bg = model.closest('.sculpt-viewer-col');
    if (bg) {
      const msg = document.createElement('div');
      msg.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:0.9rem;text-align:center;padding:2rem;';
      msg.textContent = 'Modèle 3D non disponible pour cette sculpture.';
      bg.appendChild(msg);
    }
  }

  /* Badge date */
  const badge = document.getElementById('sc-badge');
  const badgeYear = document.getElementById('sc-badge-year');
  const badgeBC = document.getElementById('sc-badge-bc');
  const dateStr = s.date || '';
  const yearMatch = dateStr.match(/\d{2,4}/);
  if (yearMatch) {
    badgeYear.textContent = yearMatch[0];
    if (dateStr.includes('av. J.-C.') || dateStr.includes('av.J.-C')) {
      badgeBC.textContent = 'av. J.-C.';
    } else if (dateStr.includes('ap. J.-C.')) {
      badgeBC.textContent = 'ap. J.-C.';
    } else {
      badgeBC.textContent = '';
    }
  } else {
    badge.style.display = 'none';
  }

  /* Numéro d'inventaire */
  document.getElementById('sc-inv-num').textContent = `SC-${String(s.id).padStart(3, '0')}`;

  /* Eyebrow (mouvement · type) */
  document.getElementById('sc-eyebrow').textContent =
    `Sculpture · ${s.mouvement_artistique || 'Collection'}`;

  /* Titre (lettre capitale + reste) */
  const nom = s.nom_sculpture || '';
  document.getElementById('sc-drop-letter').textContent = nom.charAt(0);
  document.getElementById('sc-drop-rest').textContent = nom.slice(1);

  /* Artiste */
  document.getElementById('sc-artist-name').textContent = s.auteur || '—';

  /* Méta-grille */
  document.getElementById('sc-meta-date').textContent     = s.date       || '—';
  document.getElementById('sc-meta-materiau').textContent = s.materiau   || '—';
  document.getElementById('sc-meta-hauteur').textContent  = s.hauteur    || '—';
  document.getElementById('sc-meta-musee').textContent    = s.musee_actuel || '—';

  /* Blocs texte : descriptif découpé en 2 + particularité */
  const halves = splitText(s.descriptif || '', 2);
  document.getElementById('sc-block1-text').textContent = halves[0] || '';
  document.getElementById('sc-block2-text').textContent = halves[1] || '';
  document.getElementById('sc-block3-title').textContent = 'Particularité';
  document.getElementById('sc-block3-text').textContent  = s.particularite || '—';

  /* Bande du bas */
  document.getElementById('sc-strip-title').textContent = nom.toUpperCase();
  document.getElementById('sc-strip-style').textContent = s.mouvement_artistique || '—';
  document.getElementById('sc-strip-musee').textContent = s.musee_actuel || '—';
}


function splitText(text, n) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const total = sentences.length;
  return Array.from({ length: n }, (_, i) => {
    const start = Math.floor(i * total / n);
    const end   = Math.floor((i + 1) * total / n);
    return sentences.slice(start, end).join(' ').trim();
  });
}

/* script-info.js — charge l'œuvre, peuple les layouts, gère les notes */

const API = '/res/api';

(async function () {
  const params  = new URLSearchParams(location.search);
  const idParam = parseInt(params.get('id'), 10);
  const loading = document.getElementById('info-loading');

  /* ── 1. Charger la collection ── */
  let oeuvres;
  try {
    const res  = await fetch('/res/database/collection_musee.json');
    const data = await res.json();
    oeuvres = data.oeuvres;
  } catch (e) {
    loading.textContent = 'Impossible de charger la collection.';
    return;
  }

  let oeuvre;
  if (!isNaN(idParam) && idParam >= 1) {
    oeuvre = oeuvres.find(o => o.id === idParam);
  }
  if (!oeuvre) {
    oeuvre = oeuvres[Math.floor(Math.random() * oeuvres.length)];
  }

  document.getElementById('page-title').textContent = `Musée FABI — ${oeuvre.nom_tableau}`;
  loading.style.display = 'none';

  const useEditorial = oeuvre.id % 2 !== 0;

  if (useEditorial) {
    populateEditorial(oeuvre);
  } else {
    populateBaroque(oeuvre);
  }

  /* ── 2. Portrait Wikipedia (arrière-plan) ── */
  fetchAuthorPortrait(oeuvre.auteur).then(portrait => {
    if (!portrait) return;
    if (useEditorial) {
      const bg = document.getElementById('ed-author-bg');
      if (bg) bg.style.backgroundImage = `url('${portrait}')`;
    } else {
      const portraitEl = document.getElementById('ba-author-portrait');
      const imgEl      = document.getElementById('ba-author-img');
      const labelEl    = document.getElementById('ba-author-label');
      if (portraitEl && imgEl) {
        imgEl.src = portrait;
        imgEl.alt = oeuvre.auteur;
        if (labelEl) labelEl.textContent = oeuvre.auteur;
        portraitEl.style.display = 'block';
        const h = portraitEl.offsetHeight || 150;
        const circleZone = document.getElementById('ba-circle-zone');
        if (circleZone) {
          circleZone.style.top = `calc(68px + 1rem + ${h}px + 2.5rem)`;
        }
      }
    }
  });

  /* ── 3. Système de notes ── */
  const notesSection = document.getElementById('notes-section');
  if (notesSection) notesSection.hidden = false;
  await initNotesWidget('notes-widget-main', oeuvre.id, !useEditorial);
})();


/* ══════════════════════════════════════
   WIDGET NOTES
══════════════════════════════════════ */

async function initNotesWidget(containerId, oeuvreId, isDark) {
  const container = document.getElementById(containerId);
  if (!container) return;

  /* Vérifier la session */
  let session = { logged_in: false };
  try {
    const r = await fetch(`${API}/session.php`, { credentials: 'include' });
    session  = await r.json();
  } catch (_) {}

  /* Charger les notes existantes */
  let noteData = { avg: null, count: 0, user_note: null };
  try {
    const r = await fetch(`${API}/notes.php?oeuvre_id=${oeuvreId}`, { credentials: 'include' });
    noteData  = await r.json();
  } catch (_) {}

  renderNotesWidget(container, oeuvreId, session, noteData, isDark);
}

function renderNotesWidget(container, oeuvreId, session, noteData, isDark) {
  container.className = `notes-widget ${isDark ? 'notes-widget--dark' : 'notes-widget--light'}`;
  const { avg, count, user_note } = noteData;
  const loggedIn = session.logged_in;

  /* ── HTML de base ── */
  container.innerHTML = `
    <div class="notes-title">ÉVALUATION</div>
    <div class="notes-row">
      <div class="stars stars-display" id="stars-avg-${oeuvreId}">
        ${buildStarsHTML(avg ?? 0)}
      </div>
      <div>
        <div class="notes-avg-display">${avg !== null ? avg.toFixed(1) : '—'}</div>
        <div class="notes-count-display">${count} avis</div>
      </div>
    </div>
    ${loggedIn ? `
      <div class="notes-title" style="margin-top:8px;">VOTRE NOTE</div>
      <div class="stars stars-interactive" id="stars-input-${oeuvreId}">
        ${buildStarsInteractiveHTML()}
      </div>
      <p class="notes-user-note" id="user-note-label-${oeuvreId}">
        ${user_note !== null ? `Votre note : ${formatStarLabel(user_note)}` : 'Cliquez pour noter'}
      </p>
    ` : `
      <p class="notes-status">
        <a href="/res/common/client.html">Connectez-vous</a> pour laisser une note.
      </p>
    `}
  `;

  /* Mettre à jour les étoiles moyennes */
  applyStarFill(container.querySelector(`#stars-avg-${oeuvreId}`), avg ?? 0);

  if (!loggedIn) return;

  /* ── Interactivité étoiles ── */
  const starsInput = container.querySelector(`#stars-input-${oeuvreId}`);
  const userLabel  = container.querySelector(`#user-note-label-${oeuvreId}`);

  applyStarFill(starsInput, user_note ?? 0);

  let currentUserNote = user_note;

  starsInput.querySelectorAll('.star-half-hit').forEach(hit => {
    const score = parseFloat(hit.dataset.score);

    hit.addEventListener('mouseenter', () => {
      applyStarFill(starsInput, score);
      userLabel.textContent = `→ ${formatStarLabel(score)}`;
    });

    hit.addEventListener('mouseleave', () => {
      applyStarFill(starsInput, currentUserNote ?? 0);
      userLabel.textContent = currentUserNote !== null
        ? `Votre note : ${formatStarLabel(currentUserNote)}`
        : 'Cliquez pour noter';
    });

    hit.addEventListener('click', async () => {
      const star = hit.closest('.star');
      star.classList.remove('pop');
      void star.offsetWidth; // reflow pour relancer l'animation
      star.classList.add('pop');

      try {
        const r = await fetch(`${API}/notes.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oeuvre_id: oeuvreId, note: score }),
        });
        const data = await r.json();
        if (data.success) {
          currentUserNote = data.user_note;
          applyStarFill(starsInput, currentUserNote);
          userLabel.textContent = `Votre note : ${formatStarLabel(currentUserNote)}`;

          /* Mettre à jour la moyenne affichée */
          const avgDisplay = container.querySelector(`#stars-avg-${oeuvreId}`);
          if (avgDisplay) applyStarFill(avgDisplay, data.avg ?? 0);
          const avgNum = container.querySelector('.notes-avg-display');
          if (avgNum) avgNum.textContent = data.avg !== null ? data.avg.toFixed(1) : '—';
          const countEl = container.querySelector('.notes-count-display');
          if (countEl) countEl.textContent = `${data.count} avis`;
        }
      } catch (_) {}
    });
  });
}

/* ── Construit 5 étoiles vides (affichage) ── */
function buildStarsHTML() {
  return Array.from({ length: 5 }, (_, i) => `
    <span class="star" data-index="${i + 1}">
      <span class="star-fill"></span>
    </span>`).join('');
}

/* ── Construit 5 étoiles avec zones de hit ── */
function buildStarsInteractiveHTML() {
  return Array.from({ length: 5 }, (_, i) => `
    <span class="star" data-index="${i + 1}">
      <span class="star-fill"></span>
      <span class="star-half-hit star-half-hit--left"  data-score="${i + 0.5}"></span>
      <span class="star-half-hit star-half-hit--right" data-score="${i + 1}"></span>
    </span>`).join('');
}

/* ── Applique le remplissage (0–5 avec demi) ── */
function applyStarFill(container, value) {
  if (!container) return;
  container.querySelectorAll('.star').forEach((star, i) => {
    const fill = star.querySelector('.star-fill');
    if (!fill) return;
    const diff = value - i;
    if (diff >= 1)      fill.style.width = '100%';
    else if (diff > 0)  fill.style.width = '50%';
    else                fill.style.width = '0%';
  });
}

function formatStarLabel(note) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + ` (${note}/5)`;
}


/* ══════════════════════════════════════
   WIKIPEDIA PORTRAIT
══════════════════════════════════════ */
function fetchAuthorPortrait(authorName) {
  const name = authorName.trim().replace(/ /g, '_');
  const url  = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
  return fetch(url)
    .then(r => r.json())
    .then(data => {
      const pages = data.query?.pages || {};
      return Object.values(pages)[0]?.thumbnail?.source || null;
    })
    .catch(() => null);
}


/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function wikiImg(url, width = 1200) {
  if (!url) return '';
  const base = url.split('?')[0];
  return `${base}?width=${width}`;
}

function cityFrom(musee) {
  const parts = musee.split(/[-–]/);
  return (parts.length > 1 ? parts[parts.length - 1] : musee).trim();
}

function yearFrom(date) {
  return date.split(/[-–]/)[0].replace(/[^\d]/g, '') || date;
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


/* ══════════════════════════════════════
   LAYOUT 1 — ÉDITORIAL
══════════════════════════════════════ */
function populateEditorial(o) {
  const layout = document.getElementById('layout-editorial');
  layout.hidden = false;
  layout.classList.add('active');

  document.getElementById('ed-museum').textContent = cityFrom(o.musee_actuel).toUpperCase();
  document.getElementById('ed-year').textContent   = yearFrom(o.date);

  document.getElementById('ed-drop-letter').textContent = o.nom_tableau.charAt(0);
  document.getElementById('ed-drop-rest').textContent   = o.nom_tableau.slice(1).toLowerCase();

  const imgUrl   = wikiImg(o.image_url);
  const cropData = [
    { id: 'ed-img1', pos: '15% 8%'  },
    { id: 'ed-img2', pos: '85% 15%' },
    { id: 'ed-img3', pos: '50% 35%' },
    { id: 'ed-img4', pos: '30% 75%' },
  ];
  cropData.forEach(({ id, pos }) => {
    const el = document.getElementById(id);
    el.src = imgUrl;
    el.alt = o.nom_tableau;
    el.style.objectPosition = pos;
  });

  const halves = splitText(o.descriptif, 2);
  document.getElementById('ed-desc1').textContent = halves[0] || '';
  document.getElementById('ed-desc2').textContent = halves[1] || '';
}


/* ══════════════════════════════════════
   LAYOUT 2 — BAROQUE
══════════════════════════════════════ */
function populateBaroque(o) {
  const layout = document.getElementById('layout-baroque');
  layout.hidden = false;
  layout.classList.add('active');

  const _portrait = document.getElementById('ba-author-portrait');
  const _label    = document.getElementById('ba-author-label');
  if (_portrait) _portrait.style.display = 'none';
  if (_label)    _label.style.display    = 'none';

  const imgUrl = wikiImg(o.image_url);

  document.getElementById('ba-main-img').src = imgUrl;
  document.getElementById('ba-main-img').alt = o.nom_tableau;

  const circleImg = document.getElementById('ba-circle-img');
  circleImg.src = imgUrl;
  circleImg.alt = o.nom_tableau;
  circleImg.style.objectPosition = '65% 12%';

  const badgeImg = document.getElementById('ba-badge-img');
  badgeImg.src = imgUrl;
  badgeImg.alt = o.nom_tableau;
  badgeImg.style.objectPosition = '80% 80%';

  document.getElementById('ba-style-label').textContent = o.nom_tableau;
  document.getElementById('ba-artist').textContent      = `${o.auteur}  ·  ${o.date}`;
  document.getElementById('ba-big-title').textContent   = o.auteur.split(' ').pop().toUpperCase();
  document.getElementById('ba-date').textContent        = o.date;
  document.getElementById('ba-museum').textContent      = o.musee_actuel;

  const thirds      = splitText(o.descriptif, 3);
  const blockLabels = ['Contexte historique', "L'œuvre", 'Héritage & influence'];
  [0, 1, 2].forEach(i => {
    document.getElementById(`ba-block${i + 1}-title`).textContent = blockLabels[i];
    document.getElementById(`ba-block${i + 1}-text`).textContent  = thirds[i] || '';
  });
}

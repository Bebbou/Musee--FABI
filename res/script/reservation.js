/* ══ PARALLAX SECTION RÉSERVATION ══ */
(function initResaParallax() {
  const section = document.getElementById('reservation');
  if (!section) return;

  function onScroll() {
    const rect   = section.getBoundingClientRect();
    const viewH  = window.innerHeight;
    /* ratio 0 (section en bas écran) → 1 (section en haut écran) */
    const ratio  = 1 - (rect.top + rect.height) / (viewH + rect.height);
    /* déplacement max ±10% de la hauteur de la section */
    const offset = (ratio - 0.5) * rect.height * 0.22;
    section.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══ RÉSERVATION ══ */

/* ── Tarifs de base ── */
const TARIFS = {
  plein:    12,
  etudiant: 8,
  senior:   9,
  enfant:   6,
  gratuit:  0,
};

const LABELS_CAT = {
  plein:    'Plein tarif',
  etudiant: 'Étudiant',
  senior:   'Sénior',
  enfant:   'Enfant',
  gratuit:  'Gratuit',
};

const SUPPLEMENT_GUIDEE  = 3;
const SUPPLEMENT_PRIVEE  = 10;

const LANGUES = { fr: 'Français', en: 'English', es: 'Español', it: 'Italiano', de: 'Deutsch' };

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin',
               'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* ── État global ── */
const state = {
  step: 1,
  visitors: { plein: 0, etudiant: 0, senior: 0, enfant: 0, gratuit: 0 },
  visitType: null,
  lang: 'fr',
  selectedArtworks: [],   // [{id, nom, auteur}]
  creneau: 'matin',
  selectedDate: null,     // Date object
  calYear: null,
  calMonth: null,
};

/* ── Collection d'œuvres (chargée en async) ── */
let ARTWORKS = [];

async function loadArtworks() {
  try {
    const res = await fetch('../database/collection_musee.json');
    const data = await res.json();
    ARTWORKS = data.oeuvres || [];
  } catch { ARTWORKS = []; }
}

/* ════════════════════════════════════════════
   NAVIGATION ENTRE ÉTAPES
════════════════════════════════════════════ */

function goToStep(n) {
  document.querySelectorAll('.resa-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`resa-panel-${n}`);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('.resa-step-item').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === n) el.classList.add('active');
    else if (s < n) el.classList.add('done');
  });

  state.step = n;
}

/* ════════════════════════════════════════════
   ÉTAPE 1 — VISITEURS
════════════════════════════════════════════ */

function totalVisitors() {
  return Object.values(state.visitors).reduce((a, b) => a + b, 0);
}

function basePrix() {
  return Object.entries(state.visitors).reduce((sum, [cat, n]) => sum + n * TARIFS[cat], 0);
}

function updateLiveBar() {
  document.getElementById('live-total-visitors').textContent = totalVisitors();
  document.getElementById('live-price-base').textContent = basePrix() + ' €';
}

function initCounters() {
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      const isPlus = btn.classList.contains('plus');
      if (isPlus) {
        state.visitors[cat]++;
      } else {
        if (state.visitors[cat] > 0) state.visitors[cat]--;
      }
      document.getElementById(`cnt-${cat}`).textContent = state.visitors[cat];
      updateLiveBar();
    });
  });

  document.getElementById('step1-next').addEventListener('click', () => {
    if (totalVisitors() === 0) {
      shakeEl(document.getElementById('step1-next'));
      return;
    }
    goToStep(2);
  });
}

/* ════════════════════════════════════════════
   ÉTAPE 2 — TYPE DE VISITE
════════════════════════════════════════════ */

function initVisitType() {
  document.querySelectorAll('.visit-type-card').forEach(card => {
    card.addEventListener('click', () => {
      state.visitType = card.dataset.type;
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  document.getElementById('step2-next').addEventListener('click', () => {
    if (!state.visitType) {
      shakeEl(document.getElementById('step2-next'));
      return;
    }
    prepareStep3();
    goToStep(3);
  });

  document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
}

/* ════════════════════════════════════════════
   ÉTAPE 3 — OPTIONS
════════════════════════════════════════════ */

function prepareStep3() {
  const isGuided = state.visitType === 'guidee' || state.visitType === 'privee';
  document.getElementById('guided-options').style.display = isGuided ? '' : 'none';
  document.getElementById('creneau-block').style.display  = isGuided ? '' : 'none';

  const sub = document.getElementById('step3-sub');
  if (!isGuided) {
    sub.textContent = 'Visite libre — aucune option supplémentaire';
  } else {
    sub.textContent = 'Précisez la langue et les œuvres que vous souhaitez absolument voir';
  }
}

function initStep3() {
  /* Langue */
  document.querySelectorAll('input[name="lang"]').forEach(r => {
    r.addEventListener('change', () => { state.lang = r.value; });
  });

  /* Créneau */
  document.querySelectorAll('input[name="creneau"]').forEach(r => {
    r.addEventListener('change', () => { state.creneau = r.value; });
  });

  /* Recherche œuvres */
  const searchInput = document.getElementById('artwork-search');
  const dropdown    = document.getElementById('artwork-dropdown');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.remove('open'); return; }

    const results = ARTWORKS.filter(o =>
      o.nom_tableau.toLowerCase().includes(q) || o.auteur.toLowerCase().includes(q)
    ).slice(0, 8);

    if (!results.length) { dropdown.classList.remove('open'); return; }

    dropdown.innerHTML = results.map(o => `
      <div class="artwork-option" data-id="${o.id}">
        <span class="artwork-option-title">${o.nom_tableau}</span>
        <span class="artwork-option-author">${o.auteur}</span>
      </div>
    `).join('');

    dropdown.classList.add('open');

    dropdown.querySelectorAll('.artwork-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const id = parseInt(opt.dataset.id);
        if (state.selectedArtworks.find(a => a.id === id)) {
          dropdown.classList.remove('open');
          searchInput.value = '';
          return;
        }
        if (state.selectedArtworks.length >= 2) {
          shakeEl(searchInput);
          dropdown.classList.remove('open');
          searchInput.value = '';
          return;
        }
        const oeuvre = ARTWORKS.find(o => o.id === id);
        state.selectedArtworks.push({ id: oeuvre.id, nom: oeuvre.nom_tableau, auteur: oeuvre.auteur });
        renderSelectedArtworks();
        dropdown.classList.remove('open');
        searchInput.value = '';
      });
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.artwork-search-wrap')) dropdown.classList.remove('open');
  });

  document.getElementById('step3-next').addEventListener('click', () => {
    initCalendar();
    goToStep(4);
  });

  document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
}

function renderSelectedArtworks() {
  const wrap = document.getElementById('selected-artworks');
  if (!state.selectedArtworks.length) {
    wrap.innerHTML = '<p class="no-artwork-msg">Aucune œuvre sélectionnée</p>';
    return;
  }
  wrap.innerHTML = state.selectedArtworks.map(a => `
    <span class="selected-artwork-chip" data-id="${a.id}">
      ${a.nom}
      <span class="remove-artwork">×</span>
    </span>
  `).join('');

  wrap.querySelectorAll('.selected-artwork-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = parseInt(chip.dataset.id);
      state.selectedArtworks = state.selectedArtworks.filter(a => a.id !== id);
      renderSelectedArtworks();
    });
  });
}

/* ════════════════════════════════════════════
   ÉTAPE 4 — CALENDRIER
════════════════════════════════════════════ */

function initCalendar() {
  const today = new Date();
  state.calYear  = today.getFullYear();
  state.calMonth = today.getMonth();

  /* Sélecteurs mois/année */
  const selMonth = document.getElementById('cal-month-sel');
  const selYear  = document.getElementById('cal-year-sel');

  if (!selMonth.options.length) {
    MOIS.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = m;
      selMonth.appendChild(opt);
    });

    for (let y = today.getFullYear(); y <= today.getFullYear() + 2; y++) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      selYear.appendChild(opt);
    }

    selMonth.addEventListener('change', () => {
      state.calMonth = parseInt(selMonth.value);
      renderCalendar();
    });

    selYear.addEventListener('change', () => {
      state.calYear = parseInt(selYear.value);
      renderCalendar();
    });

    document.getElementById('cal-prev').addEventListener('click', () => {
      state.calMonth--;
      if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
      syncCalSelectors();
      renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
      state.calMonth++;
      if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
      syncCalSelectors();
      renderCalendar();
    });

    document.getElementById('step4-next').addEventListener('click', () => {
      if (!state.selectedDate) { shakeEl(document.getElementById('step4-next')); return; }
      buildRecap();
      goToStep(5);
    });

    document.getElementById('step4-back').addEventListener('click', () => goToStep(3));
  }

  syncCalSelectors();
  renderCalendar();
}

function syncCalSelectors() {
  document.getElementById('cal-month-sel').value = state.calMonth;
  document.getElementById('cal-year-sel').value  = state.calYear;
}

function renderCalendar() {
  const grid  = document.getElementById('cal-grid');
  const today = new Date();
  today.setHours(0,0,0,0);

  const firstDay = new Date(state.calYear, state.calMonth, 1);
  /* Lundi = 0 pour notre grille */
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();

  let html = '';

  /* Cellules vides avant le 1er */
  for (let i = 0; i < startDow; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(state.calYear, state.calMonth, d);
    const dow  = date.getDay(); // 0=dim, 1=lun … 6=sam
    const isPast    = date < today;
    const isMonday  = dow === 1; /* fermé le lundi */
    const isSelected = state.selectedDate &&
      date.toDateString() === state.selectedDate.toDateString();
    const isToday = date.toDateString() === today.toDateString();

    let cls = 'cal-day';
    if (isPast || isMonday) cls += ' disabled';
    else if (isSelected)    cls += ' selected';
    else if (isToday)       cls += ' today';

    const clickable = !isPast && !isMonday;
    html += `<div class="${cls}" data-date="${date.toISOString()}" ${clickable ? '' : 'aria-disabled="true"'}>${d}</div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day:not(.disabled):not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      state.selectedDate = new Date(cell.dataset.date);
      renderCalendar();
      const display = state.selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      document.getElementById('cal-selected-display').textContent =
        display.charAt(0).toUpperCase() + display.slice(1);
    });
  });
}

/* ════════════════════════════════════════════
   ÉTAPE 5 — RÉCAPITULATIF
════════════════════════════════════════════ */

function calcTotal() {
  const base = basePrix();
  const n    = totalVisitors();
  let supp = 0;
  if (state.visitType === 'guidee')  supp = SUPPLEMENT_GUIDEE  * n;
  if (state.visitType === 'privee')  supp = SUPPLEMENT_PRIVEE  * n;
  return base + supp;
}

function buildRecap() {
  /* Nom utilisateur */
  let userName = '—';
  try {
    const u = JSON.parse(localStorage.getItem('fabi_user') || '{}');
    userName = ((u.prenom || '') + ' ' + (u.nom || '')).trim() || '—';
  } catch {}
  document.getElementById('recap-name').textContent = userName;

  /* Date */
  const dateStr = state.selectedDate
    ? state.selectedDate.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '—';
  document.getElementById('recap-date').textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  /* Créneau */
  const creneauRow = document.getElementById('recap-creneau-row');
  const isGuided = state.visitType === 'guidee' || state.visitType === 'privee';
  creneauRow.style.display = isGuided ? '' : 'none';
  if (isGuided) {
    document.getElementById('recap-creneau').textContent =
      state.creneau === 'matin' ? 'Matin — 10 h 00 à 14 h 00' : 'Après-midi — 14 h 00 à 18 h 00';
  }

  /* Type */
  const typeLabels = { libre: 'Visite libre', guidee: 'Visite guidée (+3 €/pers.)', privee: 'Visite guidée privée (+10 €/pers.)' };
  document.getElementById('recap-type').textContent = typeLabels[state.visitType] || '—';

  /* Langue */
  const langRow = document.getElementById('recap-lang-row');
  langRow.style.display = isGuided ? '' : 'none';
  if (isGuided) document.getElementById('recap-lang').textContent = LANGUES[state.lang] || '—';

  /* Œuvres */
  const artRow = document.getElementById('recap-artworks-row');
  artRow.style.display = (isGuided && state.selectedArtworks.length) ? '' : 'none';
  if (isGuided && state.selectedArtworks.length) {
    document.getElementById('recap-artworks').textContent =
      state.selectedArtworks.map(a => a.nom).join(', ');
  }

  /* Détail visiteurs */
  const detail = document.getElementById('recap-visitors-detail');
  const supp = state.visitType === 'guidee' ? SUPPLEMENT_GUIDEE
             : state.visitType === 'privee' ? SUPPLEMENT_PRIVEE : 0;
  detail.innerHTML = Object.entries(state.visitors)
    .filter(([, n]) => n > 0)
    .map(([cat, n]) => {
      const unitPrice = TARIFS[cat] + supp;
      return `
        <div class="recap-visitor-line">
          <span>${n} × ${LABELS_CAT[cat]}</span>
          <span class="rv-price">${n * unitPrice} €</span>
        </div>`;
    }).join('');

  /* Total */
  document.getElementById('recap-total-price').textContent = calcTotal() + ' €';
}

/* ════════════════════════════════════════════
   CONFIRMATION + EMAIL + QR CODE
════════════════════════════════════════════ */

const QR_LINK = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';

function buildQrUrl(data) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1a130a&bgcolor=faf6f0&data='
    + encodeURIComponent(data);
}

async function sendConfirmEmail(ref) {
  const statusEl = document.getElementById('confirm-email-status');
  statusEl.className = 'confirm-email-status';
  statusEl.textContent = 'Envoi de l\'email en cours…';

  /* Infos utilisateur */
  let userEmail = '';
  let userName  = '—';
  try {
    const u = JSON.parse(localStorage.getItem('fabi_user') || '{}');
    userEmail = u.email || '';
    userName  = ((u.prenom || '') + ' ' + (u.nom || '')).trim() || '—';
  } catch {}

  if (!userEmail) {
    statusEl.className = 'confirm-email-status err';
    statusEl.textContent = 'Aucun email associé à votre compte — récapitulatif non envoyé.';
    return;
  }

  /* Détail visiteurs pour le mail */
  const supp = state.visitType === 'guidee' ? SUPPLEMENT_GUIDEE
             : state.visitType === 'privee' ? SUPPLEMENT_PRIVEE : 0;

  const visiteursMail = Object.entries(state.visitors)
    .filter(([, n]) => n > 0)
    .map(([cat, n]) => ({
      label:     LABELS_CAT[cat],
      qty:       n,
      unitPrice: (TARIFS[cat] + supp) + ' €',
      total:     (n * (TARIFS[cat] + supp)) + ' €',
    }));

  const typeLabels = {
    libre:  'Visite libre',
    guidee: 'Visite guidée (+3 €/pers.)',
    privee: 'Visite guidée privée (+10 €/pers.)',
  };

  const dateStr = state.selectedDate
    ? state.selectedDate.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '—';

  const payload = {
    ref,
    nom:       userName,
    email:     userEmail,
    date:      dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
    creneau:   (state.visitType !== 'libre')
                 ? (state.creneau === 'matin' ? 'Matin — 10h00 à 14h00' : 'Après-midi — 14h00 à 18h00')
                 : '',
    type:      typeLabels[state.visitType] || '',
    langue:    (state.visitType !== 'libre') ? (LANGUES[state.lang] || '') : '',
    oeuvres:   state.selectedArtworks.map(a => a.nom).join(', '),
    visiteurs: visiteursMail,
    total:     calcTotal() + ' €',
    qr_url:    QR_LINK,
  };

  try {
    const r = await fetch(`${API}/send_reservation.php`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(payload),
    });
    const d = await r.json();
    if (d.success) {
      statusEl.className = 'confirm-email-status ok';
      statusEl.textContent = '✓ Récapitulatif envoyé à ' + userEmail;
    } else {
      statusEl.className = 'confirm-email-status err';
      statusEl.textContent = 'Erreur lors de l\'envoi — conservez votre référence.';
    }
  } catch {
    statusEl.className = 'confirm-email-status err';
    statusEl.textContent = 'Erreur réseau — conservez votre référence.';
  }
}

function initConfirm() {
  document.getElementById('step5-back').addEventListener('click', () => goToStep(4));

  document.getElementById('btn-confirm').addEventListener('click', async () => {
    const ref = 'FABI-' + Date.now().toString(36).toUpperCase();
    document.getElementById('confirm-ref-num').textContent = ref;

    /* QR code */
    const qrImg = document.getElementById('confirm-qr-img');
    qrImg.src = buildQrUrl(QR_LINK);

    document.querySelectorAll('.resa-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('resa-panel-confirm').classList.add('active');

    /* Masquer le stepper */
    document.getElementById('resa-stepper').style.opacity = '0.3';
    document.getElementById('resa-stepper').style.pointerEvents = 'none';

    /* Envoi email en arrière-plan */
    sendConfirmEmail(ref);
  });

  document.getElementById('btn-new-resa').addEventListener('click', () => {
    /* Réinitialiser l'état */
    Object.keys(state.visitors).forEach(k => { state.visitors[k] = 0; });
    state.visitType = null;
    state.lang = 'fr';
    state.selectedArtworks = [];
    state.creneau = 'matin';
    state.selectedDate = null;

    /* Reset UI compteurs */
    Object.keys(state.visitors).forEach(k => {
      const el = document.getElementById(`cnt-${k}`);
      if (el) el.textContent = '0';
    });
    updateLiveBar();
    renderSelectedArtworks();
    document.getElementById('cal-selected-display').textContent = '—';

    /* Reset radios */
    document.querySelectorAll('input[name="visit-type"]').forEach(r => r.checked = false);
    const frLang = document.querySelector('input[name="lang"][value="fr"]');
    if (frLang) frLang.checked = true;
    const matinRadio = document.querySelector('input[name="creneau"][value="matin"]');
    if (matinRadio) matinRadio.checked = true;

    document.getElementById('resa-stepper').style.opacity = '';
    document.getElementById('resa-stepper').style.pointerEvents = '';

    goToStep(1);
  });
}

/* ── Utilitaire : secouer un élément pour signaler une erreur ── */
function shakeEl(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.35s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

/* Injection de l'animation shake dans le head si absente */
(function injectShakeKeyframes() {
  if (document.getElementById('shake-kf')) return;
  const style = document.createElement('style');
  style.id = 'shake-kf';
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ── Init ── */
async function initReservation() {
  await loadArtworks();
  initCounters();
  initVisitType();
  initStep3();
  initConfirm();
}

initReservation();

/* ── ESPACE CLIENT ── */

const PAINTINGS = [
  { img: '../assets/img/peintures/3.webp',  titre: 'Composition I' },
  { img: '../assets/img/peintures/5.webp',  titre: 'Étude en bleu' },
  { img: '../assets/img/peintures/7.webp',  titre: 'Portrait anonyme' },
  { img: '../assets/img/peintures/9.webp',  titre: 'Nature silencieuse' },
  { img: '../assets/img/peintures/12.webp', titre: 'Lumière d\'été' },
  { img: '../assets/img/peintures/15.webp', titre: 'Après l\'orage' },
  { img: '../assets/img/peintures/18.webp', titre: 'Mélancolie' },
  { img: '../assets/img/peintures/22.webp', titre: 'Fragments' },
  { img: '../assets/img/peintures/27.webp', titre: 'La veillée' },
  { img: '../assets/img/peintures/31.webp', titre: 'Ciel ouvert' },
  { img: '../assets/img/peintures/35.webp', titre: 'Rêverie' },
  { img: '../assets/img/peintures/40.webp', titre: 'Silhouette' },
];

/* Choisir 4 tableaux aléatoires sans répétition */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/* Injecter les tableaux dans les slots */
function loadPaintings() {
  const picks = pickRandom(PAINTINGS, 4);
  picks.forEach((p, i) => {
    const img = document.querySelector(`#painting-${i} .painting-img`);
    const title = document.getElementById(`title-${i}`);
    if (img) img.src = p.img;
    if (title) title.textContent = p.titre;
  });
}

/* Remplir les éléments DOM avec les infos utilisateur */
function fillUserInfo(user) {
  const initiales = ((user.prenom?.[0] ?? '') + (user.nom?.[0] ?? '')).toUpperCase();
  document.getElementById('dash-avatar').textContent = initiales || '?';
  document.getElementById('dash-name').textContent = (user.prenom + ' ' + user.nom).trim() || '—';

  const pseudoEl = document.getElementById('dash-pseudo');
  if (user.pseudo) {
    pseudoEl.textContent = user.pseudo.startsWith('@') ? user.pseudo : '@' + user.pseudo;
  } else {
    pseudoEl.style.display = 'none';
  }

  document.getElementById('dash-email').textContent = user.email || '—';

  const raw = user.created_at || user.date_inscription || '';
  if (raw) {
    const d = new Date(raw.replace(' ', 'T'));
    document.getElementById('dash-since').textContent =
      d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

/* Charger les infos utilisateur — session API en priorité, localStorage en fallback */
async function loadUserInfo() {
  try {
    const r = await fetch('../api/session.php', { credentials: 'include' });
    const d = await r.json();
    if (d.logged_in && d.user) {
      localStorage.setItem('fabi_user', JSON.stringify(d.user));
      fillUserInfo(d.user);
      return;
    }
  } catch { /* serveur absent */ }

  /* Fallback localStorage */
  try {
    const raw = localStorage.getItem('fabi_user');
    if (raw) { fillUserInfo(JSON.parse(raw)); return; }
  } catch { /* rien */ }

  /* Pas connecté → retour à la page de connexion */
  window.location.href = './client.html';
}

/* Déconnexion */
async function handleLogout() {
  try {
    await fetch('../api/logout.php', { credentials: 'include' });
  } catch { /* si le serveur est absent, on continue quand même */ }
  localStorage.removeItem('fabi_user');
  window.location.href = './client.html';
}

document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
document.getElementById('btn-header-logout')?.addEventListener('click', handleLogout);

/* Init */
loadPaintings();
loadUserInfo();

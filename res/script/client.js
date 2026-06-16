/* ── CLIENT.JS ── */

const viewAuth      = document.getElementById('view-auth');
const viewDashboard = document.getElementById('view-dashboard');

/* ── Basculer vers le dashboard ── */
function showDashboard(user) {
  const initiales = (user.prenom[0] + user.nom[0]).toUpperCase();
  document.getElementById('dash-avatar').textContent = initiales;
  document.getElementById('dash-name').textContent   = user.prenom + ' ' + user.nom;
  document.getElementById('dash-email').textContent  = user.email;

  const date = new Date((user.created_at ?? '').replace(' ', 'T'));
  document.getElementById('dash-since').textContent  =
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  viewAuth.style.display      = 'none';
  viewDashboard.style.display = 'block';
}

/* ── Basculer vers l'auth ── */
function showAuth() {
  viewDashboard.style.display = 'none';
  viewAuth.style.display      = 'block';
}

/* ── Vérification session au chargement ── */
fetch('../api/me.php', { credentials: 'include' })
  .then(r => r.json())
  .then(data => { if (data.success) showDashboard(data.user); })
  .catch(() => {});

/* ── Onglets ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

/* ── Helper message ── */
function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = 'form-message ' + (ok ? 'success' : 'error');
}

/* ── Connexion ── */
document.getElementById('btn-login').addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showMsg('msg-login', 'Veuillez remplir tous les champs.', false);
    return;
  }

  try {
    const res  = await fetch('../api/login.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    showMsg('msg-login', data.message, data.success);
    if (data.success) setTimeout(() => showDashboard(data.user), 800);
  } catch {
    showMsg('msg-login', 'Serveur inaccessible — lancez PHP : php -S 127.0.0.1:8000 -t res/', false);
  }
});

/* ── Inscription ── */
document.getElementById('btn-register').addEventListener('click', async () => {
  const nom      = document.getElementById('reg-nom').value.trim();
  const prenom   = document.getElementById('reg-prenom').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!nom || !prenom || !email || !password) {
    showMsg('msg-register', 'Veuillez remplir tous les champs.', false);
    return;
  }

  try {
    const res  = await fetch('../api/register.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, password })
    });
    const data = await res.json();
    showMsg('msg-register', data.message, data.success);
    if (data.success) {
      setTimeout(() => document.querySelector('[data-tab="connexion"]').click(), 1500);
    }
  } catch {
    showMsg('msg-register', 'Serveur inaccessible — lancez PHP : php -S 127.0.0.1:8000 -t res/', false);
  }
});

/* ── Déconnexion ── */
document.getElementById('btn-logout').addEventListener('click', async () => {
  await fetch('../api/logout.php', { credentials: 'include' });
  showAuth();
});

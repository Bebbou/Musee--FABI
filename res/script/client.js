/* ── Onglets ── */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

/* ── Helpers ── */
function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'form-message ' + (ok ? 'success' : 'error');
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    showMsg('msg-login', data.message, data.success);
    if (data.success) {
      setTimeout(() => window.location.href = '../common/index.html', 1200);
    }
  } catch {
    showMsg('msg-login', 'Serveur inaccessible. Assurez-vous que PHP tourne (MAMP/XAMPP).', false);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, password })
    });
    const data = await res.json();
    showMsg('msg-register', data.message, data.success);
    if (data.success) {
      setTimeout(() => {
        document.querySelector('[data-tab="connexion"]').click();
      }, 1500);
    }
  } catch {
    showMsg('msg-register', 'Serveur inaccessible. Assurez-vous que PHP tourne (MAMP/XAMPP).', false);
  }
});

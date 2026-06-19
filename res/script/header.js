/* ── HEADER.JS — partagé sur toutes les pages ── */
/* BASE et API sont définis dans config.js */

(async function () {
  let session = { logged_in: false };
  try {
    const r = await fetch(API + '/session.php', { credentials: 'include' });
    session  = await r.json();
  } catch (_) {}

  const link = document.querySelector('.header-client-link');
  const btn  = document.querySelector('.header-client-btn');
  if (!link || !btn) return;

  link.href = session.logged_in
    ? BASE + '/res/common/espace-client.html'
    : BASE + '/res/common/client.html';

  if (session.logged_in) {
    const u = session.user;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      ${u.prenom} ${u.nom}`;
  } else {
    btn.innerHTML = `
      <i class="ti ti-login" style="font-size:18px;" aria-hidden="true"></i>
      Connexion`;
  }
})();

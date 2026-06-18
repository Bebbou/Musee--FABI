/* ── HEADER.JS — partagé sur toutes les pages ── */

(async function () {
  let session = { logged_in: false };
  try {
    const r = await fetch('/res/api/session.php', { credentials: 'include' });
    session  = await r.json();
  } catch (_) {}

  const link = document.querySelector('.header-client-link');
  const btn  = document.querySelector('.header-client-btn');
  if (!link || !btn) return;

  if (session.logged_in) {
    const u = session.user;
    link.href = '/res/common/client.html';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      ${u.prenom} ${u.nom}`;
  } else {
    link.href = '/res/common/client.html';
    btn.innerHTML = `
      <i class="ti ti-login" style="font-size:18px;" aria-hidden="true"></i>
      Connexion`;
  }
})();

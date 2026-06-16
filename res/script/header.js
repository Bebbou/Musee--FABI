/* ── HEADER.JS — partagé sur toutes les pages ── */

const fabiUser = localStorage.getItem('fabi_user');
if (fabiUser) {
  const btn = document.querySelector('.header-client-btn');
  if (btn) {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      Mon compte`;
  }
}

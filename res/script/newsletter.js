/* ── NEWSLETTER.JS — formulaire d'abonnement footer ── */
(function () {
  const form  = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const msg   = document.getElementById('newsletter-msg');
  if (!form || !input || !msg) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    const btn = form.querySelector('.footer-newsletter-btn');
    btn.disabled = true;

    const lang = localStorage.getItem('fabi-lang') || 'fr';
    const t = window.FABI_I18N?.TRANSLATIONS?.[lang] || {};

    try {
      const r    = await fetch(API + '/newsletter.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email })
      });
      const data = await r.json();
      if (data.success) {
        msg.textContent = t.newsletter_success || '✓ Newsletter envoyée !';
        msg.className   = 'footer-newsletter-msg ok';
        input.value     = '';
        form.style.display = 'none';
      } else {
        msg.textContent = t.newsletter_error || 'Une erreur est survenue.';
        msg.className   = 'footer-newsletter-msg err';
        btn.disabled    = false;
      }
    } catch (_) {
      msg.textContent = t.newsletter_error || 'Une erreur est survenue.';
      msg.className   = 'footer-newsletter-msg err';
      btn.disabled    = false;
    }
  });
})();

(function () {
  const section = document.getElementById('parallax-section');
  const fresque = document.getElementById('p-fresque');
  const voluteL = document.querySelector('.co-parallax-volute-l');
  const voluteR = document.querySelector('.co-parallax-volute-r');

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = 1 - (rect.bottom / (vh + rect.height));
    const p = Math.max(-0.5, Math.min(1.5, progress));

    if (fresque) fresque.style.transform = `translateY(${p * 80}px)`;

    const vy = p * -60;
    if (voluteL) voluteL.style.transform = `translateY(calc(-50% + ${vy}px))`;
    if (voluteR) voluteR.style.transform = `translateY(calc(-50% + ${vy}px)) scaleX(-1)`;

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
})();

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdevryz';

async function handleSubmit(e) {
  e.preventDefault();

  const form    = document.getElementById('co-form');
  const btn     = document.getElementById('co-submit');
  const label   = document.getElementById('co-btn-label');
  const success = document.getElementById('co-success');
  const error   = document.getElementById('co-error');

  btn.disabled = true;
  label.textContent = 'Envoi…';
  success.style.display = 'none';
  error.style.display   = 'none';

  const data = new FormData(form);

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.reset();
      btn.style.display     = 'none';
      success.style.display = 'block';
      setTimeout(() => {
        btn.style.display     = '';
        success.style.display = 'none';
      }, 8000);
    } else {
      error.style.display = 'block';
      btn.disabled        = false;
      label.textContent   = 'Envoyer';
    }
  } catch {
    error.style.display = 'block';
    btn.disabled        = false;
    label.textContent   = 'Envoyer';
  }
}

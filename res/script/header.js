/* ── HEADER.JS — partagé sur toutes les pages ── */
/* BASE et API sont définis dans config.js */

// ── Session utilisateur ──
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

// ── Lang switcher ──
(function () {
  const LANGS = [
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'en', label: 'EN', name: 'English' },
  ];

  function getCurrentLang() {
    return localStorage.getItem('fabi-lang') || 'fr';
  }

  function buildWidget(current) {
    const wrapper = document.createElement('div');
    wrapper.id = 'lang-switcher';

    const tab = document.createElement('div');
    tab.id = 'lang-current';
    tab.setAttribute('aria-haspopup', 'listbox');
    tab.setAttribute('aria-expanded', 'false');
    tab.setAttribute('role', 'button');
    tab.setAttribute('tabindex', '0');
    tab.innerHTML = `
      <span id="lang-current-label">${LANGS.find(l => l.code === current)?.label || 'FR'}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>`;

    const dropdown = document.createElement('div');
    dropdown.id = 'lang-dropdown';
    dropdown.setAttribute('role', 'listbox');

    LANGS.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'lang-option' + (lang.code === current ? ' active' : '');
      btn.dataset.lang = lang.code;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', lang.code === current ? 'true' : 'false');
      btn.innerHTML = `<span class="lang-code">${lang.label}</span>${lang.name}`;
      btn.addEventListener('click', () => selectLang(lang.code));
      dropdown.appendChild(btn);
    });

    wrapper.appendChild(tab);
    wrapper.appendChild(dropdown);
    return { wrapper, tab, dropdown };
  }

  function selectLang(code) {
    localStorage.setItem('fabi-lang', code);
    document.documentElement.lang = code;

    // Met à jour le label affiché
    const labelEl = document.getElementById('lang-current-label');
    if (labelEl) labelEl.textContent = LANGS.find(l => l.code === code)?.label || code.toUpperCase();

    // Met à jour les boutons actifs
    document.querySelectorAll('.lang-option').forEach(btn => {
      const isActive = btn.dataset.lang === code;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Applique les traductions si i18n chargé
    if (window.FABI_I18N) window.FABI_I18N.applyLang(code);

    closeDropdown();
  }

  function openDropdown(wrapper, tab) {
    wrapper.classList.add('open');
    tab.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    const wrapper = document.getElementById('lang-switcher');
    const tab     = document.getElementById('lang-current');
    if (!wrapper) return;
    wrapper.classList.remove('open');
    if (tab) tab.setAttribute('aria-expanded', 'false');
  }

  function init() {
    const current        = getCurrentLang();
    const { wrapper, tab } = buildWidget(current);

    document.body.appendChild(wrapper);
    document.documentElement.lang = current;

    // Toggle ouverture
    tab.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');
      isOpen ? closeDropdown() : openDropdown(wrapper, tab);
    });

    tab.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = wrapper.classList.contains('open');
        isOpen ? closeDropdown() : openDropdown(wrapper, tab);
      }
      if (e.key === 'Escape') closeDropdown();
    });

    // Ferme si clic extérieur
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) closeDropdown();
    });

    // Applique la langue au chargement
    if (window.FABI_I18N) {
      window.FABI_I18N.applyLang(current);
    } else {
      // i18n.js peut être chargé après header.js
      window.addEventListener('load', () => {
        if (window.FABI_I18N) window.FABI_I18N.applyLang(current);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

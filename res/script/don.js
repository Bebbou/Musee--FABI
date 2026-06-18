/* ── DON.JS ── */

const IMPACTS = {
  10:  "10 € permettent d'offrir une visite guidée à un groupe scolaire.",
  25:  "25 € financent la restauration d'un cadre ancien.",
  50:  "50 € contribuent à l'acquisition de matériaux de conservation.",
  100: "100 € financent une demi-journée de travail d'un restaurateur expert.",
  250: "250 € permettent la numérisation haute résolution de 5 œuvres.",
};

let currentAmount = 25;
let isCustom = false;

/* ── Montants prédéfinis ── */
document.querySelectorAll('.don-amount-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.don-amount-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const customWrap = document.getElementById('don-custom-wrap');
    if (btn.dataset.amount === 'custom') {
      customWrap.style.display = 'block';
      isCustom = true;
      const val = parseInt(document.getElementById('don-custom-input').value) || 0;
      currentAmount = val;
    } else {
      customWrap.style.display = 'none';
      isCustom = false;
      currentAmount = parseInt(btn.dataset.amount);
    }
    updateUI();
  });
});

/* ── Montant personnalisé ── */
document.getElementById('don-custom-input').addEventListener('input', e => {
  currentAmount = parseInt(e.target.value) || 0;
  updateUI();
});

/* ── Fréquence ── */
document.querySelectorAll('.don-freq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.don-freq-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateUI();
  });
});

/* ── Mise à jour de l'UI ── */
function updateUI() {
  const freq = document.querySelector('.don-freq-btn.active')?.dataset.freq ?? 'unique';
  const freqLabel = freq === 'mensuel' ? '/mois' : '';

  /* Impact */
  const impactEl = document.getElementById('don-impact-text');
  const matchedImpact = IMPACTS[currentAmount];
  if (matchedImpact) {
    impactEl.textContent = matchedImpact;
    document.getElementById('don-impact').style.display = 'flex';
  } else if (currentAmount > 0) {
    impactEl.textContent = `${currentAmount} € — merci pour votre généreuse contribution !`;
    document.getElementById('don-impact').style.display = 'flex';
  } else {
    document.getElementById('don-impact').style.display = 'none';
  }

  /* Résumé */
  const reduction = currentAmount * 0.66;
  const net = currentAmount - reduction;

  document.getElementById('summary-amount').textContent =
    currentAmount > 0 ? `${currentAmount} €${freqLabel}` : '—';
  document.getElementById('summary-reduction').textContent =
    currentAmount > 0 ? `− ${reduction.toFixed(2).replace('.', ',')} €` : '—';
  document.getElementById('summary-net').textContent =
    currentAmount > 0 ? `${net.toFixed(2).replace('.', ',')} €${freqLabel}` : '—';

  /* Bouton */
  document.getElementById('don-submit-label').textContent =
    currentAmount > 0
      ? `Donner ${currentAmount} €${freqLabel}`
      : 'Choisissez un montant';
}

/* ── Soumission ── */
document.getElementById('don-submit').addEventListener('click', () => {
  const email = document.getElementById('don-email').value.trim();

  if (currentAmount <= 0) {
    shakeEl(document.querySelector('.don-amounts'));
    return;
  }
  if (!email) {
    shakeEl(document.getElementById('don-email'));
    document.getElementById('don-email').focus();
    return;
  }

  /* Ici on brancherait un vrai système de paiement (Stripe, HelloAsso…) */
  /* Pour l'instant : affiche la confirmation */
  document.getElementById('confirm-amount').textContent = `${currentAmount} €`;

  const formEls = document.querySelectorAll(
    '.don-amounts, .don-custom-wrap, .don-impact, .don-freq, .don-form-divider, .don-fields, .don-summary, .don-submit, .don-secure'
  );
  formEls.forEach(el => el.style.display = 'none');

  document.getElementById('don-confirm').style.display = 'block';
  document.getElementById('don-confirm').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ── Petite animation shake pour les erreurs ── */
function shakeEl(el) {
  el.style.animation = 'none';
  el.offsetHeight; /* reflow */
  el.style.animation = 'don-shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

/* Keyframes pour le shake */
const style = document.createElement('style');
style.textContent = `
  @keyframes don-shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);

/* Init */
updateUI();

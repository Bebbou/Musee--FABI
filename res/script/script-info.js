/* script-info.js — charge l'œuvre et peuple les layouts
   
   📝 POUR MODIFIER LES TAILLES DE TEXTE : allez dans style-info.css
      Recherchez "MODIFIER CETTE TAILLE" pour trouver tous les font-size à ajuster
   
   ✏️  POUR MODIFIER LE CONTENU : c'est dans populateEditorial() et populateBaroque()
      Les textes proviennent de collection_musee.json (base de données)
*/

(async function () {
  const params  = new URLSearchParams(location.search);
  const idParam = parseInt(params.get('id'), 10);
  const loading = document.getElementById('info-loading');

  let oeuvres, artistes;
  try {
    const [resO, resA] = await Promise.all([
      fetch('/res/database/collection_musee.json'),
      fetch('/res/database/artistes.json'),
    ]);
    oeuvres  = (await resO.json()).oeuvres;
    artistes = (await resA.json()).artistes;
  } catch (e) {
    loading.textContent = 'Impossible de charger la collection.';
    return;
  }

  let oeuvre;
  if (!isNaN(idParam) && idParam >= 1) {
    oeuvre = oeuvres.find(o => o.id === idParam);
  }
  if (!oeuvre) {
    oeuvre = oeuvres[Math.floor(Math.random() * oeuvres.length)];
  }

  const artiste = artistes.find(a => a.nom === oeuvre.auteur) || null;

  document.getElementById('page-title').textContent = `Musée FABI — ${oeuvre.nom_tableau}`;
  loading.style.display = 'none';

  const useEditorial = oeuvre.id % 2 !== 0;

  if (useEditorial) {
    populateEditorial(oeuvre, artiste);
  } else {
    populateBaroque(oeuvre, artiste);
  }
})();

/* ── Helpers ── */
function wikiImg(url, width = 1200) {
  if (!url) return '';
  /* Utilise l'URL originale telle quelle — Wikimedia la redirige vers le fichier */
  const base = url.split('?')[0];
  return `${base}?width=${width}`;
}

function cityFrom(musee) {
  const parts = musee.split(/[-–]/);
  return (parts.length > 1 ? parts[parts.length - 1] : musee).trim();
}

function yearFrom(date) {
  return date.split(/[-–]/)[0].replace(/[^\d]/g, '') || date;
}

function splitText(text, n) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const per       = Math.ceil(sentences.length / n);
  return Array.from({ length: n }, (_, i) =>
    sentences.slice(i * per, (i + 1) * per).join(' ').trim()
  );
}

/* ══════════════════════════
   LAYOUT 1 — ÉDITORIAL
══════════════════════════ */
function populateEditorial(o, artiste) {
  const layout = document.getElementById('layout-editorial');
  layout.hidden = false;
  layout.classList.add('active');

  document.getElementById('ed-museum').textContent = cityFrom(o.musee_actuel).toUpperCase();
  document.getElementById('ed-year').textContent   = yearFrom(o.date);

  document.getElementById('ed-drop-letter').textContent = o.nom_tableau.charAt(0);
  document.getElementById('ed-drop-rest').textContent   = o.nom_tableau.slice(1).toLowerCase();

  const imgUrl   = wikiImg(o.image_url);
  const cropData = [
    { id: 'ed-img1', pos: '15% 8%'  },
    { id: 'ed-img2', pos: '85% 15%' },
    { id: 'ed-img3', pos: '50% 35%' },
    { id: 'ed-img4', pos: '30% 75%' },
  ];
  cropData.forEach(({ id, pos }) => {
    const el = document.getElementById(id);
    el.src = imgUrl;
    el.alt = o.nom_tableau;
    el.style.objectPosition = pos;
  });

  const halves = splitText(o.descriptif, 2);
  document.getElementById('ed-desc1').textContent = halves[0] || '';
  document.getElementById('ed-desc2').textContent = halves[1] || '';

  /* Carte artiste */
  if (artiste?.image_url) {
    const card = document.getElementById('ed-artist-card');
    card.hidden = false;
    document.getElementById('ed-artist-img').src      = artiste.image_url;
    document.getElementById('ed-artist-img').alt      = artiste.nom;
    document.getElementById('ed-artist-name').textContent     = artiste.nom;
    const deces = artiste.deces ? `–${artiste.deces}` : '';
    document.getElementById('ed-artist-dates').textContent    = `${artiste.naissance}${deces}`;
    document.getElementById('ed-artist-movement').textContent = artiste.mouvement;
  }
}

/* ══════════════════════════
   LAYOUT 2 — BAROQUE
══════════════════════════ */
function populateBaroque(o, artiste) {
  const layout = document.getElementById('layout-baroque');
  layout.hidden = false;
  layout.classList.add('active');

  const imgUrl = wikiImg(o.image_url);

  document.getElementById('ba-main-img').src = imgUrl;
  document.getElementById('ba-main-img').alt = o.nom_tableau;

  /* Cercle : portrait de l'artiste si disponible, sinon crop de l'œuvre */
  const circleImg = document.getElementById('ba-circle-img');
  if (artiste?.image_url) {
    circleImg.src = artiste.image_url;
    circleImg.alt = artiste.nom;
    circleImg.style.objectPosition = 'top center';
  } else {
    circleImg.src = imgUrl;
    circleImg.alt = o.nom_tableau;
    circleImg.style.objectPosition = '65% 12%';
  }

  /* Badge petit : toujours un crop de l'œuvre */
  const badgeImg = document.getElementById('ba-badge-img');
  badgeImg.src = imgUrl;
  badgeImg.alt = o.nom_tableau;
  badgeImg.style.objectPosition = '80% 80%';

  /* Titre + artiste */
  document.getElementById('ba-style-label').textContent = o.nom_tableau;
  document.getElementById('ba-artist').textContent      = `${o.auteur}  ·  ${o.date}`;

  /* Texte fantôme = nom de famille */
  document.getElementById('ba-big-title').textContent =
    o.auteur.split(' ').pop().toUpperCase();

  /* Méta */
  document.getElementById('ba-date').textContent   = o.date;
  document.getElementById('ba-museum').textContent = o.musee_actuel;

  /* 3 blocs */
  const thirds      = splitText(o.descriptif, 3);
  const blockLabels = ['Contexte historique', "L'œuvre", 'Héritage & influence'];
  [0, 1, 2].forEach(i => {
    document.getElementById(`ba-block${i + 1}-title`).textContent = blockLabels[i];
    document.getElementById(`ba-block${i + 1}-text`).textContent  = thirds[i] || '';
  });
}

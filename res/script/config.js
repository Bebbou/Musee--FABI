/* ── CONFIG.JS — base path automatique selon l'environnement ──
   localhost                            → BASE = ''
   web-mmi2.iutbeziers/~lilian.cornet/Musee--FABI → BASE = '/~lilian.cornet/Musee--FABI'
*/
const BASE = window.location.pathname.replace(/\/res\/.*$/, '');
const API  = BASE + '/res/api';

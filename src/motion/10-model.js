/* ---------- Modèle de projet Spectra Motion ----------
   Un projet = une composition (largeur, hauteur, images/s, durée) + des calques posés sur des pistes.
   Le même modèle sert aux cinq studios : Design et Photo regardent l'image à un instant donné, Vidéo, Motion et Audio
   regardent le temps. Rien n'est dupliqué : un titre animé dans Motion est le même calque que dans Vidéo.

   project = {v, app, title, studio, w, h, fps, dur, bg, media:{id:{…}}, layers:[…]}
   calque  = {id, t, name, track, start, dur, x, y, w, h, rot, op, sc, vis, lock, kf:{prop:[[t, v, easing]…]}, tin, tout, …}
     t : image | video | audio | text | shape | color | icon | chart | qr | draw
     track : piste ; les calques visuels d'une piste plus haute se dessinent par-dessus. Les pistes audio sont à part (calques t = audio).
     kf : images clés, temps relatif au début du calque (secondes). Propriétés animables : x, y, sc, rot, op.
     tin / tout : effet d'entrée / de sortie ({k, d}) : fondu, glissement, zoom, volet, flou, machine à écrire.
   Pages (Design, Photo) : P.pages = [{id, live:true} | {id, bg, layers}], P.pg = page affichée. La page affichée vit dans P.layers / P.bg ;
   les autres sont rangées dans P.pages. Groupes : les calques d'un même groupe partagent L.g.
   Les fichiers des médias ne sont jamais dans le projet : seulement leurs métadonnées (le fichier est dans l'appareil et, si
   possible, dans Firebase Storage). */
const STUDIOS = [
  {id:'design', name:'Design', ic:'design', desc:'Visuels, réseaux sociaux, affiches'},
  {id:'photo', name:'Photo', ic:'photo', desc:'Retouche et composition'},
  {id:'video', name:'Vidéo', ic:'video', desc:'Montage multipiste'},
  {id:'motion', name:'Motion', ic:'anim', desc:'Animation et images clés'},
  {id:'audio', name:'Audio', ic:'audio', desc:'Pistes, fondus, mixage'},
];
const TIMED = s => s === 'video' || s === 'motion' || s === 'audio';
const LAYER_TYPES = ['image', 'video', 'audio', 'text', 'shape', 'color', 'icon', 'chart', 'qr', 'draw'];
const VISUAL_NAMES = {text:'Texte', image:'Image', video:'Vidéo', audio:'Son', color:'Couleur', icon:'Icône', chart:'Graphique', qr:'QR code', draw:'Dessin'};
const ANIM_PROPS = ['x', 'y', 'sc', 'rot', 'op'];
const EASES = {lin:'Linéaire', ease:'Douce', in:'Accélération', out:'Décélération', hold:'Maintien'};
const ease = (k, t) => k === 'hold' ? 0 : k === 'in' ? t * t * t : k === 'out' ? 1 - (1 - t) ** 3 : k === 'ease' ? (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) : t;
const FX_IN = {none:'Aucun', fade:'Fondu', slideL:'Glisser depuis la gauche', slideR:'Glisser depuis la droite', slideU:'Monter', slideD:'Descendre', zoom:'Zoom', pop:'Rebond', wipe:'Volet', blur:'Flou',
  rotate:'Tourner', drop:'Tomber', flip:'Basculer', spin:'Tourbillon', wipeU:'Volet vers le haut', iris:'Iris', block:'Bloc coloré', type:'Machine à écrire', words:'Mot par mot'};
const FX_OUT = {none:'Aucun', fade:'Fondu', slideL:'Sortir à gauche', slideR:'Sortir à droite', slideU:'Monter', slideD:'Descendre', zoom:'Zoom', pop:'Rebond', wipe:'Volet', blur:'Flou',
  rotate:'Tourner', drop:'Tomber', flip:'Basculer', spin:'Tourbillon', wipeU:'Volet vers le haut', iris:'Iris'};
const TEXT_FX = new Set(['type', 'words']);
const BLENDS = {'source-over':'Normal', multiply:'Produit', screen:'Superposition claire', overlay:'Incrustation', darken:'Obscurcir', lighten:'Éclaircir', 'color-dodge':'Densité couleur −', 'soft-light':'Lumière tamisée', difference:'Différence', luminosity:'Luminosité',
  'hard-light':'Lumière crue', 'color-burn':'Densité couleur +', exclusion:'Exclusion', hue:'Teinte', saturation:'Saturation', color:'Couleur'};
const FILTERS = {none:['Original', {}], vivid:['Éclatant', {sat:35, con:8}], warm:['Chaud', {temp:25, sat:10}], cool:['Froid', {temp:-25}], bw:['Noir et blanc', {sat:-100, con:10}],
  sepia:['Sépia', {sepia:70}], fade:['Délavé', {con:-20, bri:8, sat:-25}], drama:['Dramatique', {con:35, bri:-8, sat:-10}], dream:['Rêve', {blur:1, bri:10, sat:15}], night:['Nuit', {bri:-25, temp:-20, con:10}],
  vintage:['Vintage', {sepia:35, con:-10, sat:-20, fade:25, vig:30}], film:['Pellicule', {con:12, sat:-12, grain:35, fade:15}], polaroid:['Polaroïd', {bri:8, con:-8, temp:12, fade:30}], mono:['Mono contrasté', {sat:-100, con:45, bri:-5}],
  pastel:['Pastel', {sat:-30, bri:14, con:-18, fade:20}], cine:['Cinéma', {con:20, sat:-8, temp:-12, vig:35}], golden:['Doré', {temp:40, sat:18, bri:4}], frost:['Givré', {temp:-40, bri:10, sat:-20}],
  rose:['Rosé', {hue:-12, sat:15, temp:10, bri:6}], neon:['Néon', {sat:70, con:25, hue:20}], lomo:['Lomo', {sat:30, con:30, vig:60}], soft:['Doux', {blur:.6, bri:8, con:-12}],
  noir:['Film noir', {sat:-100, con:60, vig:50, grain:25}], summer:['Été', {temp:22, sat:25, bri:8}], autumn:['Automne', {temp:30, hue:-8, sat:10, con:8}], ocean:['Océan', {temp:-25, hue:8, sat:20}]};
const ADJ_KEYS = {bri:['Luminosité', -100, 100], con:['Contraste', -100, 100], sat:['Saturation', -100, 100], hue:['Teinte', -180, 180], temp:['Température', -100, 100], sepia:['Sépia', 0, 100], blur:['Flou', 0, 30], vig:['Vignettage', 0, 100], fade:['Voile', 0, 100], grain:['Grain', 0, 100]};
/* polices : [nom, famille de secours, catégorie, axes Google Fonts] — chargées à la demande (une police n'est téléchargée que si elle sert) */
const FONTS_M = [
  ['Inter', 'sans-serif', 'Sans', 'wght@300;400;500;600;700;800;900'], ['Bricolage Grotesque', 'sans-serif', 'Sans', 'opsz,wght@12..96,400;12..96,800'], ['Plus Jakarta Sans', 'sans-serif', 'Sans', 'wght@400;600;700;800'],
  ['Montserrat', 'sans-serif', 'Sans', 'ital,wght@0,400;0,600;0,700;0,800;0,900;1,700'], ['Poppins', 'sans-serif', 'Sans', 'ital,wght@0,400;0,600;0,700;0,800;1,400'], ['Space Grotesk', 'sans-serif', 'Sans', 'wght@400;600;700'],
  ['Unbounded', 'sans-serif', 'Sans', 'wght@400;700;800;900'], ['Syne', 'sans-serif', 'Sans', 'wght@400;600;800'], ['Outfit', 'sans-serif', 'Sans', 'wght@300;400;700;900'], ['Manrope', 'sans-serif', 'Sans', 'wght@400;700;800'],
  ['DM Sans', 'sans-serif', 'Sans', 'ital,wght@0,400;0,700;1,400'], ['Work Sans', 'sans-serif', 'Sans', 'wght@400;600;800'], ['Rubik', 'sans-serif', 'Sans', 'wght@400;700;900'], ['Nunito', 'sans-serif', 'Sans', 'wght@400;700;900'],
  ['Raleway', 'sans-serif', 'Sans', 'ital,wght@0,400;0,700;0,900;1,400'], ['Josefin Sans', 'sans-serif', 'Sans', 'wght@400;700'], ['Quicksand', 'sans-serif', 'Sans', 'wght@400;700'], ['Comfortaa', 'sans-serif', 'Sans', 'wght@400;700'],
  ['Lexend', 'sans-serif', 'Sans', 'wght@400;700;900'], ['Sora', 'sans-serif', 'Sans', 'wght@400;700;800'], ['Archivo', 'sans-serif', 'Sans', 'wght@400;700;900'], ['Kanit', 'sans-serif', 'Sans', 'wght@400;700;900'],
  ['Fredoka', 'sans-serif', 'Arrondie', 'wght@400;700'], ['Baloo 2', 'sans-serif', 'Arrondie', 'wght@400;700;800'],
  ['Anton', 'sans-serif', 'Affiche', ''], ['Bebas Neue', 'sans-serif', 'Affiche', ''], ['Oswald', 'sans-serif', 'Affiche', 'wght@400;600;700'], ['Archivo Black', 'sans-serif', 'Affiche', ''], ['Barlow Condensed', 'sans-serif', 'Affiche', 'wght@400;700;900'],
  ['Teko', 'sans-serif', 'Affiche', 'wght@400;600'], ['Passion One', 'sans-serif', 'Affiche', 'wght@400;700;900'], ['Titan One', 'sans-serif', 'Affiche', ''], ['Rowdies', 'sans-serif', 'Affiche', 'wght@400;700'], ['Bungee', 'sans-serif', 'Affiche', ''],
  ['Righteous', 'sans-serif', 'Affiche', ''], ['Black Ops One', 'sans-serif', 'Affiche', ''], ['Monoton', 'sans-serif', 'Affiche', ''], ['Orbitron', 'sans-serif', 'Affiche', 'wght@400;700;900'], ['Chakra Petch', 'sans-serif', 'Affiche', 'wght@400;700'],
  ['Playfair Display', 'serif', 'Serif', 'ital,wght@0,400;0,700;0,900;1,400'], ['DM Serif Display', 'serif', 'Serif', 'ital@0;1'], ['Fraunces', 'serif', 'Serif', 'ital,wght@0,400;0,700;0,900;1,400'], ['Lora', 'serif', 'Serif', 'ital,wght@0,400;0,700;1,400'],
  ['Merriweather', 'serif', 'Serif', 'ital,wght@0,400;0,700;0,900;1,400'], ['Cormorant Garamond', 'serif', 'Serif', 'ital,wght@0,400;0,700;1,400'], ['Libre Baskerville', 'serif', 'Serif', 'ital,wght@0,400;0,700;1,400'],
  ['Bodoni Moda', 'serif', 'Serif', 'ital,wght@0,400;0,700;1,400'], ['Cinzel', 'serif', 'Serif', 'wght@400;700;900'], ['Prata', 'serif', 'Serif', ''], ['Yeseva One', 'serif', 'Serif', ''], ['Abril Fatface', 'serif', 'Serif', ''],
  ['Roboto Slab', 'serif', 'Serif', 'wght@400;700;900'], ['Zilla Slab', 'serif', 'Serif', 'wght@400;700'], ['Alfa Slab One', 'serif', 'Serif', ''],
  ['Caveat', 'cursive', 'Manuscrite', 'wght@400;700'], ['Pacifico', 'cursive', 'Manuscrite', ''], ['Dancing Script', 'cursive', 'Manuscrite', 'wght@400;700'], ['Great Vibes', 'cursive', 'Manuscrite', ''], ['Satisfy', 'cursive', 'Manuscrite', ''],
  ['Sacramento', 'cursive', 'Manuscrite', ''], ['Lobster', 'cursive', 'Manuscrite', ''], ['Courgette', 'cursive', 'Manuscrite', ''], ['Permanent Marker', 'cursive', 'Manuscrite', ''], ['Shrikhand', 'cursive', 'Manuscrite', ''],
  ['Kalam', 'cursive', 'Manuscrite', 'wght@400;700'], ['Indie Flower', 'cursive', 'Manuscrite', ''], ['Shadows Into Light', 'cursive', 'Manuscrite', ''], ['Gloria Hallelujah', 'cursive', 'Manuscrite', ''], ['Amatic SC', 'cursive', 'Manuscrite', 'wght@400;700'],
  ['JetBrains Mono', 'monospace', 'Chasse fixe', 'wght@400;600;700'], ['Space Mono', 'monospace', 'Chasse fixe', 'wght@400;700'], ['Special Elite', 'monospace', 'Chasse fixe', ''], ['Press Start 2P', 'monospace', 'Chasse fixe', ''],
];
const FONT_CATS = ['Sans', 'Arrondie', 'Affiche', 'Serif', 'Manuscrite', 'Chasse fixe'];
/* feuille Google Fonts d'une police, ajoutée une seule fois ; renvoie une promesse résolue quand la feuille est chargée */
const FONT_LINKS = {};
function fontNeed(n){
  const f = FONTS_M.find(x => x[0] === n); if (!f || typeof document === 'undefined') return Promise.resolve();
  if (FONT_LINKS[n]) return FONT_LINKS[n];
  return FONT_LINKS[n] = new Promise(res => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f[0].replace(/ /g, '+')}${f[3] ? ':' + f[3] : ''}&display=swap`;
    l.onload = l.onerror = () => res(); document.head.appendChild(l); setTimeout(res, 6000); });
}
const fontCss = n => { const f = FONTS_M.find(x => x[0] === n); return `"${String(n || 'Inter').replace(/"/g, '')}", ${f ? f[1] : 'sans-serif'}`; };

/* ---------- formats prédéfinis ---------- */
const FORMATS = [
  {id:'square', name:'Publication Instagram', sub:'1080 × 1080 · carré', w:1080, h:1080, cat:'Réseaux sociaux'},
  {id:'portrait', name:'Publication portrait', sub:'1080 × 1350 · 4:5', w:1080, h:1350, cat:'Réseaux sociaux'},
  {id:'story', name:'Story', sub:'1080 × 1920 · Instagram, Facebook', w:1080, h:1920, cat:'Réseaux sociaux'},
  {id:'fbpost', name:'Publication Facebook', sub:'1200 × 630 · lien partagé', w:1200, h:630, cat:'Réseaux sociaux'},
  {id:'fbcover', name:'Couverture Facebook', sub:'1640 × 624', w:1640, h:624, cat:'Réseaux sociaux'},
  {id:'xpost', name:'Publication X (Twitter)', sub:'1600 × 900', w:1600, h:900, cat:'Réseaux sociaux'},
  {id:'pin', name:'Épingle Pinterest', sub:'1000 × 1500', w:1000, h:1500, cat:'Réseaux sociaux'},
  {id:'banner', name:'Bannière LinkedIn', sub:'1584 × 396', w:1584, h:396, cat:'Réseaux sociaux'},
  {id:'lipost', name:'Publication LinkedIn', sub:'1200 × 1200', w:1200, h:1200, cat:'Réseaux sociaux'},
  {id:'thumb', name:'Miniature YouTube', sub:'1280 × 720', w:1280, h:720, cat:'Vidéo'},
  {id:'ytbanner', name:'Bannière YouTube', sub:'2560 × 1440', w:2560, h:1440, cat:'Vidéo'},
  {id:'hd', name:'Vidéo 16:9', sub:'1920 × 1080 · YouTube, écran', w:1920, h:1080, cat:'Vidéo'},
  {id:'vertical', name:'Vidéo verticale', sub:'1080 × 1920 · Reels, TikTok, Shorts', w:1080, h:1920, cat:'Vidéo'},
  {id:'k4', name:'Vidéo 4K', sub:'3840 × 2160', w:3840, h:2160, cat:'Vidéo'},
  {id:'slide', name:'Présentation 16:9', sub:'1920 × 1080', w:1920, h:1080, cat:'Présentations'},
  {id:'slide43', name:'Présentation 4:3', sub:'1600 × 1200', w:1600, h:1200, cat:'Présentations'},
  {id:'a4', name:'Affiche A4', sub:'1240 × 1754 · 150 dpi', w:1240, h:1754, cat:'Impression', dpi:150},
  {id:'a4l', name:'A4 paysage', sub:'1754 × 1240 · diplôme, certificat', w:1754, h:1240, cat:'Impression', dpi:150},
  {id:'a5', name:'Flyer A5', sub:'874 × 1240 · 150 dpi', w:874, h:1240, cat:'Impression', dpi:150},
  {id:'a3', name:'Affiche A3', sub:'1754 × 2480 · 150 dpi', w:1754, h:2480, cat:'Impression', dpi:150},
  {id:'letter', name:'Lettre US', sub:'1275 × 1650 · 150 dpi', w:1275, h:1650, cat:'Impression', dpi:150},
  {id:'card', name:'Carte de visite', sub:'1050 × 600 · 85 × 55 mm, 300 dpi', w:1050, h:600, cat:'Impression', dpi:300},
  {id:'invite', name:'Invitation 5 × 7', sub:'1500 × 2100', w:1500, h:2100, cat:'Impression', dpi:300},
  {id:'menu', name:'Menu', sub:'1240 × 2480 · format long', w:1240, h:2480, cat:'Impression', dpi:150},
  {id:'photo32', name:'Photo 3:2', sub:'1800 × 1200', w:1800, h:1200, cat:'Photo'},
  {id:'photo43', name:'Photo 4:3', sub:'1600 × 1200', w:1600, h:1200, cat:'Photo'},
  {id:'logo', name:'Logo', sub:'1000 × 1000', w:1000, h:1000, cat:'Marque'},
  {id:'email', name:'En-tête d\'e-mail', sub:'1200 × 400', w:1200, h:400, cat:'Marque'},
  {id:'infog', name:'Infographie', sub:'1080 × 2700 · format long', w:1080, h:2700, cat:'Marque'},
  {id:'web', name:'Bannière web', sub:'1920 × 600', w:1920, h:600, cat:'Marque'},
  {id:'zoom', name:'Fond de visio', sub:'1920 × 1080', w:1920, h:1080, cat:'Marque'},
];
const FORMAT_CATS = ['Réseaux sociaux', 'Vidéo', 'Présentations', 'Impression', 'Photo', 'Marque'];
const STUDIO_FORMAT = {design:'square', photo:'photo32', video:'hd', motion:'hd', audio:'hd'};

function newProject(studio = 'design', fmt){
  const f = typeof fmt === 'object' && fmt ? fmt : FORMATS.find(x => x.id === (fmt || STUDIO_FORMAT[studio])) || FORMATS[0];
  return {v:1, app:'spectramotion', title:'Projet sans titre', studio, w:f.w, h:f.h, fps:30, dur:studio === 'audio' ? 30 : TIMED(studio) ? 10 : 5, bg:studio === 'audio' ? '#101018' : studio === 'video' || studio === 'motion' ? '#000000' : '#FFFFFF', fmt:f.id || '', media:{}, layers:[]};
}
/* ---------- calques ---------- */
function baseLayer(P, t, o = {}){
  return {id:uid('l'), t, name:'', track:0, start:0, dur:Math.max(1, P.dur || 5), x:0, y:0, w:P.w, h:P.h, rot:0, op:1, sc:1, vis:true, lock:false, blend:'source-over', kf:{}, tin:{k:'none', d:.6}, tout:{k:'none', d:.6}, ...o};
}
function topTrack(P, audio = false){ const ls = P.layers.filter(l => (l.t === 'audio') === audio); return ls.length ? Math.max(...ls.map(l => l.track)) + 1 : 0; }
function mkText(P, o = {}){
  const fs = o.fs || Math.round(Math.min(P.w, P.h) * .08);
  const L = baseLayer(P, 'text', {name:'Texte', txt:'Votre texte', font:'Inter', fs, fw:800, it:false, col:'#16131F', align:'c', lh:1.15, ls:0, up:false, tbg:'', tbgPad:.25, tsh:false, tstroke:'', tsw:0, ...o});
  if (!o.w){ L.w = Math.round(P.w * .8); L.h = Math.round(fs * 1.6); L.x = Math.round((P.w - L.w) / 2); L.y = Math.round((P.h - L.h) / 2); }
  return L;
}
function mkShape(P, k = 'rect', o = {}){
  const s = Math.round(Math.min(P.w, P.h) * .3);
  return baseLayer(P, 'shape', {name:SHAPE_NAMES[k] || 'Forme', k, fill:'#6D3BFF', fill2:'', ga:135, stroke:'', sw:0, r:k === 'rect' ? 0 : 0, x:Math.round((P.w - s) / 2), y:Math.round((P.h - s) / 2), w:s, h:s, ...o});
}
const MASKS = {none:'Aucun', ellipse:'Cercle', round:'Arrondi', hex:'Hexagone', diamond:'Losange', star:'Étoile', heart:'Cœur', tri:'Triangle', prism:'Lecture', pent:'Pentagone', oct:'Octogone', burst:'Badge', arch:'Arche', blob:'Galet', para:'Parallélogramme', cross:'Croix'};
const SHAPE_NAMES = {rect:'Rectangle', round:'Rectangle arrondi', ellipse:'Ellipse', tri:'Triangle', star:'Étoile', hex:'Hexagone', diamond:'Losange', arrow:'Flèche', line:'Ligne', heart:'Cœur', bubble:'Bulle', ring:'Anneau', prism:'Prisme',
  pent:'Pentagone', oct:'Octogone', cross:'Croix', para:'Parallélogramme', trap:'Trapèze', chevron:'Chevron', burst:'Badge', star4:'Étincelle', arrow2:'Double flèche', arch:'Arche', blob:'Galet', moon:'Croissant', cloud:'Nuage', larrow:'Ligne fléchée', ldarrow:'Ligne à deux flèches'};
const LINE_KINDS = new Set(['line', 'larrow', 'ldarrow']);
const DASHES = {none:'Continu', dash:'Tirets', dot:'Pointillés'};
const PATTERNS = {dots:'Pois', lines:'Rayures', grid:'Quadrillage', waves:'Vagues'};
const CHART_KINDS = {col:'Colonnes', bar:'Barres', line:'Courbe', area:'Aires', pie:'Secteurs', donut:'Anneau', prog:'Jauge'};
const TFX = {none:'Aucun', shadow:'Ombre', lift:'Relief', hollow:'Creux', splice:'Décalé', echo:'Écho', glitch:'Glitch', neon:'Néon', outline:'Contour épais'};
const LISTS = {none:'Aucune', bullet:'Puces', num:'Numérotée', check:'Coches'};
const PALETTE_DEF = ['#7B2FF7', '#14C2EC', '#45D69A', '#FFC83D', '#FF8A3D', '#FF3F86', '#3D63FF', '#16131F'];
function mkMediaLayer(P, m, o = {}){
  const t = m.kind === 'audio' ? 'audio' : m.kind === 'video' ? 'video' : 'image';
  const L = baseLayer(P, t, {name:m.name || 'Média', media:m.id, in:0, speed:1, vol:1, mute:false, fadeIn:0, fadeOut:0, fit:'contain', flipX:false, flipY:false, crop:null, adj:{}, filter:'none', r:0, ...o});
  if (t !== 'audio' && m.w && m.h){ // l'image remplit le cadre en gardant ses proportions
    const k = Math.min(P.w / m.w, P.h / m.h); L.w = Math.round(m.w * k); L.h = Math.round(m.h * k); L.x = Math.round((P.w - L.w) / 2); L.y = Math.round((P.h - L.h) / 2);
  }
  if (t === 'audio'){ L.x = L.y = 0; L.w = P.w; L.h = P.h; }
  if (m.dur && (t === 'video' || t === 'audio')) L.dur = round(m.dur, 3);
  return L;
}
function mkColor(P, c = '#16131F', o = {}){ return baseLayer(P, 'color', {name:'Fond de couleur', fill:c, fill2:'', ga:135, ...o}); }
const boxC = (P, f = .3, ar = 1) => { const s = Math.round(Math.min(P.w, P.h) * f), w = ar >= 1 ? s : Math.round(s * ar), h = ar >= 1 ? Math.round(s / ar) : s; return {x:Math.round((P.w - w) / 2), y:Math.round((P.h - h) / 2), w, h}; };
function mkIcon(P, ic, o = {}){ return baseLayer(P, 'icon', {name:(ICON_NAMES[ic] || 'Icône'), ic, col:'#16131F', sw:2, bgc:'', bgs:'circle', ...boxC(P, .18), ...o}); }
function mkChart(P, ck = 'col', o = {}){
  return baseLayer(P, 'chart', {name:'Graphique · ' + (CHART_KINDS[ck] || ''), ck, data:ck === 'prog' ? [['Objectif atteint', 72]] : [['Jan', 12], ['Fév', 19], ['Mar', 15], ['Avr', 26], ['Mai', 22]], pal:[...PALETTE_DEF], tcol:'#16131F', font:'Inter', vals:true, labs:true, grid:true, ...boxC(P, .55, ck === 'pie' || ck === 'donut' || ck === 'prog' ? 1 : 1.4), ...o});
}
function mkQr(P, txt = 'https://studio-prism.com', o = {}){ return baseLayer(P, 'qr', {name:'QR code', txt, col:'#16131F', bgc:'#FFFFFF', ecc:'M', ...boxC(P, .32), ...o}); }
function mkDraw(P, pts, o = {}){ return baseLayer(P, 'draw', {name:'Dessin', pts, col:'#16131F', sw:6, ...o}); }

/* ---------- images clés : valeur d'une propriété à l'instant tl (relatif au calque) ---------- */
function kfVal(L, p, tl){
  const k = L.kf?.[p]; if (!k || !k.length) return L[p];
  if (tl <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++){
    const a = k[i], b = k[i + 1];
    if (tl <= b[0]){ const span = b[0] - a[0] || 1e-6; return lerp(a[1], b[1], ease(a[2] || 'ease', clamp((tl - a[0]) / span, 0, 1))); }
  }
  return k[k.length - 1][1];
}
function setKf(L, p, tl, v, e){
  L.kf ||= {}; const k = (L.kf[p] ||= []); tl = round(clamp(tl, 0, L.dur), 3);
  const i = k.findIndex(x => Math.abs(x[0] - tl) < 1 / 120);
  if (i >= 0){ k[i][1] = v; if (e) k[i][2] = e; } else { k.push([tl, v, e || 'ease']); k.sort((a, b) => a[0] - b[0]); }
}
function delKf(L, p, tl){ const k = L.kf?.[p]; if (!k) return; const i = k.findIndex(x => Math.abs(x[0] - tl) < 1 / 120); if (i >= 0) k.splice(i, 1); if (!k.length) delete L.kf[p]; }
const hasKf = (L, p) => !!(L.kf?.[p]?.length);
const kfAt = (L, p, tl) => (L.kf?.[p] || []).some(x => Math.abs(x[0] - tl) < 1 / 120);
/* durée réelle du projet : la fin du dernier calque (au moins la durée réglée pour un visuel fixe) */
function projEnd(P){ return P.layers.reduce((m, l) => Math.max(m, l.start + l.dur), 0); }
function syncDur(P){ const e = projEnd(P); if (TIMED(P.studio)) P.dur = Math.max(1, round(Math.max(e, .5), 3)); return P.dur; }
const visible = (L, t) => L.vis !== false && t >= L.start - 1e-6 && t < L.start + L.dur - 1e-6;
/* ordre de dessin : piste croissante, puis ordre du tableau */
function drawOrder(P){ return P.layers.map((l, i) => [l, i]).filter(([l]) => l.t !== 'audio').sort((a, b) => (a[0].track - b[0].track) || (a[1] - b[1])).map(x => x[0]); }

/* ---------- pages ---------- */
const pageCount = P => P.pages?.length || 1;
function pageView(P, i){ // projet « vu » sur la page i (pour le rendu des vignettes, de l'export PDF…)
  if (!P.pages || i === (P.pg || 0)) return P; const g = P.pages[i]; return g ? {...P, bg:g.bg === undefined ? P.bg : g.bg, layers:g.layers || []} : P;
}
function pageGo(P, i){
  if (!P.pages || i === P.pg || i < 0 || i >= P.pages.length) return false;
  P.pages[P.pg] = {id:P.pages[P.pg].id, bg:P.bg, layers:P.layers};
  const g = P.pages[i]; P.layers = g.layers || []; P.bg = g.bg === undefined ? '#FFFFFF' : g.bg; P.pages[i] = {id:g.id, live:true}; P.pg = i; return true;
}
function pageAdd(P, copy, at){
  if (!P.pages){ P.pages = [{id:uid('pg'), live:true}]; P.pg = 0; }
  const n = {id:uid('pg'), bg:copy ? P.bg : (P.bg === null ? null : '#FFFFFF'), layers:copy ? deep(P.layers).map(l => ({...l, id:uid('l')})) : []};
  const i = at == null ? P.pg + 1 : at; P.pages.splice(i, 0, n); if (i <= P.pg) P.pg++; pageGo(P, i); return i;
}
function pageDel(P, i){
  if (!P.pages || P.pages.length < 2) return false;
  if (i === P.pg){ pageGo(P, i > 0 ? i - 1 : i + 1); }
  P.pages.splice(i, 1); if (i < P.pg) P.pg--; if (P.pages.length === 1){ delete P.pages; delete P.pg; } return true;
}
function pageMove(P, i, j){ if (!P.pages || j < 0 || j >= P.pages.length || i === j) return false; const [g] = P.pages.splice(i, 1); P.pages.splice(j, 0, g); P.pg = P.pages.findIndex(x => x.live); return true; }
function allLayers(P){ return [P.layers, ...(P.pages || []).filter(g => !g.live).map(g => g.layers || [])].flat(); }
/* nouveau format : le contenu de toutes les pages est remis à l'échelle et recentré */
function rescale(P, f){
  const k = Math.min(f.w / P.w, f.h / P.h), ox = (f.w - P.w * k) / 2, oy = (f.h - P.h * k) / 2;
  const full = L => L.x <= 1 && L.y <= 1 && L.x + L.w >= P.w - 1 && L.y + L.h >= P.h - 1;
  for (const L of allLayers(P)){
    if (L.t === 'audio'){ L.w = f.w; L.h = f.h; continue; }
    if (full(L) && (L.t === 'color' || ((L.t === 'image' || L.t === 'video') && L.fit === 'cover'))){ L.x = 0; L.y = 0; L.w = f.w; L.h = f.h; continue; }
    L.x = round(L.x * k + ox, 1); L.y = round(L.y * k + oy, 1); L.w = round(L.w * k, 1); L.h = round(L.h * k, 1);
    if (L.kf?.x) L.kf.x = L.kf.x.map(q => [q[0], round(q[1] * k + ox, 1), q[2]]); if (L.kf?.y) L.kf.y = L.kf.y.map(q => [q[0], round(q[1] * k + oy, 1), q[2]]);
    if (L.t === 'text'){ L.fs = round(L.fs * k, 1); L.tsw = round((L.tsw || 0) * k, 1); }
    if (L.sw && L.t !== 'icon') L.sw = round(L.sw * k, 1); if (L.r) L.r = round(L.r * k, 1); if (L.shadow){ L.shadow.b = round(L.shadow.b * k, 1); L.shadow.x = round(L.shadow.x * k, 1); L.shadow.y = round(L.shadow.y * k, 1); }
  }
  P.w = f.w; P.h = f.h; P.fmt = f.id || ''; return P;
}
/* couleurs utilisées par le projet (palette du document), de la plus présente à la moins présente */
function docColors(P){
  const n = {}; const add = (c, w = 1) => { if (hexOk(c)){ const k = c.slice(0, 7).toUpperCase(); n[k] = (n[k] || 0) + w; } };
  add(P.bg, 3); for (const L of allLayers(P)){ add(L.fill, 2); add(L.fill2); add(L.col, 2); add(L.col2); add(L.tbg); add(L.stroke); add(L.tstroke); add(L.bgc); (L.pal || []).forEach(c => add(c)); if (L.duo){ add(L.duo.a); add(L.duo.b); } }
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}
/* « Styles » : remplace les couleurs du document par celles d'une palette, rang pour rang */
function recolor(P, pal){
  const doc = docColors(P).filter(c => c !== '#FFFFFF' && c !== '#000000'), map = {}; doc.forEach((c, i) => map[c] = pal[i % pal.length]);
  const sw = c => hexOk(c) && map[c.slice(0, 7).toUpperCase()] ? map[c.slice(0, 7).toUpperCase()] + (c.length > 7 ? c.slice(7) : '') : c;
  if (hexOk(P.bg)) P.bg = sw(P.bg);
  for (const g of P.pages || []) if (!g.live && hexOk(g.bg)) g.bg = sw(g.bg);
  for (const L of allLayers(P)){ for (const k of ['fill', 'fill2', 'col', 'col2', 'tbg', 'stroke', 'tstroke', 'bgc']) if (L[k]) L[k] = sw(L[k]); if (L.pal) L.pal = L.pal.map(sw); if (L.tfx?.c) L.tfx.c = sw(L.tfx.c); }
  return Object.keys(map).length;
}

/* ---------- assainissement d'un projet chargé (fichier, cloud, import) ---------- */
const hexOk = c => typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c);
const strC = (v, n) => String(v ?? '').slice(0, n);
const colOr = (c, d) => hexOk(c) ? c : d;
function cleanLayers(P, arr, budget){
  const out = [];
  for (const l0 of (Array.isArray(arr) ? arr : []).slice(0, 500)){
    if (budget.n-- <= 0) break;
    if (!l0 || !LAYER_TYPES.includes(l0.t)) continue;
    const L = baseLayer(P, l0.t);
    for (const k of ['x', 'y', 'w', 'h', 'rot']) L[k] = clamp(num(l0[k], L[k]), -1e6, 1e6);
    L.w = Math.max(1, L.w); L.h = Math.max(1, L.h);
    L.id = /^[\w-]{2,40}$/.test(l0.id) ? l0.id : uid('l'); L.name = strC(l0.name, 80);
    L.track = clamp(Math.round(num(l0.track)), 0, 99); L.start = clamp(num(l0.start), 0, 36000); L.dur = clamp(num(l0.dur, 5), 1 / 60, 36000);
    L.op = clamp(num(l0.op, 1), 0, 1); L.sc = clamp(num(l0.sc, 1), .01, 50); L.vis = l0.vis !== false; L.lock = !!l0.lock; L.blend = BLENDS[l0.blend] ? l0.blend : 'source-over';
    if (typeof l0.g === 'string' && /^[\w-]{2,40}$/.test(l0.g)) L.g = l0.g;
    for (const p of ANIM_PROPS){ const k = l0.kf?.[p]; if (Array.isArray(k) && k.length) L.kf[p] = k.slice(0, 200).filter(x => Array.isArray(x) && isNum(+x[0]) && isNum(+x[1])).map(x => [round(+x[0], 3), +x[1], EASES[x[2]] ? x[2] : 'ease']).sort((a, b) => a[0] - b[0]); if (L.kf[p] && !L.kf[p].length) delete L.kf[p]; }
    for (const s of ['tin', 'tout']){ const x = l0[s] || {}; L[s] = {k:(s === 'tin' ? FX_IN : FX_OUT)[x.k] && (l0.t === 'text' || !TEXT_FX.has(x.k)) ? x.k : 'none', d:clamp(num(x.d, .6), .05, 10)}; if (x.c && hexOk(x.c)) L[s].c = x.c; }
    const t = l0.t;
    if (t === 'text'){
      Object.assign(L, {txt:strC(l0.txt, 5000), font:FONTS_M.some(f => f[0] === l0.font) ? l0.font : 'Inter', fs:clamp(num(l0.fs, 64), 4, 2000), fw:[300, 400, 500, 600, 700, 800, 900].includes(+l0.fw) ? +l0.fw : 700,
        it:!!l0.it, col:colOr(l0.col, '#16131F'), align:['l', 'c', 'r'].includes(l0.align) ? l0.align : 'c', lh:clamp(num(l0.lh, 1.15), .6, 4), ls:clamp(num(l0.ls), -.2, 1), up:!!l0.up, ul:!!l0.ul,
        tbg:colOr(l0.tbg, ''), tbgPad:clamp(num(l0.tbgPad, .25), 0, 2), tsh:!!l0.tsh, tstroke:colOr(l0.tstroke, ''), tsw:clamp(num(l0.tsw), 0, 60),
        col2:colOr(l0.col2, ''), curve:clamp(Math.round(num(l0.curve)), -100, 100), list:LISTS[l0.list] ? l0.list : 'none'});
      if (l0.tfx && TFX[l0.tfx.k] && l0.tfx.k !== 'none') L.tfx = {k:l0.tfx.k, c:colOr(l0.tfx.c, '#FF3F86'), d:clamp(num(l0.tfx.d, 50), 0, 100)};
    } else if (t === 'shape' || t === 'color'){
      Object.assign(L, {k:SHAPE_NAMES[l0.k] ? l0.k : 'rect', fill:hexOk(l0.fill) ? l0.fill : (l0.fill === '' ? '' : '#6D3BFF'), fill2:colOr(l0.fill2, ''), ga:num(l0.ga, 135) % 360, stroke:colOr(l0.stroke, ''), sw:clamp(num(l0.sw), 0, 200), r:clamp(num(l0.r), 0, 4000),
        dash:DASHES[l0.dash] ? l0.dash : 'none', slot:!!l0.slot});
      if (PATTERNS[l0.pat]) Object.assign(L, {pat:l0.pat, patc:colOr(l0.patc, '#7B2FF7'), pats:clamp(num(l0.pats, 40), 4, 1000)});
    } else if (t === 'icon'){
      Object.assign(L, {ic:ICONS[l0.ic] ? l0.ic : 'star', col:colOr(l0.col, '#16131F'), sw:clamp(num(l0.sw, 2), .5, 6), bgc:colOr(l0.bgc, ''), bgs:['circle', 'round', 'square'].includes(l0.bgs) ? l0.bgs : 'circle'});
    } else if (t === 'chart'){
      const data = (Array.isArray(l0.data) ? l0.data : []).slice(0, 40).filter(r => Array.isArray(r)).map(r => [strC(r[0], 40), clamp(num(r[1]), -1e9, 1e9)]);
      Object.assign(L, {ck:CHART_KINDS[l0.ck] ? l0.ck : 'col', data:data.length ? data : [['A', 1]], pal:(Array.isArray(l0.pal) ? l0.pal : []).filter(hexOk).slice(0, 12), tcol:colOr(l0.tcol, '#16131F'),
        font:FONTS_M.some(f => f[0] === l0.font) ? l0.font : 'Inter', vals:l0.vals !== false, labs:l0.labs !== false, grid:l0.grid !== false, unit:strC(l0.unit, 8)});
      if (!L.pal.length) L.pal = [...PALETTE_DEF];
    } else if (t === 'qr'){
      Object.assign(L, {txt:strC(l0.txt, 600), col:colOr(l0.col, '#16131F'), bgc:colOr(l0.bgc, ''), ecc:['L', 'M', 'Q', 'H'].includes(l0.ecc) ? l0.ecc : 'M'});
    } else if (t === 'draw'){
      const pts = (Array.isArray(l0.pts) ? l0.pts : []).slice(0, 3000).filter(q => Array.isArray(q) && isNum(+q[0]) && isNum(+q[1])).map(q => [round(clamp(+q[0], -1, 2), 4), round(clamp(+q[1], -1, 2), 4)]);
      if (pts.length < 2) continue;
      Object.assign(L, {pts, col:colOr(l0.col, '#16131F'), sw:clamp(num(l0.sw, 6), .5, 400), hl:!!l0.hl});
    } else {
      if (!P.media[l0.media]) continue;
      Object.assign(L, {media:l0.media, in:clamp(num(l0.in), 0, 36000), speed:clamp(num(l0.speed, 1), .1, 16), vol:clamp(num(l0.vol, 1), 0, 2), mute:!!l0.mute, fadeIn:clamp(num(l0.fadeIn), 0, 60), fadeOut:clamp(num(l0.fadeOut), 0, 60),
        fit:['cover', 'contain', 'fill'].includes(l0.fit) ? l0.fit : 'contain', mask:MASKS[l0.mask] ? l0.mask : 'none', frame:!!l0.frame, flipX:!!l0.flipX, flipY:!!l0.flipY, r:clamp(num(l0.r), 0, 4000), filter:FILTERS[l0.filter] ? l0.filter : 'none', adj:{}, crop:null});
      for (const k of Object.keys(ADJ_KEYS)) if (isNum(+l0.adj?.[k]) && +l0.adj[k]) L.adj[k] = clamp(+l0.adj[k], ADJ_KEYS[k][1], ADJ_KEYS[k][2]);
      const c = l0.crop; if (c && [c.x, c.y, c.w, c.h].every(v => isNum(+v)) && +c.w > .01 && +c.h > .01) L.crop = {x:clamp(+c.x, 0, 1), y:clamp(+c.y, 0, 1), w:clamp(+c.w, .01, 1), h:clamp(+c.h, .01, 1)};
      if (t !== 'audio'){
        if (l0.duo && hexOk(l0.duo.a) && hexOk(l0.duo.b)) L.duo = {a:l0.duo.a, b:l0.duo.b};
        if (l0.bgk && hexOk(l0.bgk.c)) L.bgk = {c:l0.bgk.c, tol:clamp(num(l0.bgk.tol, 30), 1, 100), soft:clamp(num(l0.bgk.soft, 10), 0, 50)};
      } else Object.assign(L, {eqLo:clamp(num(l0.eqLo), -15, 15), eqHi:clamp(num(l0.eqHi), -15, 15), pan:clamp(num(l0.pan), -1, 1)});
      if (t === 'video') Object.assign(L, {eqLo:clamp(num(l0.eqLo), -15, 15), eqHi:clamp(num(l0.eqHi), -15, 15), pan:clamp(num(l0.pan), -1, 1)});
    }
    if (t !== 'text' && t !== 'audio' && t !== 'draw' && t !== 'icon'){ if (hexOk(l0.stroke)) L.stroke = l0.stroke; if (isNum(+l0.sw)) L.sw = clamp(+l0.sw, 0, 200); }
    if (l0.shadow && typeof l0.shadow === 'object') L.shadow = {c:colOr(l0.shadow.c, '#00000066'), b:clamp(num(l0.shadow.b, 20), 0, 200), x:clamp(num(l0.shadow.x), -500, 500), y:clamp(num(l0.shadow.y, 8), -500, 500)};
    out.push(L);
  }
  return out;
}
function cleanProject(j){
  if (typeof j === 'string') j = JSON.parse(j);
  if (!j || typeof j !== 'object') throw new Error('Fichier illisible');
  const P = newProject(STUDIOS.some(s => s.id === j.studio) ? j.studio : 'design');
  P.title = strC(j.title || 'Projet sans titre', 120);
  P.w = clamp(Math.round(num(j.w, P.w)), 16, 7680); P.h = clamp(Math.round(num(j.h, P.h)), 16, 7680);
  P.fps = [24, 25, 30, 50, 60].includes(+j.fps) ? +j.fps : 30; P.dur = clamp(num(j.dur, P.dur), .1, 3600);
  P.bg = j.bg === null ? null : hexOk(j.bg) ? j.bg : P.bg; P.fmt = strC(j.fmt, 20);
  for (const [k, m] of Object.entries(j.media || {})){
    if (!/^[\w-]{3,40}$/.test(k) || !m || typeof m !== 'object') continue;
    const kind = ['image', 'video', 'audio'].includes(m.kind) ? m.kind : null; if (!kind) continue;
    P.media[k] = {id:k, kind, name:strC(m.name || 'Média', 120), mime:strC(m.mime, 60), size:Math.max(0, Math.round(num(m.size))), w:Math.round(num(m.w)), h:Math.round(num(m.h)), dur:num(m.dur),
      hasAudio:!!m.hasAudio, path:typeof m.path === 'string' && /^spectramotion\/[\w-]+\/[\w-]+\/[\w.-]+$/.test(m.path) ? m.path : '', cloud:!!m.cloud && !!m.path, thumb:typeof m.thumb === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(m.thumb) && m.thumb.length < 12000 ? m.thumb : ''};
  }
  const budget = {n:3000};
  P.layers = cleanLayers(P, j.layers, budget);
  if (Array.isArray(j.pages) && j.pages.length > 1){
    const pg = clamp(Math.round(num(j.pg)), 0, Math.min(j.pages.length, 100) - 1); P.pages = [];
    j.pages.slice(0, 100).forEach((g, i) => {
      const id = g && /^[\w-]{2,40}$/.test(g.id) ? g.id : uid('pg');
      if (i === pg) P.pages.push({id, live:true});
      else P.pages.push({id, bg:g?.bg === null ? null : colOr(g?.bg, '#FFFFFF'), layers:cleanLayers(P, g?.layers, budget)});
    });
    P.pg = pg;
  }
  if (TIMED(P.studio)) syncDur(P);
  return P;
}
/* ---------- historique (annuler / rétablir) : instantanés du projet ---------- */
const HIST = {
  past:[], future:[], last:'', max:120,
  reset(P){ this.past = []; this.future = []; this.last = JSON.stringify(P); },
  // à appeler APRÈS une modification : l'état précédent part dans le passé
  commit(P, label = ''){ const s = JSON.stringify(P); if (s === this.last) return false; this.past.push({s:this.last, label}); if (this.past.length > this.max) this.past.shift(); this.future = []; this.last = s; return true; },
  undo(){ const x = this.past.pop(); if (!x) return null; this.future.push({s:this.last, label:x.label}); this.last = x.s; return {P:JSON.parse(x.s), label:x.label}; },
  redo(){ const x = this.future.pop(); if (!x) return null; this.past.push({s:this.last, label:x.label}); this.last = x.s; return {P:JSON.parse(x.s), label:x.label}; },
};

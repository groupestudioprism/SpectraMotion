/* ---------- Panneau de gauche : ressources et outils, selon le studio actif ---------- */
const RAIL = {
  design:['tpl', 'ai', 'shapes', 'text', 'media', 'stock', 'draw', 'colors', 'bg', 'comments', 'layers'],
  photo:['media', 'adjust', 'fx', 'ai', 'stock', 'shapes', 'text', 'draw', 'colors', 'comments', 'layers'],
  video:['media', 'stock', 'text', 'shapes', 'trans', 'fx', 'audio', 'ai', 'layers'],
  motion:['anim', 'ai', 'text', 'shapes', 'media', 'stock', 'draw', 'layers'],
  audio:['audio', 'stock', 'media', 'ai', 'layers'],
};
const PANELS = {
  tpl:['Modèles', 'tpl'], text:['Texte', 'text'], shapes:['Éléments', 'shapes'], media:['Médias', 'media'], bg:['Fond', 'bg'], layers:['Calques', 'layers'], draw:['Dessin', 'pen'], colors:['Couleurs', 'palette'],
  ai:['Assistant IA', 'magic'], stock:['Libres de droits', 'globe'], comments:['Commentaires', 'comment'],
  adjust:['Réglages', 'adjust'], fx:['Filtres', 'fx'], trans:['Transitions', 'trans'], audio:['Audio', 'audio'], anim:['Animations', 'anim'],
};
const SWATCHES = ['#16131F', '#FFFFFF', '#6D3BFF', '#3D63FF', '#14C2EC', '#2FBF71', '#FFC83D', '#FF8A3D', '#F2387A', '#E8E4F2', '#0B2A4A', '#7A1F3D', '#F4EFE6', '#1F6F5C', '#B88A2E', '#5B5B66'];
const GRADS = [['#7B2FF7', '#14C2EC'], ['#FF3F86', '#FFC83D'], ['#14C2EC', '#45D69A'], ['#16131F', '#3D2B7A'], ['#FF8A3D', '#F2387A'], ['#0B2A4A', '#14C2EC'], ['#F4EFE6', '#E8D9C4'], ['#2FBF71', '#FFC83D']];
const PALETTES = [
  ['Prisme', ['#7B2FF7', '#14C2EC', '#FFC83D', '#FF3F86', '#16131F']], ['Océan', ['#0B2A4A', '#145A86', '#14C2EC', '#A8E6F0', '#F4FBFC']], ['Forêt', ['#1F3B2D', '#2F6B4F', '#7FB069', '#E6E1C5', '#F4EFE6']],
  ['Coucher de soleil', ['#3D1A5B', '#B23A7A', '#FF6F59', '#FFB347', '#FFE5B4']], ['Terracotta', ['#5C2E1F', '#B5523B', '#E08E6D', '#F2D0A9', '#FAF3E8']], ['Menthe', ['#0F4C45', '#1F8A70', '#5DD39E', '#BCE7C9', '#F2FBF6']],
  ['Bonbon', ['#FF5DA2', '#FFA1C9', '#FFD6E8', '#9AD0FF', '#5A6BFF']], ['Nuit', ['#0E0B16', '#231942', '#5E548E', '#9F86C0', '#E0B1CB']], ['Corporate', ['#0A2540', '#1D4ED8', '#60A5FA', '#E5E7EB', '#111827']],
  ['Café', ['#2C1A12', '#5B3A29', '#A67B5B', '#D9BF9F', '#F5EDE3']], ['Néon', ['#0D0221', '#FF2A6D', '#05D9E8', '#D1F7FF', '#FFE45E']], ['Pastel', ['#FFD6E0', '#FFEFCF', '#D4F0F0', '#CCE2CB', '#B6CFB6']],
  ['Monochrome', ['#111111', '#444444', '#888888', '#CCCCCC', '#F5F5F5']], ['Agrumes', ['#FF7A00', '#FFC300', '#C7EA46', '#2EC4B6', '#1B1B1E']], ['Royal', ['#1B1464', '#4B2C82', '#C9A227', '#F5E6A8', '#FFFFFF']],
  ['Lavande', ['#2D1E4F', '#6C4AB6', '#8D72E1', '#B9E0FF', '#F5F0FF']], ['Désert', ['#7F5539', '#B08968', '#DDB892', '#E6CCB2', '#EDE0D4']], ['Bord de mer', ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51']],
  ['Vintage', ['#3E3A39', '#D7263D', '#F46036', '#2E294E', '#F7F0E6']], ['Rose doré', ['#3B2A2A', '#B76E79', '#E8C1C5', '#F6E7E1', '#FFFFFF']], ['Électrique', ['#0047FF', '#00E0FF', '#FFFFFF', '#111111', '#FF00A8']],
  ['Chantier', ['#1C1C1C', '#FFC300', '#FF7A00', '#E5E5E5', '#2F4858']], ['Glacier', ['#E0FBFC', '#C2DFE3', '#9DB4C0', '#5C6B73', '#253237']], ['Fruits rouges', ['#5E0B15', '#90323D', '#D9CAB3', '#BC8034', '#8C7A6B']],
];
const DUOS = [['#16131F', '#FFC83D'], ['#1B1464', '#FF3F86'], ['#0B2A4A', '#14C2EC'], ['#3D1A5B', '#FFB347'], ['#1F3B2D', '#BCE7C9'], ['#2C1A12', '#F2D0A9'], ['#0047FF', '#FFFFFF'], ['#5E0B15', '#FFD6E0']];
const FONT_PAIRS = [
  {n:'Moderne', t:'Bricolage Grotesque', b:'Inter'}, {n:'Élégant', t:'Playfair Display', b:'Lato', b2:'Lora'}, {n:'Affiche', t:'Anton', b:'Montserrat'}, {n:'Éditorial', t:'Fraunces', b:'DM Sans'},
  {n:'Luxe', t:'Cinzel', b:'Cormorant Garamond'}, {n:'Ludique', t:'Fredoka', b:'Nunito'}, {n:'Tech', t:'Space Grotesk', b:'JetBrains Mono'}, {n:'Manuscrit', t:'Pacifico', b:'Quicksand'},
  {n:'Impact', t:'Bebas Neue', b:'Work Sans'}, {n:'Classique', t:'Libre Baskerville', b:'Raleway'}, {n:'Rétro', t:'Righteous', b:'Josefin Sans'}, {n:'Signature', t:'Great Vibes', b:'Montserrat'},
].map(p => ({...p, b:FONTS_M.some(f => f[0] === p.b) ? p.b : (p.b2 || 'Inter')}));
const GRIDS = [
  {n:'2 colonnes', c:[[0, 0, .5, 1], [.5, 0, .5, 1]]}, {n:'2 lignes', c:[[0, 0, 1, .5], [0, .5, 1, .5]]}, {n:'3 colonnes', c:[[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]]},
  {n:'1 + 2', c:[[0, 0, .6, 1], [.6, 0, .4, .5], [.6, .5, .4, .5]]}, {n:'2 × 2', c:[[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]},
  {n:'1 + 3', c:[[0, 0, 1, .6], [0, .6, 1 / 3, .4], [1 / 3, .6, 1 / 3, .4], [2 / 3, .6, 1 / 3, .4]]}, {n:'3 × 2', c:[0, 1, 2, 3, 4, 5].map(i => [(i % 3) / 3, Math.floor(i / 3) / 2, 1 / 3, .5])},
  {n:'Mosaïque', c:[[0, 0, .5, .6], [.5, 0, .5, .4], [.5, .4, .5, .6], [0, .6, .5, .4]]},
];
const FRAMES = ['rect', 'round', 'ellipse', 'arch', 'blob', 'heart', 'star', 'hex', 'diamond', 'burst', 'oct', 'tri'];
const TABLE_STYLES = [{n:'Sombre', o:{hbg:'#16131F', hcol:'#FFFFFF', alt:'#F3F1FA', bc:'#D9D5E6'}}, {n:'Violet', o:{hbg:'#7B2FF7', hcol:'#FFFFFF', alt:'#F1EAFF', bc:'#DCCBFF'}}, {n:'Bleu', o:{hbg:'#0B2A4A', hcol:'#FFFFFF', alt:'#EAF3FB', bc:'#C8DAEA'}},
  {n:'Minimal', o:{hbg:'', hcol:'#16131F', alt:'', bc:'#16131F', bw:1}}, {n:'Vert', o:{hbg:'#1F6F5C', hcol:'#FFFFFF', alt:'#E8F5EF', bc:'#BFE1D2'}}, {n:'Chantier', o:{hbg:'#FFC300', hcol:'#1C1C1C', alt:'#FFF6D6', bc:'#E5D08A'}}];
const TEXT_PRESETS = [
  {n:'Titre', o:{txt:'Ajoutez un titre', fs:.11, fw:800, font:'Bricolage Grotesque'}},
  {n:'Sous-titre', o:{txt:'Ajoutez un sous-titre', fs:.055, fw:600}},
  {n:'Texte courant', o:{txt:'Votre texte ici. Double-cliquez pour le modifier.', fs:.035, fw:400, align:'l', lh:1.4}},
  {n:'Citation', o:{txt:'« Une idée claire se dit en une phrase. »', fs:.06, fw:400, font:'Playfair Display', it:true}},
  {n:'Étiquette', o:{txt:'NOUVEAU', fs:.035, fw:800, col:'#FFFFFF', tbg:'#6D3BFF', tbgPad:.45, ls:.12}},
  {n:'Gros chiffre', o:{txt:'+38 %', fs:.18, fw:900, font:'Unbounded', col:'#6D3BFF'}},
  {n:'Affiche', o:{txt:'SOLDES D\'ÉTÉ', fs:.13, fw:400, font:'Anton', col:'#F2387A', up:true}},
  {n:'Contour', o:{txt:'CONTOUR', fs:.12, fw:900, font:'Unbounded', col:'#FFFFFF', tstroke:'#16131F', tsw:6}},
  {n:'Manuscrit', o:{txt:'Merci beaucoup !', fs:.1, fw:400, font:'Caveat', col:'#3D63FF'}},
  {n:'Néon', o:{txt:'NÉON', fs:.12, fw:800, font:'Space Grotesk', col:'#14C2EC', shadow:{c:'#14C2EC', b:40, x:0, y:0}}},
  {n:'Sous-titre vidéo', o:{txt:'Ici, les paroles de la vidéo', fs:.045, fw:600, col:'#FFFFFF', tbg:'#000000B3', tbgPad:.35, place:'bottom'}},
  {n:'Bandeau nom', o:{txt:'Camille Martin\nDirectrice artistique', fs:.042, fw:700, col:'#FFFFFF', tbg:'#6D3BFF', tbgPad:.4, align:'l', place:'lower'}},
  {n:'Rétro', o:{txt:'RÉTRO', fs:.13, fw:400, font:'Righteous', col:'#FF8A3D', tfx:{k:'splice', c:'#16131F', d:60}}},
  {n:'Néon rose', o:{txt:'Open', fs:.14, fw:400, font:'Pacifico', col:'#FFE3F1', tfx:{k:'neon', c:'#FF3F86', d:70}}},
  {n:'Glitch', o:{txt:'GLITCH', fs:.12, fw:900, font:'Unbounded', col:'#FFFFFF', tfx:{k:'glitch', c:'#14C2EC', d:60}}},
  {n:'Écho', o:{txt:'ÉCHO', fs:.13, fw:400, font:'Anton', col:'#7B2FF7', tfx:{k:'echo', c:'#7B2FF7', d:60}}},
  {n:'Creux', o:{txt:'CREUX', fs:.13, fw:900, font:'Archivo Black', col:'#16131F', tfx:{k:'hollow', d:60}}},
  {n:'Relief', o:{txt:'Relief', fs:.12, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', tfx:{k:'lift', c:'#000000', d:70}}},
  {n:'Dégradé', o:{txt:'Dégradé', fs:.13, fw:900, font:'Poppins', col:'#7B2FF7', col2:'#FF3F86'}},
  {n:'Arc-en-ciel', o:{txt:'Spectra', fs:.13, fw:900, font:'Unbounded', col:'#14C2EC', col2:'#FFC83D', tfx:{k:'shadow', c:'#7B2FF7', d:50}}},
  {n:'Machine à écrire', o:{txt:'Il était une fois…', fs:.06, fw:400, font:'Special Elite', col:'#2B2118'}},
  {n:'Pixel', o:{txt:'GAME OVER', fs:.06, fw:400, font:'Press Start 2P', col:'#45D69A', tfx:{k:'shadow', c:'#16131F', d:80}}},
  {n:'Luxe', o:{txt:'Maison Prism', fs:.08, fw:400, font:'Cinzel', col:'#B8892E', ls:.15, up:true}},
  {n:'Élégant', o:{txt:'Bienvenue', fs:.12, fw:400, font:'Great Vibes', col:'#16131F'}},
  {n:'Marqueur', o:{txt:'À ne pas manquer !', fs:.08, fw:400, font:'Permanent Marker', col:'#F2387A'}},
  {n:'Tableau noir', o:{txt:'Menu du jour', fs:.08, fw:700, font:'Amatic SC', col:'#FFFFFF', tbg:'#2B3A35', tbgPad:.5}},
  {n:'Futuriste', o:{txt:'2077', fs:.15, fw:900, font:'Orbitron', col:'#14C2EC', tfx:{k:'neon', c:'#14C2EC', d:40}}},
  {n:'Éditorial', o:{txt:'Le grand entretien', fs:.09, fw:400, font:'Playfair Display', it:true, col:'#16131F', ul:true}},
  {n:'Badge', o:{txt:'−50 %', fs:.09, fw:900, font:'Unbounded', col:'#FFFFFF', tbg:'#F2387A', tbgPad:.35}},
  {n:'Contour épais', o:{txt:'BOOM', fs:.15, fw:400, font:'Bungee', col:'#FFC83D', tfx:{k:'outline', c:'#16131F', d:70}}},
  {n:'Arc', o:{txt:'• TEXTE EN ARC • TEXTE EN ARC', fs:.045, fw:700, col:'#16131F', curve:70, ls:.08}},
  {n:'Liste à puces', o:{txt:'Premier point\nDeuxième point\nTroisième point', fs:.04, fw:500, align:'l', list:'bullet', lh:1.5}},
  {n:'Coches', o:{txt:'Livraison offerte\nRetour gratuit\nPaiement sécurisé', fs:.04, fw:600, align:'l', list:'check', col:'#13925C', lh:1.5}},
  {n:'Citation moderne', o:{txt:'« Faire simple, c\'est déjà faire beaucoup. »', fs:.055, fw:700, font:'Fraunces', col:'#16131F', lh:1.25}},
  {n:'Chiffre clé', o:{txt:'98 %', fs:.2, fw:900, font:'Bebas Neue', col:'#7B2FF7', col2:'#14C2EC'}},
  {n:'Manuscrit doux', o:{txt:'avec amour', fs:.09, fw:400, font:'Sacramento', col:'#B76E79'}},
];
const ANIM_PRESETS = [
  {n:'Apparition', d:'Fondu à l\'entrée et à la sortie', a:L => { L.tin = {k:'fade', d:.6}; L.tout = {k:'fade', d:.5}; }},
  {n:'Glisser', d:'Arrive par la gauche, repart à droite', a:L => { L.tin = {k:'slideL', d:.7}; L.tout = {k:'slideR', d:.6}; }},
  {n:'Monter', d:'Monte en apparaissant', a:L => { L.tin = {k:'slideU', d:.7}; L.tout = {k:'fade', d:.5}; }},
  {n:'Zoom', d:'Grandit en apparaissant', a:L => { L.tin = {k:'zoom', d:.6}; L.tout = {k:'zoom', d:.5}; }},
  {n:'Rebond', d:'Apparition élastique', a:L => { L.tin = {k:'pop', d:.8}; L.tout = {k:'fade', d:.4}; }},
  {n:'Volet', d:'Se dévoile de gauche à droite', a:L => { L.tin = {k:'wipe', d:.8}; L.tout = {k:'wipe', d:.6}; }},
  {n:'Mise au point', d:'Sort du flou', a:L => { L.tin = {k:'blur', d:.8}; L.tout = {k:'blur', d:.6}; }},
  {n:'Machine à écrire', d:'Les lettres apparaissent une à une (texte)', only:'text', a:L => { L.tin = {k:'type', d:Math.min(L.dur * .7, Math.max(.6, (L.txt || '').length * .05))}; }},
  {n:'Ken Burns', d:'Zoom lent sur toute la durée', a:L => { L.kf.sc = [[0, 1, 'lin'], [round(L.dur, 3), 1.15, 'lin']]; }},
  {n:'Battement', d:'Pulse en continu', a:L => { const k = []; for (let t = 0; t <= L.dur + 1e-6; t += .5) k.push([round(t, 3), (Math.round(t * 2) % 2) ? 1.08 : 1, 'ease']); L.kf.sc = k; }},
  {n:'Flotter', d:'Ondule doucement de haut en bas', a:L => { const k = [], y = L.y; for (let t = 0, i = 0; t <= L.dur + 1e-6; t += 1, i++) k.push([round(t, 3), y + (i % 2 ? -1 : 1) * Math.max(6, L.h * .06), 'ease']); L.kf.y = k; }},
  {n:'Rotation', d:'Un tour complet sur la durée', a:L => { L.kf.rot = [[0, L.rot || 0, 'lin'], [round(L.dur, 3), (L.rot || 0) + 360, 'lin']]; }},
  {n:'Traversée', d:'Traverse l\'écran de gauche à droite', a:(L, P) => { L.kf.x = [[0, -L.w, 'lin'], [round(L.dur, 3), P.w, 'lin']]; }},
  {n:'Tourbillon', d:'Arrive en tournant sur lui-même', a:L => { L.tin = {k:'spin', d:.8}; L.tout = {k:'fade', d:.5}; }},
  {n:'Tomber', d:'Tombe du haut avec un léger rebond', a:L => { L.tin = {k:'drop', d:.9}; L.tout = {k:'slideD', d:.5}; }},
  {n:'Basculer', d:'Pivote comme une carte', a:L => { L.tin = {k:'flip', d:.6}; L.tout = {k:'flip', d:.5}; }},
  {n:'Tourner', d:'Arrive en pivotant d\'un quart de tour', a:L => { L.tin = {k:'rotate', d:.7}; L.tout = {k:'rotate', d:.5}; }},
  {n:'Iris', d:'Se dévoile en cercle', a:L => { L.tin = {k:'iris', d:.8}; L.tout = {k:'iris', d:.6}; }},
  {n:'Lever de rideau', d:'Se dévoile du bas vers le haut', a:L => { L.tin = {k:'wipeU', d:.7}; L.tout = {k:'fade', d:.5}; }},
  {n:'Bloc coloré', d:'Un bloc de couleur balaie et révèle', a:L => { L.tin = {k:'block', d:1, c:'#7B2FF7'}; L.tout = {k:'fade', d:.5}; }},
  {n:'Mot par mot', d:'Les mots apparaissent un à un (texte)', only:'text', a:L => { L.tin = {k:'words', d:Math.min(L.dur * .7, Math.max(.6, ((L.txt || '').match(/\S+/g) || []).length * .25))}; }},
  {n:'Respiration', d:'Grandit et rétrécit lentement', a:L => { const k = []; for (let t = 0, i = 0; t <= L.dur + 1e-6; t += 1.5, i++) k.push([round(t, 3), i % 2 ? 1.05 : 1, 'ease']); L.kf.sc = k; }},
  {n:'Balancier', d:'Oscille de gauche à droite', a:L => { const k = []; const r = L.rot || 0; for (let t = 0, i = 0; t <= L.dur + 1e-6; t += .6, i++) k.push([round(t, 3), r + (i % 2 ? 6 : -6), 'ease']); L.kf.rot = k; }},
  {n:'Clignotement', d:'Apparaît et disparaît en rythme', a:L => { const k = []; for (let t = 0, i = 0; t <= L.dur + 1e-6; t += .5, i++) k.push([round(t, 3), i % 2 ? .15 : 1, 'hold']); L.kf.op = k; }},
  {n:'Lettre par lettre', d:'Chaque lettre apparaît en fondu (texte)', only:'text', a:L => { L.tin = {k:'letters', d:Math.min(L.dur * .7, Math.max(.6, (L.txt || '').length * .045))}; L.tout = {k:'fade', d:.4}; }},
  {n:'Lettres qui montent', d:'Les lettres montent une à une (texte)', only:'text', a:L => { L.tin = {k:'lettersUp', d:Math.min(L.dur * .7, Math.max(.7, (L.txt || '').length * .05))}; L.tout = {k:'fade', d:.4}; }},
  {n:'Secousse', d:'Arrive en vibrant', a:L => { L.tin = {k:'shake', d:.7}; L.tout = {k:'fade', d:.4}; }},
  {n:'Étirement', d:'S\'étire depuis le bas', a:L => { L.tin = {k:'stretch', d:.6}; L.tout = {k:'stretch', d:.5}; }},
  {n:'Pendule', d:'Arrive en se balançant', a:L => { L.tin = {k:'swing', d:1}; L.tout = {k:'fade', d:.4}; }},
  {n:'Zoom flou', d:'Arrive de très près, flou puis net', a:L => { L.tin = {k:'blurZoom', d:.7}; L.tout = {k:'blurZoom', d:.5}; }},
  {n:'Élévation', d:'Monte derrière une ligne invisible', a:L => { L.tin = {k:'rise', d:.7}; L.tout = {k:'rise', d:.5}; }},
  {n:'Grandir', d:'Grandit depuis le centre', a:L => { L.tin = {k:'grow', d:.6}; L.tout = {k:'grow', d:.4}; }},
  {n:'Rebond élastique', d:'Arrive en rebondissant (courbe Rebond)', a:(L, P) => { const y = L.y; L.kf.y = [[0, -L.h - 20, 'bounce'], [round(Math.min(1.2, L.dur * .5), 3), y, 'ease']]; }},
  {n:'Ressort', d:'Grandit et dépasse avant de se poser (courbe Élastique)', a:L => { L.kf.sc = [[0, .2, 'elastic'], [round(Math.min(1.2, L.dur * .5), 3), 1, 'ease']]; }},
  {n:'Entrée en dépassement', d:'Glisse depuis la gauche et dépasse un peu (courbe Dépassement)', a:L => { const x = L.x; L.kf.x = [[0, x - Math.max(200, L.w), 'back'], [round(Math.min(.8, L.dur * .5), 3), x, 'ease']]; L.tin = {k:'fade', d:.3}; }},
  {n:'Zoom avant lent', d:'Rapprochement progressif sur toute la durée', a:L => { L.kf.sc = [[0, 1.12, 'lin'], [round(L.dur, 3), 1, 'lin']]; }},
  {n:'Panoramique', d:'Glisse lentement de droite à gauche', a:L => { const x = L.x; L.kf.x = [[0, x + L.w * .05, 'lin'], [round(L.dur, 3), x - L.w * .05, 'lin']]; L.kf.sc = [[0, 1.12, 'lin'], [round(L.dur, 3), 1.12, 'lin']]; }},
  {n:'Battement de cœur', d:'Double pulsation régulière', a:L => { const k = []; for (let t = 0; t <= L.dur + 1e-6; t += 1){ k.push([round(t, 3), 1, 'out'], [round(t + .12, 3), 1.12, 'in'], [round(t + .26, 3), 1, 'out'], [round(t + .38, 3), 1.08, 'in'], [round(t + .55, 3), 1, 'ease']); } L.kf.sc = k.filter(x => x[0] <= L.dur); }},
  {n:'Aucune animation', d:'Retire effets et images clés', a:L => { L.tin = {k:'none', d:.6}; L.tout = {k:'none', d:.6}; L.kf = {}; }},
];
const PANEL = {
  cur:'', open:true, q:{tpl:'', tplCat:'', ic:'', icCat:'', font:''},
  init(){
    this.rail = $('#smRail'); this.box = $('#smPanel'); this.body = $('#smPanelBody');
    this.rail.addEventListener('click', e => { const b = e.target.closest('[data-pn]'); if (!b) return; if (this.cur === b.dataset.pn && this.open && innerWidth > 900){ this.toggle(false); return; } this.show(b.dataset.pn); });
    $('#smPanelClose').addEventListener('click', () => this.toggle(false));
    this.body.addEventListener('click', e => this.click(e));
    this.body.addEventListener('input', e => this.input(e, false));
    this.body.addEventListener('change', e => this.input(e, true));
    this.body.addEventListener('submit', e => { const f = e.target.closest('[data-stockf]'); if (!f) return; e.preventDefault(); const q = $('#stockQ').value.trim(); if (q) STOCK.search(q, this.q.stock === 'audio' ? 'audio' : 'image'); });
    this.body.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('#aiPal,#aiCustom')){ e.preventDefault(); this.act(e.target.id === 'aiPal' ? 'aiPal' : 'aiCustom'); } });
    this.body.addEventListener('dragstart', e => { const it = e.target.closest('[data-mid]'); if (it) e.dataTransfer.setData('text/x-sm-media', it.dataset.mid); });
    BUS.on('sel', () => { if (['adjust', 'fx', 'trans', 'anim', 'layers', 'audio', 'colors'].includes(this.cur)) this.render(); });
    BUS.on('media', () => { if (this.cur === 'media' || this.cur === 'audio') this.renderSoon(); });
    BUS.on('changed', () => { if (this.cur === 'layers' || this.cur === 'media' || this.cur === 'colors') this.renderSoon(); });
  },
  renderSoon(){ clearTimeout(this.rt); this.rt = setTimeout(() => this.render(), 60); },
  setStudio(s){
    const ids = RAIL[s] || RAIL.design;
    this.rail.innerHTML = ids.map(id => `<button type="button" data-pn="${id}" aria-pressed="false" title="${PANELS[id][0]}">${ico(PANELS[id][1])}<span>${PANELS[id][0]}</span></button>`).join('');
    if (!ids.includes(this.cur)) this.cur = ids[0];
    if (innerWidth <= 900) this.toggle(false); else this.show(this.cur);
  },
  toggle(on){ if (on && innerWidth <= 900 && INSP.open) INSP.toggle(false); this.open = on; this.box.hidden = !on; $('#app').classList.toggle('pn-closed', !on); $$('[data-pn]', this.rail).forEach(b => b.setAttribute('aria-pressed', on && b.dataset.pn === this.cur)); if (!on && ED.tool === 'draw') ED.setTool('select'); requestAnimationFrame(() => { STAGE.auto && STAGE.fit(); TL.render(); }); },
  show(id){ if (this.cur === 'draw' && id !== 'draw' && ED.tool === 'draw') ED.setTool('select'); this.cur = id; this.toggle(true); this.render(); },
  render(){
    if (!this.open) return; const id = this.cur, P = ED.P; $('#smPanelTitle').textContent = PANELS[id]?.[0] || '';
    $$('[data-pn]', this.rail).forEach(b => b.setAttribute('aria-pressed', b.dataset.pn === id));
    const keep = this.body.scrollTop, fn = this['p_' + id]; this.body.innerHTML = fn ? fn.call(this, P) : ''; this.body.scrollTop = keep;
    $$('canvas[data-fxprev],canvas[data-pfxprev]', this.body).forEach(cv => this.fxPreview(cv));
    this.lazyThumbs();
  },
  /* vignettes des modèles calculées petit à petit (l'interface reste fluide) */
  lazyThumbs(){
    const imgs = $$('img[data-tth]', this.body).filter(i => !i.src); if (!imgs.length) return; const id = ++this.lz;
    const step = () => { if (id !== this.lz) return; const t0 = performance.now(); while (imgs.length && performance.now() - t0 < 24){ const im = imgs.shift(), t = SM_TPL.find(x => x.id === im.dataset.tth); if (t) im.src = tplThumb(t) || ''; } if (imgs.length) (window.requestIdleCallback || setTimeout)(step); };
    step();
  },
  lz:0,
  /* --- Modèles et formats --- */
  tplList(){
    const q = this.q.tpl.trim().toLowerCase(), cat = this.q.tplCat;
    const tpls = SM_TPL.filter(t => (!t.studio || t.studio === ED.studio || ED.studio === 'design' || (ED.studio === 'photo' && !TIMED(t.studio))) && (!cat || t.cat === cat) && (!q || (t.name + ' ' + t.cat + ' ' + (t.desc || '') + ' ' + (t.tags || '')).toLowerCase().includes(q)));
    return tpls.length ? tpls.map(t => `<button type="button" class="pn-tpl" data-tpl="${t.id}" title="${escH(t.desc || '')}"><img alt="" data-tth="${t.id}"${TPL_THUMBS[t.id] ? ` src="${TPL_THUMBS[t.id]}"` : ''} style="aspect-ratio:${tplRatio(t)}"><b>${escH(t.name)}</b><small>${escH(t.cat)}${t.pages ? ` · ${t.pages} pages` : ''}</small></button>`).join('')
      : `<div class="pn-empty">${ico('search')}<span>Aucun modèle pour « ${escH(this.q.tpl)} ».</span></div>`;
  },
  p_tpl(P){
    const cats = [...new Set(SM_TPL.map(t => t.cat))];
    return `<label class="pn-search">${ico('search')}<input type="search" data-tplq placeholder="Rechercher un modèle (${SM_TPL.length})" value="${escH(this.q.tpl)}" aria-label="Rechercher un modèle"></label>
      <div class="pn-chips">${['', ...cats].map(c => `<button type="button" data-tplcat="${escH(c)}" aria-pressed="${this.q.tplCat === c}">${escH(c || 'Tous')}</button>`).join('')}</div>
      <p class="pn-hint">Un modèle remplace le contenu du projet (Ctrl + Z pour revenir).</p>
      <div class="pn-tpls" id="pnTplList">${this.tplList()}</div>
      <h4 class="pn-h">Format</h4>
      ${FORMAT_CATS.map(c => `<details class="pn-fcat"${c === 'Réseaux sociaux' ? ' open' : ''}><summary>${escH(c)}</summary><div class="pn-fmts">${FORMATS.filter(f => f.cat === c).map(f => `<button type="button" class="pn-fmt${P.w === f.w && P.h === f.h ? ' on' : ''}" data-fmt="${f.id}"><i style="aspect-ratio:${f.w}/${f.h}"></i><span><b>${escH(f.name)}</b><small>${escH(f.sub)}</small></span></button>`).join('')}</div></details>`).join('')}
      <div class="pn-custom"><label>L<input type="number" id="pnCw" min="16" max="7680" value="${P.w}"></label><span>×</span><label>H<input type="number" id="pnCh" min="16" max="7680" value="${P.h}"></label><button type="button" class="pn-btn" data-act="customFmt">Appliquer</button></div>`;
  },
  p_text(P){
    const br = ED.brand();
    return `<button type="button" class="pn-big" data-act="addText">${ico('plus')} Ajouter une zone de texte</button>
      ${br.fonts?.title ? `<div class="pn-row"><button type="button" class="pn-btn" data-act="brandTitle" style="font-family:${fontCss(br.fonts.title)}">Titre de ma charte</button><button type="button" class="pn-btn" data-act="brandBody" style="font-family:${fontCss(br.fonts.body || 'Inter')}">Texte de ma charte</button></div>` : ''}
      <div class="pn-texts">${TEXT_PRESETS.map((t, i) => { const o = t.o, st = `font-family:${fontCss(o.font || 'Inter')};font-weight:${o.fw || 700};${o.it ? 'font-style:italic;' : ''}color:${o.tbg ? o.col : (o.col && o.col !== '#FFFFFF' ? o.col : 'var(--ink)')};${o.tbg ? `background:${o.tbg};padding:2px 8px;border-radius:4px;` : ''}${o.tstroke ? `-webkit-text-stroke:1.5px ${o.tstroke};color:transparent;` : ''}${o.shadow ? `text-shadow:0 0 12px ${o.shadow.c};` : ''}${o.up ? 'text-transform:uppercase;' : ''}${o.ls ? `letter-spacing:${o.ls}em;` : ''}`;
        return `<button type="button" class="pn-txt" data-txt="${i}"><span style="${st}">${escH(t.n === 'Texte courant' ? 'Texte courant' : o.txt.split('\n')[0])}</span><small>${escH(t.n)}</small></button>`; }).join('')}</div>
      <h4 class="pn-h">Associations de polices</h4>
      <div class="pn-pairs">${FONT_PAIRS.map((f, i) => `<button type="button" class="pn-pair" data-pair="${i}"><b style="font-family:${fontCss(f.t)}">${escH(f.n)}</b><span style="font-family:${fontCss(f.b)}">${escH(f.t)} · ${escH(f.b)}</span></button>`).join('')}</div>
      <p class="pn-hint">${FONTS_M.length} polices. Effets (ombre, néon, écho, texte en arc…), dégradé et listes : dans les propriétés du texte, à droite.</p>`;
  },
  /* --- Éléments --- */
  icList(){
    const q = this.q.ic.trim().toLowerCase(), cat = this.q.icCat;
    const ls = ICON_SET.filter(x => (!cat || x[2] === cat) && (!q || (x[1] + ' ' + x[2]).toLowerCase().includes(q)));
    return ls.length ? ls.map(x => `<button type="button" data-icon="${x[0]}" title="${escH(x[1])}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${x[3]}"/></svg></button>`).join('') : `<span class="pn-hint">Aucune icône pour « ${escH(this.q.ic)} ».</span>`;
  },
  p_shapes(P){
    const ks = ['rect', 'round', 'ellipse', 'tri', 'diamond', 'pent', 'hex', 'oct', 'star', 'star4', 'burst', 'heart', 'arrow', 'arrow2', 'chevron', 'cross', 'para', 'trap', 'arch', 'blob', 'cloud', 'moon', 'bubble', 'ring', 'prism'];
    const lines = [['line', 'none', 'Ligne'], ['line', 'dash', 'Ligne en tirets'], ['line', 'dot', 'Ligne pointillée'], ['larrow', 'none', 'Flèche'], ['ldarrow', 'none', 'Double flèche'], ['larrow', 'dash', 'Flèche en tirets']];
    return `<details class="pn-sec" open><summary>Formes</summary><div class="pn-shapes">${ks.map(k => `<button type="button" data-shape="${k}" title="${SHAPE_NAMES[k]}">${shapeSvg(k)}</button>`).join('')}</div>
        <div class="pn-sw">${SWATCHES.map(c => `<button type="button" data-shapecol="${c}" style="background:${c}" class="${ED.shapeCol === c ? 'on' : ''}" aria-label="Couleur ${c}"></button>`).join('')}</div></details>
      <details class="pn-sec" open><summary>Lignes et flèches</summary><div class="pn-lines">${lines.map(([k, d, n]) => `<button type="button" data-line="${k}" data-dash="${d}" title="${n}"><svg viewBox="0 0 48 12" aria-hidden="true"><path d="M3 6h${k === 'line' ? 42 : 36}" stroke-dasharray="${d === 'dash' ? '7 5' : d === 'dot' ? '.1 5' : 'none'}" stroke-linecap="round"/>${k !== 'line' ? '<path d="M37 1.5 45 6l-8 4.5z" class="f"/>' : ''}${k === 'ldarrow' ? '<path d="M11 1.5 3 6l8 4.5z" class="f"/>' : ''}</svg></button>`).join('')}</div></details>
      <details class="pn-sec" open><summary>Cadres photo</summary><div class="pn-shapes frames">${FRAMES.map(k => `<button type="button" data-frame="${k}" title="Cadre ${escH((SHAPE_NAMES[k] || k).toLowerCase())}">${shapeSvg(k)}</button>`).join('')}</div>
        <p class="pn-hint">Glissez ensuite une image dans le cadre (depuis Médias ou depuis l'ordinateur) : elle s'y ajuste.</p></details>
      <details class="pn-sec"><summary>Grilles photo</summary><div class="pn-grids">${GRIDS.map((g, i) => `<button type="button" data-grid="${i}" title="${escH(g.n)}"><svg viewBox="0 0 40 30" aria-hidden="true">${g.c.map(([x, y, w, h]) => `<rect x="${x * 40 + 1}" y="${y * 30 + 1}" width="${w * 40 - 2}" height="${h * 30 - 2}" rx="1"/>`).join('')}</svg><span>${escH(g.n)}</span></button>`).join('')}</div></details>
      <details class="pn-sec"><summary>Graphiques</summary><div class="pn-charts">${Object.entries(CHART_KINDS).map(([k, n]) => `<button type="button" data-chart="${k}">${chartSvg(k)}<span>${n}</span></button>`).join('')}</div><p class="pn-hint">Les données se modifient dans les propriétés, à droite.</p></details>
      <details class="pn-sec"><summary>QR code</summary><button type="button" class="pn-big alt" data-act="qr">${ico('grid')} Créer un QR code</button><p class="pn-hint">Lien, texte, numéro de téléphone… Le QR code est calculé ici, sans service externe, et reste net à toutes les tailles.</p></details>
      <details class="pn-sec" open><summary>Icônes (${ICON_SET.length})</summary>
        <label class="pn-search">${ico('search')}<input type="search" data-icq placeholder="Rechercher une icône" value="${escH(this.q.ic)}" aria-label="Rechercher une icône"></label>
        <div class="pn-chips">${['', ...ICON_CATS].map(c => `<button type="button" data-iccat="${escH(c)}" aria-pressed="${this.q.icCat === c}">${escH(c || 'Toutes')}</button>`).join('')}</div>
        <div class="pn-icons" id="pnIcList">${this.icList()}</div></details>
      <details class="pn-sec" open><summary>Autocollants (${STICKER_SET.length})</summary>
        <div class="pn-chips">${['', ...STICKER_CATS].map(c => `<button type="button" data-stkcat="${escH(c)}" aria-pressed="${(this.q.stk || '') === c}">${escH(c || 'Tous')}</button>`).join('')}</div>
        <div class="pn-stk">${STICKER_SET.filter(x => !this.q.stk || x[2] === this.q.stk).map(x => `<button type="button" data-icon="${x[0]}" title="${escH(x[1])}"><svg viewBox="-4 -4 108 108" aria-hidden="true"><path d="${x[3]}"/></svg></button>`).join('')}</div></details>
      <details class="pn-sec"><summary>Tableaux</summary><div class="pn-tables">${TABLE_STYLES.map((t, i) => `<button type="button" data-table="${i}" title="Tableau ${escH(t.n)}"><i style="background:${t.o.hbg || 'transparent'};border-color:${t.o.bc}"></i><i style="background:${t.o.alt || 'transparent'};border-color:${t.o.bc}"></i><i style="border-color:${t.o.bc}"></i><span>${escH(t.n)}</span></button>`).join('')}</div>
        <p class="pn-hint">Le contenu se saisit dans les propriétés (une ligne par rangée, « ; » entre les colonnes) ou se colle depuis un tableur.</p></details>
      <details class="pn-sec"><summary>Maquettes d'appareils</summary><div class="pn-mocks">${Object.entries(MOCKS).map(([k, n]) => `<button type="button" data-mock="${k}">${mockSvg(k)}<span>${escH(n)}</span></button>`).join('')}</div>
        <p class="pn-hint">Glissez ensuite une capture ou une photo sur l'écran de l'appareil.</p></details>
      <details class="pn-sec"><summary>Émojis</summary><div class="pn-emoji">${EMOJIS.map(e => `<button type="button" data-emoji="${e}">${e}</button>`).join('')}</div></details>`;
  },
  p_draw(P){
    const pen = ED.pen, on = ED.tool === 'draw';
    return `<button type="button" class="pn-big${on ? ' on' : ''}" data-act="drawTool" aria-pressed="${on}">${ico('pen')} ${on ? 'Arrêter de dessiner' : 'Dessiner sur la scène'}</button>
      <p class="pn-hint">${on ? 'Tracez à la souris, au stylet ou au doigt. Chaque trait devient un calque que vous pouvez déplacer, recolorer ou animer. Échap pour arrêter.' : 'Choisissez le crayon, puis tracez directement sur la composition.'}</p>
      <h4 class="pn-h">Crayon</h4><div class="pn-row">${[['pen', 'Stylo', false], ['marker', 'Marqueur', false], ['hl', 'Surligneur', true]].map(([k, n, hl]) => `<button type="button" class="pn-btn" data-pen="${k}" aria-pressed="${pen.kind === k}">${n}</button>`).join('')}</div>
      ${field('Épaisseur', '@pen.sw', pen.sw, {type:'range', min:1, max:120, step:1, fmt:v => Math.round(v) + ' px'})}
      <h4 class="pn-h">Couleur</h4><div class="pn-sw">${[...new Set([...(ED.brand().colors || []), ...SWATCHES])].slice(0, 20).map(c => `<button type="button" data-pencol="${c}" style="background:${c}" class="${pen.col === c ? 'on' : ''}" aria-label="Couleur ${c}"></button>`).join('')}<label class="pn-sw-c" title="Autre couleur"><input type="color" data-pencolc value="${pen.col.slice(0, 7)}"></label></div>`;
  },
  /* --- Couleurs, charte, palettes --- */
  p_colors(P){
    const L = ED.sel1(), doc = docColors(P).slice(0, 16), br = ED.brand(), tgt = ED.colorTarget();
    const sw = (c, attr = 'data-col') => `<button type="button" ${attr}="${c}" style="background:${c}" title="${c}" aria-label="Couleur ${c}"></button>`;
    return `<p class="pn-hint">${tgt ? `Un clic applique la couleur à <b>${escH(tgt)}</b>.` : 'Sans sélection, un clic change la couleur du fond.'}</p>
      ${window.EyeDropper ? `<button type="button" class="pn-big alt" data-act="eyedrop">${ico('drop')} Pipette : prendre une couleur à l'écran</button>` : ''}
      <h4 class="pn-h">Couleurs du document</h4><div class="pn-sw">${doc.map(c => sw(c)).join('') || '<span class="pn-hint">Aucune couleur pour l\'instant.</span>'}<label class="pn-sw-c" title="Autre couleur"><input type="color" data-colc value="#7B2FF7"></label></div>
      <h4 class="pn-h">Ma charte graphique</h4>
      <div class="pn-sw brand">${(br.colors || []).map(c => `<span class="bc">${sw(c)}<button type="button" class="bx" data-brdel="${c}" title="Retirer de la charte" aria-label="Retirer ${c}">×</button></span>`).join('')}<label class="pn-sw-c" title="Ajouter une couleur à la charte"><input type="color" data-bradd value="#FF3F86">+</label></div>
      <div class="fd2">${field('Police des titres', '@brand.title', br.fonts?.title || '', {type:'select', opts:{'':'—', ...Object.fromEntries(FONTS_M.map(f => [f[0], f[0]]))}})}${field('Police des textes', '@brand.body', br.fonts?.body || '', {type:'select', opts:{'':'—', ...Object.fromEntries(FONTS_M.map(f => [f[0], f[0]]))}})}</div>
      <div class="pn-row">${doc.length ? `<button type="button" class="pn-btn" data-act="brandFromDoc">Reprendre les couleurs du document</button>` : ''}${(br.colors || []).length > 1 ? `<button type="button" class="pn-btn" data-act="brandApply">Appliquer ma charte</button>` : ''}</div>
      <p class="pn-hint">${window.SWLib ? 'Votre charte est enregistrée avec votre compte : elle vous suit sur tous vos projets et appareils.' : 'Charte gardée dans ce navigateur.'}</p>
      <h4 class="pn-h">Palettes · Styles</h4><p class="pn-hint">« Appliquer » remplace les couleurs du design par celles de la palette.</p>
      <div class="pn-pals">${PALETTES.map(([n, cs], i) => `<div class="pn-pal"><div class="pl-c">${cs.map(c => sw(c)).join('')}</div><span>${escH(n)}</span><button type="button" class="pn-btn sm" data-palapply="${i}">Appliquer</button></div>`).join('')}</div>`;
  },
  p_bg(P){
    return `<h4 class="pn-h">Couleur de fond</h4><div class="pn-sw">${[...new Set([...(ED.brand().colors || []), ...SWATCHES])].slice(0, 24).map(c => `<button type="button" data-bg="${c}" style="background:${c}" class="${P.bg === c ? 'on' : ''}" aria-label="${c}"></button>`).join('')}
      <label class="pn-sw-c" title="Autre couleur"><input type="color" data-bgc value="${hexOk(P.bg) ? P.bg.slice(0, 7) : '#ffffff'}"></label></div>
      <label class="pn-chk"><input type="checkbox" data-bgnone${P.bg ? '' : ' checked'}> Fond transparent (export PNG)</label>
      <h4 class="pn-h">Dégradés</h4><div class="pn-grads">${[...GRADS, ...PALETTES.slice(0, 8).map(p => [p[1][0], p[1][2]])].map(([a, b], i) => `<button type="button" data-grad="${i}" style="background:linear-gradient(135deg,${a},${b})" aria-label="Dégradé ${i + 1}"></button>`).join('')}</div>
      <h4 class="pn-h">Motifs</h4><div class="pn-row">${[['dots', 'Pois'], ['lines', 'Rayures'], ['grid', 'Quadrillage'], ['waves', 'Vagues']].map(([k, n]) => `<button type="button" class="pn-btn" data-pattern="${k}">${n}</button>`).join('')}</div>
      <p class="pn-hint">Dégradés et motifs s'ajoutent comme calques de fond, que vous pouvez recolorer, animer ou couper dans la timeline.</p>`;
  },
  /* --- Assistant IA --- */
  p_ai(P){
    const L = ED.sel1(), ok = AI.ok(), busy = AI.busy, dis = !ok || busy ? ' disabled' : '', ex = ['Affiche pour une journée portes ouvertes dans une entreprise de BTP', 'Post Instagram pour lancer un café en centre-ville', 'Présentation de 5 diapositives : bilan des chantiers 2026', 'Invitation à un anniversaire de 30 ans, ambiance tropicale'];
    return `${ok ? `<p class="pn-hint">${window.SMAI.left()} demande${window.SMAI.left() > 1 ? 's' : ''} restante${window.SMAI.left() > 1 ? 's' : ''} aujourd'hui.</p>` : `<div class="pn-warn">${escH(AI.why())}</div>`}
      <h4 class="pn-h">${ico('magic')} Design magique</h4>
      <textarea class="pn-ta" id="aiPrompt" rows="3" placeholder="Décrivez le visuel : sujet, public, ambiance, textes à mettre…"${dis}></textarea>
      <div class="pn-chips wrap">${ex.map(x => `<button type="button" data-aiex="${escH(x)}">${escH(x.split(' ').slice(0, 4).join(' '))}…</button>`).join('')}</div>
      ${TIMED(ED.studio) ? '' : `<div class="fd2"><label class="fd sel"><span>Pages</span><select id="aiPages">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option>${n}</option>`).join('')}</select></label><label class="pn-chk"><input type="checkbox" id="aiPhotos" checked> Photos libres</label></div>`}
      <button type="button" class="pn-big" data-act="aiDesign"${dis}>${ico('magic')} Créer le design</button>
      <p class="pn-hint">Au format actuel (${P.w} × ${P.h}). Le design remplace la page (Ctrl + Z pour revenir) ; les photos viennent de Wikimedia Commons, avec leurs crédits.</p>
      <h4 class="pn-h">${ico('text')} Rédaction</h4>
      ${L?.t === 'text' ? `<div class="pn-acts">${AI_TEXT_ACTS.map(([k, n]) => `<button type="button" class="pn-btn" data-aitxt="${k}"${dis}>${n}</button>`).join('')}</div>
        <div class="pn-row"><select id="aiLangT" class="pn-sel">${Object.entries(AI_LANGS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><button type="button" class="pn-btn" data-act="aiTr1"${dis}>Traduire</button></div>
        <div class="pn-row"><input class="pn-in" id="aiCustom" placeholder="Autre consigne (ex. : plus court, en vers…)"><button type="button" class="pn-btn" data-act="aiCustom"${dis}>OK</button></div>`
        : `<textarea class="pn-ta" id="aiWrite" rows="2" placeholder="Sujet du texte à écrire (ex. : promo de printemps pour un fleuriste)"${dis}></textarea><button type="button" class="pn-big alt" data-act="aiWrite"${dis}>Écrire un titre et un texte</button><p class="pn-hint">Sélectionnez un texte pour le corriger, le reformuler, le traduire…</p>`}
      <h4 class="pn-h">${ico('globe')} Traduire tout le design</h4>
      <div class="pn-row"><select id="aiLang" class="pn-sel">${Object.entries(AI_LANGS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><button type="button" class="pn-btn" data-act="aiTranslate"${dis}>Traduire les ${pageCount(P) > 1 ? pageCount(P) + ' pages' : 'textes'}</button></div>
      <h4 class="pn-h">${ico('palette')} Ambiance de couleurs</h4>
      <div class="pn-row"><input class="pn-in" id="aiPal" placeholder="ex. : printemps japonais, océan la nuit…"><button type="button" class="pn-btn" data-act="aiPal"${dis}>Appliquer</button></div>
      <h4 class="pn-h">${ico('video')} Sous-titres automatiques</h4>
      <button type="button" class="pn-big alt" data-act="aiCaptions"${dis || (L && (L.t === 'audio' || L.t === 'video') ? '' : ' disabled')}>Sous-titrer le clip sélectionné</button>
      <p class="pn-hint">Le son du clip est transcrit par l'IA puis découpé en sous-titres synchronisés, sur une nouvelle piste.</p>
      <h4 class="pn-h">${ico('photo')} Retouche par IA (dans votre navigateur)</h4>
      <div class="pn-row"><button type="button" class="pn-btn" data-seg="cut:auto"${L?.t === 'image' ? '' : ' disabled'}>Détourer le sujet</button><button type="button" class="pn-btn" data-seg="cut:person"${L?.t === 'image' ? '' : ' disabled'}>Détourer une personne</button><button type="button" class="pn-btn" data-seg="blur:auto"${L?.t === 'image' ? '' : ' disabled'}>Flouter le fond</button></div>
      <p class="pn-hint">Aucune image n'est envoyée : le modèle d'IA (MediaPipe) tourne sur votre appareil. Fonctionne aussi sans compte.</p>`;
  },
  /* --- Photos et sons libres (Wikimedia Commons) + sons générés --- */
  p_stock(P){
    const tab = this.q.stock || (ED.studio === 'audio' ? 'gen' : 'image');
    const tabs = `<div class="pn-tabs">${[['image', 'Photos'], ['audio', 'Sons'], ['gen', 'Effets et musiques']].map(([k, n]) => `<button type="button" data-stab="${k}" aria-pressed="${tab === k}">${n}</button>`).join('')}</div>`;
    if (tab === 'gen') return tabs + `<p class="pn-hint">Créés par votre navigateur : libres de tout droit, à utiliser partout.</p>${['Effets', 'Musiques'].map(c => `<h4 class="pn-h">${c}</h4><div class="pn-sounds">${SOUNDS.filter(x => x[2] === c).map(([k, n, , d]) => `<div class="pn-snd"><button type="button" data-sprev="${k}" title="Écouter">${ico('play')}</button><b>${escH(n)}</b><small>${fmtT(d)}</small><button type="button" data-sadd="${k}" title="Ajouter au projet">${ico('plus')}</button></div>`).join('')}</div>`).join('')}`;
    const r = STOCK.kind === tab ? STOCK.res : [];
    return tabs + `<form class="pn-search" data-stockf>${ico('search')}<input type="search" id="stockQ" placeholder="${tab === 'audio' ? 'Pluie, oiseaux, piano…' : 'Chantier, montagne, café… (anglais conseillé)'}" value="${escH(STOCK.kind === tab ? STOCK.q : '')}" aria-label="Rechercher"></form>
      <p class="pn-hint">Wikimedia Commons : plus de 100 millions de fichiers sous licence libre. L'auteur et la licence sont gardés avec chaque média (Fichier → Crédits).</p>
      ${STOCK.err ? `<div class="pn-warn">${escH(STOCK.err)}</div>` : ''}
      ${tab === 'image' ? `<div class="pn-stock">${r.map((it, i) => `<button type="button" class="st-it" data-stake="${i}" title="${escH(it.title)} · ${escH(it.by)} · ${escH(it.lic)}"><img alt="" loading="lazy" src="${escH(it.thumb)}"><span>${escH(it.lic)}</span></button>`).join('')}</div>`
        : `<div class="pn-sounds">${r.map((it, i) => `<div class="pn-snd"><button type="button" data-aprev="${i}" title="Écouter">${ico('play')}</button><b title="${escH(it.title)}">${escH(it.title.replace(/\.[a-z0-9]+$/i, ''))}</b><small>${escH(it.lic)}</small><button type="button" data-stake="${i}" title="Ajouter">${ico('plus')}</button></div>`).join('')}</div>`}
      ${STOCK.busy ? `<p class="pn-hint">Recherche…</p>` : STOCK.kind === tab && STOCK.q && !r.length && !STOCK.err ? '<p class="pn-hint">Aucun résultat : essayez d\'autres mots (en anglais, souvent plus de résultats).</p>' : ''}
      ${STOCK.cont && r.length ? '<button type="button" class="pn-big alt" data-act="stockMore">Plus de résultats</button>' : ''}`;
  },
  /* --- Commentaires --- */
  p_comments(P){
    const cs = COMMENTS.list(P), other = (P.comments || []).length - cs.length, dt = ts => new Date(ts).toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
    setTimeout(() => COMMENTS.pins(), 0);
    return `<button type="button" class="pn-big${COMMENTS.placing ? ' on' : ''}" data-act="cPlace">${ico('comment')} ${COMMENTS.placing ? 'Cliquez sur la page…' : 'Ajouter un commentaire'}</button>
      <p class="pn-hint">Les commentaires sont enregistrés avec le projet : les personnes avec qui vous le partagez les voient et peuvent répondre.${other ? ` ${other} autre${other > 1 ? 's' : ''} sur d'autres pages.` : ''}</p>
      ${cs.length ? cs.map((c, i) => `<div class="pn-cm${c.done ? ' done' : ''}"><div class="cm-h"><b>${c.done ? '✓' : i + 1}</b><span>${escH(c.by)}</span><small>${dt(c.ts)}</small></div><p>${escH(c.t)}</p>
        ${c.re.map(r => `<div class="cm-r"><span>${escH(r.by)}</span> ${escH(r.t)}</div>`).join('')}
        <div class="cm-a"><input class="pn-in" data-crep="${c.id}" placeholder="Répondre…"><button type="button" class="pn-btn sm" data-cdone="${c.id}">${c.done ? 'Rouvrir' : 'Résolu'}</button><button type="button" class="pn-btn sm" data-cdel="${c.id}" title="Supprimer">${ico('trash')}</button></div></div>`).join('')
      : `<div class="pn-empty">${ico('comment')}<b>Aucun commentaire sur cette page</b><span>Ajoutez une remarque à un endroit précis du design.</span></div>`}`;
  },
  /* --- Médias du projet --- */
  p_media(P, only){
    const list = Object.values(P.media).filter(m => !only || m.kind === only);
    const cloud = window.SMCloudMedia?.state?.() || 'local';
    const st = m => m.uploading ? `<em class="mst up" title="Envoi dans le cloud…">↑</em>` : m.cloud ? `<em class="mst cl" title="Dans le cloud Studio Prism">☁</em>` : MEDIA.missing(m) ? `<em class="mst miss" title="Fichier absent de cet appareil">!</em>` : `<em class="mst dv" title="Sur cet appareil${m.cloudSkip === 'quota' ? ' (espace cloud plein)' : cloud === 'off' ? ' (stockage cloud des médias non activé)' : ''}">●</em>`;
    return `<button type="button" class="pn-big" data-act="import" data-kind="${only || ''}">${ico('plus')} Importer ${only === 'audio' ? 'des sons' : 'des médias'}</button>
      <p class="pn-hint">${only === 'audio' ? 'MP3, WAV, OGG, M4A…' : 'Images, vidéos (MP4, WebM) et sons'}. Vous pouvez aussi glisser des fichiers sur la scène${only ? '' : ', ou dans un cadre photo'}.</p>
      ${only === 'audio' ? `<button type="button" class="pn-big alt" data-act="record">${ico('audio')} Enregistrer une voix off</button>` : ''}
      ${list.length ? `<div class="pn-media">${list.map(m => `<div class="pn-m${MEDIA.missing(m) ? ' miss' : ''}" data-mid="${m.id}" draggable="true" tabindex="0" title="${escH(m.name)}${m.dur ? ' · ' + fmtT(m.dur) : ''}${m.w ? ` · ${m.w} × ${m.h}` : ''} · ${fmtBytes(m.size)}">
          <div class="pm-th">${m.thumb ? `<img alt="" src="${m.thumb}">` : ico(m.kind === 'audio' ? 'audio' : m.kind === 'video' ? 'video' : 'media')}${m.dur ? `<span class="pm-d">${fmtT(m.dur, false)}</span>` : ''}${st(m)}</div>
          <b>${escH(m.name)}</b><div class="pm-a"><button type="button" data-madd="${m.id}" title="Ajouter au projet">${ico('plus')}</button><button type="button" data-mmenu="${m.id}" title="Plus d'actions">${ico('more')}</button></div></div>`).join('')}</div>`
        : `<div class="pn-empty">${ico(only === 'audio' ? 'audio' : 'media')}<b>${only === 'audio' ? 'Aucun son pour l\'instant' : 'Aucun média pour l\'instant'}</b><span>Importez des fichiers : ils restent sur cet appareil et partent dans le cloud quand il est disponible.</span></div>`}`;
  },
  p_audio(P){
    const L = ED.sel1(), a = L && (L.t === 'audio' || L.t === 'video') ? L : null;
    return (a ? `<div class="pn-card"><b>${escH(a.name || 'Clip')}</b>
        ${field('Volume', 'vol', a.vol ?? 1, {type:'range', min:0, max:2, step:.01, fmt:v => Math.round(v * 100) + ' %'})}
        ${field('Fondu d\'entrée', 'fadeIn', a.fadeIn || 0, {type:'range', min:0, max:Math.min(10, a.dur / 2), step:.05, fmt:v => round(v, 2) + ' s'})}
        ${field('Fondu de sortie', 'fadeOut', a.fadeOut || 0, {type:'range', min:0, max:Math.min(10, a.dur / 2), step:.05, fmt:v => round(v, 2) + ' s'})}
        ${field('Graves', 'eqLo', a.eqLo || 0, {type:'range', min:-15, max:15, step:1, fmt:v => (v > 0 ? '+' : '') + Math.round(v) + ' dB'})}
        ${field('Aigus', 'eqHi', a.eqHi || 0, {type:'range', min:-15, max:15, step:1, fmt:v => (v > 0 ? '+' : '') + Math.round(v) + ' dB'})}
        ${field('Panoramique', 'pan', a.pan || 0, {type:'range', min:-1, max:1, step:.05, fmt:v => Math.abs(v) < .01 ? 'centre' : (v < 0 ? 'gauche ' : 'droite ') + Math.round(Math.abs(v) * 100) + ' %'})}
        <div class="pn-row"><button type="button" class="pn-btn" data-eq="voice">Voix plus claire</button><button type="button" class="pn-btn" data-eq="warm">Plus chaud</button><button type="button" class="pn-btn" data-eq="radio">Radio</button><button type="button" class="pn-btn" data-eq="flat">À plat</button></div>
        <label class="pn-chk"><input type="checkbox" data-p="mute"${a.mute ? ' checked' : ''}> Couper le son</label></div>` : '')
      + `<button type="button" class="pn-big alt" data-act="gotoSounds">${ico('wave')} Effets sonores et musiques libres</button>` + this.p_media(P, 'audio');
  },
  /* --- Retouche --- */
  p_adjust(P){
    const L = ED.sel1(); if (!L || !(L.t === 'image' || L.t === 'video')) return noSel('Sélectionnez une image ou une vidéo pour la retoucher.');
    const k = L.bgk;
    return `<div class="pn-adj">${Object.entries(ADJ_KEYS).map(([k, [n, mn, mx]]) => field(n, 'adj.' + k, L.adj?.[k] || 0, {type:'range', min:mn, max:mx, step:1, fmt:v => (v > 0 && mn < 0 ? '+' : '') + Math.round(v), reset:true})).join('')}</div>
      <button type="button" class="pn-big alt" data-act="resetAdj">Réinitialiser les réglages</button>
      <h4 class="pn-h">Effets photo</h4><div class="pn-pfx">${Object.entries(PFX).map(([k, n]) => `<button type="button" data-pfx="${k}" aria-pressed="${(L.pfx?.k || 'none') === k}"><canvas data-pfxprev="${k}" width="96" height="64"></canvas><span>${n}</span></button>`).join('')}</div>
      ${L.pfx ? field('Intensité', 'pfx.v', L.pfx.v, {type:'range', min:0, max:100, step:1, fmt:v => Math.round(v)}) : ''}
      <div class="pn-row"><button type="button" class="pn-btn" data-act="adjAll">Appliquer ces réglages à toutes les images</button></div>
      <div class="pn-row"><button type="button" class="pn-btn" data-act="enhance">${ico('magic')} Amélioration automatique</button></div>
      <h4 class="pn-h">Détourage par IA</h4>
      ${L.t === 'image' ? `<div class="pn-row"><button type="button" class="pn-btn" data-seg="cut:auto">Détourer le sujet</button><button type="button" class="pn-btn" data-seg="cut:person">Détourer une personne</button><button type="button" class="pn-btn" data-seg="blur:auto">Flouter le fond</button></div>
        <p class="pn-hint">L'IA tourne dans votre navigateur (modèle MediaPipe téléchargé une fois). Le résultat est une copie : l'original reste dans vos médias.</p>` : '<p class="pn-hint">Disponible pour les images.</p>'}
      <h4 class="pn-h">Contour (autocollant)</h4>
      ${L.oln ? `<div class="fd2">${field('Couleur', '@oln.c', L.oln.c, {type:'color'})}${field('Épaisseur', '@oln.w', L.oln.w, {type:'range', min:1, max:60, step:1, fmt:v => Math.round(v) + ' px'})}</div><button type="button" class="pn-btn" data-act="olnOff">Retirer le contour</button>` : '<button type="button" class="pn-btn" data-act="olnOn">Ajouter un contour blanc</button><p class="pn-hint">Idéal après un détourage : effet autocollant.</p>'}
      <h4 class="pn-h">Retirer le fond</h4>
      ${k ? `<div class="pn-card">${field('Couleur retirée', '@bgk.c', k.c, {type:'color'})}${field('Tolérance', '@bgk.tol', k.tol, {type:'range', min:1, max:100, step:1, fmt:v => Math.round(v)})}${field('Adoucir le bord', '@bgk.soft', k.soft, {type:'range', min:0, max:50, step:1, fmt:v => Math.round(v)})}
        <button type="button" class="pn-btn" data-act="bgkOff">Remettre le fond</button></div>` : `<button type="button" class="pn-big alt" data-act="bgkAuto">${ico('magic')} Retirer le fond uni</button>`}
      <p class="pn-hint">Pour les fonds unis ou presque (studio, fond vert, ciel, page blanche) : la couleur des bords devient transparente. Réglez la tolérance si besoin.</p>
      <h4 class="pn-h">Bichromie</h4><div class="pn-duos">${DUOS.map(([a, b], i) => `<button type="button" data-duo="${i}" style="background:linear-gradient(135deg,${a} 50%,${b} 50%)" aria-label="Bichromie ${i + 1}" class="${L.duo && L.duo.a === a && L.duo.b === b ? 'on' : ''}"></button>`).join('')}<button type="button" data-duo="off" class="off" title="Sans bichromie">✕</button></div>
      ${L.duo ? `<div class="fd2">${field('Ombres', '@duo.a', L.duo.a, {type:'color'})}${field('Lumières', '@duo.b', L.duo.b, {type:'color'})}</div>` : ''}
      <h4 class="pn-h">Recadrer</h4><div class="pn-crop">${[['free', 'Libre'], ['1:1', '1:1'], ['4:5', '4:5'], ['16:9', '16:9'], ['9:16', '9:16'], ['3:2', '3:2'], ['2:3', '2:3'], ['4:3', '4:3']].map(([k, n]) => `<button type="button" data-crop="${k}">${n}</button>`).join('')}</div>
      ${['x', 'y', 'w', 'h'].map(k => field({x:'Bord gauche', y:'Bord haut', w:'Largeur gardée', h:'Hauteur gardée'}[k], 'crop.' + k, round(((L.crop || {x:0, y:0, w:1, h:1})[k]) * 100, 1), {type:'range', min:k === 'w' || k === 'h' ? 5 : 0, max:k === 'w' || k === 'h' ? 100 : 95, step:.5, fmt:v => round(v, 1) + ' %'})).join('')}
      <div class="pn-row"><button type="button" class="pn-btn" data-act="flipX">${ico('flipH')} Miroir</button><button type="button" class="pn-btn" data-act="flipY">${ico('flipV')} Retourner</button><button type="button" class="pn-btn" data-act="rot90">↻ 90°</button></div>`;
  },
  p_fx(P){
    const L = ED.sel1(); if (!L || !(L.t === 'image' || L.t === 'video')) return noSel('Sélectionnez une image ou une vidéo pour lui appliquer un filtre.');
    return `<div class="pn-fx">${Object.entries(FILTERS).map(([k, [n]]) => `<button type="button" data-filter="${k}" class="${(L.filter || 'none') === k ? 'on' : ''}"><canvas data-fxprev="${k}" width="120" height="80"></canvas><span>${n}</span></button>`).join('')}</div>
      <p class="pn-hint">${Object.keys(FILTERS).length - 1} filtres, à combiner avec les réglages fins (panneau Réglages).</p>`;
  },
  fxPreview(cv){
    const L = ED.sel1(), m = L && ED.P.media[L.media], el = MEDIA.el(m); if (!el) return;
    const g = cv.getContext('2d'), sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight, k = Math.max(cv.width / sw, cv.height / sh);
    const a = {...(FILTERS[cv.dataset.fxprev]?.[1] || {})};
    if (SUPPORTS_FILTER) g.filter = filterCss(a);
    try { g.drawImage(el, (sw - cv.width / k) / 2, (sh - cv.height / k) / 2, cv.width / k, cv.height / k, 0, 0, cv.width, cv.height); } catch(e){}
    g.filter = 'none';
    if (PIX_ADJ.some(k => a[k]) || cv.dataset.pfxprev){ try { const im = g.getImageData(0, 0, cv.width, cv.height); if (a.clarity) clarityData(im, a.clarity); toneData(im, a); if (a.sharp) sharpenData(im, a.sharp); if (cv.dataset.pfxprev && cv.dataset.pfxprev !== 'none') pfxData(im, {k:cv.dataset.pfxprev, v:50}, cv.width / 400); g.putImageData(im, 0, 0); } catch(e){} }
    if (a.temp){ g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.abs(a.temp) / 100 * .8; g.fillStyle = a.temp > 0 ? '#FF9A3D' : '#3D8BFF'; g.fillRect(0, 0, cv.width, cv.height); }
    if (a.fade){ g.globalCompositeOperation = 'screen'; g.globalAlpha = a.fade / 100 * .45; g.fillStyle = '#8A8A8A'; g.fillRect(0, 0, cv.width, cv.height); }
  },
  /* --- Vidéo --- */
  p_trans(P){
    const L = ED.sel1(); if (!L || L.t === 'audio') return noSel('Sélectionnez un clip dans la timeline : choisissez ensuite son effet d\'entrée et de sortie.');
    const inSet = L.t === 'text' ? FX_IN : Object.fromEntries(Object.entries(FX_IN).filter(([k]) => !TEXT_FX.has(k)));
    const row = (key, set, cur) => `<div class="pn-trs">${Object.entries(set).map(([k, n]) => `<button type="button" data-tr="${key}" data-k="${k}" class="${cur.k === k ? 'on' : ''}"><i class="trp ${k}"></i><span>${n}</span></button>`).join('')}</div>`;
    return `<h4 class="pn-h">Entrée</h4>${row('tin', inSet, L.tin)}${field('Durée de l\'entrée', 'tin.d', L.tin.d, {type:'range', min:.1, max:Math.max(.2, Math.min(5, L.dur)), step:.05, fmt:v => round(v, 2) + ' s'})}
      ${L.tin.k === 'block' ? field('Couleur du bloc', 'tin.c', L.tin.c || '#7B2FF7', {type:'color'}) : ''}
      <h4 class="pn-h">Sortie</h4>${row('tout', FX_OUT, L.tout)}${field('Durée de la sortie', 'tout.d', L.tout.d, {type:'range', min:.1, max:Math.max(.2, Math.min(5, L.dur)), step:.05, fmt:v => round(v, 2) + ' s'})}
      <p class="pn-hint">Pour un fondu enchaîné, faites se chevaucher deux clips sur deux pistes et donnez-leur un fondu.</p>`;
  },
  /* --- Motion --- */
  p_anim(P){
    const L = ED.sel1();
    return (L && L.t !== 'audio' ? '' : noSel('Sélectionnez un calque pour l\'animer.'))
      + `<div class="pn-anims">${ANIM_PRESETS.map((a, i) => `<button type="button" data-anim="${i}"${!L || L.t === 'audio' || (a.only && L.t !== a.only) ? ' disabled' : ''}><i class="anp a${i}"></i><b>${a.n}</b><small>${a.d}</small></button>`).join('')}</div>
      <button type="button" class="pn-big alt" data-act="animAll"${P.layers.some(l => l.t !== 'audio') ? '' : ' disabled'}>${ico('anim')} Animer toute la page</button>
      <p class="pn-hint">« Animer toute la page » donne une entrée échelonnée à chaque élément, du fond vers le premier plan. Pour une animation sur mesure : dans la timeline, cliquez sur ${ico('anim')} à côté d'une propriété, déplacez la tête de lecture puis modifiez le calque ; chaque changement pose une image clé.</p>`;
  },
  p_layers(P){
    const ls = [...drawOrder(P)].reverse(), aud = P.layers.filter(l => l.t === 'audio');
    const name = L => L.name || SHAPE_NAMES[L.k] || VISUAL_NAMES[L.t] || 'Calque';
    const row = L => `<div class="pn-l${ED.sel.has(L.id) ? ' on' : ''}${L.vis === false ? ' off' : ''}${L.g ? ' grp' : ''}" data-lid="${L.id}" tabindex="0"><span class="pl-ic">${ico(LAYER_ICON[L.t] || 'shapes')}</span>
      <b>${escH(name(L))}</b>${L.g ? '<em class="pl-g" title="Dans un groupe">G</em>' : ''}${TIMED(ED.studio) ? `<small>${fmtT(L.start)}</small>` : ''}
      <button type="button" data-lv="${L.id}" title="${L.vis === false ? 'Afficher' : 'Masquer'}">${ico(L.vis === false ? 'eyeOff' : 'eye')}</button><button type="button" data-ll="${L.id}" title="${L.lock ? 'Déverrouiller' : 'Verrouiller'}" class="${L.lock ? 'on' : ''}">${ico(L.lock ? 'lock' : 'unlock')}</button></div>`;
    if (!ls.length && !aud.length) return '<div class="pn-empty">' + ico('layers') + '<b>Aucun calque</b><span>Ajoutez un texte, une forme ou un média.</span></div>';
    return `<p class="pn-hint">Du premier plan vers le fond. ${ED.studio === 'video' || ED.studio === 'motion' ? 'Les pistes du dessus se dessinent devant.' : 'Un clic ici sélectionne l\'élément seul, même dans un groupe.'}</p><div class="pn-ls">${ls.map(row).join('')}</div>${aud.length ? `<h4 class="pn-h">Sons</h4><div class="pn-ls">${aud.map(row).join('')}</div>` : ''}
      <div class="pn-row"><button type="button" class="pn-btn" data-act="front" title="Premier plan">${ico('up')} Avancer</button><button type="button" class="pn-btn" data-act="back" title="Arrière-plan">${ico('down')} Reculer</button></div>`;
  },
  /* --- actions --- */
  click(e){
    const t = e.target, P = ED.P;
    const g = (sel, fn) => { const b = t.closest(sel); if (b){ fn(b); return true; } return false; };
    if (ED.readOnly && !t.closest('[data-lid],[data-tplcat],[data-iccat],summary')) return toast('Projet en lecture seule');
    if (g('[data-act]', b => this.act(b.dataset.act, b))) return;
    if (g('[data-stab]', b => { this.q.stock = b.dataset.stab; this.render(); })) return;
    if (g('[data-stkcat]', b => { this.q.stk = b.dataset.stkcat; this.render(); })) return;
    if (g('[data-aiex]', b => { $('#aiPrompt').value = b.dataset.aiex; })) return;
    if (g('[data-aitxt]', b => AI.text(b.dataset.aitxt))) return;
    if (g('[data-seg]', b => this.segRun(b.dataset.seg))) return;
    if (g('[data-stake]', b => { const it = STOCK.res[+b.dataset.stake]; if (it) STOCK.take(it); })) return;
    if (g('[data-aprev]', b => { const it = STOCK.res[+b.dataset.aprev]; if (it) this.preview(it.url, b); })) return;
    if (g('[data-sprev]', b => synthSound(b.dataset.sprev).then(f => this.preview(URL.createObjectURL(f), b)))) return;
    if (g('[data-sadd]', b => synthSound(b.dataset.sadd).then(f => ED.importFiles([f], {atHead:true})))) return;
    if (g('[data-table]', b => { const st = TABLE_STYLES[+b.dataset.table]; ED.addLayer(mkTable(P, null, {...st.o, ...ED.timing(5), track:topTrack(P)}), {label:'Ajouter un tableau'}); })) return;
    if (g('[data-mock]', b => ED.addLayer(mkMock(P, b.dataset.mock, {...ED.timing(5), track:topTrack(P)}), {label:'Ajouter une maquette'}))) return;
    if (g('[data-cdone]', b => { COMMENTS.toggle(b.dataset.cdone); this.render(); })) return;
    if (g('[data-cdel]', b => { COMMENTS.del(b.dataset.cdel); this.render(); })) return;
    if (g('[data-tplcat]', b => { this.q.tplCat = b.dataset.tplcat; $$('[data-tplcat]', this.body).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pnTplList').innerHTML = this.tplList(); this.lazyThumbs(); })) return;
    if (g('[data-iccat]', b => { this.q.icCat = b.dataset.iccat; $$('[data-iccat]', this.body).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pnIcList').innerHTML = this.icList(); })) return;
    if (g('[data-tpl]', b => ED.useTemplate(b.dataset.tpl))) return;
    if (g('[data-fmt]', b => ED.setFormat(FORMATS.find(f => f.id === b.dataset.fmt)))) return;
    if (g('[data-txt]', b => ED.addPresetText(TEXT_PRESETS[+b.dataset.txt]))) return;
    if (g('[data-pair]', b => ED.addPair(FONT_PAIRS[+b.dataset.pair]))) return;
    const at = () => ({start:TIMED(ED.studio) ? PLAY.t : 0, dur:TIMED(ED.studio) ? Math.min(5, Math.max(1, PLAY.end() - PLAY.t)) : P.dur, track:topTrack(P)});
    if (g('[data-shape]', b => ED.addLayer(mkShape(P, b.dataset.shape, {fill:ED.shapeCol || '#6D3BFF', ...at(), ...(b.dataset.shape === 'line' ? {h:Math.max(4, Math.round(Math.min(P.w, P.h) * .012))} : {})})))) return;
    if (g('[data-line]', b => { const lw = Math.max(4, Math.round(Math.min(P.w, P.h) * .012)), w = Math.round(P.w * .45); ED.addLayer(mkShape(P, b.dataset.line, {name:b.title, fill:ED.shapeCol === '#FFFFFF' ? '#16131F' : ED.shapeCol || '#16131F', dash:b.dataset.dash, w, h:lw * (b.dataset.line === 'line' ? 1 : 2), x:Math.round((P.w - w) / 2), y:Math.round(P.h / 2 - lw), ...at()})); })) return;
    if (g('[data-frame]', b => { const k = b.dataset.frame, s = Math.round(Math.min(P.w, P.h) * .5); ED.addLayer(mkShape(P, k, {name:'Cadre photo · ' + (SHAPE_NAMES[k] || ''), slot:true, fill:'', stroke:'', w:k === 'arch' ? Math.round(s * .8) : s, h:s, x:Math.round((P.w - s) / 2), y:Math.round((P.h - s) / 2), r:k === 'round' ? Math.round(s * .1) : 0, ...at()})); })) return;
    if (g('[data-grid]', b => ED.addGrid(GRIDS[+b.dataset.grid]))) return;
    if (g('[data-chart]', b => ED.addLayer(mkChart(P, b.dataset.chart, {...at(), pal:(ED.brand().colors || []).length > 2 ? [...ED.brand().colors] : [...PALETTE_DEF]}), {label:'Ajouter un graphique'}))) return;
    if (g('[data-icon]', b => ED.addLayer(mkIcon(P, b.dataset.icon, {col:ED.iconCol(), ...at()}), {label:'Ajouter une icône'}))) return;
    if (g('[data-emoji]', b => { const fs = Math.round(Math.min(P.w, P.h) * .16); const L = mkText(P, {txt:b.dataset.emoji, fs, fw:400, name:'Émoji ' + b.dataset.emoji, ...at()}); L.w = Math.round(fs * 1.5); L.x = Math.round((P.w - L.w) / 2); L.h = Math.max(measureText(L).h, 4); L.y = Math.round((P.h - L.h) / 2); ED.addLayer(L, {label:'Ajouter un émoji'}); })) return;
    if (g('[data-shapecol]', b => { ED.shapeCol = b.dataset.shapecol; const L = ED.sel1(); if (L && (L.t === 'shape' || L.t === 'color')){ L.fill = ED.shapeCol; ED.commit('Couleur'); } this.render(); })) return;
    if (g('[data-col]', b => ED.applyColor(b.dataset.col))) return;
    if (g('[data-brdel]', b => { const br = ED.brand(); ED.setBrand({...br, colors:(br.colors || []).filter(c => c !== b.dataset.brdel)}); this.render(); })) return;
    if (g('[data-palapply]', b => { const n = recolor(P, PALETTES[+b.dataset.palapply][1]); if (!n) return toast('Aucune couleur à remplacer'); STAGE.layout(); ED.commit('Style ' + PALETTES[+b.dataset.palapply][0]); toast('Palette « ' + PALETTES[+b.dataset.palapply][0] + ' » appliquée (Ctrl + Z pour annuler)'); })) return;
    if (g('[data-pen]', b => { const k = b.dataset.pen; Object.assign(ED.pen, {kind:k, hl:k === 'hl', sw:k === 'pen' ? 6 : k === 'marker' ? 18 : 36}); if (ED.tool !== 'draw') ED.setTool('draw'); this.render(); })) return;
    if (g('[data-pencol]', b => { ED.pen.col = b.dataset.pencol; if (ED.tool !== 'draw') ED.setTool('draw'); this.render(); })) return;
    if (g('[data-bg]', b => { P.bg = b.dataset.bg; ED.commit('Fond'); this.render(); })) return;
    if (g('[data-grad]', b => { const all = [...GRADS, ...PALETTES.slice(0, 8).map(p => [p[1][0], p[1][2]])], [a, c] = all[+b.dataset.grad]; ED.bgLayer(L => { L.fill = a; L.fill2 = c; L.k = 'rect'; }, 'Fond dégradé'); })) return;
    if (g('[data-pattern]', b => ED.addPattern(b.dataset.pattern))) return;
    if (g('[data-madd]', b => ED.addMedia(P.media[b.dataset.madd], e.shiftKey))) return;
    if (g('[data-mmenu]', b => this.mediaMenu(b, P.media[b.dataset.mmenu]))) return;
    if (g('[data-mid]', b => ED.addMedia(P.media[b.dataset.mid], e.shiftKey))) return;
    if (g('[data-filter]', b => { const L = ED.sel1(); if (L){ L.filter = b.dataset.filter; ED.commit('Filtre'); this.render(); } })) return;
    if (g('[data-duo]', b => { const L = ED.sel1(); if (!L) return; if (b.dataset.duo === 'off') delete L.duo; else { const [a, c] = DUOS[+b.dataset.duo]; L.duo = {a, b:c}; } ED.commit('Bichromie'); this.render(); })) return;
    if (g('[data-crop]', b => ED.cropPreset(b.dataset.crop))) return;
    if (g('[data-pfx]', b => { const L = ED.sel1(); if (!L) return; const k = b.dataset.pfx; if (k === 'none') delete L.pfx; else L.pfx = {k, v:L.pfx?.v ?? 50}; ED.commit('Effet photo'); this.render(); })) return;
    if (g('[data-eq]', b => { const L = ED.sel1(); if (!L) return; Object.assign(L, {voice:{eqLo:-4, eqHi:5}, warm:{eqLo:4, eqHi:-2}, radio:{eqLo:-12, eqHi:-6}, flat:{eqLo:0, eqHi:0}}[b.dataset.eq]); ED.commit('Égaliseur'); this.render(); if (PLAY.playing){ PLAY.pause(); PLAY.play(); } })) return;
    if (g('[data-tr]', b => { for (const L of ED.selLayers()) L[b.dataset.tr] = {k:b.dataset.k, d:L[b.dataset.tr]?.d || .6, ...(b.dataset.k === 'block' ? {c:L[b.dataset.tr]?.c || '#7B2FF7'} : {})}; ED.commit('Transition'); this.render(); })) return;
    if (g('[data-anim]', b => { const a = ANIM_PRESETS[+b.dataset.anim]; for (const L of ED.selLayers()) if (L.t !== 'audio' && (!a.only || L.t === a.only)){ L.kf ||= {}; a.a(L, P); } ED.commit('Animation : ' + a.n); if (!PLAY.playing){ const L = ED.sel1(); if (L){ PLAY.seek(L.start, false); PLAY.play(); } } this.render(); })) return;
    if (g('[data-lv]', b => { const L = P.layers.find(l => l.id === b.dataset.lv); L.vis = L.vis === false; ED.commit(L.vis ? 'Afficher' : 'Masquer'); })) return;
    if (g('[data-ll]', b => { const L = P.layers.find(l => l.id === b.dataset.ll); L.lock = !L.lock; ED.commit(L.lock ? 'Verrouiller' : 'Déverrouiller'); })) return;
    if (g('[data-lid]', b => { if (e.shiftKey) ED.toggleSel(b.dataset.lid); else ED.select([b.dataset.lid]); })) return;
  },
  async act(k, b){
    const P = ED.P, L = ED.sel1();
    if (k === 'import') return ED.importPick(b.dataset.kind || '');
    if (k === 'record') return ED.recordVoice();
    if (k === 'addText') return ED.addPresetText({n:'Texte', o:{txt:'Votre texte', fs:.07, fw:700}});
    if (k === 'brandTitle' || k === 'brandBody'){ const br = ED.brand(); return ED.addPresetText(k === 'brandTitle' ? {n:'Titre', o:{txt:'Titre de ma charte', fs:.1, fw:800, font:br.fonts.title, col:(br.colors || [])[0] || '#16131F'}} : {n:'Texte', o:{txt:'Votre texte, à la police de votre charte.', fs:.035, fw:400, font:br.fonts.body || 'Inter', align:'l', lh:1.4}}); }
    if (k === 'customFmt'){ const w = clamp(Math.round(+$('#pnCw').value || P.w), 16, 7680), h = clamp(Math.round(+$('#pnCh').value || P.h), 16, 7680); if (w !== P.w || h !== P.h) ED.setFormat({w, h, name:`${w} × ${h}`}); return; }
    if (k === 'qr') return window.SWAsk ? window.SWAsk('QR code', 'Lien ou texte à encoder', 'https://', 'Créer', v => { v = String(v || '').trim(); if (!v) return; if (!qrMatrix(v, 'M')) return toast('Texte trop long pour un QR code'); ED.addLayer(mkQr(P, v, ED.timing(5)), {label:'Ajouter un QR code'}); }) : ED.addLayer(mkQr(P, 'https://studio-prism.com', ED.timing(5)));
    if (k === 'drawTool'){ ED.setTool(ED.tool === 'draw' ? 'select' : 'draw'); return this.render(); }
    if (k === 'eyedrop'){ try { const r = await new window.EyeDropper().open(); if (r?.sRGBHex) ED.applyColor(r.sRGBHex.toUpperCase()); } catch(e){} return; }
    if (k === 'brandFromDoc'){ ED.setBrand({...ED.brand(), colors:docColors(P).slice(0, 10)}); return this.render(); }
    if (k === 'brandApply'){ const n = recolor(P, ED.brand().colors); if (!n) return toast('Aucune couleur à remplacer'); STAGE.layout(); ED.commit('Appliquer ma charte'); return toast('Charte appliquée au design'); }
    if (k === 'animAll') return ED.animatePage();
    if (k === 'aiDesign'){ const v = $('#aiPrompt').value.trim(); if (!v) return toast('Décrivez d\'abord le visuel souhaité.'); return AI.design(v, +($('#aiPages')?.value || 1), $('#aiPhotos') ? $('#aiPhotos').checked : false); }
    if (k === 'aiWrite'){ const v = $('#aiWrite').value.trim(); if (!v) return toast('Indiquez le sujet du texte.'); return AI.write(v); }
    if (k === 'aiTr1') return AI.text('translate', $('#aiLangT').value);
    if (k === 'aiCustom'){ const v = $('#aiCustom').value.trim(); if (v) return AI.text('custom', v); return; }
    if (k === 'aiTranslate') return AI.translate($('#aiLang').value);
    if (k === 'aiPal'){ const v = $('#aiPal').value.trim(); if (v) return AI.palette(v); return; }
    if (k === 'aiCaptions') return AI.captions();
    if (k === 'stockMore') return STOCK.search(STOCK.q, STOCK.kind, true);
    if (k === 'gotoSounds'){ this.q.stock = 'gen'; return this.show('stock'); }
    if (k === 'cPlace'){ COMMENTS.placing = !COMMENTS.placing; $('#app').classList.toggle('commenting', COMMENTS.placing); return this.render(); }
    if (k === 'enhance' && L){ const el = MEDIA.el(P.media[L.media]), a = el && autoEnhance(el); if (!a) return toast('Image indisponible sur cet appareil.'); L.adj = {...(L.adj || {}), ...a}; for (const x in L.adj) if (!L.adj[x]) delete L.adj[x]; ED.commit('Amélioration automatique'); return this.render(); }
    if (k === 'olnOn' && L){ L.oln = {c:'#FFFFFF', w:12}; if (!L.shadow) L.shadow = {c:'#00000040', b:18, x:0, y:6}; ED.commit('Contour'); return this.render(); }
    if (k === 'olnOff' && L){ delete L.oln; ED.commit('Retirer le contour'); return this.render(); }
    if (k === 'adjAll' && L){ let n = 0; for (const x of allLayers(P)) if ((x.t === 'image' || x.t === 'video') && x !== L){ x.filter = L.filter; x.adj = deep(L.adj || {}); if (L.pfx) x.pfx = deep(L.pfx); else delete x.pfx; n++; } ED.commit('Réglages sur toutes les images'); return toast(n ? `${n} autre${n > 1 ? 's' : ''} image${n > 1 ? 's' : ''} modifiée${n > 1 ? 's' : ''}.` : 'Aucune autre image dans le projet.'); }
    if (k === 'resetAdj' && L){ delete L.pfx; L.adj = {}; L.filter = 'none'; delete L.duo; ED.commit('Réinitialiser'); return this.render(); }
    if (k === 'bgkAuto' && L){ const el = MEDIA.el(P.media[L.media]); if (!el) return toast('Le fichier du média est absent de cet appareil.'); L.bgk = {c:PIX.edgeColor(el), tol:30, soft:10}; ED.commit('Retirer le fond'); return this.render(); }
    if (k === 'bgkOff' && L){ delete L.bgk; ED.commit('Remettre le fond'); return this.render(); }
    if (k === 'flipX' && L){ L.flipX = !L.flipX; return ED.commit('Miroir'); }
    if (k === 'flipY' && L){ L.flipY = !L.flipY; return ED.commit('Retourner'); }
    if (k === 'rot90' && L){ STAGE.setProp(L, 'rot', ((kfVal(L, 'rot', PLAY.t - L.start) || 0) + 90) % 360); return ED.commit('Rotation'); }
    if (k === 'front' || k === 'back') return ED.zorder(k === 'front' ? 1 : -1);
  },
  async mediaMenu(btn, m){
    const used = ED.P.layers.some(l => l.media === m.id);
    const k = await ED.menu(btn, [{k:'add', t:'Ajouter au projet'}, {k:'top', t:'Ajouter à la tête de lecture', s:'Sur une nouvelle piste', off:!TIMED(ED.studio)},
      m.kind === 'image' ? {k:'bg', t:'Utiliser comme fond', s:'Remplit toute la page'} : null,
      MEDIA.missing(m) ? {k:'relink', t:'Relier un fichier…', s:'Choisir le fichier sur cet appareil'} : null,
      !m.cloud && window.SMCloudMedia?.ok() ? {k:'up', t:'Envoyer dans le cloud', s:'Pour l\'ouvrir sur vos autres appareils'} : null, '-',
      {k:'del', t:'Retirer du projet', s:used ? 'Retire aussi ses clips' : '', danger:true}].filter(Boolean));
    if (k === 'add') ED.addMedia(m); if (k === 'top') ED.addMedia(m, true);
    if (k === 'bg') ED.mediaAsBg(m);
    if (k === 'relink') ED.relink(m);
    if (k === 'up'){ toast('Envoi dans le cloud…'); const ok = await MEDIA.upload(ED.P, m); toast(ok ? 'Média envoyé dans le cloud' : 'Envoi impossible : le média reste sur cet appareil'); if (ok) ED.commit('Média dans le cloud'); }
    if (k === 'del') ED.removeMedia(m);
  },
  input(e, final){
    const t = e.target;
    if (t.matches('[data-crep]') && final && t.value.trim()){ COMMENTS.reply(t.dataset.crep, t.value.trim()); this.render(); return; }
    if (t.matches('[data-tplq]')){ this.q.tpl = t.value; clearTimeout(this.qt); this.qt = setTimeout(() => { $('#pnTplList').innerHTML = this.tplList(); this.lazyThumbs(); }, 120); return; }
    if (t.matches('[data-icq]')){ this.q.ic = t.value; clearTimeout(this.qt); this.qt = setTimeout(() => { $('#pnIcList').innerHTML = this.icList(); }, 100); return; }
    if (t.matches('[data-bradd]') && final){ const br = ED.brand(), c = t.value.toUpperCase(); if (!(br.colors || []).includes(c)) ED.setBrand({...br, colors:[...(br.colors || []), c].slice(0, 16)}); this.render(); return; }
    if (t.matches('[data-colc]') && final){ ED.applyColor(t.value.toUpperCase()); return; }
    if (t.matches('[data-pencolc]')){ ED.pen.col = t.value; if (final) this.render(); return; }
    const el = t.closest('[data-p]'); if (el){ ED.bindInput(el, final); return; }
    if (t.matches('[data-bgc]')){ ED.P.bg = t.value; if (final) ED.commit('Fond'); else STAGE.paint(); }
    if (t.matches('[data-bgnone]') && final){ ED.P.bg = t.checked ? null : '#FFFFFF'; ED.commit('Fond'); STAGE.layout(); this.render(); }
  },
};
const LAYER_ICON = {text:'text', audio:'audio', video:'video', image:'media', icon:'star', chart:'chart', qr:'grid', draw:'pen', color:'bg', shape:'shapes'};
const tplRatio = t => { const f = FORMATS.find(x => x.id === t.fmt) || FORMATS[0]; return `${f.w}/${f.h}`; };
function chartSvg(k){
  const p = {col:'<rect x="5" y="12" width="4" height="8"/><rect x="10.5" y="6" width="4" height="14"/><rect x="16" y="9" width="4" height="11"/>', bar:'<rect x="4" y="5" width="12" height="4"/><rect x="4" y="10.5" width="16" height="4"/><rect x="4" y="16" width="8" height="4"/>',
    line:'<path d="M3 17l5-6 4 3 8-8" fill="none" stroke-width="2"/>', area:'<path d="M3 20V15l5-6 4 3 8-7v15z"/>', pie:'<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M14 2.5A8 8 0 0 1 21.5 10H14z" opacity=".55"/>',
    donut:'<path d="M12 3a9 9 0 1 0 9 9h-4a5 5 0 1 1-5-5z"/><path d="M13.5 2.6A9 9 0 0 1 21.4 10.5h-4A5 5 0 0 0 13.5 6.6z" opacity=".55"/>', prog:'<circle cx="12" cy="12" r="8" fill="none" stroke-width="3" opacity=".3"/><path d="M12 4a8 8 0 1 1-8 8" fill="none" stroke-width="3"/>'}[k] || '';
  return `<svg viewBox="0 0 24 24" class="chs" aria-hidden="true">${p}</svg>`;
}
function noSel(t){ return `<div class="pn-empty">${ico('select')}<span>${escH(t)}</span></div>`; }
function shapeSvg(k){
  const p = {rect:'<rect x="3" y="5" width="18" height="14"/>', round:'<rect x="3" y="5" width="18" height="14" rx="4"/>', ellipse:'<ellipse cx="12" cy="12" rx="9" ry="7"/>', tri:'<path d="M12 4 21 20H3z"/>', diamond:'<path d="m12 3 9 9-9 9-9-9z"/>',
    hex:'<path d="M7 4h10l5 8-5 8H7l-5-8z"/>', star:'<path d="m12 3 2.7 6 6.3.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.3 9z"/>', arrow:'<path d="M3 9h11V5l7 7-7 7v-4H3z"/>', heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    bubble:'<path d="M4 5h16v11H9l-4 4v-4H4z"/>', ring:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5" fill="var(--panel)"/>', line:'<rect x="3" y="11" width="18" height="2.4"/>', prism:'<path d="M5 3l16 9-16 9z"/>',
    pent:'<path d="M12 3l9 6.5-3.4 10.5H6.4L3 9.5z"/>', oct:'<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/>', cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>', para:'<path d="M7 5h14l-4 14H3z"/>', trap:'<path d="M7 5h10l4 14H3z"/>',
    chevron:'<path d="M3 5h12l6 7-6 7H3l6-7z"/>', burst:'<path d="m12 2 2.3 3 3.7-.8.3 3.7 3.4 1.6-1.9 3.3 1.9 3.3-3.4 1.6-.3 3.7-3.7-.8L12 22l-2.3-3-3.7.8-.3-3.7-3.4-1.6 1.9-3.3-1.9-3.3 3.4-1.6.3-3.7 3.7.8z"/>',
    star4:'<path d="M12 2c.8 6.5 3.5 9.2 10 10-6.5.8-9.2 3.5-10 10-.8-6.5-3.5-9.2-10-10 6.5-.8 9.2-3.5 10-10z"/>', arrow2:'<path d="M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z"/>', arch:'<path d="M5 21V11a7 7 0 0 1 14 0v10z"/>',
    blob:'<path d="M12 3c4.5 0 9 2.5 8.5 8.5C20 17 16 21 11 21S3 17.5 3.5 11.5 7.5 3 12 3z"/>', moon:'<path d="M14.5 3A9 9 0 1 0 21 16.5 7.5 7.5 0 0 1 14.5 3z"/>', cloud:'<path d="M6.5 19a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1.5A4.5 4.5 0 0 1 17.5 19z"/>'}[k] || '';
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}
/* champ de formulaire relié à une propriété du calque sélectionné (data-p) */
function field(label, p, v, o = {}){
  const id = 'f_' + p.replace(/\W/g, '_') + '_' + (field.n = (field.n || 0) + 1);
  const kf = o.kf ? `<button type="button" class="kfb${o.kfOn ? ' on' : ''}${o.kfHere ? ' here' : ''}" data-kfp="${o.kf}" title="${o.kfOn ? (o.kfHere ? 'Image clé ici · cliquer pour la supprimer' : 'Poser une image clé à la tête de lecture') : 'Animer cette propriété (images clés)'}">${ico('key')}</button>` : '';
  if (o.type === 'range') return `<label class="fd rg" for="${id}"><span>${escH(label)}${kf}</span><output>${o.fmt ? o.fmt(v) : v}</output><input id="${id}" type="range" data-p="${p}" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${v}"${o.dis ? ' disabled' : ''}></label>`;
  if (o.type === 'color') return `<label class="fd col" for="${id}"><span>${escH(label)}</span><input id="${id}" type="color" data-p="${p}" value="${hexOk(v) ? v.slice(0, 7) : '#000000'}">${o.clear ? `<button type="button" class="fd-x" data-clear="${p}" title="Aucune">✕</button>` : ''}</label>`;
  if (o.type === 'select') return `<label class="fd sel" for="${id}"><span>${escH(label)}</span><select id="${id}" data-p="${p}">${Object.entries(o.opts).map(([k, n]) => `<option value="${escH(k)}"${String(v) === String(k) ? ' selected' : ''}>${escH(n)}</option>`).join('')}</select></label>`;
  if (o.type === 'check') return `<label class="fd chk"><input type="checkbox" data-p="${p}"${v ? ' checked' : ''}><span>${escH(label)}</span></label>`;
  if (o.type === 'text') return `<label class="fd txt" for="${id}"><span>${escH(label)}</span><input id="${id}" type="text" data-p="${p}" value="${escH(v)}" maxlength="${o.max || 40}"></label>`;
  if (o.type === 'textarea') return `<label class="fd ta" for="${id}"><span>${escH(label)}</span><textarea id="${id}" data-p="${p}" rows="3">${escH(v)}</textarea></label>`;
  return `<label class="fd num" for="${id}"><span>${escH(label)}${kf}</span><input id="${id}" type="number" data-p="${p}" value="${round(+v || 0, o.dec ?? 1)}" step="${o.step || 1}"${o.min != null ? ` min="${o.min}"` : ''}${o.max != null ? ` max="${o.max}"` : ''}>${o.unit ? `<em>${o.unit}</em>` : ''}</label>`;
}

/* aperçu sonore dans le panneau */
PANEL.preview = function(url, btn){ if (this.au){ this.au.pause(); if (this.auBtn === btn){ this.au = null; btn.innerHTML = ico('play'); return; } this.auBtn.innerHTML = ico('play'); } const a = new Audio(url); a.play().catch(() => toast('Lecture impossible')); a.onended = () => { btn.innerHTML = ico('play'); this.au = null; }; this.au = a; this.auBtn = btn; btn.innerHTML = ico('pause'); };
PANEL.segRun = async function(spec){
  const [mode, kind] = spec.split(':'), L = ED.sel1(); if (!L || L.t !== 'image') return toast('Sélectionnez une image.');
  BUSY.show(SEG.seg[kind] ? 'Détourage en cours…' : 'Chargement du modèle d\'IA (une seule fois)…');
  try { await SEG.apply(L, mode, kind); toast(mode === 'cut' ? 'Sujet détouré (copie transparente ; Ctrl + Z pour revenir)' : 'Fond flouté (Ctrl + Z pour revenir)', 4000); }
  catch(e){ console.warn(e); toast(e?.message || 'Détourage impossible.', 6000); } finally { BUSY.hide(); }
};
function mockSvg(k){
  const p = {phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><rect x="8.2" y="3.4" width="7.6" height="17.2" rx="1.4" class="s"/>', tablet:'<rect x="4" y="2" width="16" height="20" rx="2"/><rect x="5.4" y="3.4" width="13.2" height="17.2" rx=".8" class="s"/>',
    laptop:'<rect x="4" y="4" width="16" height="11" rx="1"/><rect x="5.2" y="5.2" width="13.6" height="8.6" class="s"/><path d="M2 17h20l-1 2H3z"/>', browser:'<rect x="2" y="4" width="20" height="16" rx="1.5"/><rect x="2" y="7" width="20" height="13" class="s"/>',
    desktop:'<rect x="2" y="3" width="20" height="13" rx="1"/><rect x="3.2" y="4.2" width="17.6" height="10.6" class="s"/><path d="M10 16h4v3h-4zM7 19h10v1.6H7z"/>', watch:'<rect x="8" y="2" width="8" height="4" rx="1"/><rect x="8" y="18" width="8" height="4" rx="1"/><rect x="6" y="5" width="12" height="14" rx="3.5"/><rect x="7.4" y="6.4" width="9.2" height="11.2" rx="2.5" class="s"/>'}[k] || '';
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}

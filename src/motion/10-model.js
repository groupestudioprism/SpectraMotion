/* ---------- Modèle de projet Spectra Motion ----------
   Un projet = une composition (largeur, hauteur, images/s, durée) + des calques posés sur des pistes.
   Le même modèle sert aux cinq studios : Design et Photo regardent l'image à un instant donné, Vidéo, Motion et Audio
   regardent le temps. Rien n'est dupliqué : un titre animé dans Motion est le même calque que dans Vidéo.

   project = {v, app, title, studio, w, h, fps, dur, bg, media:{id:{…}}, layers:[…]}
   calque  = {id, t, name, track, start, dur, x, y, w, h, rot, op, sc, vis, lock, kf:{prop:[[t, v, easing]…]}, tin, tout, …}
     t : image | video | audio | text | shape | color
     track : piste ; les calques visuels d'une piste plus haute se dessinent par-dessus. Les pistes audio sont à part (calques t = audio).
     kf : images clés, temps relatif au début du calque (secondes). Propriétés animables : x, y, sc, rot, op.
     tin / tout : effet d'entrée / de sortie ({k, d}) : fondu, glissement, zoom, volet, flou, machine à écrire.
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
const LAYER_TYPES = ['image', 'video', 'audio', 'text', 'shape', 'color'];
const ANIM_PROPS = ['x', 'y', 'sc', 'rot', 'op'];
const EASES = {lin:'Linéaire', ease:'Douce', in:'Accélération', out:'Décélération', hold:'Maintien'};
const ease = (k, t) => k === 'hold' ? 0 : k === 'in' ? t * t * t : k === 'out' ? 1 - (1 - t) ** 3 : k === 'ease' ? (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) : t;
const FX_IN = {none:'Aucun', fade:'Fondu', slideL:'Glisser depuis la gauche', slideR:'Glisser depuis la droite', slideU:'Monter', slideD:'Descendre', zoom:'Zoom', pop:'Rebond', wipe:'Volet', blur:'Flou', type:'Machine à écrire'};
const FX_OUT = {none:'Aucun', fade:'Fondu', slideL:'Sortir à gauche', slideR:'Sortir à droite', slideU:'Monter', slideD:'Descendre', zoom:'Zoom', pop:'Rebond', wipe:'Volet', blur:'Flou'};
const BLENDS = {'source-over':'Normal', multiply:'Produit', screen:'Superposition claire', overlay:'Incrustation', darken:'Obscurcir', lighten:'Éclaircir', 'color-dodge':'Densité couleur −', 'soft-light':'Lumière tamisée', difference:'Différence', luminosity:'Luminosité'};
const FILTERS = {none:['Original', {}], vivid:['Éclatant', {sat:35, con:8}], warm:['Chaud', {temp:25, sat:10}], cool:['Froid', {temp:-25}], bw:['Noir et blanc', {sat:-100, con:10}],
  sepia:['Sépia', {sepia:70}], fade:['Délavé', {con:-20, bri:8, sat:-25}], drama:['Dramatique', {con:35, bri:-8, sat:-10}], dream:['Rêve', {blur:1, bri:10, sat:15}], night:['Nuit', {bri:-25, temp:-20, con:10}]};
const ADJ_KEYS = {bri:['Luminosité', -100, 100], con:['Contraste', -100, 100], sat:['Saturation', -100, 100], hue:['Teinte', -180, 180], temp:['Température', -100, 100], sepia:['Sépia', 0, 100], blur:['Flou', 0, 30], vig:['Vignettage', 0, 100]};
const FONTS_M = [['Inter', 'sans-serif'], ['Bricolage Grotesque', 'sans-serif'], ['Plus Jakarta Sans', 'sans-serif'], ['Montserrat', 'sans-serif'], ['Poppins', 'sans-serif'], ['Space Grotesk', 'sans-serif'],
  ['Unbounded', 'sans-serif'], ['Syne', 'sans-serif'], ['Anton', 'sans-serif'], ['Bebas Neue', 'sans-serif'], ['Playfair Display', 'serif'], ['DM Serif Display', 'serif'], ['Fraunces', 'serif'],
  ['Lora', 'serif'], ['Caveat', 'cursive'], ['Pacifico', 'cursive'], ['JetBrains Mono', 'monospace']];
const fontCss = n => { const f = FONTS_M.find(x => x[0] === n); return `"${String(n || 'Inter').replace(/"/g, '')}", ${f ? f[1] : 'sans-serif'}`; };

/* ---------- formats prédéfinis ---------- */
const FORMATS = [
  {id:'hd', name:'Vidéo 16:9', sub:'1920 × 1080 · YouTube, écran', w:1920, h:1080, cat:'Vidéo'},
  {id:'vertical', name:'Vidéo verticale', sub:'1080 × 1920 · Reels, TikTok, Shorts', w:1080, h:1920, cat:'Vidéo'},
  {id:'square', name:'Carré', sub:'1080 × 1080 · publication Instagram', w:1080, h:1080, cat:'Réseaux sociaux'},
  {id:'portrait', name:'Portrait 4:5', sub:'1080 × 1350 · publication', w:1080, h:1350, cat:'Réseaux sociaux'},
  {id:'story', name:'Story', sub:'1080 × 1920 · Instagram, Facebook', w:1080, h:1920, cat:'Réseaux sociaux'},
  {id:'thumb', name:'Miniature YouTube', sub:'1280 × 720', w:1280, h:720, cat:'Réseaux sociaux'},
  {id:'banner', name:'Bannière LinkedIn', sub:'1584 × 396', w:1584, h:396, cat:'Réseaux sociaux'},
  {id:'slide', name:'Présentation', sub:'1920 × 1080', w:1920, h:1080, cat:'Présentations'},
  {id:'a4', name:'Affiche A4', sub:'1240 × 1754 · impression 150 dpi', w:1240, h:1754, cat:'Impression'},
  {id:'photo32', name:'Photo 3:2', sub:'1800 × 1200', w:1800, h:1200, cat:'Photo'},
  {id:'k4', name:'Vidéo 4K', sub:'3840 × 2160', w:3840, h:2160, cat:'Vidéo'},
];
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
const SHAPE_NAMES = {rect:'Rectangle', round:'Rectangle arrondi', ellipse:'Ellipse', tri:'Triangle', star:'Étoile', hex:'Hexagone', diamond:'Losange', arrow:'Flèche', line:'Ligne', heart:'Cœur', bubble:'Bulle', ring:'Anneau', prism:'Prisme'};
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

/* ---------- assainissement d'un projet chargé (fichier, cloud, import) ---------- */
const hexOk = c => typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c);
function cleanProject(j){
  if (typeof j === 'string') j = JSON.parse(j);
  if (!j || typeof j !== 'object') throw new Error('Fichier illisible');
  const P = newProject(STUDIOS.some(s => s.id === j.studio) ? j.studio : 'design');
  P.title = String(j.title || 'Projet sans titre').slice(0, 120);
  P.w = clamp(Math.round(num(j.w, P.w)), 16, 7680); P.h = clamp(Math.round(num(j.h, P.h)), 16, 7680);
  P.fps = [24, 25, 30, 50, 60].includes(+j.fps) ? +j.fps : 30; P.dur = clamp(num(j.dur, P.dur), .1, 3600);
  P.bg = j.bg === null ? null : hexOk(j.bg) ? j.bg : P.bg; P.fmt = String(j.fmt || '').slice(0, 20);
  for (const [k, m] of Object.entries(j.media || {})){
    if (!/^[\w-]{3,40}$/.test(k) || !m || typeof m !== 'object') continue;
    const kind = ['image', 'video', 'audio'].includes(m.kind) ? m.kind : null; if (!kind) continue;
    P.media[k] = {id:k, kind, name:String(m.name || 'Média').slice(0, 120), mime:String(m.mime || '').slice(0, 60), size:Math.max(0, Math.round(num(m.size))), w:Math.round(num(m.w)), h:Math.round(num(m.h)), dur:num(m.dur),
      hasAudio:!!m.hasAudio, path:typeof m.path === 'string' && /^spectramotion\/[\w-]+\/[\w-]+\/[\w.-]+$/.test(m.path) ? m.path : '', cloud:!!m.cloud && !!m.path, thumb:typeof m.thumb === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(m.thumb) && m.thumb.length < 12000 ? m.thumb : ''};
  }
  for (const l0 of (Array.isArray(j.layers) ? j.layers : []).slice(0, 500)){
    if (!l0 || !LAYER_TYPES.includes(l0.t)) continue;
    const L = baseLayer(P, l0.t);
    for (const k of ['x', 'y', 'w', 'h', 'rot']) L[k] = num(l0[k], L[k]);
    L.w = Math.max(1, L.w); L.h = Math.max(1, L.h);
    L.id = /^[\w-]{2,40}$/.test(l0.id) ? l0.id : uid('l'); L.name = String(l0.name || '').slice(0, 80);
    L.track = clamp(Math.round(num(l0.track)), 0, 99); L.start = clamp(num(l0.start), 0, 36000); L.dur = clamp(num(l0.dur, 5), 1 / 60, 36000);
    L.op = clamp(num(l0.op, 1), 0, 1); L.sc = clamp(num(l0.sc, 1), .01, 50); L.vis = l0.vis !== false; L.lock = !!l0.lock; L.blend = BLENDS[l0.blend] ? l0.blend : 'source-over';
    for (const p of ANIM_PROPS){ const k = l0.kf?.[p]; if (Array.isArray(k) && k.length) L.kf[p] = k.slice(0, 200).filter(x => Array.isArray(x) && isNum(+x[0]) && isNum(+x[1])).map(x => [round(+x[0], 3), +x[1], EASES[x[2]] ? x[2] : 'ease']).sort((a, b) => a[0] - b[0]); if (L.kf[p] && !L.kf[p].length) delete L.kf[p]; }
    for (const s of ['tin', 'tout']){ const x = l0[s] || {}; L[s] = {k:(s === 'tin' ? FX_IN : FX_OUT)[x.k] ? x.k : 'none', d:clamp(num(x.d, .6), .05, 10)}; }
    if (l0.t === 'text'){
      Object.assign(L, {txt:String(l0.txt ?? '').slice(0, 5000), font:FONTS_M.some(f => f[0] === l0.font) ? l0.font : 'Inter', fs:clamp(num(l0.fs, 64), 4, 2000), fw:[300, 400, 500, 600, 700, 800, 900].includes(+l0.fw) ? +l0.fw : 700,
        it:!!l0.it, col:hexOk(l0.col) ? l0.col : '#16131F', align:['l', 'c', 'r'].includes(l0.align) ? l0.align : 'c', lh:clamp(num(l0.lh, 1.15), .6, 4), ls:clamp(num(l0.ls), -.2, 1), up:!!l0.up,
        tbg:hexOk(l0.tbg) ? l0.tbg : '', tbgPad:clamp(num(l0.tbgPad, .25), 0, 2), tsh:!!l0.tsh, tstroke:hexOk(l0.tstroke) ? l0.tstroke : '', tsw:clamp(num(l0.tsw), 0, 60)});
    } else if (l0.t === 'shape' || l0.t === 'color'){
      Object.assign(L, {k:SHAPE_NAMES[l0.k] ? l0.k : 'rect', fill:hexOk(l0.fill) ? l0.fill : (l0.fill === '' ? '' : '#6D3BFF'), fill2:hexOk(l0.fill2) ? l0.fill2 : '', ga:num(l0.ga, 135) % 360, stroke:hexOk(l0.stroke) ? l0.stroke : '', sw:clamp(num(l0.sw), 0, 200), r:clamp(num(l0.r), 0, 4000)});
    } else {
      if (!P.media[l0.media]) continue;
      Object.assign(L, {media:l0.media, in:clamp(num(l0.in), 0, 36000), speed:clamp(num(l0.speed, 1), .1, 16), vol:clamp(num(l0.vol, 1), 0, 2), mute:!!l0.mute, fadeIn:clamp(num(l0.fadeIn), 0, 60), fadeOut:clamp(num(l0.fadeOut), 0, 60),
        fit:['cover', 'contain', 'fill'].includes(l0.fit) ? l0.fit : 'contain', flipX:!!l0.flipX, flipY:!!l0.flipY, r:clamp(num(l0.r), 0, 4000), filter:FILTERS[l0.filter] ? l0.filter : 'none', adj:{}, crop:null});
      for (const k of Object.keys(ADJ_KEYS)) if (isNum(+l0.adj?.[k]) && +l0.adj[k]) L.adj[k] = clamp(+l0.adj[k], ADJ_KEYS[k][1], ADJ_KEYS[k][2]);
      const c = l0.crop; if (c && [c.x, c.y, c.w, c.h].every(v => isNum(+v)) && +c.w > .01 && +c.h > .01) L.crop = {x:clamp(+c.x, 0, 1), y:clamp(+c.y, 0, 1), w:clamp(+c.w, .01, 1), h:clamp(+c.h, .01, 1)};
    }
    if (l0.t !== 'text' && l0.t !== 'audio'){ if (hexOk(l0.stroke)) L.stroke = l0.stroke; if (isNum(+l0.sw)) L.sw = clamp(+l0.sw, 0, 200); }
    if (l0.shadow && typeof l0.shadow === 'object') L.shadow = {c:hexOk(l0.shadow.c) ? l0.shadow.c : '#00000066', b:clamp(num(l0.shadow.b, 20), 0, 200), x:clamp(num(l0.shadow.x), -500, 500), y:clamp(num(l0.shadow.y, 8), -500, 500)};
    P.layers.push(L);
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

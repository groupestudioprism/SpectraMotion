/* ---------- Modèles Studio Prism (dessinés en formes et textes : aucun fichier externe) ---------- */
const T_ = (P, o) => { const L = mkText(P, o); if (o.y != null) L.y = o.y; if (o.x != null) L.x = o.x; L.h = Math.max(measureText(L).h, 4); return L; };
const S_ = (P, k, o) => mkShape(P, k, o);
const SM_TPL = [
  {id:'promo', name:'Annonce produit', cat:'Réseaux sociaux', desc:'Publication carrée avec titre, accroche et bouton', fmt:'square', studio:'design', build(P){
    P.bg = '#140F2E';
    return [mkColor(P, '#7B2FF7', {fill2:'#14C2EC', ga:140, name:'Fond'}), S_(P, 'ellipse', {x:560, y:-120, w:700, h:700, fill:'#FFFFFF', name:'Halo', op:.12}),
      S_(P, 'ring', {x:-180, y:700, w:520, h:520, fill:'#FFC83D', op:.85, name:'Anneau'}),
      T_(P, {txt:'NOUVEAU', x:90, y:150, w:400, fs:40, fw:800, col:'#140F2E', tbg:'#FFC83D', tbgPad:.4, ls:.14, align:'l', name:'Étiquette', tin:{k:'pop', d:.6}}),
      T_(P, {txt:'Le son\nqui vous suit\npartout', x:90, y:260, w:860, fs:118, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.02, name:'Titre', tin:{k:'slideU', d:.7}}),
      T_(P, {txt:'Autonomie 40 h · Réduction de bruit active', x:90, y:690, w:860, fs:38, fw:500, col:'#E9E4FF', align:'l', name:'Accroche', tin:{k:'fade', d:.8}}),
      S_(P, 'round', {x:90, y:830, w:360, h:110, fill:'#FFFFFF', r:55, name:'Bouton', tin:{k:'zoom', d:.5}}),
      T_(P, {txt:'Découvrir →', x:90, y:850, w:360, fs:40, fw:700, col:'#140F2E', name:'Texte du bouton', tin:{k:'zoom', d:.5}})];
  }},
  {id:'quote', name:'Citation', cat:'Réseaux sociaux', desc:'Une phrase forte sur fond clair', fmt:'square', studio:'design', build(P){
    P.bg = '#F4EFE6';
    return [S_(P, 'rect', {x:90, y:90, w:900, h:900, fill:'', stroke:'#16131F', sw:3, name:'Cadre'}),
      T_(P, {txt:'“', x:120, y:150, w:300, fs:300, fw:400, font:'Playfair Display', col:'#F2387A', align:'l', name:'Guillemet'}),
      T_(P, {txt:'La simplicité est la sophistication suprême.', x:160, y:400, w:760, fs:76, fw:400, font:'Playfair Display', it:true, col:'#16131F', align:'l', lh:1.2, name:'Citation', tin:{k:'fade', d:1}}),
      S_(P, 'line', {x:160, y:760, w:120, h:6, fill:'#F2387A', name:'Trait'}),
      T_(P, {txt:'Léonard de Vinci', x:160, y:800, w:600, fs:38, fw:600, col:'#16131F', align:'l', name:'Auteur'})];
  }},
  {id:'ytthumb', name:'Miniature YouTube', cat:'Réseaux sociaux', desc:'Titre énorme, contour, couleurs franches', fmt:'thumb', studio:'design', build(P){
    P.bg = '#FFC83D';
    return [S_(P, 'tri', {x:820, y:-40, w:560, h:820, fill:'#F2387A', rot:-90, name:'Bande'}),
      S_(P, 'star', {x:900, y:330, w:300, h:300, fill:'#FFFFFF', name:'Étoile', rot:12}),
      T_(P, {txt:'5 ERREURS\nÀ ÉVITER', x:60, y:120, w:820, fs:150, fw:400, font:'Anton', col:'#FFFFFF', tstroke:'#16131F', tsw:14, align:'l', lh:1, name:'Titre'}),
      T_(P, {txt:'(la n° 3 va vous surprendre)', x:60, y:520, w:760, fs:46, fw:700, col:'#16131F', align:'l', name:'Sous-titre'})];
  }},
  {id:'sale', name:'Story soldes', cat:'Réseaux sociaux', desc:'Story verticale animée, prête pour Reels', fmt:'story', studio:'motion', dur:6, build(P){
    P.bg = '#F2387A';
    return [S_(P, 'ellipse', {x:-200, y:-200, w:900, h:900, fill:'#FF8A3D', name:'Cercle', kf:{sc:[[0, .8, 'ease'], [6, 1.1, 'ease']]}}),
      S_(P, 'ellipse', {x:500, y:1300, w:800, h:800, fill:'#7B2FF7', name:'Cercle 2', kf:{sc:[[0, 1.1, 'ease'], [6, .9, 'ease']]}}),
      T_(P, {txt:'SOLDES', x:0, y:560, w:1080, fs:230, fw:400, font:'Anton', col:'#FFFFFF', name:'Titre', tin:{k:'pop', d:.8}}),
      T_(P, {txt:'−50 %', x:0, y:830, w:1080, fs:260, fw:900, font:'Unbounded', col:'#FFC83D', name:'Remise', start:.6, dur:5.4, tin:{k:'zoom', d:.6}, kf:{sc:[[1, 1, 'ease'], [1.5, 1.08, 'ease'], [2, 1, 'ease'], [2.5, 1.08, 'ease'], [3, 1, 'ease']]}}),
      T_(P, {txt:'sur toute la boutique jusqu\'à dimanche', x:140, y:1200, w:800, fs:54, fw:600, col:'#FFFFFF', name:'Détail', start:1.2, dur:4.8, tin:{k:'slideU', d:.6}}),
      S_(P, 'round', {x:290, y:1480, w:500, h:130, fill:'#16131F', r:65, name:'Bouton', start:1.8, dur:4.2, tin:{k:'pop', d:.6}}),
      T_(P, {txt:'J\'en profite', x:290, y:1505, w:500, fs:52, fw:700, col:'#FFFFFF', name:'Texte du bouton', start:1.8, dur:4.2, tin:{k:'pop', d:.6}})];
  }},
  {id:'poster', name:'Affiche événement', cat:'Impression', desc:'Affiche A4 : date, lieu, programme', fmt:'a4', studio:'design', build(P){
    P.bg = '#0B2A4A';
    return [S_(P, 'ellipse', {x:620, y:-260, w:900, h:900, fill:'#14C2EC', fill2:'#45D69A', ga:120, name:'Soleil'}),
      S_(P, 'tri', {x:-100, y:900, w:900, h:900, fill:'#FFC83D', op:.9, name:'Triangle', rot:-12}),
      T_(P, {txt:'FESTIVAL\nDES IDÉES', x:90, y:560, w:1060, fs:150, fw:800, font:'Unbounded', col:'#FFFFFF', align:'l', lh:1.02, name:'Titre'}),
      T_(P, {txt:'12 → 14 juin 2027', x:90, y:930, w:900, fs:64, fw:700, col:'#FFC83D', align:'l', name:'Dates'}),
      T_(P, {txt:'Conférences · Ateliers · Concerts\nEntrée libre', x:90, y:1040, w:900, fs:44, fw:500, col:'#E6F6FF', align:'l', lh:1.35, name:'Programme'}),
      T_(P, {txt:'Halle aux grains · Ducey', x:90, y:1560, w:1000, fs:40, fw:700, col:'#0B2A4A', tbg:'#FFFFFF', tbgPad:.4, align:'l', name:'Lieu'})];
  }},
  {id:'banner', name:'Bannière LinkedIn', cat:'Réseaux sociaux', desc:'Couverture de profil professionnelle', fmt:'banner', studio:'design', build(P){
    P.bg = '#16131F';
    return [mkColor(P, '#16131F', {fill2:'#3D2B7A', ga:0, name:'Fond'}),
      S_(P, 'prism', {x:1180, y:-40, w:420, h:480, fill:'#7B2FF7', fill2:'#14C2EC', ga:90, op:.9, name:'Prisme'}),
      T_(P, {txt:'Conception d\'applications et d\'expériences 3D', x:420, y:120, w:760, fs:44, fw:700, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', name:'Titre'}),
      T_(P, {txt:'Web · Mobile · BIM · Réalité augmentée', x:420, y:240, w:760, fs:28, fw:500, col:'#B8B0E0', align:'l', name:'Sous-titre'})];
  }},
  {id:'intro', name:'Intro vidéo', cat:'Vidéo', desc:'Titre animé de 6 secondes', fmt:'hd', studio:'motion', dur:6, build(P){
    P.bg = '#0F0D16';
    return [S_(P, 'line', {x:0, y:520, w:1920, h:8, fill:'#7B2FF7', fill2:'#14C2EC', ga:0, name:'Trait', tin:{k:'wipe', d:1}}),
      S_(P, 'prism', {x:860, y:200, w:200, h:220, fill:'#FF3F86', fill2:'#FFC83D', ga:45, name:'Prisme', tin:{k:'pop', d:.8}, kf:{rot:[[0, 0, 'ease'], [6, 20, 'ease']]}}),
      T_(P, {txt:'VOTRE CHAÎNE', x:160, y:600, w:1600, fs:150, fw:800, font:'Unbounded', col:'#FFFFFF', name:'Titre', start:.6, dur:5.4, tin:{k:'type', d:1.2}, tout:{k:'fade', d:.6}}),
      T_(P, {txt:'Épisode 1 · Les débuts', x:160, y:820, w:1600, fs:56, fw:500, col:'#B8B0E0', name:'Sous-titre', start:1.8, dur:4.2, tin:{k:'slideU', d:.7}, tout:{k:'fade', d:.6}})];
  }},
  {id:'lower', name:'Bandeau titre', cat:'Vidéo', desc:'Nom et fonction en bas d\'écran, animé', fmt:'hd', studio:'motion', dur:5, build(P){
    P.bg = '#2A2638';
    return [S_(P, 'rect', {x:120, y:820, w:820, h:150, fill:'#FFFFFF', name:'Fond du bandeau', tin:{k:'wipe', d:.6}, tout:{k:'wipe', d:.5}}),
      S_(P, 'rect', {x:120, y:820, w:18, h:150, fill:'#6D3BFF', name:'Accent', tin:{k:'slideL', d:.5}, tout:{k:'fade', d:.4}}),
      T_(P, {txt:'Camille Martin', x:170, y:835, w:740, fs:62, fw:800, col:'#16131F', align:'l', name:'Nom', start:.3, dur:4.7, tin:{k:'slideU', d:.5}, tout:{k:'fade', d:.4}}),
      T_(P, {txt:'Directrice artistique · Studio Prism', x:170, y:915, w:740, fs:34, fw:500, col:'#5B5B66', align:'l', name:'Fonction', start:.5, dur:4.5, tin:{k:'fade', d:.6}, tout:{k:'fade', d:.4}})];
  }},
  {id:'outro', name:'Fin de vidéo', cat:'Vidéo', desc:'Remerciement et appel à s\'abonner', fmt:'hd', studio:'motion', dur:6, build(P){
    P.bg = '#16131F';
    return [mkColor(P, '#16131F', {fill2:'#2B1F5C', ga:90, name:'Fond'}),
      T_(P, {txt:'Merci d\'avoir regardé !', x:160, y:330, w:1600, fs:120, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', name:'Titre', tin:{k:'zoom', d:.8}}),
      S_(P, 'round', {x:710, y:620, w:500, h:130, fill:'#F2387A', r:65, name:'Bouton', start:.8, dur:5.2, tin:{k:'pop', d:.7}, kf:{sc:[[1.5, 1, 'ease'], [2, 1.07, 'ease'], [2.5, 1, 'ease'], [3, 1.07, 'ease'], [3.5, 1, 'ease']]}}),
      T_(P, {txt:'S\'abonner', x:710, y:648, w:500, fs:56, fw:700, col:'#FFFFFF', name:'Texte du bouton', start:.8, dur:5.2, tin:{k:'pop', d:.7}, kf:{sc:[[1.5, 1, 'ease'], [2, 1.07, 'ease'], [2.5, 1, 'ease'], [3, 1.07, 'ease'], [3.5, 1, 'ease']]}})];
  }},
  {id:'tips', name:'Reel « 3 astuces »', cat:'Vidéo', desc:'Vidéo verticale qui enchaîne trois messages', fmt:'vertical', studio:'motion', dur:9, build(P){
    P.bg = '#E8E4F2';
    const out = [T_(P, {txt:'3 astuces\npour mieux dormir', x:90, y:260, w:900, fs:110, fw:800, font:'Bricolage Grotesque', col:'#16131F', align:'l', lh:1.05, name:'Titre', tin:{k:'slideU', d:.6}})];
    ['Couchez-vous à heure fixe', 'Pas d\'écran 1 h avant', 'Une chambre fraîche, à 18 °C'].forEach((t, i) => {
      const s = 1 + i * 2.6;
      out.push(S_(P, 'round', {x:90, y:820 + i * 300, w:900, h:240, fill:['#6D3BFF', '#14C2EC', '#FF8A3D'][i], r:40, name:'Carte ' + (i + 1), start:s, dur:9 - s, tin:{k:'slideR', d:.6}}));
      out.push(T_(P, {txt:`${i + 1}. ${t}`, x:140, y:880 + i * 300, w:800, fs:58, fw:700, col:'#FFFFFF', align:'l', name:'Astuce ' + (i + 1), start:s + .2, dur:8.8 - s, tin:{k:'fade', d:.5}}));
    });
    return out;
  }},
  {id:'podcast', name:'Extrait de podcast', cat:'Audio', desc:'Visuel animé pour partager un extrait sonore', fmt:'square', studio:'audio', dur:15, build(P){
    P.bg = '#101018';
    const out = [S_(P, 'round', {x:90, y:90, w:900, h:900, fill:'#1C1830', r:60, name:'Carte'}),
      T_(P, {txt:'LE PODCAST DU STUDIO', x:150, y:170, w:780, fs:34, fw:700, col:'#14C2EC', ls:.12, align:'l', name:'Émission'}),
      T_(P, {txt:'Épisode 12 · Créer sans se perdre', x:150, y:240, w:780, fs:72, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.05, name:'Titre'})];
    for (let i = 0; i < 14; i++){ const h = 60 + ((i * 37) % 7) * 28;
      out.push(S_(P, 'round', {x:150 + i * 56, y:760 - h / 2, w:34, h, r:17, fill:i % 2 ? '#7B2FF7' : '#14C2EC', name:'Barre ' + (i + 1), dur:15, kf:{sc:[...Array(16)].map((_, k) => [k, k % 2 === i % 2 ? 1 : .55, 'ease'])}})); }
    out.push(T_(P, {txt:'Ajoutez votre extrait sonore dans le panneau Audio', x:150, y:880, w:780, fs:28, fw:500, col:'#9590AC', align:'l', name:'Consigne'}));
    return out;
  }},
  {id:'frame', name:'Cadre photo', cat:'Photo', desc:'Cadre blanc et légende manuscrite', fmt:'portrait', studio:'photo', build(P){
    P.bg = '#E8E4F2';
    return [S_(P, 'rect', {x:110, y:110, w:860, h:1130, fill:'#FFFFFF', name:'Cadre', shadow:{c:'#16131F33', b:40, x:0, y:16}}),
      S_(P, 'rect', {x:160, y:160, w:760, h:860, fill:'#D5D1E2', name:'Emplacement photo'}),
      T_(P, {txt:'Glissez une photo ici', x:160, y:560, w:760, fs:40, fw:600, col:'#7B7690', name:'Consigne'}),
      T_(P, {txt:'Été 2026 · Bretagne', x:160, y:1060, w:760, fs:70, fw:400, font:'Caveat', col:'#16131F', name:'Légende'})];
  }},
  {id:'greet', name:'Carte de vœux', cat:'Impression', desc:'Carte au format portrait', fmt:'portrait', studio:'design', build(P){
    P.bg = '#7A1F3D';
    const out = [];
    for (let i = 0; i < 18; i++) out.push(S_(P, 'star', {x:(i * 197) % 1000, y:(i * 311) % 1300, w:20 + (i % 4) * 14, h:20 + (i % 4) * 14, fill:'#FFC83D', op:.35 + (i % 3) * .2, name:'Étoile ' + (i + 1)}));
    out.push(T_(P, {txt:'Meilleurs vœux', x:90, y:480, w:900, fs:130, fw:400, font:'Pacifico', col:'#FFFFFF', name:'Titre'}),
      T_(P, {txt:'Que 2027 vous apporte de belles idées', x:140, y:760, w:800, fs:44, fw:500, col:'#FFE3EC', name:'Message'}));
    return out;
  }},
];
/* projet complet à partir d'un modèle */
function tplProject(t){
  const P = newProject(t.studio || 'design', t.fmt); P.title = t.name; if (t.dur) P.dur = t.dur;
  P.layers = t.build(P).map((L, i) => { L.track = i; if (!t.studio || !TIMED(t.studio)) { L.start = 0; L.dur = P.dur; } else { if (L.dur > P.dur - (L.start || 0)) L.dur = P.dur - (L.start || 0); } return L; });
  if (TIMED(P.studio)) syncDur(P);
  return P;
}
const TPL_THUMBS = {};
function tplThumb(t){ if (TPL_THUMBS[t.id]) return TPL_THUMBS[t.id]; try { const P = tplProject(t); return TPL_THUMBS[t.id] = thumbOf(P, TIMED(P.studio) ? Math.min(P.dur * .6, 3) : 0, 280, .7); } catch(e){ console.warn(e); return ''; } }

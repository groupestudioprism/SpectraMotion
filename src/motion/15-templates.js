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
const I_ = (P, ic, o) => mkIcon(P, ic, o);
const C_ = (P, ck, o) => mkChart(P, ck, o);
const Q_ = (P, txt, o) => mkQr(P, txt, o);
const F_ = (P, k, o) => mkShape(P, k, {name:'Cadre photo', slot:true, fill:'', ...o});
SM_TPL.push(
  {id:'carousel', name:'Carrousel Instagram', cat:'Réseaux sociaux', desc:'5 pages : couverture, 3 conseils, appel à l\'action', fmt:'portrait', studio:'design', tags:'slides pages swipe', pages:5, buildPages(P){
    const bg = '#FFF6EC', ac = '#FF5D3A', ink = '#1E1B2E', out = [];
    out.push({bg, layers:[S_(P, 'blob', {x:560, y:-160, w:700, h:700, fill:'#FFD9C7', name:'Forme'}), T_(P, {txt:'GUIDE', x:90, y:140, w:400, fs:38, fw:800, col:ac, ls:.2, align:'l', name:'Surtitre'}),
      T_(P, {txt:'5 habitudes\npour mieux\ntravailler', x:90, y:230, w:900, fs:120, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', lh:1.02, name:'Titre'}),
      T_(P, {txt:'Faites glisser →', x:90, y:1150, w:600, fs:40, fw:600, col:ink, align:'l', name:'Consigne'}), I_(P, 'arrowR', {x:880, y:1120, w:110, h:110, col:'#FFFFFF', bgc:ac, sw:2.2, name:'Flèche'})]});
    [['Planifiez la veille', 'Trois tâches importantes, pas plus. Le matin, commencez par la plus difficile.', 'calendar'], ['Coupez les notifications', 'Deux plages par jour pour les messages : le reste du temps, concentration.', 'bell'], ['Faites des pauses', '5 minutes toutes les 50 minutes : marchez, buvez de l\'eau, regardez au loin.', 'coffee']].forEach(([t, d, ic], i) => {
      out.push({bg, layers:[T_(P, {txt:String(i + 1).padStart(2, '0'), x:90, y:120, w:500, fs:220, fw:900, font:'Unbounded', col:'#FFD9C7', align:'l', name:'Numéro'}),
        I_(P, ic, {x:800, y:160, w:190, h:190, col:ac, sw:1.8, name:'Icône'}), T_(P, {txt:t, x:90, y:520, w:900, fs:86, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', lh:1.05, name:'Titre'}),
        T_(P, {txt:d, x:90, y:760, w:880, fs:44, fw:400, col:'#4A4560', align:'l', lh:1.4, name:'Texte'}), S_(P, 'line', {x:90, y:1180, w:900, h:6, fill:'#FFD9C7', name:'Progression'}), S_(P, 'line', {x:90, y:1180, w:900 * (i + 2) / 5, h:6, fill:ac, name:'Progression active'})]});
    });
    out.push({bg:ac, layers:[T_(P, {txt:'Ça vous a aidé ?', x:90, y:380, w:900, fs:110, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', name:'Titre'}),
      T_(P, {txt:'Enregistrez ce post et partagez-le à quelqu\'un qui en a besoin.', x:140, y:640, w:800, fs:46, fw:500, col:'#FFFFFF', lh:1.35, name:'Texte'}),
      I_(P, 'bookmark', {x:350, y:900, w:150, h:150, col:ac, bgc:'#FFFFFF', name:'Enregistrer'}), I_(P, 'share', {x:580, y:900, w:150, h:150, col:ac, bgc:'#FFFFFF', name:'Partager'})]});
    return out;
  }},
  {id:'deck', name:'Présentation', cat:'Présentations', desc:'5 diapositives : titre, sommaire, chiffres, citation, fin', fmt:'slide', studio:'design', tags:'slides diaporama réunion', pages:5, buildPages(P){
    const ink = '#101828', ac = '#3D63FF', bg = '#FFFFFF';
    return [
      {bg:'#0B1B3F', layers:[S_(P, 'ellipse', {x:1180, y:-300, w:1100, h:1100, fill:'#3D63FF', fill2:'#14C2EC', ga:120, name:'Forme'}), T_(P, {txt:'Bilan annuel 2026', x:140, y:380, w:1100, fs:120, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', name:'Titre'}),
        T_(P, {txt:'Équipe projet · Réunion du 15 janvier', x:140, y:560, w:1100, fs:46, fw:500, col:'#B6C4E8', align:'l', name:'Sous-titre'})]},
      {bg, layers:[T_(P, {txt:'Au programme', x:140, y:130, w:1200, fs:84, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', name:'Titre'}),
        ...['Résultats de l\'année', 'Projets livrés', 'Priorités 2027', 'Questions'].flatMap((t, i) => [S_(P, 'ellipse', {x:140, y:330 + i * 150, w:90, h:90, fill:i ? '#E8EDFF' : ac, name:'Puce'}), T_(P, {txt:String(i + 1), x:140, y:345 + i * 150, w:90, fs:44, fw:800, col:i ? ac : '#FFFFFF', name:'Numéro'}), T_(P, {txt:t, x:280, y:345 + i * 150, w:1200, fs:54, fw:600, col:ink, align:'l', name:'Point'})])]},
      {bg, layers:[T_(P, {txt:'+38 % de chiffre d\'affaires', x:140, y:110, w:1640, fs:84, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', name:'Titre'}),
        C_(P, 'col', {x:140, y:300, w:1040, h:640, data:[['T1', 120], ['T2', 145], ['T3', 162], ['T4', 210]], pal:[ac, ac, ac, '#14C2EC'], unit:'k€', name:'Graphique'}),
        C_(P, 'prog', {x:1300, y:330, w:480, h:480, data:[['Objectif atteint', 92]], pal:['#14C2EC'], name:'Jauge'}), T_(P, {txt:'Objectif annuel', x:1300, y:850, w:480, fs:40, fw:600, col:'#475467', name:'Légende'})]},
      {bg:'#F2F4F7', layers:[I_(P, 'quote', {x:140, y:200, w:160, h:160, col:ac, sw:2, name:'Guillemets'}), T_(P, {txt:'La qualité n\'est jamais un accident ; c\'est toujours le résultat d\'un effort intelligent.', x:140, y:400, w:1500, fs:76, fw:400, font:'Fraunces', it:true, col:ink, align:'l', lh:1.25, name:'Citation'}),
        T_(P, {txt:'John Ruskin', x:140, y:760, w:900, fs:44, fw:700, col:ac, align:'l', name:'Auteur'})]},
      {bg:ac, layers:[T_(P, {txt:'Merci !', x:0, y:380, w:1920, fs:180, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', name:'Titre'}), T_(P, {txt:'Des questions ?', x:0, y:620, w:1920, fs:60, fw:500, col:'#E0E7FF', name:'Sous-titre'})]},
    ];
  }},
  {id:'bizcard', name:'Carte de visite', cat:'Marque', desc:'85 × 55 mm avec QR code vers votre site', fmt:'card', studio:'design', tags:'business impression qr', build(P){
    P.bg = '#FFFFFF';
    return [S_(P, 'rect', {x:0, y:0, w:22, h:600, fill:'#7B2FF7', fill2:'#14C2EC', ga:90, name:'Bande'}), T_(P, {txt:'Camille Martin', x:90, y:90, w:640, fs:64, fw:800, font:'Bricolage Grotesque', col:'#16131F', align:'l', name:'Nom'}),
      T_(P, {txt:'Directrice de projet', x:90, y:175, w:640, fs:34, fw:500, col:'#7B2FF7', align:'l', name:'Fonction'}),
      ...[['phone', '06 12 34 56 78'], ['mail', 'camille@exemple.fr'], ['globe', 'www.exemple.fr'], ['pin', '12 rue des Lilas, 50220 Ducey']].flatMap(([ic, t], i) => [I_(P, ic, {x:90, y:290 + i * 66, w:44, h:44, col:'#7B2FF7', sw:2, name:'Icône'}), T_(P, {txt:t, x:150, y:292 + i * 66, w:560, fs:28, fw:500, col:'#3A3550', align:'l', name:'Coordonnée'})]),
      Q_(P, 'https://www.exemple.fr', {x:760, y:300, w:220, h:220, col:'#16131F', name:'QR code'})];
  }},
  {id:'flyer', name:'Flyer promotionnel', cat:'Impression', desc:'A5 : offre, avantages, QR code', fmt:'a5', studio:'design', tags:'prospectus publicité qr', build(P){
    P.bg = '#14213D';
    return [S_(P, 'burst', {x:520, y:60, w:300, h:300, fill:'#FCA311', rot:12, name:'Badge'}), T_(P, {txt:'−30 %', x:520, y:160, w:300, fs:78, fw:900, font:'Unbounded', col:'#14213D', rot:12, name:'Remise'}),
      T_(P, {txt:'Grande\nouverture', x:60, y:380, w:760, fs:120, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1, name:'Titre'}),
      T_(P, {txt:'Votre nouvelle boutique de quartier ouvre ses portes le samedi 4 avril.', x:60, y:660, w:740, fs:36, fw:400, col:'#E5E5E5', align:'l', lh:1.4, name:'Texte'}),
      ...['Produits locaux', 'Livraison offerte', 'Ouvert 7 j / 7'].flatMap((t, i) => [I_(P, 'checkc', {x:60, y:830 + i * 80, w:56, h:56, col:'#FCA311', sw:2, name:'Coche'}), T_(P, {txt:t, x:140, y:834 + i * 80, w:600, fs:38, fw:600, col:'#FFFFFF', align:'l', name:'Avantage'})]),
      Q_(P, 'https://www.exemple.fr', {x:600, y:1000, w:210, h:210, col:'#14213D', bgc:'#FFFFFF', name:'QR code'}), T_(P, {txt:'Scannez pour l\'itinéraire', x:60, y:1110, w:520, fs:30, fw:500, col:'#FCA311', align:'l', name:'Consigne'})];
  }},
  {id:'menu', name:'Menu restaurant', cat:'Impression', desc:'Format long : entrées, plats, desserts', fmt:'menu', studio:'design', tags:'carte cuisine bistrot', build(P){
    P.bg = '#F7F1E8'; const ink = '#2B2118', ac = '#A3472F', out = [S_(P, 'rect', {x:50, y:50, w:1140, h:2380, fill:'', stroke:ink, sw:3, name:'Cadre'}),
      T_(P, {txt:'Le Bistrot', x:0, y:140, w:1240, fs:130, fw:400, font:'Great Vibes', col:ac, name:'Nom'}), T_(P, {txt:'MENU DU JOUR', x:0, y:330, w:1240, fs:40, fw:700, col:ink, ls:.3, name:'Sous-titre'})];
    const sec = [['Entrées', [['Velouté de potimarron', '8 €'], ['Œuf parfait, crème de cèpes', '10 €'], ['Tartare de saumon', '12 €']]], ['Plats', [['Filet de bar, beurre blanc', '22 €'], ['Pavé de bœuf, frites maison', '24 €'], ['Risotto aux champignons', '18 €']]], ['Desserts', [['Tarte fine aux pommes', '8 €'], ['Mousse au chocolat', '7 €'], ['Café gourmand', '9 €']]]];
    let y = 520;
    for (const [h, items] of sec){ out.push(T_(P, {txt:h, x:0, y, w:1240, fs:72, fw:400, font:'Playfair Display', it:true, col:ac, name:h}), S_(P, 'line', {x:520, y:y + 110, w:200, h:4, fill:ac, name:'Trait'})); y += 170;
      for (const [n, pr] of items){ out.push(T_(P, {txt:n, x:150, y, w:760, fs:42, fw:500, col:ink, align:'l', name:'Plat'}), T_(P, {txt:pr, x:900, y, w:190, fs:42, fw:700, col:ink, align:'r', name:'Prix'})); y += 95; } y += 110; }
    out.push(T_(P, {txt:'Produits frais et de saison · Fait maison', x:0, y:2260, w:1240, fs:32, fw:500, col:'#6B5B4D', name:'Pied'}));
    return out;
  }},
  {id:'certificate', name:'Diplôme', cat:'Impression', desc:'Certificat A4 paysage avec médaille', fmt:'a4l', studio:'design', tags:'attestation récompense', build(P){
    P.bg = '#FFFDF7'; const gold = '#B8892E', ink = '#1B2A41';
    return [S_(P, 'rect', {x:50, y:50, w:1654, h:1140, fill:'', stroke:gold, sw:8, name:'Cadre'}), S_(P, 'rect', {x:80, y:80, w:1594, h:1080, fill:'', stroke:gold, sw:2, name:'Cadre fin'}),
      T_(P, {txt:'CERTIFICAT', x:0, y:180, w:1754, fs:110, fw:700, font:'Cinzel', col:ink, ls:.12, name:'Titre'}), T_(P, {txt:'de réussite', x:0, y:320, w:1754, fs:64, fw:400, font:'Great Vibes', col:gold, name:'Sous-titre'}),
      T_(P, {txt:'Décerné à', x:0, y:470, w:1754, fs:38, fw:500, col:'#5B6475', name:'Mention'}), T_(P, {txt:'Prénom Nom', x:0, y:540, w:1754, fs:110, fw:400, font:'Great Vibes', col:ink, name:'Nom'}),
      S_(P, 'line', {x:477, y:700, w:800, h:3, fill:gold, name:'Trait'}), T_(P, {txt:'pour la réussite de la formation « Sécurité sur chantier » — session de mars 2027', x:277, y:740, w:1200, fs:36, fw:400, col:'#3B4252', lh:1.4, name:'Motif'}),
      I_(P, 'medal', {x:807, y:880, w:140, h:140, col:gold, sw:1.6, name:'Médaille'}), T_(P, {txt:'Date', x:240, y:960, w:400, fs:32, fw:600, col:ink, name:'Date'}), T_(P, {txt:'Signature', x:1114, y:960, w:400, fs:32, fw:600, col:ink, name:'Signature'}),
      S_(P, 'line', {x:240, y:940, w:400, h:2, fill:ink, name:'Ligne date'}), S_(P, 'line', {x:1114, y:940, w:400, h:2, fill:ink, name:'Ligne signature'})];
  }},
  {id:'chantier', name:'Panneau de chantier', cat:'Impression', desc:'Information riverains : travaux, durée, contact, QR', fmt:'a3', studio:'design', tags:'travaux btp voirie réseaux riverains', build(P){
    P.bg = '#FFFFFF'; const y = '#FFC300', ink = '#1C1C1C';
    return [S_(P, 'rect', {x:0, y:0, w:1754, h:520, fill:y, name:'Bandeau'}), I_(P, 'cone', {x:110, y:110, w:300, h:300, col:ink, sw:1.6, name:'Cône'}),
      T_(P, {txt:'TRAVAUX\nEN COURS', x:470, y:110, w:1200, fs:150, fw:400, font:'Anton', col:ink, align:'l', lh:1, name:'Titre'}),
      T_(P, {txt:'Renouvellement du réseau d\'eau potable', x:110, y:620, w:1540, fs:76, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', lh:1.1, name:'Objet'}),
      ...[['calendar', 'Du 2 mars au 30 avril 2027'], ['clock', 'Lundi au vendredi, 8 h – 17 h'], ['car', 'Circulation alternée\nStationnement interdit'], ['phone', 'Contact chantier\n02 33 00 00 00']].flatMap(([ic, t], i) => [I_(P, ic, {x:110, y:900 + i * 270, w:150, h:150, col:ink, bgc:y, bgs:'round', sw:1.8, name:'Icône'}), T_(P, {txt:t, x:310, y:t.includes('\n') ? 895 + i * 270 : 940 + i * 270, w:900, fs:64, fw:700, col:ink, align:'l', lh:1.2, name:'Information'})]),
      Q_(P, 'https://www.exemple.fr/travaux', {x:1240, y:1500, w:420, h:420, name:'QR code'}), T_(P, {txt:'Suivre l\'avancement', x:1200, y:1950, w:500, fs:38, fw:600, col:ink, name:'Légende QR'}),
      S_(P, 'rect', {x:0, y:2280, w:1754, h:200, fill:ink, name:'Pied'}), T_(P, {txt:'Nous vous prions de nous excuser pour la gêne occasionnée.', x:0, y:2345, w:1754, fs:44, fw:500, col:'#FFFFFF', name:'Excuse'})];
  }},
  {id:'cv', name:'CV moderne', cat:'Impression', desc:'A4 : profil, expériences, compétences', fmt:'a4', studio:'design', tags:'curriculum emploi candidature', build(P){
    P.bg = '#FFFFFF'; const ac = '#2F6B4F', ink = '#1D2939';
    const out = [S_(P, 'rect', {x:0, y:0, w:420, h:1754, fill:'#EEF5F0', name:'Colonne'}), F_(P, 'ellipse', {x:85, y:90, w:250, h:250, name:'Photo'}),
      T_(P, {txt:'Alex Durand', x:470, y:110, w:700, fs:78, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', name:'Nom'}), T_(P, {txt:'Conducteur de travaux', x:470, y:215, w:700, fs:40, fw:500, col:ac, align:'l', name:'Poste'}),
      ...[['phone', '06 00 00 00 00'], ['mail', 'alex@exemple.fr'], ['pin', 'Normandie']].flatMap(([ic, t], i) => [I_(P, ic, {x:60, y:420 + i * 70, w:42, h:42, col:ac, name:'Icône'}), T_(P, {txt:t, x:115, y:423 + i * 70, w:290, fs:26, fw:500, col:ink, align:'l', name:'Contact'})]),
      T_(P, {txt:'COMPÉTENCES', x:60, y:680, w:320, fs:28, fw:800, col:ac, ls:.15, align:'l', name:'Titre compétences'})];
    [['Planification', 90], ['Encadrement', 80], ['AutoCAD / BIM', 70], ['Sécurité', 95]].forEach(([n, v], i) => { out.push(T_(P, {txt:n, x:60, y:750 + i * 95, w:320, fs:26, fw:600, col:ink, align:'l', name:n}), S_(P, 'round', {x:60, y:795 + i * 95, w:300, h:12, r:6, fill:'#D0E3D6', name:'Jauge'}), S_(P, 'round', {x:60, y:795 + i * 95, w:300 * v / 100, h:12, r:6, fill:ac, name:'Niveau'})); });
    out.push(T_(P, {txt:'EXPÉRIENCES', x:470, y:400, w:700, fs:30, fw:800, col:ac, ls:.15, align:'l', name:'Titre expériences'}));
    [['2021 – aujourd\'hui', 'Conducteur de travaux · Réseaux humides', 'Pilotage de chantiers AEP et assainissement, équipes de 12 personnes, budgets jusqu\'à 2 M€.'], ['2017 – 2021', 'Chef de chantier · VRD', 'Voiries, terrassements, réseaux secs et humides ; relation avec les collectivités.'], ['2015 – 2017', 'Technicien bureau d\'études', 'Plans d\'exécution, métrés, dossiers de consultation.']].forEach(([d, t, x], i) => {
      const y0 = 470 + i * 260; out.push(T_(P, {txt:d, x:470, y:y0, w:700, fs:26, fw:600, col:'#667085', align:'l', name:'Dates'}), T_(P, {txt:t, x:470, y:y0 + 45, w:700, fs:34, fw:800, col:ink, align:'l', name:'Poste'}), T_(P, {txt:x, x:470, y:y0 + 100, w:700, fs:26, fw:400, col:'#475467', align:'l', lh:1.4, name:'Description'})); });
    out.push(T_(P, {txt:'FORMATION', x:470, y:1300, w:700, fs:30, fw:800, col:ac, ls:.15, align:'l', name:'Titre formation'}), T_(P, {txt:'BTS Travaux publics · 2015', x:470, y:1370, w:700, fs:32, fw:600, col:ink, align:'l', name:'Diplôme'}));
    return out;
  }},
  {id:'invite', name:'Invitation de mariage', cat:'Impression', desc:'Faire-part élégant 5 × 7', fmt:'invite', studio:'design', tags:'mariage faire-part fête', build(P){
    P.bg = '#FBF7F2'; const g = '#B5835A', ink = '#3B2F2F';
    return [S_(P, 'arch', {x:200, y:160, w:1100, h:1780, fill:'', stroke:g, sw:4, name:'Arche'}), I_(P, 'leaf', {x:650, y:290, w:200, h:200, col:g, sw:1.4, name:'Feuillage'}),
      T_(P, {txt:'Nous nous marions', x:200, y:560, w:1100, fs:56, fw:500, col:ink, ls:.08, name:'Annonce'}), T_(P, {txt:'Léa\n&\nThomas', x:200, y:700, w:1100, fs:170, fw:400, font:'Great Vibes', col:g, lh:1, name:'Prénoms'}),
      T_(P, {txt:'SAMEDI 12 JUIN 2027 · 15 H', x:200, y:1340, w:1100, fs:46, fw:600, col:ink, ls:.12, name:'Date'}), T_(P, {txt:'Domaine des Tilleuls\nDucey-les-Chéris', x:200, y:1460, w:1100, fs:44, fw:400, font:'Cormorant Garamond', it:true, col:ink, lh:1.3, name:'Lieu'})];
  }},
  {id:'birthday', name:'Anniversaire', cat:'Réseaux sociaux', desc:'Carte ou publication festive', fmt:'square', studio:'design', tags:'fête invitation', build(P){
    P.bg = '#FFE5F1'; const out = [];
    [['balloon', 80, 80, '#FF3F86'], ['balloon', 840, 120, '#7B2FF7'], ['gift', 820, 800, '#FF8A3D'], ['cake', 90, 800, '#14C2EC'], ['sparkle', 470, 70, '#FFC83D']].forEach(([ic, x, y, c]) => out.push(I_(P, ic, {x, y, w:170, h:170, col:c, sw:1.8, name:'Décor'})));
    out.push(T_(P, {txt:'Joyeux', x:0, y:330, w:1080, fs:110, fw:400, font:'Pacifico', col:'#7B2FF7', name:'Titre 1'}), T_(P, {txt:'ANNIVERSAIRE', x:20, y:490, w:1040, fs:88, fw:900, font:'Unbounded', col:'#FF3F86', col2:'#FF8A3D', name:'Titre 2', tfx:{k:'splice', c:'#FFC83D', d:60}}),
      T_(P, {txt:'Emma fête ses 30 ans !', x:0, y:660, w:1080, fs:50, fw:600, col:'#3B2F4A', name:'Texte'}));
    return out;
  }},
  {id:'hiring', name:'On recrute', cat:'Réseaux sociaux', desc:'Offre d\'emploi pour LinkedIn et Instagram', fmt:'square', studio:'design', tags:'emploi recrutement job', build(P){
    P.bg = '#0F172A';
    return [S_(P, 'rect', {x:60, y:60, w:960, h:960, fill:'', stroke:'#334155', sw:3, r:40, k:'round', name:'Cadre'}), I_(P, 'megaphone', {x:110, y:110, w:150, h:150, col:'#0F172A', bgc:'#FACC15', name:'Icône'}),
      T_(P, {txt:'ON RECRUTE', x:110, y:320, w:860, fs:120, fw:400, font:'Anton', col:'#FACC15', align:'l', name:'Titre'}), T_(P, {txt:'Chef de chantier\nréseaux (H/F)', x:110, y:480, w:860, fs:76, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.05, name:'Poste'}),
      T_(P, {txt:'CDI · Manche (50) · Expérience 3 ans', x:110, y:700, w:860, fs:40, fw:500, col:'#CBD5E1', align:'l', name:'Détails'}), S_(P, 'round', {x:110, y:830, w:460, h:110, r:55, fill:'#FACC15', name:'Bouton'}),
      T_(P, {txt:'Postuler →', x:110, y:850, w:460, fs:42, fw:800, col:'#0F172A', name:'Texte du bouton'})];
  }},
  {id:'stats', name:'Chiffres clés', cat:'Réseaux sociaux', desc:'Infographie carrée avec graphique', fmt:'lipost', studio:'design', tags:'statistiques données bilan', build(P){
    P.bg = '#F8FAFC'; const ink = '#0F172A';
    return [T_(P, {txt:'Notre année en chiffres', x:90, y:90, w:1020, fs:76, fw:800, font:'Bricolage Grotesque', col:ink, align:'l', name:'Titre'}),
      C_(P, 'col', {x:90, y:260, w:1020, h:520, data:[['2022', 48], ['2023', 61], ['2024', 75], ['2025', 92], ['2026', 118]], pal:['#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8', '#7B2FF7'], name:'Chantiers livrés'}),
      ...[['118', 'chantiers livrés'], ['42 km', 'de réseaux posés'], ['98 %', 'de clients satisfaits']].flatMap(([n, t], i) => [T_(P, {txt:n, x:90 + i * 345, y:860, w:330, fs:84, fw:900, font:'Unbounded', col:'#7B2FF7', align:'l', name:'Chiffre'}), T_(P, {txt:t, x:90 + i * 345, y:980, w:320, fs:34, fw:500, col:'#475569', align:'l', name:'Libellé'})])];
  }},
  {id:'testimonial', name:'Avis client', cat:'Réseaux sociaux', desc:'Témoignage avec étoiles', fmt:'square', studio:'design', tags:'témoignage note étoiles', build(P){
    P.bg = '#FFF8E7';
    return [...[0, 1, 2, 3, 4].map(i => I_(P, 'star', {x:300 + i * 100, y:180, w:80, h:80, col:'#F59E0B', sw:2, name:'Étoile'})),
      T_(P, {txt:'« Équipe réactive, chantier propre et délais tenus. Je recommande sans hésiter ! »', x:120, y:330, w:840, fs:62, fw:400, font:'Fraunces', it:true, col:'#1F2937', lh:1.3, name:'Avis'}),
      F_(P, 'ellipse', {x:470, y:720, w:140, h:140, name:'Photo du client'}), T_(P, {txt:'Sophie L.', x:0, y:890, w:1080, fs:44, fw:800, col:'#1F2937', name:'Nom'}), T_(P, {txt:'Cliente à Avranches', x:0, y:950, w:1080, fs:32, fw:500, col:'#6B7280', name:'Lieu'})];
  }},
  {id:'giveaway', name:'Jeu concours', cat:'Réseaux sociaux', desc:'Concours Instagram en 3 étapes', fmt:'square', studio:'design', tags:'concours cadeau gagner', build(P){
    P.bg = '#4F46E5';
    return [S_(P, 'burst', {x:-120, y:-120, w:520, h:520, fill:'#818CF8', name:'Badge'}), I_(P, 'gift', {x:60, y:60, w:200, h:200, col:'#FFFFFF', sw:1.8, name:'Cadeau'}),
      T_(P, {txt:'CONCOURS', x:300, y:110, w:720, fs:110, fw:400, font:'Anton', col:'#FFFFFF', align:'l', name:'Titre'}), T_(P, {txt:'Gagnez une box découverte', x:300, y:260, w:720, fs:46, fw:600, col:'#E0E7FF', align:'l', name:'Lot'}),
      ...[['heart', 'Aimez ce post'], ['user', 'Abonnez-vous au compte'], ['chat', 'Identifiez 2 amis']].flatMap(([ic, t], i) => [S_(P, 'round', {x:110, y:440 + i * 170, w:860, h:140, r:70, fill:'#FFFFFF', name:'Étape'}), I_(P, ic, {x:140, y:465 + i * 170, w:90, h:90, col:'#4F46E5', name:'Icône'}), T_(P, {txt:`${i + 1}. ${t}`, x:260, y:478 + i * 170, w:680, fs:46, fw:700, col:'#1E1B4B', align:'l', name:'Consigne'})]),
      T_(P, {txt:'Tirage au sort le 30 avril', x:0, y:970, w:1080, fs:34, fw:500, col:'#E0E7FF', name:'Date'})];
  }},
  {id:'igquote2', name:'Citation moderne', cat:'Réseaux sociaux', desc:'Dégradé, guillemets et texte en arc', fmt:'square', studio:'design', tags:'inspiration motivation', build(P){
    P.bg = '#111827';
    return [mkColor(P, '#7B2FF7', {fill2:'#FF3F86', ga:135, name:'Fond'}), T_(P, {txt:'PENSÉE DU JOUR · PENSÉE DU JOUR ·', x:240, y:120, w:600, fs:34, fw:700, col:'#FFFFFF', curve:60, ls:.1, name:'Texte en arc'}),
      I_(P, 'quote', {x:440, y:300, w:200, h:200, col:'#FFFFFF', sw:1.6, name:'Guillemets'}), T_(P, {txt:'Fais de ta vie un rêve, et d\'un rêve, une réalité.', x:110, y:540, w:860, fs:74, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', lh:1.15, name:'Citation', tfx:{k:'lift', c:'#000000', d:50}}),
      T_(P, {txt:'Antoine de Saint-Exupéry', x:0, y:880, w:1080, fs:36, fw:500, col:'#FCE7F3', name:'Auteur'})];
  }},
  {id:'eventstory', name:'Story événement', cat:'Réseaux sociaux', desc:'Date, lieu, inscription par QR code', fmt:'story', studio:'motion', dur:7, tags:'atelier conférence webinaire', build(P){
    P.bg = '#0B132B';
    return [S_(P, 'ellipse', {x:-300, y:-200, w:1100, h:1100, fill:'#1C2541', name:'Halo', kf:{sc:[[0, 1, 'ease'], [7, 1.1, 'ease']]}}), T_(P, {txt:'ATELIER', x:90, y:300, w:900, fs:50, fw:800, col:'#5BC0BE', ls:.3, align:'l', name:'Surtitre', tin:{k:'block', d:1, c:'#5BC0BE'}}),
      T_(P, {txt:'Créer ses visuels\nsans être graphiste', x:90, y:400, w:900, fs:110, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.05, name:'Titre', start:.4, dur:6.6, tin:{k:'words', d:1.4}}),
      ...[['calendar', 'Jeudi 18 mars · 18 h'], ['pin', 'Médiathèque, Avranches']].flatMap(([ic, t], i) => [I_(P, ic, {x:90, y:900 + i * 130, w:90, h:90, col:'#0B132B', bgc:'#5BC0BE', name:'Icône', start:1.6 + i * .3, dur:5.4 - i * .3, tin:{k:'pop', d:.5}}), T_(P, {txt:t, x:210, y:915 + i * 130, w:800, fs:50, fw:600, col:'#FFFFFF', align:'l', name:'Info', start:1.7 + i * .3, dur:5.3 - i * .3, tin:{k:'slideL', d:.5}})]),
      Q_(P, 'https://www.exemple.fr/inscription', {x:340, y:1300, w:400, h:400, col:'#0B132B', bgc:'#FFFFFF', name:'QR code', start:2.4, dur:4.6, tin:{k:'zoom', d:.6}}), T_(P, {txt:'Inscription gratuite', x:0, y:1740, w:1080, fs:44, fw:600, col:'#5BC0BE', name:'Consigne', start:2.6, dur:4.4, tin:{k:'fade', d:.6}})];
  }},
  {id:'fbcover', name:'Couverture Facebook', cat:'Réseaux sociaux', desc:'Bannière de page entreprise', fmt:'fbcover', studio:'design', tags:'page entreprise bannière', build(P){
    P.bg = '#E8F1F2';
    return [S_(P, 'blob', {x:1050, y:-200, w:800, h:800, fill:'#1B98E0', name:'Forme'}), S_(P, 'blob', {x:1350, y:300, w:400, h:400, fill:'#13293D', name:'Forme 2'}),
      T_(P, {txt:'Votre partenaire travaux depuis 1998', x:110, y:170, w:950, fs:72, fw:800, font:'Bricolage Grotesque', col:'#13293D', align:'l', lh:1.1, name:'Titre'}),
      T_(P, {txt:'Réseaux · Voirie · Aménagements', x:110, y:390, w:900, fs:38, fw:500, col:'#247BA0', align:'l', name:'Sous-titre'})];
  }},
  {id:'pin', name:'Épingle Pinterest', cat:'Réseaux sociaux', desc:'Format vertical : photo et titre', fmt:'pin', studio:'design', tags:'recette idée photo', build(P){
    P.bg = '#FFFFFF';
    return [F_(P, 'rect', {x:0, y:0, w:1000, h:900, name:'Photo'}), S_(P, 'rect', {x:0, y:860, w:1000, h:640, fill:'#FDF0D5', name:'Fond texte'}),
      T_(P, {txt:'10 idées déco\npour un salon cosy', x:70, y:950, w:860, fs:80, fw:800, font:'Fraunces', col:'#780000', align:'l', lh:1.1, name:'Titre'}),
      T_(P, {txt:'Petit budget, grand effet', x:70, y:1200, w:860, fs:40, fw:500, col:'#003049', align:'l', name:'Sous-titre'}), T_(P, {txt:'monsite.fr', x:70, y:1380, w:860, fs:34, fw:700, col:'#C1121F', align:'l', name:'Site'})];
  }},
  {id:'xpost', name:'Annonce produit (X)', cat:'Réseaux sociaux', desc:'Format 16:9 pour X et LinkedIn', fmt:'xpost', studio:'design', tags:'twitter lancement', build(P){
    P.bg = '#0A0A0A';
    return [S_(P, 'star4', {x:1150, y:120, w:300, h:300, fill:'#FFFFFF', name:'Étincelle'}), S_(P, 'star4', {x:1380, y:450, w:140, h:140, fill:'#A3E635', name:'Étincelle 2'}),
      T_(P, {txt:'Nouveau', x:110, y:160, w:500, fs:44, fw:700, col:'#0A0A0A', tbg:'#A3E635', tbgPad:.4, align:'l', name:'Étiquette'}), T_(P, {txt:'Le suivi de chantier\ndans votre poche.', x:110, y:290, w:1100, fs:96, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.05, name:'Titre'}),
      T_(P, {txt:'Disponible dès aujourd\'hui sur iOS et Android.', x:110, y:580, w:1100, fs:40, fw:400, col:'#A3A3A3', align:'l', name:'Texte'})];
  }},
  {id:'logo', name:'Logo monogramme', cat:'Marque', desc:'Logo simple : initiales et nom', fmt:'logo', studio:'design', tags:'identité marque', build(P){
    P.bg = '#FFFFFF';
    return [S_(P, 'hex', {x:330, y:220, w:340, h:300, fill:'#1F2A44', fill2:'#3D63FF', ga:135, name:'Emblème'}), T_(P, {txt:'SP', x:330, y:290, w:340, fs:150, fw:800, font:'Unbounded', col:'#FFFFFF', name:'Initiales'}),
      T_(P, {txt:'STUDIO PRISME', x:0, y:600, w:1000, fs:72, fw:800, font:'Bricolage Grotesque', col:'#1F2A44', ls:.06, name:'Nom'}), T_(P, {txt:'CONCEPTION & CRÉATION', x:0, y:710, w:1000, fs:32, fw:600, col:'#3D63FF', ls:.3, name:'Signature'})];
  }},
  {id:'emailhead', name:'En-tête d\'e-mail', cat:'Marque', desc:'Bannière de newsletter', fmt:'email', studio:'design', tags:'newsletter mail', build(P){
    P.bg = '#FEF3C7';
    return [S_(P, 'ellipse', {x:900, y:-150, w:500, h:500, fill:'#F59E0B', name:'Soleil'}), I_(P, 'mail', {x:70, y:120, w:160, h:160, col:'#78350F', sw:1.6, name:'Icône'}),
      T_(P, {txt:'La lettre du mois', x:270, y:110, w:700, fs:70, fw:800, font:'Bricolage Grotesque', col:'#78350F', align:'l', name:'Titre'}), T_(P, {txt:'Nouveautés, conseils et rendez-vous · Avril 2027', x:270, y:215, w:700, fs:32, fw:500, col:'#92400E', align:'l', name:'Sous-titre'})];
  }},
  {id:'infog', name:'Infographie', cat:'Marque', desc:'Format long : étapes, icônes, graphique', fmt:'infog', studio:'design', tags:'étapes processus données', build(P){
    P.bg = '#F0F9FF'; const ink = '#0C4A6E', ac = '#0EA5E9', out = [S_(P, 'rect', {x:0, y:0, w:1080, h:520, fill:ink, name:'En-tête'}),
      T_(P, {txt:'L\'eau potable,\nde la source au robinet', x:90, y:120, w:900, fs:84, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1.08, name:'Titre'}), T_(P, {txt:'Les 5 étapes d\'un réseau d\'adduction', x:90, y:380, w:900, fs:38, fw:500, col:'#BAE6FD', align:'l', name:'Sous-titre'})];
    [['drop', 'Captage', 'Prélèvement dans une nappe ou une rivière.'], ['filter', 'Traitement', 'Filtration et désinfection en usine.'], ['building', 'Stockage', 'Châteaux d\'eau et réservoirs.'], ['pipe', 'Distribution', 'Des kilomètres de canalisations sous nos rues.'], ['home', 'Consommation', 'Environ 150 litres par personne et par jour.']].forEach(([ic, t, d], i) => {
      const y = 620 + i * 300; out.push(I_(P, ic, {x:90, y, w:170, h:170, col:'#FFFFFF', bgc:ac, sw:1.8, name:'Icône'}), T_(P, {txt:`${i + 1}. ${t}`, x:300, y:y + 20, w:700, fs:56, fw:800, col:ink, align:'l', name:'Étape'}), T_(P, {txt:d, x:300, y:y + 100, w:700, fs:36, fw:400, col:'#075985', align:'l', lh:1.35, name:'Description'}));
      if (i < 4) out.push(S_(P, 'line', {x:173, y:y + 185, w:6, h:100, fill:'#7DD3FC', name:'Lien', rot:0}));
    });
    out.push(T_(P, {txt:'Répartition des usages', x:90, y:2150, w:900, fs:52, fw:800, col:ink, align:'l', name:'Titre graphique'}), C_(P, 'donut', {x:90, y:2240, w:900, h:400, data:[['Domestique', 62], ['Industrie', 21], ['Agriculture', 17]], pal:[ac, ink, '#7DD3FC'], name:'Graphique'}));
    return out;
  }},
  {id:'webbanner', name:'Bannière de site', cat:'Marque', desc:'Bandeau d\'accueil web', fmt:'web', studio:'design', tags:'site internet hero', build(P){
    P.bg = '#111827';
    return [mkColor(P, '#111827', {fill2:'#312E81', ga:0, name:'Fond'}), S_(P, 'ring', {x:1400, y:-120, w:600, h:600, fill:'#6366F1', op:.5, name:'Anneau'}), S_(P, 'ellipse', {x:1560, y:300, w:240, h:240, fill:'#F472B6', name:'Point'}),
      T_(P, {txt:'Construisons l\'avenir, ensemble.', x:140, y:170, w:1200, fs:92, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', name:'Titre'}),
      S_(P, 'round', {x:140, y:380, w:360, h:100, r:50, fill:'#F472B6', name:'Bouton'}), T_(P, {txt:'Nous contacter', x:140, y:398, w:360, fs:38, fw:700, col:'#111827', name:'Texte du bouton'})];
  }},
  {id:'ytthumb2', name:'Miniature tutoriel', cat:'Vidéo', desc:'Titre, flèche et cadre photo', fmt:'thumb', studio:'design', tags:'youtube tuto', build(P){
    P.bg = '#14C2EC';
    return [F_(P, 'blob', {x:700, y:60, w:560, h:600, name:'Photo'}), T_(P, {txt:'TUTO', x:60, y:70, w:400, fs:70, fw:900, font:'Unbounded', col:'#14C2EC', tbg:'#16131F', tbgPad:.3, align:'l', name:'Étiquette'}),
      T_(P, {txt:'Montage\nen 10 min', x:60, y:200, w:700, fs:150, fw:400, font:'Anton', col:'#FFFFFF', align:'l', lh:.95, name:'Titre', tfx:{k:'outline', c:'#16131F', d:60}}),
      S_(P, 'larrow', {x:520, y:560, w:240, h:40, fill:'#FFC83D', rot:-20, name:'Flèche'})];
  }},
  {id:'countdown', name:'Compte à rebours', cat:'Vidéo', desc:'3, 2, 1… animé, pour lancer une vidéo ou un live', fmt:'square', studio:'motion', dur:4.5, tags:'décompte lancement live', build(P){
    P.bg = '#16131F'; const out = [];
    ['3', '2', '1'].forEach((n, i) => out.push(S_(P, 'ring', {x:240, y:240, w:600, h:600, fill:['#7B2FF7', '#14C2EC', '#FF3F86'][i], name:'Anneau ' + n, start:i, dur:1, tin:{k:'iris', d:.35}, kf:{rot:[[0, 0, 'lin'], [1, 90, 'lin']]}}),
      T_(P, {txt:n, x:240, y:390, w:600, fs:300, fw:900, font:'Unbounded', col:'#FFFFFF', name:'Chiffre ' + n, start:i, dur:1, tin:{k:'pop', d:.4}, tout:{k:'zoom', d:.25}})));
    out.push(T_(P, {txt:'C\'EST PARTI !', x:0, y:460, w:1080, fs:110, fw:400, font:'Anton', col:'#FFC83D', name:'Lancement', start:3, dur:1.5, tin:{k:'spin', d:.6}}));
    return out;
  }},
  {id:'kinetic', name:'Typographie animée', cat:'Vidéo', desc:'Reel vertical : les mots s\'enchaînent', fmt:'vertical', studio:'motion', dur:8, tags:'texte animé reel', build(P){
    P.bg = '#FAFAF9'; const words = [['CRÉER', 0, '#16131F'], ['N\'A JAMAIS', 1.2, '#7B2FF7'], ['ÉTÉ AUSSI', 2.4, '#16131F'], ['SIMPLE.', 3.6, '#FF3F86']];
    const out = words.map(([w, st, c], i) => T_(P, {txt:w, x:60, y:520 + i * 230, w:960, fs:170, fw:400, font:'Anton', col:c, align:'l', name:w, start:st, dur:8 - st, tin:{k:['slideR', 'drop', 'flip', 'block'][i], d:.6, c:'#FFC83D'}}));
    out.push(T_(P, {txt:'Spectra Motion', x:0, y:1600, w:1080, fs:56, fw:700, col:'#16131F', name:'Signature', start:5, dur:3, tin:{k:'words', d:.6}}));
    return out;
  }},
  {id:'promovid', name:'Promo produit animée', cat:'Vidéo', desc:'Vidéo 16:9 : titre, avantages, appel à l\'action', fmt:'hd', studio:'motion', dur:8, tags:'publicité lancement', build(P){
    P.bg = '#0F172A';
    return [S_(P, 'blob', {x:1100, y:150, w:700, h:700, fill:'#6366F1', fill2:'#EC4899', ga:45, name:'Forme', tin:{k:'zoom', d:1}, kf:{rot:[[0, 0, 'ease'], [8, 30, 'ease']]}}),
      T_(P, {txt:'Le nouvel\nindispensable', x:160, y:260, w:900, fs:130, fw:800, font:'Bricolage Grotesque', col:'#FFFFFF', align:'l', lh:1, name:'Titre', tin:{k:'words', d:1}}),
      ...['Léger', 'Autonome', 'Connecté'].flatMap((t, i) => [I_(P, 'checkc', {x:160, y:620 + i * 100, w:70, h:70, col:'#A5B4FC', name:'Coche', start:1.4 + i * .4, dur:6.6 - i * .4, tin:{k:'pop', d:.4}}), T_(P, {txt:t, x:260, y:628 + i * 100, w:600, fs:52, fw:600, col:'#E2E8F0', align:'l', name:t, start:1.5 + i * .4, dur:6.5 - i * .4, tin:{k:'slideL', d:.5}})]),
      S_(P, 'round', {x:1210, y:860, w:480, h:120, r:60, fill:'#FFFFFF', name:'Bouton', start:3.2, dur:4.8, tin:{k:'pop', d:.6}}), T_(P, {txt:'Commander', x:1210, y:880, w:480, fs:50, fw:800, col:'#0F172A', name:'Texte du bouton', start:3.2, dur:4.8, tin:{k:'pop', d:.6}})];
  }},
  {id:'logoreveal', name:'Révélation de logo', cat:'Vidéo', desc:'Intro courte : le logo apparaît en tourbillon', fmt:'hd', studio:'motion', dur:5, tags:'intro marque', build(P){
    P.bg = '#0B0B12';
    return [S_(P, 'ring', {x:660, y:240, w:600, h:600, fill:'#7B2FF7', fill2:'#14C2EC', ga:90, name:'Anneau', tin:{k:'iris', d:1}}), S_(P, 'prism', {x:860, y:390, w:240, h:300, fill:'#FFFFFF', name:'Symbole', start:.6, dur:4.4, tin:{k:'spin', d:.9}}),
      T_(P, {txt:'VOTRE MARQUE', x:0, y:900, w:1920, fs:80, fw:800, font:'Unbounded', col:'#FFFFFF', ls:.2, name:'Nom', start:1.4, dur:3.6, tin:{k:'wipeU', d:.7}})];
  }},
  {id:'collage', name:'Collage 2 × 2', cat:'Photo', desc:'Quatre photos et un titre', fmt:'square', studio:'photo', tags:'grille souvenirs', build(P){
    P.bg = '#FFFFFF'; const g = 16, s = (1080 - g * 3) / 2;
    return [...[0, 1, 2, 3].map(i => F_(P, 'rect', {x:g + (i % 2) * (s + g), y:g + Math.floor(i / 2) * (s + g), w:s, h:s, name:'Photo ' + (i + 1)})),
      S_(P, 'ellipse', {x:390, y:390, w:300, h:300, fill:'#FFFFFF', name:'Médaillon'}), T_(P, {txt:'Été\n2026', x:390, y:450, w:300, fs:76, fw:400, font:'Pacifico', col:'#16131F', lh:1, name:'Titre'})];
  }},
  {id:'polaroid', name:'Polaroïd', cat:'Photo', desc:'Photo instantanée et légende manuscrite', fmt:'portrait', studio:'photo', tags:'souvenir cadre', build(P){
    P.bg = '#D9E4DD';
    return [S_(P, 'rect', {x:140, y:150, w:800, h:980, fill:'#FFFFFF', rot:-3, name:'Papier', shadow:{c:'#00000040', b:40, x:0, y:20}}), F_(P, 'rect', {x:185, y:190, w:710, h:710, rot:-3, name:'Photo'}),
      T_(P, {txt:'Nos meilleures vacances', x:180, y:960, w:720, fs:66, fw:400, font:'Caveat', col:'#2B2B2B', rot:-3, name:'Légende'})];
  }},
  {id:'beforeafter', name:'Avant / après', cat:'Photo', desc:'Deux photos côte à côte avec étiquettes', fmt:'square', studio:'photo', tags:'comparaison rénovation chantier', build(P){
    P.bg = '#16131F';
    return [F_(P, 'rect', {x:0, y:0, w:536, h:1080, name:'Photo avant'}), F_(P, 'rect', {x:544, y:0, w:536, h:1080, name:'Photo après'}),
      T_(P, {txt:'AVANT', x:40, y:960, w:300, fs:46, fw:800, col:'#16131F', tbg:'#FFFFFF', tbgPad:.35, align:'l', name:'Étiquette avant'}), T_(P, {txt:'APRÈS', x:584, y:960, w:300, fs:46, fw:800, col:'#FFFFFF', tbg:'#7B2FF7', tbgPad:.35, align:'l', name:'Étiquette après'})];
  }},
);
/* projet complet à partir d'un modèle */
function tplProject(t){
  const P = newProject(t.studio || 'design', t.fmt); P.title = t.name; if (t.dur) P.dur = t.dur;
  const fix = ls => ls.map((L, i) => { L.track = i; if (!t.studio || !TIMED(t.studio)) { L.start = 0; L.dur = P.dur; } else { if (L.dur > P.dur - (L.start || 0)) L.dur = P.dur - (L.start || 0); } return L; });
  if (t.buildPages){
    const pgs = t.buildPages(P); P.layers = fix(pgs[0].layers); P.bg = pgs[0].bg;
    if (pgs.length > 1){ P.pages = pgs.map((g, i) => i ? {id:uid('pg'), bg:g.bg, layers:fix(g.layers)} : {id:uid('pg'), live:true}); P.pg = 0; }
  } else P.layers = fix(t.build(P));
  if (t.post) t.post(P);
  if (TIMED(P.studio)) syncDur(P);
  return P;
}
/* contraste : un texte posé directement sur le fond garde un contraste lisible (au moins 3:1), sinon il passe en noir ou blanc */
const lumOf = c => { const v = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const contrastOf = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
function ensureContrast(V){
  const bgAt = L => { const under = V.layers.filter(o => o !== L && o.track < L.track && (o.t === 'shape' || o.t === 'color') && o.fill && !o.slot && o.x <= L.x + 2 && o.y <= L.y + 2 && o.x + o.w >= L.x + L.w - 2 && o.y + o.h >= L.y + L.h - 2).sort((a, b) => b.track - a.track)[0];
    return under ? under.fill : hexOk(V.bg) ? V.bg : '#FFFFFF'; };
  for (const L of V.layers) if (L.t === 'text' && hexOk(L.col) && !L.tbg){ const bg = bgAt(L); if (hexOk(bg) && contrastOf(L.col.slice(0, 7), bg.slice(0, 7)) < 3) L.col = contrastOf('#FFFFFF', bg.slice(0, 7)) > contrastOf('#16131F', bg.slice(0, 7)) ? '#FFFFFF' : '#16131F'; }
}
/* variantes : chaque modèle décliné avec d'autres palettes et d'autres associations de polices */
(() => {
  const PALS = [['Océan', ['#0B2A4A', '#145A86', '#14C2EC', '#A8E6F0', '#F4FBFC']], ['Forêt', ['#1F3B2D', '#2F6B4F', '#7FB069', '#E6E1C5', '#F4EFE6']], ['Coucher de soleil', ['#3D1A5B', '#B23A7A', '#FF6F59', '#FFB347', '#FFE5B4']],
    ['Terracotta', ['#5C2E1F', '#B5523B', '#E08E6D', '#F2D0A9', '#FAF3E8']], ['Nuit', ['#0E0B16', '#231942', '#5E548E', '#9F86C0', '#E0B1CB']], ['Bonbon', ['#5A6BFF', '#FF5DA2', '#FFA1C9', '#9AD0FF', '#FFF4FA']],
    ['Corporate', ['#0A2540', '#1D4ED8', '#60A5FA', '#E5E7EB', '#FFFFFF']], ['Agrumes', ['#1B1B1E', '#FF7A00', '#FFC300', '#C7EA46', '#FFFBEA']], ['Royal', ['#1B1464', '#4B2C82', '#C9A227', '#F5E6A8', '#FFFFFF']],
    ['Menthe', ['#0F4C45', '#1F8A70', '#5DD39E', '#BCE7C9', '#F2FBF6']], ['Bord de mer', ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51']], ['Monochrome', ['#111111', '#444444', '#888888', '#CCCCCC', '#F5F5F5']]];
  const FP = [['Bricolage Grotesque', 'Inter'], ['Playfair Display', 'Lora'], ['Anton', 'Montserrat'], ['Fraunces', 'DM Sans'], ['Cinzel', 'Cormorant Garamond'], ['Fredoka', 'Nunito'], ['Space Grotesk', 'Work Sans'], ['Bebas Neue', 'Outfit'], ['Unbounded', 'Manrope'], ['Abril Fatface', 'Raleway'], ['Righteous', 'Josefin Sans'], ['Archivo Black', 'Archivo']];
  const base = [...SM_TPL];
  base.forEach((t, i) => { for (let k = 0; k < 6; k++){
    const [pn, pal] = PALS[(i * 5 + k * 7) % PALS.length], [ft, fb] = FP[(i * 3 + k * 5) % FP.length];
    SM_TPL.push({...t, id:`${t.id}~${k}`, name:`${t.name} · ${pn}`, variant:t.id, desc:`${t.desc} — palette ${pn}, polices ${ft} et ${fb}`, post(P){
      recolor(P, pal);
      for (const L of allLayers(P)){ if (L.t !== 'text') continue; if (FONT_PAIRS.some(f => f.t === L.font) || /Script|Vibes|Pacifico|Caveat|Sacramento/.test(L.font)) continue; L.font = L.fw >= 700 && L.fs >= Math.min(P.w, P.h) * .05 ? ft : fb; }
      ensureContrast(P); for (let j = 0; j < pageCount(P); j++){ if (j !== (P.pg || 0)){ const g = P.pages[j]; ensureContrast({...P, layers:g.layers, bg:g.bg}); } }
      for (const L of allLayers(P)) if (L.t === 'text') L.h = Math.max(measureText(L).h, 4);
    }});
  } });
})();
const TPL_THUMBS = {};
function tplThumb(t){
  if (TPL_THUMBS[t.id]) return TPL_THUMBS[t.id];
  try {
    const P = tplProject(t), fonts = [...new Set(allLayers(P).filter(l => l.t === 'text' || l.t === 'chart').map(l => l.font))];
    // polices pas encore chargées : vignette provisoire, puis redessinée quand elles arrivent
    if (fonts.some(f => !FONT_LINKS[f] || !document.fonts?.check?.(`700 20px ${fontCss(f)}`))) fontsReady(P).then(() => { if (TPL_THUMBS[t.id + ':ok']) return; TPL_THUMBS[t.id + ':ok'] = 1; delete TPL_THUMBS[t.id]; const u = tplThumb(t); $$(`img[data-tth="${t.id}"]`).forEach(im => im.src = u); BUS.emit('tplthumb', t.id); });
    return TPL_THUMBS[t.id] = thumbOf(P, TIMED(P.studio) ? Math.min(P.dur * .6, 3) : 0, 280, .7);
  } catch(e){ console.warn(e); return ''; }
}

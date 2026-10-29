/* ---------- Assistant IA (Gemini via Firebase AI Logic, voir src/js/ai.js) ----------
   L'IA renvoie une description structurée (JSON) ; Spectra Motion la transforme en calques réels, puis la fait passer par
   l'assainissement habituel (cleanProject) : une réponse inattendue ne peut rien injecter. */
const AI_LANGS = {en:'anglais', es:'espagnol', de:'allemand', it:'italien', pt:'portugais', nl:'néerlandais', br:'breton', ar:'arabe', zh:'chinois', ja:'japonais', fr:'français'};
const AI_TEXT_ACTS = [['fix', 'Corriger', 'Corrige l\'orthographe, la grammaire et la ponctuation, sans changer le sens ni le ton.'], ['rephrase', 'Reformuler', 'Reformule autrement, même longueur, même sens.'],
  ['short', 'Raccourcir', 'Raccourcis nettement (environ deux fois plus court), en gardant l\'essentiel.'], ['long', 'Développer', 'Développe un peu (une ou deux phrases de plus), concret et utile.'],
  ['pro', 'Plus professionnel', 'Rends le ton plus professionnel et sobre.'], ['fun', 'Plus amusant', 'Rends le ton plus chaleureux, vivant et amusant.'], ['punch', 'Accroche', 'Transforme en accroche publicitaire percutante (très courte).'],
  ['emoji', 'Ajouter des émojis', 'Ajoute quelques émojis pertinents, sans en abuser.'], ['list', 'En liste', 'Transforme en liste de 3 à 5 points courts (une ligne par point, sans puce).']];
const AI = {
  busy:false,
  ok(){ return !!window.SMAI && window.SMAI.available(); },
  why(){ return window.SMAI ? window.SMAI.why() : 'L\'IA n\'est pas disponible dans cette version.'; },
  async run(label, fn){
    if (this.busy) return; if (!this.ok()) return toast(this.why(), 6000);
    this.busy = true; BUSY.show(label); PANEL.cur === 'ai' && PANEL.render();
    try { return await fn(); }
    catch(e){ console.warn('[Spectra Motion] IA', e); toast(e?.message || 'L\'IA n\'a pas pu répondre.', 7000); }
    finally { this.busy = false; BUSY.hide(); PANEL.cur === 'ai' && PANEL.render(); }
  },
  wait(s){ BUSY.show(`L'IA est très demandée : nouvel essai dans ${s} s…`); },
  /* ===== design à partir d'une description ===== */
  designSys(P, pages){
    return `Tu es le directeur artistique de Spectra Motion (éditeur graphique de Studio Prism). Tu crées un design ${pages > 1 ? `de ${pages} pages` : 'd\'une page'} au format ${P.w} × ${P.h} px, en français sauf demande contraire.
Réponds UNIQUEMENT par un objet JSON : {"title":"…","pages":[{"bg":"#RRGGBB","notes":"…","elements":[…]}]}.
Coordonnées et tailles en POURCENTAGE de la page : x, y, w, h entre 0 et 100 (x, y = coin haut gauche). "size" (taille du texte) en pourcentage de la HAUTEUR de la page (titre 6 à 14, texte 2 à 4).
Types d'éléments :
- {"type":"text","x":…,"y":…,"w":…,"h":…,"text":"…","font":"POLICE","size":…,"weight":400|500|600|700|800|900,"color":"#RRGGBB","align":"l|c|r","italic":false,"upper":false,"bg":"#RRGGBB ou vide","effect":"none|shadow|lift|neon|outline|hollow|echo|glitch|splice","effectColor":"#RRGGBB"}
- {"type":"shape","shape":"FORME","x":…,"y":…,"w":…,"h":…,"color":"#RRGGBB","color2":"#RRGGBB ou vide (dégradé)","rotation":0,"opacity":1}
- {"type":"icon","icon":"ICONE","x":…,"y":…,"w":…,"h":…,"color":"#RRGGBB","bg":"#RRGGBB ou vide"}
- {"type":"sticker","sticker":"AUTOCOLLANT","x":…,"y":…,"w":…,"h":…,"color":"#RRGGBB"}
- {"type":"chart","chart":"col|bar|line|area|pie|donut|prog","x":…,"y":…,"w":…,"h":…,"data":[["libellé",nombre]],"colors":["#RRGGBB"]}
- {"type":"table","x":…,"y":…,"w":…,"h":…,"rows":[["en-tête",…],[…]]}
- {"type":"qr","text":"https://…","x":…,"y":…,"w":…,"h":…}
- {"type":"photo","shape":"rect|round|ellipse|arch|blob|heart|hex","x":…,"y":…,"w":…,"h":…,"query":"2 à 4 mots-clés en anglais pour chercher une photo libre"}
Polices : ${FONTS_M.map(f => f[0]).join(', ')}.
Formes : ${Object.keys(SHAPE_NAMES).join(', ')}.
Icônes (traits) : ${ICON_SET.map(x => x[0]).join(', ')}.
Autocollants (formes pleines décoratives) : ${STICKER_SET.map(x => x[0]).join(', ')}.
Règles : composition professionnelle et aérée, hiérarchie claire (un grand titre), 2 polices au plus, palette de 3 à 5 couleurs harmonieuses avec un bon contraste texte/fond, aucun élément hors de la page, pas de texte qui se chevauche, marges d'au moins 6 %. Textes réalistes et utiles (pas de « lorem ipsum »). Les zones photo ("photo") sont facultatives et rares (une au plus par page). "notes" : notes de présentation (facultatif).`;
  },
  build(P, page, opts){
    const W = P.w, H = P.h, pct = (v, d) => clamp(num(v, d), -20, 120) / 100, out = [];
    for (const e of (Array.isArray(page.elements) ? page.elements : []).slice(0, 60)){
      const box = {x:Math.round(pct(e.x, 10) * W), y:Math.round(pct(e.y, 10) * H), w:Math.max(8, Math.round(pct(e.w, 30) * W)), h:Math.max(8, Math.round(pct(e.h, 10) * H))};
      const tm = {start:0, dur:P.dur}, col = c => hexOk(c) ? c : '';
      if (e.type === 'text'){
        const L = mkText(P, {txt:String(e.text || '').slice(0, 2000), font:FONTS_M.some(f => f[0] === e.font) ? e.font : 'Inter', fs:Math.max(6, Math.round(pct(e.size, 4) * H)), fw:[400, 500, 600, 700, 800, 900].includes(+e.weight) ? +e.weight : 700,
          col:col(e.color) || '#16131F', align:['l', 'c', 'r'].includes(e.align) ? e.align : 'l', it:!!e.italic, up:!!e.upper, tbg:col(e.bg), tbgPad:.3, ...box, ...tm, name:String(e.text || 'Texte').split('\n')[0].slice(0, 30)});
        if (TFX[e.effect] && e.effect !== 'none') L.tfx = {k:e.effect, c:col(e.effectColor) || '#FF3F86', d:50};
        L.h = Math.max(measureText(L).h, 4); out.push(L);
      } else if (e.type === 'shape') out.push(mkShape(P, SHAPE_NAMES[e.shape] ? e.shape : 'rect', {...box, ...tm, fill:col(e.color) || '#7B2FF7', fill2:col(e.color2), rot:clamp(num(e.rotation), -360, 360), op:clamp(num(e.opacity, 1), .05, 1)}));
      else if (e.type === 'icon' && ICONS[e.icon]) out.push(mkIcon(P, e.icon, {...box, ...tm, col:col(e.color) || '#16131F', bgc:col(e.bg)}));
      else if (e.type === 'sticker' && STICKERS[e.sticker]) out.push(mkIcon(P, e.sticker, {...box, ...tm, col:col(e.color) || '#7B2FF7'}));
      else if (e.type === 'chart' && CHART_KINDS[e.chart] && Array.isArray(e.data)) out.push(mkChart(P, e.chart, {...box, ...tm, data:e.data.slice(0, 20).map(r => [String(r?.[0] ?? '').slice(0, 40), num(r?.[1])]), pal:(e.colors || []).filter(hexOk).length ? e.colors.filter(hexOk) : [...PALETTE_DEF]}));
      else if (e.type === 'table' && Array.isArray(e.rows)) out.push(mkTable(P, e.rows.slice(0, 20).map(r => (Array.isArray(r) ? r : [r]).slice(0, 8).map(c => String(c ?? '').slice(0, 100))), {...box, ...tm, fs:Math.round(Math.min(box.h / Math.max(2, e.rows.length) * .42, H * .03))}));
      else if (e.type === 'qr' && e.text) out.push(mkQr(P, String(e.text).slice(0, 300), {...box, ...tm}));
      else if (e.type === 'photo') { const S = mkShape(P, ['rect', 'round', 'ellipse', 'arch', 'blob', 'heart', 'hex'].includes(e.shape) ? e.shape : 'rect', {...box, ...tm, name:'Cadre photo', slot:true, fill:''}); S.q = String(e.query || '').slice(0, 80); out.push(S); }
    }
    out.forEach((L, i) => L.track = i);
    return out;
  },
  async design(prompt, pages = 1, photos = true){
    const P = ED.P; pages = clamp(Math.round(pages), 1, 10);
    return this.run('L\'IA compose votre design…', async () => {
      const r = await window.SMAI.json(this.designSys(P, pages), `Demande : ${prompt}`, s => this.wait(s));
      const pgs = (Array.isArray(r.pages) ? r.pages : []).slice(0, pages); if (!pgs.length || !pgs.some(g => g.elements?.length)) throw new Error('L\'IA n\'a pas proposé de design : précisez la demande.');
      const N = newProject(TIMED(P.studio) ? 'design' : P.studio, {id:P.fmt, w:P.w, h:P.h}); N.media = P.media; N.title = String(r.title || prompt).slice(0, 80);
      const built = pgs.map(g => ({bg:hexOk(g.bg) ? g.bg : '#FFFFFF', layers:this.build(N, g), notes:String(g.notes || '').slice(0, 2000)}));
      N.layers = built[0].layers; N.bg = built[0].bg; N.notes = built[0].notes;
      if (built.length > 1){ N.pages = built.map((g, i) => i ? {id:uid('pg'), bg:g.bg, layers:g.layers, notes:g.notes} : {id:uid('pg'), live:true}); N.pg = 0; }
      const C = cleanProject(JSON.stringify(N)); C.media = P.media;
      // les zones photo gardent leur recherche (non enregistrée) pour être remplies ensuite
      const qs = allLayers(N).filter(l => l.q); allLayers(C).forEach(l => { const s = qs.find(q => q.id === l.id); if (s) l.q = s.q; });
      ED.P = C; ED.sel = new Set(); $('#docTitle').value = C.title; if (C.studio !== P.studio) ED.applyStudio(true); else STAGE.fit();
      await fontsReady(C); ED.refitTexts(); ED.commit('Design par l\'IA'); BUS.emit('sel'); PAGES.render();
      toast('Design créé par l\'IA : tout est modifiable (Ctrl + Z pour revenir).', 4000);
      if (photos) await STOCK.fillSlots(C);
    });
  },
  /* ===== rédaction ===== */
  async text(act, extra = ''){
    const L = ED.sel1(); if (!L || L.t !== 'text') return toast('Sélectionnez d\'abord un texte.');
    const a = AI_TEXT_ACTS.find(x => x[0] === act), instr = act === 'translate' ? `Traduis en ${AI_LANGS[extra] || extra}, naturellement.` : act === 'custom' ? extra : a?.[2];
    return this.run('L\'IA rédige…', async () => {
      const r = await window.SMAI.json('Tu es un rédacteur francophone expert en communication visuelle. Tu réécris le texte d\'un élément de design. Réponds UNIQUEMENT par {"text":"…"}. Garde à peu près la même longueur sauf consigne contraire, sans guillemets autour, sans explication. Les retours à la ligne sont permis.',
        `Consigne : ${instr}\nTexte :\n${L.txt}`, s => this.wait(s));
      const t = String(r.text ?? '').trim().slice(0, 5000); if (!t) throw new Error('Réponse vide.');
      L.txt = t; L.h = Math.max(measureText(L).h, 4); ED.commit('IA : ' + (a?.[1] || 'texte')); toast('Texte mis à jour (Ctrl + Z pour revenir)');
    });
  },
  async write(prompt){
    return this.run('L\'IA rédige…', async () => {
      const r = await window.SMAI.json('Tu es un rédacteur francophone pour des visuels (réseaux sociaux, affiches, présentations). Réponds UNIQUEMENT par {"title":"…","text":"…"} : un titre court et percutant, puis un texte de 1 à 3 phrases.', prompt, s => this.wait(s));
      const P = ED.P, m = Math.min(P.w, P.h), tm = ED.timing(5), ids = [], g = uid('g');
      const A = mkText(P, {txt:String(r.title || '').slice(0, 200), fs:Math.round(m * .08), fw:800, font:ED.brand().fonts?.title || 'Bricolage Grotesque', ...tm, track:topTrack(P), name:'Titre IA', g}); A.h = Math.max(measureText(A).h, 4);
      const B = mkText(P, {txt:String(r.text || '').slice(0, 1500), fs:Math.round(m * .035), fw:400, lh:1.4, font:ED.brand().fonts?.body || 'Inter', ...tm, track:topTrack(P) + 1, name:'Texte IA', g}); B.h = Math.max(measureText(B).h, 4);
      const tot = A.h + B.h + m * .03; A.y = Math.round((P.h - tot) / 2); B.y = Math.round(A.y + A.h + m * .03);
      P.layers.push(A, B); ids.push(A.id, B.id); ED.sel = new Set(ids); ED.commit('Texte par l\'IA'); BUS.emit('sel');
    });
  },
  /* ===== traduire tout le design (toutes les pages) ===== */
  async translate(lang){
    const P = ED.P, items = [];
    for (const L of allLayers(P)){ if (L.t === 'text' && L.txt.trim()) items.push({id:L.id + ':t', text:L.txt}); if (L.t === 'chart') L.data.forEach((r, i) => r[0] && items.push({id:L.id + ':c' + i, text:r[0]})); if (L.t === 'table') L.rows.forEach((r, i) => r.forEach((c, j) => c && !/^[\d\s.,%€$+-]+$/.test(c) && items.push({id:`${L.id}:r${i}_${j}`, text:c}))); }
    if (!items.length) return toast('Aucun texte à traduire.');
    return this.run(`Traduction en ${AI_LANGS[lang]}…`, async () => {
      const r = await window.SMAI.json(`Tu traduis les textes d'un design en ${AI_LANGS[lang]}, naturellement et sans rallonger. Réponds UNIQUEMENT par {"items":[{"id":"…","text":"…"}]} avec les mêmes identifiants.`, JSON.stringify({items}), s => this.wait(s));
      const map = new Map((r.items || []).map(x => [String(x.id), String(x.text ?? '')])); let n = 0;
      for (const L of allLayers(P)){
        if (L.t === 'text' && map.has(L.id + ':t')){ L.txt = map.get(L.id + ':t').slice(0, 5000); L.h = Math.max(measureText(L).h, 4); n++; }
        if (L.t === 'chart') L.data.forEach((row, i) => { if (map.has(L.id + ':c' + i)){ row[0] = map.get(L.id + ':c' + i).slice(0, 40); n++; } });
        if (L.t === 'table') L.rows.forEach((row, i) => row.forEach((c, j) => { const k = `${L.id}:r${i}_${j}`; if (map.has(k)){ row[j] = map.get(k).slice(0, 200); n++; } }));
      }
      ED.commit('Traduire le design'); toast(`${n} texte${n > 1 ? 's traduits' : ' traduit'} en ${AI_LANGS[lang]} (Ctrl + Z pour revenir)`);
    });
  },
  /* ===== ambiance de couleurs ===== */
  async palette(prompt){
    return this.run('L\'IA choisit les couleurs…', async () => {
      const r = await window.SMAI.json('Tu es coloriste. Réponds UNIQUEMENT par {"name":"…","colors":["#RRGGBB",…]} : 5 couleurs harmonieuses, de la plus foncée à la plus claire, adaptées à la demande, avec assez de contraste pour du texte.', prompt, s => this.wait(s));
      const cs = (r.colors || []).filter(hexOk).slice(0, 8); if (cs.length < 3) throw new Error('Palette incomplète : réessayez.');
      recolor(ED.P, cs); STAGE.layout(); ED.commit('Couleurs par l\'IA'); toast(`Ambiance « ${String(r.name || prompt).slice(0, 40)} » appliquée`);
    });
  },
  /* ===== sous-titres automatiques : le son du clip est transcrit, puis découpé en sous-titres synchronisés ===== */
  async captions(){
    const L = ED.sel1(), P = ED.P; if (!L || !(L.t === 'audio' || (L.t === 'video' && P.media[L.media]?.hasAudio))) return toast('Sélectionnez un clip vidéo (avec du son) ou un son dans la timeline.');
    if (L.dur * (L.speed || 1) > 600) return toast('Clip trop long : 10 minutes au plus par demande. Coupez-le (S) et sous-titrez chaque morceau.');
    return this.run('Écoute du son et transcription…', async () => {
      const b64 = await clipWav16k(P, L);
      const r = await window.SMAI.audio('Tu transcris fidèlement la parole d\'un extrait audio, dans sa langue. Réponds UNIQUEMENT par {"segments":[{"start":secondes,"end":secondes,"text":"…"}]} : des sous-titres de 1 à 2 lignes courtes (42 caractères par ligne au plus), horodatés par rapport au début de l\'extrait, sans chevauchement. S\'il n\'y a pas de parole, renvoie {"segments":[]}.',
        b64, 'Transcris cet extrait en sous-titres.', s => this.wait(s));
      const segs = (r.segments || []).filter(x => x && x.text && isNum(+x.start) && isNum(+x.end) && +x.end > +x.start).slice(0, 400);
      if (!segs.length) throw new Error('Aucune parole détectée dans ce clip.');
      if (!TIMED(ED.studio)) ED.setStudio('video');
      const sp = L.speed || 1, tr = topTrack(P), m = Math.min(P.w, P.h), g = uid('g'); let n = 0;
      for (const sg of segs){
        const st = L.start + +sg.start / sp, en = Math.min(L.start + L.dur, L.start + +sg.end / sp); if (en - st < .1) continue;
        const T = mkText(P, {txt:String(sg.text).slice(0, 200), fs:Math.round(m * .045), fw:600, col:'#FFFFFF', tbg:'#000000B3', tbgPad:.35, start:round(st, 3), dur:round(en - st, 3), track:tr, name:'Sous-titre', g});
        T.w = Math.round(P.w * .86); T.x = Math.round((P.w - T.w) / 2); T.h = measureText(T).h; T.y = Math.round(P.h * .88 - T.h); P.layers.push(T); n++;
      }
      ED.commit('Sous-titres automatiques'); TL.render(); toast(`${n} sous-titres ajoutés sur une nouvelle piste (groupés : un clic les sélectionne tous pour changer leur style).`, 5000);
    });
  },
};
/* son d'un clip → WAV 16 kHz mono en base64 (léger, suffisant pour la parole) */
async function clipWav16k(P, L){
  const m = P.media[L.media], buf = await MEDIA.buffer(m); if (!buf) throw new Error('Le son de ce clip n\'a pas pu être décodé.');
  const sp = L.speed || 1, from = L.in || 0, len = Math.min(buf.duration - from, L.dur * sp); if (len <= .2) throw new Error('Clip trop court.');
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, sr = 16000, oac = new OAC(1, Math.ceil(len * sr), sr);
  const s = oac.createBufferSource(); s.buffer = buf; s.connect(oac.destination); s.start(0, from, len);
  const out = await oac.startRendering(), blob = wavOf(out), bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

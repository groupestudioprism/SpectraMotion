/* ---------- Éditeur Spectra Motion : état, actions, raccourcis, pont avec le cloud (window.SWEditor) ---------- */
const ED = {
  P:newProject('design'), sel:new Set(), readOnly:false, snap:true, tool:'select', cropId:'', shapeCol:'#6D3BFF', clip:null, docId:'', lib:{},
  pen:{kind:'pen', col:'#16131F', sw:6, hl:false},
  get studio(){ return this.P.studio; },
  selLayers(){ return this.P.layers.filter(l => this.sel.has(l.id)); },
  sel1(){ const s = this.selLayers(); return s.length === 1 ? s[0] : null; },
  /* ---------- chargement ---------- */
  load(P, o = {}){
    if (PLAY.playing) PLAY.pause();
    this.P = P; this.sel = new Set(); this.readOnly = !!o.readOnly; this.docId = o.id || '';
    PLAY.t = 0; HIST.reset(P);
    $('#docTitle').value = P.title; $('#docTitle').readOnly = o.canRename === false || this.readOnly;
    $('#app').classList.toggle('ro', this.readOnly);
    this.applyStudio(true);
    MEDIA.loadAll(P).then(() => { this.refitTexts(); PLAY.still(); TL.render(); PANEL.renderSoon(); PAGES.soon(); if (this.docId && !this.readOnly) this.uploadPending(); });
    fontsReady(P).then(() => { this.refitTexts(); STAGE.paint(); PAGES.soon(); });
    if (this.tool !== 'select') this.setTool('select');
    PAGES.render();
  },
  /* hauteur des textes recalculée quand les polices sont chargées */
  refitTexts(){ for (const L of allLayers(this.P)) if (L.t === 'text'){ const h = measureText(L).h; if (Math.abs(h - L.h) > 1 && h > L.h) L.h = h; } },
  applyStudio(first){
    const s = this.studio, app = $('#app');
    app.dataset.studio = s; app.classList.toggle('timed', TIMED(s));
    $$('[data-studio]', $('#studioNav')).forEach(b => b.setAttribute('aria-selected', b.dataset.studio === s));
    $('#smTl').hidden = !TIMED(s);
    PANEL.setStudio(s); PAGES.render();
    requestAnimationFrame(() => { STAGE.fit(); if (TIMED(s)){ TL.render(); if (first) TL.fitAll(); } INSP.render(); BUS.emit('playstate'); });
  },
  setStudio(s){
    if (s === this.studio) return; if (PLAY.playing) PLAY.pause();
    const was = this.studio; this.P.studio = s;
    if (!TIMED(was) && TIMED(s)){ // un visuel fixe devient une séquence : ses calques couvrent toute la durée
      const d = Math.max(this.P.dur, 5); this.P.layers.forEach(l => { if (l.t !== 'audio' && l.start === 0 && l.dur >= this.P.dur - 1e-3) l.dur = d; }); syncDur(this.P);
    }
    if (TIMED(was) && !TIMED(s)) PLAY.t = Math.min(PLAY.t, Math.max(0, projEnd(this.P) - .01));
    this.applyStudio(true); this.commit('Studio ' + STUDIOS.find(x => x.id === s).name, true);
  },
  /* ---------- modifications ---------- */
  commit(label, quiet){
    if (TIMED(this.studio)) syncDur(this.P);
    for (const id of [...this.sel]) if (!this.P.layers.some(l => l.id === id)) this.sel.delete(id);
    const changed = HIST.commit(this.P, label);
    if (changed && !this.readOnly) window.dispatchEvent(new Event('sw:changed'));
    BUS.emit('changed'); TL.render(); STAGE.paint(); this.histBtns();
    if (changed && label && !quiet && this.lastToast !== label) this.lastToast = label;
  },
  histBtns(){ $('#undoBtn').disabled = !HIST.past.length || this.readOnly; $('#redoBtn').disabled = !HIST.future.length || this.readOnly;
    $('#undoBtn').title = HIST.past.length ? `Annuler : ${HIST.past[HIST.past.length - 1].label || 'modification'} (Ctrl + Z)` : 'Rien à annuler'; $('#redoBtn').title = HIST.future.length ? `Rétablir : ${HIST.future[HIST.future.length - 1].label || 'modification'} (Ctrl + Maj + Z)` : 'Rien à rétablir'; },
  undo(){ if (this.readOnly) return; const r = HIST.undo(); if (!r) return; this.restore(r.P); toast('Annulé : ' + (r.label || 'modification'), 1400); },
  redo(){ if (this.readOnly) return; const r = HIST.redo(); if (!r) return; this.restore(r.P); toast('Rétabli : ' + (r.label || 'modification'), 1400); },
  restore(P){
    const studio = this.studio, media = this.P.media; this.P = P;
    for (const [k, m] of Object.entries(media)) if (P.media[k] && m.cloud && !P.media[k].cloud) Object.assign(P.media[k], {cloud:true, path:m.path}); // un envoi au cloud ne s'annule pas
    for (const id of [...this.sel]) if (!P.layers.some(l => l.id === id)) this.sel.delete(id);
    if (P.studio !== studio) this.applyStudio(); else { STAGE.layout(); }
    $('#docTitle').value = P.title;
    window.dispatchEvent(new Event('sw:changed')); BUS.emit('changed'); BUS.emit('sel'); TL.render(); PLAY.still(); this.histBtns();
  },
  select(ids){ this.sel = new Set(ids); if (this.cropId && !this.sel.has(this.cropId)) this.cropId = ''; BUS.emit('sel'); STAGE.overlay(); TL.render(); },
  toggleSel(id){ const s = new Set(this.sel); s.has(id) ? s.delete(id) : s.add(id); this.select([...s]); },
  addLayer(L, o = {}){
    if (this.readOnly) return;
    if (L.t !== 'audio' && L.track == null) L.track = topTrack(this.P);
    this.P.layers.push(L); if (o.select !== false) this.sel = new Set([L.id]);
    this.commit(o.label || 'Ajouter ' + ({text:'un texte', shape:'une forme', image:'une image', video:'une vidéo', audio:'un son', color:'un fond'})[L.t]); BUS.emit('sel');
    return L;
  },
  timing(len = 5){
    if (!TIMED(this.studio)) return {start:0, dur:this.P.dur};
    const rest = PLAY.end() - PLAY.t, full = this.P.layers.some(l => l.t !== 'audio'); // projet vide : durée par défaut, sinon jusqu'à la fin
    return {start:round(PLAY.t, 3), dur:round(full && rest > .5 ? Math.min(len, Math.max(1, rest)) : len, 3)};
  },
  addPresetText(p){
    const P = this.P, m = Math.min(P.w, P.h), o = {...p.o}, place = o.place; delete o.place;
    o.fs = Math.round((o.fs || .07) * m); if (o.tsw) o.tsw = Math.max(2, Math.round(o.tsw * m / 1080)); if (o.shadow) o.shadow = {...o.shadow, b:Math.round(o.shadow.b * m / 1080)};
    const L = mkText(P, {...o, name:p.n, ...this.timing(5), track:topTrack(P)}); L.h = Math.max(measureText(L).h, 4);
    if (place === 'bottom'){ L.w = Math.round(P.w * .86); L.x = Math.round((P.w - L.w) / 2); L.h = measureText(L).h; L.y = Math.round(P.h * .86 - L.h); }
    if (place === 'lower'){ L.w = Math.round(P.w * .45); L.x = Math.round(P.w * .06); L.h = measureText(L).h; L.y = Math.round(P.h * .72); }
    else if (!place) L.y = Math.round((P.h - L.h) / 2);
    this.addLayer(L, {label:'Ajouter un texte'});
    if (!TIMED(this.studio) || this.studio === 'motion') setTimeout(() => STAGE.editText(L), 30);
  },
  /* média de la bibliothèque → calque (images au centre ; vidéos / sons à la suite sur la piste, ou à la tête de lecture) */
  addMedia(m, atHead){
    if (!m || this.readOnly) return; const P = this.P, timed = TIMED(this.studio);
    const S = this.sel1(); if (m.kind === 'image' && S && ((S.t === 'shape' && S.slot) || (S.t === 'image' && S.frame))) return this.fillSlot(S, m);
    const L = mkMediaLayer(P, m, {track:m.kind === 'audio' ? 0 : topTrack(P)});
    if (m.kind === 'image' && !timed){ L.start = 0; L.dur = P.dur; }
    else if (timed){
      if (atHead || m.kind === 'image'){ L.start = round(PLAY.t, 3); if (m.kind === 'image') L.dur = 5; L.track = m.kind === 'audio' ? topTrack(P, true) : topTrack(P); }
      else { // à la suite des clips de la piste 1 (vidéo) ou A1 (son)
        const tr = m.kind === 'audio' ? 0 : 0, same = P.layers.filter(l => (l.t === 'audio') === (m.kind === 'audio') && l.track === tr);
        L.track = tr; L.start = round(same.reduce((e, l) => Math.max(e, l.start + l.dur), 0), 3);
        if (m.kind === 'video' && same.some(l => l.t !== 'video' && l.t !== 'image')) { L.track = topTrack(P); L.start = round(PLAY.t, 3); }
      }
    } else { L.start = 0; if (m.kind !== 'image') L.dur = Math.max(L.dur, .1); }
    if (m.kind === 'video' && !timed && this.studio !== 'photo') this.P.dur = Math.max(P.dur, L.dur);
    this.addLayer(L, {label:'Ajouter ' + m.name});
    if (timed && m.kind !== 'image'){ syncDur(P); TL.render(); }
  },
  async importFiles(files, o = {}){
    if (this.readOnly) return toast('Projet en lecture seule');
    files = [...files]; if (!files.length) return;
    const proj = files.find(f => /\.(spectramotion|zip)$/i.test(f.name));
    if (proj) return window.SWImport ? window.SWImport(proj) : null;
    let ok = 0; const added = [];
    BUSY.show(`Import de ${files.length} fichier${files.length > 1 ? 's' : ''}…`);
    for (const f of files){
      try { const m = await MEDIA.add(f); this.P.media[m.id] = m; added.push(m); ok++; }
      catch(e){ toast(e.message || 'Import impossible', 5000); }
    }
    BUSY.hide();
    if (!ok) return;
    this.commit('Importer des médias');
    if (o.add !== false) for (const m of added) this.addMedia(m, o.atHead);
    if (TIMED(this.studio)) requestAnimationFrame(() => { const vis = TL.lanes.clientWidth / TL.pps; if (PLAY.end() > vis * .95 || PLAY.end() < vis * .25) TL.fitAll(); });
    if (PANEL.cur !== 'media' && PANEL.cur !== 'audio' && PANEL.open) PANEL.render();
    toast(`${ok} média${ok > 1 ? 's' : ''} importé${ok > 1 ? 's' : ''}`);
    this.uploadPending(); return added;
  },
  importPick(kind, o = {}){
    const inp = $('#smFile'); inp.accept = kind === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac' : kind === 'image' ? 'image/*' : kind === 'video' ? 'video/*' : MEDIA_ACCEPT + ',.mp3,.wav,.m4a,.mov,.spectramotion,.zip';
    inp.onchange = () => { const f = [...inp.files]; inp.value = ''; this.importFiles(f, o); }; inp.click();
  },
  async uploadPending(){
    const C = window.SMCloudMedia; if (!C?.ok() || this.readOnly || this.uploading) return; this.uploading = true;
    try { let n = 0; for (const m of Object.values(this.P.media)) if (!m.cloud && !m.cloudSkip && !MEDIA.missing(m)){ if (await MEDIA.upload(this.P, m)) n++; }
      if (n){ this.commit('Médias envoyés dans le cloud', true); } }
    finally { this.uploading = false; }
  },
  relink(m){
    const inp = $('#smFile'); inp.accept = m.kind + '/*'; inp.onchange = async () => { const f = inp.files[0]; inp.value = ''; if (!f) return;
      try { await MEDIA.relink(m, f); this.commit('Relier le média'); toast('Média relié'); this.uploadPending(); STAGE.paint(); TL.render(); } catch(e){ toast(e.message, 4000); } }; inp.click();
  },
  removeMedia(m){
    const P = this.P; P.layers = P.layers.filter(l => l.media !== m.id); for (const g of P.pages || []) if (g.layers) g.layers = g.layers.filter(l => l.media !== m.id); delete P.media[m.id];
    if (m.cloud && m.path) window.SMCloudMedia?.remove(m.path).catch(() => {});
    this.commit('Retirer un média'); toast('Média retiré du projet (Ctrl + Z pour annuler)');
  },
  deleteSel(){
    if (this.readOnly) return; const ids = this.selLayers().filter(l => !l.lock).map(l => l.id); if (!ids.length) return;
    this.P.layers = this.P.layers.filter(l => !ids.includes(l.id)); this.sel = new Set(); this.commit('Supprimer'); BUS.emit('sel');
  },
  duplicate(){
    if (this.readOnly) return; const out = [];
    for (const L of this.selLayers()){ const c = deep(L); c.id = uid('l'); c.name = (L.name || '') + (L.name ? ' (copie)' : '');
      if (TIMED(this.studio) && (L.t === 'video' || L.t === 'audio')) c.start = round(L.start + L.dur, 3); else { c.x += 24; c.y += 24; for (const p of ['x', 'y']) if (c.kf[p]) c.kf[p] = c.kf[p].map(k => [k[0], k[1] + 24, k[2]]); }
      if (L.t !== 'audio') c.track = topTrack(this.P); this.P.layers.push(c); out.push(c.id); }
    if (out.length){ this.sel = new Set(out); this.commit('Dupliquer'); BUS.emit('sel'); }
  },
  copy(){ const ls = this.selLayers(); if (!ls.length) return false; this.clip = {layers:deep(ls), media:Object.fromEntries(ls.filter(l => l.media).map(l => [l.media, deep(this.P.media[l.media])]))}; toast(`${ls.length} calque${ls.length > 1 ? 's copiés' : ' copié'}`, 1200); return true; },
  paste(){
    if (!this.clip || this.readOnly) return; const out = [];
    for (const [k, m] of Object.entries(this.clip.media)) if (!this.P.media[k]) this.P.media[k] = deep(m);
    for (const L0 of this.clip.layers){ const L = deep(L0); L.id = uid('l'); if (L.t !== 'audio') L.track = topTrack(this.P); if (TIMED(this.studio)) L.start = round(PLAY.t, 3); else { L.x += 24; L.y += 24; } this.P.layers.push(L); out.push(L.id); }
    this.sel = new Set(out); this.commit('Coller'); BUS.emit('sel');
  },
  /* ---------- outils, groupes, couleurs, charte ---------- */
  setTool(t){ this.tool = t; $('#app').classList.toggle('drawing', t === 'draw'); if (t === 'draw') this.select([]); if (PANEL.cur === 'draw') PANEL.render(); },
  group(){ const ls = this.selLayers().filter(l => l.t !== 'audio'); if (ls.length < 2) return toast('Sélectionnez au moins deux éléments à grouper.'); const g = uid('g'); ls.forEach(l => l.g = g); this.commit('Grouper'); toast('Éléments groupés (Ctrl + Maj + G pour dégrouper)'); BUS.emit('sel'); },
  ungroup(){ const ls = this.selLayers().filter(l => l.g); if (!ls.length) return; ls.forEach(l => delete l.g); this.commit('Dégrouper'); BUS.emit('sel'); },
  brand(){ return this.lib?.brand || {}; },
  setBrand(b){ this.lib = {...this.lib, brand:b}; if (window.SWLib?.merge) window.SWLib.merge({brand:b}); else try { localStorage.setItem('sm.brand', JSON.stringify(b)); } catch(e){} },
  iconCol(){ const L = this.sel1(); return L?.t === 'icon' ? L.col : (this.brand().colors || [])[0] || '#16131F'; },
  /* propriété « couleur principale » de la sélection */
  colorKey(L){ return {text:'col', shape:'fill', color:'fill', icon:'col', qr:'col', draw:'col'}[L.t] || (L.t === 'image' || L.t === 'video' ? 'stroke' : null); },
  colorTarget(){ const ls = this.selLayers().filter(l => this.colorKey(l)); if (!ls.length) return ''; return ls.length > 1 ? `${ls.length} éléments` : (ls[0].name || VISUAL_NAMES[ls[0].t] || 'l\'élément'); },
  applyColor(c){
    if (this.readOnly) return; const ls = this.selLayers().filter(l => this.colorKey(l));
    if (!ls.length){ this.P.bg = c; STAGE.layout(); this.commit('Fond'); return; }
    for (const L of ls){ const k = this.colorKey(L); if (L.t === 'chart') continue; L[k] = c; if (k === 'stroke' && !L.sw) L.sw = Math.max(4, Math.round(Math.min(L.w, L.h) * .02)); }
    this.commit('Couleur');
  },
  addPair(f){
    const P = this.P, m = Math.min(P.w, P.h), tm = this.timing(5); Promise.all([fontNeed(f.t), fontNeed(f.b)]).then(() => fontsReady(P)).then(() => { this.refitTexts(); STAGE.paint(); });
    const A = mkText(P, {txt:'Votre grand titre', font:f.t, fs:Math.round(m * .1), fw:800, name:'Titre · ' + f.n, ...tm, track:topTrack(P)}); A.h = Math.max(measureText(A).h, 4);
    const B = mkText(P, {txt:'Un texte d\'accompagnement, sobre et lisible, pour en dire un peu plus.', font:f.b, fs:Math.round(m * .036), fw:400, lh:1.4, name:'Texte · ' + f.n, ...tm, track:topTrack(P) + 1}); B.w = Math.round(P.w * .7); B.x = Math.round((P.w - B.w) / 2); B.h = Math.max(measureText(B).h, 4);
    const tot = A.h + B.h + m * .03; A.y = Math.round((P.h - tot) / 2); B.y = Math.round(A.y + A.h + m * .03); const g = uid('g'); A.g = B.g = g;
    P.layers.push(A, B); this.sel = new Set([A.id, B.id]); this.commit('Associer deux polices'); BUS.emit('sel');
  },
  addGrid(gr){
    const P = this.P, gut = Math.round(Math.min(P.w, P.h) * .015), tm = this.timing(5), ids = [], g = uid('g');
    for (const [x, y, w, h] of gr.c){ const L = mkShape(P, 'rect', {name:'Cadre photo · grille', slot:true, fill:'', x:Math.round(x * P.w + gut / 2), y:Math.round(y * P.h + gut / 2), w:Math.round(w * P.w - gut), h:Math.round(h * P.h - gut), ...tm, track:topTrack(P), g}); P.layers.push(L); ids.push(L.id); }
    this.sel = new Set(ids); this.commit('Grille photo ' + gr.n); BUS.emit('sel'); toast('Glissez des images dans les cadres de la grille');
  },
  /* calque de fond (couleur pleine page) : créé si besoin, sous tous les autres */
  bgLayer(fn, label){
    const P = this.P; let L = P.layers.find(l => (l.t === 'color' || (l.t === 'shape' && l.k === 'rect')) && l.track === 0 && l.x <= 0 && l.y <= 0 && l.w >= P.w && l.h >= P.h && !l.slot);
    if (!L){ P.layers.forEach(l => { if (l.t !== 'audio') l.track += 1; }); L = mkColor(P, '#FFFFFF', {track:0, start:0, dur:Math.max(P.dur, PLAY.end()), name:'Fond'}); P.layers.unshift(L); }
    fn(L); this.commit(label);
  },
  addPattern(k){ const base = hexOk(this.P.bg) ? this.P.bg : '#F4EFE6', fg = (this.brand().colors || [])[0] || '#7B2FF7'; this.bgLayer(L => { L.t = 'shape'; L.k = 'rect'; L.fill = base; L.fill2 = ''; L.pat = k; L.patc = fg; L.pats = Math.round(Math.min(this.P.w, this.P.h) / 18); L.name = 'Fond à motif'; }, 'Fond à motif'); },
  mediaAsBg(m){ const P = this.P, L = mkMediaLayer(P, m, {track:0, start:0, dur:Math.max(P.dur, PLAY.end()), fit:'cover', name:'Fond · ' + m.name}); L.x = L.y = 0; L.w = P.w; L.h = P.h; P.layers.forEach(l => { if (l.t !== 'audio') l.track += 1; }); P.layers.unshift(L); this.commit('Image de fond'); },
  /* cadre photo : l'image prend la place (et la forme) du cadre */
  fillSlot(slot, m){
    const P = this.P, i = P.layers.indexOf(slot); if (i < 0 || !m) return false;
    const L = mkMediaLayer(P, m, {x:slot.x, y:slot.y, w:slot.w, h:slot.h, rot:slot.rot, track:slot.track, start:slot.start, dur:slot.dur, fit:'cover', frame:true, g:slot.g, tin:slot.tin, tout:slot.tout, kf:deep(slot.kf || {}),
      mask:slot.t === 'image' ? slot.mask : slot.k === 'rect' ? 'none' : MASKS[slot.k] ? slot.k : 'none', r:slot.t === 'image' ? slot.r : slot.k === 'rect' ? slot.r || 0 : 0, name:'Photo · ' + m.name});
    if (!L.g) delete L.g; P.layers[i] = L; this.sel = new Set([L.id]); this.commit('Remplir le cadre'); BUS.emit('sel'); return true;
  },
  slotAt(pt, kind){ return [...drawOrder(this.P)].reverse().find(l => visible(l, PLAY.t) && !l.lock && ((l.t === 'shape' && l.slot) || (l.t === 'image' && l.frame && kind === 'image')) && (() => { const b = STAGE.box(l); return Math.abs(pt.x - b.cx) <= b.w / 2 && Math.abs(pt.y - b.cy) <= b.h / 2; })()) || null; },
  /* image déposée par glisser sur un cadre */
  dropOnSlot(L){
    const b = STAGE.box(L), pt = {x:b.cx, y:b.cy}, S = [...drawOrder(this.P)].reverse().find(l => l !== L && l.t === 'shape' && l.slot && visible(l, PLAY.t) && (() => { const q = STAGE.box(l); return Math.abs(pt.x - q.cx) <= q.w / 2 && Math.abs(pt.y - q.cy) <= q.h / 2; })());
    if (!S) return; const m = this.P.media[L.media]; this.P.layers = this.P.layers.filter(x => x !== L); this.fillSlot(S, m);
  },
  /* « Animer toute la page » : entrées échelonnées, du fond vers le premier plan */
  animatePage(){
    const P = this.P, ls = drawOrder(P).filter(l => !(l.x <= 0 && l.y <= 0 && l.w >= P.w && l.h >= P.h)); if (!ls.length) return;
    const fx = ['slideU', 'fade', 'pop', 'slideL', 'zoom', 'wipe']; let i = 0;
    for (const L of ls){ const k = L.t === 'text' ? (i % 3 === 0 ? 'slideU' : i % 3 === 1 ? 'fade' : 'wipe') : fx[i % fx.length]; L.tin = {k, d:.6}; if (!TIMED(this.studio) || this.studio === 'motion'){ const d = Math.min(.15 * i, Math.max(0, L.dur - .8)); if (TIMED(this.studio)){ L.start = round(L.start + d, 3); L.dur = round(Math.max(.5, L.dur - d), 3); } } i++; }
    this.commit('Animer la page'); PLAY.seek(0, false); PLAY.play(); toast('Animation de la page appliquée : lecture de l\'aperçu');
  },
  /* premier plan / arrière-plan : échange de piste avec le voisin */
  zorder(dir){
    const ls = this.selLayers().filter(l => l.t !== 'audio'); if (!ls.length) return;
    const order = drawOrder(this.P);
    for (const L of dir > 0 ? [...ls].reverse() : ls){
      const i = order.indexOf(L), j = i + dir; if (j < 0 || j >= order.length) continue; const o = order[j];
      if (o.track === L.track){ const a = this.P.layers.indexOf(L), b = this.P.layers.indexOf(o); [this.P.layers[a], this.P.layers[b]] = [this.P.layers[b], this.P.layers[a]]; }
      else { const t = L.track; L.track = o.track; o.track = t; }
      order.splice(i, 1); order.splice(j, 0, L);
    }
    this.commit(dir > 0 ? 'Avancer' : 'Reculer');
  },
  align(k){
    const ls = this.selLayers().filter(l => l.t !== 'audio' && !l.lock), P = this.P; if (!ls.length) return;
    const bx = L => { const p = STAGE.posOf(L); return {x:p.x, y:p.y, w:L.w, h:L.h}; };
    let R = {x:0, y:0, w:P.w, h:P.h};
    if (ls.length > 1){ const bs = ls.map(bx), x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)); R = {x:x0, y:y0, w:Math.max(...bs.map(b => b.x + b.w)) - x0, h:Math.max(...bs.map(b => b.y + b.h)) - y0}; }
    if (k === 'dh' || k === 'dv'){ const ax = k === 'dh' ? 'x' : 'y', sz = k === 'dh' ? 'w' : 'h', s = [...ls].sort((a, b) => bx(a)[ax] - bx(b)[ax]); if (s.length < 3) return toast('Sélectionnez au moins trois calques.');
      const tot = s.reduce((a, L) => a + L[sz], 0), gap = (R[sz] - tot) / (s.length - 1); let c = R[ax]; for (const L of s){ STAGE.setProp(L, ax, round(c, 1)); c += L[sz] + gap; } }
    else for (const L of ls){
      if (k === 'l') STAGE.setProp(L, 'x', R.x); if (k === 'r') STAGE.setProp(L, 'x', round(R.x + R.w - L.w, 1)); if (k === 'ch') STAGE.setProp(L, 'x', round(R.x + (R.w - L.w) / 2, 1));
      if (k === 't') STAGE.setProp(L, 'y', R.y); if (k === 'b') STAGE.setProp(L, 'y', round(R.y + R.h - L.h, 1)); if (k === 'cv') STAGE.setProp(L, 'y', round(R.y + (R.h - L.h) / 2, 1));
    }
    this.commit('Aligner');
  },
  /* champ du panneau (data-p) → propriété */
  bindInput(el, final){
    if (this.readOnly) return;
    const p = el.dataset.p, P = this.P, L = this.sel1();
    let v = el.type === 'checkbox' ? el.checked : el.type === 'number' || el.type === 'range' ? +el.value : el.value;
    const out = el.closest('label')?.querySelector('output');
    if (p.startsWith('@')){ // projet
      const k = p.slice(1);
      if (k === 'fmt'){ if (final && v) this.setFormat(FORMATS.find(f => f.id === v)); return; }
      if (k === 'w' || k === 'h'){ if (!final) return; v = clamp(Math.round(v), 16, 7680); if (v !== P[k]) this.setFormat({w:k === 'w' ? v : P.w, h:k === 'h' ? v : P.h}); return; }
      if (k === 'fps'){ P.fps = +v; if (final) this.commit('Images par seconde'); return; }
      if (k === 'dur'){ if (!final) return; v = clamp(v, .1, 3600); if (TIMED(this.studio)){ const e = projEnd(P); if (v < e) toast('La durée suit le dernier clip : raccourcissez les clips pour réduire le projet.', 3500); else { P.layers.filter(l => l.t !== 'audio' && Math.abs(l.start + l.dur - e) < 1e-3).forEach(l => l.dur = round(v - l.start, 3)); } } else { P.dur = v; P.layers.forEach(l => { if (l.start === 0) l.dur = v; }); } this.commit('Durée'); return; }
      if (k === 'bg'){ P.bg = v; STAGE.layout(); if (final) this.commit('Fond'); return; }
      if (k === 'shadow' && L){ L.shadow = v ? {c:'#00000066', b:24, x:0, y:10} : undefined; if (!v) delete L.shadow; this.commit('Ombre'); return; }
      if (k === 'pen.sw'){ this.pen.sw = clamp(+v, 1, 400); const o = el.closest('label')?.querySelector('output'); if (o) o.textContent = Math.round(v) + ' px'; return; }
      if (k === 'brand.title' || k === 'brand.body'){ if (!final) return; const br = this.brand(); this.setBrand({...br, fonts:{...(br.fonts || {}), [k.slice(6)]:v}}); if (v) fontNeed(v); PANEL.render(); return; }
      if ((k.startsWith('bgk.') || k.startsWith('duo.')) && L){ const [a, b] = k.split('.'); if (!L[a]) return; L[a][b] = b === 'c' || a === 'duo' ? v : +v; if (a === 'bgk') PIX.cache.clear(); const o = el.closest('label')?.querySelector('output'); if (o) o.textContent = Math.round(v); if (final) this.commit(a === 'bgk' ? 'Retirer le fond' : 'Bichromie'); else STAGE.paint(); return; }
      if (k === 'tfx' && L){ if (v === 'none') delete L.tfx; else L.tfx = {k:v, c:L.tfx?.c || (v === 'neon' ? '#14C2EC' : v === 'shadow' ? '#16131F' : '#FF3F86'), d:L.tfx?.d ?? 50}; this.commit('Effet de texte'); return; }
      if (k.startsWith('tfx.') && L?.tfx){ L.tfx[k.slice(4)] = k === 'tfx.c' ? v : +v; if (final) this.commit('Effet de texte'); else STAGE.paint(); return; }
      if (k === 'chartData' && L?.t === 'chart'){ const rows = String(v).split('\n').map(r => r.split(/[;\t]|,(?=\s*-?\d)/)).filter(r => r[0]?.trim() || r[1]).slice(0, 40).map(r => [r[0].trim().slice(0, 40), num(String(r[1] ?? '').replace(',', '.').replace(/[^\d.\-]/g, ''), 0)]); if (rows.length){ L.data = rows; if (final) this.commit('Données du graphique'); else STAGE.paint(); } return; }
      if (k.startsWith('pal.') && L?.pal){ L.pal[+k.slice(4)] = v; if (final) this.commit('Couleur'); else STAGE.paint(); return; }
      return;
    }
    const sels = p === 'name' || p === 'txt' ? (L ? [L] : []) : this.selLayers(); if (!sels.length) return;
    for (const X of sels){
      if (p.includes('.')){
        const [a, b] = p.split('.');
        if (a === 'adj'){ X.adj ||= {}; if (v) X.adj[b] = v; else delete X.adj[b]; }
        else if (a === 'crop'){ X.crop ||= {x:0, y:0, w:1, h:1}; X.crop[b] = clamp(v / 100, 0, 1); if (X.crop.x + X.crop.w > 1) X.crop.w = 1 - X.crop.x; if (X.crop.y + X.crop.h > 1) X.crop.h = 1 - X.crop.y; X.fit = 'fill'; this.cropKeepScale(X); }
        else if (a === 'tin' || a === 'tout'){ X[a] = {...X[a], [b]:b === 'd' ? clamp(v, .05, 30) : v}; }
        else if (a === 'shadow' && X.shadow){ X.shadow[b] = b === 'c' ? v + (X.shadow.c.length > 7 ? X.shadow.c.slice(7) : '66') : v; }
        else if (a === 'tfx' && X.tfx){ X.tfx[b] = b === 'c' ? v : +v; }
        continue;
      }
      if (p === 'sc') v = clamp(v / 100, .01, 50); if (p === 'op') v = clamp(v / 100, 0, 1);
      if (ANIM_PROPS.includes(p)){ STAGE.setProp(X, p, v); continue; }
      if (p === 'speed'){ const o = X.speed || 1; X.speed = +v; X.dur = round(X.dur * o / X.speed, 3); continue; }
      if (p === 'start'){ X.start = round(clamp(v, 0, 36000), 3); continue; }
      if (p === 'dur'){ let d = clamp(v, 1 / P.fps, 36000); const m = X.media && P.media[X.media]; if ((X.t === 'video' || X.t === 'audio') && m?.dur) d = Math.min(d, (m.dur - (X.in || 0)) / (X.speed || 1)); X.dur = round(d, 3); continue; }
      if (p === 'in'){ const m = P.media[X.media]; X.in = round(clamp(v, 0, Math.max(0, (m?.dur || 1e9) - .05)), 3); continue; }
      if (p === 'w' || p === 'h') v = Math.max(1, v);
      if (['fw', 'r', 'sw', 'tsw', 'fs', 'ga', 'lh', 'ls', 'vol', 'fadeIn', 'fadeOut', 'eqLo', 'eqHi', 'pan', 'curve', 'pats'].includes(p)) v = +v;
      if (p === 'font' && X.t === 'text'){ fontNeed(v).then(() => document.fonts?.load(textFont(X))).then(() => { X.h = Math.max(measureText(X).h, 4); STAGE.paint(); }).catch(() => {}); }
      if (p === 'txt' && X.t === 'qr' && !qrMatrix(String(v), X.ecc || 'M')){ toast('Texte trop long pour un QR code'); continue; }
      X[p] = v;
      if (X.t === 'text' && ['txt', 'font', 'fs', 'fw', 'w', 'lh', 'ls', 'up', 'it', 'tbg', 'tbgPad', 'curve', 'list'].includes(p)) X.h = Math.max(measureText(X).h, 4);
      if ((p === 'eqLo' || p === 'eqHi' || p === 'pan') && final && PLAY.playing){ PLAY.pause(); PLAY.play(); }
    }
    if (out){ const r = el.closest('label'); const f = {sc:x => Math.round(x) + ' %', op:x => Math.round(x) + ' %'}[p]; out.textContent = el.type === 'range' ? (r.dataset.fmt || '') : ''; if (el.type === 'range') out.textContent = this.fmtOut(p, v); }
    if (p === 'name'){ if (final) this.commit('Renommer'); return; }
    if (final){ this.commit('Modifier'); if (p === 'txt' || p === 'fs' || p === 'w') STAGE.overlay(); }
    else { if (TIMED(this.studio)) syncDur(P); STAGE.paint(); if (['vol', 'fadeIn', 'fadeOut', 'start', 'dur'].includes(p)) TL.render(); }
  },
  fmtOut(p, v){
    if (p.startsWith('adj.')) return (v > 0 && ADJ_KEYS[p.slice(4)][1] < 0 ? '+' : '') + Math.round(v);
    if (p.startsWith('crop.')) return round(v, 1) + ' %';
    if (p === 'eqLo' || p === 'eqHi') return (v > 0 ? '+' : '') + Math.round(v) + ' dB';
    if (p === 'pan') return Math.abs(v) < .01 ? 'centre' : (v < 0 ? 'gauche ' : 'droite ') + Math.round(Math.abs(v) * 100) + ' %';
    if (p === 'curve') return Math.round(v) + ' %';
    return {op:Math.round(v) + ' %', vol:Math.round(v * 100) + ' %', pats:Math.round(v) + ' px', lh:round(v, 2), ls:round(v, 2) + ' em', ga:Math.round(v) + '°', r:Math.round(v) + ' px', fadeIn:round(v, 2) + ' s', fadeOut:round(v, 2) + ' s', 'tin.d':round(v, 2) + ' s', 'tout.d':round(v, 2) + ' s'}[p] ?? round(v, 2);
  },
  /* recadrage : la zone gardée garde sa taille à l'écran */
  cropKeepScale(L){
    const m = this.P.media[L.media]; if (!m?.w) return; const c = L.crop || {x:0, y:0, w:1, h:1};
    const ar = (c.w * m.w) / (c.h * m.h); L.h = round(L.w / ar, 1);
  },
  cropPreset(k){
    const L = this.sel1(), m = L && this.P.media[L.media]; if (!m?.w) return;
    if (k === 'free'){ L.crop = null; L.fit = 'contain'; L.h = round(L.w * m.h / m.w, 1); this.commit('Recadrage libre'); PANEL.render(); return; }
    const [a, b] = k.split(':').map(Number), want = a / b, src = m.w / m.h;
    L.crop = want > src ? {x:0, w:1, h:round(src / want, 4), y:round((1 - src / want) / 2, 4)} : {y:0, h:1, w:round(want / src, 4), x:round((1 - want / src) / 2, 4)};
    L.fit = 'fill'; L.h = round(L.w / want, 1); this.commit('Recadrer ' + k); PANEL.render();
  },
  /* changement de format : le contenu est remis à l'échelle et recentré */
  setFormat(f){
    if (!f) return; rescale(this.P, f); PAGES.thumbs = {}; STAGE.fit(); this.commit('Format ' + (f.name || `${f.w} × ${f.h}`)); PANEL.render(); toast(`Format ${f.w} × ${f.h}`);
  },
  useTemplate(id){
    const t = SM_TPL.find(x => x.id === id); if (!t) return;
    const go = () => { const N = tplProject(t), P = this.P; N.media = P.media; N.title = P.title === 'Projet sans titre' ? t.name : P.title; this.P = N; this.sel = new Set(); $('#docTitle').value = N.title;
      if (N.studio !== P.studio) this.applyStudio(true); else { STAGE.fit(); TL.fitAll(); }
      PLAY.t = TIMED(N.studio) ? 0 : 0; fontsReady(N).then(() => { this.refitTexts(); STAGE.paint(); }); this.commit('Modèle ' + t.name); BUS.emit('sel');
      if (TIMED(N.studio)){ PLAY.seek(0, false); setTimeout(() => PLAY.play(), 300); } };
    if (this.P.layers.length) window.SWDlg.open(`<h3>Utiliser le modèle « ${escH(t.name)} » ?</h3><p class="dlg-p">Le contenu actuel du projet est remplacé (vos médias restent dans la bibliothèque). Ctrl + Z permet de revenir en arrière.</p><div class="dlg-acts"><button type="button" class="ap-btn alt" data-dlg="close">Annuler</button><button type="button" class="ap-btn" id="tplOk">Utiliser le modèle</button></div>`, d => d.querySelector('#tplOk').onclick = () => { window.SWDlg.close(); go(); });
    else go();
  },
  /* voix off : enregistrement du micro */
  async recordVoice(){
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return toast('Enregistrement impossible dans ce navigateur.');
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}}); } catch(e){ return toast('Micro refusé ou indisponible.'); }
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported(t)) || '';
    const rec = new MediaRecorder(stream, type ? {mimeType:type} : {}), chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    let t0 = 0, iv = 0;
    window.SWDlg.open(`<h3>Voix off</h3><p class="dlg-p">Le son sera posé à la tête de lecture (${fmtT(PLAY.t)}), sur une nouvelle piste audio.</p><div class="vo"><i class="vo-dot"></i><b id="voT">0:00.0</b></div><div class="dlg-acts"><button type="button" class="ap-btn alt" id="voX">Annuler</button><button type="button" class="ap-btn" id="voGo">Démarrer</button></div>`, d => {
      const stopAll = () => { clearInterval(iv); stream.getTracks().forEach(t => t.stop()); };
      d.querySelector('#voX').onclick = () => { try { rec.state !== 'inactive' && rec.stop(); } catch(e){} stopAll(); rec.onstop = null; window.SWDlg.close(); };
      d.querySelector('#voGo').onclick = e => {
        if (rec.state === 'inactive'){ rec.start(250); t0 = performance.now(); d.querySelector('.vo').classList.add('on'); e.currentTarget.textContent = 'Arrêter et ajouter'; iv = setInterval(() => d.querySelector('#voT').textContent = fmtT((performance.now() - t0) / 1000), 100); return; }
        rec.onstop = async () => { stopAll(); window.SWDlg.close(); const blob = new Blob(chunks, {type:rec.mimeType || 'audio/webm'}), f = new File([blob], `Voix off ${new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}.${(rec.mimeType || '').includes('mp4') ? 'm4a' : (rec.mimeType || '').includes('ogg') ? 'ogg' : 'webm'}`, {type:rec.mimeType || 'audio/webm'});
          await this.importFiles([f], {atHead:true}); };
        rec.stop();
      };
    });
  },
  menu(anchor, items){
    const m = $('#edMenu'); m.innerHTML = items.map(i => i === '-' ? '<hr>' : `<button type="button" data-mi="${i.k}" class="${i.danger ? 'danger' : ''}"${i.off ? ' disabled' : ''}><b>${escH(i.t)}</b>${i.s ? `<span>${escH(i.s)}</span>` : ''}</button>`).join('');
    m.hidden = false; const r = anchor.getBoundingClientRect();
    m.style.top = Math.min(r.bottom + 4, innerHeight - m.offsetHeight - 12) + 'px'; m.style.left = Math.max(12, Math.min(r.left, innerWidth - m.offsetWidth - 12)) + 'px';
    return new Promise(res => { m.onclick = e => { const b = e.target.closest('[data-mi]'); if (!b) return; m.hidden = true; res(b.dataset.mi); }; this.menuCancel = () => res(null); });
  },
  meta(){
    const P = this.P; let preview = '';
    try { preview = thumbOf(P, TIMED(P.studio) ? Math.min(PLAY.end() * .35, 2) : 0, 240, .6); } catch(e){}
    return {preview, studio:P.studio, fmt:`${P.w}x${P.h}`, dur:Math.round((TIMED(P.studio) ? PLAY.end() : 0) * 1000), media:Object.keys(P.media).length};
  },
};
/* indicateur d'activité de l'éditeur */
const BUSY = { show(t){ const b = $('#edBusy'); b.querySelector('span').textContent = t; b.hidden = false; }, hide(){ $('#edBusy').hidden = true; } };
/* polices du projet chargées avant le dessin */
function fontsReady(P){
  const ls = allLayers(P).filter(l => l.t === 'text' || l.t === 'chart'), names = [...new Set(ls.map(l => l.font || 'Inter'))];
  return Promise.all(names.map(n => fontNeed(n))).then(() => {
    if (!document.fonts?.load) return null;
    const want = new Set(ls.map(l => l.t === 'chart' ? `700 40px ${fontCss(l.font)}` : `${l.it ? 'italic ' : ''}${l.fw || 700} 40px ${fontCss(l.font)}`));
    return Promise.all([...want].map(f => document.fonts.load(f).catch(() => null)));
  }).then(() => null);
}

/* ---------- câblage de l'interface ---------- */
function wireEditor(){
  STAGE.init(); TL.init(); PANEL.init(); INSP.init(); PAGES.init();
  $('#stgGrid').addEventListener('click', e => { STAGE.grid = !STAGE.grid; e.currentTarget.setAttribute('aria-pressed', STAGE.grid); STAGE.overlay(); });
  $('#studioNav').innerHTML = STUDIOS.map(s => `<button type="button" role="tab" data-studio="${s.id}" aria-selected="false" title="${s.name} · ${s.desc}">${ico(s.ic)}<span>${s.name}</span></button>`).join('');
  $('#studioNav').addEventListener('click', e => { const b = e.target.closest('[data-studio]'); if (b && !ED.readOnly) ED.setStudio(b.dataset.studio); });
  $('#undoBtn').addEventListener('click', () => ED.undo()); $('#redoBtn').addEventListener('click', () => ED.redo());
  $('#exportBtn').addEventListener('click', () => IO.dialog());
  $('#homeBtn').addEventListener('click', () => window.SWHome?.show('home'));
  $('#shareBtn').addEventListener('click', () => window.SWShareCurrent ? window.SWShareCurrent() : toast('Partage indisponible'));
  $('#docTitle').addEventListener('change', e => { const v = e.target.value.trim() || 'Projet sans titre'; e.target.value = v; ED.P.title = v; ED.commit('Renommer le projet'); });
  $('#docTitle').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); e.stopPropagation(); });
  $('#fileBtn').addEventListener('click', e => fileMenu(e.currentTarget));
  // transport
  $('#tlPlay').addEventListener('click', () => PLAY.toggle());
  $('#tlStart').addEventListener('click', () => PLAY.seek(0));
  $('#tlEnd').addEventListener('click', () => PLAY.seek(PLAY.end()));
  $('#tlPrev').addEventListener('click', () => PLAY.seek(PLAY.t - 1 / ED.P.fps, false));
  $('#tlNext').addEventListener('click', () => PLAY.seek(PLAY.t + 1 / ED.P.fps, false));
  $('#tlSplit').addEventListener('click', () => TL.split());
  $('#tlDel').addEventListener('click', () => ED.deleteSel());
  $('#tlFit').addEventListener('click', () => TL.fitAll());
  $('#tlLoop').addEventListener('click', e => { PLAY.loop = !PLAY.loop; e.currentTarget.setAttribute('aria-pressed', PLAY.loop); });
  $('#tlSnap').addEventListener('click', e => { ED.snap = !ED.snap; e.currentTarget.setAttribute('aria-pressed', ED.snap); $('#stgSnap').setAttribute('aria-pressed', ED.snap); });
  $('#tlFold').addEventListener('click', () => { const tl = $('#smTl'); tl.classList.toggle('folded'); $('#tlFold').setAttribute('aria-expanded', !tl.classList.contains('folded')); requestAnimationFrame(() => STAGE.fit()); });
  // outils de la scène
  $('#stgZoomIn').addEventListener('click', () => STAGE.setZoom(STAGE.zoom * 1.25));
  $('#stgZoomOut').addEventListener('click', () => STAGE.setZoom(STAGE.zoom / 1.25));
  $('#stgFit').addEventListener('click', () => STAGE.fit());
  $('#stgSnap').addEventListener('click', e => { ED.snap = !ED.snap; e.currentTarget.setAttribute('aria-pressed', ED.snap); $('#tlSnap').setAttribute('aria-pressed', ED.snap); });
  $('#stgPlay').addEventListener('click', () => PLAY.toggle());
  BUS.on('zoom', () => { $('#stgZoomV').textContent = Math.round(STAGE.zoom * 100) + ' %'; });
  BUS.on('playstate', () => { const on = PLAY.playing; for (const b of [$('#tlPlay'), $('#stgPlay')]){ b.innerHTML = ico(PLAY.waiting ? 'wave' : on ? 'pause' : 'play'); b.setAttribute('aria-label', on ? 'Pause (Espace)' : 'Lecture (Espace)'); b.title = on ? 'Pause (Espace)' : 'Lecture (Espace)'; }
    $('#stgPlay').hidden = TIMED(ED.studio) || !ED.P.layers.some(l => l.tin.k !== 'none' || l.tout.k !== 'none' || Object.keys(l.kf || {}).length || l.t === 'video'); STAGE.overlay(); });
  BUS.on('time', t => { if (!TIMED(ED.studio)) $('#stgTime').textContent = fmtT(t); });
  // glisser-déposer de fichiers et de médias de la bibliothèque
  const app = $('#app');
  app.addEventListener('dragover', e => { const ty = [...(e.dataTransfer?.types || [])]; if (ty.includes('Files') || ty.includes('text/x-sm-media')){ e.preventDefault(); app.classList.add('drop'); } });
  app.addEventListener('dragleave', e => { if (!app.contains(e.relatedTarget)) app.classList.remove('drop'); });
  app.addEventListener('drop', e => {
    app.classList.remove('drop'); const mid = e.dataTransfer.getData('text/x-sm-media');
    const onTl = e.target.closest('#smTl'); if (onTl){ const t = TL.tAt(e); PLAY.seek(t, false); }
    const slot = !onTl && e.target.closest('#smStage') ? ED.slotAt(STAGE.toP(e), 'image') : null;
    if (mid){ e.preventDefault(); const m = ED.P.media[mid]; if (slot && m?.kind === 'image') return ED.fillSlot(slot, m); ED.addMedia(m, !!onTl); return; }
    const fs = [...(e.dataTransfer.files || [])]; if (!fs.length) return; e.preventDefault();
    if (slot && fs.length === 1 && /^image\//.test(fs[0].type)) return ED.importFiles(fs, {add:false}).then(ms => { const m = ms?.[0]; if (m) ED.fillSlot(slot, m); });
    ED.importFiles(fs, {atHead:!!onTl});
  });
  document.addEventListener('click', e => { const m = $('#edMenu'); if (!m.hidden && !m.contains(e.target) && !e.target.closest('[data-mmenu],#fileBtn')){ m.hidden = true; ED.menuCancel?.(); } });
  // raccourcis clavier
  window.addEventListener('keydown', e => onKey(e));
  window.addEventListener('keyup', e => { if (e.code === 'Space') STAGE.spaceDown = false; });
  document.fonts?.addEventListener?.('loadingdone', () => { clearTimeout(wireEditor.ft); wireEditor.ft = setTimeout(() => { STAGE.paint(); PAGES.soon(); }, 200); });
  ED.histBtns();
}
function onKey(e){
  if ($('#app').hidden || !$('#apDlg').hidden || STAGE.editing) return;
  const tag = e.target.closest?.('input,textarea,select,[contenteditable]'); if (tag) return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (mod && k === 'z' && !e.shiftKey){ e.preventDefault(); return ED.undo(); }
  if (mod && (k === 'y' || (k === 'z' && e.shiftKey))){ e.preventDefault(); return ED.redo(); }
  if (mod && k === 'd'){ e.preventDefault(); return ED.duplicate(); }
  if (mod && k === 'g'){ e.preventDefault(); return e.shiftKey ? ED.ungroup() : ED.group(); }
  if (mod && k === 'c'){ if (ED.copy()) e.preventDefault(); return; }
  if (mod && k === 'v'){ if (ED.clip){ e.preventDefault(); ED.paste(); } return; }
  if (mod && k === 'a'){ e.preventDefault(); return ED.select(ED.P.layers.filter(l => !l.lock && (TIMED(ED.studio) || visible(l, PLAY.t))).map(l => l.id)); }
  if (mod && k === 's'){ e.preventDefault(); window.SWHome?.flush(); toast('Enregistré', 1000); return; }
  if (mod && k === 'e'){ e.preventDefault(); return IO.dialog(); }
  if (mod && (k === '+' || k === '=')){ e.preventDefault(); return STAGE.setZoom(STAGE.zoom * 1.25); }
  if (mod && k === '-'){ e.preventDefault(); return STAGE.setZoom(STAGE.zoom / 1.25); }
  if (mod && k === '0'){ e.preventDefault(); return STAGE.fit(); }
  if (mod) return;
  if (e.code === 'Space'){ e.preventDefault(); if (!e.repeat) { if (TIMED(ED.studio) || !$('#stgPlay').hidden) PLAY.toggle(); else STAGE.spaceDown = true; } return; }
  if (k === 'delete' || k === 'backspace'){ e.preventDefault(); return ED.deleteSel(); }
  if (k === 'escape'){ if (ED.tool !== 'select'){ ED.setTool('select'); return; } if (ED.sel.size) ED.select([]); return; }
  if (k === 'p' && !ED.readOnly && !TIMED(ED.studio)){ e.preventDefault(); PANEL.show('draw'); return ED.setTool(ED.tool === 'draw' ? 'select' : 'draw'); }
  if ((k === 'pagedown' || k === 'pageup') && !TIMED(ED.studio) && pageCount(ED.P) > 1){ e.preventDefault(); return PAGES.go(clamp((ED.P.pg || 0) + (k === 'pagedown' ? 1 : -1), 0, pageCount(ED.P) - 1)); }
  if (k === 's' && TIMED(ED.studio)){ e.preventDefault(); return TL.split(); }
  if (k === 't' && !ED.readOnly){ e.preventDefault(); return ED.addPresetText({n:'Texte', o:{txt:'Votre texte', fs:.07, fw:700}}); }
  if (k === 'home'){ e.preventDefault(); return PLAY.seek(0); }
  if (k === 'end'){ e.preventDefault(); return PLAY.seek(PLAY.end()); }
  if (k === 'j' || k === 'l'){ e.preventDefault(); return PLAY.seek(PLAY.t + (k === 'l' ? 1 : -1), false); }
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k)){
    const ls = ED.selLayers().filter(l => !l.lock && l.t !== 'audio');
    if (!ls.length && TIMED(ED.studio) && (k === 'arrowleft' || k === 'arrowright')){ e.preventDefault(); return PLAY.seek(PLAY.t + (k === 'arrowright' ? 1 : -1) / ED.P.fps * (e.shiftKey ? 10 : 1), false); }
    if (!ls.length || ED.readOnly) return; e.preventDefault(); const d = e.shiftKey ? 10 : 1;
    for (const L of ls){ if (k === 'arrowleft' || k === 'arrowright') STAGE.setProp(L, 'x', round(STAGE.posOf(L).x + (k === 'arrowright' ? d : -d), 1)); else STAGE.setProp(L, 'y', round(STAGE.posOf(L).y + (k === 'arrowdown' ? d : -d), 1)); }
    clearTimeout(onKey.t); STAGE.paint(); INSP.live(); onKey.t = setTimeout(() => ED.commit('Déplacer'), 400); return;
  }
  if (k === '?') return shortcutsDlg();
}
async function fileMenu(btn){
  const full = IO.canFull();
  const k = await ED.menu(btn, [{k:'new', t:'Nouveau projet', s:'Retour à l\'accueil'}, {k:'dup', t:'Dupliquer le projet'}, '-',
    {k:'import', t:'Importer des médias…', s:'Images, vidéos, sons'}, {k:'open', t:'Ouvrir un fichier projet…', s:'.spectramotion ou paquet .zip'}, '-',
    {k:'export', t:'Exporter…', s:'Image, vidéo, son, projet (Ctrl + E)'}, {k:'tpl', t:'Enregistrer comme modèle personnel'}, '-',
    {k:'settings', t:'Paramètres du projet', s:'Format, images par seconde, fond'}, {k:'keys', t:'Raccourcis clavier', s:'Touche ?'}]);
  if (k === 'new') window.SWHome?.show('home');
  if (k === 'dup') window.SWHome?.duplicateCurrent?.();
  if (k === 'import') ED.importPick('');
  if (k === 'open'){ const inp = $('#smFile'); inp.accept = '.spectramotion,.zip,.json'; inp.onchange = () => { const f = inp.files[0]; inp.value = ''; if (f) window.SWImport?.(f); }; inp.click(); }
  if (k === 'export') IO.dialog(); if (k === 'settings'){ ED.select([]); INSP.toggle(true); }
  if (k === 'tpl') window.SWAsk?.('Enregistrer comme modèle', 'Nom du modèle', ED.P.title, 'Enregistrer', async v => window.SWHome?.saveTemplate(v));
  if (k === 'keys') shortcutsDlg();
  void full;
}
function shortcutsDlg(){
  const rows = [['Espace', 'Lecture / pause'], ['S', 'Couper à la tête de lecture'], ['Suppr', 'Supprimer la sélection'], ['Ctrl + Z / Ctrl + Maj + Z', 'Annuler / rétablir'], ['Ctrl + C / V / D', 'Copier / coller / dupliquer'],
    ['T', 'Ajouter un texte'], ['P', 'Crayon (dessiner) · Échap pour arrêter'], ['Ctrl + G / Ctrl + Maj + G', 'Grouper / dégrouper'], ['Page préc. / suiv.', 'Changer de page'], ['Alt + clic', 'Sélectionner un élément dans un groupe'], ['Flèches', 'Déplacer (Maj : ×10) · sans sélection : image par image'], ['J / L', 'Reculer / avancer d\'une seconde'], ['Début / Fin', 'Aller au début / à la fin'], ['Ctrl + molette', 'Zoomer'], ['Espace + glisser', 'Se déplacer dans la scène'], ['Double-clic', 'Écrire dans un texte'], ['Ctrl + E', 'Exporter']];
  window.SWDlg.open(`<h3>Raccourcis clavier</h3><dl class="keys">${rows.map(([a, b]) => `<dt><kbd>${escH(a)}</kbd></dt><dd>${escH(b)}</dd>`).join('')}</dl><div class="dlg-acts"><button type="button" class="ap-btn" data-dlg="close">Compris</button></div>`);
}

/* ---------- pont avec l'accueil et le cloud ---------- */
const BLANKS = STUDIOS.map(s => ({id:'blank-' + s.id, name:{design:'Design vierge', photo:'Retouche photo', video:'Montage vidéo', motion:'Animation', audio:'Projet audio'}[s.id], cat:'Vierge', desc:s.desc, studio:s.id}));
window.SW_TEMPLATES = [...BLANKS, ...SM_TPL.map(t => ({id:t.id, name:t.name, cat:t.cat, desc:t.desc, studio:t.studio}))];
window.SMTplThumb = id => { const t = SM_TPL.find(x => x.id === id); return t ? tplThumb(t) : ''; };
/* vignettes des modèles de l'accueil : calculées petit à petit, quand elles approchent de l'écran */
window.SMLazyThumbs = root => {
  const imgs = $$('img[data-tth]', root).filter(i => !i.src); if (!imgs.length) return;
  const fill = im => { const t = SM_TPL.find(x => x.id === im.dataset.tth); if (t && !im.src) im.src = tplThumb(t) || ''; };
  if (!window.IntersectionObserver){ imgs.forEach(fill); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ io.unobserve(e.target); (window.requestIdleCallback || setTimeout)(() => fill(e.target)); } }), {rootMargin:'300px'});
  imgs.forEach(im => io.observe(im));
};
window.SWEditor = {
  load(data, o = {}){ let P; try { P = cleanProject(typeof data === 'string' && data ? data : newProject('design')); } catch(e){ console.error(e); P = newProject('design'); toast('Projet illisible : un projet vide a été ouvert.'); } if (o.name) P.title = o.name; ED.load(P, {readOnly:o.readOnly, canRename:o.canRename, id:o.id}); },
  get(){ return JSON.stringify(ED.P); },
  title(){ return ED.P.title; },
  meta(){ return ED.meta(); },
  metaOf(json){ try { const P = cleanProject(json); let preview = ''; try { preview = thumbOf(P, TIMED(P.studio) ? Math.min(projEnd(P) * .35, 2) : 0, 240, .6); } catch(e){} return {preview, studio:P.studio, fmt:`${P.w}x${P.h}`, dur:Math.round(projEnd(P) * 1000), media:Object.keys(P.media).length}; } catch(e){ return {}; } },
  fromTemplate(id, lib){
    if (String(id).startsWith('blank')){ const s = String(id).split('-')[1] || 'design'; const P = newProject(STUDIOS.some(x => x.id === s) ? s : 'design'); P.title = 'Projet sans titre'; return JSON.stringify(P); }
    const mine = (lib?.templates || []).find(t => t.id === id); if (mine) return mine.data;
    const t = SM_TPL.find(x => x.id === id); return JSON.stringify(t ? tplProject(t) : newProject('design'));
  },
  /* fichier ouvert depuis l'accueil : projet / paquet, ou médias → nouveau projet adapté */
  async importFile(f){
    const n = (f.name || '').toLowerCase();
    if (/\.(spectramotion|zip|json)$/.test(n)) return readProjectFile(f);
    const m = await MEDIA.add(f), studio = m.kind === 'image' ? 'photo' : m.kind === 'video' ? 'video' : 'audio';
    const P = newProject(studio, m.kind === 'audio' ? 'square' : m.w && m.h ? {id:'', w:Math.min(7680, m.w), h:Math.min(7680, m.h)} : undefined);
    P.title = m.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 100) || 'Projet'; P.media[m.id] = m;
    const L = mkMediaLayer(P, m, {track:0, start:0}); if (m.kind === 'image'){ L.x = L.y = 0; L.w = P.w; L.h = P.h; L.fit = 'cover'; L.dur = P.dur; }
    P.layers.push(L); if (TIMED(studio)) syncDur(P); return JSON.stringify(P);
  },
  setReadOnly(b){ ED.readOnly = !!b; $('#app').classList.toggle('ro', ED.readOnly); ED.histBtns(); },
  focusTitle(sel){ const t = $('#docTitle'); t.focus(); if (sel) t.select(); },
  setUserLib(lib){ ED.lib = lib || {}; if (!ED.lib.brand) try { const b = JSON.parse(localStorage.getItem('sm.brand') || 'null'); if (b) ED.lib.brand = b; } catch(e){} if (['colors', 'text', 'draw', 'bg'].includes(PANEL.cur)) PANEL.render(); }, restoreSel(){},
  get id(){ return ED.docId; },
};
wireEditor();
ED.load(newProject('design'));
window.__swReady = true;
window.dispatchEvent(new Event('sw:ready'));

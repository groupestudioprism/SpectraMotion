/* ---------- Outils vidéo : détacher l'audio, fondu enchaîné avec le clip précédent, arrêt sur image ---------- */
const VTOOLS = {
  detach(L){
    const P = ED.P, m = P.media[L.media]; if (!L || L.t !== 'video' || !m?.hasAudio) return toast('Sélectionnez une vidéo qui contient du son.');
    const A = baseLayer(P, 'audio', {name:'Son · ' + (L.name || m.name), media:L.media, in:L.in || 0, speed:L.speed || 1, vol:L.vol ?? 1, mute:false, fadeIn:L.fadeIn || 0, fadeOut:L.fadeOut || 0, start:L.start, dur:L.dur, track:topTrack(P, true), eqLo:L.eqLo || 0, eqHi:L.eqHi || 0, pan:L.pan || 0});
    L.mute = true; P.layers.push(A); ED.sel = new Set([A.id]); ED.commit('Détacher l\'audio'); BUS.emit('sel'); toast('Le son est sur sa propre piste ; la vidéo est muette.');
  },
  /* le clip chevauche le précédent de la même piste pendant d secondes, avec un fondu */
  crossfade(B, d = .8){
    const P = ED.P; if (!B || B.t === 'audio') return toast('Sélectionnez le second clip d\'un enchaînement.');
    const A = P.layers.filter(l => l !== B && l.t !== 'audio' && l.track === B.track && Math.abs(l.start + l.dur - B.start) < .08).sort((a, b) => b.start - a.start)[0];
    if (!A) return toast('Aucun clip ne se termine juste avant celui-ci sur la même piste.');
    d = Math.min(d, A.dur * .5, B.dur * .5); B.track = topTrack(P); B.start = round(B.start - d, 3); B.dur = round(B.dur + (B.t === 'video' ? 0 : d), 3);
    B.tin = {k:'fade', d:round(d, 2)}; if (B.t === 'video'){ B.fadeIn = round(d, 2); A.fadeOut = round(d, 2); }
    ED.commit('Fondu enchaîné'); TL.render(); toast(`Fondu enchaîné de ${String(round(d, 1)).replace('.', ',')} s`);
  },
  /* image figée de la vidéo à la tête de lecture, ajoutée par-dessus pendant 2 s */
  async freeze(L){
    const P = ED.P, m = P.media[L?.media], el = MEDIA.el(m); if (!L || L.t !== 'video' || !el) return toast('Sélectionnez une vidéo et placez la tête de lecture dessus.');
    if (PLAY.t < L.start || PLAY.t > L.start + L.dur) return toast('Placez la tête de lecture sur la vidéo.');
    await seekVideos(P, PLAY.t); const c = document.createElement('canvas'); c.width = el.videoWidth; c.height = el.videoHeight; c.getContext('2d').drawImage(el, 0, 0);
    const b = await new Promise(r => c.toBlob(r, 'image/jpeg', .92)), nm = await MEDIA.add(new File([b], `Arrêt sur image ${fmtT(PLAY.t)}.jpg`, {type:'image/jpeg'})); P.media[nm.id] = nm;
    const I = mkMediaLayer(P, nm, {x:L.x, y:L.y, w:L.w, h:L.h, rot:L.rot, fit:L.fit, crop:L.crop ? {...L.crop} : null, flipX:L.flipX, flipY:L.flipY, filter:L.filter, adj:{...(L.adj || {})}, start:round(PLAY.t, 3), dur:2, track:topTrack(P), name:'Arrêt sur image'});
    P.layers.push(I); ED.sel = new Set([I.id]); ED.commit('Arrêt sur image'); BUS.emit('sel'); ED.uploadPending();
  },
  /* supprime le clip et rapproche les clips suivants de la même piste */
  ripple(ids){
    const P = ED.P, del = P.layers.filter(l => ids.includes(l.id) && !l.lock); if (!del.length) return;
    for (const D of del.sort((a, b) => b.start - a.start)){
      const audio = D.t === 'audio', end = D.start + D.dur;
      for (const o of P.layers) if (o !== D && (o.t === 'audio') === audio && o.track === D.track && o.start >= end - 1e-3) o.start = round(Math.max(0, o.start - D.dur), 3);
    }
    P.layers = P.layers.filter(l => !del.includes(l)); ED.sel = new Set(); ED.commit('Supprimer et rapprocher'); BUS.emit('sel');
  },
  /* supprime les vides d'une piste (les clips se suivent à partir du premier) */
  closeGaps(audio, track){
    const P = ED.P, cl = P.layers.filter(l => (l.t === 'audio') === audio && l.track === track && !l.lock).sort((a, b) => a.start - b.start); if (cl.length < 1) return toast('Cette piste est vide.');
    let t = 0, moved = 0; for (const c of cl){ const ns = round(Math.max(t, 0), 3); if (Math.abs(ns - c.start) > 1e-3){ c.start = ns; moved++; } t = c.start + c.dur; }
    if (!moved) return toast('Aucun vide sur cette piste.'); ED.commit('Supprimer les vides'); TL.render(); toast(moved > 1 ? `${moved} clips rapprochés.` : '1 clip rapproché.');
  },
  /* tous les clips d'une piste */
  trackClips(audio, track){ return ED.P.layers.filter(l => (l.t === 'audio') === audio && l.track === track); },
  /* volume maximal sans saturer (crête à -1 dB) */
  async normalize(L){
    const P = ED.P, m = P.media[L?.media]; if (!m) return toast('Sélectionnez un son ou une vidéo.');
    const buf = await MEDIA.buffer(m); if (!buf) return toast('Le son de ce clip n\'a pas pu être décodé.');
    const a = Math.floor((L.in || 0) * buf.sampleRate), b = Math.min(buf.length, a + Math.ceil(L.dur * (L.speed || 1) * buf.sampleRate)); let pk = 0;
    for (let c = 0; c < buf.numberOfChannels; c++){ const d = buf.getChannelData(c); for (let i = a; i < b; i++){ const v = Math.abs(d[i]); if (v > pk) pk = v; } }
    if (pk < 1e-4) return toast('Ce passage est silencieux.');
    L.vol = round(clamp(.891 / pk, 0, 2), 3); ED.commit('Normaliser'); toast(`Volume réglé à ${Math.round(L.vol * 100)} % (crête à -1 dB${.891 / pk > 2 ? ', limité à 200 %' : ''}).`);
  },
  /* détection des temps forts (énergie qui monte brusquement) → repères sur la timeline */
  async beats(L){
    const P = ED.P, m = P.media[L?.media]; if (!m) return toast('Sélectionnez un son ou une vidéo avec du son.');
    const buf = await MEDIA.buffer(m); if (!buf) return toast('Le son de ce clip n\'a pas pu être décodé.');
    const ts = beatTimes(buf, L.in || 0, (L.in || 0) + L.dur * (L.speed || 1)).map(t => L.start + (t - (L.in || 0)) / (L.speed || 1));
    if (!ts.length) return toast('Aucun temps fort détecté sur ce clip.');
    P.markers ||= []; let n = 0; for (const t of ts){ if (P.markers.length >= 500) break; if (!P.markers.some(x => Math.abs(x.t - t) < .05)){ P.markers.push({t:round(t, 3), n:''}); n++; } }
    P.markers.sort((a, b) => a.t - b.t); ED.commit('Repères sur les temps forts'); TL.render(); toast(`${n} repère${n > 1 ? 's' : ''} sur les temps forts.`);
  },
  /* cale les clips sélectionnés sur les repères successifs (montage au rythme) */
  toMarkers(ids){
    const P = ED.P, ms = (P.markers || []).map(m => m.t).filter(t => t >= 0); if (ms.length < 2) return toast('Ajoutez au moins deux repères (touche M ou « Repères sur les temps forts »).');
    const cl = P.layers.filter(l => ids.includes(l.id) && l.t !== 'audio').sort((a, b) => a.start - b.start); if (!cl.length) return toast('Sélectionnez des clips visuels.');
    let i = Math.max(0, ms.findIndex(t => t >= cl[0].start - .01)); if (i < 0) i = 0;
    for (const c of cl){ if (i >= ms.length - 1) break; c.start = round(ms[i], 3); c.dur = round(Math.max(.1, ms[i + 1] - ms[i]), 3); i++; }
    ED.commit('Caler sur les repères'); TL.render(); toast('Clips calés sur les repères.');
  },
  /* mises en page vidéo : incrustation, écran partagé, grille */
  layout(kind, ids){
    const P = ED.P, ls = P.layers.filter(l => ids.includes(l.id) && (l.t === 'video' || l.t === 'image' || l.t === 'mock'));
    const need = {pip:2, splitV:2, splitH:2, grid:4, trio:3}[kind] || 2; if (ls.length < need) return toast(`Sélectionnez ${need} vidéos ou images (Maj + clic).`);
    const W = P.w, H = P.h, set = (L, x, y, w, h) => Object.assign(L, {x:Math.round(x), y:Math.round(y), w:Math.round(w), h:Math.round(h), rot:0, fit:'cover'});
    const g = Math.round(Math.min(W, H) * .02);
    if (kind === 'pip'){ set(ls[0], 0, 0, W, H); const w = W * .32, h = w * H / W; set(ls[1], W - w - g * 2, H - h - g * 2, w, h); ls[1].r = Math.round(Math.min(w, h) * .06); ls[1].stroke = '#FFFFFF'; ls[1].sw = Math.max(2, Math.round(g / 3)); }
    if (kind === 'splitV'){ set(ls[0], 0, 0, W / 2, H); set(ls[1], W / 2, 0, W / 2, H); }
    if (kind === 'splitH'){ set(ls[0], 0, 0, W, H / 2); set(ls[1], 0, H / 2, W, H / 2); }
    if (kind === 'trio'){ set(ls[0], 0, 0, W / 2, H); set(ls[1], W / 2, 0, W / 2, H / 2); set(ls[2], W / 2, H / 2, W / 2, H / 2); }
    if (kind === 'grid') ls.slice(0, 4).forEach((L, i) => set(L, (i % 2) * W / 2, Math.floor(i / 2) * H / 2, W / 2, H / 2));
    // les clips jouent en même temps, chacun sur sa piste
    const st = Math.min(...ls.map(l => l.start)); ls.forEach((L, i) => { L.start = st; if (kind === 'pip' && i === 1) L.track = Math.max(L.track, ls[0].track + 1); });
    const used = new Set(); for (const L of ls){ if (used.has(L.track)) L.track = topTrack(P); used.add(L.track); }
    ED.commit('Mise en page vidéo'); TL.render(); STAGE.paint();
  },
};
/* temps forts d'un son entre a et b (secondes source) : flux spectral simplifié sur l'énergie par bandes de 23 ms */
function beatTimes(buf, a = 0, b = buf.duration){
  const sr = buf.sampleRate, hop = Math.round(sr * .0232), d0 = buf.getChannelData(0), d1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : d0;
  const i0 = Math.max(0, Math.floor(a * sr)), i1 = Math.min(buf.length, Math.floor(b * sr)), E = [];
  for (let i = i0; i + hop <= i1; i += hop){ let e = 0; for (let k = i; k < i + hop; k += 2){ const v = (d0[k] + d1[k]) / 2; e += v * v; } E.push(Math.sqrt(e / (hop / 2))); }
  const F = E.map((e, i) => Math.max(0, e - (E[i - 1] ?? e))), out = []; let last = -1;
  for (let i = 1; i < F.length - 1; i++){
    let s = 0, n = 0; for (let k = Math.max(0, i - 22); k < Math.min(F.length, i + 22); k++){ s += F[k]; n++; }
    const thr = s / n * 1.6 + 1e-3, t = a + i * hop / sr;
    if (F[i] > thr && F[i] >= F[i - 1] && F[i] >= F[i + 1] && E[i] > .02 && t - last > .28){ out.push(t); last = t; }
  }
  return out.slice(0, 400);
}
/* ---------- Outils d'animation : copier / coller les images clés, inverser, décaler ---------- */
const KF = {clip:null,
  copy(L){ if (!L?.kf || !Object.keys(L.kf).length) return toast('Ce calque n\'a pas d\'images clés.'); this.clip = JSON.parse(JSON.stringify(L.kf)); toast('Images clés copiées.', 1400); },
  paste(ls){ if (!this.clip) return toast('Copiez d\'abord les images clés d\'un calque.'); for (const L of ls){ L.kf = {}; for (const [p, k] of Object.entries(this.clip)) L.kf[p] = k.filter(x => x[0] <= L.dur + 1e-6).map(x => [...x]); for (const p of Object.keys(L.kf)) if (!L.kf[p].length) delete L.kf[p]; } ED.commit('Coller les images clés'); },
  /* l'animation jouée à l'envers : temps miroir ; chaque segment garde sa courbe, retournée (accélération ↔ décélération) */
  reverse(L){ if (!L?.kf) return; const flip = e => ({in:'out', out:'in'})[e] || e || 'ease';
    for (const p of Object.keys(L.kf)){ const k = L.kf[p], n = k.length; L.kf[p] = k.map(x => [round(L.dur - x[0], 3), x[1]]).reverse().map((x, j) => [x[0], x[1], j < n - 1 ? flip(k[n - 2 - j][2]) : k[n - 1][2] || 'ease']); }
    ED.commit('Inverser l\'animation'); },
  clear(ls){ let n = 0; for (const L of ls) if (L.kf && Object.keys(L.kf).length){ L.kf = {}; n++; } if (n) ED.commit('Supprimer les images clés'); else toast('Aucune image clé à supprimer.'); },
  easeAll(L, e){ if (!L?.kf) return; for (const k of Object.values(L.kf)) for (const x of k) x[2] = e; ED.commit('Courbe : ' + EASES[e]); },
};
/* ---------- Copier / coller le style d'un calque ---------- */
const STYLE_KEYS = {text:['font', 'fw', 'it', 'fs', 'col', 'col2', 'align', 'ls', 'lh', 'up', 'ul', 'tbg', 'tbgPad', 'tstroke', 'tsw', 'tsh', 'tfx'], shape:['fill', 'fill2', 'ga', 'stroke', 'sw', 'r', 'dash', 'pat', 'patc', 'pats'],
  image:['filter', 'adj', 'pfx', 'duo', 'r', 'mask', 'stroke', 'sw', 'oln'], video:['filter', 'adj', 'pfx', 'duo', 'r', 'mask', 'stroke', 'sw', 'eqLo', 'eqHi', 'rev', 'echo', 'comp'], audio:['eqLo', 'eqHi', 'pan', 'rev', 'echo', 'comp', 'duck'], icon:['col', 'sw'], any:['op', 'blend', 'shadow', 'tin', 'tout']};
const STYLE = {clip:null,
  copy(L){ if (!L) return; const ks = [...(STYLE_KEYS[L.t] || []), ...STYLE_KEYS.any], o = {}; for (const k of ks) if (L[k] !== undefined) o[k] = JSON.parse(JSON.stringify(L[k])); this.clip = {t:L.t, o}; toast('Style copié.', 1400); },
  paste(ls){ if (!this.clip) return toast('Copiez d\'abord le style d\'un calque.'); let n = 0;
    for (const L of ls){ const ok = new Set([...(STYLE_KEYS[L.t] || []), ...STYLE_KEYS.any]); for (const [k, v] of Object.entries(this.clip.o)) if (ok.has(k)){ L[k] = JSON.parse(JSON.stringify(v)); n++; } }
    if (!n) return toast('Ce style ne s\'applique pas à ces calques.'); PIX.cache.clear(); ED.commit('Coller le style'); },
};

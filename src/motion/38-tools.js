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
};

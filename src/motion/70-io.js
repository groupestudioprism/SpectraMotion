/* ---------- Exports et fichiers du projet ----------
   Image : PNG (fond transparent possible), JPEG, WebP — à l'instant choisi.
   Vidéo : WebM (VP9 / VP8 + Opus) ou MP4 (H.264 + AAC) selon ce que le navigateur sait enregistrer (MediaRecorder).
           L'export se fait en temps réel : un projet de 30 s demande 30 s, onglet visible.
   Son : WAV 16 bits stéréo 48 kHz (mixage de toutes les pistes, calculé hors temps réel).
   Projet : fichier .spectramotion (sans les médias) ou paquet .zip (projet + médias), à rouvrir sur n'importe quel appareil. */
const VIDEO_TYPES = [
  ['mp4', 'video/mp4;codecs=avc1.640028,mp4a.40.2', 'MP4 (H.264)'], ['mp4', 'video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'MP4 (H.264)'],
  ['webm', 'video/webm;codecs=vp9,opus', 'WebM (VP9)'], ['webm', 'video/webm;codecs=vp8,opus', 'WebM (VP8)'], ['webm', 'video/webm', 'WebM'],
];
const recTypes = () => typeof MediaRecorder === 'undefined' ? [] : VIDEO_TYPES.filter(([, t]) => { try { return MediaRecorder.isTypeSupported(t); } catch(e){ return false; } }).filter((x, i, a) => a.findIndex(y => y[2] === x[2]) === i);
const IO = {
  busy:false,
  fileBase(){ return (window.SWSafeName ? window.SWSafeName(ED.P.title) : 'spectra-motion') || 'spectra-motion'; },
  async save(name, blob){ if (window.SWDownload) return window.SWDownload(name, blob); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); },
  canFull(){ return window.SWHome?.canExport ? window.SWHome.canExport() : true; },
  dialog(tab){
    const P = ED.P, timed = TIMED(ED.studio) || projEnd(P) > 0 && P.layers.some(l => l.tin.k !== 'none' || l.tout.k !== 'none' || Object.keys(l.kf || {}).length || l.t === 'video' || l.t === 'audio');
    tab = tab || (ED.studio === 'audio' ? 'audio' : TIMED(ED.studio) ? 'video' : 'image');
    const vt = recTypes(), full = this.canFull(), hasAudio = P.layers.some(l => audible(P, l));
    const tabs = [['image', 'Image'], ['video', 'Vidéo'], ['audio', 'Son'], ['project', 'Projet']];
    const body = {
      image:`<p class="dlg-p">L'image affichée à la tête de lecture (${fmtT(PLAY.t)}).</p>
        <div class="xp-g"><label class="fd sel"><span>Format</span><select id="xpImgFmt"><option value="png">PNG · sans perte${P.bg ? '' : ', fond transparent'}</option><option value="jpeg">JPEG · léger</option><option value="webp"${full ? '' : ' disabled'}>WebP${full ? '' : ' (licence)'}</option></select></label>
        <label class="fd sel"><span>Taille</span><select id="xpImgSc"><option value="1">${P.w} × ${P.h} (taille réelle)</option><option value="2"${full ? '' : ' disabled'}>${P.w * 2} × ${P.h * 2} (× 2)${full ? '' : ' · licence'}</option><option value="0.5">${Math.round(P.w / 2)} × ${Math.round(P.h / 2)} (moitié)</option></select></label></div>
        <label class="ap-check"><input type="checkbox" id="xpImgTr"${P.bg ? '' : ' checked'}><span>Fond transparent (PNG)</span></label>`,
      video:vt.length ? `<p class="dlg-p">L'export se fait en temps réel (${fmtT(PLAY.end())}) : gardez cet onglet ouvert et visible jusqu'à la fin.</p>
        <div class="xp-g"><label class="fd sel"><span>Format</span><select id="xpVidFmt">${(() => { const first = vt.findIndex(([e]) => full || e !== 'mp4'); return vt.map(([e, t, n], i) => `<option value="${i}"${e === 'mp4' && !full ? ' disabled' : ''}${i === first ? ' selected' : ''}>${n}${e === 'mp4' && !full ? ' · licence' : ''}</option>`).join(''); })()}</select></label>
        <label class="fd sel"><span>Définition</span><select id="xpVidRes">${[[480, '480p'], [720, '720p'], [1080, '1080p'], [2160, '4K']].filter(([r]) => r <= Math.max(P.w, P.h) * 1.01 || r === 480).map(([r, n]) => `<option value="${r}"${r === 720 ? ' selected' : ''}${r > 720 && !full ? ' disabled' : ''}>${n}${r > 720 && !full ? ' · licence' : ''}</option>`).join('')}</select></label></div>
        <p class="dlg-p small">${hasAudio ? 'Le son de toutes les pistes est mixé dans la vidéo.' : 'Le projet ne contient pas de son.'} Sans licence : 720p et WebM.</p>`
        : `<p class="dlg-p">Ce navigateur ne sait pas enregistrer de vidéo (MediaRecorder absent). Utilisez Chrome, Edge ou Firefox récent sur ordinateur.</p>`,
      audio:hasAudio ? `<p class="dlg-p">Le mixage de toutes les pistes son (volumes, fondus, vitesses), de 0:00 à ${fmtT(PLAY.end())}.</p><div class="xp-g"><label class="fd sel"><span>Format</span><select id="xpAudFmt"><option value="wav">WAV 16 bits · 48 kHz stéréo</option></select></label></div>`
        : `<p class="dlg-p">Le projet ne contient aucun son à exporter : importez un son ou une vidéo avec son.</p>`,
      project:`<p class="dlg-p">Gardez une copie du projet sur votre appareil, ou envoyez-la à quelqu'un qui a Spectra Motion.</p>
        <div class="xp-opts"><label class="ap-check"><input type="radio" name="xpProj" value="zip" checked><span><b>Paquet complet (.zip)</b> · le projet et tous ses médias</span></label>
        <label class="ap-check"><input type="radio" name="xpProj" value="json"><span><b>Projet seul (.spectramotion)</b> · léger, sans les fichiers des médias</span></label></div>
        ${full ? '' : '<p class="dlg-p small">La sauvegarde du projet demande une licence Spectra Motion.</p>'}`,
    };
    const html = `<h3>Exporter</h3><div class="xp-tabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" role="tab" data-xt="${k}" aria-selected="${k === tab}">${n}</button>`).join('')}</div>
      <div class="xp-b">${body[tab]}</div><div class="xp-prog" id="xpProg" hidden><i></i><span></span></div><p class="ap-err" id="dlgErr"></p>
      <div class="dlg-acts"><button type="button" class="ap-btn alt" data-dlg="close" id="xpCancel">Fermer</button><button type="button" class="ap-btn" id="xpGo"${(tab === 'video' && !vt.length) || (tab === 'audio' && !hasAudio) || (tab === 'project' && !full) ? ' disabled' : ''}>Exporter</button></div>`;
    window.SWDlg.open(html, d => {
      d.querySelectorAll('[data-xt]').forEach(b => b.onclick = () => { if (!this.busy) this.dialog(b.dataset.xt); });
      d.querySelector('#xpGo').onclick = () => this.run(tab, d);
      d.querySelector('#xpCancel').onclick = () => { if (this.busy){ this.cancel = true; return; } window.SWDlg.close(); };
    }, 'xp');
    void timed;
  },
  prog(d, f, t){ const p = d.querySelector('#xpProg'); p.hidden = false; p.querySelector('i').style.width = Math.round(clamp(f, 0, 1) * 100) + '%'; p.querySelector('span').textContent = t; },
  async run(tab, d){
    if (this.busy) return; this.busy = true; this.cancel = false; const go = d.querySelector('#xpGo'), err = d.querySelector('#dlgErr'); go.disabled = true; err.textContent = '';
    d.querySelector('#xpCancel').textContent = tab === 'video' ? 'Annuler' : 'Fermer';
    if (PLAY.playing) PLAY.pause();
    try {
      if (tab === 'image') await this.image(d.querySelector('#xpImgFmt').value, +d.querySelector('#xpImgSc').value, d.querySelector('#xpImgTr').checked);
      if (tab === 'video') await this.video(recTypes()[+d.querySelector('#xpVidFmt').value], +d.querySelector('#xpVidRes').value, (f, t) => this.prog(d, f, t));
      if (tab === 'audio') await this.wav((f, t) => this.prog(d, f, t));
      if (tab === 'project') await this.project(d.querySelector('[name=xpProj]:checked').value, (f, t) => this.prog(d, f, t));
      if (!this.cancel){ window.SWDlg.close(); toast('Export terminé : le fichier est téléchargé'); }
    } catch(e){ console.error('[Spectra Motion] export', e); err.textContent = e?.message || 'L\'export a échoué.'; }
    finally { this.busy = false; go.disabled = false; d.querySelector('#xpCancel').textContent = 'Fermer'; if (this.cancel){ d.querySelector('#xpProg').hidden = true; err.textContent = 'Export annulé.'; } STAGE.paint(); }
  },
  async image(fmt, sc, transparent){
    const P = ED.P, cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(P.w * sc)); cv.height = Math.max(1, Math.round(P.h * sc));
    await MEDIA.loadAll(P); await seekVideos(P, PLAY.t);
    const ctx = cv.getContext('2d');
    if (fmt === 'jpeg' || !transparent){ ctx.fillStyle = P.bg || '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height); }
    renderFrame(ctx, P, PLAY.t, {scale:sc, transparent:transparent && fmt !== 'jpeg', noClear:true, final:true, noFx:!TIMED(P.studio)});
    const blob = await new Promise(r => cv.toBlob(r, 'image/' + fmt, .92)); if (!blob) throw new Error('Image trop grande pour ce navigateur.');
    await this.save(`${this.fileBase()}.${fmt === 'jpeg' ? 'jpg' : fmt}`, blob);
  },
  /* vidéo : rendu image par image dans un canvas enregistré en direct, son mixé par le moteur audio */
  async video(type, res, prog){
    const P = ED.P; if (!type) throw new Error('Format vidéo indisponible.');
    if (document.visibilityState !== 'visible') throw new Error('Gardez l\'onglet visible pendant l\'export.');
    const k = Math.min(1, res / Math.min(P.w, P.h)) || 1, W = Math.round(P.w * k / 2) * 2, H = Math.round(P.h * k / 2) * 2, sc = W / P.w, end = PLAY.end();
    prog(0, 'Préparation des médias…');
    await MEDIA.loadAll(P);
    const needBuf = P.layers.filter(l => audible(P, l)); await Promise.all(needBuf.map(l => MEDIA.buffer(P.media[l.media])));
    const lost = needBuf.filter(l => !MEDIA.cache[l.media]?.buf);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
    const draw = t => { ctx.fillStyle = P.bg || '#000000'; ctx.fillRect(0, 0, W, H); renderFrame(ctx, P, t, {scale:sc, noClear:true, final:true}); };
    await seekVideos(P, 0); draw(0);
    const vs = cv.captureStream(P.fps), ac = MEDIA.ctx(); if (ac?.state === 'suspended') await ac.resume();
    let dest = null, nodes = [];
    if (ac && needBuf.length){ dest = ac.createMediaStreamDestination(); }
    const tracks = [...vs.getVideoTracks(), ...(dest ? dest.stream.getAudioTracks() : [])];
    const rec = new MediaRecorder(new MediaStream(tracks), {mimeType:type[1], videoBitsPerSecond:Math.round(W * H * P.fps * .12), audioBitsPerSecond:192000});
    const chunks = []; rec.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
    const stopped = new Promise(r => rec.onstop = r);
    rec.start(500);
    const base = (ac ? ac.currentTime : performance.now() / 1000) + .25;
    if (dest) nodes = scheduleAudio(P, ac, dest, 0, base, end);
    const clock = () => (ac ? ac.currentTime : performance.now() / 1000) - base;
    // vidéos : lecture réelle, recalées sur l'horloge d'export
    const vids = P.layers.filter(l => l.t === 'video');
    const sync = t => { for (const L of vids){ const el = MEDIA.el(P.media[L.media]); if (!el) continue; const on = visible(L, t); el.muted = true;
      if (!on){ if (!el.paused) el.pause(); continue; } const st = srcTime(L, t); if (el.playbackRate !== (L.speed || 1)) el.playbackRate = L.speed || 1; if (Math.abs(el.currentTime - st) > .15) el.currentTime = st; if (el.paused) el.play().catch(() => {}); } };
    await new Promise(res => {
      const tick = () => {
        if (this.cancel){ res(); return; }
        const t = clock();
        if (t >= end + .05){ res(); return; }
        const tt = Math.max(0, t); sync(tt); draw(tt); prog(tt / end, `Enregistrement… ${fmtT(tt)} / ${fmtT(end)}`);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    for (const L of vids){ const el = MEDIA.el(P.media[L.media]); if (el && !el.paused) el.pause(); }
    nodes.forEach(n => { try { n.stop?.(); } catch(e){} try { n.disconnect(); } catch(e){} });
    rec.stop(); await stopped; tracks.forEach(t => t.stop());
    if (this.cancel) return;
    prog(1, 'Finalisation…');
    const blob = new Blob(chunks, {type:type[1].split(';')[0]}); if (!blob.size) throw new Error('Aucune image enregistrée : réessayez en gardant l\'onglet visible.');
    await this.save(`${this.fileBase()}.${type[0]}`, blob);
    if (lost.length) toast(`Attention : le son de ${lost.length} clip${lost.length > 1 ? 's' : ''} n'a pas pu être décodé et manque dans la vidéo.`, 6000);
    PLAY.still();
  },
  /* WAV : mixage hors temps réel */
  async wav(prog){
    const P = ED.P, end = PLAY.end(), sr = 48000; prog(.05, 'Décodage des sons…');
    const ls = P.layers.filter(l => audible(P, l)); await Promise.all(ls.map(l => MEDIA.buffer(P.media[l.media])));
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) throw new Error('Mixage impossible dans ce navigateur.');
    const oac = new OAC(2, Math.ceil(end * sr), sr); scheduleAudio(P, oac, oac.destination, 0, 0, end);
    prog(.4, 'Mixage…'); const buf = await oac.startRendering(); prog(.9, 'Encodage WAV…');
    await this.save(`${this.fileBase()}.wav`, wavOf(buf));
  },
  /* projet : JSON seul, ou zip avec les médias */
  async project(kind, prog){
    const P = ED.P, json = JSON.stringify(P);
    if (kind === 'json') return this.save(`${this.fileBase()}.spectramotion`, new Blob([json], {type:'application/json'}));
    prog(.05, 'Préparation du paquet…'); const JSZip = await loadZip(), z = new JSZip();
    z.file('projet.spectramotion', json); const ms = Object.values(P.media); let i = 0, miss = 0;
    for (const m of ms){ const b = await MEDIA.blobOf(m); if (b) z.file(`medias/${m.id}${extOf(m)}`, b); else miss++; prog(.1 + .6 * (++i / Math.max(1, ms.length)), `Médias ${i} / ${ms.length}`); }
    const blob = await z.generateAsync({type:'blob', compression:'STORE'}, md => prog(.7 + .3 * md.percent / 100, 'Assemblage du paquet…'));
    await this.save(`${this.fileBase()}.zip`, blob);
    if (miss) toast(`${miss} média${miss > 1 ? 's absents' : ' absent'} de cet appareil : non inclus dans le paquet.`, 5000);
  },
};
const extOf = m => { const n = m.name.match(/\.[a-z0-9]{2,5}$/i); return n ? n[0].toLowerCase() : m.kind === 'image' ? '.png' : m.kind === 'video' ? '.mp4' : '.mp3'; };
function wavOf(buf){
  const ch = Math.min(2, buf.numberOfChannels), n = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const data = [...Array(ch)].map((_, i) => buf.getChannelData(i)); let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++){ const v = clamp(data[c][i], -1, 1); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2; }
  return new Blob([out.buffer], {type:'audio/wav'});
}
let zipP = null;
function loadZip(){
  if (window.JSZip) return Promise.resolve(window.JSZip);
  return zipP ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'; s.integrity = 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'; s.crossOrigin = 'anonymous';
    s.onload = () => res(window.JSZip); s.onerror = () => { zipP = null; rej(new Error('Module d\'archive indisponible (connexion ?).')); }; document.head.appendChild(s); });
}
/* ouverture d'un fichier projet (.spectramotion, .json) ou d'un paquet (.zip) → texte JSON du projet (médias gardés dans l'appareil) */
async function readProjectFile(f){
  const n = (f.name || '').toLowerCase();
  if (n.endsWith('.zip')){
    const JSZip = await loadZip(), z = await JSZip.loadAsync(f);
    const pf = z.file('projet.spectramotion') || Object.values(z.files).find(x => /\.spectramotion$|\.json$/.test(x.name));
    if (!pf) throw new Error('Ce paquet ne contient pas de projet Spectra Motion.');
    const P = cleanProject(await pf.async('string'));
    for (const m of Object.values(P.media)){
      const e = Object.values(z.files).find(x => x.name.startsWith('medias/' + m.id + '.') || x.name === 'medias/' + m.id);
      if (e){ const b = new Blob([await e.async('arraybuffer')], {type:m.mime || ''}); await IDB.put(m.id, b).catch(() => {}); MEDIA.forget(m.id); m.cloud = false; m.path = ''; }
    }
    return JSON.stringify(P);
  }
  const P = cleanProject(await f.text()); return JSON.stringify(P);
}

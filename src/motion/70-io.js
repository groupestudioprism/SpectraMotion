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
    const tabs = [['image', 'Image'], ['pdf', 'PDF'], ['web', 'Site web'], ['video', 'Vidéo'], ['gif', 'GIF'], ['audio', 'Son'], ['project', 'Projet']], np = pageCount(P);
    const multiFmts = ['square', 'portrait', 'story', 'fbpost', 'xpost', 'pin', 'thumb', 'hd', 'a4', 'lipost'].map(id => FORMATS.find(f => f.id === id)).filter(f => f && !(f.w === P.w && f.h === P.h));
    const body = {
      image:`<p class="dlg-p">L'image affichée à la tête de lecture (${fmtT(PLAY.t)}).</p>
        <div class="xp-g"><label class="fd sel"><span>Format</span><select id="xpImgFmt"><option value="png">PNG · sans perte${P.bg ? '' : ', fond transparent'}</option><option value="jpeg">JPEG · léger</option><option value="webp"${full ? '' : ' disabled'}>WebP${full ? '' : ' (licence)'}</option></select></label>
        <label class="fd sel"><span>Taille</span><select id="xpImgSc"><option value="1">${P.w} × ${P.h} (taille réelle)</option><option value="2"${full ? '' : ' disabled'}>${P.w * 2} × ${P.h * 2} (× 2)${full ? '' : ' · licence'}</option><option value="0.5">${Math.round(P.w / 2)} × ${Math.round(P.h / 2)} (moitié)</option></select></label></div>
        <label class="ap-check"><input type="checkbox" id="xpImgTr"${P.bg ? '' : ' checked'}><span>Fond transparent (PNG)</span></label>
        <div class="xp-g"><label class="fd sel"><span>Pages et formats</span><select id="xpImgSet"><option value="cur">${np > 1 ? `Page actuelle (${(P.pg || 0) + 1} / ${np})` : 'Ce design'}</option>${np > 1 ? `<option value="all">Toutes les pages (${np}) · fichier .zip</option>` : ''}<option value="multi">Redimensionner : plusieurs formats · fichier .zip</option></select></label></div>
        <div class="xp-multi" id="xpMulti" hidden><p class="dlg-p small">Le design est adapté à chaque format (contenu remis à l'échelle et recentré), sans modifier votre projet.</p>${multiFmts.map((f, i) => `<label class="ap-check"><input type="checkbox" data-xpf="${f.id}"${i < 3 ? ' checked' : ''}><span>${escH(f.name)} · ${f.w} × ${f.h}</span></label>`).join('')}</div>`,
      pdf:`<p class="dlg-p">${np > 1 ? `Les ${np} pages dans un seul PDF, dans l'ordre.` : 'Le design en PDF, prêt à envoyer ou à imprimer.'} Taille du papier : ${pdfSize(P).label}.</p>
        <div class="xp-g"><label class="fd sel"><span>Qualité</span><select id="xpPdfQ"><option value="std">Standard · léger</option><option value="print"${full ? '' : ' disabled'}>Impression · haute définition${full ? '' : ' (licence)'}</option></select></label>
        <label class="fd sel"><span>Pages</span><select id="xpPdfPages"><option value="all">${np > 1 ? `Toutes (${np})` : 'Ce design'}</option>${np > 1 ? `<option value="cur">Page actuelle seulement</option>` : ''}</select></label></div>
        <p class="dlg-p small">Chaque page est une image haute qualité dans le PDF (le texte n'est pas sélectionnable).</p>`,
      web:`<p class="dlg-p">Un site d'une page, en un seul fichier .html : ${np > 1 ? `les ${np} pages les unes sous les autres` : 'votre design'}, adapté aux téléphones, avec les liens des éléments cliquables. À publier où vous voulez (GitHub Pages, hébergeur, intranet) ou à envoyer.</p>
        <div class="xp-g"><label class="fd sel"><span>Qualité des images</span><select id="xpWebQ"><option value="1">Standard</option><option value="2"${full ? '' : ' disabled'}>Haute définition${full ? '' : ' (licence)'}</option></select></label></div>
        <p class="dlg-p small">${P.layers.some(l => l.href) || (P.pages || []).some(g => (g.layers || []).some(l => l.href)) ? 'Les liens sont repris.' : 'Astuce : ajoutez des liens aux boutons et textes (propriétés → Lien).'}</p>`,
      gif:`<p class="dlg-p">Une animation qui se lit partout (messageries, e-mails, sites), en boucle${timed ? `, de 0:00 à ${fmtT(Math.min(PLAY.end(), 30))}` : ''}. Sans le son.</p>
        <div class="xp-g"><label class="fd sel"><span>Largeur</span><select id="xpGifW"><option value="320">320 px</option><option value="480" selected>480 px</option><option value="720"${full ? '' : ' disabled'}>720 px${full ? '' : ' · licence'}</option></select></label>
        <label class="fd sel"><span>Images / s</span><select id="xpGifF"><option value="10">10 · plus léger</option><option value="15" selected>15</option><option value="20">20 · plus fluide</option></select></label></div>
        <p class="dlg-p small">${timed ? 'Au-delà de 30 s, seules les 30 premières secondes sont exportées.' : 'Sans animation, le GIF montre une image fixe : ajoutez des animations (studio Motion ou panneau Animations).'}</p>`,
      video:vt.length ? `<p class="dlg-p">L'export se fait en temps réel (${fmtT(PLAY.end())}) : gardez cet onglet ouvert et visible jusqu'à la fin.</p>
        <div class="xp-g"><label class="fd sel"><span>Format</span><select id="xpVidFmt">${(() => { const first = vt.findIndex(([e]) => full || e !== 'mp4'); return vt.map(([e, t, n], i) => `<option value="${i}"${e === 'mp4' && !full ? ' disabled' : ''}${i === first ? ' selected' : ''}>${n}${e === 'mp4' && !full ? ' · licence' : ''}</option>`).join(''); })()}</select></label>
        <label class="fd sel"><span>Définition</span><select id="xpVidRes">${[[480, '480p'], [720, '720p'], [1080, '1080p'], [2160, '4K']].filter(([r]) => r <= Math.max(P.w, P.h) * 1.01 || r === 480).map(([r, n]) => `<option value="${r}"${r === 720 ? ' selected' : ''}${r > 720 && !full ? ' disabled' : ''}>${n}${r > 720 && !full ? ' · licence' : ''}</option>`).join('')}</select></label></div>
        ${!TIMED(ED.studio) && np > 1 ? `<label class="ap-check"><input type="checkbox" id="xpSlides" checked><span>Diaporama des ${np} pages, en fondu</span></label><div class="xp-g"><label class="fd sel"><span>Durée par page</span><select id="xpSlideD">${[2, 3, 4, 5, 6, 8, 10].map(v => `<option value="${v}"${v === 4 ? ' selected' : ''}>${v} s</option>`).join('')}</select></label></div>` : ''}
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
      const set = d.querySelector('#xpImgSet'); if (set) set.onchange = () => { d.querySelector('#xpMulti').hidden = set.value !== 'multi'; };
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
      if (tab === 'image'){ const set = d.querySelector('#xpImgSet').value, a = [d.querySelector('#xpImgFmt').value, +d.querySelector('#xpImgSc').value, d.querySelector('#xpImgTr').checked];
        if (set === 'cur') await this.image(...a);
        else await this.imageSet(set, ...a, [...d.querySelectorAll('[data-xpf]:checked')].map(x => FORMATS.find(f => f.id === x.dataset.xpf)), (f, t) => this.prog(d, f, t)); }
      if (tab === 'pdf') await this.pdf(d.querySelector('#xpPdfQ').value, d.querySelector('#xpPdfPages').value, (f, t) => this.prog(d, f, t));
      if (tab === 'web') await this.web(+d.querySelector('#xpWebQ').value, (f, t) => this.prog(d, f, t));
      if (tab === 'gif') await this.gif(+d.querySelector('#xpGifW').value, +d.querySelector('#xpGifF').value, (f, t) => this.prog(d, f, t));
      if (tab === 'video') await this.video(recTypes()[+d.querySelector('#xpVidFmt').value], +d.querySelector('#xpVidRes').value, (f, t) => this.prog(d, f, t), d.querySelector('#xpSlides')?.checked ? this.slideshow(+d.querySelector('#xpSlideD').value || 4) : null);
      if (tab === 'audio') await this.wav((f, t) => this.prog(d, f, t));
      if (tab === 'project') await this.project(d.querySelector('[name=xpProj]:checked').value, (f, t) => this.prog(d, f, t));
      if (!this.cancel){ window.SWDlg.close(); toast('Export terminé : le fichier est téléchargé'); }
      d.querySelector('#xpGo').disabled = false;
    } catch(e){ console.error('[Spectra Motion] export', e); err.textContent = e?.message || 'L\'export a échoué.'; }
    finally { this.busy = false; go.disabled = false; d.querySelector('#xpCancel').textContent = 'Fermer'; if (this.cancel){ d.querySelector('#xpProg').hidden = true; err.textContent = 'Export annulé.'; } STAGE.paint(); }
  },
  async image(fmt, sc, transparent){
    const cv = await this.canvasOf(ED.P, sc, fmt, transparent);
    const blob = await new Promise(r => cv.toBlob(r, 'image/' + fmt, .92)); if (!blob) throw new Error('Image trop grande pour ce navigateur.');
    await this.save(`${this.fileBase()}.${fmt === 'jpeg' ? 'jpg' : fmt}`, blob);
  },
  /* rendu d'un projet (ou d'une page) dans un canvas, à l'échelle sc */
  async canvasOf(V, sc, fmt = 'png', transparent = false, t = PLAY.t){
    const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(V.w * sc)); cv.height = Math.max(1, Math.round(V.h * sc));
    await MEDIA.loadAll(V); await fontsReady(V); await seekVideos(V, t);
    const ctx = cv.getContext('2d'); if (fmt === 'jpeg' || !transparent){ ctx.fillStyle = V.bg || '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height); }
    renderFrame(ctx, V, t, {scale:sc, transparent:transparent && fmt !== 'jpeg', noClear:true, final:true, noFx:!TIMED(V.studio)});
    return cv;
  },
  /* toutes les pages, ou plusieurs formats (Redimensionner), dans un .zip */
  async imageSet(set, fmt, sc, transparent, fmts, prog){
    const P = ED.P, JSZip = await loadZip(), z = new JSZip(), ext = fmt === 'jpeg' ? 'jpg' : fmt, base = this.fileBase();
    const jobs = set === 'all' ? [...Array(pageCount(P))].map((_, i) => ({V:pageView(P, i), name:`${base}-page-${String(i + 1).padStart(2, '0')}.${ext}`}))
      : fmts.map(f => ({V:rescale(cleanProject(JSON.stringify(P)), f), name:`${base}-${f.id}-${f.w}x${f.h}.${ext}`}));
    if (!jobs.length) throw new Error('Choisissez au moins un format.');
    for (const [i, j] of jobs.entries()){ prog(i / jobs.length, `Image ${i + 1} / ${jobs.length}…`); if (this.cancel) return; const cv = await this.canvasOf(j.V, sc, fmt, transparent, set === 'all' ? 0 : PLAY.t); const b = await new Promise(r => cv.toBlob(r, 'image/' + fmt, .92)); if (b) z.file(j.name, b); }
    prog(.95, 'Assemblage…'); await this.save(`${base}-${set === 'all' ? 'pages' : 'formats'}.zip`, await z.generateAsync({type:'blob', compression:'STORE'}));
  },
  async pdf(q, which, prog){
    const P = ED.P, n = pageCount(P), idx = which === 'cur' ? [P.pg || 0] : [...Array(n).keys()], sz = pdfSize(P);
    const sc = Math.min(q === 'print' ? 2 : 1, 6000 / Math.max(P.w, P.h)), pages = [];
    for (const [k, i] of idx.entries()){
      if (this.cancel) return; prog(k / idx.length * .9, `Page ${k + 1} / ${idx.length}…`);
      const cv = await this.canvasOf(pageView(P, i), sc, 'jpeg', false, 0), b = await new Promise(r => cv.toBlob(r, 'image/jpeg', q === 'print' ? .95 : .86));
      if (!b) throw new Error('Page trop grande pour ce navigateur.'); pages.push({jpg:new Uint8Array(await b.arrayBuffer()), pw:cv.width, ph:cv.height, links:pageLinks(pageView(P, i))});
    }
    prog(.95, 'Assemblage du PDF…'); await this.save(`${this.fileBase()}.pdf`, pdfOf(pages, sz.w, sz.h, P.title));
  },
  /* site web : un fichier HTML autonome (images des pages + zones de liens) */
  async web(q, prog){
    const P = ED.P, n = pageCount(P), sc = Math.min(q, 4000 / Math.max(P.w, P.h)), secs = [];
    for (let i = 0; i < n; i++){
      if (this.cancel) return; prog(i / n * .9, `Page ${i + 1} / ${n}…`); const V = pageView(P, i), cv = await this.canvasOf(V, sc, 'jpeg', false, 0);
      const url = cv.toDataURL('image/jpeg', .88), links = pageLinks(V).map(l => `<a href="${escH(l.href)}" style="left:${(l.x * 100).toFixed(3)}%;top:${(l.y * 100).toFixed(3)}%;width:${(l.w * 100).toFixed(3)}%;height:${(l.h * 100).toFixed(3)}%"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''} aria-label="${escH(l.href)}"></a>`).join('');
      const alt = V.layers.filter(l => l.t === 'text').map(l => l.txt).join(' · ').slice(0, 300);
      secs.push(`<section><img src="${url}" alt="${escH(alt)}" width="${P.w}" height="${P.h}">${links}</section>`);
    }
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escH(P.title)}</title><meta name="generator" content="Spectra Motion · Studio Prism">
<style>html,body{margin:0;background:${hexOk(P.bg) ? P.bg : '#FFFFFF'}}main{max-width:${Math.max(P.w, 600)}px;margin:0 auto}section{position:relative;line-height:0}section img{width:100%;height:auto;display:block}section a{position:absolute;display:block;border-radius:6px}section a:focus-visible{outline:3px solid #7B2FF7;outline-offset:2px}section a:hover{background:rgb(255 255 255 / .08)}</style></head>
<body><main>${secs.join('\n')}</main></body></html>`;
    prog(.95, 'Assemblage…'); await this.save(`${this.fileBase()}.html`, new Blob([html], {type:'text/html'}));
  },
  /* diaporama : les pages enchaînées en vidéo, avec un fondu */
  slideshow(d = 4){
    const P = ED.P, n = pageCount(P), V = newProject('video', {id:'', w:P.w, h:P.h}); V.media = P.media; V.title = P.title; V.layers = []; let tr = 0;
    for (let i = 0; i < n; i++){
      const g = pageView(P, i), st = i * d, maxT = Math.max(0, ...g.layers.map(l => l.track)) + 1;
      if (g.bg) V.layers.push(mkColor(V, g.bg, {start:st, dur:d, track:tr, tin:{k:i ? 'fade' : 'none', d:.5}}));
      for (const L of g.layers){ const c = deep(L); c.id = uid('l'); c.start = st; c.dur = d; c.track = tr + 1 + L.track; if (i && c.tin.k === 'none') c.tin = {k:'fade', d:.5}; V.layers.push(c); }
      tr += maxT + 1;
    }
    V.dur = n * d; return V;
  },
  async gif(width, fps, prog){
    const P = ED.P, timed = TIMED(P.studio) || P.layers.some(l => l.tin.k !== 'none' || l.tout.k !== 'none' || Object.keys(l.kf || {}).length || l.t === 'video');
    const end = timed ? Math.min(30, PLAY.end()) : 0, nf = timed ? Math.max(1, Math.min(600, Math.round(end * fps))) : 1, sc = Math.min(1, width / P.w), W = Math.round(P.w * sc), H = Math.round(P.h * sc);
    await MEDIA.loadAll(P); await fontsReady(P);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d', {willReadFrequently:true}), frames = [];
    for (let i = 0; i < nf; i++){
      if (this.cancel) return; const t = i / fps; await seekVideos(P, t);
      ctx.fillStyle = P.bg || '#FFFFFF'; ctx.fillRect(0, 0, W, H); renderFrame(ctx, P, t, {scale:sc, noClear:true, final:true});
      frames.push(ctx.getImageData(0, 0, W, H)); if (i % 4 === 0){ prog(i / nf * .6, `Image ${i + 1} / ${nf}…`); await sleepE(0); }
    }
    prog(.65, 'Encodage du GIF…'); await sleepE(20);
    const bytes = await gifEncode(frames, W, H, Math.round(100 / fps), f => prog(.65 + f * .33, 'Encodage du GIF…'), () => this.cancel);
    if (!bytes) return; await this.save(`${this.fileBase()}.gif`, new Blob([bytes], {type:'image/gif'}));
    PLAY.still();
  },
  /* vidéo : rendu image par image dans un canvas enregistré en direct, son mixé par le moteur audio */
  async video(type, res, prog, P0){
    const P = P0 || ED.P; if (!type) throw new Error('Format vidéo indisponible.');
    if (document.visibilityState !== 'visible') throw new Error('Gardez l\'onglet visible pendant l\'export.');
    const k = Math.min(1, res / Math.min(P.w, P.h)) || 1, W = Math.round(P.w * k / 2) * 2, H = Math.round(P.h * k / 2) * 2, sc = W / P.w, end = P0 ? P0.dur : PLAY.end();
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
    let blob = new Blob(chunks, {type:type[1].split(';')[0]}); if (!blob.size) throw new Error('Aucune image enregistrée : réessayez en gardant l\'onglet visible.');
    if (type[0] === 'webm') try { blob = await webmWithDuration(blob, end); } catch(e){ console.warn('[Spectra Motion] durée WebM', e); }
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
/* Les WebM de MediaRecorder n'indiquent pas leur durée (lecture et avance rapide difficiles dans certains lecteurs) :
   on ajoute l'élément Duration dans Segment › Info, sans réencoder. */
async function webmWithDuration(blob, seconds){
  const head = new Uint8Array(await blob.slice(0, Math.min(blob.size, 65536)).arrayBuffer());
  const vint = (b, i) => { const f = b[i]; let n = 1; while (n <= 8 && !(f & (0x80 >> (n - 1)))) n++; if (n > 8) throw new Error('vint'); let v = f & (0xFF >> n); for (let k = 1; k < n; k++) v = v * 256 + b[i + k]; return {v, n, unknown:v === 2 ** (7 * n) - 1}; };
  const id = (b, i) => { const f = b[i]; const n = f >= 0x80 ? 1 : f >= 0x40 ? 2 : f >= 0x20 ? 3 : 4; let v = 0; for (let k = 0; k < n; k++) v = v * 256 + b[i + k]; return {v, n}; };
  let i = 0; const e0 = id(head, i); if (e0.v !== 0x1A45DFA3) throw new Error('pas un WebM'); const s0 = vint(head, i + e0.n); i += e0.n + s0.n + s0.v;
  const seg = id(head, i); if (seg.v !== 0x18538067) throw new Error('segment'); const ss = vint(head, i + seg.n); const segData = i + seg.n + ss.n; i = segData;
  while (i < head.length - 8){
    const el = id(head, i), sz = vint(head, i + el.n), data = i + el.n + sz.n;
    if (el.v === 0x1549A966){ // Info
      if (data + sz.v > head.length) throw new Error('Info incomplet');
      let j = data, scale = 1e6; while (j < data + sz.v){ const c = id(head, j), cs = vint(head, j + c.n); if (c.v === 0x4489) return blob; if (c.v === 0x2AD7B1){ let v = 0; for (let k = 0; k < cs.v; k++) v = v * 256 + head[j + c.n + cs.n + k]; scale = v; } j += c.n + cs.n + cs.v; }
      const dur = new Uint8Array(11); dur.set([0x44, 0x89, 0x88]); new DataView(dur.buffer).setFloat64(3, seconds * 1e9 / scale);
      const newSize = sz.v + dur.length, n = Math.max(sz.n, newSize < 127 ? 1 : newSize < 16383 ? 2 : 4), szb = new Uint8Array(n); let v = newSize;
      for (let k = n - 1; k >= 0; k--){ szb[k] = v & 0xFF; v = Math.floor(v / 256); } szb[0] |= 0x80 >> (n - 1);
      const before = head.slice(0, i + el.n), content = head.slice(data, data + sz.v);
      return new Blob([before, szb, content, dur, blob.slice(data + sz.v)], {type:blob.type});
    }
    if (sz.unknown) break; i = data + sz.v;
  }
  throw new Error('Info introuvable');
}
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

/* ---------- PDF : une image JPEG par page (DCTDecode), taille de papier réelle pour les formats d'impression ---------- */
function pdfSize(P){
  const f = FORMATS.find(x => x.w === P.w && x.h === P.h && x.dpi), dpi = f?.dpi || 96, w = P.w / dpi * 72, h = P.h / dpi * 72;
  const mm = v => Math.round(v / 72 * 25.4);
  return {w, h, label:f ? `${mm(w)} × ${mm(h)} mm` : `${Math.round(w)} × ${Math.round(h)} points (${P.w} × ${P.h} px)`};
}
function pdfOf(pages, W, H, title = ''){
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0, next = 4;
  const add = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; add(`${n} 0 obj\n`); body(); add('\nendobj\n'); };
  const esc = t => String(t).replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '');
  add('%PDF-1.4\n'); add(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
  // numérotation : page, image, contenu, puis une annotation par lien
  const plan = pages.map(pg => { const o = {page:next, img:next + 1, cs:next + 2, ann:[]}; next += 3; (pg.links || []).forEach(() => o.ann.push(next++)); return o; });
  obj(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => add(`<< /Type /Pages /Kids [${plan.map(o => o.page + ' 0 R').join(' ')}] /Count ${pages.length} >>`));
  obj(3, () => add(`<< /Producer (Spectra Motion - Studio Prism) /Title (${esc(title)}) >>`));
  pages.forEach((pg, i) => {
    const o = plan[i], w = W.toFixed(2), h = H.toFixed(2), cs = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    obj(o.page, () => add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${o.img} 0 R >> >> /Contents ${o.cs} 0 R${o.ann.length ? ` /Annots [${o.ann.map(n => n + ' 0 R').join(' ')}]` : ''} >>`));
    obj(o.img, () => { add(`<< /Type /XObject /Subtype /Image /Width ${pg.pw} /Height ${pg.ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpg.length} >>\nstream\n`); add(pg.jpg); add('\nendstream'); });
    obj(o.cs, () => add(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    (pg.links || []).forEach((l, k) => obj(o.ann[k], () => add(`<< /Type /Annot /Subtype /Link /Rect [${(l.x * W).toFixed(2)} ${((1 - l.y - l.h) * H).toFixed(2)} ${((l.x + l.w) * W).toFixed(2)} ${((1 - l.y) * H).toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${esc(l.href)}) >> >>`)));
  });
  const xref = len;
  add(`xref\n0 ${next}\n0000000000 65535 f \n`); for (let i = 1; i < next; i++) add(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
  add(`trailer\n<< /Size ${next} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, {type:'application/pdf'});
}
/* liens d'une page, en fractions de la page */
const pageLinks = V => V.layers.filter(l => l.href && l.vis !== false).map(l => ({x:l.x / V.w, y:l.y / V.h, w:l.w / V.w, h:l.h / V.h, href:l.href}));
/* ---------- GIF animé : palette commune (coupe médiane), compression LZW ---------- */
async function gifEncode(frames, W, H, delayCs, prog = () => {}, cancelled = () => false){
  // 1. palette : échantillon de pixels de toutes les images, coupe médiane en 256 boîtes
  const sample = [], step = Math.max(1, Math.floor(frames.length * W * H / 120000));
  for (let f = 0, k = 0; f < frames.length; f++){ const d = frames[f].data; for (let i = (k % step) * 4; i < d.length; i += step * 4) sample.push([d[i], d[i + 1], d[i + 2]]); k++; }
  const boxes = [sample];
  while (boxes.length < 256){
    let bi = -1, br = -1, bc = 0;
    boxes.forEach((b, i) => { if (b.length < 2) return; for (let c = 0; c < 3; c++){ let mn = 255, mx = 0; for (const p of b){ if (p[c] < mn) mn = p[c]; if (p[c] > mx) mx = p[c]; } if (mx - mn > br){ br = mx - mn; bi = i; bc = c; } } });
    if (bi < 0 || br <= 0) break; const b = boxes[bi].sort((p, q) => p[bc] - q[bc]), m = b.length >> 1; boxes.splice(bi, 1, b.slice(0, m), b.slice(m));
  }
  const pal = boxes.map(b => { let r = 0, g = 0, bl = 0; for (const p of b){ r += p[0]; g += p[1]; bl += p[2]; } const n = Math.max(1, b.length); return [Math.round(r / n), Math.round(g / n), Math.round(bl / n)]; });
  while (pal.length < 256) pal.push([0, 0, 0]);
  const near = new Int16Array(32768).fill(-1);
  const idx = (r, g, b) => { const key = (r >> 3) << 10 | (g >> 3) << 5 | (b >> 3); let v = near[key]; if (v >= 0) return v; let best = 0, bd = 1e9; for (let i = 0; i < 256; i++){ const p = pal[i], dd = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2; if (dd < bd){ bd = dd; best = i; } } near[key] = best; return best; };
  // 2. flux GIF
  const out = []; const b8 = v => out.push(v & 255), b16 = v => { b8(v); b8(v >> 8); }, str = s => [...s].forEach(c => b8(c.charCodeAt(0)));
  str('GIF89a'); b16(W); b16(H); b8(0xF7); b8(0); b8(0); pal.forEach(p => { b8(p[0]); b8(p[1]); b8(p[2]); });
  if (frames.length > 1){ b8(0x21); b8(0xFF); b8(11); str('NETSCAPE2.0'); b8(3); b8(1); b16(0); b8(0); }
  for (let f = 0; f < frames.length; f++){
    if (cancelled()) return null;
    const d = frames[f].data, px = new Uint8Array(W * H); for (let i = 0, j = 0; j < px.length; i += 4, j++) px[j] = idx(d[i], d[i + 1], d[i + 2]);
    b8(0x21); b8(0xF9); b8(4); b8(0x04); b16(Math.max(2, delayCs)); b8(0); b8(0);
    b8(0x2C); b16(0); b16(0); b16(W); b16(H); b8(0);
    // LZW (taille de code minimale : 8)
    b8(8); const clear = 256, eoi = 257; let size = 9, next = 258, dict = new Map(), cur = 0, nb = 0; const bytes = [];
    const emit = c => { cur |= c << nb; nb += size; while (nb >= 8){ bytes.push(cur & 255); cur >>>= 8; nb -= 8; } };
    emit(clear); let w = px[0];
    for (let i = 1; i < px.length; i++){
      const k = px[i], key = w << 8 | k, hit = dict.get(key);
      if (hit !== undefined){ w = hit; continue; }
      emit(w); if (next < 4096){ dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { emit(clear); dict = new Map(); next = 258; size = 9; }
      w = k;
    }
    emit(w); emit(eoi); if (nb > 0) bytes.push(cur & 255);
    for (let i = 0; i < bytes.length; i += 255){ const n = Math.min(255, bytes.length - i); b8(n); for (let j = 0; j < n; j++) out.push(bytes[i + j]); }
    b8(0);
    if (f % 3 === 0){ prog(f / frames.length); await sleepE(0); }
  }
  b8(0x3B);
  return new Uint8Array(out);
}

/* ---------- Bibliothèque de médias ----------
   Les fichiers importés (images, vidéos, sons) restent des fichiers : ils sont gardés dans l'appareil (IndexedDB, base
   « spectramotion-media ») et, quand le cloud Studio Prism le permet, envoyés dans Firebase Storage
   (spectramotion/{propriétaire}/{projet}/{média}). Le projet ne contient que leurs métadonnées.
   Un média absent de l'appareil est téléchargé depuis le cloud à l'ouverture ; s'il n'existe nulle part (média resté sur
   l'appareil d'origine), le calque affiche un cadre « média manquant » et peut être relié à un nouveau fichier. */
const MEDIA_LIMITS = {image:40e6, video:2e9, audio:500e6};
const MEDIA_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/aac,audio/mp4,audio/x-m4a,audio/flac';
const kindOf = f => { const t = (f.type || '').toLowerCase(), n = (f.name || '').toLowerCase();
  if (t.startsWith('image/') && !t.includes('svg')) return 'image'; if (t.startsWith('video/')) return 'video'; if (t.startsWith('audio/')) return 'audio';
  if (/\.(png|jpe?g|webp|gif|avif)$/.test(n)) return 'image'; if (/\.(mp4|webm|mov|m4v)$/.test(n)) return 'video'; if (/\.(mp3|wav|ogg|oga|m4a|aac|flac|opus)$/.test(n)) return 'audio'; return null; };
const IDB = {
  db:null,
  open(){ if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { let r; try { r = indexedDB.open('spectramotion-media', 1); } catch(e){ return rej(e); }
    r.onupgradeneeded = () => r.result.createObjectStore('blobs'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async tx(mode, fn){ const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('blobs', mode), s = t.objectStore('blobs'); const q = fn(s); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('IndexedDB')); }); },
  put(k, v){ return this.tx('readwrite', s => s.put(v, k)); },
  get(k){ return this.tx('readonly', s => s.get(k)); },
  del(k){ return this.tx('readwrite', s => s.delete(k)); },
};
const MEDIA = {
  cache:{},       // id → {url, el, ready, buf, peaks, missing}
  actx:null,
  ctx(){ if (!this.actx){ const AC = window.AudioContext || window.webkitAudioContext; this.actx = AC ? new AC() : null; } return this.actx; },
  /* import d'un fichier : vérifie, garde dans l'appareil, lit ses dimensions / sa durée, fabrique une vignette */
  async add(file){
    const kind = kindOf(file); if (!kind) throw new Error(`« ${file.name} » : format non pris en charge (images, vidéos MP4 / WebM, sons MP3, WAV, OGG, M4A).`);
    if (file.size > MEDIA_LIMITS[kind]) throw new Error(`« ${file.name} » dépasse la taille maximale (${fmtBytes(MEDIA_LIMITS[kind])}).`);
    const id = uid('m'), m = {id, kind, name:String(file.name || kind).slice(0, 120), mime:file.type || '', size:file.size, w:0, h:0, dur:0, hasAudio:kind === 'audio', path:'', cloud:false, thumb:''};
    const blob = file instanceof Blob ? file : new Blob([file]);
    try { await IDB.put(id, blob); } catch(e){ console.warn('[Spectra Motion] média non gardé dans l\'appareil', e); }
    const url = URL.createObjectURL(blob); this.cache[id] = {url, blob};
    try { await this.probe(m, url); } catch(e){ URL.revokeObjectURL(url); delete this.cache[id]; IDB.del(id).catch(() => {}); throw new Error(`« ${file.name} » n'a pas pu être lu par le navigateur (fichier abîmé ou codec non pris en charge).`); }
    return m;
  },
  probe(m, url){
    return new Promise((res, rej) => {
      const done = () => { this.thumb(m).then(() => res(m), () => res(m)); };
      if (m.kind === 'image'){ const im = new Image(); im.decoding = 'async'; im.onload = () => { m.w = im.naturalWidth; m.h = im.naturalHeight; this.cache[m.id].el = im; done(); }; im.onerror = rej; im.src = url; return; }
      const el = document.createElement(m.kind === 'video' ? 'video' : 'audio'); el.preload = 'auto'; el.muted = true; el.playsInline = true; el.crossOrigin = 'anonymous';
      el.onloadedmetadata = () => { m.dur = isFinite(el.duration) ? round(el.duration, 3) : 0; if (m.kind === 'video'){ m.w = el.videoWidth; m.h = el.videoHeight; }
        if (m.kind === 'video' && !m.w){ rej(new Error('vidéo sans image')); return; }
        this.cache[m.id].el = el;
        if (m.kind === 'video'){ const go = () => { el.onseeked = null; done(); }; el.onseeked = go; try { el.currentTime = Math.min(m.dur * .1, 1); } catch(e){ go(); } setTimeout(() => el.onseeked && go(), 2500); }
        else done(); };
      el.onerror = () => rej(el.error); el.src = url;
      if (m.kind === 'video') this.detectAudio(m);
    });
  },
  /* la vidéo a-t-elle une piste son ? (décodage partiel, fichiers raisonnables uniquement) */
  async detectAudio(m){
    try { const c = this.cache[m.id]; if (!c?.blob || c.blob.size > 300e6) { m.hasAudio = true; return; } const b = await this.buffer(m); m.hasAudio = !!b; BUS.emit('media', m.id); } catch(e){ m.hasAudio = false; }
  },
  async thumb(m){
    const c = this.cache[m.id]; if (!c?.el || m.kind === 'audio') return;
    const s = 200, w0 = m.w || 1, h0 = m.h || 1, k = Math.min(1, s / Math.max(w0, h0)), cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w0 * k)); cv.height = Math.max(1, Math.round(h0 * k));
    try { cv.getContext('2d').drawImage(c.el, 0, 0, cv.width, cv.height); let q = .72, d = cv.toDataURL('image/jpeg', q); while (d.length > 11000 && q > .3){ q -= .12; d = cv.toDataURL('image/jpeg', q); } m.thumb = d.length < 12000 ? d : ''; } catch(e){}
  },
  /* fichier d'un média : appareil, sinon cloud */
  async blobOf(m){
    const c = this.cache[m.id]; if (c?.blob) return c.blob;
    let b = null; try { b = await IDB.get(m.id); } catch(e){}
    if (!b && m.path && window.SMCloudMedia?.ok()){ try { b = await window.SMCloudMedia.download(m.path); if (b) IDB.put(m.id, b).catch(() => {}); } catch(e){ console.warn('[Spectra Motion] téléchargement du média', m.name, e); } }
    return b;
  },
  /* prépare l'élément (image / vidéo / audio) d'un média pour le rendu */
  ensure(m){
    if (!m) return Promise.resolve(null);
    const c = this.cache[m.id] ||= {};
    if (c.el && (m.kind === 'image' ? c.el.complete : c.el.readyState >= 1)) return Promise.resolve(c.el);
    if (c.ready) return c.ready;
    return c.ready = (async () => {
      const b = await this.blobOf(m); if (!b){ c.missing = true; BUS.emit('media', m.id); return null; }
      c.blob = b; c.url ||= URL.createObjectURL(b); c.missing = false;
      const el = await new Promise(res => {
        if (m.kind === 'image'){ const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = c.url; return; }
        const v = document.createElement(m.kind === 'video' ? 'video' : 'audio'); v.preload = 'auto'; v.muted = true; v.playsInline = true;
        v.onloadeddata = () => res(v); v.onerror = () => res(null); v.src = c.url; if (m.kind === 'audio') v.onloadedmetadata = () => res(v);
      });
      c.el = el; if (!el) c.missing = true; BUS.emit('media', m.id); return el;
    })();
  },
  el(m){ const c = m && this.cache[m.id]; return c?.el && !c.missing ? c.el : null; },
  missing(m){ return !!(m && this.cache[m.id]?.missing); },
  /* son décodé (lecture synchronisée, export, forme d'onde) */
  async buffer(m){
    const c = this.cache[m.id] ||= {}; if (c.buf !== undefined) return c.buf;
    if (c.bufP) return c.bufP;
    return c.bufP = (async () => {
      const ac = this.ctx(); if (!ac) return c.buf = null;
      const b = await this.blobOf(m); if (!b || b.size > 300e6) return c.buf = null;
      try { const ab = await b.arrayBuffer(); c.buf = await new Promise((res, rej) => { const p = ac.decodeAudioData(ab, res, rej); if (p?.then) p.then(res, rej); }); }
      catch(e){ c.buf = null; }
      if (c.buf) c.peaks = this.peaksOf(c.buf);
      BUS.emit('media', m.id); return c.buf;
    })();
  },
  peaksOf(buf, n = 4000){
    const ch = buf.numberOfChannels, len = buf.length, step = Math.max(1, Math.floor(len / n)), out = new Float32Array(Math.ceil(len / step));
    const data = [...Array(ch)].map((_, i) => buf.getChannelData(i));
    for (let i = 0, j = 0; i < len; i += step, j++){ let mx = 0; for (let k = i; k < Math.min(len, i + step); k += 4) for (const d of data){ const v = Math.abs(d[k]); if (v > mx) mx = v; } out[j] = mx; }
    return {data:out, dur:buf.duration};
  },
  peaks(m){ return this.cache[m?.id]?.peaks || null; },
  /* au chargement d'un projet : prépare tous ses médias */
  async loadAll(P){ await Promise.all(Object.values(P.media).map(m => this.ensure(m).catch(() => null))); },
  /* envoi dans le cloud (si disponible) : appelé après l'import, ou à l'ouverture pour les médias pas encore envoyés */
  async upload(P, m){
    const C = window.SMCloudMedia; if (!C?.ok() || m.cloud) return false;
    const ctx = C.target(); if (!ctx) return false;
    const b = await this.blobOf(m); if (!b) return false;
    if (!C.room(b.size)) { m.cloudSkip = 'quota'; return false; }
    m.uploading = true; BUS.emit('media', m.id);
    try { m.path = await C.upload(ctx, m, b); m.cloud = true; delete m.cloudSkip; return true; }
    catch(e){ m.cloudSkip = e?.code === 'storage/unauthorized' || e?.code === 'storage/unknown' || e?.code === 'app/no-storage' ? 'off' : 'error'; console.warn('[Spectra Motion] envoi du média', m.name, e); return false; }
    finally { delete m.uploading; BUS.emit('media', m.id); }
  },
  async relink(m, file){ // remplace le fichier d'un média manquant
    if (kindOf(file) !== m.kind) throw new Error('Choisissez un fichier du même type (' + ({image:'image', video:'vidéo', audio:'son'})[m.kind] + ').');
    await IDB.put(m.id, file); const c = this.cache[m.id] ||= {}; if (c.url) URL.revokeObjectURL(c.url);
    Object.assign(c, {blob:file, url:URL.createObjectURL(file), el:null, ready:null, missing:false, buf:undefined, bufP:null, peaks:null});
    m.size = file.size; m.mime = file.type || m.mime; m.cloud = false; m.path = '';
    await this.ensure(m); return m;
  },
  forget(id){ const c = this.cache[id]; if (c?.url) URL.revokeObjectURL(c.url); delete this.cache[id]; },
};

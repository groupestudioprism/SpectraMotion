/* ---------- Détourage par IA, dans le navigateur (MediaPipe Image Segmenter, licence Apache 2.0) ----------
   Aucune image n'est envoyée sur un serveur : le modèle (2,7 Mo, ou 16 Mo pour le mode « personnes ») est téléchargé une fois
   puis gardé en cache. Le résultat est une NOUVELLE image (PNG transparent) ajoutée au projet : l'original reste intact. */
const SEG_VER = '0.10.14';
const SEG_MODELS = {
  auto:{n:'Sujet principal', url:'https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite', d:'Personnes, animaux, véhicules, objets courants'},
  person:{n:'Personnes (précis)', url:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite', d:'Cheveux et contours plus fins'},
};
const SEG = {
  seg:{}, mod:null,
  async load(kind){
    if (this.seg[kind]) return this.seg[kind];
    this.mod ||= await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${SEG_VER}/vision_bundle.mjs`);
    const {FilesetResolver, ImageSegmenter} = this.mod, fs = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${SEG_VER}/wasm`);
    return this.seg[kind] = await ImageSegmenter.createFromOptions(fs, {baseOptions:{modelAssetPath:SEG_MODELS[kind].url, delegate:'CPU'}, runningMode:'IMAGE', outputCategoryMask:false, outputConfidenceMasks:true});
  },
  /* masque (canvas, blanc = sujet) à la taille de l'image */
  async mask(el, kind = 'auto'){
    const s = await this.load(kind), sw = el.naturalWidth || el.videoWidth, sh = el.naturalHeight || el.videoHeight;
    const lim = 1024, f = Math.min(1, lim / Math.max(sw, sh)), inC = document.createElement('canvas'); inC.width = Math.round(sw * f); inC.height = Math.round(sh * f); inC.getContext('2d').drawImage(el, 0, 0, inC.width, inC.height);
    const res = s.segment(inC), bg = res.confidenceMasks[0], mw = bg.width, mh = bg.height, a = bg.getAsFloat32Array();
    const mc = document.createElement('canvas'); mc.width = mw; mc.height = mh; const g = mc.getContext('2d'), im = g.createImageData(mw, mh);
    let fg = 0; for (let i = 0; i < a.length; i++){ const v = clamp((1 - a[i] - .15) / .7, 0, 1); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = 255; im.data[i * 4 + 3] = Math.round(v * 255); fg += v; }
    res.close?.(); g.putImageData(im, 0, 0);
    if (fg / a.length < .005) throw new Error('Aucun sujet reconnu sur cette image (essayez le mode « Personnes » ou « Retirer le fond uni »).');
    const out = document.createElement('canvas'); out.width = sw; out.height = sh; const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.filter = `blur(${Math.max(.5, sw / 1400).toFixed(2)}px)`; o.drawImage(mc, 0, 0, sw, sh);
    return out;
  },
  /* sujet seul (PNG transparent) ou fond flouté (portrait), en nouvelle image du projet */
  async apply(L, mode, kind = 'auto', blur = 18){
    const P = ED.P, m = P.media[L.media], el = MEDIA.el(m); if (!el || L.t !== 'image') throw new Error('Sélectionnez une image présente sur cet appareil.');
    const sw = el.naturalWidth, sh = el.naturalHeight, mk = await this.mask(el, kind), cv = document.createElement('canvas'); cv.width = sw; cv.height = sh; const g = cv.getContext('2d');
    if (mode === 'cut'){ g.drawImage(el, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(mk, 0, 0); }
    else { g.filter = `blur(${Math.round(blur * sw / 1000)}px)`; g.drawImage(el, -sw * .02, -sh * .02, sw * 1.04, sh * 1.04); g.filter = 'none';
      const fg = document.createElement('canvas'); fg.width = sw; fg.height = sh; const f = fg.getContext('2d'); f.drawImage(el, 0, 0); f.globalCompositeOperation = 'destination-in'; f.drawImage(mk, 0, 0); g.drawImage(fg, 0, 0); }
    const type = mode === 'cut' ? 'image/png' : 'image/jpeg', blob = await new Promise(r => cv.toBlob(r, type, .92));
    const base = m.name.replace(/\.[a-z0-9]+$/i, ''), file = new File([blob], `${base} · ${mode === 'cut' ? 'détouré' : 'fond flou'}.${mode === 'cut' ? 'png' : 'jpg'}`, {type});
    const nm = await MEDIA.add(file); if (m.credit) nm.credit = {...m.credit}; P.media[nm.id] = nm; L.media = nm.id; delete L.bgk;
    ED.commit(mode === 'cut' ? 'Détourage IA' : 'Flou d\'arrière-plan'); ED.uploadPending(); PANEL.render(); return nm;
  },
};

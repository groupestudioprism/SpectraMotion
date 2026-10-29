/* ---------- Lecture : horloge du projet, son synchronisé, vidéos calées sur la timeline ----------
   L'horloge est celle du moteur audio (Web Audio) : le son est programmé à l'échantillon près et les vidéos suivent
   (recalées si elles dérivent de plus de 0,2 s). Le même plan de mixage sert à la lecture, à l'export vidéo et à l'export WAV. */
const audible = (P, L) => L.vis !== false && !L.mute && (L.vol ?? 1) > 0 && (L.t === 'audio' || (L.t === 'video' && P.media[L.media]?.hasAudio));
/* programme le son de toutes les pistes à partir de l'instant `from` du projet, dans le contexte ac, vers dest */
/* réponse impulsionnelle générée (bruit qui décroît) pour la réverbération : aucun fichier à télécharger */
function impulse(ac, sec = 2.2){
  const k = ac.sampleRate + ':' + sec; impulse.c ||= new WeakMap(); let m = impulse.c.get(ac); if (!m){ m = {}; impulse.c.set(ac, m); } if (m[k]) return m[k];
  const n = Math.round(ac.sampleRate * sec), b = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++){ const d = b.getChannelData(c); let s = 1234 + c * 77; for (let i = 0; i < n; i++){ s = (s * 16807) % 2147483647; d[i] = ((s / 2147483647) * 2 - 1) * (1 - i / n) ** 3.2; } }
  return m[k] = b;
}
/* intervalles où « parlent » les autres pistes (pour baisser automatiquement une musique) */
function duckSpans(P, L){
  const sp = P.layers.filter(o => o !== L && !o.duck && audible(P, o)).map(o => [o.start, o.start + o.dur]).sort((a, b) => a[0] - b[0]), out = [];
  for (const s of sp){ const l = out[out.length - 1]; if (l && s[0] <= l[1] + .5) l[1] = Math.max(l[1], s[1]); else out.push([...s]); }
  return out;
}
const DUCK = .22, DUCK_R = .3;
function duckAt(spans, t){ let f = 1; for (const [a, b] of spans){ if (t >= a - DUCK_R && t <= b + DUCK_R){ const v = t < a ? 1 - (1 - DUCK) * (t - (a - DUCK_R)) / DUCK_R : t > b ? DUCK + (1 - DUCK) * (t - b) / DUCK_R : DUCK; f = Math.min(f, v); } } return f; }
function scheduleAudio(P, ac, dest, from, base, until = Infinity){
  const nodes = [];
  for (const L of P.layers){
    if (!audible(P, L)) continue;
    const m = P.media[L.media], buf = MEDIA.cache[m?.id]?.buf; if (!buf) continue;
    const a = L.start, b = Math.min(L.start + L.dur, until); if (b <= from) continue;
    const t0 = Math.max(from, a), sp = L.speed || 1, off = srcTime(L, t0); if (off >= buf.duration) continue;
    const src = ac.createBufferSource(); src.buffer = buf; src.playbackRate.value = sp;
    const g = ac.createGain(), vol = L.vol ?? 1;
    const dsp = L.duck ? duckSpans(P, L) : [];
    const gv = tp => { let v = vol * (dsp.length ? duckAt(dsp, tp) : 1); if (L.fadeIn > 0 && tp < a + L.fadeIn) v *= clamp((tp - a) / L.fadeIn, 0, 1); if (L.fadeOut > 0 && tp > L.start + L.dur - L.fadeOut) v *= clamp((L.start + L.dur - tp) / L.fadeOut, 0, 1); return v; };
    const at = tp => base + (tp - from);
    g.gain.setValueAtTime(gv(t0), at(t0));
    const pts = []; if (L.fadeIn > 0) pts.push(a + L.fadeIn); if (L.fadeOut > 0) pts.push(L.start + L.dur - L.fadeOut, L.start + L.dur);
    for (const [x, y] of dsp) pts.push(x - DUCK_R, x, y, y + DUCK_R);
    pts.filter(p => p > t0 && p <= b).sort((x, y) => x - y).forEach(p => g.gain.linearRampToValueAtTime(gv(p), at(p)));
    // égaliseur (graves / aigus) et panoramique, si réglés
    let head = src;
    if (L.eqLo){ const f = ac.createBiquadFilter(); f.type = 'lowshelf'; f.frequency.value = 220; f.gain.value = L.eqLo; head.connect(f); head = f; nodes.push(f); }
    if (L.eqHi){ const f = ac.createBiquadFilter(); f.type = 'highshelf'; f.frequency.value = 3200; f.gain.value = L.eqHi; head.connect(f); head = f; nodes.push(f); }
    if (L.comp){ const c = ac.createDynamicsCompressor(); c.threshold.value = -24; c.knee.value = 12; c.ratio.value = 4; c.attack.value = .005; c.release.value = .2; const mk = ac.createGain(); mk.gain.value = 1.5; const lim = ac.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0; lim.release.value = .08; head.connect(c); c.connect(mk); mk.connect(lim); head = lim; nodes.push(c, mk, lim); }
    if (L.echo > 0 || L.rev > 0){ // écho (retard réinjecté) et réverbération (convolution), mélangés au son direct
      const mix = ac.createGain(); head.connect(mix); nodes.push(mix);
      if (L.echo > 0){ const dl = ac.createDelay(2), fb = ac.createGain(), wet = ac.createGain(); dl.delayTime.value = .32; fb.gain.value = clamp(L.echo / 100 * .65, 0, .7); wet.gain.value = L.echo / 100 * .8; head.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(mix); nodes.push(dl, fb, wet); }
      if (L.rev > 0){ const cv = ac.createConvolver(), wet = ac.createGain(); cv.buffer = impulse(ac, 1.2 + L.rev / 100 * 2.4); wet.gain.value = L.rev / 100 * 1.1; head.connect(cv); cv.connect(wet); wet.connect(mix); nodes.push(cv, wet); }
      head = mix;
    }
    head.connect(g);
    if (L.pan && ac.createStereoPanner){ const pn = ac.createStereoPanner(); pn.pan.value = clamp(L.pan, -1, 1); g.connect(pn); pn.connect(dest); nodes.push(pn); } else g.connect(dest);
    try { src.start(at(t0), off, Math.max(0, (b - t0) * sp)); nodes.push(src, g); } catch(e){ console.warn('[Spectra Motion] son', e); }
  }
  return nodes;
}
const PLAY = {
  playing:false, t:0, raf:0, base:0, from:0, nodes:[], loop:false, pt0:0, waiting:false,
  get P(){ return ED.P; },
  end(){ return Math.max(.1, TIMED(this.P.studio) ? syncDur(this.P) : this.P.dur); },
  now(){ const ac = MEDIA.actx; return this.playing ? this.from + ((ac && ac.state === 'running' ? ac.currentTime : performance.now() / 1000) - this.base) : this.t; },
  async play(){
    if (this.playing || this.waiting) return; const P = this.P;
    if (this.t >= this.end() - 1 / P.fps) this.t = 0;
    const need = P.layers.filter(L => audible(P, L) && MEDIA.cache[L.media]?.buf === undefined);
    if (need.length){ this.waiting = true; BUS.emit('playstate'); try { await Promise.all(need.map(L => MEDIA.buffer(P.media[L.media]))); } finally { this.waiting = false; } }
    const ac = MEDIA.ctx(); if (ac?.state === 'suspended') try { await ac.resume(); } catch(e){}
    this.playing = true; this.from = this.t;
    this.base = ac && ac.state === 'running' ? ac.currentTime + .06 : performance.now() / 1000 + .06;
    if (ac && ac.state === 'running'){ this.master = ac.createGain(); this.master.connect(ac.destination); this.nodes = scheduleAudio(P, ac, this.master, this.from, this.base); }
    this.syncVideos(true); BUS.emit('playstate');
    const tick = () => {
      if (!this.playing) return;
      let t = this.now(); const e = this.end();
      if (t >= e){ if (this.loop){ this.stopAudio(); this.t = 0; this.playing = false; this.play(); return; } this.pause(); this.t = TIMED(this.P.studio) ? e : 0; BUS.emit('time', this.t); this.still(); return; }
      this.t = Math.max(0, t); this.syncVideos(false); BUS.emit('time', this.t); BUS.emit('frame');
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },
  stopAudio(){ for (const n of this.nodes){ try { n.stop?.(); } catch(e){} try { n.disconnect(); } catch(e){} } this.nodes = []; try { this.master?.disconnect(); } catch(e){} this.master = null; },
  pause(){
    if (!this.playing) return; this.t = this.now(); this.playing = false; cancelAnimationFrame(this.raf); this.stopAudio();
    for (const L of this.P.layers) if (L.t === 'video'){ const el = MEDIA.el(this.P.media[L.media]); if (el && !el.paused) el.pause(); }
    BUS.emit('playstate'); this.still();
  },
  toggle(){ this.playing ? this.pause() : this.play(); },
  seek(t, keepPlaying = true){
    const was = this.playing && keepPlaying; if (this.playing) this.pause();
    this.t = clamp(t, 0, this.end()); BUS.emit('time', this.t);
    if (was) this.play(); else this.still();
  },
  /* image fixe : cale les vidéos sur l'instant puis redessine */
  async still(){ const id = ++this.sid; BUS.emit('frame'); await seekVideos(this.P, this.t); if (id === this.sid && !this.playing) BUS.emit('frame'); },
  sid:0,
  syncVideos(start){
    const P = this.P, t = this.t;
    for (const L of P.layers){
      if (L.t !== 'video') continue;
      const m = P.media[L.media], el = MEDIA.el(m); if (!el) continue;
      const on = visible(L, t) && this.playing;
      if (!on){ if (!el.paused) el.pause(); continue; }
      const st = srcTime(L, t), sp = L.speed || 1;
      if (el.playbackRate !== sp) try { el.playbackRate = sp; } catch(e){}
      // pas de son décodé (fichier trop lourd, codec) : la vidéo joue elle-même son son pendant l'aperçu
      const noBuf = m.hasAudio && !MEDIA.cache[m.id]?.buf && !L.mute; el.muted = !noBuf; if (noBuf) el.volume = clamp(L.vol ?? 1, 0, 1);
      if (start || Math.abs(el.currentTime - st) > .2) try { el.currentTime = st; } catch(e){}
      if (el.paused) el.play().catch(() => {});
    }
  },
};

/* ---------- Timeline multipiste : pistes vidéo / image / texte au-dessus, pistes audio en dessous ----------
   Glisser un clip le déplace (dans le temps et d'une piste à l'autre), ses bords le raccourcissent, S le coupe à la tête de lecture.
   Dans le studio Motion, le calque sélectionné déplie ses propriétés animées (position, échelle, rotation, opacité) avec leurs images clés. */
const TL = {
  pps:60, scroll:0, drag:null, open:true, rowH:46, laneH:24,
  get P(){ return ED.P; },
  init(){
    this.el = $('#smTl'); this.heads = $('#tlHeads'); this.lanes = $('#tlLanes'); this.ruler = $('#tlRuler'); this.ph = $('#tlPh'); this.time = $('#tlTime');
    this.lanes.addEventListener('pointerdown', e => this.down(e));
    // double-clic sur une image clé : change sa courbe (douce → linéaire → accélération → décélération → maintien)
    this.lanes.addEventListener('dblclick', e => { const kf = e.target.closest('[data-kf]'); if (!kf || ED.readOnly) return; const c = this.P.layers.find(l => l.id === kf.dataset.id), k = c?.kf?.[kf.dataset.kf]?.[+kf.dataset.i]; if (!k) return;
      const order = ['ease', 'lin', 'in', 'out', 'back', 'elastic', 'bounce', 'hold']; k[2] = order[(order.indexOf(k[2] || 'ease') + 1) % order.length]; ED.commit('Courbe : ' + EASES[k[2]]); toast('Courbe de l\'image clé : ' + EASES[k[2]], 1500); });
    this.ruler.addEventListener('pointerdown', e => this.scrubStart(e));
    window.addEventListener('pointermove', e => this.move(e));
    window.addEventListener('pointerup', e => this.up(e));
    this.lanes.addEventListener('scroll', () => { this.heads.scrollTop = this.lanes.scrollTop; this.scroll = this.lanes.scrollLeft; this.drawRuler(); });
    this.lanes.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey){ e.preventDefault(); const r = this.lanes.getBoundingClientRect(), tAt = (e.clientX - r.left + this.lanes.scrollLeft) / this.pps; this.setPps(this.pps * Math.exp(-e.deltaY * .002)); this.lanes.scrollLeft = tAt * this.pps - (e.clientX - r.left); } }, {passive:false});
    $('#tlZoom').addEventListener('input', e => this.setPps(+e.target.value));
    this.heads.addEventListener('click', e => this.headClick(e));
    BUS.on('time', t => this.playhead(t));
    BUS.on('media', () => this.render());
    new ResizeObserver(() => this.drawRuler()).observe(this.lanes);
  },
  setPps(v){ this.pps = clamp(v, 4, 600); $('#tlZoom').value = this.pps; this.render(); },
  fitAll(){ const w = this.lanes.clientWidth - 40; this.setPps(w / Math.max(1, PLAY.end())); this.lanes.scrollLeft = 0; },
  /* rangées : pistes visuelles (la plus haute en premier), puis pistes audio */
  rows(){
    const P = this.P, vis = P.layers.filter(l => l.t !== 'audio'), aud = P.layers.filter(l => l.t === 'audio');
    const vt = Math.max(-1, ...vis.map(l => l.track)), at = Math.max(-1, ...aud.map(l => l.track));
    const rows = [];
    for (let i = Math.max(vt, ED.studio === 'audio' ? -1 : 0); i >= 0; i--) rows.push({kind:'v', track:i, items:vis.filter(l => l.track === i)});
    for (let i = 0; i <= Math.max(at, 0); i++) rows.push({kind:'a', track:i, items:aud.filter(l => l.track === i)});
    return rows;
  },
  x(t){ return t * this.pps; },
  render(){
    if (!this.el || this.el.hidden) return;
    const P = this.P, rows = this.rows(), end = Math.max(PLAY.end(), 1), W = Math.max(this.lanes.clientWidth, this.x(end) + 240);
    const sel = ED.sel, motion = ED.studio === 'motion';
    let H = '', L = '', y = 0;
    for (const r of rows){
      const lab = r.kind === 'v' ? 'V' + (r.track + 1) : 'A' + (r.track + 1), allHid = r.items.length && r.items.every(l => l.vis === false), allMute = r.items.length && r.items.every(l => l.mute);
      H += `<div class="tl-hd ${r.kind}" style="height:${this.rowH}px"><b>${lab}</b><span>${r.kind === 'v' ? (r.items.length ? r.items.length + ' clip' + (r.items.length > 1 ? 's' : '') : 'vide') : 'audio'}</span>
        ${r.kind === 'v' ? `<button type="button" class="tl-ib" data-th="vis" data-k="${r.kind}" data-t="${r.track}" aria-pressed="${!allHid}" title="${allHid ? 'Afficher la piste' : 'Masquer la piste'}">${ico(allHid ? 'eyeOff' : 'eye')}</button>`
        : `<button type="button" class="tl-ib" data-th="mute" data-k="${r.kind}" data-t="${r.track}" aria-pressed="${!allMute}" title="${allMute ? 'Rétablir le son' : 'Couper la piste'}">${ico(allMute ? 'mute' : 'vol')}</button>`}</div>`;
      L += `<div class="tl-row ${r.kind}" data-k="${r.kind}" data-t="${r.track}" style="top:${y}px;height:${this.rowH}px;width:${W}px">`;
      for (const c of r.items) L += this.clipHtml(c, sel.has(c.id));
      L += '</div>'; y += this.rowH;
      // studio Motion : propriétés animables du calque sélectionné
      if (motion) for (const c of r.items) if (sel.has(c.id) && sel.size === 1 && c.t !== 'audio'){
        for (const p of ANIM_PROPS){
          const lab2 = {x:'Position X', y:'Position Y', sc:'Échelle', rot:'Rotation', op:'Opacité'}[p], on = hasKf(c, p), here = kfAt(c, p, PLAY.t - c.start);
          H += `<div class="tl-hd lane" style="height:${this.laneH}px"><button type="button" class="kf-tg${on ? ' on' : ''}" data-kft="${p}" data-id="${c.id}" title="${on ? 'Arrêter l\'animation de cette propriété (supprime ses images clés)' : 'Animer cette propriété'}">${ico('anim')}</button><span>${lab2}</span>
            <button type="button" class="kf-add${here ? ' on' : ''}" data-kfa="${p}" data-id="${c.id}" title="${here ? 'Supprimer l\'image clé à la tête de lecture' : 'Ajouter une image clé à la tête de lecture'}">${ico('key')}</button></div>`;
          L += `<div class="tl-lane" style="top:${y}px;height:${this.laneH}px;width:${W}px">` + (c.kf?.[p] || []).map((k, i) => `<i class="kf ${k[2] || 'ease'}" data-kf="${p}" data-i="${i}" data-id="${c.id}" style="left:${this.x(c.start + k[0])}px" title="${lab2} : ${round(k[1], 2)} à ${fmtT(c.start + k[0])} · courbe ${EASES[k[2] || 'ease']} (double-clic : changer · Alt + clic : supprimer)"></i>`).join('') + '</div>';
          y += this.laneH;
        }
      }
    }
 for (const [i, mk] of (P.markers || []).entries()) L += `<div class="tl-mk" data-mk="${i}" style="left:${this.x(mk.t)}px;height:${y}px" title="${escH(mk.n || 'Repère')} · ${fmtT(mk.t)}"></div>`;
    L += `<div class="tl-end" style="left:${this.x(end)}px;height:${y}px" title="Fin du projet"></div>`;
    this.heads.innerHTML = H + `<div class="tl-hd add"><button type="button" data-th="addv" title="Ajouter un titre sur une nouvelle piste, à la tête de lecture">+ Titre</button><button type="button" data-th="adda" title="Importer un son sur une nouvelle piste audio">+ Son</button></div>`;
    this.lanes.querySelector('.tl-in').innerHTML = L; this.lanes.querySelector('.tl-in').style.height = (y + 44) + 'px'; this.lanes.querySelector('.tl-in').style.width = W + 'px';
    this.drawWaves(); this.drawRuler(); this.playhead(PLAY.t);
  },
  clipHtml(c, on){
    const P = this.P, m = c.media ? P.media[c.media] : null, x = this.x(c.start), w = Math.max(6, this.x(c.dur));
    const kind = c.t, label = escH(c.name || SHAPE_NAMES[c.k] || ({text:'Texte', color:'Couleur'})[c.t] || 'Clip');
    const thumb = m?.thumb && (kind === 'video' || kind === 'image') ? `background-image:url('${m.thumb}')` : '';
    const tin = c.tin?.k !== 'none' ? `<i class="tr in" style="width:${Math.min(w / 2, this.x(c.tin.d))}px" title="Entrée : ${FX_IN[c.tin.k]}"></i>` : '';
    const tout = c.tout?.k !== 'none' ? `<i class="tr out" style="width:${Math.min(w / 2, this.x(c.tout.d))}px" title="Sortie : ${FX_OUT[c.tout.k]}"></i>` : '';
    const fades = kind === 'audio' || (kind === 'video' && m?.hasAudio) ? (c.fadeIn ? `<i class="fd in" style="width:${this.x(c.fadeIn)}px"></i>` : '') + (c.fadeOut ? `<i class="fd out" style="width:${this.x(c.fadeOut)}px"></i>` : '') : '';
    const kfs = ED.studio !== 'motion' ? [...new Set(ANIM_PROPS.flatMap(p => (c.kf?.[p] || []).map(k => k[0])))].map(t => `<i class="kfd" style="left:${this.x(t)}px"></i>`).join('') : '';
    const miss = m && MEDIA.missing(m) ? ' miss' : '';
    return `<div class="clip ${kind}${on ? ' on' : ''}${c.vis === false ? ' off' : ''}${c.lock ? ' lk' : ''}${miss}" data-id="${c.id}" style="left:${x}px;width:${w}px" title="${label} · ${fmtT(c.start)} → ${fmtT(c.start + c.dur)}">
      <div class="cl-bg" style="${thumb}"></div>${kind === 'audio' || (kind === 'video' && m?.hasAudio) ? `<canvas class="wave" data-w="${c.id}"></canvas>` : ''}
      <span class="cl-n">${kind === 'text' ? ico('text') : kind === 'audio' ? ico('audio') : kind === 'video' ? ico('video') : kind === 'image' ? ico('media') : ico('shapes')}${label}${(c.speed || 1) !== 1 ? ` <em>×${round(c.speed, 2)}</em>` : ''}${c.mute ? ' <em>muet</em>' : ''}</span>
      ${tin}${tout}${fades}${kfs}<i class="eg l" data-edge="l"></i><i class="eg r" data-edge="r"></i></div>`;
  },
  drawWaves(){
    const P = this.P;
    for (const cv of $$('canvas.wave', this.lanes)){
      const c = P.layers.find(l => l.id === cv.dataset.w), m = c && P.media[c.media]; if (!m) continue;
      const pk = MEDIA.peaks(m); if (!pk){ if (MEDIA.cache[m.id]?.buf === undefined) MEDIA.buffer(m); continue; }
      const w = Math.max(1, Math.min(8000, Math.round(this.x(c.dur)))), h = cv.clientHeight || 30; cv.width = w; cv.height = h;
      const g = cv.getContext('2d'); g.fillStyle = c.t === 'audio' ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.5)';
      const n = pk.data.length, per = pk.dur / n, sp = c.speed || 1;
      for (let x = 0; x < w; x++){
        const t0 = (c.in || 0) + (x / this.pps) * sp, t1 = (c.in || 0) + ((x + 1) / this.pps) * sp; let mx = 0;
        for (let i = Math.floor(t0 / per); i <= Math.min(n - 1, Math.floor(t1 / per)); i++) if (pk.data[i] > mx) mx = pk.data[i];
        const v = mx * (c.vol ?? 1) * h * .48; g.fillRect(x, h / 2 - v, 1, Math.max(1, v * 2));
      }
    }
  },
  drawRuler(){
    const cv = this.ruler, w = this.lanes.clientWidth, h = 26, dpr = Math.min(2, devicePixelRatio || 1);
    if (!w) return;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px';
    const g = cv.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
    const css = getComputedStyle(this.el), ink = css.getPropertyValue('--tl-ink').trim() || '#999';
    const steps = [1 / 30, .1, .25, .5, 1, 2, 5, 10, 15, 30, 60, 120, 300], major = steps.find(s => s * this.pps >= 70) || 600, minor = major / (major >= 1 ? 5 : 2);
    g.fillStyle = ink; g.strokeStyle = ink; g.font = '10.5px Inter, sans-serif'; g.textBaseline = 'top';
    const t0 = this.scroll / this.pps, t1 = (this.scroll + w) / this.pps;
    for (let t = Math.floor(t0 / minor) * minor; t <= t1; t += minor){
      const x = Math.round(t * this.pps - this.scroll) + .5, isM = Math.abs(t / major - Math.round(t / major)) < 1e-6;
      g.globalAlpha = isM ? .9 : .4; g.beginPath(); g.moveTo(x, isM ? 12 : 18); g.lineTo(x, h); g.stroke();
      if (isM){ g.globalAlpha = .85; g.fillText(major < 1 ? t.toFixed(major < .5 ? 2 : 1).replace('.', ',') + ' s' : fmtT(t, false), x + 4, 2); }
    }
    g.globalAlpha = 1;
    // repères (touche M) : petits drapeaux sur la règle
    for (const mk of this.P.markers || []){ const x = mk.t * this.pps - this.scroll; if (x < -10 || x > w + 10) continue;
      g.fillStyle = '#FFB020'; g.beginPath(); g.moveTo(x - 5, 14); g.lineTo(x + 5, 14); g.lineTo(x, 22); g.closePath(); g.fill(); if (mk.n && this.pps * 1 > 20){ g.fillStyle = ink; g.fillText(mk.n.slice(0, 14), x + 6, 14); } }
  },
  /* repère le plus proche du pointeur sur la règle (à 7 px près) */
  markerAt(e){ const r = this.ruler.getBoundingClientRect(), t = (e.clientX - r.left + this.scroll) / this.pps, th = 7 / this.pps; let best = -1, bd = th;
    (this.P.markers || []).forEach((m, i) => { const d = Math.abs(m.t - t); if (d <= bd){ bd = d; best = i; } }); return best; },
  addMarker(t = PLAY.t, n = ''){ const P = this.P; P.markers ||= []; t = round(clamp(t, 0, 36000), 3); if (P.markers.some(m => Math.abs(m.t - t) < .02)) return toast('Il y a déjà un repère ici.');
    if (P.markers.length >= 500) return toast('500 repères au maximum.'); P.markers.push({t, n:String(n).slice(0, 40)}); P.markers.sort((a, b) => a.t - b.t); ED.commit('Ajouter un repère'); this.render(); toast(`Repère à ${fmtT(t)}`, 1400); },
  delMarker(i){ const P = this.P; if (!P.markers?.[i]) return; P.markers.splice(i, 1); ED.commit('Supprimer le repère'); this.render(); },
  jumpMarker(dir){ const ms = (this.P.markers || []).map(m => m.t), t = PLAY.t, n = dir > 0 ? ms.find(x => x > t + .01) : [...ms].reverse().find(x => x < t - .01); if (n != null) PLAY.seek(n, false); else toast(dir > 0 ? 'Aucun repère après la tête de lecture.' : 'Aucun repère avant la tête de lecture.', 1400); },
  playhead(t){
    const x = this.x(t); if (this.ph) this.ph.style.transform = `translateX(${x - this.scroll}px)`;
    if (this.time) this.time.textContent = fmtTC(t, this.P.fps) + ' / ' + fmtTC(PLAY.end(), this.P.fps);
    // la tête de lecture reste visible pendant la lecture
    if (PLAY.playing && this.lanes && (x > this.lanes.scrollLeft + this.lanes.clientWidth - 40 || x < this.lanes.scrollLeft)) this.lanes.scrollLeft = x - 60;
    if (ED.studio === 'motion' && !PLAY.playing) $$('.kf-add', this.heads).forEach(b => { const c = this.P.layers.find(l => l.id === b.dataset.id); if (c) b.classList.toggle('on', kfAt(c, b.dataset.kfa, t - c.start)); });
  },
  tAt(e){ const r = this.lanes.getBoundingClientRect(); return Math.max(0, (e.clientX - r.left + this.lanes.scrollLeft) / this.pps); },
  scrubStart(e){ if (e.button !== 0) return; e.preventDefault(); const mi = this.markerAt(e); if (mi >= 0){ PLAY.seek(this.P.markers[mi].t, false); return; } this.drag = {mode:'scrub'}; PLAY.seek(this.snapT(this.tAt(e), null, e), false); },
  /* aimantation : tête de lecture, bords des clips, début */
  snapT(t, self, e){
    if (!ED.snap || e?.altKey) return t; const th = 8 / this.pps; let best = t, bd = th;
    const pts = [0, PLAY.t, ...(this.P.markers || []).map(m => m.t), ...this.P.layers.filter(l => !self || !self.includes(l.id)).flatMap(l => [l.start, l.start + l.dur])];
    for (const p of pts) if (Math.abs(p - t) < bd){ bd = Math.abs(p - t); best = p; }
    return best;
  },
  down(e){
    if (e.button !== 0) return;
    const kf = e.target.closest('[data-kf]');
    if (kf){ e.preventDefault(); const c = this.P.layers.find(l => l.id === kf.dataset.id), k = c.kf[kf.dataset.kf][+kf.dataset.i];
      if (e.altKey || e.button === 2){ c.kf[kf.dataset.kf].splice(+kf.dataset.i, 1); if (!c.kf[kf.dataset.kf].length) delete c.kf[kf.dataset.kf]; ED.commit('Supprimer l\'image clé'); return; }
      PLAY.seek(c.start + k[0], false); this.drag = {mode:'kf', c, p:kf.dataset.kf, k, t0:k[0], x0:e.clientX, moved:false}; return; }
    const clip = e.target.closest('.clip');
    if (!clip){ ED.select([]); this.drag = {mode:'scrub'}; PLAY.seek(this.tAt(e), false); return; }
    const c = this.P.layers.find(l => l.id === clip.dataset.id); if (!c) return;
    if (e.shiftKey){ ED.toggleSel(c.id); return; }
    if (!ED.sel.has(c.id)) ED.select([c.id]);
    if (ED.readOnly || c.lock) return;
    e.preventDefault();
    const edge = e.target.dataset.edge, m = c.media ? this.P.media[c.media] : null;
    const items = edge ? [c] : ED.selLayers().filter(x => !x.lock);
    this.drag = {mode:edge ? 'trim' + edge : 'move', c, m, x0:e.clientX, y0:e.clientY, items:items.map(x => ({c:x, start:x.start, dur:x.dur, in:x.in || 0, track:x.track})), moved:false, row:clip.closest('.tl-row')};
  },
  move(e){
    const d = this.drag; if (!d) return;
    if (d.mode === 'scrub'){ PLAY.seek(this.snapT(this.tAt(e), null, e), false); return; }
    const dt = (e.clientX - d.x0) / this.pps;
    if (!d.moved && Math.abs(e.clientX - d.x0) < 3 && Math.abs(e.clientY - (d.y0 ?? e.clientY)) < 3) return; d.moved = true;
    if (d.mode === 'kf'){ const nt = clamp(round(d.t0 + dt, 3), 0, d.c.dur); d.k[0] = nt; d.c.kf[d.p].sort((a, b) => a[0] - b[0]); this.render(); PLAY.seek(d.c.start + nt, false); return; }
    const ids = d.items.map(i => i.c.id);
    if (d.mode === 'move'){
      const i0 = d.items[0]; let ns = Math.max(0, i0.start + dt); ns = this.snapT(ns, ids, e); const end = this.snapT(ns + i0.dur, ids, e); if (end !== ns + i0.dur && Math.abs(end - (ns + i0.dur)) < 8 / this.pps) ns = end - i0.dur;
      const shift = Math.max(-Math.min(...d.items.map(i => i.start)), ns - i0.start);
      // changement de piste : selon la rangée survolée (même famille : visuel / audio)
      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.tl-row'); let dTrack = 0;
      if (row && row.dataset.k === (d.c.t === 'audio' ? 'a' : 'v')) dTrack = +row.dataset.t - d.items[0].track;
      else if (!row && d.c.t !== 'audio' && e.clientY < this.lanes.getBoundingClientRect().top + 10) dTrack = 1 + Math.max(...this.P.layers.filter(l => l.t !== 'audio').map(l => l.track)) - d.items[0].track;
      for (const it of d.items){ it.c.start = round(it.start + shift, 3); if ((it.c.t === 'audio') === (d.c.t === 'audio')) it.c.track = Math.max(0, it.track + dTrack); }
    } else if (d.mode === 'triml'){
      const c = d.c, it = d.items[0], sp = c.speed || 1, media = c.t === 'video' || c.t === 'audio';
      let ns = this.snapT(Math.max(0, it.start + dt), ids, e); let delta = ns - it.start;
      delta = Math.min(delta, it.dur - 1 / this.P.fps); if (media) delta = Math.max(delta, -it.in / sp);
      c.start = round(it.start + delta, 3); c.dur = round(it.dur - delta, 3); if (media) c.in = round(it.in + delta * sp, 3);
      for (const p of ANIM_PROPS) if (c.kf?.[p]) c.kf[p] = c.kf[p].map(k => [round(k[0] - (delta - (d.lastDelta || 0)), 3), k[1], k[2]]); d.lastDelta = delta;
    } else if (d.mode === 'trimr'){
      const c = d.c, it = d.items[0], sp = c.speed || 1, media = c.t === 'video' || c.t === 'audio';
      let ne = this.snapT(it.start + it.dur + dt, ids, e), dur = Math.max(1 / this.P.fps, ne - it.start);
      if (media && d.m?.dur) dur = Math.min(dur, (d.m.dur - it.in) / sp);
      c.dur = round(dur, 3);
    }
    if (TIMED(this.P.studio)) syncDur(this.P);
    this.render(); STAGE.paint(); BUS.emit('live');
  },
  up(){
    const d = this.drag; if (!d) return; this.drag = null;
    if (d.mode === 'scrub' || !d.moved) return;
    ED.commit(d.mode === 'move' ? 'Déplacer le clip' : d.mode === 'kf' ? 'Déplacer l\'image clé' : 'Raccourcir le clip');
  },
  headClick(e){
    const b = e.target.closest('[data-th],[data-kft],[data-kfa]'); if (!b || ED.readOnly) return;
    const P = this.P;
    if (b.dataset.kft){ const c = P.layers.find(l => l.id === b.dataset.id), p = b.dataset.kft; if (hasKf(c, p)){ c[p] = kfVal(c, p, PLAY.t - c.start); delete c.kf[p]; } else setKf(c, p, PLAY.t - c.start, c[p]); ED.commit('Animer'); return; }
    if (b.dataset.kfa){ const c = P.layers.find(l => l.id === b.dataset.id), p = b.dataset.kfa, tl = PLAY.t - c.start;
      if (tl < 0 || tl > c.dur) return toast('Placez la tête de lecture sur le clip pour poser une image clé.');
      if (kfAt(c, p, tl)) delKf(c, p, tl); else setKf(c, p, tl, kfVal(c, p, tl)); ED.commit('Image clé'); return; }
    const k = b.dataset.th, items = P.layers.filter(l => (b.dataset.k === 'a') === (l.t === 'audio') && l.track === +b.dataset.t);
    if (k === 'vis'){ const hide = !items.every(l => l.vis === false); items.forEach(l => l.vis = !hide); ED.commit(hide ? 'Masquer la piste' : 'Afficher la piste'); }
    if (k === 'mute'){ const m = !items.every(l => l.mute); items.forEach(l => l.mute = m); ED.commit(m ? 'Couper le son' : 'Rétablir le son'); }
    if (k === 'addv'){ ED.extraV = (ED.extraV || 0) + 1; ED.addLayer(mkText(P, {txt:'Titre', start:PLAY.t, dur:Math.min(5, Math.max(2, PLAY.end() - PLAY.t)), track:topTrack(P)})); }
    if (k === 'adda') ED.importPick('audio');
  },
  /* coupe les clips sélectionnés (ou ceux sous la tête de lecture) */
  split(){
    const P = this.P, t = PLAY.t; let targets = ED.selLayers().filter(c => t > c.start + 1e-3 && t < c.start + c.dur - 1e-3 && !c.lock);
    if (!targets.length) targets = P.layers.filter(c => t > c.start + 1e-3 && t < c.start + c.dur - 1e-3 && !c.lock && c.vis !== false);
    if (!targets.length) return toast('Placez la tête de lecture sur un clip pour le couper.');
    const newIds = [];
    for (const c of targets){
      const cut = t - c.start, b = deep(c); b.id = uid('l'); b.start = round(t, 3); b.dur = round(c.dur - cut, 3);
      if (c.t === 'video' || c.t === 'audio') b.in = round((c.in || 0) + cut * (c.speed || 1), 3);
      for (const p of ANIM_PROPS) if (c.kf?.[p]){ const v = kfVal(c, p, cut), ka = c.kf[p].filter(k => k[0] < cut - 1e-3), kb = c.kf[p].filter(k => k[0] > cut + 1e-3).map(k => [round(k[0] - cut, 3), k[1], k[2]]);
        c.kf[p] = [...ka, [round(cut, 3), v, 'ease']]; b.kf[p] = [[0, v, (c.kf[p].find(k => k[0] >= cut) || [])[2] || 'ease'], ...kb]; }
      c.dur = round(cut, 3); c.tout = {k:'none', d:.6}; b.tin = {k:'none', d:.6}; c.fadeOut = 0; b.fadeIn = 0;
      P.layers.splice(P.layers.indexOf(c) + 1, 0, b); newIds.push(b.id);
    }
    ED.select(newIds); ED.commit('Couper');
  },
};

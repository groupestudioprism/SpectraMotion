/* ---------- Scène : la composition à l'écran, sélection, déplacement, redimensionnement, rotation, repères magnétiques ---------- */
const STAGE = {
  zoom:1, auto:true, rs:1, dpr:Math.min(2, window.devicePixelRatio || 1), panX:0, panY:0, drag:null, guides:[], editing:null, grid:false, pq:0,
  get P(){ return ED.P; },
  init(){
    this.wrap = $('#stgWrap'); this.cv = $('#stgCanvas'); this.ctx = this.cv.getContext('2d'); this.ovl = $('#stgOvl'); this.host = $('#smStage');
    new ResizeObserver(() => { if (this.auto) this.fit(); else this.layout(); }).observe(this.host);
    this.host.addEventListener('pointerdown', e => this.down(e));
    this.host.addEventListener('dblclick', e => this.dbl(e));
    this.host.addEventListener('wheel', e => this.wheel(e), {passive:false});
    window.addEventListener('pointermove', e => this.move(e));
    window.addEventListener('pointerup', e => this.up(e));
    BUS.on('frame', () => this.paintNow());
    BUS.on('media', () => this.paint());
    if (document.fonts) document.fonts.addEventListener?.('loadingdone', () => this.paint());
  },
  /* zoom « ajuster » : la composition tient dans la zone disponible */
  fit(){
    const r = this.host.getBoundingClientRect(), pad = innerWidth < 700 ? 16 : 48, pg = $('#smPages'), pb = pg && !pg.hidden ? pg.offsetHeight : 0;
    this.zoom = Math.max(.02, Math.min((r.width - pad * 2) / this.P.w, (r.height - pb - pad * 2) / this.P.h)); this.auto = true; this.panX = 0; this.panY = -pb / 2; this.layout();
  },
  setZoom(z, cx, cy){
    const old = this.zoom; this.zoom = clamp(z, .02, 8); this.auto = false;
    if (cx != null){ const r = this.host.getBoundingClientRect(), ox = cx - r.left - r.width / 2 - this.panX, oy = cy - r.top - r.height / 2 - this.panY; this.panX -= ox * (this.zoom / old - 1); this.panY -= oy * (this.zoom / old - 1); }
    this.layout(); BUS.emit('zoom');
  },
  layout(){
    const P = this.P, w = P.w * this.zoom, h = P.h * this.zoom;
    this.wrap.style.width = w + 'px'; this.wrap.style.height = h + 'px';
    this.wrap.style.transform = `translate(calc(-50% + ${this.panX}px), calc(-50% + ${this.panY}px))`;
    // résolution du canvas : celle de l'écran (plafonnée à la taille réelle de la composition, ×2 au plus)
    const px = Math.min(P.w * 2, Math.max(64, w * this.dpr)), py = px * P.h / P.w;
    if (Math.abs(this.cv.width - px) > 1){ this.cv.width = Math.round(px); this.cv.height = Math.round(py); }
    this.rs = this.cv.width / P.w;
    this.wrap.classList.toggle('transparent', !P.bg);
    this.paint(); BUS.emit('zoom');
  },
  /* dessin regroupé : plusieurs demandes dans la même image n'entraînent qu'un seul rendu */
  paint(){ if (this.pq) return; this.pq = requestAnimationFrame(() => { this.pq = 0; this.paintNow(); }); },
  paintNow(){
    if (this.pq){ cancelAnimationFrame(this.pq); this.pq = 0; }
    if (!this.ctx || !this.P) return;
    try { renderFrame(this.ctx, this.P, PLAY.t, {scale:this.rs, noFx:this.still()}); } catch(e){ console.error('[Spectra Motion] rendu', e); }
    this.overlay(); COMMENTS.pins(); BUS.emit('painted');
  },
  /* Design et Photo montrent le visuel « posé » (effets d'entrée terminés), sauf pendant l'aperçu de l'animation */
  still(){ return !TIMED(this.P.studio) && !PLAY.playing; },
  /* coordonnées : écran → composition */
  toP(e){ const r = this.wrap.getBoundingClientRect(); return {x:(e.clientX - r.left) / this.zoom, y:(e.clientY - r.top) / this.zoom}; },
  /* rectangle affiché d'un calque à l'instant courant (position animée, échelle, rotation) */
  box(L){ const s = layerState(L, PLAY.t, this.P, this.still()), k = (s.sc || 1) * s.k; return {cx:s.x + s.dx + L.w / 2, cy:s.y + s.dy + L.h / 2, w:L.w * k, h:L.h * k, rot:s.rot || 0, s}; },
  hit(p, all = false){
    const ls = drawOrder(this.P).filter(L => visible(L, PLAY.t) && (all || !L.lock)).reverse();
    for (const L of ls){ const b = this.box(L), a = -b.rot * Math.PI / 180, dx = p.x - b.cx, dy = p.y - b.cy, x = dx * Math.cos(a) - dy * Math.sin(a), y = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(x) <= b.w / 2 && Math.abs(y) <= b.h / 2) return L; }
    return null;
  },
  overlay(){
    const sel = ED.selLayers().filter(L => L.t !== 'audio' && visible(L, PLAY.t)), z = this.zoom, ro = ED.readOnly;
    let h = '';
    for (const L of sel){
      const b = this.box(L), w = b.w * z, hh = b.h * z, one = sel.length === 1 && !L.lock && !ro && !PLAY.playing;
      h += `<div class="sel${L.lock ? ' lk' : ''}${ED.cropId === L.id ? ' crop' : ''}" data-id="${L.id}" style="left:${b.cx * z - w / 2}px;top:${b.cy * z - hh / 2}px;width:${w}px;height:${hh}px;transform:rotate(${b.rot}deg)">`
        + (one ? ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].filter(d => !(L.t === 'text' && (d === 'n' || d === 's'))).map(d => `<i class="hd ${d}" data-h="${d}"></i>`).join('') + '<i class="hd rot" data-h="rot" title="Faire pivoter (Maj : par 15°)"></i>' : '')
        + (one && L.t === 'text' ? '' : '') + '</div>';
    }
    const ms = sel.filter(L => !L.lock);
    if (sel.length > 1 && ms.length === sel.length && !ro && !PLAY.playing){ const B = this.selBox(sel); h += `<div class="sel grp" style="left:${B.x * z}px;top:${B.y * z}px;width:${B.w * z}px;height:${B.h * z}px">${['nw', 'ne', 'se', 'sw'].map(d => `<i class="hd ${d}" data-h="m${d}"></i>`).join('')}</div>`; }
    if (this.grid){ const st = this.gridStep() * z; h = `<i class="grid" style="background-size:${st}px ${st}px"></i>` + h; }
    h += this.guides.map(g => g.v ? `<i class="guide v" style="left:${g.v * z}px"></i>` : `<i class="guide h" style="top:${g.h * z}px"></i>`).join('');
    if (this.marq) h += `<i class="marq" style="left:${Math.min(this.marq.x0, this.marq.x1) * z}px;top:${Math.min(this.marq.y0, this.marq.y1) * z}px;width:${Math.abs(this.marq.x1 - this.marq.x0) * z}px;height:${Math.abs(this.marq.y1 - this.marq.y0) * z}px"></i>`;
    if (this.editing) return; // l'éditeur de texte occupe la place
    this.ovl.innerHTML = h;
  },
  gridStep(){ return Math.max(8, Math.round(Math.min(this.P.w, this.P.h) / 24)); },
  /* rectangle englobant (non tourné) d'une sélection */
  selBox(ls){ const bs = ls.map(L => { const b = this.box(L); return {x:b.cx - b.w / 2, y:b.cy - b.h / 2, w:b.w, h:b.h}; }); const x = Math.min(...bs.map(b => b.x)), y = Math.min(...bs.map(b => b.y)); return {x, y, w:Math.max(...bs.map(b => b.x + b.w)) - x, h:Math.max(...bs.map(b => b.y + b.h)) - y}; },
  down(e){
    if (e.button === 1 || (e.button === 0 && (ED.tool === 'hand' || this.spaceDown))){ e.preventDefault(); this.drag = {mode:'pan', sx:e.clientX, sy:e.clientY, px:this.panX, py:this.panY}; this.host.classList.add('panning'); return; }
    if (e.button !== 0 || this.editing) return;
    if (e.target.closest('.stg-tools,.stg-hint')) return;
    const p = this.toP(e), hd = e.target.closest('[data-h]');
    if (COMMENTS.placing && e.button === 0){ e.preventDefault(); COMMENTS.placing = false; $('#app').classList.remove('commenting'); window.SWAsk ? window.SWAsk('Commentaire', 'Votre remarque', '', 'Publier', v => { if (String(v || '').trim()) COMMENTS.add(p.x, p.y, v.trim()); PANEL.render(); }) : COMMENTS.add(p.x, p.y, 'Commentaire'); PANEL.render(); return; }
    if (e.target.closest('[data-cpin]')){ PANEL.show('comments'); return; }
    if (ED.tool === 'draw' && !ED.readOnly){ e.preventDefault(); if (PLAY.playing) PLAY.pause(); this.drag = {mode:'draw', pts:[[p.x, p.y]]}; this.host.setPointerCapture?.(e.pointerId); return; }
    if (hd && !ED.readOnly && hd.dataset.h[0] === 'm' && hd.dataset.h.length === 3){ e.preventDefault(); this.startMulti(hd.dataset.h.slice(1), p); return; }
    if (hd && !ED.readOnly){ const L = ED.sel1(); if (!L) return; e.preventDefault(); this.host.setPointerCapture?.(e.pointerId); this.startXform(L, hd.dataset.h, p, e); return; }
    if (PLAY.playing) PLAY.pause();
    const L = this.hit(p);
    if (!L){ if (!e.shiftKey) ED.select([]); this.marq = {x0:p.x, y0:p.y, x1:p.x, y1:p.y, add:e.shiftKey}; this.drag = {mode:'marq'}; return; }
    const grp = L.g && !e.altKey ? ED.P.layers.filter(x => x.g === L.g && !x.lock).map(x => x.id) : [L.id];
    if (e.shiftKey){ ED.toggleSel(L.id); return; }
    if (!ED.sel.has(L.id)) ED.select(grp);
    if (ED.readOnly) return;
    e.preventDefault();
    const ls = ED.selLayers().filter(x => !x.lock && x.t !== 'audio');
    this.drag = {mode:'move', p0:p, items:ls.map(x => ({L:x, x0:this.posOf(x).x, y0:this.posOf(x).y})), moved:false, alt:e.altKey};
  },
  posOf(L){ const tl = PLAY.t - L.start; return {x:kfVal(L, 'x', tl), y:kfVal(L, 'y', tl)}; },
  /* écrit une propriété animable : image clé si la propriété est animée, valeur fixe sinon */
  setProp(L, p, v){ if (hasKf(L, p)) setKf(L, p, PLAY.t - L.start, v); else L[p] = v; },
  startMulti(h, p){
    const ls = ED.selLayers().filter(L => L.t !== 'audio'), B = this.selBox(ls);
    const ax = h.includes('w') ? B.x + B.w : B.x, ay = h.includes('n') ? B.y + B.h : B.y;
    this.drag = {mode:'msize', h, ax, ay, B, d0:Math.hypot(p.x - ax, p.y - ay) || 1, items:ls.map(L => ({L, x:this.posOf(L).x, y:this.posOf(L).y, w:L.w, h:L.h, fs:L.fs, tsw:L.tsw, sw:L.sw, r:L.r, sh:L.shadow ? {...L.shadow} : null}))};
  },
  startXform(L, h, p, e){
    const b = this.box(L);
    this.drag = {mode:h === 'rot' ? 'rot' : 'size', h, L, p0:p, b0:b, x0:this.posOf(L).x, y0:this.posOf(L).y, w0:L.w, h0:L.h, fs0:L.fs, rot0:b.rot, sc:(b.s.sc || 1) * b.s.k,
      ratio:L.w / L.h, keep:(L.t === 'image' || L.t === 'video') && !e.altKey};
  },
  move(e){
    const d = this.drag; if (!d) return;
    if (d.mode === 'pan'){ this.panX = d.px + e.clientX - d.sx; this.panY = d.py + e.clientY - d.sy; this.auto = false; this.layout(); return; }
    const p = this.toP(e);
    if (d.mode === 'draw'){ const q = d.pts[d.pts.length - 1]; if (Math.hypot(p.x - q[0], p.y - q[1]) * this.zoom < 1.5) return; d.pts.push([p.x, p.y]); this.drawPreview(d.pts); return; }
    if (d.mode === 'msize'){
      const f = Math.max(.05, Math.hypot(p.x - d.ax, p.y - d.ay) / d.d0);
      for (const it of d.items){ const L = it.L; this.setProp(L, 'x', round(d.ax + (it.x - d.ax) * f, 1)); this.setProp(L, 'y', round(d.ay + (it.y - d.ay) * f, 1)); L.w = round(it.w * f, 1); L.h = round(it.h * f, 1);
        if (L.t === 'text'){ L.fs = round(clamp(it.fs * f, 4, 2000), 1); if (it.tsw) L.tsw = round(it.tsw * f, 1); } else if (it.sw && L.t !== 'icon') L.sw = round(it.sw * f, 1); if (it.r) L.r = round(it.r * f, 1);
        if (it.sh){ L.shadow.b = round(it.sh.b * f, 1); L.shadow.x = round(it.sh.x * f, 1); L.shadow.y = round(it.sh.y * f, 1); } }
      this.paint(); BUS.emit('live'); return;
    }
    if (d.mode === 'marq'){ this.marq.x1 = p.x; this.marq.y1 = p.y; this.overlay(); return; }
    if (d.mode === 'move'){
      let dx = p.x - d.p0.x, dy = p.y - d.p0.y; if (!d.moved && Math.hypot(dx, dy) * this.zoom < 3) return; d.moved = true;
      if (e.shiftKey){ if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      // repères magnétiques sur la composition et les autres calques
      this.guides = [];
      if (ED.snap && !e.ctrlKey && d.items.length){
        const it = d.items[0], L = it.L, x = it.x0 + dx, y = it.y0 + dy, th = 6 / this.zoom;
        const others = drawOrder(this.P).filter(o => !d.items.some(i => i.L === o) && visible(o, PLAY.t));
        const vx = [0, this.P.w / 2, this.P.w, ...others.flatMap(o => { const q = this.posOf(o); return [q.x, q.x + o.w / 2, q.x + o.w]; })];
        const hy = [0, this.P.h / 2, this.P.h, ...others.flatMap(o => { const q = this.posOf(o); return [q.y, q.y + o.h / 2, q.y + o.h]; })];
        let bx = null, by = null;
        for (const [off, i] of [[0, 0], [L.w / 2, 1], [L.w, 2]]) for (const v of vx) if (Math.abs(x + off - v) < th && (bx == null || Math.abs(x + off - v) < Math.abs(bx.d))) bx = {d:v - (x + off), v};
        for (const [off, i] of [[0, 0], [L.h / 2, 1], [L.h, 2]]) for (const v of hy) if (Math.abs(y + off - v) < th && (by == null || Math.abs(y + off - v) < Math.abs(by.d))) by = {d:v - (y + off), v};
        if (bx){ dx += bx.d; this.guides.push({v:bx.v}); } if (by){ dy += by.d; this.guides.push({h:by.v}); }
        if (this.grid && !bx){ const g = this.gridStep(), nx = Math.round((it.x0 + dx) / g) * g; if (Math.abs(nx - it.x0 - dx) < th * 1.5) dx = nx - it.x0; }
        if (this.grid && !by){ const g = this.gridStep(), ny = Math.round((it.y0 + dy) / g) * g; if (Math.abs(ny - it.y0 - dy) < th * 1.5) dy = ny - it.y0; }
      }
      for (const it of d.items){ this.setProp(it.L, 'x', round(it.x0 + dx, 1)); this.setProp(it.L, 'y', round(it.y0 + dy, 1)); }
      this.paint(); BUS.emit('live'); return;
    }
    const L = d.L, b = d.b0;
    if (d.mode === 'rot'){
      let a = Math.atan2(p.y - b.cy, p.x - b.cx) * 180 / Math.PI + 90; if (e.shiftKey) a = Math.round(a / 15) * 15; else { const sn = Math.round(a / 90) * 90; if (Math.abs(a - sn) < 3) a = sn; }
      a = ((a + 540) % 360) - 180; this.setProp(L, 'rot', round(a, 1)); this.paint(); BUS.emit('live'); return;
    }
    // redimensionnement dans le repère du calque (tient compte de la rotation et de l'échelle animée)
    const r = d.rot0 * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r), k = d.sc || 1;
    const vx = (p.x - d.p0.x) * cos + (p.y - d.p0.y) * sin, vy = -(p.x - d.p0.x) * sin + (p.y - d.p0.y) * cos;
    const hx = d.h.includes('e') ? 1 : d.h.includes('w') ? -1 : 0, hy = d.h.includes('s') ? 1 : d.h.includes('n') ? -1 : 0;
    let w = d.w0 + hx * vx / k, h = d.h0 + hy * vy / k;
    const corner = hx && hy;
    if (L.t === 'text' && corner){ // coin d'un texte : agrandit le texte (taille de police) en gardant la forme
      const f = Math.max(.1, w / d.w0); L.fs = round(clamp(d.fs0 * f, 4, 2000), 1); w = d.w0 * f; h = d.h0 * f;
    } else if ((d.keep !== e.shiftKey) && corner){ const f = Math.max(Math.abs(w / d.w0), Math.abs(h / d.h0)); w = d.w0 * f; h = d.h0 * f; }
    else if (e.shiftKey && !corner){ /* bord + Maj : étirement symétrique */ }
    w = Math.max(4, w); h = Math.max(4, h);
    // le côté opposé reste en place
    const dw = (w - d.w0) * k, dh = (h - d.h0) * k;
    const ox = hx ? hx * dw / 2 : 0, oy = hy ? hy * dh / 2 : 0;
    const cx = b.cx + ox * cos - oy * sin, cy = b.cy + ox * sin + oy * cos;
    L.w = round(w, 1); L.h = round(h, 1);
    if (L.t === 'text'){ const mh = measureText(L).h; if (!corner || true) L.h = Math.max(mh, L.t === 'text' ? mh : L.h); }
    const nx = cx - L.w / 2 - (b.s.dx || 0), ny = cy - L.h / 2 - (b.s.dy || 0);
    this.setProp(L, 'x', round(nx, 1)); this.setProp(L, 'y', round(ny, 1));
    this.paint(); BUS.emit('live');
  },
  up(e){
    const d = this.drag; if (!d) return; this.drag = null; this.host.classList.remove('panning');
    if (d.mode === 'draw'){ this.endDraw(d.pts); return; }
    if (d.mode === 'marq'){
      const m = this.marq; this.marq = null;
      if (Math.abs(m.x1 - m.x0) * this.zoom > 4){ const x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1), y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1);
        const ids = drawOrder(this.P).filter(L => visible(L, PLAY.t) && !L.lock).filter(L => { const b = this.box(L); return b.cx > x0 && b.cx < x1 && b.cy > y0 && b.cy < y1; }).map(L => L.id);
        ED.select(m.add ? [...ED.sel, ...ids] : ids); }
      this.overlay(); return;
    }
    this.guides = [];
    if (d.mode === 'move' && !d.moved){ this.overlay(); return; }
    if (d.mode !== 'pan') ED.commit(d.mode === 'move' ? 'Déplacer' : d.mode === 'rot' ? 'Rotation' : 'Redimensionner');
    if (d.mode === 'move' && d.items.length === 1 && (d.items[0].L.t === 'image') && !d.alt) ED.dropOnSlot?.(d.items[0].L);
    this.overlay();
  },
  wheel(e){
    if (e.ctrlKey || e.metaKey){ e.preventDefault(); const f = Math.exp(-e.deltaY * .0016); this.setZoom(this.zoom * f, e.clientX, e.clientY); }
    else if (!this.auto || e.shiftKey){ e.preventDefault(); this.panX -= e.shiftKey ? e.deltaY : e.deltaX; this.panY -= e.shiftKey ? 0 : e.deltaY; this.auto = false; this.layout(); }
  },
  dbl(e){
    if (ED.readOnly) return; const L = this.hit(this.toP(e)); if (!L) return;
    if (L.t === 'text') this.editText(L);
    else if ((L.t === 'image' || L.t === 'video') && ED.studio === 'photo') PANEL.show('adjust');
    else if (L.g && !e.altKey) ED.select([L.id]); // double-clic dans un groupe : sélectionne l'élément seul
  },
  /* outil Dessin : aperçu direct sur la scène, puis calque « dessin » */
  drawPreview(pts){
    const c = this.ctx, k = this.rs, pen = ED.pen; this.paintNow(); c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.strokeStyle = pen.col; c.lineWidth = pen.sw; c.lineCap = c.lineJoin = 'round'; if (pen.hl) c.globalAlpha = .45;
    c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.restore();
  },
  endDraw(pts){
    if (pts.length < 2){ this.paint(); return; }
    const sp = simplify(pts, .8 / this.zoom), pen = ED.pen, pad = pen.sw / 2 + 1;
    const x0 = Math.min(...sp.map(q => q[0])) - pad, y0 = Math.min(...sp.map(q => q[1])) - pad, w = Math.max(4, Math.max(...sp.map(q => q[0])) + pad - x0), h = Math.max(4, Math.max(...sp.map(q => q[1])) + pad - y0);
    const L = mkDraw(this.P, sp.slice(0, 3000).map(q => [round((q[0] - x0) / w, 4), round((q[1] - y0) / h, 4)]), {x:round(x0, 1), y:round(y0, 1), w:round(w, 1), h:round(h, 1), col:pen.col, sw:pen.sw, hl:!!pen.hl, ...ED.timing(5), track:topTrack(this.P)});
    ED.addLayer(L, {label:'Dessiner', select:false});
  },
  /* édition du texte sur place */
  editText(L){
    if (PLAY.playing) PLAY.pause();
    ED.select([L.id]); this.editing = L.id;
    const b = this.box(L), z = this.zoom, ta = document.createElement('textarea');
    ta.className = 'stg-edit'; ta.value = L.txt || ''; ta.spellcheck = true; ta.setAttribute('aria-label', 'Texte du calque');
    Object.assign(ta.style, {left:(b.cx * z - b.w * z / 2) + 'px', top:(b.cy * z - b.h * z / 2) + 'px', width:b.w * z + 'px', minHeight:b.h * z + 'px', transform:`rotate(${b.rot}deg)`,
      font:textFont(L, z * ((b.s.sc || 1) * b.s.k)), lineHeight:L.lh, color:L.col, textAlign:{l:'left', c:'center', r:'right'}[L.align] || 'center', textTransform:L.up ? 'uppercase' : 'none', letterSpacing:(L.ls || 0) + 'em'});
    this.ovl.innerHTML = ''; this.ovl.appendChild(ta);
    const skip = new Set([L.id]); renderFrame(this.ctx, this.P, PLAY.t, {scale:this.rs, skip, noFx:this.still()});
    const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
    ta.addEventListener('input', fit); requestAnimationFrame(() => { fit(); ta.focus(); ta.select(); });
    const end = save => { if (this.editing !== L.id) return; this.editing = null; if (save && ta.value !== L.txt){ L.txt = ta.value; L.h = Math.max(measureText(L).h, 4); if (!L.name || L.name === 'Texte' || L.name.startsWith('Texte ·')) L.name = 'Texte · ' + ta.value.trim().slice(0, 24); ED.commit('Modifier le texte'); } ta.remove(); this.paint(); BUS.emit('sel'); };
    ta.addEventListener('blur', () => end(true));
    ta.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Escape'){ end(false); } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ta.blur(); } });
  },
};

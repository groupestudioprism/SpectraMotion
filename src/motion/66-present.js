/* ---------- Présenter : les pages en plein écran (flèches, clic, Échap), transitions, notes, minuteur, lecture automatique ----------
   Les animations d'entrée des éléments sont jouées à chaque page ; les liens des éléments sont cliquables. */
const PRESENT = {
  on:false, i:0, t0:0, raf:0, auto:false, notes:false,
  open(){
    const P = ED.P; if (PLAY.playing) PLAY.pause();
    const el = document.createElement('div'); el.className = 'pres'; el.tabIndex = 0;
    el.innerHTML = `<canvas class="pres-cv"></canvas><canvas class="pres-cv old"></canvas><div class="pres-links"></div>
      <div class="pres-bar"><button type="button" data-pa="prev" title="Page précédente (←)">${ico('prev')}</button><span class="pres-n"></span><button type="button" data-pa="next" title="Page suivante (→, Espace)">${ico('next')}</button>
      <button type="button" data-pa="auto" title="Lecture automatique (A)">${ico('play')}</button><button type="button" data-pa="notes" title="Notes (N)">${ico('text')}</button><span class="pres-clock">0:00</span><button type="button" data-pa="close" title="Quitter (Échap)">${ico('close')}</button></div>
      <div class="pres-notes" hidden></div>`;
    document.body.appendChild(el); this.el = el; this.cv = el.querySelector('.pres-cv'); this.old = el.querySelector('.pres-cv.old'); this.on = true; this.i = P.pg || 0; this.start = performance.now(); this.auto = false;
    el.addEventListener('click', e => { const b = e.target.closest('[data-pa]'); if (b) return this.act(b.dataset.pa); const a = e.target.closest('a'); if (a) return; if (!e.target.closest('.pres-bar,.pres-notes')) this.go(this.i + 1); });
    el.addEventListener('keydown', e => this.key(e)); el.addEventListener('mousemove', () => { el.classList.add('ui'); clearTimeout(this.ht); this.ht = setTimeout(() => el.classList.remove('ui'), 2200); });
    this.ro = new ResizeObserver(() => this.size()); this.ro.observe(el); el.requestFullscreen?.().catch(() => {}); el.focus();
    document.addEventListener('fullscreenchange', this.fsH = () => { if (!document.fullscreenElement && this.on && this.fsWas) this.close(); this.fsWas = !!document.fullscreenElement; });
    this.size(); this.show(this.i, true); this.loop();
  },
  size(){ if (!this.el) return; const r = this.el.getBoundingClientRect(), P = ED.P, k = Math.min(r.width / P.w, r.height / P.h), dpr = Math.min(2, devicePixelRatio || 1);
    for (const c of [this.cv, this.old]){ c.width = Math.round(P.w * k * dpr); c.height = Math.round(P.h * k * dpr); c.style.width = P.w * k + 'px'; c.style.height = P.h * k + 'px'; }
    this.k = k; this.dpr = dpr; this.links(); },
  view(){ return pageView(ED.P, this.i); },
  show(i, first){
    const P = ED.P, n = pageCount(P); i = clamp(i, 0, n - 1); if (!first && i === this.i) return;
    // l'ancienne page reste dessous pendant la transition
    const g = this.old.getContext('2d'); g.clearRect(0, 0, this.old.width, this.old.height); if (!first) g.drawImage(this.cv, 0, 0);
    this.dir = i >= this.i ? 1 : -1; this.i = i; this.pt = performance.now(); this.el.querySelector('.pres-n').textContent = `${i + 1} / ${n}`;
    const V = this.view(); MEDIA.loadAll(V); fontsReady(V);
    const nt = this.el.querySelector('.pres-notes'); const notes = i === (P.pg || 0) ? P.notes : P.pages?.[i]?.notes; nt.textContent = notes || 'Pas de notes pour cette page.'; nt.hidden = !this.notes;
    this.links();
  },
  links(){
    if (!this.el) return; const V = this.view(), k = this.k || 1;
    this.el.querySelector('.pres-links').innerHTML = V.layers.filter(l => l.href && l.vis !== false).map(l => `<a href="${escH(l.href)}" target="_blank" rel="noopener" style="left:${l.x * k}px;top:${l.y * k}px;width:${l.w * k}px;height:${l.h * k}px" title="${escH(l.href)}"></a>`).join('');
    const r = this.cv.getBoundingClientRect(), box = this.el.querySelector('.pres-links'); box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
  },
  loop(){
    if (!this.on) return; const V = this.view(), t = (performance.now() - this.pt) / 1000, dur = ED.P.pdur || 6, tr = ED.P.ptr || 'fade', p = clamp(t / .5, 0, 1);
    const ctx = this.cv.getContext('2d'), s = this.k * this.dpr; ctx.save(); ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    ctx.fillStyle = V.bg || '#FFFFFF'; ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    try { renderFrame(ctx, V, Math.min(t, Math.max(.01, V.dur - .01)), {scale:s, noClear:true}); } catch(e){ console.warn(e); }
    ctx.restore();
    // transition : l'ancienne image s'efface, glisse, rétrécit ou se découvre
    const o = this.old; o.style.opacity = tr === 'none' || p >= 1 ? 0 : tr === 'fade' || tr === 'zoom' ? 1 - p : 1;
    o.style.transform = tr === 'slide' ? `translateX(${-this.dir * p * 100}%)` : tr === 'zoom' ? `scale(${1 + p * .15})` : 'none';
    o.style.clipPath = tr === 'wipe' ? `inset(0 0 0 ${p * 100}%)` : 'none';
    const el = (performance.now() - this.start) / 1000; this.el.querySelector('.pres-clock').textContent = fmtT(el, false);
    if (this.auto && t > dur){ if (this.i < pageCount(ED.P) - 1) this.show(this.i + 1); else this.auto = false; }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  go(i){ if (i >= pageCount(ED.P)) return; if (i < 0) return; this.show(i); },
  act(k){
    if (k === 'next') this.go(this.i + 1); if (k === 'prev') this.go(this.i - 1); if (k === 'close') this.close();
    if (k === 'auto'){ this.auto = !this.auto; this.pt = performance.now(); toast(this.auto ? `Lecture automatique : ${ED.P.pdur || 6} s par page` : 'Lecture automatique arrêtée', 1500); }
    if (k === 'notes'){ this.notes = !this.notes; this.el.querySelector('.pres-notes').hidden = !this.notes; }
  },
  key(e){
    const k = e.key; e.stopPropagation();
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)){ e.preventDefault(); this.go(this.i + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)){ e.preventDefault(); this.go(this.i - 1); }
    else if (k === 'Home') this.go(0); else if (k === 'End') this.go(pageCount(ED.P) - 1);
    else if (k === 'Escape') this.close(); else if (k === 'a' || k === 'A') this.act('auto'); else if (k === 'n' || k === 'N') this.act('notes');
    else if (/^[1-9]$/.test(k)) this.go(+k - 1);
  },
  close(){ if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.ro?.disconnect(); document.removeEventListener('fullscreenchange', this.fsH); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); this.el.remove(); this.el = null; if (this.i !== (ED.P.pg || 0)) PAGES.go(this.i); },
};

/* ---------- Commentaires : épinglés sur la page, avec réponses ; enregistrés dans le projet (visibles par les personnes avec qui il est partagé) ---------- */
const COMMENTS = {
  placing:false,
  me(){ const u = window.SWUser?.() || {}; return {by:u.name || 'Moi', uid:u.uid || ''}; },
  list(P, all){ const pid = pageId(P); return (P.comments || []).filter(c => all || c.pg === pid); },
  add(x, y, t){ const P = ED.P; (P.comments ||= []).push({id:uid('c'), pg:pageId(P), x:round(x, 1), y:round(y, 1), ...this.me(), t:String(t).slice(0, 2000), ts:Date.now(), done:false, re:[]}); ED.commit('Commenter'); this.pins(); },
  reply(id, t){ const c = ED.P.comments?.find(x => x.id === id); if (!c) return; c.re.push({...this.me(), t:String(t).slice(0, 2000), ts:Date.now()}); ED.commit('Répondre'); },
  toggle(id){ const c = ED.P.comments?.find(x => x.id === id); if (!c) return; c.done = !c.done; ED.commit(c.done ? 'Commentaire résolu' : 'Commentaire rouvert'); this.pins(); },
  del(id){ ED.P.comments = (ED.P.comments || []).filter(x => x.id !== id); ED.commit('Supprimer le commentaire'); this.pins(); },
  /* épingles sur la scène */
  pins(){
    const box = $('#stgPins'); if (!box) return; const z = STAGE.zoom, show = PANEL.cur === 'comments' || this.placing;
    box.innerHTML = show ? this.list(ED.P).filter(c => !c.done).map((c, i) => `<button type="button" class="pin" data-cpin="${c.id}" style="left:${c.x * z}px;top:${c.y * z}px" title="${escH(c.by)} : ${escH(c.t.slice(0, 80))}">${i + 1}</button>`).join('') : '';
  },
};

/* ---------- Versions : instantanés du projet gardés sur cet appareil (IndexedDB), à restaurer ---------- */
const VERSIONS = {
  key(){ return 'versions:' + (ED.docId || 'local'); },
  async all(){ try { return (await IDB.get(this.key())) || []; } catch(e){ return []; } },
  async save(name, auto){
    const list = await this.all(), data = JSON.stringify(ED.P); if (auto && list[0]?.data === data) return;
    list.unshift({id:uid('v'), name:name || (auto ? 'Enregistrement automatique' : 'Version'), ts:Date.now(), data, auto:!!auto, thumb:thumbOf(ED.P, 0, 160, .55)});
    const keep = [...list.filter(v => !v.auto).slice(0, 30), ...list.filter(v => v.auto).slice(0, 15)].sort((a, b) => b.ts - a.ts);
    try { await IDB.put(this.key(), keep); } catch(e){ toast('Version non enregistrée (stockage de l\'appareil plein ?)'); }
  },
  async restore(id){
    const v = (await this.all()).find(x => x.id === id); if (!v) return;
    await this.save('Avant restauration', false);
    const P = cleanProject(v.data); P.media = {...P.media, ...ED.P.media}; ED.P = P; ED.sel = new Set(); STAGE.fit(); ED.applyStudio(); ED.commit('Restaurer « ' + v.name + ' »'); PAGES.render(); toast('Version restaurée (Ctrl + Z pour revenir)');
  },
  start(){ setInterval(() => { if (!ED.readOnly && HIST.past.length && document.visibilityState === 'visible') this.save('', true); }, 5 * 60 * 1000); },
};

/* ---------- Rechercher et remplacer (toutes les pages, textes, tableaux, graphiques) ---------- */
function findReplace(q, r, opt = {}){
  if (!q) return 0; let n = 0; const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), opt.case ? 'g' : 'gi');
  const rep = s => { const m = s.match(re); if (!m) return s; n += m.length; return s.replace(re, r); };
  for (const L of allLayers(ED.P)){
    if (L.t === 'text'){ const t = rep(L.txt); if (t !== L.txt){ L.txt = t; L.h = Math.max(measureText(L).h, 4); } }
    if (L.t === 'table') L.rows = L.rows.map(row => row.map(rep)); if (L.t === 'chart') L.data.forEach(d => d[0] = rep(d[0])); if (L.t === 'qr') L.txt = rep(L.txt);
  }
  if (n) ED.commit('Remplacer'); return n;
}
function countMatches(q){ if (!q) return 0; const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); let n = 0; for (const L of allLayers(ED.P)){ const s = L.t === 'text' ? L.txt : L.t === 'table' ? L.rows.flat().join('\n') : L.t === 'chart' ? L.data.map(d => d[0]).join('\n') : ''; n += (s.match(re) || []).length; } return n; }

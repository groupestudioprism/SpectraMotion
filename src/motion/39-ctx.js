/* ---------- Clic droit : menus contextuels dans tout le site ----------
   CTX.open(x, y, items) affiche un menu au pointeur (sous-menus, clavier, fermeture au clic extérieur ou Échap).
   Chaque zone de l'interface déclare ses actions avec CTX.zone(sélecteur, fonction) ; la première zone qui répond l'emporte.
   Les champs de saisie gardent le menu natif du navigateur (copier, coller, correcteur orthographique). */
const CTX = {
  zones:[], stack:[], res:null,
  zone(sel, fn, first){ (first ? this.zones.unshift : this.zones.push).call(this.zones, {sel, fn}); },
  init(){
    if (this.ready) return; this.ready = true;
    document.addEventListener('contextmenu', e => this.onCtx(e));
    document.addEventListener('pointerdown', e => { if (this.stack.length && !e.target.closest('.ctx')) this.close(); }, true);
    window.addEventListener('blur', () => this.close());
    window.addEventListener('resize', () => this.close());
    document.addEventListener('wheel', e => { if (this.stack.length && !e.target.closest('.ctx')) this.close(); }, {passive:true, capture:true});
    window.addEventListener('keydown', e => this.key(e), true); // avant les autres écouteurs du clavier (écran de compte, éditeur)
    // appui long sur écran tactile = clic droit
    let lp = null;
    document.addEventListener('touchstart', e => { if (e.touches.length !== 1) return; const t = e.touches[0]; clearTimeout(lp?.t); lp = {x:t.clientX, y:t.clientY, el:e.target, t:setTimeout(() => { lp.fired = true; this.onCtx({clientX:lp.x, clientY:lp.y, target:lp.el, preventDefault(){}, stopPropagation(){}, touch:true}); }, 560)}; }, {passive:true});
    document.addEventListener('touchmove', e => { if (lp && Math.hypot(e.touches[0].clientX - lp.x, e.touches[0].clientY - lp.y) > 10) clearTimeout(lp.t); }, {passive:true});
    document.addEventListener('touchend', e => { if (!lp) return; clearTimeout(lp.t); if (lp.fired) e.preventDefault(); lp = null; });
  },
  native(t){ return !!t.closest?.('input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=color]):not([type=button]),textarea,[contenteditable=""],[contenteditable="true"],.ctx-native'); },
  onCtx(e){
    const t = e.target; if (!t || !t.closest) return;
    if (t.closest('.ctx')){ e.preventDefault(); return; }
    if (this.native(t)) return; // menu du navigateur dans les champs de texte
    let items = null;
    for (const z of this.zones){ const el = t.closest(z.sel); if (!el) continue; try { items = z.fn(e, el); } catch(err){ console.error('[Spectra Motion] menu', err); } if (items) break; }
    if (!items) items = this.generic(e);
    if (Array.isArray(items) && !items.length){ e.preventDefault(); return; } // la zone a ouvert son propre menu
    if (!items) return;
    e.preventDefault();
    this.open(e.clientX, e.clientY, items);
  },
  /* menu de secours (partout ailleurs) : texte sélectionné, navigation, affichage */
  generic(){
    const s = String(window.getSelection?.() || '').trim(), out = [];
    if (s) out.push({t:'Copier', s:'Ctrl + C', run:() => navigator.clipboard?.writeText(s).then(() => toast('Texte copié', 1200))}, {t:`Rechercher « ${s.length > 24 ? s.slice(0, 24) + '…' : s} » sur le web`, run:() => window.open('https://www.qwant.com/?q=' + encodeURIComponent(s), '_blank', 'noopener')}, '-');
    out.push({t:'Recharger la page', s:'F5', run:() => location.reload()},
      {t:document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran', s:'F11', run:() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => toast('Plein écran refusé par le navigateur.'))},
      {t:'Copier le lien de la page', run:() => navigator.clipboard?.writeText(location.href.split('#')[0]).then(() => toast('Lien copié', 1200))});
    return out;
  },
  /* ouvre un menu ; résout avec la clé choisie (ou null) */
  open(x, y, items, o = {}){
    this.close(); this.prevFocus = document.activeElement;
    return new Promise(res => { this.res = res; this.panel(items, x, y, 0, o.title); });
  },
  /* adaptateur pour les menus existants (bouton ⋮) : mêmes entrées {k, t, s, off, danger} */
  pick(x, y, items){ return this.open(x, y, items.filter(Boolean)); },
  panel(items, x, y, depth, title, from){
    if (!depth) this.t0 = performance.now();
    while (this.stack.length > depth) this.stack.pop().el.remove();
    const el = document.createElement('div'); el.className = 'ctx'; el.setAttribute('role', 'menu'); el.tabIndex = -1;
    const list = items.filter(Boolean).filter((it, i, a) => it !== '-' || (i > 0 && a[i - 1] !== '-' && i < a.length - 1));
    el.innerHTML = (title ? `<div class="ctx-t">${escH(title)}</div>` : '') + list.map((it, i) => it === '-' ? '<hr>' : it.h ? `<div class="ctx-h">${escH(it.h)}</div>`
      : `<button type="button" role="menuitem${it.on != null ? 'checkbox' : ''}" data-ci="${i}" class="${it.danger ? 'danger' : ''}${it.sub ? ' has' : ''}"${it.off ? ' disabled aria-disabled="true"' : ''}${it.on != null ? ` aria-checked="${!!it.on}"` : ''}${it.sub ? ' aria-haspopup="menu"' : ''}>`
        + `<i class="ctx-c">${it.sw ? `<em class="${it.on ? 'on' : ''}" style="background:${escH(it.sw)}"></em>` : it.on ? '✓' : ''}</i><span>${escH(it.t)}</span>${it.s ? `<kbd>${escH(it.s)}</kbd>` : ''}${it.sub ? '<b class="ctx-ar">›</b>' : ''}</button>`).join('');
    document.body.appendChild(el);
    const W = el.offsetWidth, H = el.offsetHeight, vw = innerWidth, vh = innerHeight;
    let L = x, T = y;
    if (from){ const r = from.getBoundingClientRect(); L = r.right - 4; T = r.top - 6; if (L + W > vw - 8) L = Math.max(8, r.left - W + 4); }
    else if (L + W > vw - 8) L = Math.max(8, x - W);
    if (T + H > vh - 8) T = Math.max(8, vh - H - 8);
    el.style.left = Math.round(L) + 'px'; el.style.top = Math.round(T) + 'px';
    const entry = {el, items:list, depth}; this.stack.push(entry);
    el.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if (!b || b.disabled) return; this.choose(entry, +b.dataset.ci, b); });
    el.addEventListener('pointerover', e => { const b = e.target.closest('[data-ci]'); if (!b || e.pointerType === 'touch' || performance.now() - this.t0 < 120) return; b.focus({preventScroll:true}); clearTimeout(this.ht);
      const it = list[+b.dataset.ci]; this.ht = setTimeout(() => { if (it.sub && !b.disabled) this.panel(it.sub, 0, 0, depth + 1, '', b); else while (this.stack.length > depth + 1) this.stack.pop().el.remove(); }, it.sub ? 120 : 220); });
    requestAnimationFrame(() => (from ? el.querySelector('[data-ci]:not([disabled])') : el).focus({preventScroll:true}));
    return entry;
  },
  choose(entry, i, b){
    const it = entry.items[i]; if (!it || it.off) return;
    if (it.sub){ const e2 = this.panel(it.sub, 0, 0, entry.depth + 1, '', b); e2.el.querySelector('[data-ci]:not([disabled])')?.focus(); return; }
    const res = this.res; this.close(true);
    try { const r = it.run?.(); if (r?.catch) r.catch(err => { console.error(err); toast(err?.message || 'Action impossible.'); }); } catch(err){ console.error(err); toast(err?.message || 'Action impossible.'); }
    res?.(it.k ?? null);
  },
  close(chosen){
    if (!this.stack.length) return; clearTimeout(this.ht);
    while (this.stack.length) this.stack.pop().el.remove();
    if (!chosen){ const r = this.res; this.res = null; r?.(null); } else this.res = null;
    try { this.prevFocus?.focus?.({preventScroll:true}); } catch(e){}
  },
  key(e){
    if (!this.stack.length) return;
    const top = this.stack[this.stack.length - 1], bs = [...top.el.querySelectorAll('[data-ci]:not([disabled])')], i = bs.indexOf(document.activeElement);
    const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (e.key === 'Escape'){ stop(); if (this.stack.length > 1){ this.stack.pop().el.remove(); this.stack[this.stack.length - 1].el.querySelector(':focus,[data-ci]')?.focus(); } else this.close(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ stop(); if (!bs.length) return; const n = e.key === 'ArrowDown' ? (i + 1) % bs.length : (i - 1 + bs.length) % bs.length; bs[n].focus(); return; }
    if (e.key === 'Home' || e.key === 'End'){ stop(); bs[e.key === 'Home' ? 0 : bs.length - 1]?.focus(); return; }
    if (e.key === 'ArrowRight'){ stop(); const b = document.activeElement; if (b?.classList.contains('has')) this.choose(top, +b.dataset.ci, b); return; }
    if (e.key === 'ArrowLeft'){ stop(); if (this.stack.length > 1){ const prev = this.stack[this.stack.length - 2]; this.stack.pop().el.remove(); prev.el.querySelector('[data-ci].has:focus,[data-ci]')?.focus(); } return; }
    if (e.key === 'Enter' || e.key === ' '){ stop(); const b = document.activeElement; if (b?.dataset.ci != null && !b.disabled) this.choose(top, +b.dataset.ci, b); return; }
    if (e.key === 'Tab'){ stop(); return; }
    if (e.key.length === 1 && /\S/.test(e.key)){ // première lettre
      const k = e.key.toLowerCase(), from = Math.max(0, i + 1), hit = [...bs.slice(from), ...bs.slice(0, from)].find(b => b.querySelector('span')?.textContent.trim().toLowerCase().startsWith(k)); if (hit){ stop(); hit.focus(); }
    }
  },
};
window.SMCtx = CTX;

/* ---------- actions supplémentaires de l'éditeur, appelées par les menus ---------- */
const EDX = {
  lockToggle(ls){ const on = !ls.every(l => l.lock); ls.forEach(l => l.lock = on); ED.commit(on ? 'Verrouiller' : 'Déverrouiller'); BUS.emit('sel'); },
  hideToggle(ls){ const hide = ls.some(l => l.vis !== false); ls.forEach(l => l.vis = !hide); ED.commit(hide ? 'Masquer' : 'Afficher'); },
  /* tout devant / tout derrière */
  orderMax(dir){
    const P = ED.P, ls = ED.selLayers().filter(l => l.t !== 'audio'); if (!ls.length) return;
    if (dir > 0){ for (const L of ls){ L.track = topTrack(P); } }
    else { const ids = new Set(ls.map(l => l.id)); P.layers.forEach(l => { if (l.t !== 'audio' && !ids.has(l.id)) l.track += ls.length; }); ls.forEach((L, i) => L.track = i); }
    ED.commit(dir > 0 ? 'Mettre au premier plan' : 'Mettre à l\'arrière-plan');
  },
  /* remplace le fichier d'une image / vidéo / son en gardant position, effets et animations */
  replaceMedia(L){
    const inp = $('#smFile'); inp.accept = L.t === 'audio' ? 'audio/*' : L.t === 'video' ? 'video/*' : 'image/*';
    inp.onchange = async () => { const f = inp.files[0]; inp.value = ''; if (!f) return;
      try { const m = await MEDIA.add(f); if (m.kind !== L.t && !(L.t === 'mock' && m.kind === 'image')) return toast('Choisissez un fichier du même type.');
        ED.P.media[m.id] = m; L.media = m.id; if (L.t !== 'mock') L.crop = null; if (m.dur && L.t !== 'image') L.dur = Math.min(L.dur, m.dur);
        PIX.cache.clear(); ED.commit('Remplacer le média'); ED.uploadPending(); toast('Média remplacé'); } catch(e){ toast(e.message || 'Import impossible', 5000); } };
    inp.click();
  },
  /* majuscules, minuscules, première lettre */
  textCase(ls, mode){
    const f = {up:s => s.toLocaleUpperCase('fr-FR'), low:s => s.toLocaleLowerCase('fr-FR'), title:s => s.toLocaleLowerCase('fr-FR').replace(/(^|[\s\-'’(«"])(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('fr-FR')), sent:s => s.toLocaleLowerCase('fr-FR').replace(/(^\s*|[.!?…]\s+|\n\s*)(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('fr-FR'))}[mode];
    let n = 0; for (const L of ls) if (L.t === 'text'){ L.txt = f(L.txt); L.up = false; L.h = Math.max(L.h, measureText(L).h); n++; }
    if (n) ED.commit('Casse du texte');
  },
  /* taille de police maximale qui tient dans le cadre actuel */
  fitText(ls){
    for (const L of ls) if (L.t === 'text'){
      let lo = 4, hi = 2000; const H = L.h; for (let i = 0; i < 24; i++){ const m = (lo + hi) / 2; L.fs = m; const r = measureText(L); const longest = Math.max(...r.lines.map(s => { const c = measureText.c; return c.measureText(s).width; })); if (r.h <= H && longest <= L.w + 1) lo = m; else hi = m; }
      L.fs = Math.floor(lo); L.h = Math.max(measureText(L).h, 4);
    }
    ED.commit('Ajuster le texte au cadre');
  },
  /* même largeur / hauteur que le premier élément sélectionné */
  matchSize(ls, k){ const [A, ...rest] = ls; if (!A || !rest.length) return toast('Sélectionnez au moins deux éléments.'); for (const L of rest){ if (k !== 'h') L.w = A.w; if (k !== 'w') L.h = A.h; if (L.t === 'text') L.h = Math.max(L.h, measureText(L).h); } ED.commit('Même taille'); },
  /* centre un élément sur la page, ou l'étire pour la remplir */
  fillPage(L){ STAGE.setProp(L, 'x', 0); STAGE.setProp(L, 'y', 0); L.w = ED.P.w; L.h = ED.P.h; if (L.t === 'image' || L.t === 'video') L.fit = 'cover'; ED.commit('Remplir la page'); },
  /* enregistre un seul élément en PNG transparent */
  async layerPng(L){
    const P = ED.P, b = STAGE.box(L), a = b.rot * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)), bw = b.w * c + b.h * s, bh = b.w * s + b.h * c;
    const x0 = Math.floor(b.cx - bw / 2), y0 = Math.floor(b.cy - bh / 2), k = Math.min(2, 4000 / Math.max(bw, bh, 1));
    await seekVideos(P, PLAY.t);
    const full = document.createElement('canvas'); full.width = Math.round(P.w * k); full.height = Math.round(P.h * k);
    renderFrame(full.getContext('2d'), P, PLAY.t, {scale:k, transparent:true, final:true, noFx:STAGE.still(), skip:new Set(P.layers.filter(l => l.id !== L.id).map(l => l.id))});
    const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(bw * k)); out.height = Math.max(1, Math.round(bh * k));
    out.getContext('2d').drawImage(full, -x0 * k, -y0 * k);
    const blob = await new Promise(r => out.toBlob(r, 'image/png'));
    await IO.save(`${(L.name || 'element').replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60) || 'element'}.png`, blob); toast('Élément enregistré en PNG');
  },
  /* copie l'image d'un élément ou de la page dans le presse-papiers */
  async copyImage(L){
    const P = ED.P; await seekVideos(P, PLAY.t); const cv = document.createElement('canvas'), k = Math.min(1, 2000 / Math.max(P.w, P.h)); cv.width = Math.round(P.w * k); cv.height = Math.round(P.h * k);
    renderFrame(cv.getContext('2d'), P, PLAY.t, {scale:k, final:true, noFx:STAGE.still(), transparent:!!L, skip:L ? new Set(P.layers.filter(l => l.id !== L.id).map(l => l.id)) : null});
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    try { await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]); toast('Image copiée dans le presse-papiers'); } catch(e){ toast('Votre navigateur ne permet pas de copier une image ; utilisez « Enregistrer en PNG ».', 4000); }
  },
  center(ls, ax){ const P = ED.P; for (const L of ls){ if (ax !== 'v') STAGE.setProp(L, 'x', round((P.w - L.w) / 2, 1)); if (ax !== 'h') STAGE.setProp(L, 'y', round((P.h - L.h) / 2, 1)); } ED.commit('Centrer sur la page'); },
  speed(ls, v){ for (const L of ls) if (L.t === 'video' || L.t === 'audio'){ const src = L.dur * (L.speed || 1); L.speed = v; L.dur = round(Math.max(.1, src / v), 3); } ED.commit('Vitesse ×' + String(v).replace('.', ',')); syncDur(ED.P); TL.render(); },
  /* déplace les clips sélectionnés pour qu'ils commencent à la tête de lecture */
  toHead(ls){ for (const L of ls) L.start = round(PLAY.t, 3); ED.commit('Déplacer à la tête de lecture'); syncDur(ED.P); TL.render(); },
  /* coupe ce qui dépasse avant / après la tête de lecture */
  trim(ls, side){ const t = PLAY.t; let n = 0;
    for (const L of ls){ if (t <= L.start + .05 || t >= L.start + L.dur - .05) continue; const cut = t - L.start;
      if (side === 'before'){ if (L.t === 'video' || L.t === 'audio') L.in = round((L.in || 0) + cut * (L.speed || 1), 3); for (const p of ANIM_PROPS) if (L.kf?.[p]){ L.kf[p] = L.kf[p].map(k => [round(k[0] - cut, 3), k[1], k[2]]).filter(k => k[0] >= 0); if (!L.kf[p].length) delete L.kf[p]; } L.start = round(t, 3); L.dur = round(L.dur - cut, 3); }
      else { L.dur = round(cut, 3); for (const p of ANIM_PROPS) if (L.kf?.[p]){ L.kf[p] = L.kf[p].filter(k => k[0] <= L.dur); if (!L.kf[p].length) delete L.kf[p]; } }
      n++; }
    if (!n) return toast('Placez la tête de lecture sur le clip.'); ED.commit(side === 'before' ? 'Couper le début' : 'Couper la fin'); syncDur(ED.P); TL.render(); },
  fade(ls, which, d){ for (const L of ls){ if (L.t === 'audio' || L.t === 'video'){ if (which !== 'out') L.fadeIn = d; if (which !== 'in') L.fadeOut = d; } if (L.t !== 'audio'){ if (which !== 'out') L.tin = {k:d ? 'fade' : 'none', d:d || .6}; if (which !== 'in') L.tout = {k:d ? 'fade' : 'none', d:d || .6}; } } ED.commit(d ? 'Fondu' : 'Retirer les fondus'); TL.render(); },
  audioFx(ls, k, v){ for (const L of ls) if (L.t === 'audio' || L.t === 'video') L[k] = v; ED.commit({rev:'Réverbération', echo:'Écho', comp:'Compresseur', duck:'Baisse automatique', pan:'Panoramique'}[k] || 'Son'); if (PLAY.playing){ PLAY.pause(); PLAY.play(); } INSP.render?.(); },
  aspect(L, ar){ const c = L.w * L.h; L.w = Math.round(Math.sqrt(c * ar)); L.h = Math.round(L.w / ar); if (L.t === 'image' || L.t === 'video') L.fit = 'cover'; ED.commit('Proportions'); },
  pageBg(c){ ED.P.bg = c; ED.commit('Couleur de fond'); },
};

/* ---------- les menus de l'atelier ---------- */
const SPEEDS = [.25, .5, .75, 1, 1.25, 1.5, 2, 3, 4];
function ctxLayerItems(e, L){
  const P = ED.P, ro = ED.readOnly, ls = ED.selLayers(), many = ls.length > 1, vis = ls.filter(l => l.t !== 'audio'), timed = TIMED(ED.studio);
  const media = L.t === 'image' || L.t === 'video', texts = ls.filter(l => l.t === 'text'), avs = ls.filter(l => l.t === 'audio' || l.t === 'video');
  const head = many ? `${ls.length} éléments` : (L.name || VISUAL_NAMES[L.t] || 'Élément');
  if (ro) return [{h:head}, {t:'Copier', s:'Ctrl + C', run:() => ED.copy()}, {t:'Copier l\'image', run:() => EDX.copyImage(many ? null : L)}, {t:'Enregistrer en PNG', run:() => EDX.layerPng(L), off:many}];
  const fx = (map, cur, key) => Object.entries(map).map(([k, n]) => ({t:n, on:cur === k, run:() => { for (const x of vis) x[key] = {k, d:x[key]?.d || .6, ...(k === 'block' ? {c:x[key]?.c || '#7B2FF7'} : {})}; ED.commit(key === 'tin' ? 'Entrée' : 'Sortie'); TL.render(); if (!PLAY.playing){ PLAY.seek(Math.max(0, L.start + (key === 'tout' ? L.dur - (L.tout?.d || .6) - .2 : 0)), false); PLAY.play(); } }}));
  const out = [{h:head},
    {t:'Copier', s:'Ctrl + C', run:() => ED.copy()}, {t:'Coller', s:'Ctrl + V', off:!ED.clip, run:() => ED.paste()}, {t:'Dupliquer', s:'Ctrl + D', run:() => ED.duplicate()}, {t:'Supprimer', s:'Suppr', danger:true, run:() => ED.deleteSel()}, '-',
    {t:'Copier le style', run:() => STYLE.copy(L), off:many}, {t:'Coller le style', off:!STYLE.clip, run:() => STYLE.paste(ls)}, '-'];
  if (L.t === 'text' && !many) out.push({t:'Modifier le texte', s:'Double-clic', run:() => STAGE.editText(L)});
  if (texts.length) out.push({t:'Texte', sub:[
    {t:'MAJUSCULES', run:() => EDX.textCase(texts, 'up')}, {t:'minuscules', run:() => EDX.textCase(texts, 'low')}, {t:'Première Lettre En Capitale', run:() => EDX.textCase(texts, 'title')}, {t:'Comme une phrase', run:() => EDX.textCase(texts, 'sent')}, '-',
    {t:'Ajuster la taille au cadre', run:() => EDX.fitText(texts)}, {t:'Gras', on:texts.every(x => x.fw >= 700), run:() => { const b = !texts.every(x => x.fw >= 700); texts.forEach(x => x.fw = b ? 800 : 400); ED.commit('Gras'); }},
    {t:'Italique', on:texts.every(x => x.it), run:() => { const b = !texts.every(x => x.it); texts.forEach(x => x.it = b); ED.commit('Italique'); }}, {t:'Souligné', on:texts.every(x => x.ul), run:() => { const b = !texts.every(x => x.ul); texts.forEach(x => x.ul = b); ED.commit('Souligné'); }},
    '-', {t:'Aligner à gauche', on:L.align === 'l', run:() => { texts.forEach(x => x.align = 'l'); ED.commit('Alignement'); }}, {t:'Centrer', on:L.align === 'c', run:() => { texts.forEach(x => x.align = 'c'); ED.commit('Alignement'); }}, {t:'Aligner à droite', on:L.align === 'r', run:() => { texts.forEach(x => x.align = 'r'); ED.commit('Alignement'); }},
    '-', {t:'Effet de texte', sub:Object.entries(TFX).map(([k, n]) => ({t:n, on:(L.tfx?.k || 'none') === k, run:() => { texts.forEach(x => x.tfx = k === 'none' ? null : {k, d:x.tfx?.d ?? 50, c:x.tfx?.c || '#FF3F86'}); if (k === 'none') texts.forEach(x => delete x.tfx); ED.commit('Effet de texte'); }}))},
    {t:'Traduire (IA)', off:many, sub:Object.entries(AI_LANGS).map(([c, n]) => ({t:'En ' + n, run:() => AI.text('translate', c)}))},
    {t:'Réécrire (IA)', off:many, sub:AI_TEXT_ACTS.map(a => ({t:a[1], run:() => AI.text(a[0])}))}]});
  if (vis.length) out.push({t:'Disposer', sub:[
    {t:'Premier plan', s:'', run:() => EDX.orderMax(1)}, {t:'Avancer', run:() => ED.zorder(1)}, {t:'Reculer', run:() => ED.zorder(-1)}, {t:'Arrière-plan', run:() => EDX.orderMax(-1)}, '-',
    {h:many ? 'Aligner la sélection' : 'Aligner sur la page'}, {t:'À gauche', run:() => ED.align('l')}, {t:'Au centre (horizontal)', run:() => ED.align('ch')}, {t:'À droite', run:() => ED.align('r')}, {t:'En haut', run:() => ED.align('t')}, {t:'Au milieu (vertical)', run:() => ED.align('cv')}, {t:'En bas', run:() => ED.align('b')},
    {t:'Centrer sur la page', run:() => EDX.center(vis)}, ...(many ? ['-', {t:'Répartir horizontalement', off:vis.length < 3, run:() => ED.align('dh')}, {t:'Répartir verticalement', off:vis.length < 3, run:() => ED.align('dv')}, '-', {t:'Même largeur', run:() => EDX.matchSize(vis, 'w')}, {t:'Même hauteur', run:() => EDX.matchSize(vis, 'h')}, {t:'Même taille', run:() => EDX.matchSize(vis)}] : []),
    '-', {t:'Remplir la page', off:many, run:() => EDX.fillPage(L)}, {t:'Proportions', off:many, sub:[['Carré 1:1', 1], ['Paysage 16:9', 16 / 9], ['Portrait 9:16', 9 / 16], ['Photo 4:3', 4 / 3], ['Portrait 4:5', .8], ['Cinéma 2,39:1', 2.39]].map(([n, r]) => ({t:n, run:() => EDX.aspect(L, r)}))},
    {t:'Pivoter de 90°', run:() => { for (const x of vis){ STAGE.setProp(x, 'rot', ((kfVal(x, 'rot', PLAY.t - x.start) || 0) + 90) % 360); } ED.commit('Rotation'); }}, {t:'Remettre droit', run:() => { for (const x of vis) STAGE.setProp(x, 'rot', 0); ED.commit('Rotation'); }}]});
  if (many) out.push({t:'Grouper', s:'Ctrl + G', run:() => ED.group()});
  if (ls.some(l => l.g)) out.push({t:'Dégrouper', s:'Ctrl + Maj + G', run:() => ED.ungroup()});
  out.push({t:ls.every(l => l.lock) ? 'Déverrouiller' : 'Verrouiller', run:() => EDX.lockToggle(ls)}, {t:ls.some(l => l.vis !== false) ? 'Masquer' : 'Afficher', run:() => EDX.hideToggle(ls)}, '-');
  if (media && !many){
    out.push({t:'Remplacer le fichier…', run:() => EDX.replaceMedia(L)},
      {t:'Retouche', sub:[{t:'Amélioration automatique', run:() => { PANEL.show('adjust'); PANEL.act('enhance'); }}, {t:'Réglages et filtres…', run:() => PANEL.show('adjust')}, '-',
        {t:'Filtre', sub:Object.entries(FILTERS).slice(0, 40).map(([k, f]) => ({t:Array.isArray(f) ? f[0] : f, on:(L.filter || 'none') === k, run:() => { L.filter = k; PIX.cache.clear(); ED.commit('Filtre'); }}))},
        {t:'Effet photo', sub:Object.entries(PFX).map(([k, n]) => ({t:n, on:(L.pfx?.k || 'none') === k, run:() => { if (k === 'none') delete L.pfx; else L.pfx = {k, v:L.pfx?.v ?? 50}; PIX.cache.clear(); ED.commit('Effet photo'); }}))},
        ...(L.t === 'image' ? [{t:'Détourer le sujet (IA)', run:() => PANEL.segRun('cut:auto')}, {t:'Détourer une personne (IA)', run:() => PANEL.segRun('cut:person')}, {t:'Flouter le fond (IA)', run:() => PANEL.segRun('blur:auto')}] : []),
        {t:L.t === 'video' ? 'Fond vert / fond uni : retirer' : 'Retirer un fond uni', run:() => { PANEL.show('adjust'); PANEL.act('bgkAuto'); }},
        {t:'Miroir horizontal', on:!!L.flipX, run:() => { L.flipX = !L.flipX; ED.commit('Miroir'); }}, {t:'Miroir vertical', on:!!L.flipY, run:() => { L.flipY = !L.flipY; ED.commit('Retourner'); }},
        {t:'Recadrer', run:() => { ED.cropId = L.id; PANEL.show('adjust'); STAGE.overlay(); toast('Recadrage : réglez le cadre dans le panneau Retouche.'); }}, '-',
        {t:'Tout réinitialiser', danger:true, run:() => { L.adj = {}; L.filter = 'none'; delete L.duo; delete L.pfx; PIX.cache.clear(); ED.commit('Réinitialiser'); }}]},
      {t:'Appliquer ces réglages à toutes les images', run:() => { let n = 0; for (const x of allLayers(P)) if ((x.t === 'image' || x.t === 'video') && x !== L){ x.filter = L.filter; x.adj = deep(L.adj || {}); if (L.pfx) x.pfx = deep(L.pfx); else delete x.pfx; if (L.duo) x.duo = deep(L.duo); else delete x.duo; n++; } PIX.cache.clear(); ED.commit('Réglages sur toutes les images'); toast(`${n} image${n > 1 ? 's' : ''} modifiée${n > 1 ? 's' : ''}.`); }},
      {t:'Utiliser comme fond', off:L.t !== 'image', run:() => { ED.deleteSel(); ED.mediaAsBg(P.media[L.media]); }});
    out.push('-');
  }
  if (TIMED(ED.studio) && avs.length) out.push(...ctxAvItems(ls, L));
  if (vis.length) out.push({t:'Animer', sub:[
    {t:'Entrée', sub:fx(FX_IN, L.tin?.k || 'none', 'tin')}, {t:'Sortie', sub:fx(FX_OUT, L.tout?.k || 'none', 'tout')},
    {t:'Animation prête', sub:ANIM_PRESETS.map((a, i) => ({t:a.n, off:!!(a.only && a.only !== L.t), run:() => { for (const x of vis) if (!a.only || x.t === a.only){ x.kf ||= {}; a.a(x, P); } ED.commit('Animation : ' + a.n); if (!PLAY.playing){ PLAY.seek(L.start, false); PLAY.play(); } }}))},
    '-', {t:'Copier les images clés', off:many || !Object.keys(L.kf || {}).length, run:() => KF.copy(L)}, {t:'Coller les images clés', off:!KF.clip, run:() => KF.paste(vis)},
    {t:'Inverser l\'animation', off:many || !Object.keys(L.kf || {}).length, run:() => KF.reverse(L)}, {t:'Courbe de toutes les images clés', off:many || !Object.keys(L.kf || {}).length, sub:Object.entries(EASES).map(([k, n]) => ({t:n, run:() => KF.easeAll(L, k)}))},
    {t:'Supprimer les images clés', danger:true, run:() => KF.clear(vis)}, {t:'Retirer les effets d\'entrée et de sortie', run:() => { vis.forEach(x => { x.tin = {k:'none', d:.6}; x.tout = {k:'none', d:.6}; }); ED.commit('Retirer les effets'); }}]});
  if (vis.length && !many) out.push({t:'Lien…', s:L.href ? 'actif' : '', run:() => window.SWAsk?.('Lien', 'Adresse (https://, mailto:, tel: ou #page)', L.href || 'https://', 'Enregistrer', v => { v = String(v || '').trim(); if (!v || v === 'https://'){ delete L.href; ED.commit('Retirer le lien'); return; } if (!hrefOk(v)) return toast('Adresse refusée : utilisez https://, mailto:, tel: ou #2 pour une page.'); L.href = v; ED.commit('Lien'); })});
  if (vis.length && !many) out.push({t:'Commenter ici', run:() => { const b = STAGE.box(L); window.SWAsk?.('Commentaire', 'Votre remarque', '', 'Publier', v => { if (String(v || '').trim()) COMMENTS.add(b.cx, b.cy - b.h / 2, v.trim()); }); }});
  out.push('-', {t:'Copier l\'image', run:() => EDX.copyImage(many ? null : L)}, {t:'Enregistrer en PNG', off:many || L.t === 'audio', run:() => EDX.layerPng(L)}, {t:'Propriétés', run:() => INSP.toggle(true)});
  return out;
}
/* actions des clips son / vidéo (timeline et scène) */
function ctxAvItems(ls, L){
  const avs = ls.filter(l => l.t === 'audio' || l.t === 'video'), A = avs[0] || L, sp = A.speed || 1;
  return [{t:'Son et vitesse', sub:[
    {t:'Vitesse', sub:SPEEDS.map(v => ({t:'×' + String(v).replace('.', ','), on:Math.abs(sp - v) < 1e-3, run:() => EDX.speed(avs, v)}))},
    {t:avs.every(x => x.mute) ? 'Rétablir le son' : 'Couper le son', run:() => { const m = !avs.every(x => x.mute); avs.forEach(x => x.mute = m); ED.commit(m ? 'Couper le son' : 'Rétablir le son'); TL.render(); }},
    {t:'Normaliser le volume', off:avs.length !== 1, run:() => VTOOLS.normalize(A)},
    {t:'Fondu', sub:[{t:'Entrée et sortie 0,5 s', run:() => EDX.fade(avs, 'both', .5)}, {t:'Entrée et sortie 1 s', run:() => EDX.fade(avs, 'both', 1)}, {t:'Entrée 2 s', run:() => EDX.fade(avs, 'in', 2)}, {t:'Sortie 2 s', run:() => EDX.fade(avs, 'out', 2)}, {t:'Sans fondu', run:() => EDX.fade(avs, 'both', 0)}]},
    {t:'Réverbération', sub:[0, 15, 30, 50, 80].map(v => ({t:{0:'Aucune', 15:'Petite pièce', 30:'Salle', 50:'Grande salle', 80:'Cathédrale'}[v], on:(A.rev || 0) === v, run:() => EDX.audioFx(avs, 'rev', v)}))},
    {t:'Écho', sub:[0, 20, 40, 65].map(v => ({t:{0:'Aucun', 20:'Léger', 40:'Moyen', 65:'Fort'}[v], on:(A.echo || 0) === v, run:() => EDX.audioFx(avs, 'echo', v)}))},
    {t:'Compresseur (voix plus présente)', on:!!A.comp, run:() => EDX.audioFx(avs, 'comp', !A.comp)},
    {t:'Baisser sous les autres pistes', on:!!A.duck, run:() => EDX.audioFx(avs, 'duck', !A.duck)},
    {t:'Panoramique', sub:[[-1, 'Tout à gauche'], [-.5, 'À gauche'], [0, 'Centre'], [.5, 'À droite'], [1, 'Tout à droite']].map(([v, n]) => ({t:n, on:(A.pan || 0) === v, run:() => EDX.audioFx(avs, 'pan', v)}))},
    {t:'Égaliseur', sub:[['voice', 'Voix claire'], ['warm', 'Chaud'], ['radio', 'Radio'], ['flat', 'Neutre']].map(([k, n]) => ({t:n, run:() => { avs.forEach(x => Object.assign(x, {voice:{eqLo:-4, eqHi:5}, warm:{eqLo:4, eqHi:-2}, radio:{eqLo:-12, eqHi:-6}, flat:{eqLo:0, eqHi:0}}[k])); ED.commit('Égaliseur'); }}))},
    '-', {t:'Repères sur les temps forts', off:avs.length !== 1, run:() => VTOOLS.beats(A)}, {t:'Sous-titres automatiques (IA)', off:avs.length !== 1, run:() => { ED.select([A.id]); AI.captions(); }}]},
    ...(L.t === 'video' ? [{t:'Vidéo', sub:[{t:'Détacher l\'audio', off:!ED.P.media[L.media]?.hasAudio, run:() => VTOOLS.detach(L)}, {t:'Fondu enchaîné avec le clip précédent', run:() => VTOOLS.crossfade(L)}, {t:'Arrêt sur image', run:() => VTOOLS.freeze(L)}]}] : []),
    '-'];
}
function ctxClipItems(e, el){
  const P = ED.P, id = el.dataset.id, L = P.layers.find(l => l.id === id); if (!L) return null;
  if (!ED.sel.has(id)) ED.select([id]);
  const ls = ED.selLayers(), ro = ED.readOnly; if (ro) return [{h:L.name || 'Clip'}, {t:'Copier', run:() => ED.copy()}];
  const on = PLAY.t > L.start + .05 && PLAY.t < L.start + L.dur - .05;
  return [{h:ls.length > 1 ? `${ls.length} clips` : L.name || 'Clip'},
    {t:'Couper à la tête de lecture', s:'S', off:!on, run:() => TL.split()}, {t:'Supprimer ce qui précède la tête', off:!on, run:() => EDX.trim(ls, 'before')}, {t:'Supprimer ce qui suit la tête', off:!on, run:() => EDX.trim(ls, 'after')}, '-',
    {t:'Copier', s:'Ctrl + C', run:() => ED.copy()}, {t:'Coller à la tête de lecture', s:'Ctrl + V', off:!ED.clip, run:() => ED.paste()}, {t:'Dupliquer', s:'Ctrl + D', run:() => ED.duplicate()},
    {t:'Supprimer', s:'Suppr', danger:true, run:() => ED.deleteSel()}, {t:'Supprimer et rapprocher', s:'Maj + Suppr', danger:true, run:() => VTOOLS.ripple(ls.map(l => l.id))}, '-',
    {t:'Déplacer à la tête de lecture', run:() => EDX.toHead(ls)}, {t:'Caler sur les repères', off:(P.markers || []).length < 2, run:() => VTOOLS.toMarkers(ls.map(l => l.id))},
    {t:'Sélectionner toute la piste', run:() => ED.select(VTOOLS.trackClips(L.t === 'audio', L.track).map(l => l.id))}, {t:'Supprimer les vides de la piste', run:() => VTOOLS.closeGaps(L.t === 'audio', L.track)}, '-',
    ...(L.t === 'audio' || L.t === 'video' ? ctxAvItems(ls, L) : []),
    ...(L.t !== 'audio' ? [{t:'Mise en page vidéo', off:ls.length < 2, sub:[['pip', 'Incrustation (image dans l\'image)'], ['splitV', 'Écran partagé côte à côte'], ['splitH', 'Écran partagé haut / bas'], ['trio', 'Un grand, deux petits'], ['grid', 'Grille de 4']].map(([k, n]) => ({t:n, run:() => VTOOLS.layout(k, ls.map(l => l.id))}))}] : []),
    {t:ls.every(l => l.lock) ? 'Déverrouiller' : 'Verrouiller', run:() => EDX.lockToggle(ls)}, {t:L.t === 'audio' ? (L.mute ? 'Rétablir le son' : 'Couper le son') : (ls.some(l => l.vis !== false) ? 'Masquer' : 'Afficher'), run:() => { if (L.t === 'audio'){ ls.forEach(x => x.mute = !L.mute); ED.commit('Son'); } else EDX.hideToggle(ls); TL.render(); }},
    {t:'Propriétés', run:() => INSP.toggle(true)}];
}
function ctxStageEmpty(e){
  const P = ED.P, ro = ED.readOnly, p = STAGE.toP(e), np = pageCount(P), timed = TIMED(ED.studio);
  const zoom = [{t:'Ajuster à l\'écran', s:'Ctrl + 0', run:() => STAGE.fit()}, {t:'Zoom 50 %', run:() => STAGE.setZoom(.5)}, {t:'Zoom 100 %', run:() => STAGE.setZoom(1)}, {t:'Zoom 200 %', run:() => STAGE.setZoom(2)}];
  if (ro) return [{t:'Affichage', sub:zoom}, {t:'Copier l\'image de la page', run:() => EDX.copyImage(null)}];
  const bgs = ['#FFFFFF', '#F4EFE6', '#16131F', '#7B2FF7', '#14C2EC', '#FF3F86', '#FFC83D', '#45D69A', ...(ED.brand().colors || []).slice(0, 6)];
  return [{t:'Coller', s:'Ctrl + V', off:!ED.clip, run:() => ED.paste()}, {t:'Tout sélectionner', s:'Ctrl + A', run:() => ED.select(P.layers.filter(l => !l.lock && (timed || visible(l, PLAY.t))).map(l => l.id))}, '-',
    {t:'Ajouter', sub:[{t:'Texte', s:'T', run:() => ED.addPresetText({n:'Texte', o:{txt:'Votre texte', fs:.07, fw:700}})}, {t:'Titre', run:() => ED.addPresetText({n:'Titre', o:{txt:'Votre titre', fs:.11, fw:800}})},
      {t:'Rectangle', run:() => ED.addLayer(mkShape(P, 'rect', ED.timing(5)))}, {t:'Cercle', run:() => ED.addLayer(mkShape(P, 'ellipse', ED.timing(5)))}, {t:'Étoile', run:() => ED.addLayer(mkShape(P, 'star', ED.timing(5)))}, {t:'Flèche', run:() => ED.addLayer(mkShape(P, 'arrow', ED.timing(5)))},
      {t:'Tableau', run:() => ED.addLayer(mkTable(P, null, ED.timing(5)), {label:'Ajouter un tableau'})}, {t:'Graphique', run:() => ED.addLayer(mkChart(P, 'col', ED.timing(5)), {label:'Ajouter un graphique'})}, {t:'QR code', run:() => PANEL.act('qr', document.body)},
      {t:'Image, vidéo ou son…', run:() => ED.importPick('')}, {t:'Dessin à main levée', s:'P', run:() => { PANEL.show('draw'); ED.setTool('draw'); }}]},
    {t:'Commenter ici', run:() => window.SWAsk?.('Commentaire', 'Votre remarque', '', 'Publier', v => { if (String(v || '').trim()) COMMENTS.add(p.x, p.y, v.trim()); })}, '-',
    {t:'Couleur de fond', sub:[...bgs.map(c => ({t:c, sw:c, on:P.bg === c, run:() => EDX.pageBg(c)})), {t:'Transparent', on:!P.bg, run:() => EDX.pageBg('')}, {t:'Motifs et dégradés…', run:() => PANEL.show('bg')}]},
    {t:'Format', sub:[...FORMATS.filter(f => ['square', 'portrait', 'story', 'hd', 'a4', 'pres'].includes(f.id)).map(f => ({t:`${f.name} · ${f.w} × ${f.h}`, on:P.w === f.w && P.h === f.h, run:() => ED.setFormat(f)})), {t:'Tous les formats…', run:() => PANEL.show('tpl')}]},
    ...(!timed ? [{t:'Pages', sub:[{t:'Ajouter une page', run:() => PAGES.add(false)}, {t:'Dupliquer la page', run:() => PAGES.add(true)}, {t:'Supprimer la page', danger:true, off:np < 2, run:() => PAGES.del(P.pg || 0)}, '-', {t:'Page précédente', s:'Page préc.', off:(P.pg || 0) === 0, run:() => PAGES.go((P.pg || 0) - 1)}, {t:'Page suivante', s:'Page suiv.', off:(P.pg || 0) >= np - 1, run:() => PAGES.go((P.pg || 0) + 1)}]}] : []),
    {t:'Animer toute la page', run:() => ED.animatePage()}, '-',
    {t:'Affichage', sub:[...zoom, '-', {t:'Grille', on:!!STAGE.grid, run:() => $('#stgGrid').click()}, {t:'Aimantation', on:!!ED.snap, run:() => $('#stgSnap').click()}, {t:'Panneau des propriétés', on:!!INSP.open, run:() => INSP.toggle(!INSP.open)}]},
    {t:'Présenter', s:'Ctrl + Alt + P', run:() => PRESENT.open()}, {t:'Copier l\'image de la page', run:() => EDX.copyImage(null)}, {t:'Exporter…', s:'Ctrl + E', run:() => IO.dialog()},
    '-', {t:'Annuler', s:'Ctrl + Z', off:!HIST.past.length, run:() => ED.undo()}, {t:'Rétablir', s:'Ctrl + Maj + Z', off:!HIST.future.length, run:() => ED.redo()}];
}
function ctxLane(e, row){
  const P = ED.P, ro = ED.readOnly, t = TL.tAt(e), audio = row?.dataset.k === 'a', track = +(row?.dataset.t || 0); if (ro) return null;
  const mi = (P.markers || []).findIndex(m => Math.abs(m.t - t) * TL.pps <= 6), mk = mi >= 0 ? [{h:`Repère · ${fmtT(P.markers[mi].t)}`}, {t:'Supprimer ce repère', danger:true, run:() => TL.delMarker(mi)}, '-'] : [];
  return [...mk, {t:'Placer la tête de lecture ici', run:() => PLAY.seek(t, false)}, {t:'Ajouter un repère ici', s:'M', run:() => TL.addMarker(t)}, '-',
    {t:'Coller ici', off:!ED.clip, run:() => { PLAY.seek(t, false); ED.paste(); }},
    ...(!audio ? [{t:'Ajouter un titre ici', run:() => { PLAY.seek(t, false); ED.addPresetText({n:'Titre', o:{txt:'Titre', fs:.09, fw:800}}); }}] : [{t:'Importer un son ici…', run:() => { PLAY.seek(t, false); ED.importPick('audio', {atHead:true}); }}, {t:'Enregistrer ma voix', run:() => { PLAY.seek(t, false); ED.recordVoice(); }}]),
    {t:'Importer un média ici…', run:() => { PLAY.seek(t, false); ED.importPick('', {atHead:true}); }}, '-',
    {t:'Sélectionner toute la piste', off:!row, run:() => ED.select(VTOOLS.trackClips(audio, track).map(l => l.id))}, {t:'Supprimer les vides de la piste', off:!row, run:() => VTOOLS.closeGaps(audio, track)},
    {t:'Tout sélectionner après ce point', run:() => ED.select(P.layers.filter(l => l.start >= t - 1e-3 && !l.lock).map(l => l.id))}, '-',
    {t:'Ajuster le zoom', run:() => TL.fitAll()}, {t:'Lecture en boucle', on:!!PLAY.loop, run:() => $('#tlLoop').click()}, {t:'Aimantation', on:!!ED.snap, run:() => $('#tlSnap').click()}];
}
function ctxRuler(e){
  const i = TL.markerAt(e), r = TL.ruler.getBoundingClientRect(), t = Math.max(0, (e.clientX - r.left + TL.scroll) / TL.pps), P = ED.P, ro = ED.readOnly;
  if (i >= 0){ const m = P.markers[i]; return [{h:`Repère · ${fmtT(m.t)}`}, {t:'Aller au repère', run:() => PLAY.seek(m.t, false)}, ...(ro ? [] : [{t:'Renommer…', run:() => window.SWAsk?.('Renommer le repère', 'Nom', m.n || '', 'Renommer', v => { m.n = String(v || '').slice(0, 40); ED.commit('Renommer le repère'); TL.render(); })}, {t:'Supprimer le repère', danger:true, run:() => TL.delMarker(i)}])]; }
  return [{t:'Placer la tête de lecture ici', run:() => PLAY.seek(t, false)}, ...(ro ? [] : [{t:'Ajouter un repère ici', s:'M', run:() => TL.addMarker(t)}, {t:'Supprimer tous les repères', danger:true, off:!(P.markers || []).length, run:() => { P.markers = []; ED.commit('Supprimer les repères'); TL.render(); }}]),
    '-', {t:'Repère précédent', s:'[', run:() => TL.jumpMarker(-1)}, {t:'Repère suivant', s:']', run:() => TL.jumpMarker(1)}, {t:'Ajuster le zoom', run:() => TL.fitAll()}];
}
function ctxPage(e, b){
  const i = +(b.dataset.pg ?? b.dataset.pgm), n = pageCount(ED.P); if (ED.readOnly) return [{t:'Aller à la page ' + (i + 1), run:() => PAGES.go(i)}];
  const go = () => { if (i !== (ED.P.pg || 0)) PAGES.go(i); };
  return [{h:`Page ${i + 1}`}, {t:'Ouvrir', run:() => PAGES.go(i)}, {t:'Dupliquer la page', run:() => { go(); PAGES.add(true); }}, {t:'Nouvelle page après', run:() => { go(); PAGES.add(false); }}, '-',
    {t:'Déplacer avant', off:i === 0, run:() => PAGES.move(i, i - 1)}, {t:'Déplacer après', off:i === n - 1, run:() => PAGES.move(i, i + 1)}, {t:'Déplacer au début', off:i === 0, run:() => PAGES.move(i, 0)}, {t:'Déplacer à la fin', off:i === n - 1, run:() => PAGES.move(i, n - 1)}, '-',
    {t:'Supprimer la page', danger:true, off:n < 2, run:() => PAGES.del(i)}];
}
function ctxMedia(e, el){
  const m = ED.P.media[el.dataset.mid]; if (!m) return null; const used = ED.P.layers.some(l => l.media === m.id);
  if (ED.readOnly) return null;
  return [{h:m.name}, {t:'Ajouter au projet', run:() => ED.addMedia(m)}, {t:'Ajouter à la tête de lecture', off:!TIMED(ED.studio), run:() => ED.addMedia(m, true)},
    {t:'Placer dans le cadre sélectionné', off:!(m.kind === 'image' && ED.sel1() && (ED.sel1().slot || ED.sel1().t === 'mock' || ED.sel1().frame)), run:() => ED.fillSlot(ED.sel1(), m)},
    {t:'Remplacer l\'élément sélectionné', off:!(ED.sel1() && ED.sel1().t === m.kind), run:() => { const L = ED.sel1(); L.media = m.id; PIX.cache.clear(); ED.commit('Remplacer le média'); }},
    {t:'Utiliser comme fond', off:m.kind !== 'image', run:() => ED.mediaAsBg(m)}, '-',
    {t:'Relier un fichier…', off:!MEDIA.missing(m), run:() => ED.relink(m)}, {t:'Envoyer dans le cloud', off:!!m.cloud || !window.SMCloudMedia?.ok(), run:async () => { toast('Envoi dans le cloud…'); const ok = await MEDIA.upload(ED.P, m); toast(ok ? 'Média envoyé dans le cloud' : 'Envoi impossible : le média reste sur cet appareil'); if (ok) ED.commit('Média dans le cloud'); }},
    {t:'Télécharger le fichier', off:MEDIA.missing(m), run:async () => { const c = MEDIA.cache[m.id]; if (c?.blob) return IO.save(m.name, c.blob); const el2 = MEDIA.el(m); if (el2?.src) { const r = await fetch(el2.src); return IO.save(m.name, await r.blob()); } toast('Fichier indisponible sur cet appareil.'); }},
    {t:'Infos', run:() => toast(`${m.name} · ${m.kind}${m.w ? ` · ${m.w} × ${m.h}` : ''}${m.dur ? ' · ' + fmtT(m.dur) : ''} · ${fmtBytes(m.size)}${used ? ' · utilisé' : ' · non utilisé'}`, 5000)}, '-',
    {t:'Retirer du projet', s:used ? 'retire aussi ses clips' : '', danger:true, run:() => ED.removeMedia(m)}];
}
function ctxTemplate(e, b){
  const id = b.dataset.tpl; return [{t:'Utiliser ce modèle', run:() => ED.useTemplate(id)}, {t:'Ajouter comme nouvelle page', off:TIMED(ED.studio) || ED.readOnly, run:() => { const P = ED.P, t = SM_TPL.find(x => x.id === id), T = t && tplProject(t); if (!T) return; const tmp = {w:T.w, h:T.h, layers:deep(T.layers), pages:null}; rescale(tmp, {w:P.w, h:P.h, id:P.fmt});
    if (pageCount(P) >= 100) return toast('100 pages au maximum'); pageAdd(P, false); P.layers = tmp.layers.map(l => ({...l, id:uid('l'), start:0, dur:P.dur})); P.bg = T.bg; for (const [k, m] of Object.entries(T.media || {})) P.media[k] ||= m;
    ED.sel = new Set(); STAGE.layout(); ED.commit('Modèle sur une nouvelle page'); PAGES.render(); BUS.emit('sel'); fontsReady(P).then(() => STAGE.paint()); }}];
}
function ctxLayerRow(e, row){
  const L = ED.P.layers.find(l => l.id === row.dataset.lid); if (!L) return null; if (!ED.sel.has(L.id)) ED.select([L.id]);
  const items = ctxLayerItems(e, L); items.splice(1, 0, {t:'Renommer…', off:ED.readOnly, run:() => window.SWAsk?.('Renommer le calque', 'Nom', L.name || '', 'Renommer', v => { L.name = String(v || '').trim().slice(0, 80) || L.name; ED.commit('Renommer le calque'); PANEL.render(); })});
  return items;
}
function ctxEditorChrome(e){
  return [{t:'Annuler', s:'Ctrl + Z', off:!HIST.past.length || ED.readOnly, run:() => ED.undo()}, {t:'Rétablir', s:'Ctrl + Maj + Z', off:!HIST.future.length || ED.readOnly, run:() => ED.redo()}, '-',
    {t:'Studio', sub:STUDIOS.map(s => ({t:s.name, on:ED.studio === s.id, off:ED.readOnly, run:() => ED.setStudio(s.id)}))},
    {t:'Panneau des propriétés', on:!!INSP.open, run:() => INSP.toggle(!INSP.open)}, {t:'Panneau latéral', on:!!PANEL.open, run:() => PANEL.toggle(!PANEL.open)},
    ...(TIMED(ED.studio) ? [{t:'Replier la timeline', on:$('#smTl')?.classList.contains('folded'), run:() => $('#tlFold').click()}] : []), '-',
    {t:'Rechercher et remplacer…', s:'Ctrl + F', run:() => findDlg()}, {t:'Versions…', run:() => versionsDlg()}, {t:'Exporter…', s:'Ctrl + E', run:() => IO.dialog()}, {t:'Présenter', run:() => PRESENT.open()}, '-',
    {t:'Raccourcis clavier', s:'?', run:() => shortcutsDlg()}, {t:'Retour à l\'accueil', run:() => window.SWHome?.show('home')}];
}
/* zones de l'atelier, de la plus précise à la plus large */
function ctxEditorZones(){
  if (ctxEditorZones.done) return; ctxEditorZones.done = true;
  CTX.zone('#app[hidden]', () => null);
  CTX.zone('#smPages [data-pg], #smPages [data-pgm]', (e, b) => ctxPage(e, b));
  CTX.zone('#smPages', () => ED.readOnly ? null : [{t:'Ajouter une page', run:() => PAGES.add(false)}, {t:'Dupliquer la page actuelle', run:() => PAGES.add(true)}]);
  CTX.zone('#smStage .stg-tools, #smStage .stg-hint', e => ctxStageEmpty(e));
  CTX.zone('[data-cpin]', (e, el) => { const c = ED.P.comments?.find(x => x.id === el.dataset.cpin); return c ? [{t:'Ouvrir les commentaires', run:() => PANEL.show('comments')}, {t:c.done ? 'Rouvrir' : 'Marquer comme résolu', run:() => COMMENTS.toggle(c.id)}, {t:'Supprimer', danger:true, off:ED.readOnly, run:() => COMMENTS.del(c.id)}] : null; });
  CTX.zone('#smStage', e => {
    if (STAGE.editing || $('#app').hidden) return null;
    const L = STAGE.hit(STAGE.toP(e), true);
    if (!L) return ctxStageEmpty(e);
    if (!ED.sel.has(L.id)){ const grp = L.g && !e.altKey ? ED.P.layers.filter(x => x.g === L.g).map(x => x.id) : [L.id]; ED.select(grp); }
    return ctxLayerItems(e, L);
  });
  CTX.zone('#tlRuler', e => ctxRuler(e));
  CTX.zone('#tlLanes .clip', (e, el) => ctxClipItems(e, el));
  CTX.zone('#tlLanes [data-kf]', (e, el) => { const c = ED.P.layers.find(l => l.id === el.dataset.id), k = c?.kf?.[el.dataset.kf]?.[+el.dataset.i]; if (!k || ED.readOnly) return null;
    return [{h:'Image clé'}, {t:'Aller à cette image', run:() => PLAY.seek(c.start + k[0], false)}, {t:'Courbe', sub:Object.entries(EASES).map(([x, n]) => ({t:n, on:(k[2] || 'ease') === x, run:() => { k[2] = x; ED.commit('Courbe : ' + n); }}))}, {t:'Supprimer', danger:true, run:() => { c.kf[el.dataset.kf].splice(+el.dataset.i, 1); if (!c.kf[el.dataset.kf].length) delete c.kf[el.dataset.kf]; ED.commit('Supprimer l\'image clé'); }}]; });
  CTX.zone('#tlLanes', e => ctxLane(e, e.target.closest('.tl-row') || [...$$('.tl-row', TL.lanes)].find(r => { const b = r.getBoundingClientRect(); return e.clientY >= b.top && e.clientY < b.bottom; })));
  CTX.zone('#tlHeads .tl-hd[class*=" v"], #tlHeads .tl-hd[class*=" a"]', (e, el) => { const b = el.querySelector('[data-k]'); if (!b || ED.readOnly) return null; const audio = b.dataset.k === 'a', tr = +b.dataset.t;
    return [{h:(audio ? 'A' : 'V') + (tr + 1)}, {t:'Sélectionner toute la piste', run:() => ED.select(VTOOLS.trackClips(audio, tr).map(l => l.id))}, {t:'Supprimer les vides', run:() => VTOOLS.closeGaps(audio, tr)}, {t:audio ? 'Couper / rétablir le son' : 'Masquer / afficher', run:() => b.click()},
      {t:'Supprimer tous les clips de la piste', danger:true, run:() => { const ids = VTOOLS.trackClips(audio, tr).filter(l => !l.lock).map(l => l.id); ED.P.layers = ED.P.layers.filter(l => !ids.includes(l.id)); ED.commit('Vider la piste'); BUS.emit('sel'); }}]; });
  CTX.zone('#smPanel [data-mid]', (e, el) => ctxMedia(e, el));
  CTX.zone('#smPanel [data-tpl]', (e, b) => ctxTemplate(e, b));
  CTX.zone('#smPanel [data-lid]', (e, row) => ctxLayerRow(e, row));
  CTX.zone('#smPanel [data-filter]', (e, b) => { const ls = ED.selLayers().filter(l => l.t === 'image' || l.t === 'video'); if (!ls.length || ED.readOnly) return null; return [{t:'Appliquer à la sélection', run:() => b.click()}, {t:'Appliquer à toutes les images', run:() => { let n = 0; for (const x of allLayers(ED.P)) if (x.t === 'image' || x.t === 'video'){ x.filter = b.dataset.filter; n++; } PIX.cache.clear(); ED.commit('Filtre sur toutes les images'); toast(`${n} image${n > 1 ? 's' : ''} modifiée${n > 1 ? 's' : ''}.`); PANEL.render(); }}]; });
  CTX.zone('#smPanel [data-anim], #smPanel [data-tr], #smPanel [data-icon], #smPanel [data-shape], #smPanel [data-txt], #smPanel [data-chart], #smPanel [data-sticker], #smPanel [data-table], #smPanel [data-mock], #smPanel [data-emoji], #smPanel [data-grid], #smPanel [data-frame], #smPanel [data-line], #smPanel [data-pair]', (e, b) => ED.readOnly ? null : [{t:'Ajouter / appliquer', run:() => b.click()}, {t:'Ajouter et dupliquer', run:() => { b.click(); setTimeout(() => ED.duplicate(), 30); }}]);
  CTX.zone('#smPanel [data-c], #smPanel [data-sw], #smPanel .pn-sw button', (e, b) => { const c = b.dataset.c || b.dataset.sw || b.title; if (!/^#[0-9a-f]{6}$/i.test(c || '')) return null;
    return [{h:c.toUpperCase()}, {t:'Appliquer à la sélection', off:!ED.selLayers().length, run:() => ED.applyColor(c)}, {t:'Couleur de fond de la page', run:() => EDX.pageBg(c)}, {t:'Copier le code', run:() => navigator.clipboard?.writeText(c.toUpperCase()).then(() => toast('Couleur copiée', 1200))}, {t:'Ajouter à ma charte', run:() => { const br = ED.brand(), cs = [...new Set([...(br.colors || []), c.toUpperCase()])].slice(0, 24); ED.setBrand({...br, colors:cs}); toast('Couleur ajoutée à la charte'); }}]; });
  CTX.zone('#smRail [data-pn]', (e, b) => [{t:'Ouvrir « ' + b.title + ' »', run:() => PANEL.show(b.dataset.pn)}, {t:PANEL.open ? 'Fermer le panneau' : 'Ouvrir le panneau', run:() => PANEL.toggle(!PANEL.open)}]);
  CTX.zone('#studioNav [data-studio]', (e, b) => [{t:'Passer au studio ' + (STUDIOS.find(s => s.id === b.dataset.studio)?.name || ''), off:ED.readOnly, run:() => ED.setStudio(b.dataset.studio)}]);
  CTX.zone('#docTitle', () => null);
  CTX.zone('#app', e => ctxEditorChrome(e));
}
CTX.init();

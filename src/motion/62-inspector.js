/* ---------- Panneau de droite : propriétés de la sélection (ou du projet) ---------- */
const INSP = {
  open:true, adv:false,
  init(){
    this.el = $('#smInsp'); this.body = $('#smInspBody');
    this.body.addEventListener('input', e => { const el = e.target.closest('[data-p]'); if (el) ED.bindInput(el, false); });
    this.body.addEventListener('change', e => { const el = e.target.closest('[data-p]'); if (el) ED.bindInput(el, true); });
    this.body.addEventListener('click', e => this.click(e));
    $('#smInspToggle').addEventListener('click', () => this.toggle(!this.open));
    BUS.on('sel', () => this.render());
    BUS.on('changed', () => this.render());
    BUS.on('live', () => this.live());
    BUS.on('time', () => { if (!PLAY.playing && !this.body.contains(document.activeElement)) this.liveSoon(); });
  },
  toggle(on){ this.open = on; this.el.classList.toggle('closed', !on); $('#smInspToggle').setAttribute('aria-pressed', on); requestAnimationFrame(() => STAGE.auto && STAGE.fit()); if (on) this.render(); },
  liveSoon(){ clearTimeout(this.lt); this.lt = setTimeout(() => this.render(), 80); },
  /* pendant un glissement : ne met à jour que les champs de disposition */
  live(){
    const L = ED.sel1(); if (!L || !this.open) return;
    const tl = PLAY.t - L.start;
    for (const p of ['x', 'y', 'w', 'h', 'rot', 'fs']){ const el = this.body.querySelector(`[data-p="${p}"]`); if (el && document.activeElement !== el) el.value = round(ANIM_PROPS.includes(p) ? kfVal(L, p, tl) : L[p], 1); }
    for (const p of ['start', 'dur']){ const el = this.body.querySelector(`[data-p="${p}"]`); if (el && document.activeElement !== el) el.value = round(L[p], 2); }
  },
  render(){
    if (!this.open || !this.body) return;
    const P = ED.P, sel = ED.selLayers();
    field.n = 0;
    this.body.innerHTML = sel.length === 0 ? this.project(P) : sel.length > 1 ? this.multi(sel) : this.one(sel[0], P);
  },
  sec(title, html, open = true, id = ''){ return `<details class="is"${open ? ' open' : ''}${id ? ` data-sec="${id}"` : ''}><summary>${escH(title)}</summary><div class="is-b">${html}</div></details>`; },
  project(P){
    const fmt = FORMATS.find(f => f.w === P.w && f.h === P.h);
    return `<div class="is-head"><span class="is-ic">${ico('gear')}</span><div><b>Projet</b><small>${P.w} × ${P.h} · ${P.fps} images/s</small></div></div>`
      + this.sec('Composition', `
        ${field('Format', '@fmt', fmt ? fmt.id : '', {type:'select', opts:{'':'Personnalisé', ...Object.fromEntries(FORMATS.map(f => [f.id, f.name + ' · ' + f.w + '×' + f.h]))}})}
        <div class="fd2">${field('Largeur', '@w', P.w, {unit:'px', min:16, max:7680, dec:0})}${field('Hauteur', '@h', P.h, {unit:'px', min:16, max:7680, dec:0})}</div>
        ${TIMED(ED.studio) || ED.studio === 'design' ? `<div class="fd2">${field('Images / s', '@fps', P.fps, {type:'select', opts:{24:'24', 25:'25', 30:'30', 50:'50', 60:'60'}})}${field('Durée', '@dur', round(TIMED(ED.studio) ? PLAY.end() : P.dur, 2), {unit:'s', min:.1, step:.1, dec:2})}</div>` : ''}
        ${field('Fond', '@bg', P.bg || '#ffffff', {type:'color', clear:true})}
        ${P.bg ? '' : '<p class="is-note">Fond transparent : visible en export PNG.</p>'}`)
      + `<p class="is-note">${TIMED(ED.studio) ? 'Astuce : glissez des médias sur la scène ou dans la timeline. Espace = lecture, S = couper, Suppr = supprimer.' : 'Astuce : double-cliquez sur un texte pour l\'écrire. Maj + clic pour sélectionner plusieurs calques.'}</p>`;
  },
  multi(sel){
    return `<div class="is-head"><span class="is-ic">${ico('layers')}</span><div><b>${sel.length} calques</b><small>Sélection multiple</small></div></div>`
      + this.sec('Aligner', this.alignBtns(true))
      + this.sec('Ensemble', `<div class="is-acts"><button type="button" data-ia="dup">${ico('dup')} Dupliquer</button><button type="button" data-ia="del" class="danger">${ico('trash')} Supprimer</button></div>`);
  },
  alignBtns(dist){
    return `<div class="is-align">${[['l', 'Gauche', 'M4 4v16M8 8h12M8 16h7'], ['ch', 'Centrer', 'M12 4v16M6 8h12M8 16h8'], ['r', 'Droite', 'M20 4v16M4 8h12M9 16h7'], ['t', 'Haut', 'M4 4h16M8 8v12M16 8v7'], ['cv', 'Milieu', 'M4 12h16M8 6v12M16 8v8'], ['b', 'Bas', 'M4 20h16M8 4v12M16 9v7']]
      .map(([k, n, d]) => `<button type="button" data-al="${k}" title="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></button>`).join('')}${dist ? `<button type="button" data-al="dh" title="Répartir horizontalement"><svg viewBox="0 0 24 24"><path d="M4 4v16M20 4v16M10 8h4v8h-4z"/></svg></button><button type="button" data-al="dv" title="Répartir verticalement"><svg viewBox="0 0 24 24"><path d="M4 4h16M4 20h16M8 10h8v4H8z"/></svg></button>` : ''}</div>`;
  },
  one(L, P){
    const tl = PLAY.t - L.start, timed = TIMED(ED.studio), anim = timed;
    const kfo = p => anim ? {kf:p, kfOn:hasKf(L, p), kfHere:kfAt(L, p, tl)} : {};
    const typeN = {text:'Texte', image:'Image', video:'Vidéo', audio:'Son', shape:SHAPE_NAMES[L.k] || 'Forme', color:'Couleur'}[L.t];
    let h = `<div class="is-head"><span class="is-ic">${ico(L.t === 'text' ? 'text' : L.t === 'audio' ? 'audio' : L.t === 'video' ? 'video' : L.t === 'image' ? 'media' : 'shapes')}</span>
      <div><input class="is-name" data-p="name" value="${escH(L.name || typeN)}" aria-label="Nom du calque" maxlength="80"><small>${typeN}${timed ? ` · ${fmtT(L.start)} → ${fmtT(L.start + L.dur)}` : ''}</small></div></div>
      <div class="is-acts top"><button type="button" data-ia="dup" title="Dupliquer (Ctrl + D)">${ico('dup')}</button><button type="button" data-ia="vis" title="${L.vis === false ? 'Afficher' : 'Masquer'}">${ico(L.vis === false ? 'eyeOff' : 'eye')}</button><button type="button" data-ia="lock" title="${L.lock ? 'Déverrouiller' : 'Verrouiller'}" class="${L.lock ? 'on' : ''}">${ico(L.lock ? 'lock' : 'unlock')}</button>${L.t !== 'audio' ? `<button type="button" data-ia="front" title="Avancer">${ico('up')}</button><button type="button" data-ia="back" title="Reculer">${ico('down')}</button>` : ''}${timed ? `<button type="button" data-ia="split" title="Couper à la tête de lecture (S)">${ico('split')}</button>` : ''}<button type="button" data-ia="del" class="danger" title="Supprimer (Suppr)">${ico('trash')}</button></div>`;
    if (L.t === 'text') h += this.sec('Texte', `${field('Contenu', 'txt', L.txt, {type:'textarea'})}
      <div class="fd2">${field('Police', 'font', L.font, {type:'select', opts:Object.fromEntries(FONTS_M.map(f => [f[0], f[0]]))})}${field('Taille', 'fs', L.fs, {unit:'px', min:4, max:2000, dec:0})}</div>
      <div class="fd2">${field('Graisse', 'fw', L.fw, {type:'select', opts:{300:'Fine', 400:'Normale', 500:'Moyenne', 600:'Demi-grasse', 700:'Grasse', 800:'Extra-grasse', 900:'Noire'}})}${field('Couleur', 'col', L.col, {type:'color'})}</div>
      <div class="is-seg" role="group" aria-label="Alignement">${[['l', 'Gauche', 'M4 6h16M4 10h10M4 14h16M4 18h10'], ['c', 'Centré', 'M4 6h16M7 10h10M4 14h16M7 18h10'], ['r', 'Droite', 'M4 6h16M10 10h10M4 14h16M10 18h10']].map(([k, n, d]) => `<button type="button" data-set="align" data-v="${k}" aria-pressed="${L.align === k}" title="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></button>`).join('')}
        <button type="button" data-set="it" data-v="${!L.it}" aria-pressed="${!!L.it}" title="Italique"><i style="font:italic 700 14px Georgia">I</i></button><button type="button" data-set="up" data-v="${!L.up}" aria-pressed="${!!L.up}" title="Majuscules"><b style="font-size:12px">AA</b></button></div>
      ${field('Interligne', 'lh', L.lh, {type:'range', min:.7, max:2.5, step:.05, fmt:v => round(v, 2)})}${field('Espacement des lettres', 'ls', L.ls || 0, {type:'range', min:-.1, max:.5, step:.01, fmt:v => round(v, 2) + ' em'})}`)
      + this.sec('Style du texte', `${field('Surlignage', 'tbg', L.tbg || '#ffffff', {type:'color', clear:true})}${L.tbg ? '' : '<p class="is-note">Aucun surlignage.</p>'}
        <div class="fd2">${field('Contour', 'tstroke', L.tstroke || '#000000', {type:'color', clear:true})}${field('Épaisseur', 'tsw', L.tsw || 0, {unit:'px', min:0, max:60, dec:0})}</div>
        ${field('Ombre portée douce', 'tsh', L.tsh, {type:'check'})}`, false);
    if (L.t === 'shape' || L.t === 'color') h += this.sec(L.t === 'color' ? 'Couleur' : 'Forme', `${L.t === 'shape' ? field('Forme', 'k', L.k, {type:'select', opts:SHAPE_NAMES}) : ''}
      <div class="fd2">${field('Remplissage', 'fill', L.fill || '#000000', {type:'color', clear:true})}${field('Dégradé vers', 'fill2', L.fill2 || '#ffffff', {type:'color', clear:true})}</div>
      ${L.fill2 ? field('Angle du dégradé', 'ga', L.ga ?? 135, {type:'range', min:0, max:360, step:1, fmt:v => Math.round(v) + '°'}) : '<p class="is-note">Choisissez une 2ᵉ couleur pour un dégradé.</p>'}
      ${L.t === 'shape' ? `<div class="fd2">${field('Contour', 'stroke', L.stroke || '#000000', {type:'color', clear:true})}${field('Épaisseur', 'sw', L.sw || 0, {unit:'px', min:0, max:200, dec:0})}</div>
      ${['rect', 'round', 'bubble'].includes(L.k) ? field('Coins arrondis', 'r', L.r || 0, {type:'range', min:0, max:Math.round(Math.min(L.w, L.h) / 2), step:1, fmt:v => Math.round(v) + ' px'}) : ''}` : ''}`);
    if (L.t === 'image' || L.t === 'video'){
      const m = P.media[L.media];
      h += this.sec(L.t === 'video' ? 'Vidéo' : 'Image', `${MEDIA.missing(m) ? `<div class="is-warn">Fichier absent de cet appareil. <button type="button" data-ia="relink">Relier un fichier…</button></div>` : ''}
        ${field('Dans le cadre', 'fit', L.fit, {type:'select', opts:{contain:'Contenir (entière)', cover:'Remplir (recadrée)', fill:'Étirer'}})}
        <div class="fd2">${field('Filtre', 'filter', L.filter || 'none', {type:'select', opts:Object.fromEntries(Object.entries(FILTERS).map(([k, v]) => [k, v[0]]))})}${field('Coins', 'r', L.r || 0, {unit:'px', min:0, max:4000, dec:0})}</div>
        <div class="is-acts"><button type="button" data-ia="flipX">${ico('flipH')} Miroir</button><button type="button" data-ia="flipY">${ico('flipV')} Retourner</button><button type="button" data-ia="adjust">${ico('adjust')} Réglages</button></div>
        ${L.t === 'video' ? `<div class="fd2">${field('Vitesse', 'speed', L.speed || 1, {type:'select', opts:{.25:'× 0,25', .5:'× 0,5', .75:'× 0,75', 1:'× 1', 1.25:'× 1,25', 1.5:'× 1,5', 2:'× 2', 4:'× 4'}})}${field('Début dans la source', 'in', L.in || 0, {unit:'s', min:0, step:.1, dec:2})}</div>
          ${m?.hasAudio ? field('Volume', 'vol', L.vol ?? 1, {type:'range', min:0, max:2, step:.01, fmt:v => Math.round(v * 100) + ' %'}) + `<div class="fd2">${field('Fondu entrée', 'fadeIn', L.fadeIn || 0, {unit:'s', min:0, step:.1, dec:2})}${field('Fondu sortie', 'fadeOut', L.fadeOut || 0, {unit:'s', min:0, step:.1, dec:2})}</div>` + field('Couper le son', 'mute', L.mute, {type:'check'}) : '<p class="is-note">Cette vidéo n\'a pas de son.</p>'}` : ''}
        <p class="is-note">${escH(m?.name || '')}${m?.w ? ` · ${m.w} × ${m.h}` : ''}${m?.dur ? ' · ' + fmtT(m.dur) : ''}</p>`);
    }
    if (L.t === 'audio'){
      const m = P.media[L.media];
      h += this.sec('Son', `${MEDIA.missing(m) ? `<div class="is-warn">Fichier absent de cet appareil. <button type="button" data-ia="relink">Relier un fichier…</button></div>` : ''}
        ${field('Volume', 'vol', L.vol ?? 1, {type:'range', min:0, max:2, step:.01, fmt:v => Math.round(v * 100) + ' %'})}
        <div class="fd2">${field('Fondu entrée', 'fadeIn', L.fadeIn || 0, {unit:'s', min:0, step:.1, dec:2})}${field('Fondu sortie', 'fadeOut', L.fadeOut || 0, {unit:'s', min:0, step:.1, dec:2})}</div>
        <div class="fd2">${field('Vitesse', 'speed', L.speed || 1, {type:'select', opts:{.5:'× 0,5', .75:'× 0,75', 1:'× 1', 1.25:'× 1,25', 1.5:'× 1,5', 2:'× 2'}})}${field('Début dans la source', 'in', L.in || 0, {unit:'s', min:0, step:.1, dec:2})}</div>
        ${field('Couper le son', 'mute', L.mute, {type:'check'})}<p class="is-note">${escH(m?.name || '')}${m?.dur ? ' · ' + fmtT(m.dur) : ''}</p>`);
    }
    if (L.t !== 'audio'){
      h += this.sec('Disposition', `<div class="fd2">${field('X', 'x', kfVal(L, 'x', tl), {unit:'px', ...kfo('x')})}${field('Y', 'y', kfVal(L, 'y', tl), {unit:'px', ...kfo('y')})}</div>
        <div class="fd2">${field('Largeur', 'w', L.w, {unit:'px', min:1})}${field('Hauteur', 'h', L.h, {unit:'px', min:1})}</div>
        <div class="fd2">${field('Rotation', 'rot', kfVal(L, 'rot', tl), {unit:'°', ...kfo('rot')})}${field('Échelle', 'sc', round(kfVal(L, 'sc', tl) * 100, 1), {unit:'%', min:1, ...kfo('sc')})}</div>
        ${field('Opacité', 'op', round(kfVal(L, 'op', tl) * 100), {type:'range', min:0, max:100, step:1, fmt:v => Math.round(v) + ' %', ...kfo('op')})}
        ${this.alignBtns(false)}`);
      h += this.sec('Animation', `<div class="fd2">${field('Entrée', 'tin.k', L.tin.k, {type:'select', opts:L.t === 'text' ? FX_IN : Object.fromEntries(Object.entries(FX_IN).filter(([k]) => k !== 'type'))})}${field('Durée', 'tin.d', L.tin.d, {unit:'s', min:.05, step:.1, dec:2})}</div>
        <div class="fd2">${field('Sortie', 'tout.k', L.tout.k, {type:'select', opts:FX_OUT})}${field('Durée', 'tout.d', L.tout.d, {unit:'s', min:.05, step:.1, dec:2})}</div>
        ${anim ? `<p class="is-note">◆ à côté d'une valeur : l'animer avec des images clés à la tête de lecture.</p>` : '<p class="is-note">Visible dans les studios Vidéo et Motion, et à l\'export vidéo.</p>'}`, timed);
    }
    if (timed) h += this.sec('Temps', `<div class="fd2">${field('Début', 'start', L.start, {unit:'s', min:0, step:.1, dec:2})}${field('Durée', 'dur', L.dur, {unit:'s', min:.04, step:.1, dec:2})}</div>`);
    if (L.t !== 'audio') h += this.sec('Avancé', `${field('Mode de fusion', 'blend', L.blend || 'source-over', {type:'select', opts:BLENDS})}
      ${field('Ombre portée', '@shadow', !!L.shadow, {type:'check'})}
      ${L.shadow ? `<div class="fd2">${field('Couleur', 'shadow.c', L.shadow.c, {type:'color'})}${field('Flou', 'shadow.b', L.shadow.b, {unit:'px', min:0, max:200, dec:0})}</div><div class="fd2">${field('Décalage X', 'shadow.x', L.shadow.x, {unit:'px', dec:0})}${field('Décalage Y', 'shadow.y', L.shadow.y, {unit:'px', dec:0})}</div>` : ''}
      ${L.t === 'image' || L.t === 'video' ? `<div class="fd2">${field('Bordure', 'stroke', L.stroke || '#ffffff', {type:'color', clear:true})}${field('Épaisseur', 'sw', L.sw || 0, {unit:'px', min:0, max:200, dec:0})}</div>` : ''}`, this.adv, 'adv');
    return h;
  },
  click(e){
    const t = e.target;
    const det = t.closest('details[data-sec="adv"] > summary'); if (det) setTimeout(() => this.adv = det.parentElement.open, 0);
    if (ED.readOnly) return;
    const b = t.closest('[data-ia],[data-al],[data-set],[data-clear],[data-kfp]'); if (!b) return;
    const L = ED.sel1(), P = ED.P;
    if (b.dataset.kfp && L){ const p = b.dataset.kfp, tl = PLAY.t - L.start;
      if (tl < 0 || tl > L.dur) return toast('Placez la tête de lecture sur le calque pour poser une image clé.');
      if (!hasKf(L, p)){ setKf(L, p, tl, L[p]); ED.commit('Animer'); toast('Propriété animée : déplacez la tête de lecture puis changez la valeur.'); }
      else if (kfAt(L, p, tl)) { delKf(L, p, tl); ED.commit('Supprimer l\'image clé'); }
      else { setKf(L, p, tl, kfVal(L, p, tl)); ED.commit('Image clé'); }
      return; }
    if (b.dataset.set && L){ const v = b.dataset.v; L[b.dataset.set] = v === 'true' ? true : v === 'false' ? false : v; if (L.t === 'text') L.h = Math.max(measureText(L).h, 4); ED.commit('Texte'); return; }
    if (b.dataset.clear){ const p = b.dataset.clear; if (p === '@bg'){ P.bg = null; STAGE.layout(); } else if (L) L[p] = ''; ED.commit('Couleur'); return; }
    if (b.dataset.al) return ED.align(b.dataset.al);
    const k = b.dataset.ia;
    if (k === 'dup') ED.duplicate(); if (k === 'del') ED.deleteSel(); if (k === 'split') TL.split();
    if (k === 'front' || k === 'back') ED.zorder(k === 'front' ? 1 : -1);
    if (!L) return;
    if (k === 'vis'){ L.vis = L.vis === false; ED.commit(L.vis ? 'Afficher' : 'Masquer'); }
    if (k === 'lock'){ L.lock = !L.lock; ED.commit(L.lock ? 'Verrouiller' : 'Déverrouiller'); }
    if (k === 'flipX'){ L.flipX = !L.flipX; ED.commit('Miroir'); } if (k === 'flipY'){ L.flipY = !L.flipY; ED.commit('Retourner'); }
    if (k === 'adjust') PANEL.show('adjust');
    if (k === 'relink') ED.relink(P.media[L.media]);
  },
};

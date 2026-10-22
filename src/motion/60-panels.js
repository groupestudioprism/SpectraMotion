/* ---------- Panneau de gauche : ressources et outils, selon le studio actif ---------- */
const RAIL = {
  design:['tpl', 'text', 'shapes', 'media', 'bg', 'layers'],
  photo:['media', 'adjust', 'fx', 'text', 'shapes', 'layers'],
  video:['media', 'text', 'trans', 'fx', 'audio', 'layers'],
  motion:['anim', 'text', 'shapes', 'media', 'layers'],
  audio:['audio', 'media', 'layers'],
};
const PANELS = {
  tpl:['Modèles', 'tpl'], text:['Texte', 'text'], shapes:['Éléments', 'shapes'], media:['Médias', 'media'], bg:['Fond', 'bg'], layers:['Calques', 'layers'],
  adjust:['Réglages', 'adjust'], fx:['Filtres', 'fx'], trans:['Transitions', 'trans'], audio:['Audio', 'audio'], anim:['Animations', 'anim'],
};
const SWATCHES = ['#16131F', '#FFFFFF', '#6D3BFF', '#3D63FF', '#14C2EC', '#2FBF71', '#FFC83D', '#FF8A3D', '#F2387A', '#E8E4F2', '#0B2A4A', '#7A1F3D', '#F4EFE6', '#1F6F5C', '#B88A2E', '#5B5B66'];
const GRADS = [['#7B2FF7', '#14C2EC'], ['#FF3F86', '#FFC83D'], ['#14C2EC', '#45D69A'], ['#16131F', '#3D2B7A'], ['#FF8A3D', '#F2387A'], ['#0B2A4A', '#14C2EC'], ['#F4EFE6', '#E8D9C4'], ['#2FBF71', '#FFC83D']];
const TEXT_PRESETS = [
  {n:'Titre', o:{txt:'Ajoutez un titre', fs:.11, fw:800, font:'Bricolage Grotesque'}},
  {n:'Sous-titre', o:{txt:'Ajoutez un sous-titre', fs:.055, fw:600}},
  {n:'Texte courant', o:{txt:'Votre texte ici. Double-cliquez pour le modifier.', fs:.035, fw:400, align:'l', lh:1.4}},
  {n:'Citation', o:{txt:'« Une idée claire se dit en une phrase. »', fs:.06, fw:400, font:'Playfair Display', it:true}},
  {n:'Étiquette', o:{txt:'NOUVEAU', fs:.035, fw:800, col:'#FFFFFF', tbg:'#6D3BFF', tbgPad:.45, ls:.12}},
  {n:'Gros chiffre', o:{txt:'+38 %', fs:.18, fw:900, font:'Unbounded', col:'#6D3BFF'}},
  {n:'Affiche', o:{txt:'SOLDES D\'ÉTÉ', fs:.13, fw:400, font:'Anton', col:'#F2387A', up:true}},
  {n:'Contour', o:{txt:'CONTOUR', fs:.12, fw:900, font:'Unbounded', col:'#FFFFFF', tstroke:'#16131F', tsw:6}},
  {n:'Manuscrit', o:{txt:'Merci beaucoup !', fs:.1, fw:400, font:'Caveat', col:'#3D63FF'}},
  {n:'Néon', o:{txt:'NÉON', fs:.12, fw:800, font:'Space Grotesk', col:'#14C2EC', shadow:{c:'#14C2EC', b:40, x:0, y:0}}},
  {n:'Sous-titre vidéo', o:{txt:'Ici, les paroles de la vidéo', fs:.045, fw:600, col:'#FFFFFF', tbg:'#000000B3', tbgPad:.35, place:'bottom'}},
  {n:'Bandeau nom', o:{txt:'Camille Martin\nDirectrice artistique', fs:.042, fw:700, col:'#FFFFFF', tbg:'#6D3BFF', tbgPad:.4, align:'l', place:'lower'}},
];
const ANIM_PRESETS = [
  {n:'Apparition', d:'Fondu à l\'entrée et à la sortie', a:L => { L.tin = {k:'fade', d:.6}; L.tout = {k:'fade', d:.5}; }},
  {n:'Glisser', d:'Arrive par la gauche, repart à droite', a:L => { L.tin = {k:'slideL', d:.7}; L.tout = {k:'slideR', d:.6}; }},
  {n:'Monter', d:'Monte en apparaissant', a:L => { L.tin = {k:'slideU', d:.7}; L.tout = {k:'fade', d:.5}; }},
  {n:'Zoom', d:'Grandit en apparaissant', a:L => { L.tin = {k:'zoom', d:.6}; L.tout = {k:'zoom', d:.5}; }},
  {n:'Rebond', d:'Apparition élastique', a:L => { L.tin = {k:'pop', d:.8}; L.tout = {k:'fade', d:.4}; }},
  {n:'Volet', d:'Se dévoile de gauche à droite', a:L => { L.tin = {k:'wipe', d:.8}; L.tout = {k:'wipe', d:.6}; }},
  {n:'Mise au point', d:'Sort du flou', a:L => { L.tin = {k:'blur', d:.8}; L.tout = {k:'blur', d:.6}; }},
  {n:'Machine à écrire', d:'Les lettres apparaissent une à une (texte)', only:'text', a:L => { L.tin = {k:'type', d:Math.min(L.dur * .7, Math.max(.6, (L.txt || '').length * .05))}; }},
  {n:'Ken Burns', d:'Zoom lent sur toute la durée', a:L => { L.kf.sc = [[0, 1, 'lin'], [round(L.dur, 3), 1.15, 'lin']]; }},
  {n:'Battement', d:'Pulse en continu', a:L => { const k = []; for (let t = 0; t <= L.dur + 1e-6; t += .5) k.push([round(t, 3), (Math.round(t * 2) % 2) ? 1.08 : 1, 'ease']); L.kf.sc = k; }},
  {n:'Flotter', d:'Ondule doucement de haut en bas', a:L => { const k = [], y = L.y; for (let t = 0, i = 0; t <= L.dur + 1e-6; t += 1, i++) k.push([round(t, 3), y + (i % 2 ? -1 : 1) * Math.max(6, L.h * .06), 'ease']); L.kf.y = k; }},
  {n:'Rotation', d:'Un tour complet sur la durée', a:L => { L.kf.rot = [[0, L.rot || 0, 'lin'], [round(L.dur, 3), (L.rot || 0) + 360, 'lin']]; }},
  {n:'Traversée', d:'Traverse l\'écran de gauche à droite', a:(L, P) => { L.kf.x = [[0, -L.w, 'lin'], [round(L.dur, 3), P.w, 'lin']]; }},
  {n:'Aucune animation', d:'Retire effets et images clés', a:L => { L.tin = {k:'none', d:.6}; L.tout = {k:'none', d:.6}; L.kf = {}; }},
];
const PANEL = {
  cur:'', open:true,
  init(){
    this.rail = $('#smRail'); this.box = $('#smPanel'); this.body = $('#smPanelBody');
    this.rail.addEventListener('click', e => { const b = e.target.closest('[data-pn]'); if (!b) return; if (this.cur === b.dataset.pn && this.open && innerWidth > 900){ this.toggle(false); return; } this.show(b.dataset.pn); });
    $('#smPanelClose').addEventListener('click', () => this.toggle(false));
    this.body.addEventListener('click', e => this.click(e));
    this.body.addEventListener('input', e => this.input(e, false));
    this.body.addEventListener('change', e => this.input(e, true));
    this.body.addEventListener('dragstart', e => { const it = e.target.closest('[data-mid]'); if (it) e.dataTransfer.setData('text/x-sm-media', it.dataset.mid); });
    BUS.on('sel', () => { if (['adjust', 'fx', 'trans', 'anim', 'layers', 'audio'].includes(this.cur)) this.render(); });
    BUS.on('media', () => { if (this.cur === 'media' || this.cur === 'audio') this.renderSoon(); });
    BUS.on('changed', () => { if (this.cur === 'layers' || this.cur === 'media') this.renderSoon(); });
  },
  renderSoon(){ clearTimeout(this.rt); this.rt = setTimeout(() => this.render(), 60); },
  setStudio(s){
    const ids = RAIL[s] || RAIL.design;
    this.rail.innerHTML = ids.map(id => `<button type="button" data-pn="${id}" aria-pressed="false" title="${PANELS[id][0]}">${ico(PANELS[id][1])}<span>${PANELS[id][0]}</span></button>`).join('');
    if (!ids.includes(this.cur)) this.cur = ids[0];
    if (innerWidth <= 900) this.toggle(false); else this.show(this.cur);
  },
  toggle(on){ this.open = on; this.box.hidden = !on; $('#app').classList.toggle('pn-closed', !on); $$('[data-pn]', this.rail).forEach(b => b.setAttribute('aria-pressed', on && b.dataset.pn === this.cur)); requestAnimationFrame(() => { STAGE.auto && STAGE.fit(); TL.render(); }); },
  show(id){ this.cur = id; this.toggle(true); this.render(); },
  render(){
    if (!this.open) return; const id = this.cur, P = ED.P; $('#smPanelTitle').textContent = PANELS[id]?.[0] || '';
    $$('[data-pn]', this.rail).forEach(b => b.setAttribute('aria-pressed', b.dataset.pn === id));
    const fn = this['p_' + id]; this.body.innerHTML = fn ? fn.call(this, P) : '';
    $$('canvas[data-fxprev]', this.body).forEach(cv => this.fxPreview(cv));
  },
  /* --- Modèles et formats --- */
  p_tpl(P){
    const tpls = SM_TPL.filter(t => !t.studio || t.studio === ED.studio || ED.studio === 'design');
    return `<p class="pn-hint">Un modèle remplace le contenu du projet (Ctrl + Z pour revenir).</p>
      <div class="pn-tpls">${tpls.map(t => `<button type="button" class="pn-tpl" data-tpl="${t.id}" title="${escH(t.desc || '')}"><img alt="" src="${tplThumb(t)}"><b>${escH(t.name)}</b><small>${escH(t.cat)}</small></button>`).join('')}</div>
      <h4 class="pn-h">Format</h4><div class="pn-fmts">${FORMATS.map(f => `<button type="button" class="pn-fmt${P.w === f.w && P.h === f.h ? ' on' : ''}" data-fmt="${f.id}"><i style="aspect-ratio:${f.w}/${f.h}"></i><span><b>${escH(f.name)}</b><small>${escH(f.sub)}</small></span></button>`).join('')}</div>`;
  },
  p_text(P){
    return `<button type="button" class="pn-big" data-act="addText">${ico('plus')} Ajouter une zone de texte</button>
      <div class="pn-texts">${TEXT_PRESETS.map((t, i) => { const o = t.o, st = `font-family:${fontCss(o.font || 'Inter')};font-weight:${o.fw || 700};${o.it ? 'font-style:italic;' : ''}color:${o.tbg ? o.col : (o.col && o.col !== '#FFFFFF' ? o.col : 'var(--ink)')};${o.tbg ? `background:${o.tbg};padding:2px 8px;border-radius:4px;` : ''}${o.tstroke ? `-webkit-text-stroke:1.5px ${o.tstroke};color:transparent;` : ''}${o.shadow ? `text-shadow:0 0 12px ${o.shadow.c};` : ''}${o.up ? 'text-transform:uppercase;' : ''}${o.ls ? `letter-spacing:${o.ls}em;` : ''}`;
        return `<button type="button" class="pn-txt" data-txt="${i}"><span style="${st}">${escH(t.n === 'Texte courant' ? 'Texte courant' : o.txt.split('\n')[0])}</span><small>${escH(t.n)}</small></button>`; }).join('')}</div>`;
  },
  p_shapes(P){
    const ks = ['rect', 'round', 'ellipse', 'tri', 'diamond', 'hex', 'star', 'arrow', 'heart', 'bubble', 'ring', 'line', 'prism'];
    return `<div class="pn-shapes">${ks.map(k => `<button type="button" data-shape="${k}" title="${SHAPE_NAMES[k]}">${shapeSvg(k)}</button>`).join('')}</div>
      <h4 class="pn-h">Couleur des formes ajoutées</h4><div class="pn-sw">${SWATCHES.map(c => `<button type="button" data-shapecol="${c}" style="background:${c}" class="${ED.shapeCol === c ? 'on' : ''}" aria-label="${c}"></button>`).join('')}</div>`;
  },
  p_bg(P){
    return `<h4 class="pn-h">Couleur de fond</h4><div class="pn-sw">${SWATCHES.map(c => `<button type="button" data-bg="${c}" style="background:${c}" class="${P.bg === c ? 'on' : ''}" aria-label="${c}"></button>`).join('')}
      <label class="pn-sw-c" title="Autre couleur"><input type="color" data-bgc value="${hexOk(P.bg) ? P.bg.slice(0, 7) : '#ffffff'}"></label></div>
      <label class="pn-chk"><input type="checkbox" data-bgnone${P.bg ? '' : ' checked'}> Fond transparent (export PNG)</label>
      <h4 class="pn-h">Dégradés</h4><div class="pn-grads">${GRADS.map(([a, b], i) => `<button type="button" data-grad="${i}" style="background:linear-gradient(135deg,${a},${b})" aria-label="Dégradé ${i + 1}"></button>`).join('')}</div>
      <p class="pn-hint">Un dégradé s'ajoute comme calque de fond, que vous pouvez animer ou couper dans la timeline.</p>`;
  },
  /* --- Médias du projet --- */
  p_media(P, only){
    const list = Object.values(P.media).filter(m => !only || m.kind === only);
    const cloud = window.SMCloudMedia?.state?.() || 'local';
    const st = m => m.uploading ? `<em class="mst up" title="Envoi dans le cloud…">↑</em>` : m.cloud ? `<em class="mst cl" title="Dans le cloud Studio Prism">☁</em>` : MEDIA.missing(m) ? `<em class="mst miss" title="Fichier absent de cet appareil">!</em>` : `<em class="mst dv" title="Sur cet appareil${m.cloudSkip === 'quota' ? ' (espace cloud plein)' : cloud === 'off' ? ' (stockage cloud des médias non activé)' : ''}">●</em>`;
    return `<button type="button" class="pn-big" data-act="import" data-kind="${only || ''}">${ico('plus')} Importer ${only === 'audio' ? 'des sons' : 'des médias'}</button>
      <p class="pn-hint">${only === 'audio' ? 'MP3, WAV, OGG, M4A…' : 'Images, vidéos (MP4, WebM) et sons'}. Vous pouvez aussi glisser des fichiers sur la scène.</p>
      ${only === 'audio' ? `<button type="button" class="pn-big alt" data-act="record">${ico('audio')} Enregistrer une voix off</button>` : ''}
      ${list.length ? `<div class="pn-media">${list.map(m => `<div class="pn-m${MEDIA.missing(m) ? ' miss' : ''}" data-mid="${m.id}" draggable="true" tabindex="0" title="${escH(m.name)}${m.dur ? ' · ' + fmtT(m.dur) : ''}${m.w ? ` · ${m.w} × ${m.h}` : ''} · ${fmtBytes(m.size)}">
          <div class="pm-th">${m.thumb ? `<img alt="" src="${m.thumb}">` : ico(m.kind === 'audio' ? 'audio' : m.kind === 'video' ? 'video' : 'media')}${m.dur ? `<span class="pm-d">${fmtT(m.dur, false)}</span>` : ''}${st(m)}</div>
          <b>${escH(m.name)}</b><div class="pm-a"><button type="button" data-madd="${m.id}" title="Ajouter au projet">${ico('plus')}</button><button type="button" data-mmenu="${m.id}" title="Plus d'actions">${ico('more')}</button></div></div>`).join('')}</div>`
        : `<div class="pn-empty">${ico(only === 'audio' ? 'audio' : 'media')}<b>${only === 'audio' ? 'Aucun son pour l\'instant' : 'Aucun média pour l\'instant'}</b><span>Importez des fichiers : ils restent sur cet appareil et partent dans le cloud quand il est disponible.</span></div>`}`;
  },
  p_audio(P){
    const L = ED.sel1(), a = L && (L.t === 'audio' || L.t === 'video') ? L : null;
    return (a ? `<div class="pn-card"><b>${escH(a.name || 'Clip')}</b>
        ${field('Volume', 'vol', a.vol ?? 1, {type:'range', min:0, max:2, step:.01, fmt:v => Math.round(v * 100) + ' %'})}
        ${field('Fondu d\'entrée', 'fadeIn', a.fadeIn || 0, {type:'range', min:0, max:Math.min(10, a.dur / 2), step:.05, fmt:v => round(v, 2) + ' s'})}
        ${field('Fondu de sortie', 'fadeOut', a.fadeOut || 0, {type:'range', min:0, max:Math.min(10, a.dur / 2), step:.05, fmt:v => round(v, 2) + ' s'})}
        <label class="pn-chk"><input type="checkbox" data-p="mute"${a.mute ? ' checked' : ''}> Couper le son</label></div>` : '')
      + this.p_media(P, 'audio');
  },
  /* --- Retouche --- */
  p_adjust(P){
    const L = ED.sel1(); if (!L || !(L.t === 'image' || L.t === 'video')) return noSel('Sélectionnez une image ou une vidéo pour la retoucher.');
    return `<div class="pn-adj">${Object.entries(ADJ_KEYS).map(([k, [n, mn, mx]]) => field(n, 'adj.' + k, L.adj?.[k] || 0, {type:'range', min:mn, max:mx, step:1, fmt:v => (v > 0 && mn < 0 ? '+' : '') + Math.round(v), reset:true})).join('')}</div>
      <button type="button" class="pn-big alt" data-act="resetAdj">Réinitialiser les réglages</button>
      <h4 class="pn-h">Recadrer</h4><div class="pn-crop">${[['free', 'Libre'], ['1:1', '1:1'], ['4:5', '4:5'], ['16:9', '16:9'], ['9:16', '9:16'], ['3:2', '3:2']].map(([k, n]) => `<button type="button" data-crop="${k}">${n}</button>`).join('')}</div>
      ${['x', 'y', 'w', 'h'].map(k => field({x:'Bord gauche', y:'Bord haut', w:'Largeur gardée', h:'Hauteur gardée'}[k], 'crop.' + k, round(((L.crop || {x:0, y:0, w:1, h:1})[k]) * 100, 1), {type:'range', min:k === 'w' || k === 'h' ? 5 : 0, max:k === 'w' || k === 'h' ? 100 : 95, step:.5, fmt:v => round(v, 1) + ' %'})).join('')}
      <div class="pn-row"><button type="button" class="pn-btn" data-act="flipX">${ico('flipH')} Miroir</button><button type="button" class="pn-btn" data-act="flipY">${ico('flipV')} Retourner</button><button type="button" class="pn-btn" data-act="rot90">↻ 90°</button></div>`;
  },
  p_fx(P){
    const L = ED.sel1(); if (!L || !(L.t === 'image' || L.t === 'video')) return noSel('Sélectionnez une image ou une vidéo pour lui appliquer un filtre.');
    return `<div class="pn-fx">${Object.entries(FILTERS).map(([k, [n]]) => `<button type="button" data-filter="${k}" class="${(L.filter || 'none') === k ? 'on' : ''}"><canvas data-fxprev="${k}" width="120" height="80"></canvas><span>${n}</span></button>`).join('')}</div>
      <p class="pn-hint">Les filtres se combinent avec les réglages fins (panneau Réglages).</p>`;
  },
  fxPreview(cv){
    const L = ED.sel1(), m = L && ED.P.media[L.media], el = MEDIA.el(m); if (!el) return;
    const g = cv.getContext('2d'), sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight, k = Math.max(cv.width / sw, cv.height / sh);
    const a = {...(FILTERS[cv.dataset.fxprev]?.[1] || {})};
    if (SUPPORTS_FILTER) g.filter = filterCss(a);
    try { g.drawImage(el, (sw - cv.width / k) / 2, (sh - cv.height / k) / 2, cv.width / k, cv.height / k, 0, 0, cv.width, cv.height); } catch(e){}
    g.filter = 'none'; if (a.temp){ g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.abs(a.temp) / 100 * .8; g.fillStyle = a.temp > 0 ? '#FF9A3D' : '#3D8BFF'; g.fillRect(0, 0, cv.width, cv.height); }
  },
  /* --- Vidéo --- */
  p_trans(P){
    const L = ED.sel1(); if (!L || L.t === 'audio') return noSel('Sélectionnez un clip dans la timeline : choisissez ensuite son effet d\'entrée et de sortie.');
    const row = (key, set, cur) => `<div class="pn-trs">${Object.entries(set).map(([k, n]) => `<button type="button" data-tr="${key}" data-k="${k}" class="${cur.k === k ? 'on' : ''}"><i class="trp ${k}"></i><span>${n}</span></button>`).join('')}</div>`;
    return `<h4 class="pn-h">Entrée</h4>${row('tin', FX_IN, L.tin)}${field('Durée de l\'entrée', 'tin.d', L.tin.d, {type:'range', min:.1, max:Math.max(.2, Math.min(5, L.dur)), step:.05, fmt:v => round(v, 2) + ' s'})}
      <h4 class="pn-h">Sortie</h4>${row('tout', FX_OUT, L.tout)}${field('Durée de la sortie', 'tout.d', L.tout.d, {type:'range', min:.1, max:Math.max(.2, Math.min(5, L.dur)), step:.05, fmt:v => round(v, 2) + ' s'})}
      <p class="pn-hint">Pour un fondu enchaîné, faites se chevaucher deux clips sur deux pistes et donnez-leur un fondu.</p>`;
  },
  /* --- Motion --- */
  p_anim(P){
    const L = ED.sel1();
    return (L && L.t !== 'audio' ? '' : noSel('Sélectionnez un calque pour l\'animer.'))
      + `<div class="pn-anims">${ANIM_PRESETS.map((a, i) => `<button type="button" data-anim="${i}"${!L || L.t === 'audio' || (a.only && L.t !== a.only) ? ' disabled' : ''}><i class="anp a${i}"></i><b>${a.n}</b><small>${a.d}</small></button>`).join('')}</div>
      <p class="pn-hint">Pour une animation sur mesure : dans la timeline, cliquez sur ${ico('anim')} à côté d'une propriété, déplacez la tête de lecture puis modifiez le calque ; chaque changement pose une image clé.</p>`;
  },
  p_layers(P){
    const ls = [...drawOrder(P)].reverse(), aud = P.layers.filter(l => l.t === 'audio');
    const row = L => `<div class="pn-l${ED.sel.has(L.id) ? ' on' : ''}${L.vis === false ? ' off' : ''}" data-lid="${L.id}" tabindex="0"><span class="pl-ic">${ico(L.t === 'text' ? 'text' : L.t === 'audio' ? 'audio' : L.t === 'video' ? 'video' : L.t === 'image' ? 'media' : 'shapes')}</span>
      <b>${escH(L.name || SHAPE_NAMES[L.k] || 'Calque')}</b>${TIMED(ED.studio) ? `<small>${fmtT(L.start)}</small>` : ''}
      <button type="button" data-lv="${L.id}" title="${L.vis === false ? 'Afficher' : 'Masquer'}">${ico(L.vis === false ? 'eyeOff' : 'eye')}</button><button type="button" data-ll="${L.id}" title="${L.lock ? 'Déverrouiller' : 'Verrouiller'}" class="${L.lock ? 'on' : ''}">${ico(L.lock ? 'lock' : 'unlock')}</button></div>`;
    if (!ls.length && !aud.length) return '<div class="pn-empty">' + ico('layers') + '<b>Aucun calque</b><span>Ajoutez un texte, une forme ou un média.</span></div>';
    return `<p class="pn-hint">Du premier plan vers le fond. ${ED.studio === 'video' || ED.studio === 'motion' ? 'Les pistes du dessus se dessinent devant.' : ''}</p><div class="pn-ls">${ls.map(row).join('')}</div>${aud.length ? `<h4 class="pn-h">Sons</h4><div class="pn-ls">${aud.map(row).join('')}</div>` : ''}
      <div class="pn-row"><button type="button" class="pn-btn" data-act="front" title="Premier plan">${ico('up')} Avancer</button><button type="button" class="pn-btn" data-act="back" title="Arrière-plan">${ico('down')} Reculer</button></div>`;
  },
  /* --- actions --- */
  click(e){
    const t = e.target, P = ED.P;
    const g = (sel, fn) => { const b = t.closest(sel); if (b){ fn(b); return true; } return false; };
    if (ED.readOnly && !t.closest('[data-lid]')) return toast('Projet en lecture seule');
    if (g('[data-act]', b => this.act(b.dataset.act, b))) return;
    if (g('[data-tpl]', b => ED.useTemplate(b.dataset.tpl))) return;
    if (g('[data-fmt]', b => ED.setFormat(FORMATS.find(f => f.id === b.dataset.fmt)))) return;
    if (g('[data-txt]', b => ED.addPresetText(TEXT_PRESETS[+b.dataset.txt]))) return;
    if (g('[data-shape]', b => ED.addLayer(mkShape(P, b.dataset.shape, {fill:ED.shapeCol || '#6D3BFF', start:TIMED(ED.studio) ? PLAY.t : 0, dur:TIMED(ED.studio) ? Math.min(5, Math.max(1, PLAY.end() - PLAY.t)) : P.dur, track:topTrack(P), ...(b.dataset.shape === 'line' ? {h:Math.max(4, Math.round(Math.min(P.w, P.h) * .012))} : {})})))) return;
    if (g('[data-shapecol]', b => { ED.shapeCol = b.dataset.shapecol; const L = ED.sel1(); if (L && (L.t === 'shape' || L.t === 'color')){ L.fill = ED.shapeCol; ED.commit('Couleur'); } this.render(); })) return;
    if (g('[data-bg]', b => { P.bg = b.dataset.bg; ED.commit('Fond'); this.render(); })) return;
    if (g('[data-grad]', b => { const [a, c] = GRADS[+b.dataset.grad]; const bgL = P.layers.find(l => l.t === 'color' && l.track === 0 && l.x <= 0 && l.y <= 0 && l.w >= P.w && l.h >= P.h);
      if (bgL){ bgL.fill = a; bgL.fill2 = c; } else { P.layers.forEach(l => { if (l.t !== 'audio') l.track += 1; }); P.layers.unshift(mkColor(P, a, {fill2:c, ga:135, track:0, start:0, dur:Math.max(P.dur, PLAY.end()), name:'Fond dégradé'})); }
      ED.commit('Fond dégradé'); })) return;
    if (g('[data-madd]', b => ED.addMedia(P.media[b.dataset.madd], e.shiftKey))) return;
    if (g('[data-mmenu]', b => this.mediaMenu(b, P.media[b.dataset.mmenu]))) return;
    if (g('[data-mid]', b => ED.addMedia(P.media[b.dataset.mid], e.shiftKey))) return;
    if (g('[data-filter]', b => { const L = ED.sel1(); if (L){ L.filter = b.dataset.filter; ED.commit('Filtre'); this.render(); } })) return;
    if (g('[data-crop]', b => ED.cropPreset(b.dataset.crop))) return;
    if (g('[data-tr]', b => { for (const L of ED.selLayers()) L[b.dataset.tr] = {k:b.dataset.k, d:L[b.dataset.tr]?.d || .6}; ED.commit('Transition'); this.render(); })) return;
    if (g('[data-anim]', b => { const a = ANIM_PRESETS[+b.dataset.anim]; for (const L of ED.selLayers()) if (L.t !== 'audio' && (!a.only || L.t === a.only)){ L.kf ||= {}; a.a(L, P); } ED.commit('Animation : ' + a.n); if (!PLAY.playing){ const L = ED.sel1(); if (L){ PLAY.seek(L.start, false); PLAY.play(); } } this.render(); })) return;
    if (g('[data-lv]', b => { const L = P.layers.find(l => l.id === b.dataset.lv); L.vis = L.vis === false; ED.commit(L.vis ? 'Afficher' : 'Masquer'); })) return;
    if (g('[data-ll]', b => { const L = P.layers.find(l => l.id === b.dataset.ll); L.lock = !L.lock; ED.commit(L.lock ? 'Verrouiller' : 'Déverrouiller'); })) return;
    if (g('[data-lid]', b => { if (e.shiftKey) ED.toggleSel(b.dataset.lid); else ED.select([b.dataset.lid]); })) return;
  },
  act(k, b){
    const P = ED.P, L = ED.sel1();
    if (k === 'import') return ED.importPick(b.dataset.kind || '');
    if (k === 'record') return ED.recordVoice();
    if (k === 'addText') return ED.addPresetText({n:'Texte', o:{txt:'Votre texte', fs:.07, fw:700}});
    if (k === 'resetAdj' && L){ L.adj = {}; L.filter = 'none'; ED.commit('Réinitialiser'); return this.render(); }
    if (k === 'flipX' && L){ L.flipX = !L.flipX; return ED.commit('Miroir'); }
    if (k === 'flipY' && L){ L.flipY = !L.flipY; return ED.commit('Retourner'); }
    if (k === 'rot90' && L){ STAGE.setProp(L, 'rot', ((kfVal(L, 'rot', PLAY.t - L.start) || 0) + 90) % 360); return ED.commit('Rotation'); }
    if (k === 'front' || k === 'back') return ED.zorder(k === 'front' ? 1 : -1);
  },
  async mediaMenu(btn, m){
    const used = ED.P.layers.some(l => l.media === m.id);
    const k = await ED.menu(btn, [{k:'add', t:'Ajouter au projet'}, {k:'top', t:'Ajouter à la tête de lecture', s:'Sur une nouvelle piste', off:!TIMED(ED.studio)},
      MEDIA.missing(m) ? {k:'relink', t:'Relier un fichier…', s:'Choisir le fichier sur cet appareil'} : null,
      !m.cloud && window.SMCloudMedia?.ok() ? {k:'up', t:'Envoyer dans le cloud', s:'Pour l\'ouvrir sur vos autres appareils'} : null, '-',
      {k:'del', t:'Retirer du projet', s:used ? 'Retire aussi ses clips' : '', danger:true}].filter(Boolean));
    if (k === 'add') ED.addMedia(m); if (k === 'top') ED.addMedia(m, true);
    if (k === 'relink') ED.relink(m);
    if (k === 'up'){ toast('Envoi dans le cloud…'); const ok = await MEDIA.upload(ED.P, m); toast(ok ? 'Média envoyé dans le cloud' : 'Envoi impossible : le média reste sur cet appareil'); if (ok) ED.commit('Média dans le cloud'); }
    if (k === 'del') ED.removeMedia(m);
  },
  input(e, final){
    const el = e.target.closest('[data-p]'); if (el){ ED.bindInput(el, final); return; }
    if (e.target.matches('[data-bgc]')){ ED.P.bg = e.target.value; if (final) ED.commit('Fond'); else STAGE.paint(); }
    if (e.target.matches('[data-bgnone]') && final){ ED.P.bg = e.target.checked ? null : '#FFFFFF'; ED.commit('Fond'); STAGE.layout(); this.render(); }
  },
};
function noSel(t){ return `<div class="pn-empty">${ico('select')}<span>${escH(t)}</span></div>`; }
function shapeSvg(k){
  const p = {rect:'<rect x="3" y="5" width="18" height="14"/>', round:'<rect x="3" y="5" width="18" height="14" rx="4"/>', ellipse:'<ellipse cx="12" cy="12" rx="9" ry="7"/>', tri:'<path d="M12 4 21 20H3z"/>', diamond:'<path d="m12 3 9 9-9 9-9-9z"/>',
    hex:'<path d="M7 4h10l5 8-5 8H7l-5-8z"/>', star:'<path d="m12 3 2.7 6 6.3.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.3 9z"/>', arrow:'<path d="M3 9h11V5l7 7-7 7v-4H3z"/>', heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    bubble:'<path d="M4 5h16v11H9l-4 4v-4H4z"/>', ring:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5" fill="var(--panel)"/>', line:'<rect x="3" y="11" width="18" height="2.4"/>', prism:'<path d="M5 3l16 9-16 9z"/>'}[k] || '';
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}
/* champ de formulaire relié à une propriété du calque sélectionné (data-p) */
function field(label, p, v, o = {}){
  const id = 'f_' + p.replace(/\W/g, '_') + '_' + (field.n = (field.n || 0) + 1);
  const kf = o.kf ? `<button type="button" class="kfb${o.kfOn ? ' on' : ''}${o.kfHere ? ' here' : ''}" data-kfp="${o.kf}" title="${o.kfOn ? (o.kfHere ? 'Image clé ici · cliquer pour la supprimer' : 'Poser une image clé à la tête de lecture') : 'Animer cette propriété (images clés)'}">${ico('key')}</button>` : '';
  if (o.type === 'range') return `<label class="fd rg" for="${id}"><span>${escH(label)}${kf}</span><output>${o.fmt ? o.fmt(v) : v}</output><input id="${id}" type="range" data-p="${p}" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${v}"${o.dis ? ' disabled' : ''}></label>`;
  if (o.type === 'color') return `<label class="fd col" for="${id}"><span>${escH(label)}</span><input id="${id}" type="color" data-p="${p}" value="${hexOk(v) ? v.slice(0, 7) : '#000000'}">${o.clear ? `<button type="button" class="fd-x" data-clear="${p}" title="Aucune">✕</button>` : ''}</label>`;
  if (o.type === 'select') return `<label class="fd sel" for="${id}"><span>${escH(label)}</span><select id="${id}" data-p="${p}">${Object.entries(o.opts).map(([k, n]) => `<option value="${escH(k)}"${String(v) === String(k) ? ' selected' : ''}>${escH(n)}</option>`).join('')}</select></label>`;
  if (o.type === 'check') return `<label class="fd chk"><input type="checkbox" data-p="${p}"${v ? ' checked' : ''}><span>${escH(label)}</span></label>`;
  if (o.type === 'textarea') return `<label class="fd ta" for="${id}"><span>${escH(label)}</span><textarea id="${id}" data-p="${p}" rows="3">${escH(v)}</textarea></label>`;
  return `<label class="fd num" for="${id}"><span>${escH(label)}${kf}</span><input id="${id}" type="number" data-p="${p}" value="${round(+v || 0, o.dec ?? 1)}" step="${o.step || 1}"${o.min != null ? ` min="${o.min}"` : ''}${o.max != null ? ` max="${o.max}"` : ''}>${o.unit ? `<em>${o.unit}</em>` : ''}</label>`;
}

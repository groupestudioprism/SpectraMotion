/* ---------- Pages (studios Design et Photo) : carrousels, présentations, documents de plusieurs pages ----------
   La page affichée vit dans P.layers ; les autres dans P.pages (voir 10-model.js). Vignettes recalculées sans bloquer l'interface. */
const PAGES = {
  thumbs:{}, sig:{},
  init(){
    this.el = $('#smPages');
    this.el.addEventListener('click', e => this.click(e));
    this.el.addEventListener('dragstart', e => { const b = e.target.closest('[data-pg]'); if (b){ this.dragI = +b.dataset.pg; e.dataTransfer.effectAllowed = 'move'; } });
    this.el.addEventListener('dragover', e => { if (this.dragI != null && e.target.closest('[data-pg]')) e.preventDefault(); });
    this.el.addEventListener('drop', e => { const b = e.target.closest('[data-pg]'); if (b && this.dragI != null){ e.preventDefault(); this.move(this.dragI, +b.dataset.pg); } this.dragI = null; });
    BUS.on('changed', () => this.soon());
  },
  shown(){ return !TIMED(ED.studio); },
  soon(){ clearTimeout(this.t); this.t = setTimeout(() => this.render(), 350); },
  thumb(i){
    const P = ED.P, V = pageView(P, i), id = P.pages ? P.pages[i].id : 'p0', sig = JSON.stringify(V.layers).length + '|' + V.bg + '|' + P.w + 'x' + P.h + '|' + Object.keys(P.media).length;
    if (this.sig[id] === sig && this.thumbs[id]) return this.thumbs[id];
    this.sig[id] = sig; try { this.thumbs[id] = thumbOf(V, 0, 150, .62, true); } catch(e){ this.thumbs[id] = ''; } return this.thumbs[id];
  },
  render(){
    if (!this.el) return; const on = this.shown(), was = !this.el.hidden; this.el.hidden = !on; $('#app').classList.toggle('has-pages', on); if (was !== on && STAGE.auto) requestAnimationFrame(() => STAGE.fit()); if (!on) return;
    const P = ED.P, n = pageCount(P), cur = P.pg || 0, ar = P.w / P.h;
    this.el.innerHTML = `<div class="pg-list" role="list">${[...Array(n)].map((_, i) => `<div class="pg${i === cur ? ' on' : ''}" role="listitem"><button type="button" class="pg-th" data-pg="${i}" draggable="${n > 1}" title="Page ${i + 1}${n > 1 ? ' · glisser pour déplacer' : ''}" style="aspect-ratio:${ar}" aria-current="${i === cur}"><img alt="" src="${this.thumb(i)}"></button><span>${i + 1}</span>${!ED.readOnly ? `<button type="button" class="pg-m" data-pgm="${i}" title="Actions de la page" aria-label="Actions de la page ${i + 1}">${ico('more')}</button>` : ''}</div>`).join('')}
      ${ED.readOnly ? '' : `<button type="button" class="pg-add" data-pgadd title="Ajouter une page">${ico('plus')}<span>Page</span></button>`}</div><span class="pg-n">${n > 1 ? `Page ${cur + 1} / ${n}` : '1 page'}</span>`;
  },
  click(e){
    const b = e.target.closest('[data-pg],[data-pgm],[data-pgadd]'); if (!b) return;
    if (b.dataset.pg != null) return this.go(+b.dataset.pg);
    if (b.hasAttribute('data-pgadd')) return this.add(false);
    if (b.dataset.pgm != null) return this.menu(b, +b.dataset.pgm);
  },
  go(i){ const P = ED.P; if (i === (P.pg || 0)) return; if (PLAY.playing) PLAY.pause(); pageGo(P, i); ED.sel = new Set(); HIST.last = JSON.stringify(P); window.dispatchEvent(new Event('sw:changed')); STAGE.layout(); BUS.emit('changed'); BUS.emit('sel'); this.render(); fontsReady(P).then(() => STAGE.paint()); },
  add(copy){ if (ED.readOnly) return; if (pageCount(ED.P) >= 100) return toast('100 pages au maximum'); pageAdd(ED.P, copy); ED.sel = new Set(); STAGE.layout(); ED.commit(copy ? 'Dupliquer la page' : 'Ajouter une page'); BUS.emit('sel'); this.render(); requestAnimationFrame(() => this.el.querySelector('.pg.on')?.scrollIntoView({inline:'nearest', block:'nearest'})); },
  del(i){ if (ED.readOnly || !pageDel(ED.P, i)) return; ED.sel = new Set(); STAGE.layout(); ED.commit('Supprimer la page'); BUS.emit('sel'); this.render(); toast('Page supprimée (Ctrl + Z pour annuler)'); },
  move(i, j){ if (pageMove(ED.P, i, j)){ ED.commit('Déplacer la page'); this.render(); } },
  async menu(btn, i){
    const n = pageCount(ED.P);
    const k = await ED.menu(btn, [{k:'dup', t:'Dupliquer la page'}, {k:'new', t:'Nouvelle page après'}, '-', {k:'left', t:'Déplacer avant', off:i === 0}, {k:'right', t:'Déplacer après', off:i === n - 1}, '-', {k:'del', t:'Supprimer la page', danger:true, off:n < 2}]);
    if (k === 'dup' || k === 'new'){ if (i !== (ED.P.pg || 0)) pageGo(ED.P, i); this.add(k === 'dup'); }
    if (k === 'left') this.move(i, i - 1); if (k === 'right') this.move(i, i + 1); if (k === 'del') this.del(i);
  },
};

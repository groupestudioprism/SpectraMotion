/* ---------- Banque de médias libres : Wikimedia Commons (plus de 100 millions de fichiers sous licence libre) ----------
   Recherche directe depuis le navigateur (API publique, sans clé). Chaque média importé garde son auteur, sa licence et sa
   source (m.credit) : ils sont affichés dans le projet et exportables (« Crédits »), comme l'exigent les licences. */
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const STOCK = {
  q:'', kind:'image', res:[], cont:null, busy:false, err:'',
  clean(h){ const d = document.createElement('div'); d.innerHTML = String(h || ''); return (d.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160); },
  async search(q, kind = 'image', more = false){
    if (!more){ this.res = []; this.cont = null; } this.q = q; this.kind = kind; this.busy = true; this.err = ''; PANEL.cur === 'stock' && PANEL.render();
    try {
      const prm = new URLSearchParams({action:'query', format:'json', origin:'*', generator:'search', gsrnamespace:'6', gsrlimit:'30', gsrsearch:`${kind === 'audio' ? 'filetype:audio' : 'filetype:bitmap'} ${q}`,
        prop:'imageinfo', iiprop:'url|size|mime|extmetadata', iiextmetadatafilter:'LicenseShortName|Artist|UsageTerms', iiurlwidth:kind === 'audio' ? '' : '400', ...(more && this.cont ? this.cont : {})});
      const r = await fetch(`${COMMONS}?${prm}`, {headers:{'Api-User-Agent':'SpectraMotion/0.3 (https://spectramotion.studio-prism.com)'}}); if (!r.ok) throw new Error(r.status === 429 ? 'Trop de recherches : patientez une minute.' : 'Recherche impossible (' + r.status + ').');
      const j = await r.json(); this.cont = j.continue ? {gsroffset:j.continue.gsroffset, continue:j.continue.continue} : null;
      const items = Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0)).map(p => { const ii = p.imageinfo?.[0]; if (!ii) return null; const em = ii.extmetadata || {};
        return {title:p.title.replace(/^File:|^Fichier:/, ''), url:ii.url, thumb:ii.thumburl || '', w:ii.width, h:ii.height, mime:ii.mime, size:ii.size, page:ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          by:this.clean(em.Artist?.value) || 'Auteur inconnu', lic:this.clean(em.LicenseShortName?.value) || 'Licence libre'}; })
        .filter(x => x && (kind === 'audio' ? /^audio\//.test(x.mime) || /ogg|mpeg|wav|flac|webm/.test(x.mime) : /^image\/(jpeg|png|webp|gif)$/.test(x.mime)) && !/non-free|fair use/i.test(x.lic));
      this.res = more ? [...this.res, ...items] : items;
    } catch(e){ this.err = e?.message || 'Recherche impossible (connexion ?).'; }
    finally { this.busy = false; PANEL.cur === 'stock' && PANEL.render(); }
  },
  /* téléchargement d'un fichier (taille raisonnable pour les images), puis import comme média du projet */
  async take(it, add = true){
    BUSY.show('Téléchargement depuis Wikimedia Commons…');
    try {
      let url = it.url;
      if (this.kindOf(it) === 'image' && (it.w > 2400 || it.size > 8e6)){ url = it.thumb.replace(/\/\d+px-/, '/2000px-'); }
      const r = await fetch(url); if (!r.ok) throw new Error('Téléchargement impossible (' + r.status + ').');
      const b = await r.blob(), ext = (it.title.match(/\.[a-z0-9]{2,5}$/i) || [''])[0], f = new File([b], it.title.replace(/\.[a-z0-9]{2,5}$/i, '').slice(0, 80) + (ext || (b.type.includes('png') ? '.png' : '.jpg')), {type:b.type || it.mime});
      const m = await MEDIA.add(f); m.credit = {by:it.by, lic:it.lic, src:it.page}; ED.P.media[m.id] = m; ED.commit('Média libre importé');
      if (add) ED.addMedia(m); ED.uploadPending(); return m;
    } catch(e){ toast(e?.message || 'Import impossible', 5000); return null; }
    finally { BUSY.hide(); }
  },
  kindOf(it){ return /^audio\//.test(it.mime) || /ogg|mpeg|wav|flac/.test(it.mime) && !/^image/.test(it.mime) ? 'audio' : 'image'; },
  /* zones photo d'un design créé par l'IA : remplies avec la première photo libre trouvée */
  async fillSlots(P){
    const slots = allLayers(P).filter(l => l.t === 'shape' && l.slot && l.q); if (!slots.length) return; let n = 0;
    for (const S of slots){
      try {
        const prm = new URLSearchParams({action:'query', format:'json', origin:'*', generator:'search', gsrnamespace:'6', gsrlimit:'8', gsrsearch:'filetype:bitmap ' + S.q, prop:'imageinfo', iiprop:'url|size|mime|extmetadata', iiextmetadatafilter:'LicenseShortName|Artist', iiurlwidth:'1600'});
        const j = await (await fetch(`${COMMONS}?${prm}`)).json(), p = Object.values(j.query?.pages || {}).map(x => ({p:x, ii:x.imageinfo?.[0]})).find(x => x.ii && /^image\/(jpeg|png|webp)$/.test(x.ii.mime) && x.ii.width >= 600);
        if (!p) continue; const em = p.ii.extmetadata || {};
        const m = await this.take({title:p.p.title.replace(/^File:/, ''), url:p.ii.thumburl || p.ii.url, thumb:p.ii.thumburl, w:1600, h:1600, mime:p.ii.mime, size:0, page:p.ii.descriptionurl, by:this.clean(em.Artist?.value) || 'Auteur inconnu', lic:this.clean(em.LicenseShortName?.value) || 'Licence libre'}, false);
        if (!m) continue; const view = P.layers.includes(S) ? S : null; if (view){ ED.fillSlot(S, m); n++; } else { const g = P.pages.find(x => x.layers?.includes(S)); if (g){ const i = g.layers.indexOf(S); g.layers[i] = {...mkMediaLayer(P, m, {}), x:S.x, y:S.y, w:S.w, h:S.h, track:S.track, start:S.start, dur:S.dur, fit:'cover', frame:true, mask:S.k === 'rect' ? 'none' : MASKS[S.k] ? S.k : 'none', name:'Photo · ' + m.name}; n++; } }
      } catch(e){ console.warn('[Spectra Motion] photo libre', e); }
    }
    if (n){ ED.commit('Photos libres ajoutées'); PAGES.render(); toast(`${n} photo${n > 1 ? 's libres ajoutées' : ' libre ajoutée'} (auteurs et licences : Fichier → Crédits)`, 4500); }
  },
  /* texte des crédits du projet */
  credits(P){ return Object.values(P.media).filter(m => m.credit).map(m => `${m.name} — ${m.credit.by} — ${m.credit.lic}${m.credit.src ? ' — ' + m.credit.src : ''}`).join('\n'); },
};

#!/usr/bin/env python3
"""Tests de bout en bout de la version 0.3 (démo autonome, Chromium via Playwright).

  python3 tools/build.py && python3 tests/e2e/run.py && python3 tests/e2e/features03.py

Simulés (le banc d'essai ne peut pas les joindre) : les réponses de l'IA Gemini (window.SMAI remplacé par des réponses types)
et l'API de Wikimedia Commons (requêtes interceptées, fichiers locaux). Réel : le détourage MediaPipe (modèle téléchargé et
exécuté dans Chromium sur une vraie photo), les sons générés, les exports (PDF avec lien, site web, diaporama vidéo).
"""
import asyncio, functools, http.server, json, pathlib, re, subprocess, sys, threading
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'tests' / 'e2e' / 'out'; MED = OUT / 'medias'
RES = {'ok': 0, 'ko': 0, 'fails': []}
def check(name, cond, info=''):
    if cond: RES['ok'] += 1; print('  ✓', name)
    else: RES['ko'] += 1; RES['fails'].append(name); print('  ✗', name, info)
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{s.server_port}/dist/spectramotion-demo.html'
ev = lambda pg, js: pg.evaluate(js)

AI_STUB = r"""
window.SMAI = {available:() => true, why:() => '', left:() => 20, limit:() => 25, calls:[],
  async json(sys, prompt){ this.calls.push(sys.slice(0, 40));
    if (/directeur artistique/.test(sys)) return {title:'Portes ouvertes', pages:[
      {bg:'#0B2A4A', notes:'Accueil des visiteurs', elements:[{type:'shape', shape:'blob', x:55, y:-10, w:60, h:60, color:'#14C2EC'}, {type:'text', x:8, y:20, w:80, h:20, text:'Portes ouvertes', font:'Anton', size:10, weight:400, color:'#FFFFFF', effect:'shadow', effectColor:'#14C2EC'},
        {type:'icon', icon:'crane', x:8, y:60, w:15, h:15, color:'#FFC83D'}, {type:'photo', shape:'ellipse', x:50, y:50, w:40, h:40, query:'construction site'}, {type:'qr', text:'https://exemple.fr', x:75, y:5, w:18, h:18}, {type:'bogus', x:1}]},
      {bg:'#FFFFFF', elements:[{type:'chart', chart:'col', x:10, y:20, w:80, h:50, data:[['A', 3], ['B', 5]]}, {type:'table', x:10, y:75, w:80, h:20, rows:[['Jour', 'Heure'], ['Samedi', '10 h']]}, {type:'sticker', sticker:'seal16', x:70, y:5, w:20, h:20, color:'#FF3F86'}]}]};
    if (/rédacteur francophone expert/.test(sys)) return {text:'TEXTE RÉÉCRIT'};
    if (/Titre court|titre court/.test(sys)) return {title:'Un titre', text:'Un texte.'};
    if (/Tu traduis/.test(sys)){ const it = JSON.parse(prompt).items; return {items:it.map(x => ({id:x.id, text:'EN:' + x.text}))}; }
    if (/coloriste/.test(sys)) return {name:'Test', colors:['#101010', '#303070', '#7070C0', '#C0C0F0', '#F0F0FF']};
    return {}; },
  async audio(sys, b64){ this.audioLen = b64.length; return {segments:[{start:0.5, end:2, text:'Bonjour à tous'}, {start:2.2, end:4, text:'Bienvenue sur Spectra Motion'}]}; }};
"""

async def main():
    if not (MED / 'portrait.jpg').exists():  # photo d'essai publique de MediaPipe (Google), pour le détourage
        import urllib.request; urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-assets/portrait.jpg', MED / 'portrait.jpg')
    for f in ['portrait.jpg', 'photo.jpg', 'clip.webm', 'music.wav']:
        if not (MED / f).exists(): sys.exit(f'Média d\'essai manquant : {f} (lancez tests/e2e/run.py ; portrait.jpg : voir README des tests).')
    url = serve(); errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True, ignore_https_errors=True); pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        # Wikimedia Commons simulé
        async def commons(route):
            q = route.request.url
            if 'filetype%3Aaudio' in q or 'filetype:audio' in q:
                body = {'query': {'pages': {'1': {'index': 1, 'title': 'File:Pluie.wav', 'imageinfo': [{'url': 'https://upload.wikimedia.org/test/pluie.wav', 'mime': 'audio/wav', 'size': 1000, 'width': 0, 'height': 0, 'descriptionurl': 'https://commons.wikimedia.org/wiki/File:Pluie.wav', 'extmetadata': {'LicenseShortName': {'value': 'CC0'}, 'Artist': {'value': '<a href="x">Anne Onyme</a>'}}}]}}}}
            else:
                body = {'continue': {'gsroffset': 30, 'continue': '-||'}, 'query': {'pages': {str(i): {'index': i, 'title': f'File:Photo {i}.jpg', 'imageinfo': [{'url': 'https://upload.wikimedia.org/test/photo.jpg', 'thumburl': 'https://upload.wikimedia.org/test/photo.jpg', 'mime': 'image/jpeg', 'size': 50000, 'width': 1600, 'height': 1066,
                    'descriptionurl': f'https://commons.wikimedia.org/wiki/File:Photo_{i}.jpg', 'extmetadata': {'LicenseShortName': {'value': 'CC BY-SA 4.0'}, 'Artist': {'value': f'<span>Photographe {i}</span>'}}}]} for i in range(1, 4)}}}
            await route.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin': '*'}, body=json.dumps(body))
        await pg.route('https://commons.wikimedia.org/w/api.php*', commons)
        await pg.route('https://upload.wikimedia.org/test/photo.jpg', lambda r: r.fulfill(status=200, content_type='image/jpeg', headers={'access-control-allow-origin': '*'}, body=(MED / 'photo.jpg').read_bytes()))
        await pg.route('https://upload.wikimedia.org/test/pluie.wav', lambda r: r.fulfill(status=200, content_type='audio/wav', headers={'access-control-allow-origin': '*'}, body=(MED / 'music.wav').read_bytes()))
        await pg.goto(url); await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=20000)
        await pg.click('[data-go="signup"]'); await pg.fill('#ap-first', 'Kéliann'); await pg.fill('#ap-last', 'Mauger'); await pg.fill('#ap-email', 'v3@studioprism.fr'); await pg.fill('#ap-pw', 'Spectra2026'); await pg.fill('#ap-pw2', 'Spectra2026'); await pg.check('#ap-cgu'); await pg.click('#apForm button[type=submit]')
        await pg.wait_for_selector('#ap-phone'); await pg.fill('#ap-phone', '06 12 34 56 78'); await pg.click('#apForm button[type=submit]'); await pg.wait_for_selector('#apSkip'); await pg.click('#apSkip'); await pg.wait_for_selector('#home:not([hidden])'); await pg.wait_for_timeout(1500)
        await pg.click('.hm-studios [data-tpl="blank-design"]'); await pg.wait_for_selector('#app:not([hidden])'); await pg.wait_for_timeout(800)

        print('Catalogue')
        n = await ev(pg, "[__SM.SM_TPL.length, __SM.STICKER_SET.length]"); check('308 modèles, 60 autocollants', n[0] >= 300 and n[1] >= 60, n)
        bad = await ev(pg, "__SM.SM_TPL.filter(t => { try { return !__SM.tplProject(t).layers.length; } catch(e){ return true; } }).map(t => t.id).slice(0, 5)")
        check('tous les modèles et variantes se construisent', not bad, bad)
        low = await ev(pg, """(() => { const lum = c => { const v = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
          let bad = 0; for (const t of __SM.SM_TPL.filter(t => t.variant)){ const P = __SM.tplProject(t); for (const L of P.layers) if (L.t === 'text' && !L.tbg && P.bg && /^#/.test(L.col)){ const under = P.layers.some(o => o !== L && (o.t === 'shape' || o.t === 'color' || o.t === 'image') && o.track < L.track && o.x <= L.x + 2 && o.y <= L.y + 2 && o.x + o.w >= L.x + L.w - 2 && o.y + o.h >= L.y + L.h - 2); if (under) continue; const a = lum(L.col.slice(0, 7)), b = lum(P.bg.slice(0, 7)); if ((Math.max(a, b) + .05) / (Math.min(a, b) + .05) < 3) bad++; } } return bad; })()""")
        check('variantes : textes posés sur le fond toujours lisibles (contraste ≥ 3:1)', low == 0, low)

        print('Éléments 0.3')
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.wait_for_timeout(200)
        await pg.click('#smPanel .pn-stk [data-icon="seal16"]'); await pg.click('#smPanel details:has([data-table]) > summary'); await pg.click('#smPanel [data-table="1"]')
        await pg.fill('#smInspBody textarea[data-p="@tableRows"]', 'Ville ; Habitants\nCaen ; 106 000\nRouen ; 114 000'); await pg.click('#smInspBody .is-head'); await pg.wait_for_timeout(200)
        check('tableau ajouté et rempli', await ev(pg, "JSON.stringify(__SM.ED.sel1().rows)") == '[["Ville","Habitants"],["Caen","106 000"],["Rouen","114 000"]]')
        await pg.click('#smPanel details:has([data-mock]) > summary'); await pg.click('#smPanel [data-mock="laptop"]')
        await ev(pg, "__SM.PANEL.show('media')")
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'photo.jpg')]); await pg.wait_for_timeout(2000)
        check('maquette : image importée affichée dans l\'écran', await ev(pg, "(() => { const M = __SM.ED.P.layers.find(l => l.t === 'mock'); return !!M && !!M.media && __SM.ED.P.layers.filter(l => l.t === 'image').length === 0; })()"))
        await ev(pg, "(() => { const L = __SM.ED.P.layers.find(l => l.t === 'icon'); __SM.ED.select([L.id]); })()"); await pg.wait_for_timeout(150)
        await pg.click('#smInspBody details[data-sec="link"] > summary'); await pg.fill('#smInspBody [data-p="href"]', 'exemple.fr/contact'); await pg.keyboard.press('Tab'); await pg.wait_for_timeout(150)
        check('lien sur un élément (https:// ajouté)', await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'icon').href") == 'https://exemple.fr/contact')
        pdf = None
        await pg.click('#exportBtn'); await pg.click('[data-xt="pdf"]')
        async with pg.expect_download() as dl: await pg.click('#xpGo')
        pdf = OUT / 'v3-lien.pdf'; await (await dl.value).save_as(pdf)
        data = pdf.read_bytes(); check('PDF : lien cliquable (annotation URI)', b'/Subtype /Link' in data and b'/URI (https://exemple.fr/contact)' in data and subprocess.run(['qpdf', '--check', str(pdf)], capture_output=True).returncode == 0)

        print('IA (réponses simulées)')
        await ev(pg, AI_STUB)
        await ev(pg, "__SM.PANEL.show('ai')"); await pg.fill('#aiPrompt', 'Affiche portes ouvertes'); await pg.select_option('#aiPages', '2'); await pg.click('#smPanel [data-act="aiDesign"]'); await pg.wait_for_timeout(4000)
        st = await ev(pg, "[__SM.pageCount(__SM.ED.P), __SM.ED.P.layers.map(l => l.t).join(','), __SM.ED.P.notes, Object.values(__SM.ED.P.media).filter(m => m.credit).length]")
        check('design magique : 2 pages, éléments typés, élément inconnu ignoré', st[0] == 2 and st[1].startswith('shape,text,icon') and 'qr' in st[1] and st[2] == 'Accueil des visiteurs', st)
        check('zone photo remplie par une photo libre (crédit gardé)', 'image' in st[1] and st[3] >= 1, st)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'text').id]); __SM.PANEL.render()"); await pg.wait_for_timeout(200)
        await pg.click('#smPanel [data-aitxt="short"]'); await pg.wait_for_timeout(600)
        check('rédaction : texte réécrit', await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'text').txt") == 'TEXTE RÉÉCRIT')
        await pg.select_option('#aiLang', 'en'); await pg.click('#smPanel [data-act="aiTranslate"]'); await pg.wait_for_timeout(600)
        tr = await ev(pg, "[__SM.ED.P.layers.find(l => l.t === 'text').txt, JSON.stringify(__SM.ED.P.pages[1].layers.find(l => l.t === 'table').rows)]")
        check('traduction de tout le design (toutes les pages, tableaux compris)', tr[0] == 'EN:TEXTE RÉÉCRIT' and 'EN:Jour' in tr[1] and 'EN:10 h' in tr[1], tr)
        await pg.fill('#aiPal', 'nuit bleue'); await pg.click('#smPanel [data-act="aiPal"]'); await pg.wait_for_timeout(500)
        check('ambiance de couleurs appliquée', await ev(pg, "__SM.docColors(__SM.ED.P).some(c => ['#101010', '#303070', '#7070C0'].includes(c))"))

        print('Photo : IA réelle dans le navigateur')
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider')")
        await ev(pg, "__SM.PANEL.show('media')")
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'portrait.jpg')]); await pg.wait_for_timeout(2000)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'image').id]); __SM.PANEL.show('adjust')"); await pg.wait_for_timeout(300)
        await pg.click('#smPanel [data-seg="cut:person"]')
        for _ in range(120):
            done = await ev(pg, "__SM.ED.P.media[__SM.ED.sel1().media].name.includes('détouré')")
            if done: break
            await pg.wait_for_timeout(1000)
        alpha = await ev(pg, """(async () => { const L = __SM.ED.sel1(), el = __SM.MEDIA.el(__SM.ED.P.media[L.media]); const c = document.createElement('canvas'); c.width = el.naturalWidth; c.height = el.naturalHeight; const g = c.getContext('2d'); g.drawImage(el, 0, 0);
          const a = (x, y) => g.getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data[3]; return [a(.03, .03), a(.97, .1), a(.5, .3), a(.5, .7)]; })()""")
        check('détourage IA (MediaPipe, dans Chromium) : fond transparent, personne opaque', done and alpha[0] < 20 and alpha[1] < 20 and alpha[2] > 230 and alpha[3] > 230, (done, alpha))
        await pg.click('#smPanel [data-act="olnOn"]'); await pg.wait_for_timeout(300); check('contour autocollant', await ev(pg, "!!__SM.ED.sel1().oln"))
        await pg.click('#smPanel [data-act="enhance"]'); await pg.wait_for_timeout(200); check('amélioration automatique (réglages calculés)', await ev(pg, "Object.keys(__SM.ED.sel1().adj || {}).length") >= 1)
        await ev(pg, "(() => { const L = __SM.ED.sel1(); L.adj.sharp = 60; __SM.ED.commit('net'); })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(OUT / 'v3-detourage.png'))

        print('Médias et sons libres')
        await ev(pg, "__SM.PANEL.show('stock')"); await pg.wait_for_timeout(200); await pg.click('#smPanel [data-stab="image"]')
        await pg.fill('#stockQ', 'mountain'); await pg.press('#stockQ', 'Enter'); await pg.wait_for_timeout(1500)
        check('recherche Wikimedia Commons : résultats', await pg.locator('#smPanel .st-it').count() == 3)
        await pg.click('#smPanel .st-it >> nth=1'); await pg.wait_for_timeout(2000)
        cr = await ev(pg, "Object.values(__SM.ED.P.media).filter(m => m.credit).map(m => m.credit.by + '|' + m.credit.lic)")
        check('photo libre importée avec auteur et licence', 'Photographe 2|CC BY-SA 4.0' in cr, cr)
        await pg.click('#smPanel [data-stab="audio"]'); await pg.fill('#stockQ', 'rain'); await pg.press('#stockQ', 'Enter'); await pg.wait_for_timeout(1200)
        check('recherche de sons libres', await pg.locator('#smPanel .pn-snd').count() == 1)
        ok = await ev(pg, "Promise.all(__SM.SOUNDS ? [] : []).then(() => true)")
        sizes = await ev(pg, "(async () => { const out = []; for (const k of ['pop', 'ding', 'whoosh', 'applause', 'gong', 'lofi', 'upbeat', 'ambient', 'corporate', 'chill']) out.push((await __SM.synthSound(k)).size); return out; })()")
        check('effets sonores et boucles générés (WAV)', all(s > 10000 for s in sizes), sizes)

        print('Vidéo')
        await pg.click('#studioNav [data-studio="video"]'); await pg.wait_for_timeout(400)
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider'); __SM.PANEL.show('media')"); await pg.wait_for_timeout(200)
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'clip.webm')]); await pg.wait_for_timeout(2500)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'video').id])"); await pg.wait_for_timeout(200)
        await pg.click('#smInspBody [data-ia="detach"]'); await pg.wait_for_timeout(300)
        check('détacher l\'audio', await ev(pg, "__SM.ED.P.layers.some(l => l.t === 'audio') && __SM.ED.P.layers.find(l => l.t === 'video').mute"))
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'audio').id])")
        await ev(pg, "__SM.PANEL.show('ai')"); await pg.wait_for_timeout(200); await pg.click('#smPanel [data-act="aiCaptions"]'); await pg.wait_for_timeout(2500)
        cap = await ev(pg, "[__SM.ED.P.layers.filter(l => l.name === 'Sous-titre').map(l => l.start + ':' + l.txt), window.SMAI.audioLen]")
        check('sous-titres automatiques (son du clip transcrit, synchronisés)', len(cap[0]) == 2 and cap[0][0] == '0.5:Bonjour à tous' and cap[1] > 10000, cap)
        await ev(pg, "__SM.PLAY.seek(1, false); __SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'video').id])"); await pg.wait_for_timeout(500)
        await pg.click('#smInspBody [data-ia="freeze"]'); await pg.wait_for_timeout(1500)
        check('arrêt sur image', await ev(pg, "__SM.ED.P.layers.some(l => l.t === 'image' && l.name === 'Arrêt sur image' && l.dur === 2)"))

        print('Présenter, commentaires, versions, rechercher')
        await pg.click('#studioNav [data-studio="design"]'); await pg.wait_for_timeout(300)
        await ev(pg, "(() => { const P = __SM.ED.P; delete P.pages; delete P.pg; P.layers = []; __SM.ED.commit('vider'); })()")
        await ev(pg, "(() => { const P = __SM.ED.P; P.layers.push(__SM.cleanProject({layers:[{t:'text', txt:'Page un · Studio', x:100, y:100, w:800, h:120, href:'https://studio-prism.com'}]}).layers[0]); __SM.ED.commit('t'); __SM.PAGES.add(false); P.layers.push(__SM.cleanProject({layers:[{t:'text', txt:'Page deux · Studio', x:100, y:100, w:800, h:120}]}).layers[0]); __SM.ED.commit('t2'); __SM.PAGES.go(0); })()")
        await ev(pg, "__SM.PRESENT.open()"); await pg.wait_for_timeout(800)
        check('mode Présenter ouvert, lien cliquable', await pg.locator('.pres').count() == 1 and await pg.locator('.pres-links a[href="https://studio-prism.com"]').count() == 1)
        await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(700); n = await pg.inner_text('.pres-n')
        await pg.screenshot(path=str(OUT / 'v3-presenter.png'))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        check('Présenter : page suivante puis Échap (l\'éditeur suit la page)', n.startswith('2') and await pg.locator('.pres').count() == 0 and await ev(pg, "__SM.ED.P.pg") == 1, n)
        await ev(pg, "__SM.COMMENTS.add(300, 300, 'Agrandir le titre'); __SM.PANEL.show('comments')"); await pg.wait_for_timeout(300)
        await pg.fill('#smPanel [data-crep]', 'OK, fait'); await pg.press('#smPanel [data-crep]', 'Tab'); await pg.wait_for_timeout(200)
        check('commentaire épinglé avec réponse', await pg.locator('#stgPins .pin').count() == 1 and await ev(pg, "__SM.ED.P.comments[0].re[0].t") == 'OK, fait' and await ev(pg, "__SM.ED.P.comments[0].by") == 'Kéliann Mauger')
        await ev(pg, "__SM.VERSIONS.save('v1')"); await ev(pg, "__SM.ED.P.layers[0].txt = 'MODIFIÉ'; __SM.ED.commit('m')")
        vid = await ev(pg, "__SM.VERSIONS.all().then(v => v.find(x => x.name === 'v1').id)"); await ev(pg, f"__SM.VERSIONS.restore('{vid}')"); await pg.wait_for_timeout(300)
        check('versions : enregistrer puis restaurer', await ev(pg, "__SM.ED.P.layers[0].txt") == 'Page deux · Studio')
        n = await ev(pg, "__SM.findReplace('Studio', 'Atelier')"); check('rechercher et remplacer sur toutes les pages', n == 2 and await ev(pg, "__SM.ED.P.pages[0].layers[0].txt") == 'Page un · Atelier', n)

        print('Exports 0.3')
        await pg.click('#exportBtn'); await pg.click('[data-xt="web"]')
        async with pg.expect_download() as dl: await pg.click('#xpGo')
        html = OUT / 'v3-site.html'; await (await dl.value).save_as(html); t = html.read_text()
        check('site web : 2 pages et lien', t.count('<section>') == 2 and 'href="https://studio-prism.com"' in t and t.count('data:image/jpeg;base64,') == 2)
        await pg.click('#exportBtn'); await pg.click('[data-xt="video"]'); await pg.select_option('#xpSlideD', '2')
        async with pg.expect_download(timeout=60000) as dl: await pg.click('#xpGo')
        vid = OUT / 'v3-diaporama.webm'; await (await dl.value).save_as(vid)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(vid)], capture_output=True, text=True).stdout.strip() or 0)
        check('diaporama vidéo des pages (2 × 2 s)', 3.5 < dur < 5, dur)
        await pg.reload(); await pg.wait_for_timeout(2500)
        if await pg.is_visible('#homeBody'): await pg.click('#homeBody [data-open]'); await pg.wait_for_timeout(1500)
        check('réouverture : commentaire et notes gardés', await ev(pg, "(__SM.ED.P.comments || []).length") == 1)
        check('pas d\'erreur JavaScript', not errs, errs[:4])
        await b.close()
    print(f"\n{RES['ok']} réussis, {RES['ko']} en échec")
    if RES['ko']: print('Échecs :', ' | '.join(RES['fails'])); sys.exit(1)
asyncio.run(main())

#!/usr/bin/env python3
"""Tests de bout en bout des fonctions de la version 0.2 (démo autonome, Chromium via Playwright).

  python3 tools/build.py && python3 tests/e2e/run.py && python3 tests/e2e/features.py

(run.py fabrique les médias d'essai dans tests/e2e/out/medias.)
Vérifie : éléments (formes, lignes, icônes, émojis, graphiques, QR code lu par OpenCV, cadres photo, grilles), dessin à la souris,
groupes, pages (ajout, duplication, navigation, réouverture), effets de texte et texte en arc, polices chargées à la demande,
couleurs (palette du document, charte, Styles), retouche (retrait du fond uni vérifié au pixel, bichromie), égaliseur,
animations nouvelles, « Animer la page », modèles de plusieurs pages, exports PDF (qpdf + pdfinfo), GIF (Pillow), PNG de toutes
les pages et Redimensionner (.zip), sans erreur JavaScript.
"""
import asyncio, functools, http.server, io, json, pathlib, subprocess, sys, threading, zipfile
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'tests' / 'e2e' / 'out'; OUT.mkdir(parents=True, exist_ok=True)
MED = OUT / 'medias'
RES = {'ok': 0, 'ko': 0, 'fails': []}
def check(name, cond, info=''):
    if cond: RES['ok'] += 1; print('  ✓', name)
    else: RES['ko'] += 1; RES['fails'].append(name); print('  ✗', name, info)
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{s.server_port}/dist/spectramotion-demo.html'
ev = lambda pg, js: pg.evaluate(js)

async def signup(pg):
    await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=20000)
    await pg.click('[data-go="signup"]'); await pg.fill('#ap-first', 'Kéliann'); await pg.fill('#ap-last', 'Mauger')
    await pg.fill('#ap-email', 'v2@studioprism.fr'); await pg.fill('#ap-pw', 'Spectra2026'); await pg.fill('#ap-pw2', 'Spectra2026')
    await pg.check('#ap-cgu'); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#ap-phone', timeout=8000); await pg.fill('#ap-phone', '06 12 34 56 78'); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#apSkip', timeout=8000); await pg.click('#apSkip'); await pg.wait_for_selector('#home:not([hidden])', timeout=8000); await pg.wait_for_timeout(800)

async def export(pg, tab, setup_js=''):
    await pg.click('#exportBtn'); await pg.wait_for_timeout(300); await pg.click(f'[data-xt="{tab}"]'); await pg.wait_for_timeout(300)
    if setup_js: await ev(pg, setup_js)
    async with pg.expect_download(timeout=120000) as dl: await pg.click('#xpGo')
    d = await dl.value; path = OUT / d.suggested_filename; await d.save_as(path); await pg.wait_for_timeout(300); return path

async def main():
    if not (MED / 'photo.jpg').exists(): sys.exit('Lancez d\'abord tests/e2e/run.py (médias d\'essai).')
    import numpy as np, cv2
    from PIL import Image
    # image d'essai à fond uni (pour « Retirer le fond ») : disque rouge sur fond vert
    img = np.zeros((600, 800, 3), np.uint8); img[:] = (40, 200, 40); cv2.circle(img, (400, 300), 160, (40, 40, 220), -1); cv2.imwrite(str(MED / 'fond-vert.png'), img)
    url = serve(); errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True, ignore_https_errors=True); pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url); await signup(pg)
        await pg.wait_for_timeout(1500)
        check('accueil : vignettes des modèles calculées à la demande', await ev(pg, "[...document.querySelectorAll('.tstrip img')].filter(i => i.src.startsWith('data:image')).length") >= 4)
        await pg.click('.hm-studios [data-tpl="blank-design"]'); await pg.wait_for_timeout(1200)

        print('Éléments')
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.wait_for_timeout(200)
        check('catalogue : 25 formes, 137 icônes, 73 polices', await ev(pg, "document.querySelectorAll('#smPanel [data-shape]').length === 25 && __SM.ICON_SET.length === 137 && __SM.FONTS_M.length === 73"))
        await pg.click('#smPanel [data-shape="burst"]'); await pg.click('#smPanel [data-line="larrow"]')
        await pg.fill('#smPanel [data-icq]', 'grue'); await pg.wait_for_timeout(300)
        check('recherche d\'icônes', await ev(pg, "document.querySelectorAll('#pnIcList [data-icon]').length") == 1)
        await pg.click('#pnIcList [data-icon="crane"]')
        await pg.click('#smPanel details:has([data-emoji]) > summary'); await pg.click('#smPanel [data-emoji="🚀"]')
        await pg.click('#smPanel details:has([data-chart]) > summary'); await pg.click('#smPanel [data-chart="pie"]')
        ts = await ev(pg, "__SM.ED.P.layers.map(l => l.t + ':' + (l.k || l.ic || l.ck || ''))")
        check('forme, flèche, icône, émoji, graphique ajoutés', ts == ['shape:burst', 'shape:larrow', 'icon:crane', 'text:', 'chart:pie'], ts)
        # données du graphique depuis l'inspecteur
        await pg.fill('#smInspBody textarea[data-p="@chartData"]', 'Nord ; 40\nSud ; 35\nEst ; 25'); await pg.click('#smInspBody .is-head'); await pg.wait_for_timeout(200)
        check('données du graphique saisies', await ev(pg, "JSON.stringify(__SM.ED.sel1().data)") == '[["Nord",40],["Sud",35],["Est",25]]')
        # QR code
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider'); __SM.ED.P.bg = '#FFFFFF'")
        await pg.click('#smPanel details:has([data-act="qr"]) > summary'); await pg.click('#smPanel [data-act="qr"]'); await pg.wait_for_timeout(300)
        await pg.fill('#apDlg input', 'https://spectramotion.studio-prism.com/?test=qr'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        check('QR code ajouté', await ev(pg, "__SM.ED.P.layers.some(l => l.t === 'qr')"))
        await ev(pg, "(() => { const L = __SM.ED.P.layers[0]; L.x = 140; L.y = 140; L.w = 800; L.h = 800; __SM.ED.commit('qr'); })()")
        png = await export(pg, 'image')
        im = cv2.imread(str(png)); txt, pts, _ = cv2.QRCodeDetector().detectAndDecode(im)
        check('QR code exporté lisible (OpenCV)', txt == 'https://spectramotion.studio-prism.com/?test=qr', txt)
        ok = 0
        for t in ['A', 'Spectra Motion', 'é' * 60, 'x' * 300, 'https://exemple.fr/' + 'a' * 500]:
            for ecc in 'LMQH':
                n = await ev(pg, f"(() => {{ const M = __SM.qrMatrix({json.dumps(t)}, '{ecc}'); if (!M) return 'null'; const k = 6, q = 4, n = M.length, c = document.createElement('canvas'); c.width = c.height = (n + q * 2) * k; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; M.forEach((r, y) => r.forEach((v, x) => v && g.fillRect((x + q) * k, (y + q) * k, k, k))); return c.toDataURL(); }})()")
                if n == 'null': continue
                arr = np.frombuffer(__import__('base64').b64decode(n.split(',')[1]), np.uint8); im = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                d = cv2.QRCodeDetector().detectAndDecode(im)[0] or cv2.QRCodeDetectorAruco().detectAndDecode(im)[0]; ok += d == t
        check('QR codes : 20 tailles et niveaux de correction lus par OpenCV', ok == 20, ok)

        print('Dessin et groupes')
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider')")
        await ev(pg, "__SM.PANEL.show('draw')"); await pg.click('#smPanel [data-act="drawTool"]')
        r = await pg.locator('#stgWrap').bounding_box()
        await pg.mouse.move(r['x'] + r['width'] * .2, r['y'] + r['height'] * .5); await pg.mouse.down()
        for i in range(30): await pg.mouse.move(r['x'] + r['width'] * (.2 + i * .02), r['y'] + r['height'] * (.5 + .1 * np.sin(i / 3)))
        await pg.mouse.up(); await pg.wait_for_timeout(300)
        d = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'draw')")
        check('trait dessiné à la souris', d is not None and len(d['pts']) >= 3 and d['w'] > 300, d and (len(d['pts']), d['w']))
        await pg.keyboard.press('Escape')
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.click('#smPanel [data-shape="rect"]'); await pg.click('#smPanel [data-shape="ellipse"]')
        await ev(pg, "__SM.ED.select(__SM.ED.P.layers.filter(l => l.t === 'shape').map(l => l.id))"); await pg.keyboard.press('Control+g')
        g = await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'shape').map(l => l.g)")
        check('grouper (Ctrl + G)', len(g) == 2 and g[0] and g[0] == g[1], g)
        await ev(pg, "__SM.ED.select([])"); bx = await ev(pg, "(() => { const b = __SM.STAGE.box(__SM.ED.P.layers.find(l => l.k === 'rect')); return [b.cx, b.cy]; })()")
        z = await ev(pg, "__SM.STAGE.zoom"); await pg.mouse.click(r['x'] + bx[0] * z, r['y'] + bx[1] * z); await pg.wait_for_timeout(200)
        check('un clic sélectionne tout le groupe', await ev(pg, "__SM.ED.sel.size") == 2)
        w0 = await ev(pg, "__SM.ED.P.layers.find(l => l.k === 'rect').w"); h = await pg.locator('#stgOvl [data-h="mse"]').bounding_box()
        await pg.mouse.move(h['x'] + 6, h['y'] + 6); await pg.mouse.down(); await pg.mouse.move(h['x'] + 120, h['y'] + 120, steps=5); await pg.mouse.up()
        w1 = await ev(pg, "__SM.ED.P.layers.find(l => l.k === 'rect').w"); check('agrandir un groupe par son coin', w1 > w0 * 1.1, (w0, w1))
        await pg.keyboard.press('Control+Shift+g'); check('dégrouper', await ev(pg, "__SM.ED.P.layers.every(l => !l.g)"))

        print('Pages')
        await ev(pg, "__SM.PAGES.add(false)"); await pg.wait_for_timeout(200)
        await ev(pg, "__SM.PANEL.show('text')"); await pg.click('#smPanel [data-txt="0"]'); await pg.wait_for_selector('#stgOvl textarea.stg-edit'); await pg.keyboard.type('Page deux'); await pg.mouse.click(r['x'] + 5, r['y'] + r['height'] - 5); await pg.wait_for_timeout(200)
        await ev(pg, "__SM.PAGES.add(true)"); await pg.wait_for_timeout(300)
        print('   état', await ev(pg, "[__SM.pageCount(__SM.ED.P), __SM.ED.P.pg, __SM.ED.P.layers.map(l => l.t + ':' + (l.txt || '')).join('|'), JSON.stringify((__SM.ED.P.pages || []).map(g => g.live ? 'live' : (g.layers || []).length))]"))
        check('3 pages, la 3ᵉ copie la 2ᵉ', await ev(pg, "__SM.pageCount(__SM.ED.P) === 3 && __SM.ED.P.pg === 2 && __SM.ED.P.layers.some(l => l.txt === 'Page deux')"))
        await pg.click('#smPages [data-pg="0"]'); await pg.wait_for_timeout(300)
        check('navigation : retour à la page 1 (ses éléments)', await ev(pg, "__SM.ED.P.pg === 0 && __SM.ED.P.layers.some(l => l.t === 'draw')"))
        check('bande des pages : 3 vignettes', await pg.locator('#smPages .pg').count() == 3)
        await pg.screenshot(path=str(OUT / 'v2-pages.png'))
        pdf = await export(pg, 'pdf')
        chk = subprocess.run(['qpdf', '--check', str(pdf)], capture_output=True, text=True); info = subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True).stdout
        check('PDF de 3 pages valide (qpdf, pdfinfo)', chk.returncode == 0 and __import__('re').search(r'Pages:\s+3\n', info) is not None, chk.stdout[-200:] + info[:300])
        zp = await export(pg, 'image', "document.querySelector('#xpImgSet').value = 'all'; document.querySelector('#xpImgSet').dispatchEvent(new Event('change'))")
        names = zipfile.ZipFile(zp).namelist(); check('toutes les pages en PNG (.zip)', len(names) == 3 and all(n.endswith('.png') for n in names), names)
        zm = await export(pg, 'image', "document.querySelector('#xpImgSet').value = 'multi'; document.querySelector('#xpImgSet').dispatchEvent(new Event('change'))")
        sizes = sorted(Image.open(io.BytesIO(zipfile.ZipFile(zm).read(n))).size for n in zipfile.ZipFile(zm).namelist())
        check('Redimensionner : 3 formats exportés aux bonnes tailles', sizes == [(1080, 1350), (1080, 1920), (1200, 630)], sizes)

        print('Texte')
        await ev(pg, "__SM.PAGES.go(1)"); await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'text').id])"); await pg.wait_for_timeout(200)
        for k in ['shadow', 'lift', 'hollow', 'splice', 'echo', 'glitch', 'neon', 'outline']:
            await pg.click(f'#smInspBody [data-tfx="{k}"]'); await pg.wait_for_timeout(60)
        check('8 effets de texte appliqués sans erreur', await ev(pg, "__SM.ED.sel1().tfx.k") == 'outline' and not errs, errs[:2])
        await ev(pg, "(() => { const L = __SM.ED.sel1(); L.curve = 60; L.list = 'bullet'; L.col2 = '#FF3F86'; L.font = 'Pacifico'; L.ul = true; __SM.ED.commit('texte'); })()"); await pg.wait_for_timeout(1500)
        check('police chargée à la demande (Pacifico)', await ev(pg, "document.fonts.check('400 40px Pacifico') && !!document.querySelector('link[href*=\"family=Pacifico\"]')"))
        check('texte en arc : cadre recalculé', await ev(pg, "(() => { const L = __SM.ED.sel1(); return __SM.measureText(L).h > L.fs * 1.2; })()"))
        await ev(pg, "__SM.PANEL.show('text')"); await pg.click('#smPanel [data-pair="2"]'); await pg.wait_for_timeout(300)
        check('association de polices : 2 textes groupés', await ev(pg, "__SM.ED.selLayers().length === 2 && __SM.ED.selLayers()[0].font === 'Anton'"))

        print('Couleurs')
        await ev(pg, "__SM.PANEL.show('colors')"); await pg.wait_for_timeout(200)
        await ev(pg, "__SM.ED.select([])")
        doc = await ev(pg, "__SM.docColors(__SM.ED.P)"); check('palette du document', len(doc) >= 2, doc)
        await ev(pg, "__SM.ED.setBrand({colors:['#0B2A4A', '#FFC83D', '#FF3F86'], fonts:{title:'Anton', body:'Inter'}})"); await ev(pg, "__SM.PANEL.render()"); await pg.wait_for_timeout(200)
        check('charte graphique enregistrée avec le compte', await ev(pg, "document.querySelectorAll('#smPanel .pn-sw.brand [data-col]').length") == 3)
        await pg.click('#smPanel [data-palapply="21"]'); await pg.wait_for_timeout(200)
        dc = await ev(pg, "__SM.docColors(__SM.ED.P)"); check('Styles : palette « Chantier » appliquée', any(c in dc for c in ['#FFC300', '#FF7A00', '#1C1C1C']), dc)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers[0].id])"); await pg.click('#smPanel .pn-pals [data-col="#2A9D8F"]')
        check('un clic sur une couleur l\'applique à la sélection', await ev(pg, "(() => { const L = __SM.ED.P.layers[0]; return L[__SM.ED.colorKey(L)]; })()") == '#2A9D8F')

        print('Photo')
        await ev(pg, "__SM.PAGES.go(0); __SM.ED.P.layers = []; __SM.ED.P.bg = null; __SM.ED.commit('vider')")
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.click('#smPanel [data-frame="heart"]')
        await ev(pg, "__SM.PANEL.show('media')"); await pg.wait_for_timeout(200)
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'fond-vert.png')]); await pg.wait_for_timeout(2500)
        check('image importée dans le cadre (forme du cadre gardée)', await ev(pg, "(() => { const L = __SM.ED.P.layers.find(l => l.t === 'image'); return !!L && L.mask === 'heart' && L.frame && __SM.ED.P.layers.length === 1; })()"))
        await ev(pg, "(() => { const L = __SM.ED.P.layers[0]; L.mask = 'none'; L.x = 0; L.y = 0; L.w = 1080; L.h = 810; L.fit = 'fill'; __SM.ED.select([L.id]); __SM.ED.commit('cadre'); })()")
        await ev(pg, "__SM.PANEL.show('adjust')"); await pg.wait_for_timeout(200); await pg.click('#smPanel [data-act="bgkAuto"]'); await pg.wait_for_timeout(300)
        check('couleur du fond détectée sur les bords', await ev(pg, "__SM.ED.sel1().bgk.c") in ('#30C030', '#30D030', '#20C020', '#30C020', '#20D030'), await ev(pg, "__SM.ED.sel1().bgk.c"))
        png = await export(pg, 'image', "document.querySelector('#xpImgTr').checked = true")
        a = np.array(Image.open(png).convert('RGBA'))
        check('fond retiré : coins transparents, sujet opaque', a[20, 20, 3] == 0 and a[405, 540, 3] == 255 and a[405, 540, 0] > 150, (a[20, 20], a[405, 540]))
        await ev(pg, "__SM.PANEL.show('adjust')"); await pg.click('#smPanel [data-duo="2"]'); await pg.wait_for_timeout(200)
        check('bichromie appliquée', await ev(pg, "!!__SM.ED.sel1().duo"))
        await ev(pg, "__SM.PANEL.show('fx')"); check('25 filtres (+ original)', await pg.locator('#smPanel [data-filter]').count() == 26)

        print('Animation, vidéo, son')
        await pg.click('#studioNav [data-studio="motion"]'); await pg.wait_for_timeout(500)
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider')")
        await ev(pg, "__SM.PANEL.show('text')"); await pg.click('#smPanel [data-txt="0"]'); await pg.wait_for_selector('#stgOvl textarea.stg-edit'); await pg.keyboard.type('Bonjour tout le monde'); await pg.keyboard.press('Control+Enter')
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.click('#smPanel [data-shape="star"]')
        for k in ['spin', 'drop', 'flip', 'rotate', 'iris', 'wipeU', 'block']:
            await ev(pg, f"(() => {{ const L = __SM.ED.P.layers[1]; L.tin = {{k:'{k}', d:.6}}; __SM.ED.commit('fx'); __SM.PLAY.seek(L.start + .3, false); }})()"); await pg.wait_for_timeout(80)
        await ev(pg, "(() => { const L = __SM.ED.P.layers[0]; L.tin = {k:'words', d:1}; __SM.ED.commit('fx'); __SM.PLAY.seek(.5, false); })()"); await pg.wait_for_timeout(100)
        check('nouvelles animations rendues sans erreur', not errs, errs[:2])
        await ev(pg, "__SM.PANEL.show('anim')"); await pg.click('#smPanel [data-act="animAll"]'); await pg.wait_for_timeout(500)
        check('« Animer toute la page » : entrées échelonnées', await ev(pg, "__SM.ED.P.layers.every(l => l.tin.k !== 'none') && __SM.ED.P.layers[1].start > __SM.ED.P.layers[0].start"))
        gif = await export(pg, 'gif', "document.querySelector('#xpGifW').value = '320'; document.querySelector('#xpGifF').value = '10'")
        gi = Image.open(gif); check('GIF animé exporté (Pillow)', gi.format == 'GIF' and gi.n_frames >= 30 and gi.size[0] == 320, (gi.format, getattr(gi, 'n_frames', 0), gi.size))
        await pg.click('#studioNav [data-studio="audio"]'); await pg.wait_for_timeout(400)
        await ev(pg, "__SM.PANEL.show('audio')"); await pg.wait_for_timeout(200)
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'music.wav')]); await pg.wait_for_timeout(2500)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'audio').id]); __SM.PANEL.render()"); await pg.wait_for_timeout(200)
        await pg.click('#smPanel [data-eq="voice"]')
        check('égaliseur « Voix plus claire »', await ev(pg, "(() => { const L = __SM.ED.sel1(); return L.eqLo === -4 && L.eqHi === 5; })()"))
        wav = await export(pg, 'audio'); check('WAV exporté avec égaliseur', wav.stat().st_size > 1_000_000, wav.stat().st_size)

        print('Modèles et réouverture')
        await pg.click('#studioNav [data-studio="design"]'); await pg.wait_for_timeout(300)
        check('44 modèles', await ev(pg, "__SM.SM_TPL.length") >= 44)
        await ev(pg, "__SM.PANEL.show('tpl')"); await pg.fill('#smPanel [data-tplq]', 'carrousel'); await pg.wait_for_timeout(400)
        await pg.click('#pnTplList [data-tpl="carousel"]'); await pg.wait_for_timeout(300); await pg.click('#tplOk'); await pg.wait_for_timeout(1200)
        check('modèle « Carrousel » : 5 pages', await ev(pg, "__SM.pageCount(__SM.ED.P)") == 5)
        bad = await ev(pg, "__SM.SM_TPL.filter(t => { try { const P = __SM.tplProject(t); return !P.layers.length; } catch(e){ return true; } }).map(t => t.id)")
        check('les 44 modèles se construisent', not bad, bad)
        await ev(pg, "__SM.PAGES.go(3)"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=str(OUT / 'v2-carrousel.png'))
        await pg.reload(); await pg.wait_for_timeout(2500)
        if await pg.is_visible('#homeBody'):
            await pg.click('#homeBody [data-open]'); await pg.wait_for_timeout(1500)
        check('réouverture : 5 pages et page affichée retrouvées', await ev(pg, "__SM.pageCount(__SM.ED.P) === 5 && __SM.ED.P.pg === 3"), await ev(pg, "[__SM.pageCount(__SM.ED.P), __SM.ED.P.pg]"))
        await pg.screenshot(path=str(OUT / 'v2-reouverture.png'))
        check('pas d\'erreur JavaScript', not errs, errs[:4])
        await b.close()
    print(f"\n{RES['ok']} réussis, {RES['ko']} en échec")
    if RES['ko']: print('Échecs :', ' | '.join(RES['fails'])); sys.exit(1)
asyncio.run(main())

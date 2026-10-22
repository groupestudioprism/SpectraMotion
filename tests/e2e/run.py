#!/usr/bin/env python3
"""Tests de bout en bout de Spectra Motion (démo autonome, Chromium via Playwright).

  python3 tools/build.py && python3 tests/e2e/run.py

Crée des médias d'essai avec ffmpeg (image, vidéo WebM avec son, son WAV), puis parcourt les cinq studios :
compte, accueil, modèles, texte, formes, import, retouche, timeline (coupe, transitions, images clés), lecture,
annuler / rétablir, exports (PNG, WAV, vidéo, paquet .zip), réouverture après rechargement, lecture seule.
Captures d'écran dans tests/e2e/out/. Code de sortie 1 si une vérification échoue.
"""
import asyncio, functools, http.server, json, pathlib, shutil, subprocess, sys, threading, zipfile
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'tests' / 'e2e' / 'out'; OUT.mkdir(parents=True, exist_ok=True)
MED = OUT / 'medias'; MED.mkdir(exist_ok=True)
RES = {'ok': 0, 'ko': 0, 'fails': []}

def check(name, cond, info=''):
    if cond: RES['ok'] += 1; print('  ✓', name)
    else: RES['ko'] += 1; RES['fails'].append(name); print('  ✗', name, info)

def media():
    if not shutil.which('ffmpeg'): sys.exit('ffmpeg est nécessaire pour fabriquer les médias d\'essai.')
    run = lambda *a: subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *a], check=True)
    if not (MED / 'photo.jpg').exists(): run('-f', 'lavfi', '-i', 'mandelbrot=size=1600x1066:rate=1', '-frames:v', '1', str(MED / 'photo.jpg'))
    if not (MED / 'clip.webm').exists(): run('-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30:duration=6', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6:sample_rate=48000',
        '-c:v', 'libvpx-vp9', '-b:v', '1M', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', '-shortest', str(MED / 'clip.webm'))
    if not (MED / 'music.wav').exists(): run('-f', 'lavfi', '-i', "aevalsrc='0.3*sin(2*PI*(220+40*sin(2*PI*0.5*t))*t)|0.3*sin(2*PI*330*t)':s=48000:d=8", str(MED / 'music.wav'))

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{s.server_port}/dist/spectramotion-demo.html'

async def signup(pg):
    await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=20000)
    await pg.click('[data-go="signup"]'); await pg.fill('#ap-first', 'Kéliann'); await pg.fill('#ap-last', 'Mauger')
    await pg.fill('#ap-email', 'test@studioprism.fr'); await pg.fill('#ap-pw', 'Spectra2026'); await pg.fill('#ap-pw2', 'Spectra2026')
    await pg.check('#ap-cgu'); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#ap-phone', timeout=8000); await pg.fill('#ap-phone', '06 12 34 56 78'); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#apSkip', timeout=8000); await pg.click('#apSkip'); await pg.wait_for_selector('#home:not([hidden])', timeout=8000); await pg.wait_for_timeout(800)

async def imp(pg, files):
    async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
    f = await fc.value; await f.set_files([str(MED / x) for x in files]); await pg.wait_for_timeout(2500)

ev = lambda pg, js: pg.evaluate(js)

async def main():
    media(); url = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url); await signup(pg)
        print('Accueil'); await pg.screenshot(path=str(OUT / '01-accueil.png'))
        check('accueil : cinq studios proposés', await pg.locator('.hm-studios [data-tpl^="blank-"]').count() == 5)
        check('accueil : modèles avec vignettes', await ev(pg, "[...document.querySelectorAll('.tstrip img')].filter(i => i.src.startsWith('data:image')).length") >= 6)

        print('Design')
        await pg.click('.hm-studios [data-tpl="blank-design"]'); await pg.wait_for_timeout(1200)
        check('projet ouvert dans le studio Design', await ev(pg, "__SM.ED.studio") == 'design')
        await ev(pg, "__SM.PANEL.show('text')"); await pg.click('#smPanel [data-txt="0"]'); await pg.wait_for_timeout(300)
        await pg.keyboard.type('Bonjour Spectra'); await pg.mouse.click(1000, 700); await pg.wait_for_timeout(300)
        check('texte écrit sur la scène', await ev(pg, "__SM.ED.P.layers.some(l => l.t === 'text' && l.txt === 'Bonjour Spectra')"))
        await ev(pg, "__SM.PANEL.show('shapes')"); await pg.click('#smPanel [data-shape="star"]'); await pg.wait_for_timeout(200)
        n = await ev(pg, "__SM.ED.P.layers.length"); check('forme ajoutée', n == 2, n)
        # déplacement à la souris (glisser la forme sélectionnée)
        box = await pg.locator('#stgOvl .sel').bounding_box(); x0 = await ev(pg, "__SM.ED.sel1().x")
        await pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); await pg.mouse.down(); await pg.mouse.move(box['x'] + box['width'] / 2 + 80, box['y'] + box['height'] / 2 + 10, steps=6); await pg.mouse.up()
        x1 = await ev(pg, "__SM.ED.sel1().x"); check('déplacement à la souris', x1 > x0 + 50, (x0, x1))
        await pg.keyboard.press('Control+z'); await pg.wait_for_timeout(200)
        check('annuler (Ctrl + Z)', abs(await ev(pg, "__SM.ED.P.layers[1].x") - x0) < 1)
        await pg.keyboard.press('Control+Shift+z'); await pg.wait_for_timeout(200)
        check('rétablir', abs(await ev(pg, "__SM.ED.P.layers[1].x") - x1) < 1)
        await pg.keyboard.press('Control+d'); check('dupliquer (Ctrl + D)', await ev(pg, "__SM.ED.P.layers.length") == 3)
        await pg.keyboard.press('Delete'); check('supprimer (Suppr)', await ev(pg, "__SM.ED.P.layers.length") == 2)
        await ev(pg, "__SM.PANEL.show('tpl')"); await pg.click('#smPanel [data-tpl="promo"]'); await pg.wait_for_timeout(200)
        if await pg.is_visible('#tplOk'): await pg.click('#tplOk')
        await pg.wait_for_timeout(800); await pg.screenshot(path=str(OUT / '02-design-modele.png'))
        check('modèle appliqué', await ev(pg, "__SM.ED.P.layers.length") >= 7)
        check('format changé (story)', (await ev(pg, "(() => { __SM.ED.setFormat({id:'story', w:1080, h:1920, name:'Story'}); return [__SM.ED.P.w, __SM.ED.P.h]; })()")) == [1080, 1920])
        async with pg.expect_download() as dl:
            await pg.click('#exportBtn'); await pg.click('#xpGo')
        d = await dl.value; png = OUT / 'export.png'; await d.save_as(png)
        check('export PNG', png.stat().st_size > 10000 and d.suggested_filename.endswith('.png'), d.suggested_filename)

        print('Photo')
        await pg.click('[data-studio="photo"]'); await pg.wait_for_timeout(400)
        await ev(pg, "__SM.PANEL.show('media')"); await imp(pg, ['photo.jpg'])
        check('image importée', await ev(pg, "Object.values(__SM.ED.P.media).some(m => m.kind === 'image' && m.w === 1600)"))
        await ev(pg, "__SM.PANEL.show('adjust')"); await pg.wait_for_timeout(200)
        sl = pg.locator('#smPanel input[data-p="adj.bri"]'); await sl.fill('40'); await sl.dispatch_event('change'); await pg.wait_for_timeout(200)
        check('réglage de luminosité', await ev(pg, "__SM.ED.sel1().adj.bri") == 40)
        await pg.click('#smPanel [data-crop="1:1"]'); await pg.wait_for_timeout(200)
        c = await ev(pg, "__SM.ED.sel1().crop"); check('recadrage 1:1', c and abs(c['w'] * 1600 - c['h'] * 1066) < 5, c)
        await pg.screenshot(path=str(OUT / '03-photo.png'))

        print('Vidéo')
        await pg.click('#homeBtn'); await pg.wait_for_timeout(800); await pg.click('.hm-studios [data-tpl="blank-video"]'); await pg.wait_for_timeout(1000)
        await ev(pg, "__SM.PANEL.show('media')"); await imp(pg, ['clip.webm'])
        await ev(pg, "__SM.PANEL.show('audio')"); await imp(pg, ['music.wav']); await pg.wait_for_timeout(1500)
        info = await ev(pg, "({v:__SM.ED.P.layers.filter(l => l.t === 'video').length, a:__SM.ED.P.layers.filter(l => l.t === 'audio').length, end:__SM.PLAY.end(), audio:Object.values(__SM.ED.P.media).find(m => m.kind === 'video').hasAudio})")
        check('vidéo et son sur la timeline', info['v'] == 1 and info['a'] == 1, info)
        check('durée du projet = fin du dernier clip', abs(info['end'] - 8) < .05, info)
        check('son de la vidéo détecté', info['audio'] is True)
        await pg.click('#tlPlay'); await pg.wait_for_timeout(1500); t = await ev(pg, "__SM.PLAY.t"); await pg.click('#tlPlay')
        check('lecture : la tête avance', 1.0 < t < 2.2, t)
        await ev(pg, "__SM.PLAY.seek(3, false)"); await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'video').id])"); await pg.keyboard.press('s')
        cl = await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'video').map(l => [l.start, l.dur, l.in])")
        check('coupe à la tête de lecture (S)', cl == [[0, 3, 0], [3, 3.008, 3]], cl)
        # glisser un clip dans la timeline
        clip = pg.locator('.clip.audio'); bb = await clip.bounding_box()
        await pg.mouse.move(bb['x'] + 40, bb['y'] + bb['height'] / 2); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 40 + 90, bb['y'] + bb['height'] / 2, steps=5); await pg.mouse.up()
        st = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'audio').start"); check('déplacer un clip à la souris', st > .5, st)
        # raccourcir par le bord droit
        await ev(pg, "__SM.TL.fitAll()"); await pg.wait_for_timeout(200)
        bb = await clip.bounding_box(); d0 = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'audio').dur")
        await pg.mouse.move(bb['x'] + bb['width'] - 3, bb['y'] + bb['height'] / 2); await pg.mouse.down(); await pg.mouse.move(bb['x'] + bb['width'] - 60, bb['y'] + bb['height'] / 2, steps=5); await pg.mouse.up()
        d1 = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'audio').dur"); check('raccourcir un clip par son bord', d1 < d0 - .3, (d0, d1))
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'video' && l.start > 0).id])")
        await ev(pg, "__SM.PANEL.show('trans')"); await pg.click('#smPanel [data-tr="tin"][data-k="fade"]')
        check('transition d\'entrée', await ev(pg, "__SM.ED.sel1().tin.k") == 'fade')
        await pg.screenshot(path=str(OUT / '04-video.png'))
        async with pg.expect_download() as dl:
            await pg.click('#exportBtn'); await pg.click('[data-xt="audio"]'); await pg.click('#xpGo')
        d = await dl.value; wav = OUT / 'mix.wav'; await d.save_as(wav)
        check('export WAV', wav.stat().st_size > 1000000, wav.stat().st_size)
        async with pg.expect_download(timeout=90000) as dl:
            await pg.click('#exportBtn'); await pg.click('[data-xt="video"]'); await pg.select_option('#xpVidRes', '480'); await pg.click('#xpGo')
        d = await dl.value; vid = OUT / ('export.' + d.suggested_filename.split('.')[-1]); await d.save_as(vid)
        probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', str(vid)], capture_output=True, text=True)
        pj = json.loads(probe.stdout or '{}'); kinds = [s['codec_type'] for s in pj.get('streams', [])]
        check('export vidéo : image + son', 'video' in kinds and 'audio' in kinds, kinds)
        check('export vidéo : durée du projet', abs(float(pj.get('format', {}).get('duration', 0)) - await ev(pg, "__SM.PLAY.end()")) < 1.0, pj.get('format'))
        async with pg.expect_download(timeout=60000) as dl:
            await pg.click('#exportBtn'); await pg.click('[data-xt="project"]'); await pg.click('#xpGo')
        d = await dl.value; zp = OUT / 'projet.zip'; await d.save_as(zp)
        names = zipfile.ZipFile(zp).namelist(); check('paquet .zip : projet + médias', 'projet.spectramotion' in names and sum(n.startswith('medias/') and not n.endswith('/') for n in names) == 2, names)

        print('Motion')
        await pg.click('#homeBtn'); await pg.wait_for_timeout(800); await pg.click('.tstrip [data-tpl="intro"]'); await pg.wait_for_timeout(1200)
        check('modèle animé ouvert dans Motion', await ev(pg, "__SM.ED.studio") == 'motion')
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.name === 'Sous-titre').id])"); await ev(pg, "__SM.PLAY.seek(2, false)")
        await pg.click('#smInspBody [data-kfp="x"]'); await ev(pg, "__SM.PLAY.seek(5, false)")
        await pg.fill('#smInspBody [data-p="x"]', '600'); await pg.press('#smInspBody [data-p="x"]', 'Enter'); await pg.wait_for_timeout(200)
        kf = await ev(pg, "__SM.ED.sel1().kf.x"); check('images clés posées', kf and len(kf) == 2 and kf[1][1] == 600, kf)
        mid = await ev(pg, "(() => { const L = __SM.ED.sel1(); return __SM.layerState(L, 3.5, __SM.ED.P).x; })()"); check('interpolation entre deux images clés', 160 < mid < 600, mid)
        await ev(pg, "__SM.PLAY.seek(3.5, false)"); await pg.wait_for_timeout(300); await pg.screenshot(path=str(OUT / '05-motion.png'))

        print('Audio et réouverture')
        await pg.click('[data-studio="audio"]'); await pg.wait_for_timeout(400); await pg.screenshot(path=str(OUT / '06-audio.png'))
        check('studio Audio', await ev(pg, "__SM.ED.studio") == 'audio')
        await pg.wait_for_timeout(2500)  # enregistrement automatique
        await pg.reload(); await pg.wait_for_selector('#home:not([hidden]), #app:not([hidden])', timeout=20000); await pg.wait_for_timeout(1500)
        if await pg.is_visible('#home'):
            await pg.click('#homeBody [data-open]'); await pg.wait_for_timeout(1500)
        check('projet rouvert après rechargement', await ev(pg, "__SM.ED.P.layers.length") >= 4)
        await pg.click('#homeBtn'); await pg.wait_for_timeout(800)
        await pg.click('#homeNav [data-htab="mine"]'); await pg.wait_for_timeout(800)
        check('trois projets enregistrés', await pg.locator('#homeBody .hcard').count() == 3, await pg.locator('#homeBody .hcard').count())
        # le projet vidéo rouvert retrouve ses médias (gardés dans l'appareil)
        await ev(pg, "[...document.querySelectorAll('#homeBody .hcard')].find(c => c.textContent.includes('Vidéo')).click()"); await pg.wait_for_timeout(2500)
        check('médias retrouvés depuis l\'appareil', await ev(pg, "Object.values(__SM.ED.P.media).every(m => !__SM.MEDIA.missing(m) && __SM.MEDIA.el(m))"))
        await pg.screenshot(path=str(OUT / '07-reouverture.png'))
        # lecture seule
        await ev(pg, "window.SWEditor.setReadOnly(true)"); n0 = await ev(pg, "__SM.ED.P.layers.length"); await pg.keyboard.press('Control+a'); await pg.keyboard.press('Delete')
        check('lecture seule : rien n\'est supprimé', await ev(pg, "__SM.ED.P.layers.length") == n0)
        await ev(pg, "window.SWEditor.setReadOnly(false)")
        # écran étroit
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(600); await pg.screenshot(path=str(OUT / '08-mobile.png'))
        check('pas d\'erreur JavaScript', not errs, errs[:5])
        await b.close()
    print(f"\n{RES['ok']} réussis, {RES['ko']} en échec")
    if RES['ko']: print('Échecs :', ' | '.join(RES['fails'])); sys.exit(1)

asyncio.run(main())

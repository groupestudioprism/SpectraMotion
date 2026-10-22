#!/usr/bin/env python3
"""Test de bout en bout du mode Firebase (vrais SDK, émulateurs locaux : Authentication, Firestore, Storage).

  npx firebase emulators:exec --only auth,firestore,storage --project archivision-studioprism "python3 tests/e2e/firebase.py"

La page en ligne (index.html) est ouverte en local avec ?emu=1 : elle se branche alors sur les émulateurs (jamais en ligne).
Parcours : inscription → projet vidéo → import d'une vidéo et d'un son → envoi des fichiers dans Storage → nouvel appareil
(navigateur vierge) → connexion → le projet s'ouvre et les médias sont téléchargés depuis Storage → suppression du projet
(fichiers supprimés). Médias d'essai : ceux de tests/e2e/out/medias (créés par tests/e2e/run.py).
"""
import asyncio, functools, http.server, json, os, pathlib, sys, threading, urllib.request
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
MED = ROOT / 'tests' / 'e2e' / 'out' / 'medias'
OUT = ROOT / 'tests' / 'e2e' / 'out'
RES = {'ok': 0, 'ko': 0, 'fails': []}
def check(name, cond, info=''):
    if cond: RES['ok'] += 1; print('  ✓', name)
    else: RES['ko'] += 1; RES['fails'].append(name); print('  ✗', name, info)
def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT)); h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start()
    return f'http://localhost:{s.server_port}/index.html?emu=1'
def storage_list(prefix):
    u = f'http://127.0.0.1:9199/v0/b/archivision-studioprism.firebasestorage.app/o?prefix={urllib.parse.quote(prefix)}'
    req = urllib.request.Request(u, headers={'Authorization': 'Bearer owner'})
    with urllib.request.urlopen(req) as r: return [i['name'] for i in json.load(r).get('items', [])]
import urllib.parse
EMAIL, PW = 'motion.test@studioprism.fr', 'Spectra2026'

async def signup(pg):
    await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=40000)
    await pg.click('[data-go="signup"]'); await pg.fill('#ap-first', 'Kéliann'); await pg.fill('#ap-last', 'Mauger')
    await pg.fill('#ap-email', EMAIL); await pg.fill('#ap-pw', PW); await pg.fill('#ap-pw2', PW)
    await pg.check('#ap-cgu'); await pg.click('#apForm button[type=submit]')
    try: await pg.wait_for_selector('#ap-phone', timeout=20000)
    except Exception: await pg.screenshot(path=str(OUT / 'fb-err.png')); print('ÉCRAN', (await pg.inner_text('#apCard'))[:600]); raise
    await pg.fill('#ap-phone', '06 12 34 56 78'); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#apSkip', timeout=20000); await pg.click('#apSkip'); await pg.wait_for_selector('#home:not([hidden])', timeout=20000); await pg.wait_for_timeout(1500)
async def login(pg):
    await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=40000)
    await pg.fill('#ap-email', EMAIL); await pg.fill('#ap-pw', PW); await pg.click('#apForm button[type=submit]')
    await pg.wait_for_selector('#home:not([hidden]), #apSkip, #apPinNew', timeout=20000)
    if await pg.is_visible('#apSkip'): await pg.click('#apSkip')
    await pg.wait_for_selector('#home:not([hidden])', timeout=20000); await pg.wait_for_timeout(1500)

async def main():
    if not (MED / 'clip.webm').exists(): sys.exit('Lancez d\'abord tests/e2e/run.py (médias d\'essai).')
    url = serve(); errs = []
    async with async_playwright() as p:
        # SM_PROXY : mandataire HTTP éventuel pour charger les SDK Firebase (gstatic) ; les émulateurs restent en direct
        prox = {'server': os.environ['SM_PROXY'], 'bypass': 'localhost,127.0.0.1'} if os.environ.get('SM_PROXY') else None
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'], proxy=prox)
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True); pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: print('CONSOLE', m.type, m.text[:300]) if m.type in ('error', 'warning') else None)
        await pg.goto(url); await signup(pg)
        check('inscription avec un compte Studio Prism (émulateur Authentication)', await pg.is_visible('#home'))
        await pg.click('.hm-studios [data-tpl="blank-video"]'); await pg.wait_for_timeout(2500)
        pid = await pg.evaluate("window.SWEditor.id"); check('projet créé dans Firestore', bool(pid), pid)
        await pg.evaluate("document.querySelector('[data-pn=\"media\"]').click()"); await pg.wait_for_timeout(300)
        if not await pg.is_visible('#smPanel [data-act="import"]'): await pg.click('[data-pn="media"]')
        async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
        f = await fc.value; await f.set_files([str(MED / 'clip.webm'), str(MED / 'music.wav')])
        for _ in range(60):
            st = await pg.evaluate("Object.values(JSON.parse(window.SWEditor.get()).media).map(m => [m.kind, m.cloud, m.path])")
            if len(st) == 2 and all(x[1] for x in st): break
            await pg.wait_for_timeout(500)
        check('médias envoyés dans Firebase Storage', len(st) == 2 and all(x[1] and x[2].startswith('spectramotion/') for x in st), st)
        await pg.wait_for_timeout(3000)
        state = await pg.evaluate("document.getElementById('cloudState').textContent"); check('projet enregistré dans le cloud', 'cloud' in state, state)
        files = storage_list('spectramotion/'); check('fichiers présents dans le bucket', len(files) == 2, files)
        size = await pg.evaluate("Object.values(JSON.parse(window.SWEditor.get()).media).reduce((a, m) => a + m.size, 0)")
        await pg.screenshot(path=str(OUT / 'fb-1-envoi.png'))
        # nouvel appareil : navigateur vierge (aucun fichier dans IndexedDB)
        ctx2 = await b.new_context(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True); pg2 = await ctx2.new_page(); pg2.on('pageerror', lambda e: errs.append(str(e)))
        await pg2.goto(url); await login(pg2)
        await pg2.click('#homeBody [data-open]'); await pg2.wait_for_timeout(1000)
        ok = False
        for _ in range(40):
            ok = await pg2.evaluate("(() => { const E = window.__SM; return null; })()") is None and await pg2.evaluate("[...document.querySelectorAll('.clip')].length") >= 2 and not await pg2.evaluate("!!document.querySelector('.clip.miss')")
            if ok: break
            await pg2.wait_for_timeout(500)
        check('autre appareil : projet ouvert, médias téléchargés depuis Storage', ok)
        await pg2.wait_for_timeout(1500); await pg2.screenshot(path=str(OUT / 'fb-2-autre-appareil.png'))
        # suppression du projet : fichiers effacés
        await pg2.click('#homeBtn'); await pg2.wait_for_timeout(1200)
        await pg2.click('#homeBody [data-menu]'); await pg2.click('#homeMenu [data-mi="del"]'); await pg2.click('#dlgOk'); await pg2.wait_for_timeout(3000)
        check('projet supprimé : fichiers retirés de Storage', storage_list('spectramotion/') == [], storage_list('spectramotion/'))
        check('pas d\'erreur JavaScript', not errs, errs[:4])
        await b.close()
    print(f"\n{RES['ok']} réussis, {RES['ko']} en échec")
    if RES['ko']: print('Échecs :', ' | '.join(RES['fails'])); sys.exit(1)
asyncio.run(main())

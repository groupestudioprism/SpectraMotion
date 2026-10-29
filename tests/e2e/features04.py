#!/usr/bin/env python3
"""Tests de bout en bout de la version 0.4 (démo autonome, Chromium via Playwright).

  python3 tools/build.py && python3 tests/e2e/run.py && python3 tests/e2e/features04.py

Vrais clics droits de la souris (événement contextmenu du navigateur), vrais exports relus par Python
(WAV : écho mesuré à l'échantillon près, PNG d'un élément seul), vrai moteur de rendu pour les réglages au pixel.
"""
import asyncio, functools, http.server, io, json, math, pathlib, re, struct, sys, threading, wave
import numpy as np
from PIL import Image
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

def make_clicks(path, every=0.5, dur=6.0, sr=48000):
    """piste de clics nets (temps forts connus) : un clic de 8 ms toutes les `every` secondes, à partir de 0,5 s"""
    n = int(dur * sr); a = np.zeros(n, dtype=np.float32); t = np.arange(int(.008 * sr)) / sr
    click = (np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 400)).astype(np.float32) * .9
    k = 0.5
    while k < dur - .05:
        i = int(k * sr); a[i:i + len(click)] += click; k += every
    pcm = (np.clip(a, -1, 1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
def read_wav(path):
    with wave.open(str(path)) as w: ch, sr, n = w.getnchannels(), w.getframerate(), w.getnframes(); d = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768
    return d.reshape(-1, ch).mean(axis=1), sr

async def menu_items(pg):
    return await ev(pg, "[...document.querySelectorAll('.ctx')].map(m => [...m.querySelectorAll('[data-ci]')].map(b => b.querySelector('span').textContent))")
async def pick(pg, *path):
    """clique un chemin d'entrées dans le menu ouvert (survol pour les sous-menus)"""
    for i, label in enumerate(path):
        loc = pg.locator('.ctx').last.locator('[data-ci]').filter(has=pg.locator('span', has_text=re.compile('^' + re.escape(label) + '$'))).first
        if i < len(path) - 1: await loc.hover(); await pg.wait_for_timeout(260)
        else: await loc.click()
    await pg.wait_for_timeout(250)
async def stage_pt(pg, lid):
    return await ev(pg, f"""(() => {{ const S = __SM.STAGE, L = __SM.ED.P.layers.find(l => l.id === '{lid}'), b = S.box(L), r = S.wrap.getBoundingClientRect(); return [r.left + b.cx * S.zoom, r.top + b.cy * S.zoom]; }})()""")
async def export(pg, tab, name):
    await pg.click('#exportBtn'); await pg.click(f'[data-xt="{tab}"]')
    async with pg.expect_download(timeout=60000) as dl: await pg.click('#xpGo')
    p = OUT / name; await (await dl.value).save_as(p); await pg.wait_for_timeout(300)
    if await pg.is_visible('#xpCancel'): await pg.click('#xpCancel')
    return p
async def import_file(pg, f):
    await ev(pg, "__SM.PANEL.show('media')"); await pg.wait_for_timeout(150)
    async with pg.expect_file_chooser() as fc: await pg.click('#smPanel [data-act="import"]')
    await (await fc.value).set_files([str(f)]); await pg.wait_for_timeout(1800)

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for f in ['photo.jpg', 'clip.webm', 'music.wav']:
        if not (MED / f).exists(): sys.exit(f'Média d\'essai manquant : {f} (lancez d\'abord tests/e2e/run.py).')
    make_clicks(MED / 'clics.wav')
    url = serve(); errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True, ignore_https_errors=True); pg = await ctx.new_page()
        await ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url); await pg.wait_for_selector('#auth:not([hidden]) .ap-tabs', timeout=20000)

        print('Clic droit hors de l\'atelier')
        await pg.mouse.click(30, 450, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('page de connexion : menu générique (recharger, plein écran, lien)', it and 'Recharger la page' in it[0], it)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(150); check('Échap ferme le menu', await pg.locator('.ctx').count() == 0)
        await pg.click('[data-go="signup"]')
        prevented = await ev(pg, "(() => { const e = new MouseEvent('contextmenu', {bubbles:true, cancelable:true, clientX:10, clientY:10}); document.querySelector('#ap-email').dispatchEvent(e); return e.defaultPrevented; })()")
        check('champ de saisie : le menu natif du navigateur est conservé', prevented is False and await pg.locator('.ctx').count() == 0)
        await pg.fill('#ap-first', 'Kéliann'); await pg.fill('#ap-last', 'Mauger'); await pg.fill('#ap-email', 'v4@studioprism.fr'); await pg.fill('#ap-pw', 'Spectra2026'); await pg.fill('#ap-pw2', 'Spectra2026'); await pg.check('#ap-cgu'); await pg.click('#apForm button[type=submit]')
        await pg.wait_for_selector('#ap-phone'); await pg.fill('#ap-phone', '06 12 34 56 78'); await pg.click('#apForm button[type=submit]'); await pg.wait_for_selector('#apSkip'); await pg.click('#apSkip'); await pg.wait_for_selector('#home:not([hidden])'); await pg.wait_for_timeout(1500)
        box = await pg.locator('#homeMain').bounding_box()
        await pg.mouse.click(box['x'] + box['width'] - 30, box['y'] + box['height'] - 30, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('accueil : menu « Nouveau projet », « Importer », affichage', it and 'Nouveau projet' in it[0] and 'Importer un fichier…' in it[0] and 'Affichage en liste' in it[0], it)
        await pick(pg, 'Nouveau projet'); await pg.wait_for_selector('#app:not([hidden])'); await pg.wait_for_timeout(900)
        check('accueil : « Nouveau projet » du clic droit ouvre l\'atelier', await ev(pg, "__SM.ED.P.studio") == 'design')

        print('Clic droit sur la scène')
        await ev(pg, "__SM.ED.addPresetText({n:'Titre', o:{txt:'Bonjour Caen', fs:.1, fw:800}})"); await pg.wait_for_selector('textarea.stg-edit'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        tid = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'text').id"); x, y = await stage_pt(pg, tid)
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(250)
        it = await menu_items(pg)
        check('élément : copier, coller, dupliquer, supprimer, style, texte, disposer, animer, PNG', it and all(k in it[0] for k in ['Copier', 'Dupliquer', 'Supprimer', 'Copier le style', 'Texte', 'Disposer', 'Animer', 'Enregistrer en PNG']), it)
        await pick(pg, 'Dupliquer'); check('« Dupliquer » ajoute une copie', await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'text').length") == 2)
        await ev(pg, "__SM.ED.undo()"); await pg.wait_for_timeout(200)
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Texte', 'MAJUSCULES')
        check('sous-menu Texte → MAJUSCULES', await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{tid}').txt") == 'BONJOUR CAEN')
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Texte', 'Première Lettre En Capitale')
        check('casse « Première Lettre En Capitale »', await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{tid}').txt") == 'Bonjour Caen')
        # navigation au clavier : descendre jusqu'à « Supprimer » puis Entrée
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(250)
        for _ in range(12):
            if (await ev(pg, "document.activeElement?.querySelector?.('span')?.textContent")) == 'Supprimer': break
            await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(40)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
        check('menu au clavier (flèches + Entrée) : « Supprimer »', await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'text').length") == 0)
        await ev(pg, "__SM.ED.undo()"); await pg.wait_for_timeout(200)
        # scène vide : ajouter une forme, couleur de fond
        await pg.mouse.click(x, y - 330, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('scène vide : coller, ajouter, fond, format, pages, affichage, présenter', it and all(k in it[0] for k in ['Coller', 'Ajouter', 'Couleur de fond', 'Format', 'Pages', 'Affichage', 'Présenter']), it)
        await pick(pg, 'Ajouter', 'Étoile'); check('scène vide → Ajouter → Étoile', await ev(pg, "__SM.ED.P.layers.some(l => l.t === 'shape' && l.k === 'star')"))
        await pg.mouse.click(x, y - 330, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Couleur de fond', '#16131F')
        check('scène vide → couleur de fond', await ev(pg, "__SM.ED.P.bg") == '#16131F')
        # style : copier sur le texte, coller sur l'étoile
        sid = await ev(pg, "(() => { const L = __SM.ED.P.layers.find(l => l.k === 'star'); L.x = 40; L.y = 40; __SM.ED.commit('pos'); return L.id; })()"); sx, sy = await stage_pt(pg, sid)
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{tid}'); L.op = .5; L.shadow = {{c:'#FF000080', b:10, x:2, y:2}}; __SM.ED.select([L.id]); }})()")
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Copier le style')
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Coller le style')
        check('copier / coller le style d\'un texte vers une forme (opacité, ombre)', await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{sid}'); return L.op === .5 && L.shadow?.c === '#FF000080'; }})()"))
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Disposer', 'Arrière-plan')
        check('Disposer → Arrière-plan', await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{sid}').track") == 0 and await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{tid}').track") >= 1)
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Disposer', 'Centrer sur la page')
        check('Disposer → Centrer sur la page', await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{sid}'), P = __SM.ED.P; return Math.abs(L.x + L.w / 2 - P.w / 2) < 1 && Math.abs(L.y + L.h / 2 - P.h / 2) < 1; }})()"))
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{sid}'); L.x = 40; L.y = 40; __SM.ED.commit('pos'); }})()"); sx, sy = await stage_pt(pg, sid)
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Verrouiller')
        check('Verrouiller', await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{sid}').lock") is True)
        await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{sid}').lock = false")
        # élément seul en PNG transparent
        await ev(pg, f"__SM.ED.select(['{tid}'])"); await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(200)
        async with pg.expect_download() as dl: await pick(pg, 'Enregistrer en PNG')
        png = OUT / 'v4-element.png'; await (await dl.value).save_as(png); im = np.array(Image.open(png).convert('RGBA'))
        L = await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{tid}'); return [L.w, L.h]; }})()")
        check('élément seul en PNG : taille du cadre, fond transparent, texte opaque', abs(im.shape[1] - L[0] * 2) <= 4 and abs(im.shape[0] - L[1] * 2) <= 4 and im[0, 0, 3] == 0 and im[:, :, 3].max() > 100, (im.shape, L))
        # animations depuis le menu
        await pg.mouse.click(x, y, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Animer', 'Entrée', 'Lettres qui montent')
        check('Animer → Entrée → Lettres qui montent', await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{tid}').tin.k") == 'lettersUp')
        await ev(pg, "__SM.PLAY.pause()")

        print('Calques, pages, médias, modèles, interface')
        await ev(pg, "__SM.PANEL.show('layers')"); await pg.wait_for_timeout(200)
        await pg.click(f'#smPanel [data-lid="{tid}"]', button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('panneau Calques : menu du calque avec « Renommer… »', it and 'Renommer…' in it[0] and 'Dupliquer' in it[0], it)
        await pg.keyboard.press('Escape')
        await pg.click('#smPages [data-pg="0"]', button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Dupliquer la page')
        check('vignette de page → Dupliquer la page', await ev(pg, "__SM.pageCount(__SM.ED.P)") == 2)
        await pg.click('#smPages [data-pg="1"]', button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Déplacer au début')
        check('vignette de page → Déplacer au début', await ev(pg, "__SM.ED.P.pg") in (0, 1) and await ev(pg, "__SM.pageCount(__SM.ED.P)") == 2)
        await import_file(pg, MED / 'photo.jpg')
        mid = await ev(pg, "Object.keys(__SM.ED.P.media)[0]")
        await ev(pg, "__SM.PANEL.show('media')"); await pg.wait_for_timeout(200)
        await pg.click(f'#smPanel [data-mid="{mid}"]', button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('média : ajouter, fond, télécharger, infos, retirer', it and all(k in it[0] for k in ['Ajouter au projet', 'Utiliser comme fond', 'Télécharger le fichier', 'Infos', 'Retirer du projet']), it)
        await pg.keyboard.press('Escape')
        await ev(pg, "__SM.PANEL.show('tpl')"); await pg.wait_for_timeout(400)
        await pg.locator('#smPanel [data-tpl]').first.click(button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Ajouter comme nouvelle page')
        check('modèle → Ajouter comme nouvelle page', await ev(pg, "__SM.pageCount(__SM.ED.P)") == 3 and await ev(pg, "__SM.ED.P.layers.length") > 0)
        await pg.click('#smRail [data-pn="text"]', button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('barre latérale : menu du panneau', it and it[0][0].startswith('Ouvrir'), it)
        await pg.keyboard.press('Escape')
        await pg.click('#undoBtn', button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('barre d\'outils : annuler, studio, panneaux, raccourcis', it and all(k in it[0] for k in ['Annuler', 'Studio', 'Raccourcis clavier']), it)
        await pick(pg, 'Studio', 'Photo'); check('barre d\'outils → Studio → Photo', await ev(pg, "__SM.ED.studio") == 'photo')

        print('Photo : réglages au pixel et effets')
        await ev(pg, "__SM.ED.P.pages = null; __SM.ED.P.pg = 0; __SM.ED.P.layers = []; __SM.ED.P.bg = '#FFFFFF'; __SM.ED.commit('vider')")
        await ev(pg, f"__SM.ED.addMedia(__SM.ED.P.media['{mid}'])"); await pg.wait_for_timeout(800)
        check('nouveaux réglages : exposition, ombres, hautes lumières, vibrance, teinte, clarté', await ev(pg, "['expo', 'shadows', 'highlights', 'vibrance', 'tint', 'clarity'].every(k => __SM.ADJ_KEYS[k])"))
        check('au moins 49 filtres, 8 effets photo', await ev(pg, "Object.keys(__SM.FILTERS).length") >= 49 and await ev(pg, "Object.keys(__SM.PFX).length") >= 9)
        rend = """(adj, pfx, filter) => { const P = __SM.ED.P, L = P.layers.find(l => l.t === 'image'); L.adj = adj || {}; if (pfx) L.pfx = pfx; else delete L.pfx; L.filter = filter || 'none'; __SM.PIX.cache.clear();
          const c = document.createElement('canvas'); c.width = 240; c.height = Math.round(240 * P.h / P.w); const g = c.getContext('2d', {willReadFrequently:true}); __SM.renderFrame(g, P, 0, {scale:240 / P.w, final:true, noFx:true});
          const b = L, k = 240 / P.w, d = g.getImageData(Math.round(b.x * k) + 4, Math.round(b.y * k) + 4, Math.max(2, Math.round(b.w * k) - 8), Math.max(2, Math.round(b.h * k) - 8)).data; let s = 0, n = 0, set = new Set(), sat = 0;
          const hist = {}; let mid = 0; for (let i = 0; i < d.length; i += 4){ s += (d[i] + d[i + 1] + d[i + 2]) / 3; n++; set.add(d[i]); hist[d[i]] = (hist[d[i]] || 0) + 1; if (d[i] > 25 && d[i] < 230) mid++; sat += Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); }
          return [s / n, set.size, sat / n, d[0], d[1], d[2], mid / n, Object.values(hist).filter(v => v > n * .01).length]; }"""
        await ev(pg, f"window.__rend = {rend}")
        base = await ev(pg, "__rend({})"); hi = await ev(pg, "__rend({expo:80})"); lo = await ev(pg, "__rend({expo:-80})")
        check('exposition : +80 éclaircit, -80 assombrit (rendu réel)', hi[0] > base[0] + 15 and lo[0] < base[0] - 15, (lo[0], base[0], hi[0]))
        vb = await ev(pg, "__rend({vibrance:90})"); check('vibrance : couleurs plus saturées', vb[2] > base[2] * 1.15, (base[2], vb[2]))
        sh = await ev(pg, "__rend({shadows:90})"); check('ombres débouchées : image plus claire', sh[0] > base[0] + 5, (base[0], sh[0]))
        inv = await ev(pg, "__rend({}, {k:'invert', v:50})"); check('effet Négatif : pixel ≈ 255 - original', abs(inv[3] - (255 - base[3])) <= 6 and abs(inv[4] - (255 - base[4])) <= 6, (base[3:], inv[3:]))
        th = await ev(pg, "__rend({}, {k:'threshold', v:50})"); check('effet Noir et blanc pur : presque tout est noir ou blanc', th[6] < .12, th[6])
        po = await ev(pg, "__rend({}, {k:'poster', v:80})"); check('effet Postériser : peu de niveaux dominants', po[7] <= 16 < base[7], (po[7], base[7]))
        ok = await ev(pg, "['pixel', 'rgb', 'halftone', 'emboss', 'sketch'].map(k => __rend({}, {k, v:60})).every(r => r.every(Number.isFinite))")
        check('effets Pixeliser, RVB, Trame, Relief, Croquis : rendu sans erreur', ok)
        hdr = await ev(pg, "__rend({}, null, 'hdr')"); check('filtre « HDR » appliqué au pixel (clarté + vibrance)', hdr[2] > base[2], (base[2], hdr[2]))
        await ev(pg, "__rend({}); __SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'image').id]); __SM.PANEL.show('adjust')"); await pg.wait_for_timeout(300)
        await pg.click('#smPanel [data-pfx="halftone"]'); await pg.wait_for_timeout(200)
        check('panneau Retouche : bouton d\'effet photo + intensité', await ev(pg, "__SM.ED.sel1().pfx?.k") == 'halftone' and await pg.locator('#smPanel [data-p="pfx.v"]').count() == 1)
        await ev(pg, "__SM.ED.addMedia(__SM.ED.P.media[Object.keys(__SM.ED.P.media)[0]])"); await pg.wait_for_timeout(300)
        await ev(pg, "__SM.ED.select([__SM.ED.P.layers.find(l => l.t === 'image').id]); __SM.PANEL.show('adjust')"); await pg.wait_for_timeout(200)
        await pg.click('#smPanel [data-act="adjAll"]'); await pg.wait_for_timeout(200)
        check('appliquer les réglages à toutes les images', await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'image').every(l => l.pfx?.k === 'halftone')"))

        print('Motion : courbes, lettres, images clés')
        e = await ev(pg, "[__SM.ease('back', .6), __SM.ease('elastic', .1), __SM.ease('bounce', 1), __SM.ease('bounce', .5), __SM.ease('back', 0), __SM.ease('elastic', 1)]")
        check('courbes Dépassement, Élastique, Rebond (dépassent puis arrivent à 1)', e[0] > 1 and e[1] > 1 and abs(e[2] - 1) < 1e-9 and 0 < e[3] < 1 and abs(e[4]) < 1e-9 and e[5] == 1, e)
        await ev(pg, "__SM.ED.setStudio('motion')"); await pg.wait_for_timeout(400)
        await ev(pg, "__SM.ED.P.layers = []; __SM.ED.commit('vider')")
        await ev(pg, "__SM.ED.addPresetText({n:'T', o:{txt:'ANIMATION', fs:.12, fw:800}})"); await pg.wait_for_selector('textarea.stg-edit'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        r = await ev(pg, """(() => { const P = __SM.ED.P, L = P.layers[0]; L.start = 0; L.dur = 3; L.tin = {k:'letters', d:1}; const s = __SM.layerState(L, .5, P);
          const img = t => { const c = document.createElement('canvas'); c.width = 200; c.height = Math.round(200 * P.h / P.w); const g = c.getContext('2d'); __SM.renderFrame(g, P, t, {scale:200 / P.w, transparent:true}); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 40; return n; };
          return [s.lt, img(.15), img(.5), img(2)]; })()""")
        check('lettre par lettre : moitié du texte visible à mi-parcours', 0.4 < r[0] < 0.6 and r[1] < r[2] < r[3], r)
        bad = await ev(pg, "(() => { const P = __SM.ED.P, L = P.layers[0], out = []; for (const k of ['shake', 'stretch', 'swing', 'blurZoom', 'rise', 'grow', 'lettersUp']) for (const t of [0, .2, .5, 1.2]){ L.tin = {k, d:1}; const s = __SM.layerState(L, t, P); if (!Object.values(s).every(v => typeof v !== 'number' || Number.isFinite(v))) out.push(k + '@' + t); } return out; })()")
        check('8 nouveaux effets d\'entrée / sortie : valeurs finies à tout instant', not bad, bad)
        check('au moins 38 animations prêtes', await ev(pg, "__SM.ANIM_PRESETS.length") >= 38)
        await ev(pg, "(() => { const L = __SM.ED.P.layers[0]; L.kf = {x:[[0, 0, 'ease'], [1, 500, 'bounce']], op:[[0, 0, 'lin'], [2, 1, 'lin']]}; __SM.ED.select([L.id]); __SM.ED.commit('kf'); })()")
        lid = await ev(pg, "__SM.ED.P.layers[0].id"); lx, ly = await stage_pt(pg, lid)
        await pg.mouse.click(lx, ly, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Animer', 'Inverser l\'animation')
        check('Animer → Inverser l\'animation (temps miroir, courbes gardées)', await ev(pg, "JSON.stringify(__SM.ED.P.layers[0].kf.x)") == '[[2,500,"ease"],[3,0,"bounce"]]', await ev(pg, "JSON.stringify(__SM.ED.P.layers[0].kf.x)"))
        await ev(pg, "__SM.KF.copy(__SM.ED.P.layers[0]); __SM.ED.addLayer(__SM.mkShape(__SM.ED.P, 'rect', {start:0, dur:3}))"); await pg.wait_for_timeout(200)
        sid = await ev(pg, "__SM.ED.P.layers[1].id"); sx, sy = await stage_pt(pg, sid)
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Animer', 'Coller les images clés')
        check('images clés copiées d\'un calque à l\'autre', await ev(pg, "JSON.stringify(__SM.ED.P.layers[1].kf.op)") == '[[1,1,"lin"],[3,0,"lin"]]', await ev(pg, "JSON.stringify(__SM.ED.P.layers[1].kf)"))
        await pg.mouse.click(sx, sy, button='right'); await pg.wait_for_timeout(200); await pick(pg, 'Animer', 'Courbe de toutes les images clés', 'Élastique')
        check('courbe appliquée à toutes les images clés', await ev(pg, "Object.values(__SM.ED.P.layers[1].kf).flat().every(k => k[2] === 'elastic')"))

        print('Vidéo : timeline, repères, montage')
        await ev(pg, "__SM.ED.setStudio('video'); __SM.ED.P.layers = []; __SM.ED.commit('vider')"); await pg.wait_for_timeout(500)
        await import_file(pg, MED / 'clip.webm'); await import_file(pg, MED / 'clip.webm')
        clips = await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'video').map(l => [l.id, l.start, l.dur, l.track])")
        check('deux clips vidéo à la suite sur V1', len(clips) == 2 and clips[1][1] > 0 and clips[0][3] == clips[1][3] == 0, clips)
        await ev(pg, "__SM.PLAY.seek(1, false)"); await pg.wait_for_timeout(300)
        c0 = pg.locator(f'#tlLanes .clip[data-id="{clips[0][0]}"]'); bb = await c0.bounding_box()
        await pg.mouse.click(bb['x'] + bb['width'] * .7, bb['y'] + bb['height'] / 2, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg)
        check('clip : couper, rogner, coller, rapprocher, vitesse, son, mise en page', it and all(k in it[0] for k in ['Couper à la tête de lecture', 'Supprimer et rapprocher', 'Déplacer à la tête de lecture', 'Son et vitesse', 'Sélectionner toute la piste']), it)
        await pick(pg, 'Son et vitesse', 'Vitesse', '×2')
        check('clip → vitesse ×2 (durée divisée par 2)', abs(await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{clips[0][0]}').dur") - clips[0][2] / 2) < .01)
        await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{clips[0][0]}').start = 0; __SM.ED.commit('x'); __SM.TL.render()"); await pg.wait_for_timeout(200)
        end0 = await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{clips[0][0]}'); return L.start + L.dur; }})()")
        await ev(pg, f"__SM.ED.select(['{clips[0][0]}'])"); await pg.locator('#tlLanes').click(position={'x': 5, 'y': 5}); await ev(pg, f"__SM.ED.select(['{clips[0][0]}'])")
        await pg.keyboard.press('Shift+Delete'); await pg.wait_for_timeout(300)
        st = await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'video').map(l => l.start)")
        check('Maj + Suppr : supprimer et rapprocher (le clip suivant recule)', len(st) == 1 and abs(st[0] - (clips[1][1] - end0)) < .02, (st, clips[1][1], end0))
        await ev(pg, "__SM.ED.undo()"); await pg.wait_for_timeout(200)
        await ev(pg, "__SM.PLAY.seek(.5, false)"); await pg.keyboard.press('m'); await ev(pg, "__SM.PLAY.seek(1.5, false)"); await pg.keyboard.press('m'); await pg.wait_for_timeout(200)
        check('touche M : 2 repères', await ev(pg, "JSON.stringify(__SM.ED.P.markers.map(m => m.t))") == '[0.5,1.5]')
        await ev(pg, "__SM.PLAY.seek(0, false)"); await pg.keyboard.press(']'); await pg.wait_for_timeout(150)
        check('touche ] : aller au repère suivant', abs(await ev(pg, "__SM.PLAY.t") - .5) < .01)
        rb = await pg.locator('#tlRuler').bounding_box(); sc = await ev(pg, "[__SM.TL.pps, __SM.TL.scroll]")
        await pg.mouse.click(rb['x'] + 1.5 * sc[0] - sc[1], rb['y'] + 18, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('règle : menu du repère (aller, renommer, supprimer)', it and 'Supprimer le repère' in it[0], it)
        await pick(pg, 'Supprimer le repère'); check('repère supprimé par clic droit', await ev(pg, "__SM.ED.P.markers.length") == 1)
        await ev(pg, "__SM.ED.P.markers.push({t:2.5, n:''}, {t:4, n:''}); __SM.ED.commit('mk')")
        await ev(pg, f"__SM.ED.select({json.dumps([c[0] for c in clips])})"); await pg.wait_for_timeout(150)
        bb = await pg.locator(f'#tlLanes .clip[data-id="{clips[1][0]}"]').bounding_box(); await pg.mouse.click(bb['x'] + 10, bb['y'] + bb['height'] / 2, button='right'); await pg.wait_for_timeout(200)
        await pick(pg, 'Caler sur les repères')
        cl = await ev(pg, "__SM.ED.P.layers.filter(l => l.t === 'video').sort((a, b) => a.start - b.start).map(l => [l.start, l.dur])")
        check('caler les clips sur les repères (0,5→2,5→4)', cl == [[0.5, 2], [2.5, 1.5]], cl)
        await ev(pg, f"__SM.ED.select({json.dumps([c[0] for c in clips])})")
        bb = await pg.locator(f'#tlLanes .clip[data-id="{clips[1][0]}"]').bounding_box(); await pg.mouse.click(bb['x'] + 10, bb['y'] + bb['height'] / 2, button='right'); await pg.wait_for_timeout(200)
        await pick(pg, 'Mise en page vidéo', 'Incrustation (image dans l\'image)')
        pip = await ev(pg, "(() => { const P = __SM.ED.P, v = P.layers.filter(l => l.t === 'video'); return [v.map(l => [l.x, l.y, l.w, l.h, l.track, l.start]), P.w, P.h]; })()")
        big = [l for l in pip[0] if l[2] == pip[1]]; small = [l for l in pip[0] if l[2] < pip[1] * .4]
        check('mise en page : incrustation (un plein écran, un petit au-dessus, même début)', len(big) == 1 and len(small) == 1 and small[0][4] > big[0][4] and big[0][5] == small[0][5], pip)
        lb = await pg.locator('#tlLanes').bounding_box()
        await pg.mouse.click(lb['x'] + lb['width'] - 40, lb['y'] + 20, button='right'); await pg.wait_for_timeout(200)
        it = await menu_items(pg); check('zone vide de la timeline : tête de lecture, repère, titre, import', it and all(k in it[0] for k in ['Placer la tête de lecture ici', 'Ajouter un repère ici', 'Importer un média ici…']), it)
        await pg.keyboard.press('Escape')

        print('Audio : effets, normaliser, temps forts, baisse automatique')
        await ev(pg, "__SM.ED.setStudio('audio'); __SM.ED.P.layers = []; __SM.ED.P.markers = []; __SM.ED.commit('vider')"); await pg.wait_for_timeout(400)
        await import_file(pg, MED / 'clics.wav')
        aid = await ev(pg, "__SM.ED.P.layers.find(l => l.t === 'audio').id")
        dry = await export(pg, 'audio', 'v4-sec.wav')
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{aid}'); L.echo = 60; __SM.ED.commit('echo'); }})()")
        wet = await export(pg, 'audio', 'v4-echo.wav')
        a, sr = read_wav(dry); w, _ = read_wav(wet)
        win = lambda d, t: float(np.sqrt(np.mean(d[int(t * sr):int((t + .03) * sr)] ** 2)))
        e_dry, e_wet = win(a, .5 + .32 - .005), win(w, .5 + .32 - .005)
        check('écho : répétition 0,32 s après le clic dans le WAV exporté', e_wet > 0.02 and e_wet > e_dry * 20, (e_dry, e_wet))
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{aid}'); L.echo = 0; L.rev = 70; __SM.ED.commit('rev'); }})()")
        rv, _ = read_wav(await export(pg, 'audio', 'v4-reverb.wav'))
        check('réverbération : queue sonore entre les clics', win(rv, .5 + .2) > win(a, .5 + .2) * 20 and win(rv, .5 + .2) > .003, (win(a, .7), win(rv, .7)))
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{aid}'); L.rev = 0; L.comp = true; __SM.ED.commit('comp'); }})()")
        cp, _ = read_wav(await export(pg, 'audio', 'v4-comp.wav'))
        check('compresseur : signal modifié, sans saturation', not np.allclose(cp, a, atol=1e-3) and np.abs(cp).max() < 1, float(np.abs(cp).max()))
        await ev(pg, f"(() => {{ const L = __SM.ED.P.layers.find(l => l.id === '{aid}'); L.comp = false; L.vol = .3; __SM.ED.select([L.id]); }})()"); await pg.wait_for_timeout(200)
        bb = await pg.locator(f'#tlLanes .clip[data-id="{aid}"]').bounding_box(); await pg.mouse.click(bb['x'] + 30, bb['y'] + bb['height'] / 2, button='right'); await pg.wait_for_timeout(200)
        await pick(pg, 'Son et vitesse', 'Normaliser le volume'); await pg.wait_for_timeout(400)
        vol = await ev(pg, f"__SM.ED.P.layers.find(l => l.id === '{aid}').vol")
        pk = float(np.abs(read_wav(MED / 'clics.wav')[0]).max()); check('normaliser : crête ramenée à -1 dB', abs(vol * pk - .891) < .01, (vol, pk))
        await pg.mouse.click(bb['x'] + 30, bb['y'] + bb['height'] / 2, button='right'); await pg.wait_for_timeout(200)
        await pick(pg, 'Son et vitesse', 'Repères sur les temps forts'); await pg.wait_for_timeout(600)
        mk = await ev(pg, "__SM.ED.P.markers.map(m => m.t)")
        exp = [0.5 + i * .5 for i in range(11)]
        hits = sum(1 for t in exp if any(abs(m - t) < .05 for m in mk))
        check('temps forts : les clics de la piste deviennent des repères (à 50 ms près)', hits >= 10 and len(mk) <= 13, (len(mk), hits, mk[:6]))
        # baisse automatique de la musique sous une autre piste
        await import_file(pg, MED / 'music.wav')
        await ev(pg, f"""(() => {{ const P = __SM.ED.P, M = P.layers.find(l => l.t === 'audio' && l.id !== '{aid}'), C = P.layers.find(l => l.id === '{aid}'); M.start = 0; M.track = 0; C.track = 1; C.start = 2; C.dur = 1.5; C.vol = .001; M.duck = true; M.vol = 1; __SM.ED.commit('duck'); }})()""")
        dk, _ = read_wav(await export(pg, 'audio', 'v4-duck.wav'))
        rms = lambda d, t0, t1: float(np.sqrt(np.mean(d[int(t0 * sr):int(t1 * sr)] ** 2)))
        r_in, r_out = rms(dk, 2.4, 3.2), rms(dk, 4.5, 5.5)
        check('baisse automatique : musique ≈ ×0,22 pendant l\'autre piste', r_out > 0 and .12 < r_in / r_out < .35, (r_in, r_out))

        print('Assainissement et réouverture')
        cl = await ev(pg, """(() => { const j = JSON.parse(JSON.stringify(__SM.ED.P)); const L = j.layers[0]; L.rev = 999; L.echo = -5; L.comp = 'oui'; L.pfx = {k:'<script>', v:5}; j.markers = [{t:'x'}, {t:5, n:'<b>'.repeat(30)}, {t:-3}];
          const P = __SM.cleanProject(JSON.stringify(j)), M = P.layers[0]; return [M.rev, M.echo, M.comp, M.pfx === undefined, JSON.stringify(P.markers)]; })()""")
        check('fichier piégé : effets bornés, effet inconnu refusé, repères nettoyés', cl[0] == 100 and cl[1] == 0 and cl[2] is True and cl[3] and cl[4] == '[{"t":0,"n":""},{"t":5,"n":"' + '<b>' * 13 + '<"}]', cl)
        await ev(pg, "(window.__savedAt = Date.now(), 0)"); await pg.wait_for_timeout(4000)
        await pg.reload(); await pg.wait_for_timeout(2500)
        if await pg.is_visible('#homeBody'):
            bb = await pg.locator('#homeBody [data-open]').first.bounding_box(); await pg.mouse.click(bb['x'] + 40, bb['y'] + 40, button='right'); await pg.wait_for_timeout(250)
            it = await menu_items(pg); check('carte de projet : menu (ouvrir, renommer, dupliquer, supprimer)', it and all(k in it[0] for k in ['Ouvrir', 'Renommer', 'Dupliquer', 'Supprimer']), it)
            await pick(pg, 'Ouvrir'); await pg.wait_for_timeout(1800)
        ro = await ev(pg, "[__SM.ED.P.layers.map(l => l.t + (l.duck ? '+duck' : '')).join(','), (__SM.ED.P.markers || []).length, __SM.ED.P.studio]")
        check('réouverture : effets son et baisse automatique gardés', '+duck' in ro[0] and ro[1] >= 10, ro)
        await pg.screenshot(path=str(OUT / 'v4-fin.png'))
        check('pas d\'erreur JavaScript', not errs, errs[:4])
        await b.close()
    print(f"\n{RES['ok']} réussis, {RES['ko']} en échec")
    if RES['ko']: print('Échecs :', ' | '.join(RES['fails'])); sys.exit(1)
asyncio.run(main())

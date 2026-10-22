#!/usr/bin/env python3
"""Assemble Spectra Motion en un seul fichier HTML à partir des sources de src/.

  src/parts/head.html          titre, icônes, polices
  src/css/*.css                styles (ordre : CSS_ORDER)
  src/parts/body.html          structure : intro, compte, accueil, atelier (le logo est inséré depuis assets/branding)
  src/motion/*.js              l'atelier (scripts concaténés dans l'ordre alphabétique, une seule IIFE)
  src/js/auth.js + cloud.js + auth-end.js   compte Studio Prism, cloud, accueil (une seule IIFE)

Sorties :
  index.html                          site en ligne (GitHub Pages) : Firebase branché (projet Studio Prism)
  dist/spectramotion-demo.html        démo autonome (comptes et projets dans le navigateur)
Usage : python3 tools/build.py
"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / 'src'
CSS_ORDER = ['base.css', 'splash.css', 'auth.css', 'home.css', 'motion.css']
FB = '10.12.2'
CONFIG = '''const FIREBASE_CONFIG = {
  // Projet Firebase de Studio Prism : le même que le site, SPECTRA Writer, Calc et Slide. Configuration publique par conception
  // (la sécurité repose sur les règles Firestore et Storage, voir firebase/).
  apiKey: "AIzaSyAAD5rrHuVh6_PC2_45L3y9F7zWe5ACW6E",
  authDomain: "archivision-studioprism.firebaseapp.com",
  projectId: "archivision-studioprism",
  storageBucket: "archivision-studioprism.firebasestorage.app",
  messagingSenderId: "226072216517",
  appId: "1:226072216517:web:0aeef645a4f1481fe801ac"
};'''
def rd(p): return (S / p).read_text(encoding='utf-8')
def symbol():
    """symbole du logo (assets/branding/spectra-motion-symbol.svg) → <symbol id="swMark"> réutilisable dans la page"""
    svg = (ROOT / 'assets' / 'branding' / 'spectra-motion-symbol.svg').read_text(encoding='utf-8')
    inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1)
    defs = re.search(r'<defs>(.*?)</defs>', inner, re.S).group(1)
    return defs + '<symbol id="swMark" viewBox="0 0 64 64">' + inner.replace('<defs>' + defs + '</defs>', '') + '</symbol>'
def splash_parts():
    """symbole et mot-symbole OFFICIELS (assets/branding) découpés en calques pour l'intro : mêmes tracés, aucun redessin"""
    sym = (ROOT / 'assets' / 'branding' / 'spectra-motion-symbol.svg').read_text(encoding='utf-8')
    inner = re.search(r'<svg[^>]*>(.*)</svg>', sym, re.S).group(1)
    inner = re.sub(r'<defs>.*?</defs>', '', inner, count=1, flags=re.S)
    m = re.search(r'((?:<path[^>]*url\(#mst\d\)[^>]*/>){3})(<mask id="mmk".*?</mask>)<g mask="url\(#mmk\)">(<path[^>]*/><path[^>]*/>)(<clipPath id="mcl">(<path d="([^"]+)"[^>]*/>)</clipPath>)<g clip-path="url\(#mcl\)">(.*?)</g></g>\s*$', inner, re.S)
    assert m, 'structure du symbole inattendue'
    trails, mask, back, clip, _, face_d, face = m.groups()
    trails = ''.join(t.replace('<path ', f'<path class="sp-t sp-t{i}" ', 1) for i, t in enumerate(re.findall(r'<path[^>]*/>', trails), 1))
    defs = '<defs>' + mask.replace('mmk', 'spmk') + clip.replace('mcl', 'spcl') + '</defs>'
    mark = (defs + '<g transform="translate(0 2) scale(2.6)">' + trails + '<g mask="url(#spmk)"><g class="sp-back">' + back + '</g>'
            '<g class="sp-face"><g clip-path="url(#spcl)">' + face + '</g></g></g>'
            f'<path class="sp-out" pathLength="1" d="{face_d}" fill="none" stroke="url(#mface)" stroke-width=".9" stroke-linejoin="round"/></g>')
    logo = (ROOT / 'assets' / 'branding' / 'spectra-motion-logo-dark.svg').read_text(encoding='utf-8')
    word = re.findall(r'<path d="[^"]+" fill="#FFFFFF"/>', logo)
    assert len(word) == 2, 'mot-symbole inattendu'
    return mark, ''.join(word)
def assemble():
    editor = ''.join(f'/* ==== {f.name} ==== */\n' + f.read_text(encoding='utf-8') + '\n' for f in sorted((S / 'motion').glob('*.js')))
    mark, word = splash_parts()
    body = rd('parts/body.html').replace('<!--SYMBOL-->', symbol(), 1).replace('<!--SPMARK-->', mark, 1).replace('<!--SPWORD-->', word, 1)
    return (rd('parts/head.html') + '<style>\n' + ''.join(rd('css/' + c) for c in CSS_ORDER) + '</style>\n</head><body>\n' + body
            + "<script>\n(() => {\n'use strict';\n" + editor + '/*DEMO-HOOK*/\n})();\n</script>\n'
            + '<script>\n' + rd('js/auth.js') + rd('js/cloud.js') + rd('js/auth-end.js') + '</script>\n')
def head(desc):
    return ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<meta name="description" content="{desc}">'
        '<meta name="theme-color" content="#0C0A16">'
        '<meta property="og:title" content="Spectra Motion · Studio Prism"><meta property="og:description" content="Création photo, vidéo, animation et audio : retouche, montage multipiste, images clés et mixage, dans un seul studio.">'
        '<link rel="preconnect" href="https://www.gstatic.com" crossorigin>'
        '<link rel="preconnect" href="https://firestore.googleapis.com">'
        '<link rel="preconnect" href="https://identitytoolkit.googleapis.com">'
        + ''.join(f'<link rel="preload" as="script" href="https://www.gstatic.com/firebasejs/{FB}/firebase-{n}-compat.js">' for n in ('app', 'auth', 'firestore')) +
        '<style>[hidden]{display:none!important}</style>\n')
def main(argv):
    body = assemble()
    assert body.count('const FIREBASE_CONFIG = null;') == 1 and f"FIREBASE_VERSION = '{FB}'" in body
    desc = 'Spectra Motion · Studio Prism : création photo, vidéo, animation et audio dans un seul studio.'
    (ROOT / 'dist').mkdir(exist_ok=True)
    # démo : expose l'état de l'atelier aux tests automatiques (jamais dans la version en ligne)
    demo_body = body.replace('/*DEMO-HOOK*/', 'window.__SM = {ED, PLAY, MEDIA, TL, STAGE, IO, PANEL, INSP, HIST, cleanProject, renderFrame, tplProject, SM_TPL, layerState, measureText, IDB};', 1)
    demo = head(desc).replace('<link rel="preload"', '<link rel="x-preload"') + demo_body.replace('<title>Spectra Motion</title>', '<title>Spectra Motion · démo</title>', 1) + '</body></html>\n'
    (ROOT / 'dist' / 'spectramotion-demo.html').write_text(demo.replace('href="assets/', 'href="../assets/').replace('href="manifest.webmanifest"', 'href="../manifest.webmanifest"'), encoding='utf-8')
    live = head(desc) + body.replace('/*DEMO-HOOK*/', '', 1).replace('const FIREBASE_CONFIG = null;', CONFIG).replace('<title>Spectra Motion</title>', '<title>Spectra Motion · Studio Prism</title>', 1) + '</body></html>\n'
    (ROOT / 'index.html').write_text(live, encoding='utf-8')
    print('index.html', len(live), 'octets · dist/spectramotion-demo.html', len(demo), 'octets')
if __name__ == '__main__': main(sys.argv[1:])

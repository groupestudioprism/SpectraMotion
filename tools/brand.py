#!/usr/bin/env python3
"""Identité visuelle de Spectra Motion : génère le logo et toutes ses déclinaisons dans assets/branding/.

  Symbole : un prisme de verre triangulaire en forme de « lecture » (la famille SPECTRA : verre facetté et spectre lumineux),
            avec une épaisseur, six facettes, la lecture évidée au centre et trois traînées de mouvement.
  SVG     : symbole, icône d'application, favicon, monochromes (gris, blanc), logos horizontaux (clair, sombre, mono)
  PNG     : icônes 16 → 1024 px, icône « maskable » (Android), apple-touch 180 px, logos horizontaux ×2, planche récapitulative

Usage : python3 tools/brand.py          (Python 3, fonttools + brotli, Playwright avec Chromium pour les PNG)
Le texte des logos est vectorisé (police Inter, licence SIL OFL) : le logo ne dépend d'aucune police installée.
Polices attendues dans tools/fonts/ (inter-latin-400-normal.woff2, inter-latin-800-normal.woff2), par exemple :
  npm pack @fontsource/inter@5.0.18 && tar xzf fontsource-inter-*.tgz && cp package/files/inter-latin-{400,800}-normal.woff2 tools/fonts/
"""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
FONTS_DIR = pathlib.Path(__file__).resolve().parent / 'fonts'
FONTS = {400: FONTS_DIR / 'inter-latin-400-normal.woff2', 800: FONTS_DIR / 'inter-latin-800-normal.woff2'}
_cache = {}
def text_path(txt, x, y, size, weight=400, tracking=0.0):
    f = _cache.get(weight) or _cache.setdefault(weight, TTFont(FONTS[weight]))
    gs, cmap, upm = f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm
    sc = size / upm; pen = SVGPathPen(gs); cx = 0
    hmtx = f['hmtx']; kern = None
    for ch in txt:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (sc, 0, 0, -sc, x + cx, y)); gs[g].draw(tp)
        cx += hmtx[g][0] * sc + tracking * size
    return pen.getCommands(), cx

import math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'branding'; OUT.mkdir(parents=True, exist_ok=True)
SPECTRUM = ['#7B2FF7', '#3D63FF', '#14C2EC', '#45D69A', '#FFC83D', '#FF8A3D', '#FF3F86']
def rounded(pts, r):
    """polygone aux coins arrondis (arcs approchés par des courbes quadratiques)"""
    n = len(pts); d = ''
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        def toward(a, b, t):
            L = math.dist(a, b); return (a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L)
        a = toward(p1, p0, r); b = toward(p1, p2, r)
        d += ('M' if i == 0 else 'L') + f'{a[0]:.2f} {a[1]:.2f}Q{p1[0]:.2f} {p1[1]:.2f} {b[0]:.2f} {b[1]:.2f}'
    return d + 'Z'
def f(x): return f'{x:.2f}'
def defs(px):
    s = ''.join(f'<stop offset="{i / (len(SPECTRUM) - 1):.3f}" stop-color="{c}"/>' for i, c in enumerate(SPECTRUM))
    return (f'<linearGradient id="{px}sp" x1="0" y1="0" x2="1" y2="1">{s}</linearGradient>'
            f'<linearGradient id="{px}top" x1="0" y1="0" x2="1" y2=".6"><stop offset="0" stop-color="#7B2FF7"/><stop offset=".45" stop-color="#3D63FF"/><stop offset="1" stop-color="#14C2EC"/></linearGradient>'
            f'<linearGradient id="{px}bot" x1="0" y1="1" x2="1" y2=".4"><stop offset="0" stop-color="#FF3F86"/><stop offset=".5" stop-color="#FF8A3D"/><stop offset="1" stop-color="#FFC83D"/></linearGradient>'
            f'<linearGradient id="{px}left" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4BFF"/><stop offset=".5" stop-color="#14C2EC"/><stop offset="1" stop-color="#45D69A"/></linearGradient>'
            f'<linearGradient id="{px}gl" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            f'<linearGradient id="{px}st1" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FF3F86"/><stop offset="1" stop-color="#FF3F86" stop-opacity="0"/></linearGradient>'
            f'<linearGradient id="{px}st2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFC83D"/><stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></linearGradient>'
            f'<linearGradient id="{px}st3" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#14C2EC"/><stop offset="1" stop-color="#14C2EC" stop-opacity="0"/></linearGradient>'
            f'<linearGradient id="{px}face" x1=".15" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#8B3CF7"/><stop offset=".26" stop-color="#3D63FF"/><stop offset=".46" stop-color="#14C2EC"/><stop offset=".62" stop-color="#45D69A"/><stop offset=".78" stop-color="#FFC83D"/><stop offset=".9" stop-color="#FF8A3D"/><stop offset="1" stop-color="#FF3F86"/></linearGradient>'
            f'<linearGradient id="{px}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B2FF7"/><stop offset=".3" stop-color="#3D63FF"/><stop offset=".5" stop-color="#14C2EC"/><stop offset=".68" stop-color="#45D69A"/><stop offset=".84" stop-color="#FFC83D"/><stop offset="1" stop-color="#FF3F86"/></linearGradient>')
A, B, C = (20, 9), (20, 55), (60, 32)
G = ((A[0] + B[0] + C[0]) / 3 - 2, 32)
def prism(px, mono=None, streaks=True, inner=True, white=False, depth=True):
    """le symbole : prisme triangulaire « lecture » en verre facetté (épaisseur, six facettes, reflet), lecture intérieure évidée, traînées"""
    out = ''
    if streaks:
        for i, (y, x0, w, h) in enumerate([(19, 3, 15, 3.2), (27, 0, 18, 3.6), (35, 2, 16, 3.2)]):
            fill = mono or (f'url(#{px}st{i + 1})' if not white else '#fff')
            out += f'<path d="M{f(x0 + w)} {f(y - h / 2)}L{f(x0)} {f(y)}L{f(x0 + w)} {f(y + h / 2)}Z" fill="{fill}"/>'
    outline = rounded([A, B, C], 4.2)
    if inner:   # la lecture intérieure est évidée (masque) : on voit le fond à travers, sur tous les fonds, même en monochrome
        ia, ib, ic = (G[0] - 4.5, 24.5), (G[0] - 4.5, 39.5), (G[0] + 9, 32)
        out += (f'<mask id="{px}mk" maskUnits="userSpaceOnUse" x="-10" y="-10" width="84" height="84"><rect x="-10" y="-10" width="84" height="84" fill="#fff"/>'
                f'<path d="{rounded([ia, ib, ic], 1.6)}" fill="none" stroke="#000" stroke-width="2.8" stroke-linejoin="round"/></mask>')
        out += f'<g mask="url(#{px}mk)">'
    if depth:   # épaisseur du prisme : la même forme décalée, plus sombre
        dcol = mono and '#000' or ('#B9C3E6' if white else '#4B2AA8')
        out += f'<path d="{rounded([(A[0] + 2.2, A[1] + 3.2), (B[0] + 2.2, B[1] + 3.2), (C[0] + 2.2, C[1] + 3.2)], 4.2)}" fill="{dcol}" opacity="{.25 if mono else 1}"/>'
        if not mono and not white:
            out += f'<path d="{rounded([(A[0] + 2.2, A[1] + 3.2), (B[0] + 2.2, B[1] + 3.2), (C[0] + 2.2, C[1] + 3.2)], 4.2)}" fill="url(#{px}bot)" opacity=".75"/>'
    out += f'<clipPath id="{px}cl"><path d="{outline}"/></clipPath>'
    out += f'<g clip-path="url(#{px}cl)">'
    M1, M2, M3 = ((A[0] + C[0]) / 2, (A[1] + C[1]) / 2), ((B[0] + C[0]) / 2, (B[1] + C[1]) / 2), ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)
    facets = [(A, M1, .20), (M1, C, .08), (C, M2, -.10), (M2, B, -.20), (B, M3, .04), (M3, A, .14)]
    base = mono or ('#fff' if white else f'url(#{px}face)')
    out += f'<path d="{outline}" fill="{base}"/>'
    for p, q, k in facets:
        col, op = ('#fff', k) if k > 0 else ('#1B0B4A' if not mono else '#000', -k)
        if white: op *= .5; col = '#fff' if k > 0 else '#3D63FF'
        out += f'<path d="M{f(G[0])} {f(G[1])}L{f(p[0])} {f(p[1])}L{f(q[0])} {f(q[1])}Z" fill="{col}" opacity="{op:.2f}"/>'
    out += f'<path d="M{f(A[0])} {f(A[1])}L{f(G[0])} {f(G[1])}L{f(C[0])} {f(C[1])}" fill="none" stroke="#fff" stroke-width=".6" opacity=".5"/>'
    out += f'<path d="{outline}" fill="url(#{px}gl)" opacity="{.35 if mono else .55}"/>'
    out += '</g>'
    if inner: out += '</g>'
    return out
def svg(w, h, body, vb=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb or f"0 0 {w} {h}"}" width="{w}" height="{h}">{body}</svg>\n'
def symbol_svg(px='m', **k):
    return svg(64, 64, f'<defs>{defs(px)}</defs>' + prism(px, **k))
def icon_svg(px='i', r=14):
    """icône d'application : carré arrondi au dégradé spectral, prisme blanc"""
    body = f'<defs>{defs(px)}</defs><rect width="64" height="64" rx="{r}" fill="url(#{px}bg)"/><rect width="64" height="64" rx="{r}" fill="url(#{px}gl)" opacity=".6"/>'
    body += f'<g transform="translate(32 32) scale(.78) translate(-33 -32)">' + prism(px, white=True, streaks=False) + '</g>'
    for i, (y, x0, w_) in enumerate([(23, 6, 13), (31, 4, 15), (39, 6, 13)]):
        body += f'<path d="M{x0 + w_} {y - 1.3}L{x0} {y}L{x0 + w_} {y + 1.3}Z" fill="#fff" opacity="{.9 - i * .15}"/>'
    return svg(64, 64, body)
def maskable_svg(px='k'):
    """icône Android « maskable » : fond plein jusqu'aux bords, symbole dans la zone de sécurité (cercle de 80 %)"""
    body = f'<defs>{defs(px)}</defs><rect width="64" height="64" fill="url(#{px}bg)"/><rect width="64" height="64" fill="url(#{px}gl)" opacity=".6"/>'
    body += f'<g transform="translate(32 32) scale(.58) translate(-33 -32)">' + prism(px, white=True, streaks=False) + '</g>'
    for i, (y, x0, w_) in enumerate([(26.5, 13, 9), (32, 11.5, 10.5), (37.5, 13, 9)]):
        body += f'<path d="M{x0 + w_} {y - 1}L{x0} {y}L{x0 + w_} {y + 1}Z" fill="#fff" opacity="{.9 - i * .15}"/>'
    return svg(64, 64, body)
def favicon_svg(px='f'):
    body = f'<defs>{defs(px)}</defs><rect width="64" height="64" rx="15" fill="url(#{px}bg)"/>'
    body += f'<g transform="translate(32 32) scale(.86) translate(-37 -32)">' + prism(px, white=True, streaks=False, inner=False) + '</g>'
    return svg(64, 64, body)
def mono_svg(px='o', col='#7A7A80'):
    return svg(64, 64, f'<defs>{defs(px)}</defs>' + prism(px, mono=col))
def lockup_svg(dark=False, px='l', mono=None):
    """logo horizontal : symbole + « SPECTRA » (Inter 800) et « Motion » (Inter 400), texte vectorisé"""
    ink = mono or ('#FFFFFF' if dark else '#24232B')
    d1, w1 = text_path('SPECTRA', 178, 84, 62, 800, -0.008)
    d2, w2 = text_path('Motion', 180, 146, 58, 400)
    W = round(178 + max(w1, w2) + 8)
    body = (f'<defs>{defs(px)}</defs><g transform="translate(0 2) scale(2.6)">' + prism(px, mono=mono) + '</g>'
            f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{ink}"/>')
    return svg(W, 172, body)
files = {
  'spectra-motion-symbol.svg': symbol_svg(),
  'spectra-motion-icon.svg': icon_svg(),
  'spectra-motion-favicon.svg': favicon_svg(),
  'spectra-motion-maskable.svg': maskable_svg(),
  'spectra-motion-mono.svg': mono_svg(),
  'spectra-motion-mono-white.svg': mono_svg(px='w', col='#FFFFFF'),
  'spectra-motion-logo-light.svg': lockup_svg(False),
  'spectra-motion-logo-dark.svg': lockup_svg(True, px='d'),
  'spectra-motion-logo-mono.svg': lockup_svg(px='n', mono='#6E6E76'),
}
for n, s in files.items(): (OUT / n).write_text(s, encoding='utf-8')
print('SVG :', ', '.join(files))

# ---------- PNG (rendu par Chromium, via Playwright) ----------
def render_pngs():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('PNG : Playwright absent, PNG non régénérés'); return
    rd = lambda n: (OUT / n).read_text(encoding='utf-8')
    jobs = [(f'spectra-motion-{s}.png', 'spectra-motion-icon.svg', s, s, 'transparent', 0) for s in (1024, 512, 192, 180, 64, 32)]
    jobs += [('spectra-motion-16.png', 'spectra-motion-favicon.svg', 16, 16, 'transparent', 0),
             ('spectra-motion-512-maskable.png', 'spectra-motion-maskable.svg', 512, 512, 'transparent', 0),
             ('spectra-motion-symbol-512.png', 'spectra-motion-symbol.svg', 512, 512, 'transparent', 0),
             ('spectra-motion-logo-light@2x.png', 'spectra-motion-logo-light.svg', None, 344, 'transparent', 0),
             ('spectra-motion-logo-dark@2x.png', 'spectra-motion-logo-dark.svg', None, 344, 'transparent', 0)]
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        for name, src, w, h, bg, _ in jobs:
            if False: pass
            else:
                svg = rd(src)
                import re as _re
                vw, vh = map(float, _re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups())
                if w is None: w = round(h * vw / vh)
                svg = _re.sub(r'width="[\d.]+" height="[\d.]+"', f'width="{w}" height="{h}"', svg, count=1)
                html = f'<body style="margin:0;background:{bg}">{svg}</body>'
            pg.set_viewport_size({'width': w, 'height': h}); pg.set_content(html)
            pg.screenshot(path=str(OUT / name), omit_background=bg == 'transparent', clip={'x': 0, 'y': 0, 'width': w, 'height': h})
        # planche récapitulative
        sz = lambda n, px: rd(n).replace('width="64" height="64"', f'width="{px}" height="{px}"', 1)
        board = f'''<body style="margin:0;font-family:system-ui;background:#F3F2EE;width:1600px">
        <div style="padding:40px 56px 10px;font:800 34px system-ui;color:#24232B">SPECTRA Motion <span style="font-weight:400">· déclinaisons d'identité visuelle</span></div>
        <div style="display:flex;gap:48px;align-items:center;padding:24px 56px">{rd('spectra-motion-logo-light.svg')}<div style="width:200px">{sz('spectra-motion-icon.svg', 200)}</div>
          <div style="width:64px">{sz('spectra-motion-favicon.svg', 64)}</div><div style="width:32px">{sz('spectra-motion-favicon.svg', 32)}</div><div style="width:140px">{sz('spectra-motion-mono.svg', 140)}</div></div>
        <div style="display:flex;gap:48px;align-items:center;padding:28px 56px;background:#121120">{rd('spectra-motion-logo-dark.svg')}<div style="width:200px">{sz('spectra-motion-symbol.svg', 200)}</div>
          <div style="width:140px">{sz('spectra-motion-mono-white.svg', 140)}</div><div style="color:#9590AC;font-size:15px;line-height:1.5;max-width:420px">Prisme de verre triangulaire en forme de « lecture », traversé par le spectre ; trois traînées de mouvement ; la lecture évidée au centre reste lisible sur tous les fonds.</div></div></body>'''
        pg.set_viewport_size({'width': 1600, 'height': 600}); pg.set_content(board); pg.wait_for_timeout(300)
        pg.screenshot(path=str(OUT / 'spectra-motion-planche.png'), full_page=True)
        b.close()
    print('PNG :', ', '.join(j[0] for j in jobs), '+ planche')
if __name__ == '__main__':
    render_pngs()

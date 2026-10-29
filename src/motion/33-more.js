/* ---------- 0.3 : autocollants, tableaux, maquettes d'appareils, retouches avancées, sons générés ---------- */

/* ===== Autocollants : formes décoratives pleines (dessins originaux, grille 100 × 100), générées par des fonctions ===== */
const _pt = (a, r, cx = 50, cy = 50) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
const _poly = pts => 'M' + pts.map(p => p.map(v => +v.toFixed(2)).join(' ')).join('L') + 'Z';
const _seal = (n, r1, r2) => _poly([...Array(n * 2)].map((_, i) => _pt(-Math.PI / 2 + i * Math.PI / n, i % 2 ? r2 : r1)));
/* courbe fermée lisse (Catmull-Rom → Bézier) */
const _smooth = pts => { const n = pts.length; let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`; for (let i = 0; i < n; i++){ const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
  d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`; } return d + 'Z'; };
const _blob = (seed, k = 7) => { let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; return _smooth([...Array(k)].map((_, i) => _pt(i / k * Math.PI * 2, 30 + rnd() * 18))); };
/* trait épais le long d'une courbe (ruban plein) : pour soulignements, gribouillis, flèches dessinées */
const _ribbon = (f, n = 40, w0 = 4, w1 = 4) => { const L = [], R = [];
  for (let i = 0; i <= n; i++){ const t = i / n, p = f(t), q = f(Math.min(1, t + .01)), r = f(Math.max(0, t - .01)), dx = q[0] - r[0], dy = q[1] - r[1], l = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t) * Math.min(1, .35 + t * 5) * Math.min(1, .35 + (1 - t) * 5) / 2;
    L.push([p[0] - dy / l * w, p[1] + dx / l * w]); R.push([p[0] + dy / l * w, p[1] - dx / l * w]); }
  return _poly([...L, ...R.reverse()]); };
const _flower = (n, r = 44, c = 16) => { let d = ''; for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, [x, y] = _pt(a, r * .55); d += `M50 50Q${_pt(a - .5, r).map(v => v.toFixed(2)).join(' ')} ${_pt(a, r).map(v => v.toFixed(2)).join(' ')}Q${_pt(a + .5, r).map(v => v.toFixed(2)).join(' ')} 50 50Z`; void x; void y; } return d + _c(50, 50, c * .7); };
const _head = (x, y, a, s = 10) => _poly([[x + Math.cos(a) * s, y + Math.sin(a) * s], [x + Math.cos(a + 2.5) * s, y + Math.sin(a + 2.5) * s], [x + Math.cos(a - 2.5) * s, y + Math.sin(a - 2.5) * s]]);
const STICKER_SET = [
  ['seal8', 'Sceau 8 pointes', 'Badges', _seal(8, 48, 38)], ['seal12', 'Sceau 12 pointes', 'Badges', _seal(12, 48, 40)], ['seal16', 'Badge éclaté', 'Badges', _seal(16, 48, 41)], ['seal24', 'Badge dentelé', 'Badges', _seal(24, 48, 43)],
  ['rosette', 'Rosette', 'Badges', _seal(20, 40, 35) + 'M34 70 26 98 38 90 44 100 48 74ZM66 70 74 98 62 90 56 100 52 74Z'],
  ['shieldb', 'Écusson', 'Badges', 'M50 4 90 16V46C90 72 72 88 50 98 28 88 10 72 10 46V16Z'],
  ['ticket', 'Ticket', 'Étiquettes', 'M4 22H96V40A10 10 0 0 0 96 60V78H4V60A10 10 0 0 0 4 40Z'],
  ['tag2', 'Étiquette prix', 'Étiquettes', 'M4 30 24 10H96V90H24L4 70Z' + _c(22, 50, 5)], ['label', 'Étiquette arrondie', 'Étiquettes', 'M14 26H86A10 10 0 0 1 96 36V64A10 10 0 0 1 86 74H14L4 50Z'],
  ['bookmark2', 'Onglet', 'Étiquettes', 'M20 4H80V96L50 74 20 96Z'], ['flagb', 'Fanion', 'Étiquettes', 'M6 20H94L80 50 94 80H6Z'],
  ['ribbon', 'Ruban', 'Rubans', 'M14 30H86V66H14ZM14 38 2 38 10 52 2 66 14 66ZM86 38 98 38 90 52 98 66 86 66Z'], ['ribbon2', 'Ruban plié', 'Rubans', 'M10 34H90V62H10ZM10 62 22 74V62ZM90 62 78 74V62ZM10 40H-2L6 54-2 68H22V62H10ZM90 40H102L94 54 102 68H78V62H90Z'],
  ['banner', 'Bannière', 'Rubans', 'M4 28Q50 14 96 28V68Q50 54 4 68Z'], ['scroll', 'Parchemin', 'Rubans', 'M16 20H84A8 8 0 0 1 84 36V80A8 8 0 0 1 76 88H16A8 8 0 0 1 16 72V28A8 8 0 0 1 16 20Z'],
  ['bubble1', 'Bulle ronde', 'Bulles', 'M50 8C76 8 96 24 96 44S76 80 50 80C44 80 38 79 33 77L12 92 18 70C9 63 4 54 4 44 4 24 24 8 50 8Z'],
  ['bubble2', 'Bulle pensée', 'Bulles', _smooth([[20, 40], [26, 18], [50, 10], [74, 16], [90, 34], [84, 58], [62, 68], [36, 66], [16, 58]]) + _c(22, 80, 6) + _c(10, 94, 3.5)],
  ['bubble3', 'Bulle cri', 'Bulles', _poly([[8, 14], [30, 22], [44, 4], [56, 22], [80, 6], [76, 30], [98, 36], [80, 50], [94, 70], [70, 66], [62, 90], [50, 70], [28, 94], [30, 68], [4, 70], [20, 50], [2, 34], [24, 32]])],
  ['bubble4', 'Bulle carrée', 'Bulles', 'M8 10H92A4 4 0 0 1 96 14V66A4 4 0 0 1 92 70H44L24 90V70H8A4 4 0 0 1 4 66V14A4 4 0 0 1 8 10Z'],
  ['under1', 'Soulignement', 'Traits', _ribbon(t => [6 + t * 88, 56 - Math.sin(t * Math.PI) * 6], 40, 7, 5)], ['under2', 'Double soulignement', 'Traits', _ribbon(t => [6 + t * 88, 44 - Math.sin(t * Math.PI) * 4], 30, 6, 4) + _ribbon(t => [14 + t * 76, 60 - Math.sin(t * Math.PI) * 4], 30, 5, 3)],
  ['swoosh', 'Virgule', 'Traits', _ribbon(t => [6 + t * 88, 70 - Math.sin(t * Math.PI * .9) * 40], 50, 2, 12)], ['circlemk', 'Entourage', 'Traits', _ribbon(t => _pt(-1.8 + t * Math.PI * 2.15, 40 - t * 4, 50, 50).map((v, i) => i ? 50 + (v - 50) * .62 : v), 70, 5, 3)],
  ['zigzag', 'Zigzag', 'Traits', _ribbon(t => [6 + t * 88, 50 + (Math.abs((t * 8) % 2 - 1) - .5) * 26], 64, 5, 5)], ['wave2', 'Vague', 'Traits', _ribbon(t => [4 + t * 92, 50 + Math.sin(t * Math.PI * 4) * 12], 80, 6, 6)],
  ['scribble', 'Gribouillis', 'Traits', _ribbon(t => [10 + t * 80 + Math.sin(t * 40) * 6, 50 + Math.cos(t * 40) * 16], 120, 4, 4)],
  ['arrowc', 'Flèche courbe', 'Flèches dessinées', _ribbon(t => [10 + t * 70, 80 - Math.sin(t * Math.PI * .8) * 56], 40, 6, 6) + _head(82, 36, -.6, 13)],
  ['arrowl', 'Flèche boucle', 'Flèches dessinées', _ribbon(t => { const a = t * Math.PI * 2.2; return [12 + t * 66 + Math.sin(a) * 12, 60 - Math.cos(a) * 14 - t * 20]; }, 70, 5, 5) + _head(84, 30, -.4, 12)],
  ['arrowd', 'Flèche vers le bas', 'Flèches dessinées', _ribbon(t => [50 + Math.sin(t * 5) * 8, 6 + t * 70], 40, 6, 6) + _head(50, 88, Math.PI / 2, 13)],
  ['arrowz', 'Flèche zigzag', 'Flèches dessinées', _ribbon(t => [8 + t * 72, 60 + (Math.abs((t * 4) % 2 - 1) - .5) * 30], 50, 5, 5) + _head(86, 52, 0, 12)],
  ['sparkle2', 'Scintillement', 'Éclats', 'M50 2C53 38 62 47 98 50 62 53 53 62 50 98 47 62 38 53 2 50 38 47 47 38 50 2Z'],
  ['sparkle3', 'Trois éclats', 'Éclats', 'M38 10C40 34 46 40 70 42 46 44 40 50 38 74 36 50 30 44 6 42 30 40 36 34 38 10ZM76 54C77 66 80 69 92 70 80 71 77 74 76 86 75 74 72 71 60 70 72 69 75 66 76 54ZM78 6C79 14 81 16 89 17 81 18 79 20 78 28 77 20 75 18 67 17 75 16 77 14 78 6Z'],
  ['rays', 'Rayons', 'Éclats', [...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return _poly([_pt(a - .06, 22), _pt(a - .1, 48), _pt(a + .1, 48), _pt(a + .06, 22)]); }).join('')],
  ['burst2', 'Explosion', 'Éclats', _poly([...Array(18)].map((_, i) => _pt(-Math.PI / 2 + i * Math.PI / 9, i % 2 ? 26 + (i % 4) * 4 : 48 - (i % 3) * 4)))],
  ['confetti', 'Confettis', 'Fête', _r(10, 14, 8, 4) + _c(30, 30, 3.5) + _poly([[60, 10], [68, 14], [62, 20]]) + _r(80, 30, 4, 9) + _c(18, 60, 3) + _poly([[40, 56], [48, 52], [50, 60]]) + _r(70, 62, 9, 4) + _c(88, 82, 3.5) + _r(28, 84, 4, 8) + _c(56, 88, 2.5) + _poly([[84, 6], [92, 8], [88, 15]])],
  ['balloons', 'Ballons', 'Fête', _c(34, 32, 20) + _c(66, 40, 18) + 'M34 52 31 56H37ZM66 58 63 62H69Z'],
  ['heart2', 'Deux cœurs', 'Fête', 'M34 76S6 58 6 38A14 14 0 0 1 34 30 14 14 0 0 1 62 38C62 58 34 76 34 76ZM74 60S56 48 56 36A9 9 0 0 1 74 32 9 9 0 0 1 92 36C92 48 74 60 74 60Z'],
  ['crown2', 'Couronne', 'Fête', 'M8 30 28 52 50 18 72 52 92 30 84 80H16Z' + _r(16, 84, 68, 8)],
  ['party', 'Cotillon', 'Fête', 'M10 92 34 30 72 68Z' + _c(70, 18, 4) + _c(86, 36, 3) + _r(56, 8, 4, 10) + _r(84, 52, 10, 4)],
  ['flower5', 'Fleur', 'Nature', _flower(5)], ['flower8', 'Marguerite', 'Nature', _flower(8, 46, 14)], ['flower12', 'Tournesol', 'Nature', _flower(12, 46, 22)],
  ['leaf2', 'Feuille', 'Nature', 'M8 92C8 40 40 8 92 8 92 60 60 92 8 92Z'], ['leaves', 'Branche', 'Nature', 'M48 98 52 98 52 10 48 10Z' + [20, 40, 60, 80].map((y, i) => i % 2 ? `M52 ${y}C70 ${y - 18} 88 ${y - 14} 94 ${y - 6} 82 ${y + 6} 66 ${y + 6} 52 ${y}Z` : `M48 ${y}C30 ${y - 18} 12 ${y - 14} 6 ${y - 6} 18 ${y + 6} 34 ${y + 6} 48 ${y}Z`).join('')],
  ['cloud2', 'Nuage', 'Nature', _smooth([[14, 66], [8, 52], [20, 40], [34, 40], [40, 24], [58, 20], [70, 32], [86, 34], [94, 50], [86, 66]])], ['sun2', 'Soleil', 'Nature', _c(50, 50, 20) + [...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return _poly([_pt(a - .12, 28), _pt(a, 46), _pt(a + .12, 28)]); }).join('')],
  ['drop2', 'Goutte', 'Nature', 'M50 4C50 4 84 46 84 64A34 34 0 0 1 16 64C16 46 50 4 50 4Z'], ['bolt2', 'Éclair', 'Nature', 'M58 2 14 58H46L38 98 86 38H54Z'], ['wavesea', 'Vagues', 'Nature', 'M0 50Q12 38 25 50T50 50 75 50 100 50V100H0ZM0 72Q12 60 25 72T50 72 75 72 100 72V100H0Z'],
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => ['blob' + i, 'Forme organique ' + i, 'Formes organiques', _blob(i * 137 + 11, 6 + (i % 3))]),
  ['corner', 'Coin décoratif', 'Ornements', 'M4 4H60V12H12V60H4ZM20 20H44V26H26V44H20Z' + _c(52, 52, 5)], ['divider', 'Séparateur', 'Ornements', 'M2 48H38V52H2ZM62 48H98V52H62Z' + _poly([[50, 38], [60, 50], [50, 62], [40, 50]])],
  ['frameo', 'Cadre ovale', 'Ornements', 'M50 4A42 46 0 1 1 49.9 4ZM50 12A34 38 0 1 0 50.1 12Z'], ['ring2', 'Anneau', 'Ornements', 'M4 50a46 46 0 1 0 92 0a46 46 0 1 0-92 0ZM14 50a36 36 0 1 1 72 0a36 36 0 1 1-72 0Z'],
  ['dots3', 'Points', 'Ornements', [...Array(5)].map((_, i) => [...Array(5)].map((_, j) => _c(14 + i * 18, 14 + j * 18, 4)).join('')).join('')], ['stripes', 'Rayures', 'Ornements', [...Array(6)].map((_, i) => _poly([[i * 18 - 10, 100], [i * 18 + 2, 100], [i * 18 + 42, 0], [i * 18 + 30, 0]])).join('')],
];
const STICKERS = Object.fromEntries(STICKER_SET.map(x => [x[0], x[3]]));
for (const [k, n] of STICKER_SET.map(x => [x[0], x[1]])){ ICONS[k] = STICKERS[k]; ICON_NAMES[k] = n; }
const STICKER_CATS = [...new Set(STICKER_SET.map(x => x[2]))];
const isSticker = k => !!STICKERS[k];

/* ===== Tableaux ===== */
function drawTable(ctx, L, w, h){
  const R = L.rows || [[]], nr = R.length, nc = Math.max(1, ...R.map(r => r.length)), rh = h / nr, pad = Math.max(2, L.fs * .45);
  ctx.save(); ctx.font = `500 ${L.fs}px ${fontCss(L.font)}`;
  // largeurs de colonnes : selon le contenu le plus long, bornées
  const want = [...Array(nc)].map((_, c) => Math.max(L.fs * 2, ...R.map(r => ctx.measureText(r[c] || '').width + pad * 2)));
  const tot = want.reduce((a, b) => a + b, 0), cw = want.map(v => v / tot * w);
  const xs = cw.reduce((a, v, i) => (a.push(a[i] + v), a), [0]);
  R.forEach((r, i) => {
    const y = i * rh, head = L.hdr && i === 0;
    const bg = head ? L.hbg : (L.alt && i % 2 === (L.hdr ? 0 : 1) ? L.alt : L.bg); if (bg){ ctx.fillStyle = bg; ctx.fillRect(0, y, w, rh); }
    ctx.fillStyle = head ? (L.hcol || L.col) : L.col; ctx.font = `${head ? 700 : 400} ${L.fs}px ${fontCss(L.font)}`; ctx.textBaseline = 'middle';
    for (let c = 0; c < nc; c++){
      let t = r[c] || ''; const maxW = cw[c] - pad * 2; while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -2) + '…';
      const al = /^[-+]?[\d\s.,]+\s*(€|%|\$|k€|M€)?$/.test(t.trim()) && t.trim() ? 'right' : ({l:'left', c:'center', r:'right'}[L.align] || 'left');
      ctx.textAlign = al; ctx.fillText(t, al === 'left' ? xs[c] + pad : al === 'right' ? xs[c + 1] - pad : xs[c] + cw[c] / 2, y + rh / 2);
    }
  });
  if (L.bc && L.bw){ ctx.strokeStyle = L.bc; ctx.lineWidth = L.bw; ctx.beginPath(); for (let i = 0; i <= nr; i++){ const y = Math.min(h - L.bw / 2, Math.max(L.bw / 2, i * rh)); ctx.moveTo(0, y); ctx.lineTo(w, y); }
    for (let c = 0; c <= nc; c++){ const x = Math.min(w - L.bw / 2, Math.max(L.bw / 2, xs[c])); ctx.moveTo(x, 0); ctx.lineTo(x, h); } ctx.stroke(); }
  ctx.restore();
}
const tableText = L => (L.rows || []).map(r => r.join(' ; ')).join('\n');
const parseTable = s => String(s).split('\n').map(l => l.includes('\t') ? l.split('\t') : l.split(';')).map(r => r.map(c => c.trim())).filter((r, i, a) => r.some(Boolean) || (i > 0 && i < a.length - 1)).slice(0, 30).map(r => r.slice(0, 12));

/* ===== Maquettes d'appareils : l'image (ou la vidéo) s'affiche dans l'écran ===== */
function mockScreen(L, w, h){
  switch (L.dev){
    case 'phone': { const b = w * .045; return {x:b, y:b, w:w - b * 2, h:h - b * 2, r:w * .1}; }
    case 'tablet': { const b = w * .05; return {x:b, y:b, w:w - b * 2, h:h - b * 2, r:w * .03}; }
    case 'laptop': { const sh = h * .9, b = w * .035; return {x:w * .08 + b, y:b, w:w * .84 - b * 2, h:sh - b * 2 - h * .02, r:0}; }
    case 'browser': { const bar = Math.max(h * .085, 14); return {x:0, y:bar, w, h:h - bar, r:0}; }
    case 'desktop': { const b = w * .03; return {x:b, y:b, w:w - b * 2, h:h * .78 - b * 2, r:0}; }
    case 'watch': { const t = h * .2, b = w * .08; return {x:b, y:t + b, w:w - b * 2, h:h - t * 2 - b * 2, r:w * .18}; }
  }
  return {x:0, y:0, w, h, r:0};
}
function drawMock(ctx, L, w, h, P, o){
  const fc = L.fc || '#16131F', S = mockScreen(L, w, h);
  ctx.save(); ctx.fillStyle = fc;
  switch (L.dev){
    case 'phone': roundRect(ctx, 0, 0, w, h, w * .14); ctx.fill(); break;
    case 'tablet': roundRect(ctx, 0, 0, w, h, w * .06); ctx.fill(); break;
    case 'laptop': roundRect(ctx, w * .08, 0, w * .84, h * .9, w * .025); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, h * .92); ctx.lineTo(w, h * .92); ctx.lineTo(w * .96, h); ctx.lineTo(w * .04, h); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(w * .42, h * .92, w * .16, h * .015); break;
    case 'browser': { const bar = S.y; roundRect(ctx, 0, 0, w, h, Math.min(w, h) * .02); ctx.fill(); ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bar * .5 + i * bar * .42, bar / 2, bar * .14, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = 'rgba(255,255,255,.14)'; roundRect(ctx, bar * 1.9, bar * .22, w - bar * 2.6, bar * .56, bar * .28); ctx.fill(); break; }
    case 'desktop': roundRect(ctx, 0, 0, w, h * .78, w * .015); ctx.fill(); ctx.fillRect(w * .44, h * .78, w * .12, h * .14); roundRect(ctx, w * .3, h * .92, w * .4, h * .06, h * .02); ctx.fill(); break;
    case 'watch': roundRect(ctx, w * .18, 0, w * .64, h * .22, w * .06); ctx.fill(); roundRect(ctx, w * .18, h * .78, w * .64, h * .22, w * .06); ctx.fill(); roundRect(ctx, 0, h * .14, w, h * .72, w * .22); ctx.fill(); break;
  }
  ctx.shadowColor = 'transparent';
  // écran
  ctx.save(); roundRect(ctx, S.x, S.y, S.w, S.h, S.r); ctx.clip();
  const m = L.media && P.media[L.media], el = m && (o?.els?.[L.id] || MEDIA.el(m));
  if (el && !(m.kind === 'video' && el.readyState < 2)){ ctx.translate(S.x, S.y); drawMedia(ctx, {fit:L.fit || 'cover', crop:null}, el, m, S.w, S.h); }
  else { const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h); g.addColorStop(0, '#E8E4F2'); g.addColorStop(1, '#C9C2E0'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    if (!o?.final){ ctx.fillStyle = '#6D5FA0'; ctx.font = `600 ${Math.max(8, S.w * .06)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(m ? 'Média absent' : 'Glissez une image', S.x + S.w / 2, S.y + S.h / 2); } }
  ctx.restore();
  if (L.dev === 'phone'){ ctx.fillStyle = fc; roundRect(ctx, w * .36, S.y + w * .02, w * .28, w * .07, w * .035); ctx.fill(); }
  ctx.restore();
}

/* ===== Retouches au pixel supplémentaires : netteté, contour du détourage, amélioration automatique ===== */
function sharpenData(im, amt){
  const {width:W, height:H, data:d} = im, src = new Uint8ClampedArray(d), a = amt / 100 * 1.2;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ const i = (y * W + x) * 4;
    for (let c = 0; c < 3; c++){ const v = src[i + c] * (1 + 4 * a) - a * (src[i + c - 4] + src[i + c + 4] + src[i + c - W * 4] + src[i + c + W * 4]); d[i + c] = v; } }
}
/* contour autour des zones opaques (autocollant) : silhouette décalée dans 16 directions, puis l'image par-dessus */
function outlined(cv, col, px){
  const o = document.createElement('canvas'); o.width = cv.width + px * 2; o.height = cv.height + px * 2; const g = o.getContext('2d');
  const sil = document.createElement('canvas'); sil.width = cv.width; sil.height = cv.height; const s = sil.getContext('2d'); s.drawImage(cv, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = col; s.fillRect(0, 0, sil.width, sil.height);
  for (let k = 0; k < 24; k++){ const a = k / 24 * Math.PI * 2; g.drawImage(sil, px + Math.cos(a) * px, px + Math.sin(a) * px); }
  g.drawImage(sil, px, px); g.drawImage(cv, px, px); return o;
}
/* réglages proposés par « Amélioration automatique » : étirement de l'histogramme, saturation selon la fadeur */
function autoEnhance(el){
  const sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight; if (!sw) return null;
  const c = document.createElement('canvas'), W = 160, H = Math.max(1, Math.round(160 * sh / sw)); c.width = W; c.height = H; const g = c.getContext('2d', {willReadFrequently:true}); g.drawImage(el, 0, 0, W, H);
  let d; try { d = g.getImageData(0, 0, W, H).data; } catch(e){ return null; }
  const hist = new Array(256).fill(0); let sat = 0, n = 0;
  for (let i = 0; i < d.length; i += 4){ const r = d[i], gg = d[i + 1], b = d[i + 2], l = Math.round(r * .299 + gg * .587 + b * .114); hist[l]++; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); sat += mx ? (mx - mn) / mx : 0; n++; }
  const pct = q => { let acc = 0; for (let i = 0; i < 256; i++){ acc += hist[i]; if (acc >= n * q) return i; } return 255; };
  const lo = pct(.01), hi = pct(.99), mid = pct(.5), con = clamp(Math.round((255 / Math.max(40, hi - lo) - 1) * 60), 0, 40), bri = clamp(Math.round((128 - mid) / 128 * 30), -25, 30), s = sat / n;
  return {bri, con, sat:clamp(Math.round((.32 - s) * 120), -10, 30)};
}

/* ===== Effets sonores et boucles musicales générés (libres de droits : créés par le navigateur) ===== */
const SOUNDS = [
  ['pop', 'Pop', 'Effets', .25], ['click', 'Clic', 'Effets', .12], ['ding', 'Ding', 'Effets', 1.6], ['whoosh', 'Whoosh', 'Effets', .9], ['rise', 'Montée', 'Effets', 2.2], ['impact', 'Impact', 'Effets', 1.8],
  ['success', 'Réussite', 'Effets', 1.1], ['error', 'Erreur', 'Effets', .6], ['notif', 'Notification', 'Effets', .7], ['heart', 'Battement de cœur', 'Effets', 2], ['applause', 'Applaudissements', 'Effets', 3.5],
  ['drumroll', 'Roulement de tambour', 'Effets', 2.5], ['gong', 'Gong', 'Effets', 4], ['type', 'Machine à écrire', 'Effets', 2], ['beep', 'Bips de décompte', 'Effets', 3.2], ['laser', 'Laser', 'Effets', .5], ['coin', 'Pièce', 'Effets', .6], ['swipe', 'Glissement', 'Effets', .45],
  ['lofi', 'Boucle douce (lo-fi)', 'Musiques', 16], ['upbeat', 'Boucle énergique', 'Musiques', 12], ['ambient', 'Nappe d\'ambiance', 'Musiques', 20], ['corporate', 'Boucle « entreprise »', 'Musiques', 16], ['chill', 'Boucle détente', 'Musiques', 16],
];
async function synthSound(k){
  const meta = SOUNDS.find(x => x[0] === k); if (!meta) return null;
  const sr = 44100, dur = meta[3], OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, ac = new OAC(2, Math.ceil(sr * dur), sr), out = ac.createGain(); out.gain.value = .8; out.connect(ac.destination);
  const noise = (len = 1) => { const b = ac.createBuffer(1, Math.ceil(sr * len), sr), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; };
  const tone = (f, t0, len, type = 'sine', vol = .5, f2, dest = out) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + len);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(.01, len / 4)); g.gain.exponentialRampToValueAtTime(.0008, t0 + len); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + len + .05); };
  const nz = (t0, len, vol, f, q = 1, type = 'bandpass', f2) => { const s = noise(len + .1), bf = ac.createBiquadFilter(), g = ac.createGain(); bf.type = type; bf.frequency.setValueAtTime(f, t0); if (f2) bf.frequency.exponentialRampToValueAtTime(f2, t0 + len); bf.Q.value = q;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(.02, len / 3)); g.gain.exponentialRampToValueAtTime(.0008, t0 + len); s.connect(bf); bf.connect(g); g.connect(out); s.start(t0); s.stop(t0 + len + .1); };
  const kick = t => tone(150, t, .35, 'sine', .9, 40), snare = t => { nz(t, .18, .5, 1800, .7); tone(190, t, .1, 'triangle', .3); }, hat = (t, v = .18) => nz(t, .05, v, 8000, .8, 'highpass');
  const chord = (t, notes, len, type = 'triangle', vol = .12) => notes.forEach(n => tone(440 * 2 ** ((n - 69) / 12), t, len, type, vol));
  switch (k){
    case 'pop': tone(600, 0, .12, 'sine', .8, 180); break;
    case 'click': nz(0, .03, .8, 3000, 2); break;
    case 'ding': tone(1318, 0, 1.5, 'sine', .5); tone(2637, 0, 1, 'sine', .15); break;
    case 'whoosh': nz(0, .85, .7, 400, 1.2, 'bandpass', 3000); break;
    case 'rise': nz(0, 2.1, .5, 300, 2, 'bandpass', 6000); tone(200, 0, 2.1, 'sawtooth', .08, 800); break;
    case 'impact': tone(90, 0, 1.6, 'sine', 1, 30); nz(0, .5, .6, 200, .5, 'lowpass'); break;
    case 'success': [72, 76, 79, 84].forEach((n, i) => tone(440 * 2 ** ((n - 69) / 12), i * .1, .6, 'triangle', .35)); break;
    case 'error': tone(220, 0, .25, 'square', .25); tone(180, .28, .3, 'square', .25); break;
    case 'notif': tone(880, 0, .25, 'sine', .4); tone(1175, .12, .5, 'sine', .4); break;
    case 'heart': [0, .25, 1, 1.25].forEach(t => tone(70, t, .2, 'sine', .9, 45)); break;
    case 'applause': for (let i = 0; i < 260; i++) nz(Math.random() * 3.2, .04, Math.random() * .25 * Math.sin(Math.PI * Math.min(1, i / 200)), 1500 + Math.random() * 2500, 1.5); break;
    case 'drumroll': for (let t = 0; t < 2.2; t += .045) nz(t, .05, .25 + t / 6, 1700, .8); kick(2.2); nz(2.2, .3, .6, 6000, .5, 'highpass'); break;
    case 'gong': [110, 165, 220, 297].forEach((f, i) => tone(f, 0, 3.8, 'sine', .3 / (i + 1))); nz(0, 1, .2, 500, 1); break;
    case 'type': for (let t = 0; t < 1.9; t += .09 + Math.random() * .08) nz(t, .03, .6, 2500 + Math.random() * 1500, 3); tone(1800, 1.85, .15, 'sine', .3); break;
    case 'beep': [0, 1, 2].forEach(t => tone(880, t, .15, 'square', .2)); tone(1760, 3, .2, 'square', .25); break;
    case 'laser': tone(1800, 0, .4, 'sawtooth', .25, 120); break;
    case 'coin': tone(988, 0, .08, 'square', .25); tone(1319, .08, .45, 'square', .25); break;
    case 'swipe': nz(0, .4, .6, 1200, 1.5, 'bandpass', 5000); break;
    default: { // boucles : accords + rythme
      const bpm = {lofi:80, upbeat:120, ambient:60, corporate:100, chill:90}[k] || 100, b = 60 / bpm, bars = Math.floor(dur / (b * 4));
      const prog = {lofi:[[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]], upbeat:[[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], ambient:[[48, 55, 64, 67], [45, 52, 60, 64]], corporate:[[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]], chill:[[62, 65, 69, 72], [60, 64, 67, 71], [58, 62, 65, 69], [57, 60, 64, 67]]}[k];
      for (let bar = 0; bar < bars; bar++){ const t0 = bar * b * 4, ch = prog[bar % prog.length];
        chord(t0, ch, b * 4, k === 'ambient' ? 'sine' : 'triangle', k === 'ambient' ? .1 : .07); tone(440 * 2 ** ((ch[0] - 12 - 69) / 12), t0, b * 4, 'sine', .25);
        if (k !== 'ambient') for (let q = 0; q < 4; q++){ const t = t0 + q * b; if (q % 2 === 0) kick(t); else snare(t); hat(t + b / 2, .12); if (k === 'upbeat' || k === 'corporate'){ hat(t, .08); chord(t + b / 2, [ch[ch.length - 1] + 12], b / 3, 'sine', .05); } }
        if (k === 'lofi' || k === 'chill') nz(t0, b * 4, .03, 6000, .5, 'highpass'); }
    }
  }
  const buf = await ac.startRendering();
  return new File([wavOf(buf)], `${meta[1]}.wav`, {type:'audio/wav'});
}

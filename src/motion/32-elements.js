/* ---------- Éléments dessinés par Spectra Motion : QR codes, graphiques, icônes, dessins à main levée ---------- */

/* ===== QR code (norme ISO/IEC 18004) : mode octets (UTF-8), versions 1 à 40, correction L / M / Q / H, choix du meilleur masque ===== */
const QR_ECC = {L:[-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M:[-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q:[-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H:[-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]};
const QR_BLK = {L:[-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M:[-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q:[-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H:[-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]};
const QR_FMT = {L:1, M:0, Q:3, H:2};
function qrRawModules(v){ let r = (16 * v + 128) * v + 64; if (v >= 2){ const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; }
const qrDataCw = (v, e) => Math.floor(qrRawModules(v) / 8) - QR_ECC[e][v] * QR_BLK[e][v];
function gfMul(x, y){ let z = 0; for (let i = 7; i >= 0; i--){ z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 0xFF; }
function rsDivisor(deg){ const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++){ for (let j = 0; j < r.length; j++){ r[j] = gfMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = gfMul(root, 2); } return r; }
function rsRemainder(data, div){ const r = div.map(() => 0); for (const b of data){ const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => r[i] ^= gfMul(c, f)); } return r; }
function qrAlignPos(v, size){ if (v === 1) return []; const n = Math.floor(v / 7) + 2, step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2, r = [6]; for (let p = size - 7; r.length < n; p -= step) r.splice(1, 0, p); return r; }
const QR_CACHE = new Map();
/* matrice du QR code : tableau de lignes de booléens (true = module foncé), ou null si le texte est trop long */
function qrMatrix(text, ecl = 'M'){
  const key = ecl + '|' + text; if (QR_CACHE.has(key)) return QR_CACHE.get(key);
  const bytes = [...new TextEncoder().encode(String(text))];
  let ver = 0, cap = 0;
  for (let v = 1; v <= 40; v++){ cap = qrDataCw(v, ecl) * 8; const need = 4 + (v <= 9 ? 8 : 16) + bytes.length * 8; if (need <= cap){ ver = v; break; } }
  if (!ver){ QR_CACHE.set(key, null); return null; }
  // flux de bits : mode octets, longueur, données, fin, remplissage
  const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
  for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
  const data = []; for (let i = 0; i < bits.length; i += 8){ let b = 0; for (let k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
  // correction d'erreurs et entrelacement des blocs
  const nb = QR_BLK[ecl][ver], ecLen = QR_ECC[ecl][ver], raw = Math.floor(qrRawModules(ver) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(ecLen), blocks = [];
  for (let i = 0, k = 0; i < nb; i++){ const d = data.slice(k, k + shortLen - ecLen + (i < nShort ? 0 : 1)); k += d.length; const ec = rsRemainder(d, div); if (i < nShort) d.push(0); blocks.push(d.concat(ec)); }
  const cw = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - ecLen || j >= nShort) cw.push(b[i]); });
  // motifs fixes
  const size = ver * 4 + 17, M = [...Array(size)].map(() => new Array(size).fill(false)), F = [...Array(size)].map(() => new Array(size).fill(false));
  const set = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
  for (let i = 0; i < size; i++){ set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++){ const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4); } };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  const ap = qrAlignPos(ver, size), na = ap.length;
  for (let i = 0; i < na; i++) for (let j = 0; j < na; j++){ if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }
  const drawFormat = mask => {
    const d = QR_FMT[ecl] << 3 | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412, g = i => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, g(i)); set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8)); for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i)); for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i)); set(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7){ let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = ver << 12 | r; for (let i = 0; i < 18; i++){ const bit = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); set(a, c, bit); set(c, a, bit); } }
  // données en zigzag
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2){ if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++){ const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
      if (!F[y][x] && bi < cw.length * 8){ M[y][x] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; } } }
  // masque : celui qui donne la plus faible pénalité
  const cond = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => x * y % 2 + x * y % 3 === 0, (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  const applyMask = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && cond[m](x, y)) M[y][x] = !M[y][x]; };
  const penalty = () => {
    let p = 0, dark = 0;
    const runs = line => { let n = 1; for (let i = 1; i <= line.length; i++){ if (i < line.length && line[i] === line[i - 1]) n++; else { if (n >= 5) p += 3 + n - 5; n = 1; } } };
    const pat = line => { const s = line.map(v => v ? 1 : 0).join(''); for (const q of ['10111010000', '00001011101']){ let k = s.indexOf(q); while (k >= 0){ p += 40; k = s.indexOf(q, k + 1); } } };
    for (let y = 0; y < size; y++){ runs(M[y]); pat(M[y]); dark += M[y].filter(Boolean).length; }
    for (let x = 0; x < size; x++){ const col = M.map(r => r[x]); runs(col); pat(col); }
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++){ const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
    return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  };
  let best = 0, bestP = Infinity;
  for (let m = 0; m < 8; m++){ applyMask(m); drawFormat(m); const pe = penalty(); if (pe < bestP){ bestP = pe; best = m; } applyMask(m); }
  applyMask(best); drawFormat(best);
  QR_CACHE.set(key, M); if (QR_CACHE.size > 60) QR_CACHE.delete(QR_CACHE.keys().next().value);
  return M;
}
function drawQr(ctx, L, w, h){
  const M = qrMatrix(L.txt || ' ', L.ecc || 'M');
  if (L.bgc){ ctx.fillStyle = L.bgc; ctx.fillRect(0, 0, w, h); }
  if (!M){ ctx.fillStyle = L.col; ctx.font = `600 ${Math.max(8, w * .06)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Texte trop long', w / 2, h / 2); return; }
  const n = M.length, q = 2, s = Math.min(w, h) / (n + q * 2), ox = (w - s * n) / 2, oy = (h - s * n) / 2;
  ctx.fillStyle = L.col; ctx.beginPath();
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (M[y][x]) ctx.rect(ox + x * s - .02, oy + y * s - .02, s + .04, s + .04);
  ctx.fill();
}

/* ===== graphiques ===== */
const fmtNum = (v, u = '') => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('fr-FR') : String(round(v, 1)).replace('.', ',')) + (u ? (u === '%' ? ' %' : ' ' + u) : '');
function drawChart(ctx, L, w, h){
  const d = L.data || [], pal = L.pal?.length ? L.pal : PALETTE_DEF, fs = Math.max(10, Math.min(w, h) * .055), font = fontCss(L.font), col = L.tcol || '#16131F';
  ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const txt = (t, x, y, al = 'center', wgt = 500, size = fs) => { ctx.font = `${wgt} ${size}px ${font}`; ctx.textAlign = al; ctx.fillStyle = col; ctx.fillText(t, x, y); };
  if (L.ck === 'pie' || L.ck === 'donut'){
    const tot = d.reduce((a, r) => a + Math.max(0, r[1]), 0) || 1, legend = L.labs && w > h * 1.15, R = Math.min(legend ? w * .5 : w, h) / 2 * .92, cx = legend ? R + w * .02 : w / 2, cy = h / 2;
    let a = -Math.PI / 2;
    d.forEach((r, i) => { const v = Math.max(0, r[1]), da = v / tot * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a, a + da); ctx.closePath(); ctx.fillStyle = pal[i % pal.length]; ctx.fill();
      if (L.vals && da > .25){ const m = a + da / 2, rr = L.ck === 'donut' ? R * .78 : R * .62; ctx.font = `700 ${fs * .9}px ${font}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(Math.round(v / tot * 100) + ' %', cx + Math.cos(m) * rr, cy + Math.sin(m) * rr); }
      a += da; });
    if (L.ck === 'donut'){ ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(cx, cy, R * .56, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    if (legend){ const x0 = cx + R + w * .06, lh = Math.min(fs * 1.7, h / Math.max(1, d.length)); d.forEach((r, i) => { const y = cy + (i - (d.length - 1) / 2) * lh; ctx.fillStyle = pal[i % pal.length]; roundRect(ctx, x0, y - fs * .4, fs * .8, fs * .8, fs * .2); ctx.fill(); txt(r[0], x0 + fs * 1.2, y, 'left', 500); }); }
    ctx.restore(); return;
  }
  if (L.ck === 'prog'){
    const v = clamp(d[0]?.[1] ?? 0, 0, 100), R = Math.min(w, h) / 2 * .86, cx = w / 2, cy = h / 2, lw = R * .2;
    ctx.lineCap = 'round'; ctx.lineWidth = lw; ctx.globalAlpha = .15; ctx.strokeStyle = pal[0]; ctx.beginPath(); ctx.arc(cx, cy, R - lw / 2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R - lw / 2, -Math.PI / 2, -Math.PI / 2 + v / 100 * Math.PI * 2); ctx.stroke();
    txt(Math.round(v) + ' %', cx, cy - (L.labs ? R * .12 : 0), 'center', 800, R * .42); if (L.labs) txt(d[0]?.[0] || '', cx, cy + R * .3, 'center', 500, R * .13);
    ctx.restore(); return;
  }
  const vals = d.map(r => r[1]), max = Math.max(0, ...vals), min = Math.min(0, ...vals), span = (max - min) || 1, horiz = L.ck === 'bar';
  const padL = horiz ? (L.labs ? Math.min(w * .32, Math.max(...d.map(r => { ctx.font = `500 ${fs}px ${font}`; return ctx.measureText(r[0]).width; })) + fs) : fs * .5) : fs * .5, padB = horiz ? fs * .5 : (L.labs ? fs * 2 : fs * .5), padT = L.vals ? fs * 1.6 : fs * .5, padR = horiz && L.vals ? fs * 3.2 : fs * .5;
  const X0 = padL, Y0 = padT, W = Math.max(10, w - padL - padR), H = Math.max(10, h - padT - padB), n = Math.max(1, d.length);
  if (L.grid){ ctx.save(); ctx.globalAlpha = .14; ctx.lineWidth = Math.max(1, fs * .06); for (let i = 0; i <= 4; i++){ ctx.beginPath(); if (horiz){ const x = X0 + W * i / 4; ctx.moveTo(x, Y0); ctx.lineTo(x, Y0 + H); } else { const y = Y0 + H * i / 4; ctx.moveTo(X0, y); ctx.lineTo(X0 + W, y); } ctx.stroke(); } ctx.restore(); }
  const zero = horiz ? X0 + (-min) / span * W : Y0 + H - (-min) / span * H;
  if (L.ck === 'col' || L.ck === 'bar'){
    const slot = (horiz ? H : W) / n, bw = slot * .64;
    d.forEach((r, i) => { const v = r[1], c = pal[i % pal.length]; ctx.fillStyle = c;
      if (horiz){ const y = Y0 + slot * i + (slot - bw) / 2, x1 = X0 + (v - min) / span * W; roundRect(ctx, Math.min(zero, x1), y, Math.abs(x1 - zero), bw, Math.min(bw * .18, Math.abs(x1 - zero) / 2)); ctx.fill();
        if (L.labs) txt(r[0], X0 - fs * .5, y + bw / 2, 'right'); if (L.vals) txt(fmtNum(v, L.unit), Math.max(zero, x1) + fs * .4, y + bw / 2, 'left', 700); }
      else { const x = X0 + slot * i + (slot - bw) / 2, y1 = Y0 + H - (v - min) / span * H; roundRect(ctx, x, Math.min(zero, y1), bw, Math.abs(zero - y1), Math.min(bw * .18, Math.abs(zero - y1) / 2)); ctx.fill();
        if (L.labs) txt(r[0], x + bw / 2, Y0 + H + fs, 'center'); if (L.vals) txt(fmtNum(v, L.unit), x + bw / 2, Math.min(zero, y1) - fs * .7, 'center', 700); } });
  } else {
    const pts = d.map((r, i) => [X0 + (n === 1 ? W / 2 : W * i / (n - 1)), Y0 + H - (r[1] - min) / span * H]);
    if (L.ck === 'area' && pts.length > 1){ const g = ctx.createLinearGradient(0, Y0, 0, Y0 + H); g.addColorStop(0, pal[0] + 'AA'); g.addColorStop(1, pal[0] + '10'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(pts[0][0], zero); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], zero); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = pal[0]; ctx.lineWidth = Math.max(2, fs * .22); ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    pts.forEach((p, i) => { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(p[0], p[1], fs * .32, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = Math.max(2, fs * .14); ctx.stroke();
      if (L.labs) txt(d[i][0], p[0], Y0 + H + fs, 'center'); if (L.vals) txt(fmtNum(d[i][1], L.unit), p[0], p[1] - fs * .9, 'center', 700); });
  }
  ctx.restore();
}

/* ===== icônes ===== */
function drawIcon(ctx, L, w, h){
  const p = iconPath(L.ic); if (!p) return;
  if (isSticker(L.ic)){ // autocollant : forme pleine sur une grille de 100
    ctx.save(); ctx.scale(w / 100, h / 100); ctx.fillStyle = L.col; if (L.bgc){ const g = ctx.createLinearGradient(0, 0, 100, 100); g.addColorStop(0, L.col); g.addColorStop(1, L.bgc); ctx.fillStyle = g; } ctx.fill(p); ctx.restore(); return;
  }
  if (L.bgc){ ctx.fillStyle = L.bgc; ctx.beginPath(); if (L.bgs === 'circle') ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); else roundRect(ctx, 0, 0, w, h, L.bgs === 'round' ? Math.min(w, h) * .22 : 0); ctx.fill(); ctx.shadowColor = 'transparent'; }
  const pad = L.bgc ? .2 : 0, s = Math.min(w, h) * (1 - pad * 2) / 24;
  ctx.save(); ctx.translate((w - 24 * s) / 2, (h - 24 * s) / 2); ctx.scale(s, s);
  ctx.strokeStyle = L.col; ctx.lineWidth = L.sw || 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); ctx.restore();
}

/* ===== dessin à main levée : points normalisés dans le cadre, lissés ===== */
function drawStroke(ctx, L, w, h){
  const P = L.pts; if (!P || P.length < 2) return;
  ctx.strokeStyle = L.col; ctx.lineWidth = L.sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (L.hl) ctx.globalAlpha *= .45;
  ctx.beginPath(); ctx.moveTo(P[0][0] * w, P[0][1] * h);
  for (let i = 1; i < P.length - 1; i++){ const mx = (P[i][0] + P[i + 1][0]) / 2 * w, my = (P[i][1] + P[i + 1][1]) / 2 * h; ctx.quadraticCurveTo(P[i][0] * w, P[i][1] * h, mx, my); }
  ctx.lineTo(P[P.length - 1][0] * w, P[P.length - 1][1] * h); ctx.stroke();
}
/* simplification d'un tracé (Ramer–Douglas–Peucker) : moins de points, même forme */
function simplify(pts, eps){
  if (pts.length < 3) return pts;
  const d = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy; if (!l) return Math.hypot(p[0] - a[0], p[1] - a[1]); const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l, 0, 1); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  let m = 0, k = 0; for (let i = 1; i < pts.length - 1; i++){ const v = d(pts[i], pts[0], pts[pts.length - 1]); if (v > m){ m = v; k = i; } }
  return m > eps ? [...simplify(pts.slice(0, k + 1), eps).slice(0, -1), ...simplify(pts.slice(k), eps)] : [pts[0], pts[pts.length - 1]];
}

/* ===== retouche au pixel : bichromie, retrait d'un fond uni, grain (résultats gardés en cache) ===== */
const PIX = {cache:new Map(), grainCv:null,
  key(L, el){ return [L.media, el.currentTime || 0, L.duo?.a, L.duo?.b, L.bgk?.c, L.bgk?.tol, L.bgk?.soft, PIX_ADJ.map(k => adjOf(L)[k] || 0).join(','), L.pfx?.k, L.pfx?.v, L.oln?.c, L.oln?.w, Math.round(L.w), JSON.stringify(L.crop), el.videoWidth || el.naturalWidth].join('|'); },
  /* image source traitée (canvas), ou l'élément d'origine si rien à faire */
  src(L, el, isVideo){
    const AJ = adjOf(L), pa = PIX_ADJ.some(k => AJ[k]), pf = L.pfx && L.pfx.k !== 'none';
    if (!L.duo && !L.bgk && !pa && !pf && !L.oln) return el;
    const k = this.key(L, el); if (!isVideo && this.cache.has(k)) return this.cache.get(k);
    const sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight; if (!sw || !sh) return el;
    const lim = isVideo ? 960 : 2400, f = Math.min(1, lim / Math.max(sw, sh)), W = Math.max(1, Math.round(sw * f)), H = Math.max(1, Math.round(sh * f));
    const cv = (isVideo && this.vcv?.[L.id]) || document.createElement('canvas'); cv.width = W; cv.height = H; if (isVideo) (this.vcv ||= {})[L.id] = cv;
    const g = cv.getContext('2d', {willReadFrequently:true}); g.drawImage(el, 0, 0, W, H);
    let im; try { im = g.getImageData(0, 0, W, H); } catch(e){ return el; }
    const p = im.data, hx = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const ka = L.bgk ? hx(L.bgk.c) : null, tol = L.bgk ? L.bgk.tol * 4.4 : 0, soft = L.bgk ? Math.max(1, L.bgk.soft * 4.4) : 1;
    const A = L.duo ? hx(L.duo.a) : null, B = L.duo ? hx(L.duo.b) : null;
    for (let i = 0; i < p.length; i += 4){
      if (ka){ const dd = Math.hypot(p[i] - ka[0], p[i + 1] - ka[1], p[i + 2] - ka[2]); if (dd < tol) p[i + 3] = 0; else if (dd < tol + soft) p[i + 3] = Math.round(p[i + 3] * (dd - tol) / soft); }
      if (A){ const l = (p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114) / 255; p[i] = A[0] + (B[0] - A[0]) * l; p[i + 1] = A[1] + (B[1] - A[1]) * l; p[i + 2] = A[2] + (B[2] - A[2]) * l; }
    }
    if (AJ.clarity) clarityData(im, AJ.clarity);
    if (pa) toneData(im, AJ);
    if (AJ.sharp) sharpenData(im, AJ.sharp);
    if (pf) pfxData(im, L.pfx, W / Math.max(1, L.w));
    g.putImageData(im, 0, 0);
    let res = cv;
    if (L.oln){ res = outlined(cv, L.oln.c, Math.max(1, Math.round(L.oln.w * W / Math.max(1, L.w)))); res.naturalWidth = res.width; res.naturalHeight = res.height; }
    if (!isVideo){ this.cache.set(k, res); if (this.cache.size > 24) this.cache.delete(this.cache.keys().next().value); }
    if (res !== cv) return res;
    if (!isVideo){ this.cache.set(k, cv); if (this.cache.size > 24) this.cache.delete(this.cache.keys().next().value); }
    cv.naturalWidth = W; cv.naturalHeight = H; // le recadrage (relatif) s'applique à la taille réelle du canvas
    return cv;
  },
  grain(){ if (this.grainCv) return this.grainCv; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4){ const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); return this.grainCv = c; },
  /* couleur dominante des bords d'une image (pour « Retirer le fond ») */
  edgeColor(el){
    const sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight; if (!sw) return '#FFFFFF';
    const c = document.createElement('canvas'), W = 64, H = Math.max(1, Math.round(64 * sh / sw)); c.width = W; c.height = H; const g = c.getContext('2d', {willReadFrequently:true}); g.drawImage(el, 0, 0, W, H);
    let d; try { d = g.getImageData(0, 0, W, H).data; } catch(e){ return '#FFFFFF'; }
    const n = {}; const add = (x, y) => { const i = (y * W + x) * 4, k = [d[i], d[i + 1], d[i + 2]].map(v => Math.round(v / 16) * 16).map(v => Math.min(255, v)); const s = k.join(','); n[s] = (n[s] || 0) + 1; };
    for (let x = 0; x < W; x++){ add(x, 0); add(x, H - 1); } for (let y = 0; y < H; y++){ add(0, y); add(W - 1, y); }
    const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
    return '#' + best.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  },
};

/* réglages au pixel : exposition, ombres, hautes lumières, vibrance, teinte vert / magenta */
function toneData(im, a){
  const d = im.data, ex = 2 ** ((a.expo || 0) / 100 * 1.6), sh = (a.shadows || 0) / 100, hi = (a.highlights || 0) / 100, vb = (a.vibrance || 0) / 100, tn = (a.tint || 0) / 100;
  if (!ex && !sh && !hi && !vb && !tn) return;
  for (let i = 0; i < d.length; i += 4){
    let r = d[i] * ex, g = d[i + 1] * ex, b = d[i + 2] * ex;
    if (sh || hi){ const l = clamp((r * .299 + g * .587 + b * .114) / 255, 0, 1), add = (sh * (1 - l) ** 2 * .55 + hi * l * l * .5) * 255; r += add; g += add; b += add; }
    if (vb){ const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx > 0 ? (mx - mn) / mx : 0, k = vb * (1 - sat) * 1.2, avg = (r + g + b) / 3; r += (r - avg) * k; g += (g - avg) * k; b += (b - avg) * k; }
    if (tn){ g -= tn * 28; r += tn * 14; b += tn * 14; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
}
/* clarté : contraste local (différence avec une version très floue, surtout dans les tons moyens) */
function clarityData(im, v){
  const {width:W, height:H, data:d} = im, sw = Math.max(2, Math.round(W / 24)), shh = Math.max(2, Math.round(H / 24));
  const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').putImageData(im, 0, 0);
  const sm = document.createElement('canvas'); sm.width = sw; sm.height = shh; const sg = sm.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(c, 0, 0, sw, shh);
  const bg = c.getContext('2d', {willReadFrequently:true}); bg.clearRect(0, 0, W, H); bg.imageSmoothingQuality = 'high'; bg.drawImage(sm, 0, 0, W, H);
  const bl = bg.getImageData(0, 0, W, H).data, k = v / 100 * 1.1;
  for (let i = 0; i < d.length; i += 4){ const l = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255, wgt = 1 - Math.abs(l - .5) * 1.4;
    for (let c2 = 0; c2 < 3; c2++) d[i + c2] = d[i + c2] + (d[i + c2] - bl[i + c2]) * k * Math.max(.15, wgt); }
}
/* effets photo : pixeliser, postériser, décalage RVB, négatif, noir et blanc pur, trame, relief, croquis */
function pfxData(im, f, scale = 1){
  const {width:W, height:H, data:d} = im, v = f.v ?? 50, lum = i => d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114;
  if (f.k === 'invert'){ for (let i = 0; i < d.length; i += 4){ d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; } return; }
  if (f.k === 'threshold'){ const th = 40 + v * 1.75; for (let i = 0; i < d.length; i += 4){ const o = lum(i) >= th ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = o; } return; }
  if (f.k === 'poster'){ const n = Math.round(2 + (100 - v) / 100 * 10), q = 255 / (n - 1); for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] / q) * q; return; }
  if (f.k === 'pixel' || f.k === 'halftone'){
    const cs = Math.max(2, Math.round((3 + v / 100 * 37) * Math.max(.2, scale) * (f.k === 'halftone' ? .7 : 1))), src = new Uint8ClampedArray(d);
    for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cs){
      let r = 0, g = 0, b = 0, a = 0, n = 0; const x2 = Math.min(W, x + cs), y2 = Math.min(H, y + cs);
      for (let yy = y; yy < y2; yy++) for (let xx = x; xx < x2; xx++){ const i = (yy * W + xx) * 4; r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3]; n++; }
      r /= n; g /= n; b /= n; a /= n;
      const rad = f.k === 'halftone' ? Math.sqrt(1 - (r * .299 + g * .587 + b * .114) / 255) * cs * .72 : 0, cx = x + cs / 2, cy = y + cs / 2;
      for (let yy = y; yy < y2; yy++) for (let xx = x; xx < x2; xx++){ const i = (yy * W + xx) * 4;
        if (f.k === 'pixel'){ d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
        else { const inn = Math.hypot(xx + .5 - cx, yy + .5 - cy) <= rad; d[i] = d[i + 1] = d[i + 2] = inn ? 20 : 250; d[i + 3] = a; } }
    }
    return;
  }
  if (f.k === 'rgb'){ const o = Math.max(1, Math.round(W * v / 100 * .03)), src = new Uint8ClampedArray(d);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const i = (y * W + x) * 4, il = (y * W + Math.max(0, x - o)) * 4, ir = (y * W + Math.min(W - 1, x + o)) * 4; d[i] = src[il]; d[i + 2] = src[ir + 2]; }
    return; }
  if (f.k === 'emboss' || f.k === 'sketch'){
    const src = new Float32Array(W * H); for (let i = 0, j = 0; j < src.length; i += 4, j++) src[j] = lum(i);
    const k = .4 + v / 100 * 1.6;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      const at = (xx, yy) => src[clamp(yy, 0, H - 1) * W + clamp(xx, 0, W - 1)], i = (y * W + x) * 4; let o;
      if (f.k === 'emboss') o = 128 + (at(x + 1, y + 1) - at(x - 1, y - 1)) * k;
      else { const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1), gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1); o = 255 - Math.hypot(gx, gy) * k * .5; }
      d[i] = d[i + 1] = d[i + 2] = o;
    }
  }
}

/* ===== motifs de fond (pois, rayures, quadrillage, vagues) ===== */
const PAT_CACHE = new Map();
function patFill(ctx, L){
  const s = Math.max(4, L.pats || 40), k = `${L.pat}|${L.patc}|${s}`;
  let tile = PAT_CACHE.get(k);
  if (!tile){
    tile = document.createElement('canvas'); const q = Math.round(s * 2); tile.width = tile.height = q; const g = tile.getContext('2d'); g.fillStyle = g.strokeStyle = L.patc || '#7B2FF7';
    if (L.pat === 'dots'){ g.beginPath(); g.arc(q / 2, q / 2, q * .14, 0, Math.PI * 2); g.fill(); }
    if (L.pat === 'lines'){ g.lineWidth = q * .16; g.beginPath(); for (const o of [-q, 0, q]){ g.moveTo(o, q); g.lineTo(o + q, 0); } g.stroke(); }
    if (L.pat === 'grid'){ g.lineWidth = Math.max(1, q * .05); g.strokeRect(0, 0, q, q); }
    if (L.pat === 'waves'){ g.lineWidth = q * .08; g.beginPath(); for (let x = 0; x <= q; x++) g[x ? 'lineTo' : 'moveTo'](x, q / 2 + Math.sin(x / q * Math.PI * 2) * q * .18); g.stroke(); }
    PAT_CACHE.set(k, tile); if (PAT_CACHE.size > 30) PAT_CACHE.delete(PAT_CACHE.keys().next().value);
  }
  const pt = ctx.createPattern(tile, 'repeat'); try { pt.setTransform(new DOMMatrix().scale(.5, .5)); } catch(e){} return pt;
}

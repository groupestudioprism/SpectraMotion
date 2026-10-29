/* ---------- Rendu d'une image du projet à l'instant t (aperçu, vignettes, exports) ----------
   Un seul moteur dessine tout, dans un canvas 2D : ce que l'on voit dans l'éditeur est exactement ce qui est exporté. */
const SUPPORTS_FILTER = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(1px)'; return c.filter === 'blur(1px)'; } catch(e){ return false; } })();
/* état animé d'un calque à l'instant t : propriétés interpolées + effets d'entrée et de sortie */
function layerState(L, t, P, noFx){
  const tl = t - L.start;
  const s = {x:kfVal(L, 'x', tl), y:kfVal(L, 'y', tl), sc:kfVal(L, 'sc', tl), rot:kfVal(L, 'rot', tl), op:kfVal(L, 'op', tl), dx:0, dy:0, k:1, ky:1, blur:0, wipe:1, wipeU:1, iris:1, block:1, chars:1, words:1, w:L.w, h:L.h};
  const fx = (f, p, out) => {
    if (!f || f.k === 'none' || p >= 1) return;
    const e = out ? ease('in', 1 - p) : ease('out', p), r = out ? 1 - e : e; // r : 0 (caché) → 1 (en place)
    const W = P.w, H = P.h;
    switch (f.k){
      case 'fade': s.op *= r; break;
      case 'slideL': s.dx += -(1 - r) * (s.x + s.w); s.op *= Math.min(1, r * 2); break;
      case 'slideR': s.dx += (1 - r) * (W - s.x); s.op *= Math.min(1, r * 2); break;
      case 'slideU': s.dy += (out ? -1 : 1) * (1 - r) * H * .35; s.op *= r; break;
      case 'slideD': s.dy += (out ? 1 : -1) * (1 - r) * H * .35; s.op *= r; break;
      case 'zoom': s.k *= .4 + .6 * r; s.op *= r; break;
      case 'pop': { const q = out ? r : (p < 1 ? 1 - Math.cos(p * Math.PI * 2.5) * Math.exp(-p * 5) : 1); s.k *= out ? .6 + .4 * r : Math.max(.01, q); s.op *= Math.min(1, r * 3); break; }
      case 'wipe': s.wipe = r; break;
      case 'wipeU': s.wipeU = r; break;
      case 'iris': s.iris = r; break;
      case 'blur': s.blur += (1 - r) * 24; s.op *= r; break;
      case 'rotate': s.rot += (out ? 1 : -1) * (1 - r) * 90; s.op *= r; break;
      case 'spin': s.rot += (out ? 1 : -1) * (1 - r) * 270; s.k *= .25 + .75 * r; s.op *= r; break;
      case 'flip': s.ky *= Math.max(.001, r); break;
      case 'drop': { const q = out ? r : (p < 1 ? 1 - Math.abs(Math.cos(p * Math.PI * 1.5)) * (1 - p) ** 2 : 1); s.dy += (out ? 1 : -1) * (1 - (out ? r : q)) * Math.max(H * .5, s.y + s.h); s.op *= Math.min(1, r * 3); break; }
      case 'block': s.block = clamp(p, 0, 1); s.blockC = f.c || '#7B2FF7'; break;
      case 'type': s.chars = clamp(p, 0, 1); break;
      case 'words': s.words = clamp(p, 0, 1); break;
    }
  };
  if (!noFx && L.tin?.k !== 'none') fx(L.tin, clamp(tl / Math.max(.05, Math.min(L.tin.d, L.dur)), 0, 1), false);
  if (!noFx && L.tout?.k !== 'none') fx(L.tout, clamp((L.dur - tl) / Math.max(.05, Math.min(L.tout.d, L.dur)), 0, 1), true);
  return s;
}
function fillStyle(ctx, L, w, h, alt){
  const c = alt || L.fill; if (!c) return null;
  if (!L.fill2) return c;
  const a = (L.ga ?? 135) * Math.PI / 180, dx = Math.cos(a) * w / 2, dy = Math.sin(a) * h / 2;
  const g = ctx.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy); g.addColorStop(0, L.fill); g.addColorStop(1, L.fill2); return g;
}
function roundRect(ctx, x, y, w, h, r){ r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); if (!r){ ctx.rect(x, y, w, h); return; }
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shapePath(ctx, k, w, h, r = 0){
  ctx.beginPath();
  const poly = pts => { pts.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.closePath(); };
  switch (k){
    case 'ellipse': ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); break;
    case 'round': roundRect(ctx, 0, 0, w, h, r || Math.min(w, h) * .18); break;
    case 'tri': poly([[.5, 0], [1, 1], [0, 1]]); break;
    case 'diamond': poly([[.5, 0], [1, .5], [.5, 1], [0, .5]]); break;
    case 'hex': poly([[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]]); break;
    case 'star': { const pts = []; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? .4 : 1; pts.push([.5 + Math.cos(a) * rr / 2, .53 + Math.sin(a) * rr / 2]); } poly(pts); break; }
    case 'arrow': poly([[0, .32], [.62, .32], [.62, .08], [1, .5], [.62, .92], [.62, .68], [0, .68]]); break;
    case 'prism': poly([[0, 0], [1, .5], [0, 1]]); break;
    case 'heart': ctx.moveTo(w / 2, h * .95); ctx.bezierCurveTo(-w * .1, h * .55, w * .1, -h * .05, w / 2, h * .28); ctx.bezierCurveTo(w * .9, -h * .05, w * 1.1, h * .55, w / 2, h * .95); ctx.closePath(); break;
    case 'bubble': roundRect(ctx, 0, 0, w, h * .8, Math.min(w, h) * .14); ctx.moveTo(w * .2, h * .78); ctx.lineTo(w * .16, h); ctx.lineTo(w * .38, h * .78); ctx.closePath(); break;
    case 'ring': ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.ellipse(w / 2, h / 2, w * .32, h * .32, 0, 0, Math.PI * 2, true); break;
    case 'line': ctx.rect(0, h / 2 - Math.max(1, h * .5) / 2, w, Math.max(1, h * .5)); break;
    case 'pent': { const pts = []; for (let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 5; pts.push([.5 + Math.cos(a) / 2, .55 + Math.sin(a) / 2 * 1.05]); } poly(pts); break; }
    case 'oct': poly([[.29, 0], [.71, 0], [1, .29], [1, .71], [.71, 1], [.29, 1], [0, .71], [0, .29]]); break;
    case 'cross': poly([[.33, 0], [.67, 0], [.67, .33], [1, .33], [1, .67], [.67, .67], [.67, 1], [.33, 1], [.33, .67], [0, .67], [0, .33], [.33, .33]]); break;
    case 'para': poly([[.25, 0], [1, 0], [.75, 1], [0, 1]]); break;
    case 'trap': poly([[.2, 0], [.8, 0], [1, 1], [0, 1]]); break;
    case 'chevron': poly([[0, 0], [.7, 0], [1, .5], [.7, 1], [0, 1], [.3, .5]]); break;
    case 'arrow2': poly([[0, .5], [.25, .1], [.25, .32], [.75, .32], [.75, .1], [1, .5], [.75, .9], [.75, .68], [.25, .68], [.25, .9]]); break;
    case 'burst': { const pts = []; for (let i = 0; i < 32; i++){ const a = -Math.PI / 2 + i * Math.PI / 16, rr = i % 2 ? .84 : 1; pts.push([.5 + Math.cos(a) * rr / 2, .5 + Math.sin(a) * rr / 2]); } poly(pts); break; }
    case 'star4': ctx.moveTo(w / 2, 0); ctx.quadraticCurveTo(w * .56, h * .44, w, h / 2); ctx.quadraticCurveTo(w * .56, h * .56, w / 2, h); ctx.quadraticCurveTo(w * .44, h * .56, 0, h / 2); ctx.quadraticCurveTo(w * .44, h * .44, w / 2, 0); ctx.closePath(); break;
    case 'arch': ctx.moveTo(0, h); ctx.lineTo(0, w / 2 < h ? w / 2 : h * .5); ctx.ellipse(w / 2, Math.min(w / 2, h * .5), w / 2, Math.min(w / 2, h * .5), 0, Math.PI, 0); ctx.lineTo(w, h); ctx.closePath(); break;
    case 'blob': ctx.moveTo(w * .5, 0); ctx.bezierCurveTo(w * .85, 0, w, h * .25, w * .97, h * .5); ctx.bezierCurveTo(w * .94, h * .8, w * .72, h, w * .45, h * .98); ctx.bezierCurveTo(w * .15, h * .96, 0, h * .75, w * .03, h * .45); ctx.bezierCurveTo(w * .06, h * .15, w * .25, 0, w * .5, 0); ctx.closePath(); break;
    case 'moon': ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, -Math.PI / 3, Math.PI / 3, true); ctx.bezierCurveTo(w * .3, h * .82, w * .3, h * .18, w * .75, h * (.5 - Math.sin(Math.PI / 3) / 2)); ctx.closePath(); break;
    case 'cloud': ctx.moveTo(w * .22, h * .9); ctx.bezierCurveTo(-w * .02, h * .9, -w * .02, h * .5, w * .2, h * .48); ctx.bezierCurveTo(w * .18, h * .14, w * .52, h * .02, w * .62, h * .3); ctx.bezierCurveTo(w * .75, h * .14, w * 1.02, h * .3, w * .9, h * .52); ctx.bezierCurveTo(w * 1.04, h * .6, w * 1.02, h * .9, w * .8, h * .9); ctx.closePath(); break;
    case 'larrow': case 'ldarrow': ctx.rect(0, h / 2 - Math.max(1, h * .5) / 2, w, Math.max(1, h * .5)); break;
    default: roundRect(ctx, 0, 0, w, h, r);
  }
}
/* ligne (épaisseur = hauteur du cadre), avec tirets et pointes de flèche */
function drawLine(ctx, L, w, h){
  const lw = Math.max(1, h * .5), head = L.k === 'larrow' || L.k === 'ldarrow' ? Math.min(w * .3, lw * 3.2) : 0, two = L.k === 'ldarrow';
  const c = fillStyle(ctx, L, w, h) || '#16131F'; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw; ctx.lineCap = L.dash === 'dot' ? 'round' : 'butt';
  if (L.dash === 'dash') ctx.setLineDash([lw * 3, lw * 2]); else if (L.dash === 'dot') ctx.setLineDash([.01, lw * 2]);
  ctx.beginPath(); ctx.moveTo(two ? head * .8 : 0, h / 2); ctx.lineTo(w - head * .8, h / 2); ctx.stroke(); ctx.setLineDash([]);
  const tip = (x, d) => { ctx.beginPath(); ctx.moveTo(x, h / 2); ctx.lineTo(x - d * head, h / 2 - head * .55); ctx.lineTo(x - d * head, h / 2 + head * .55); ctx.closePath(); ctx.fill(); };
  if (head){ tip(w, 1); if (two) tip(0, -1); }
}
/* filtre CSS d'un calque image / vidéo (réglages + préréglage) */
function adjOf(L){ const a = {...(FILTERS[L.filter]?.[1] || {})}; for (const [k, v] of Object.entries(L.adj || {})) a[k] = (a[k] || 0) + v; return a; }
function filterCss(a, extraBlur = 0){
  const f = [];
  if (a.bri) f.push(`brightness(${(1 + a.bri / 100).toFixed(3)})`);
  if (a.con) f.push(`contrast(${(1 + a.con / 100).toFixed(3)})`);
  if (a.sat) f.push(`saturate(${Math.max(0, 1 + a.sat / 100).toFixed(3)})`);
  if (a.hue) f.push(`hue-rotate(${a.hue}deg)`);
  if (a.sepia) f.push(`sepia(${(a.sepia / 100).toFixed(3)})`);
  const b = (a.blur || 0) + extraBlur; if (b > .05) f.push(`blur(${b.toFixed(2)}px)`);
  return f.join(' ') || 'none';
}
/* découpe du texte en lignes (retour à la ligne automatique dans la largeur du cadre) */
function textLines(ctx, L, maxW){
  const src = (L.up ? String(L.txt || '').toUpperCase() : String(L.txt || '')).split('\n'), out = [];
  let num = 0;
  for (let para of src){
    if (L.list && L.list !== 'none' && para.trim()) para = (L.list === 'num' ? `${++num}. ` : L.list === 'check' ? '✓ ' : '• ') + para;
    const words = para.split(/(\s+)/); let line = '';
    for (const w of words){
      const test = line + w;
      if (line && ctx.measureText(test).width > maxW && w.trim()){ out.push(line.replace(/\s+$/, '')); line = w.replace(/^\s+/, ''); }
      else line = test;
      while (ctx.measureText(line).width > maxW && line.length > 1){ // mot plus long que la ligne : coupe dans le mot
        let i = line.length - 1; while (i > 1 && ctx.measureText(line.slice(0, i)).width > maxW) i--; out.push(line.slice(0, i)); line = line.slice(i);
      }
    }
    out.push(line);
  }
  return out;
}
function textFont(L, scale = 1){ return `${L.it ? 'italic ' : ''}${L.fw || 700} ${Math.max(1, L.fs * scale)}px ${fontCss(L.font)}`; }
/* hauteur naturelle d'un bloc de texte (utilisée pour ajuster le cadre) */
function measureText(L){
  const c = measureText.c ||= document.createElement('canvas').getContext('2d'); c.font = textFont(L);
  try { c.letterSpacing = (L.ls || 0) * L.fs + 'px'; } catch(e){}
  if (L.curve){ const g = curveGeom(c, L); return {lines:[g.txt], h:Math.ceil(g.H)}; }
  const lines = textLines(c, L, Math.max(10, L.w - (L.tbg ? L.fs * (L.tbgPad || 0) * 2 : 0)));
  return {lines, h:Math.ceil(lines.length * L.fs * (L.lh || 1.15) + (L.tbg ? L.fs * (L.tbgPad || 0) * 2 : 0))};
}
/* texte en arc : géométrie (rayon, angle, hauteur du cadre) */
function curveGeom(ctx, L){
  const txt = (L.up ? String(L.txt || '').toUpperCase() : String(L.txt || '')).replace(/\s*\n\s*/g, ' '), ls = (L.ls || 0) * L.fs;
  try { ctx.letterSpacing = '0px'; } catch(e){}
  const ws = [...txt].map(ch => ctx.measureText(ch).width + ls), tw = Math.max(1, ws.reduce((a, b) => a + b, 0));
  const th = Math.max(.05, Math.abs(L.curve) / 100 * Math.PI * 2 * .98), R = tw / th, sag = R * (1 - Math.cos(Math.min(th / 2, Math.PI)));
  return {txt, ws, tw, th, R, H:sag + L.fs * 1.25};
}
function textFill(ctx, L, w, h){
  if (!L.col2) return L.col || '#000';
  const g = ctx.createLinearGradient(0, 0, w, h * .25); g.addColorStop(0, L.col || '#000'); g.addColorStop(1, L.col2); return g;
}
function drawText(ctx, L, w, h, chars = 1, words = 1){
  ctx.font = textFont(L); ctx.textBaseline = 'middle';
  const fx = L.tfx && L.tfx.k !== 'none' ? L.tfx : null, k = fx ? (fx.d ?? 50) / 50 : 1, fc = fx?.c || '#FF3F86';
  if (L.curve) return drawCurved(ctx, L, w, h, chars, fx, k, fc);
  try { ctx.letterSpacing = (L.ls || 0) * L.fs + 'px'; } catch(e){}
  const pad = L.tbg ? L.fs * (L.tbgPad || 0) : 0, lines = textLines(ctx, L, Math.max(10, w - pad * 2)), lh = L.fs * (L.lh || 1.15);
  const total = lines.reduce((s, l) => s + l.length, 0);
  let left = chars < 1 ? Math.floor(total * chars) : Infinity;
  if (words < 1){ const nw = lines.reduce((s, l) => s + (l.match(/\S+/g) || []).length, 0); let want = Math.ceil(nw * words - 1e-9); left = 0; for (const ln of lines){ const m = [...ln.matchAll(/\S+/g)]; if (want <= 0) break; if (m.length <= want){ left += ln.length; want -= m.length; } else { left += m[want - 1].index + m[want - 1][0].length; want = 0; } } }
  const blockH = lines.length * lh, y0 = (h - blockH) / 2 + lh / 2;
  ctx.textAlign = L.align === 'l' ? 'left' : L.align === 'r' ? 'right' : 'center';
  const ax = L.align === 'l' ? pad : L.align === 'r' ? w - pad : w / 2;
  // morceaux visibles de chaque ligne
  let rem = left; const parts = lines.map((ln, i) => { if (rem <= 0) return null; const s = rem < ln.length ? ln.slice(0, rem) : ln; rem -= ln.length; return {s, full:ln, y:y0 + i * lh}; }).filter(Boolean);
  for (const p of parts) if (L.tbg && p.full.trim()){
    const tw = ctx.measureText(p.full).width, bx = L.align === 'l' ? 0 : L.align === 'r' ? w - tw - pad * 2 : (w - tw) / 2 - pad;
    ctx.save(); ctx.shadowColor = 'transparent'; ctx.fillStyle = L.tbg; roundRect(ctx, bx, p.y - lh / 2, tw + pad * 2, lh, L.fs * .18); ctx.fill(); ctx.restore();
  }
  const each = (fn) => parts.forEach(p => fn(p.s, ax, p.y));
  const fill = textFill(ctx, L, w, h);
  // effets placés derrière le texte
  if (fx){
    const off = L.fs * .06 * k;
    ctx.save(); ctx.shadowColor = 'transparent';
    if (fx.k === 'splice'){ ctx.fillStyle = fc; each((s, x, y) => ctx.fillText(s, x + off, y + off)); }
    if (fx.k === 'echo'){ ctx.fillStyle = fc; ctx.globalAlpha *= .25; each((s, x, y) => ctx.fillText(s, x + off * 2, y + off * 2)); ctx.globalAlpha /= .25; ctx.globalAlpha *= .5; each((s, x, y) => ctx.fillText(s, x + off, y + off)); }
    if (fx.k === 'glitch'){ ctx.fillStyle = fc; each((s, x, y) => ctx.fillText(s, x - off * .8, y)); ctx.fillStyle = fc.toUpperCase() === '#14C2EC' ? '#FF3F86' : '#14C2EC'; each((s, x, y) => ctx.fillText(s, x + off * .8, y)); }
    if (fx.k === 'outline'){ ctx.strokeStyle = fc; ctx.lineJoin = 'round'; ctx.lineWidth = L.fs * .16 * k; each((s, x, y) => ctx.strokeText(s, x, y)); }
    ctx.restore();
    if (fx.k === 'shadow'){ ctx.shadowColor = fc + (fc.length === 7 ? 'AA' : ''); ctx.shadowBlur = L.fs * .06 * k; ctx.shadowOffsetX = L.fs * .05 * k; ctx.shadowOffsetY = L.fs * .05 * k; }
    if (fx.k === 'lift'){ ctx.shadowColor = `rgba(0,0,0,${clamp(.2 + .25 * k, 0, .8)})`; ctx.shadowBlur = L.fs * .35 * k; ctx.shadowOffsetY = L.fs * .07 * k; ctx.shadowOffsetX = 0; }
    if (fx.k === 'neon'){ ctx.shadowColor = fc; ctx.shadowBlur = L.fs * .3 * k; ctx.shadowOffsetX = ctx.shadowOffsetY = 0; }
  }
  if (L.tstroke && L.tsw){ ctx.lineJoin = 'round'; ctx.strokeStyle = L.tstroke; ctx.lineWidth = L.tsw; each((s, x, y) => ctx.strokeText(s, x, y)); }
  if (fx && (fx.k === 'hollow' || fx.k === 'splice')){ ctx.strokeStyle = fill; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1, L.fs * .028 * (.6 + k * .4)); each((s, x, y) => ctx.strokeText(s, x, y)); }
  else { ctx.fillStyle = fill; each((s, x, y) => ctx.fillText(s, x, y)); if (fx?.k === 'neon'){ ctx.shadowBlur = L.fs * .12 * k; each((s, x, y) => ctx.fillText(s, x, y)); } }
  if (L.ul){ ctx.shadowColor = 'transparent'; ctx.fillStyle = fill; for (const p of parts){ const tw = ctx.measureText(p.s).width, x = L.align === 'l' ? ax : L.align === 'r' ? ax - tw : ax - tw / 2; ctx.fillRect(x, p.y + L.fs * .42, tw, Math.max(1, L.fs * .06)); } }
}
function drawCurved(ctx, L, w, h, chars, fx, k, fc){
  const g = curveGeom(ctx, L), up = L.curve > 0, n = [...g.txt].length, show = chars < 1 ? Math.floor(n * chars) : n;
  const top = (h - g.H) / 2 + L.fs * .62, bot = (h + g.H) / 2 - L.fs * .62, cx = w / 2, cy = up ? top + g.R : bot - g.R;
  const fill = textFill(ctx, L, w, h);
  if (fx?.k === 'neon'){ ctx.shadowColor = fc; ctx.shadowBlur = L.fs * .3 * k; } else if (fx?.k === 'shadow'){ ctx.shadowColor = fc; ctx.shadowBlur = L.fs * .06 * k; ctx.shadowOffsetX = ctx.shadowOffsetY = L.fs * .05 * k; } else if (fx?.k === 'lift'){ ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = L.fs * .35 * k; ctx.shadowOffsetY = L.fs * .07 * k; }
  ctx.textAlign = 'center'; let acc = 0;
  [...g.txt].forEach((ch, i) => {
    const cw = g.ws[i], a = (acc + cw / 2 - g.tw / 2) / g.R; acc += cw; if (i >= show) return;
    ctx.save(); if (up){ ctx.translate(cx + g.R * Math.sin(a), cy - g.R * Math.cos(a)); ctx.rotate(a); } else { ctx.translate(cx + g.R * Math.sin(a), cy + g.R * Math.cos(a)); ctx.rotate(-a); }
    if (L.tstroke && L.tsw){ ctx.lineJoin = 'round'; ctx.strokeStyle = L.tstroke; ctx.lineWidth = L.tsw; ctx.strokeText(ch, 0, 0); }
    if (fx?.k === 'hollow'){ ctx.strokeStyle = fill; ctx.lineWidth = Math.max(1, L.fs * .028); ctx.strokeText(ch, 0, 0); } else { ctx.fillStyle = fill; ctx.fillText(ch, 0, 0); }
    ctx.restore();
  });
}
/* image ou vidéo dans son cadre : recadrage, ajustement (contenir / couvrir / étirer), miroir */
function drawMedia(ctx, L, el, m, w, h){
  const sw0 = el.videoWidth || el.naturalWidth || m?.w || 1, sh0 = el.videoHeight || el.naturalHeight || m?.h || 1;
  const c = L.crop || {x:0, y:0, w:1, h:1};
  let sx = c.x * sw0, sy = c.y * sh0, sw = c.w * sw0, sh = c.h * sh0, dx = 0, dy = 0, dw = w, dh = h;
  if (L.fit === 'contain'){ const k = Math.min(w / sw, h / sh); dw = sw * k; dh = sh * k; dx = (w - dw) / 2; dy = (h - dh) / 2; }
  else if (L.fit === 'cover'){ const k = Math.max(w / sw, h / sh), cw = w / k, ch = h / k; sx += (sw - cw) / 2; sy += (sh - ch) / 2; sw = cw; sh = ch; }
  ctx.save();
  if (L.flipX || L.flipY){ ctx.translate(L.flipX ? w : 0, L.flipY ? h : 0); ctx.scale(L.flipX ? -1 : 1, L.flipY ? -1 : 1); }
  ctx.drawImage(el, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
  return [dx, dy, dw, dh];
}
function drawMissing(ctx, w, h, m, scale){
  ctx.save(); ctx.fillStyle = '#2A2638'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#8F6BFF'; ctx.setLineDash([12 * scale, 8 * scale]); ctx.lineWidth = 3 * scale; ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.fillStyle = '#CBC7DC'; ctx.font = `600 ${Math.max(10, Math.min(w, h) * .07)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(m ? 'Média manquant' : 'Média introuvable', w / 2, h / 2 - Math.min(w, h) * .05);
  if (m){ ctx.font = `400 ${Math.max(8, Math.min(w, h) * .045)}px Inter, sans-serif`; ctx.fillText(m.name.slice(0, 40), w / 2, h / 2 + Math.min(w, h) * .05); }
  ctx.restore();
}
/* dessine le projet P à l'instant t dans ctx (taille du canvas = P.w × P.h × scale) */
function renderFrame(ctx, P, t, o = {}){
  const scale = o.scale || 1;
  ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (!o.noClear) ctx.clearRect(0, 0, P.w, P.h);
  if (P.bg && !o.transparent){ ctx.fillStyle = P.bg; ctx.fillRect(0, 0, P.w, P.h); }
  for (const L of drawOrder(P)){
    if (!visible(L, t) || (o.skip && o.skip.has(L.id))) continue;
    const s = layerState(L, t, P, o.noFx); if (s.op <= .001 || s.wipe <= 0) continue;
    const m = L.media ? P.media[L.media] : null, w = L.w, h = L.h;
    ctx.save();
    ctx.globalAlpha = clamp(s.op, 0, 1); ctx.globalCompositeOperation = L.blend || 'source-over';
    ctx.translate(s.x + s.dx + w / 2, s.y + s.dy + h / 2); if (s.rot) ctx.rotate(s.rot * Math.PI / 180);
    const k = (s.sc || 1) * s.k; if (k !== 1 || s.ky !== 1) ctx.scale(k, k * s.ky);
    ctx.translate(-w / 2, -h / 2);
    if (s.wipe < 1 || s.wipeU < 1 || s.iris < 1){ ctx.beginPath(); if (s.iris < 1){ ctx.arc(w / 2, h / 2, Math.hypot(w, h) / 2 * s.iris, 0, Math.PI * 2); } else ctx.rect(0, h * (1 - s.wipeU), w * s.wipe, h * s.wipeU); ctx.clip(); }
    if (s.block < 1){ // bloc coloré : le bloc couvre le cadre puis découvre le calque
      const bp = s.block; ctx.fillStyle = s.blockC;
      if (bp < .5){ ctx.fillRect(0, 0, w * ease('out', bp * 2), h); ctx.restore(); continue; }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w * ease('in', (bp - .5) * 2), h); ctx.rect(0, 0, w, h); ctx.clip('evenodd'); ctx.fillRect(0, 0, w, h); ctx.restore();
      ctx.beginPath(); ctx.rect(0, 0, w * ease('in', (bp - .5) * 2), h); ctx.clip();
    }
    if (L.shadow){ ctx.shadowColor = L.shadow.c; ctx.shadowBlur = L.shadow.b * scale; ctx.shadowOffsetX = L.shadow.x * scale; ctx.shadowOffsetY = L.shadow.y * scale; }
    if (L.t === 'text' && L.tsh && !L.shadow){ ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = L.fs * .25 * scale; ctx.shadowOffsetY = L.fs * .06 * scale; }
    if (s.blur > .05 && SUPPORTS_FILTER) ctx.filter = `blur(${(s.blur * scale).toFixed(2)}px)`;
    if (L.t === 'shape' && LINE_KINDS.has(L.k)){ drawLine(ctx, L, w, h); }
    else if (L.t === 'shape' || L.t === 'color'){
      shapePath(ctx, L.t === 'color' ? 'rect' : L.k, w, h, L.r || 0);
      const f = fillStyle(ctx, L, w, h); if (f){ ctx.fillStyle = f; ctx.fill('evenodd'); }
      if (L.pat && L.pat !== 'none'){ ctx.save(); ctx.shadowColor = 'transparent'; ctx.fillStyle = patFill(ctx, L); ctx.fill('evenodd'); ctx.restore(); }
      if (L.stroke && L.sw){ ctx.shadowColor = 'transparent'; ctx.strokeStyle = L.stroke; ctx.lineWidth = L.sw; ctx.lineJoin = 'round'; if (L.dash === 'dash') ctx.setLineDash([L.sw * 3, L.sw * 2]); else if (L.dash === 'dot'){ ctx.lineCap = 'round'; ctx.setLineDash([.01, L.sw * 2]); } ctx.stroke(); ctx.setLineDash([]); }
      if (L.slot && !o.final && !f){ ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(123,47,247,.12)'; ctx.fill('evenodd'); }
    } else if (L.t === 'text'){
      drawText(ctx, L, w, h, s.chars, s.words);
    } else if (L.t === 'icon'){ drawIcon(ctx, L, w, h);
    } else if (L.t === 'chart'){ drawChart(ctx, L, w, h);
    } else if (L.t === 'qr'){ drawQr(ctx, L, w, h);
    } else if (L.t === 'draw'){ drawStroke(ctx, L, w, h);
    } else if (L.t === 'image' || L.t === 'video'){
      const el0 = o.els ? o.els[L.id] : MEDIA.el(m);
      if (!el0 || (L.t === 'video' && el0.readyState < 2)){ if (!el0 && (!m || MEDIA.missing(m) || o.final)) drawMissing(ctx, w, h, m, 1); }
      else {
        const el = PIX.src(L, el0, L.t === 'video');
        if (L.mask && L.mask !== 'none'){ shapePath(ctx, L.mask, w, h, Math.min(w, h) * .18); ctx.clip('evenodd'); } else if (L.r){ roundRect(ctx, 0, 0, w, h, L.r); ctx.clip(); }
        const a = adjOf(L), fc = filterCss(a, s.blur * scale);
        if (fc !== 'none' && SUPPORTS_FILTER) ctx.filter = fc;
        const box = drawMedia(ctx, L, el, m, w, h);
        ctx.filter = 'none'; ctx.shadowColor = 'transparent';
        if (a.temp){ ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = clamp(s.op * Math.abs(a.temp) / 100 * .8, 0, 1); ctx.fillStyle = a.temp > 0 ? '#FF9A3D' : '#3D8BFF'; ctx.fillRect(...box); }
        if (a.fade){ ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(s.op * a.fade / 100 * .45, 0, 1); ctx.fillStyle = '#8A8A8A'; ctx.fillRect(...box); }
        if (a.grain){ ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = clamp(s.op * a.grain / 100 * .55, 0, 1); const gp = ctx.createPattern(PIX.grain(), 'repeat'); if (gp){ ctx.fillStyle = gp; ctx.fillRect(...box); } }
        if (a.vig){ ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(s.op, 0, 1); const [bx, by, bw, bh] = box, g = ctx.createRadialGradient(bx + bw / 2, by + bh / 2, Math.min(bw, bh) * .25, bx + bw / 2, by + bh / 2, Math.hypot(bw, bh) / 2);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${(a.vig / 100 * .85).toFixed(3)})`); ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh); }
        if (L.stroke && L.sw){ ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(s.op, 0, 1); ctx.strokeStyle = L.stroke; ctx.lineWidth = L.sw; if (L.mask && L.mask !== 'none'){ ctx.lineWidth = L.sw * 2; shapePath(ctx, L.mask, w, h, Math.min(w, h) * .18); ctx.stroke(); } else L.r ? (roundRect(ctx, 0, 0, w, h, L.r), ctx.stroke()) : ctx.strokeRect(L.sw / 2, L.sw / 2, w - L.sw, h - L.sw); }
      }
    }
    ctx.restore();
  }
  ctx.restore();
}
/* temps source d'une vidéo / d'un son pour l'instant t du projet */
const srcTime = (L, t) => (L.in || 0) + Math.max(0, t - L.start) * (L.speed || 1);
/* place chaque vidéo visible sur la bonne image (aperçu à l'arrêt, export image) ; attend la fin des déplacements */
async function seekVideos(P, t, els){
  const jobs = [];
  for (const L of P.layers){
    if (L.t !== 'video' || !visible(L, t)) continue;
    const m = P.media[L.media], el = els ? els[L.id] : MEDIA.el(m); if (!el) continue;
    const st = Math.min(srcTime(L, t), Math.max(0, (m?.dur || el.duration || 0) - .04));
    if (Math.abs(el.currentTime - st) < .02 && el.readyState >= 2) continue;
    jobs.push(new Promise(res => { const done = () => { el.removeEventListener('seeked', done); clearTimeout(to); res(); }; const to = setTimeout(done, 1500); el.addEventListener('seeked', done); try { el.currentTime = st; } catch(e){ done(); } }));
  }
  await Promise.all(jobs);
}
/* vignette du projet (JPEG compact, pour l'accueil et les modèles) */
function thumbOf(P, t = 0, maxW = 320, q = .62, noFx = !TIMED(P.studio)){
  const k = Math.min(maxW / P.w, maxW / P.h), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(P.w * k)); cv.height = Math.max(1, Math.round(P.h * k));
  const ctx = cv.getContext('2d'); if (!P.bg){ ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height); }
  try { renderFrame(ctx, P, t, {scale:k, noClear:true, noFx}); } catch(e){ console.warn(e); }
  let d = cv.toDataURL('image/jpeg', q); while (d.length > 15000 && q > .25){ q -= .1; d = cv.toDataURL('image/jpeg', q); }
  return d.length <= 16000 ? d : '';
}

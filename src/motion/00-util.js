/* ---------- Outils communs de l'éditeur Spectra Motion ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const round = (v, n = 2) => { const k = 10 ** n; return Math.round(v * k) / k; };
const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const deep = o => JSON.parse(JSON.stringify(o));
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const num = (v, d = 0) => { const n = +v; return Number.isFinite(n) ? n : d; };
const sleepE = ms => new Promise(r => setTimeout(r, ms));
/* durées : 75.5 → « 1:15.5 », « 0:03 » */
function fmtT(s, tenths = true){
  s = Math.max(0, +s || 0); const m = Math.floor(s / 60), r = s - m * 60;
  return `${m}:${(tenths ? r.toFixed(1) : Math.floor(r).toString()).padStart(tenths ? 4 : 2, '0')}`;
}
function fmtTC(s, fps = 30){ // timecode 00:00:00:00
  s = Math.max(0, +s || 0); const f = Math.floor((s % 1) * fps + 1e-6), t = Math.floor(s);
  return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60, f].map(x => String(x).padStart(2, '0')).join(':');
}
const fmtBytes = n => n >= 1e9 ? (n / 1e9).toFixed(1).replace('.', ',') + ' Go' : n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(n / 1000)) + ' Ko';
/* petit bus d'évènements interne */
const BUS = { h:{}, on(k, f){ (this.h[k] ||= []).push(f); }, emit(k, x){ (this.h[k] || []).forEach(f => { try { f(x); } catch(e){ console.error('[Spectra Motion]', k, e); } }); } };
function toast(t, ms = 2600){ const el = $('#toast'); if (!el) return; el.textContent = t; el.hidden = false; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => { el.classList.remove('on'); el.hidden = true; }, ms); }
/* icônes de l'interface (traits 24 px) */
const IC = {
  media:'<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="m4 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0L16 17"/><path d="m14 15 1.5-1.5a1.5 1.5 0 0 1 2.1 0L20 16"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  tpl:'<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/>',
  text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  shapes:'<circle cx="7.5" cy="7.5" r="4"/><rect x="12" y="12" width="8.5" height="8.5" rx="1.5"/><path d="m16 3 4 6.5h-8z"/>',
  fx:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
  adjust:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  trans:'<rect x="3" y="6" width="8" height="12" rx="1.5"/><rect x="13" y="6" width="8" height="12" rx="1.5" opacity=".5"/><path d="m9 12 6 0M13 10l2 2-2 2"/>',
  audio:'<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  anim:'<path d="M5 19c3-8 6-12 14-14"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M11 9.5 13.5 12"/>',
  play:'<path d="M7 4.5v15l12.5-7.5z"/>', pause:'<path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/>',
  prev:'<path d="M6 5v14M19 5 9 12l10 7z"/>', next:'<path d="M18 5v14M5 5l10 7-10 7z"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  split:'<path d="M12 3v18"/><path d="M8 7 4 12l4 5M16 7l4 5-4 5"/>', trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  dup:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeOff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  up:'<path d="m6 14 6-6 6 6"/>', down:'<path d="m6 10 6 6 6-6"/>', plus:'<path d="M12 5v14M5 12h14"/>', close:'<path d="M6 6l12 12M18 6 6 18"/>',
  key:'<path d="m12 3 3.5 9L12 21l-3.5-9z"/>', magnet:'<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z"/><path d="M6 8h4M14 8h4"/>',
  zoomIn:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>', zoomOut:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6"/>', fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  crop:'<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>', flipH:'<path d="M12 3v18M8 7 3 12l5 5V7zM16 7l5 5-5 5z"/>', flipV:'<path d="M3 12h18M7 8l5-5 5 5H7zM7 16l5 5 5-5z"/>',
  export:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  photo:'<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>', video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  design:'<path d="M4 20 15 9M14 4l6 6-3 3-6-6zM4 20l2-6 4 4z"/>', wave:'<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>',
  vol:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>', mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6M22 9l-5 6"/>',
  more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', check:'<path d="m5 12 5 5 9-10"/>',
  align:'<path d="M4 4v16M8 8h10M8 16h6"/>', select:'<path d="m5 3 14 8-6 2-2 6z"/>', hand:'<path d="M8 12V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v7M14 11V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-2.7L3 15a1.5 1.5 0 0 1 2.3-2L8 15"/>',
  speed:'<path d="M12 14l4-4"/><path d="M4.2 18a9 9 0 1 1 15.6 0"/>', bg:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 15l6-6 12 12"/>',
};
const ico = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

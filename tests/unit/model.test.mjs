/* Tests unitaires du modèle de projet (src/motion/00-util.js + 10-model.js), sans navigateur.
   Lancement : npm test   (node --test) */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = ['00-util.js', '10-model.js'].map(f => readFileSync(path.join(ROOT, 'src/motion', f), 'utf8')).join('\n');
const M = new Function('document', 'window', src + '\nreturn {newProject, mkText, mkShape, mkMediaLayer, mkColor, kfVal, setKf, delKf, cleanProject, HIST, syncDur, projEnd, drawOrder, topTrack, ease, visible, fmtTC, fmtT};')(undefined, {});

test('nouveau projet : format et durée selon le studio', () => {
  const v = M.newProject('video'); assert.equal(v.w, 1920); assert.equal(v.h, 1080); assert.equal(v.studio, 'video'); assert.equal(v.bg, '#000000');
  const d = M.newProject('design'); assert.equal(d.w, 1080); assert.equal(d.h, 1080); assert.equal(d.bg, '#FFFFFF');
  assert.equal(M.newProject('audio').studio, 'audio');
});
test('images clés : interpolation, maintien, suppression', () => {
  const P = M.newProject('motion'); const L = M.mkShape(P, 'rect', {x:0});
  M.setKf(L, 'x', 0, 0, 'lin'); M.setKf(L, 'x', 2, 100, 'lin');
  assert.equal(M.kfVal(L, 'x', 1), 50); assert.equal(M.kfVal(L, 'x', -1), 0); assert.equal(M.kfVal(L, 'x', 5), 100);
  M.setKf(L, 'x', 0, 0, 'hold'); assert.equal(M.kfVal(L, 'x', 1.9), 0, 'maintien jusqu\'à l\'image clé suivante');
  M.setKf(L, 'x', 1, 40); assert.equal(L.kf.x.length, 3, 'image clé insérée au milieu'); assert.deepEqual(L.kf.x.map(k => k[0]), [0, 1, 2]);
  M.delKf(L, 'x', 1); M.delKf(L, 'x', 0); M.delKf(L, 'x', 2); assert.equal(L.kf.x, undefined, 'plus d\'animation quand la dernière image clé disparaît');
});
test('courbes d\'accélération bornées', () => {
  for (const e of ['lin', 'ease', 'in', 'out']){ assert.equal(M.ease(e, 0), 0); assert.ok(Math.abs(M.ease(e, 1) - 1) < 1e-9); }
});
test('durée du projet = fin du dernier clip (studios temporels)', () => {
  const P = M.newProject('video'); P.layers.push(M.mkShape(P, 'rect', {start:2, dur:3}), M.mkShape(P, 'rect', {start:0, dur:4}));
  assert.equal(M.projEnd(P), 5); assert.equal(M.syncDur(P), 5);
});
test('ordre de dessin : pistes croissantes, sons exclus', () => {
  const P = M.newProject('video'); const a = M.mkShape(P, 'rect', {track:2}), b = M.mkShape(P, 'rect', {track:0}), c = M.mkMediaLayer(P, {id:'m1', kind:'audio', name:'s', dur:3});
  P.layers.push(a, b, c); assert.deepEqual(M.drawOrder(P).map(l => l.id), [b.id, a.id]); assert.equal(M.topTrack(P), 3); assert.equal(M.topTrack(P, true), 1);
});
test('assainissement : rien d\'inconnu ni de dangereux ne passe', () => {
  const P = M.cleanProject({studio:'hack', w:99999, h:-5, fps:7, title:'<b>x</b>'.repeat(50), bg:'url(javascript:alert(1))',
    media:{'../evil':{kind:'image'}, m1abc:{kind:'video', name:'v.mp4', path:'https://evil.example/x', thumb:'javascript:alert(1)', size:'12'}},
    layers:[{t:'script'}, {t:'text', txt:'<img src=x onerror=alert(1)>', font:'Evil', fs:1e9, col:'red', kf:{x:[[0, 1], ['a', 2]]}, tin:{k:'boom'}},
      {t:'video', media:'absent'}, {t:'video', media:'m1abc', speed:999, crop:{x:-1, y:0, w:2, h:.5}, adj:{bri:900, evil:1}}]});
  assert.equal(P.studio, 'design'); assert.equal(P.w, 7680); assert.equal(P.h, 16); assert.equal(P.fps, 30); assert.equal(P.bg, '#FFFFFF'); assert.ok(P.title.length <= 120);
  assert.deepEqual(Object.keys(P.media), ['m1abc']); assert.equal(P.media.m1abc.path, ''); assert.equal(P.media.m1abc.thumb, ''); assert.equal(P.media.m1abc.cloud, false);
  assert.equal(P.layers.length, 2, 'type inconnu et média absent retirés');
  const T = P.layers[0]; assert.equal(T.font, 'Inter'); assert.equal(T.fs, 2000); assert.equal(T.col, '#16131F'); assert.equal(T.tin.k, 'none'); assert.deepEqual(T.kf.x, [[0, 1, 'ease']]);
  const V = P.layers[1]; assert.equal(V.speed, 16); assert.equal(V.adj.bri, 100); assert.equal(V.adj.evil, undefined); assert.deepEqual(V.crop, {x:0, y:0, w:1, h:.5});
});
test('historique : annuler et rétablir', () => {
  const P = M.newProject('design'); M.HIST.reset(P);
  P.title = 'A'; M.HIST.commit(P, 'titre'); P.title = 'B'; M.HIST.commit(P, 'titre');
  assert.equal(M.HIST.undo().P.title, 'A'); assert.equal(M.HIST.undo().P.title, 'Projet sans titre'); assert.equal(M.HIST.undo(), null);
  assert.equal(M.HIST.redo().P.title, 'A'); assert.equal(M.HIST.commit(JSON.parse(M.HIST.last), 'rien'), false, 'pas d\'entrée sans changement');
});
test('timecode', () => { assert.equal(M.fmtTC(61.5, 30), '00:01:01:15'); assert.equal(M.fmtT(75.5), '1:15.5'); });

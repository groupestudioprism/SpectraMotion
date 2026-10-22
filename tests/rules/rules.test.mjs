/* Tests des règles Firestore + Storage de Spectra Motion, sur les émulateurs Firebase.
   Lancement : npm run test:rules   (firebase emulators:exec --only firestore,storage)
   Le code de l'app (src/js/cloud.js : FirebaseCloud) est exécuté tel quel contre l'émulateur. */
import {initializeTestEnvironment, assertSucceeds, assertFails} from '@firebase/rules-unit-testing';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import path from 'path';
import firebase from 'firebase/compat/app'; import 'firebase/compat/firestore';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PID = 'demo-spectramotion';
const env = await initializeTestEnvironment({projectId:PID,
  firestore:{rules:readFileSync(path.join(ROOT, 'firebase/firestore.rules'), 'utf8'), host:'127.0.0.1', port:8085},
  storage:{rules:readFileSync(path.join(ROOT, 'firebase/storage.rules'), 'utf8'), host:'127.0.0.1', port:9199}});
let ok = 0, ko = 0; const fails = [];
// les erreurs de l'app (quota, refus) sont des refus des règles
const denied = p => p.catch(e => { throw (e?.code === 'app/quota-or-denied' || e?.code === 'app/quota') ? Object.assign(new Error('PERMISSION_DENIED'), {code:'permission-denied'}) : e; });
const check = async (name, p, expect = true) => {
  try { await (expect ? assertSucceeds(p) : assertFails(p)); ok++; console.log('  ✓', name); }
  catch(e){ ko++; fails.push(name); console.log('  ✗', name, '→', e?.message?.slice(0, 160)); }
};
await env.withSecurityRulesDisabled(async c => {
  const db = c.firestore();
  for (const u of ['alice', 'bob', 'carol']) await db.doc(`users/${u}`).set({status:'active', role:'user', email:u + '@x.fr'});
  await db.doc('users/admin').set({status:'active', role:'admin', email:'admin@x.fr'});
});
/* --- le vrai code cloud de l'app, branché sur un client compat de l'émulateur --- */
const mk = (name, uid) => { const app = firebase.initializeApp({projectId:PID, apiKey:'x'}, name); const db = app.firestore(); db.useEmulator('127.0.0.1', 8085, {mockUserToken:{sub:uid, user_id:uid, email:uid + '@x.fr', email_verified:true}}); return db; };
const src = readFileSync(path.join(ROOT, 'src/js/cloud.js'), 'utf8');
const code = src.slice(src.indexOf("/* ---------- Taille d'un projet"), src.indexOf('/* Mode du stockage'));
const enc = new TextEncoder();
const META = ['preview', 'studio', 'fmt', 'dur', 'media'];
const make = (db, uid) => new Function('window', 'FirebaseAuth', 'firebase', 'byteLen', 'MAX_DATA', 'emailKey', 'fullName', 'ms', 'pickMeta', 'META_KEYS', 'withTimeout', 'randTok', 'sha256hex', code + '\nreturn {FirebaseCloud, cleanMeta, sizeOf};')(
  {}, {get db(){ return db; }, ts:() => firebase.firestore.FieldValue.serverTimestamp(), fa:{currentUser:{uid, email:uid + '@x.fr'}}}, firebase, s => enc.encode(s || '').length, 950000,
  e => String(e || '').toLowerCase(), () => uid, t => t?.toMillis ? t.toMillis() : Date.now(), x => { const o = {}; META.forEach(k => { if (x && x[k] !== undefined) o[k] = x[k]; }); return o; }, META, p => p,
  () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join(''), async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))].map(b => b.toString(16).padStart(2, '0')).join(''));
const dbA = mk('a', 'alice'), dbB = mk('b', 'bob');
const A = make(dbA, 'alice'), B = make(dbB, 'bob');
const thumb = 'data:image/jpeg;base64,' + 'A'.repeat(800);
const proj = (media = {}) => JSON.stringify({v:1, app:'spectramotion', title:'Test', studio:'video', w:1920, h:1080, fps:30, dur:10, bg:'#000000', media, layers:[]});
const meta = {preview:thumb, studio:'video', fmt:'1920x1080', dur:10000, media:0};

console.log('Firestore');
const p1 = proj();
const m = await A.FirebaseCloud.create({name:'Montage', data:p1, meta});
await check('alice crée un projet (vrai code de l\'app)', Promise.resolve(m));
const usage = async db => (await db.doc('smUsage/alice').get()).data()?.bytes;
await check('le compteur d\'espace suit la taille du projet', (async () => { const u = await usage(dbA); if (u !== A.sizeOf(p1)) throw new Error(`${u} ≠ ${A.sizeOf(p1)}`); })());
// projet + média envoyé dans Storage : la taille comptée inclut le fichier
const p2 = proj({m1abc:{id:'m1abc', kind:'video', name:'clip.mp4', size:3000000, cloud:true, path:`spectramotion/alice/${m.id}/m1abc.mp4`}});
await check('alice enregistre (média dans le cloud compté dans la taille)', A.FirebaseCloud.save(m.id, p2, {...meta, media:1}, m.size, 'alice'));
await check('taille = JSON + fichiers du cloud', (async () => { const s = (await dbA.doc(`smDocs/${m.id}`).get()).data().size; if (s !== A.sizeOf(p2) || s < 3000000) throw new Error(s); })());
await check('bob ne lit pas le projet d\'alice', dbB.doc(`smDocs/${m.id}`).get(), false);
await check('bob ne lit pas le contenu d\'alice', dbB.doc(`smDocs/${m.id}/content/main`).get(), false);
await check('bob ne liste pas les projets d\'alice', dbB.collection('smDocs').where('ownerUid', '==', 'alice').get(), false);
await check('bob ne crée pas de projet au nom d\'alice', dbB.collection('smDocs').add({ownerUid:'alice', name:'x', folderId:'', linkMode:'off', size:0, createdAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('vignette qui n\'est pas une image : refusée', dbA.doc(`smDocs/${m.id}`).update({preview:'<script>alert(1)</script>', updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('studio inconnu : refusé', dbA.doc(`smDocs/${m.id}`).update({studio:'hack', updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('champ inconnu : refusé', dbA.doc(`smDocs/${m.id}`).update({admin:true, updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('alice ne change pas le propriétaire', dbA.doc(`smDocs/${m.id}`).update({ownerUid:'bob', updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('compteur d\'espace modifié seul : refusé', dbA.doc('smUsage/alice').set({bytes:1, lastPid:'zzz', updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
const big = proj({m2:{id:'m2xyz', kind:'video', name:'gros.mp4', size:20000000, cloud:true, path:`spectramotion/alice/${m.id}/m2xyz.mp4`}});
await check('au-delà de 10 Mo sans licence : refusé', denied(A.FirebaseCloud.save(m.id, big, meta, (await dbA.doc(`smDocs/${m.id}`).get()).data().size, 'alice')), false);
// partage
await check('alice partage en lecture avec bob', A.FirebaseCloud.addShare({kind:'doc', id:m.id, name:'Montage'}, 'bob@x.fr', 'view'));
await check('bob (lecture) lit le projet', B.FirebaseCloud.open(m.id));
const cur = () => dbA.doc(`smDocs/${m.id}`).get().then(d => d.data().size);
await check('bob (lecture) ne modifie pas', denied((async () => B.FirebaseCloud.save(m.id, proj(), meta, await cur(), 'alice'))()), false);
await check('alice passe bob en modification', A.FirebaseCloud.addShare({kind:'doc', id:m.id, name:'Montage'}, 'bob@x.fr', 'edit'));
await check('bob (modification) enregistre', (async () => B.FirebaseCloud.save(m.id, proj(), meta, await cur(), 'alice'))());
await check('bob (modification) ne renomme pas le projet', dbB.doc(`smDocs/${m.id}`).update({name:'Piraté', updatedAt:firebase.firestore.FieldValue.serverTimestamp()}), false);
await check('bob ne supprime pas le projet', dbB.doc(`smDocs/${m.id}`).delete(), false);

console.log('Storage');
const ctx = (uid, verified = true) => env.authenticatedContext(uid, {email:uid + '@x.fr', email_verified:verified});
const S = uid => ctx(uid).storage();
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);
const base = `spectramotion/alice/${m.id}`;
await check('alice envoie une image dans son projet', S('alice').ref(`${base}/m1abc.png`).put(png, {contentType:'image/png'}));
await check('alice relit son image', S('alice').ref(`${base}/m1abc.png`).getMetadata());
await check('un fichier n\'est jamais écrasé', S('alice').ref(`${base}/m1abc.png`).put(png, {contentType:'image/png'}), false);
await check('type interdit (HTML) : refusé', S('alice').ref(`${base}/page.html`).put(png, {contentType:'text/html'}), false);
await check('nom de fichier invalide : refusé', S('alice').ref(`${base}/../x.png`).put(png, {contentType:'image/png'}), false);
await check('image de plus de 40 Mo : refusée', S('alice').ref(`${base}/huge.png`).put(new Uint8Array(41 * 1024 * 1024), {contentType:'image/png'}), false);
await check('bob (modification) ajoute un média au projet d\'alice', S('bob').ref(`${base}/m9bob.webm`).put(png, {contentType:'video/webm'}));
await check('bob lit le média partagé', S('bob').ref(`${base}/m1abc.png`).getMetadata());
await check('carol (sans partage) ne lit pas', S('carol').ref(`${base}/m1abc.png`).getMetadata(), false);
await check('carol n\'écrit pas dans le projet d\'alice', S('carol').ref(`${base}/m7.png`).put(png, {contentType:'image/png'}), false);
await check('carol n\'écrit pas dans son espace sous un autre nom', S('carol').ref(`spectramotion/alice/autre${m.id}/x1.png`).put(png, {contentType:'image/png'}), false);
await check('lister un dossier : refusé', S('alice').ref(base).listAll(), false);
await check('email non vérifié : pas d\'accès invité', ctx('bob', false).storage().ref(`${base}/m1abc.png`).getMetadata(), false);
// lien de partage : la personne qui a ouvert le lien lit les médias
await check('alice active un lien en lecture', A.FirebaseCloud.setLink({kind:'doc', id:m.id}, 'view', ''));
const tok = (await dbA.doc(`smDocs/${m.id}`).get()).data().linkToken;
const dbC = mk('c', 'carol'), C = make(dbC, 'carol');
await check('carol ouvre le lien', C.FirebaseCloud.claimLink('doc', m.id, tok, ''));
await check('carol (lien) lit le média', S('carol').ref(`${base}/m1abc.png`).getMetadata());
await check('carol (lien) n\'ajoute pas de média', S('carol').ref(`${base}/m8.png`).put(png, {contentType:'image/png'}), false);
await check('bob (modification) ne supprime pas… si on lui retire le droit', (async () => { await A.FirebaseCloud.removeShare({kind:'doc', id:m.id}, 'bob@x.fr'); return S('bob').ref(`${base}/m1abc.png`).delete(); })(), false);
await check('alice supprime son média', S('alice').ref(`${base}/m1abc.png`).delete());
await check('alice supprime son projet', A.FirebaseCloud.remove(m.id));

console.log(`\n${ok} réussis, ${ko} en échec`); if (ko) console.log('Échecs :', fails.join(' | '));
await env.cleanup(); process.exit(ko ? 1 : 0);

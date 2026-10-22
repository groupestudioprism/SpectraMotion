# Tests de Spectra Motion

Dernière exécution complète : 22/10/2026, tout au vert.

| Suite | Commande | Ce qui est vérifié | Résultat |
| --- | --- | --- | --- |
| Unitaires | `npm test` | modèle de projet : formats par studio, images clés (interpolation, maintien, ajout, suppression), courbes, durée du projet, ordre des calques, assainissement d'un fichier hostile (champs inconnus, tailles, couleurs, textes), masques, historique annuler / rétablir | 9 / 9 |
| Règles | `npm run test:rules` | Firestore + Storage sur émulateurs, avec le **vrai code `cloud.js`** de l'app : création, lecture, liste, partage email et lien, droits lecture / modification, changement de propriétaire refusé, champs interdits, vignette piégée, quotas, compteur d'espace, médias (types, tailles, écrasement, lecture par invité, suppression) | 41 / 41 |
| Bout en bout (démo) | `python3 tools/build.py && npm run test:e2e` | Chromium + Playwright sur `dist/spectramotion-demo.html` : compte, accueil, modèles, cinq studios, import d'image / vidéo / son (fichiers réels créés par ffmpeg), timeline (déplacer, couper, raccourcir), images clés, exports PNG / JPEG / WebM / WAV / `.spectramotion` / `.zip` (fichiers relus et contrôlés), réouverture après rechargement, lecture seule | 37 / 37 |
| Bout en bout (Firebase) | `npx firebase emulators:exec --only auth,firestore,storage --project archivision-studioprism "python3 tests/e2e/firebase.py"` | `index.html?emu=1` avec les vrais SDK Firebase sur émulateurs : inscription, projet dans Firestore, médias dans Storage, second appareil (navigateur vierge) qui retrouve le projet et ses médias, suppression qui efface les fichiers | 8 / 8 |

Pré-requis : Node ≥ 20 (`npm install`), Java ≥ 11 (émulateurs), Python 3 + `pip install playwright` + Chromium, ffmpeg (médias d'essai).

Non testé : le vrai projet Firebase en ligne (rien n'y a été publié), Safari et Firefox (seulement Chromium), l'export MP4 (Chromium du banc d'essai n'encode pas le H.264 ; l'app propose alors WebM).

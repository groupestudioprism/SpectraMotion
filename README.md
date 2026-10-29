# Spectra Motion · Studio Prism

**Spectra Motion est le studio de création multimédia de la gamme SPECTRA** (Writer, Calc, Slide, Motion) : retouche photo et composition, montage vidéo multipiste, animation par images clés, montage et mixage audio, et création assistée par modèles, dans une seule interface et avec un seul compte Studio Prism.

Un projet est **un seul fichier** que l'on regarde avec cinq studios : un titre animé dans *Motion* est le même calque dans *Vidéo* ; une affiche faite dans *Design* devient une vidéo en changeant de studio. Les médias importés forment une bibliothèque commune à tous les studios du projet.

> Version 0.2.0 · interface en français · site statique (GitHub Pages) · Firebase (Authentication, Firestore, Storage facultatif) · aucun serveur, aucun service payant.
> **En ligne** : https://spectramotion.studio-prism.com/ · **Démo autonome** (comptes et projets dans le navigateur, sans Firebase) : `dist/spectramotion-demo.html`.

![Identité visuelle](assets/branding/spectra-motion-planche.png)

## Ce qui fonctionne (testé)

| Domaine | Fonctions réelles |
| --- | --- |
| **Modèles et formats** | **44 modèles** Studio Prism avec recherche et catégories : carrousel Instagram (5 pages), présentation (5 diapositives), carte de visite avec QR code, flyer, menu, CV, diplôme, faire-part, panneau de chantier, infographie, stories et posts, bannières, miniatures, intros et outros animées, compte à rebours, typographie animée, collages… **31 formats** (réseaux sociaux, vidéo, présentations, impression A3 / A4 / A5 / carte de visite / invitation, photo, marque), taille libre, **remise à l'échelle de tout le design** en changeant de format. |
| **Pages** | Documents de **plusieurs pages** (jusqu'à 100) dans Design et Photo : ajouter, dupliquer, supprimer, réordonner (glisser), naviguer (Page préc. / suiv.), vignettes en direct ; export PDF multipage et PNG de toutes les pages. |
| **Éléments** | **25 formes** (pentagone, octogone, badge, étincelle, arche, galet, nuage, croissant, double flèche…), contour continu, tirets ou pointillés ; **lignes et flèches** ; **cadres photo** (12 formes) et **grilles photo** (8 mises en page) : on y glisse une image, elle s'ajuste ; **137 icônes** originales en 16 catégories, dont **BTP** (grue, casque, cône, canalisation…), avec recherche, couleur, épaisseur et fond ; **82 émojis** ; **graphiques** (colonnes, barres, courbe, aires, secteurs, anneau, jauge) avec saisie des données (collage depuis un tableur), couleurs, unité, légende ; **QR code** calculé dans l'app (norme ISO 18004, versions 1 à 40, 4 niveaux de correction), net à toutes les tailles ; fonds **dégradés** et **motifs** (pois, rayures, quadrillage, vagues). |
| **Texte** | **73 polices** Google Fonts rangées par style et **chargées à la demande** ; 12 styles prêts, **12 associations de polices** ; **9 effets** (ombre, relief, creux, décalé, écho, glitch, néon, contour épais), **texte en arc**, **dégradé**, **listes** (puces, numérotée, coches), souligné, surlignage, contour, interligne, espacement, majuscules. |
| **Couleurs et charte** | Palette du document, **pipette** (navigateurs Chromium), **charte graphique** (couleurs + police des titres + police des textes) **enregistrée avec le compte** et reprise dans les panneaux, **24 palettes** et **Styles** (recolorer tout le design d'un clic), appliquer sa charte au design. |
| **Dessin** | Crayon, marqueur, **surligneur**, épaisseur et couleur : chaque trait (lissé et simplifié) devient un calque déplaçable, recolorable, animable. |
| **Organisation** | **Groupes** (Ctrl + G / Ctrl + Maj + G : un clic sélectionne le groupe, Alt + clic ou double-clic un élément seul), **redimensionnement d'une sélection** par ses coins, **grille magnétique**, repères magnétiques, alignement et répartition, calques (ordre, visibilité, verrouillage). |
| **Photo** | 10 réglages (dont **voile** et **grain**), **25 filtres** avec aperçu, **retrait d'un fond uni** (couleur des bords détectée, tolérance, bord adouci : fond studio, fond vert, ciel, page blanche), **bichromie** (8 préréglages + couleurs libres), recadrage (8 proportions + bords), masques (15 formes), miroir, coins, fusion (16 modes), ombre, bordure. |
| **Vidéo** | Timeline multipiste, couper (S), raccourcir, déplacer, vitesse, volume, fondus, **18 effets d'entrée et 15 de sortie** (dont tourbillon, tomber, basculer, tourner, iris, lever de rideau, **bloc coloré**, **mot par mot**), titres et sous-titres. |
| **Motion** | Images clés (position, échelle, rotation, opacité) et 5 courbes ; **24 animations prêtes** (respiration, balancier, clignotement, Ken Burns…) ; **« Animer toute la page »** (entrées échelonnées en un clic). |
| **Audio** | Pistes, formes d'onde, volume, fondus, vitesse, voix off au micro, **égaliseur graves / aigus** et **panoramique** par clip (préréglages : voix plus claire, plus chaud, radio), appliqués à l'aperçu comme aux exports. |
| **Exports** | Image PNG (transparent) / JPEG / WebP ; **PDF** standard ou impression (taille de papier réelle pour les formats d'impression), multipage ; **GIF animé** (320 à 720 px, 10 à 20 images/s, encodeur intégré) ; **toutes les pages** en .zip ; **Redimensionner** : le design adapté à plusieurs formats en un seul .zip ; vidéo WebM / MP4 jusqu'en 4K avec le son ; WAV ; projet `.spectramotion` ou paquet `.zip`. |
| **Compte et cloud** | Compte Studio Prism commun (projet Firebase `archivision-studioprism`) : connexion, inscription, fiche client, code PIN, empreinte / visage, licences `licenses/{uid}_spectramotion`. Projets enregistrés automatiquement dans Firestore, dossiers, partage par email ou par lien, quotas (10 Mo, 50 Mo avec licence, 1 Go administrateur). Médias dans l'appareil et, si Storage est activé, dans Firebase Storage. |
| **Interface** | Thème clair ou sombre, 120 annulations, copier-coller, raccourcis clavier (touche ?), glisser-déposer, PWA installable, petits écrans. |

**Optimisations 0.2** : les 71 polices décoratives ne sont plus déclarées au chargement (seules Inter et Bricolage Grotesque, celles de l'interface) ; chaque police n'est téléchargée que lorsqu'un design l'utilise. Les vignettes des modèles (accueil et panneau) sont calculées progressivement, quand elles approchent de l'écran, au lieu de toutes au démarrage. Le dessin de la scène est regroupé (un seul rendu par image même si plusieurs réglages changent en même temps). Les traitements au pixel (retrait du fond, bichromie) et les motifs sont gardés en cache.

Tests : 14 tests unitaires du modèle, 41 tests des règles Firestore + Storage sur émulateurs, **79 vérifications de bout en bout** en démo (37 + 42 pour la version 0.2, dont QR codes lus par OpenCV, PDF validés par qpdf, GIF relus par Pillow, fond retiré vérifié au pixel) et 8 en mode Firebase réel. Détail dans [`docs/TESTS.md`](docs/TESTS.md).

## Ce qui n'est pas encore fait (à développer)

- **Détourage automatique d'un sujet sur un fond complexe** (une personne devant un paysage) : non disponible, il faudrait un modèle d'IA. Le retrait de fond actuel ne marche que sur les fonds unis ou presque.
- Retouche locale au pinceau (correcteur, tampon), masques dessinés à la main : non disponibles.
- **Réduction du bruit**, compresseur, réverbération : non disponibles (égaliseur et panoramique le sont).
- **Banque de photos, vidéos et musiques libres de droits** intégrée : non disponible (il faudrait un fournisseur et ses conditions d'utilisation) ; vos propres médias s'importent.
- **Assistant IA** (texte ou image générés) et suggestions automatiques de mise en page : non disponibles pour l'instant.
- Commentaires et édition à plusieurs en temps réel : non disponibles (le partage en lecture / modification fonctionne, mais pas l'édition simultanée).
- Transitions automatiques entre deux clips (fondu enchaîné) : obtenues en faisant se chevaucher deux clips avec un fondu ; pas de bouton dédié.
- L'export vidéo se fait **en temps réel** (onglet visible) ; le PDF contient des images de pages (texte non sélectionnable).
- La charte graphique enregistre couleurs et polices, pas encore de logos.
- Les invités d'un **dossier** partagé ne téléchargent pas les médias depuis Storage (limite des règles Storage) ; partager le projet lui-même résout le cas.

## Architecture

Mêmes conventions que les autres SPECTRA : du JavaScript sans framework, assemblé par `tools/build.py` en une seule page.

```
index.html                 page en ligne (générée : python3 tools/build.py)
dist/spectramotion-demo.html  démo autonome (générée)
src/parts/                 en-tête, structure (intro, compte, accueil, atelier)
src/css/                   charte SPECTRA (base, intro, compte, accueil) + motion.css (l'atelier)
src/js/                    compte Studio Prism (auth.js), cloud, accueil et médias dans Storage (cloud.js), menu du compte (auth-end.js)
src/motion/                l'atelier, un module par responsabilité :
  00-util.js               outils, icônes, bus d'évènements
  10-model.js              modèle de projet (calques, pistes, images clés, pages, groupes), formats, polices, assainissement, historique
  12-icons.js              bibliothèque d'icônes (tracés SVG originaux) et émojis
  15-templates.js          modèles Studio Prism (dont modèles de plusieurs pages)
  20-media.js              bibliothèque de médias (IndexedDB, Storage, décodage du son, formes d'onde)
  30-render.js             moteur de rendu (canvas 2D) : le même pour l'aperçu et les exports (effets de texte, texte en arc, animations)
  32-elements.js           QR codes (encodeur ISO 18004), graphiques, icônes, dessins, motifs, retouche au pixel (fond uni, bichromie, grain)
  40-playback.js           lecture : horloge Web Audio, son programmé, vidéos synchronisées
  50-stage.js              scène : sélection, déplacement, redimensionnement, rotation, repères, texte sur place
  55-timeline.js           timeline multipiste et images clés
  60-panels.js             panneau de gauche (ressources par studio)
  62-inspector.js          panneau de droite (propriétés)
  65-pages.js              bande des pages (Design, Photo)
  70-io.js                 exports image / PDF / GIF / vidéo / son / projet, Redimensionner, ouverture des fichiers projet
  80-main.js               état de l'atelier, actions, raccourcis, pont avec le cloud
assets/branding/           logo et déclinaisons (SVG + PNG), générés par tools/brand.py
firebase/                  mode d'emploi Firebase, CORS du bucket (les règles sont dans le dépôt Studio-Prism)
tests/                     unitaires (Node), règles (émulateurs), bout en bout (Playwright)
```

**Modèle de projet** (`.spectramotion`, JSON versionné) : `{v, app, title, studio, w, h, fps, dur, bg, media:{id:{kind, name, mime, size, w, h, dur, path, cloud, thumb}}, layers:[{id, t, track, start, dur, x, y, w, h, rot, op, sc, kf, tin, tout, …}]}`. Les fichiers des médias ne sont **jamais** dans Firestore : seulement leurs métadonnées (et une vignette de quelques Ko).

**Moteurs** : canvas 2D (filtres CSS du canvas pour les réglages), Web Audio (mixage, décodage, `OfflineAudioContext` pour le WAV), `MediaRecorder` + `captureStream` pour la vidéo, IndexedDB pour les fichiers, JSZip (chargé à la demande depuis jsDelivr, avec contrôle d'intégrité) pour les paquets. Aucune dépendance payante.

## Installation, lancement, construction

```bash
git clone https://github.com/groupestudioprism/SpectraMotion.git && cd SpectraMotion
python3 tools/build.py                 # → index.html et dist/spectramotion-demo.html
python3 -m http.server 8000            # http://localhost:8000/dist/spectramotion-demo.html (démo, sans Firebase)
                                       # http://localhost:8000/ (vrai compte Studio Prism si localhost est un domaine autorisé)
```

On modifie `src/`, on relance `python3 tools/build.py`, on enregistre sur `main` : GitHub Pages publie en une minute (à activer : *Settings → Pages → Deploy from a branch → main / root*).

Logo : `python3 tools/brand.py` régénère tous les fichiers de `assets/branding/` (Python, fonttools, Playwright).

## Tests

```bash
npm install                            # outils de test uniquement (rien n'est nécessaire pour utiliser l'app)
npm test                               # tests unitaires du modèle (Node ≥ 20)
npm run test:rules                     # télécharge les règles depuis Studio-Prism, puis les teste sur les émulateurs (Java ≥ 11)
python3 tools/build.py && npm run test:e2e   # bout en bout dans Chromium (Python + Playwright + ffmpeg + numpy, OpenCV, Pillow, qpdf, poppler)
npx firebase emulators:exec --only auth,firestore,storage --project archivision-studioprism "python3 tests/e2e/firebase.py"
```

## Firebase : à faire à la main

Rien n'est publié automatiquement. Le mode d'emploi complet, avec les scénarios de vérification, est dans [`firebase/README.md`](firebase/README.md) :

1. **Règles Firestore et Storage** : elles vivent dans leur **source unique**, le dépôt Studio-Prism. Le bloc Firestore de Spectra Motion est sur `main` (publié le 24/10/2026). Les règles Storage des médias et le nettoyage de la suppression de compte sont encore sur la branche `integration-spectra-motion`. Ce dépôt n'en garde pas de copie : `npm run test:rules` les télécharge. La version 0.2 n'a demandé **aucune modification des règles** (les nouveaux éléments vivent dans le contenu du projet, déjà contrôlé).
2. **Storage (facultatif)** : l'activer dans la console (un nouveau bucket demande le forfait **Blaze**), publier `storage.rules`, autoriser l'accès de Storage à Firestore, appliquer la configuration CORS `firebase/storage-cors.json`. Sans Storage, les médias restent sur l'appareil.
3. **Catalogue** : créer le produit `spectramotion` (« Spectra Motion », description « Création photo, vidéo, animation et audio ») dans l'administration du site pour attribuer licences et clés.

Tant que les règles ne sont pas publiées, l'app fonctionne quand même : les projets sont enregistrés **sur l'appareil**, rattachés au compte, et partent dans le cloud dès que possible.

La configuration Firebase écrite dans `index.html` est publique par conception ; la sécurité repose sur les règles. **Ne jamais ajouter de clé privée ni de compte de service dans ce dépôt.** Il n'y a pas de fichier `.env` : l'app n'a aucun secret.

## Intégration avec les autres applications

Spectra Motion est ajouté (marqué « Bientôt », sans lien tant que l'adresse n'existe pas) sur l'écran de connexion de Writer, Calc et Slide, dans le registre de Nexus, dans les règles communes et la suppression de compte du site Studio Prism : les modifications sont sur une branche `integration-spectra-motion` de chacun de ces dépôts, à fusionner après vérification.

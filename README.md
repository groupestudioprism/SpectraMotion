# Spectra Motion · Studio Prism

**Spectra Motion est le studio de création multimédia de la gamme SPECTRA** (Writer, Calc, Slide, Motion) : retouche photo et composition, montage vidéo multipiste, animation par images clés, montage et mixage audio, et création assistée par modèles, dans une seule interface et avec un seul compte Studio Prism.

Un projet est **un seul fichier** que l'on regarde avec cinq studios : un titre animé dans *Motion* est le même calque dans *Vidéo* ; une affiche faite dans *Design* devient une vidéo en changeant de studio. Les médias importés forment une bibliothèque commune à tous les studios du projet.

> Version 0.4.0 · interface en français · site statique (GitHub Pages) · Firebase (Authentication, Firestore, Storage facultatif) · aucun serveur, aucun service payant.
> **En ligne** : https://spectramotion.studio-prism.com/ · **Démo autonome** (comptes et projets dans le navigateur, sans Firebase) : `dist/spectramotion-demo.html`.

![Identité visuelle](assets/branding/spectra-motion-planche.png)

## Ce qui fonctionne (testé)

| Domaine | Fonctions réelles |
| --- | --- |
| **Clic droit partout** | Un **menu contextuel** sur chaque zone du site (environ 260 entrées, avec sous-menus, raccourcis affichés, navigation au clavier, appui long sur écran tactile) : élément de la scène (copier, coller, dupliquer, **copier / coller le style**, casse du texte, effets de texte, traduction et réécriture IA, ordre, alignement, même taille, proportions, verrouiller, masquer, remplacer le fichier, retouche, filtres, effets photo, détourage, animations, **images clés**, lien, commentaire, **copier l'image**, **enregistrer l'élément seul en PNG**) ; scène vide (ajouter, fond, format, pages, affichage) ; **clips de la timeline** (couper, rogner avant / après la tête de lecture, supprimer et rapprocher, vitesse, son, effets audio, mise en page vidéo) ; règle et repères ; pistes ; calques ; pages ; médias ; modèles ; couleurs ; barre d'outils ; accueil (projets, dossiers, modèles). Les champs de saisie gardent le menu du navigateur (copier, coller, orthographe). |
| **IA (Gemini)** | **Design magique** : une description → un design complet (1 à 10 pages) au format choisi, avec textes, formes, icônes, graphiques, tableaux, QR codes, et **photos libres trouvées automatiquement** ; **rédaction** (corriger, reformuler, raccourcir, développer, ton pro ou amusant, accroche, émojis, liste, consigne libre) ; **traduction de tout le design** en 10 langues (textes, tableaux, graphiques, toutes les pages) ; **ambiance de couleurs** décrite en mots ; **sous-titres automatiques** d'une vidéo ou d'un son (transcription synchronisée). Même mécanisme que SPECTRA Writer (Firebase AI Logic, aucune clé dans le code), 25 demandes par jour en gratuit, 300 avec licence. |
| **IA dans le navigateur** | **Détourage** du sujet (personnes, animaux, véhicules, objets courants) ou d'une personne en mode précis, **flou d'arrière-plan** (effet portrait) : modèles MediaPipe (Google, licence Apache 2.0) exécutés sur l'appareil, sans envoi d'image, sans compte, sans quota. Résultat en copie (l'original reste). |
| **Médias libres** | Recherche dans **Wikimedia Commons** (plus de 100 millions de photos et de sons sous licence libre) depuis l'app ; l'auteur, la licence et la source sont gardés avec chaque média, affichés dans les propriétés et rassemblés dans **Fichier → Crédits** (copier, ou ajouter en bas de page). **18 effets sonores et 5 boucles musicales générés** par le navigateur (libres de tout droit). |
| **Modèles et formats** | **308 modèles** : 44 modèles Studio Prism et 6 variantes de chacun (autres palettes et associations de polices, contraste des textes vérifié), avec recherche et catégories : carrousel Instagram (5 pages), présentation (5 diapositives), carte de visite avec QR code, flyer, menu, CV, diplôme, faire-part, panneau de chantier, infographie, stories et posts, bannières, miniatures, intros et outros animées, compte à rebours, typographie animée, collages… **31 formats** (réseaux sociaux, vidéo, présentations, impression A3 / A4 / A5 / carte de visite / invitation, photo, marque), taille libre, **remise à l'échelle de tout le design** en changeant de format. |
| **Pages** | Documents de **plusieurs pages** (jusqu'à 100) dans Design et Photo : ajouter, dupliquer, supprimer, réordonner (glisser), naviguer (Page préc. / suiv.), vignettes en direct ; export PDF multipage et PNG de toutes les pages. |
| **Éléments** | **25 formes** (pentagone, octogone, badge, étincelle, arche, galet, nuage, croissant, double flèche…), contour continu, tirets ou pointillés ; **lignes et flèches** ; **cadres photo** (12 formes) et **grilles photo** (8 mises en page) : on y glisse une image, elle s'ajuste ; **137 icônes** originales en 16 catégories, dont **BTP** (grue, casque, cône, canalisation…), avec recherche, couleur, épaisseur et fond ; **82 émojis** ; **60 autocollants** (badges, rubans, bulles, traits et flèches dessinés, éclats, fête, nature, formes organiques, ornements) ; **tableaux** (6 styles, saisie ou collage depuis un tableur, nombres alignés à droite) ; **maquettes d'appareils** (téléphone, tablette, ordinateur portable, navigateur, écran, montre) où l'on glisse une capture ; **graphiques** (colonnes, barres, courbe, aires, secteurs, anneau, jauge) avec saisie des données (collage depuis un tableur), couleurs, unité, légende ; **QR code** calculé dans l'app (norme ISO 18004, versions 1 à 40, 4 niveaux de correction), net à toutes les tailles ; fonds **dégradés** et **motifs** (pois, rayures, quadrillage, vagues). |
| **Texte** | **73 polices** Google Fonts rangées par style et **chargées à la demande** ; 12 styles prêts, **12 associations de polices** ; **9 effets** (ombre, relief, creux, décalé, écho, glitch, néon, contour épais), **texte en arc**, **dégradé**, **listes** (puces, numérotée, coches), souligné, surlignage, contour, interligne, espacement, majuscules ; **casse** (MAJUSCULES, minuscules, Première Lettre En Capitale, phrase) et **ajuster la taille au cadre** ; apparition **lettre par lettre** et **lettres qui montent**. |
| **Couleurs et charte** | Palette du document, **pipette** (navigateurs Chromium), **charte graphique** (couleurs + police des titres + police des textes) **enregistrée avec le compte** et reprise dans les panneaux, **24 palettes** et **Styles** (recolorer tout le design d'un clic), appliquer sa charte au design. |
| **Dessin** | Crayon, marqueur, **surligneur**, épaisseur et couleur : chaque trait (lissé et simplifié) devient un calque déplaçable, recolorable, animable. |
| **Travail** | **Présenter** en plein écran (flèches, clic, transitions entre pages, lecture automatique, notes du présentateur, minuteur, liens cliquables) ; **commentaires** épinglés sur la page avec réponses et « résolu », enregistrés dans le projet (visibles par les personnes avec qui il est partagé) ; **versions** (automatiques toutes les 5 minutes et nommées, sur l'appareil) ; **rechercher et remplacer** dans toutes les pages ; **liens** sur n'importe quel élément ; notes par page. |
| **Organisation** | **Copier / coller le style** d'un élément à d'autres, **même largeur / hauteur**, premier plan / arrière-plan direct, centrer sur la page, remplir la page, proportions prêtes, **Groupes** (Ctrl + G / Ctrl + Maj + G : un clic sélectionne le groupe, Alt + clic ou double-clic un élément seul), **redimensionnement d'une sélection** par ses coins, **grille magnétique**, repères magnétiques, alignement et répartition, calques (ordre, visibilité, verrouillage). |
| **Photo** | **Amélioration automatique**, **17 réglages** (dont **exposition**, **ombres**, **hautes lumières**, **vibrance**, **teinte vert / magenta**, **clarté**, voile, grain, netteté), **8 effets photo** (pixeliser, postériser, décalage RVB, négatif, noir et blanc pur, trame, relief, croquis) avec intensité, **réglages appliqués à toutes les images** en un clic, **contour autocollant** autour d'un sujet détouré, **49 filtres** avec aperçu (dont HDR, mat, sarcelle et orange, argentique, cyberpunk, heure dorée, infrarouge), **retrait d'un fond uni** (couleur des bords détectée, tolérance, bord adouci : fond studio, fond vert, ciel, page blanche), **bichromie** (8 préréglages + couleurs libres), recadrage (8 proportions + bords), masques (15 formes), miroir, coins, fusion (16 modes), ombre, bordure. |
| **Vidéo** | **Repères** sur la timeline (touche M, [ et ] pour y sauter, noms, aimantation), **repères sur les temps forts** d'une musique, **caler les clips sur les repères** (montage au rythme), **supprimer et rapprocher** (Maj + Suppr), **supprimer les vides** d'une piste, rogner avant / après la tête de lecture, **mises en page** (incrustation, écran partagé côte à côte ou haut / bas, 1 + 2, grille de 4), **fond vert** sur une vidéo, **détacher l'audio**, **fondu enchaîné** avec le clip précédent, **arrêt sur image**, **sous-titres automatiques**, timeline multipiste, couper (S), vitesse de ×0,25 à ×4, volume, fondus, **26 effets d'entrée et 21 de sortie** (dont secousse, étirement, pendule, zoom flou, élévation, grandir, tourbillon, iris, **bloc coloré**, **mot par mot**, **lettre par lettre**), titres et sous-titres. |
| **Motion** | Images clés (position, échelle, rotation, opacité) et **8 courbes** (dont **dépassement**, **élastique**, **rebond**) ; **copier / coller les images clés** d'un calque à l'autre, **inverser l'animation**, une courbe pour toutes les images clés ; **38 animations prêtes** (rebond élastique, ressort, battement de cœur, panoramique, lettres qui montent, respiration, Ken Burns…) ; **« Animer toute la page »** (entrées échelonnées en un clic). |
| **Audio** | Pistes, formes d'onde, volume, fondus, vitesse, voix off au micro, **égaliseur graves / aigus** et **panoramique** par clip (préréglages : voix plus claire, plus chaud, radio), **réverbération** (petite pièce à cathédrale, réponse générée dans le navigateur), **écho**, **compresseur** (avec limiteur), **baisse automatique** d'une musique sous la voix (−13 dB pendant les autres pistes), **normaliser** (crête à −1 dB), **détection des temps forts** → repères ; tout est appliqué à l'aperçu comme aux exports. |
| **Exports** | Image PNG (transparent) / JPEG / WebP ; **PDF** standard ou impression (taille de papier réelle pour les formats d'impression), multipage, **liens cliquables** ; **site web** (un fichier .html autonome, adapté aux téléphones, liens actifs) ; **diaporama vidéo** des pages (durée par page, fondus) ; **GIF animé** (320 à 720 px, 10 à 20 images/s, encodeur intégré) ; **toutes les pages** en .zip ; **Redimensionner** : le design adapté à plusieurs formats en un seul .zip ; vidéo WebM / MP4 jusqu'en 4K avec le son ; WAV ; projet `.spectramotion` ou paquet `.zip`. |
| **Compte et cloud** | Compte Studio Prism commun (projet Firebase `archivision-studioprism`) : connexion, inscription, fiche client, code PIN, empreinte / visage, licences `licenses/{uid}_spectramotion`. Projets enregistrés automatiquement dans Firestore, dossiers, partage par email ou par lien, quotas (10 Mo, 50 Mo avec licence, 1 Go administrateur). Médias dans l'appareil et, si Storage est activé, dans Firebase Storage. |
| **Interface** | Thème clair ou sombre, 120 annulations, copier-coller, **clic droit partout**, raccourcis clavier (touche ?), glisser-déposer, PWA installable, petits écrans. |

**Optimisations 0.2** : les 71 polices décoratives ne sont plus déclarées au chargement (seules Inter et Bricolage Grotesque, celles de l'interface) ; chaque police n'est téléchargée que lorsqu'un design l'utilise. Les vignettes des modèles (accueil et panneau) sont calculées progressivement, quand elles approchent de l'écran, au lieu de toutes au démarrage. Le dessin de la scène est regroupé (un seul rendu par image même si plusieurs réglages changent en même temps). Les traitements au pixel (retrait du fond, bichromie) et les motifs sont gardés en cache.

Tests : 20 tests unitaires du modèle, 41 tests des règles Firestore + Storage sur émulateurs, **176 vérifications de bout en bout** en démo (37 + 42 + 31 + **66 pour la version 0.4** : vrais clics droits de la souris sur toutes les zones, écho / réverbération / baisse automatique mesurés dans les WAV exportés, temps forts détectés sur une piste de clics, réglages au pixel vérifiés sur le rendu réel ; dont **détourage MediaPipe réel sur une photo** vérifié au pixel, PDF avec lien validé par qpdf, site web et diaporama vidéo relus ; réponses de l'IA Gemini et de Wikimedia Commons simulées dans les tests) et 8 en mode Firebase réel. Détail dans [`docs/TESTS.md`](docs/TESTS.md).

## Ce qui n'est pas encore fait (à développer)

- **Génération d'images par IA** (texte → image) : non disponible ; l'API d'images de Google demande le forfait payant Blaze du projet Firebase.
- **Édition à plusieurs en temps réel** (curseurs des autres, modifications simultanées) : non disponible ; les commentaires et le partage fonctionnent, mais une seule personne doit modifier à la fois.
- Détourage des **vidéos**, gomme magique (effacer un objet), agrandissement d'image par IA : non disponibles.
- Banque de **musiques** commerciales : seuls les sons de Wikimedia Commons et les boucles générées sont proposés.
- Planification de publications sur les réseaux sociaux, sites web de plusieurs pages avec navigation : non disponibles (l'export site web est une page unique).
- L'export vidéo se fait **en temps réel** (onglet visible) ; le PDF contient des images de pages (texte non sélectionnable, liens actifs).
- Les versions sont gardées sur l'appareil où elles ont été faites ; la charte enregistre couleurs et polices, pas de logos.
- Les invités d'un **dossier** partagé ne téléchargent pas les médias depuis Storage (limite des règles Storage) ; partager le projet lui-même résout le cas.
- **À faire une fois dans la console Firebase** pour l'IA Gemini : AI Logic → « Commencer » (Gemini Developer API), comme pour SPECTRA Writer. Sans cela, l'app affiche le message d'activation ; le détourage, lui, fonctionne sans rien activer.

## Architecture

Mêmes conventions que les autres SPECTRA : du JavaScript sans framework, assemblé par `tools/build.py` en une seule page.

```
index.html                 page en ligne (générée : python3 tools/build.py)
dist/spectramotion-demo.html  démo autonome (générée)
src/parts/                 en-tête, structure (intro, compte, accueil, atelier)
src/css/                   charte SPECTRA (base, intro, compte, accueil) + motion.css (l'atelier)
src/js/                    compte Studio Prism (auth.js), cloud, accueil et médias dans Storage (cloud.js), IA Gemini (ai.js), menu du compte (auth-end.js)
src/motion/                l'atelier, un module par responsabilité :
  00-util.js               outils, icônes, bus d'évènements
  10-model.js              modèle de projet (calques, pistes, images clés, pages, groupes), formats, polices, assainissement, historique
  12-icons.js              bibliothèque d'icônes (tracés SVG originaux) et émojis
  15-templates.js          modèles Studio Prism (dont modèles de plusieurs pages)
  20-media.js              bibliothèque de médias (IndexedDB, Storage, décodage du son, formes d'onde)
  33-more.js               autocollants, tableaux, maquettes d'appareils, netteté, contour, amélioration auto, sons générés
  34-ai.js                 assistant IA (design magique, rédaction, traduction, couleurs, sous-titres)
  35-seg.js                détourage par IA dans le navigateur (MediaPipe)
  36-stock.js              banque de médias libres (Wikimedia Commons) et crédits
  38-tools.js              outils de montage (détacher l'audio, fondu enchaîné, arrêt sur image, supprimer et rapprocher, vides, normaliser, temps forts, mises en page), images clés (copier, coller, inverser), copier / coller le style
  39-ctx.js                clic droit : menus contextuels de tout le site (sous-menus, clavier, appui long) et leurs actions
  30-render.js             moteur de rendu (canvas 2D) : le même pour l'aperçu et les exports (effets de texte, texte en arc, animations)
  32-elements.js           QR codes (encodeur ISO 18004), graphiques, icônes, dessins, motifs, retouche au pixel (fond uni, bichromie, grain, exposition, ombres, vibrance, clarté, effets photo)
  40-playback.js           lecture : horloge Web Audio, son programmé (égaliseur, compresseur, écho, réverbération, baisse automatique), vidéos synchronisées
  50-stage.js              scène : sélection, déplacement, redimensionnement, rotation, repères, texte sur place
  55-timeline.js           timeline multipiste et images clés
  60-panels.js             panneau de gauche (ressources par studio)
  62-inspector.js          panneau de droite (propriétés)
  65-pages.js              bande des pages (Design, Photo)
  66-present.js            mode Présenter, commentaires, versions, rechercher / remplacer
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

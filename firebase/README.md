# Firebase de Spectra Motion — à publier À LA MAIN

Spectra Motion ne publie rien lui-même. Depuis le 22/10/2026, **toutes les règles du projet Firebase vivent dans un seul dépôt : Studio-Prism** (un projet Firebase n'a qu'un fichier de règles en ligne, partagé par le site et toutes les apps). Ce dossier ne garde donc que :

| Fichier | Rôle |
| --- | --- |
| `README.md` | ce mode d'emploi |
| `storage-cors.json` | autorisation de téléchargement des médias depuis l'app (CORS du bucket) |
| `firestore.rules`, `storage.rules` | **copies non suivies**, téléchargées par `npm run test:rules` (`tools/fetch_rules.py`) pour les émulateurs |

Les règles de Spectra Motion, dans le dépôt **Studio-Prism**, branche `integration-spectra-motion` (à fusionner dans `main`) :

| Fichier (Studio-Prism) | Contenu |
| --- | --- |
| `firebase/rules/23-spectra-motion.rules` | le bloc Spectra Motion (`sm*`) |
| `firebase/rules/30-nexus.rules` | `spectramotion` ajouté aux apps que NEXUS peut connecter |
| `firebase/firestore.rules` | le fichier complet, assemblé par `python3 tools/build_rules.py` (166 Ko, limite 256 Ko) |
| `storage.rules` | médiathèque du site (inchangée) + médias des projets Spectra Motion |

## 1. Règles Firestore (obligatoire pour le cloud)

1. Fusionner la branche `integration-spectra-motion` de Studio-Prism, puis dans ce dépôt-là : `python3 tools/build_rules.py` (contrôle que chaque app garde ses collections).
2. Publier **le fichier complet** `firebase/firestore.rules` : `firebase deploy --only firestore:rules` depuis Studio-Prism, ou console Firebase → **Firestore Database → Règles** → tout remplacer → **Publier**.

Aucune règle existante n'est modifiée, sauf la liste des applications que NEXUS peut connecter.

Collections ajoutées : `smDocs/{id}` (+ `content/main`), `smFolders`, `smShares`, `smGrants`, `smUsage/{uid}`, `smLibrary/{uid}`. Licence : `licenses/{uid}_spectramotion`.

Ce que les règles imposent :
- tout est refusé par défaut ; il faut être connecté avec un compte actif ;
- un projet n'est lisible que par son propriétaire et les personnes avec qui il est partagé (email vérifié) ; la liste des projets n'est possible que pour ses propres projets ;
- personne ne change le propriétaire ni la date de création ; un invité « modification » ne change que le contenu (pas le nom, ni le partage) ; un invité « lecture » ne modifie rien ;
- champs contrôlés (liste fermée, types, longueurs) ; la vignette ne peut être qu'une petite image `data:image/jpeg|png|webp` ;
- le compteur d'espace (`smUsage`) bouge exactement de la taille du projet modifié dans le même lot, jamais au-delà du quota (10 Mo / 50 Mo avec licence / 1 Go administrateur). La taille comptée = le projet + les fichiers de ses médias envoyés dans Storage.

## 2. Storage (facultatif : synchronisation des médias entre appareils)

Sans Storage, les médias restent dans l'appareil où ils ont été importés (IndexedDB), le projet lui-même est dans Firestore : sur un autre appareil, les médias apparaissent « manquants » et peuvent être reliés. Avec Storage, ils suivent le projet.

1. Console → **Build → Storage → Commencer**. **Le forfait Blaze (paiement à l'usage) est exigé par Google pour créer un nouveau bucket** : ne le faites que si vous l'acceptez (le quota gratuit de Storage reste appliqué sur Blaze). Le site utilise le même bucket pour sa médiathèque : s'il est déjà activé, rien à faire.
2. Onglet **Règles** → remplacer tout par `storage.rules` du dépôt Studio-Prism (ou `firebase deploy --only storage` depuis ce dépôt) → **Publier**. La console propose d'accorder à Storage le droit de lire Firestore (rôle « Firebase Rules Firestore Service Agent ») : **acceptez**, les règles en ont besoin.
3. **CORS** (sinon l'app ne peut pas relire les fichiers) — dans Google Cloud Shell :
   ```bash
   gcloud storage buckets update gs://archivision-studioprism.firebasestorage.app --cors-file=storage-cors.json   # fichier de ce dossier
   ```
   (adaptez la liste `origin` si l'app est publiée sur un autre domaine).

Ce que les règles Storage imposent (`spectramotion/{propriétaire}/{projet}/{fichier}`) :
- lecture (jamais de listage) : le propriétaire, une personne à qui le projet est partagé par email (email vérifié), ou qui a ouvert son lien de partage ;
- envoi : le propriétaire ou un invité « modification » ; nom de fichier `{média}.{extension}` ; images ≤ 40 Mo, vidéos ≤ 500 Mo, sons ≤ 200 Mo ; aucun autre type ; **jamais d'écrasement** ;
- suppression : le propriétaire, un invité « modification », un administrateur actif.

Limite : les règles Storage ne peuvent lire que **2 documents Firestore** par requête. Les invités sont donc vérifiés par un seul document (leur partage ou leur accès par lien), pas par le dossier : les invités d'un **dossier** partagé n'ont pas accès aux fichiers (partagez le projet lui-même). Le quota de l'espace est contrôlé par Firestore (`smUsage`), Storage ne plafonne que chaque fichier.

## 3. Catalogue et licences (site Studio Prism)

Administration du site → Produits → **Nouveau produit** : identifiant `spectramotion`, nom « Spectra Motion », catégorie application, description « Création photo, vidéo, animation et audio », lien vers l'app une fois publiée. Les licences se donnent ensuite comme pour les autres produits (`licenses/{uid}_spectramotion`).

## 4. Domaines autorisés

*Authentication → Settings → Authorized domains* : `groupestudioprism.github.io` est déjà autorisé pour les autres apps. Les autres SPECTRA sont sur `*.studio-prism.com` : ajoutez `spectramotion.studio-prism.com` quand il existera.

## Vérifier après publication

*Console → Firestore → Règles → Simulateur* :

| Opération | Authentifié comme | Chemin | Attendu |
| --- | --- | --- | --- |
| get | A (propriétaire) | `smDocs/P` | autorisé |
| get | B (aucun partage) | `smDocs/P` | **refusé** |
| list | B, filtre `ownerUid == A` | `smDocs` | **refusé** |
| update `ownerUid: B` | A | `smDocs/P` | **refusé** |
| update `preview: "<script>"` | A | `smDocs/P` | **refusé** |
| create | B, `ownerUid: A` | `smDocs/X` | **refusé** |

Les 41 cas automatiques (Firestore + Storage, sur émulateurs) : `npm run test:rules`.

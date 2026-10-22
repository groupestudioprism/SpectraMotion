# Firebase de Spectra Motion — à publier À LA MAIN

Spectra Motion ne publie rien lui-même. Ce dossier contient :

| Fichier | Rôle |
| --- | --- |
| `firestore.rules` | **fichier complet** à coller dans *Console Firebase → Firestore Database → Règles* : règles communes Studio Prism (site, ARCHIPLAN, ARCHITRAFIC, ARCHIINDUS, SPECTRA Writer / Calc / Slide, NEXUS) **+ bloc Spectra Motion**. 177 Ko (limite Firebase : 256 Ko). |
| `firestore-spectramotion.rules` | le bloc Spectra Motion seul (pour mémoire, ou pour l'insérer à la main) |
| `storage.rules` | **fichier complet** à coller dans *Console → Storage → Règles* : médiathèque du site (inchangée) **+ médias des projets Spectra Motion** |
| `storage-spectramotion.rules` | le bloc Storage seul (pour mémoire) |
| `storage-cors.json` | autorisation de téléchargement des médias depuis l'app (CORS du bucket) |

## 1. Règles Firestore (obligatoire pour le cloud)

Le fichier complet part de la version la plus récente des dépôts (celle de NEXUS, 22/10/2026, qui contient déjà le site, la gamme Archi et les trois SPECTRA). Aucune règle existante n'est modifiée, sauf la liste des applications que NEXUS peut connecter, à laquelle `spectramotion` est ajouté.

1. Console Firebase → **Firestore Database → Règles**. Cherchez `match /nxUsers/{uid}` :
   - **présent** → remplacez tout le contenu par `firebase/firestore.rules`, puis **Publier** ;
   - **absent** (NEXUS pas encore publié) ou règles modifiées en ligne depuis → ne remplacez pas : copiez `firestore-spectramotion.rules` et collez-le **juste avant** le bloc final `match /{document=**} { allow read, write: if false; }`, puis **Publier**.

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
2. Onglet **Règles** → remplacer tout par `firebase/storage.rules` → **Publier**. La console propose d'accorder à Storage le droit de lire Firestore (rôle « Firebase Rules Firestore Service Agent ») : **acceptez**, les règles en ont besoin.
3. **CORS** (sinon l'app ne peut pas relire les fichiers) — dans Google Cloud Shell :
   ```bash
   gcloud storage buckets update gs://archivision-studioprism.firebasestorage.app --cors-file=storage-cors.json
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

*Authentication → Settings → Authorized domains* : `groupestudioprism.github.io` est déjà autorisé pour les autres apps. Ajoutez le domaine personnalisé s'il y en a un (par exemple `spectramotion.studio-prism.com`).

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

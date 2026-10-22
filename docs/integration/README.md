# Intégration de Spectra Motion dans les autres apps Studio Prism

Nom : **Spectra Motion** · description : « Création photo, vidéo, animation et audio » · identifiant produit : `spectramotion`.
Adresse prévue : `https://spectramotion.studio-prism.com/` (**pas encore en ligne** : pas d'entrée DNS au 22/10/2026). Tant qu'elle ne répond pas, aucune app n'affiche de lien vers Spectra Motion.

| Dépôt | Branche | Modification | État |
| --- | --- | --- | --- |
| SpectraWriter | `integration-spectra-motion` | écran de connexion : Spectra Motion dans la liste des apps, icône, « Bientôt », sans lien | poussée, à fusionner |
| SpectraCalc | `integration-spectra-motion` | idem | poussée, à fusionner |
| SpectraSlide | `integration-spectra-motion` | idem | poussée, à fusionner |
| Studio-Prism | `integration-spectra-motion` | règles Firestore `firebase/rules/23-spectra-motion.rules` (+ assemblage), `spectramotion` dans les apps que NEXUS peut connecter, `storage.rules` (médias), suppression du compte qui efface aussi les projets et médias Spectra Motion, README | poussée, à fusionner **puis publier les règles à la main** |
| Nexus | — | `nexus-spectra-motion.patch` (ce dossier) : Spectra Motion dans le registre des apps et dans les modèles de collecte. **Non appliqué** : le registre n'accepte que des adresses vérifiées (HTTP 200) et chaque app y a un bouton « Ouvrir ». Les 37 tests unitaires de Nexus passent avec le patch. | à appliquer quand l'adresse sera en ligne |

## Quand l'adresse sera en ligne

1. DNS : `spectramotion` CNAME `groupestudioprism.github.io` ; dans ce dépôt, ajouter le fichier `CNAME` (`spectramotion.studio-prism.com`) et activer GitHub Pages (main, racine).
2. Writer, Calc, Slide : remplacer dans `src/parts/body.html` `<span class="ap-ic m" role="img" aria-label="Spectra Motion"></span>` par `<a class="ap-ic m" href="https://spectramotion.studio-prism.com/" aria-label="Spectra Motion"></a>` et « Bientôt » par « Disponible », puis `python3 tools/build.py`.
3. Nexus : `git apply nexus-spectra-motion.patch` (depuis la racine du dépôt Nexus), `npm test`.
4. Site : renseigner l'adresse dans la fiche du produit `spectramotion` (administration → Produits) ; le catalogue et « Mes applications » l'utilisent.
5. Firebase Authentication : ajouter `spectramotion.studio-prism.com` aux domaines autorisés.

#!/usr/bin/env python3
"""Télécharge les règles Firebase depuis leur SOURCE UNIQUE, le dépôt Studio-Prism (firebase/firestore.rules et storage.rules),
pour les tests sur émulateurs. Ce dépôt n'en garde aucune copie suivie par git (décision du 22/10/2026 : un projet Firebase
n'a qu'un fichier de règles en ligne, toutes les apps le partagent).

  python3 tools/fetch_rules.py              # branche main de Studio-Prism, sinon la branche d'intégration de Spectra Motion
  SM_RULES_REF=ma-branche python3 tools/fetch_rules.py
Tant que la branche « integration-spectra-motion » n'est pas fusionnée dans Studio-Prism, main ne contient pas le bloc
Spectra Motion : le script le détecte et prend la branche d'intégration."""
import os, pathlib, sys, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'https://raw.githubusercontent.com/groupestudioprism/Studio-Prism/{ref}/{path}'
FILES = {'firebase/firestore.rules': 'firebase/firestore.rules', 'storage.rules': 'firebase/storage.rules'}
def get(ref, path):
    with urllib.request.urlopen(BASE.format(ref=ref, path=path), timeout=60) as r: return r.read().decode('utf-8')
def main():
    refs = [os.environ['SM_RULES_REF']] if os.environ.get('SM_RULES_REF') else ['main', 'integration-spectra-motion']
    marks = {'firebase/firestore.rules': 'match /smDocs/', 'storage.rules': 'spectramotion/'}
    for src, dst in FILES.items():
        for ref in refs:  # chaque fichier vient de la première branche qui contient le bloc Spectra Motion
            try: txt = get(ref, src)
            except Exception as e: print(f'{src} @ {ref} : indisponible ({e})'); continue
            if marks[src] in txt: (ROOT / dst).write_text(txt, encoding='utf-8'); print(f'{src} @ {ref} -> {dst}'); break
            print(f'{src} @ {ref} : pas encore de bloc Spectra Motion')
        else: sys.exit(f'{src} : règles introuvables (SM_RULES_REF ?)')
main()

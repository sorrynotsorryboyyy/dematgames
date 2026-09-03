# Logos — déposez vos fichiers ici

Trois fichiers à glisser dans ce dossier. **Respectez exactement ces noms**,
le code les cherche tels quels.

| Fichier | Usage | Format attendu |
| --- | --- | --- |
| `logo-full.png` | Navbar (écrans ≥ 640 px), footer | PNG transparent, hauteur ≥ 200 px |
| `logo-mark.png` | Navbar mobile, carte de partage, avatars | PNG transparent, **carré**, ≥ 512 × 512 px |
| `favicon.ico` | Icône d'onglet du navigateur | `.ico` multi-tailles (16, 32, 48 px) |

## Le site fonctionne sans ces fichiers

Tant qu'ils ne sont pas déposés, la navbar affiche le nom en texte et
l'onglet garde l'icône SVG par défaut. Rien ne casse — vous pouvez les
ajouter quand vous voulez.

## Conseils

- **Fond transparent obligatoire** pour `logo-full` et `logo-mark` : le site
  a un fond blanc cassé (`#FBFAF8`), un fond blanc pur créerait un rectangle
  visible autour du logo.
- **Marges minimales** dans l'image : le composant gère déjà l'espacement.
  Un logo avec beaucoup de vide autour paraîtra trop petit.
- **Poids** : visez moins de 40 Ko au total. Ces images se chargent sur
  chaque page. Un PNG de logo bien exporté dépasse rarement 15 Ko.
- Pour le `.ico`, un générateur en ligne (realfavicongenerator.net) produit
  le fichier multi-tailles à partir de votre PNG carré.

## Après avoir déposé les fichiers

Rien à faire : le composant les détecte au build suivant. En local,
relancez `npm run dev`.

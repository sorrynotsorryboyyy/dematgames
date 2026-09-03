# Mockups

Ce dossier est prévu pour de vrais visuels (rendus 3D, photos de boîtiers,
jaquettes réelles) le jour où ils existeront.

Aujourd'hui, le boîtier de la page est **entièrement généré en CSS**
(`components/box/GameBox.tsx`) : aucune image n'est nécessaire, le rendu
est net à tout zoom et le poids de la page reste minimal.

## Comment substituer un vrai visuel

`GameBox` accepte une prop `coverImage` :

```tsx
<GameBox
  title="Nocturne"
  studio="Pale Moth Studio"
  coverImage="/mockups/nocturne-cover.jpg"
/>
```

Dès que `coverImage` est fourni, la jaquette CSS est remplacée par l'image.
Formats conseillés : ratio 135 × 190 (proportions d'un boîtier DVD), 1080 ×
1520 px minimum, WebP ou AVIF.

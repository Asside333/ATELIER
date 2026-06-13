# DESIGN — l'atelier de nuit

## Identité

Un atelier de production, la nuit : noir violacé, une lampe au sodium, des objets qu'on manipule. Pas une app scolaire, pas un dashboard. **Signature : les briques ivoire** — cartes de savoir comme des touches de piano physiques (ivoire, tranche, ombre, micro-rotation au drop). Tout le reste reste discipliné pour que la signature respire.

## Tokens

Fond `#14101a` + lueurs radiales (violet `rgba(126,82,190,.16)` haut-gauche, ambre `rgba(242,163,60,.10)` bas-droit) · surfaces `#1d1824` / `#262030` · lignes `#332b40` · encre `#efe9dc` / `#a59d92` / `#675f70` · **ambre** `#f2a33c→#ffc46a` (action, piste A) · **turquoise** `#5fb8a8` (gestes, piste B, tips) · ok `#8fb573` · erreur `#c9655a` · ivoire `#ece6da` sur `#1a1620` · une teinte par module (`--mh`).
Fontes : **Bricolage Grotesque** (display, retenue) · **Outfit** 300/400 (texte) · **Spline Sans Mono** (données, notes, labels).

## Composants et états

**Grille** (composant central) : cellule `vide / beat / scl (gamme, éclaircie) / on (3 niveaux de vélocité par luminosité) / tail (durée) / ghost (piste inactive, contour turquoise) / ph (playhead) / ok / bad`. Rangées noires assombries. Labels mono, ambrés si dans la gamme.
**Lanes drums** (v3.1) : même grille, lignes nommées KICK/SNARE/HAT/OPEN avec mini-icônes typographiques (pas d'emoji), mêmes états.
**Clavier** : docké bas, dégradés, flash ambre, pastille de sélection.
**Brique** : recto (n°, nom, tranche colorée module) ; verso = def / POURQUOI ÇA SONNE / DANS ABLETON / [POUR ALLER PLUS LOIN repliable] / écoute. Verrouillée = pointillés.
**Chemin** : modules avec intro, barre de progression, dots d'état. Le Dojo (missions T) apparaît entrelacé avec un liseré distinct.
**Accueil rituel** : trois cartes (défi / mission / graine), la flamme ou la braise, sobre.
**Zone de drop .mid** : présente dans le studio et les missions daw ; état attente / parsing / verdict.
**Knob** (v3.4, missions sound design) : un seul gros potentiomètre, étiqueté, valeur en mono.

## Motion et feedback

Règle : chaque acte = double feedback visuel + sonore < 150 ms. Sons d'UI ACCORDÉS à la tonalité de la mission (docs/ENGAGEMENT.md §6) : pose = pluck fondamentale, validation = cadence V→i, erreur = deux conjointes descendantes douces, brique = arpège du module, braise rallumée = quinte montante.
Durées : micro 120-180 ms · vues 200-250 ms · célébrations ≤ 600 ms (drop de brique : translateY + micro-rotation, cubic-bezier rebond). Playhead = seule animation continue. `prefers-reduced-motion` : fondus simples partout.

## Copie UX

Impératif doux ("Pose", "Écoute", "Lance"), jamais culpabilisant. Boutons = ce qui va se passer (▶ LE MODÈLE, ∞ BOUCLE, VALIDER, DÉPOSE TON .MID). États vides = invitations ("Le studio est à toi. Deux pistes, huit sons."). Erreurs = direction, pas verdict. Pas d'emoji, pas de points d'exclamation en rafale.

## Accessibilité et contraintes

Cibles ≥ 40 px (cellules ≥ 32 px tolérées, espacement compensateur) · focus visible ambre · contraste AA · mobile-first 360 px, grille scrollable sans piéger le scroll vertical · jamais de son avant un geste utilisateur · compresseur sur le master, volume conservateur · l'app entière doit rester utilisable sans son (parcours muet : briques, lecture muette, glossaire).

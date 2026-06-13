# ROADMAP — petites versions, toujours déployables

Règle d'or : jamais deux chantiers structurels en parallèle. Chaque version tient en quelques sessions, se déploie, laisse le projet meilleur même si tout s'arrêtait là.

## v3.0 — Fondations
Vite + modules + Tone.js + Vitest + Action GitHub Pages. Modèle de données, registre de validateurs, store versionné. Migration des 39 missions depuis `legacy/` vers `mission/v1` (test d'intégrité octaves). Parité : chemin, 4 types de mission, studio 2 pistes, briques, série, MIDI in. Sortie : tout v2 en mieux, tests verts, déployé.

## v3.1 — Le Son
Synthés Tone.js soignés (sub, wobble LFO synchronisé, stab) · samples CC0 kick/snare/hat + type `lanes` · presets de swing nommés · sons d'UI accordés. Débloque le module XI.

## v3.2 — Le Pont
`midi-io.js` (export + parse) · zone de drop · vérificateurs daw · missions T (Dojo) entrelacées · page "Dans Ableton". La promesse n°2 devient physique.

## v3.3 — La Mémoire et le Rituel
SRS (J+1/3/7/21) · défi du jour · types compare/repair/lecture muette/match · accueil rituel des 7 minutes · braise · Récolte hebdo · glossaire vivant.

## v3.4 — L'ASSISTANT HARMONIQUE (le cœur exploratoire)
`harmony.js` (théorie pure testée : gammes, accords, fonctions, voice-leading, transitions par genre) · les 4 modes de l'Assistant (propose / termine / pourquoi / réharmonise) · `harmony-why.json` (explications reliées aux briques). C'est la demande centrale de Baptiste : l'outil qui propose des accords, en suggère la suite, et explique POURQUOI. Onglet Boîte à outils créé ici.

## v3.5 — La Boîte à outils complète + Genres
Générateur de graines · trouveur de gamme · trouveur de tempo · dé créatif · Table de correspondance des genres (docs/GENRES.md interactive). L'ouverture hors-confort devient un espace jouable.

## v3.6 — Curriculum X-XII
Les Modes (seeds prêts) · Le Rythme Avancé (lanes, seeds prêts) · Sound Design Minimal (knob, seeds prêts). Calibration adaptative activée.

## v3.7 — Le Morceau du Mois
Canevas mensuel 4 pistes avec rotation de genres hors-confort · `unlocks` branchés · export .mid multi-pistes · historique. Studio : 4 pistes, duplication, scènes A/B.

## v3.8 — L'Analyste + Le Studio (matériel)
Drop d'un .mid perso → tonalité, accords, degrés, motifs reliés aux briques (docs/ABLETON.md §3, réutilise harmony.js) · onglet "Le Studio" : fiches matériel, tips Novation, carte son, casque (docs/MATERIEL.md).

## v3.9 — Dojo T2 + Curriculum par genre
Dojo avancé (Session View, automation, Simpler/Slice, sidechain) · premiers modules ciblés genre (Le beat boom bap, Le drop EDM, Le power chord, Le voicing neo-soul).

## v4.0 — L'Oreille II + Arrangement
Les 5 intervalles, dictées, progression entière à l'oreille · type `arrange` (timeline 8 blocs, la tension par soustraction). Paliers d'autonomie branchés.

## Plus tard (→ docs/IDEES.md)
Oreille adaptative fine · import MIDI domaine public à décoder · thème jour · Max for Live (si passage à Suite) · partage par lien · addendum Suite (Wavetable, M4L).

## Anti-roadmap
Pas de backend, comptes, social, natif, framework. Live STANDARD (pas de M4L/Wavetable d'ici un éventuel passage Suite). Aucune mécanique d'engagement qui sacrifie l'apprentissage, l'autonomie ou le respect (docs/ENGAGEMENT.md §9).

## Ajout · Conseil du jour + Carnet de Techniques (intégré à v3.3)
Le Conseil du jour s'ajoute à l'écran d'accueil en même temps que le rituel des 7 minutes (v3.3). Le Carnet de Techniques (l'onglet qui expose les 48+ techniques collectées) s'ouvre dans la Boîte à outils en v3.4. L'apparition contextuelle (la puce qui surgit selon le son choisi ou le geste en cours) est v3.5 — elle nécessite un peu de logique de contexte. Les 48 techniques du seed sont déjà prêtes ; ajouter du contenu = ajouter du JSON, jamais toucher au moteur.

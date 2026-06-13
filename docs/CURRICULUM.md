# CURRICULUM — la carte complète, les formats, la calibration

## Schéma d'une mission (`mission/v1`, versionné, migrable)

```json
{
  "schema": "mission/v1",
  "id": "x03", "mod": 9, "type": "decode", "title": "LA BASSLINE DORIENNE", "tag": "DECODER",
  "instr": "…geste concret, zéro vocabulaire théorique…",
  "tip": "…optionnel : savoir glissé…",
  "bpm": 140, "steps": 16, "swing": 0,
  "rows": [50,48,47,45,43,42,41,40], "patch": "bass", "marks": false, "scale": "Ador",
  "ctx": [], "target": [{"p":45,"s":0,"d":2}],
  "validate": {"kind": "cells-exact"},
  "hints": ["reformulation", "indice précis", "quasi-solution"],
  "brick": {"name":"…","def":"…","why":"…","abl":"…","plus":"…optionnel : l'étage POUR ALLER PLUS LOIN…"},
  "demo": {"bpm":140,"steps":16,"tracks":[]},
  "unlocks": {"seed": "contrainte de graine", "studio": "preset/élément du Morceau du Mois"}
}
```

Validateurs = registre nommé (`src/core/validators.js`) : `set-exact`, `cells-exact`, `cells-at-steps`, `lanes-exact` (drums), `predicate:<nom>` (logiques spécifiques, testées unitairement avec solution canonique + contre-exemple), `ear`, `match`, `compare`, `daw:<vérificateur>` (boucle .mid — docs/ABLETON.md). Une mission ne contient JAMAIS de code. Champ `unlocks` : ce que la mission apporte au système d'engagement.

## Types de mission

Actifs dès v3.0 : **keys** · **grid** · **decode** · **ear** (étendu à N choix).
v3.1+ (drums) : **lanes** — grille à pistes nommées (kick/snare/hat/open) au lieu de pitches.
v3.3+ (révision et profondeur) : **compare** (A/B : qu'est-ce qui change ?) · **repair** (une note fausse dans une boucle : la trouver, la corriger) · **lecture muette** (lire une grille, prédire à l'oreille intérieure, vérifier) · **match** (associer sons et étiquettes).
v3.2+ : **daw** (consigne exécutée dans Live, vérifiée par .mid ou checklist+quiz).
v3.5+ : **arrange** (timeline de 8 blocs, activer/désactiver des pistes : la tension par soustraction).

## La carte (15 modules : I-IX acquis, X-XIV + T à venir)

**Acquis (39 missions, contenu dans legacy/, à migrer tel quel) :**
I Le Terrain (4) · II Le Piano Roll (4, les GESTES) · III La Gamme Sombre (4) · IV Les Accords (5) · V Les Progressions (5) · VI La Mélodie (4) · VII La Basse (4) · VIII Les Accords Riches (4) · IX Le Groove (5).

**Écrits, prêts à implémenter (19 missions complètes dans docs/seeds/missions-seed.json) :**
X **Les Modes** (5) — le dorien (le mineur qui sourit : la couleur jungle), le phrygien (la menace), la note caractéristique, le mineur harmonique (qui explique rétroactivement LA CADENCE), l'oreille modale à 3 choix.
XI **Le Rythme Avancé** (5, sur samples) — backbeat, le 2-step UKG, le flow des hats, le breakbeat décodé, les ghosts de caisse.
XII **Sound Design Minimal** (4) — l'ADSR entendu, le cutoff comme instrument, la modulation (LFO ailleurs que le filtre), le layering sub/mid.
T **Ableton Craft** (5, transversal) — le pont MIDI, transposer dans Live, Scale, le Groove Pool, la main sur les vélocités. S'entrelacent dans le chemin (t02 se débloque après LA TRANSPOSITION, t04 après LE SWING…), ne forment pas un bloc final.

**À concevoir (descriptions, pas encore de seeds) :**
XIII **L'Arrangement** (4) — la soustraction, l'intro qui installe, le break qui affame, le drop qui paye. Type `arrange`.
XIV **L'Oreille II** (4) — les 5 intervalles utiles, 3 vs 4 notes, entendre une progression entière, dictée mélodique 5 notes.

## Règles de copie

Français, tutoiement, phrases courtes, impératif doux. Interdit avant révélation : tout terme du concept visé. Obligatoire : le geste exact + la sensation à chercher ("écoute le frottement", "sens le manque"). Les textes d'erreur enseignent. Octaves convention Ableton, vérifiées par test d'intégrité automatique (extraction des noms dans les textes ↔ pitches du code). Le champ `plus` (POUR ALLER PLUS LOIN) : 3-5 phrases max, histoire ou physique, jamais obligatoire à lire.

## Calibration et hints

Cible ~80 % de réussite en ≤2 essais (télémétrie locale, docs/ENGAGEMENT.md §7). Hints progressifs stockés dans la mission : [reformulation, indice précis, quasi-solution] servis aux échecs 1, 2, 4. Échec 4+ en decode : une cellule juste s'allume. Raccourcis et missions tampons : voir ENGAGEMENT §7.

## Révision espacée (SRS, v3.3)

File par brique : J+1, J+3, J+7, J+21. Le défi du jour pioche la plus en retard et la reteste sous une forme différente de l'acquisition. Réussite → intervalle suivant ; échec → J+1, sans drame, avec le verso de la brique réaffiché. État : `src/core/srs.js`, données dans le store. Brique "solide" = 4 révisions réussies (affiché dans la Récolte).

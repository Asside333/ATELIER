# ABLETON — le pont, le Dojo, l'Analyste, l'Assistant

Ce document définit comment ATELIER enseigne et assiste Ableton Live 12 **édition Standard** (pas Suite : pas de Max for Live, pas de Wavetable ni de certains packs — on s'en tient aux devices Standard, voir §7). C'est la pièce qui distingue ce produit de toute app d'apprentissage existante.

## 1. La boucle .mid aller-retour (le mécanisme fondateur)

Le web ne peut pas lire l'état de Live. Mais le MIDI traverse la frontière dans les deux sens, et un .mid se parse trivialement en JS (@tonejs/midi) :

```
ATELIER fournit un .mid d'exercice
   → import dans Live (glisser-déposer sur une piste)
   → geste exécuté DANS Live (transposer, swinguer, sculpter les vélocités…)
   → export du clip (clic droit > Export MIDI Clip)
   → dépôt dans ATELIER (zone de drop)
   → ATELIER parse et VÉRIFIE RÉELLEMENT.
```

Validation objective d'un geste fait dans le vrai DAW. Implémentation : `src/core/midi-io.js` (export + parse), vérificateurs (`midi-roundtrip`, `midi-transposed:+N`, `midi-swing:odd-late`, `midi-velocity-shape`, `midi-chord-extended`, `midi-quantized`…). Tolérances : ±2 ticks, ordre libre.

## 2. Le Dojo Ableton (module transversal "T", entrelacé)

Missions faites dans Live, débloquées le long du chemin (pas un bloc final : t02 après LA TRANSPOSITION, t04 après LE SWING…). Deux familles :
- **Vérifiables par .mid** : transposer, doubler à l'octave, groove, vélocités, ajouter une 7e, quantifier → validation réelle.
- **Non vérifiables** (Scale, couleurs de clips, racks, warp…) : checklist + micro-quiz de preuve. Honnêteté assumée : on vérifie la compréhension, pas l'écran.
Cinq missions T prêtes (t01-t05) dans docs/seeds/missions-seed.json. Extension prévue (module T2) : Session View, enregistrer une automation, Simpler/Slice d'un sample, sidechain, racks d'effets.

## 3. L'Analyste (transformer SA musique en manuel)

Zone de drop permanente : Baptiste glisse n'importe quel .mid de SES projets. ATELIER répond :
- **tonalité probable** (Krumhansl-Schmuckler simplifié sur les classes de hauteur),
- **accords détectés et nommés**, avec degrés et fonctions,
- **motifs reconnus reliés aux briques** : "mesures 3-4 : descente andalouse", "ta bassline est dorienne (le Fa#)", "ces accords, c'est un ii-V-I — du jazz dans ton hip-hop",
- **ce qu'il fait déjà sans le savoir** = la plus puissante leçon rétroactive.
Chaque détection est cliquable → la brique. Si non acquise : "tu utilises déjà ça — la mission X le nomme". L'Analyste s'appuie sur le même moteur que l'Assistant Harmonique (`src/core/harmony.js`).

## 4. L'Assistant Harmonique branché sur Live

L'outil de la Boîte (docs/BOITE-A-OUTILS.md §1) traverse le pont dans les deux sens :
- **Sortie** : toute suite d'accords trouvée dans l'Assistant s'exporte en .mid → glisser dans Live, poser ses sons.
- **Entrée** : l'Analyste EST l'Assistant en mode lecture — tu déposes une suite que tu as faite dans Live, il l'explique et propose comment la prolonger.
La théorie (gammes, accords, fonctions, voice-leading, transitions par genre) vit dans `src/core/harmony.js`, pure et testée. Les explications dans `src/data/copy/harmony-why.json`.

## 5. Le Morceau du Mois traverse le pont

Le fil rouge (docs/ENGAGEMENT.md) finit TOUJOURS dans Live : la boucle assemblée dans le studio ATELIER s'exporte en .mid multi-pistes + page "Termine-le dans Ableton" (importer, poser ses sons, finir le morceau dans le vrai studio).

## 6. Référentiel des gestes Live 12 Standard (alimente les champs `abl`)

`src/data/copy/ableton-gestes.json`, source unique de vérité, par domaine :
- **Piano roll** : B dessiner · double-clic poser · Ctrl+D dupliquer · flèches transposer · Maj+flèches octave · étirer les bords (durée) · zone vélocité (sculpter) · Alt+glisser (pentes de vélocité).
- **Clips** : Scale (gamme), Transpose (sans toucher aux notes), Loop, Follow Actions.
- **Groove** : Groove Pool (glisser un feel), Commit (graver), Amount (doser).
- **Instruments Standard** : Drift (le sub, le wobble — un synthé moderne PRÉSENT en Standard), Operator (FM, cloches), Analog, Auto Filter (le wobble par LFO), Simpler (chopper un sample).
- **Effets** : Compressor en sidechain (la pompe house), Reverb, Delay, EQ Eight, Saturator, Redux/Vinyl Distortion (lo-fi), Amp/Cabinet (guitare).
- **Workflow** : Export MIDI Clip · Freeze/Flatten · Capture MIDI (récupérer ce qu'on vient de jouer) · Session vs Arrangement.
Règle : tout geste cité dans une brique existe dans ce référentiel, et n'utilise QUE des devices de l'édition Standard. Si un concept exigerait Suite (Wavetable, M4L), le noter et proposer l'équivalent Standard (Drift au lieu de Wavetable).

## 7. Contrainte d'édition : Live 12 STANDARD (important)

Tout le contenu suppose l'édition Standard. Donc : **pas de Max for Live** (le companion temps réel reste dans IDEES, lointain), pas de Wavetable (utiliser Drift, qui est très capable), pas de certains packs Suite. Les devices cités ci-dessus sont tous en Standard. Le jour où Baptiste passe à Suite, un addendum débloquera Wavetable, M4L et les instruments avancés — noté dans ROADMAP/IDEES, jamais supposé d'ici là.

## 8. Limites honnêtes (à dire dans l'app)
Pas de lien temps réel avec Live. L'audio (samples, warp, mixage fin) ne traverse pas la boucle .mid : enseigné par checklist + oreille. Web MIDI : Chrome/Edge desktop et Android uniquement.

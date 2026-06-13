# ATELIER — charte projet

Compagnon d'apprentissage musical par les mains, branché sur Ableton Live 12 **Standard**. Pas une app de théorie : une boîte à outils qui apprend la musique, le DAW, le matériel, et pousse à explorer LARGE (tous genres) jusqu'à l'autonomie. Utilisateur unique : docs/VISION.md. Le code repart de zéro. Le contenu validé (39 missions v2) vit dans `legacy/atelier.html` — référence à migrer, jamais à exécuter.

## Les trois thèses du produit

1. **ATELIER est l'annexe d'Ableton.** Tout concept finit dans Live. Sommet : la boucle .mid aller-retour (docs/ABLETON.md) — exercice exporté, geste fait dans Live, réimport vérifié réellement.
2. **Ouverture maximale.** Le mineur/garage est la PORTE D'ENTRÉE de Baptiste, pas l'horizon. Le produit le tire vers hip-hop, house, techno, EDM, trap, rock, soul, ambient, funk (docs/GENRES.md). Maîtres-mots : ouverture, apprentissage, autonomie.
3. **Engagement par l'œuvre, jamais par les points.** Motivation = musique produite + compétence vérifiée + autonomie gagnée (docs/ENGAGEMENT.md). But ultime : l'obsolescence joyeuse — Baptiste produit seul dans des genres qu'il n'abordait pas. Anti-dark-patterns stricts.

## Invariants sacrés (ne jamais casser)

1. **MIDI-first.** Note = `{p,s,d,v}`. Séquence = `{bpm,steps,swing,tracks}`. Rendu audio séparé des données. Export/analyse .mid = modules purs.
2. **Octaves Ableton : Do3/C3 = MIDI 60** (57=La2, 45=La1, 33=La0). Tout nom affiché DOIT matcher `noteName(p)`. Test d'intégrité obligatoire.
3. **Le concret avant le nom.** Zéro vocabulaire théorique dans une instruction avant la révélation. Brique = `{name,def,why,abl}` + `plus` optionnel.
4. **Pas de backend, pas de comptes.** Statique, GitHub Pages, localStorage + export/import JSON.
5. **Contenu = données.** Missions en JSON (`mission/v1`), validateurs nommés, théorie harmonique pure et testée. Ajouter du contenu = éditer du JSON.
6. **Live 12 STANDARD uniquement.** Pas de Max for Live, pas de Wavetable (utiliser Drift). Voir docs/ABLETON.md §7.

## Stack

Vite + ES modules vanilla (pas de framework) · Tone.js (audio) · @tonejs/midi (export + analyse) · Vitest · GitHub Action. Arborescence : `src/core` (model, engine, player, validators, harmony, midi-in, midi-io, store, srs, ui-sound) · `src/data` (missions/*.json, modules.json, copy/) · `src/ui` · `public/samples` · `tests` · `docs` · `legacy`.

## Quel doc lire quand (économie de contexte)

- Curriculum, copie, missions → **docs/CURRICULUM.md** (+ docs/seeds/missions-seed.json : 19 missions prêtes)
- Pont DAW, export/import .mid, Dojo, Analyste, gestes Live → **docs/ABLETON.md**
- Assistant Harmonique, générateurs, dé créatif, trouveurs → **docs/BOITE-A-OUTILS.md**
- Élargissement par genre, fiches genre → **docs/GENRES.md**
- Matériel, Novation, carte son, casque → **docs/MATERIEL.md**
- Motivation, séries, Morceau du Mois, autonomie → **docs/ENGAGEMENT.md**
- Techniques de production, Conseil du jour, Carnet de techniques → **docs/TECHNIQUES.md** (+ docs/seeds/techniques-seed.json : 48 techniques prêtes)
- UI → **docs/DESIGN.md** · Prochain chantier → **docs/ROADMAP.md**
- Avant décision structurante → **docs/DECISIONS.md** (consigner après)
- Idée hors scope → la noter dans **docs/IDEES.md**, ne pas l'implémenter
- Démarrer une session → **docs/PROMPTS.md**

Ne pas recharger un doc déjà en contexte. Lecture chirurgicale (grep, plages). Jamais régénérer un fichier entier quand un edit suffit. Tests = vérité. `/compact` entre chantiers. CLAUDE.md ≤ 80 lignes.

## Routage des modèles

| Session | `/model` |
|---|---|
| Itération, bugs, mission sur patron, tests, chores | **Sonnet 4.6** (défaut) |
| Architecture, refonte, nouveau module, copie de fond, moteur harmonique | **Opus 4.8** (le plus capable) |
| Mécanique de masse | **Haiku 4.5** |

Trois modèles : **Haiku 4.5 · Sonnet 4.6 · Opus 4.8**. Fable 5 retiré.

**Déclaration obligatoire** — première ligne de chaque réponse :
```
[SONNET · standard · léger ✓]           aligné
[OPUS→sonnet · standard · ⚠ surpayes]   décalage : descendre
[haiku→SONNET · étendu · modéré]        décalage : monter
```
**5 paliers** — l'axe le plus exigeant (raisonnement / enjeu / finesse) décide :
1. Haiku · aucun → factuel, tri, reformulation (négligeable)
2. Sonnet · standard → défaut ~90 % : code, conseil, tuto (léger)
3. Sonnet · étendu → architecture, pédagogie, multi-contraintes (modéré)
4. Opus · étendu → refonte, algo profond, décision irréversible (lourd ⚠️)
5. Opus · ultrathink → problème ouvert, fort impact, le plus dur (très lourd ⚠️⚠️)
Réflexion dans Claude Code : "réfléchis" < "réfléchis bien" < "réfléchis à fond" < "ultrathink".
Signaler le surdimensionnement autant que le sous-dimensionnement. Ambiguïté → palier 2.

## Définition de "fini"
Tests verts (validateur canonique + contre-exemple + intégrité octaves) · copie relue · mobile 360 px OK · déployé. Toute version de roadmap est petite et déployable.

## Évolutivité (règle permanente)
Schémas versionnés + migrations · décisions consignées avec réversibilité (DECISIONS.md) · idées capturées sans implémentation (IDEES.md) · zéro couplage contenu/moteur. Un choix qui ferme une porte se signale avant d'être codé.

## Première session (bootstrap)
1. `/model` → Opus 4.8. Plan mode.
2. « Lis CLAUDE.md et tous les docs/. Propose le plan détaillé de la v3.0, fichier par fichier. N'écris pas de code avant validation. »
3. Valider → Sonnet 4.6 pour l'exécution.

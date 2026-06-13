# DECISIONS — journal des décisions (ADR léger)

Format : contexte → décision → réversibilité. Toute décision structurante prise en session Claude Code s'ajoute ici (3-5 lignes max). C'est ce qui permet au projet de changer d'avis proprement.

## D-001 · Vanilla ES modules, pas de framework
Contexte : un seul mainteneur (orchestrateur, pas dev), app à longue vie. Décision : Vite + JS vanilla en modules. Réversibilité : moyenne — le modèle de données et les validateurs étant purs, seule l'UI serait à porter si un framework devenait nécessaire. Signal de réouverture : l'UI dépasse ~15 composants interdépendants.

## D-002 · Tone.js pour l'audio
Contexte : Web Audio brut = son cheap, transport/swing à la main. Décision : Tone.js (synthés, transport, swing natifs). Réversibilité : bonne — l'audio est isolé dans engine.js, les données n'en savent rien.

## D-003 · Missions = JSON déclaratif + registre de validateurs
Contexte : éditer du contenu sans toucher au moteur, économiser le contexte Claude Code. Décision : schéma `mission/v1` versionné, validateurs nommés. Réversibilité : élevée — des migrations de schéma sont prévues dès le départ.

## D-004 · Statique, pas de backend, pas de comptes
Contexte : un utilisateur, zéro coût, zéro maintenance serveur. Décision : GitHub Pages + localStorage + export/import JSON. Réversibilité : faible volontairement — c'est un garde-fou (anti-roadmap). Signal de réouverture : un besoin réel multi-appareils que l'export JSON ne couvre plus.

## D-005 · La boucle .mid comme mécanisme de vérification DAW
Contexte : impossible de lire l'état de Live depuis le web. Décision : exercices exportés en .mid, gestes faits dans Live, réimport vérifié par parsing. Réversibilité : sans objet — c'est additif. Extension possible : Max for Live (IDEES).

## D-006 · Progression v2 non migrée
Contexte : reboot technique, 39 missions à refaire de toute façon dans le nouveau moteur. Décision : départ à zéro de la progression ; le CONTENU est migré, pas l'état. Réversibilité : sans objet après v3.0.

## D-007 · Engagement par l'œuvre, braise plutôt que punition
Contexte : motivation durable d'un autodidacte adulte, refus des dark patterns. Décision : Morceau du Mois, Récolte, braise 48 h, zéro culpabilisation. Réversibilité : les mécaniques sont des modules indépendants, ajustables un par un à l'usage réel.

## D-008 · Ouverture multi-genres (sortir du mineur/garage)
Contexte : le contenu initial sur-indexait dubstep/garage/mineur ; Baptiste veut explorer large (hip-hop, EDM, rock, soul…). Décision : le mineur reste la PORTE D'ENTRÉE (oreille déjà formée, mise en confiance), mais la copie, les genres, le Morceau du Mois et les outils tirent activement ailleurs. docs/GENRES.md fait référence. Réversibilité : élevée — c'est une orientation de contenu, ajustable mission par mission.

## D-009 · Assistant Harmonique = moteur pur + explications en données
Contexte : demande centrale (proposer des accords, suggérer des suites, expliquer pourquoi). Risque : une boîte noire qui rend passif. Décision : `harmony.js` pur et testé (théorie), `harmony-why.json` pour les explications reliées aux briques. Chaque suggestion EXPLIQUE et RELIE. Réversibilité : le moteur sert aussi l'Analyste — pièce centrale, mais modulaire.

## D-010 · Live 12 Standard comme cible (pas Suite)
Contexte : Baptiste est sur Standard "pour le moment". Décision : tout le contenu n'utilise que des devices Standard (Drift et non Wavetable, pas de Max for Live). Un addendum Suite est prévu si passage. Réversibilité : élevée et additive — un futur pack débloque les devices Suite sans rien casser.

## D-011 · Matériel traité sous l'angle anti-GAS
Contexte : Baptiste veut comprendre l'importance du matériel. Risque : encourager des achats au lieu de la pratique. Décision : fiches honnêtes, priorité à exploiter l'existant (Novation, casque), un seul achat vraiment transformateur signalé (interface audio/latence). Message récurrent : la frustration se résout par le geste, pas par l'achat. Réversibilité : sans objet (orientation éditoriale).

## D-012 · L'app vise son obsolescence (autonomie comme métrique)
Contexte : le but de Baptiste est l'autonomie, pas la rétention. Décision : suivre localement les signes d'émancipation (usage spontané des outils, exports, dépôts Analyste) et les célébrer ; l'app s'efface à mesure qu'il progresse. Réversibilité : sans objet — c'est une valeur, pas une feature isolée.

## D-013 · Deux carnets distincts (Briques ≠ Techniques)
Contexte : Baptiste veut des petites techniques de sioux AU QUOTIDIEN, distinctes des briques de théorie. Décision : deux objets séparés, deux visuels différents (ivoire pour les briques, kraft/graphite pour les techniques), deux carnets. Jamais mélangés. Les briques se GAGNENT (mission réussie) ; les techniques se COLLECTENT (conseil du jour lu, apparition contextuelle). Réversibilité : élevée, purement éditoriale.

## D-014 · Principe anti-usine-à-gaz comme invariant de design
Contexte : risque réel que l'accumulation de features (Assistant, Analyste, Techniques, Boîte, Morceau du Mois…) rende l'app oppressante. Décision : "sobre par défaut, profond à la demande" devient un invariant au même titre que MIDI-first. L'accueil ne montre jamais plus de 3-4 choses. Toute nouvelle feature se teste par "mon œil peut-il s'y reposer au premier regard ?" Si non : cacher derrière un tap. Réversibilité : c'est une contrainte de design, pas une feature — permanente.

## D-015 · Trois modèles seulement (Haiku / Sonnet / Opus)
Contexte : Fable 5 retiré hors des États-Unis. Décision : le routage se fait désormais entre Haiku 4.5 (chores mécaniques), Sonnet 4.6 (défaut, ~85 % des sessions), et Opus 4.8 (architecture, refonte, moteur harmonique, contenu de fond). Réversibilité : additive — si un nouveau modèle intermédiaire devient disponible, il s'insère dans la table sans rien casser.

## D-016 · Tone.js adopté dès v3.0 (pas de report v3.1)
Contexte : le séquenceur `setInterval` du legacy est fragile (timing dérivant, swing approximatif). Décision : Tone.Transport remplace le setInterval dès v3.0 — timing au sample près, swing natif. Les 8 voix sont portées minimalement (parité sonore) ; le soin des timbres (sub profond, wobble LFO soigné, stab) reste cadré en v3.1 « Le Son ». Réversibilité : bonne — l'audio est isolé dans `engine.js` et `player.js`, les données n'en savent rien.

## D-017 · Hints à 3 paliers écrits dès v3.0 (pas de migration à 1 hint)
Contexte : le legacy a un seul hint par mission. Le schéma `mission/v1` prévoit `hints:[reformulation, indice, quasi-solution]`. Décision : écrire les 3 paliers pour les 39 missions lors de la migration (étape 3b, en Opus 4.8), pas reporter. Le hint legacy (souvent de niveau « indice précis ») est affûté et complété au-dessus (reformulation douce) et en dessous (quasi-solution avec pitches). Réversibilité : sans objet — pure copie pédagogique.

# ENGAGEMENT — la motivation par l'œuvre

Ce que Duolingo a compris : rituel court, objectif visible, retour espacé, progression sentie. Ce qu'on refuse : culpabilisation, vies, pression sociale, XP creux. ATELIER garde la mécanique, change le carburant : **on n'accumule pas des points, on accumule de la musique, de la compétence vérifiée dans Ableton, et de l'autonomie.**

## L'objectif réel (le nord de Baptiste)
Dans quelques mois : ne plus jamais être frustré de "ne pas jouer de musique", et avoir gagné en autonomie à tous les niveaux. Tout le système d'engagement vise ça : pas la rétention pour la rétention, mais l'émancipation. Le meilleur signe de succès = le jour où Baptiste ouvre Ableton SANS ATELIER et fait un morceau. L'app vise sa propre obsolescence joyeuse.

## 1. Le rituel des 7 minutes (boucle quotidienne)
Écran d'accueil = trois gestes, ordre clair, fin nette :
1. **Le défi du jour** (~2 min) — une brique ancienne, retestée sous une forme DIFFÉRENTE (decode, repair, compare, lecture muette). Pioche la plus en retard de la file SRS.
2. **La mission du jour** (~5 min) — la prochaine du chemin. Une seule mise en avant.
3. **La graine** (~30 s, optionnelle) — une contrainte créative du jour dans le studio, qui produit un fragment exportable. Alimente le Morceau du Mois.
Fait = fait. L'app ne réclame jamais une quatrième chose.

## 2. La série et la braise (streak sans tribunal)
Un jour avec ≥1 geste = la flamme tient. Jour manqué → **braise** (visuel assombri) 48 h : un geste rallume, série intacte. Au-delà, la série retombe sobrement ("Série terminée à 23 jours. La prochaine commence quand tu veux."). La braise récompense le retour, ne punit jamais l'absence. Zéro push ; résumé hebdo opt-in maximum.

## 3. Le Morceau du Mois (le fil rouge, HORS ZONE DE CONFORT par construction)
Chaque mois, un canevas dans le studio. **Règle anti-confort : le genre et la tonalité changent chaque mois et sortent volontairement de la zone de Baptiste.** Rotation pensée :
- Mois 1 : Fa mineur, garage/dubstep — SON terrain, pour ancrer le rituel.
- Mois 2 : MAJEUR, house lumineuse — le grand saut hors du sombre.
- Mois 3 : hip-hop / boom bap, accords 7e-9e — le velours, le laid-back.
- Mois 4 : EDM festival majeur, supersaws, le drop.
- Mois 5 : rock / power chords, batterie franche, tonalité ouverte.
- Mois 6 : neo-soul / R&B, accords étendus, groove en retard.
- (puis trap, ambient, funk, techno, jungle… docs/GENRES.md)
Chaque mission complétée dans le mois **débloque ou améliore un élément** du canevas (preset, squelette de drums, voicing). Fin de mois : export .mid multi-pistes → page "Termine-le dans Ableton". L'historique = la discographie de sa progression, et la PREUVE qu'il sait produire dans des genres qu'il n'aurait jamais abordés seul.

## 4. La Récolte (bilan du dimanche)
Page locale, factuelle, 20 s de lecture : briques acquises / consolidées / le geste qui s'est accéléré / une phrase de pont vers Live ("cette semaine, essaie [geste de la dernière brique]"). Inclut un clin d'œil hors-confort : "ce mois tu construis du [genre du mois] — un monde que tu ne touchais pas il y a 30 jours." Pas de confettis, pas de comparaison.

## 5. Paliers (sobres, rares, utiles)
Pas de niveaux numériques. Des seuils nommés, déclenchés par des faits : premier module complet, première boucle .mid vérifiée dans Live, premier Morceau du Mois exporté, premier genre hors-confort terminé, 50 briques solides, premier usage de l'Assistant Harmonique en autonomie. Chaque palier = un écran, une phrase, un déblocage UTILE (un son, un preset de groove, une contrainte de graine, un outil de la Boîte). Le palier donne un outil, jamais un trophée.

## 6. Sons d'interface accordés (le détail qui enseigne)
Tous les feedbacks UI sont musicaux ET dans la tonalité de la mission courante : pose = pluck fondamentale, validation = cadence V→i, erreur = deux conjointes descendantes douces, brique = arpège du module. L'utilisateur baigne dans la justesse sans qu'on le lui dise. (`src/core/ui-sound.js`, dérive de la `scale` courante.)

## 7. Calibration adaptative (la difficulté qui suit)
Télémétrie 100 % locale : essais, temps, hints. 3 réussites du premier coup → proposer un raccourci (sauter une consolidation, jamais une brique neuve) ; 2 échecs nets → mission tampon plus simple, même type, sans nouvelle brique. Cible ~80 % de réussite en ≤2 essais, mesurée, ajustée.

## 8. L'autonomie comme métrique cachée
Au-delà des briques : l'app suit (localement) des signes d'émancipation et les célèbre dans la Récolte — utilisation de la Boîte sans y être poussé, exports vers Live, dépôts dans l'Analyste, graines transformées en fragments gardés. Le message récurrent : "tu te débrouilles de plus en plus seul." C'est ça, la vraie barre de progression.

## 9. Garde-fous absolus
Jamais de compte à rebours, jamais de "tu vas perdre X", jamais de comparaison sociale, jamais d'achat, jamais d'emoji pluie, jamais de culpabilisation. Si une mécanique entre en conflit avec l'apprentissage, l'autonomie ou le respect : l'apprentissage gagne, la mécanique saute.

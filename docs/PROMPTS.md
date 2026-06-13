# PROMPTS — bibliothèque de sessions Claude Code

Copier-coller tel quel. Le modèle conseillé est indiqué. Toujours : plan mode pour le structurel, exécution sur Sonnet.

## S1 · Bootstrap v3.0 (Opus 4.8, plan mode)
Lis CLAUDE.md, docs/ROADMAP.md, docs/CURRICULUM.md, docs/ABLETON.md, docs/ENGAGEMENT.md. Propose le plan détaillé de la v3.0, fichier par fichier, avec l'arborescence complète, l'ordre d'implémentation et les tests prévus. N'écris pas de code avant ma validation.

## S2 · Exécution d'un plan validé (Sonnet 4.6)
Le plan est validé. Implémente l'étape suivante uniquement. Après chaque fichier créé : lance les tests concernés. Quand l'étape est verte : commit avec un message court, puis attends.

## S3 · Migration du contenu legacy (Sonnet 4.6)
Lis docs/CURRICULUM.md (schéma mission/v1). Extrais les missions du module [N] depuis legacy/atelier.html et convertis-les en JSON dans src/data/missions/. Copie reprise TELLE QUELLE. Ajoute le test d'intégrité octaves sur les textes. Ne modifie pas le moteur.

## S4 · Nouvelle mission sur patron existant (Sonnet 4.6)
Lis le schéma dans docs/CURRICULUM.md et une mission existante du même type comme modèle. Crée la mission suivante : [décrire l'idée pédagogique en 2 phrases]. Respecte : révélation différée, brique 4 champs, hints progressifs, convention d'octaves. Ajoute solution canonique + contre-exemple aux tests.

## S5 · Nouveau module de curriculum (Opus 4.8, plan mode)
Lis docs/VISION.md (principes) et docs/CURRICULUM.md. Conçois le module [X] : objectif, 4-6 missions (titre, type, idée, brique), progression interne, ce qui se débloque (unlocks). Présente le plan ; on écrira la copie ensemble avant le JSON.

## S6 · Bugfix (Sonnet 4.6)
Symptôme : [décrire]. Reproduis d'abord par un test qui échoue, puis corrige, puis vérifie que toute la suite passe. Edit minimal, pas de refactor opportuniste.

## S7 · Revue de copie pédagogique (Opus 4.8)
Lis docs/CURRICULUM.md §Règles de copie. Passe en revue les textes de src/data/missions/[fichier] : vocabulaire théorique avant révélation, octaves vs noteName, ton, hints réellement progressifs. Propose les corrections en diff, n'applique qu'après validation.

## S8 · Chore mécanique (Haiku 4.5)
[Renommage / formatage / déplacement] sur [périmètre]. Aucun changement de logique. Vérifie que les tests passent à l'identique.

## S9 · Fin de session (tout modèle)
Résume en 5 lignes : fait / décisions prises (à reporter dans docs/DECISIONS.md si structurantes) / idées surgies (à reporter dans docs/IDEES.md) / prochain pas. Mets à jour ces fichiers si besoin, commit final.

## S10 · Moteur harmonique (Opus 4.8, plan mode)
Lis docs/BOITE-A-OUTILS.md §1 et docs/ABLETON.md §4. Conçois `src/core/harmony.js` : API pure (gammes, accords diatoniques, fonctions tonique/sous-dominante/dominante, voice-leading, tables de transition par genre depuis docs/GENRES.md) et le schéma de `harmony-why.json` (geste harmonique → explication + brique liée + démo). Tests unitaires d'abord (une suite d'accords connue → continuations attendues). N'écris pas l'UI avant validation du moteur.

## S11 · Fiche genre ou outil de la Boîte (Sonnet 4.6)
Lis docs/GENRES.md et docs/BOITE-A-OUTILS.md. Implémente [l'outil / la fiche genre X]. Respecte : chaque résultat EXPLIQUE et RELIE à une brique, tout est jouable et exportable en .mid. Données séparées du moteur.

## S12 · Conseil du jour + Carnet de Techniques (Sonnet 4.6)
Lis docs/TECHNIQUES.md et le schéma dans docs/seeds/techniques-seed.json. Implémente : (1) le Conseil du jour sur l'accueil (une technique par jour, bouton "Essaie", marque comme vue dans le store), (2) la file de distribution (ne pas répéter avant N jours, calibrer sur le depth et le contexte courant). Le Carnet vient après, dans le même ticket. Données dans src/data/techniques/*.json (séparer par domaine).

## S13 · Apparition contextuelle des techniques (Sonnet 4.6)
Lis docs/TECHNIQUES.md §2. Implémente les puces contextuelles : quand l'utilisateur sélectionne le patch 'wobble' → puce lf-01/lf-02, quand il pose un sub ET un mid → eq-04, quand il empile deux fois la même note → la-04, etc. La puce est fermable, non bloquante. La logique de déclenchement vit dans src/ui/studio-tips.js (mapping patch/geste → technique id). Chaque puce ajoutée = un test.

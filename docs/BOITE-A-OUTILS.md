# BOÎTE À OUTILS — les compagnons créatifs

Ce que Baptiste a demandé en premier : non pas des leçons, mais des OUTILS qui le poussent à découvrir, explorer, et arriver à des résultats musicaux satisfaisants tout seul. La Boîte est un onglet à part entière (pas le chemin, pas le studio) : des instruments d'exploration ouverts, sans bonne réponse, où chaque clic produit du son et donne envie du suivant. Tout est jouable, tout est exportable vers Ableton.

## 1. L'ASSISTANT HARMONIQUE (la pièce maîtresse)

Le cœur de la demande. Un outil qui propose, explique, et fait découvrir — jamais un générateur boîte noire. Quatre modes :

### a) "Propose-moi des accords" (la suggestion guidée)
Choisis une tonalité (ou laisse au hasard, ou pioche un genre) → l'outil affiche les 7 accords diatoniques sous forme de pastilles colorées (fonction = couleur : tonique/repos en vert, dominante/tension en ambre, sous-dominante/mouvement en bleu). Tu tapes, ça sonne, ça s'empile dans une timeline. Chaque accord montre son nom ET son degré (Am = i, F = VI…).

### b) "Termine mon accord / ma suite" (le moteur de continuation)
Tu poses 1, 2 ou 3 accords → l'outil propose 3 à 5 suites possibles, CLASSÉES par caractère nommé, pas par probabilité brute :
- **L'évidence** (la résolution attendue, le repos)
- **La tension** (ça repart, ça n'est pas fini)
- **La surprise** (un emprunt, une couleur inattendue mais juste)
- **Le cliché du genre** (ce que ferait un morceau de [genre choisi])
Chaque proposition est jouable d'un tap et **explique son geste en une phrase** (voir mode c).

### c) "Pourquoi ?" (le moteur d'explication — l'âme de l'outil)
Le différenciateur absolu. Chaque suggestion est accompagnée d'un POURQUOI court, concret, sonore :
- "Après le V, l'oreille RÉCLAME le i : la sensible (Sol#) est à un demi-ton du La, elle veut y tomber. Écoute le manque." [bouton : entendre la tension seule]
- "Le VI après le i, c'est le même air qui s'assombrit : deux notes communes, une qui glisse. Confort garanti."
- "Cet accord n'est pas dans la gamme — c'est un emprunt au mode parallèle. Il colore sans casser. La pop l'adore."
Le POURQUOI relie toujours à une brique du chemin (cliquable). Si la brique n'est pas acquise : "tu viens de toucher un truc que la mission X explique en entier."

### d) "Réharmonise" (l'exploration avancée, débloquée plus tard)
Tu poses une mélodie simple (ou l'outil en propose une) → il montre 3 jeux d'accords différents dessous, du plus sage au plus audacieux, chacun changeant l'émotion de la même mélodie. La preuve vivante que l'harmonie est un choix.

Implémentation : `src/core/harmony.js` (théorie pure : gammes, accords, fonctions, voice-leading, tables de transition par genre — testable unitairement, zéro audio). L'explication vit dans `src/data/copy/harmony-why.json` : un dictionnaire de gestes harmoniques → phrase + brique liée + démo audio. Extensible : ajouter une règle = ajouter une entrée.

## 2. LE GÉNÉRATEUR DE GRAINES (l'anti-page blanche)

Un bouton "Donne-moi un point de départ". Produit une contrainte créative + un canevas pré-rempli minimal, dans un genre et une couleur tirés (ou choisis). Exemples : "Hip-hop 88 BPM, Mi mineur, voici 4 accords lo-fi et un swing — fais la mélodie", "House 124, voici un beat four-on-the-floor et une bassline en La — trouve le stab". Jamais une page vide. Toujours exportable. Relié au Morceau du Mois.

## 3. LE TROUVEUR DE GAMME ("ça sonne comment si...")
Tu choisis une racine et tu balaies les gammes/modes d'un menu : à chaque sélection, une courte phrase mélodique se joue automatiquement dans cette couleur, et une étiquette dit l'usage ("majeure : pop, house lumineuse", "dorien : jungle, funk sombre", "phrygien dominant : trap orientale, metal", "mixolydien : rock, funk", "pentatonique mineure : hip-hop, blues, le filet de sécurité — aucune fausse note possible"). Exploration pure de couleurs.

## 4. LE MÉTRONOME INTELLIGENT / TROUVEUR DE TEMPO
Tape un rythme sur l'écran (ou sur ton Novation) → l'outil détecte le BPM et te dit dans quels genres ce tempo vit ("~140 : dubstep half-time, drum'n'bass, trap double-time", "~120-128 : house, techno", "~85-95 : hip-hop, boom bap, trip-hop"). Démystifie le tempo comme territoire de genre.

## 5. LA TABLE DE CORRESPONDANCE DES GENRES (docs/GENRES.md vivant)
Un tableau interactif : choisis un genre → tempo type, gammes favorites, progressions signature (jouables), structure rythmique, sons caractéristiques, et 2-3 gestes Ableton pour s'en approcher. Le pont entre "j'aime ce style" et "je sais par où commencer". Couvre large (voir GENRES.md) : hip-hop, house, techno, EDM, trap, rock, soul/R&B, ambient, jungle/DnB, garage, disco/funk.

## 6. LE DÉ CRÉATIF (quand tu es bloqué OU trop confortable)
Un bouton qui jette une contrainte aléatoire pour casser les habitudes : "compose sans la tonique", "uniquement 3 notes", "change de tonalité au milieu", "rythme impair (5 temps)", "vole la progression du Morceau du Mois mais en majeur". L'outil qui te force hors de la zone de confort à la demande — frère du Morceau du Mois (docs/ENGAGEMENT.md).

## Principe transversal de la Boîte
Aucun outil ne donne juste un résultat : chacun EXPLIQUE et RELIE à une brique. La Boîte n'est pas un raccourci qui rend bête — c'est une loupe qui rend curieux. Test de chaque outil : "après l'avoir utilisé, est-ce que Baptiste comprend mieux et a envie d'en faire plus, ou est-ce qu'il a juste un résultat ?" Si le second : ajouter le POURQUOI.

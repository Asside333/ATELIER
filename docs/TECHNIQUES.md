# TECHNIQUES — les gestes de sioux, le carnet, le conseil du jour

Baptiste veut, au-delà des leçons, des PETITES TECHNIQUES pêchées partout : LFO, sidechain, compression, linker deux pistes, mille astuces qui font "ah, c'est donc ça". Et il les veut au jour le jour, par surprise, jusqu'à ce que la production ne l'impressionne plus et devienne un jeu. Ce document définit le contenu (un vivier de techniques) et surtout le SYSTÈME qui les distribue sans transformer l'app en usine à gaz.

## Briques vs Techniques (distinction nette)

- **Brique** = un concept de théorie musicale (l'octave, le dorien, la cadence, le swing). Se GAGNE en réussissant une mission du chemin. C'est du savoir.
- **Technique** = un geste de production (le sidechain, le split sub/mid, le resampling, le delay pointé). Se COLLECTE sans mission, par le conseil du jour et l'apparition contextuelle. C'est du savoir-faire, du métier.

Les deux carnets cohabitent : le carnet de Briques (théorie, ivoire) et le **Carnet de Techniques** (métier, une autre matière visuelle — pense à des fiches d'atelier, kraft/graphite plutôt qu'ivoire). On ne mélange pas. Les techniques sont plus légères, plus nombreuses, sans enjeu de réussite : ce sont des secrets qu'on ramasse.

## Le Conseil du jour (le cœur du système, sur l'écran d'accueil)

Une seule technique par jour, 30 secondes de lecture, sur l'accueil, à côté du rituel des 7 minutes (docs/ENGAGEMENT.md §1). Forme : un titre accrocheur, le geste en 1-2 phrases, le geste Ableton exact, le POURQUOI court, et un bouton **"Essaie maintenant"** (ouvre le studio préchargé pour tester le truc, ou envoie un .mid prêt vers Live). Lu = la technique entre dans le Carnet de Techniques. Jamais d'obligation : c'est un cadeau quotidien, pas un devoir.

Calibrage : le conseil pioche dans le vivier en tenant compte du niveau (champ `depth` 1/2/3) et de ce que Baptiste touche en ce moment (s'il bosse la basse, privilégier les techniques de basse). La difficulté monte avec lui (docs/ENGAGEMENT.md §7) : d'abord des évidences libératrices, puis du vrai sioux.

## L'apparition contextuelle (enseigner dans le flux)

Le vrai génie : la bonne technique au bon moment, sans la chercher. Exemples :
- Il sélectionne le son **wobble** dans le studio → une puce discrète : "◆ Astuce : le wobble, c'est un LFO sur le filtre. Tu peux changer sa vitesse." [ouvre la technique]
- Il pose un **sub** ET un **mid** sur deux pistes → "◆ Sépare-les à l'EQ : sub sous 120 Hz, mid au-dessus. Ils arrêtent de se marcher dessus."
- Il met deux fois la **même note** sur deux pistes → "◆ Détune-en une de quelques cents : largeur instantanée."
- Il empile un **gros accord** → "◆ Un high-pass léger dessus libère la place pour la basse."
La puce est toujours optionnelle, toujours fermable, jamais bloquante. L'app glisse le savoir-faire dans le geste, comme un pote qui regarde par-dessus l'épaule.

## Le Carnet de Techniques (la caverne)

Onglet (ou section de la Boîte) : toutes les techniques collectées, rangées par domaine (sidechain, EQ, LFO, reverb/delay, arrangement, groove, sound-design, workflow Ableton, état d'esprit), filtrables par profondeur. Chaque fiche : titre, geste, Ableton, pourquoi, brique liée si pertinent, et bouton "Essaie". Recherche par mot. C'est le versant "fouille et c'est une vraie boîte à outils" : sobre en surface (l'accueil ne montre qu'UN conseil), profond quand on ouvre le carnet.

## Le principe anti-usine-à-gaz (vaut pour TOUTE l'app)

Règle d'or de distribution : **calme par défaut, profond à la demande.** L'accueil ne montre jamais plus de 3-4 choses + un conseil. Les 50+ techniques vivent dans le carnet, pas sur la surface. Une technique ne s'impose jamais : elle se propose, se ferme, se retrouve. Test de chaque écran : "mon œil peut-il s'y reposer ?" Si l'écran impressionne ou fatigue au premier regard → trop chargé, on cache de la profondeur derrière un tap. La complexité est une récompense pour qui fouille, pas une barrière à l'entrée.

## Le ton (faire de la production un jeu, la démystifier)

Chaque technique enlève un peu de mystère. Fil rouge de la copie : **"ce truc qui t'impressionnait n'est qu'un geste."** Le sidechain n'est pas de la magie de pro, c'est un compresseur qu'un kick déclenche. La largeur stéréo, c'est un détune. La basse de fou, c'est deux saws désaccordés. Ton léger, joueur, complice — jamais professoral. Tout est réversible, rien ne casse, tout se teste sans risque. L'objectif : que Baptiste arrête d'être impressionné et commence à jouer.

## Données et implémentation

Le vivier vit dans `src/data/techniques/*.json` (par domaine) — voir docs/seeds/techniques-seed.json pour ~45 techniques prêtes, exactes, et compatibles **Live 12 Standard** (aucune n'exige Suite/Max for Live). Schéma `technique/v1` : `{id, domain, depth (1-3), title, tip, abl, why, brique?, try?}`. Le champ `try` décrit comment précharger le studio ou quel .mid envoyer pour le bouton "Essaie". Ajouter une technique = ajouter une entrée JSON, jamais toucher au moteur. État de collection dans le store (`techniquesSeen[]`), file du conseil du jour gérée comme le SRS (docs/CURRICULUM.md §SRS) pour ne pas répéter trop tôt.

## Évolutivité
Le vivier grandit sans limite (c'est juste du JSON). Certaines techniques avancées pourront devenir des missions `daw` vérifiées par la boucle .mid (docs/ABLETON.md) quand elles méritent un exercice. Les domaines peuvent s'ajouter (mixage, mastering léger, voix…). Idées de techniques futures → docs/IDEES.md.

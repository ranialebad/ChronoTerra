# ChronoTerra

> **Tu ne choisis pas le futur. Tu verrouilles une trajectoire.**

ChronoTerra est un jeu 2D narratif et interactif consacré aux choix, au libre arbitre et aux conséquences de long terme des décisions humaines sur l’environnement et la société.

Le joueur traverse plusieurs grandes périodes historiques, de la Préhistoire à un futur en crise. À chaque étape, ses décisions modifient progressivement trois dimensions du monde : le CO₂, la biodiversité et le bien-être. Mais ChronoTerra ne repose pas uniquement sur des choix narratifs : à mesure que le temps avance, le joueur perd progressivement le confort de pouvoir s’arrêter, réfléchir et choisir. Les décisions laissent place à l’urgence, puis à la réaction et, finalement, à la gestion des conséquences.

Le projet a été développé dans le cadre du cours de développement de jeux vidéo 2D.

---

## 1. Idée du jeu

L’idée de départ de ChronoTerra était de travailler sur trois notions : **le choix, le libre arbitre et les conséquences**.

Le jeu cherche à provoquer une forme de prise de recul sur la situation environnementale actuelle : comment en sommes-nous arrivés là ? Plutôt que de commencer directement dans le présent, ChronoTerra remonte à plusieurs grandes étapes de l’histoire humaine afin de montrer que la situation actuelle ne résulte pas d’une décision unique, mais d’une accumulation de transformations, d’arbitrages et de choix successifs.

La progression suit ainsi plusieurs périodes considérées comme des moments de bascule :

**Préhistoire → Révolution agricole → Antiquité → Révolution industrielle → Présent → Futur**

Chaque période transforme les conditions dans lesquelles les décisions suivantes devront être prises.

La phrase centrale du jeu, **« Tu ne choisis pas le futur. Tu verrouilles une trajectoire. »**, résume cette idée. Les décisions ne sont jamais totalement isolées. Même lorsqu’un choix semble limité à une situation immédiate, il contribue à façonner les possibilités disponibles plus tard.

Le système de boucles temporelles prolonge cette logique. Le joueur peut revenir en arrière, mais il ne bénéficie pas d’un véritable *reset*. Les boucles s’accumulent et certaines conséquences persistent. Recommencer permet donc d’apprendre, mais pas d’effacer complètement ce qui s’est produit.

À mesure que ces boucles se multiplient, la pression augmente. Le joueur dispose de moins en moins de marge et doit agir dans un monde déjà dégradé par les trajectoires précédentes.

---

## 2. Influences

L’une des principales influences de ChronoTerra est **Black Mirror: Bandersnatch**, notamment pour sa structure reposant sur les choix, les ramifications narratives et les boucles.

Ce qui m’a particulièrement intéressée dans Bandersnatch est la question du libre arbitre : le spectateur a l’impression de décider, tout en découvrant progressivement que sa liberté s’exerce à l’intérieur d’un système déjà construit.

Cette réflexion a également été nourrie par mon intérêt pour les travaux de **Schopenhauer sur le libre arbitre** et, plus largement, par la question suivante : dans quelle mesure sommes-nous réellement libres de nos choix lorsque ceux-ci sont conditionnés par ce qui les précède ?

N’étant pas moi-même une joueuse régulière, je ne souhaitais pas construire ChronoTerra autour de mécaniques complexes ou particulièrement originales. Les mini-jeux utilisent volontairement des formes de gameplay simples et reconnaissables : attraper ou éviter des objets, se déplacer dans un espace, esquiver des menaces ou gérer des ressources.

L’objectif n’était pas d’inventer de nouvelles formes de jeu, mais de réutiliser des mécaniques familières afin de leur donner un sens différent dans le contexte du projet.

---

## 3. Public cible

ChronoTerra s’adresse principalement à un **jeune public, notamment aux préadolescents et adolescents qui commencent à se familiariser avec les enjeux environnementaux et politiques**.

Le jeu ne demande pas de connaissances préalables particulières sur le changement climatique ou les sciences politiques.

Le ton reste volontairement accessible, mais il ne cherche pas à rendre la crise environnementale confortable. L’humour, l’ironie et le cynisme permettent d'aborder des sujets parfois lourds sans recourir à une représentation graphique violente.

L’objectif est notamment de créer de la **frustration**, de la pression et parfois un sentiment d’injustice. Ces émotions font partie de l’expérience : elles doivent amener le joueur à se demander pourquoi les choix deviennent progressivement aussi difficiles.

ChronoTerra se situe donc entre le **jeu de sensibilisation**, le **jeu critique** et l’outil de **médiation scientifique et sociale**.

---

## 4. Objectif de médiation scientifique et SHS

ChronoTerra ne cherche pas seulement à montrer les conséquences physiques du changement environnemental.

Le projet s’intéresse surtout aux dimensions **politiques, sociales et institutionnelles** de la transition écologique.

Un des concepts centraux du jeu est celui de **dépendance au sentier (*path dependence*)** : les choix effectués dans le passé influencent les possibilités disponibles dans le futur. Ils ne rendent pas nécessairement une trajectoire totalement irréversible, mais ils peuvent rendre certaines alternatives beaucoup plus difficiles, plus coûteuses ou moins acceptables.

Cette idée est liée à celle de **verrouillage sociotechnique**. Les infrastructures, les modèles économiques, les comportements et les institutions construits autour d’un système peuvent créer leur propre inertie. Plus le système se développe, plus le changement devient difficile.

ChronoTerra aborde également :

- les compromis politiques ;
- l’acceptabilité sociale des politiques environnementales ;
- le lobbying et la dilution de décisions politiques ;
- le greenwashing ;
- la répartition des coûts de la transition ;
- la justice environnementale et intergénérationnelle ;
- la gestion politique des crises et de la pénurie.

Le jeu cherche ainsi à montrer que la transition écologique **n’est pas uniquement un problème scientifique ou technologique**. Elle implique des décisions collectives, des rapports de pouvoir, des conflits d’intérêts et des arbitrages sur la manière dont les coûts et les bénéfices sont répartis.

ChronoTerra ne propose volontairement pas une politique qui serait présentée comme « la bonne solution ».

Chaque décision peut améliorer certaines dimensions du système tout en en détériorant d’autres. En revanche, le jeu insiste sur une idée : **retarder l’action réduit progressivement l’espace dans lequel les choix peuvent encore être faits**.

Cette approche est directement liée aux sciences politiques, qui permettent d’aborder la transition environnementale non seulement comme une transformation technique, mais aussi comme une question de gouvernance, de décision collective et de pouvoir.

---

## 5. Mécaniques de jeu

ChronoTerra alterne entre narration à choix et plusieurs formes de mini-jeux.

Au début, le joueur dispose du temps nécessaire pour lire une situation, comparer plusieurs options et prendre une décision.

Mais cette capacité diminue progressivement.

La structure du gameplay suit ainsi une évolution volontaire :

**réfléchir → choisir → sélectionner → négocier → esquiver → survivre → gérer la pénurie**

Cette progression accompagne l’histoire racontée par le jeu.

Trois indicateurs suivent en permanence l’état du monde :

- **CO₂**
- **Biodiversité**
- **Bien-être**

Les décisions du joueur peuvent avoir des effets différents, voire contradictoires, sur ces trois dimensions.

Le jeu utilise également un système de **boucles temporelles**. Certaines défaites ramènent le joueur vers une période antérieure, mais les boucles s’accumulent et influencent progressivement la difficulté et l’état général du monde.

---

## 6. Lien entre mécaniques et concepts

| Mécanique | Signification dans ChronoTerra |
| --- | --- |
| **Boucles temporelles** | Les erreurs permettent d’apprendre, mais le passé ne disparaît jamais totalement. |
| **Jauges CO₂ / biodiversité / bien-être** | Une décision peut produire un bénéfice sur une dimension tout en entraînant un coût ailleurs. |
| **Choix historiques** | Chaque décision contribue à créer les conditions dans lesquelles les décisions suivantes devront être prises. |
| **Industrialisation – blocs qui tombent** | Le rythme s’accélère et le joueur ne contrôle plus entièrement ce qui arrive. Il doit sélectionner et réagir. |
| **Couloirs du pouvoir** | Une politique peut être négociée, affaiblie, détournée ou vidée de sa substance pendant le processus institutionnel. |
| **Présent sous pression** | Lorsque l’action arrive tardivement, le joueur ne prend plus réellement le temps de décider : il réagit à une succession de menaces. |
| **Triage du futur** | Lorsque les marges de manœuvre ont presque disparu, gouverner ne consiste plus seulement à éviter les dommages, mais à répartir des ressources devenues insuffisantes. |
| **Cannibaliser un abri** | Maintenir une partie du système peut nécessiter de produire explicitement des perdants et pose la question de la répartition de la pénurie. |
| **Difficulté croissante** | La perte progressive de contrôle n’est pas seulement racontée : elle est directement ressentie à travers le gameplay. |

Le passage progressif de la décision à la réaction est un élément central du projet.

ChronoTerra commence par demander au joueur : **« Que veux-tu faire ? »**

À la fin, la question devient davantage : **« Que peux-tu encore faire ? »**

---

## 7. Contrôles

| Séquence | Contrôles |
| --- | --- |
| **Narration et choix** | Clic |
| **Industrialisation** | `← / →` ou `A / D` pour se déplacer |
| **Couloirs du pouvoir** | `WASD` ou flèches pour bouger, `Shift` pour courir, `Espace` pour le dash, `E` pour interagir |
| **Présent sous pression** | `WASD` ou flèches pour se déplacer, `Shift` pour un mouvement précis, `Espace` pour le dash |
| **Triage** | Clic pour sélectionner une ressource, glisser-déposer vers un abri, clic sur un abri pour le sélectionner |

---

## 8. Direction visuelle

L’esthétique minimale de ChronoTerra résulte en partie des contraintes techniques du développement, mais elle est également devenue cohérente avec le propos du jeu.

Le projet ne cherche pas à impressionner le joueur par un environnement très détaillé, coloré ou spectaculaire.

L’interface est volontairement sobre, géométrique et parfois presque froide. Cette simplicité permet de créer une atmosphère progressivement plus oppressante, tout en laissant les décisions et les systèmes occuper une place centrale.

Les formes et les couleurs fonctionnent davantage comme des **signes** que comme des représentations réalistes.

L’état du monde est également intégré à l’environnement visuel. Lorsque le niveau de CO₂ augmente et que les boucles s’accumulent, l’arrière-plan devient progressivement plus sombre.

Cette évolution permet de rendre visible la détérioration de la trajectoire sans devoir constamment l’expliquer par du texte.

La sobriété visuelle n’a donc pas été pensée comme une fin en soi. Elle résulte d’un équilibre entre les contraintes de réalisation et la volonté de créer une expérience dans laquelle le joueur se concentre davantage sur ses choix, les indicateurs et leurs conséquences.

---

## 9. Technologies utilisées

ChronoTerra a été développé en **JavaScript** avec **Kaboom.js**.

Kaboom.js faisait partie des outils proposés dans le cadre du cours. Sa relative simplicité et son accessibilité ont été particulièrement adaptées à ce projet, réalisé sans expérience préalable en programmation.

Le jeu fonctionne directement dans le navigateur à partir d’une page HTML.

Technologies principales :

- JavaScript
- Kaboom.js
- HTML
- Web Audio API pour certains effets sonores simples

Les éléments visuels du jeu sont principalement générés directement par le code, sans dépendre d’une banque importante d’assets graphiques externes.

---

## 10. Références scientifiques

Les références ayant servi à documenter les concepts environnementaux et SHS du projet seront ajoutées ici.

> À compléter : climat, biodiversité, path dependence, carbon lock-in, transition écologique, acceptabilité sociale et justice environnementale.

---

## 11. Jouer

La version jouable de ChronoTerra sera disponible sur itch.io.

**Lien : à ajouter après publication**

---

## Note sur les données du jeu

Les valeurs associées au CO₂, à la biodiversité, au bien-être, aux choix et aux différentes mécaniques sont des **paramètres de game design**.

Elles servent à rendre visibles les relations entre décisions, arbitrages et trajectoires dans le cadre du jeu. Elles ne constituent pas un modèle scientifique prédictif de l’évolution réelle du climat, de la biodiversité ou des sociétés.

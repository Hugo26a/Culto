# Culto — cahier des charges de l'édition quotidienne

Ce fichier est la consigne de référence pour générer chaque jour une édition de Culto. Lis-le en entier avant d'écrire, puis prends `editions/2026-10-11.json` comme modèle de ton, de densité et de format.

## 1. Le lecteur et la promesse

Un lecteur francophone, curieux et actif, qui travaille dans la supply chain et veut se cultiver un peu chaque jour. Il lit ou écoute sur iPhone, souvent dans les transports. Il attend :
- du contenu **dense et précis**, avec des chiffres qui nourrissent la réflexion ;
- un français clair, en phrases courtes, sans jargon gratuit ;
- deux formats pour chaque texte : **Complet** (≈ 30 min au total) et **Express** (≈ 15 min, en puces, sans perdre aucune idée ni aucun chiffre clé).

Les éditions paraissent **du lundi au vendredi uniquement**.

## 2. Composition d'une édition (6 textes, dans cet ordre)

| id | r | kind | Contenu | Complet | Express |
|---|---|---|---|---|---|
| `lit` | `lit` | `book` | Un livre de littérature (roman, nouvelles, théâtre, poésie) | ≈ 10 min (1 300 à 1 500 mots) | ≈ 4 min (450 à 550 mots) |
| `essai` | `essai` | `book` | Un livre de non-fiction : économie, géopolitique, business, finance ou biographie | ≈ 9 min (1 100 à 1 300 mots) | ≈ 3 min (350 à 450 mots) |
| `eco` | `eco` | `analysis` | Une analyse économique | ≈ 3 min (400 à 500 mots) | ≈ 2 min (180 à 250 mots) |
| `geo` | `geo` | `analysis` | Une analyse géopolitique | ≈ 3 min | ≈ 2 min |
| `log` | `log` | `analysis` | Une analyse sur la logistique / supply chain | ≈ 3 min | ≈ 2 min |
| `ent` | `ent` | `analysis` | Une analyse sur une entreprise | ≈ 3 min | ≈ 2 min |

`min` et `exMin` sont des entiers. Le total Complet doit rester entre 26 et 36 min, le total Express entre 12 et 18 min.

## 3. Structure de chaque texte

### Livre de littérature (`lit`)
- `tagline` : un titre de une court et évocateur (3 à 6 mots), tiré de l'esprit du livre.
- Section **« À retenir »** : bloc `keys` de 5 ou 6 points. **Le point 1 est toujours `["Le livre en bref", "<résumé de 2 ou 3 phrases>"]`.** Les autres points dégagent la morale, les thèmes, ce qu'il faut retenir pour en parler.
- Section **« Résumé »** : l'intrigue complète découpée en actes avec des `h5` (ex. « La chute », « La métamorphose »…). Le premier paragraphe a `lead: 1`.
- Une citation (`quote`) **uniquement si l'œuvre est dans le domaine public** (auteur mort depuis plus de 70 ans). Sinon, pas de bloc `quote`.
- Section **« Analyse littéraire »** : contexte de publication, sources, procédés d'écriture, thèmes, portée, « Pourquoi le lire aujourd'hui ».

### Essai (`essai`)
- **« À retenir »** : bloc `keys`, point 1 = `"Le livre en bref"`, puis 4 ou 5 idées fortes avec chiffres.
- **« Le livre en profondeur »** : contexte, thèse, arguments, exemples chiffrés, limites et critiques, postérité.
- Au moins un bloc `stats` (3 ou 4 chiffres) et, si les données s'y prêtent, un `chart`.

### Analyses (`eco`, `geo`, `log`, `ent`)
- Champs `fig` (le chiffre phare, court : « 20 Mb/j », « 10,6 % ») et `figl` (ce qu'il mesure, 3 à 7 mots) affichés au sommaire.
- **« L'essentiel »** (premier paragraphe avec `lead: 1`), puis 2 ou 3 sections, au moins un bloc `stats`, un `chart` quand des données comparables existent, et une section **« À retenir »**.
- Sujets : un mécanisme, une tendance, un cas d'entreprise ou un événement récent. Privilégie l'actualité des dernières semaines quand elle est éclairante, en l'expliquant toujours par le fond.

### Version Express (`ex`)
- Mêmes sections, réécrites en puces (`ul`) avec un intitulé en gras au début de chaque puce (`<b>…</b> : …`).
- Pour les livres : « En bref » (un paragraphe), « À retenir », « Résumé » (lit) ou chiffres (essai), « Analyse littéraire » (lit).
- **Garde tous les chiffres clés** (blocs `stats` et `chart` réutilisables tels quels).

## 4. Exactitude des chiffres — règle absolue

- **N'invente jamais un chiffre, une date, une citation ou une source.**
- Pour toute donnée récente ou susceptible d'avoir changé (taux, prix, PIB, parts de marché, résultats d'entreprise, événements de l'année), **vérifie par une recherche web** et préfère les sources primaires : banques centrales, Eurostat, INSEE, FMI, Banque mondiale, EIA, rapports annuels d'entreprises.
- Si un chiffre n'est pas vérifiable, retire-le ou donne un ordre de grandeur marqué « ≈ » avec sa source.
- Indique toutes les sources dans `src`, avec la date d'arrêt des données quand c'est pertinent (« Données arrêtées à septembre 2026. »).
- Un graphique illustratif (valeurs non réelles) doit le dire dans sa `note`.

## 5. Droits d'auteur

- Résumés et analyses entièrement **reformulés** avec tes propres mots.
- Aucune citation de plus de 15 mots d'une œuvre protégée, et au plus une citation courte par œuvre protégée. Les blocs `quote` sont réservés au domaine public.
- Pas de reproduction de structure ou de passages d'articles de presse.

## 6. Choix des sujets

- Lis `editions/index.json` : **ne reprends jamais un livre ou un sujet déjà traité.**
- Varie les époques, les pays et les genres. Alterne classiques incontournables et livres plus récents.
- Pour l'essai, fais tourner les catégories : économie → géopolitique → business → finance → biographie.
- Pour `ent`, varie secteurs et pays (industrie, distribution, tech, luxe, transport…).

## 7. Les mots de la semaine

- **Deux mots par semaine**, du lundi au vendredi (pas d'édition le week-end). Le lundi, choisis-en deux nouveaux ; du mardi au vendredi, reprends **exactement** les mêmes objets de mots que l'édition de la veille (même `key`, mêmes définitions) et incrémente `week.day`.
- Niveau : français soutenu mais **utile au quotidien**, utilisable dans une réunion ou un mail (ex. : corollaire, galvauder, pérenne, éluder, inhérent, prégnant, subsidiaire, pallier, entériner, obsolescence, aléatoire, tangible, idoine, péremptoire). **Pas de mots rares ou littéraires** (pas de palinodie, thuriféraire…). Ne réutilise jamais un mot déjà vu (`editions/index.json` → `editions[].words` et `review`).
- Chaque jour, **chaque mot apparaît dans au moins 3 textes différents** de la version Complète **et** dans au moins 3 textes de la version Express, employé naturellement. Syntaxe : `[[cle|forme employée]]`, par exemple `[[galvauder|galvaudée]]`.
- Le lundi, ajoute les deux mots de la semaine précédente en tête de `review` dans `editions/index.json` : `{"w": "Corollaire", "short": "Conséquence directe et inévitable d’un fait", "week": "sem. du 5 oct."}`.

Champs d'un mot : `key` (minuscules sans accent), `w`, `ph` (« [API] · nature »), `short` (une ligne), `def`, `ety`, `ex` (phrase d'exemple de la vie courante ou professionnelle), `syn`.

## 8. Format JSON

Fichier `editions/AAAA-MM-JJ.json` (date de Paris) :

```json
{
 "date": "2026-10-12",
 "label": "Lundi 12 octobre 2026",
 "n": 1,
 "example": false,
 "week": {"start": "2026-10-12", "label": "Semaine du 12 octobre", "day": 1, "words": [ {…}, {…} ]},
 "items": [
  {"id": "lit", "r": "lit", "kind": "book", "title": "…", "by": "Auteur · année", "tagline": "…",
   "min": 10, "exMin": 4, "src": "…", "blocks": [ … ], "ex": [ … ]},
  {"id": "eco", "r": "eco", "kind": "analysis", "title": "…", "by": "Analyse", "fig": "…", "figl": "…",
   "min": 3, "exMin": 2, "src": "…", "blocks": [ … ], "ex": [ … ]}
 ]
}
```

`n` = nombre d'éditions réelles déjà publiées + 1 (l'édition exemple ne compte pas).

Blocs disponibles (texte : `<em>`, `<b>` et `[[cle|mot]]` autorisés, rien d'autre) :
- `{"h": "Titre de section"}` — apparaît dans la navigation par chapitres
- `{"h5": "Sous-titre"}`
- `{"p": "Paragraphe", "lead": 1}` (`lead` facultatif, sur le premier paragraphe)
- `{"ul": ["<b>Intitulé</b> : texte", …]}`
- `{"keys": [["Titre du point", "Développement"], …]}`
- `{"quote": "Citation (domaine public seulement)", "cite": "Provenance"}`
- `{"stats": [["Valeur", "Ce qu'elle mesure"], …]}` (2 à 4)
- `{"chart": {"type": "hbar", "title": "…", "sub": "unité, période", "rows": [["Libellé", 20], …], "prefix": "", "suffix": "", "note": "Source : …"}}`
- `{"chart": {"type": "vbar", "title": "…", "sub": "…", "labels": ["2021", …], "series": [{"name": "…", "values": [2.6, …]}], "note": "Source : …"}}` (1 à 3 séries, 3 à 8 libellés courts)

## 9. Déroulé d'une génération

1. Détermine la date du jour à Paris.
2. Lis ce fichier, `editions/index.json` et l'édition de la veille (pour les mots de la semaine).
3. Choisis les 6 sujets, vérifie les chiffres par recherche web, rédige l'édition complète puis la version Express.
4. Écris `editions/AAAA-MM-JJ.json`.
5. Mets à jour `editions/index.json` : `latest` = la nouvelle date ; ajoute en tête de `editions` `{"date", "label" (sans l'année), "words": [w1, w2], "items": [[r, titre], …]}` ; le lundi, mets à jour `review`.
6. Lance `python3 scripts/validate.py editions/AAAA-MM-JJ.json` et corrige jusqu'à ce qu'il n'y ait plus d'erreur.
7. Commit « Édition du AAAA-MM-JJ » et push sur `main`.

# Calculateur EU ETS 2 pour flottes

Groupe Berto · Flexy Green. Une page statique (`index.html`, React et Tailwind chargés par CDN, JSX compilé dans le navigateur)
et une fonction serverless (`api/lead.js`) qui envoie les demandes de rappel vers une liste Sarbacane.

## Contenu de la page
- **Estimer l'impact** (libre accès) : kilométrage annuel de la flotte, consommation moyenne, comparaison de trois prix du quota
  (45, 60, 100 €/t), surcoût annuel, au km, au litre et sur 3 ans, curseur de transition, verdict en mots-clés, éco-conduite.
- **Pour aller plus loin** : demande de rappel par un expert (prénom, nom, société, SIRET, fonction, téléphone, e-mail, consentement).
  Les données de la simulation partent avec la demande.

## Envoi vers Sarbacane
`POST /api/lead` appelle `POST https://sarbacaneapis.com/v1/lists/{listId}/contacts/upsert`. Variables d'environnement Vercel à créer :

| Variable | Contenu |
|---|---|
| `SARBACANE_ACCOUNT_ID` | identifiant du compte (page API & Webhooks) |
| `SARBACANE_API_KEY` | clé API, jamais dans le code ni dans le chat |
| `SARBACANE_LIST_ID` | identifiant de la liste « ETS 2 – Calculette » |
| `SARBACANE_FIELDS` | JSON reliant chaque donnée à l'identifiant de champ Sarbacane : `prenom`, `nom`, `societe`, `siret`, `fonction`, `km`, `conso`, `prix`, `transition`, `source` |

Sans ces variables, le formulaire affiche un message d'échec. Le mail de confirmation se configure dans Sarbacane
(scénario déclenché à l'ajout d'un contact dans la liste).

## Test en local
```
node dev/dev-server.mjs
```
Ouvre http://localhost:3000. Une fausse API Sarbacane est simulée : les contacts s'affichent dans la console, rien n'est envoyé.

## Hypothèses
Facteur d'émission du gazole : 2,68 kgCO2/L (règlement (UE) 2018/2066). Prix du quota : trois hypothèses de simulation.
Projection sur 3 ans à prix et consommation constants. Gain d'éco-conduite : 15 à 20 %.

## Déploiement
Projet Vercel importé depuis ce dépôt, preset « Other », sans commande de build. Chaque push sur `main` redéploie.
La page porte une balise `noindex` (à lever au lancement).

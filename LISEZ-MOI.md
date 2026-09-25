# Calculateur EU ETS 2 & TCO flotte

Prototype Groupe Berto · Katalii. Une seule page statique (`index.html`), sans build ni dépendance à installer :
React, Tailwind, Recharts, Framer Motion et Lucide sont chargés depuis des CDN, le JSX est compilé dans le navigateur.

## Contenu de la page

- **Version allégée**, en libre accès : nombre de véhicules par catégorie, part d'énergies alternatives, prix du quota.
  Résultat : surcoût ETS 2 annuel, par véhicule, par km, et classe A+ à D.
- **Version détaillée**, après un formulaire de coordonnées : assistant en 4 étapes (flotte, prix carbone, impact
  EBITDA, leviers Flexy Green et Katalii), comparatif TCO par énergie, rapport de synthèse.

## Formulaire de contact

Pour l'instant, **rien n'est enregistré ni envoyé** : le formulaire débloque la version détaillée, et le navigateur
retient seulement que l'accès a été ouvert. Pour collecter les contacts, remplacer la fonction `submitLead` dans
`index.html` par un appel à une fonction serverless (Vercel Blob, CRM…), et faire valider la mention d'information
RGPD par le service juridique avant la mise en service.

Le contrôle d'accès se fait dans le navigateur : il suffit pour de la génération de contacts, pas pour protéger
des données.

## Hypothèses à remplacer

Loyers LLD, coûts de maintenance et prix des énergies sont indicatifs (table `CATS` et `defaultState` dans le code).
Facteurs d'émission : règlement MRR (UE) 2018/2066, gazole à 2,68 kgCO2/L.

## Déploiement

Projet Vercel importé depuis ce dépôt GitHub, preset « Other », sans commande de build.
Chaque push sur `main` redéploie la production. La page porte une balise `noindex`.

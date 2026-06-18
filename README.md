Voici où on en est :
|Étape                                                 | Statut |
|------------------------------------------------------|--------|
|✅ Structure + Prisma v7                              | Fait   |
|✅ Auth NestJS (JWT)                                  |  Fait  |
|✅ Module Reports + Categories                        |  Fait  |
|✅ Frontend web (carte + liste + filtres)             |  Fait  |
|✅ App Mobile (structure Expo)                        |  Fait  |
|✅ Écrans mobile fonctionnels                         |  Fait  |
|🔲 Upload photo                                       | À venir|
|🔲 Formulaire création signalement mobile             | À venir|


# CAHIER DES CHARGES
**Plateforme de signalement de problèmes urbains**

**Projet de fin de semestre — Génie Logiciel**  
**Année académique 2024–2025**

**Version :** 1.0  
**Statut :** Document de cadrage initial

## 1. Introduction

### 1.1 Présentation du projet

Ce document constitue le cahier des charges de la plateforme numérique de signalement de problèmes urbains, développée dans le cadre d'un projet universitaire de fin de semestre en génie logiciel.

La plateforme vise à combler un manque concret dans la gestion des infrastructures urbaines : l'absence d'un canal structuré permettant aux citoyens de signaler facilement les dysfonctionnements constatés dans leur environnement quotidien, et aux agents municipaux de les traiter efficacement.

### 1.2 Contexte et problématique

Dans de nombreux quartiers, les citoyens constatent des problèmes d'infrastructure (nids de poule, lampadaires en panne, dépôts sauvages, fuites d'eau, panneaux endommagés) sans disposer d'un canal simple et structuré pour les remonter aux services compétents.

Du côté des agents municipaux, l'absence d'une vue d'ensemble priorisée des interventions engendre :

- Des signalements oraux qui se perdent ou ne sont pas tracés
- Des doublons de signalements pour un même problème
- Un suivi opaque pour le citoyen, sans retour sur l'avancement
- Une allocation non optimale des ressources d'intervention

### 1.3 Objectifs

Le projet poursuit deux objectifs principaux :

1. Permettre à un citoyen de signaler un problème urbain en quelques secondes depuis son téléphone (photo, localisation automatique, catégorie).
2. Permettre à un agent municipal de visualiser l'ensemble des signalements sur une carte ou une liste, de les filtrer et de suivre leur traitement jusqu'à résolution.

## 2. Périmètre fonctionnel

### 2.1 Fonctionnalités du MVP (périmètre minimum viable)

| Fonctionnalité                                      | Acteur          | Priorité      |
|-----------------------------------------------------|-----------------|---------------|
| Inscription et connexion                            | Citoyen / Admin | Obligatoire   |
| Création d'un signalement (photo + géoloc + catégorie + description) | Citoyen | Obligatoire |
| Affichage des signalements sur carte interactive    | Citoyen / Admin | Obligatoire   |
| Affichage des signalements sous forme de liste      | Citoyen / Admin | Obligatoire   |
| Tableau de bord admin : consultation détaillée d'un signalement | Admin | Obligatoire |
| Gestion du statut d'un signalement (nouveau / en cours / résolu) | Admin | Obligatoire |
| Filtrage par catégorie ou par zone géographique     | Admin           | Obligatoire   |

### 2.2 Extensions envisagées (hors MVP)

- Notifications au citoyen lors du changement de statut de son signalement
- Statistiques pour l'administration : nombre de signalements par catégorie/zone, délai moyen de résolution
- Système de vote permettant à plusieurs citoyens de confirmer un même problème
- Export des données (CSV ou PDF)

### 2.3 Catégories de problèmes

| Catégorie      | Exemples                              |
|----------------|---------------------------------------|
| Voirie         | Nid de poule, fissure, effondrement   |
| Éclairage      | Lampadaire en panne, câble apparent   |
| Déchets        | Dépôt sauvage, poubelle débordante    |
| Eau            | Fuite, inondation, bouche cassée      |
| Signalisation  | Panneau endommagé, marquage effacé    |
| Autre          | Tout problème non classifié ci-dessus |

## 3. Utilisateurs et personas

### 3.1 Citoyen

Le citoyen est l'utilisateur principal de l'application mobile. Il n'a pas de compétences techniques particulières. Son parcours type est le suivant :

1. Il constate un problème dans son environnement quotidien.
2. Il ouvre l'application mobile, se connecte (ou crée un compte).
3. Il crée un signalement : l'application capture automatiquement sa localisation, il prend une photo, choisit une catégorie et ajoute une description optionnelle.
4. Il soumet le signalement et peut consulter l'état de ses signalements passés.

### 3.2 Agent municipal (Administrateur)

L'agent municipal utilise l'interface web depuis un poste fixe. Il dispose de droits étendus pour gérer les signalements. Son parcours type est le suivant :

1. Il se connecte à l'interface web admin.
2. Il consulte le tableau de bord : carte et liste des signalements, avec filtres.
3. Il ouvre un signalement pour en voir les détails (photo, description, localisation, citoyen).
4. Il fait évoluer le statut du signalement et peut ajouter un commentaire interne.

## 4. Architecture technique

### 4.1 Vue d'ensemble

Le projet est structuré en trois briques distinctes communiquant via une **API REST** unique :

| Brique                    | Technologie principale              | Rôle                              |
|---------------------------|-------------------------------------|-----------------------------------|
| Application mobile        | React Native + Expo + TypeScript    | Interface citoyen                 |
| Application web admin     | React + TypeScript + Vite           | Interface agent municipal         |
| API backend               | NestJS + TypeScript                 | Logique métier + données          |

### 4.2 Stack technique détaillée

**Application mobile (citoyen)**
- Framework : React Native avec Expo
- Langage : TypeScript
- Cartographie : `react-native-maps`
- Géolocalisation : `expo-location`
- Capture photo : `expo-image-picker`
- Stockage du token JWT : `expo-secure-store`

**Application web (administration)**
- Framework : React
- Langage : TypeScript
- Bundler : Vite
- Cartographie : Leaflet
- Authentification : session sécurisée via JWT

**Backend (API)**
- Framework : NestJS
- Langage : TypeScript
- Base de données : PostgreSQL
- ORM : Prisma
- Authentification : JSON Web Tokens (JWT)

### 4.3 Déploiement

| Composant              | Plateforme cible          |
|------------------------|---------------------------|
| API backend            | Render ou Railway         |
| Application web admin  | Vercel                    |
| Application mobile     | Expo Go (démo) ou APK via EAS Build |

## 5. Modèle de données

### 5.1 Entités principales

| Entité           | Champs principaux                                      | Description |
|------------------|--------------------------------------------------------|-----------|
| User             | id, email, passwordHash, role, createdAt               | Citoyen ou administrateur |
| Report           | id, categoryId, description, photoUrl, latitude, longitude, status, createdAt, userId | Signalement soumis par un citoyen |
| Category         | id, name, icon                                         | Type de problème |
| StatusHistory    | id, reportId, status, changedAt, changedBy             | Historique des changements de statut |

### 5.2 Statuts d'un signalement

| Statut     | Signification |
|------------|---------------|
| `nouveau`  | Signalement soumis, en attente de prise en charge |
| `en_cours` | Intervention planifiée ou en cours |
| `résolu`   | Problème traité et résolu |

### 5.3 Rôles utilisateurs

| Rôle      | Droits |
|-----------|--------|
| citoyen   | Créer des signalements, consulter ses propres signalements, voir la carte publique |
| admin     | Tous les droits citoyen + consulter tous les signalements, modifier les statuts, filtrer et exporter |

## 6. User stories (principales)

| ID     | En tant que… | Je veux…                                      | Afin de… |
|--------|--------------|-----------------------------------------------|----------|
| US-01  | Citoyen      | M'inscrire avec mon e-mail                    | Accéder à la plateforme |
| US-02  | Citoyen      | Me connecter                                  | Accéder à mon espace personnel |
| US-03  | Citoyen      | Créer un signalement avec photo et géoloc     | Alerter les services rapidement |
| US-04  | Citoyen      | Choisir une catégorie de problème             | Aider au tri automatique |
| US-05  | Citoyen      | Voir mes signalements passés                   | Suivre leur traitement |
| US-06  | Admin        | Voir tous les signalements sur une carte       | Avoir une vue d'ensemble géographique |
| US-07  | Admin        | Filtrer les signalements par statut/catégorie  | Prioriser les interventions |
| US-08  | Admin        | Changer le statut d'un signalement             | Notifier l'avancement du traitement |
| US-09  | Admin        | Voir le détail complet d'un signalement        | Préparer l'intervention |
| US-10  | Admin        | Voir la liste triable des signalements         | Organiser la charge de travail |

## 7. Contraintes et exigences non fonctionnelles

### 7.1 Performance
- Le chargement de la carte avec les signalements doit s'effectuer en moins de 3 secondes sur une connexion 4G standard.
- La soumission d'un signalement (avec photo compressée) doit aboutir en moins de 5 secondes.

### 7.2 Sécurité
- Les mots de passe sont stockés sous forme hachée (bcrypt).
- Toutes les communications passent par HTTPS.
- Les tokens JWT ont une durée de validité limitée (ex. 24h) avec mécanisme de rafraîchissement.
- Les routes admin sont protégées par une vérification du rôle côté API.

### 7.3 Accessibilité et UX
- L'interface mobile doit être utilisable avec une seule main et en contexte extérieur (contrastes élevés).
- Le formulaire de signalement doit être rempli en moins de 30 secondes pour un utilisateur nouveau.
- L'interface admin doit être responsive et utilisable sur tablette.

### 7.4 Disponibilité
- L'API backend doit viser une disponibilité de 99 % en dehors des fenêtres de maintenance.
- En cas d'erreur réseau, l'application mobile affiche un message explicite à l'utilisateur.

## 8. Planning prévisionnel

| Période              | Semaines | Activités |
|----------------------|----------|---------|
| Cadrage              | S1–S2    | User stories, diagrammes UML, modèle de données, maquettes |
| Fondations techniques| S3–S4    | Authentification, squelette API NestJS, structure projet |
| Développement mobile | S5–S7    | Création de signalement, géoloc, photo, carte mobile |
| Interface admin      | S8–S9    | Tableau de bord, liste, filtres, gestion des statuts |
| Finitions & bonus    | S10–S11  | Tests, corrections, fonctionnalités optionnelles |
| Déploiement          | S12      | Mise en ligne API, web admin, APK mobile |
| Rapport & soutenance | S13–S14  | Rédaction rapport, préparation soutenance |

## 9. Livrables attendus

| Livrable                                 | Format                  | Échéance    |
|------------------------------------------|-------------------------|-------------|
| Cahier des charges (ce document)         | PDF / Word              | Semaine 2   |
| Diagrammes UML (cas d'utilisation, classes) | PDF / Outil UML      | Semaine 2   |
| Schéma de base de données (Prisma)       | Fichier .prisma         | Semaine 3   |
| Maquettes d'écrans (mobile + web)        | Figma / PDF             | Semaine 2   |
| Code source — API NestJS                 | Dépôt Git               | Semaine 12  |
| Code source — Application mobile         | Dépôt Git               | Semaine 12  |
| Code source — Application web admin      | Dépôt Git               | Semaine 12  |
| Application déployée (API + web + APK)   | URL + fichier APK       | Semaine 12  |
| Rapport écrit                            | PDF                     | Semaine 13  |
| Soutenance orale                         | Présentation            | Semaine 14  |

## 10. Glossaire

| Terme              | Définition |
|--------------------|----------|
| MVP                | Minimum Viable Product — version minimale fonctionnelle du produit |
| JWT                | JSON Web Token — mécanisme d'authentification sans état côté serveur |
| ORM                | Object-Relational Mapping — couche d'abstraction entre le code et la base de données |
| API REST           | Interface de programmation suivant l'architecture REST pour la communication client-serveur |
| Géolocalisation    | Récupération automatique des coordonnées GPS de l'utilisateur via son appareil |
| Signalement        | Rapport créé par un citoyen décrivant un problème d'infrastructure urbaine |
| Statut             | État d'avancement d'un signalement (nouveau, en cours, résolu) |
| EAS Build          | Expo Application Services — outil de compilation et de distribution d'applications React Native |

---

**Fin du document — Version 1.0**

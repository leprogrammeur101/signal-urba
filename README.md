# Signal'Urba

> Plateforme numérique de signalement de problèmes urbains — Projet de fin de semestre en Génie Logiciel (2024–2025)

---

## 📋 Présentation

Signal'Urba est une plateforme permettant aux citoyens de signaler facilement les dysfonctionnements urbains (nids de poule, lampadaires en panne, dépôts sauvages, fuites d'eau...) et aux agents municipaux de les traiter efficacement via un tableau de bord dédié.

---

## 🏗️ Architecture

```
signal-urba/
├── apps/
│   ├── api/        # Backend NestJS + Prisma + PostgreSQL
│   ├── web/        # Frontend React + Vite + Tailwind (admin municipal)
│   └── mobile/     # App React Native + Expo (citoyens)
└── packages/
    └── types/      # Types TypeScript partagés
```

### Stack technique

| Brique | Technologie | Rôle |
|---|---|---|
| Backend | NestJS + TypeScript + Prisma v7 | API REST + logique métier |
| Base de données | PostgreSQL | Stockage des données |
| Frontend web | React + Vite + Tailwind CSS | Interface agent municipal |
| Application mobile | React Native + Expo | Interface citoyen |
| Authentification | JWT (access + refresh token) | Sécurisation des routes |
| Stockage photos | Cloudinary | Upload et hébergement des images |
| Cartographie web | Leaflet + OpenStreetMap | Carte interactive admin |
| Cartographie mobile | WebView + Leaflet + OpenStreetMap | Carte des signalements |
| Géocodage | Nominatim (OpenStreetMap) | Adresse précise depuis les coordonnées GPS |
| Notifications push | Expo Push Notifications | Alertes citoyens (build natif) |

---

## ✅ Fonctionnalités implémentées

### Citoyen (app mobile)
- Inscription et connexion (JWT)
- Création d'un signalement avec géolocalisation automatique
- Adresse précise via géocodage inverse (Nominatim)
- Upload de photo (caméra ou galerie) vers Cloudinary
- Choix de catégorie (Voirie, Éclairage, Déchets, Eau, Signalisation, Autre)
- Carte interactive des signalements (OpenStreetMap)
- Consultation de ses propres signalements avec statut

### Agent municipal (web admin)
- Connexion sécurisée
- Tableau de bord avec carte Leaflet + liste des signalements
- Filtrage par statut (Nouveau / En cours / Résolu)
- Vue détaillée d'un signalement (photo, description, localisation, citoyen)
- Changement de statut avec commentaire interne
- Notification push automatique au citoyen lors du changement de statut

---

## 🗄️ Modèle de données

### Entités

| Entité | Champs principaux |
|---|---|
| User | id, email, passwordHash, role (CITIZEN/ADMIN), pushToken |
| Report | id, categoryId, userId, title, description, photoUrl, latitude, longitude, address, status |
| Category | id, name, slug, icon |
| StatusHistory | id, reportId, status, comment, changedById, changedAt |
| RefreshToken | id, userId, token, expiresAt, revoked |

### Statuts d'un signalement

| Statut | Signification |
|---|---|
| `NEW` | Signalement soumis, en attente |
| `IN_PROGRESS` | Intervention en cours |
| `RESOLVED` | Problème résolu |

---

## 🌐 API REST — Routes disponibles

### Auth
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Créer un compte |
| POST | `/auth/login` | Public | Se connecter |
| POST | `/auth/refresh` | Authentifié | Renouveler le token |
| POST | `/auth/logout` | Authentifié | Se déconnecter |

### Users
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/users/me` | Authentifié | Profil courant |
| PATCH | `/users/me` | Authentifié | Modifier le profil |
| GET | `/users` | Admin | Liste des utilisateurs |
| GET | `/users/:id` | Admin | Détail d'un utilisateur |

### Reports
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/reports` | Authentifié | Créer un signalement |
| GET | `/reports` | Public | Liste avec filtres (status, categoryId, page) |
| GET | `/reports/me` | Authentifié | Mes signalements |
| GET | `/reports/:id` | Public | Détail d'un signalement |
| PATCH | `/reports/:id/status` | Admin | Changer le statut |
| DELETE | `/reports/:id` | Auteur/Admin | Supprimer |

### Catégories & Uploads
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/categories` | Public | Liste des catégories |
| POST | `/uploads/image` | Authentifié | Upload photo vers Cloudinary |
| POST | `/notifications/register-token` | Authentifié | Enregistrer le token push |

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js >= 18
- PostgreSQL
- Yarn (pour le mobile)
- Compte Cloudinary (gratuit)

### 1. Backend

```bash
cd apps/api

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Migrer la base de données
npx prisma migrate dev --name init

# Insérer les données initiales
npx tsx prisma/seed.ts

# Démarrer le serveur
npm run start:dev
# → http://localhost:3000
```

### 2. Frontend web

```bash
cd apps/web

# Configurer
echo "VITE_API_URL=http://localhost:3000" > .env

# Démarrer
npm run dev
# → http://localhost:5173
```

### 3. App mobile

```bash
cd apps/mobile

# Configurer (remplacer par l'IP locale du PC)
echo "EXPO_PUBLIC_API_URL=http://192.168.X.X:3000" > .env

# Démarrer
npx expo start --clear
# Scanner le QR code avec Expo Go
```

---

## 🔐 Variables d'environnement

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/signaldb"
JWT_ACCESS_SECRET="votre_secret_access"
JWT_REFRESH_SECRET="votre_secret_refresh"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"
```

### Frontend web (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000
```

### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```

---

## 👤 Comptes par défaut (après seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@signalurba.fr | Admin1234! |

---

## 📦 Catégories disponibles

| Catégorie | Slug | Exemples |
|---|---|---|
| Voirie | voirie | Nid de poule, fissure |
| Éclairage | eclairage | Lampadaire en panne |
| Déchets | dechets | Dépôt sauvage |
| Eau | eau | Fuite, inondation |
| Signalisation | signalisation | Panneau endommagé |
| Autre | autre | Tout autre problème |

---

## 🗺️ Déploiement prévu

| Composant | Plateforme |
|---|---|
| API backend | Railway |
| Frontend web | Vercel |
| Application mobile | EAS Build (APK Android) |

---

## 📅 Planning réalisé

| Période | Activités |
|---|---|
| S1–S2 | Cahier des charges, user stories, modèle de données |
| S3–S4 | Structure monorepo, Prisma v7, authentification JWT |
| S5–S7 | API Reports/Categories, app mobile (carte, géoloc, signalement) |
| S8–S9 | Dashboard web (carte Leaflet, filtres, gestion statuts) |
| S10–S11 | Upload Cloudinary, notifications push, corrections |
| S12 | Déploiement (à venir) |

---

## 📚 User Stories implémentées

| ID | Acteur | Story | Statut |
|---|---|---|---|
| US-01 | Citoyen | S'inscrire avec email | ✅ |
| US-02 | Citoyen | Se connecter | ✅ |
| US-03 | Citoyen | Créer un signalement avec photo et géoloc | ✅ |
| US-04 | Citoyen | Choisir une catégorie | ✅ |
| US-05 | Citoyen | Voir ses signalements passés | ✅ |
| US-06 | Admin | Voir tous les signalements sur une carte | ✅ |
| US-07 | Admin | Filtrer par statut/catégorie | ✅ |
| US-08 | Admin | Changer le statut d'un signalement | ✅ |
| US-09 | Admin | Voir le détail complet d'un signalement | ✅ |
| US-10 | Admin | Notification push au citoyen | ✅ (build natif) |

---

## 10. Glossaire

| Terme | Définition |
|---|---|
| MVP | Minimum Viable Product — version minimale fonctionnelle |
| JWT | JSON Web Token — authentification sans état |
| ORM | Object-Relational Mapping — abstraction base de données |
| API REST | Interface de communication client-serveur |
| Géolocalisation | Coordonnées GPS récupérées automatiquement |
| Signalement | Rapport d'un citoyen sur un problème urbain |
| EAS Build | Expo Application Services — compilation APK/IPA |
| Nominatim | Service de géocodage inverse OpenStreetMap |
| Cloudinary | Service cloud de stockage et traitement d'images |

---

*Signal'Urba — Projet Génie Logiciel 2024–2025*

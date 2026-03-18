# VerticalLog – Topo Escalade

Application fullstack de carnet d'escalade numérique. Explorez les sites, enregistrez vos ascensions et suivez votre progression.

## Stack technique

- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL 16 (via Docker)
- **Frontend** : React + TypeScript + Vite
- **Authentification** : JWT (jsonwebtoken + bcrypt)
- **Graphiques** : Chart.js + react-chartjs-2

## Lancement rapide

### 1. Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Démarrer la base de données

```bash
docker-compose up -d
```

La base de données sera initialisée automatiquement avec les tables et les données de démo.

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Le serveur démarre sur http://localhost:3001

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur http://localhost:5173

---

## Compte de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@verticallog.fr | admin123 | admin |

## Données de démo incluses

**Sites :**
- Gorges du Verdon (Falaise)
- Bloc de Fontainebleau (Bloc)
- Salle Arkose Nation (Salle)

**Voies :** 5 voies avec cotations allant de 5c à 7b

## Structure du projet

```
Projet Escalade/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── index.ts          # Point d'entrée
│   │   ├── db.ts             # Pool PostgreSQL
│   │   ├── middleware/auth.ts # JWT middleware
│   │   ├── routes/           # Auth, Sites, Routes, Logbook
│   │   └── migrations/init.sql
└── frontend/
    └── src/
        ├── App.tsx
        ├── api.ts            # Appels axios
        ├── types.ts          # TypeScript interfaces
        ├── context/AuthContext.tsx
        ├── components/       # Navbar, PrivateRoute, StarRating
        └── pages/            # Home, Sites, SiteDetail, Login, Register, Logbook, Profile
```

## API Endpoints

### Auth
- `POST /api/auth/register` – Inscription
- `POST /api/auth/login` – Connexion
- `GET /api/auth/me` – Utilisateur courant (auth)

### Sites
- `GET /api/sites` – Liste des sites
- `GET /api/sites/:id` – Détail + voies
- `POST /api/sites` – Créer (expert/admin)
- `PUT /api/sites/:id` – Modifier (expert/admin)
- `DELETE /api/sites/:id` – Supprimer (admin)

### Voies
- `GET /api/climbing-routes/site/:siteId` – Voies d'un site
- `POST /api/climbing-routes` – Créer (expert/admin)
- `PUT /api/climbing-routes/:id` – Modifier (expert/admin)
- `DELETE /api/climbing-routes/:id` – Supprimer (admin)

### Carnet
- `GET /api/logbook` – Mes ascensions (auth)
- `POST /api/logbook` – Ajouter (auth)
- `PUT /api/logbook/:id` – Modifier la mienne (auth)
- `DELETE /api/logbook/:id` – Supprimer la mienne (auth)
- `GET /api/logbook/stats` – Statistiques (auth)

## Rôles

| Rôle | Permissions |
|------|-------------|
| user | Lecture publique, gestion de son carnet |
| expert | + Créer/modifier sites et voies |
| admin | + Supprimer sites et voies |

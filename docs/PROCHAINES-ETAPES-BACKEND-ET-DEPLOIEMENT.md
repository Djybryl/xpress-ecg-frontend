# Guide pas à pas : de la fin du frontend au backend et au déploiement

Vous avez terminé le frontend Xpress-ECG. Ce document vous guide **étape par étape** pour :
1. Préparer votre environnement
2. Récupérer et configurer le backend
3. Développer le backend en phase avec le frontend
4. Connecter le frontend au backend
5. Compiler et déployer l’application sur un serveur cloud

Vous n’avez pas besoin d’être développeur : suivez les étapes dans l’ordre et utilisez l’assistant pour le code.

---

## Où en êtes-vous ?

| Élément | État |
|--------|------|
| **Frontend** | Terminé (Vercel, démo) |
| **Backend** | Démarré sur GitHub : [xpress-ecg-backend](https://github.com/Djybryl/xpress-ecg-backend) |
| **Base de données** | À configurer (Supabase) |
| **Déploiement complet** | À faire (frontend + backend + DB) |

---

## Phase 0 : Prérequis (une seule fois)

### 0.1 Sur votre ordinateur

- **Node.js 18 ou plus**  
  - Vérifier : ouvrir un terminal et taper `node -v`. Si ce n’est pas installé : [https://nodejs.org](https://nodejs.org) (version LTS).
- **Git**  
  - Vérifier : `git -v`. Sinon : [https://git-scm.com](https://git-scm.com).
- **Un éditeur de code**  
  - Vous utilisez déjà Cursor ; c’est suffisant.

### 0.2 Comptes en ligne

- **GitHub** : vous l’avez déjà (frontend + backend).
- **Supabase** : compte gratuit pour la base de données.  
  - Créer un projet : [https://supabase.com](https://supabase.com) → Sign up → New project.  
  - Noter : **URL du projet** et **anon key** (Settings → API). Pour le backend, vous aurez aussi besoin de la **service_role key** (à garder secrète).
- **Vercel** : déjà utilisé pour le frontend.
- **Un hébergeur pour le backend** (à choisir plus tard) : par exemple **Railway**, **Render** ou **Fly.io** (offres gratuites ou peu chères).

---

## Phase 1 : Récupérer et faire tourner le backend en local

### Étape 1.1 — Cloner le dépôt backend

1. Ouvrir un terminal (PowerShell ou l’intégré à Cursor).
2. Aller dans un dossier de travail (par ex. à côté de votre projet frontend) :
   ```bash
   cd F:\PROJETS DNR LENOVO\PROJET25
   ```
3. Cloner le backend :
   ```bash
   git clone https://github.com/Djybryl/xpress-ecg-backend.git
   cd xpress-ecg-backend
   ```

### Étape 1.2 — Installer les dépendances

Dans le dossier `xpress-ecg-backend` :

```bash
npm install
```

### Étape 1.3 — Fichier d’environnement (.env)

1. Copier le fichier d’exemple :
   ```bash
   cp env.example .env
   ```
   (Sous Windows, si `cp` ne marche pas : copier `env.example` à la main et le renommer en `.env`.)

2. Ouvrir `.env` et remplir avec **vos** valeurs :
   - **SUPABASE_URL** : URL de votre projet Supabase (ex. `https://xxxx.supabase.co`).
   - **SUPABASE_ANON_KEY** : clé “anon” (Settings → API dans Supabase).
   - **SUPABASE_SERVICE_ROLE_KEY** : clé “service_role” (même page ; ne pas l’exposer côté frontend).
   - **PORT** : par ex. `3000`.
   - **JWT_SECRET** et **JWT_REFRESH_SECRET** : chaînes longues et aléatoires (au moins 32 caractères). Vous pouvez en générer une avec Node : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - **CORS_ORIGIN** : en local, mettre `http://localhost:5173` (adresse du frontend Vite).

### Étape 1.4 — Démarrer le backend

```bash
npm run dev
```

Vous devez voir un message du type “Server running on port 3000”.  
Tester : ouvrir dans le navigateur `http://localhost:3000/health`. Une réponse du type “OK” ou “healthy” confirme que le backend tourne.

**Résultat de la Phase 1** : backend qui tourne en local et répond sur `http://localhost:3000`.

---

## Phase 2 : Développer le backend en phase avec le frontend

Le backend actuel expose surtout l’**authentification** (login, refresh, logout, me). Pour que l’application soit complète, il faut ajouter les **endpoints** que le frontend attend (ou adapter le frontend pour les appeler). Ordre recommandé :

### Étape 2.1 — Schéma de base de données (Supabase)

1. Dans le projet Supabase : **SQL Editor**.
2. Créer les tables nécessaires, en cohérence avec le frontend :
   - **users** (id, email, name, role, etc.)
   - **ecg_records** (demandes d’ECG : patient, médecin, urgence, statut, fichiers, etc.)
   - **ecg_reports** ou champs dans ecg_records pour les rapports (mesures, conclusion, date de signature)
   - **hospitals** (établissements)
   - **patients** (si gérés côté backend)
   - Tables pour second avis, notifications, etc. selon les besoins

Vous pouvez demander à l’assistant : “Génère le schéma SQL Supabase pour Xpress-ECG (users, ecg_records, reports, hospitals, patients) en accord avec le frontend.”

### Étape 2.2 — Ordre de développement des API

À faire dans cet ordre (vous pouvez demander à l’assistant d’implémenter chaque bloc) :

1. **Auth** (déjà en place)  
   - S’assurer que login/refresh/me renvoient bien `id`, `email`, `name`, `role` comme le frontend.

2. **Utilisateurs et établissements (admin)**  
   - CRUD utilisateurs (liste, création, modification, activation/désactivation).  
   - CRUD établissements.  
   - Protéger par rôle `admin`.

3. **Patients (médecin / secrétaire)**  
   - Liste, recherche, création (pour “Nouvel ECG” et “Mes patients”).

4. **ECG (demandes)**  
   - Création d’une demande (médecin) : patient, fichiers (ou URLs après stockage), urgence, contexte.  
   - Liste des demandes par statut (reçus, validés, assignés, en cours, terminés).  
   - Mise à jour de statut : validation (secrétaire), assignation (secrétaire), prise en charge (cardiologue).

5. **Rapports d’interprétation**  
   - Enregistrement du rapport (cardiologue) : mesures, conclusion, signature, lien avec l’ECG.  
   - Liste des rapports pour un médecin (rapports reçus).  
   - Détail d’un rapport (pour affichage et PDF).

6. **Second avis**  
   - Création demande de second avis, liste pour le cardiologue, accepter/refuser, enregistrer la réponse.

7. **Notifications (optionnel)**  
   - Endpoints pour liste/marquer lu, ou utilisation de Supabase Realtime pour les notifs.

À chaque fois, vous pouvez dire : “Dans xpress-ecg-backend, implémente l’endpoint [nom] qui fait [description] et renvoie [format].”

### Étape 2.3 — Compiler et vérifier le backend

Dans le dossier backend :

```bash
npm run build
npm run type-check
npm run lint
```

Corriger les erreurs avec l’assistant si besoin.  
**Résultat** : backend qui compile et dont les routes correspondent peu à peu au frontend.

---

## Phase 3 : Connecter le frontend au backend

### Étape 3.1 — Variable d’environnement frontend

Dans le projet **frontend** (Xpress-ECG-CLEAN) :

1. Créer ou modifier `.env` :
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   En production, vous mettrez l’URL réelle du backend (ex. `https://votre-backend.railway.app`).

2. Dans le code frontend, remplacer les **stores/mocks** par des appels à l’API :  
   - Utiliser `import.meta.env.VITE_API_URL` comme base URL pour les requêtes (fetch ou client HTTP).  
   - Exemple : `fetch(\`${import.meta.env.VITE_API_URL}/api/v1/ecg-records\`, { ... })`.

### Étape 3.2 — Ordre de connexion

1. **Auth** : appeler `POST /api/v1/auth/login` avec email/mot de passe ; stocker le token ; utiliser le token pour les requêtes protégées et pour `GET /api/v1/auth/me`.
2. **Puis** : patients, demandes ECG, rapports, admin, second avis, etc., en suivant l’ordre de la Phase 2.

À chaque fois : “Connecte la page [nom] du frontend à l’API backend [endpoint] en utilisant VITE_API_URL.”

---

## Phase 4 : Déploiement sur un serveur cloud

### Vue d’ensemble

- **Frontend** : déjà sur Vercel ; vous ajouterez la variable `VITE_API_URL` pointant vers le backend en production.
- **Backend** : à déployer sur un service (Railway, Render, Fly.io, etc.).
- **Base de données** : Supabase est déjà dans le cloud ; vous n’avez rien à héberger pour la DB.

### Étape 4.1 — Déployer le backend (exemple avec Railway)

1. Créer un compte : [https://railway.app](https://railway.app).
2. “New Project” → “Deploy from GitHub repo” → choisir **Djybryl/xpress-ecg-backend**.
3. Railway détecte Node.js et propose un build.  
   - Build command : `npm run build`.  
   - Start command : `npm start`.  
   - Root directory : racine du repo.
4. Dans “Variables”, ajouter **toutes** les variables de votre `.env` (SUPABASE_*, JWT_*, PORT, NODE_ENV=production, CORS_ORIGIN).
5. **CORS_ORIGIN** : mettre l’URL de votre frontend en production, ex. `https://votre-app.vercel.app` (sans slash final).
6. Déployer. Railway vous donne une URL (ex. `https://votre-backend.up.railway.app`).

### Étape 4.2 — Autres options backend

- **Render** : [https://render.com](https://render.com) → New Web Service → connecter le repo backend → même idée (build: `npm run build`, start: `npm start`, variables d’environnement).
- **Fly.io** : nécessite un `Dockerfile` ou une config fly.toml ; on peut le générer plus tard si vous choisissez Fly.

### Étape 4.3 — Configurer le frontend en production (Vercel)

1. Vercel → votre projet frontend → **Settings** → **Environment Variables**.
2. Ajouter :
   - **VITE_API_URL** = `https://votre-backend.up.railway.app` (ou l’URL Render/Fly).
3. Redéployer le frontend (redeploy depuis Vercel).

### Étape 4.4 — Vérifications après déploiement

1. Backend : `https://votre-backend.up.railway.app/health` doit répondre OK.
2. Frontend : se connecter et faire un flux complet (login, une demande ECG, etc.) pour vérifier que le frontend appelle bien le backend et que les données s’affichent.

---

## Récapitulatif : ordre des actions

| Ordre | Action | Où |
|-------|--------|-----|
| 1 | Cloner xpress-ecg-backend, npm install, .env, npm run dev | Backend (local) |
| 2 | Créer le schéma SQL Supabase (tables) | Supabase |
| 3 | Implémenter les endpoints (auth déjà faite, puis users, hospitals, patients, ECG, reports, second avis) | Backend |
| 4 | Compiler le backend (npm run build, type-check, lint) | Backend |
| 5 | Ajouter VITE_API_URL au frontend, remplacer mocks par appels API | Frontend |
| 6 | Déployer le backend (Railway / Render / Fly) | Cloud |
| 7 | Mettre VITE_API_URL en production sur Vercel, redeploy | Vercel |
| 8 | Tester l’application de bout en bout | Navigateur |

---

## Comment utiliser ce guide avec l’assistant

- Pour **une étape précise** : “On en est à l’étape X du guide PROCHAINES-ETAPES-BACKEND-ET-DEPLOIEMENT : fais [la sous-étape].”
- Pour **du code** : “Dans le repo xpress-ecg-backend, ajoute l’endpoint GET /api/v1/ecg-records pour lister les demandes ECG avec filtres.”
- Pour **le schéma DB** : “Génère le SQL Supabase pour les tables users, ecg_records, reports et hospitals pour Xpress-ECG.”

Dès que vous avez cloné le backend et ouvert le projet dans Cursor, vous pouvez commencer par la **Phase 1** (étapes 1.1 à 1.4) puis enchaîner avec la Phase 2 en demandant d’abord le schéma Supabase, puis les premiers endpoints.

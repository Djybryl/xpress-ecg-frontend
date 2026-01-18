# 📋 SPÉCIFICATIONS TECHNIQUES

## Xpress-ECG
### Plateforme de Télé-interprétation d'Électrocardiogrammes

**Version 1.1 - Décembre 2024**

---

## 📑 Table des Matières

1. [Introduction](#1-introduction)
2. [Architecture Globale](#2-architecture-globale)
3. [Interfaces Utilisateurs](#3-interfaces-utilisateurs)
4. [Visualiseur ECG](#4-visualiseur-ecg)
5. [Spécifications de Sécurité](#5-spécifications-de-sécurité)
6. [API REST](#6-api-rest)
7. [Schéma de Base de Données](#7-schéma-de-base-de-données)
8. [Conformité Réglementaire](#8-conformité-réglementaire)
9. [Performance et SLA](#9-performance-et-sla)
10. [Déploiement et CI/CD](#10-déploiement-et-cicd)

---

## 1. Introduction

Xpress-ECG est une plateforme web de télé-interprétation d'électrocardiogrammes permettant la collaboration entre établissements de santé, médecins référents et cardiologues experts.

### 1.1 Stack Technologique

| Couche | Technologie | Description |
|--------|-------------|-------------|
| **Frontend** | React 18 + TypeScript | SPA moderne avec typage statique |
| **Build Tool** | Vite 5.x | Build rapide et optimisé |
| **Styling** | Tailwind CSS + Radix UI | Design system moderne |
| **Backend** | Supabase (BaaS) | Auth, DB PostgreSQL, Storage, Realtime |
| **Runtime Serveur** | Deno (Edge Functions) | Fonctions serverless pour logique complexe |
| **Hébergement** | Vercel | Déploiement automatique |

### 1.2 Thème Visuel

- **Couleur principale** : Pastel Indigo (`#818CF8`)
- **Police** : Plus Jakarta Sans
- **Style** : Moderne, épuré, accessible

---

## 2. Architecture Globale

### 2.1 Séparation Frontend/Backend

L'architecture suit un modèle découplé strict avec communication via API REST sécurisée.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │    Login    │ │  Dashboard  │ │ ECG Viewer  │ │  Reports   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              State Management (Zustand/Context)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Offline Storage (IndexedDB - PWA)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Supabase)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │    Auth     │ │  PostgreSQL │ │   Storage   │ │  Realtime  │ │
│  │   (JWT)     │ │    (RLS)    │ │  (Fichiers) │ │  (WebSocket)│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               Edge Functions (Deno)                          │ │
│  │   • Import ECG    • Analyse    • Génération PDF              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Responsabilités

| Couche | Responsabilités |
|--------|-----------------|
| **Frontend** | Interface utilisateur (UI/UX), État local et formulaires, Validation côté client, Visualisation ECG (Canvas) |
| **Backend** | Authentification/Autorisation, Logique métier, Persistance données, Gestion fichiers ECG, Audit et logs sécurité |

---

## 3. Interfaces Utilisateurs

### 3.1 Interface Administrateur

Gestion système complète : utilisateurs, établissements, configuration, statistiques.

| Module | Fonctionnalités Clés |
|--------|---------------------|
| **Gestion Utilisateurs** | CRUD utilisateurs, attribution rôles, 2FA, historique connexions |
| **Gestion Établissements** | CRUD établissements, liaison utilisateurs, templates rapport personnalisés |
| **Configuration Système** | Paramètres globaux, SMTP, sauvegardes, rétention données |
| **Statistiques & Audit** | Dashboard global, logs d'audit (WHO/WHAT/WHEN), exports CSV/PDF |

### 3.2 Interface Cardiologue/Expert

Cœur de l'application pour l'interprétation professionnelle des ECG.

| Module | Fonctionnalités Clés |
|--------|---------------------|
| **Dashboard** | File d'attente priorisée, filtres établissement, stats personnelles, notifications temps réel |
| **Visualiseur ECG** | 12 dérivations, zoom/calipers, filtres 50Hz, modes 3x4/6x2/12x1, comparaison historique |
| **Analyse & Mesures** | Saisie manuelle/auto (FC, PR, QRS, QT), calcul QTc, suggestions IA optionnelles |
| **Interprétation** | Éditeur texte libre, phrases pré-définies, templates perso, dictée vocale optionnelle |
| **Validation & Rapport** | Prévisualisation PDF, signature électronique eIDAS, horodatage, envoi auto sécurisé |

### 3.3 Interface Médecin Référent

Envoi d'ECG et suivi des interprétations.

| Module | Fonctionnalités Clés |
|--------|---------------------|
| **Envoi ECG** | Upload multi-formats, saisie patient, contexte clinique, marquage urgent |
| **Suivi Demandes** | Liste ECG envoyés, statuts temps réel, notifications rapport disponible, historique patient |
| **Consultation Rapports** | Visualisation en ligne, téléchargement PDF, impression, export vers DMP |

### 3.4 Interface Secrétaire

Support administratif et gestion documentaire.

| Module | Fonctionnalités Clés |
|--------|---------------------|
| **Gestion Dossiers** | Saisie manuelle ECG fax/courrier, numérisation, correction infos patient, fusion doublons |
| **Recherche & Archive** | Recherche multi-critères, historique complet, archivage, exports facturation |
| **Impression & Envoi** | Impression rapports, envoi postal, gestion AR, transmission DMP/messagerie sécurisée |

---

## 4. Visualiseur ECG

### 4.1 Formats Supportés

| Format | Extension | Description |
|--------|-----------|-------------|
| **Images** | .jpg, .jpeg, .png | ECG numérisés/scannés |
| **PDF** | .pdf | Documents ECG |
| **DICOM** | .dcm | Format médical standard |
| **SCP-ECG** | .scp | Standard européen EN 1064 |
| **HL7 aECG** | .xml | Format HL7 annotated ECG |
| **MUSE XML** | .xml | GE Healthcare |
| **WFDB** | .dat, .hea | PhysioBank MIT |

### 4.2 Spécifications d'Affichage

| Paramètre | Valeur |
|-----------|--------|
| **Dérivations** | 12 standard (I, II, III, aVR, aVL, aVF, V1-V6) |
| **Modes d'affichage** | 3x4, 6x2, 12x1 |
| **Grille** | 1mm = 0.04s (horizontal), 1mm = 0.1mV (vertical) |
| **Vitesse papier** | 25 mm/s (standard), 50 mm/s |
| **Amplitude** | 5, 10, 20 mm/mV |
| **Zoom** | 0.5x à 4x |

### 4.3 Outils de Mesure

| Outil | Fonction |
|-------|----------|
| **Calipers** | Mesure point à point avec calcul automatique |
| **Règle FC** | Calcul fréquence cardiaque sur intervalle RR |
| **Marqueurs** | Annotation de zones d'intérêt |
| **Comparaison** | Vue côte à côte avec ECG antérieur |

### 4.4 Filtres Numériques

| Filtre | Fréquence |
|--------|-----------|
| **Passe-bas** | 40 Hz (réduction artefacts musculaires) |
| **Passe-haut** | 0.05 Hz (correction ligne de base) |
| **Notch** | 50/60 Hz (élimination bruit secteur) |

### 4.5 Mesures Automatiques

| Paramètre | Unité | Valeurs Normales |
|-----------|-------|------------------|
| Fréquence cardiaque | bpm | 60-100 |
| Intervalle PR | ms | 120-200 |
| Durée QRS | ms | 80-120 |
| Intervalle QT | ms | 350-440 |
| QTc (Bazett) | ms | <440 (H), <460 (F) |
| Axe QRS | degrés | -30° à +90° |
| Axe onde P | degrés | 0° à +75° |
| Axe onde T | degrés | 0° à +90° |

---

## 5. Spécifications de Sécurité

### 5.1 Authentification

| Mécanisme | Spécification |
|-----------|---------------|
| **2FA** | Obligatoire (TOTP/SMS) |
| **JWT** | Expiration 15 min + refresh tokens |
| **Session** | Timeout 30 min inactivité |
| **Mot de passe** | 12+ caractères, complexité requise |
| **Verrouillage** | Après 5 tentatives échouées |

### 5.2 RBAC (Contrôle d'Accès par Rôles)

| Rôle | Permissions |
|------|-------------|
| **Administrateur** | Accès complet : users, établissements, config, tous ECG, audit logs |
| **Cardiologue/Expert** | ECG assignés, analyse, interprétation, validation, signature, rapports, second avis |
| **Médecin Référent** | Upload ECG, saisie patient, consultation propres demandes, téléchargement rapports |
| **Secrétaire** | Gestion admin dossiers, impression, archivage (pas d'accès interprétation/signature) |

### 5.3 Cryptographie

#### En Transit
- TLS 1.3 obligatoire + PFS
- Certificats SSL auto-renouvelés
- HSTS activé

#### Au Repos
- AES-256 pour données sensibles en DB
- Fichiers ECG chiffrés (Supabase Storage)
- Mots de passe bcrypt (cost 12)

### 5.4 Audit et Traçabilité

Tous les événements critiques sont enregistrés :

| Champ | Description |
|-------|-------------|
| **WHO** | UUID utilisateur |
| **WHAT** | Action (CREATE/READ/UPDATE/DELETE/VALIDATE/SIGN) |
| **WHEN** | Timestamp ISO 8601 + timezone |
| **WHERE** | IP, User-Agent, géolocalisation |
| **DATA** | Valeurs avant/après (JSONB) |

**Rétention logs** : 10 ans minimum (exigence HDS)

---

## 6. API REST

### 6.1 Principes Généraux

- RESTful, versioning `/api/v1/`
- Format JSON (`application/json`)
- Codes HTTP standards (200, 201, 400, 401, 403, 404, 500)
- Pagination systématique (`limit`/`offset`)
- Header Auth : `Authorization: Bearer <JWT>`

### 6.2 Endpoints Principaux

#### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Connexion → JWT + refresh token |
| POST | `/api/v1/auth/logout` | Déconnexion (invalidation token) |
| POST | `/api/v1/auth/refresh` | Renouvellement JWT |
| POST | `/api/v1/auth/2fa/setup` | Configuration 2FA |
| POST | `/api/v1/auth/2fa/verify` | Vérification code 2FA |
| POST | `/api/v1/auth/password/reset` | Demande reset mot de passe |

#### ECG

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/ecg` | Liste ECG (filtres: status, hospital_id, urgent) |
| POST | `/api/v1/ecg/import` | Import ECG (multipart/form-data) |
| GET | `/api/v1/ecg/:id` | Détails ECG + URL signée fichier |
| PATCH | `/api/v1/ecg/:id` | Mise à jour (mesures, interprétation, statut) |
| POST | `/api/v1/ecg/:id/validate` | Validation + signature électronique |
| POST | `/api/v1/ecg/:id/report` | Génération rapport PDF |
| POST | `/api/v1/ecg/:id/send` | Envoi rapport (email/DMP) |

#### Patients

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/patients` | Liste patients |
| POST | `/api/v1/patients` | Création patient |
| GET | `/api/v1/patients/:id` | Détails patient |
| PATCH | `/api/v1/patients/:id` | Mise à jour patient |
| GET | `/api/v1/patients/:id/ecg` | Historique ECG patient |

#### Utilisateurs & Établissements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/users` | Liste utilisateurs (admin) |
| POST | `/api/v1/users` | Création utilisateur |
| GET | `/api/v1/hospitals` | Liste établissements |
| POST | `/api/v1/hospitals` | Création établissement |
| GET | `/api/v1/stats` | Statistiques dashboard |

#### Second Avis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/second-opinions` | Liste demandes |
| POST | `/api/v1/second-opinions` | Nouvelle demande |
| PATCH | `/api/v1/second-opinions/:id` | Réponse |

---

## 7. Schéma de Base de Données

### 7.1 Tables Principales

#### Table `users`

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'expert', 'doctor', 'secretary')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  rpps_number text,                    -- Numéro RPPS (médecins)
  phone text,
  signature_path text,                 -- Image signature électronique
  is_active boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Table `hospitals`

```sql
CREATE TABLE hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  logo_path text,
  finess_number text,                  -- Numéro FINESS
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Table `hospital_users`

```sql
CREATE TABLE hospital_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,    -- Établissement principal
  created_at timestamptz DEFAULT now(),
  UNIQUE(hospital_id, user_id)
);
```

#### Table `patients`

```sql
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id),
  external_id text,                    -- ID du SIH
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  gender text CHECK (gender IN ('M', 'F', 'O')),
  phone text,
  email text,
  address text,
  insurance_number text,               -- Numéro sécurité sociale
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Table `ecg_records`

```sql
CREATE TABLE ecg_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL, -- ECG-2024-XXXX
  patient_id uuid REFERENCES patients(id),
  hospital_id uuid REFERENCES hospitals(id) NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  assigned_to uuid REFERENCES users(id),
  analyzed_by uuid REFERENCES users(id),
  
  -- Statut et priorité
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_progress', 'validated', 'sent')),
  priority text DEFAULT 'normal' 
    CHECK (priority IN ('normal', 'urgent', 'critical')),
  
  -- Fichier ECG
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  
  -- Contexte clinique
  clinical_context text,
  symptoms text,
  medications text,
  
  -- Mesures
  measurements jsonb,                  -- {heartRate, pr, qrs, qt, qtc, axes...}
  
  -- Interprétation
  interpretation text,
  diagnosis text,
  recommendations text,
  
  -- Validation et signature
  validated_at timestamptz,
  signed_at timestamptz,
  signature_hash text,                 -- Hash de la signature
  
  -- Rapport
  report_path text,
  sent_at timestamptz,
  sent_to text,                        -- Email destinataire
  
  -- Métadonnées
  acquisition_date timestamptz,
  acquisition_device text,
  tags text[],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Table `second_opinions`

```sql
CREATE TABLE second_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  requesting_user_id uuid REFERENCES users(id),
  consultant_user_id uuid REFERENCES users(id),
  question text NOT NULL,
  response text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);
```

#### Table `notifications`

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,                  -- new_ecg, urgent, report_ready, second_opinion
  title text NOT NULL,
  message text,
  ecg_id uuid REFERENCES ecg_records(id),
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

#### Table `report_templates`

```sql
CREATE TABLE report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id),
  user_id uuid REFERENCES users(id),  -- Template personnel
  name text NOT NULL,
  description text,
  content jsonb NOT NULL,              -- Structure du template
  header_html text,
  footer_html text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Table `audit_logs`

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,                -- CREATE, READ, UPDATE, DELETE, VALIDATE, SIGN, LOGIN, LOGOUT
  resource_type text NOT NULL,         -- ecg, patient, user, report, hospital
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

#### Table `phrase_templates` (Phrases pré-définies)

```sql
CREATE TABLE phrase_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),   -- Si personnel
  category text NOT NULL,              -- rhythm, conduction, repolarization, conclusion
  shortcut text,                       -- /rs pour "Rythme sinusal"
  content text NOT NULL,
  is_global boolean DEFAULT false,     -- Disponible pour tous
  created_at timestamptz DEFAULT now()
);
```

### 7.2 Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_records ENABLE ROW LEVEL SECURITY;

-- Exemple politique pour ECG
CREATE POLICY "Users can view ECG from their hospitals" ON ecg_records
  FOR SELECT
  USING (
    hospital_id IN (
      SELECT hospital_id FROM hospital_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create ECG" ON ecg_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('doctor', 'expert', 'admin')
    )
  );
```

---

## 8. Conformité Réglementaire

### 8.1 RGPD

#### Principes Respectés
- ✅ Minimisation des données
- ✅ Limitation finalité (interprétation ECG uniquement)
- ✅ Intégrité et confidentialité (chiffrement)
- ✅ Durée de conservation limitée

#### Droits des Personnes
| Droit | Implémentation |
|-------|----------------|
| **Accès** | API extraction données patient |
| **Rectification** | Modification possible via interface |
| **Effacement** | Procédure avec conservation légale |
| **Portabilité** | Export JSON/PDF |
| **Opposition** | Formulaire dédié |

### 8.2 HDS (Hébergement Données de Santé)

- ✅ Hébergeur certifié HDS (Supabase/AWS/GCP)
- ✅ Localisation données en Europe (eu-west)
- ✅ Sauvegardes quotidiennes chiffrées géo-répliquées
- ✅ Plan PRA/PCA documenté
- ✅ Audit sécurité annuel

### 8.3 Dispositif Médical (Marquage CE)

| Classification | Condition |
|----------------|-----------|
| **Classe I** | Si assistance administrative uniquement |
| **Classe IIa** | Si aide diagnostic (mesures auto, IA) |

**Documentation requise** :
- Dossier technique complet
- Analyse de risques (ISO 14971)
- Validation clinique
- Notice d'utilisation

### 8.4 Normes Applicables

| Norme | Domaine |
|-------|---------|
| **ISO 13485** | Management qualité dispositifs médicaux |
| **ISO 27001** | Sécurité information |
| **IEC 62304** | Logiciels dispositifs médicaux |
| **HL7/FHIR** | Interopérabilité santé |
| **WCAG 2.1 AA** | Accessibilité web |

---

## 9. Performance et SLA

### 9.1 Objectifs de Performance

| Métrique | Objectif |
|----------|----------|
| Temps chargement initial | < 3 secondes |
| Affichage ECG | < 1 seconde |
| Recherche patient | < 500 ms |
| Génération rapport PDF | < 5 secondes |
| Temps de réponse API | < 200 ms (p95) |

### 9.2 Disponibilité

| Métrique | Objectif |
|----------|----------|
| Disponibilité | 99.9% (8.76h downtime/an max) |
| RTO (Recovery Time Objective) | < 4 heures |
| RPO (Recovery Point Objective) | < 1 heure |

### 9.3 Scalabilité

| Paramètre | Capacité |
|-----------|----------|
| ECG par an | 100 000+ |
| Utilisateurs simultanés | 50+ |
| Stockage fichiers | Illimité (Supabase Storage) |

---

## 10. Déploiement et CI/CD

### 10.1 Environnements

| Environnement | URL | Usage |
|---------------|-----|-------|
| **Development** | localhost:5173 | Développement local |
| **Preview** | xpress-ecg-*.vercel.app | Branches PR |
| **Production** | xpress-ecg.vercel.app | Production |

### 10.2 Pipeline CI/CD

```
GitHub Actions :
├── Push → Lint + Tests unitaires
├── PR → Tests complets + Preview Vercel
├── Merge main → Deploy Vercel Production
└── Release → Tag version + Changelog
```

### 10.3 Stratégie de Tests

| Type | Couverture | Outils |
|------|------------|--------|
| **Unitaires** | 70% | Vitest, Testing Library |
| **Intégration** | 20% | Testing Library |
| **E2E** | 10% | Playwright |
| **Accessibilité** | 100% pages | axe-core |

### 10.4 Monitoring

| Outil | Usage |
|-------|-------|
| **Vercel Analytics** | Performance frontend |
| **Supabase Dashboard** | Métriques backend |
| **Sentry** | Error tracking |
| **Uptime Robot** | Monitoring disponibilité |

---

## 📅 Roadmap de Développement

| Phase | Module | Priorité | Statut |
|-------|--------|----------|--------|
| 1 | Login + Dashboard | 🔴 Haute | ✅ Fait |
| 2 | Visualiseur ECG | 🔴 Haute | 🔲 À faire |
| 3 | Interface Médecin (Upload) | 🔴 Haute | 🔲 À faire |
| 4 | Backend Supabase | 🔴 Haute | 🔲 À faire |
| 5 | Génération Rapports PDF | 🔴 Haute | 🔲 À faire |
| 6 | Interface Secrétaire | 🟡 Moyenne | 🔲 À faire |
| 7 | Interface Administrateur | 🟡 Moyenne | 🔲 À faire |
| 8 | Notifications temps réel | 🟡 Moyenne | 🔲 À faire |
| 9 | Second Avis | 🟡 Moyenne | 🔲 À faire |
| 10 | PWA / Mode Offline | 🟢 Basse | 🔲 À faire |

---

## 📝 Historique des Versions

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | Décembre 2024 | Version initiale (Claude.ai) |
| 1.1 | Décembre 2024 | Ajout visualiseur ECG, schéma DB étendu, SLA, CI/CD |

---

**Document confidentiel - © 2024 Xpress-ECG**


# 🫀 Xpress-ECG

**Plateforme de Télé-interprétation d'Électrocardiogrammes**

![Version](https://img.shields.io/badge/version-1.0.0-indigo)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

## 📋 Description

Xpress-ECG est une application web moderne inspirée de Cardiobox (BMD Software), conçue pour centraliser et gérer les électrocardiogrammes provenant de multiples établissements de santé.

### Fonctionnalités principales

- ✅ **Tableau de bord** centralisé pour les cardiologues
- ✅ **Multi-établissements** - Gestion de plusieurs hôpitaux/cliniques
- ✅ **Workflow optimisé** - File d'attente des ECG à interpréter
- ✅ **Interface responsive** - Fonctionne sur desktop, tablette et mobile
- ✅ **Thème pastel indigo** - Design moderne et apaisant

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE-USERNAME/xpress-ecg.git

# Accéder au dossier
cd xpress-ecg

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Cardiologue | cardiologue@demo.fr | demo123 |
| Médecin | medecin@demo.fr | demo123 |
| Secrétaire | secretaire@demo.fr | demo123 |
| Admin | admin@demo.fr | demo123 |

## 🛠️ Technologies utilisées

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **Fonts**: Plus Jakarta Sans

## 📁 Structure du projet

```
xpress-ecg/
├── public/
│   └── logo.svg           # Logo de l'application
├── src/
│   ├── components/
│   │   ├── auth/          # Composants d'authentification
│   │   ├── dashboard/     # Composants du tableau de bord
│   │   └── ui/            # Composants UI réutilisables
│   ├── lib/               # Utilitaires
│   ├── App.tsx            # Composant principal
│   ├── main.tsx           # Point d'entrée
│   └── index.css          # Styles globaux
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Design

L'application utilise un thème **Pastel Indigo** moderne:
- Couleur principale: `#818CF8` (Indigo 400)
- Fond clair avec dégradés subtils
- Composants avec ombres douces
- Typographie: Plus Jakarta Sans

## 📝 Roadmap

- [ ] Phase 1: Page de connexion ✅
- [ ] Phase 2: Dashboard cardiologue ✅
- [ ] Phase 3: Visualiseur ECG
- [ ] Phase 4: Interface médecin référent
- [ ] Phase 5: Génération de rapports PDF
- [ ] Phase 6: Backend et base de données

## 👥 Équipe

Projet développé pour la gestion des ECG en milieu hospitalier.

## 📄 Licence

Projet propriétaire - Tous droits réservés © 2025


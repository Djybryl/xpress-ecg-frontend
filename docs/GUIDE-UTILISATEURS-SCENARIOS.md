# Guide utilisateurs Xpress-ECG — Scénarios d’utilisation par profil

Ce document décrit les scénarios d’utilisation de la plateforme **Xpress-ECG** par type d’utilisateur. Il sert de base pour la formation et la prise en main des fonctionnalités.

---

## 1. Vue d’ensemble des rôles

| Rôle | Rôle affiché | Accès principal |
|------|----------------|------------------|
| **Cardiologue** | Cardiologue | Interprétation des ECG, second avis, rapports |
| **Médecin référent** | Médecin Référent | Demande d’ECG, suivi des demandes, consultation des rapports |
| **Secrétaire** | Secrétaire Médicale | Réception, validation, assignation des ECG ; envoi des rapports |
| **Administrateur** | Administrateur | Utilisateurs, établissements, statistiques, tarifs, émoluments |

**Connexion** : page `/login`. En mode démo, des boutons permettent de se connecter avec un compte type (ex. Cardiologue, Médecin, Secrétaire, Admin). Sinon, saisir email et mot de passe.

---

## 2. Cardiologue

### 2.1 Tableau de bord (`/cardiologue`)

- **Objectif** : Vue synthétique de l’activité (file d’attente, urgences, terminés, second avis).
- **Actions** :
  - Voir les stats (ECG en attente, en cours, terminés, temps moyen).
  - Filtrer/trier (Tout, Urgent, Aujourd’hui, Favori).
  - Rechercher par patient, ID ou médecin.
  - Cliquer sur un ECG pour **Démarrer l’analyse** → redirection vers l’écran d’analyse.
  - Marquer des ECG en favoris.
- **Raccourcis** : accès rapides aux onglets **ECG en attente**, **ECG urgents**, **Second avis**, **Rapports ECG**.

### 2.2 ECG en attente (`/cardiologue/pending`)

- **Objectif** : Liste des ECG assignés au cardiologue, pas encore pris en charge.
- **Actions** :
  - Recherche et filtres (urgence, etc.).
  - **Démarrer l’analyse** : prise en charge de l’ECG (délai d’environ 15 min, prolongeable).
  - Aperçu détail (patient, médecin, établissement, contexte).
- **Pagination** : navigation par page.

### 2.3 ECG urgents (`/cardiologue/urgent`)

- Même interface que « ECG en attente », avec filtre **urgent** pré-sélectionné.
- Priorité visuelle (badges, tri) pour traiter les urgences en premier.

### 2.4 Attente second avis (`/cardiologue/second-opinion`)

- **Objectif** : Demandes de second avis d’un autre médecin/cardiologue sur un ECG déjà interprété.
- **Actions** :
  - Consulter la demande (contexte, analyse préliminaire, questions posées).
  - **Accepter** : prise en charge et rédaction du second avis (avec éventuel échange par messagerie).
  - **Refuser** : avec motif optionnel.
  - Discuter avec le demandeur (chat intégré si disponible).

### 2.5 En cours d’analyse

- Les ECG « en cours » sont ceux pour lesquels le cardiologue a cliqué sur **Démarrer l’analyse** sans avoir encore finalisé le rapport.
- Ils apparaissent dans le tableau de bord et peuvent être suivis (temps restant, etc.).

### 2.6 Analyse d’un ECG (`/cardiologue/analyze/:ecgId`)

- **Objectif** : Interpréter l’ECG et produire un rapport signé.
- **Étapes** :
  1. **Visualisation** : tracé ECG (image ou simulé), dérivations (ex. 6×6 + D2 long).
  2. **Outils** : bande latérale rétractile (zoom, mesures, etc.).
  3. **Mesures** : fréquence, axes, intervalles (PR, QRS, QT, etc.), selon les champs prévus.
  4. **Interprétation** : conclusion, caractère normal/anormal, commentaires.
  5. **Signature et envoi** :
     - Génération du rapport PDF (avec signature électronique simulée).
     - **Envoi automatique** du rapport au médecin demandeur (réception immédiate, sans passage obligatoire par la secrétaire).
- **Options** : brouillon, demande de second avis, comparaison avec un ECG précédent (si proposé dans l’interface).

### 2.7 Rapports ECG / Terminés (`/cardiologue/completed`)

- **Objectif** : Consulter l’historique des ECG interprétés par le cardiologue.
- **Actions** :
  - Recherche et filtres (résultat normal/anormal, période : tout / aujourd’hui / semaine).
  - Voir le détail et **ouvrir le rapport PDF** (aperçu ou téléchargement).
- **Pagination** : liste paginée.

### 2.8 Statistiques (`/cardiologue/statistics`)

- **Objectif** : Vue statistique de l’activité (nombre d’ECG, délais, répartition, etc.).
- Consultation uniquement ; pas d’actions métier.

---

## 3. Médecin référent

### 3.1 Tableau de bord (`/medecin`)

- **Objectif** : Synthèse des demandes et des rapports reçus.
- **Contenu** : raccourcis vers « Nouvel ECG », « Mes demandes », « Rapports reçus », et éventuellement indicateurs (ex. rapports non lus).
- **Actions** : accès directs aux écrans listés ci-dessous.

### 3.2 Nouvel ECG (`/medecin/new-ecg`)

- **Objectif** : Créer une demande d’interprétation ECG (patient + fichier(s) + contexte).
- **Étapes** :
  1. **Patient** : choisir un patient existant (recherche) ou créer un nouveau (nom, date de naissance, genre, téléphone, email).
  2. **Fichiers ECG** : glisser-déposer ou sélection de fichiers (JPEG, PNG, PDF, DICOM, etc., selon les formats acceptés). Prévisualisation possible.
  3. **Contexte** : date de l’ECG, urgence (normal / urgent), contexte clinique (texte libre ou modèles : douleur thoracique, palpitations, dyspnée, syncope, bilan, pré-op, suivi).
- **Action** : **Envoyer** → la demande est transmise (côté appli : simulation d’envoi puis redirection vers « Mes demandes »).

### 3.3 Mes demandes (`/medecin/requests`)

- **Objectif** : Suivre l’état des demandes d’ECG (en attente, en cours, terminé).
- **Actions** :
  - Recherche et filtres (état, urgence, etc.).
  - Consulter le détail d’une demande.
  - Voir le rapport dès qu’il est disponible (lien vers « Rapports reçus » ou détail).

### 3.4 Rapports reçus (`/medecin/reports`)

- **Objectif** : Consulter les rapports d’interprétation reçus (reçus immédiatement après signature et envoi par le cardiologue).
- **Actions** :
  - Filtrer (tous / non lus / lus).
  - Recherche (patient, ID ECG, conclusion).
  - **Ouvrir** un rapport (vue détail avec mesures, conclusion, PDF).
  - Marquer comme lu.
  - Export (PDF, Excel) si proposé dans l’interface.

### 3.5 Mes patients (`/medecin/patients`)

- **Objectif** : Liste des patients du médecin (avec par ex. date du dernier ECG).
- **Actions** : recherche, consultation du détail, utilisation pour « Nouvel ECG ».

### 3.6 Historique (`/medecin/history`)

- **Objectif** : Historique des demandes et des rapports (consultation, pas de modification).

---

## 4. Secrétaire médicale

### 4.1 Tableau de bord (`/secretaire`)

- **Objectif** : Vue d’ensemble des tâches (réception, à assigner, envoi de rapports).
- **Contenu** : indicateurs et accès aux écrans Réception, À assigner, Envoi rapports, Règles de routage, Patients, Archives.

### 4.2 Réception ECG (`/secretaire/inbox`)

- **Objectif** : Traiter les ECG reçus (en provenance des médecins) avant assignation.
- **Actions** :
  - Voir la liste des ECG « reçus » (non encore validés).
  - **Valider** un ou plusieurs ECG → ils passent en statut « validé » et peuvent être assignés.
  - **Rejeter** un ECG (avec motif si prévu) → le médecin peut être notifié.
  - Aperçu détail (patient, médecin, urgence, pièces jointes).
- **Pagination** : liste paginée.

### 4.3 À assigner (`/secretaire/assign`)

- **Objectif** : Assigner les ECG validés à un cardiologue.
- **Actions** :
  - Voir la liste des ECG « validés » (prêts à être assignés).
  - Sélectionner un ou plusieurs ECG.
  - **Assigner** : choix du cardiologue (liste ou sélection) puis confirmation → l’ECG apparaît dans la file du cardiologue (ECG en attente).
  - **Auto-assignation** : répartition automatique (ex. au cardiologue le moins chargé), en priorisant les urgences.
- **Filtres** : urgence, recherche patient/ID/médecin.
- **Pagination** : liste paginée.

### 4.4 Envoi rapports (`/secretaire/send-reports`)

- **Objectif** : Gérer les rapports « prêts à envoyer » (état après interprétation par le cardiologue).  
  *Note : le rapport est déjà reçu par le médecin demandeur dès la signature par le cardiologue ; cet écran permet un suivi / envoi formel (ex. notification, envoi courriel) côté secrétariat.*
- **Actions** :
  - Voir les rapports en statut « prêt à envoyer ».
  - Sélectionner un ou plusieurs rapports.
  - **Marquer comme envoyé** (avec éventuel message ou pièce jointe) → suivi côté secrétariat.
  - Aperçu du rapport (patient, conclusion, PDF).
- **Onglets** : à envoyer / envoyés (récents).
- **Pagination** : liste paginée.

### 4.5 Règles de routage (`/secretaire/routing`)

- **Objectif** : Consulter ou configurer les règles d’assignation automatique (ex. par établissement, par urgence, par type de cardiologue).
- **Usage** : selon l’implémentation (règles simulées ou réelles).

### 4.6 Patients (`/secretaire/patients`)

- **Objectif** : Liste des patients (vue secrétariat), pour recherche ou vérification.

### 4.7 Archives (`/secretaire/archives`)

- **Objectif** : Consultation des dossiers / ECG archivés (consultation, pas de modification).

---

## 5. Administrateur

### 5.1 Tableau de bord (`/admin`)

- **Objectif** : Synthèse (utilisateurs, établissements, ECG du mois, temps de réponse moyen, répartition des rôles, activité récente).
- **Actions** : accès directs aux sous-pages (Utilisateurs, Établissements, Statistiques, Tarifs, Émoluments, etc.).

### 5.2 Utilisateurs (`/admin/users`)

- **Objectif** : Gestion des comptes (cardiologues, médecins, secrétaires, admins).
- **Actions** :
  - Liste avec filtres (rôle, statut, recherche).
  - **Créer** un utilisateur (nom, email, rôle, établissement, etc.).
  - **Modifier** (profil, rôle, statut actif/inactif).
  - **Activer / Désactiver** un compte.
  - **Supprimer** (si prévu).
- **Pagination** : liste paginée.

### 5.3 Établissements (`/admin/hospitals`)

- **Objectif** : Gestion des établissements de santé (nom, adresse, contact, statut).
- **Actions** : création, modification, désactivation, consultation des utilisateurs rattachés.

### 5.4 Statistiques (`/admin/statistics`)

- **Objectif** : Tableaux de bord et indicateurs globaux (volume d’ECG, répartition par rôle, par établissement, délais, etc.).
- **Usage** : consultation et éventuellement export.

### 5.5 Paramètres tarifaires (`/admin/tarifs`)

- **Objectif** : Configuration des grilles tarifaires (actes, éventuellement par établissement ou type d’acte).
- **Actions** : consulter, modifier les tarifs (selon l’implémentation).

### 5.6 Émoluments & Paiements (`/admin/emoluments`)

- **Objectif** : Gestion des émoluments (validation des périodes, des montants, suivi des paiements).
- **Actions** : validation de mois, consultation des montants par utilisateur ou établissement.

### 5.7 Émoluments spéciaux (`/admin/special-emoluments`)

- **Objectif** : Gestion des émoluments spéciaux (actes ou situations particuliers).
- **Actions** : création, validation, suivi (selon l’implémentation).

### 5.8 Rapports financiers (`/admin/financial`)

- **Objectif** : Synthèse financière (chiffre d’affaires, émoluments, par période ou par établissement).
- **Usage** : consultation et export si disponible.

### 5.9 Paramètres système (`/admin/settings`)

- **Objectif** : Paramètres généraux de l’application (peut être en construction selon la version).

### 5.10 Logs d’activité (`/admin/logs`)

- **Objectif** : Consultation des logs (connexions, actions sensibles, erreurs) pour audit et dépannage.

---

## 6. Parcours transversaux (flux métier)

### 6.1 Demande d’interprétation ECG (médecin → secrétaire → cardiologue → médecin)

1. **Médecin** : Nouvel ECG → saisie patient, fichiers, urgence, contexte → Envoyer.
2. **Secrétaire** : Réception ECG → Valider (éventuellement Rejeter).
3. **Secrétaire** : À assigner → Assigner à un cardiologue.
4. **Cardiologue** : ECG en attente → Démarrer l’analyse → Analyse (mesures, interprétation) → Signer et envoyer.
5. **Médecin** : le rapport est reçu immédiatement (Rapports reçus) ; la secrétaire peut en parallèle marquer le rapport comme « envoyé » dans Envoi rapports.

### 6.2 Second avis

1. Un médecin ou un confrère demande un second avis sur un ECG (contexte + questions).
2. **Cardiologue** : Attente second avis → Accepter ou Refuser.
3. Si accepté : rédaction du second avis et éventuel échange (chat).
4. Le demandeur consulte la réponse dans son espace (demandes ou rapports, selon le flux).

### 6.3 Fonctionnalités communes à tous les profils

- **En-tête** : logo, rôle, recherche globale (⌘K / Ctrl+K), notifications, menu utilisateur (Profil, Paramètres, Déconnexion).
- **Profil** (`/profile`) : consulter/modifier ses informations personnelles.
- **Paramètres** (`/settings`) : préférences utilisateur (selon l’implémentation).
- **Déconnexion** : retour à la page de connexion.

---

## 7. Notifications

- **Cardiologue** : ECG urgent, nouvel ECG assigné, demande de second avis, rapport validé.
- **Médecin** : rapport disponible (souvent dès envoi par le cardiologue).
- **Secrétaire** : nouveaux ECG reçus, rapports prêts à envoyer.
- **Admin** : nouvel utilisateur en attente, rapport financier disponible, etc.

Les notifications s’affichent dans la cloche de l’en-tête ; certaines pages affichent aussi des badges (nombre d’éléments en attente).

---

## 8. Récapitulatif des permissions (référence)

| Action | Cardiologue | Médecin | Secrétaire | Admin |
|--------|-------------|---------|------------|-------|
| Analyser un ECG | ✅ | ❌ | ❌ | ❌ |
| Déposer / envoyer un ECG | ❌ | ✅ | ✅ | ❌ |
| Assigner un ECG | ❌ | ❌ | ✅ | ❌ |
| Envoyer / marquer rapports | ✅ (envoi au médecin) | ❌ | ✅ (suivi envoi) | ❌ |
| Demander un second avis | ✅ | ❌ | ❌ | ❌ |
| Donner un second avis | ✅ | ❌ | ❌ | ❌ |
| Gérer les patients | ❌ | ✅ | ✅ | ❌ |
| Gérer utilisateurs / établissements | ❌ | ❌ | ❌ | ✅ |
| Voir les statistiques | ✅ | ✅ | ✅ | ✅ |
| Accès administration | ❌ | ❌ | ❌ | ✅ |

---

*Document généré pour la formation des utilisateurs de la plateforme Xpress-ECG. À adapter selon les évolutions fonctionnelles et les choix d’organisation (rôle de la secrétaire dans l’envoi des rapports, règles de routage, etc.).*

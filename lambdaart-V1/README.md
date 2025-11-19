# Lambda'Art - Documentation Complète du Projet

Plateforme de formation Lambda'Art construite avec Next.js 15, Firebase Firestore et Turbopack. Site web responsive pour présenter les modules de formation avec formulaire d'inscription intégré.

---

## 📋 Sommaire
- [Présentation](#présentation)
- [Pile Technique](#pile-technique)
- [Architecture & Structure](#architecture--structure)
- [Composants Clés](#composants-clés)
- [Flux de Données](#flux-de-données)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Configuration](#configuration)
- [Variables d'Environnement](#variables-denvironnement)
- [Firebase Setup](#firebase-setup)
- [Règles Firestore](#règles-firestore)
- [Turbopack Configuration](#turbopack-configuration)
- [Scripts NPM](#scripts-npm)
- [Démarrage Rapide](#démarrage-rapide)
- [Déploiement](#déploiement)
- [Conventions de Code](#conventions-de-code)
- [Dépannage](#dépannage)
- [Historique des Modifications](#historique-des-modifications)
- [Roadmap Future](#roadmap-future)

---

## 🎯 Présentation

Lambda'Art est une plateforme web moderne pour présenter des formations pratiques et artisanales. Le site comprend :

- **Page d'accueil** avec section de bienvenue et CTA
- **Liste dynamique des modules** de formation (chargés depuis Firebase)
- **Formulaire d'inscription** avec redirection WhatsApp automatique
- **Architecture Server/Client** optimisée pour les performances

L'application utilise l'**App Router** de Next.js 15 avec des Server Components pour la récupération des données et des Client Components pour l'interactivité.

---

## 🛠️ Pile Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15.3.2 | Framework React avec App Router |
| **React** | 19.0.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Turbopack** | Latest | Bundler ultra-rapide pour le développement |
| **Firebase** | 11.8.1 | Backend (Firestore + Auth) |
| **Tailwind CSS** | 4.x | Framework CSS utilitaire |
| **Cloudinary** | 2.6.1 | Gestion et optimisation des images |

---

## 🏗️ Architecture & Structure

```
app/
├── components/                  # Composants React réutilisables
│   ├── PageClient.tsx          # Orchestrateur côté client (scroll, interactions)
│   ├── RegistrationForm.tsx    # Formulaire d'inscription avec validation
│   ├── ModulesList.tsx         # Liste des modules de formation
│   ├── WelcomeSection.tsx      # Section d'accueil avec CTA
│   └── ErrorFallback.tsx       # Interface d'erreur gracieuse
├── lib/
│   └── firebase.ts             # Configuration Firebase avec garde-fous
├── page.tsx                    # Server Component principal (récupération données)
├── layout.tsx                  # Layout racine de l'application
└── globals.css                 # Styles globaux Tailwind

next.config.ts                  # Configuration Turbopack et Webpack
package.json                    # Dépendances et scripts
tsconfig.json                   # Configuration TypeScript
```

### **Principe Server/Client**
- **`app/page.tsx`** : Server Component qui fetch les données Firebase côté serveur
- **`PageClient.tsx`** : Client Component qui gère les interactions (scroll, animations)
- **Données** : Passées du serveur vers le client via props

---

## 🔧 Composants Clés

### **Server Components**
- **`app/page.tsx`**
  - Récupère `modulesData` depuis Firestore
  - Récupère `whatsappNumber` depuis settings
  - Gère les erreurs avec fallback gracieux
  - Passe les données à `PageClient`

### **Client Components**
- **`PageClient.tsx`**
  - Gère le scroll vers les sections
  - Coordonne les interactions utilisateur
  - Conteneur pour les composants interactifs

- **`WelcomeSection.tsx`**
  - Section d'introduction avec texte et CTA
  - Bouton "Je m'inscris" → scroll vers formulaire

- **`ModulesList.tsx`**
  - Affiche la liste des modules sous forme de cartes
  - Reçoit `modulesData` en props

- **`RegistrationForm.tsx`**
  - Formulaire d'inscription avec validation
  - Redirection WhatsApp automatique
  - Reçoit `modulesData` et `whatsappNumber`

- **`ErrorFallback.tsx`**
  - Interface d'erreur utilisateur-friendly
  - Bouton de retry pour recharger la page

---

## 🔄 Flux de Données

```mermaid
graph TD
    A[Utilisateur ouvre /] --> B[app/page.tsx Server Component]
    B --> C[getModules() - Firestore]
    B --> D[getWhatsappNumber() - Firestore]
    C --> E[Collection 'modules']
    D --> F[Document 'settings/global']
    B --> G[PageClient avec données]
    G --> H[WelcomeSection + CTA]
    G --> I[ModulesList avec modules]
    G --> J[RegistrationForm avec WhatsApp]
    J --> K[Clic → Ouverture WhatsApp]
```

### **Gestion des Erreurs**
- **Server-side** : Try/catch dans les fonctions de fetch
- **Client-side** : Error boundary avec UI de fallback
- **Fallback data** : Modules d'exemple si Firebase indisponible

---

## ⚙️ Configuration

### **Variables d'Environnement (.env.local)**

Créez un fichier `.env.local` à la racine :

```env
# Firebase Configuration (obligatoire)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary (optionnel - pour upload d'images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optimisations développement
NEXT_PUBLIC_TURBOPACK=1
NODE_ENV=development
```

### **Configuration Next.js (next.config.ts)**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images optimisées
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Turbopack (bundler rapide)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Optimisations production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuration build
  output: 'standalone',
};

export default nextConfig;
```

---

## 🔥 Firebase Setup

### **1. Créer un Projet Firebase**
1. Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez **Firestore Database** et **Authentication**

### **2. Structure Firestore**
```
Firestore Database/
├── modules/                    # Collection des modules de formation
│   ├── web-development/
│   │   ├── slug: "web-development"
│   │   ├── iconSrc: "💻"
│   │   ├── title: "Développement Web"
│   │   └── shortDesc: "HTML, CSS, JavaScript..."
│   └── mobile-apps/
│       └── ...
└── settings/                   # Configuration globale
    └── global/
        └── whatsappNumber: "+22967507870"
```

### **3. Règles de Sécurité Firestore**

**Pour le développement** (copiez-collez dans Firebase Console) :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Modules - lecture publique, écriture authentifiée
    match /modules/{moduleId} {
      allow read: if true;           // Tout le monde peut lire
      allow write: if request.auth != null; // Seulement utilisateurs connectés
    }

    // Paramètres globaux - lecture publique
    match /settings/{docId} {
      allow read: if true;           // Lecture pour tous (WhatsApp, etc.)
      allow write: if request.auth != null; // Écriture restreinte
    }
  }
}
```

**⚠️ Important** : Après modification, cliquez sur **"Publier"** dans la console Firebase.

---

## 🚀 Scripts NPM

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `next dev --turbopack` | Serveur de développement avec Turbopack |
| `build` | `next build` | Build de production |
| `start` | `next start` | Serveur de production |
| `lint` | `next lint` | Vérification du code (ESLint) |

---

## 🏁 Démarrage Rapide

### **Prérequis**
- Node.js 18+ installé
- npm ou yarn
- Compte Firebase

### **Installation**

```bash
# 1. Cloner le projet
git clone <repository-url>
cd lambda-art

# 2. Installer les dépendances
npm install

# 3. Configurer Firebase
cp .env.example .env.local
# Éditer .env.local avec vos vraies clés Firebase

# 4. Lancer le serveur de développement
npm run dev
```

### **Vérification**
1. Ouvrez http://localhost:3000
2. Vérifiez que les modules s'affichent
3. Testez le formulaire d'inscription
4. Vérifiez les logs console pour les erreurs Firebase

---

## 🚢 Déploiement

### **Vercel (Recommandé)**
1. Push vers GitHub/GitLab
2. Connectez à [Vercel](https://vercel.com)
3. Configurez les variables d'environnement
4. Déployez automatiquement

### **Autres Platforms**
- Netlify
- Railway
- Digital Ocean App Platform

**Variables d'environnement** : Toutes les `NEXT_PUBLIC_*` variables doivent être configurées dans la plateforme de déploiement.

---

## 📏 Conventions de Code

### **TypeScript**
- Interface pour tous les objets de données
- Types stricts pour les props et state
- Noms descriptifs en camelCase

### **Composants**
- **Server Components** : Pour la récupération de données
- **Client Components** : Pour l'interactivité (`'use client'`)
- Imports en haut du fichier

### **Git**
- Commits en français avec emoji
- Branches feature/* pour les nouvelles fonctionnalités
- Pull requests avec description détaillée

---

## 🔧 Dépannage

### **Erreurs Firebase Courantes**

#### **"Permission Denied"**
```bash
# Solution : Vérifier les règles Firestore
1. Console Firebase → Firestore → Règles
2. Vérifier que "allow read: if true;" est présent
3. Cliquer sur "Publier"
4. Redémarrer le serveur: npm run dev
```

#### **Variables d'environnement non chargées**
```bash
# Solution :
1. Vérifier le nom du fichier: .env.local
2. Redémarrer le serveur après modification
3. Vérifier la syntaxe (pas d'espaces autour du =)
```

#### **Images qui ne se chargent pas**
```bash
# Solution :
1. Vérifier next.config.ts images.domains
2. Vérifier que les URLs Cloudinary sont valides
```

### **Performance**
- Turbopack activé par défaut pour le développement
- Images optimisées via Next.js Image component
- Code splitting automatique par Next.js

---

## 📚 Historique des Modifications

### **Version Actuelle - Next.js 15 + Turbopack**
- ✅ Migration vers **Server Components** pour les performances
- ✅ **Turbopack** pour un développement plus rapide
- ✅ **Gestion d'erreurs robuste** avec fallback UI
- ✅ **Documentation complète** du projet
- ✅ **Suppression des fichiers PHP** obsolètes

### **Modifications Récentes**

#### **🔧 Refactorisation Architecture**
- **Avant** : Tout en Client Components
- **Après** : Server Components pour fetch + Client Components pour interactions
- **Impact** : Meilleures performances, meilleur SEO

#### **⚡ Optimisation Turbopack**
- Migration de `experimental.turbo` vers `turbopack` (API stable)
- Configuration SVG loader optimisée
- Console logs supprimés en production

#### **🛡️ Amélioration Sécurité**
- Règles Firestore sécurisées pour le développement
- Gestion d'erreurs gracieuse côté serveur
- Variables d'environnement sécurisées

#### **📦 Nettoyage**
- Suppression `react-router-dom` (inutile avec Next.js)
- Suppression fichiers PHP (`composer.*`, `vendor/`)
- Réorganisation des composants

---

## 🎯 Roadmap Future

### **Phase 1 - Administration** (Priorité Haute)
- [ ] Interface d'administration pour gérer les modules
- [ ] Authentification admin avec rôles
- [ ] Upload d'images intégré (Cloudinary)

### **Phase 2 - Fonctionnalités Utilisateur** (Priorité Moyenne)
- [ ] Système d'authentification complet
- [ ] Inscription aux modules
- [ ] Dashboard utilisateur

### **Phase 3 - Optimisations** (Priorité Basse)
- [ ] Tests unitaires (Jest/Vitest)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Monitoring et analytics

### **Phase 4 - Production**
- [ ] Règles Firestore production-grade
- [ ] Optimisations performances
- [ ] Cache avancé (Redis)
- [ ] CDN pour les assets

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m "✨ Ajout nouvelle fonctionnalité"`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

### **Guidelines**
- Respecter les conventions TypeScript
- Ajouter des commentaires pour le code complexe
- Tester sur mobile et desktop
- Mettre à jour la documentation si nécessaire

---

## 📞 Support

- **Issues** : Ouvrez une issue sur GitHub
- **Discussions** : Utilisez les Discussions GitHub pour les questions
- **Documentation** : Cette README est mise à jour régulièrement

---

**Lambda'Art** - L'Art de faire, à Portée de Main 🎨


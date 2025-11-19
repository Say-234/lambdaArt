# Plan de Développement de l'Application

Ce document détaille les différentes phases et tâches nécessaires à la mise en œuvre des nouvelles fonctionnalités de la plateforme.

---

## Phase 1: Refonte et Intégration UI/UX

### 1.1 Nouvelle Page d'Accueil
- [ ] Mettre en place la barre de navigation principale (Accueil, Formations, Marketplace).
- [ ] Créer la nouvelle section de présentation de la plateforme.
- [ ] Intégrer un carrousel ou un défilement pour l'aperçu des modules de formation.
- [ ] Ajouter une section de présentation de la marketplace.
- [ ] Développer la section pour les avis et témoignages.

### 1.2 Intégration de Shadcn/ui
- [ ] Installer et configurer Shadcn/ui dans le projet.
- [ ] Remplacer les composants existants par ceux de Shadcn pour une cohérence graphique.
- [ ] S'assurer que l'ensemble du site est responsive.
- [ ] Améliorer les animations et micro-interactions.

---

## Phase 2: Développement de la Marketplace

### 2.1 Cœur de la Marketplace
- [ ] Créer la page principale listant tous les articles.
- [ ] Développer la page de détail pour un article.
- [ ] Mettre en place la structure de données sur Firebase pour les articles.

### 2.2 Espace Vendeur
- [ ] Mettre en place un système d'authentification pour les vendeurs.
- [ ] Créer un tableau de bord vendeur pour la gestion des produits.
- [ ] Développer les formulaires d'ajout et de modification d'articles.

### 2.3 Système de Paiement
- [ ] Rechercher et choisir une solution de paiement compatible avec MTN Momo et MOOV Money.
- [ ] Intégrer l'API de paiement pour gérer les transactions.
- [ ] Mettre en place la logique de gestion des commissions.

### 2.4 Intégration WhatsApp
- [ ] Analyser la faisabilité de l'importation de catalogues WhatsApp Business.
- [ ] Mettre en place un système de notifications de commande via WhatsApp.

---

## Phase 3: Dashboard pour les Établissements

### 3.1 Gestion des Comptes
- [ ] Créer les pages d'inscription et de connexion pour les établissements.
- [ ] Mettre en place la logique d'authentification spécifique.

### 3.2 Suivi des Apprenants
- [ ] Développer l'interface de visualisation des apprenants inscrits par l'établissement.
- [ ] Mettre en place les graphiques et statistiques de suivi.

### 3.3 Gestion des Inscriptions
- [ ] Permettre aux établissements d'inscrire directement leurs apprenants.
- [ ] Adapter le formulaire d'inscription pour inclure une référence "établissement".

---

## Phase 4: Améliorations du Super Admin

### 4.1 Refonte du Dashboard
- [ ] Réorganiser le dashboard avec une barre de navigation latérale.
- [ ] Créer une page d'accueil avec des statistiques globales.

### 4.2 Gestion Avancée des Modules
- [ ] Ajouter le champ "prix" aux modules de formation.
- [ ] Implémenter la fonctionnalité pour masquer/afficher un module.

### 4.3 Gestion du Contenu (CMS)
- [ ] Développer une interface pour éditer les textes principaux du site (présentation, etc.).
- [ ] Permettre la personnalisation du formulaire d'inscription depuis le dashboard.

### 4.4 Publicité et Mise en Avant
- [ ] Créer l'interface de gestion des bannières publicitaires.
- [ ] Développer la logique pour mettre en avant certains articles sur la marketplace.

---

## Phase 5: Sécurité et Authentification

### 5.1 Système d'Authentification Robuste
- [ ] Mettre en place une authentification multi-rôles (Super Admin, Établissement, Vendeur).
- [ ] Intégrer une option de "mot de passe oublié".
- [ ] Envisager l'ajout de fournisseurs OAuth (Google, etc.).

### 5.2 Renforcement de la Sécurité
- [ ] Mettre en place la validation des données côté serveur (API Routes).
- [ ] Ajouter des headers de sécurité (CSP, HSTS).
- [ ] Se protéger contre les attaques communes (CSRF, XSS).

---

## Phase 6: Tests et Documentation

### 6.1 Tests Continus
- [ ] Rédiger des tests unitaires pour les fonctions critiques.
- [ ] Mener des tests d'intégration à la fin de chaque phase majeure.

### 6.2 Documentation
- [ ] Mettre à jour le `README.md` avec les nouvelles fonctionnalités.
- [ ] Documenter les décisions d'architecture et les composants complexes.

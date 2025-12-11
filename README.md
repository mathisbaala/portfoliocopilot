# 📊 Portfolio Copilot

Application web moderne permettant d'analyser et visualiser simplement les produits financiers (ETF, OPCVM) à partir de leurs Documents d'Information Clé (DIC). Dashboard interactif avec graphiques de performance, simulateur d'investissement et scénarios financiers détaillés.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (pour l'authentification et stockage futur)

### Installation

```bash
# Cloner le repository
git clone https://github.com/mathisbaala/portfoliocopilot.git
cd portfolio-copilot

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local avec :
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Lancer en développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ✨ Fonctionnalités

### 📊 Dashboard Produits Financiers
- **Vue d'ensemble** : Accès rapide aux 3 produits disponibles (CAC 40, S&P 500, MSCI World)
- **Cartes cliquables** : Navigation intuitive vers chaque produit financier
- **Statistiques visuelles** : Nombre de documents, analyses en cours

### 📈 Visualisation Interactive des Produits
- **Graphique historique** : Évolution de la performance avec filtres temporels (1an, 3ans, 5ans, Max)
- **Simulateur d'investissement** : Calcul automatique des montants personnalisables
- **4 scénarios de performance** : Stress, défavorable, intermédiaire, favorable
- **KPI Cards** : Métriques clés (niveau de risque, frais totaux, cotation boursière)
- **Informations légales** : Accordéon avec ISIN, régulateur, documentation officielle
- **Design responsive** : Optimisé pour mobile, tablette et desktop

### 📋 Produits Disponibles
Trois fichiers d'exemple dans `src/data/` :
- **ETF CAC 40 Acc** (`amundi-cac40-etf.json`) - Amundi
- **ETF S&P 500 Acc** (`amundi-sp500-etf.json`) - Amundi
- **ETF MSCI World** (`sample-msci-world.json`) - BlackRock

### 🔐 Authentification Supabase
- **Inscription/Connexion** : Magic links (liens de connexion par email)
- **Sessions persistantes** : Gestion automatique des tokens
- **Protection des routes** : Middleware Next.js pour `/dashboard` (désactivable)
- **Page login** : Interface épurée avec formulaire d'authentification

### 💾 Base de données Supabase (Infrastructure)
- **Table `documents`** : Stockage futur des DIC uploadés
- **Row Level Security (RLS)** : Isolation des données par utilisateur
- **Supabase Storage** : Bucket `dic-documents` pour les fichiers PDF
- **Schema PostgreSQL** : Script `supabase-schema.sql` fourni

---

## 🛠 Stack technique

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

- **Next.js 16** - App Router, Server Components, Middleware
- **React 19** - Composants modernes avec hooks
- **TypeScript** - Typage strict pour la robustesse du code
- **Tailwind CSS v4** - Design system responsive et personnalisé
- **Framer Motion** - Animations fluides et transitions
- **Radix UI** - Composants accessibles (Label, Separator, Slot)
- **Shadcn/ui** - Bibliothèque de composants UI réutilisables
- **Lucide React** - Icônes modernes et cohérentes
- **Sonner** - Notifications toast élégantes
- **Recharts** - Graphiques interactifs pour la performance financière

### Backend & Base de données
[![Supabase](https://img.shields.io/badge/Supabase-2.80.0-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

- **Supabase** - Backend as a Service
  - **PostgreSQL** - Base de données relationnelle
  - **Auth** - Authentification magic link sécurisée
  - **Row Level Security (RLS)** - Sécurité au niveau des lignes
  - **Storage** - Bucket pour fichiers DIC (PDF)
  - **SSR** - Support Server-Side Rendering avec `@supabase/ssr`

### Validation & Utilitaires
- **Zod** - Validation de schémas TypeScript
- **class-variance-authority** - Gestion des variantes de composants
- **clsx + tailwind-merge** - Manipulation des classes CSS

---

## 📁 Structure du projet

```
portfolio-copilot/
├── src/
│   ├── app/                    # Routes Next.js App Router
│   │   ├── globals.css        # Styles globaux
│   │   ├── layout.tsx         # Layout racine (Navbar, Footer, Toaster)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── dashboard/         # Dashboard principal
│   │   │   └── page.tsx       # Vue d'ensemble des produits
│   │   ├── login/             # Authentification
│   │   │   └── page.tsx       # Page de connexion (magic link)
│   │   └── product/           # Visualisation des produits
│   │       ├── page.tsx       # Liste des produits (redirect dashboard)
│   │       └── [id]/          # Page produit dynamique
│   │           └── page.tsx   # Dashboard détaillé par produit
│   ├── components/            # Composants React
│   │   ├── navbar.tsx         # Barre de navigation
│   │   ├── footer.tsx         # Pied de page
│   │   ├── product/           # Composants dashboard produit
│   │   │   ├── custom-investment-input.tsx
│   │   │   ├── financial-product-dashboard.tsx
│   │   │   ├── historical-chart.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── kpi-grid.tsx
│   │   │   ├── legal-info.tsx
│   │   │   ├── performance-scenarios.tsx
│   │   │   ├── product-header.tsx
│   │   │   ├── question-section.tsx
│   │   │   ├── section-1-what.tsx
│   │   │   ├── section-2-how.tsx
│   │   │   ├── section-3-risk.tsx
│   │   │   ├── section-4-liquidity.tsx
│   │   │   ├── section-5-costs.tsx
│   │   │   └── index.ts       # Barrel export
│   │   └── ui/                # Composants Shadcn/ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       └── textarea.tsx
│   ├── config/                # Configuration
│   │   └── products.ts        # Liste des produits disponibles
│   ├── data/                  # Données JSON des produits
│   │   ├── amundi-cac40-etf.json
│   │   ├── amundi-sp500-etf.json
│   │   └── sample-msci-world.json
│   ├── lib/                   # Utilitaires & clients
│   │   ├── supabase-browser.ts  # Client Supabase browser
│   │   ├── supabase-server.ts   # Client Supabase server
│   │   └── utils.ts             # Helpers (cn, etc.)
│   └── types/                 # Types TypeScript
│       └── financial-product.ts  # Interfaces produits financiers
├── middleware.ts              # Protection des routes (optionnel)
├── components.json            # Configuration Shadcn/ui
├── supabase-schema.sql        # Script BDD Supabase
├── next.config.ts             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
└── .github/                   # GitHub configs
    ├── WORKFLOW.md            # Guide Git workflow
    ├── TASKS.md               # Suivi des tâches
    └── pull_request_template.md
```

---

## 📊 Types de données

### Interface `FinancialProduct`

Le format JSON standardisé pour chaque produit financier :

```typescript
interface FinancialProduct {
  productName: string;           // Nom commercial du produit
  isin: string;                  // Code ISIN
  riskLevel: number;             // Niveau de risque (1-7)
  totalCosts: number;            // Frais totaux (%)
  tradedOnExchange: boolean;     // Cotation en bourse
  
  historicalPerformance: {       // Données historiques
    data: Array<{
      year: number;
      value: number;              // Performance (%)
    }>;
  };
  
  performanceScenarios: {        // Scénarios de projection
    investmentAmount: number;
    holdingPeriod: string;        // Ex: "1 an", "5 ans"
    scenarios: Array<{
      name: string;               // stress, unfavorable, moderate, favorable
      annualReturn: number;       // Rendement annuel moyen (%)
      projectedValue: number;     // Valeur projetée (€)
    }>;
  };
  
  costs: {                       // Détail des frais
    oneTime: {
      entry: number;              // Frais d'entrée (%)
      exit: number;               // Frais de sortie (%)
    };
    ongoing: {
      management: number;         // Frais de gestion annuels (%)
      transaction: number;        // Frais de transaction (%)
      ancillary: number;          // Frais accessoires (%)
    };
    incidental: {
      performanceFees: number;    // Commissions de performance (%)
    };
  };
  
  legalInfo: {                   // Informations légales
    manufacturer: string;
    regulator: string;
    website: string;
    kid_url: string;              // URL DIC officiel
  };
}
```

---

## 🎨 Design

### Palette de couleurs

Design minimaliste blanc/bleu inspiré de Bitstack :

```css
Primary:      blue-600 (#2563EB) → blue-700 (#1D4ED8)
Background:   white (#FFFFFF) → slate-50 (#F8FAFC)
Text:         slate-900 (#0F172A) → slate-600 (#475569)
Success:      green-600 (#16A34A)
Warning:      yellow-500 (#EAB308)
Error:        red-600 (#DC2626)
Border:       slate-200 (#E2E8F0)
```

### Composants UI

- **Cartes** : Ombres douces `shadow-sm`, coins arrondis `rounded-xl`
- **Boutons** : Dégradés bleus avec hover states
- **Navigation** : Fixed top avec `backdrop-blur-md`
- **Graphiques** : Palette bleue cohérente avec le design
- **Typographie** : Font system Inter pour la clarté

---

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

Rendez-vous sur [supabase.com](https://supabase.com) et créez un nouveau projet.

### 2. Exécuter le script SQL

Dans l'éditeur SQL de Supabase, exécutez le fichier `supabase-schema.sql` pour créer :
- Le schéma `app` avec la table `documents`
- Les politiques RLS (Row Level Security)
- Le bucket de stockage `dic-documents`
- Les politiques de stockage

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

### 4. Activer l'authentification (optionnel)

Dans le dashboard Supabase :
- **Authentication** → **Providers** → Activer "Email"
- Configurer les templates d'emails (Magic Link)

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Démarre le serveur de développement (port 3000)
npm run build    # Compile l'application pour la production
npm start        # Lance l'application compilée
npm run lint     # Vérifie le code avec ESLint
```

---

## 🚀 Déploiement

### Vercel (recommandé)

1. **Connecter le repository GitHub à Vercel**

2. **Configurer les variables d'environnement** :
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Déployer** : Vercel détecte automatiquement Next.js et lance le build

### Autres plateformes

Compatible avec toute plateforme supportant Next.js 16 (Netlify, Railway, etc.)

---

## 📋 Roadmap & Prochaines étapes

**Version actuelle (v0.1.0)** : Dashboard de visualisation de produits financiers

### 🎯 Fonctionnalités à venir

- [ ] **Upload de fichiers DIC (PDF)** : Interface drag-and-drop pour importer des DIC
- [ ] **Extraction automatique via IA** : Parsing intelligent des documents avec LLM
- [ ] **Analyse et synthèse** : Génération automatique de rapports simplifiés
- [ ] **Comparateur de produits** : Comparaison côte à côte de plusieurs produits
- [ ] **Alertes personnalisées** : Notifications sur la performance des produits suivis
- [ ] **Export PDF/Excel** : Génération de rapports personnalisés
- [ ] **API publique** : Endpoints pour intégration tierce
- [ ] **Multi-devises** : Support EUR, USD, GBP
- [ ] **Mode sombre** : Thème dark pour le confort visuel

### 🔜 Prochains sprints

1. **Sprint 1** : Amélioration du dashboard (filtres avancés, tri, recherche)
2. **Sprint 2** : Upload et stockage des DIC PDF
3. **Sprint 3** : Intégration LLM pour extraction de données
4. **Sprint 4** : Comparateur multi-produits

---

## 👥 Travail Collaboratif

**Pour les développeurs** : Consultez les guides dans `.github/` :

- **[WORKFLOW.md](.github/WORKFLOW.md)** - Workflow Git complet (branches, merges, conflits)
- **[TASKS.md](.github/TASKS.md)** - Répartition des tâches et statuts
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide de contribution détaillé

### 🌿 Workflow Rapide

```bash
# Matin - Récupérer les derniers changements
git checkout main && git pull origin main
git checkout -b feature/ma-feature  # ou git checkout feature/ma-feature si existe
git merge main                       # Synchroniser avec main

# Pendant - Sauvegarder régulièrement
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/ma-feature

# Soir - Merger quand c'est terminé et testé
git checkout main && git pull origin main
git merge feature/ma-feature
npm run build                        # Vérifier que tout compile
git push origin main
```

### 📝 Convention de commits

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajouter le graphique de performance
fix: corriger le calcul des scénarios
docs: mettre à jour le README
style: formater le code avec Prettier
refactor: restructurer les composants product
test: ajouter tests pour le dashboard
chore: mettre à jour les dépendances
```

---

## 📄 Licence

Tous droits réservés © 2025 Portfolio Copilot

---

**Version actuelle :** 0.1.0  
**Dernière mise à jour :** Novembre 2025

Pour toute question ou suggestion :
- Ouvrez une [issue](https://github.com/mathisbaala/portfoliocopilot/issues)
- Démarrez une [discussion](https://github.com/mathisbaala/portfoliocopilot/discussions)

Développé avec 📊 par l'équipe Portfolio Copilot


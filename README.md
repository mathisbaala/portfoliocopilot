# Portfolio Copilot

Portfolio Copilot est une application Next.js permettant d'analyser simplement les produits financiers à partir de leurs Documents d'Information Clé (DIC).

## 🚀 Stack technique

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Composants:** shadcn/ui + Radix UI
- **Animations:** framer-motion
- **Icônes:** lucide-react
- **Notifications:** sonner
- **Validation:** zod
- **Backend:** Supabase (Auth, Database, Storage)

## 📦 Installation

1. Cloner le projet
2. Installer les dépendances:

```bash
npm install
```

3. Configurer les variables d'environnement:

Créer `.env.local` avec les variables suivantes:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# OpenAI (pour extraction intelligente)
OPENAI_API_KEY=votre_cle_openai

# AWS Textract (pour extraction PDF)
AWS_ACCESS_KEY_ID=votre_access_key_id
AWS_SECRET_ACCESS_KEY=votre_secret_access_key
AWS_REGION=eu-west-3
```

4. Configurer la base de données Supabase:

Exécuter le script SQL `supabase-schema.sql` dans l'éditeur SQL de votre projet Supabase pour créer:
- Le schéma `app` avec la table `documents`
- Les politiques RLS (Row Level Security)
- Le bucket de stockage `dic-documents`
- Les politiques de stockage

5. Lancer le serveur de développement:

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts     # Upload PDF vers Supabase Storage
│   │   └── extract/route.ts    # Extraction AWS Textract + GPT-4o
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard
│   │   └── upload/page.tsx     # Page d'upload de PDF
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Page d'accueil
│   └── login/page.tsx          # Authentification
├── components/
│   ├── navbar.tsx              # Navigation
│   ├── footer.tsx              # Footer
│   └── ui/                     # Composants shadcn/ui
├── types/
│   └── dic-data.ts             # Interface TypeScript pour données DIC
└── lib/
    ├── supabase-browser.ts     # Client Supabase browser
    ├── supabase-server.ts      # Client Supabase server
    └── utils.ts                # Utilitaires
```

## 🎨 Design

Le design suit une approche minimaliste blanc/bleu inspirée de Bitstack:
- Fond blanc avec textes slate
- Couleur primaire bleue (#2563eb - blue-600, #1d4ed8 - blue-700)
- Navigation fixe avec backdrop blur
- Cartes avec ombres douces et coins arrondis
- Espacement généreux
- Typographie Inter (via système)

## 🔐 Authentification

L'authentification utilise Supabase Auth avec des "magic links" (liens de connexion envoyés par email). 
La page `/login` permet de s'authentifier. Le middleware peut être activé pour protéger les routes `/dashboard/*`.

## � Extraction de documents financiers

L'application utilise **AWS Textract + OpenAI GPT-4o** pour extraire automatiquement les données des Documents d'Information Clé (DIC).

### Fonctionnalités
- ✅ Upload de PDF via drag & drop
- ✅ Extraction OCR avec AWS Textract
- ✅ Structuration intelligente avec GPT-4o
- ✅ Export JSON des données extraites

### Données extraites
- Émetteur, nom du produit, ISIN
- Niveau de risque (SRI 1-7)
- Frais (entrée, sortie, gestion)
- Horizon de placement recommandé
- Scénarios de performance
- Stratégie d'investissement

### Configuration AWS
1. Créer compte AWS
2. Créer utilisateur IAM avec permission `AmazonTextractFullAccess`
3. Récupérer Access Key ID et Secret Access Key
4. Ajouter dans `.env.local`

## 📝 Prochaines étapes

À venir:
- Stockage des extractions en base de données
- Historique des documents traités
- Dashboard avec analytics
- Comparaison de produits
- Alertes personnalisées

## 🛠️ Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm start` - Lance l'application en mode production
- `npm run lint` - Vérifie le code avec ESLint

## � Travail Collaboratif

**Pour les développeurs** : Consultez les guides dans `.github/` :

- **[WORKFLOW.md](.github/WORKFLOW.md)** - Workflow Git complet (branches, merges, conflits)
- **[TASKS.md](.github/TASKS.md)** - Répartition des tâches et statuts
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide de contribution détaillé

### 🌿 Workflow Rapide

```bash
# Matin - Récupérer les derniers changements
git checkout main && git pull origin main
git checkout -b feature/ma-feature  # ou git checkout feature/ma-feature
git merge main

# Pendant - Sauvegarder régulièrement
git add . && git commit -m "feat: description" && git push origin feature/ma-feature

# Soir - Merger quand c'est terminé
git checkout main && git pull origin main
git merge feature/ma-feature
npm run build  # Tester !
git push origin main
```

## �📄 Licence

Tous droits réservés © 2025 Portfolio Copilot


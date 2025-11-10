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

Copier `.env.example` vers `.env.local` et remplir les valeurs Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
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
│   ├── layout.tsx          # Layout racine avec Navbar, Footer, Toaster
│   ├── page.tsx            # Page d'accueil (Home)
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard (placeholder)
│   └── login/
│       └── page.tsx        # Page de connexion (magic link)
├── components/
│   ├── navbar.tsx          # Barre de navigation
│   ├── footer.tsx          # Pied de page
│   └── ui/                 # Composants shadcn/ui
├── lib/
│   ├── supabase-browser.ts # Client Supabase pour le navigateur
│   ├── supabase-server.ts  # Client Supabase pour le serveur
│   └── utils.ts            # Utilitaires (cn)
└── middleware.ts           # Middleware Next.js (placeholder pour la protection de routes)
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

## 📝 Prochaines étapes

Version actuelle (v1): Squelette technique complet avec design épuré.

À venir:
- Upload de fichiers DIC (PDF)
- Extraction automatique des données via IA
- Analyse et synthèse des informations
- Dashboard interactif avec indicateurs clés
- Gestion de paiements (optionnel)

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


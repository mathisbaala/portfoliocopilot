# Portfolio Copilot

Application Next.js pour analyser les produits financiers à partir de leurs Documents d'Information Clé (DIC/KID).

## 🎯 Fonctionnalités principales

### 📄 Extraction PDF → JSON (Feature principale)

Extraction automatique des données financières depuis un PDF (DIC/KID) vers un JSON structuré via OpenAI GPT-4o.

**Endpoint:** `POST /api/extract`

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "https://example.com/document.pdf", "fileName": "doc.pdf"}'
```

**Réponse:** JSON structuré avec métadonnées, identité produit, risques, frais, performance, scénarios.

### 📊 Dashboard Produits

- Graphique historique interactif (1an, 3ans, 5ans, Max)
- Simulateur d'investissement
- 4 scénarios de performance
- KPI Cards (risque, frais, bourse)
- Informations légales

**URL:** `http://localhost:3000/product`

### � Upload de documents

Interface pour uploader des PDFs vers Supabase Storage.

**URL:** `http://localhost:3000/dashboard/upload`

---

## 🚀 Stack technique

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Composants:** shadcn/ui + Radix UI
- **Graphiques:** Recharts (pour le dashboard produits)
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

# OpenAI (pour structuration des données extraites)
OPENAI_API_KEY=votre_cle_openai

# AWS Textract (pour extraction OCR des PDFs)
AWS_ACCESS_KEY_ID=votre_aws_access_key_id
AWS_SECRET_ACCESS_KEY=votre_aws_secret_access_key
AWS_REGION=eu-west-1
```

4. Configurer la base de données Supabase:

Exécuter le script SQL `supabase-schema.sql` dans l'éditeur SQL de votre projet Supabase pour créer:
- Le schéma `app` avec la table `documents`
- Les politiques RLS (Row Level Security)
- Le bucket de stockage `dic-documents`
- Les politiques de stockage

5. **⚠️ Configurer AWS Textract** (obligatoire pour l'extraction PDF):

L'extraction des PDFs nécessite AWS Textract car:
- GPT-4o Vision **ne supporte pas les PDFs** (images uniquement)
- Aucune solution JavaScript pure ne fonctionne en environnement serverless (pdf-parse, pdfjs-dist nécessitent des dépendances natives)

**Étapes d'activation:**

a. Créer un compte AWS: https://aws.amazon.com (gratuit, 1000 pages/mois la première année)

b. Créer un utilisateur IAM avec accès Textract:
   - AWS Console → IAM → Utilisateurs → Créer un utilisateur
   - Permissions: Attacher la politique `AmazonTextractFullAccess`
   - Créer une clé d'accès (Access Key + Secret Key)

c. Activer Textract dans votre région:
   - AWS Console → Textract → Commencer
   - Vérifier que le service est disponible dans `eu-west-1` (Paris)

d. Ajouter les credentials dans `.env.local` (voir étape 3 ci-dessus)

**Note technique:** AWS Textract fait l'OCR (extraction du texte), puis GPT-4o structure les données en JSON. Cette architecture à 2 étapes est la seule solution compatible avec les environnements serverless (Vercel, Netlify).

6. Lancer le serveur de développement:

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
│   │   └── extract/route.ts    # Extraction GPT-4o Vision
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

## 📄 Extraction de documents financiers

L'application utilise **AWS Textract** pour l'OCR (extraction du texte) et **GPT-4o** pour la structuration intelligente des données.

### Architecture d'extraction
1. **AWS Textract** → Extrait le texte brut du PDF (OCR)
2. **GPT-4o** → Structure le texte en JSON avec validation

### Pourquoi cette architecture ?
- ❌ **GPT-4o Vision** ne supporte PAS les PDFs (images uniquement)
- ❌ **pdf-parse / pdfjs-dist** nécessitent des dépendances natives (incompatibles serverless)
- ✅ **AWS Textract + GPT-4o** fonctionne dans tous les environnements (Vercel, Netlify, etc.)

### Fonctionnalités
- ✅ Upload de PDF via drag & drop
- ✅ OCR haute qualité avec AWS Textract
- ✅ Structuration intelligente avec GPT-4o
- ✅ Export JSON des données extraites
- ✅ Supporte PDFs texte ET scannés

### Données extraites
- Émetteur, nom du produit, ISIN
- Niveau de risque (SRI 1-7)
- Frais (entrée, sortie, gestion)
- Horizon de placement recommandé
- Scénarios de performance
- Stratégie d'investissement

### Avantages de l'architecture
- ✅ Serverless-compatible (aucune dépendance native)
- ✅ OCR professionnel (AWS Textract)
- ✅ Structuration contextuelle (GPT-4o)
- ✅ Coûts raisonnables (Textract: ~0.0015€/page, GPT-4o: ~0.01€/appel)

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


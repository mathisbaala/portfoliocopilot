# Guide de collaboration

## 🚀 Pré-requis : Installer le projet sur sa machine (si vous ne l'avez pas encore)

### 1. Vérifier les outils nécessaires

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 18 ou supérieure) : [nodejs.org](https://nodejs.org)
- **Git** : [git-scm.com](https://git-scm.com)
- **Un éditeur de code** : VS Code recommandé

Vérifiez les versions :
```bash
node --version  # Doit afficher v18.x ou supérieur
npm --version   # Doit afficher 9.x ou supérieur
git --version   # Doit afficher 2.x ou supérieur
```

### 2. Cloner le projet

```bash
# se placer dans son folder "projets" (ou Bureau etc...) sur sa machine
cd Projets

# Cloner le repository depuis GitHub
git clone https://github.com/mathisbaala/portfoliocopilot.git

# Entrer dans le dossier du projet
cd portfoliocopilot
```

### 3. Installer les dépendances

```bash
# Installer tous les packages npm nécessaires
npm install
```

### 4. Configurer les variables d'environnement

```bash
# Créer le fichier de configuration local
touch .env.local
```

Ouvrez `.env.local` et ajoutez vos clés Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

> 💡 **Où trouver ces clés ?**
> - Connectez-vous à [supabase.com](https://supabase.com)
> - Ouvrez votre projet
> - Allez dans **Settings** > **API**
> - Copiez "Project URL" et "anon/public key"

### 5. Lancer le projet en local

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrez votre navigateur à l'adresse : **http://localhost:3000**

Vous devriez voir la page d'accueil ! 🎉

### 6. Vérifier que tout fonctionne

```bash
# Compiler le projet (vérifier qu'il n'y a pas d'erreurs)
npm run build
```

Si tout passe ✅, vous êtes prêt à coder !

---

## 🎯 Workflow Simple

### 1. Créer une branche pour votre feature

```bash
# Récupérer les dernières modifications
git checkout main
git pull origin main

# Créer votre branche
git checkout -b feature/nom-de-votre-feature
```

### 2. Travailler sur votre feature

```bash
# Faire vos modifications...
git add .
git commit -m "feat: description claire"
git push origin feature/nom-de-votre-feature
```

### 3. Merger directement dans main

```bash
# Une fois votre feature terminée et testée
git checkout main
git pull origin main  # Récupérer les modifs de l'autre dev
git merge feature/nom-de-votre-feature
git push origin main

# Supprimer la branche locale et distante
git branch -d feature/nom-de-votre-feature
git push origin --delete feature/nom-de-votre-feature
```

## 📋 Organisation recommandée

### Communication
- **Discord/Slack** : Indiquez sur quoi vous travaillez
  - "Je travaille sur l'upload de documents"
  - "Je fais le dashboard stats"

### Répartition claire des fichiers
Pour éviter les conflits, travaillez sur des fichiers différents :

**Dev 1** : Upload & Backend
- `src/app/dashboard/upload/`
- `src/app/api/upload/`
- `src/lib/supabase-upload.ts`

**Dev 2** : UI & Stats
- `src/app/dashboard/stats/`
- `src/components/stats/`
- `src/app/dashboard/page.tsx`

### Synchro quotidienne

**Matin** (avant de commencer - pour récupérer le travail de l'autre dev) :
```bash
# Mettre à jour main avec les changements de l'autre dev
git checkout main
git pull origin main

# Retourner sur votre branche de travail
git checkout feature/votre-feature

# Intégrer les nouveaux changements de main dans votre branche
git merge main
```
> 💡 **Pourquoi ?** L'autre dev a peut-être mergé sa feature dans `main` hier soir. Vous récupérez ses changements pour éviter les conflits plus tard.

**Pendant la journée** (sauvegarder votre travail régulièrement) :
```bash
git add .
git commit -m "feat: description"
git push origin feature/votre-feature
```
> 💡 **Astuce :** Pushez au moins 1 fois par jour, même si ce n'est pas terminé. Ça sauvegarde votre travail sur GitHub.

**Soir** (quand votre feature est terminée et testée) :
```bash
# Merger votre feature dans main
git checkout main
git pull origin main  # Au cas où l'autre dev aurait pushé entre-temps
git merge feature/votre-feature
git push origin main

# Optionnel : supprimer la branche si la feature est 100% terminée
git branch -d feature/votre-feature
git push origin --delete feature/votre-feature
```

## ⚠️ Éviter les conflits

### ✅ FAIRE
- Communiquer sur qui travaille sur quoi
- Commiter et pousser régulièrement (au moins 1x par jour)
- Tirer (pull) main avant de merger
- Travailler sur des fichiers/dossiers séparés

### ❌ ÉVITER
- Modifier les mêmes fichiers en même temps
- Pousser directement sur main sans pull avant
- Garder des changements locaux pendant plusieurs jours

## 🔧 Commandes rapides

```bash
# Statut de votre travail
git status

# Voir les changements
git diff

# Annuler des modifications locales
git checkout -- nom-du-fichier

# Récupérer les changements de main dans votre branche
git checkout feature/votre-feature
git merge main

# Voir l'historique
git log --oneline --graph --all
```

## 🎨 Conventions de commits

Exemples :
- `feat: add document upload UI`
- `fix: navbar responsive on mobile`
- `refactor: improve error handling`

## 🚨 En cas de conflit

Si vous avez un conflit lors du merge :

```bash
# 1. Git vous indiquera les fichiers en conflit
git status

# 2. Ouvrir les fichiers dans VS Code
# Les conflits sont marqués avec <<<<<<< HEAD

# 3. Résoudre manuellement les conflits
# VS Code vous aide avec des boutons "Accept Current/Incoming/Both"

# 4. Une fois résolu
git add .
git commit -m "merge: resolve conflicts"
git push
```

## 📱 Communication type

```
Dev 1: "Je commence sur feature/document-upload, je touche pas au dashboard"
Dev 2: "Ok, je prends feature/dashboard-stats alors"

[...quelques heures plus tard...]

Dev 1: "J'ai fini l'upload, je merge dans main"
Dev 2: "Ok, je pull main pour récupérer tes changements"
```

---

**Règle d'or** : Communiquez et synchronisez-vous régulièrement ! 🚀

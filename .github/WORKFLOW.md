# 🔄 Workflow Git - Travail Collaboratif

## 📋 Principe de Base

**Chaque développeur travaille sur SA propre branche feature** et merge dans `main` quand c'est terminé et testé.

---

## 🌿 Structure des Branches

```
main (branche principale - toujours stable)
  ├── feature/upload-documents (Dev 1)
  ├── feature/ia-extraction (Dev 2)
  ├── feature/dashboard-stats (Dev 3)
  └── feature/export-pdf (Dev 4)
```

---

## 🚀 Workflow Quotidien

### 1️⃣ MATIN - Avant de commencer à coder

```bash
# Récupérer les dernières modifications
git checkout main
git pull origin main

# Créer ou revenir sur votre branche feature
git checkout -b feature/nom-de-votre-feature
# OU si elle existe déjà:
git checkout feature/nom-de-votre-feature

# Intégrer les nouveautés de main dans votre branche
git merge main
```

### 2️⃣ PENDANT - Sauvegarder régulièrement

```bash
# Vérifier vos modifications
git status

# Ajouter vos fichiers modifiés
git add .

# Commit avec un message clair
git commit -m "feat: description de ce que vous avez fait"

# Pousser sur GitHub (sauvegarde cloud)
git push origin feature/nom-de-votre-feature
```

### 3️⃣ SOIR - Quand la feature est terminée

```bash
# 1. S'assurer que tout est à jour
git checkout main
git pull origin main

# 2. Retour sur votre branche
git checkout feature/nom-de-votre-feature

# 3. Intégrer les derniers changements de main
git merge main

# 4. Résoudre les conflits s'il y en a (voir section ci-dessous)

# 5. Tester que tout fonctionne
npm run build
npm run dev

# 6. Merger dans main
git checkout main
git merge feature/nom-de-votre-feature

# 7. Pousser sur GitHub
git push origin main

# 8. (Optionnel) Supprimer la branche si feature 100% terminée
git branch -d feature/nom-de-votre-feature
git push origin --delete feature/nom-de-votre-feature
```

---

## 🎯 Répartition des Features par Fichiers

### Dev 1 - Upload de Documents
**Fichiers concernés :**
- `src/app/dashboard/upload/page.tsx` (nouveau)
- `src/components/upload/file-dropzone.tsx` (nouveau)
- `src/lib/supabase-storage.ts` (nouveau)

### Dev 2 - Extraction IA
**Fichiers concernés :**
- `src/app/api/extract/route.ts` (nouveau)
- `src/lib/openai.ts` (nouveau)
- `src/lib/pdf-parser.ts` (nouveau)

### Dev 3 - Dashboard Stats
**Fichiers concernés :**
- `src/app/dashboard/stats/page.tsx` (nouveau)
- `src/components/dashboard/metrics-card.tsx` (nouveau)
- `src/components/dashboard/charts.tsx` (nouveau)

### Dev 4 - Export PDF
**Fichiers concernés :**
- `src/app/api/export/route.ts` (nouveau)
- `src/lib/pdf-generator.ts` (nouveau)

**⚠️ IMPORTANT** : Si vous devez modifier un fichier commun (ex: `layout.tsx`, `navbar.tsx`), **communiquez-le dans le groupe** !

---

## ⚠️ Résoudre les Conflits

Si Git vous dit qu'il y a des conflits :

```bash
# 1. Ouvrir le fichier en conflit dans VS Code
# Les conflits sont marqués ainsi:

<<<<<<< HEAD (votre code)
votre code ici
=======
code de l'autre dev
>>>>>>> main (code de main)

# 2. Choisir quelle version garder (ou fusionner manuellement)

# 3. Supprimer les marqueurs <<<<<<< ======= >>>>>>>

# 4. Tester que ça marche
npm run dev

# 5. Finaliser le merge
git add .
git commit -m "merge: résolution conflits avec main"
git push
```

---

## 📱 Communication Type

**Dans votre groupe Slack/Discord :**

```
Dev 1: "Je commence sur feature/upload-documents, je touche pas au dashboard ni aux APIs"

Dev 2: "Ok, je prends feature/ia-extraction alors, je vais créer des routes API"

Dev 3: "Moi je fais feature/dashboard-stats, je modifierai src/app/dashboard/page.tsx"

Dev 4: "Je m'occupe de feature/export-pdf"

---

[quelques heures plus tard...]

Dev 1: "J'ai fini l'upload, je merge dans main"
Dev 2: "Ok, je pull main pour récupérer tes changements"
Dev 3: "Pareil, je récupère"
```

---

## ✅ Checklist Avant de Merger dans Main

- [ ] Mon code compile sans erreur (`npm run build`)
- [ ] Mon code fonctionne en dev (`npm run dev`)
- [ ] Pas d'erreur ESLint (`npm run lint`)
- [ ] J'ai testé ma feature manuellement
- [ ] J'ai récupéré les derniers changements de main (`git merge main`)
- [ ] J'ai résolu tous les conflits éventuels
- [ ] J'ai prévenu l'équipe que je vais merger

---

## 🚨 Règles d'Or

1. **Ne JAMAIS push directement sur main sans tester**
2. **Toujours pull main avant de merger**
3. **Communiquer dans le groupe avant de toucher un fichier commun**
4. **Commit et push au moins 1 fois par jour** (sauvegarde)
5. **Messages de commit clairs** : `feat:`, `fix:`, `refactor:`, etc.

---

## 🔧 Commandes Rapides

```bash
# Voir où vous êtes
git branch

# Voir les modifications non commitées
git status

# Voir l'historique
git log --oneline --graph --all

# Annuler des modifications locales (ATTENTION: perte définitive)
git restore nomfichier.tsx

# Revenir à la version de main d'un fichier
git checkout main -- nomfichier.tsx

# Lister toutes les branches
git branch -a
```

---

## 📊 Exemple de Timeline

**Jour 1 Matin :**
- Tout le monde pull main
- Chacun crée sa branche feature
- Répartition des fichiers/dossiers

**Jour 1 Soir :**
- Dev 1 termine upload → merge dans main
- Dev 2, 3, 4 pull main pour récupérer

**Jour 2 Matin :**
- Tout le monde pull main
- Dev 2 termine IA → merge dans main
- Dev 3, 4 pull main

**Jour 2 Soir :**
- Dev 3 termine dashboard → merge
- Dev 4 pull et termine export → merge

**Résultat : ZÉRO CONFLIT** 🎉

---

## 🎯 En Résumé

**Matin** : `git pull origin main` → `git merge main`  
**Pendant** : `git add . && git commit && git push`  
**Soir** : `git merge main` → tester → `git push origin main`  

**Communication = Clé du succès ! 🔑**

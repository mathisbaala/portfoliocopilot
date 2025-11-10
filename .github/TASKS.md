# 📋 Répartition des Tâches - Portfolio Copilot

## 👥 Équipe et Assignments

### 🔵 Dev 1 : Upload de Documents
**Branche** : `feature/upload-documents`

**Tâches** :
- [ ] Créer composant FileDropzone (drag & drop)
- [ ] Intégrer Supabase Storage
- [ ] Upload vers bucket `dic-documents`
- [ ] Liste des documents uploadés
- [ ] Suppression de documents

**Fichiers** :
```
src/app/dashboard/upload/
├── page.tsx
└── components/
    ├── file-dropzone.tsx
    └── document-list.tsx

src/lib/
└── supabase-storage.ts
```

---

### 🟢 Dev 2 : Extraction IA
**Branche** : `feature/ia-extraction`

**Tâches** :
- [ ] Créer route API `/api/extract`
- [ ] Intégrer OpenAI/Claude
- [ ] Parser PDF → JSON
- [ ] Extraire données du DIC
- [ ] Sauvegarder dans Supabase

**Fichiers** :
```
src/app/api/extract/
└── route.ts

src/lib/
├── openai.ts
└── pdf-parser.ts
```

---

### 🟡 Dev 3 : Dashboard Statistiques
**Branche** : `feature/dashboard-stats`

**Tâches** :
- [ ] Créer page stats
- [ ] Composants metrics cards
- [ ] Graphiques (charts)
- [ ] Afficher données extraites
- [ ] Filtres et recherche

**Fichiers** :
```
src/app/dashboard/stats/
└── page.tsx

src/components/dashboard/
├── metrics-card.tsx
├── risk-chart.tsx
└── fees-breakdown.tsx
```

---

### 🟣 Dev 4 : Export PDF
**Branche** : `feature/export-pdf`

**Tâches** :
- [ ] Créer route API `/api/export`
- [ ] Générer PDF du rapport
- [ ] Template de rapport
- [ ] Bouton download
- [ ] Email du rapport (optionnel)

**Fichiers** :
```
src/app/api/export/
└── route.ts

src/lib/
├── pdf-generator.ts
└── email-sender.ts

src/components/
└── export-button.tsx
```

---

## 📅 Timeline Suggérée

### Semaine 1
**Jour 1-2** : Setup + Upload (Dev 1)  
**Jour 3-4** : Extraction IA (Dev 2)  
**Jour 5** : Intégration Upload + IA

### Semaine 2
**Jour 1-3** : Dashboard Stats (Dev 3)  
**Jour 4-5** : Export PDF (Dev 4)  
**Jour 6** : Intégration complète

### Semaine 3
**Jour 1-2** : Tests et debugging  
**Jour 3-4** : Polish UI/UX  
**Jour 5** : Déploiement production

---

## 🚦 Statut des Features

| Feature | Dev | Branche | Statut | Progress |
|---------|-----|---------|--------|----------|
| Upload Documents | Dev 1 | `feature/upload-documents` | 🔵 À faire | 0% |
| Extraction IA | Dev 2 | `feature/ia-extraction` | 🔵 À faire | 0% |
| Dashboard Stats | Dev 3 | `feature/dashboard-stats` | 🔵 À faire | 0% |
| Export PDF | Dev 4 | `feature/export-pdf` | 🔵 À faire | 0% |

**Légende** :
- 🔵 À faire
- 🟡 En cours
- 🟢 Terminé
- 🔴 Bloqué

---

## 📞 Communication

**Avant de commencer** : Annoncez dans le groupe  
**Pendant** : Push régulièrement  
**Après merge** : Prévenez l'équipe

---

## 🔄 Mise à jour de ce fichier

Chaque dev met à jour son statut quotidiennement.

```bash
# Éditer TASKS.md
# Puis commit
git add .github/TASKS.md
git commit -m "docs: update task status"
git push origin main
```

---

Dernière mise à jour : 10 novembre 2025

# ⚙️ Checklist de configuration

Utilisez cette checklist pour vérifier que tout est configuré correctement.

## ✅ Configuration Supabase

- [x] Projet Supabase créé
- [x] Variables d'environnement dans `.env.local` :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Bucket Storage `dic-documents` créé
- [x] Politiques RLS configurées (Public Upload + Public Read)

## ✅ Configuration OpenAI

- [x] Compte OpenAI créé
- [x] API Key générée
- [x] Variable dans `.env.local` : `OPENAI_API_KEY`

## ⏳ Configuration AWS Textract (À FAIRE)

- [ ] Compte AWS créé
- [ ] Utilisateur IAM créé avec permission `AmazonTextractFullAccess`
- [ ] Access Key ID et Secret Access Key récupérées
- [ ] Variables ajoutées dans `.env.local` :
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

---

## 🧪 Tests de fonctionnement

### Test 1 : Serveur démarre
```bash
npm run dev
```
✅ Serveur doit démarrer sur http://localhost:3000

### Test 2 : Page d'upload accessible
Ouvrir : http://localhost:3000/dashboard/upload
✅ Page doit s'afficher avec zone de drag & drop

### Test 3 : Upload fonctionne
- Uploader n'importe quel fichier PDF
- Vérifier logs console : `POST /api/upload 200`
✅ Fichier doit apparaître dans Supabase Storage

### Test 4 : Extraction fonctionne (NÉCESSITE AWS)
- Uploader un PDF DIC
- Vérifier logs :
  - `📥 Téléchargement du PDF`
  - `📄 Extraction du texte avec AWS Textract`
  - `📝 Texte extrait: XXX caractères`
  - `🤖 Structuration des données`
  - `✅ Extraction réussie`
✅ Données structurées doivent s'afficher

---

## 📂 Fichiers de configuration

Vérifiez que vous avez :

```
portfoliocopilot/
├── .env.local                    ← Variables d'environnement
├── AWS_SETUP.md                  ← Guide configuration AWS
├── QUICKSTART_EXTRACTION.md      ← Guide démarrage rapide
└── CONFIG_CHECKLIST.md           ← Ce fichier
```

---

## 🔐 Variables d'environnement (.env.local)

Votre fichier doit contenir :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuumvyjpyozsdnjhwmnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# AWS Textract (À CONFIGURER)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
```

---

## 🚨 Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Row-level security policy" | Créer politiques RLS sur Supabase Storage |
| "AccessDenied" AWS | Vérifier credentials AWS et permissions IAM |
| "Invalid API key" OpenAI | Vérifier OPENAI_API_KEY dans .env.local |
| "Le PDF ne contient pas de texte" | PDF est une image, AWS Textract devrait gérer |

---

## ✅ Configuration terminée ?

Si tous les tests passent :
1. Commiter vos changements (SANS `.env.local`)
2. Pusher sur GitHub
3. Déployer sur Vercel avec les variables d'environnement

---

## 📞 Prochaine étape

Suivez le guide : **[QUICKSTART_EXTRACTION.md](./QUICKSTART_EXTRACTION.md)**

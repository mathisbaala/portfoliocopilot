# 🚀 Guide de démarrage rapide - Extraction PDF

## ✅ Ce qui est DÉJÀ configuré

- ✅ Interface d'upload de PDF (drag & drop)
- ✅ Supabase Storage (bucket `dic-documents`)
- ✅ AWS Textract SDK installé
- ✅ OpenAI GPT-4o pour structuration
- ✅ Code d'extraction complet et fonctionnel

---

## 🔧 Configuration requise (5 minutes)

### 1. Configurer AWS Textract

**Vous devez créer un compte AWS et obtenir vos clés d'API.**

Suivez le guide détaillé : **[AWS_SETUP.md](./AWS_SETUP.md)**

Résumé rapide :
1. Créer compte AWS : https://aws.amazon.com/
2. Créer utilisateur IAM avec permission `AmazonTextractFullAccess`
3. Récupérer Access Key ID et Secret Access Key
4. Ajouter dans `.env.local` :

```bash
AWS_ACCESS_KEY_ID=votre_access_key_id
AWS_SECRET_ACCESS_KEY=votre_secret_access_key
AWS_REGION=eu-west-1
```

### 2. Vérifier les autres variables d'environnement

Votre `.env.local` doit contenir :

```bash
# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://tuumvyjpyozsdnjhwmnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (déjà configuré)
OPENAI_API_KEY=sk-proj-...

# AWS Textract (À CONFIGURER)
AWS_ACCESS_KEY_ID=votre_access_key_id
AWS_SECRET_ACCESS_KEY=votre_secret_access_key
AWS_REGION=eu-west-1
```

---

## 🧪 Tester l'extraction

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Ouvrir l'interface

Allez sur : **http://localhost:3000/dashboard/upload**

### 3. Uploader un PDF DIC

- Glissez-déposez un PDF de Document d'Information Clé
- Ou cliquez pour parcourir vos fichiers

### 4. Observer le processus

Vous verrez dans les logs console :

```
📥 Téléchargement du PDF depuis Supabase...
📄 Extraction du texte avec AWS Textract...
📝 Texte extrait: 3421 caractères
🤖 Structuration des données avec GPT-4o...
✅ Extraction réussie avec données réelles !
Confiance: 0.89
```

### 5. Vérifier les données

- Les données s'affichent sur la page
- Cliquez sur "Télécharger JSON" pour voir le fichier complet

---

## 📊 Flow technique complet

```
1. Utilisateur upload PDF
   ↓
2. API /api/upload
   → Upload vers Supabase Storage
   → Retourne URL publique
   ↓
3. API /api/extract
   → Télécharge PDF depuis Supabase
   → AWS Textract extrait tout le texte
   → OpenAI GPT-4o structure les données en JSON
   → Retourne DICData structuré
   ↓
4. Interface affiche les données
   → Utilisateur peut télécharger le JSON
```

---

## 🎯 Données extraites

Le JSON retourné contient :

```json
{
  "metadata": {
    "documentName": "...",
    "documentType": "SICAV/FCP/ETF"
  },
  "general": {
    "emetteur": "Société de gestion",
    "nomProduit": "Nom du fonds",
    "isin": "Code ISIN",
    "categorie": "Actions/Obligations/etc.",
    "devise": "EUR/USD"
  },
  "risque": {
    "niveau": 1-7,
    "description": "...",
    "volatilite": "..."
  },
  "frais": {
    "entree": 3.0,
    "sortie": 0,
    "gestionAnnuels": 1.8,
    "total": 2.0
  },
  "horizon": {
    "recommande": "5 ans minimum",
    "annees": 5
  },
  "scenarios": {
    "defavorable": { "montant": 7500, "pourcentage": -25 },
    "intermediaire": { "montant": 11000, "pourcentage": 10 },
    "favorable": { "montant": 14000, "pourcentage": 40 }
  },
  "strategie": {
    "objectif": "...",
    "politique": "...",
    "zoneGeographique": "...",
    "secteurs": [...]
  },
  "extraction": {
    "success": true,
    "confidence": 0.89,
    "warnings": [...]
  }
}
```

---

## 💰 Coûts

### AWS Textract
- ✅ **1000 pages gratuites/mois** pendant 3 mois
- Ensuite : ~$1.50 pour 1000 pages

### OpenAI GPT-4o
- ~$0.01 par extraction (selon longueur du document)

**Pour du développement/test** : Vous restez largement dans les limites gratuites.

---

## 🐛 Dépannage

### Erreur AWS "AccessDenied"
→ Vérifiez vos credentials AWS dans `.env.local`
→ Vérifiez que l'utilisateur IAM a la permission `AmazonTextractFullAccess`

### Erreur "Le PDF ne contient pas assez de texte"
→ Le PDF est peut-être scanné (image) sans OCR
→ AWS Textract devrait gérer ça, mais vérifiez le PDF

### Données manquantes dans l'extraction
→ Normal si le document ne contient pas toutes les informations
→ Vérifiez `extraction.warnings` dans le JSON

---

## 📝 Prochaines étapes

Une fois l'extraction fonctionnelle :

1. ✅ Tester avec plusieurs types de DIC différents
2. ✅ Affiner les prompts GPT-4o si nécessaire
3. ✅ Ajouter validation des données extraites
4. ✅ Stocker les extractions en base de données Supabase
5. ✅ Créer une page historique des documents traités

---

## 🆘 Besoin d'aide ?

- **Configuration AWS** : Voir [AWS_SETUP.md](./AWS_SETUP.md)
- **Structure des données** : Voir `src/types/dic-data.ts`
- **Code extraction** : Voir `src/app/api/extract/route.ts`

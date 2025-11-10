# 🔐 Configuration AWS Textract

Ce guide explique comment configurer AWS Textract pour l'extraction de texte PDF.

## 📋 Prérequis

Vous avez besoin d'un compte AWS (gratuit pour commencer).

---

## 🚀 Étapes de configuration

### 1. Créer un compte AWS

1. Allez sur : https://aws.amazon.com/
2. Cliquez sur "Créer un compte AWS"
3. Suivez les instructions (carte bancaire requise mais offre gratuite disponible)

### 2. Créer un utilisateur IAM avec accès Textract

1. **Connectez-vous à la console AWS** : https://console.aws.amazon.com/
2. **Recherchez "IAM"** dans la barre de recherche
3. **Cliquez sur "Users" → "Create user"**
4. **Nom d'utilisateur** : `textract-api-user`
5. **Cochez** "Access key - Programmatic access"
6. **Cliquez** "Next"

### 3. Attacher les permissions Textract

1. **Sélectionnez** "Attach policies directly"
2. **Recherchez** : `AmazonTextractFullAccess`
3. **Cochez** la politique
4. **Cliquez** "Next" puis "Create user"

### 4. Récupérer les clés d'accès

1. **Après création**, cliquez sur l'utilisateur créé
2. **Allez dans** "Security credentials"
3. **Cliquez** "Create access key"
4. **Sélectionnez** "Application running outside AWS"
5. **Cliquez** "Next" puis "Create access key"

**⚠️ IMPORTANT** : Notez ces informations (elles ne seront affichées qu'une seule fois) :
- **Access Key ID** : `AKIAXXXXXXXXXXXXXXXX`
- **Secret Access Key** : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5. Configurer les variables d'environnement

Ouvrez `.env.local` et ajoutez vos clés AWS :

```bash
# AWS Credentials for Textract
AWS_ACCESS_KEY_ID=votre_access_key_id_ici
AWS_SECRET_ACCESS_KEY=votre_secret_access_key_ici
AWS_REGION=eu-west-1
```

---

## 💰 Coûts

**AWS Textract - Offre gratuite** :
- ✅ **1000 pages gratuites par mois** pendant 3 mois
- Après : ~$1.50 pour 1000 pages

Pour un usage de test/développement, vous restez dans la limite gratuite.

---

## ✅ Vérification

Une fois configuré, testez en uploadant un PDF sur :
```
http://localhost:3000/dashboard/upload
```

Les logs de la console afficheront :
```
📥 Téléchargement du PDF depuis Supabase...
📄 Extraction du texte avec AWS Textract...
📝 Texte extrait: XXXX caractères
🤖 Structuration des données avec GPT-4o...
✅ Extraction réussie avec données réelles !
```

---

## 🔒 Sécurité

⚠️ **JAMAIS** commiter vos clés AWS dans Git !

Le fichier `.env.local` est déjà dans `.gitignore`.

---

## 🐛 Dépannage

### Erreur "AccessDenied"
→ Vérifiez que la politique `AmazonTextractFullAccess` est bien attachée à l'utilisateur IAM

### Erreur "Region not found"
→ Changez `AWS_REGION` dans `.env.local` (ex: `us-east-1`, `eu-west-3`)

### Erreur "Invalid credentials"
→ Re-vérifiez vos clés AWS dans `.env.local`

---

## 📚 Documentation AWS Textract

- Guide officiel : https://docs.aws.amazon.com/textract/
- Pricing : https://aws.amazon.com/textract/pricing/

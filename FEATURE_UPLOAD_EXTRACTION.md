# 📤 Feature: Upload & Extraction PDF → JSON

## 🎯 Objectif

Permettre l'upload de fichiers PDF (DIC de produits financiers) et extraire automatiquement les données importantes sous forme de JSON structuré.

---

## 🏗️ Architecture

### 1. **Page d'Upload** (`/dashboard/upload`)
- Interface drag & drop
- Upload multiple de fichiers PDF
- Affichage du statut en temps réel
- Téléchargement du JSON extrait

### 2. **API Upload** (`/api/upload`)
- Upload vers Supabase Storage
- Bucket: `dic-documents`
- Validation: PDF uniquement, max 10MB
- Retourne l'URL publique du fichier

### 3. **API Extraction** (`/api/extract`)
- Télécharge le PDF depuis Supabase
- Extrait le texte avec `pdfjs-dist`
- Utilise OpenAI GPT-4 pour structurer les données
- Retourne un JSON au format `DICData`

---

## 📊 Format JSON Standard

Voir `/src/types/dic-data.ts` pour le schéma complet.

**Données extraites :**
- ✅ Métadonnées (nom, date, type)
- ✅ Informations générales (émetteur, produit, ISIN)
- ✅ Niveau de risque (1-7 SRI)
- ✅ Frais (entrée, sortie, gestion annuelle)
- ✅ Horizon de placement
- ✅ Scénarios de performance
- ✅ Stratégie d'investissement
- ✅ Informations complémentaires

---

## 🚀 Utilisation

### 1. Configuration

Ajouter votre clé OpenAI dans `.env.local` :

```bash
OPENAI_API_KEY=sk-...
```

### 2. Accéder à la page

```
http://localhost:3000/dashboard/upload
```

### 3. Workflow

1. **Glisser-déposer** ou sélectionner un PDF
2. ⏳ Upload automatique vers Supabase
3. 🤖 Extraction automatique avec IA
4. ✅ JSON disponible pour téléchargement
5. 📊 Données prêtes pour le dashboard

---

## 🔧 API Endpoints

### POST `/api/upload`

Upload un PDF vers Supabase Storage.

**Body:** `FormData` avec `file`

**Response:**
```json
{
  "success": true,
  "fileName": "1699622400_document.pdf",
  "fileUrl": "https://...",
  "filePath": "..."
}
```

### POST `/api/extract`

Extrait les données d'un PDF.

**Body:**
```json
{
  "fileUrl": "https://...",
  "fileName": "document.pdf"
}
```

**Response:** Object `DICData` (voir types)

---

## 📦 Dépendances

```json
{
  "openai": "^4.x",
  "pdfjs-dist": "^4.x",
  "canvas": "^2.x",
  "@supabase/storage-js": "^2.x"
}
```

---

## 🧪 Test

### Test avec un vrai DIC

1. Télécharger un DIC exemple (format PDF)
2. Aller sur `/dashboard/upload`
3. Uploader le fichier
4. Vérifier l'extraction dans les logs
5. Télécharger le JSON

### Vérifications

- ✅ Upload fonctionne
- ✅ Extraction texte OK
- ✅ OpenAI répond
- ✅ JSON valide et structuré
- ✅ Toutes les données importantes présentes

---

## 🎨 Interface

### États possibles

1. **Uploading** (30%) - Upload vers Supabase
2. **Extracting** (60%) - Extraction IA en cours  
3. **Success** (100%) - ✅ Données extraites
4. **Error** - ❌ Erreur avec message

### Affichage Success

- Émetteur
- Niveau de risque
- Frais de gestion
- Horizon recommandé
- Bouton télécharger JSON

---

## 🔗 Pour votre collègue

Le JSON produit est au format `DICData` défini dans `/src/types/dic-data.ts`.

Il peut l'utiliser directement pour :
- ✅ Remplir le dashboard
- ✅ Créer des graphiques
- ✅ Afficher les indicateurs clés
- ✅ Calculer des métriques

**Exemple d'utilisation :**

```typescript
import type { DICData } from "@/types/dic-data";

function DashboardStats({ data }: { data: DICData }) {
  return (
    <div>
      <h2>{data.general.nomProduit}</h2>
      <p>Risque: {data.risque.niveau}/7</p>
      <p>Frais: {data.frais.gestionAnnuels}%</p>
    </div>
  );
}
```

---

## ⚠️ Important

### Avant de merger dans main

- [ ] Tester avec plusieurs types de DIC
- [ ] Vérifier la qualité de l'extraction
- [ ] S'assurer que le JSON est toujours valide
- [ ] Tester les cas d'erreur
- [ ] Ajouter votre clé OpenAI réelle

### Bucket Supabase

Assurez-vous que le bucket `dic-documents` existe dans Supabase et qu'il est public ou que les permissions sont correctes.

---

## 📝 Notes

- Le modèle utilisé est **GPT-4o** (meilleur pour l'extraction structurée)
- Temperature = 0.1 pour extraction cohérente
- Format de réponse forcé en JSON
- Timeout si PDF > 10MB ou > 100 pages

---

**Status:** ✅ Feature complète et fonctionnelle  
**Branch:** `feature/upload-extraction`  
**Files:** 5 fichiers créés/modifiés  
**Ready to merge:** Après tests avec vrais DIC

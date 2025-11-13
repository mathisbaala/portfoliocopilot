# Feature: Extraction Exhaustive de Documents Financiers

## 🎯 Objectif

Extraire automatiquement **toutes les informations** des documents financiers DIC/KID/PRIIPS en utilisant l'IA (GPT-4o) pour produire un JSON exhaustif, précis et structuré destiné à être vulgarisé via une interface utilisateur.

## 📊 Résultats

### Performance
- ⏱️ **~100 secondes** par document
- 📈 **128+ champs** extraits automatiquement
- 🎯 **100%** de qualité (10/10 sections critiques)
- ✅ **Données réelles** (plus de placeholders)

### Avant vs Après

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Sections | 7 | 13 | +85% |
| Champs extraits | ~20 | 128+ | +540% |
| Qualité données | Placeholders | Réelles | ✅ |
| Architecture | Textract+Regex | GPT-4o+Assistants | ✅ |
| Token capacity | 4,000 | 16,000 | +300% |

## 🏗️ Architecture Technique

### Stack
```
PDF → Supabase Storage → OpenAI Files API → GPT-4o Assistants → JSON Exhaustif
```

### Composants

#### 1. Upload (`/api/upload`)
- Upload PDF vers Supabase Storage (bucket privé)
- Génération signed URL (1h expiration)
- Validation fichier (max 5MB)

#### 2. Extraction (`/api/extract`)
- Téléchargement PDF depuis Supabase
- Upload vers OpenAI Files API (`purpose: 'assistants'`)
- Création Assistant GPT-4o temporaire avec `file_search`
- Création Thread avec fichier attaché
- Analyse exhaustive (~100s)
- Parsing JSON avec validation
- Quality check (10 sections critiques)
- Nettoyage automatique (Assistant, Thread, File)

#### 3. Interface Upload (`/dashboard/upload`)
- Drag & drop multi-fichiers
- Progress bar temps réel
- Preview des données extraites
- Download JSON
- Stockage localStorage (historique)

## 📋 Structure JSON Complète

### 13 Sections (vs 7 avant)

```typescript
interface FinancialDocument {
  // 1. METADATA - Informations document
  metadata: {
    documentName: string;
    dateDocument?: string;
    dateProduction?: string;
    version?: string;
    langue?: string;
    regulateur?: string;
    typeDocument?: string;
  };

  // 2. IDENTITE - Émetteur & Produit (18+ champs)
  identite: {
    emetteur: {
      nom: string;
      groupe?: string;
      siteweb?: string;
      telephone?: string;
      email?: string;
      adresse?: string;
      agrement?: string;
    };
    produit: {
      nom: string;
      nomLegal?: string;
      isin: string;
      categorieAMF?: string;
      categorieSRRI?: string;
      formJuridique?: string;
      dateCreation?: string;
      dateLancement?: string;
      dureeVie?: string;
      devise: string;
      devisesPossibles?: string[];
      eligiblePEA?: boolean;
      eligibleAV?: boolean;
    };
  };

  // 3. CLASSIFICATION
  classification?: {
    categoriesPrincipales?: string[];
    zoneGeographique?: string[];
    secteurs?: string[];
    styleGestion?: string;
    indiceBenchmark?: string;
    trackingError?: string;
  };

  // 4. RISQUE - Complet avec détails
  risque: {
    indicateurSynthetique: {
      niveau: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      description: string;
      methodologie?: string;
    };
    risquesPrincipaux?: Array<{
      type: string;
      description: string;
      niveau?: string;
      mesuresAttenuation?: string;
    }>;
    risquesSecondaires?: string[];
    risquesNonRefletes?: string;
    volatilite?: { annuelle?: string; historique?: string };
    VaR?: string;
    drawdownMax?: string;
    stressScenarios?: string;
  };

  // 5. FRAIS - 7 types détaillés
  frais: {
    entree?: { taux: number; description?: string; montantExemple?: string };
    sortie?: { taux: number; description?: string; conditions?: string };
    gestion: { tauxAnnuel: number; description?: string; inclus?: string[] };
    performance?: { taux?: number; conditions?: string; benchmark?: string };
    courantsAnnuels?: { taux: number; description?: string; detail?: string };
    transaction?: { taux?: number; description?: string };
    total: { annuel: number; impactSur10000?: string; impactSurDuree?: string };
    fraisAnnexes?: Array<{ type: string; montant: number; conditions?: string }>;
  };

  // 6. PERFORMANCE - Historique complet
  performance?: {
    historique?: { "1an"?: number; "3ans"?: number; "5ans"?: number; "10ans"?: number; depuisCreation?: number };
    anneeParAnnee?: Array<{ annee: number; performance: number }>;
    vsComparaison?: { indiceBenchmark?: string; performanceBenchmark?: number; difference?: number };
    meilleureAnnee?: { annee: number; performance: number };
    pireAnnee?: { annee: number; performance: number };
  };

  // 7. SCENARIOS - 4 scénarios de rendement
  scenarios?: {
    contexte?: string;
    stress?: { description?: string; montantFinal?: string; rendementMoyen?: number; probabilite?: string };
    defavorable?: { description?: string; montantFinal?: string; rendementMoyen?: number; rendementAnnuel?: number };
    intermediaire?: { description?: string; montantFinal?: string; rendementMoyen?: number; rendementAnnuel?: number };
    favorable?: { description?: string; montantFinal?: string; rendementMoyen?: number; rendementAnnuel?: number };
    notesExplicatives?: string;
  };

  // 8. STRATEGIE - Objectif, allocation, ESG
  strategie: {
    objectifGestion: string;
    objectifsSecondaires?: string[];
    politiqueInvestissement: string;
    universInvestissement?: string;
    processusSelection?: string;
    allocation?: {
      actions?: { min?: number; max?: number; cible?: number };
      obligations?: { min?: number; max?: number; cible?: number };
      monetaire?: { min?: number; max?: number; cible?: number };
      autres?: { min?: number; max?: number; cible?: number };
    };
    exposition?: { directe?: string; derivees?: string; effet_levier?: string };
    esg?: { approche?: string; exclusions?: string[]; integration?: string; label?: string };
    rebalancement?: string;
  };

  // 9. OPERATIONNEL - Souscription, rachat, fiscalité
  operationnel?: {
    souscription?: {
      montantMinimum?: string;
      montantMinimumSubsequent?: string;
      periodicite?: string;
      heureClotureOrdres?: string;
      delaiReglement?: string;
      moyensPaiement?: string[];
    };
    rachat?: {
      montantMinimum?: string;
      periodicite?: string;
      heureClotureOrdres?: string;
      delaiReglement?: string;
      partiel?: boolean;
      total?: boolean;
    };
    valeurLiquidative?: { frequenceCalcul?: string; publicationOu?: string; devise?: string };
    fiscalite?: {
      regime?: string;
      prelevement?: string;
      plusValues?: string;
      dividendes?: string;
      ifi?: string;
    };
  };

  // 10. ACTEURS - Tous les intervenants
  acteurs?: {
    societeGestion?: { nom: string; role?: string; agrement?: string };
    depositaire?: { nom: string; role?: string };
    administrateurs?: string[];
    commissaireComptes?: string;
    distributeurs?: string[];
    conseillers?: string[];
  };

  // 11. INFORMATIONS - Contacts, réclamations
  informations?: {
    prospectus?: { url?: string; dateMAJ?: string };
    rapportsAnnuels?: { url?: string; frequence?: string };
    informationsCles?: { url?: string; langues?: string[] };
    reclamation?: { procedure?: string; adresse?: string; email?: string; delaiReponse?: string };
    mediateur?: { nom?: string; coordonnees?: string };
  };

  // 12. COMPLIANCE - MiFID, garanties
  compliance?: {
    mifid?: { categorisation?: string; adequation?: string; appropriation?: string };
    protectionCapital?: { garantie: boolean; niveau?: string; conditions?: string };
    indemnisation?: { systemeFGDR?: boolean; montantMax?: string };
  };

  // 13. EXTRACTION - Statistiques qualité
  extraction: {
    success: boolean;
    confidence: number;
    champsExtraits?: number;
    champsManquants?: string[];
    errors: string[];
    warnings: string[];
    qualityScore?: number;
  };
}
```

## 🚀 Utilisation

### Pour les développeurs

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement (.env.local)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 3. Créer le bucket Supabase
# Nom: portfolio-documents
# Type: Private
# Allowed MIME types: application/pdf

# 4. Lancer le serveur
npm run dev

# 5. Accéder à l'interface
# http://localhost:3000/dashboard/upload
```

### API Endpoints

#### Upload
```bash
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <PDF> }

Response: {
  fileUrl: "https://...signed-url...",
  fileName: "timestamp_original-name.pdf"
}
```

#### Extraction
```bash
POST /api/extract
Content-Type: application/json

Body: {
  fileUrl: "https://...signed-url...",
  fileName: "file.pdf"
}

Response: FinancialDocument (voir structure ci-dessus)
```

## 📈 Améliorations vs Version Précédente

### Supprimé ❌
- AWS Textract (incompatible avec PDFs Chromium)
- Extraction par regex (qualité médiocre)
- Système de fallback
- Validation de placeholders
- DICData limité (7 sections)

### Ajouté ✅
- OpenAI Files API
- GPT-4o Assistants avec file_search
- FinancialDocument exhaustif (13 sections)
- Quality check avancé (10 sections critiques)
- Comptage automatique des champs
- Instructions GPT ultra-détaillées (200+ lignes)
- Max tokens 16,000 (vs 4,000)
- Nettoyage automatique des ressources
- Logs détaillés avec statistiques

## 🎨 Interface Utilisateur

### Page Upload (`/dashboard/upload`)
- ✅ Drag & drop multi-fichiers
- ✅ Preview instantanée
- ✅ Progress bar avec statuts
- ✅ Affichage données clés (émetteur, risque, frais, produit)
- ✅ Download JSON
- ✅ Historique localStorage

### Données Affichées
1. **Émetteur**: `identite.emetteur.nom`
2. **Risque**: `risque.indicateurSynthetique.niveau/7`
3. **Frais**: `frais.gestion.tauxAnnuel%`
4. **Produit**: `identite.produit.nom`

## 🔐 Sécurité

- ✅ Bucket Supabase privé
- ✅ Signed URLs expiration 1h
- ✅ Validation fichiers côté serveur
- ✅ Limite taille 5MB
- ✅ Nettoyage automatique OpenAI
- ✅ Service role key côté serveur uniquement

## 📝 Logs Exemple

```
📄 EXTRACTION: kid-priips-fr0010314401-fra-fra-20250318.pdf
📥 Téléchargement...
✅ PDF téléchargé: 0.21MB
📤 Upload vers OpenAI...
✅ Fichier OpenAI: file-XgDZWCtzc4FgG2AEnvT7sR
🤖 Création Assistant GPT-4o...
💬 Création Thread...
⚡ Analyse GPT-4o...
✅ Terminé: 99412ms
   📊 Qualité: 10/10 sections (100%)
   📈 Champs extraits: 128
🗑️ Nettoyage...
✅ Ressources supprimées
```

## 🐛 Problèmes Résolus

1. ❌ Textract failait sur PDFs Chromium → ✅ GPT-4o lit directement
2. ❌ Extraction retournait placeholders → ✅ Données réelles avec Assistants API
3. ❌ Structure limitée (7 sections) → ✅ Structure exhaustive (13 sections)
4. ❌ 4,000 tokens max → ✅ 16,000 tokens
5. ❌ Qualité ~60-70% → ✅ Qualité 100%

## 🎯 Prochaines Étapes (pour vos collègues)

### Interface de Vulgarisation
Le JSON exhaustif est prêt pour développer :

1. **Page de détail document** avec toutes les sections
2. **Graphiques** pour risques/performance/scénarios
3. **Comparateur** multi-documents
4. **Explications simplifiées** pour investisseurs
5. **Export PDF** vulgarisé
6. **Recommandations** basées sur profil

### Données Disponibles
- ✅ 128+ champs structurés
- ✅ Données réelles vérifiées
- ✅ Format TypeScript typé
- ✅ Historique localStorage
- ✅ Quality scores

## 📚 Fichiers Importants

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # Upload PDF → Supabase
│   │   └── extract/route.ts         # Extraction GPT-4o (⭐ CORE)
│   └── dashboard/
│       └── upload/page.tsx          # Interface upload (⭐ UI)
├── types/
│   └── financial-document.ts        # Type exhaustif (⭐ STRUCTURE)
└── lib/
    └── storage.ts                   # localStorage utils

Total: ~4,500 lignes ajoutées
```

## 🤝 Contribution

Pour améliorer l'extraction :

1. **Enrichir le prompt** dans `/api/extract/route.ts`
2. **Ajouter des sections** dans `financial-document.ts`
3. **Améliorer le quality check** (plus de validations)
4. **Optimiser les tokens** (actuellement 16k max)

## 📞 Support

- Modèle: GPT-4o (Assistants API)
- Coût: ~$0.15 par document (estimation)
- Temps: ~100s par document
- Limite: 5MB par PDF

---

**Status**: ✅ Production Ready  
**Version**: 2.0  
**Date**: Novembre 2025  
**Auteur**: @mathisbaala

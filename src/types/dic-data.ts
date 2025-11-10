/**
 * Schéma JSON Standard pour l'extraction de DIC
 * Ce format sera utilisé par le dashboard pour afficher les données
 */

export interface DICData {
  // Métadonnées du document
  metadata: {
    documentName: string;           // Nom du fichier PDF
    uploadDate: string;              // Date d'upload (ISO)
    extractionDate: string;          // Date d'extraction (ISO)
    documentType: "SICAV" | "FCP" | "ETF" | "Autre";
  };

  // Informations générales
  general: {
    emetteur: string;                // Nom de l'émetteur/société de gestion
    nomProduit: string;              // Nom complet du produit
    isin?: string;                   // Code ISIN si disponible
    categorie: string;               // Catégorie (Actions, Obligations, etc.)
    devise: string;                  // Devise (EUR, USD, etc.)
    dateCreation?: string;           // Date de création du fonds
  };

  // Niveau de risque (échelle 1-7 SRI)
  risque: {
    niveau: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // Indicateur de risque (1=faible, 7=élevé)
    description: string;                 // Description textuelle du risque
    volatilite?: string;                 // Information sur la volatilité
  };

  // Frais
  frais: {
    entree?: number;                 // Frais d'entrée (%)
    sortie?: number;                 // Frais de sortie (%)
    gestionAnnuels: number;          // Frais de gestion annuels (%)
    courtage?: number;               // Frais de courtage (%)
    total?: number;                  // Total des frais (%)
    details?: string;                // Détails additionnels
  };

  // Horizon de placement
  horizon: {
    recommande: string;              // Ex: "5 ans minimum"
    annees?: number;                 // Nombre d'années recommandées
    description?: string;            // Description de l'horizon
  };

  // Scénarios de performance
  scenarios: {
    defavorable?: {
      montant: number;               // Montant dans scénario défavorable
      pourcentage: number;           // Rendement en %
    };
    intermediaire?: {
      montant: number;
      pourcentage: number;
    };
    favorable?: {
      montant: number;
      pourcentage: number;
    };
    baseInvestissement?: number;     // Montant de base (ex: 10000 EUR)
  };

  // Objectifs et stratégie
  strategie?: {
    objectif: string;                // Objectif d'investissement
    politique: string;               // Politique d'investissement
    zoneGeographique?: string;       // Zone géographique
    secteurs?: string[];             // Secteurs d'investissement
  };

  // Informations complémentaires
  complementaires?: {
    liquidite?: string;              // Conditions de rachat
    fiscalite?: string;              // Informations fiscales
    garantie?: string;               // Garantie en capital (oui/non)
    profilInvestisseur?: string;     // Profil d'investisseur cible
  };

  // Statut de l'extraction
  extraction: {
    success: boolean;                // Extraction réussie ?
    confidence: number;              // Niveau de confiance (0-1)
    errors?: string[];               // Erreurs éventuelles
    warnings?: string[];             // Avertissements
  };
}

/**
 * Exemple de JSON produit
 */
export const EXAMPLE_DIC_DATA: DICData = {
  metadata: {
    documentName: "DIC_Amundi_Actions_Europe.pdf",
    uploadDate: "2025-11-10T10:00:00Z",
    extractionDate: "2025-11-10T10:01:30Z",
    documentType: "SICAV"
  },
  general: {
    emetteur: "Amundi Asset Management",
    nomProduit: "Amundi Actions Europe",
    isin: "FR0010655738",
    categorie: "Actions européennes",
    devise: "EUR",
    dateCreation: "2008-01-15"
  },
  risque: {
    niveau: 5,
    description: "Risque modéré à élevé. Possibilité de pertes importantes.",
    volatilite: "Moyenne à élevée"
  },
  frais: {
    entree: 3.0,
    sortie: 0,
    gestionAnnuels: 1.8,
    courtage: 0.2,
    total: 2.0,
    details: "Frais de gestion incluant frais de courtage"
  },
  horizon: {
    recommande: "5 ans minimum",
    annees: 5,
    description: "Investissement de long terme pour profiter du potentiel de croissance"
  },
  scenarios: {
    defavorable: {
      montant: 7500,
      pourcentage: -25.0
    },
    intermediaire: {
      montant: 11000,
      pourcentage: 10.0
    },
    favorable: {
      montant: 14000,
      pourcentage: 40.0
    },
    baseInvestissement: 10000
  },
  strategie: {
    objectif: "Rechercher une croissance du capital à long terme",
    politique: "Investissement diversifié en actions européennes",
    zoneGeographique: "Europe",
    secteurs: ["Technologie", "Finance", "Industrie", "Santé"]
  },
  complementaires: {
    liquidite: "Rachat quotidien",
    fiscalite: "Eligible PEA",
    garantie: "Non",
    profilInvestisseur: "Investisseur informé, horizon long terme"
  },
  extraction: {
    success: true,
    confidence: 0.92,
    errors: [],
    warnings: ["Frais de courtage estimés"]
  }
};

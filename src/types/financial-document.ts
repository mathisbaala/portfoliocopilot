/**
 * Type pour l'extraction exhaustive de documents financiers DIC/KID/PRIIPS
 * Structure complète et professionnelle pour la vulgarisation
 */

export interface FinancialDocument {
  metadata: {
    documentName: string;
    dateDocument?: string;
    dateProduction?: string;
    version?: string;
    langue?: string;
    regulateur?: string;
    typeDocument?: string;
  };

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

  classification?: {
    categoriesPrincipales?: string[];
    zoneGeographique?: string[];
    secteurs?: string[];
    styleGestion?: string;
    indiceBenchmark?: string;
    trackingError?: string;
  };

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
    volatilite?: {
      annuelle?: string;
      historique?: string;
    };
    VaR?: string;
    drawdownMax?: string;
    stressScenarios?: string;
  };

  frais: {
    entree?: {
      taux: number;
      description?: string;
      montantExemple?: string;
    };
    sortie?: {
      taux: number;
      description?: string;
      conditions?: string;
    };
    gestion: {
      tauxAnnuel: number;
      description?: string;
      inclus?: string[];
    };
    performance?: {
      taux?: number;
      conditions?: string;
      benchmark?: string;
    };
    courantsAnnuels?: {
      taux: number;
      description?: string;
      detail?: string;
    };
    transaction?: {
      taux?: number;
      description?: string;
    };
    total: {
      annuel: number;
      impactSur10000?: string;
      impactSurDuree?: string;
    };
    fraisAnnexes?: Array<{
      type: string;
      montant: number;
      conditions?: string;
    }>;
  };

  performance?: {
    historique?: {
      "1an"?: number;
      "3ans"?: number;
      "5ans"?: number;
      "10ans"?: number;
      depuisCreation?: number;
    };
    anneeParAnnee?: Array<{
      annee: number;
      performance: number;
    }>;
    vsComparaison?: {
      indiceBenchmark?: string;
      performanceBenchmark?: number;
      difference?: number;
    };
    meilleureAnnee?: {
      annee: number;
      performance: number;
    };
    pireAnnee?: {
      annee: number;
      performance: number;
    };
  };

  scenarios?: {
    contexte?: string;
    stress?: {
      description?: string;
      montantFinal?: string;
      rendementMoyen?: number;
      probabilite?: string;
    };
    defavorable?: {
      description?: string;
      montantFinal?: string;
      rendementMoyen?: number;
      rendementAnnuel?: number;
    };
    intermediaire?: {
      description?: string;
      montantFinal?: string;
      rendementMoyen?: number;
      rendementAnnuel?: number;
    };
    favorable?: {
      description?: string;
      montantFinal?: string;
      rendementMoyen?: number;
      rendementAnnuel?: number;
    };
    notesExplicatives?: string;
  };

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
    exposition?: {
      directe?: string;
      derivees?: string;
      effet_levier?: string;
    };
    esg?: {
      approche?: string;
      exclusions?: string[];
      integration?: string;
      label?: string;
    };
    rebalancement?: string;
  };

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
    valeurLiquidative?: {
      frequenceCalcul?: string;
      publicationOu?: string;
      devise?: string;
    };
    fiscalite?: {
      regime?: string;
      prelevement?: string;
      plusValues?: string;
      dividendes?: string;
      ifi?: string;
    };
  };

  acteurs?: {
    societeGestion?: {
      nom: string;
      role?: string;
      agrement?: string;
    };
    depositaire?: {
      nom: string;
      role?: string;
    };
    administrateurs?: string[];
    commissaireComptes?: string;
    distributeurs?: string[];
    conseillers?: string[];
  };

  informations?: {
    prospectus?: {
      url?: string;
      dateMAJ?: string;
    };
    rapportsAnnuels?: {
      url?: string;
      frequence?: string;
    };
    informationsCles?: {
      url?: string;
      langues?: string[];
    };
    reclamation?: {
      procedure?: string;
      adresse?: string;
      email?: string;
      delaiReponse?: string;
    };
    mediateur?: {
      nom?: string;
      coordonnees?: string;
    };
  };

  compliance?: {
    mifid?: {
      categorisation?: string;
      adequation?: string;
      appropriation?: string;
    };
    protectionCapital?: {
      garantie: boolean;
      niveau?: string;
      conditions?: string;
    };
    indemnisation?: {
      systemeFGDR?: boolean;
      montantMax?: string;
    };
  };

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

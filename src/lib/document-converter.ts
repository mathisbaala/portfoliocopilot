/**
 * Convertisseur de FinancialDocument (API extract) vers FinancialProduct (frontend)
 * 
 * L'API d'extraction OpenAI retourne un FinancialDocument avec une structure riche.
 * Le frontend dashboard utilise FinancialProduct pour afficher les données.
 * Ce module fait le pont entre les deux structures.
 */

import type { FinancialDocument } from "@/types/financial-document";
import type { FinancialProduct, Scenario, DataPoint } from "@/types/financial-product";

/**
 * Convertit un FinancialDocument extrait par l'API en FinancialProduct utilisable par le dashboard
 */
export function convertToFinancialProduct(doc: FinancialDocument): FinancialProduct {
  return {
    schemaVersion: "1.0",
    frontendProductName: doc.identite?.produit?.nom || doc.metadata?.documentName || "Produit inconnu",
    productType: determineProductType(doc),
    distributorName: doc.identite?.emetteur?.nom || doc.acteurs?.societeGestion?.nom,
    
    documentInfo: {
      documentType: doc.metadata?.typeDocument || "DIC/KID",
      language: doc.metadata?.langue || "fr",
      kidProductionDate: doc.metadata?.dateDocument || doc.metadata?.dateProduction || new Date().toISOString().split('T')[0],
    },
    
    product: {
      name: doc.identite?.produit?.nom || doc.identite?.produit?.nomLegal || "Produit sans nom",
      isin: doc.identite?.produit?.isin || "ISIN inconnu",
      currency: doc.identite?.produit?.devise || "EUR",
      descriptionShort: extractShortDescription(doc),
      manufacturer: doc.identite?.emetteur?.nom || "Émetteur inconnu",
      domicileCountry: extractCountry(doc),
      regulator: doc.metadata?.regulateur || "AMF",
    },
    
    risk: {
      riskIndicator: doc.risque?.indicateurSynthetique?.niveau || 4,
      riskScaleMin: 1,
      riskScaleMax: 7,
      recommendedHoldingPeriodYears: extractHoldingPeriod(doc),
      capitalGuarantee: doc.compliance?.protectionCapital?.garantie || false,
      canLoseMoreThanInvested: false,
    },
    
    performanceScenarios: {
      baseCurrency: doc.identite?.produit?.devise || "EUR",
      baseInvestmentAmount: 10000,
      scenarios: extractScenarios(doc),
    },
    
    costs: {
      baseInvestmentAmount: 10000,
      ongoingChargesPercentPerYear: doc.frais?.courantsAnnuels?.taux || doc.frais?.gestion?.tauxAnnuel || 0,
      transactionCostsPercentPerYear: doc.frais?.transaction?.taux || 0,
      entryFeePercent: doc.frais?.entree?.taux || 0,
      exitFeePercent: doc.frais?.sortie?.taux || 0,
    },
    
    liquidityAndTrading: {
      tradedOnExchange: determineIfTradedOnExchange(doc),
      mainExchange: "Euronext Paris", // Par défaut pour les produits français
      ticker: extractTicker(doc),
      canRedeemBeforeEndOfPeriod: doc.operationnel?.rachat?.partiel || doc.operationnel?.rachat?.total || true,
    },
    
    typeSpecific: {
      kind: determineKind(doc),
      fundType: doc.identite?.produit?.formJuridique || "UCITS",
      category: doc.classification?.categoriesPrincipales?.[0] || "Diversifié",
      index: extractIndex(doc),
      managementStyle: determineManagementStyle(doc),
      replicationMethod: "PHYSICAL", // Par défaut
      peaEligible: doc.identite?.produit?.eligiblePEA || false,
      distributionPolicy: determineDistributionPolicy(doc),
    },
    
    // Performance historique (si disponible)
    historicalPerformance: extractHistoricalPerformance(doc),
  };
}

/**
 * Détermine le type de produit à partir du document (pour productType)
 */
function determineProductType(doc: FinancialDocument): "ETF" | "OPCVM" | "FCP" | "SICAV" {
  const formJuridique = doc.identite?.produit?.formJuridique?.toUpperCase() || "";
  const styleGestion = doc.classification?.styleGestion?.toLowerCase() || "";
  
  if (formJuridique.includes("ETF") || styleGestion.includes("passive")) {
    return "ETF";
  }
  if (formJuridique.includes("SICAV")) {
    return "SICAV";
  }
  if (formJuridique.includes("FCP")) {
    return "FCP";
  }
  return "OPCVM";
}

/**
 * Détermine le kind pour typeSpecific (ETF, OPCVM ou FCP seulement)
 */
function determineKind(doc: FinancialDocument): "ETF" | "OPCVM" | "FCP" {
  const formJuridique = doc.identite?.produit?.formJuridique?.toUpperCase() || "";
  const styleGestion = doc.classification?.styleGestion?.toLowerCase() || "";
  
  if (formJuridique.includes("ETF") || styleGestion.includes("passive")) {
    return "ETF";
  }
  if (formJuridique.includes("FCP")) {
    return "FCP";
  }
  return "OPCVM";
}

/**
 * Extrait une description courte du produit
 */
function extractShortDescription(doc: FinancialDocument): string {
  if (doc.strategie?.objectifGestion) {
    // Tronquer à 200 caractères si trop long
    const desc = doc.strategie.objectifGestion;
    return desc.length > 200 ? desc.substring(0, 197) + "..." : desc;
  }
  return "Produit financier - consultez le document d'information clé pour plus de détails.";
}

/**
 * Extrait le pays de domiciliation
 */
function extractCountry(doc: FinancialDocument): string {
  // Essayer de déduire depuis l'agrément ou l'adresse
  const agrement = doc.identite?.emetteur?.agrement?.toUpperCase() || "";
  if (agrement.includes("AMF")) return "FR";
  if (agrement.includes("CSSF")) return "LU";
  if (agrement.includes("FCA")) return "GB";
  return "FR"; // Par défaut
}

/**
 * Extrait la durée de détention recommandée
 */
function extractHoldingPeriod(doc: FinancialDocument): number {
  // Essayer de parser depuis les scénarios ou la stratégie
  const contexte = doc.scenarios?.contexte || "";
  const match = contexte.match(/(\d+)\s*(an|year)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 5; // Durée par défaut pour la plupart des produits
}

/**
 * Extrait les scénarios de performance
 */
function extractScenarios(doc: FinancialDocument): Scenario[] {
  const scenarios: Scenario[] = [];
  const baseAmount = 10000;
  
  if (doc.scenarios) {
    if (doc.scenarios.stress) {
      scenarios.push({
        type: "stress",
        label: doc.scenarios.stress.description || "Scénario de tensions",
        amountAfterEndOfRecommendedPeriod: parseAmount(doc.scenarios.stress.montantFinal) || baseAmount * 0.5,
      });
    }
    
    if (doc.scenarios.defavorable) {
      scenarios.push({
        type: "unfavourable",
        label: doc.scenarios.defavorable.description || "Scénario défavorable",
        amountAfterEndOfRecommendedPeriod: parseAmount(doc.scenarios.defavorable.montantFinal) || baseAmount * 0.85,
      });
    }
    
    if (doc.scenarios.intermediaire) {
      scenarios.push({
        type: "moderate",
        label: doc.scenarios.intermediaire.description || "Scénario intermédiaire",
        amountAfterEndOfRecommendedPeriod: parseAmount(doc.scenarios.intermediaire.montantFinal) || baseAmount * 1.2,
      });
    }
    
    if (doc.scenarios.favorable) {
      scenarios.push({
        type: "favourable",
        label: doc.scenarios.favorable.description || "Scénario favorable",
        amountAfterEndOfRecommendedPeriod: parseAmount(doc.scenarios.favorable.montantFinal) || baseAmount * 1.5,
      });
    }
  }
  
  // Si aucun scénario n'a été extrait, créer des valeurs par défaut
  if (scenarios.length === 0) {
    scenarios.push(
      { type: "stress", label: "Scénario de tensions", amountAfterEndOfRecommendedPeriod: 5000 },
      { type: "unfavourable", label: "Scénario défavorable", amountAfterEndOfRecommendedPeriod: 8500 },
      { type: "moderate", label: "Scénario intermédiaire", amountAfterEndOfRecommendedPeriod: 12000 },
      { type: "favourable", label: "Scénario favorable", amountAfterEndOfRecommendedPeriod: 15000 }
    );
  }
  
  return scenarios;
}

/**
 * Parse un montant depuis une chaîne (ex: "8 500 €" -> 8500)
 */
function parseAmount(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Détermine si le produit est coté en bourse
 */
function determineIfTradedOnExchange(doc: FinancialDocument): boolean {
  const formJuridique = doc.identite?.produit?.formJuridique?.toUpperCase() || "";
  return formJuridique.includes("ETF");
}

/**
 * Extrait le ticker (symbole boursier)
 */
function extractTicker(doc: FinancialDocument): string {
  // Le ticker n'est pas toujours dans le document, utiliser l'ISIN comme fallback
  return doc.identite?.produit?.isin?.substring(0, 6) || "N/A";
}

/**
 * Extrait les informations sur l'indice de référence
 */
function extractIndex(doc: FinancialDocument): { name: string; type: string; provider: string } | undefined {
  if (doc.classification?.indiceBenchmark) {
    return {
      name: doc.classification.indiceBenchmark,
      type: "PRICE", // Par défaut
      provider: "N/A",
    };
  }
  return undefined;
}

/**
 * Détermine le style de gestion
 */
function determineManagementStyle(doc: FinancialDocument): "PASSIVE" | "ACTIVE" {
  const style = doc.classification?.styleGestion?.toLowerCase() || "";
  if (style.includes("passif") || style.includes("passive") || style.includes("indiciel")) {
    return "PASSIVE";
  }
  return "ACTIVE";
}

/**
 * Détermine la politique de distribution
 */
function determineDistributionPolicy(doc: FinancialDocument): "ACCUMULATION" | "DISTRIBUTION" {
  const nom = (doc.identite?.produit?.nom || "").toLowerCase();
  if (nom.includes("acc") || nom.includes("capitalisation")) {
    return "ACCUMULATION";
  }
  if (nom.includes("dist") || nom.includes("distribution")) {
    return "DISTRIBUTION";
  }
  return "ACCUMULATION"; // Par défaut
}

/**
 * Extrait les données de performance historique
 */
function extractHistoricalPerformance(doc: FinancialDocument): FinancialProduct["historicalPerformance"] | undefined {
  if (!doc.performance?.anneeParAnnee || doc.performance.anneeParAnnee.length === 0) {
    return undefined;
  }
  
  // Convertir les données année par année en dataPoints
  const dataPoints: DataPoint[] = doc.performance.anneeParAnnee.map((item, index) => {
    // Calculer la valeur cumulée (base 100)
    let cumulativeValue = 100;
    for (let i = 0; i <= index; i++) {
      cumulativeValue *= (1 + (doc.performance!.anneeParAnnee![i].performance / 100));
    }
    return {
      date: `${item.annee}-01-01`,
      value: Math.round(cumulativeValue * 100) / 100,
    };
  });
  
  if (dataPoints.length === 0) {
    return undefined;
  }
  
  const currentValue = dataPoints[dataPoints.length - 1]?.value || 100;
  
  return {
    dataPoints,
    currentValue,
    baseValue: 100,
    startDate: dataPoints[0]?.date || new Date().toISOString().split('T')[0],
    endDate: dataPoints[dataPoints.length - 1]?.date || new Date().toISOString().split('T')[0],
    annualizedReturn: calculateAnnualizedReturn(dataPoints),
    maxDrawdown: calculateMaxDrawdown(dataPoints),
  };
}

/**
 * Calcule le rendement annualisé
 */
function calculateAnnualizedReturn(dataPoints: DataPoint[]): number {
  if (dataPoints.length < 2) return 0;
  
  const startValue = dataPoints[0].value;
  const endValue = dataPoints[dataPoints.length - 1].value;
  const years = dataPoints.length - 1;
  
  if (years <= 0 || startValue <= 0) return 0;
  
  const totalReturn = (endValue / startValue) - 1;
  const annualized = Math.pow(1 + totalReturn, 1 / years) - 1;
  
  return Math.round(annualized * 10000) / 100; // En pourcentage avec 2 décimales
}

/**
 * Calcule le max drawdown
 */
function calculateMaxDrawdown(dataPoints: DataPoint[]): number {
  if (dataPoints.length < 2) return 0;
  
  let maxValue = dataPoints[0].value;
  let maxDrawdown = 0;
  
  for (const point of dataPoints) {
    if (point.value > maxValue) {
      maxValue = point.value;
    }
    const drawdown = ((point.value - maxValue) / maxValue) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return Math.round(maxDrawdown * 100) / 100;
}

/**
 * Valide qu'un FinancialProduct a les champs minimums requis
 */
export function validateFinancialProduct(product: FinancialProduct): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!product.product?.name) errors.push("Nom du produit manquant");
  if (!product.product?.isin) errors.push("ISIN manquant");
  if (!product.risk?.riskIndicator) errors.push("Indicateur de risque manquant");
  if (!product.costs) errors.push("Informations sur les frais manquantes");
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

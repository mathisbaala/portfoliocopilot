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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  const productType = determineProductType(doc);
  const underlying = extractUnderlying(doc);
  const frontendProductName = buildFrontendProductName(productType, underlying, doc);
  
  // Extraire les données depuis les deux formats possibles
  const productName = anyDoc.produit?.nom || doc.identite?.produit?.nom || doc.identite?.produit?.nomLegal || frontendProductName;
  const isin = anyDoc.produit?.isin || doc.identite?.produit?.isin || "ISIN non extrait";
  const currency = anyDoc.produit?.devise || doc.identite?.produit?.devise || "EUR";
  const emetteurNom = anyDoc.emetteur?.nom || doc.identite?.emetteur?.nom || doc.acteurs?.societeGestion?.nom;
  const riskLevel = anyDoc.risque?.niveau || doc.risque?.indicateurSynthetique?.niveau || 4;
  const eligiblePEA = anyDoc.produit?.eligiblePEA || doc.identite?.produit?.eligiblePEA || false;
  const ticker = anyDoc.produit?.ticker || extractTicker(doc);
  
  return {
    schemaVersion: "1.0",
    frontendProductName,
    productType,
    underlying,
    distributorName: emetteurNom,
    
    documentInfo: {
      documentType: doc.metadata?.typeDocument || "DIC/KID",
      language: doc.metadata?.langue || "fr",
      kidProductionDate: anyDoc.produit?.dateDocument || doc.metadata?.dateDocument || doc.metadata?.dateProduction || new Date().toISOString().split('T')[0],
    },
    
    product: {
      name: productName,
      isin: isin,
      currency: currency,
      descriptionShort: extractShortDescription(doc),
      manufacturer: emetteurNom || "Émetteur inconnu",
      domicileCountry: extractCountry(doc),
      regulator: doc.metadata?.regulateur || "AMF",
    },
    
    risk: {
      riskIndicator: riskLevel,
      riskScaleMin: 1,
      riskScaleMax: 7,
      recommendedHoldingPeriodYears: extractHoldingPeriod(doc),
      capitalGuarantee: anyDoc.risque?.garantieCapital || doc.compliance?.protectionCapital?.garantie || false,
      canLoseMoreThanInvested: false,
    },
    
    performanceScenarios: {
      baseCurrency: currency,
      baseInvestmentAmount: 10000,
      scenarios: extractScenarios(doc),
    },
    
    costs: extractCosts(doc),
    
    liquidityAndTrading: {
      tradedOnExchange: determineIfTradedOnExchange(doc),
      mainExchange: "Euronext Paris",
      ticker: ticker,
      canRedeemBeforeEndOfPeriod: doc.operationnel?.rachat?.partiel || doc.operationnel?.rachat?.total || true,
    },
    
    typeSpecific: {
      kind: determineKind(doc),
      fundType: doc.identite?.produit?.formJuridique || "UCITS",
      category: doc.classification?.categoriesPrincipales?.[0] || anyDoc.produit?.classification || "Diversifié",
      index: extractIndex(doc),
      managementStyle: determineManagementStyle(doc),
      replicationMethod: "PHYSICAL",
      peaEligible: eligiblePEA,
      distributionPolicy: determineDistributionPolicy(doc),
    },
    
    historicalPerformance: extractHistoricalPerformance(doc),
  };
}

/**
 * Détermine le type de produit à partir du document (pour productType)
 * Supporte les deux formats d'API
 */
function determineProductType(doc: FinancialDocument): "ETF" | "OPCVM" | "FCP" | "SICAV" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  // Nouveau format: produit.typeInstrument
  const typeInstrument = anyDoc.produit?.typeInstrument?.toUpperCase() || "";
  if (typeInstrument.includes("ETF")) return "ETF";
  if (typeInstrument.includes("SICAV")) return "SICAV";
  if (typeInstrument.includes("FCP")) return "FCP";
  if (typeInstrument.includes("OPCVM")) return "OPCVM";
  
  // Ancien format
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
 * Supporte les deux formats d'API
 */
function determineKind(doc: FinancialDocument): "ETF" | "OPCVM" | "FCP" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  // Nouveau format
  const typeInstrument = anyDoc.produit?.typeInstrument?.toUpperCase() || "";
  if (typeInstrument.includes("ETF")) return "ETF";
  if (typeInstrument.includes("FCP")) return "FCP";
  if (typeInstrument.includes("OPCVM")) return "OPCVM";
  
  // Ancien format
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
 * Extrait le sous-jacent (indice de référence) du document
 * Cherche dans plusieurs sources possibles (supporte les deux formats d'API)
 */
function extractUnderlying(doc: FinancialDocument): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  // 1. Nouveau format API: produit.indiceBenchmark
  if (anyDoc.produit?.indiceBenchmark) {
    return cleanUnderlyingName(anyDoc.produit.indiceBenchmark);
  }
  
  // 2. Ancien format: classification.indiceBenchmark
  if (doc.classification?.indiceBenchmark) {
    return cleanUnderlyingName(doc.classification.indiceBenchmark);
  }
  
  // 3. Chercher dans le nom du produit (patterns courants)
  const productName = anyDoc.produit?.nom || doc.identite?.produit?.nom || doc.identite?.produit?.nomLegal || "";
  const underlyingFromName = extractUnderlyingFromName(productName);
  if (underlyingFromName) {
    return underlyingFromName;
  }
  
  // 4. Chercher dans l'objectif de gestion
  const objectif = anyDoc.strategie?.objectif || doc.strategie?.objectifGestion || "";
  const underlyingFromObjectif = extractUnderlyingFromName(objectif);
  if (underlyingFromObjectif) {
    return underlyingFromObjectif;
  }
  
  // 5. Chercher dans les catégories
  const categories = doc.classification?.categoriesPrincipales || [];
  for (const cat of categories) {
    const underlying = extractUnderlyingFromName(cat);
    if (underlying) return underlying;
  }
  
  // 6. Chercher dans le nom du fichier
  const fileName = doc.metadata?.documentName || "";
  const underlyingFromFileName = extractUnderlyingFromName(fileName);
  if (underlyingFromFileName) {
    return underlyingFromFileName;
  }
  
  return undefined;
}

/**
 * Nettoie le nom d'un indice pour l'affichage
 */
function cleanUnderlyingName(name: string): string {
  return name
    .replace(/\s*(Gross|Net|Price|Total Return|TR|NR|PR)\s*/gi, " ")
    .replace(/\s*(Index|Indice)\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrait le sous-jacent depuis un texte (nom de produit, objectif, etc.)
 */
function extractUnderlyingFromName(text: string): string | undefined {
  const upperText = text.toUpperCase();
  
  // Liste des indices courants à détecter
  const knownIndices = [
    { pattern: /S\s*&\s*P\s*500|SP500|S&P500/i, name: "S&P 500" },
    { pattern: /CAC\s*40/i, name: "CAC 40" },
    { pattern: /MSCI\s*WORLD/i, name: "MSCI World" },
    { pattern: /MSCI\s*EUROPE/i, name: "MSCI Europe" },
    { pattern: /MSCI\s*EM(ERGING)?(\s*MARKETS?)?/i, name: "MSCI Emerging Markets" },
    { pattern: /EURO\s*STOXX\s*50/i, name: "Euro Stoxx 50" },
    { pattern: /STOXX\s*600/i, name: "Stoxx 600" },
    { pattern: /DAX(\s*40)?/i, name: "DAX" },
    { pattern: /FTSE\s*100/i, name: "FTSE 100" },
    { pattern: /NASDAQ(\s*100)?/i, name: "Nasdaq 100" },
    { pattern: /NIKKEI(\s*225)?/i, name: "Nikkei 225" },
    { pattern: /TOPIX/i, name: "Topix" },
    { pattern: /HANG\s*SENG/i, name: "Hang Seng" },
    { pattern: /MSCI\s*USA/i, name: "MSCI USA" },
    { pattern: /RUSSELL\s*2000/i, name: "Russell 2000" },
  ];
  
  for (const { pattern, name } of knownIndices) {
    if (pattern.test(upperText)) {
      return name;
    }
  }
  
  return undefined;
}

/**
 * Construit le nom frontend du produit à partir du type et du sous-jacent
 */
function buildFrontendProductName(
  productType: string, 
  underlying: string | undefined, 
  doc: FinancialDocument
): string {
  // Si on a le type et le sous-jacent, construire le nom
  if (underlying) {
    return `${productType} ${underlying}`;
  }
  
  // Sinon, essayer le nom du produit
  if (doc.identite?.produit?.nom) {
    return doc.identite.produit.nom;
  }
  
  // Fallback sur le nom du fichier sans extension
  if (doc.metadata?.documentName) {
    return doc.metadata.documentName.replace(/\.(pdf|PDF)$/, "").replace(/_/g, " ");
  }
  
  return `${productType} - Document analysé`;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  // Nouveau format: produit.horizonRecommande
  if (anyDoc.produit?.horizonRecommande) {
    const match = anyDoc.produit.horizonRecommande.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  
  // Ancien format
  const contexte = doc.scenarios?.contexte || "";
  const match = contexte.match(/(\d+)\s*(an|year)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 5; // Durée par défaut pour la plupart des produits
}

/**
 * Extrait les frais du document (supporte les deux formats)
 */
function extractCosts(doc: FinancialDocument): {
  baseInvestmentAmount: number;
  ongoingChargesPercentPerYear: number;
  transactionCostsPercentPerYear: number;
  entryFeePercent: number;
  exitFeePercent: number;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  
  // Nouveau format de l'API
  if (anyDoc.frais) {
    return {
      baseInvestmentAmount: 10000,
      ongoingChargesPercentPerYear: anyDoc.frais.gestionAnnuelle?.taux || anyDoc.frais.totalAnnuel?.taux || doc.frais?.gestion?.tauxAnnuel || 0,
      transactionCostsPercentPerYear: anyDoc.frais.transaction?.taux || doc.frais?.transaction?.taux || 0,
      entryFeePercent: anyDoc.frais.entree?.taux || doc.frais?.entree?.taux || 0,
      exitFeePercent: anyDoc.frais.sortie?.taux || doc.frais?.sortie?.taux || 0,
    };
  }
  
  // Ancien format
  return {
    baseInvestmentAmount: 10000,
    ongoingChargesPercentPerYear: doc.frais?.courantsAnnuels?.taux || doc.frais?.gestion?.tauxAnnuel || 0,
    transactionCostsPercentPerYear: doc.frais?.transaction?.taux || 0,
    entryFeePercent: doc.frais?.entree?.taux || 0,
    exitFeePercent: doc.frais?.sortie?.taux || 0,
  };
}

/**
 * Extrait les scénarios de performance (supporte les deux formats)
 */
function extractScenarios(doc: FinancialDocument): Scenario[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = doc as any;
  const scenarios: Scenario[] = [];
  const baseAmount = 10000;
  
  // Nouveau format de l'API
  if (anyDoc.scenarios) {
    if (anyDoc.scenarios.stress) {
      scenarios.push({
        type: "stress",
        label: "Scénario de tensions",
        amountAfterEndOfRecommendedPeriod: anyDoc.scenarios.stress.montantHorizon || anyDoc.scenarios.stress.montant1an || baseAmount * 0.5,
      });
    }
    
    if (anyDoc.scenarios.defavorable) {
      scenarios.push({
        type: "unfavourable",
        label: "Scénario défavorable",
        amountAfterEndOfRecommendedPeriod: anyDoc.scenarios.defavorable.montantHorizon || anyDoc.scenarios.defavorable.montant1an || baseAmount * 0.85,
      });
    }
    
    if (anyDoc.scenarios.intermediaire) {
      scenarios.push({
        type: "moderate",
        label: "Scénario intermédiaire",
        amountAfterEndOfRecommendedPeriod: anyDoc.scenarios.intermediaire.montantHorizon || anyDoc.scenarios.intermediaire.montant1an || baseAmount * 1.2,
      });
    }
    
    if (anyDoc.scenarios.favorable) {
      scenarios.push({
        type: "favourable",
        label: "Scénario favorable",
        amountAfterEndOfRecommendedPeriod: anyDoc.scenarios.favorable.montantHorizon || anyDoc.scenarios.favorable.montant1an || baseAmount * 1.5,
      });
    }
  }
  
  // Ancien format
  if (scenarios.length === 0 && doc.scenarios) {
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

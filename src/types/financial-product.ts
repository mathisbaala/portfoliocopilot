/**
 * Types TypeScript pour les produits financiers (ETF, OPCVM, etc.)
 * Basé sur le schéma PRIIPs KID standardisé
 */

export interface FinancialProduct {
  schemaVersion: string;
  frontendProductName?: string;
  productType: "ETF" | "OPCVM" | "FCP" | "SICAV";
  distributorName?: string;
  documentInfo: DocumentInfo;
  product: Product;
  risk: Risk;
  performanceScenarios: PerformanceScenarios;
  costs: Costs;
  liquidityAndTrading: LiquidityAndTrading;
  typeSpecific: TypeSpecific;
  historicalPerformance?: HistoricalPerformance;
}

export interface DocumentInfo {
  documentType: string;
  language: string;
  kidProductionDate: string;
}

export interface Product {
  name: string;
  isin: string;
  currency: string;
  descriptionShort: string;
  manufacturer: string;
  domicileCountry: string;
  regulator: string;
}

export interface Risk {
  riskIndicator: number; // 1-7
  riskScaleMin: number;
  riskScaleMax: number;
  recommendedHoldingPeriodYears: number;
  capitalGuarantee: boolean;
  canLoseMoreThanInvested: boolean;
}

export interface PerformanceScenarios {
  baseCurrency: string;
  baseInvestmentAmount: number;
  scenarios: Scenario[];
}

export interface Scenario {
  type: "stress" | "unfavourable" | "moderate" | "favourable";
  label: string;
  amountAfterEndOfRecommendedPeriod: number;
}

export interface Costs {
  baseInvestmentAmount: number;
  ongoingChargesPercentPerYear: number;
  transactionCostsPercentPerYear: number;
  entryFeePercent: number;
  exitFeePercent: number;
}

export interface LiquidityAndTrading {
  tradedOnExchange: boolean;
  mainExchange: string;
  ticker: string;
  canRedeemBeforeEndOfPeriod: boolean;
}

export interface TypeSpecific {
  kind: "ETF" | "OPCVM" | "FCP";
  fundType?: string;
  category: string;
  index?: {
    name: string;
    type: string;
    provider: string;
  };
  managementStyle: "PASSIVE" | "ACTIVE";
  replicationMethod?: "PHYSICAL" | "SYNTHETIC";
  peaEligible: boolean;
  distributionPolicy: "ACCUMULATION" | "DISTRIBUTION";
}

export interface HistoricalPerformance {
  dataPoints: DataPoint[];
  currentValue: number;
  baseValue: number;
  startDate: string;
  endDate: string;
  annualizedReturn?: number;
  maxDrawdown?: number;
}

export interface DataPoint {
  date: string;
  value: number; // Normalized to 100 at start
}

/**
 * Helper pour calculer la performance depuis le début
 */
export function calculatePerformance(
  currentAmount: number,
  initialAmount: number
): number {
  return ((currentAmount - initialAmount) / initialAmount) * 100;
}

/**
 * Helper pour formater les montants en euros
 */
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Helper pour formater les pourcentages
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)} %`;
}

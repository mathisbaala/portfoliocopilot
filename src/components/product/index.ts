/**
 * Index des composants du dashboard produit financier
 * 
 * Export centralisé pour faciliter les imports
 */

// Dashboards
export { FinancialProductDashboard } from "./financial-product-dashboard";
export { ProductEtfDashboardV2 } from "./product-etf-dashboard-v2";

// Composants de layout
export { ProductHeader } from "./product-header";
export { KpiGrid } from "./kpi-grid";
export { KpiCard } from "./kpi-card";
export { HistoricalChart } from "./historical-chart";
export { PerformanceScenariosCard } from "./performance-scenarios";
export { LegalInfo } from "./legal-info";
export { CustomInvestmentInput } from "./custom-investment-input";
export { QuestionSection } from "./question-section";

// Sections (ancien format)
export { Section1What } from "./section-1-what";
export { Section2How } from "./section-2-how";
export { Section3Risk } from "./section-3-risk";
export { Section4Liquidity } from "./section-4-liquidity";
export { Section5Costs } from "./section-5-costs";

// Sections V2 (nouveau format master/detail)
export * from "./sections";

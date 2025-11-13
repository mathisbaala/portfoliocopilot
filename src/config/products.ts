/**
 * Configuration des produits financiers disponibles
 * Chaque produit doit avoir un fichier JSON correspondant dans src/data/
 */

export interface ProductConfig {
  id: string;
  fileName: string;
  frontendProductName: string;
}

export const availableProducts: ProductConfig[] = [
  {
    id: "amundi-cac40",
    fileName: "amundi-cac40-etf.json",
    frontendProductName: "ETF CAC 40 Acc",
  },
  {
    id: "amundi-sp500",
    fileName: "amundi-sp500-etf.json",
    frontendProductName: "ETF S&P 500 Acc",
  },
  {
    id: "msci-world",
    fileName: "sample-msci-world.json",
    frontendProductName: "ETF MSCI World",
  },
];

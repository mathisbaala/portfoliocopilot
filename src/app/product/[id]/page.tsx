import { FinancialProduct } from "@/types/financial-product";
import { ProductEtfDashboardV2 } from "@/components/product/product-etf-dashboard-v2";
import { availableProducts } from "@/config/products";
import { notFound } from "next/navigation";

// Import dynamique des JSON
import amundiCac40 from "@/data/amundi-cac40-etf.json";
import amundiSp500 from "@/data/amundi-sp500-etf.json";
import msciWorld from "@/data/sample-msci-world.json";

const productsData: Record<string, FinancialProduct> = {
  "amundi-cac40": amundiCac40 as FinancialProduct,
  "amundi-sp500": amundiSp500 as FinancialProduct,
  "msci-world": msciWorld as FinancialProduct,
};

// Generate static params for all available products
export function generateStaticParams() {
  return availableProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = productsData[id];
  
  if (!product) {
    notFound();
  }
  
  return <ProductEtfDashboardV2 data={product} />;
}

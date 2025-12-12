"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductEtfDashboardV2 } from "@/components/product/product-etf-dashboard-v2";
import { getExtractionById } from "@/lib/storage";
import type { FinancialProduct } from "@/types/financial-product";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function ExtractedProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<FinancialProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(() => {
    const id = params.id as string;
    
    if (!id) {
      return { error: "ID de produit manquant", product: null };
    }

    // Récupérer l'extraction depuis le localStorage
    const extraction = getExtractionById(id);
    
    if (!extraction) {
      return { error: "Produit non trouvé. Il a peut-être été supprimé.", product: null };
    }

    if (!extraction.productData) {
      return { error: "Données du produit non disponibles. Veuillez re-extraire le document.", product: null };
    }

    return { error: null, product: extraction.productData };
  }, [params.id]);

  useEffect(() => {
    const result = loadProduct();
    setError(result.error);
    setProduct(result.product);
    setLoading(false);
  }, [loadProduct]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Produit non trouvé
            </h1>
            <p className="text-slate-600">
              {error || "Le produit demandé n'existe pas ou a été supprimé."}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec retour */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {product.frontendProductName || product.product.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {product.product.isin} • {product.productType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                Extrait par IA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard v2 */}
      <ProductEtfDashboardV2 data={product} />
    </div>
  );
}

/**
 * Client-side storage utilities for managing extraction history
 * Uses localStorage to persist data across sessions
 */

import type { FinancialDocument } from "@/types/financial-document";
import type { FinancialProduct } from "@/types/financial-product";
import { convertToFinancialProduct } from "./document-converter";

export interface StoredExtraction {
  id: string;
  fileName: string;
  uploadDate: string;
  data: FinancialDocument;
  /** FinancialProduct converti pour le dashboard v2 */
  productData?: FinancialProduct;
}

const STORAGE_KEY = "portfoliocopilot_extractions";

/**
 * Get all stored extractions from localStorage
 */
export function getStoredExtractions(): StoredExtraction[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load stored extractions:", error);
    return [];
  }
}

/**
 * Save a new extraction to localStorage
 * Automatically converts to FinancialProduct for dashboard v2
 */
export function saveExtraction(fileName: string, data: FinancialDocument): string {
  if (typeof window === "undefined") return "";
  
  try {
    const extractions = getStoredExtractions();
    const id = crypto.randomUUID();
    
    // Convertir en FinancialProduct pour le dashboard v2
    const productData = convertToFinancialProduct(data);
    
    const newExtraction: StoredExtraction = {
      id,
      fileName,
      uploadDate: new Date().toISOString(),
      data,
      productData,
    };
    
    extractions.unshift(newExtraction); // Add to beginning
    
    // Keep only last 50 extractions
    const trimmed = extractions.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    return id;
  } catch (error) {
    console.error("Failed to save extraction:", error);
    return "";
  }
}

/**
 * Get a specific extraction by ID
 */
export function getExtractionById(id: string): StoredExtraction | null {
  const extractions = getStoredExtractions();
  return extractions.find(e => e.id === id) || null;
}

/**
 * Delete an extraction by ID
 */
export function deleteExtraction(id: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const extractions = getStoredExtractions();
    const filtered = extractions.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete extraction:", error);
  }
}

/**
 * Clear all stored extractions
 */
export function clearAllExtractions(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear extractions:", error);
  }
}

/**
 * Get statistics from stored extractions
 */
export function getExtractionStats() {
  const extractions = getStoredExtractions();
  
  if (extractions.length === 0) {
    return {
      totalDocuments: 0,
      avgConfidence: 0,
      avgRisk: 0,
      avgFees: 0,
      riskDistribution: {} as Record<number, number>,
    };
  }
  
  const totalDocuments = extractions.length;
  
  let totalConfidence = 0;
  let totalRisk = 0;
  let totalFees = 0;
  let validCount = 0;
  const riskDistribution: Record<number, number> = {};
  
  for (const extraction of extractions) {
    const { data } = extraction;
    
    if (data.extraction?.confidence) {
      totalConfidence += data.extraction.confidence;
      validCount++;
    }
    
    if (data.risque?.indicateurSynthetique?.niveau) {
      totalRisk += data.risque.indicateurSynthetique.niveau;
      riskDistribution[data.risque.indicateurSynthetique.niveau] = (riskDistribution[data.risque.indicateurSynthetique.niveau] || 0) + 1;
    }
    
    if (data.frais?.gestion?.tauxAnnuel !== undefined) {
      totalFees += data.frais.gestion.tauxAnnuel;
    }
  }
  
  return {
    totalDocuments,
    avgConfidence: validCount > 0 ? totalConfidence / validCount : 0,
    avgRisk: validCount > 0 ? totalRisk / validCount : 0,
    avgFees: validCount > 0 ? totalFees / validCount : 0,
    riskDistribution,
  };
}

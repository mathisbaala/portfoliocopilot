/**
 * API Route: /api/extract
 * 
 * EXTRACTION AVEC GPT-4o VISION UNIQUEMENT
 * 
 * Flow simplifié:
 * 1. Télécharge le PDF depuis Supabase Storage
 * 2. Convertit en base64
 * 3. Envoie à GPT-4o Vision pour extraction et structuration directe
 * 4. Retourne les données structurées
 * 
 * Avantages:
 * - Pas besoin d'AWS (un seul fournisseur: OpenAI)
 * - Setup ultra-simple
 * - Comprend mieux le contexte et la structure
 * - Un seul appel API au lieu de 2
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { DICData } from "@/types/dic-data";

// Validate environment variable
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB (OpenAI limit)
const REQUEST_TIMEOUT = 120000; // 2 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { fileUrl, fileName } = await request.json();

    // Validation
    if (!fileUrl || !fileName) {
      console.error("❌ Extract failed: Missing parameters");
      return NextResponse.json(
        { error: "URL du fichier et nom requis" },
        { status: 400 }
      );
    }

    if (!fileUrl.startsWith('http')) {
      console.error("❌ Extract failed: Invalid URL");
      return NextResponse.json(
        { error: "URL invalide" },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting extraction for: ${fileName}`);

    // Step 1: Download PDF from Supabase with timeout
    console.log("📥 Téléchargement du PDF depuis Supabase...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const pdfResponse = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }
    
    const arrayBuffer = await pdfResponse.arrayBuffer();
    
    // Validate PDF size
    if (arrayBuffer.byteLength > MAX_PDF_SIZE) {
      throw new Error(`PDF too large: ${Math.round(arrayBuffer.byteLength / 1024 / 1024)}MB (max 20MB)`);
    }
    
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64');
    const sizeMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2);
    
    console.log(`📄 PDF converti en base64 (${sizeMB} MB)`);
    
    // Step 2: Use GPT-4o Vision to extract and structure data directly from PDF
    console.log("🤖 Extraction et structuration avec GPT-4o Vision...");
    
    const userPrompt = `Analyse ce document financier PDF et extrait TOUTES les informations en JSON.

IMPORTANT:
- Extrait UNIQUEMENT les données RÉELLEMENT présentes
- Si information absente → null
- Pourcentages en nombres (ex: 1.5)
- Cherche "Indicateur de Risque" ou "SRI" (1-7)
- Cherche "Frais courants", "Frais de gestion"
- Cherche "Durée de placement recommandée"

JSON attendu:
{
  "metadata": {"documentName": "${fileName}", "uploadDate": "${new Date().toISOString()}", "extractionDate": "${new Date().toISOString()}", "documentType": "SICAV/FCP/ETF/Autre"},
  "general": {"emetteur": "...", "nomProduit": "...", "isin": "...", "categorie": "...", "devise": "EUR", "dateCreation": "..."},
  "risque": {"niveau": 1-7, "description": "...", "volatilite": "..."},
  "frais": {"entree": null, "sortie": null, "gestionAnnuels": 0, "courtage": null, "total": null, "details": "..."},
  "horizon": {"recommande": "...", "annees": null, "description": "..."},
  "scenarios": {"defavorable": {"montant": 0, "pourcentage": 0}, "intermediaire": {"montant": 0, "pourcentage": 0}, "favorable": {"montant": 0, "pourcentage": 0}, "baseInvestissement": 10000},
  "strategie": {"objectif": "...", "politique": "...", "zoneGeographique": "...", "secteurs": []},
  "complementaires": {"liquidite": "...", "fiscalite": "...", "garantie": "...", "profilInvestisseur": "..."},
  "extraction": {"success": true, "confidence": 0.0-1.0, "errors": [], "warnings": []}
}

Réponds UNIQUEMENT avec le JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en analyse de documents financiers français (DIC, DICI, KID). Tu réponds UNIQUEMENT avec du JSON valide."
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:application/pdf;base64,${base64Pdf}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4096
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error("Pas de réponse de l'IA");
    }

    // Parse and validate JSON
    let extractedData: DICData;
    try {
      extractedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", responseText);
      throw new Error("Réponse IA invalide - JSON non parsable");
    }

    // Validate required fields
    const missingFields: string[] = [];
    if (!extractedData.general) missingFields.push("general");
    if (!extractedData.risque) missingFields.push("risque");
    if (!extractedData.frais) missingFields.push("frais");
    if (!extractedData.extraction) missingFields.push("extraction");

    if (missingFields.length > 0) {
      console.warn(`⚠️ Champs manquants: ${missingFields.join(", ")}`);
      // Add default extraction status if missing
      if (!extractedData.extraction) {
        extractedData.extraction = {
          success: true,
          confidence: 0.5,
          warnings: [`Champs manquants: ${missingFields.join(", ")}`]
        };
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Extraction réussie en ${(duration / 1000).toFixed(1)}s`);
    console.log(`📊 Confiance: ${((extractedData.extraction?.confidence || 0) * 100).toFixed(0)}%`);
    console.log(`📝 Produit: ${extractedData.general?.nomProduit || 'N/A'}`);
    console.log(`⚠️ Risque: ${extractedData.risque?.niveau || 'N/A'}/7`);

    return NextResponse.json({
      ...extractedData,
      metadata: {
        ...extractedData.metadata,
        processingTime: duration,
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Extraction failed after ${(duration / 1000).toFixed(1)}s:`, error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Timeout - Le téléchargement a pris trop de temps" },
          { status: 408 }
        );
      }
      
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: "Erreur de configuration API" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: "Erreur lors de l'extraction",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        processingTime: duration
      },
      { status: 500 }
    );
  }
}

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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName } = await request.json();

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: "URL du fichier manquante" },
        { status: 400 }
      );
    }

    // Step 1: Download PDF from Supabase
    console.log("📥 Téléchargement du PDF depuis Supabase...");
    const pdfResponse = await fetch(fileUrl);
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64');
    
    console.log(`📄 PDF converti en base64 (${Math.round(arrayBuffer.byteLength / 1024)} KB)`);
    
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
    const extractedData: DICData = JSON.parse(responseText);

    // Add validation
    if (!extractedData.general || !extractedData.risque || !extractedData.frais) {
      console.warn("⚠️ Données extraites incomplètes, certains champs manquants");
    }

    console.log("✅ Extraction réussie avec données réelles !");
    console.log(`Confiance: ${extractedData.extraction?.confidence || 'N/A'}`);

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error("Extraction error:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de l'extraction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

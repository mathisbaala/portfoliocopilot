/**
 * API Route: /api/extract
 * 
 * EXTRACTION RÉELLE avec AWS Textract + OpenAI GPT-4o
 * 
 * Flow:
 * 1. Télécharge le PDF depuis Supabase Storage
 * 2. Utilise AWS Textract pour extraire tout le texte du PDF
 * 3. Envoie le texte à GPT-4o pour structurer les données en JSON DICData
 * 4. Retourne les données structurées
 */

import { NextRequest, NextResponse } from "next/server";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import OpenAI from "openai";
import type { DICData } from "@/types/dic-data";

// Initialize AWS Textract client
const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    // Step 2: Extract text from PDF using AWS Textract
    console.log("📄 Extraction du texte avec AWS Textract...");
    
    const textractCommand = new DetectDocumentTextCommand({
      Document: {
        Bytes: pdfBytes,
      },
    });

    const textractResponse = await textractClient.send(textractCommand);
    
    // Combine all detected text blocks
    const extractedText = textractResponse.Blocks
      ?.filter((block) => block.BlockType === "LINE")
      .map((block) => block.Text)
      .join("\n") || "";

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Le PDF ne contient pas assez de texte exploitable" },
        { status: 400 }
      );
    }

    console.log(`📝 Texte extrait: ${extractedText.length} caractères`);
    
    // Step 3: Use OpenAI GPT-4o to structure the data
    console.log("🤖 Structuration des données avec GPT-4o...");
    
    const prompt = `Tu es un expert en analyse de Documents d'Information Clé (DIC) et documents financiers.

Analyse ce document financier et extrait TOUTES les informations disponibles au format JSON exact.

IMPORTANT:
- Extrait UNIQUEMENT les données qui sont RÉELLEMENT présentes dans le document
- Si une information n'est pas trouvée, mets null
- Les pourcentages doivent être des nombres (ex: 1.5, pas "1.5%")
- Sois précis et extrais les chiffres EXACTS du document
- Pour le niveau de risque, cherche "Indicateur de Risque" ou "SRI" (échelle 1-7)
- Pour les frais, cherche "Frais courants", "Frais de gestion", "Frais d'entrée/sortie"
- Pour l'horizon, cherche "Durée de placement recommandée" ou "Horizon d'investissement"

Structure JSON attendue:
{
  "metadata": {
    "documentName": "${fileName}",
    "uploadDate": "${new Date().toISOString()}",
    "extractionDate": "${new Date().toISOString()}",
    "documentType": "SICAV ou FCP ou ETF ou Autre (selon le document)"
  },
  "general": {
    "emetteur": "nom de la société de gestion trouvé dans le document",
    "nomProduit": "nom complet du produit/fonds",
    "isin": "code ISIN si présent",
    "categorie": "catégorie exacte (Actions, Obligations, Monétaire, Mixte, etc.)",
    "devise": "EUR ou USD ou autre devise trouvée",
    "dateCreation": "date de création du fonds si disponible"
  },
  "risque": {
    "niveau": nombre entre 1 et 7 (SRI - Synthetic Risk Indicator),
    "description": "description du risque trouvée dans le document",
    "volatilite": "information sur la volatilité si disponible"
  },
  "frais": {
    "entree": pourcentage ou null,
    "sortie": pourcentage ou null,
    "gestionAnnuels": pourcentage (frais courants/frais de gestion),
    "courtage": pourcentage ou null,
    "total": pourcentage total si mentionné ou null,
    "details": "détails textuels sur les frais"
  },
  "horizon": {
    "recommande": "texte exact de la durée recommandée (ex: '5 ans minimum')",
    "annees": nombre d'années extrait ou null,
    "description": "description de l'horizon de placement"
  },
  "scenarios": {
    "defavorable": { "montant": montant en euros, "pourcentage": % de variation },
    "intermediaire": { "montant": montant en euros, "pourcentage": % de variation },
    "favorable": { "montant": montant en euros, "pourcentage": % de variation },
    "baseInvestissement": montant de base pour les scénarios (généralement 10000)
  },
  "strategie": {
    "objectif": "objectif d'investissement du fonds",
    "politique": "politique d'investissement détaillée",
    "zoneGeographique": "zone géographique d'investissement",
    "secteurs": ["liste", "des", "secteurs", "si", "mentionnés"]
  },
  "complementaires": {
    "liquidite": "conditions de rachat (quotidien, hebdomadaire, etc.)",
    "fiscalite": "informations fiscales (PEA, assurance-vie, etc.)",
    "garantie": "oui ou non - garantie en capital",
    "profilInvestisseur": "profil investisseur cible"
  },
  "extraction": {
    "success": true,
    "confidence": score entre 0 et 1 (ton niveau de confiance dans l'extraction),
    "errors": [],
    "warnings": ["liste des avertissements si certaines données sont manquantes ou incertaines"]
  }
}

Réponds UNIQUEMENT avec le JSON, sans markdown, sans texte additionnel.

DOCUMENT À ANALYSER:

${extractedText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en analyse de documents financiers français (DIC, DICI, KID). Tu réponds toujours avec du JSON valide et structuré. Tu extrais UNIQUEMENT les données réellement présentes dans le document."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: "json_object" }, // Force JSON response
      max_tokens: 4000 // Allow long responses for detailed extraction
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

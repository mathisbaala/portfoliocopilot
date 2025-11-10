import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { DICData } from "@/types/dic-data";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

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

    // 1. Download PDF from Supabase
    console.log("📥 Téléchargement du PDF...");
    const pdfResponse = await fetch(fileUrl);
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    // 2. Extract text from PDF using pdfjs
    console.log("📄 Extraction du texte...");
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDocument = await loadingTask.promise;
    
    let pdfText = "";
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      pdfText += pageText + "\n";
    }

    if (!pdfText || pdfText.length < 100) {
      return NextResponse.json(
        { error: "Le PDF ne contient pas assez de texte exploitable" },
        { status: 400 }
      );
    }

    console.log(`📝 Texte extrait: ${pdfText.length} caractères`);

    // 3. Use OpenAI to extract structured data
    console.log("🤖 Extraction structurée avec IA...");
    
    const prompt = `Tu es un expert en analyse de Documents d'Information Clé (DIC) pour produits financiers.

Analyse ce document DIC et extrait les informations suivantes au format JSON exact:

{
  "metadata": {
    "documentName": "${fileName}",
    "uploadDate": "${new Date().toISOString()}",
    "extractionDate": "${new Date().toISOString()}",
    "documentType": "SICAV ou FCP ou ETF ou Autre"
  },
  "general": {
    "emetteur": "nom de la société de gestion",
    "nomProduit": "nom complet du produit",
    "isin": "code ISIN si trouvé",
    "categorie": "catégorie (Actions, Obligations, Monétaire, etc.)",
    "devise": "EUR ou USD ou autre",
    "dateCreation": "date de création si disponible"
  },
  "risque": {
    "niveau": 1-7 (indicateur de risque SRI),
    "description": "description du risque",
    "volatilite": "information sur la volatilité"
  },
  "frais": {
    "entree": % ou null,
    "sortie": % ou null,
    "gestionAnnuels": % (obligatoire),
    "courtage": % ou null,
    "total": % ou null,
    "details": "détails si disponibles"
  },
  "horizon": {
    "recommande": "texte comme '5 ans minimum'",
    "annees": nombre d'années ou null,
    "description": "description de l'horizon"
  },
  "scenarios": {
    "defavorable": { "montant": X, "pourcentage": Y },
    "intermediaire": { "montant": X, "pourcentage": Y },
    "favorable": { "montant": X, "pourcentage": Y },
    "baseInvestissement": montant de base (ex: 10000)
  },
  "strategie": {
    "objectif": "objectif d'investissement",
    "politique": "politique d'investissement",
    "zoneGeographique": "zone géographique",
    "secteurs": ["secteur1", "secteur2"]
  },
  "complementaires": {
    "liquidite": "conditions de rachat",
    "fiscalite": "informations fiscales",
    "garantie": "oui ou non",
    "profilInvestisseur": "profil cible"
  },
  "extraction": {
    "success": true,
    "confidence": 0-1 (ton niveau de confiance),
    "errors": [],
    "warnings": ["avertissements éventuels"]
  }
}

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans markdown, sans texte additionnel
- Si une donnée n'est pas trouvée, mets null
- Les pourcentages doivent être des nombres (ex: 1.5, pas "1.5%")
- Sois précis et extrais les chiffres exacts du document
- Si tu n'es pas sûr d'une valeur, mets-la dans warnings

Voici le contenu du DIC:

${pdfText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en analyse de documents financiers. Tu réponds toujours avec du JSON valide et structuré."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: "json_object" } // Force JSON response
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error("Pas de réponse de l'IA");
    }

    // Parse and validate JSON
    const extractedData: DICData = JSON.parse(responseText);

    // Add validation
    if (!extractedData.general || !extractedData.risque || !extractedData.frais) {
      throw new Error("Données extraites incomplètes");
    }

    console.log("✅ Extraction réussie !");

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

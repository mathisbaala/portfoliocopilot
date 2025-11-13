import { NextRequest, NextResponse } from "next/server";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import OpenAI from "openai";
import type { DICData } from "@/types/dic-data";

const textract = new TextractClient({
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { fileUrl, fileName } = await request.json();
    
    if (!fileUrl || !fileName) {
      throw new Error("Missing fileUrl or fileName");
    }
    
    console.log(`📄 Extraction: ${fileName}`);
    
    // Download PDF
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`PDF download failed: ${pdfResponse.status}`);
    }
    
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    
    // Validate PDF format
    if (!pdfBuffer.slice(0, 4).toString().startsWith('%PDF')) {
      throw new Error("Invalid PDF format");
    }
    
    console.log(`📊 PDF: ${(pdfBuffer.length / 1024).toFixed(0)}KB`);
    
    let extractedText = "";
    
    // Try AWS Textract first (best quality)
    try {
      const textractResponse = await textract.send(
        new DetectDocumentTextCommand({
          Document: { Bytes: new Uint8Array(pdfBuffer) },
        })
      );
      
      extractedText = textractResponse.Blocks
        ?.filter(block => block.BlockType === "LINE" && block.Text)
        .map(block => block.Text!)
        .join(" ") || "";
        
      console.log(`✅ Textract: ${extractedText.split(/\s+/).length} mots`);
      
    } catch (textractError) {
      // Fallback: Extract raw text from PDF buffer
      const errorMsg = textractError instanceof Error ? textractError.message : 'Unknown error';
      const errorName = textractError instanceof Error ? textractError.name : 'UnknownError';
      
      if (errorName === 'UnsupportedDocumentException') {
        console.log(`ℹ️ PDF généré par navigateur (Chromium/Skia) - extraction fallback`);
      } else {
        console.log(`⚠️ Textract indisponible (${errorName}) - extraction fallback`);
      }

      
      const pdfText = pdfBuffer.toString('latin1');
      const textMatches = pdfText.match(/\(([^)]+)\)/g) || [];
      
      extractedText = textMatches
        .map(match => match.slice(1, -1)
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
        )
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length < 100) {
        throw new Error(
          "PDF extraction failed. Le PDF est peut-être scanné (image) ou vide. " +
          `Détails: ${errorMsg}`
        );
      }
      
      console.log(`✅ Fallback: ${extractedText.length} caractères`);
    }
    
    // Use more text for better accuracy (25000 chars = ~5000 tokens)
    const optimizedText = extractedText.slice(0, 25000);
    
    console.log(`🤖 GPT-4o analyse (${optimizedText.length} chars)...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en analyse de Documents d'Information Clé (DIC/DICI/KID/PRIIPS) pour produits financiers français.

INSTRUCTIONS STRICTES:
1. Lis TOUT le texte attentivement
2. Extrait TOUTES les données présentes (ne laisse AUCUN champ vide si l'info existe)
3. Pour les champs numériques: cherche les pourcentages, montants, années
4. Pour les scénarios: cherche "scénario défavorable/modéré/favorable" ou "stress/défavorable/intermédiaire/favorable"
5. Pour les frais: cherche "frais d'entrée/sortie/gestion/courtage/totaux"
6. Pour le risque: cherche "indicateur de risque" ou "SRI" (échelle 1-7)
7. Pour l'ISIN: format FR + 10 chiffres (ex: FR0010314401)
8. Réponds en JSON valide UNIQUEMENT`
        },
        {
          role: "user",
          content: `EXTRAIT TOUTES les informations de ce document financier (DIC/KID/PRIIPS).

===== TEXTE DU DOCUMENT =====
${optimizedText}
===== FIN DU TEXTE =====

TU DOIS EXTRAIRE LES VRAIES VALEURS du texte ci-dessus. NE METS JAMAIS de placeholders comme "NOM_SOCIETE", "CHIFFRE", etc.

EXEMPLES DE CE QU'ON ATTEND:

✅ BON: "emetteur": "Amundi Asset Management"
❌ MAUVAIS: "emetteur": "NOM_SOCIETE_GESTION"

✅ BON: "niveau": 4
❌ MAUVAIS: "niveau": "CHIFFRE_1_A_7"

✅ BON: "gestionAnnuels": 1.85
❌ MAUVAIS: "gestionAnnuels": "POURCENTAGE"

CHAMPS À EXTRAIRE (avec les VRAIES valeurs du document):

1. ÉMETTEUR: Cherche "société de gestion", "émetteur", souvent au début
2. NOM PRODUIT: Titre principal du document
3. ISIN: Code format FR0010314401 (FR suivi de 10 chiffres)
4. CATÉGORIE: Actions, Obligations, Monétaire, Diversifié, etc.
5. RISQUE NIVEAU: Nombre de 1 à 7 (cherche "indicateur de risque", "SRI", échelle avec un chiffre encerclé)
6. FRAIS: Pourcentages exacts (ex: 1.85, 0.5, 2.0)
7. HORIZON: Nombre d'années recommandées (ex: "5 ans", "8 ans")
8. SCÉNARIOS: Montants et pourcentages dans les tableaux de performance

RÉPONDS AVEC CE JSON (REMPLIS avec les VRAIES données extraites):
{
  "metadata": {
    "documentName": "${fileName}",
    "uploadDate": "${new Date().toISOString()}",
    "extractionDate": "${new Date().toISOString()}",
    "documentType": "SICAV"
  },
  "general": {
    "emetteur": "trouve le nom réel de la société de gestion",
    "nomProduit": "trouve le nom réel du produit",
    "isin": "trouve le vrai code ISIN",
    "categorie": "trouve la vraie catégorie",
    "devise": "EUR",
    "dateCreation": null
  },
  "risque": {
    "niveau": 4,
    "description": "trouve la vraie description du risque",
    "volatilite": null
  },
  "frais": {
    "entree": 0,
    "sortie": 0,
    "gestionAnnuels": 1.85,
    "courtage": null,
    "total": 2.0,
    "details": "trouve les vrais détails"
  },
  "horizon": {
    "recommande": "5 ans",
    "annees": 5,
    "description": "trouve la vraie description de l'horizon"
  },
  "scenarios": {
    "defavorable": {
      "montant": 8500,
      "pourcentage": -15.0
    },
    "intermediaire": {
      "montant": 10800,
      "pourcentage": 8.0
    },
    "favorable": {
      "montant": 13200,
      "pourcentage": 32.0
    },
    "baseInvestissement": 10000
  },
  "strategie": {
    "objectif": "trouve le vrai objectif d'investissement dans le texte",
    "politique": "trouve la vraie politique d'investissement",
    "zoneGeographique": "trouve la zone géographique",
    "secteurs": ["trouve", "les", "vrais", "secteurs"]
  },
  "complementaires": {
    "liquidite": "trouve les vraies conditions de rachat",
    "fiscalite": "trouve les infos fiscales si présentes",
    "garantie": "Non",
    "profilInvestisseur": "trouve le vrai profil d'investisseur cible"
  },
  "extraction": {
    "success": true,
    "confidence": 0.95,
    "errors": [],
    "warnings": []
  }
}

IMPORTANT: Remplace TOUS les textes "trouve..." par les VRAIES valeurs extraites du document.
Si une info n'existe pas dans le texte, mets null ou une chaîne vide "", mais JAMAIS de placeholder.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });
    
    const extractedData: DICData = JSON.parse(completion.choices[0].message.content!);
    
    // Detect placeholders (BAD extraction)
    const jsonString = JSON.stringify(extractedData);
    const hasPlaceholders = /NOM_|CHIFFRE|POURCENTAGE|MONTANT|DESCRIPTION|OBJECTIF|POLITIQUE|ZONE_|SECTEUR\d|CONDITIONS|INFO_|PROFIL_|trouve/i.test(jsonString);
    
    if (hasPlaceholders) {
      console.error("❌ ERREUR: L'extraction contient des placeholders au lieu de vraies valeurs!");
      throw new Error("Extraction invalide: GPT-4o a retourné des placeholders");
    }
    
    // Quality check: count populated fields
    const totalFields = [
      extractedData.general.emetteur,
      extractedData.general.nomProduit,
      extractedData.general.isin,
      extractedData.general.categorie,
      extractedData.risque.niveau > 0,
      extractedData.risque.description,
      extractedData.frais.gestionAnnuels > 0,
      extractedData.horizon.recommande,
      extractedData.strategie?.objectif,
      extractedData.strategie?.politique,
    ].filter(Boolean).length;
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Terminé: ${duration}ms - ${totalFields}/10 champs remplis`);
    
    // Adjust confidence based on populated fields
    const adjustedConfidence = Math.min(0.99, (totalFields / 10) * extractedData.extraction.confidence);
    const existingWarnings = extractedData.extraction.warnings || [];
    
    return NextResponse.json({
      ...extractedData,
      metadata: {
        ...extractedData.metadata,
        processingTime: duration,
      },
      extraction: {
        ...extractedData.extraction,
        confidence: adjustedConfidence,
        warnings: totalFields < 5 ? [
          ...existingWarnings,
          "Extraction partielle - certaines données manquent peut-être dans le document"
        ] : existingWarnings,
      },
    });
    
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Erreur extraction", details: (error as Error).message },
      { status: 500 }
    );
  }
}

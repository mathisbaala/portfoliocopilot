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
          content: `Analyse ce document financier et extrait TOUTES les données disponibles:

TEXTE DU DOCUMENT:
${optimizedText}

INSTRUCTIONS D'EXTRACTION:
- Émetteur: nom de la société de gestion (ex: Amundi, BNP Paribas, Axa)
- Nom produit: nom complet du fonds/produit
- ISIN: code à 12 caractères commençant par FR
- Catégorie: type d'investissement (ex: Actions, Obligations, Diversifié)
- Risque niveau: chiffre de 1 à 7 (cherche "indicateur" ou "SRI")
- Frais: tous les pourcentages de frais mentionnés
- Horizon: durée recommandée (ex: "5 ans", "10 ans")
- Scénarios: montants et rendements pour chaque scénario (défavorable, intermédiaire, favorable)
- Stratégie: objectif et politique d'investissement

RÉPONDS AVEC CE JSON (REMPLI avec les données trouvées):
{
  "metadata": {
    "documentName": "${fileName}",
    "uploadDate": "${new Date().toISOString()}",
    "extractionDate": "${new Date().toISOString()}",
    "documentType": "SICAV"
  },
  "general": {
    "emetteur": "NOM_SOCIETE_GESTION",
    "nomProduit": "NOM_COMPLET_PRODUIT",
    "isin": "CODE_ISIN",
    "categorie": "CATEGORIE",
    "devise": "EUR",
    "dateCreation": "DATE_SI_PRESENTE"
  },
  "risque": {
    "niveau": CHIFFRE_1_A_7,
    "description": "DESCRIPTION_RISQUE",
    "volatilite": "INFO_VOLATILITE"
  },
  "frais": {
    "entree": POURCENTAGE_OU_NULL,
    "sortie": POURCENTAGE_OU_NULL,
    "gestionAnnuels": POURCENTAGE,
    "courtage": POURCENTAGE_OU_NULL,
    "total": POURCENTAGE_TOTAL,
    "details": "DETAILS_FRAIS"
  },
  "horizon": {
    "recommande": "X ans",
    "annees": NOMBRE_ANNEES,
    "description": "DESCRIPTION"
  },
  "scenarios": {
    "defavorable": {
      "montant": MONTANT,
      "pourcentage": RENDEMENT_POURCENTAGE
    },
    "intermediaire": {
      "montant": MONTANT,
      "pourcentage": RENDEMENT_POURCENTAGE
    },
    "favorable": {
      "montant": MONTANT,
      "pourcentage": RENDEMENT_POURCENTAGE
    },
    "baseInvestissement": 10000
  },
  "strategie": {
    "objectif": "OBJECTIF_INVESTISSEMENT",
    "politique": "POLITIQUE_GESTION",
    "zoneGeographique": "ZONE_GEO",
    "secteurs": ["SECTEUR1", "SECTEUR2"]
  },
  "complementaires": {
    "liquidite": "CONDITIONS_RACHAT",
    "fiscalite": "INFO_FISCALE",
    "garantie": "Oui/Non",
    "profilInvestisseur": "PROFIL_CIBLE"
  },
  "extraction": {
    "success": true,
    "confidence": 0.95,
    "errors": [],
    "warnings": []
  }
}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });
    
    const extractedData: DICData = JSON.parse(completion.choices[0].message.content!);
    
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

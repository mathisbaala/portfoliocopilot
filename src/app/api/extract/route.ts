import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { DICData } from "@/types/dic-data";

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
    
    // Convert PDF buffer to base64 for GPT-4o
    const base64Pdf = pdfBuffer.toString('base64');
    
    console.log(`🤖 Envoi du PDF directement à GPT-4o...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en analyse de Documents d'Information Clé (DIC/DICI/KID/PRIIPS) pour produits financiers français.

INSTRUCTIONS STRICTES:
1. Analyse TOUT le document PDF attentivement
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
          content: [
            {
              type: "text",
              text: `Analyse ce document financier PDF (DIC/KID/PRIIPS) et extrait les données structurées.

Extrait et retourne un JSON valide avec les informations suivantes:`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Pdf}`,
              },
            },
          ] as any,
        },
        {
          role: "user",
          content: `Continue l'extraction avec ces champs:

1. **general.emetteur**: Nom de la société de gestion (cherche en haut du document)
2. **general.nomProduit**: Nom complet du fonds/produit (titre principal)
3. **general.isin**: Code ISIN (format: FR suivi de 10 chiffres)
4. **general.categorie**: Type d'actifs (Actions, Obligations, Diversifié, Monétaire...)
5. **general.devise**: Devise de référence (EUR, USD...)
6. **risque.niveau**: Indicateur de risque de 1 à 7 (cherche "indicateur de risque" ou échelle SRI)
7. **risque.description**: Description textuelle du risque
8. **frais.gestionAnnuels**: Frais de gestion annuels en pourcentage (ex: 1.85)
9. **frais.entree**: Frais d'entrée en pourcentage (ou null)
10. **frais.sortie**: Frais de sortie en pourcentage (ou null)
11. **frais.total**: Total des frais annuels
12. **horizon.recommande**: Durée recommandée (ex: "5 ans")
13. **horizon.annees**: Nombre d'années (ex: 5)
14. **scenarios**: Scénarios de performance avec montants et pourcentages (défavorable, intermédiaire, favorable)
15. **strategie.objectif**: Objectif d'investissement
16. **strategie.politique**: Politique de gestion

Retourne UNIQUEMENT le JSON suivant avec les valeurs RÉELLES extraites du texte:

{
  "metadata": {
    "documentName": "${fileName}",
    "uploadDate": "${new Date().toISOString()}",
    "extractionDate": "${new Date().toISOString()}",
    "documentType": "SICAV"
  },
  "general": {
    "emetteur": "",
    "nomProduit": "",
    "isin": "",
    "categorie": "",
    "devise": "EUR",
    "dateCreation": null
  },
  "risque": {
    "niveau": 1,
    "description": "",
    "volatilite": null
  },
  "frais": {
    "entree": null,
    "sortie": null,
    "gestionAnnuels": 0,
    "courtage": null,
    "total": 0,
    "details": ""
  },
  "horizon": {
    "recommande": "",
    "annees": null,
    "description": null
  },
  "scenarios": {
    "defavorable": {
      "montant": null,
      "pourcentage": null
    },
    "intermediaire": {
      "montant": null,
      "pourcentage": null
    },
    "favorable": {
      "montant": null,
      "pourcentage": null
    },
    "baseInvestissement": 10000
  },
  "strategie": {
    "objectif": "",
    "politique": "",
    "zoneGeographique": null,
    "secteurs": []
  },
  "complementaires": {
    "liquidite": null,
    "fiscalite": null,
    "garantie": "Non",
    "profilInvestisseur": null
  },
  "extraction": {
    "success": true,
    "confidence": 0.9,
    "errors": [],
    "warnings": []
  }
}

REMPLIS chaque champ avec les valeurs trouvées dans le document. Si une information n'existe pas, laisse null ou "".`
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

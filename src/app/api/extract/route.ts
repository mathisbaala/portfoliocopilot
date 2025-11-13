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
    
    console.log("Extraction:", fileName);
    console.log("File URL:", fileUrl);
    
    const pdfResponse = await fetch(fileUrl);
    console.log("PDF Response status:", pdfResponse.status);
    console.log("PDF Response content-type:", pdfResponse.headers.get("content-type"));
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }
    
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    
    console.log("PDF Buffer size:", pdfBuffer.length, "bytes");
    console.log("PDF Magic bytes:", pdfBuffer.slice(0, 8).toString('hex'));
    console.log("PDF Last bytes:", pdfBuffer.slice(-8).toString('hex'));
    
    // Verify it's a valid PDF
    if (!pdfBuffer.slice(0, 4).toString().startsWith('%PDF')) {
      throw new Error("Invalid PDF format - file does not start with %PDF header");
    }
    
    // Check if PDF ends with EOF marker
    const pdfEnd = pdfBuffer.slice(-1024).toString('latin1');
    if (!pdfEnd.includes('%%EOF')) {
      console.warn("⚠️ Warning: PDF may be truncated (no %%EOF marker found)");
    }
    
    console.log("AWS Textract...");
    console.log("Textract region:", process.env.AWS_REGION || "eu-west-1");
    
    let extractedText = "";
    
    // Try AWS Textract first
    try {
      // Try with Uint8Array instead of Buffer (AWS SDK sometimes prefers this)
      const uint8Array = new Uint8Array(pdfBuffer);
      
      const textractResponse = await textract.send(
        new DetectDocumentTextCommand({
          Document: { Bytes: uint8Array },
        })
      );
      
      extractedText = textractResponse.Blocks?.filter(
        (block) => block.BlockType === "LINE"
      )
        .map((block) => block.Text)
        .join(" ") || "";
        
      console.log("✅ Textract success:", extractedText.split(/\s+/).length, "mots");
      
    } catch (textractError: any) {
      console.warn("⚠️ Textract failed:", textractError.message);
      console.log("🔄 Fallback: Converting PDF to images for GPT-4o Vision...");
      
      // Fallback: Use GPT-4o Vision with PDF
      // GPT-4o can't process PDF directly, so we'll send the raw text extraction request
      // For now, we'll throw and let the user know they need a different PDF
      throw new Error(
        `AWS Textract ne peut pas traiter ce PDF (format non supporté). ` +
        `Essayez de réexporter le PDF depuis Adobe Acrobat ou un autre outil. ` +
        `Détails techniques: ${textractError.message}`
      );
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Expert en documents financiers français. Réponds en JSON valide uniquement.",
        },
        {
          role: "user",
          content: `Analyse et extrait les données:

TEXTE:
${extractedText.slice(0, 15000)}

FORMAT JSON:
{"metadata":{"documentName":"${fileName}","uploadDate":"${new Date().toISOString()}","extractionDate":"${new Date().toISOString()}","documentType":"SICAV"},"general":{"emetteur":"","nomProduit":"","isin":null,"categorie":"","devise":"EUR","dateCreation":null},"risque":{"niveau":1,"description":"","volatilite":null},"frais":{"entree":null,"sortie":null,"gestionAnnuels":0,"courtage":null,"total":null,"details":null},"horizon":{"recommande":"","annees":null,"description":null},"scenarios":{"defavorable":{"montant":0,"pourcentage":0},"intermediaire":{"montant":0,"pourcentage":0},"favorable":{"montant":0,"pourcentage":0},"baseInvestissement":10000},"strategie":{"objectif":"","politique":"","zoneGeographique":null,"secteurs":[]},"complementaires":{"liquidite":null,"fiscalite":null,"garantie":null,"profilInvestisseur":null},"extraction":{"success":true,"confidence":0.8,"errors":[],"warnings":[]}}

Réponds UNIQUEMENT avec le JSON.`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });
    
    const responseText = completion.choices[0].message.content!;
    const extractedData: DICData = JSON.parse(responseText);
    
    const duration = Date.now() - startTime;
    console.log("Extraction OK:", duration, "ms");
    
    return NextResponse.json({
      ...extractedData,
      metadata: {
        ...extractedData.metadata,
        processingTime: duration,
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

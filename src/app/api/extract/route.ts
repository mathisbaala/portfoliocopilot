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
      console.log(`⚠️ Textract failed, using fallback`);
      
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
    
    // Optimize text for GPT-4o (limit to 12000 chars for faster processing)
    const optimizedText = extractedText.slice(0, 12000);
    
    console.log(`🤖 GPT-4o structuration...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en analyse de documents financiers français (DIC/DICI/PRIIPS). Extrait les données clés et réponds en JSON valide uniquement. Sois précis et concis."
        },
        {
          role: "user",
          content: `Extrait les données de ce document financier:

${optimizedText}

Réponds avec ce JSON exact (remplace les valeurs):
{
  "metadata":{"documentName":"${fileName}","uploadDate":"${new Date().toISOString()}","extractionDate":"${new Date().toISOString()}","documentType":"SICAV"},
  "general":{"emetteur":"","nomProduit":"","isin":"","categorie":"","devise":"EUR","dateCreation":""},
  "risque":{"niveau":4,"description":"","volatilite":""},
  "frais":{"entree":0,"sortie":0,"gestionAnnuels":0,"courtage":0,"total":0,"details":""},
  "horizon":{"recommande":"5 ans","annees":5,"description":""},
  "scenarios":{"defavorable":{"montant":0,"pourcentage":0},"intermediaire":{"montant":0,"pourcentage":0},"favorable":{"montant":0,"pourcentage":0},"baseInvestissement":10000},
  "strategie":{"objectif":"","politique":"","zoneGeographique":"","secteurs":[]},
  "complementaires":{"liquidite":"","fiscalite":"","garantie":"Non","profilInvestisseur":""},
  "extraction":{"success":true,"confidence":0.9,"errors":[],"warnings":[]}
}`
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });
    
    const extractedData: DICData = JSON.parse(completion.choices[0].message.content!);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Terminé: ${duration}ms`);
    
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

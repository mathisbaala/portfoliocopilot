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
      return NextResponse.json(
        { error: "fileUrl et fileName requis" },
        { status: 400 }
      );
    }
    
    console.log(`\n📄 EXTRACTION: ${fileName}`);
    
    // 1. Télécharger le PDF
    console.log(`📥 Téléchargement...`);
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Erreur téléchargement: ${pdfResponse.status}`);
    }
    
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    
    // 2. Validation PDF
    if (!pdfBuffer.slice(0, 4).toString().startsWith('%PDF')) {
      throw new Error("Fichier invalide (pas un PDF)");
    }
    
    const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`✅ PDF téléchargé: ${sizeMB}MB`);
    
    // 3. Upload du PDF vers OpenAI Files API
    console.log(`📤 Upload vers OpenAI...`);
    const file = await openai.files.create({
      file: new File([pdfBuffer], fileName, { type: 'application/pdf' }),
      purpose: 'assistants',
    });
    
    console.log(`✅ Fichier OpenAI: ${file.id}`);
    
    // 4. Appel GPT-4o
    console.log(`🤖 Analyse GPT-4o avec PDF...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en analyse de documents financiers DIC/KID/PRIIPS. Extrait TOUTES les données en JSON valide uniquement."
        },
        {
          role: "user",
          content: `Analyse ce PDF financier (ID: ${file.id}) et retourne un JSON avec: metadata, general (emetteur, nomProduit, isin, categorie, devise), risque (niveau 1-7, description), frais (entree, sortie, gestionAnnuels, total), horizon (recommande, annees), scenarios (defavorable, intermediaire, favorable), strategie (objectif, politique), complementaires, extraction (success, confidence).`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });
    
    const rawResponse = completion.choices[0].message.content;
    if (!rawResponse) {
      throw new Error("Pas de réponse de GPT-4o");
    }
    
    // 5. Parser
    const extractedData: DICData = JSON.parse(rawResponse);
    
    // 6. Quality check
    const criticalFields = [
      extractedData.general?.emetteur,
      extractedData.general?.nomProduit,
      extractedData.general?.isin,
      extractedData.risque?.niveau > 0,
      extractedData.frais?.gestionAnnuels > 0,
    ].filter(Boolean).length;
    
    const qualityScore = criticalFields / 5;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Terminé: ${duration}ms - ${criticalFields}/5 champs (${(qualityScore * 100).toFixed(0)}%)`);
    
    // 7. Nettoyer
    try {
      await openai.files.delete(file.id);
    } catch (err) {
      // Ignorer erreur suppression
    }
    
    // 8. Retour
    return NextResponse.json({
      ...extractedData,
      metadata: {
        documentName: fileName,
        uploadDate: new Date().toISOString(),
        extractionDate: new Date().toISOString(),
        documentType: "SICAV",
        processingTime: duration,
      },
      extraction: {
        success: true,
        confidence: qualityScore,
        errors: [],
        warnings: [],
      },
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ ERREUR (${duration}ms):`, error.message);
    
    return NextResponse.json(
      { 
        error: "Erreur extraction",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

const SYSTEM_PROMPT = `Tu es un expert financier certifié CFA spécialisé dans l'analyse de documents réglementaires PRIIPS/KID/DIC.

MISSION: Extraire avec PRÉCISION ABSOLUE toutes les données du document financier.

RÈGLES CRITIQUES:

1. CHIFFRES - Extraire les valeurs EXACTES:
   - Pourcentages: format décimal (0.25% = 0.25, 15% = 15.00)
   - Montants: nombres entiers ou décimaux
   - Ne JAMAIS arrondir ou modifier

2. SCÉNARIOS DE PERFORMANCE (très important):
   - Lire le tableau ligne par ligne
   - Pour chaque scénario extraire: montant à 1 an, rendement 1 an, montant horizon, rendement moyen annuel
   - Les rendements négatifs gardent le signe moins

3. FRAIS:
   - Frais entrée/sortie
   - Frais de gestion annuels
   - Coûts de transaction  
   - Impact total en EUR et %

4. RISQUE:
   - SRI (1-7) avec description exacte
   - Tous les risques mentionnés

STRUCTURE JSON À RETOURNER:

{
  "produit": {
    "nom": "nom commercial",
    "isin": "code ISIN",
    "ticker": "ticker si disponible",
    "devise": "EUR",
    "typeInstrument": "ETF/OPCVM/FCP",
    "indiceBenchmark": "indice de référence",
    "zoneGeographique": "zone",
    "classification": "Actions/Obligations/etc",
    "eligiblePEA": true/false,
    "horizonRecommande": "X ans",
    "dateDocument": "YYYY-MM-DD"
  },
  
  "emetteur": {
    "nom": "société de gestion",
    "adresse": "adresse complète",
    "siteWeb": "URL",
    "telephone": "numéro",
    "agrement": "agrément AMF"
  },
  
  "risque": {
    "niveau": 1-7,
    "description": "description du niveau",
    "risquesPrincipaux": ["liste des risques"],
    "garantieCapital": false,
    "perteMaxPossible": "peut perdre la totalité"
  },
  
  "frais": {
    "entree": { "taux": 0.00, "montant10000": "X EUR" },
    "sortie": { "taux": 0.00, "montant10000": "X EUR" },
    "gestionAnnuelle": { "taux": 0.00 },
    "transaction": { "taux": 0.00 },
    "performance": { "taux": 0.00 },
    "totalAnnuel": { "taux": 0.00, "impact10000_1an": "X EUR", "impact10000_5ans": "X EUR" }
  },
  
  "scenarios": {
    "investissement": 10000,
    "horizon": "5 ans",
    "stress": {
      "montant1an": 0,
      "rendement1an": -00.00,
      "montantHorizon": 0,
      "rendementMoyenAnnuel": -00.00
    },
    "defavorable": {
      "montant1an": 0,
      "rendement1an": -00.00,
      "montantHorizon": 0,
      "rendementMoyenAnnuel": -00.00
    },
    "intermediaire": {
      "montant1an": 0,
      "rendement1an": 0.00,
      "montantHorizon": 0,
      "rendementMoyenAnnuel": 0.00
    },
    "favorable": {
      "montant1an": 0,
      "rendement1an": 0.00,
      "montantHorizon": 0,
      "rendementMoyenAnnuel": 0.00
    }
  },
  
  "strategie": {
    "objectif": "objectif d'investissement",
    "methode": "réplication physique/synthétique",
    "distribution": "capitalisation/distribution"
  },
  
  "contact": {
    "information": "où obtenir plus d'infos",
    "reclamation": "email/adresse réclamations"
  }
}

RÈGLES FINALES:
- Si une donnée n'existe pas: null
- Ne JAMAIS inventer
- Retourner UNIQUEMENT le JSON valide`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const openai = getOpenAIClient();
  
  try {
    const { fileUrl, fileName } = await request.json();
    
    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: "fileUrl et fileName requis" },
        { status: 400 }
      );
    }
    
    console.log("\n📄 EXTRACTION:", fileName);
    
    // 1. Télécharger le PDF
    console.log("📥 Téléchargement...");
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error("Erreur téléchargement: " + pdfResponse.status);
    }
    
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    
    if (!pdfBuffer.slice(0, 4).toString().startsWith("%PDF")) {
      throw new Error("Fichier invalide (pas un PDF)");
    }
    
    console.log("✅ PDF:", (pdfBuffer.length / 1024 / 1024).toFixed(2) + "MB");
    
    // 2. Upload vers OpenAI
    console.log("📤 Upload OpenAI...");
    const file = await openai.files.create({
      file: new File([pdfBuffer], fileName, { type: "application/pdf" }),
      purpose: "assistants",
    });
    
    // 3. Créer Assistant
    console.log("🤖 Création Assistant...");
    const assistant = await openai.beta.assistants.create({
      name: "Expert PRIIPS Extraction",
      model: "gpt-4o",
      instructions: SYSTEM_PROMPT,
      tools: [{ type: "file_search" }],
    });
    
    // 4. Créer Thread
    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: "Analyse ce document PRIIPS/KID et extrais TOUTES les données.\n\nPOINTS CRITIQUES À EXTRAIRE:\n1. TABLEAU DES SCÉNARIOS - chaque ligne avec montants et rendements exacts\n2. TABLEAU DES FRAIS - tous les coûts avec montants précis\n3. INDICATEUR DE RISQUE - niveau 1-7 avec description\n4. INFORMATIONS PRODUIT - ISIN, indice, horizon\n\nATTENTION aux scénarios:\n- Scénario de tensions (stress): extraire les 4 valeurs\n- Scénario défavorable: extraire les 4 valeurs\n- Scénario intermédiaire: extraire les 4 valeurs\n- Scénario favorable: extraire les 4 valeurs\n\nRetourne uniquement le JSON, sans texte.",
        attachments: [{
          file_id: file.id,
          tools: [{ type: "file_search" }],
        }],
      }],
    });
    
    // 5. Exécuter
    console.log("⚡ Analyse...");
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
      max_prompt_tokens: 25000,
      max_completion_tokens: 6000,
    });
    
    if (run.status !== "completed") {
      throw new Error("Échec: " + run.status);
    }
    
    // 6. Récupérer réponse
    const messages = await openai.beta.threads.messages.list(thread.id);
    const msg = messages.data.find(m => m.role === "assistant");
    
    if (!msg?.content[0] || msg.content[0].type !== "text") {
      throw new Error("Pas de réponse");
    }
    
    // 7. Nettoyer et parser
    let raw = msg.content[0].text.value;
    raw = raw.replace(/【[^】]*】/g, ""); // Supprimer citations OpenAI
    
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Pas de JSON");
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    // 8. Score qualité
    const checks = {
      nom: data.produit?.nom ? 1 : 0,
      isin: data.produit?.isin ? 1 : 0,
      indice: data.produit?.indiceBenchmark ? 1 : 0,
      emetteur: data.emetteur?.nom ? 1 : 0,
      risque: data.risque?.niveau > 0 ? 1 : 0,
      fraisGestion: data.frais?.gestionAnnuelle?.taux >= 0 ? 1 : 0,
      fraisTotal: data.frais?.totalAnnuel?.taux >= 0 ? 1 : 0,
      scenarioStress: data.scenarios?.stress?.montantHorizon > 0 ? 1 : 0,
      scenarioInterm: data.scenarios?.intermediaire?.montantHorizon > 0 ? 1 : 0,
      strategie: data.strategie?.objectif ? 1 : 0,
    };
    
    const score = Object.values(checks).reduce((a, b) => a + b, 0);
    const quality = score / Object.keys(checks).length;
    
    const duration = Date.now() - startTime;
    console.log("✅ Terminé:", duration + "ms - Qualité:", (quality * 100).toFixed(0) + "%");
    
    // 9. Cleanup
    try {
      await Promise.all([
        openai.beta.assistants.delete(assistant.id),
        openai.beta.threads.delete(thread.id),
        openai.files.delete(file.id),
      ]);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // 10. Retourner
    return NextResponse.json({
      ...data,
      _meta: {
        fichier: fileName,
        qualite: quality,
        dureeMs: duration,
        dateExtraction: new Date().toISOString(),
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("❌ ERREUR:", errorMessage);
    return NextResponse.json(
      { error: "Erreur extraction", details: errorMessage },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { FinancialDocument } from "@/types/financial-document";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

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
    
    // 4. Créer un Assistant temporaire
    console.log(`🤖 Création Assistant GPT-4o...`);
    const assistant = await openai.beta.assistants.create({
      name: "Analyseur Expert PDF Financier",
      model: "gpt-4o",
      instructions: `Tu es un expert financier certifié en analyse de documents DIC/KID/PRIIPS. 

MISSION: Extraire TOUTES les informations du document de manière EXHAUSTIVE et PRÉCISE.

STRUCTURE JSON COMPLÈTE À RETOURNER:

{
  "metadata": {
    "documentName": "nom du fichier",
    "dateDocument": "date du document (YYYY-MM-DD)",
    "dateProduction": "date de production",
    "version": "version du document",
    "langue": "langue (FR/EN/etc)",
    "regulateur": "AMF/ESMA/etc",
    "typeDocument": "DIC/KID/PRIIPS"
  },
  
  "identite": {
    "emetteur": {
      "nom": "nom complet de la société de gestion",
      "groupe": "groupe d'appartenance",
      "siteweb": "URL du site web",
      "telephone": "numéro",
      "email": "email contact",
      "adresse": "adresse complète",
      "agrement": "numéro d'agrément AMF/ESMA"
    },
    "produit": {
      "nom": "nom commercial complet",
      "nomLegal": "nom légal/officiel",
      "isin": "code ISIN",
      "categorieAMF": "catégorie AMF",
      "categorieSRRI": "catégorie SRRI/SRI",
      "formJuridique": "SICAV/FCP/ETF/etc",
      "dateCreation": "date de création",
      "dateLancement": "date de lancement",
      "dureeVie": "durée de vie du produit",
      "devise": "devise de référence",
      "devisesPossibles": ["liste des devises possibles"],
      "eligiblePEA": true/false,
      "eligibleAV": true/false
    }
  },
  
  "classification": {
    "categoriesPrincipales": ["actions", "obligations", "monétaire", "etc"],
    "zoneGeographique": ["Europe", "Monde", "etc"],
    "secteurs": ["technologie", "santé", "etc"],
    "styleGestion": "gestion active/passive/quantitative",
    "indiceBenchmark": "nom de l'indice de référence",
    "trackingError": "tracking error si applicable"
  },
  
  "risque": {
    "indicateurSynthetique": {
      "niveau": 1-7,
      "description": "description complète du niveau",
      "methodologie": "explication de la méthodologie"
    },
    "risquesPrincipaux": [
      {
        "type": "risque de marché/crédit/liquidité/etc",
        "description": "description détaillée",
        "niveau": "faible/modéré/élevé",
        "mesuresAttenuation": "mesures prises"
      }
    ],
    "risquesSecondaires": ["liste des risques secondaires"],
    "risquesNonRefletes": "risques non reflétés dans l'indicateur",
    "volatilite": {
      "annuelle": "X%",
      "historique": "données historiques si disponibles"
    },
    "VaR": "Value at Risk si disponible",
    "drawdownMax": "perte maximale historique",
    "stressScenarios": "résultats des tests de stress"
  },
  
  "frais": {
    "entree": {
      "taux": X.XX,
      "description": "description",
      "montantExemple": "sur 10000€ = X€"
    },
    "sortie": {
      "taux": X.XX,
      "description": "description",
      "conditions": "conditions de sortie"
    },
    "gestion": {
      "tauxAnnuel": X.XX,
      "description": "frais de gestion annuels",
      "inclus": ["ce qui est inclus"]
    },
    "performance": {
      "taux": X.XX,
      "conditions": "conditions de prélèvement",
      "benchmark": "référence pour le calcul"
    },
    "courantsAnnuels": {
      "taux": X.XX,
      "description": "tous frais courants",
      "detail": "détail des composantes"
    },
    "transaction": {
      "taux": X.XX,
      "description": "coûts de transaction"
    },
    "total": {
      "annuel": X.XX,
      "impactSur10000": "impact sur 10000€",
      "impactSurDuree": "impact sur durée recommandée"
    },
    "fraisAnnexes": [
      {
        "type": "type de frais",
        "montant": X.XX,
        "conditions": "conditions"
      }
    ]
  },
  
  "performance": {
    "historique": {
      "1an": X.XX,
      "3ans": X.XX,
      "5ans": X.XX,
      "10ans": X.XX,
      "depuisCreation": X.XX
    },
    "anneeParAnnee": [
      { "annee": 2024, "performance": X.XX },
      { "annee": 2023, "performance": X.XX }
    ],
    "vsComparaison": {
      "indiceBenchmark": "nom",
      "performanceBenchmark": X.XX,
      "difference": X.XX
    },
    "meilleureAnnee": { "annee": XXXX, "performance": X.XX },
    "pireAnnee": { "annee": XXXX, "performance": X.XX }
  },
  
  "scenarios": {
    "contexte": "période d'investissement et montant",
    "stress": {
      "description": "scénario de stress",
      "montantFinal": "montant après 1 an",
      "rendementMoyen": X.XX,
      "probabilite": "probabilité d'occurrence"
    },
    "defavorable": {
      "description": "scénario défavorable",
      "montantFinal": "montant après X ans",
      "rendementMoyen": X.XX,
      "rendementAnnuel": X.XX
    },
    "intermediaire": {
      "description": "scénario intermédiaire",
      "montantFinal": "montant après X ans",
      "rendementMoyen": X.XX,
      "rendementAnnuel": X.XX
    },
    "favorable": {
      "description": "scénario favorable",
      "montantFinal": "montant après X ans",
      "rendementMoyen": X.XX,
      "rendementAnnuel": X.XX
    },
    "notesExplicatives": "notes sur les scénarios"
  },
  
  "strategie": {
    "objectifGestion": "objectif principal détaillé",
    "objectifsSecondaires": ["liste objectifs secondaires"],
    "politiqueInvestissement": "description complète de la politique",
    "universInvestissement": "univers d'investissement",
    "processusSelection": "processus de sélection des titres",
    "allocation": {
      "actions": { "min": X, "max": Y, "cible": Z },
      "obligations": { "min": X, "max": Y, "cible": Z },
      "monetaire": { "min": X, "max": Y, "cible": Z },
      "autres": { "min": X, "max": Y, "cible": Z }
    },
    "exposition": {
      "directe": "exposition directe",
      "derivees": "utilisation de dérivés",
      "effet_levier": "effet de levier max"
    },
    "esg": {
      "approche": "approche ESG",
      "exclusions": ["secteurs exclus"],
      "integration": "niveau d'intégration ESG",
      "label": "label ISR/Greenfin/etc"
    },
    "rebalancement": "fréquence et méthode de rebalancement"
  },
  
  "operationnel": {
    "souscription": {
      "montantMinimum": "montant minimum",
      "montantMinimumSubsequent": "souscriptions suivantes",
      "periodicite": "quotidien/hebdo/etc",
      "heureClotureOrdres": "heure limite",
      "delaiReglement": "J+X",
      "moyensPaiement": ["virement", "prélèvement", "etc"]
    },
    "rachat": {
      "montantMinimum": "montant minimum de rachat",
      "periodicite": "quotidien/hebdo/etc",
      "heureClotureOrdres": "heure limite",
      "delaiReglement": "J+X",
      "partiel": true/false,
      "total": true/false
    },
    "valeurLiquidative": {
      "frequenceCalcul": "quotidien/hebdo",
      "publicationOu": "où trouver la VL",
      "devise": "devise de calcul"
    },
    "fiscalite": {
      "regime": "régime fiscal applicable",
      "prelevement": "prélèvement à la source",
      "plusValues": "taxation des plus-values",
      "dividendes": "taxation des dividendes",
      "ifi": "assujettissement IFI"
    }
  },
  
  "acteurs": {
    "societeGestion": {
      "nom": "nom",
      "role": "rôle",
      "agrement": "agrément"
    },
    "depositaire": {
      "nom": "nom",
      "role": "rôle"
    },
    "administrateurs": ["liste"],
    "commissaireComptes": "nom du CAC",
    "distributeurs": ["liste des distributeurs"],
    "conseillers": ["conseillers en investissement"]
  },
  
  "informations": {
    "prospectus": {
      "url": "URL du prospectus",
      "dateMAJ": "date mise à jour"
    },
    "rapportsAnnuels": {
      "url": "URL des rapports",
      "frequence": "fréquence de publication"
    },
    "informationsCles": {
      "url": "URL du DIC",
      "langues": ["FR", "EN"]
    },
    "reclamation": {
      "procedure": "procédure de réclamation",
      "adresse": "adresse",
      "email": "email",
      "delaiReponse": "délai de réponse"
    },
    "mediateur": {
      "nom": "nom du médiateur",
      "coordonnees": "coordonnées"
    }
  },
  
  "compliance": {
    "mifid": {
      "categorisation": "professionnel/particulier",
      "adequation": "évaluation d'adéquation requise",
      "appropriation": "évaluation d'appropriation requise"
    },
    "protectionCapital": {
      "garantie": true/false,
      "niveau": "% de garantie si applicable",
      "conditions": "conditions de garantie"
    },
    "indemnisation": {
      "systemeFGDR": true/false,
      "montantMax": "montant max indemnisation"
    }
  },
  
  "extraction": {
    "success": true,
    "confidence": 0-1,
    "champsExtraits": XX,
    "champsManquants": ["liste si applicable"],
    "errors": [],
    "warnings": [],
    "qualityScore": X.XX
  }
}

RÈGLES STRICTES:
1. Extraire TOUTES les données présentes dans le document
2. Si une donnée est absente, mettre null ou []
3. AUCUNE invention - seulement les données réelles du PDF
4. Chiffres avec 2 décimales
5. Dates au format ISO (YYYY-MM-DD)
6. Pourcentages en décimal (5% = 5.00, pas 0.05)
7. Être EXHAUSTIF - ne rien omettre
8. Retourner UNIQUEMENT le JSON, sans texte avant/après`,
      tools: [{ type: "file_search" }],
    });
    
    // 5. Créer un Thread avec le fichier
    console.log(`💬 Création Thread...`);
    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: `Analyse en profondeur ce document financier DIC/KID/PRIIPS.

OBJECTIF: Produire un JSON EXHAUSTIF avec TOUTES les informations du document.

SECTIONS À EXTRAIRE (si présentes):
• Métadonnées complètes du document
• Identité émetteur et produit (tous les détails)
• Classification et catégorisation
• Risques (tous types, avec descriptions détaillées)
• Frais (tous types, avec exemples de calcul)
• Performance historique complète
• Scénarios de rendement (tous)
• Stratégie d'investissement détaillée
• Informations opérationnelles (souscription/rachat)
• Acteurs (société de gestion, dépositaire, etc)
• Documents et contacts
• Conformité réglementaire

IMPORTANT:
- Extraire TOUS les chiffres, pourcentages, montants
- Extraire TOUTES les dates
- Extraire TOUTES les descriptions et explications
- Si une info est absente: mettre null
- Pourcentages: format décimal (5% = 5.00)
- Être exhaustif et précis

Retourne UNIQUEMENT le JSON complet, sans texte d'introduction.`,
        attachments: [{
          file_id: file.id,
          tools: [{ type: "file_search" }],
        }],
      }],
    });
    
    // 6. Lancer l'analyse
    console.log(`⚡ Analyse GPT-4o...`);
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
      max_prompt_tokens: 20000,
      max_completion_tokens: 16000,
    });
    
    if (run.status !== 'completed') {
      throw new Error(`Run échoué: ${run.status}`);
    }
    
    // 7. Récupérer la réponse
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage?.content[0] || assistantMessage.content[0].type !== 'text') {
      throw new Error("Pas de réponse de GPT-5");
    }
    
    let rawResponse = assistantMessage.content[0].text.value;
    
    // 8. Extraire le JSON de la réponse
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Pas de JSON dans la réponse GPT-4o");
    }
    rawResponse = jsonMatch[0];
    
    // 9. Parser
    const extractedData: FinancialDocument = JSON.parse(rawResponse);
    
    // 10. Quality check avancé
    const criticalChecks = {
      metadata: extractedData.metadata?.documentName ? 1 : 0,
      identite: extractedData.identite?.produit?.nom ? 1 : 0,
      isin: extractedData.identite?.produit?.isin ? 1 : 0,
      emetteur: extractedData.identite?.emetteur?.nom ? 1 : 0,
      risque: extractedData.risque?.indicateurSynthetique?.niveau > 0 ? 1 : 0,
      fraisGestion: extractedData.frais?.gestion?.tauxAnnuel >= 0 ? 1 : 0,
      fraisTotal: extractedData.frais?.total?.annuel >= 0 ? 1 : 0,
      strategie: extractedData.strategie?.objectifGestion ? 1 : 0,
      scenarios: extractedData.scenarios?.intermediaire ? 1 : 0,
      operationnel: extractedData.operationnel?.souscription ? 1 : 0,
    };
    
    const criticalFields = Object.values(criticalChecks).reduce((a, b) => a + b, 0);
    const totalChecks = Object.keys(criticalChecks).length;
    const qualityScore = criticalFields / totalChecks;
    const duration = Date.now() - startTime;
    
    // Compter les champs extraits
    const countFields = (obj: any): number => {
      if (!obj) return 0;
      return Object.values(obj).reduce<number>((count, val) => {
        if (val === null || val === undefined || val === '') return count;
        if (typeof val === 'object') return count + countFields(val);
        return count + 1;
      }, 0);
    };
    
    const totalFieldsExtracted = countFields(extractedData);
    
    console.log(`✅ Terminé: ${duration}ms`);
    console.log(`   📊 Qualité: ${criticalFields}/${totalChecks} sections (${(qualityScore * 100).toFixed(0)}%)`);
    console.log(`   📈 Champs extraits: ${totalFieldsExtracted}`);
    // 11. Nettoyer
    console.log(`🗑️ Nettoyage...`);
    try {
      await openai.beta.assistants.delete(assistant.id);
      await openai.beta.threads.delete(thread.id);
      await openai.files.delete(file.id);
      console.log(`✅ Ressources supprimées`);
    } catch (err) {
      console.warn(`⚠️ Erreur nettoyage:`, err);
    }
    
    // 12. Enrichir et retourner
    const enrichedData: FinancialDocument = {
      ...extractedData,
      metadata: {
        ...extractedData.metadata,
        documentName: fileName,
      },
      extraction: {
        success: true,
        confidence: qualityScore,
        champsExtraits: totalFieldsExtracted,
        champsManquants: Object.entries(criticalChecks)
          .filter(([_, val]) => val === 0)
          .map(([key]) => key),
        errors: [],
        warnings: [],
        qualityScore,
      },
    };
    
    return NextResponse.json(enrichedData);
    
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

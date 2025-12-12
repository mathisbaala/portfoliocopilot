import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { JohnsonData } from "@/types/johnson";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const JOHNSON_SYSTEM_PROMPT = `Tu es un agent d'analyse de documents financiers spécialisé dans les DIC/KID, prospectus de fonds, ETF et produits structurés.

OBJECTIF GÉNÉRAL
Ton rôle est de lire le texte extrait d'un PDF financier et de le traduire en un objet JSON structuré (appelé « Johnson » dans l'application) qui :
1. Contient les informations clés factuelles du produit.
2. Démystifie le produit pour un investisseur non expert.
3. Reste strictement fidèle au document, sans inventer d'information.

Tu NE dois PAS donner de conseil personnalisé d'investissement. Tu expliques, tu synthétises, tu structures.

LANGUE ET STYLE
- La sortie doit être en FRANÇAIS, même si le document source est en anglais ou dans une autre langue (les noms propres, indices, sous-jacents peuvent rester dans la langue d'origine).
- Style simple, clair, pédagogique, mais exact financièrement.
- Pas de jargon inutile. Quand tu utilises un terme technique, essaie de le reformuler en une phrase simple.

RÈGLES IMPORTANTES
1. NE JAMAIS INVENTER D'INFORMATION NUMÉRIQUE.
   - Si un pourcentage, une barrière ou une échéance n'est pas lisible dans le texte fourni, laisse le champ à null ou indique clairement "non précisé dans le document".
2. SE BASER UNIQUEMENT SUR LE TEXTE FOURNI.
   - Ne pas utiliser de connaissances externes (internet, mémoire, etc.) pour compléter ou corriger le document.
3. RESTER FACTUEL ET NEUTRE.
   - Ne pas dire qu'un produit est "bon", "mauvais", "à acheter" ou "à éviter".
4. RESPECTER STRICTEMENT LA STRUCTURE JSON.
   - Retourne toujours tous les champs, même vides ou null.
   - Le JSON doit être syntaxiquement valide (guillemets, virgules, crochets…).
5. ADAPTER LE NIVEAU DE LANGUE.
   - Vise un niveau B2 pour un épargnant curieux mais non spécialiste.
   - Raccourcis les phrases, évite les formulations trop longues ou juridiques.

FORMAT DE SORTIE
Tu dois répondre STRICTEMENT avec un seul objet JSON valide (sans texte ni commentaire autour).
Pas de markdown, pas de prose en dehors du JSON.`;

const JOHNSON_USER_PROMPT_TEMPLATE = (extractedText: string) => `Analyse ce document financier et extrait TOUTES les données disponibles selon le format Johnson.

TEXTE DU DOCUMENT (${extractedText.length} caractères):
${extractedText}

INSTRUCTIONS D'EXTRACTION PAR SECTION:

**META**
- document_type: Cherche "DIC", "DICI", "KID", "KIID", "Prospectus" dans le document
- source_language: Détecte la langue (fr, en, de, etc.)
- product_category: Identifie Fonds/ETF/Produit structuré/OPCVM selon mentions
- data_quality: Évalue si le texte est complet, lisible (bonne/moyenne/faible)
- data_quality_comment: Note les problèmes éventuels (texte coupé, illisible, etc.)

**IDENTIFICATION**
- product_name: Nom commercial en gros titre ou section "Dénomination"
- isin: Code format XX0000000000 (ex: FR0010314401)
- ticker: Symbole boursier si ETF ou produit coté
- issuer: Société de gestion ou émetteur
- distributor: Distributeur si mentionné
- currency: EUR, USD, CHF, etc.
- domicile_country: Pays de domiciliation
- regulation: UCITS, AIFM, PRIIPs, etc.

**INVESTMENT_OBJECTIVE**
- short_description: Résumé en 2-3 phrases claires de l'objectif
- strategy_summary: Description détaillée de la stratégie d'investissement
- recommended_holding_period: Durée recommandée (cherche "horizon", "durée recommandée")
- capital_guarantee: Cherche "garantie", "capital garanti", "protection"

**UNDERLYINGS**
- underlying_type: Type d'actifs sous-jacents
- underlying_description: Description textuelle
- underlying_list: Liste des sous-jacents avec noms, codes, poids

**PAYOFF_AND_STRUCTURE**
- payoff_summary: Description du mécanisme de paiement
- payoff_type: Autocall, Phoenix, Digital, Bonus, Fonds classique, etc.
- capital_protection_level: Niveau de protection
- barriers_and_thresholds: Barrières avec niveaux et observations
- coupon_mechanism: Mécanisme des coupons si applicable
- maturity_and_calls: Maturité et mécanismes d'autocall

**RISK_PROFILE**
- summary_risk_indicator: SRI échelle 1-7 (cherche "indicateur de risque", "SRI", "SRRI")
- main_risks: Liste exhaustive des risques mentionnés
- risk_warnings_for_retail_investor: Synthèse pédagogique des risques

**COSTS_AND_FEES**
- entry_fees: Frais d'entrée/souscription
- exit_fees: Frais de sortie/rachat
- ongoing_charges: Frais courants/TER (cherche "frais annuels", "TER", "ongoing charges")
- performance_fees: Commission de performance
- other_costs_details: Autres frais mentionnés

**PERFORMANCE_SCENARIOS**
- has_priips_scenarios: Présence de scénarios PRIIPs
- scenarios_description: Description des scénarios
- scenarios_table_raw: Tableau brut des scénarios si présent

**LIQUIDITY_AND_REDEMPTION**
- liquidity_profile: Fréquence de liquidité (quotidienne, hebdomadaire, etc.)
- redemption_conditions: Conditions de rachat
- listing: Marché de cotation si applicable

**TARGET_INVESTOR**
- target_profile_description: Type d'investisseur visé
- minimum_investment: Montant minimum
- suitability_notes: Pour qui ce produit convient ou non

**TAX_AND_LEGAL**
- tax_treatment_summary: Traitement fiscal mentionné
- legal_notices: Mentions légales importantes

**PEDAGOGICAL_EXPLANATION**
- one_sentence_pitch: UNE phrase simple pour expliquer le produit
- how_it_can_gain_money: Comment gagner de l'argent (simple et clair)
- how_it_can_lose_money: Comment perdre de l'argent (soyez explicite sur les risques)
- complexity_level: faible/moyenne/élevée
- complexity_comment: Justification du niveau

**CONSISTENCY_CHECKS**
- missing_critical_fields: Liste les infos importantes manquantes
- document_inconsistencies: Note toute incohérence détectée

RÉPONDS UNIQUEMENT AVEC LE JSON COMPLET (tous les champs requis).`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const openai = getOpenAIClient();
  
  try {
    const body = await req.json();
    const { fileUrl, fileName } = body;

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: "fileUrl et fileName requis" },
        { status: 400 }
      );
    }

    console.log(`\n🔍 EXTRACTION JOHNSON: ${fileName}`);
    console.log(`📄 Téléchargement du PDF...`);

    // 1. Télécharger le PDF
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Erreur téléchargement: ${pdfResponse.status}`);
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    console.log(`✅ PDF téléchargé: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

    // 2. Validation PDF
    if (!pdfBuffer.toString("latin1", 0, 4).startsWith("%PDF")) {
      throw new Error("Fichier invalide (pas un PDF)");
    }

    // 3. Extraction texte (fallback regex - compatible Chromium/Skia)
    console.log(`🔍 Extraction texte du PDF...`);
    
    const textMatches = pdfBuffer
      .toString("latin1")
      .match(/\(([^)]+)\)/g);

    if (!textMatches || textMatches.length === 0) {
      throw new Error("Aucun texte trouvé dans le PDF");
    }

    const extractedText = textMatches
      .map((match) => {
        const text = match.slice(1, -1);
        return text
          .replace(/\\n/g, " ")
          .replace(/\\r/g, " ")
          .replace(/\\t/g, " ")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\")
          .trim();
      })
      .filter((line) => line.length > 2)
      .join(" ");

    console.log(`✅ Extraction: ${extractedText.length.toLocaleString()} caractères`);

    if (extractedText.length < 100) {
      throw new Error("Texte extrait trop court");
    }

    // 4. Optimiser le texte (prendre max 40000 chars pour Johnson - plus détaillé)
    const optimizedText = extractedText.slice(0, 40000);
    console.log(`🤖 Analyse GPT-4o (${optimizedText.length.toLocaleString()} chars)...`);

    // 5. Structuration Johnson via GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: JOHNSON_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JOHNSON_USER_PROMPT_TEMPLATE(optimizedText),
        },
      ],
      temperature: 0.2, // Légèrement plus créatif pour les explications pédagogiques
      max_tokens: 8000, // Plus de tokens pour Johnson (structure plus riche)
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0].message.content!;
    const johnsonData = JSON.parse(rawResponse);

    // 6. Vérification qualité
    const criticalFields = [
      johnsonData.identification?.product_name,
      johnsonData.identification?.issuer,
      johnsonData.identification?.isin,
      johnsonData.investment_objective?.short_description,
      johnsonData.risk_profile?.summary_risk_indicator?.sri_scale,
      johnsonData.costs_and_fees?.ongoing_charges,
      johnsonData.pedagogical_explanation?.one_sentence_pitch,
      johnsonData.pedagogical_explanation?.how_it_can_gain_money,
      johnsonData.pedagogical_explanation?.how_it_can_lose_money,
    ];

    const populatedFields = criticalFields.filter(Boolean).length;
    const qualityScore = populatedFields / criticalFields.length;

    const duration = Date.now() - startTime;
    console.log(`✅ Johnson terminé: ${duration}ms - ${populatedFields}/${criticalFields.length} champs critiques remplis (${(qualityScore * 100).toFixed(0)}%)`);

    // 7. Construction réponse finale
    const response: JohnsonData = {
      ...johnsonData,
      extraction: {
        success: true,
        confidence: qualityScore,
        processing_time_ms: duration,
        warnings: qualityScore < 0.5 
          ? ["⚠️ Extraction partielle - certaines données critiques manquent"]
          : qualityScore < 0.75
          ? ["ℹ️ Extraction correcte - quelques données optionnelles manquent"]
          : [],
      },
      metadata: {
        documentName: fileName,
        uploadDate: new Date().toISOString(),
        extractionDate: new Date().toISOString(),
        processingTime: duration,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`❌ Erreur Johnson (${duration}ms):`, errorMessage);

    return NextResponse.json(
      {
        extraction: {
          success: false,
          confidence: 0,
          processing_time_ms: duration,
          errors: [errorMessage],
        },
        metadata: {
          documentName: "",
          uploadDate: new Date().toISOString(),
          extractionDate: new Date().toISOString(),
          processingTime: duration,
        },
      } as Partial<JohnsonData>,
      { status: 500 }
    );
  }
}

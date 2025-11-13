/**
 * Schéma JSON "Johnson" pour l'analyse complète de documents financiers
 * DIC/KID, prospectus de fonds, ETF et produits structurés
 */

export interface JohnsonData {
  meta: {
    document_type: "DIC" | "KID" | "Prospectus" | "Autre" | "Inconnu";
    source_language: string;
    product_category: "Fonds" | "ETF" | "Produit_structuré" | "OPCVM" | "Autre" | "Inconnu";
    data_quality: "bonne" | "moyenne" | "faible";
    data_quality_comment: string;
  };

  identification: {
    product_name: string;
    isin: string | null;
    ticker: string | null;
    issuer: string;
    distributor: string | null;
    currency: string;
    domicile_country: string | null;
    regulation: string | null;
  };

  investment_objective: {
    short_description: string;
    strategy_summary: string;
    recommended_holding_period: string | null;
    capital_guarantee: {
      is_guaranteed: boolean;
      guarantee_description: string | null;
    };
  };

  underlyings: {
    underlying_type: "Actions" | "Indices" | "Taux" | "Crédit" | "Devises" | "Matières_premières" | "Fonds" | "Panier_mixte" | "Inconnu";
    underlying_description: string;
    underlying_list: Array<{
      name: string;
      identifier: string | null;
      weight_info: string | null;
    }>;
  };

  payoff_and_structure: {
    payoff_summary: string;
    payoff_type: "Autocall" | "Phoenix" | "Digital" | "Bonus" | "Fonds_classique" | "ETF_passif" | "Autre" | "Inconnu";
    capital_protection_level: string | null;
    barriers_and_thresholds: Array<{
      type: "barrière_protection_capital" | "barrière_coupon" | "niveau_autocall" | "autre";
      level: string;
      observation_type: "continue" | "observation_journalière" | "observation_mensuelle" | "observation_annuelle" | "à_maturité" | "inconnu";
    }>;
    coupon_mechanism: {
      has_coupons: boolean;
      coupon_description: string | null;
      indicative_coupon_rate: string | null;
    };
    maturity_and_calls: {
      legal_maturity: string | null;
      autocall_feature: {
        has_autocall: boolean;
        autocall_description: string | null;
      };
    };
  };

  risk_profile: {
    summary_risk_indicator: {
      sri_scale: string | null;
      sri_description: string | null;
    };
    main_risks: string[];
    risk_warnings_for_retail_investor: string;
  };

  costs_and_fees: {
    entry_fees: string | null;
    exit_fees: string | null;
    ongoing_charges: string | null;
    performance_fees: string | null;
    other_costs_details: string | null;
  };

  performance_scenarios: {
    has_priips_scenarios: boolean;
    scenarios_description: string | null;
    scenarios_table_raw: string | null;
  };

  liquidity_and_redemption: {
    liquidity_profile: string;
    redemption_conditions: string | null;
    listing: string | null;
  };

  target_investor: {
    target_profile_description: string;
    minimum_investment: string | null;
    suitability_notes: string;
  };

  tax_and_legal: {
    tax_treatment_summary: string | null;
    legal_notices: string | null;
  };

  pedagogical_explanation: {
    one_sentence_pitch: string;
    how_it_can_gain_money: string;
    how_it_can_lose_money: string;
    complexity_level: "faible" | "moyenne" | "élevée";
    complexity_comment: string;
  };

  consistency_checks: {
    missing_critical_fields: string[];
    document_inconsistencies: string | null;
  };

  // Métadonnées techniques (ajoutées par l'API)
  extraction: {
    success: boolean;
    confidence: number;
    processing_time_ms: number;
    errors?: string[];
    warnings?: string[];
  };

  metadata: {
    documentName: string;
    uploadDate: string;
    extractionDate: string;
    processingTime?: number;
  };
}

/**
 * Exemple de données Johnson
 */
export const EXAMPLE_JOHNSON: JohnsonData = {
  meta: {
    document_type: "KID",
    source_language: "fr",
    product_category: "Produit_structuré",
    data_quality: "bonne",
    data_quality_comment: "Document complet et lisible"
  },
  identification: {
    product_name: "Phoenix Autocall Euro Stoxx 50",
    isin: "FR0014002X45",
    ticker: null,
    issuer: "BNP Paribas",
    distributor: "BNP Paribas Retail Banking",
    currency: "EUR",
    domicile_country: "France",
    regulation: "PRIIPs"
  },
  investment_objective: {
    short_description: "Produit structuré avec potentiel de remboursement anticipé et coupons conditionnels, lié à l'indice Euro Stoxx 50.",
    strategy_summary: "Le produit offre des coupons annuels conditionnels de 8% si l'indice est au-dessus de 60% de son niveau initial. Possibilité de remboursement anticipé annuel si l'indice dépasse 100%.",
    recommended_holding_period: "8 ans",
    capital_guarantee: {
      is_guaranteed: false,
      guarantee_description: "Protection du capital à 60% du niveau initial à maturité uniquement. En dessous de cette barrière, l'investisseur subit la baisse de l'indice."
    }
  },
  underlyings: {
    underlying_type: "Indices",
    underlying_description: "Indice Euro Stoxx 50",
    underlying_list: [
      {
        name: "Euro Stoxx 50",
        identifier: "SX5E",
        weight_info: "100% du payoff lié à cet indice"
      }
    ]
  },
  payoff_and_structure: {
    payoff_summary: "Autocall annuel à 100% avec coupons Phoenix de 8% conditionnels à une barrière de 60%. Protection conditionnelle du capital à 60%.",
    payoff_type: "Phoenix",
    capital_protection_level: "Protection conditionnelle à 60% du niveau initial à maturité",
    barriers_and_thresholds: [
      {
        type: "barrière_coupon",
        level: "60% du niveau initial",
        observation_type: "observation_annuelle"
      },
      {
        type: "niveau_autocall",
        level: "100% du niveau initial",
        observation_type: "observation_annuelle"
      },
      {
        type: "barrière_protection_capital",
        level: "60% du niveau initial",
        observation_type: "à_maturité"
      }
    ],
    coupon_mechanism: {
      has_coupons: true,
      coupon_description: "Coupon annuel de 8% versé si l'indice est au-dessus de 60%. Effet mémoire: si le coupon n'est pas versé une année, il peut être rattrapé les années suivantes.",
      indicative_coupon_rate: "8% par an"
    },
    maturity_and_calls: {
      legal_maturity: "8 ans",
      autocall_feature: {
        has_autocall: true,
        autocall_description: "Remboursement anticipé possible chaque année à partir de l'année 1 si l'indice est égal ou supérieur à 100% de son niveau initial."
      }
    }
  },
  risk_profile: {
    summary_risk_indicator: {
      sri_scale: "6",
      sri_description: "Risque élevé - potentiel de pertes importantes"
    },
    main_risks: [
      "Risque de perte en capital",
      "Risque de marché (lié à l'Euro Stoxx 50)",
      "Risque de crédit de l'émetteur",
      "Risque de liquidité (pas de marché secondaire garanti)",
      "Risque de non-versement des coupons"
    ],
    risk_warnings_for_retail_investor: "Ce produit peut vous faire perdre tout ou partie de votre capital investi. Si l'indice Euro Stoxx 50 termine en dessous de 60% de son niveau initial, vous perdrez proportionnellement à la baisse de l'indice. Vous pourriez ne jamais recevoir de coupons si l'indice reste durablement sous 60%."
  },
  costs_and_fees: {
    entry_fees: "2%",
    exit_fees: "Aucun frais de sortie anticipée, mais valeur de marché non garantie",
    ongoing_charges: "0.5% par an",
    performance_fees: null,
    other_costs_details: "Les frais de structuration sont intégrés dans le prix d'émission."
  },
  performance_scenarios: {
    has_priips_scenarios: true,
    scenarios_description: "Scénarios PRIIPs fournis pour 4 ans et maturité (8 ans). Ils incluent défavorable, modéré, favorable.",
    scenarios_table_raw: "Pour 10 000 EUR investis:\n- Scénario défavorable: 5 200 EUR (-48%)\n- Scénario modéré: 11 200 EUR (+12%)\n- Scénario favorable: 16 400 EUR (+64%)"
  },
  liquidity_and_redemption: {
    liquidity_profile: "Liquidité limitée. Possibilité de revente sur marché secondaire non garantie.",
    redemption_conditions: "Remboursement à maturité ou lors d'un événement d'autocall. Sortie anticipée possible mais à valeur de marché.",
    listing: null
  },
  target_investor: {
    target_profile_description: "Investisseurs avertis avec horizon 8 ans, tolérance au risque élevée, capacité à perdre une partie significative du capital.",
    minimum_investment: "1 000 EUR",
    suitability_notes: "Ce produit ne convient PAS aux investisseurs cherchant une garantie totale du capital ou un revenu régulier garanti. Il est adapté aux investisseurs comprenant les mécanismes de barrières et d'autocall, et capables de supporter des pertes importantes."
  },
  tax_and_legal: {
    tax_treatment_summary: "Imposition selon le régime des plus-values mobilières. Possibilité d'intégration en assurance-vie selon contrats.",
    legal_notices: "Ce document ne constitue pas une recommandation d'investissement. Produit non garanti par un fonds de garantie des dépôts."
  },
  pedagogical_explanation: {
    one_sentence_pitch: "Un placement de 8 ans qui peut vous rapporter 8% par an si la bourse européenne reste stable, avec possibilité de remboursement anticipé si elle monte, mais risque de perte si elle baisse de plus de 40%.",
    how_it_can_gain_money: "Vous gagnez de l'argent si l'Euro Stoxx 50 reste au-dessus de 60% de son niveau de départ: vous touchez alors 8% par an. Si l'indice remonte au-dessus de 100%, le produit est remboursé par anticipation et vous récupérez votre capital plus les coupons accumulés.",
    how_it_can_lose_money: "Vous perdez de l'argent si l'Euro Stoxx 50 termine en dessous de 60% à maturité. Dans ce cas, vous perdez proportionnellement à la baisse: par exemple, si l'indice perd 50%, vous perdez 50% de votre capital. Vous ne recevez également aucun coupon tant que l'indice reste sous 60%.",
    complexity_level: "élevée",
    complexity_comment: "Produit complexe avec plusieurs mécanismes conditionnels (barrières, effet mémoire, autocall) qui nécessitent une bonne compréhension des marchés financiers."
  },
  consistency_checks: {
    missing_critical_fields: [],
    document_inconsistencies: null
  },
  extraction: {
    success: true,
    confidence: 0.95,
    processing_time_ms: 8500,
    warnings: []
  },
  metadata: {
    documentName: "KID_Phoenix_AutocallEuroStoxx50.pdf",
    uploadDate: "2025-11-13T10:00:00Z",
    extractionDate: "2025-11-13T10:00:08Z",
    processingTime: 8500
  }
};

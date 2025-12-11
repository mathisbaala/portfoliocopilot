# ProductEtfDashboardV2 - Architecture Master/Detail

## 📋 Vue d'ensemble

Le nouveau composant `ProductEtfDashboardV2` utilise une architecture **master/detail** avec navigation à deux colonnes, offrant une expérience utilisateur moderne et épurée.

## 🎯 Architecture

### Structure des fichiers
```
src/components/product/
├── product-etf-dashboard-v2.tsx    # Composant principal avec layout master/detail
└── sections/
    ├── index.ts                     # Exports centralisés
    ├── investment-section.tsx       # Section 1: Dans quoi j'investis ?
    ├── how-it-works-section.tsx    # Section 2: Comment ça marche ?
    ├── risk-section.tsx            # Section 3: Qu'est-ce que je risque ?
    ├── liquidity-section.tsx       # Section 4: Puis-je entrer et sortir ?
    └── fees-section.tsx            # Section 5: Combien ça me coûte ?
```

## 🎨 Caractéristiques

### Desktop (> 1024px)
- **Navigation gauche (25%)**: Liste verticale sticky des 5 questions
  - Numérotation colorée (1-5)
  - Titre et sous-titre pour chaque section
  - Highlight de la section active (bordure bleue)
  - Hover states et focus visible
  
- **Panneau de contenu (75%)**: Affiche uniquement la section active
  - Header avec dégradé bleu
  - Contenu avec transitions fluides (fade + slide)
  - Scroll indépendant

### Mobile (< 1024px)
- **Pills horizontales scrollables** en haut
- **Panneau de contenu** en dessous
- Optimisé pour le tactile

### Accessibilité
- ✅ Boutons sémantiques avec `<button>`
- ✅ `aria-current="true"` pour la section active
- ✅ États de focus visibles
- ✅ Navigation au clavier complète

## 🚀 Usage

### Import
```tsx
import { ProductEtfDashboardV2 } from "@/components/product";
import productData from "@/data/amundi-cac40-etf.json";
import { FinancialProduct } from "@/types/financial-product";
```

### Utilisation basique
```tsx
export default function ProductPage() {
  return (
    <ProductEtfDashboardV2 
      data={productData as FinancialProduct} 
    />
  );
}
```

## 📦 Props

```typescript
interface ProductEtfDashboardV2Props {
  data: FinancialProduct;  // Données complètes du produit financier
}
```

Le type `FinancialProduct` contient toutes les informations nécessaires:
- `product`: Informations générales (nom, ISIN, émetteur...)
- `typeSpecific`: Détails spécifiques ETF (indice, réplication...)
- `risk`: Indicateur de risque et période de détention
- `costs`: Structure complète des frais
- `liquidityAndTrading`: Informations de cotation et liquidité
- `historicalPerformance`: Performances historiques

## 🎬 Page de test

Une page de démo est disponible à:
```
http://localhost:3000/test-v2
```

Fichier source: `src/app/test-v2/page.tsx`

## 🔄 Migration depuis l'ancien composant

### Ancien format (Accordion)
```tsx
<FinancialProductDashboard data={productData} />
```

### Nouveau format (Master/Detail)
```tsx
<ProductEtfDashboardV2 data={productData} />
```

Les deux composants acceptent le même format de données et peuvent coexister.

## 📱 Responsive Breakpoints

- **Desktop**: `lg:` (≥1024px) - Layout à deux colonnes
- **Mobile**: `< 1024px` - Layout empilé avec pills

## 🎨 Design System

### Couleurs principales
- **Primary**: Bleu (`blue-600`, `blue-700`)
- **Success**: Vert (`green-600`)
- **Warning**: Orange (`orange-600`)
- **Error**: Rouge (`red-600`)
- **Neutral**: Slate (`slate-50`, `slate-900`)

### Espacements
- Padding externe: `p-4 sm:p-6 lg:p-8`
- Gap entre éléments: `gap-6 lg:gap-8`
- Sections internes: `space-y-6`

### Transitions
- Changement de section: `animate-in fade-in slide-in-from-bottom-4 duration-300`
- Hover/Focus: `transition-all duration-200`

## 🔧 Personnalisation

### Modifier les sections
Chaque section est indépendante dans `src/components/product/sections/`. Vous pouvez:
1. Modifier le contenu d'une section
2. Ajouter de nouvelles sections dans `SECTIONS` array
3. Personnaliser les styles Tailwind

### Ajouter une nouvelle section

1. **Créer le composant de section**:
```tsx
// src/components/product/sections/new-section.tsx
export function NewSection({ data }: NewSectionProps) {
  return <div>Contenu...</div>;
}
```

2. **Ajouter dans la configuration**:
```typescript
const SECTIONS = [
  // ... sections existantes
  {
    id: "new-section",
    title: "Ma nouvelle section ?",
    subtitle: "Description courte",
  },
];
```

3. **Ajouter dans le switch**:
```typescript
case "new-section":
  return <NewSection data={data.newData} />;
```

## ✨ Avantages vs ancien composant

| Caractéristique | Ancien (Accordion) | Nouveau (Master/Detail) |
|-----------------|-------------------|-------------------------|
| Layout | Vertical scroll | Two-column navigation |
| Sections visibles | Toutes (ou collapsibles) | Une seule à la fois |
| Navigation | Scroll ou collapse | Click sur navigation |
| Mobile | Long scroll | Pills + Panel |
| Transitions | Collapse animation | Fade + Slide |
| Accessibilité | Basic | Enhanced (aria-current) |

## 📝 Notes

- **Contenu préservé**: Tout le contenu des sections a été migré exactement à l'identique
- **Types préservés**: Toutes les interfaces TypeScript sont réutilisées
- **Rétrocompatibilité**: L'ancien composant reste disponible
- **Performance**: Une seule section est montée à la fois (optimisation)

## 🐛 Troubleshooting

### Les imports de sections ne fonctionnent pas
Assurez-vous que `src/components/product/sections/index.ts` existe et exporte tous les composants.

### Les données ne s'affichent pas
Vérifiez que votre objet `data` correspond au type `FinancialProduct` complet.

### Les transitions sont saccadées
Ajoutez `will-change-transform` sur l'élément animé si nécessaire.

## 🔮 Évolutions futures

- [ ] Ajout d'une 6ème section personnalisable
- [ ] Support du mode sombre
- [ ] Animations plus avancées (Framer Motion)
- [ ] Historique de navigation (breadcrumb)
- [ ] Export PDF de la section active
- [ ] Comparaison multi-produits

# Token Tycoon v2.0 - Production Templates & Asset Libraries
## Complete Implementation Resources

*This document provides production-ready templates, asset libraries, and implementation resources for creating Token Tycoon cards using the v2.0 Cyberpunk Circuit Board design system.*

---

## TEMPLATE LIBRARY STRUCTURE

### File Organization System
```
/token-tycoon-v2-assets/
├── /templates/
│   ├── /card-bases/
│   │   ├── chain-template.psd
│   │   ├── defi-template.psd
│   │   ├── eoa-template.psd
│   │   ├── action-template.psd
│   │   └── ability-template.psd
│   ├── /rarity-tiers/
│   │   ├── common-effects.psd
│   │   ├── standard-effects.psd
│   │   ├── premium-effects.psd
│   │   └── legendary-effects.psd
│   └── /specialized/
│       ├── storage-indicators.psd
│       ├── yield-meters.psd
│       ├── countdown-timers.psd
│       └── trigger-states.psd
├── /components/
│   ├── /circuit-patterns/
│   ├── /borders-frames/
│   ├── /icons-symbols/
│   ├── /typography/
│   └── /effects/
├── /colors/
│   ├── palette.aco (Adobe Color)
│   ├── swatches.ase (Adobe Swatch Exchange)
│   └── css-variables.css
└── /exports/
    ├── /print-ready/
    ├── /web-optimized/
    └── /mobile-assets/
```

---

## PHOTOSHOP TEMPLATE SPECIFICATIONS

### Master Template Layer Structure
```
Card Template (63mm x 88mm + 3mm bleed)
├── SAFETY GUIDES [locked layer]
├── BLEED GUIDES [locked layer]
├── TEXT CONTENT [editable]
│   ├── Card Name
│   ├── Card Type Badge
│   ├── Cost Indicator
│   └── Description Text
├── MAIN ART [replacement smart object]
├── MECHANICAL ELEMENTS [conditional visibility]
│   ├── Storage Container
│   ├── Yield Meter
│   ├── Countdown Timer
│   └── Trigger State
├── CIRCUIT PATTERNS [style effects]
│   ├── Foreground Circuits (80% opacity)
│   ├── Mid-ground Circuits (40% opacity)
│   └── Background Circuits (20% opacity)
├── CARD FRAME [rarity dependent]
│   ├── Premium Frame Effects
│   ├── Standard Frame
│   └── Common Frame
├── BACKGROUND [card type color]
└── BASE LAYER [never delete]
```

### Chain Card Template (chain-template.psd)
```
Layer Groups:
├── CONTENT [editable text and art placement]
│   ├── Card Name: "ETHEREUM MAINNET" [text layer]
│   ├── Card Type: "CHAIN" [styled text]
│   ├── Cost: "3 ETH" [styled numerics in hexagonal container]
│   ├── Description: [paragraph text with wrap settings]
│   └── Main Art: [smart object 150x100mm at 300dpi]
├── NETWORK VISUALIZATION [smart object components]
│   ├── Validator Nodes: [circular patterns with connections]
│   ├── Data Highways: [flowing line patterns]
│   ├── Bridge Connections: [cross-chain indicators]
│   └── Network Activity: [particle effects overlay]
├── CIRCUIT SYSTEM [vector smart objects]
│   ├── Primary Network Grid: [2pt cyan lines, 70% opacity]
│   ├── Secondary Connections: [1pt cyan lines, 40% opacity] 
│   ├── Background Mesh: [0.5pt cyan lines, 20% opacity]
│   └── Energy Nodes: [circular connection points]
├── FRAME SYSTEM [vector shapes with effects]
│   ├── Outer Border: [3pt Electric Cyan with glow]
│   ├── Corner Nodes: [hexagonal elements with ETH symbol]
│   ├── Inner Frame: [geometric construction pattern]
│   └── Side Elements: [data flow indicators]
├── COLOR FOUNDATION
│   ├── Primary Background: [Deep Space Navy #0A0E27]
│   ├── Secondary Fill: [gradient to #1A1E3A]
│   └── Accent Base: [Electric Cyan #00D9FF foundation]
```

### DeFi Card Template (defi-template.psd)
```
Layer Groups:
├── CONTENT [financial protocol focus]
│   ├── Card Name: [financial protocol name]
│   ├── Yield Display: [ETH generation rate with mathematical precision]
│   ├── Storage Capacity: [vault visualization with capacity meters]
│   └── Protocol Mechanics: [AMM/lending/staking specific elements]
├── FINANCIAL VISUALIZATION [smart object system]
│   ├── Liquidity Pools: [circular container representations]
│   ├── Yield Spirals: [compound interest mathematical curves]
│   ├── Flow Indicators: [directional particle streams]
│   └── Fee Collection: [accumulation point visualization]
├── CIRCUIT PATTERNS [financial themed]
│   ├── Yield Loops: [circular and spiral circuit patterns]
│   ├── Flow Networks: [directional connection systems]
│   ├── Pool Containers: [hexagonal and circular shapes]
│   └── Financial Metrics: [integrated chart patterns]
├── FRAME SYSTEM [financial aesthetic]
│   ├── Outer Border: [2pt Neon Amber with financial styling]
│   ├── Corner Elements: [yield and pool indicators]
│   ├── Multi-layer Frame: [compound interest spiral integration]
│   └── Financial Indicators: [percentage displays and metrics]
```

### EOA Card Template (eoa-template.psd)
```
Layer Groups:
├── CONTENT [personal security focus]
│   ├── Wallet Name: [security-focused naming]
│   ├── Storage Display: [prominent vault with capacity indication]
│   ├── Security Features: [multi-sig, protection, access controls]
│   └── Personal Elements: [individual user-focused design]
├── SECURITY VISUALIZATION [vault and protection systems]
│   ├── Secure Vault: [central protected container]
│   ├── Access Controls: [key and signature requirements]
│   ├── Protection Shields: [security overlay graphics]
│   └── Authentication: [multi-signature visualization]
├── CIRCUIT PATTERNS [security focused]
│   ├── Security Grids: [reinforced protection patterns]
│   ├── Access Pathways: [controlled connection routes]
│   ├── Encryption Patterns: [security-themed circuit designs]
│   └── Personal Networks: [individual-focused connection systems]
├── FRAME SYSTEM [secure vault aesthetic]
│   ├── Vault Border: [2.5pt Cyan with security styling]
│   ├── Lock Mechanisms: [corner security elements]
│   ├── Access Panels: [security control integration]
│   └── Diamond Elements: ["diamond hands" crystalline patterns]
```

### Action Card Template (action-template.psd)
```
Layer Groups:
├── CONTENT [impact-focused design]
│   ├── Action Name: [impact-appropriate typography]
│   ├── Effect Description: [clear mechanical explanation]
│   ├── Target Selection: [targeting system visualization]
│   └── Impact Scope: [destruction/benefit radius indication]
├── IMPACT VISUALIZATION [varies by action type]
│   ├── Destructive Effects: [explosion and system failure graphics]
│   ├── Educational Effects: [knowledge and learning visualization]
│   ├── Technical Effects: [engineering and protocol diagrams]
│   └── Warning Systems: [alert and caution indicators]
├── CIRCUIT PATTERNS [impact themed]
│   ├── Destructive: [fragmented circuits with break indicators]
│   ├── Educational: [neural networks and learning patterns]
│   ├── Technical: [engineering schematics and blueprints]
│   └── Warning: [alert systems and danger indicators]
├── FRAME SYSTEM [dynamic impact styling]
│   ├── Variable Border: [color and intensity by action type]
│   ├── Warning Elements: [danger indicators and alerts]
│   ├── Impact Indicators: [scope and effect visualization]
│   └── Urgency System: [timing and priority indication]
```

### Ability Card Template (ability-template.psd)
```
Layer Groups:
├── CONTENT [academic and professional focus]
│   ├── Ability Name: [educational/professional naming]
│   ├── Knowledge Effect: [card draw and learning benefits]
│   ├── Professional Network: [collaboration and connection benefits]
│   └── Academic Achievement: [educational progression indication]
├── KNOWLEDGE VISUALIZATION [learning and networking systems]
│   ├── Neural Networks: [brain-inspired connection patterns]
│   ├── Information Flow: [knowledge transfer visualization]
│   ├── Academic Infrastructure: [educational environment elements]
│   └── Professional Development: [career and networking graphics]
├── CIRCUIT PATTERNS [academic themed]
│   ├── Neural Pathways: [organic connection patterns]
│   ├── Knowledge Networks: [information distribution systems]
│   ├── Academic Grids: [educational institution layouts]
│   └── Research Connections: [collaboration visualization]
├── FRAME SYSTEM [academic professional styling]
│   ├── Academic Border: [3pt Circuit Purple with scholarly emphasis]
│   ├── Knowledge Indicators: [book and education symbols]
│   ├── Professional Elements: [conference and networking graphics]
│   └── Learning Progression: [educational achievement visualization]
```

---

## COMPONENT LIBRARY SPECIFICATIONS

### Circuit Pattern Components

#### Primary Circuit Patterns (vector smart objects)
```
Network Grid Pattern:
- Base grid: 4x4mm squares
- Line weight: 1pt standard, 2pt primary, 0.5pt background
- Connection nodes: 4pt diameter circles at intersections
- Energy flow: Directional indicators along primary paths
- Scalability: Vector-based for infinite scaling

File: network-grid-pattern.ai
Usage: All card types as foundational circuit structure
Variations: Density levels (25%, 50%, 75% intersection utilization)
```

#### Specialized Circuit Patterns
```
Chain Network Pattern:
- Dense mesh interconnections
- Hub-and-spoke topology
- Validator node clusters
- Cross-chain bridge indicators
File: chain-network.ai

DeFi Flow Pattern:  
- Circular pool representations
- Directional yield flows
- Compound interest spirals
- Liquidity level indicators
File: defi-flow.ai

Security Grid Pattern:
- Reinforced protection meshes
- Access control checkpoints
- Encryption pattern overlays
- Multi-signature indicators
File: security-grid.ai

Impact Pattern:
- Fragmented break indicators
- Explosion radial patterns
- Warning triangle networks
- System failure cascades
File: impact-pattern.ai

Neural Network Pattern:
- Organic connection systems
- Information flow pathways
- Learning node clusters
- Knowledge distribution networks
File: neural-network.ai
```

### Border & Frame Components

#### Rarity Tier Frames
```
Common Frame (common-frame.ai):
- Single 2pt border line
- Basic corner elements
- Minimal enhancement
- 25% pattern density
- No glow effects

Standard Frame (standard-frame.ai):
- Dual-layer border system
- Enhanced corner elements
- Moderate pattern integration
- 50% pattern density
- Basic glow effects (30% opacity)

Premium Frame (premium-frame.ai):
- Multi-layer border construction
- Complex corner elements
- Advanced pattern integration
- 75% pattern density
- Enhanced glow effects (60% opacity)

Legendary Frame (legendary-frame.ai):
- Maximum complexity construction
- Organic element integration
- Full pattern utilization
- 85% pattern density
- Dynamic glow effects (80% opacity)
```

#### Card Type Specific Frames
```
Chain Frame Elements:
- Hexagonal corner nodes
- Network topology integration
- Data highway connections
- Infrastructure indicators
Color: Electric Cyan (#00D9FF)

DeFi Frame Elements:
- Financial metric integration
- Yield curve incorporated borders
- Pool container corner elements  
- Performance indicator integration
Color: Neon Amber (#FFA500) with Circuit Purple accents

EOA Frame Elements:
- Security panel corner elements
- Vault door integration
- Access control indicators
- Protection shield overlays
Color: Electric Cyan (#00B8E6) with Magenta Glow accents

Action Frame Elements:
- Dynamic impact styling
- Warning triangle integration
- Effect scope indicators
- Urgency level indication
Color: Variable by action type

Ability Frame Elements:
- Academic professional styling
- Knowledge network integration
- Educational achievement indicators
- Professional development symbols
Color: Circuit Purple (#8B00FF) with cyan highlights
```

### Icon & Symbol Library

#### Core Game Icons (SVG format)
```
ETH Symbol:
- Standard Ethereum diamond logo
- Circuit-board styling integration
- Multiple sizes: 16px, 24px, 32px, 48px
- Color variations for each card type

Staking Indicators:
- Input/output arrows for ETH flow
- Capacity meters for storage limits
- Yield generation symbols
- Compound interest indicators

Security Symbols:
- Lock mechanisms (single, multi-sig)
- Shield protection indicators  
- Key symbols for access control
- Diamond patterns for "diamond hands"

Action Impact Icons:
- Destruction symbols (explosion, skull, warning)
- Educational symbols (book, graduation, conference)
- Technical symbols (wrench, gear, schematic)
- Immediate effect indicators

Ability Symbols:
- Knowledge symbols (brain, book, lightbulb)
- Networking symbols (connection nodes, handshake)
- Professional symbols (briefcase, certificate)
- Academic symbols (graduation cap, degree, research)
```

#### Status Effect Indicators
```
Positive Effects:
- Success checkmarks (green #00FF88)
- Growth arrows (upward trending)
- Accumulation symbols (plus signs, multiplication)
- Enhancement indicators (star bursts, glow effects)

Negative Effects:
- Warning triangles (yellow #FFAA00)
- Danger alerts (red #FF0044)
- Failure indicators (X marks, broken symbols)
- Countdown urgency (red pulsing, countdown clocks)

Neutral States:
- Information symbols (blue #0088FF)
- Process indicators (circular progress, loading)
- Maintenance symbols (gear, wrench)
- Placeholder indicators (dashed outlines)
```

### Typography Assets

#### Font Files & Character Sets
```
Primary Font: Orbitron (Google Fonts)
- Orbitron-Black.woff2 (900 weight)
- Orbitron-Bold.woff2 (700 weight)
- Orbitron-Medium.woff2 (500 weight)
- Orbitron-Regular.woff2 (400 weight)

Character Support:
- Extended Latin (A-Z, a-z, 0-9)
- Cryptocurrency symbols (₿, Ξ, ⟠)
- Mathematical symbols (+, -, ×, ÷, =, %, →)
- Gaming symbols (♦, ♠, ♣, ♥, ★, ☆)

Fallback Stack:
font-family: 'Orbitron', 'Exo', 'Rajdhani', 'Arial Black', sans-serif;
```

#### Typography Styling Presets
```
Card Name Styling:
.card-name {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(16px, 4vw, 24px);
  letter-spacing: 0.05em;
  text-shadow: 
    0 0 2px #000000,
    0 0 8px currentColor;
  background: linear-gradient(180deg, currentColor 0%, 
                              color-mix(in srgb, currentColor 70%, #000000) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

Card Type Styling:
.card-type {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(10px, 2.5vw, 14px);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

Body Text Styling:
.card-description {
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  font-size: clamp(8px, 2vw, 10px);
  line-height: 1.3;
  letter-spacing: 0.01em;
}
```

---

## COLOR SYSTEM ASSETS

### Adobe Color Swatches (palette.aco)
```
Primary Palette:
- Deep Space Navy #0A0E27 (background base)
- Electric Cyan #00D9FF (primary accent)
- Neon Amber #FFA500 (warm contrast)
- Magenta Glow #FF0080 (secondary accent)
- Circuit Purple #8B00FF (tertiary depth)

Secondary Palette:
- Light Navy #1A1E3A (background secondary)
- Bright Cyan #00B8E6 (accent variation)
- Orange Accent #FF6B00 (warm variation)
- Pink Accent #E6007A (secondary variation)
- Purple Accent #6B00CC (tertiary variation)

Status Colors:
- Success Green #00FF88
- Warning Yellow #FFAA00
- Danger Red #FF0044
- Info Blue #0088FF
- Neutral Gray #666666
```

### CSS Custom Properties (css-variables.css)
```css
:root {
  /* Primary Brand Colors */
  --color-navy-deep: #0A0E27;
  --color-navy-light: #1A1E3A;
  --color-cyan-electric: #00D9FF;
  --color-cyan-bright: #00B8E6;
  --color-amber-neon: #FFA500;
  --color-amber-orange: #FF6B00;
  --color-magenta-glow: #FF0080;
  --color-magenta-accent: #E6007A;
  --color-purple-circuit: #8B00FF;
  --color-purple-accent: #6B00CC;
  
  /* Card Type Colors */
  --color-chain: var(--color-cyan-electric);
  --color-defi-primary: var(--color-amber-neon);
  --color-defi-secondary: var(--color-purple-circuit);
  --color-eoa-primary: var(--color-cyan-bright);
  --color-eoa-secondary: var(--color-magenta-glow);
  --color-action-destructive: linear-gradient(45deg, var(--color-amber-orange), #FF0000);
  --color-action-educational: var(--color-purple-circuit);
  --color-ability: var(--color-purple-circuit);
  
  /* Status Colors */
  --color-success: #00FF88;
  --color-warning: #FFAA00;
  --color-danger: #FF0044;
  --color-info: #0088FF;
  --color-neutral: #666666;
  
  /* Typography Colors */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #F0F0F0;
  --color-text-disabled: #CCCCCC;
  
  /* Effect Colors */
  --color-glow-base: currentColor;
  --opacity-glow-subtle: 0.3;
  --opacity-glow-standard: 0.5;
  --opacity-glow-intense: 0.8;
}
```

### Gradient Presets
```css
/* Card Type Gradients */
.gradient-chain {
  background: linear-gradient(135deg, 
    var(--color-cyan-electric) 0%, 
    var(--color-cyan-bright) 100%);
}

.gradient-defi {
  background: linear-gradient(135deg, 
    var(--color-amber-neon) 0%, 
    var(--color-purple-circuit) 100%);
}

.gradient-eoa {
  background: linear-gradient(135deg, 
    var(--color-cyan-bright) 0%, 
    var(--color-magenta-glow) 100%);
}

.gradient-action-destructive {
  background: linear-gradient(135deg, 
    var(--color-amber-orange) 0%, 
    #FF0000 100%);
}

.gradient-ability {
  background: linear-gradient(135deg, 
    var(--color-purple-circuit) 0%, 
    var(--color-cyan-electric) 100%);
}
```

---

## EFFECT & ANIMATION PRESETS

### Glow Effect Library (CSS)
```css
/* Subtle glow for common cards */
.glow-subtle {
  filter: drop-shadow(0 0 4px currentColor);
  opacity: var(--opacity-glow-subtle);
}

/* Standard glow for premium cards */
.glow-standard {
  filter: drop-shadow(0 0 8px currentColor);
  opacity: var(--opacity-glow-standard);
}

/* Intense glow for legendary cards */
.glow-intense {
  filter: drop-shadow(0 0 16px currentColor);
  opacity: var(--opacity-glow-intense);
}

/* Pulsing glow animation */
.glow-pulse {
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
  50% { filter: drop-shadow(0 0 12px currentColor); }
}
```

### Circuit Animation Presets (CSS)
```css
/* Energy flow animation */
.circuit-flow {
  animation: energyFlow 3s linear infinite;
}

@keyframes energyFlow {
  0% { stroke-dashoffset: 0; opacity: 0.3; }
  50% { opacity: 1.0; }
  100% { stroke-dashoffset: 20px; opacity: 0.3; }
}

/* Network pulse animation */
.network-pulse {
  animation: networkPulse 4s ease-in-out infinite;
}

@keyframes networkPulse {
  0%, 100% { transform: scale(1.0); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1.0; }
}
```

### Particle Effect Configurations (JavaScript)
```javascript
// Particle system presets for different card types
export const particlePresets = {
  chain: {
    particleCount: 12,
    particleSize: 3,
    color: '#00D9FF',
    speed: 1.2,
    lifetime: 2500,
    emissionRate: 1.5
  },
  
  defi: {
    particleCount: 8,
    particleSize: 4,
    color: '#FFA500',
    speed: 1.0,
    lifetime: 3000,
    emissionRate: 1.0
  },
  
  eoa: {
    particleCount: 6,
    particleSize: 2,
    color: '#00B8E6',
    speed: 0.8,
    lifetime: 3500,
    emissionRate: 0.8
  },
  
  action: {
    particleCount: 20,
    particleSize: 5,
    color: '#FF6B00',
    speed: 2.0,
    lifetime: 1500,
    emissionRate: 2.5
  },
  
  ability: {
    particleCount: 10,
    particleSize: 3,
    color: '#8B00FF',
    speed: 1.1,
    lifetime: 2800,
    emissionRate: 1.2
  }
};
```

---

## EXPORT SPECIFICATIONS

### Print-Ready Exports
```
Format: PDF (PDF/X-1a:2001 compliance)
Resolution: 300 DPI
Color Profile: CMYK (ISO Coated v2)
Card Size: 63mm × 88mm
Bleed: 3mm all sides (final size: 69mm × 94mm)
Cut Marks: Included
Color Bars: Included
Overprint: Black text and outlines
```

### Web-Optimized Exports
```
Format: PNG with WebP fallback
Resolution: 2x retina (126 DPI equivalent)
Card Size: 252px × 352px (2x) / 126px × 176px (1x)
Compression: Optimized for <100KB per card
Color Profile: sRGB
Transparency: Supported
Progressive Loading: Enabled
```

### Mobile-Optimized Assets
```
Sizes: 
- Thumbnail: 63px × 88px
- Standard: 126px × 176px  
- Detail: 189px × 264px
- Full: 252px × 352px

Format: WebP primary, PNG fallback
Compression: Aggressive optimization for mobile bandwidth
Loading: Lazy loading attributes
Caching: Browser cache optimization headers
```

---

## QUALITY CONTROL CHECKLIST

### Pre-Production Verification
```
Design Elements:
☐ All text is readable at final card size
☐ Circuit patterns maintain clarity when scaled
☐ Color contrast meets accessibility standards (WCAG AA)
☐ All fonts are properly embedded/outlined
☐ Images are at correct resolution (300 DPI for print)
☐ Effects maintain quality at export resolution

Technical Requirements:
☐ Bleed area properly extends beyond crop marks
☐ No content in safety area margins
☐ All colors are within gamut for chosen color profile
☐ File structure follows naming conventions
☐ Version control metadata is properly embedded
☐ Export settings match production requirements

Brand Consistency:
☐ Card type colors match specification exactly
☐ Typography follows established hierarchy
☐ Circuit patterns align with design system
☐ Icon usage follows brand guidelines
☐ Animation timing matches specification
☐ Interactive elements provide proper feedback
```

### Production Validation
```
Print Production:
☐ Color accuracy verified with printed proofs
☐ Paper stock appropriate for design requirements
☐ Special effects (UV, foil) properly specified
☐ Cut registration within tolerance
☐ Batch consistency maintained across print run

Digital Production:
☐ Cross-browser compatibility verified
☐ Mobile device testing completed
☐ Animation performance meets targets
☐ Loading time optimization verified
☐ Accessibility testing passed
☐ User experience testing completed
```

*This comprehensive production template library provides all necessary assets and specifications for implementing the v2.0 Token Tycoon design system across print and digital formats with consistent quality and brand compliance.*
# Ethereum TCG Design System Guide

## Overview

This guide provides instructions for creating new cards using the established design system and templates for the Ethereum-themed Trading Card Game.

## File Structure

```
design/
├── templates/          # Base SVG templates for each card type
├── samples/           # Example cards showing complete implementations
├── icons/             # Reusable icon set
└── DESIGN_SYSTEM_GUIDE.md
```

## Card Templates

### Available Templates

1. **chain-template.svg** - For blockchain/L2 cards
2. **defi-template.svg** - For DeFi protocol cards
3. **action-template.svg** - For one-time use action cards
4. **eoa-template.svg** - For EOA (wallet/validator) cards
5. **ability-template.svg** - For research/study cards

### Template Structure

Each template contains the following layers and elements:

#### Standard Elements (All Cards)
- **Background**: Dark theme with rounded corners
- **Header Section**: Contains cost, name, and type label
- **Art Area**: 270x180px space for custom illustrations
- **Description Box**: Text area for card abilities
- **Rarity Indicator**: Bottom-right corner gem/shape

#### Card-Specific Elements

**Chain Cards**:
- Color theme: Blue (#3b82f6) to dark blue (#1e40af)
- Income indicator for ETH generation
- L2/blockchain motifs
- Chain link overlay graphics

**DeFi Cards**:
- Color theme: Green (#10b981) to orange (#f59e0b)
- Staking box for ETH storage tracking
- Yield multiplier indicators
- DeFi-specific motifs (arrows, compound symbols)

**Action Cards**:
- Color theme: Red (#dc2626) with warning accents
- "ONE TIME USE" indicator
- Effect strength display
- Warning triangles and flash effects

**EOA Cards**:
- Color theme: Cyan (#0891b2) to gold (#fbbf24)
- Storage capacity indicators (for wallets)
- Governance control counters (for whales)
- Wallet and people-focused iconography

**Ability Cards**:
- Color theme: Gray (#6b7280) to purple (#6366f1)
- Research/study effect indicators
- Draw card amount display
- Knowledge/intelligence iconography

## Creating New Cards

### Step 1: Choose Template
Select the appropriate template based on card type from `../data/cards.json`:
- Chain → `chain-template.svg`
- DeFi → `defi-template.svg` 
- Action → `action-template.svg`
- EOA → `eoa-template.svg`
- Ability → `ability-template.svg`

### Step 2: Customize Placeholders
Replace the following placeholders in your chosen template:

#### Universal Placeholders
- `{COST}` - Mana/ETH cost to play card
- `{CARD_NAME}` - Full card name
- `{DESCRIPTION}` - Card ability text (multi-line supported)

#### Card-Type Specific Placeholders

**Chain Cards**:
- `{INCOME}` - ETH generation per turn

**DeFi Cards**:
- `{YIELD}` - Yield multiplier amount
- `{STAKED}` - Current staked ETH (usually starts at 0)

**Action Cards**:
- `{EFFECT}` - Primary effect (DESTROY, STEAL, etc.)

**EOA Cards**:
- `{MAX_STORAGE}` - Maximum ETH storage (for wallets)
- `{INCOME}` - ETH generation formula

**Ability Cards**:
- `{DRAW}` - Number of cards to draw

### Step 3: Create Custom Art
Design artwork for the 270x180px art area:

#### Art Guidelines
- **Style**: Futuristic cyberpunk meets high-finance
- **Lighting**: Consistent dramatic lighting across all cards
- **Colors**: Use card type color scheme as base
- **Detail**: Readable at card size, avoid excessive fine details
- **Iconography**: Blockchain/finance symbols that are intuitive

#### Art Themes by Type
- **Chain**: Networks, nodes, L2 bridges, scaling solutions
- **DeFi**: Yield farming, lending/borrowing, liquidity pools
- **Action**: Attacks, exploits, warnings, disruption
- **EOA**: Wallets, whales, validators, people
- **Ability**: Research, learning, conferences, data analysis

### Step 4: Set Rarity
Choose appropriate rarity indicator:
- **Common**: Simple gray circle
- **Uncommon**: Blue diamond
- **Rare**: Gold star
- **Epic**: Purple star with white center
- **Legendary**: Orange star with white center and thick border

### Step 5: Validate Design

Check your card against these requirements:
- [ ] All text is readable at 300x420px size
- [ ] Card type colors are consistent with template
- [ ] Rarity matches card power level
- [ ] Art fits the established aesthetic
- [ ] All placeholder text is replaced
- [ ] Cost/abilities match game mechanics

## Icon Usage

Reference the icon set (`icons/icon-set.svg`) for consistent symbols:

### ETH Icons
- Standard (20px): General ETH references
- Small (15px): Tight spaces, secondary info
- Large (25px): Primary cost indicators

### Status Effects
- Shield: Protection abilities
- Lightning: Fast/instant effects  
- Fire: Damage/burn effects
- Freeze: Disable/stun effects

### Rarity Indicators
Use consistent rarity symbols across all cards to maintain visual hierarchy.

## Technical Specifications

### File Format
- **Vector**: SVG preferred for scalability
- **Raster**: PNG at 300 DPI minimum if using bitmap elements
- **Color Mode**: RGB for digital, CMYK for print versions

### Dimensions
- **Card Size**: 300x420px (standard TCG proportions)
- **Art Area**: 270x180px centered
- **Safe Margins**: 15px from card edges
- **Text Size**: Minimum 12px for readability

### Export Settings
For print production:
- **Resolution**: 300 DPI minimum
- **Bleed**: 3mm on all sides if printing
- **Color Profile**: CMYK for offset printing

## Quality Checklist

Before finalizing any card design:

- [ ] Template matches card type from game data
- [ ] All placeholder text replaced with actual values
- [ ] Art style consistent with samples
- [ ] Rarity appropriate for card power
- [ ] Text legible at print size
- [ ] Colors match established type themes
- [ ] File properly named (cardname-type-sample.svg)
- [ ] SVG code is clean and optimized

## Naming Convention

Use this format for new card files:
```
[card-name]-[type]-sample.svg
```

Examples:
- `ethereum-mainnet-chain-sample.svg`
- `compound-defi-sample.svg`
- `rug-pull-action-sample.svg`

This ensures consistent organization and easy identification of card designs.

## Adaptation Notes

### Localization
- Leave extra space in text boxes for longer translations
- Use universal symbols where possible
- Separate text layers for easy replacement

### Print vs Digital
- Digital: RGB color space, screen-optimized
- Print: CMYK color space, higher resolution
- Consider both formats during initial design

### Future Expansion
- Templates designed to accommodate new mechanics
- Color schemes can be modified for new card types
- Icon set can be expanded with new symbols as needed
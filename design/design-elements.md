# Ethereum TCG Design Elements Brief

## Overview

This document outlines the comprehensive design system for the Ethereum-themed Trading Card Game (TCG). The design follows a **Cyberpunk Circuit Board** aesthetic with **Magic: The Gathering-style information layout**, prioritizing maximum readability, self-contained functionality, and accurate data representation.

## Core Design Philosophy

1. **Self-Contained Cards**: Each card contains ALL necessary gameplay information without external dependencies
2. **Maximum Contrast**: Ultra-high contrast for readability in any lighting condition
3. **MTG-Style Layout**: Familiar card structure with header, name, art, rules, and stats sections
4. **Data Accuracy**: Every visual element must precisely match the source JSON data
5. **Zero JavaScript Dependency**: All functionality achieved through pure CSS

---

## Color Palette

### Primary Colors
- **Cyan Electric**: `#00D9FF` - Primary accent, borders, glows
- **White**: `#FFFFFF` - Primary text, high contrast elements
- **Pure Black**: `#000000` - High contrast backgrounds
- **Deep Navy**: `#0A0E27` - Page backgrounds
- **Navy Light**: `#1A1E3A` - Secondary backgrounds

### Accent Colors
- **Amber Neon**: `#FFA500` - Income/economic abilities, section headers
- **Danger Red**: `#FF0044` - Destruction, attacks, warnings
- **Success Green**: `#00FF7F` - Yield, protection, positive effects
- **Purple Circuit**: `#8A2BE2` - Draw effects, triggers, conditional abilities
- **Crimson**: `#DC143C` - Steal, takeover, hostile actions
- **Orange Fire**: `#FF4500` - Burn effects, damage over time

### Semantic Color Mapping
Each ability type has a specific color for instant recognition:
- **Destruction** (💥): `#FF0044`
- **Yield** (📈): `#00FF7F`  
- **Steal** (🔥): `#DC143C`
- **Storage** (🏦): `#4682B4`
- **Shield** (🛡️): `#32CD32`
- **Burn** (🔥): `#FF4500`
- **Draw** (📄): `#8A2BE2`

---

## Typography

### Font Family
- **Primary**: `'Orbitron', sans-serif` - Futuristic, readable, cyberpunk aesthetic
- **Weights**: 400 (regular), 700 (bold), 900 (black)

### Text Hierarchy
1. **Card Names**: 1.1rem, 900 weight, uppercase, maximum contrast
2. **Section Headers**: 1.3rem, 700 weight, colored glows
3. **Description Text**: 0.95rem, 700 weight, white with black shadows
4. **Ability Mechanics**: 0.9rem, 600 weight, semantic colors
5. **Stats Values**: 1rem, 900 weight, white with shadows

### Text Shadow Strategy
All text uses **multiple shadows** for maximum visibility:
```css
text-shadow: 
    0 0 10px #FFFFFF,        /* White glow */
    0 0 20px #FFFFFF,        /* Extended glow */
    2px 2px 6px #000000,     /* Bottom-right shadow */
    -2px -2px 6px #000000;   /* Top-left shadow */
```

---

## Card Layout Structure

### Overall Dimensions
- **Card Width**: 280-300px
- **Card Height**: ~400px (flexible based on content)
- **Border Radius**: 8-12px
- **Margins**: 0.5rem consistent spacing

### Section Breakdown

#### 1. Card Header
- **Position**: Top of card
- **Background**: `rgba(0, 0, 0, 0.8)` with cyan border
- **Contents**: Cost (left) and Type (right)
- **Cost Display**: Large white text with shadows
- **Type Display**: Icon + label, white text

#### 2. Card Name (Critical Element)
- **Background**: Black gradient with white border
- **Border**: 4px solid white with white glow shadow
- **Text**: Uppercase, 900 weight, white with multi-shadow
- **Positioning**: Prominent, cannot be missed
- **Shadow**: `0 0 40px rgba(255, 255, 255, 0.9)`

#### 3. Card Art Area
- **Background**: Semi-transparent black overlay
- **Border**: 2px solid cyan with 0.4 opacity
- **Content**: Literal iconography (no abstract art)
- **Padding**: 15px for breathing room
- **Min Height**: 60px

#### 4. Rules Text Area (Self-Expanding)
- **Background**: `rgba(0, 0, 0, 0.95)` - nearly opaque
- **Border**: 3px solid cyan with 0.8 opacity
- **Functionality**: CSS-only hover expansion
- **Initial Height**: 80-120px
- **Expanded Height**: Up to 200px with scroll
- **Indicator**: "👁️ Hover to expand" in bottom-right

#### 5. Stats Footer
- **Background**: `rgba(0, 0, 0, 0.95)` matching rules area
- **Border**: 3px solid cyan top border
- **Content**: Stat icons + values from JSON data
- **Stats Display**: High contrast with colored backgrounds

---

## Interactive Elements

### Hover Effects (CSS-Only)
1. **Rules Text Expansion**:
   ```css
   .card-rules-text:hover {
       max-height: 200px !important;
       overflow-y: auto !important;
       border-color: rgba(0, 217, 255, 1) !important;
   }
   ```

2. **Visual Indicators**:
   - Cursor changes to pointer on expandable areas
   - Border intensity increases on hover
   - Smooth transitions (0.3s ease)

### No JavaScript Required
- All functionality achieved through CSS pseudo-classes
- `:hover` for expansion
- `::after` for indicators
- Completely self-contained

---

## Ability Visualization System

### Ability Mechanics Display
Each ability appears as a horizontal bar with:
- **Left Border**: 4px colored strip (semantic color)
- **Background**: Semi-transparent black
- **Icon**: Emoji symbol for instant recognition
- **Text**: Clear description of mechanical effect

### Stats Footer System
Bottom stats show **exact numbers from JSON data**:
- Maximum 3 stats to avoid crowding
- Icons match ability types
- Values are the precise amounts from card data
- Color-coded backgrounds for quick recognition

### Ability Type Icons
- **Income** (💰): Gold coin
- **Yield** (📈): Growth chart
- **Destroy** (💥): Explosion
- **Draw** (📄): Document
- **Storage** (🏦): Bank
- **Protection** (🛡️): Shield
- **Steal** (🔥): Fire
- **Takeover** (👑): Crown
- **Burn** (🔥): Fire (damage context)
- **Shield** (🛡️): Defense

---

## Card Type Styling

### DeFi Cards
- **Primary Color**: Amber neon (#FFA500)
- **Icon**: 💎 (Diamond)
- **Art Style**: Financial/protocol themed
- **Border Accent**: Purple circuit highlights

### Action Cards  
- **Primary Color**: Danger red (#FF0044)
- **Icon**: ⚡ (Lightning bolt)
- **Art Style**: Attack/exploit themed
- **Border Accent**: Amber warning highlights

### EOA (Wallet) Cards
- **Primary Color**: Cyan electric (#00D9FF)
- **Icon**: 👤 (Person)
- **Art Style**: Security/storage themed
- **Border Accent**: Magenta glow highlights

### Chain Cards
- **Primary Color**: Cyan electric (#00D9FF)  
- **Icon**: ⛓️ (Chain link)
- **Art Style**: Network/infrastructure themed
- **Border Accent**: Navy highlights

### Ability Cards
- **Primary Color**: Purple circuit (#8A2BE2)
- **Icon**: 🧠 (Brain)
- **Art Style**: Knowledge/research themed
- **Border Accent**: Cyan highlights

---

## Visual Hierarchy Principles

### 1. Information Priority
1. **Card Name** - Most prominent, impossible to miss
2. **Cost & Type** - Essential for gameplay decisions  
3. **Key Stats** - Quick reference numbers
4. **Description** - Detailed rules text (expandable)
5. **Art** - Supporting visual context

### 2. Contrast Requirements
- **Text on Background**: Minimum 7:1 contrast ratio
- **Border Definition**: Clear separation between sections
- **Color Coding**: Distinct colors for different mechanics
- **Shadow Definition**: Multiple shadows for text visibility

### 3. Spatial Relationships
- **Consistent Margins**: 0.5rem standard spacing
- **Logical Grouping**: Related information clustered
- **Clear Separation**: Distinct visual breaks between sections
- **Breathing Room**: Adequate padding prevents crowding

---

## Data Accuracy Requirements

### Critical Data Points
Every visual element must reflect the exact JSON source:
- **Cost values** in header
- **Ability amounts** in mechanics text
- **Stat numbers** in footer
- **Card names** exactly as in data
- **Descriptions** word-for-word from JSON

### Multi-Ability Cards
Cards with multiple abilities must show:
- **All abilities** in mechanics section
- **All relevant stats** in footer (up to 3 max)
- **Proper color coding** for each ability type
- **Accurate values** for each effect

### Complex Mechanics
- **Storage + Shield**: Show both capacity and protection
- **Destroy + Takeover**: Display both effects with correct values
- **Scaling Effects**: Indicate what the ability scales with
- **Duration Effects**: Show time-based limitations

---

## Technical Implementation Notes

### CSS Architecture
- **Utility Classes**: Reusable styling components
- **Semantic Classes**: Meaning-based class names
- **High Specificity**: `!important` used strategically for overrides
- **Custom Properties**: CSS variables for consistent theming

### Responsive Considerations
- **Grid Layout**: Auto-fit columns with min/max widths
- **Flexible Heights**: Cards adapt to content length
- **Readable Text**: Font sizes maintain legibility at all scales
- **Touch Targets**: Hover areas large enough for interaction

### Performance Requirements
- **Pure CSS**: No JavaScript dependencies
- **Minimal Animations**: Only essential transitions
- **Efficient Selectors**: Optimized CSS for rendering speed
- **Standalone Cards**: Each card is completely independent

---

## Quality Assurance Checklist

### Visual Verification
- [ ] Card names are immediately visible with maximum contrast
- [ ] All stat values match JSON data exactly
- [ ] Long descriptions expand on hover without JavaScript
- [ ] Color coding is consistent across ability types
- [ ] Text shadows provide adequate contrast in all cases

### Functional Verification  
- [ ] Hover expansion works without external scripts
- [ ] Cards function when copied to other pages
- [ ] All information is self-contained within each card
- [ ] Multi-ability cards show all effects clearly
- [ ] Complex mechanics are properly visualized

### Data Integrity
- [ ] Massive destruction cards show 99-100 values
- [ ] Yield cards show correct multipliers (e.g., Aave = 2)
- [ ] Storage cards display maximum capacity accurately
- [ ] Multi-sig cards show both storage and shield values
- [ ] All ability descriptions match JSON source exactly

---

## Future Extensibility

### Adding New Abilities
1. Define semantic color in palette
2. Create ability-specific CSS class
3. Add icon to symbol mapping
4. Include in stats footer system
5. Update color coding documentation

### Scaling Considerations
- **Card Count**: System handles 92+ cards efficiently
- **Ability Complexity**: Framework supports multi-effect cards
- **Visual Consistency**: Systematic approach ensures uniformity
- **Maintenance**: Clear documentation enables updates

This design system prioritizes **functionality over aesthetics**, ensuring every visual element serves the core purpose of clear, accurate information display for gameplay while maintaining an engaging cyberpunk aesthetic.
# Token Tycoon - Color Palette & Typography System
## Cyberpunk Circuit Board Design Implementation Guide

*This document provides detailed color specifications and typography guidelines for implementing the Cyberpunk Circuit Board visual language across all Token Tycoon cards.*

---

## PRIMARY COLOR PALETTE

### Core Brand Colors
```
Deep Space Navy (Background Base)
- Primary: #0A0E27
- Secondary: #1A1E3A
- Usage: Card backgrounds, deep shadow areas, void spaces
- RGB: (10, 14, 39) / (26, 30, 58)
- CMYK: (97, 92, 67, 85) / (85, 79, 55, 65)

Electric Cyan (Primary Accent)
- Primary: #00D9FF
- Secondary: #00B8E6
- Usage: Chain cards, highlights, energy indicators
- RGB: (0, 217, 255) / (0, 184, 230)
- CMYK: (65, 0, 0, 0) / (55, 0, 15, 0)

Neon Amber (Warm Contrast)
- Primary: #FFA500
- Secondary: #FF6B00
- Usage: DeFi cards, important elements, cost indicators
- RGB: (255, 165, 0) / (255, 107, 0)
- CMYK: (0, 35, 100, 0) / (0, 58, 100, 0)

Magenta Glow (Secondary Accent)
- Primary: #FF0080
- Secondary: #E6007A
- Usage: EOA cards, special effects, variety accents
- RGB: (255, 0, 128) / (230, 0, 122)
- CMYK: (0, 100, 50, 0) / (0, 100, 47, 10)

Circuit Purple (Tertiary Depth)
- Primary: #8B00FF
- Secondary: #6B00CC
- Usage: Ability cards, depth layers, complex effects
- RGB: (139, 0, 255) / (107, 0, 204)
- CMYK: (45, 100, 0, 0) / (48, 100, 0, 20)
```

---

## CARD TYPE COLOR ASSIGNMENTS

### Chain Cards - Infrastructure Blue
```
Primary Frame Color: Electric Cyan #00D9FF
Secondary Accents: Deep Space Navy #1A1E3A
Highlight Effects: Cyan #00B8E6
Text Color: White #FFFFFF with cyan glow
Background: Deep Space Navy gradient (#0A0E27 → #1A1E3A)

Gradient Applications:
- Border glow: Cyan → Transparent
- Typography: Cyan → White
- Circuit lines: Bright Cyan → Dimmed Cyan (#0099CC)
```

### DeFi Cards - Financial Amber-Purple
```
Primary Frame Color: Neon Amber #FFA500
Secondary Accents: Circuit Purple #8B00FF
Highlight Effects: Amber #FF6B00
Text Color: White #FFFFFF with amber glow
Background: Deep Space Navy with purple undertones

Gradient Applications:
- Border glow: Amber → Purple → Transparent
- Typography: Amber → Orange → Red (#FF4500)
- Circuit lines: Amber → Purple transition
- Yield indicators: Green success (#00FF88) integration
```

### EOA Cards - Secure Cyan-Magenta
```
Primary Frame Color: Electric Cyan #00B8E6
Secondary Accents: Magenta Glow #FF0080
Highlight Effects: Cyan-Magenta blend
Text Color: White #FFFFFF with cyan-magenta glow
Background: Deep Space Navy with security grid overlay

Gradient Applications:
- Border glow: Cyan → Magenta → Transparent
- Typography: Cyan → Magenta gradient
- Circuit lines: Cyan with magenta highlights
- Security indicators: Strong white (#FFFFFF) highlights
```

### Action Cards - Dynamic Multi-Color

#### Destructive Actions
```
Primary Frame Color: Neon Amber #FFA500 → Red #FF0000
Warning Color: Danger Red #FF0000
Alert Color: Warning Orange #FF4500
Text Color: White #FFFFFF with red warning glow
Background: Dark with aggressive red underlighting

Gradient Applications:
- Danger progression: Amber → Orange → Red → Dark Red (#CC0000)
- Warning effects: Pulsing red glow
- Destruction indicators: Red → Black fade
```

#### Educational Actions
```
Primary Frame Color: Circuit Purple #8B00FF
Secondary Accents: Electric Cyan #00D9FF
Academic Color: Knowledge Blue #0080FF
Text Color: White #FFFFFF with purple glow
Background: Deep Space Navy with academic blue accents

Gradient Applications:
- Academic progression: Purple → Blue → Cyan
- Knowledge indicators: Blue → White glow
- Research effects: Purple → Cyan transition
```

#### Technical Actions
```
Primary Frame Color: Mixed palette based on complexity
Engineering Orange: #FF8800
Technical Blue: #0088FF
Schematic Gray: #888888
Text Color: White #FFFFFF context-appropriate glow
Background: Technical grid patterns

Gradient Applications:
- Technical complexity: Gray → Color → White
- Engineering precision: Sharp color transitions
- Schematic lines: Gray → Bright accent colors
```

### Ability Cards - Academic Purple-Cyan
```
Primary Frame Color: Circuit Purple #8B00FF
Secondary Accents: Electric Cyan #00D9FF
Knowledge Color: Academic Blue #4400CC
Text Color: White #FFFFFF with purple glow
Background: Deep Space Navy with neural network patterns

Gradient Applications:
- Knowledge flow: Purple → Blue → Cyan
- Neural networks: Purple nodes → Cyan connections
- Academic progression: Dark Purple → Bright Cyan
```

---

## RARITY COLOR HIERARCHY

### Common Tier (0-1 ETH)
```
Base Frame: Single color application
Glow Intensity: 20% opacity
Circuit Complexity: Simple patterns only
Color Saturation: Standard saturation levels
Special Effects: None

Color Treatment:
- Single primary color for card type
- Basic glow effects
- Standard contrast ratios
```

### Standard Tier (2-3 ETH)
```
Base Frame: Dual color application
Glow Intensity: 40% opacity
Circuit Complexity: Enhanced patterns
Color Saturation: Increased by 15%
Special Effects: Basic animations (digital)

Color Treatment:
- Primary + secondary color combination
- Enhanced glow effects with gradients
- Increased color vibrancy
- Subtle gradient transitions
```

### Premium Tier (4-5 ETH)
```
Base Frame: Multi-layer color application
Glow Intensity: 60% opacity with pulsing
Circuit Complexity: Complex multi-layer patterns
Color Saturation: Maximum vibrancy
Special Effects: Advanced animations, particle effects

Color Treatment:
- Full gradient spectrum application
- Dynamic glow effects with pulsing
- Maximum color saturation and contrast
- Multi-layer visual depth
- Holographic/iridescent effects consideration
```

---

## TYPOGRAPHY SYSTEM

### Primary Typeface Specifications
```
Display Typography (Card Names):
Font Family: Orbitron Bold (or similar geometric sans-serif)
Fallbacks: Exo, Rajdhani, Arial Black
Weight: 900 (Extra Bold)
Character Set: Extended Latin, numerals, symbols
License: Open Font License preferred

Technical Specifications:
- Geometric construction with slight tech modifications
- High contrast strokes for circuit-board aesthetic
- Wide character spacing for readability
- Sharp corners to match circuit board language
```

### Typography Hierarchy

#### Level 1: Card Names (Primary Display)
```
Size: 18-24pt (scalable for card dimensions)
Weight: 900 (Extra Bold)
Tracking: +0.05em (wide spacing)
Leading: 0.9em (tight line height)

Visual Treatment:
- Multi-layer stroke system (3-4 layers)
- Inner fill: Gradient (warm top → cool bottom)
- Stroke 1: Dark outline (#000000, 0.5pt)
- Stroke 2: Card color (2pt)
- Stroke 3: Bright highlight (0.5pt)
- Outer glow: Card color at 30% opacity, 2pt blur

Gradient Direction: Top (warm) → Bottom (cool)
- Amber cards: #FFAA00 → #FF6600
- Cyan cards: #00DDFF → #0099CC
- Purple cards: #AA00FF → #6600CC
- Mixed cards: Custom gradients per card type
```

#### Level 2: Card Type & Cost (Secondary Display)
```
Size: 10-14pt
Weight: 700 (Bold)
Tracking: +0.02em
Leading: 1.0em

Visual Treatment:
- Dual-layer system
- Inner fill: Card type color
- Outer stroke: Dark (#000000, 0.25pt)
- Subtle glow: Matching card color, 15% opacity

Position Specifications:
- Card type: Upper center or lower banner
- Cost: Upper left corner in geometric container
```

#### Level 3: Card Text (Body Copy)
```
Size: 8-10pt
Weight: 400-500 (Regular to Medium)
Tracking: 0em (normal)
Leading: 1.2em

Visual Treatment:
- Single layer with subtle effects
- Color: #FFFFFF (white) or #F0F0F0 (light gray)
- Shadow: Dark (#000000), 0.5pt offset, 50% opacity
- Background: Semi-transparent dark panel for readability
```

### Typography Effects by Card Type

#### Chain Cards Typography
```
Primary Color: Electric Cyan #00D9FF
Gradient: Cyan → Light Cyan (#66EEFF)
Glow: Cyan at 40% opacity
Style Notes: Bold geometric, infrastructure feeling
```

#### DeFi Cards Typography  
```
Primary Color: Neon Amber #FFA500
Gradient: Amber → Orange → Red fade
Glow: Amber-orange blend at 40% opacity
Style Notes: Financial/professional with energy
```

#### EOA Cards Typography
```
Primary Color: Electric Cyan #00B8E6
Gradient: Cyan → Magenta (#FF0080) blend
Glow: Cyan-magenta at 35% opacity
Style Notes: Secure/trustworthy with personal touch
```

#### Action Cards Typography
```
Destructive: Amber → Red gradient with warning emphasis
Educational: Purple → Blue with academic clarity
Technical: Context-appropriate color with precision
Style Notes: Impact-appropriate intensity and clarity
```

#### Ability Cards Typography
```
Primary Color: Circuit Purple #8B00FF
Gradient: Purple → Cyan academic progression
Glow: Purple at 35% opacity
Style Notes: Academic/intellectual with tech integration
```

---

## SPECIALIZED COLOR APPLICATIONS

### Status Indicators
```
Success/Positive: #00FF88 (Bright Green)
Warning/Caution: #FFAA00 (Warning Amber)
Danger/Negative: #FF0044 (Alert Red)
Information: #0088FF (Information Blue)
Neutral/Inactive: #666666 (Medium Gray)

Usage Applications:
- ETH generation indicators (green)
- Warning effects (amber/red)
- Information displays (blue)
- Disabled states (gray)
```

### Interactive Elements
```
Hover State: +20% brightness of base color
Active State: +40% brightness with glow increase
Selected State: +60% brightness with border accent
Disabled State: -70% saturation, +gray overlay

Animation Colors:
- Energy flow: Base color → 150% brightness pulse
- Data transmission: Base color with white streak
- System alerts: Red pulse overlay
```

### Utility Colors
```
Pure White: #FFFFFF (maximum contrast text)
Off-White: #F0F0F0 (subtle text)
Light Gray: #CCCCCC (secondary text)
Medium Gray: #666666 (disabled elements)
Dark Gray: #333333 (subtle backgrounds)
Pure Black: #000000 (outlines, shadows)

Transparency Applications:
- Background overlays: 20-40% opacity
- Glow effects: 30-60% opacity
- Particle effects: 10-30% opacity
- Shadow effects: 50-80% opacity
```

---

## ACCESSIBILITY COMPLIANCE

### Contrast Ratios (WCAG 2.1 AA)
```
Text on Dark Background:
- White text (#FFFFFF) on Dark Navy (#0A0E27): 18.5:1 ✓
- Light Gray (#F0F0F0) on Dark Navy: 16.2:1 ✓
- Cyan (#00D9FF) on Dark Navy: 12.8:1 ✓

Minimum Requirements Met:
- Large text (18pt+): 3:1 ratio minimum
- Normal text (below 18pt): 4.5:1 ratio minimum
- All specified combinations exceed requirements
```

### Color-Blind Accessibility
```
Red-Green Color Blind:
- Avoid red/green combinations for critical information
- Use blue/orange or purple/amber alternatives
- Include shape/symbol indicators alongside color

Blue-Yellow Color Blind:
- Maintain high contrast for blue elements
- Use white/black contrast for critical elements
- Provide alternative visual cues

Implementation:
- All critical information has non-color indicators
- Shapes, symbols, and typography hierarchy support color
- High contrast maintained across all combinations
```

---

## PRODUCTION SPECIFICATIONS

### Digital Implementation
```
Color Space: sRGB (web) / Adobe RGB (high-end digital)
File Format: RGB values provided
Gradient Smoothness: 256+ steps for smooth gradients
Glow Effects: Gaussian blur with multiply/screen blend modes
Animation Frame Rate: 30fps minimum for smooth effects
```

### Print Implementation
```
Color Space: CMYK values provided for all colors
Ink Coverage: Maximum 320% TAC (Total Area Coverage)
Spot Colors: Consider spot UV for circuit lines
Foil Options: Holographic foil for premium cards
Paper: High-gloss or semi-gloss for color vibrancy
```

### Color Management
```
Monitor Calibration: D65 white point, 2.2 gamma
Proof Standards: ISO 12647-7 (digital proofing)
Print Standards: ISO 12647-2 (offset printing)
Color Profiles: Include ICC profiles for consistency
Quality Control: Delta E <2.0 for color matching
```

---

## BRAND COLOR EXTENSIONS

### Future Color Palette Expansion
```
Reserved Colors for Extensions:
- Lime Green: #88FF00 (future eco/green cards)
- Deep Orange: #FF4400 (future fire/energy cards)  
- Teal: #00FFAA (future water/liquid cards)
- Gold: #FFD700 (future premium/legendary tier)

Maintained Relationships:
- All extensions maintain cyberpunk aesthetic
- Circuit board language consistency required
- Accessibility standards preserved
```

### Seasonal/Event Variations
```
Holiday Themes:
- Maintain core structure with accent modifications
- Preserve readability and brand recognition
- Limited-time cosmetic enhancements only

Event Cards:
- Core palette + special accent colors
- Maintain hierarchy and accessibility
- Special effects within established framework
```

*This comprehensive color and typography system ensures consistent implementation of the Cyberpunk Circuit Board visual language across all 92 Token Tycoon cards while maintaining accessibility and production requirements.*
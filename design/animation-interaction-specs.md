# Token Tycoon v2.0 - Advanced Animation & Interaction Specifications
## Technical Implementation Guide for Motion Design

*This document provides detailed technical specifications for implementing advanced animations and interactive elements in the v2.0 Token Tycoon design system.*

---

## ANIMATION SYSTEM ARCHITECTURE

### Core Animation Principles
1. **Performance First** - 60fps target with graceful degradation
2. **Meaningful Motion** - Every animation serves gameplay or feedback purpose
3. **Consistent Language** - Unified motion vocabulary across all elements
4. **Accessibility Support** - Reduced motion options and alternatives
5. **Platform Optimization** - Tailored implementation for web, mobile, print

### Animation Hierarchy
```
Level 1: Essential Feedback (Always Active)
- Card selection confirmation
- Action execution feedback
- Error state indication
- Success confirmation

Level 2: Enhanced Experience (Standard Settings)  
- Hover state transitions
- Card state changes
- Yield generation animations
- Circuit energy flow

Level 3: Immersive Details (High Performance Mode)
- Particle systems
- Complex multi-layer animations
- Environmental effects
- Advanced visual storytelling
```

---

## CORE ANIMATION SPECIFICATIONS

### Energy Flow System (Circuit Animation)

#### Primary Energy Flow Animation
```css
/* Base energy flow for all cards */
.circuit-energy-flow {
  animation-name: energyPulse;
  animation-duration: 3s;
  animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
  animation-iteration-count: infinite;
  animation-direction: normal;
}

@keyframes energyPulse {
  0% {
    opacity: 0.3;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1.0;
    transform: translateX(0%);
  }
  100% {
    opacity: 0.3;
    transform: translateX(100%);
  }
}

/* Rarity-based variations */
.energy-flow-premium {
  animation-duration: 2s; /* Faster for premium cards */
  filter: blur(0px) drop-shadow(0 0 4px currentColor);
}

.energy-flow-legendary {
  animation-duration: 1.5s;
  filter: blur(0px) drop-shadow(0 0 8px currentColor);
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### Particle System Specifications
```javascript
// Particle system configuration by rarity tier
const particleConfig = {
  common: {
    particleCount: 3,
    particleSize: 2,
    particleSpeed: 1.0,
    particleLifetime: 3000,
    emissionRate: 0.5
  },
  standard: {
    particleCount: 8,
    particleSize: 3,
    particleSpeed: 1.2,
    particleLifetime: 2500,
    emissionRate: 1.0
  },
  premium: {
    particleCount: 15,
    particleSize: 4,
    particleSpeed: 1.5,
    particleLifetime: 2000,
    emissionRate: 1.8
  }
};

// Particle rendering loop
class CircuitParticle {
  constructor(config) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: config.particleSpeed, y: 0 };
    this.life = config.particleLifetime;
    this.size = config.particleSize;
    this.opacity = 1.0;
  }
  
  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.life -= deltaTime;
    this.opacity = Math.max(0, this.life / this.maxLife);
  }
  
  render(ctx) {
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
```

### Card State Transition System

#### State Change Animation Framework
```css
/* Card state base class */
.card {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-origin: center center;
  will-change: transform, filter, opacity;
}

/* Inactive → Active transition */
.card.inactive {
  filter: brightness(0.7) saturate(0.8);
  transform: scale(1.0);
}

.card.active {
  filter: brightness(1.2) saturate(1.1);
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 217, 255, 0.3);
}

/* Active → Triggered transition */
.card.triggered {
  animation: triggerFlash 0.5s ease-out;
  filter: brightness(1.5) saturate(1.3);
  transform: scale(1.05);
}

@keyframes triggerFlash {
  0% { filter: brightness(1.2); }
  50% { filter: brightness(2.0); }
  100% { filter: brightness(1.5); }
}

/* Triggered → Exhausted transition */
.card.exhausted {
  filter: brightness(0.5) saturate(0.4) grayscale(0.3);
  transform: scale(0.98);
  transition: all 1.0s ease-out;
}
```

#### Interactive Feedback Specifications
```javascript
// Hover interaction system
class CardInteractionHandler {
  constructor(cardElement) {
    this.card = cardElement;
    this.isHovered = false;
    this.animationFrame = null;
    
    this.setupEventListeners();
  }
  
  onMouseEnter() {
    this.isHovered = true;
    this.card.classList.add('hovered');
    
    // Enhance circuit animation speed
    const energyElements = this.card.querySelectorAll('.circuit-energy-flow');
    energyElements.forEach(el => {
      el.style.animationDuration = '1.5s'; // Speed up
    });
    
    // Add particle burst effect
    this.triggerParticleBurst();
  }
  
  onMouseLeave() {
    this.isHovered = false;
    this.card.classList.remove('hovered');
    
    // Reset circuit animation speed
    const energyElements = this.card.querySelectorAll('.circuit-energy-flow');
    energyElements.forEach(el => {
      el.style.animationDuration = '3s'; // Reset to normal
    });
  }
  
  triggerParticleBurst() {
    // Create temporary particle effect on hover
    const burst = new ParticleBurst(this.card, {
      particleCount: 5,
      duration: 800,
      color: this.card.dataset.primaryColor
    });
    burst.start();
  }
}
```

---

## CARD TYPE SPECIFIC ANIMATIONS

### Chain Card Animations

#### Network Activity Visualization
```css
/* Network node pulsing */
.chain-card .network-node {
  animation: networkPulse 4s ease-in-out infinite;
}

@keyframes networkPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1.0);
  }
  50% {
    opacity: 1.0;
    transform: scale(1.2);
  }
}

/* Data flow between nodes */
.chain-card .data-connection {
  stroke-dasharray: 10, 5;
  animation: dataFlow 2s linear infinite;
}

@keyframes dataFlow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 15;
  }
}
```

#### Ethereum Mainnet Specific Animation
```javascript
// Complex network visualization for premium chain cards
class EthereumNetworkAnimation {
  constructor(container) {
    this.container = container;
    this.nodes = this.generateValidatorNodes(21); // 21 validator nodes
    this.connections = this.generateConnections();
    this.blockProduction = new BlockProductionVisualization();
  }
  
  generateValidatorNodes(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: this.calculateNodePosition(i, count),
      activity: Math.random(),
      stakeAmount: 32 + Math.random() * 100
    }));
  }
  
  animate() {
    // Simulate validator activity
    this.nodes.forEach(node => {
      node.activity = Math.max(0.1, node.activity + (Math.random() - 0.5) * 0.1);
    });
    
    // Animate block production
    this.blockProduction.update();
    
    // Render network state
    this.render();
    
    requestAnimationFrame(() => this.animate());
  }
}
```

### DeFi Card Animations

#### Liquidity Pool Visualization
```css
/* AMM pool animation for Uniswap-style cards */
.defi-card .liquidity-pool {
  position: relative;
  overflow: hidden;
}

.defi-card .liquidity-level {
  animation: liquidityFlow 6s ease-in-out infinite;
  background: linear-gradient(45deg, #FFA500, #FF6B00);
}

@keyframes liquidityFlow {
  0%, 100% {
    transform: scaleY(0.8);
  }
  50% {
    transform: scaleY(1.1);
  }
}

/* Swap animation */
.defi-card .swap-arrow {
  animation: swapPulse 3s ease-in-out infinite;
}

@keyframes swapPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1.0);
  }
  50% {
    opacity: 1.0;
    transform: scale(1.3);
  }
}
```

#### Yield Generation Animation
```javascript
// Yield accumulation visualization
class YieldGenerationAnimation {
  constructor(cardElement, yieldRate) {
    this.card = cardElement;
    this.yieldRate = yieldRate; // ETH per second
    this.accumulatedYield = 0;
    this.lastUpdate = Date.now();
    
    this.setupYieldVisualization();
  }
  
  update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    
    // Calculate yield accumulation
    const yieldIncrease = this.yieldRate * deltaTime;
    this.accumulatedYield += yieldIncrease;
    
    // Create yield particles
    if (yieldIncrease > 0.001) {
      this.createYieldParticle(yieldIncrease);
    }
    
    // Update display
    this.updateYieldDisplay();
    this.lastUpdate = now;
  }
  
  createYieldParticle(amount) {
    const particle = document.createElement('div');
    particle.className = 'yield-particle';
    particle.textContent = `+${amount.toFixed(3)} ETH`;
    
    // Animate particle from yield source to storage
    const animation = particle.animate([
      { transform: 'translateY(0px) scale(0.8)', opacity: 0 },
      { transform: 'translateY(-30px) scale(1.0)', opacity: 1 },
      { transform: 'translateY(-60px) scale(0.8)', opacity: 0 }
    ], {
      duration: 2000,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });
    
    animation.onfinish = () => particle.remove();
    this.card.appendChild(particle);
  }
}
```

### EOA Card Animations

#### Security Visualization
```css
/* Multi-signature authorization animation */
.eoa-card .signature-progress {
  animation: authorizationProgress 2s ease-in-out;
}

@keyframes authorizationProgress {
  0% {
    width: 0%;
    background-color: #ff6b00;
  }
  50% {
    background-color: #ffa500;
  }
  100% {
    width: 100%;
    background-color: #00ff88;
  }
}

/* Vault security shield animation */
.eoa-card .security-shield {
  animation: shieldPulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 184, 230, 0.5));
}

@keyframes shieldPulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1.0);
  }
  50% {
    opacity: 1.0;
    transform: scale(1.05);
  }
}
```

#### Storage Animation System
```javascript
// ETH storage visualization with capacity management
class StorageAnimation {
  constructor(vaultElement, maxCapacity) {
    this.vault = vaultElement;
    this.maxCapacity = maxCapacity;
    this.currentAmount = 0;
    this.fillElement = this.vault.querySelector('.fill-level');
  }
  
  depositETH(amount) {
    const targetAmount = Math.min(this.currentAmount + amount, this.maxCapacity);
    const depositAnimation = {
      duration: 1500,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    };
    
    // Animate ETH particles flowing into vault
    this.createDepositParticles(amount);
    
    // Animate fill level increase
    const fillPercentage = (targetAmount / this.maxCapacity) * 100;
    this.fillElement.animate([
      { height: `${(this.currentAmount / this.maxCapacity) * 100}%` },
      { height: `${fillPercentage}%` }
    ], depositAnimation);
    
    this.currentAmount = targetAmount;
    
    // Trigger capacity warning if near limit
    if (this.currentAmount / this.maxCapacity > 0.9) {
      this.showCapacityWarning();
    }
  }
  
  withdrawETH(amount) {
    const targetAmount = Math.max(this.currentAmount - amount, 0);
    
    // Create withdraw particle effect
    this.createWithdrawParticles(amount);
    
    // Animate fill level decrease
    const fillPercentage = (targetAmount / this.maxCapacity) * 100;
    this.fillElement.style.height = `${fillPercentage}%`;
    
    this.currentAmount = targetAmount;
  }
}
```

### Action Card Animations

#### Destruction Effects
```css
/* Explosive destruction animation */
.action-card.destructive .destruction-effect {
  animation: explosionEffect 1s ease-out;
}

@keyframes explosionEffect {
  0% {
    transform: scale(1.0);
    opacity: 1.0;
    filter: brightness(1.0);
  }
  30% {
    transform: scale(1.2);
    opacity: 0.8;
    filter: brightness(2.0);
  }
  70% {
    transform: scale(2.0);
    opacity: 0.3;
    filter: brightness(0.5);
  }
  100% {
    transform: scale(3.0);
    opacity: 0;
    filter: brightness(0.1);
  }
}

/* Warning pulse for aggressive actions */
.action-card.destructive {
  animation: warningPulse 1.5s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
  }
}
```

#### Educational Action Animations
```css
/* Knowledge acquisition animation */
.action-card.educational .knowledge-effect {
  animation: knowledgeGain 2s ease-out;
}

@keyframes knowledgeGain {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  50% {
    opacity: 1.0;
    transform: scale(1.1) translateY(-10px);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.0) translateY(0px);
  }
}
```

### Ability Card Animations

#### Academic Network Visualization
```css
/* Neural network learning animation */
.ability-card .neural-network {
  animation: neuralActivity 5s ease-in-out infinite;
}

@keyframes neuralActivity {
  0%, 100% {
    opacity: 0.6;
  }
  25% {
    opacity: 1.0;
  }
  75% {
    opacity: 0.8;
  }
}

/* Conference networking animation */
.ability-card .conference-network {
  animation: networkBuilding 4s ease-in-out infinite;
}

@keyframes networkBuilding {
  0% {
    stroke-dasharray: 0, 100;
  }
  50% {
    stroke-dasharray: 50, 50;
  }
  100% {
    stroke-dasharray: 100, 0;
  }
}
```

---

## SPECIALIZED ANIMATION SYSTEMS

### Countdown Timer Animation
```javascript
class CountdownAnimation {
  constructor(timerElement, totalTurns) {
    this.timer = timerElement;
    this.totalTurns = totalTurns;
    this.remainingTurns = totalTurns;
    this.urgencyThresholds = {
      caution: totalTurns * 0.5,
      warning: totalTurns * 0.25,
      critical: 1
    };
  }
  
  updateCountdown(turnsRemaining) {
    this.remainingTurns = turnsRemaining;
    
    // Update numerical display
    this.timer.querySelector('.turn-count').textContent = turnsRemaining;
    
    // Update color based on urgency
    const urgencyLevel = this.getUrgencyLevel();
    this.timer.className = `countdown-timer ${urgencyLevel}`;
    
    // Animate progress circle
    const progressPercentage = (turnsRemaining / this.totalTurns) * 100;
    const progressCircle = this.timer.querySelector('.progress-circle');
    
    progressCircle.animate([
      { strokeDashoffset: progressCircle.style.strokeDashoffset || '0' },
      { strokeDashoffset: `${100 - progressPercentage}` }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      fill: 'forwards'
    });
    
    // Add urgency pulse for critical state
    if (urgencyLevel === 'critical') {
      this.addCriticalPulse();
    }
  }
  
  getUrgencyLevel() {
    if (this.remainingTurns <= this.urgencyThresholds.critical) return 'critical';
    if (this.remainingTurns <= this.urgencyThresholds.warning) return 'warning';
    if (this.remainingTurns <= this.urgencyThresholds.caution) return 'caution';
    return 'normal';
  }
}
```

### Network Effect Visualization
```javascript
class NetworkEffectAnimation {
  constructor(sourceCard, connectedCards) {
    this.source = sourceCard;
    this.connected = connectedCards;
    this.connectionLines = [];
    
    this.setupConnectionVisualization();
  }
  
  showNetworkEffect() {
    // Highlight source card
    this.source.classList.add('network-source');
    
    // Create connection lines to related cards
    this.connected.forEach((card, index) => {
      setTimeout(() => {
        this.createConnectionLine(this.source, card);
        card.classList.add('network-connected');
      }, index * 200); // Stagger the connections
    });
    
    // Show network effect benefits
    setTimeout(() => {
      this.showBenefitAnimation();
    }, this.connected.length * 200 + 500);
  }
  
  createConnectionLine(from, to) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    
    line.setAttribute('x1', fromRect.left + fromRect.width / 2);
    line.setAttribute('y1', fromRect.top + fromRect.height / 2);
    line.setAttribute('x2', toRect.left + toRect.width / 2);
    line.setAttribute('y2', toRect.top + toRect.height / 2);
    line.setAttribute('stroke', '#00D9FF');
    line.setAttribute('stroke-width', '2');
    line.classList.add('network-connection');
    
    // Animate line drawing
    const length = Math.sqrt(
      Math.pow(toRect.left - fromRect.left, 2) + 
      Math.pow(toRect.top - fromRect.top, 2)
    );
    
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    
    document.body.appendChild(line);
    this.connectionLines.push(line);
    
    line.animate([
      { strokeDashoffset: length },
      { strokeDashoffset: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });
  }
}
```

---

## PERFORMANCE OPTIMIZATION

### Animation Performance Guidelines
```javascript
// Performance monitoring and optimization
class AnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.performanceMode = this.detectPerformanceMode();
    this.frameRate = 60;
    this.lastFrameTime = 0;
  }
  
  detectPerformanceMode() {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    
    if (hardwareConcurrency >= 8 && memory >= 8) return 'high';
    if (hardwareConcurrency >= 4 && memory >= 4) return 'medium';
    return 'low';
  }
  
  registerAnimation(animation) {
    this.activeAnimations.add(animation);
    
    // Limit concurrent animations based on performance mode
    const maxConcurrent = {
      high: 20,
      medium: 12,
      low: 6
    };
    
    if (this.activeAnimations.size > maxConcurrent[this.performanceMode]) {
      this.cullOldestAnimations();
    }
  }
  
  cullOldestAnimations() {
    const animationsArray = Array.from(this.activeAnimations);
    const toCull = animationsArray.slice(0, 5); // Remove oldest 5
    toCull.forEach(animation => {
      animation.cancel();
      this.activeAnimations.delete(animation);
    });
  }
}
```

### Battery-Conscious Animation
```css
/* Reduced motion media query support */
@media (prefers-reduced-motion: reduce) {
  .circuit-energy-flow {
    animation: none;
  }
  
  .card {
    transition-duration: 0.1s;
  }
  
  .particle-effect {
    display: none;
  }
}

/* Power-saving mode adjustments */
.power-save-mode .circuit-energy-flow {
  animation-duration: 6s; /* Slower animations */
}

.power-save-mode .particle-system {
  --particle-count: 2; /* Fewer particles */
}
```

---

## CROSS-PLATFORM IMPLEMENTATION

### Web Implementation (CSS + JavaScript)
```javascript
// Web-specific animation optimizations
class WebAnimationImplementation {
  constructor() {
    this.supportsWebGL = this.checkWebGLSupport();
    this.supportsCanvasFilters = this.checkCanvasFilterSupport();
  }
  
  createOptimizedAnimation(element, keyframes, options) {
    // Use Web Animations API when available
    if (element.animate) {
      return element.animate(keyframes, options);
    }
    
    // Fallback to CSS transitions
    return this.createCSSAnimation(element, keyframes, options);
  }
  
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }
}
```

### Mobile Implementation Considerations
```javascript
// Mobile-optimized animation settings
const mobileAnimationConfig = {
  // Reduced particle counts for mobile
  particleCountMultiplier: 0.6,
  
  // Shorter animation durations
  durationMultiplier: 0.8,
  
  // Simplified easing functions
  easing: 'ease-out', // Instead of complex cubic-bezier
  
  // Touch-optimized feedback
  touchFeedbackDuration: 100,
  
  // Battery-conscious defaults
  maxConcurrentAnimations: 8
};
```

### Print Animation Alternatives
```css
/* Print-friendly static representations of animations */
@media print {
  .circuit-energy-flow::after {
    content: "→→→"; /* Static flow indicators */
    position: absolute;
    right: 10px;
    color: currentColor;
  }
  
  .yield-animation::before {
    content: "+" attr(data-yield-rate) " ETH/turn";
    font-weight: bold;
  }
  
  .countdown-timer::after {
    content: attr(data-turns-remaining) " turns remaining";
  }
}
```

---

## ACCESSIBILITY & INCLUSION

### Motion Sensitivity Support
```javascript
// Respect user motion preferences
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

class AccessibleAnimationManager {
  constructor() {
    this.reducedMotion = motionPreference.matches;
    motionPreference.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.updateAnimationSettings();
    });
  }
  
  updateAnimationSettings() {
    if (this.reducedMotion) {
      // Disable non-essential animations
      document.documentElement.classList.add('reduced-motion');
      
      // Replace animations with instant state changes
      this.replaceAnimationsWithInstantFeedback();
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }
  
  createAccessibleAnimation(element, config) {
    if (this.reducedMotion) {
      // Provide instant visual feedback instead of animation
      return this.createInstantFeedback(element, config);
    }
    
    return this.createStandardAnimation(element, config);
  }
}
```

### Alternative Feedback Systems
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .card-border {
    border-width: 3px;
    border-style: solid;
  }
  
  .circuit-energy-flow {
    filter: contrast(2.0);
  }
}

/* Large text mode support */
@media (min-resolution: 2dppx) {
  .card-text {
    font-size: 110%;
    line-height: 1.4;
  }
}
```

---

## QUALITY ASSURANCE & TESTING

### Animation Testing Framework
```javascript
class AnimationTestSuite {
  async testPerformance() {
    const testCard = this.createTestCard();
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 16.67) { // 60fps threshold
          console.warn(`Animation frame took ${entry.duration}ms`);
        }
      });
    });
    
    performanceObserver.observe({ entryTypes: ['measure'] });
    
    // Run animation performance test
    await this.runAnimationSequence(testCard);
  }
  
  testAccessibility() {
    // Test reduced motion compliance
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Verify animations respect user preferences
    this.verifyMotionPreferences(reducedMotionQuery);
    
    // Test color contrast requirements
    this.testColorContrast();
    
    // Verify keyboard navigation
    this.testKeyboardNavigation();
  }
}
```

### Performance Metrics
```javascript
const performanceTargets = {
  frameRate: 60, // FPS
  animationDuration: {
    feedback: 200, // ms
    transition: 300, // ms
    showcase: 2000 // ms
  },
  memoryUsage: {
    particles: '< 10MB',
    animations: '< 5MB'
  },
  batteryImpact: 'minimal' // < 5% battery drain per hour
};
```

*This comprehensive animation and interaction specification provides the technical foundation for implementing the v2.0 Token Tycoon visual experience with optimal performance, accessibility, and cross-platform compatibility.*
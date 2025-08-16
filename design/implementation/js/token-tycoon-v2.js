/**
 * Token Tycoon v2.0 - Core JavaScript Framework
 * Cyberpunk Circuit Board Implementation
 * 
 * Main application logic, card management, and interaction handling
 */

class TokenTycoonV2 {
    constructor() {
        this.cards = new Map();
        this.particleSystems = new Map();
        this.animationManager = new AnimationManager();
        this.interactionHandler = new InteractionHandler();
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Token Tycoon v2.0 - Cyberpunk Circuit Board System Loading...');
        
        // Initialize systems
        this.setupEventListeners();
        this.initializeCards();
        this.startAnimationLoop();
        this.setupPerformanceMonitoring();
        
        // Check for reduced motion preference
        this.handleMotionPreferences();
        
        console.log('✅ Token Tycoon v2.0 System Ready');
    }
    
    setupEventListeners() {
        // Card interaction events
        document.addEventListener('mouseover', this.handleCardHover.bind(this));
        document.addEventListener('mouseout', this.handleCardUnhover.bind(this));
        document.addEventListener('click', this.handleCardClick.bind(this));
        
        // Performance and accessibility events
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Reduced motion media query
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', this.handleMotionPreferences.bind(this));
    }
    
    initializeCards() {
        const cardElements = document.querySelectorAll('.card');
        
        cardElements.forEach((cardElement, index) => {
            const cardData = this.extractCardData(cardElement);
            const card = new Card(cardElement, cardData);
            
            this.cards.set(cardElement.id || `card-${index}`, card);
            
            // Initialize particle system for premium cards
            if (cardData.tier === 'premium' || cardData.tier === 'legendary') {
                const particleSystem = new ParticleSystem(cardElement, cardData.type);
                this.particleSystems.set(card.id, particleSystem);
            }
        });
        
        console.log(`📋 Initialized ${this.cards.size} cards`);
    }
    
    extractCardData(element) {
        return {
            name: element.dataset.cardName || 'Unknown Card',
            cost: parseInt(element.dataset.cost) || 0,
            type: element.dataset.type || 'unknown',
            tier: this.determineTier(element),
            element: element
        };
    }
    
    determineTier(element) {
        if (element.classList.contains('legendary-tier')) return 'legendary';
        if (element.classList.contains('premium-tier')) return 'premium';
        if (element.classList.contains('standard-tier')) return 'standard';
        if (element.classList.contains('common-tier')) return 'common';
        return 'basic';
    }
    
    handleCardHover(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        
        const cardId = cardElement.id || Array.from(this.cards.keys()).find(key => 
            this.cards.get(key).element === cardElement
        );
        
        const card = this.cards.get(cardId);
        if (card) {
            card.onHover();
            
            // Activate particle system if available
            const particleSystem = this.particleSystems.get(cardId);
            if (particleSystem) {
                particleSystem.intensify();
            }
        }
    }
    
    handleCardUnhover(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        
        const cardId = cardElement.id || Array.from(this.cards.keys()).find(key => 
            this.cards.get(key).element === cardElement
        );
        
        const card = this.cards.get(cardId);
        if (card) {
            card.onUnhover();
            
            // Reset particle system if available
            const particleSystem = this.particleSystems.get(cardId);
            if (particleSystem) {
                particleSystem.normalize();
            }
        }
    }
    
    handleCardClick(event) {
        const cardElement = event.target.closest('.card');
        if (!cardElement) return;
        
        event.preventDefault();
        
        const cardId = cardElement.id || Array.from(this.cards.keys()).find(key => 
            this.cards.get(key).element === cardElement
        );
        
        const card = this.cards.get(cardId);
        if (card) {
            card.onClick();
            this.showCardDetails(card);
        }
    }
    
    showCardDetails(card) {
        // Create modal or detail view
        console.log(`🎴 Card selected: ${card.name} (${card.type})`);
        
        // Example: Could expand into full card detail modal
        const detailsModal = this.createCardDetailsModal(card);
        document.body.appendChild(detailsModal);
        
        // Auto-remove after 3 seconds for demo
        setTimeout(() => {
            detailsModal.remove();
        }, 3000);
    }
    
    createCardDetailsModal(card) {
        const modal = document.createElement('div');
        modal.className = 'card-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--color-navy-deep), var(--color-navy-light));
            border: 2px solid var(--color-cyan-electric);
            border-radius: 12px;
            padding: 1rem;
            color: var(--color-text-primary);
            font-family: var(--font-primary);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        modal.innerHTML = `
            <h3 style="color: var(--color-cyan-electric); margin-bottom: 0.5rem;">
                ${card.name}
            </h3>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                <strong>Type:</strong> ${card.type}
            </p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                <strong>Cost:</strong> ${card.cost} ETH
            </p>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                <strong>Tier:</strong> ${card.tier}
            </p>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.8;">
                Click to interact with cards
            </div>
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    }
    
    startAnimationLoop() {
        this.animationManager.start();
        
        // Update particle systems
        const updateParticles = () => {
            this.particleSystems.forEach(system => {
                system.update();
            });
            requestAnimationFrame(updateParticles);
        };
        updateParticles();
    }
    
    handleResize() {
        // Adjust card layouts and particle systems for new viewport
        this.particleSystems.forEach(system => {
            system.handleResize();
        });
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            this.animationManager.pause();
            this.particleSystems.forEach(system => system.pause());
        } else {
            // Resume animations when tab becomes visible
            this.animationManager.resume();
            this.particleSystems.forEach(system => system.resume());
        }
    }
    
    handleMotionPreferences() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (reducedMotion) {
            console.log('🔇 Reduced motion preference detected - disabling complex animations');
            document.documentElement.classList.add('reduced-motion');
            
            // Disable particle systems
            this.particleSystems.forEach(system => system.disable());
            
            // Reduce animation complexity
            this.animationManager.setReducedMotion(true);
        } else {
            document.documentElement.classList.remove('reduced-motion');
            this.particleSystems.forEach(system => system.enable());
            this.animationManager.setReducedMotion(false);
        }
    }
    
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measurePerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Adjust quality based on performance
                if (fps < 30) {
                    console.log(`⚠️ Low FPS detected (${fps}fps) - reducing quality`);
                    this.reducedQualityMode();
                } else if (fps > 55) {
                    console.log(`✅ High FPS detected (${fps}fps) - enabling enhanced quality`);
                    this.enhancedQualityMode();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measurePerformance);
        };
        
        measurePerformance();
    }
    
    reducedQualityMode() {
        // Reduce particle count and animation complexity
        this.particleSystems.forEach(system => {
            system.setQuality('low');
        });
        
        document.documentElement.classList.add('performance-mode');
    }
    
    enhancedQualityMode() {
        // Enable full quality if performance allows
        this.particleSystems.forEach(system => {
            system.setQuality('high');
        });
        
        document.documentElement.classList.remove('performance-mode');
    }
}

/**
 * Individual Card Class
 * Handles card-specific animations and interactions
 */
class Card {
    constructor(element, data) {
        this.element = element;
        this.name = data.name;
        this.cost = data.cost;
        this.type = data.type;
        this.tier = data.tier;
        this.id = element.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.isHovered = false;
        this.isActive = false;
        this.animationState = 'idle';
        
        this.init();
    }
    
    init() {
        // Set initial state
        this.element.style.setProperty('--card-primary-color', this.getPrimaryColor());
        this.element.setAttribute('data-card-id', this.id);
        
        // Initialize circuit animations
        this.initializeCircuitAnimations();
    }
    
    getPrimaryColor() {
        switch (this.type.toLowerCase()) {
            case 'chain': return 'var(--color-chain)';
            case 'defi': return 'var(--color-defi-primary)';
            case 'eoa': return 'var(--color-eoa-primary)';
            case 'action': return 'var(--color-action-destructive-start)';
            case 'ability': return 'var(--color-ability)';
            default: return 'var(--color-cyan-electric)';
        }
    }
    
    initializeCircuitAnimations() {
        const circuitElements = this.element.querySelectorAll('.circuit-pattern *');
        circuitElements.forEach((element, index) => {
            // Stagger animation delays for organic feel
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    onHover() {
        if (this.isHovered) return;
        
        this.isHovered = true;
        this.animationState = 'hover';
        
        // Enhance glow effect
        this.element.style.setProperty('--glow-intensity', '1.5');
        
        // Speed up animations
        this.element.style.setProperty('--animation-speed-multiplier', '1.5');
        
        // Trigger hover-specific effects
        this.triggerHoverEffects();
        
        console.log(`🎯 Card hover: ${this.name}`);
    }
    
    onUnhover() {
        if (!this.isHovered) return;
        
        this.isHovered = false;
        this.animationState = 'idle';
        
        // Reset effects
        this.element.style.setProperty('--glow-intensity', '1.0');
        this.element.style.setProperty('--animation-speed-multiplier', '1.0');
        
        console.log(`🎯 Card unhover: ${this.name}`);
    }
    
    onClick() {
        this.isActive = !this.isActive;
        this.animationState = this.isActive ? 'active' : 'idle';
        
        if (this.isActive) {
            this.element.classList.add('card-active');
            this.triggerActivationEffects();
        } else {
            this.element.classList.remove('card-active');
        }
        
        console.log(`🎴 Card ${this.isActive ? 'activated' : 'deactivated'}: ${this.name}`);
    }
    
    triggerHoverEffects() {
        // Type-specific hover effects
        switch (this.type.toLowerCase()) {
            case 'chain':
                this.enhanceNetworkActivity();
                break;
            case 'defi':
                this.enhanceYieldVisualization();
                break;
            case 'eoa':
                this.enhanceSecurityEffects();
                break;
            case 'action':
                this.enhanceImpactEffects();
                break;
            case 'ability':
                this.enhanceKnowledgeEffects();
                break;
        }
    }
    
    triggerActivationEffects() {
        // Create activation burst effect
        const burstEffect = document.createElement('div');
        burstEffect.className = 'activation-burst';
        burstEffect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, ${this.getPrimaryColor()} 0%, transparent 70%);
            border-radius: 50%;
            animation: burstEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 100;
        `;
        
        this.element.appendChild(burstEffect);
        
        // Remove burst effect after animation
        setTimeout(() => {
            burstEffect.remove();
        }, 600);
        
        // Add burst animation keyframes if not already present
        if (!document.querySelector('#burst-animation-style')) {
            const style = document.createElement('style');
            style.id = 'burst-animation-style';
            style.textContent = `
                @keyframes burstEffect {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    enhanceNetworkActivity() {
        const networkElements = this.element.querySelectorAll('.network-hub, .validator-node');
        networkElements.forEach(element => {
            element.style.animationDuration = '2s';
        });
    }
    
    enhanceYieldVisualization() {
        const yieldElements = this.element.querySelectorAll('.liquidity-pool, .yield-container');
        yieldElements.forEach(element => {
            element.style.animationDuration = '2s';
            element.style.transform = 'scale(1.1)';
        });
    }
    
    enhanceSecurityEffects() {
        const securityElements = this.element.querySelectorAll('.security-shield, .vault-container');
        securityElements.forEach(element => {
            element.style.animationDuration = '2s';
            element.style.filter = 'drop-shadow(0 0 15px currentColor)';
        });
    }
    
    enhanceImpactEffects() {
        const impactElements = this.element.querySelectorAll('.explosion-ring, .attack-vector');
        impactElements.forEach(element => {
            element.style.animationDuration = '1s';
        });
        
        // Add screen shake effect for destructive actions
        if (this.element.classList.contains('destructive')) {
            this.element.style.animation = 'screenShake 0.5s ease-in-out';
            
            // Add screen shake keyframes if not present
            if (!document.querySelector('#shake-animation-style')) {
                const style = document.createElement('style');
                style.id = 'shake-animation-style';
                style.textContent = `
                    @keyframes screenShake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-2px); }
                        75% { transform: translateX(2px); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    enhanceKnowledgeEffects() {
        const knowledgeElements = this.element.querySelectorAll('.knowledge-flow, .speaker-node');
        knowledgeElements.forEach(element => {
            element.style.animationDuration = '2s';
            element.style.filter = 'drop-shadow(0 0 12px currentColor)';
        });
    }
    
    setState(state) {
        this.animationState = state;
        this.element.setAttribute('data-animation-state', state);
        
        switch (state) {
            case 'triggered':
                this.element.classList.add('card-triggered');
                break;
            case 'exhausted':
                this.element.classList.add('card-exhausted');
                break;
            case 'protected':
                this.element.classList.add('card-protected');
                break;
            default:
                this.element.classList.remove('card-triggered', 'card-exhausted', 'card-protected');
        }
    }
}

/**
 * Animation Manager Class
 * Handles global animation state and performance
 */
class AnimationManager {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.reducedMotion = false;
        this.animationFrame = null;
    }
    
    start() {
        this.isRunning = true;
        this.animate();
        console.log('🎬 Animation system started');
    }
    
    animate() {
        if (!this.isRunning || this.isPaused) return;
        
        // Global animation logic here
        this.updateGlobalEffects();
        
        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }
    
    pause() {
        this.isPaused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    resume() {
        this.isPaused = false;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    setReducedMotion(enabled) {
        this.reducedMotion = enabled;
        
        if (enabled) {
            // Disable complex animations
            document.documentElement.style.setProperty('--animation-duration-multiplier', '0.01');
        } else {
            document.documentElement.style.setProperty('--animation-duration-multiplier', '1.0');
        }
    }
    
    updateGlobalEffects() {
        // Update any global animation effects
        // This could include background animations, ambient particles, etc.
        
        const now = performance.now();
        const slowCycle = Math.sin(now * 0.001) * 0.5 + 0.5; // 0-1 over ~6 seconds
        
        // Update CSS custom properties for global animations
        document.documentElement.style.setProperty('--global-animation-cycle', slowCycle);
    }
}

/**
 * Interaction Handler Class
 * Manages user interactions and feedback
 */
class InteractionHandler {
    constructor() {
        this.touchStartTime = 0;
        this.touchThreshold = 200; // ms
        
        this.setupTouchHandling();
        this.setupKeyboardHandling();
    }
    
    setupTouchHandling() {
        // Handle touch events for mobile
        document.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - this.touchStartTime;
            
            if (touchDuration < this.touchThreshold) {
                // Treat as tap - trigger click behavior
                const cardElement = e.target.closest('.card');
                if (cardElement) {
                    // Trigger haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }
        }, { passive: true });
    }
    
    setupKeyboardHandling() {
        // Keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Show focus indicators
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            // Hide focus indicators when using mouse
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tokenTycoon = new TokenTycoonV2();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TokenTycoonV2, Card, AnimationManager, InteractionHandler };
}
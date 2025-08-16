/**
 * Token Tycoon v2.0 - Advanced Card Interactions
 * Enhanced user interaction handling and feedback systems
 */

class CardInteractionManager {
    constructor() {
        this.activeCard = null;
        this.draggedCard = null;
        this.interactionStates = new Map();
        this.touchState = {
            startTime: 0,
            startPos: { x: 0, y: 0 },
            currentPos: { x: 0, y: 0 },
            threshold: 10 // px
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAccessibilityFeatures();
        this.setupDebugMode();
        
        console.log('🎮 Card Interaction Manager initialized');
    }
    
    setupEventListeners() {
        // Mouse events
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Focus events
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
        
        // Context menu (right-click)
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }
    
    setupAccessibilityFeatures() {
        // Make cards focusable
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', this.generateAriaLabel(card));
            
            // Add ARIA live region for state changes
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.id = `card-status-${index}`;
            card.appendChild(liveRegion);
        });
        
        // Add screen reader styles
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupDebugMode() {
        // Debug mode can be enabled by adding ?debug=true to URL
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.get('debug') === 'true';
        
        if (this.debugMode) {
            console.log('🔍 Debug mode enabled');
            this.createDebugOverlay();
        }
    }
    
    generateAriaLabel(card) {
        const name = card.dataset.cardName || 'Unknown Card';
        const cost = card.dataset.cost || '0';
        const type = card.dataset.type || 'Unknown';
        
        return `${name}, ${type} card, costs ${cost} ETH. Press Enter or Space to interact.`;
    }
    
    // Mouse Event Handlers
    handleMouseOver(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        this.setCardState(card, 'hover');
        this.triggerHapticFeedback('light');
        
        if (this.debugMode) {
            console.log('🎯 Hover:', card.dataset.cardName);
        }
    }
    
    handleMouseOut(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        if (!this.isCardActive(card)) {
            this.setCardState(card, 'idle');
        }
    }
    
    handleMouseDown(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        event.preventDefault();
        
        this.activeCard = card;
        this.setCardState(card, 'pressed');
        this.triggerHapticFeedback('medium');
        
        // Start drag detection
        this.startDragDetection(event.clientX, event.clientY, card);
    }
    
    handleMouseMove(event) {
        if (this.activeCard && this.isDragEnabled()) {
            this.updateDrag(event.clientX, event.clientY);
        }
    }
    
    handleMouseUp(event) {
        if (!this.activeCard) return;
        
        const card = this.activeCard;
        
        if (this.draggedCard) {
            this.completeDrag(event);
        } else {
            // Regular click
            this.handleCardActivation(card);
        }
        
        this.resetInteractionState();
    }
    
    // Touch Event Handlers
    handleTouchStart(event) {
        if (event.touches.length !== 1) return; // Only handle single touch
        
        const touch = event.touches[0];
        const card = event.target.closest('.card');
        if (!card) return;
        
        event.preventDefault();
        
        this.touchState.startTime = Date.now();
        this.touchState.startPos = { x: touch.clientX, y: touch.clientY };
        this.touchState.currentPos = { x: touch.clientX, y: touch.clientY };
        
        this.activeCard = card;
        this.setCardState(card, 'pressed');
        this.triggerHapticFeedback('light');
        
        // Start long press detection
        this.longPressTimer = setTimeout(() => {
            this.handleLongPress(card);
        }, 500);
    }
    
    handleTouchMove(event) {
        if (!this.activeCard || event.touches.length !== 1) return;
        
        const touch = event.touches[0];
        this.touchState.currentPos = { x: touch.clientX, y: touch.clientY };
        
        const distance = this.calculateDistance(
            this.touchState.startPos,
            this.touchState.currentPos
        );
        
        if (distance > this.touchState.threshold) {
            // Cancel long press
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            
            if (this.isDragEnabled()) {
                this.startDrag();
                this.updateDrag(touch.clientX, touch.clientY);
            }
        }
    }
    
    handleTouchEnd(event) {
        if (!this.activeCard) return;
        
        const card = this.activeCard;
        const touchDuration = Date.now() - this.touchState.startTime;
        
        // Cancel long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        if (this.draggedCard) {
            this.completeDrag(event);
        } else if (touchDuration < 200) {
            // Quick tap
            this.handleCardActivation(card);
        }
        
        this.resetInteractionState();
    }
    
    // Keyboard Event Handlers
    handleKeyDown(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleCardActivation(card);
                this.announceToScreenReader(card, 'activated');
                break;
                
            case 'Escape':
                if (this.activeCard) {
                    this.setCardState(this.activeCard, 'idle');
                    this.activeCard = null;
                }
                break;
                
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleArrowNavigation(event, card);
                break;
        }
    }
    
    handleKeyUp(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        if (event.key === 'Enter' || event.key === ' ') {
            this.setCardState(card, 'idle');
        }
    }
    
    // Focus Event Handlers
    handleFocusIn(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        this.setCardState(card, 'focused');
        this.announceToScreenReader(card, 'focused');
    }
    
    handleFocusOut(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        if (!this.isCardActive(card)) {
            this.setCardState(card, 'idle');
        }
    }
    
    // Context Menu Handler
    handleContextMenu(event) {
        const card = event.target.closest('.card');
        if (!card) return;
        
        event.preventDefault();
        this.showContextMenu(event, card);
    }
    
    // Card State Management
    setCardState(card, state) {
        const previousState = this.interactionStates.get(card);
        this.interactionStates.set(card, state);
        
        // Update visual state
        card.classList.remove('card-idle', 'card-hover', 'card-pressed', 'card-active', 'card-focused');
        card.classList.add(`card-${state}`);
        
        // Trigger state-specific effects
        this.triggerStateEffects(card, state, previousState);
    }
    
    triggerStateEffects(card, newState, previousState) {
        switch (newState) {
            case 'hover':
                this.enhanceCardVisuals(card, 1.2);
                break;
            case 'pressed':
                this.enhanceCardVisuals(card, 1.5);
                this.addPressEffect(card);
                break;
            case 'active':
                this.enhanceCardVisuals(card, 2.0);
                this.addActivationEffect(card);
                break;
            case 'focused':
                this.addFocusRing(card);
                break;
            case 'idle':
                this.resetCardVisuals(card);
                this.removeFocusRing(card);
                break;
        }
    }
    
    // Visual Enhancement Methods
    enhanceCardVisuals(card, intensity) {
        card.style.setProperty('--interaction-intensity', intensity);
        
        // Enhance glow
        const glowEffect = card.querySelector('.glow-effect');
        if (glowEffect) {
            glowEffect.style.opacity = Math.min(1.0, 0.3 * intensity);
        }
        
        // Speed up animations
        card.style.setProperty('--animation-speed', `${intensity}s`);
    }
    
    resetCardVisuals(card) {
        card.style.setProperty('--interaction-intensity', '1.0');
        card.style.setProperty('--animation-speed', '3s');
        
        const glowEffect = card.querySelector('.glow-effect');
        if (glowEffect) {
            glowEffect.style.opacity = '';
        }
    }
    
    addPressEffect(card) {
        const pressEffect = document.createElement('div');
        pressEffect.className = 'press-effect';
        pressEffect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pressRipple 0.6s ease-out;
            pointer-events: none;
            z-index: 20;
        `;
        
        card.appendChild(pressEffect);
        
        setTimeout(() => {
            pressEffect.remove();
        }, 600);
        
        // Add ripple animation if not exists
        this.ensureRippleAnimation();
    }
    
    addActivationEffect(card) {
        const activationEffect = document.createElement('div');
        activationEffect.className = 'activation-effect';
        activationEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: activationSweep 0.8s ease-out;
            pointer-events: none;
            z-index: 15;
        `;
        
        card.appendChild(activationEffect);
        
        setTimeout(() => {
            activationEffect.remove();
        }, 800);
        
        this.ensureActivationAnimation();
    }
    
    addFocusRing(card) {
        if (card.querySelector('.focus-ring')) return;
        
        const focusRing = document.createElement('div');
        focusRing.className = 'focus-ring';
        focusRing.style.cssText = `
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 3px solid var(--color-cyan-electric);
            border-radius: calc(var(--card-border-radius) + 4px);
            pointer-events: none;
            z-index: 25;
            animation: focusPulse 2s ease-in-out infinite;
        `;
        
        card.appendChild(focusRing);
        this.ensureFocusAnimation();
    }
    
    removeFocusRing(card) {
        const focusRing = card.querySelector('.focus-ring');
        if (focusRing) {
            focusRing.remove();
        }
    }
    
    // Drag and Drop Methods
    isDragEnabled() {
        return true; // Can be configured based on game state
    }
    
    startDragDetection(x, y, card) {
        this.dragState = {
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            threshold: 5
        };
    }
    
    startDrag() {
        if (this.draggedCard) return;
        
        this.draggedCard = this.activeCard;
        this.setCardState(this.draggedCard, 'dragging');
        
        // Create drag ghost
        this.createDragGhost();
        
        console.log('🎯 Started dragging:', this.draggedCard.dataset.cardName);
    }
    
    updateDrag(x, y) {
        if (!this.draggedCard || !this.dragGhost) return;
        
        this.dragGhost.style.left = `${x - 126}px`; // Half card width
        this.dragGhost.style.top = `${y - 176}px`; // Half card height
        
        // Check for drop targets
        this.updateDropTargets(x, y);
    }
    
    createDragGhost() {
        this.dragGhost = this.draggedCard.cloneNode(true);
        this.dragGhost.className = 'card-drag-ghost';
        this.dragGhost.style.cssText = `
            position: fixed;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.8;
            transform: scale(0.8) rotate(5deg);
            transition: transform 0.2s ease;
        `;
        
        document.body.appendChild(this.dragGhost);
    }
    
    updateDropTargets(x, y) {
        const dropTargets = document.querySelectorAll('.drop-target');
        
        dropTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            
            if (isOver) {
                target.classList.add('drop-target-active');
            } else {
                target.classList.remove('drop-target-active');
            }
        });
    }
    
    completeDrag(event) {
        if (!this.draggedCard) return;
        
        const dropTarget = this.findDropTarget(event);
        
        if (dropTarget) {
            this.handleDrop(this.draggedCard, dropTarget);
        }
        
        // Clean up drag state
        if (this.dragGhost) {
            this.dragGhost.remove();
            this.dragGhost = null;
        }
        
        // Remove drop target highlights
        document.querySelectorAll('.drop-target-active').forEach(target => {
            target.classList.remove('drop-target-active');
        });
        
        this.draggedCard = null;
    }
    
    findDropTarget(event) {
        let x, y;
        
        if (event.type.startsWith('touch')) {
            const touch = event.changedTouches[0];
            x = touch.clientX;
            y = touch.clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        
        const element = document.elementFromPoint(x, y);
        return element ? element.closest('.drop-target') : null;
    }
    
    handleDrop(card, dropTarget) {
        console.log('🎯 Drop:', card.dataset.cardName, 'on', dropTarget.dataset.dropType);
        
        // Trigger drop effect
        this.triggerDropEffect(dropTarget);
        this.triggerHapticFeedback('heavy');
    }
    
    triggerDropEffect(target) {
        const dropEffect = document.createElement('div');
        dropEffect.className = 'drop-effect';
        dropEffect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, var(--color-success) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: dropSuccess 0.8s ease-out;
            pointer-events: none;
            z-index: 30;
        `;
        
        target.appendChild(dropEffect);
        
        setTimeout(() => {
            dropEffect.remove();
        }, 800);
        
        this.ensureDropAnimation();
    }
    
    // Utility Methods
    isCardActive(card) {
        const state = this.interactionStates.get(card);
        return state === 'active' || state === 'pressed';
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    triggerHapticFeedback(intensity) {
        if (navigator.vibrate) {
            const patterns = {
                light: 25,
                medium: 50,
                heavy: 100
            };
            navigator.vibrate(patterns[intensity] || 50);
        }
    }
    
    handleCardActivation(card) {
        this.setCardState(card, 'active');
        this.triggerHapticFeedback('medium');
        
        // Dispatch custom event
        const event = new CustomEvent('cardActivated', {
            detail: {
                card: card,
                name: card.dataset.cardName,
                type: card.dataset.type,
                cost: card.dataset.cost
            },
            bubbles: true
        });
        
        card.dispatchEvent(event);
        
        console.log('🎴 Card activated:', card.dataset.cardName);
    }
    
    handleLongPress(card) {
        console.log('⏰ Long press:', card.dataset.cardName);
        this.showCardDetails(card);
        this.triggerHapticFeedback('heavy');
    }
    
    showCardDetails(card) {
        // Could open detailed card view or context menu
        console.log('📋 Showing details for:', card.dataset.cardName);
    }
    
    showContextMenu(event, card) {
        console.log('📝 Context menu for:', card.dataset.cardName);
        // Could show card-specific actions
    }
    
    handleArrowNavigation(event, currentCard) {
        event.preventDefault();
        
        const cards = Array.from(document.querySelectorAll('.card'));
        const currentIndex = cards.indexOf(currentCard);
        let nextIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                nextIndex = Math.min(cards.length - 1, currentIndex + 1);
                break;
            case 'ArrowUp':
                nextIndex = Math.max(0, currentIndex - 3); // Assuming 3 cards per row
                break;
            case 'ArrowDown':
                nextIndex = Math.min(cards.length - 1, currentIndex + 3);
                break;
        }
        
        if (nextIndex !== currentIndex && cards[nextIndex]) {
            cards[nextIndex].focus();
        }
    }
    
    announceToScreenReader(card, action) {
        const liveRegion = card.querySelector('[aria-live]');
        if (liveRegion) {
            const message = `${card.dataset.cardName} ${action}`;
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    resetInteractionState() {
        this.activeCard = null;
        this.draggedCard = null;
        
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    
    createDebugOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'debug-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // Update debug info
        setInterval(() => {
            const activeCards = Array.from(this.interactionStates.entries())
                .filter(([card, state]) => state !== 'idle')
                .map(([card, state]) => `${card.dataset.cardName}: ${state}`)
                .join('\n');
            
            overlay.textContent = `
Debug Info:
Active Cards: ${this.interactionStates.size}
${activeCards}
Touch Support: ${navigator.maxTouchPoints > 0}
Vibration Support: ${!!navigator.vibrate}
            `.trim();
        }, 100);
    }
    
    // Animation Helpers
    ensureRippleAnimation() {
        if (document.querySelector('#ripple-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes pressRipple {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(10); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    ensureActivationAnimation() {
        if (document.querySelector('#activation-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'activation-animation';
        style.textContent = `
            @keyframes activationSweep {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    ensureFocusAnimation() {
        if (document.querySelector('#focus-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'focus-animation';
        style.textContent = `
            @keyframes focusPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
    }
    
    ensureDropAnimation() {
        if (document.querySelector('#drop-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'drop-animation';
        style.textContent = `
            @keyframes dropSuccess {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize interaction manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cardInteractionManager = new CardInteractionManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardInteractionManager };
}
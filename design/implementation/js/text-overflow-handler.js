/**
 * Text Overflow Handler - Manages expandable card rules text
 * Shows visual indicators when text is cut off and handles click interactions
 */

class TextOverflowHandler {
    constructor() {
        this.expandedCards = new Set();
        this.init();
    }
    
    init() {
        this.checkAllTextOverflow();
        this.setupClickHandlers();
        
        // Re-check overflow on window resize
        window.addEventListener('resize', () => {
            this.checkAllTextOverflow();
        });
        
        // Observer for dynamically added cards
        this.setupMutationObserver();
        
        console.log('📖 Text Overflow Handler initialized');
    }
    
    checkAllTextOverflow() {
        const rulesTextElements = document.querySelectorAll('.card-rules-text');
        
        rulesTextElements.forEach(element => {
            this.checkTextOverflow(element);
        });
    }
    
    checkTextOverflow(element) {
        // Reset state
        element.classList.remove('has-overflow');
        
        // Check if content overflows
        const isOverflowing = element.scrollHeight > element.clientHeight;
        
        if (isOverflowing) {
            element.classList.add('has-overflow');
        }
    }
    
    setupClickHandlers() {
        document.addEventListener('click', (event) => {
            const rulesText = event.target.closest('.card-rules-text');
            
            if (rulesText && rulesText.classList.contains('has-overflow')) {
                event.stopPropagation();
                this.toggleExpansion(rulesText);
            }
        });
    }
    
    toggleExpansion(element) {
        const cardElement = element.closest('.card');
        const cardName = cardElement?.dataset.cardName || 'unknown';
        
        if (element.classList.contains('expanded')) {
            // Collapse
            element.classList.remove('expanded');
            this.expandedCards.delete(cardName);
            
            // Trigger collapse animation
            this.animateCollapse(element);
            
            console.log('📖 Collapsed rules text for:', cardName);
        } else {
            // Expand
            element.classList.add('expanded');
            this.expandedCards.add(cardName);
            
            // Trigger expand animation
            this.animateExpand(element);
            
            console.log('📖 Expanded rules text for:', cardName);
            
            // Scroll to show full text if needed
            this.scrollToShowFullText(element);
        }
    }
    
    animateExpand(element) {
        // Add expand animation class
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
        
        // Add glow effect
        element.style.boxShadow = `
            0 15px 40px rgba(0, 217, 255, 0.4),
            inset 0 2px 8px rgba(0, 0, 0, 0.3)
        `;
    }
    
    animateCollapse(element) {
        // Add collapse animation
        element.style.transform = 'scale(0.98)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
        }, 200);
    }
    
    scrollToShowFullText(element) {
        // Smooth scroll to ensure the expanded text is visible
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.bottom > windowHeight) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }
    
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const rulesTextElements = node.querySelectorAll?.('.card-rules-text') || [];
                        rulesTextElements.forEach(element => {
                            this.checkTextOverflow(element);
                        });
                        
                        // Check if the added node itself is a rules text element
                        if (node.classList?.contains('card-rules-text')) {
                            this.checkTextOverflow(node);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Utility method to force check overflow for specific card
    recheckCard(cardElement) {
        const rulesText = cardElement.querySelector('.card-rules-text');
        if (rulesText) {
            this.checkTextOverflow(rulesText);
        }
    }
    
    // Get expansion state for specific card
    isCardExpanded(cardName) {
        return this.expandedCards.has(cardName);
    }
    
    // Collapse all expanded cards
    collapseAll() {
        document.querySelectorAll('.card-rules-text.expanded').forEach(element => {
            element.classList.remove('expanded');
        });
        this.expandedCards.clear();
        console.log('📖 Collapsed all expanded cards');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.textOverflowHandler = new TextOverflowHandler();
});

// Initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already ready
    window.textOverflowHandler = new TextOverflowHandler();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextOverflowHandler };
}
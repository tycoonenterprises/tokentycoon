/**
 * Token Tycoon v2.0 - All Cards Application
 * Main application for displaying and interacting with all 92 cards
 */

class AllCardsApp {
    constructor() {
        this.cardsData = null;
        this.cardGenerator = null;
        this.filteredCards = [];
        this.currentView = 'grid';
        this.filters = {
            type: '',
            cost: '',
            ability: '',
            search: ''
        };
        this.animationsEnabled = true;
        this.particlesEnabled = true;
        this.particleSystems = new Map();
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Token Tycoon All Cards App...');
        
        try {
            await this.loadCardsData();
            this.initializeCardGenerator();
            this.setupEventListeners();
            this.renderAllCards();
            this.updateStats();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to load card data. Please refresh the page.');
        }
    }
    
    async loadCardsData() {
        // In a real application, this would fetch from an API
        // For now, we'll use the embedded data or fetch from a local file
        try {
            const response = await fetch('../../data/cards.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.cardsData = await response.json();
        } catch (error) {
            // Fallback: Use embedded data if fetch fails
            console.log('Using embedded card data as fallback');
            this.cardsData = this.getEmbeddedCardsData();
        }
    }
    
    getEmbeddedCardsData() {
        // Embedded subset of cards for demo purposes
        return {
            cards: [
                {
                    name: "Ethereum Mainnet",
                    description: "The original blockchain. Generates 2 ETH per turn.",
                    cost: 5,
                    cardType: "Chain",
                    abilities: { income: { amount: 2 } }
                },
                {
                    name: "Uniswap",
                    description: "Gain 1 ETH per turn per ETH stored here.",
                    cost: 2,
                    cardType: "DeFi",
                    abilities: { yield: { amount: 1 } }
                },
                {
                    name: "Multi-sig Wallet",
                    description: "Storage max 8. The first time each turn this would be stolen from or destroyed, prevent it.",
                    cost: 3,
                    cardType: "EOA",
                    abilities: { storage: { max: 8, type: "ETH" }, shield: { perTurn: 1 } }
                },
                {
                    name: "Bridge Hack",
                    description: "Destroy target chain and all DeFi Protocols on it.",
                    cost: 5,
                    cardType: "Action",
                    abilities: { destroy: { amount: 1 } }
                },
                {
                    name: "Attend a Conference",
                    description: "Draw 3 cards.",
                    cost: 5,
                    cardType: "Ability",
                    abilities: { draw: { amount: 3 } }
                }
            ]
        };
    }
    
    initializeCardGenerator() {
        this.cardGenerator = new CardGenerator(this.cardsData);
        this.filteredCards = [...this.cardsData.cards];
    }
    
    setupEventListeners() {
        // Filter controls
        document.getElementById('type-filter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('cost-filter')?.addEventListener('change', (e) => {
            this.filters.cost = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('ability-filter')?.addEventListener('change', (e) => {
            this.filters.ability = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        // View controls
        document.getElementById('grid-view')?.addEventListener('click', () => {
            this.setView('grid');
        });
        
        document.getElementById('list-view')?.addEventListener('click', () => {
            this.setView('list');
        });
        
        document.getElementById('compact-view')?.addEventListener('click', () => {
            this.setView('compact');
        });
        
        // Animation controls
        document.getElementById('enable-animations')?.addEventListener('change', (e) => {
            this.animationsEnabled = e.target.checked;
            this.toggleAnimations();
        });
        
        document.getElementById('enable-particles')?.addEventListener('change', (e) => {
            this.particlesEnabled = e.target.checked;
            this.toggleParticles();
        });
        
        // Modal controls
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('card-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'card-modal') {
                this.closeModal();
            }
        });
        
        // Card interaction events
        document.addEventListener('cardActivated', (e) => {
            this.handleCardActivated(e.detail);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }
    
    renderAllCards() {
        const container = document.getElementById('cards-container');
        if (!container) return;
        
        // Show loading indicator
        container.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <p>Loading all ${this.cardsData.cards.length} cards...</p>
            </div>
        `;
        
        // Render cards with a slight delay for smooth loading
        setTimeout(() => {
            try {
                const cardsHTML = this.cardGenerator.generateAllCards();
                container.innerHTML = cardsHTML;
                
                // Initialize particle systems for each card
                this.initializeParticleSystems();
                
                // Setup card click handlers
                this.setupCardClickHandlers();
                
                console.log(`✅ Rendered ${this.cardsData.cards.length} cards successfully`);
            } catch (error) {
                console.error('❌ Error rendering cards:', error);
                this.showError('Error rendering cards. Please refresh the page.');
            }
        }, 500);
    }
    
    initializeParticleSystems() {
        if (!this.particlesEnabled) return;
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const particleContainer = card.querySelector('.particle-container');
            const cardType = card.dataset.type;
            
            if (particleContainer && cardType) {
                try {
                    const particleSystem = new ParticleSystem(particleContainer, cardType);
                    this.particleSystems.set(card, particleSystem);
                } catch (error) {
                    console.warn('Failed to initialize particle system for card:', card.dataset.cardName);
                }
            }
        });
    }
    
    setupCardClickHandlers() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCardModal(card);
            });
            
            // Enhanced hover effects for particle systems
            card.addEventListener('mouseenter', () => {
                const particleSystem = this.particleSystems.get(card);
                if (particleSystem) {
                    particleSystem.intensify();
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const particleSystem = this.particleSystems.get(card);
                if (particleSystem) {
                    particleSystem.normalize();
                }
            });
        });
    }
    
    applyFilters() {
        let filtered = [...this.cardsData.cards];
        
        // Type filter
        if (this.filters.type) {
            filtered = filtered.filter(card => card.cardType === this.filters.type);
        }
        
        // Cost filter
        if (this.filters.cost !== '') {
            const cost = parseInt(this.filters.cost);
            filtered = filtered.filter(card => card.cost === cost);
        }
        
        // Ability filter
        if (this.filters.ability) {
            filtered = filtered.filter(card => 
                card.abilities && card.abilities[this.filters.ability]
            );
        }
        
        // Search filter
        if (this.filters.search) {
            filtered = filtered.filter(card =>
                card.name.toLowerCase().includes(this.filters.search) ||
                card.description.toLowerCase().includes(this.filters.search)
            );
        }
        
        this.filteredCards = filtered;
        this.updateCardDisplay();
        this.updateStats();
    }
    
    updateCardDisplay() {
        const cards = document.querySelectorAll('.card');
        const filteredNames = new Set(this.filteredCards.map(card => card.name));
        
        let visibleCount = 0;
        cards.forEach(card => {
            const cardName = card.dataset.cardName;
            if (filteredNames.has(cardName)) {
                card.classList.remove('filtered-out');
                card.style.display = '';
                visibleCount++;
            } else {
                card.classList.add('filtered-out');
                card.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        this.updateNoResultsMessage(visibleCount);
    }
    
    updateNoResultsMessage(visibleCount) {
        const container = document.getElementById('cards-container');
        let noResultsElement = container.querySelector('.no-results');
        
        if (visibleCount === 0) {
            if (!noResultsElement) {
                noResultsElement = document.createElement('div');
                noResultsElement.className = 'no-results';
                noResultsElement.innerHTML = `
                    <h3>No cards found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="no-results-btn" onclick="allCardsApp.clearAllFilters()">
                        Clear All Filters
                    </button>
                `;
                container.appendChild(noResultsElement);
            }
        } else {
            if (noResultsElement) {
                noResultsElement.remove();
            }
        }
    }
    
    clearAllFilters() {
        // Reset filter inputs
        document.getElementById('type-filter').value = '';
        document.getElementById('cost-filter').value = '';
        document.getElementById('ability-filter').value = '';
        document.getElementById('search-input').value = '';
        
        // Reset filter state
        this.filters = {
            type: '',
            cost: '',
            ability: '',
            search: ''
        };
        
        // Apply cleared filters
        this.applyFilters();
    }
    
    setView(viewType) {
        const container = document.getElementById('cards-container');
        const viewButtons = document.querySelectorAll('.view-btn');
        
        // Update container class
        container.className = `cards-${viewType}`;
        
        // Update active button
        viewButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${viewType}-view`)?.classList.add('active');
        
        this.currentView = viewType;
        
        // Re-render cards in list view format if needed
        if (viewType === 'list') {
            this.renderListView();
        }
    }
    
    renderListView() {
        const container = document.getElementById('cards-container');
        const cards = this.filteredCards.map(cardData => {
            const card = this.cardGenerator.generateCard(cardData);
            return `
                <div class="card-list-item" data-card-name="${cardData.name}" onclick="allCardsApp.showCardModalByName('${cardData.name}')">
                    <div class="card-mini">${card}</div>
                    <div class="list-item-info">
                        <div class="list-item-name">${cardData.name}</div>
                        <div class="list-item-description">${cardData.description}</div>
                        <div class="list-item-meta">
                            <span class="meta-item">
                                <span class="meta-label">Type:</span> ${cardData.cardType}
                            </span>
                            <span class="meta-item">
                                <span class="meta-label">Cost:</span> ${cardData.cost} ETH
                            </span>
                            <span class="meta-item">
                                <span class="meta-label">Abilities:</span> ${Object.keys(cardData.abilities || {}).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = cards;
    }
    
    updateStats() {
        const totalCards = this.cardsData.cards.length;
        const visibleCards = this.filteredCards.length;
        
        document.getElementById('total-cards').textContent = totalCards;
        document.getElementById('visible-cards').textContent = visibleCards;
    }
    
    toggleAnimations() {
        const body = document.body;
        if (this.animationsEnabled) {
            body.classList.remove('animations-disabled');
        } else {
            body.classList.add('animations-disabled');
        }
        
        // Update particle systems
        this.particleSystems.forEach(system => {
            if (this.animationsEnabled) {
                system.resume();
            } else {
                system.pause();
            }
        });
    }
    
    toggleParticles() {
        this.particleSystems.forEach(system => {
            if (this.particlesEnabled) {
                system.enable();
            } else {
                system.disable();
            }
        });
    }
    
    showCardModal(cardElement) {
        const cardName = cardElement.dataset.cardName;
        const cardData = this.cardsData.cards.find(card => card.name === cardName);
        
        if (!cardData) return;
        
        this.populateModal(cardData, cardElement);
        
        const modal = document.getElementById('card-modal');
        modal.classList.add('active');
        
        // Focus management for accessibility
        modal.focus();
    }
    
    showCardModalByName(cardName) {
        const cardElement = document.querySelector(`[data-card-name="${cardName}"]`);
        if (cardElement) {
            this.showCardModal(cardElement);
        }
    }
    
    populateModal(cardData, cardElement) {
        // Clone the card for the modal
        const modalCardContainer = document.querySelector('.modal-card-container');
        const clonedCard = cardElement.cloneNode(true);
        clonedCard.classList.add('modal-card');
        modalCardContainer.innerHTML = '';
        modalCardContainer.appendChild(clonedCard);
        
        // Update modal content
        document.getElementById('modal-card-name').textContent = cardData.name;
        document.getElementById('modal-card-type').textContent = cardData.cardType;
        document.getElementById('modal-card-cost').textContent = cardData.cost || 0;
        document.getElementById('modal-card-abilities').textContent = 
            Object.keys(cardData.abilities || {}).join(', ') || 'None';
        document.getElementById('modal-card-description').textContent = cardData.description;
        
        // Generate mechanics list
        this.populateModalMechanics(cardData);
    }
    
    populateModalMechanics(cardData) {
        const mechanicsList = document.getElementById('modal-mechanics-list');
        const mechanics = [];
        
        if (cardData.abilities) {
            Object.entries(cardData.abilities).forEach(([ability, data]) => {
                const amount = data.amount || data.max || 1;
                const mechanic = {
                    name: this.getAbilityDisplayName(ability),
                    description: this.getAbilityDescription(ability, amount, cardData)
                };
                mechanics.push(mechanic);
            });
        }
        
        mechanicsList.innerHTML = mechanics.map(mechanic => `
            <div class="mechanic-item">
                <span class="mechanic-name">${mechanic.name}:</span>
                ${mechanic.description}
            </div>
        `).join('');
    }
    
    getAbilityDisplayName(abilityType) {
        const names = {
            income: 'Income Generation',
            yield: 'Yield Production',
            destroy: 'Destruction',
            draw: 'Card Draw',
            storage: 'ETH Storage',
            protection: 'Protection',
            steal: 'Resource Steal',
            takeover: 'Takeover',
            trigger: 'Triggered Ability',
            scale: 'Scaling Effect',
            burn: 'ETH Burn',
            gain: 'ETH Gain',
            tax: 'Cost Increase',
            lock: 'Resource Lock',
            boost: 'Production Boost',
            freeze: 'Temporary Disable'
        };
        
        return names[abilityType] || abilityType;
    }
    
    getAbilityDescription(ability, amount, cardData) {
        const descriptions = {
            income: `Generates ${amount} ETH per turn`,
            yield: `Produces ${amount} ETH per turn per ETH stored`,
            destroy: `Can destroy up to ${amount} target(s)`,
            draw: `Draw ${amount} card(s)`,
            storage: `Can store up to ${amount} ETH`,
            protection: `Provides protection against ${amount} attack(s)`,
            steal: `Steal up to ${amount} ETH from opponents`,
            takeover: `Take control with power ${amount}`,
            trigger: `Triggered effect with value ${amount}`,
            scale: `Scales by factor of ${amount}`,
            burn: `Burns ${amount} ETH from all players`,
            gain: `Immediately gain ${amount} ETH`,
            tax: `Increases costs by ${amount} ETH`,
            lock: `Locks resources with strength ${amount}`,
            boost: `Increases production by ${amount} ETH`,
            freeze: `Disables targets for ${amount} turn(s)`
        };
        
        return descriptions[ability] || `Effect with value ${amount}`;
    }
    
    closeModal() {
        const modal = document.getElementById('card-modal');
        modal.classList.remove('active');
    }
    
    handleCardActivated(detail) {
        console.log('🎴 Card activated:', detail.name);
        
        // Add visual feedback
        const card = detail.card;
        card.classList.add('card-activated');
        
        setTimeout(() => {
            card.classList.remove('card-activated');
        }, 1000);
    }
    
    handleKeyboardShortcuts(e) {
        // Only handle if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'g':
                this.setView('grid');
                break;
            case 'l':
                this.setView('list');
                break;
            case 'c':
                this.setView('compact');
                break;
            case 'r':
                this.clearAllFilters();
                break;
            case '/':
                e.preventDefault();
                document.getElementById('search-input')?.focus();
                break;
        }
    }
    
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Automatically adjust quality based on performance
                if (fps < 30 && this.particlesEnabled) {
                    console.log('⚡ Low FPS detected, reducing particle quality');
                    this.particleSystems.forEach(system => system.setQuality('low'));
                } else if (fps > 50) {
                    this.particleSystems.forEach(system => system.setQuality('standard'));
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
    }
    
    showError(message) {
        const container = document.getElementById('cards-container');
        container.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
    
    // Public API methods
    getCardByName(name) {
        return this.cardsData.cards.find(card => card.name === name);
    }
    
    getCardsByType(type) {
        return this.cardsData.cards.filter(card => card.cardType === type);
    }
    
    getCardStats() {
        const stats = {
            total: this.cardsData.cards.length,
            byType: {},
            byCost: {},
            byRarity: this.cardGenerator.rarityTiers
        };
        
        this.cardsData.cards.forEach(card => {
            // By type
            stats.byType[card.cardType] = (stats.byType[card.cardType] || 0) + 1;
            
            // By cost
            const cost = card.cost || 0;
            stats.byCost[cost] = (stats.byCost[cost] || 0) + 1;
        });
        
        return stats;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.allCardsApp = new AllCardsApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AllCardsApp };
}
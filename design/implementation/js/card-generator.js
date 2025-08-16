/**
 * Token Tycoon v2.0 - Dynamic Card Generator
 * Generates all 92 cards with Cyberpunk Circuit Board styling
 */

class CardGenerator {
    constructor(cardsData) {
        this.cardsData = cardsData;
        this.rarityTiers = this.calculateRarityTiers();
        this.typePatterns = this.initializeTypePatterns();
        
        console.log('🎴 Card Generator initialized with', this.cardsData.cards.length, 'cards');
    }
    
    calculateRarityTiers() {
        // Assign rarity tiers based on cost and abilities
        const tiers = {
            basic: [],      // Cost 0-1, simple abilities
            common: [],     // Cost 2, basic abilities
            standard: [],   // Cost 3-4, moderate abilities
            premium: [],    // Cost 5, complex abilities
            legendary: []   // Special unique cards
        };
        
        this.cardsData.cards.forEach(card => {
            const cost = card.cost || 0;
            const abilities = Object.keys(card.abilities || {});
            const hasComplexAbilities = abilities.some(ability => 
                ['takeover', 'destroy', 'trigger', 'scale'].includes(ability)
            );
            
            if (cost === 0) {
                tiers.basic.push(card.name);
            } else if (cost === 1) {
                tiers.common.push(card.name);
            } else if (cost === 2) {
                tiers.common.push(card.name);
            } else if (cost === 3) {
                if (hasComplexAbilities) tiers.premium.push(card.name);
                else tiers.standard.push(card.name);
            } else if (cost === 4) {
                if (hasComplexAbilities) tiers.premium.push(card.name);
                else tiers.standard.push(card.name);
            } else if (cost >= 5) {
                if (['Bridge Hack', 'Attend ETHGlobal', 'Attend a Conference', '51% Attack'].includes(card.name)) {
                    tiers.legendary.push(card.name);
                } else {
                    tiers.premium.push(card.name);
                }
            }
        });
        
        return tiers;
    }
    
    initializeTypePatterns() {
        return {
            Chain: {
                circuitPattern: 'network-grid',
                primaryColor: 'var(--color-cyan-electric)',
                secondaryColor: 'var(--color-navy-light)',
                iconSymbol: '⛓️',
                backgroundEffect: 'chain-network'
            },
            DeFi: {
                circuitPattern: 'yield-flow',
                primaryColor: 'var(--color-amber-neon)',
                secondaryColor: 'var(--color-purple-circuit)',
                iconSymbol: '💎',
                backgroundEffect: 'defi-pools'
            },
            EOA: {
                circuitPattern: 'security-vault',
                primaryColor: 'var(--color-cyan-electric)',
                secondaryColor: 'var(--color-magenta-glow)',
                iconSymbol: '👤',
                backgroundEffect: 'wallet-security'
            },
            Action: {
                circuitPattern: 'attack-vectors',
                primaryColor: 'var(--color-danger)',
                secondaryColor: 'var(--color-amber-neon)',
                iconSymbol: '⚡',
                backgroundEffect: 'action-explosion'
            },
            Ability: {
                circuitPattern: 'neural-network',
                primaryColor: 'var(--color-purple-circuit)',
                secondaryColor: 'var(--color-cyan-electric)',
                iconSymbol: '🧠',
                backgroundEffect: 'ability-knowledge'
            }
        };
    }
    
    getRarityTier(cardName) {
        for (const [tier, cards] of Object.entries(this.rarityTiers)) {
            if (cards.includes(cardName)) {
                return tier;
            }
        }
        return 'standard'; // Default
    }
    
    generateAllCards() {
        const cardsHTML = this.cardsData.cards.map(cardData => 
            this.generateCard(cardData)
        ).join('\n');
        
        return cardsHTML;
    }
    
    generateCard(cardData) {
        const rarity = this.getRarityTier(cardData.name);
        const typePattern = this.typePatterns[cardData.cardType] || this.typePatterns.Chain;
        const abilities = this.formatAbilities(cardData.abilities);
        const cost = cardData.cost || 0;
        
        return `
<div class="card ${cardData.cardType.toLowerCase()}-card ${rarity}-tier card-enter" 
     data-card-name="${cardData.name}" 
     data-type="${cardData.cardType}" 
     data-cost="${cost}"
     data-abilities="${Object.keys(cardData.abilities || {}).join(',')}"
     data-rarity="${rarity}">
    
    <!-- Card Background Effects -->
    <div class="card-background">
        ${this.generateBackgroundEffect(cardData.cardType, rarity)}
    </div>
    
    <!-- Circuit Board Pattern -->
    <div class="circuit-board">
        ${this.generateCircuitPattern(cardData.cardType, rarity)}
    </div>
    
    <!-- Card Header with Cost and Type -->
    <div class="card-header">
        <div class="card-cost">
            <span class="cost-value">${cost}</span>
            <span class="cost-symbol">Ξ</span>
        </div>
        <div class="card-type ${cardData.cardType.toLowerCase()}-type">
            <span class="type-icon">${typePattern.iconSymbol}</span>
            <span class="type-label">${cardData.cardType}</span>
        </div>
    </div>
    
    <!-- Card Name -->
    <div class="card-name">
        <span class="name-text">${cardData.name}</span>
        <div class="name-glow ${rarity}-glow"></div>
    </div>
    
    <!-- Card Art Area -->
    <div class="card-art">
        <div class="art-frame">
            <div class="art-content ${cardData.cardType.toLowerCase()}-art">
                ${this.generateCardArt(cardData)}
            </div>
            <div class="art-overlay ${rarity}-overlay"></div>
        </div>
    </div>
    
    <!-- Card Rules Text -->
    <div class="card-rules-text">
        <p class="description-text">${cardData.description}</p>
        ${this.generateAbilitiesText(cardData, abilities)}
    </div>
    
    <!-- Card Stats Footer -->
    <div class="card-stats-footer">
        ${this.generateStatsDisplay(cardData, abilities)}
        ${this.generateTokenCounter(cardData)}
    </div>
    
    <!-- Rarity Indicator -->
    <div class="rarity-indicator ${rarity}-rarity">
        <div class="rarity-gems">
            ${this.generateRarityGems(rarity)}
        </div>
    </div>
    
    <!-- Particle System Container -->
    <div class="particle-container"></div>
    
    <!-- Energy Effects -->
    <div class="energy-effects">
        ${this.generateEnergyEffects(cardData.cardType, rarity)}
    </div>
    
    <!-- Interactive Glow -->
    <div class="glow-effect ${cardData.cardType.toLowerCase()}-glow"></div>
</div>`;
    }
    
    generateBackgroundEffect(cardType, rarity) {
        const patterns = {
            Chain: `
                <div class="chain-nodes">
                    <div class="node node-primary"></div>
                    <div class="node node-secondary"></div>
                    <div class="node node-tertiary"></div>
                </div>
                <div class="network-connections">
                    <div class="connection connection-1"></div>
                    <div class="connection connection-2"></div>
                    <div class="connection connection-3"></div>
                </div>
            `,
            DeFi: `
                <div class="liquidity-pools">
                    <div class="pool pool-primary"></div>
                    <div class="pool pool-secondary"></div>
                </div>
                <div class="yield-streams">
                    <div class="stream stream-1"></div>
                    <div class="stream stream-2"></div>
                </div>
            `,
            EOA: `
                <div class="security-vault">
                    <div class="vault-core"></div>
                    <div class="vault-rings">
                        <div class="ring ring-1"></div>
                        <div class="ring ring-2"></div>
                        <div class="ring ring-3"></div>
                    </div>
                </div>
            `,
            Action: `
                <div class="attack-vectors">
                    <div class="vector vector-1"></div>
                    <div class="vector vector-2"></div>
                    <div class="vector vector-3"></div>
                </div>
                <div class="explosion-core"></div>
            `,
            Ability: `
                <div class="neural-network">
                    <div class="neuron neuron-1"></div>
                    <div class="neuron neuron-2"></div>
                    <div class="neuron neuron-3"></div>
                    <div class="synapses">
                        <div class="synapse synapse-1"></div>
                        <div class="synapse synapse-2"></div>
                    </div>
                </div>
            `
        };
        
        return patterns[cardType] || patterns.Chain;
    }
    
    generateCircuitPattern(cardType, rarity) {
        const intensity = {
            basic: 1,
            common: 2,
            standard: 3,
            premium: 4,
            legendary: 5
        }[rarity] || 3;
        
        let circuitSVG = `
        <svg class="circuit-svg" viewBox="0 0 252 352" preserveAspectRatio="none">
            <defs>
                <linearGradient id="circuit-gradient-${cardType}-${rarity}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:var(--color-cyan-electric);stop-opacity:0.3"/>
                    <stop offset="50%" style="stop-color:var(--color-purple-circuit);stop-opacity:0.1"/>
                    <stop offset="100%" style="stop-color:var(--color-amber-neon);stop-opacity:0.3"/>
                </linearGradient>
                <pattern id="circuit-pattern-${cardType}" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="none" stroke="url(#circuit-gradient-${cardType}-${rarity})" stroke-width="0.5"/>
                    <circle cx="10" cy="10" r="1" fill="var(--color-cyan-electric)" opacity="0.6"/>
                </pattern>
            </defs>
            
            <!-- Base circuit grid -->
            <rect width="100%" height="100%" fill="url(#circuit-pattern-${cardType})" opacity="0.4"/>
            
            <!-- Energy pathways -->
            ${this.generateEnergyPathways(cardType, intensity)}
            
            <!-- Circuit nodes -->
            ${this.generateCircuitNodes(cardType, intensity)}
        </svg>`;
        
        return circuitSVG;
    }
    
    generateEnergyPathways(cardType, intensity) {
        const pathways = [];
        const pathCount = Math.min(intensity * 2, 8);
        
        for (let i = 0; i < pathCount; i++) {
            const startX = Math.random() * 252;
            const startY = Math.random() * 352;
            const endX = Math.random() * 252;
            const endY = Math.random() * 352;
            
            pathways.push(`
                <path d="M${startX},${startY} Q${(startX + endX) / 2},${startY} ${endX},${endY}" 
                      fill="none" 
                      stroke="var(--color-cyan-electric)" 
                      stroke-width="1" 
                      opacity="0.4"
                      class="energy-path path-${i}">
                    <animate attributeName="stroke-dasharray" 
                             values="0,100;50,50;100,0" 
                             dur="${2 + Math.random() * 3}s" 
                             repeatCount="indefinite"/>
                </path>
            `);
        }
        
        return pathways.join('');
    }
    
    generateCircuitNodes(cardType, intensity) {
        const nodes = [];
        const nodeCount = Math.min(intensity * 3, 12);
        
        for (let i = 0; i < nodeCount; i++) {
            const x = 30 + Math.random() * 192; // Keep nodes away from edges
            const y = 30 + Math.random() * 292;
            const size = 2 + Math.random() * 3;
            
            nodes.push(`
                <circle cx="${x}" cy="${y}" r="${size}" 
                        fill="var(--color-cyan-electric)" 
                        opacity="0.8"
                        class="circuit-node node-${i}">
                    <animate attributeName="opacity" 
                             values="0.3;1;0.3" 
                             dur="${1 + Math.random() * 2}s" 
                             repeatCount="indefinite"/>
                </circle>
            `);
        }
        
        return nodes.join('');
    }
    
    generateCardArt(cardData) {
        // Generate specific art based on card name and type
        const artElements = this.getArtElements(cardData.name, cardData.cardType);
        
        return `
        <div class="art-main ${cardData.cardType.toLowerCase()}-main">
            ${artElements}
        </div>
        `;
    }
    
    getArtElements(cardName, cardType) {
        // Specific art for notable cards
        const specificArt = {
            'Bridge Hack': `
                <div class="bridge-explosion">
                    <div class="explosion-center"></div>
                    <div class="explosion-rings">
                        <div class="ring ring-1"></div>
                        <div class="ring ring-2"></div>
                        <div class="ring ring-3"></div>
                    </div>
                    <div class="bridge-fragments">
                        <div class="fragment fragment-1"></div>
                        <div class="fragment fragment-2"></div>
                        <div class="fragment fragment-3"></div>
                    </div>
                </div>
            `,
            'Attend a Conference': `
                <div class="conference-scene">
                    <div class="speaker-podium"></div>
                    <div class="audience-network">
                        <div class="attendee attendee-1"></div>
                        <div class="attendee attendee-2"></div>
                        <div class="attendee attendee-3"></div>
                    </div>
                    <div class="knowledge-flow">
                        <div class="flow-line flow-1"></div>
                        <div class="flow-line flow-2"></div>
                    </div>
                </div>
            `,
            'Uniswap': `
                <div class="uniswap-amm">
                    <div class="liquidity-pool pool-a"></div>
                    <div class="liquidity-pool pool-b"></div>
                    <div class="swap-arrow"></div>
                    <div class="price-curve"></div>
                </div>
            `,
            'Multi-sig Wallet': `
                <div class="multisig-vault">
                    <div class="vault-door"></div>
                    <div class="signature-keys">
                        <div class="key key-1"></div>
                        <div class="key key-2"></div>
                        <div class="key key-3"></div>
                    </div>
                    <div class="authorization-grid"></div>
                </div>
            `,
            'Ethereum Mainnet': `
                <div class="mainnet-visualization">
                    <div class="validator-network">
                        <div class="validator validator-1"></div>
                        <div class="validator validator-2"></div>
                        <div class="validator validator-3"></div>
                    </div>
                    <div class="block-chain">
                        <div class="block block-1"></div>
                        <div class="block block-2"></div>
                        <div class="block block-3"></div>
                    </div>
                </div>
            `
        };
        
        if (specificArt[cardName]) {
            return specificArt[cardName];
        }
        
        // Default art by type
        const typeArt = {
            Chain: `<div class="chain-default"><div class="network-hub"></div><div class="connection-grid"></div></div>`,
            DeFi: `<div class="defi-default"><div class="yield-generator"></div><div class="token-flow"></div></div>`,
            EOA: `<div class="eoa-default"><div class="wallet-icon"></div><div class="security-shield"></div></div>`,
            Action: `<div class="action-default"><div class="action-burst"></div><div class="impact-waves"></div></div>`,
            Ability: `<div class="ability-default"><div class="knowledge-core"></div><div class="neural-links"></div></div>`
        };
        
        return typeArt[cardType] || typeArt.Chain;
    }
    
    formatAbilities(abilities) {
        if (!abilities) return [];
        
        return Object.entries(abilities).map(([abilityType, data]) => {
            const amount = data.amount || data.max || 1;
            const displayName = this.getAbilityDisplayName(abilityType);
            return { type: abilityType, amount, displayName };
        });
    }
    
    getAbilityDisplayName(abilityType) {
        const names = {
            income: 'Income',
            yield: 'Yield',
            destroy: 'Destroy',
            draw: 'Draw',
            storage: 'Storage',
            protection: 'Protection',
            steal: 'Steal',
            takeover: 'Takeover',
            trigger: 'Trigger',
            scale: 'Scale',
            burn: 'Burn',
            gain: 'Gain',
            tax: 'Tax',
            lock: 'Lock',
            boost: 'Boost',
            freeze: 'Freeze'
        };
        
        return names[abilityType] || abilityType;
    }
    
    generateAbilitiesText(cardData, abilities) {
        if (!abilities || abilities.length === 0) return '';
        
        let abilitiesHTML = '<div class="abilities-text">';
        
        abilities.forEach(ability => {
            const mechanic = this.getAbilityMechanic(ability.type, ability.amount, cardData);
            if (mechanic) {
                abilitiesHTML += `
                <div class="ability-mechanic ${ability.type}-mechanic">
                    <span class="mechanic-symbol">${this.getAbilitySymbol(ability.type)}</span>
                    <span class="mechanic-text">${mechanic}</span>
                </div>`;
            }
        });
        
        abilitiesHTML += '</div>';
        return abilitiesHTML;
    }
    
    getAbilityMechanic(abilityType, amount, cardData) {
        // Handle complex abilities with conditional mechanics
        if (abilityType === 'scale' && cardData.abilities?.scale) {
            return `Scales with ${this.getScaleType(cardData)}`;
        }
        
        if (abilityType === 'trigger' && cardData.abilities?.trigger) {
            const trigger = cardData.abilities.trigger;
            return `When ${trigger.on || 'triggered'}: ${trigger.steal ? 'steal ' + trigger.steal + ' ETH' : 'gain ' + (trigger.gain || trigger.amount || 1) + ' ETH'}`;
        }
        
        const mechanics = {
            income: `+${amount} ETH per turn`,
            yield: `+${amount} ETH per turn per ETH stored here`,
            destroy: amount > 50 ? `Destroy target (massive damage)` : `Destroy ${amount} target${amount > 1 ? 's' : ''}`,
            draw: `Draw ${amount} card${amount > 1 ? 's' : ''}`,
            storage: `Store up to ${amount} ETH`,
            protection: `Protection ${amount}`,
            steal: `Steal ${amount} ETH`,
            takeover: `Take control (Power ${amount})`,
            burn: `All opponents lose ${amount} ETH`,
            gain: `Gain ${amount} ETH`,
            tax: `Opponents pay +${amount} ETH`,
            lock: `Lock target`,
            boost: `+${amount} production`,
            freeze: `Freeze for ${amount} turn${amount > 1 ? 's' : ''}`,
            shield: `Shield ${amount} per turn`,
            discard: `Target opponent discards ${amount} card${amount > 1 ? 's' : ''}`,
            invincible: `Cannot be destroyed`,
            choice: `Optional effect`,
            copy: `Create copy`,
            freePlay: `Play for free`,
            loseNext: `Lose ${amount} ETH next turn`,
            gainTemp: `Temporary +${amount} ETH`,
            debuff: `Reduce production to 0`,
            cap: `Maximum ${amount}`,
            limit: `Cost ${amount} or less only`
        };
        
        return mechanics[abilityType] || `${abilityType.charAt(0).toUpperCase() + abilityType.slice(1)} ${amount}`;
    }
    
    getScaleType(cardData) {
        if (!cardData.abilities?.scale) return 'effect';
        
        const scaleTypes = {
            yourDeFi: 'your DeFi protocols',
            tokens: 'token counters',
            opponentValidatorNodes: 'opponent validator nodes',
            chains: 'chains you control'
        };
        
        return scaleTypes[cardData.abilities.scale.by] || 'effect';
    }
    
    generateStatsDisplay(cardData, abilities) {
        let statsHTML = '<div class="stats-bar">';
        
        // Key numerical stats
        const keyStats = [];
        
        abilities.forEach(ability => {
            if (['income', 'yield', 'destroy', 'draw'].includes(ability.type)) {
                keyStats.push({
                    type: ability.type,
                    value: ability.amount,
                    symbol: this.getAbilitySymbol(ability.type)
                });
            }
        });
        
        if (keyStats.length > 0) {
            statsHTML += keyStats.map(stat => `
                <div class="stat-item ${stat.type}-stat">
                    <span class="stat-symbol">${stat.symbol}</span>
                    <span class="stat-value">${stat.value}</span>
                </div>
            `).join('');
        }
        
        // Show storage capacity for EOA cards
        if (cardData.cardType === 'EOA' && cardData.abilities?.storage) {
            statsHTML += `
            <div class="stat-item storage-stat">
                <span class="stat-symbol">🏦</span>
                <span class="stat-value">${cardData.abilities.storage.max}</span>
            </div>`;
        }
        
        statsHTML += '</div>';
        return statsHTML;
    }
    
    generateTokenCounter(cardData) {
        if (!cardData.tokens) return '';
        
        return `
        <div class="token-counter">
            <span class="token-label">Tokens:</span>
            <span class="token-display">
                <span class="token-symbol">🪙</span>
                <span class="token-count">${cardData.tokens}</span>
            </span>
        </div>`;
    }
    
    getAbilitySymbol(abilityType) {
        const symbols = {
            income: '💰',
            yield: '📈',
            destroy: '💥',
            draw: '📄',
            storage: '🏦',
            protection: '🛡️',
            steal: '🔥',
            takeover: '👑',
            trigger: '⚡',
            scale: '📊',
            burn: '🔥',
            gain: '💎',
            tax: '📉',
            lock: '🔒',
            boost: '🚀',
            freeze: '❄️'
        };
        
        return symbols[abilityType] || '⚡';
    }
    
    generateRarityGems(rarity) {
        const gemCounts = {
            basic: 1,
            common: 2,
            standard: 3,
            premium: 4,
            legendary: 5
        };
        
        const count = gemCounts[rarity] || 3;
        let gems = '';
        
        for (let i = 0; i < count; i++) {
            gems += `<div class="rarity-gem gem-${i + 1}"></div>`;
        }
        
        return gems;
    }
    
    generateEnergyEffects(cardType, rarity) {
        const intensityLevel = {
            basic: 1,
            common: 2,
            standard: 3,
            premium: 4,
            legendary: 5
        }[rarity] || 3;
        
        let effects = '';
        
        // Add pulsing energy cores
        for (let i = 0; i < intensityLevel; i++) {
            effects += `
            <div class="energy-core core-${i}" style="
                --delay: ${i * 0.3}s;
                --position-x: ${20 + i * 15}%;
                --position-y: ${30 + (i % 2) * 40}%;
            "></div>`;
        }
        
        // Add energy streams
        if (intensityLevel >= 3) {
            effects += `
            <div class="energy-stream stream-horizontal"></div>
            <div class="energy-stream stream-vertical"></div>`;
        }
        
        if (intensityLevel >= 5) {
            effects += `<div class="energy-burst legendary-burst"></div>`;
        }
        
        return effects;
    }
    
    // Utility method to get card type distribution
    getCardTypeStats() {
        const stats = {
            Chain: 0,
            DeFi: 0,
            EOA: 0,
            Action: 0,
            Ability: 0
        };
        
        this.cardsData.cards.forEach(card => {
            stats[card.cardType]++;
        });
        
        return stats;
    }
    
    // Method to generate cards filtered by type
    generateCardsByType(cardType) {
        const filteredCards = this.cardsData.cards.filter(card => 
            card.cardType === cardType
        );
        
        return filteredCards.map(cardData => 
            this.generateCard(cardData)
        ).join('\n');
    }
    
    // Method to generate cards filtered by cost
    generateCardsByCost(cost) {
        const filteredCards = this.cardsData.cards.filter(card => 
            card.cost === cost
        );
        
        return filteredCards.map(cardData => 
            this.generateCard(cardData)
        ).join('\n');
    }
    
    // Method to get cards with specific abilities
    generateCardsByAbility(abilityType) {
        const filteredCards = this.cardsData.cards.filter(card => 
            card.abilities && card.abilities[abilityType]
        );
        
        return filteredCards.map(cardData => 
            this.generateCard(cardData)
        ).join('\n');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardGenerator };
}
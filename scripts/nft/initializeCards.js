import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processSVGs, cardNameToFilename } from './preprocessSVGs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize cards onchain from cards.json and SVG data
 */

// Card type mapping
const CARD_TYPES = {
    'Chain': 0,
    'DeFi': 1, 
    'EOA': 2,
    'Action': 3
};

// Load processed SVG data
function loadCardSVGData() {
    const mappingPath = path.join(__dirname, '../../data/nft/cardSVGMapping.json');
    if (!fs.existsSync(mappingPath)) {
        console.error('SVG mapping not found. Run preprocessSVGs.js first.');
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
}

// Generate initialization data
function generateInitializationData() {
    const cardSVGData = loadCardSVGData();
    const initData = [];
    
    Object.keys(cardSVGData).forEach(cardName => {
        const cardData = cardSVGData[cardName];
        
        const init = {
            cardId: cardData.id,
            name: cardData.card.name,
            description: cardData.card.description,
            cost: cardData.card.cost,
            cardType: CARD_TYPES[cardData.card.cardType] || 0,
            svgData: cardData.svg,
            maxSupply: 0, // Unlimited by default
            abilities: Object.entries(cardData.card.abilities || {}).map(([type, data]) => ({
                abilityType: type,
                amount: data.amount || 0
            }))
        };
        
        initData.push(init);
    });
    
    return initData.sort((a, b) => a.cardId - b.cardId);
}

// Generate Solidity script for initialization
function generateSolidityScript(initData) {
    const template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../../src/nft/TokenTycoonCards.sol";

/**
 * @title InitializeCards
 * @notice Initialize all card metadata onchain
 */
contract InitializeCards is Script {
    
    function run() external {
        address cardsContract = vm.envAddress("CARDS_CONTRACT");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Initializing cards at:", cardsContract);
        
        TokenTycoonCards cards = TokenTycoonCards(cardsContract);
        
        vm.startBroadcast(deployerPrivateKey);
        
        ${initData.map((card, index) => `
        // Card ${card.cardId}: ${card.name}
        {
            bytes memory svgData = hex"${Buffer.from(card.svgData).toString('hex')}";
            cards.setCardMetadata(
                ${card.cardId}, // cardId
                "${card.name.replace(/"/g, '\\"')}", // name
                "${card.description.replace(/"/g, '\\"')}", // description  
                ${card.cost}, // cost
                TokenTycoonCards.CardType(${card.cardType}), // cardType
                svgData, // svgData
                ${card.maxSupply} // maxSupply
            );
            
            ${card.abilities.length > 0 ? `
            TokenTycoonCards.Ability[] memory abilities${index} = new TokenTycoonCards.Ability[](${card.abilities.length});
            ${card.abilities.map((ability, abilityIndex) => `
            abilities${index}[${abilityIndex}] = TokenTycoonCards.Ability("${ability.abilityType}", ${ability.amount});`).join('')}
            cards.setCardAbilities(${card.cardId}, abilities${index});
            ` : ''}
            
            cards.finalizeMetadata(${card.cardId});
            console.log("Initialized card ${card.cardId}: ${card.name}");
        }`).join('')}
        
        vm.stopBroadcast();
        
        console.log("All ${initData.length} cards initialized successfully!");
    }
}`;
    
    return template;
}

// Main execution
function main() {
    console.log('Generating card initialization data...');
    
    const initData = generateInitializationData();
    console.log(`Generated data for ${initData.length} cards`);
    
    // Generate Solidity script
    const solidityScript = generateSolidityScript(initData);
    const scriptPath = path.join(__dirname, '../../script/InitializeCards.s.sol');
    fs.writeFileSync(scriptPath, solidityScript);
    
    // Save initialization data as JSON for reference
    const dataPath = path.join(__dirname, '../../data/nft/cardInitData.json');
    fs.writeFileSync(dataPath, JSON.stringify(initData, null, 2));
    
    console.log(`Solidity script generated: ${scriptPath}`);
    console.log(`Data saved: ${dataPath}`);
    console.log(`\nTo run: forge script script/InitializeCards.s.sol --broadcast`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateInitializationData, generateSolidityScript };
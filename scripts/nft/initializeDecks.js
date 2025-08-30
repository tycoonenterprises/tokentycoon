import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize deck NFTs from decks.json
 */

// Load decks data
function loadDecksData() {
    const decksPath = path.join(__dirname, '../../data/decks.json');
    const decksData = JSON.parse(fs.readFileSync(decksPath, 'utf8'));
    return decksData.decks;
}

// Load card mapping to get card IDs
function loadCardMapping() {
    const mappingPath = path.join(__dirname, '../../data/nft/cardSVGMapping.json');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    // Create name to ID mapping
    const nameToId = {};
    Object.keys(mapping).forEach(cardName => {
        nameToId[cardName] = mapping[cardName].id;
    });
    
    return nameToId;
}

// Expand deck to 60 cards
function expandDeckTo60Cards(deck, nameToId) {
    const expanded = [];
    let totalCards = 0;
    
    // First, add all specified cards
    deck.cards.forEach(cardEntry => {
        const cardId = nameToId[cardEntry.name];
        if (cardId) {
            expanded.push({ cardId, quantity: cardEntry.count });
            totalCards += cardEntry.count;
        } else {
            console.warn(`Warning: Card "${cardEntry.name}" not found in mapping`);
        }
    });
    
    // If we have less than 60 cards, pad with the first card
    if (totalCards < 60 && expanded.length > 0) {
        const padding = 60 - totalCards;
        expanded[0].quantity += padding;
        console.log(`Padded deck "${deck.name}" with ${padding} additional "${expanded[0].cardId}" cards`);
    } else if (totalCards > 60) {
        console.warn(`Deck "${deck.name}" has ${totalCards} cards, trimming to 60`);
        // Trim excess cards (simple approach: reduce last card count)
        const excess = totalCards - 60;
        for (let i = expanded.length - 1; i >= 0 && excess > 0; i--) {
            const reduction = Math.min(expanded[i].quantity - 1, excess);
            expanded[i].quantity -= reduction;
            if (expanded[i].quantity === 0) {
                expanded.splice(i, 1);
            }
        }
    }
    
    return expanded;
}

// Generate simple deck artwork SVG
function generateDeckArtworkSVG(deckName, strategy) {
    return `<svg width="300" height="420" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1a1a2e"/>
    <rect x="10" y="10" width="280" height="400" rx="15" fill="#16213e" stroke="#0f3460" stroke-width="2"/>
    <text x="150" y="50" text-anchor="middle" fill="#e94560" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${deckName}</text>
    <text x="150" y="80" text-anchor="middle" fill="#f39c12" font-family="Arial, sans-serif" font-size="12">Token Tycoon Deck</text>
    <rect x="30" y="100" width="240" height="160" rx="10" fill="#0f3460" stroke="#e94560" stroke-width="1"/>
    <text x="150" y="130" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">Strategy:</text>
    <foreignObject x="40" y="140" width="220" height="110">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 9px; color: #ffffff; text-align: center; padding: 5px;">
            ${strategy.length > 200 ? strategy.substring(0, 200) + '...' : strategy}
        </div>
    </foreignObject>
    <rect x="30" y="280" width="240" height="80" rx="10" fill="#16213e" stroke="#f39c12" stroke-width="1"/>
    <text x="150" y="305" text-anchor="middle" fill="#f39c12" font-family="Arial, sans-serif" font-size="14" font-weight="bold">60 CARDS</text>
    <text x="150" y="325" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">Ready to Play</text>
    <text x="150" y="345" text-anchor="middle" fill="#e94560" font-family="Arial, sans-serif" font-size="8">Sealed Deck</text>
    <text x="150" y="400" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="8">tokentycoon.io</text>
</svg>`;
}

// Generate initialization data
function generateDeckInitData() {
    const decks = loadDecksData();
    const nameToId = loadCardMapping();
    const initData = [];
    
    decks.forEach((deck, index) => {
        const deckId = index + 1; // Deck IDs start at 1
        const composition = expandDeckTo60Cards(deck, nameToId);
        const artwork = generateDeckArtworkSVG(deck.name, deck.description);
        
        initData.push({
            deckId,
            name: deck.name,
            description: deck.description,
            strategy: deck.description, // Use description as strategy for now
            composition,
            svgData: artwork,
            maxSupply: 0, // Unlimited
            isPreconstructed: true
        });
    });
    
    return initData;
}

// Generate Solidity script
function generateDeckSolidityScript(initData) {
    const template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonDecks} from "../../src/nft/TokenTycoonDecks.sol";

/**
 * @title InitializeDecks
 * @notice Initialize all preconstructed deck metadata onchain
 */
contract InitializeDecks is Script {
    
    function run() external {
        address decksContract = vm.envAddress("DECKS_CONTRACT");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Initializing decks at:", decksContract);
        
        TokenTycoonDecks decks = TokenTycoonDecks(decksContract);
        
        vm.startBroadcast(deployerPrivateKey);
        
        ${initData.map((deck, index) => `
        // Deck ${deck.deckId}: ${deck.name}
        {
            bytes memory svgData = hex"${Buffer.from(deck.svgData).toString('hex')}";
            
            TokenTycoonDecks.CardCount[] memory composition = new TokenTycoonDecks.CardCount[](${deck.composition.length});
            ${deck.composition.map((card, cardIndex) => `
            composition[${cardIndex}] = TokenTycoonDecks.CardCount(${card.cardId}, ${card.quantity});`).join('')}
            
            decks.setDeckMetadata(
                ${deck.deckId}, // deckId
                "${deck.name.replace(/"/g, '\\"')}", // name
                "${deck.description.replace(/"/g, '\\"').substring(0, 100)}...", // description (truncated)
                "${deck.strategy.replace(/"/g, '\\"').substring(0, 200)}...", // strategy (truncated)
                composition, // composition
                svgData, // svgData
                ${deck.maxSupply}, // maxSupply
                ${deck.isPreconstructed} // isPreconstructed
            );
            
            decks.finalizeDeck(${deck.deckId});
            console.log("Initialized deck ${deck.deckId}: ${deck.name}");
        }`).join('')}
        
        vm.stopBroadcast();
        
        console.log("All ${initData.length} decks initialized successfully!");
    }
}`;
    
    return template;
}

// Main execution
function main() {
    console.log('Generating deck initialization data...');
    
    const initData = generateDeckInitData();
    console.log(`Generated data for ${initData.length} decks`);
    
    // Verify all decks have exactly 60 cards
    initData.forEach(deck => {
        const totalCards = deck.composition.reduce((sum, card) => sum + card.quantity, 0);
        console.log(`${deck.name}: ${totalCards} cards`);
        if (totalCards !== 60) {
            console.error(`ERROR: Deck ${deck.name} has ${totalCards} cards, should be 60`);
        }
    });
    
    // Generate Solidity script
    const solidityScript = generateDeckSolidityScript(initData);
    const scriptPath = path.join(__dirname, '../../script/InitializeDecks.s.sol');
    fs.writeFileSync(scriptPath, solidityScript);
    
    // Save initialization data
    const dataPath = path.join(__dirname, '../../data/nft/deckInitData.json');
    fs.writeFileSync(dataPath, JSON.stringify(initData, null, 2));
    
    console.log(`Solidity script generated: ${scriptPath}`);
    console.log(`Data saved: ${dataPath}`);
    console.log(`\nTo run: forge script script/InitializeDecks.s.sol --broadcast`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateDeckInitData, generateDeckSolidityScript };
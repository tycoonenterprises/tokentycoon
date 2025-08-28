import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Preprocesses SVG files for onchain storage
 * - Loads SVGs from frontend/public/v2/cards/
 * - Optimizes and minifies content
 * - Maps card names to SVG data
 */

// Transform card name to SVG filename
export function cardNameToFilename(cardName) {
    return cardName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-literal.svg';
}

// Optimize SVG content
export function optimizeSVG(svgContent) {
    return svgContent
        .replace(/<!--.*?-->/gs, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .replace(/\s+\/>/g, '/>') // Clean self-closing tags
        .replace(/"\s+/g, '"') // Clean attributes
        .trim();
}

// Load cards from JSON
function loadCards() {
    const cardsPath = path.join(__dirname, '../../data/cards.json');
    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
    return cardsData.cards;
}

// Process all SVGs
export function processSVGs() {
    const cards = loadCards();
    const svgDir = path.join(__dirname, '../../frontend/public/v2/cards');
    const outputDir = path.join(__dirname, '../../data/nft');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const cardSVGMap = {};
    const missingSVGs = [];
    let totalSize = 0;
    let optimizedSize = 0;
    
    console.log(`Processing ${cards.length} cards...`);
    
    cards.forEach((card, index) => {
        const svgFilename = cardNameToFilename(card.name);
        const svgPath = path.join(svgDir, svgFilename);
        
        if (fs.existsSync(svgPath)) {
            const originalSVG = fs.readFileSync(svgPath, 'utf8');
            const optimizedSVG = optimizeSVG(originalSVG);
            
            cardSVGMap[card.name] = {
                id: index + 1, // Token ID starts at 1
                filename: svgFilename,
                originalSize: originalSVG.length,
                optimizedSize: optimizedSVG.length,
                svg: optimizedSVG,
                card: {
                    name: card.name,
                    description: card.description,
                    cost: card.cost,
                    cardType: card.cardType,
                    abilities: card.abilities || {}
                }
            };
            
            totalSize += originalSVG.length;
            optimizedSize += optimizedSVG.length;
        } else {
            missingSVGs.push({
                name: card.name,
                expectedFile: svgFilename
            });
        }
    });
    
    // Write mapping file
    const mappingPath = path.join(outputDir, 'cardSVGMapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(cardSVGMap, null, 2));
    
    // Write missing SVGs report
    if (missingSVGs.length > 0) {
        const missingPath = path.join(outputDir, 'missingSVGs.json');
        fs.writeFileSync(missingPath, JSON.stringify(missingSVGs, null, 2));
    }
    
    // Calculate gas estimates
    const gasPerByte = 200; // Approximate gas per byte for SSTORE2
    const totalGas = optimizedSize * gasPerByte;
    const ethPrice = 2000; // USD per ETH
    const gasPrice = 30; // gwei
    const deploymentCost = (totalGas * gasPrice * 1e-9) * ethPrice;
    
    // Write summary
    const summary = {
        totalCards: cards.length,
        processedCards: Object.keys(cardSVGMap).length,
        missingCards: missingSVGs.length,
        totalOriginalSize: totalSize,
        totalOptimizedSize: optimizedSize,
        compressionRatio: ((1 - optimizedSize / totalSize) * 100).toFixed(2) + '%',
        estimatedGas: totalGas,
        estimatedCostUSD: deploymentCost.toFixed(2),
        averageSVGSize: Math.round(optimizedSize / Object.keys(cardSVGMap).length)
    };
    
    const summaryPath = path.join(outputDir, 'preprocessSummary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n=== SVG Preprocessing Summary ===');
    console.log(`Processed: ${summary.processedCards}/${summary.totalCards} cards`);
    console.log(`Missing SVGs: ${summary.missingCards}`);
    console.log(`Original size: ${(summary.totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`Optimized size: ${(summary.totalOptimizedSize / 1024).toFixed(2)} KB`);
    console.log(`Compression: ${summary.compressionRatio}`);
    console.log(`Average SVG size: ${summary.averageSVGSize} bytes`);
    console.log(`Estimated deployment gas: ${summary.estimatedGas.toLocaleString()}`);
    console.log(`Estimated cost: $${summary.estimatedCostUSD}`);
    
    if (missingSVGs.length > 0) {
        console.log('\nMissing SVGs for cards:');
        missingSVGs.slice(0, 10).forEach(m => {
            console.log(`  - ${m.name} (expected: ${m.expectedFile})`);
        });
        if (missingSVGs.length > 10) {
            console.log(`  ... and ${missingSVGs.length - 10} more`);
        }
    }
    
    console.log(`\nOutput written to: ${outputDir}`);
    return cardSVGMap;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    processSVGs();
}
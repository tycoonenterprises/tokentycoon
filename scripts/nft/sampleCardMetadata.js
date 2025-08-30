import fs from 'fs';
import { ethers } from 'ethers';
import path from 'path';

// Load deployed contracts
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI for metadata retrieval
const CARDS_ABI = [
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
    "function getCardAbilities(uint256 cardId) external view returns (tuple(string abilityType, uint256 amount)[])",
    "function uri(uint256 tokenId) external view returns (string)"
];

const CARD_TYPE_NAMES = ['Chain', 'DeFi', 'EOA', 'Action'];

// Helper to decode data from SSTORE2 pointer
async function decodePointer(provider, pointer, label = "data") {
    if (!pointer || pointer === '0x0000000000000000000000000000000000000000') {
        return null;
    }
    
    try {
        console.log(`    🔍 Following ${label} pointer: ${pointer}`);
        
        // SSTORE2 stores data as contract bytecode
        const bytecode = await provider.getCode(pointer);
        console.log(`    📊 Bytecode length: ${bytecode.length} chars (raw: "${bytecode.substring(0, 20)}...")`);
        
        if (bytecode === '0x' || bytecode.length <= 2) {
            return `No data stored at ${label} pointer`;
        }
        
        // For debugging: show the actual bytecode structure
        console.log(`    🔍 First 10 bytes: ${bytecode.substring(0, 22)}`);
        
        // SSTORE2 format: first byte is STOP opcode (0x00), rest is data
        let decodedData = null;
        let approach = '';
        let success = false;
        
        // Approach 1: Standard SSTORE2 (skip 0x00 prefix)
        if (bytecode.length > 4) {
            try {
                const dataHex = bytecode.slice(4); // Remove '0x00'
                if (dataHex.length > 0) {
                    decodedData = ethers.toUtf8String('0x' + dataHex);
                    approach = 'standard SSTORE2 (skip 0x00)';
                    success = true;
                }
            } catch (e1) {
                console.log(`    ⚠️  Standard SSTORE2 decode failed: ${e1.message.substring(0, 50)}`);
            }
        }
        
        // Approach 2: Direct decode (no prefix skip)
        if (!success) {
            try {
                decodedData = ethers.toUtf8String(bytecode);
                approach = 'direct decode (no skip)';
                success = true;
            } catch (e2) {
                console.log(`    ⚠️  Direct decode failed: ${e2.message.substring(0, 50)}`);
            }
        }
        
        // Approach 3: Skip different amounts (some implementations vary)
        if (!success && bytecode.length > 6) {
            try {
                const dataHex = bytecode.slice(6); // Skip 0x000
                if (dataHex.length > 0) {
                    decodedData = ethers.toUtf8String('0x' + dataHex);
                    approach = 'skip 3 bytes';
                    success = true;
                }
            } catch (e3) {
                console.log(`    ⚠️  Skip 3 bytes failed: ${e3.message.substring(0, 50)}`);
            }
        }
        
        // Approach 4: Try to decode as raw hex without UTF-8 conversion
        if (!success) {
            try {
                // Just return the hex data for analysis
                const dataHex = bytecode.slice(4);
                if (dataHex.length > 0) {
                    decodedData = `Raw hex data (${dataHex.length / 2} bytes): ${dataHex.substring(0, 100)}${dataHex.length > 100 ? '...' : ''}`;
                    approach = 'raw hex';
                    success = true;
                }
            } catch (e4) {
                console.log(`    ⚠️  Raw hex failed: ${e4.message.substring(0, 50)}`);
            }
        }
        
        if (success) {
            console.log(`    ✅ Decoded ${label} using ${approach} (${decodedData.length} chars)`);
            return decodedData;
        } else {
            return `Unable to decode ${label} from ${bytecode.length} bytes of bytecode`;
        }
        
    } catch (error) {
        return `Error following ${label} pointer: ${error.message}`;
    }
}

// Try to get the token URI as well
async function getTokenURI(contract, cardId) {
    try {
        console.log(`    🌐 Getting token URI for card ${cardId}...`);
        const uri = await contract.uri(cardId);
        
        if (!uri) {
            return 'Empty URI';
        }
        
        if (uri.startsWith('data:application/json;base64,')) {
            // Decode base64 JSON
            const base64Data = uri.replace('data:application/json;base64,', '');
            const jsonString = Buffer.from(base64Data, 'base64').toString('utf8');
            const parsed = JSON.parse(jsonString);
            console.log(`    ✅ Decoded base64 JSON URI (${Object.keys(parsed).length} keys)`);
            return parsed;
        } else if (uri.startsWith('data:application/json,')) {
            // Plain JSON
            const jsonString = uri.replace('data:application/json,', '');
            const parsed = JSON.parse(decodeURIComponent(jsonString));
            console.log(`    ✅ Decoded plain JSON URI (${Object.keys(parsed).length} keys)`);
            return parsed;
        } else if (uri.startsWith('data:image/svg+xml;base64,')) {
            console.log(`    ✅ Found base64 SVG URI (${uri.length} chars)`);
            return uri;
        } else if (uri.startsWith('data:')) {
            console.log(`    ✅ Found data URI (${uri.length} chars)`);
            return uri;
        }
        
        console.log(`    ✅ Found URI: ${uri.substring(0, 100)}...`);
        return uri;
    } catch (error) {
        console.log(`    ❌ URI error: ${error.message.substring(0, 100)}`);
        return `URI Error: ${error.message}`;
    }
}

// Save downloaded data to files for inspection
function saveDataToFiles(cardId, svgData, jsonData, tokenURI) {
    try {
        // Create output directory
        const outputDir = './temp/card-downloads';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const baseFilename = `card-${cardId}`;
        
        // Save SVG data if it exists and is valid
        if (svgData && typeof svgData === 'string' && svgData.includes('<svg')) {
            const svgPath = path.join(outputDir, `${baseFilename}.svg`);
            fs.writeFileSync(svgPath, svgData, 'utf8');
            console.log(`    💾 Saved SVG to: ${svgPath}`);
        }
        
        // Save JSON data if it exists
        if (jsonData && typeof jsonData === 'string') {
            try {
                // Try to parse and pretty-format the JSON
                const parsed = JSON.parse(jsonData);
                const jsonPath = path.join(outputDir, `${baseFilename}-metadata.json`);
                fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');
                console.log(`    💾 Saved JSON metadata to: ${jsonPath}`);
            } catch {
                // Save as raw text if not valid JSON
                const textPath = path.join(outputDir, `${baseFilename}-metadata.txt`);
                fs.writeFileSync(textPath, jsonData, 'utf8');
                console.log(`    💾 Saved raw metadata to: ${textPath}`);
            }
        }
        
        // Save token URI data (the working URI)
        if (tokenURI && typeof tokenURI === 'object') {
            const uriPath = path.join(outputDir, `${baseFilename}-uri.json`);
            fs.writeFileSync(uriPath, JSON.stringify(tokenURI, null, 2), 'utf8');
            console.log(`    💾 Saved token URI to: ${uriPath}`);
            
            // If the URI contains an SVG image, extract and save it
            if (tokenURI.image && tokenURI.image.startsWith('data:image/svg+xml;base64,')) {
                try {
                    const base64Data = tokenURI.image.replace('data:image/svg+xml;base64,', '');
                    const svgContent = Buffer.from(base64Data, 'base64').toString('utf8');
                    const uriSvgPath = path.join(outputDir, `${baseFilename}-uri.svg`);
                    fs.writeFileSync(uriSvgPath, svgContent, 'utf8');
                    console.log(`    💾 Saved URI SVG to: ${uriSvgPath}`);
                } catch (e) {
                    console.log(`    ⚠️  Could not extract URI SVG: ${e.message}`);
                }
            }
        }
        
    } catch (error) {
        console.log(`    ⚠️  Error saving files: ${error.message}`);
    }
}

// Helper to format metadata nicely
function formatMetadata(cardId, metadata, abilities, svgData, jsonData, tokenURI) {
    const typeEmoji = ['🔗', '💰', '👤', '⚡'][metadata.cardType] || '❓';
    
    let result = `
==================================================
🎴 CARD ${cardId}: ${metadata.name}
==================================================
${typeEmoji} Type: ${CARD_TYPE_NAMES[metadata.cardType]} (${metadata.cardType})
💎 Cost: ${metadata.cost} ETH
📝 Description: "${metadata.description}"

🎯 Abilities (${abilities.length}):
${abilities.map(ability => `   • ${ability.abilityType}: ${ability.amount}`).join('\n') || '   No abilities'}

📊 Supply:
   Max Supply: ${metadata.maxSupply === 0n ? 'Unlimited' : metadata.maxSupply.toString()}
   Total Minted: ${metadata.totalMinted}
   Tradeable: ${metadata.tradeable ? '✅' : '❌'}
   Finalized: ${metadata.finalized ? '🔒' : '🔓'}

🔗 Pointers:
   SVG Pointer: ${metadata.svgPointer}
   JSON Pointer: ${metadata.jsonPointer}
   Content Hash: ${metadata.contentHash}`;

    // Add SVG data section
    if (svgData) {
        result += `\n\n🎨 SVG Data (${svgData.length} characters):`;
        if (svgData.length < 200) {
            result += `\n   ${svgData}`;
        } else if (svgData.includes('<svg')) {
            // Show SVG structure
            const svgStart = svgData.substring(0, 150);
            result += `\n   ${svgStart}...`;
        } else {
            result += `\n   [Binary/encoded data - ${svgData.length} chars]`;
        }
    } else {
        result += `\n\n🎨 SVG Data: None`;
    }

    // Add JSON data section
    if (jsonData) {
        result += `\n\n📋 JSON Data (${jsonData.length} characters):`;
        if (jsonData.length < 300) {
            result += `\n   ${jsonData}`;
        } else {
            try {
                const parsed = JSON.parse(jsonData);
                result += `\n   Parsed JSON keys: ${Object.keys(parsed).join(', ')}`;
                result += `\n   Preview: ${JSON.stringify(parsed).substring(0, 150)}...`;
            } catch {
                result += `\n   [Raw data - ${jsonData.length} chars]: ${jsonData.substring(0, 100)}...`;
            }
        }
    } else {
        result += `\n\n📋 JSON Data: None`;
    }

    // Add token URI section
    if (tokenURI) {
        result += `\n\n🌐 Token URI:`;
        if (typeof tokenURI === 'object') {
            result += `\n   Decoded JSON with keys: ${Object.keys(tokenURI).join(', ')}`;
            if (tokenURI.name) result += `\n   • Name: ${tokenURI.name}`;
            if (tokenURI.description) result += `\n   • Description: ${tokenURI.description}`;
            if (tokenURI.image) result += `\n   • Image: ${tokenURI.image.substring(0, 50)}...`;
            if (tokenURI.attributes) result += `\n   • Attributes: ${tokenURI.attributes.length} items`;
        } else if (tokenURI.startsWith('data:')) {
            result += `\n   Data URI (${tokenURI.length} chars)`;
        } else {
            result += `\n   ${tokenURI}`;
        }
    } else {
        result += `\n\n🌐 Token URI: None`;
    }

    result += `\n==================================================`;
    return result;
}

async function main() {
    console.log("🔍 Card Metadata Sampler");
    console.log("========================");
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    let cardIds = [];
    let count = 5; // Default sample size
    let saveFiles = args.includes('--save');
    
    if (args.length === 0) {
        // Generate random card IDs
        cardIds = Array.from({length: count}, () => Math.floor(Math.random() * 91) + 1);
        console.log(`📋 Sampling ${count} random cards: [${cardIds.join(', ')}]`);
    } else if (args[0] === '--count' && args[1]) {
        // Custom count of random cards
        count = parseInt(args[1]) || 5;
        cardIds = Array.from({length: count}, () => Math.floor(Math.random() * 91) + 1);
        console.log(`📋 Sampling ${count} random cards: [${cardIds.join(', ')}]`);
    } else if (args[0] === '--cards') {
        // Specific card IDs
        cardIds = args.slice(1).map(id => parseInt(id)).filter(id => !isNaN(id) && id >= 1 && id <= 91);
        console.log(`📋 Sampling specific cards: [${cardIds.join(', ')}]`);
    } else if (args[0] === '--range' && args[1] && args[2]) {
        // Range of cards
        const start = parseInt(args[1]) || 1;
        const end = parseInt(args[2]) || 91;
        cardIds = Array.from({length: end - start + 1}, (_, i) => start + i);
        console.log(`📋 Sampling card range: ${start}-${end}`);
    } else {
        // Treat all args as card IDs
        cardIds = args.map(id => parseInt(id)).filter(id => !isNaN(id) && id >= 1 && id <= 91);
        if (cardIds.length === 0) {
            cardIds = [1, 25, 50, 75, 91]; // Default sample
        }
        console.log(`📋 Sampling cards: [${cardIds.join(', ')}]`);
    }
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Connect to contract
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        provider
    );
    
    console.log(`🔗 Contract: ${deployedContracts.TokenTycoonCards}`);
    console.log(`📡 Provider: Base Sepolia\n`);
    
    // Sample each card
    for (let i = 0; i < cardIds.length; i++) {
        const cardId = cardIds[i];
        
        try {
            console.log(`[${i + 1}/${cardIds.length}] Fetching Card ${cardId}...`);
            
            // Get metadata and abilities in parallel
            const [metadata, abilities] = await Promise.all([
                cardsContract.getCardMetadata(cardId),
                cardsContract.getCardAbilities(cardId)
            ]);
            
            // Follow all pointers in parallel
            const [svgData, jsonData, tokenURI] = await Promise.all([
                decodePointer(provider, metadata.svgPointer, 'SVG'),
                decodePointer(provider, metadata.jsonPointer, 'JSON'),
                getTokenURI(cardsContract, cardId)
            ]);
            
            // Save downloaded data to files for inspection (if requested)
            if (saveFiles) {
                saveDataToFiles(cardId, svgData, jsonData, tokenURI);
            }
            
            // Format and display
            console.log(formatMetadata(cardId, metadata, abilities, svgData, jsonData, tokenURI));
            
            // Add delay between requests to avoid rate limiting
            if (i < cardIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error(`❌ Failed to fetch Card ${cardId}: ${error.message}`);
            continue;
        }
    }
    
    console.log(`\n✅ Sampled ${cardIds.length} cards successfully!`);
    console.log(`\n💡 Usage examples:`);
    console.log(`   node scripts/nft/sampleCardMetadata.js                    # 5 random cards`);
    console.log(`   node scripts/nft/sampleCardMetadata.js --count 10         # 10 random cards`);
    console.log(`   node scripts/nft/sampleCardMetadata.js 1 25 50 91        # specific cards`);
    console.log(`   node scripts/nft/sampleCardMetadata.js --cards 1 5 10    # specific cards`);
    console.log(`   node scripts/nft/sampleCardMetadata.js --range 1 10      # card range 1-10`);
    console.log(`   node scripts/nft/sampleCardMetadata.js --range 1 5 --save # save downloaded files`);
}

// Handle errors
main().catch(error => {
    console.error("❌ Script failed:", error);
    process.exit(1);
});
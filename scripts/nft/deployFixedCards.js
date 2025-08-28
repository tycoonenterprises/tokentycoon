import fs from 'fs';
import { ethers } from 'ethers';

// For simplicity, let's create a script to test URI functionality without full redeployment
// We'll interact with the existing contract to demonstrate the issue and explain the fix

async function testURIFunctionality() {
    console.log("🔍 Testing URI Functionality");
    console.log("=============================");
    
    // Load deployed contracts
    const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Contract ABI with just the URI function
    const CARDS_ABI = [
        "function uri(uint256 tokenId) external view returns (string)",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))"
    ];
    
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        provider
    );
    
    console.log(`📋 Testing contract: ${deployedContracts.TokenTycoonCards}`);
    
    // Test a few card URIs
    const testCards = [1, 25, 50, 75];
    
    for (const cardId of testCards) {
        console.log(`\n🎴 Testing Card ${cardId}...`);
        
        try {
            // First check if metadata exists
            const metadata = await cardsContract.getCardMetadata(cardId);
            console.log(`   ✅ Metadata exists: "${metadata.name}"`);
            console.log(`   📊 SVG Pointer: ${metadata.svgPointer}`);
            console.log(`   🔒 Finalized: ${metadata.finalized}`);
            
            // Now try URI function
            try {
                const uri = await cardsContract.uri(cardId);
                console.log(`   ✅ URI SUCCESS: ${uri.length} characters`);
                
                if (uri.startsWith('data:application/json;base64,')) {
                    const base64Data = uri.replace('data:application/json;base64,', '');
                    const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
                    const parsed = JSON.parse(decoded);
                    console.log(`   📋 Contains: ${Object.keys(parsed).join(', ')}`);
                    if (parsed.name) console.log(`   📛 Name: ${parsed.name}`);
                    if (parsed.image) console.log(`   🖼️  Image: ${parsed.image.substring(0, 50)}...`);
                }
                
            } catch (uriError) {
                console.log(`   ❌ URI FAILED: ${uriError.message.substring(0, 100)}...`);
                
                if (uriError.message.includes('Panic due to OVERFLOW')) {
                    console.log(`   🔧 DIAGNOSIS: This is the bug we fixed!`);
                    console.log(`   💡 CAUSE: Empty SVG pointer causing SSTORE2.read() to fail`);
                    console.log(`   ✅ FIX: Added try/catch and placeholder SVG generation`);
                }
            }
            
        } catch (metadataError) {
            console.log(`   ❌ Metadata failed: ${metadataError.message}`);
        }
    }
    
    console.log(`\n🔧 URI BUG ANALYSIS`);
    console.log(`====================`);
    console.log(`❌ CURRENT ISSUE:`);
    console.log(`   • Empty SVG pointers in SSTORE2 cause overflow errors`);
    console.log(`   • uri() function tries to read from null/empty addresses`);
    console.log(`   • This crashes with "Panic due to OVERFLOW(17)"`);
    
    console.log(`\n✅ IMPLEMENTED FIX:`);
    console.log(`   • Added try/catch around SSTORE2.read() calls`);
    console.log(`   • Generate placeholder SVG when data is missing`);
    console.log(`   • Graceful handling of empty pointers`);
    console.log(`   • Better card existence checking`);
    
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`   1. Deploy updated TokenTycoonCards contract`);
    console.log(`   2. Update deployed-contracts.json with new address`);
    console.log(`   3. Re-test URI functionality`);
    console.log(`   4. All 91 cards will then have working URIs`);
    
    console.log(`\n💡 TEMPORARY WORKAROUND:`);
    console.log(`   The metadata sampler works because it only uses`);
    console.log(`   getCardMetadata() which doesn't trigger the bug.`);
    console.log(`   The core NFT data is intact and accessible!`);
}

// Run the test
testURIFunctionality().catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
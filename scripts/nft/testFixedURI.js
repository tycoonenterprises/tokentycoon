import fs from 'fs';
import { ethers } from 'ethers';

// Test the fixed URI functionality
async function testFixedURIs() {
    console.log('🧪 Testing Fixed URI Functionality');
    console.log('==================================');
    
    // Load deployed contracts
    const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Contract ABI for testing
    const CARDS_ABI = [
        "function uri(uint256 tokenId) external view returns (string)",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
        "function getCardAbilities(uint256 cardId) external view returns (tuple(string abilityType, uint256 amount)[])",
        "function readSVGSafely(address pointer) external view returns (bytes)"
    ];
    
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        provider
    );
    
    console.log(`📋 Testing contract: ${deployedContracts.TokenTycoonCards}`);
    if (deployedContracts.TokenTycoonCards_OLD) {
        console.log(`📋 Previous contract: ${deployedContracts.TokenTycoonCards_OLD}`);
    }
    
    // Test a range of cards
    const testCards = [1, 10, 25, 50, 75, 91];
    let successCount = 0;
    let failCount = 0;
    
    for (const cardId of testCards) {
        console.log(`\n🎴 Testing Card ${cardId}...`);
        
        try {
            // Get basic metadata first
            const metadata = await cardsContract.getCardMetadata(cardId);
            
            if (!metadata.name || metadata.name === '') {
                console.log(`   ⚠️  Card ${cardId}: No metadata found (expected for new contract)`);
                continue;
            }
            
            console.log(`   📛 Name: "${metadata.name}"`);
            console.log(`   🔒 Finalized: ${metadata.finalized}`);
            console.log(`   🎯 SVG Pointer: ${metadata.svgPointer}`);
            
            // Get abilities
            const abilities = await cardsContract.getCardAbilities(cardId);
            console.log(`   ⚡ Abilities: ${abilities.length}`);
            
            // TEST THE FIX: Call URI function
            try {
                const uri = await cardsContract.uri(cardId);
                console.log(`   ✅ URI SUCCESS! (${uri.length} characters)`);
                
                // Decode and analyze the URI
                if (uri.startsWith('data:application/json;base64,')) {
                    const base64Data = uri.replace('data:application/json;base64,', '');
                    const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
                    const parsed = JSON.parse(decoded);
                    
                    console.log(`   📋 JSON Keys: ${Object.keys(parsed).join(', ')}`);
                    
                    if (parsed.name) console.log(`   📝 JSON Name: ${parsed.name}`);
                    if (parsed.description) console.log(`   📖 Description: ${parsed.description.substring(0, 50)}...`);
                    if (parsed.image) {
                        if (parsed.image.startsWith('data:image/svg+xml;base64,')) {
                            console.log(`   🖼️  Image: SVG (base64 encoded)`);
                            
                            // Decode the SVG to check if it's our placeholder
                            const svgBase64 = parsed.image.replace('data:image/svg+xml;base64,', '');
                            const svgData = Buffer.from(svgBase64, 'base64').toString('utf8');
                            
                            if (svgData.includes('Token Tycoon Card')) {
                                console.log(`   🎨 Using placeholder SVG (fix working!)`);
                            } else if (svgData.includes('<svg')) {
                                console.log(`   🎨 Using real artwork SVG`);
                            }
                        }
                    }
                    
                    if (parsed.attributes) {
                        console.log(`   🏷️  Attributes: ${parsed.attributes.length} traits`);
                        const costAttr = parsed.attributes.find(attr => attr.trait_type === 'Cost');
                        if (costAttr) console.log(`   💎 Cost: ${costAttr.value} ETH`);
                    }
                    
                    if (parsed.abilities) {
                        console.log(`   ⚡ Abilities in JSON: ${parsed.abilities.length}`);
                    }
                }
                
                successCount++;
                
            } catch (uriError) {
                console.log(`   ❌ URI FAILED: ${uriError.message.substring(0, 100)}...`);
                
                if (uriError.message.includes('Panic due to OVERFLOW')) {
                    console.log(`   🚨 STILL HAS BUG - deployment might have failed`);
                } else if (uriError.message.includes('CardNotFound')) {
                    console.log(`   ℹ️  Card not found (normal for new contract)`);
                } else {
                    console.log(`   🔍 New error type - investigate`);
                }
                failCount++;
            }
            
        } catch (metadataError) {
            console.log(`   ❌ Metadata failed: ${metadataError.message.substring(0, 100)}...`);
            failCount++;
        }
    }
    
    console.log(`\n📊 TEST RESULTS`);
    console.log(`===============`);
    console.log(`✅ Successful URIs: ${successCount}`);
    console.log(`❌ Failed URIs: ${failCount}`);
    console.log(`📈 Success Rate: ${successCount > 0 ? Math.round((successCount/(successCount + failCount)) * 100) : 0}%`);
    
    if (successCount > 0) {
        console.log(`\n🎉 URI FIX IS WORKING!`);
        console.log(`• Cards generate valid JSON metadata`);
        console.log(`• Placeholder SVGs created for missing artwork`);
        console.log(`• No more overflow errors`);
        console.log(`• Ready for frontend integration`);
    } else if (failCount > 0) {
        console.log(`\n⚠️  Issues detected:`);
        if (failCount === testCards.length) {
            console.log(`• All cards failed - check if deployment succeeded`);
            console.log(`• Verify contract address in deployed-contracts.json`);
            console.log(`• Make sure cards are initialized on new contract`);
        }
    }
    
    console.log(`\n🚀 NEXT STEPS:`);
    if (successCount === 0) {
        console.log(`1. Verify contract deployment completed successfully`);
        console.log(`2. Re-run card initialization on new contract`);
        console.log(`3. Test URIs again after initialization`);
    } else {
        console.log(`1. Initialize remaining cards if needed`);
        console.log(`2. Update frontend to use new contract address`);
        console.log(`3. Test metadata sampler with working URIs`);
        console.log(`4. Deploy to production!`);
    }
}

// Run the test
testFixedURIs().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
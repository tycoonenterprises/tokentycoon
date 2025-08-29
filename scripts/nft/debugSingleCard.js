import fs from 'fs';
import { ethers } from 'ethers';

// Debug single card initialization
async function debugSingleCard() {
    console.log('🔍 Debug Single Card Initialization');
    console.log('===================================');
    
    // Setup
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const privateKey = "0xad17ea4e1dee854ab5a563869bba2ba8168153826359270b90913f9f4349a251";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Load data
    const cardInitData = JSON.parse(fs.readFileSync('./data/nft/cardInitData.json', 'utf8'));
    const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));
    
    const card = cardInitData[0]; // Test card 1
    
    console.log(`📋 Testing with Card ${card.cardId}: ${card.name}`);
    console.log(`💾 SVG Data Length: ${card.svgData.length} characters`);
    console.log(`📝 First 100 chars: ${card.svgData.substring(0, 100)}...`);
    
    // Contract ABI 
    const CARDS_ABI = [
        "function setCardMetadata(uint256 cardId, string name, string description, uint256 cost, uint8 cardType, bytes svgData, uint256 maxSupply) external",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))"
    ];
    
    const contract = new ethers.Contract(deployedContracts.TokenTycoonCards, CARDS_ABI, wallet);
    
    // Convert SVG string to bytes
    console.log('\n🔄 Converting SVG to bytes...');
    const svgBytes = ethers.toUtf8Bytes(card.svgData);
    console.log(`📊 SVG Bytes Length: ${svgBytes.length}`);
    
    // Check current state
    console.log('\n📋 Checking current card state...');
    try {
        const metadata = await contract.getCardMetadata(card.cardId);
        console.log(`   Name: "${metadata.name}"`);
        console.log(`   SVG Pointer: ${metadata.svgPointer}`);
        console.log(`   JSON Pointer: ${metadata.jsonPointer}`);
        console.log(`   Finalized: ${metadata.finalized}`);
        
        if (metadata.svgPointer !== "0x0000000000000000000000000000000000000000") {
            // Try to read from the SVG pointer directly
            console.log('\n🔍 Testing SSTORE2 read...');
            
            // Read from SSTORE2 pointer manually
            const code = await provider.getCode(metadata.svgPointer);
            console.log(`   Contract code length: ${code.length} chars`);
            
            if (code.length > 2) { // "0x" is empty
                // Try to extract data - SSTORE2 stores data after a single STOP byte (0x00)
                const dataHex = code.slice(4); // Remove 0x00 prefix
                if (dataHex.length > 0) {
                    try {
                        const dataBytes = ethers.toUtf8String("0x" + dataHex);
                        console.log(`   ✅ Successfully decoded: ${dataBytes.substring(0, 100)}...`);
                    } catch (e) {
                        console.log(`   ❌ Failed to decode as UTF-8: ${e.message}`);
                        console.log(`   📊 Raw hex length: ${dataHex.length}`);
                    }
                } else {
                    console.log(`   ❌ No data in contract`);
                }
            } else {
                console.log(`   ❌ No code at SVG pointer address`);
            }
        }
        
    } catch (error) {
        console.log(`   ❌ Error reading metadata: ${error.message}`);
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('The SVG data exists in our initialization file but may not be stored correctly in SSTORE2.');
    console.log('This suggests the SSTORE2.write() operation is not working as expected.');
    
}

debugSingleCard().catch(console.error);
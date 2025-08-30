import { ethers } from 'ethers';

// Calculate contract address from deployer address and nonce
async function calculateContractAddress() {
    console.log('🧮 Calculate Contract Address');
    console.log('=============================');
    
    const deployerAddress = "0xBAdAd51de865b9d880b184f3cba6f7240e284506";
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Get current nonce
    const currentNonce = await provider.getTransactionCount(deployerAddress);
    console.log(`📊 Current nonce: ${currentNonce}`);
    
    // The contract was deployed recently, so try the last few nonces
    for (let nonce = currentNonce - 10; nonce < currentNonce; nonce++) {
        const contractAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: nonce
        });
        
        console.log(`🔍 Nonce ${nonce}: ${contractAddress}`);
        
        // Check if this address has code (indicating a deployed contract)
        try {
            const code = await provider.getCode(contractAddress);
            if (code !== '0x') {
                console.log(`   ✅ Has code (${code.length} bytes)`);
                
                // Test if it's our TokenTycoonCards contract
                await testIfOurContract(provider, contractAddress, nonce);
            }
        } catch (error) {
            // Ignore errors for non-existent addresses
        }
    }
}

async function testIfOurContract(provider, contractAddress, nonce) {
    console.log(`\n🧪 Testing if ${contractAddress} is TokenTycoonCards...`);
    
    const CARDS_ABI = [
        "function uri(uint256 tokenId) external view returns (string)",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
        "function hasRole(bytes32 role, address account) external view returns (bool)",
        "function ADMIN_ROLE() external view returns (bytes32)"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, CARDS_ABI, provider);
        
        // Check if it has our specific functions
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdmin = await contract.hasRole(adminRole, "0xBAdAd51de865b9d880b184f3cba6f7240e284506");
        
        console.log(`   📋 Admin role: ${adminRole}`);
        console.log(`   👤 Has admin: ${hasAdmin}`);
        
        if (hasAdmin) {
            console.log(`\n🎉 FOUND IT! This is the new TokenTycoonCards contract!`);
            console.log(`   📍 Address: ${contractAddress}`);
            console.log(`   🔢 Deployed at nonce: ${nonce}`);
            
            // Test the URI fix
            try {
                await contract.uri(1);
                console.log(`   ✅ URI function works (no overflow!)`);
            } catch (error) {
                if (error.message.includes('CardNotFound')) {
                    console.log(`   ✅ URI function works (CardNotFound expected)`);
                } else {
                    console.log(`   ❌ URI issue: ${error.message.substring(0, 50)}`);
                }
            }
            
            console.log(`\n📝 UPDATE REQUIRED:`);
            console.log(`Update data/nft/deployed-contracts.json:`);
            console.log(`{`);
            console.log(`  "TokenTycoonCards": "${contractAddress}",`);
            console.log(`  "TokenTycoonCards_OLD": "0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16"`);
            console.log(`}`);
            
            return true;
        }
        
    } catch (error) {
        // Not our contract or error accessing it
        console.log(`   ❌ Not TokenTycoonCards: ${error.message.substring(0, 50)}`);
    }
    
    return false;
}

calculateContractAddress().catch(console.error);
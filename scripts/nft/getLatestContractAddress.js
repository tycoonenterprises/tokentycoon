import { ethers } from 'ethers';

async function getLatestContractAddress() {
    console.log('🔍 Finding latest deployed contract address...');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const deployerAddress = "0xBAdAd51de865b9d880b184f3cba6f7240e284506";
    
    // Get current nonce to calculate the most recent deployment
    const currentNonce = await provider.getTransactionCount(deployerAddress);
    console.log(`Current nonce: ${currentNonce}`);
    
    // Calculate the contract address for the most recent deployment
    // Since we just deployed, it should be currentNonce - 1
    const lastNonce = currentNonce - 1;
    const contractAddress = ethers.getCreateAddress({
        from: deployerAddress,
        nonce: lastNonce
    });
    
    console.log(`\n🎯 Latest deployed contract should be at:`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Deployed at nonce: ${lastNonce}`);
    
    // Verify it has code
    const code = await provider.getCode(contractAddress);
    if (code !== '0x') {
        console.log(`   ✅ Contract has code (${code.length} chars)`);
        
        // Test basic functionality
        const minimalABI = [
            "function supportsInterface(bytes4 interfaceId) view returns (bool)"
        ];
        
        try {
            const contract = new ethers.Contract(contractAddress, minimalABI, provider);
            const supportsERC165 = await contract.supportsInterface("0x01ffc9a7");
            console.log(`   ✅ ERC165 support: ${supportsERC165}`);
            
            console.log(`\n📝 Update deployed-contracts.json with:`);
            console.log(`   "TokenTycoonCards": "${contractAddress}"`);
            
            return contractAddress;
            
        } catch (error) {
            console.log(`   ❌ Contract test failed: ${error.message}`);
        }
    } else {
        console.log(`   ❌ No code at this address`);
    }
}

getLatestContractAddress().catch(console.error);
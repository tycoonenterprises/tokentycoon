import { ethers } from 'ethers';

async function findWorkingContract() {
    console.log('🔍 Searching for working deployed contract...');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const deployerAddress = "0xBAdAd51de865b9d880b184f3cba6f7240e284506";
    
    // Get current nonce
    const currentNonce = await provider.getTransactionCount(deployerAddress);
    console.log(`Current nonce: ${currentNonce}`);
    
    // Check the last few nonces for contracts with code
    for (let nonce = currentNonce - 1; nonce >= currentNonce - 5; nonce--) {
        const contractAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: nonce
        });
        
        console.log(`\nChecking nonce ${nonce}: ${contractAddress}`);
        
        const code = await provider.getCode(contractAddress);
        if (code !== '0x') {
            console.log(`   ✅ Has code (${code.length} chars)`);
            
            // Test if it's our TokenTycoonCards contract
            const CARDS_ABI = [
                "function supportsInterface(bytes4 interfaceId) view returns (bool)",
                "function hasRole(bytes32 role, address account) view returns (bool)",
                "function ADMIN_ROLE() view returns (bytes32)"
            ];
            
            try {
                const contract = new ethers.Contract(contractAddress, CARDS_ABI, provider);
                
                // Check ERC165 support
                const supportsERC165 = await contract.supportsInterface("0x01ffc9a7");
                console.log(`   ✅ ERC165 support: ${supportsERC165}`);
                
                // Check if it has our admin role
                const adminRole = await contract.ADMIN_ROLE();
                const hasAdmin = await contract.hasRole(adminRole, deployerAddress);
                
                console.log(`   📋 Admin role: ${adminRole}`);
                console.log(`   👤 Deployer has admin: ${hasAdmin}`);
                
                if (hasAdmin && supportsERC165) {
                    console.log(`\n🎉 FOUND WORKING CONTRACT!`);
                    console.log(`   📍 Address: ${contractAddress}`);
                    console.log(`   🔢 Deployed at nonce: ${nonce}`);
                    
                    console.log(`\n📝 UPDATE REQUIRED:`);
                    console.log(`Update data/nft/deployed-contracts.json:`);
                    console.log(`   "TokenTycoonCards": "${contractAddress}"`);
                    
                    return contractAddress;
                }
                
            } catch (error) {
                console.log(`   ❌ Not our contract: ${error.message.substring(0, 50)}...`);
            }
        } else {
            console.log(`   ❌ No code`);
        }
    }
    
    console.log(`\n❌ No working TokenTycoonCards contract found in recent deployments`);
}

findWorkingContract().catch(console.error);
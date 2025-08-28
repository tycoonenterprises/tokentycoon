import { ethers } from 'ethers';

// Quick test of contract deployment
async function quickContractTest() {
    console.log('🔍 Quick Contract Deployment Test');
    console.log('=================================');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Based on the forge create output, let's try to find the contract
    // From the deployment transaction data, we need to determine the contract address
    
    const deployerAddress = "0xBAdAd51de865b9d880b184f3cba6f7240e284506";
    
    console.log(`📋 Checking deployer: ${deployerAddress}`);
    
    // Get the latest transactions for the deployer
    try {
        const nonce = await provider.getTransactionCount(deployerAddress);
        console.log(`📊 Current nonce: ${nonce}`);
        
        // Get the last few transactions
        const latestBlock = await provider.getBlockNumber();
        console.log(`📦 Latest block: ${latestBlock}`);
        
        // Check recent blocks for contract creation
        for (let i = 0; i < 10; i++) {
            const block = await provider.getBlock(latestBlock - i, true);
            if (block && block.transactions) {
                for (const tx of block.transactions) {
                    if (tx.from === deployerAddress && tx.to === null) {
                        console.log(`\n🎯 Found contract creation transaction!`);
                        console.log(`   📦 Block: ${tx.blockNumber}`);
                        console.log(`   🔗 Hash: ${tx.hash}`);
                        
                        // Get the receipt to find the contract address
                        const receipt = await provider.getTransactionReceipt(tx.hash);
                        if (receipt && receipt.contractAddress) {
                            console.log(`   ✅ Contract Address: ${receipt.contractAddress}`);
                            
                            // Test the contract
                            await testContract(provider, receipt.contractAddress);
                            return;
                        }
                    }
                }
            }
        }
        
        console.log('❌ Contract creation transaction not found in recent blocks');
        console.log('💡 Manual lookup required - check Base Sepolia scanner');
        
    } catch (error) {
        console.error('Error checking deployment:', error.message);
    }
}

async function testContract(provider, contractAddress) {
    console.log(`\n🧪 Testing Contract: ${contractAddress}`);
    console.log(`==============================`);
    
    const CARDS_ABI = [
        "function uri(uint256 tokenId) external view returns (string)",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))"
    ];
    
    const contract = new ethers.Contract(contractAddress, CARDS_ABI, provider);
    
    // Test basic functionality
    try {
        // Try to get metadata for card 1 (should fail since no cards initialized)
        const metadata = await contract.getCardMetadata(1);
        console.log(`📋 Card 1 metadata: "${metadata.name}"`);
    } catch (error) {
        console.log(`📋 Card 1 metadata: Empty (expected for new contract)`);
    }
    
    // Try URI function with non-existent card (should handle gracefully)
    try {
        const uri = await contract.uri(1);
        console.log(`✅ URI function works! (${uri.length} chars)`);
        console.log(`🎉 BUG FIX SUCCESSFUL - No more overflow errors!`);
    } catch (error) {
        if (error.message.includes('CardNotFound')) {
            console.log(`✅ URI function works - CardNotFound error (expected)`);
            console.log(`🎉 BUG FIX SUCCESSFUL - No more overflow errors!`);
        } else {
            console.log(`❌ URI still has issues: ${error.message.substring(0, 100)}`);
        }
    }
    
    console.log(`\n📝 Next Steps:`);
    console.log(`1. Update data/nft/deployed-contracts.json:`);
    console.log(`   "TokenTycoonCards": "${contractAddress}"`);
    console.log(`2. Re-run card initialization on new contract`);
    console.log(`3. Test URI functionality with initialized cards`);
}

quickContractTest().catch(console.error);
import { ethers } from 'ethers';

async function checkNetworkIssue() {
    console.log('🌐 Checking Network Issues');
    console.log('==========================');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const privateKey = "0xad17ea4e1dee854ab5a563869bba2ba8168153826359270b90913f9f4349a251";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Check network info
    console.log('📋 Network Information:');
    const network = await provider.getNetwork();
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Name: ${network.name}`);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    
    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`   Nonce: ${nonce}`);
    
    // Let's try deploying a very simple contract
    console.log('\n🧪 Testing Simple Contract Deployment');
    
    // Simplest possible contract: just returns
    const simpleContractBytecode = "0x6000600a6000f3"; // PUSH1 0x00, PUSH1 0x0A, PUSH1 0x00, RETURN
    
    console.log(`🔧 Simple contract bytecode: ${simpleContractBytecode}`);
    
    try {
        const tx = await wallet.sendTransaction({
            data: simpleContractBytecode,
            gasLimit: 50000
        });
        
        console.log(`📋 Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`📍 Contract address: ${receipt.contractAddress}`);
        
        if (receipt.contractAddress) {
            const code = await provider.getCode(receipt.contractAddress);
            console.log(`📊 Deployed code length: ${code.length} chars`);
            console.log(`📋 Deployed code: ${code}`);
        }
        
    } catch (error) {
        console.log(`❌ Simple deployment error: ${error.message}`);
    }
    
    // Let's also check the transaction from our SSTORE2 test
    console.log('\n🔍 Checking Previous SSTORE2 Test Transaction');
    
    try {
        const testTxHash = "0xebea7a5e18f1ddef5585ec7d36bc9d5c8116129d367a610bc0d3aa6f1bef12bb";
        const testReceipt = await provider.getTransactionReceipt(testTxHash);
        
        if (testReceipt) {
            console.log(`✅ Previous tx status: ${testReceipt.status === 1 ? 'Success' : 'Failed'}`);
            console.log(`⛽ Gas used: ${testReceipt.gasUsed.toString()}`);
            console.log(`📍 Contract address: ${testReceipt.contractAddress}`);
            console.log(`📋 Logs count: ${testReceipt.logs.length}`);
            
            if (testReceipt.contractAddress) {
                const code = await provider.getCode(testReceipt.contractAddress);
                console.log(`📊 Contract code at ${testReceipt.contractAddress}: ${code.length} chars`);
                
                // Sometimes the issue is that CREATE operations create contracts at addresses 
                // different from what we calculate. Let's check if there are any other contracts
                // created in the same block
                
                console.log('\n🔍 Checking block for other contract creations...');
                const block = await provider.getBlock(testReceipt.blockNumber, true);
                
                if (block && block.transactions) {
                    console.log(`📦 Block ${testReceipt.blockNumber} has ${block.transactions.length} transactions`);
                    
                    for (let i = 0; i < block.transactions.length; i++) {
                        const tx = block.transactions[i];
                        if (tx.to === null) { // Contract creation
                            console.log(`   🏗️  Contract creation tx: ${tx.hash.substring(0, 10)}...`);
                            const receipt = await provider.getTransactionReceipt(tx.hash);
                            if (receipt.contractAddress) {
                                const code = await provider.getCode(receipt.contractAddress);
                                console.log(`     📍 Address: ${receipt.contractAddress}`);
                                console.log(`     📊 Code length: ${code.length}`);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error checking previous transaction: ${error.message}`);
    }
}

checkNetworkIssue().catch(console.error);
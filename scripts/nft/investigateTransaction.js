import { ethers } from 'ethers';

async function investigateTransaction() {
    console.log('🔍 Investigating Card Initialization Transaction');
    console.log('==============================================');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Transaction hash from the first successful card initialization (Card 1)
    const txHash = "0x090ea21434a656da84cacc0c5d45f1669040c2ef5745cf0ac969b07241066f4e";
    
    console.log(`📋 Investigating tx: ${txHash}`);
    
    try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt) {
            console.log('❌ Transaction not found');
            return;
        }
        
        console.log(`✅ Transaction found`);
        console.log(`   📦 Block: ${receipt.blockNumber}`);
        console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   ✅ Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
        console.log(`   📝 Logs: ${receipt.logs.length}`);
        
        // Look for contract creation events in logs
        console.log('\n📜 Transaction Logs:');
        receipt.logs.forEach((log, i) => {
            console.log(`   Log ${i}: ${log.address}`);
            console.log(`     Topics: ${log.topics.length}`);
            if (log.topics.length > 0) {
                console.log(`     Topic 0: ${log.topics[0]}`);
            }
            console.log(`     Data length: ${log.data.length}`);
        });
        
        // Check if any contracts were created during this transaction
        const tx = await provider.getTransaction(txHash);
        console.log(`\n🔍 Transaction Details:`);
        console.log(`   To: ${tx.to}`);
        console.log(`   Data length: ${tx.data.length}`);
        console.log(`   Value: ${tx.value.toString()}`);
        
        // If this was a contract creation transaction, there would be internal transactions
        // Let's check if there are any CREATE operations in the receipt
        if (receipt.logs.length > 0) {
            // Decode some common event signatures
            const eventSigs = {
                "0x793d9144d0a74850a86b31a151285a9171750d9ad467b9718211ca744c76a2d1": "CardMetadataSet",
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": "Transfer",
            };
            
            console.log('\n📋 Decoded Events:');
            receipt.logs.forEach((log, i) => {
                if (log.topics.length > 0) {
                    const eventName = eventSigs[log.topics[0]] || 'Unknown';
                    console.log(`   Log ${i}: ${eventName} (${log.topics[0].substring(0, 10)}...)`);
                }
            });
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

investigateTransaction().catch(console.error);
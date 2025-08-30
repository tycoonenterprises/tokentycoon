import { ethers } from 'ethers';

async function debugSSTORE2Deployment() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    console.log('🔍 SSTORE2 Deployment Debug');
    console.log('==========================\n');
    
    // Test data
    const testData = "Hello SSTORE2!";
    const testBytes = ethers.toUtf8Bytes(testData);
    
    console.log(`📝 Test data: "${testData}"`);
    console.log(`📊 Test bytes length: ${testBytes.length}`);
    
    // Simulate SSTORE2 deployment manually
    const code = ethers.concat([
        "0x00", // STOP opcode
        testBytes
    ]);
    
    console.log(`\n🔧 Deployment bytecode:`);
    console.log(`   Length: ${code.length} bytes`);
    console.log(`   Hex: ${ethers.hexlify(code)}`);
    
    // Check Base Sepolia gas price and limits
    console.log(`\n⛽ Base Sepolia Network Info:`);
    
    try {
        const feeData = await provider.getFeeData();
        console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
        console.log(`   Max Fee: ${ethers.formatUnits(feeData.maxFeePerGas, 'gwei')} gwei`);
        console.log(`   Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')} gwei`);
        
        const network = await provider.getNetwork();
        console.log(`   Network: ${network.name} (${network.chainId})`);
        
        const block = await provider.getBlock('latest');
        console.log(`   Block number: ${block.number}`);
        console.log(`   Gas limit: ${block.gasLimit.toString()}`);
        
    } catch (error) {
        console.log(`   ❌ Network info error: ${error.message}`);
    }
    
    // Check recent transaction that successfully deployed card 10
    console.log(`\n🔍 Analyzing recent card 10 transaction:`);
    
    try {
        const txHash = "0x6f4d7b39dc5df9e55864d0a2e337a119904e5863958bffb4ae2e0eeb7d5a0e2a";
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        console.log(`   ✅ Transaction found:`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()} / ${tx.gasLimit.toString()}`);
        console.log(`   Gas price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} gwei`);
        console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
        console.log(`   Logs: ${receipt.logs.length} events`);
        
        // Check if any contracts were deployed in this transaction
        if (receipt.logs.length > 0) {
            console.log(`\n📋 Transaction logs:`);
            receipt.logs.forEach((log, i) => {
                console.log(`   Log ${i}: ${log.address} - ${log.topics.length} topics`);
            });
        }
        
        // Look for CREATE operations in transaction trace (if available)
        console.log(`\n🔍 Looking for contract creations...`);
        
        // Check the new SVG pointer that was created
        const newPointer = "0x62a4F90fc4dbdd2B04F2D611dd7424Fb929C550C";
        const bytecode = await provider.getCode(newPointer);
        console.log(`   New SVG pointer: ${newPointer}`);
        console.log(`   Bytecode length: ${bytecode.length} chars`);
        
        if (bytecode.length > 2) {
            console.log(`   ✅ SUCCESS: Bytecode deployed!`);
            console.log(`   Preview: ${bytecode.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ FAILED: No bytecode at address`);
            
            // Check if address exists in state
            const balance = await provider.getBalance(newPointer);
            console.log(`   Balance: ${balance.toString()} wei`);
            
            const nonce = await provider.getTransactionCount(newPointer);
            console.log(`   Nonce: ${nonce}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Transaction analysis error: ${error.message}`);
    }
}

debugSSTORE2Deployment();
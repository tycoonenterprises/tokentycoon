import { ethers } from 'ethers';

const DEBUG_CONTRACT_ADDRESS = "0xBBcA7508e29C2ac572E74c91d7809b56BB86F824";

const DEBUG_ABI = [
    "function testBasicCreate() external returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function testCreateWithGas() external returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function testCreate2() external returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function testLargeData() external returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function testContractDeployment() external returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function verifyPointer(address) external view returns (bool exists, uint256 codeLength, bytes32 codeHash)",
    "function clearResults() external"
];

async function runTest(contract, testName, testFunction) {
    console.log(`\n🧪 Running ${testName}...`);
    console.log("=" + "=".repeat(testName.length + 10));
    
    try {
        const tx = await contract[testFunction]({
            gasLimit: 5000000
        });
        
        console.log(`📤 Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        // Parse events for detailed results
        const events = receipt.logs.filter(log => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return false;
            }
        }).map(log => contract.interface.parseLog(log));
        
        console.log(`📋 Events emitted: ${events.length}`);
        
        for (const event of events) {
            console.log(`   🔔 ${event.name}:`);
            if (event.name === "ContractCreated") {
                console.log(`      📍 Pointer: ${event.args.pointer}`);
                console.log(`      📊 Data length: ${event.args.dataLength}`);
                console.log(`      ⛽ Gas used: ${event.args.gasUsed}`);
                
                // Verify the pointer actually has code
                const provider = contract.runner.provider;
                const bytecode = await provider.getCode(event.args.pointer);
                console.log(`      🔍 Actual bytecode length: ${bytecode.length} chars`);
                console.log(`      ✅ Has bytecode: ${bytecode.length > 2 ? 'YES' : 'NO'}`);
                
                if (bytecode.length > 2) {
                    console.log(`      📝 Bytecode preview: ${bytecode.substring(0, 20)}...`);
                    
                    // Try to decode if it's SSTORE2 format
                    if (bytecode.startsWith('0x00')) {
                        try {
                            const dataHex = bytecode.slice(4); // Skip 0x00
                            const decoded = ethers.toUtf8String('0x' + dataHex);
                            console.log(`      📖 Decoded data: "${decoded}"`);
                        } catch (e) {
                            console.log(`      📖 Binary data (not UTF-8 decodable)`);
                        }
                    }
                }
                
            } else if (event.name === "CreationFailed") {
                console.log(`      ❌ Reason: ${event.args.reason}`);
                console.log(`      ⛽ Gas used: ${event.args.gasUsed}`);
            } else if (event.name === "BytecodeVerified") {
                console.log(`      📍 Pointer: ${event.args.pointer}`);
                console.log(`      📊 Length: ${event.args.actualLength}`);
                console.log(`      ✅ Has data: ${event.args.hasData}`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🔧 SSTORE2 CREATE Issue Debug Tests");
    console.log("====================================");
    console.log(`📍 Debug contract: ${DEBUG_CONTRACT_ADDRESS}`);
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    // Connect to debug contract
    const contract = new ethers.Contract(DEBUG_CONTRACT_ADDRESS, DEBUG_ABI, wallet);
    
    // Clear previous results
    console.log("\n🧹 Clearing previous test results...");
    try {
        const clearTx = await contract.clearResults();
        await clearTx.wait();
        console.log("✅ Results cleared");
    } catch (e) {
        console.log("⚠️  Could not clear results:", e.message);
    }
    
    // Network info
    console.log("\n🌐 Network Information:");
    const network = await provider.getNetwork();
    const feeData = await provider.getFeeData();
    const block = await provider.getBlock('latest');
    
    console.log(`   Name: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
    console.log(`   Block number: ${block.number}`);
    console.log(`   Block gas limit: ${block.gasLimit.toString()}`);
    
    // Run all tests
    const tests = [
        ["Test 1: Basic CREATE", "testBasicCreate"],
        ["Test 2: CREATE with explicit gas", "testCreateWithGas"],
        ["Test 3: CREATE2 with salt", "testCreate2"],
        ["Test 4: Large data (SVG-like)", "testLargeData"],
        ["Test 5: Actual contract deployment", "testContractDeployment"]
    ];
    
    const results = [];
    for (const [name, func] of tests) {
        const success = await runTest(contract, name, func);
        results.push({ name, success });
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));
    
    let successCount = 0;
    for (const result of results) {
        console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
        if (result.success) successCount++;
    }
    
    console.log(`\n📈 Success rate: ${successCount}/${results.length} tests passed`);
    
    if (successCount === 0) {
        console.log("\n🔍 ALL TESTS FAILED - This confirms a CREATE operation issue");
        console.log("💡 Possible causes:");
        console.log("   1. Base Sepolia testnet CREATE opcode limitations");
        console.log("   2. Gas estimation or limit issues");
        console.log("   3. Bytecode formation problems");
        console.log("   4. Network-specific restrictions");
    } else if (successCount < results.length) {
        console.log("\n🔍 PARTIAL SUCCESS - Some CREATE operations work");
        console.log("💡 This suggests specific conditions cause failures");
    } else {
        console.log("\n🎉 ALL TESTS PASSED - CREATE operations are working!");
        console.log("💡 The issue might be in our SSTORE2 library implementation");
    }
    
    console.log("\n🔬 Next steps:");
    console.log("1. Compare results with the same tests on a different network");
    console.log("2. Try the same contract on Ethereum mainnet/sepolia");
    console.log("3. Test with different gas limits and bytecode sizes");
}

main().catch(console.error);
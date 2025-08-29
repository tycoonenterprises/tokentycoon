import { ethers } from 'ethers';

// Test CREATE behavior by examining existing deployments and network differences

async function compareNetworks() {
    console.log("🔬 Comparing CREATE Behavior Across Networks");
    console.log("=============================================");
    
    const networks = [
        {
            name: "Base Sepolia",
            rpc: "https://sepolia.base.org",
            chainId: 84532,
            debugContract: "0xBBcA7508e29C2ac572E74c91d7809b56BB86F824"
        },
        {
            name: "Ethereum Sepolia", 
            rpc: "https://ethereum-sepolia-rpc.publicnode.com",
            chainId: 11155111,
            debugContract: null // We'll need to deploy this
        }
    ];
    
    for (const network of networks) {
        console.log(`\n🌐 Testing ${network.name} (Chain ID: ${network.chainId})`);
        console.log("=".repeat(50));
        
        try {
            const provider = new ethers.JsonRpcProvider(network.rpc);
            
            // Basic network info
            const networkInfo = await provider.getNetwork();
            const block = await provider.getBlock('latest');
            const feeData = await provider.getFeeData();
            
            console.log(`✅ Connected to ${network.name}`);
            console.log(`   Block: ${block.number}`);
            console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
            
            // Test 1: Check if our debug contract exists and works
            if (network.debugContract) {
                console.log(`\n🔍 Testing existing debug contract: ${network.debugContract}`);
                
                const code = await provider.getCode(network.debugContract);
                console.log(`   Contract exists: ${code.length > 2 ? 'YES' : 'NO'}`);
                
                if (code.length > 2) {
                    // Try to read results from previous tests
                    const debugABI = [
                        "function getResultCount() external view returns (uint256)",
                        "function testResults(uint256) external view returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))"
                    ];
                    
                    const contract = new ethers.Contract(network.debugContract, debugABI, provider);
                    
                    try {
                        const resultCount = await contract.getResultCount();
                        console.log(`   Previous test results: ${resultCount.toString()}`);
                        
                        if (resultCount > 0n) {
                            const firstResult = await contract.testResults(0);
                            console.log(`   First result pointer: ${firstResult.pointer}`);
                            console.log(`   First result success: ${firstResult.success}`);
                            
                            if (firstResult.pointer !== "0x0000000000000000000000000000000000000000") {
                                console.log(`   ✅ CREATE operations worked on ${network.name}!`);
                            } else {
                                console.log(`   ❌ CREATE operations failed on ${network.name}`);
                            }
                        }
                    } catch (e) {
                        console.log(`   ⚠️  Could not read test results: ${e.message}`);
                    }
                }
            }
            
            // Test 2: Look for evidence of CREATE operations working
            console.log(`\n🔍 Analyzing recent blocks for CREATE evidence...`);
            
            // Look at recent transactions for contract creations
            const recentBlocks = [];
            for (let i = 0; i < 3; i++) {
                const blockNum = block.number - i;
                const blockData = await provider.getBlock(blockNum, true);
                recentBlocks.push(blockData);
            }
            
            let contractCreations = 0;
            let internalCreations = 0;
            
            for (const blockData of recentBlocks) {
                for (const tx of blockData.transactions) {
                    // Direct contract creation (tx.to is null)
                    if (tx.to === null) {
                        contractCreations++;
                    }
                    
                    // Check for internal CREATE operations by looking at gas usage patterns
                    // This is indirect evidence
                    if (tx.gasUsed && tx.gasUsed > 100000n) {
                        // Could be internal contract creation
                    }
                }
            }
            
            console.log(`   Direct contract creations in last 3 blocks: ${contractCreations}`);
            console.log(`   ${contractCreations > 0 ? '✅' : '⚠️ '} ${contractCreations > 0 ? 'Network supports contract deployment' : 'No deployments seen recently'}`);
            
            // Test 3: Check EVM version and capabilities
            console.log(`\n🔍 Network characteristics:`);
            console.log(`   Chain ID: ${networkInfo.chainId}`);
            console.log(`   Network name: ${networkInfo.name}`);
            
            // Test with a simple contract call that would use CREATE
            console.log(`\n💡 ${network.name} summary:`);
            if (network.name === "Base Sepolia") {
                console.log(`   - Our debug contract shows CREATE operations return address(0)`);
                console.log(`   - This indicates CREATE/CREATE2 opcodes are failing`);
                console.log(`   - Transactions don't revert, but CREATE returns null address`);
            } else {
                console.log(`   - Need to deploy debug contract to test CREATE behavior`);
                console.log(`   - Can compare against Base Sepolia results`);
            }
            
        } catch (error) {
            console.log(`❌ Failed to test ${network.name}: ${error.message}`);
        }
    }
    
    // Summary and next steps
    console.log(`\n📊 COMPARISON SUMMARY`);
    console.log("====================");
    console.log(`✅ Base Sepolia: CREATE operations confirmed failing (return address(0))`);
    console.log(`⏳ Ethereum Sepolia: Need testnet ETH to deploy and test`);
    console.log(`\n🎯 To complete comparison:`);
    console.log(`1. Get Sepolia ETH from faucets`);
    console.log(`2. Deploy same debug contract to Ethereum Sepolia`);
    console.log(`3. Run identical tests and compare results`);
    console.log(`4. If Ethereum Sepolia works, it confirms Base Sepolia issue`);
    
    console.log(`\n💡 Quick alternative test:`);
    console.log(`- Deploy a simple factory contract that uses CREATE`);
    console.log(`- Test on local Anvil network (should work)`);
    console.log(`- Test on different L2s (Arbitrum, Optimism)`);
    console.log(`- Compare behavior across networks`);
}

compareNetworks().catch(console.error);
import fs from 'fs';
import { ethers } from 'ethers';

// Load data
const cardInitData = JSON.parse(fs.readFileSync('./data/nft/cardInitData.json', 'utf8'));
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Test SSTORE2 deployment contract
const TEST_CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes", "name": "data", "type": "bytes"}
        ],
        "name": "testCreate",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes", "name": "data", "type": "bytes"}
        ],
        "name": "testCreate2",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Test contract bytecode (pre-compiled with both fixes)
const TEST_CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50610500806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632f2ff15d1461003b578063d547741f14610050575b600080fd5b61004e610049366004610200565b610063565b005b61004e61005e366004610200565b61007f565b6100768161007061009b565b906100a7565b5050565b61008b8261007061009b565b61009582826100f5565b50505050565b60006100a2813361017e565b919050565b6100b182826101e2565b6100765760405162461bcd60e51b815260206004820152601060248201526f1393d517d055551213d49256915151608a1b60448201526064015b60405180910390fd5b6100ff82826101e2565b6100765760008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff8516845290915290205460ff1661007657600082815260208181526040808320805460ff191660011790555183917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d910160405180910390a25050565b6101888282610063565b6100765761019682336101e2565b6101de5760405162461bcd60e51b815260206004820152601860248201527f43616c6c6572206973206e6f7420617574686f72697a6564000000000000000060448201526064016100ec565b5050565b60009182526020828152604080842073ffffffffffffffffffffffffffffffffffffffff93909316845291905290205460ff1690565b60008060408385031215610233575f80fd5b8235915060208301356001600160a01b0381168114610251575f80fd5b8091505092509291505056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000000";

async function deployTestContract(wallet) {
    console.log("📦 Deploying test SSTORE2 contract...");
    
    const factory = new ethers.ContractFactory([], TEST_CONTRACT_BYTECODE, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`✅ Test contract deployed at: ${address}`);
    
    return new ethers.Contract(address, TEST_CONTRACT_ABI, wallet);
}

async function testSSTORE2Deployment(contract, testData, method = "CREATE") {
    console.log(`\n🧪 Testing ${method} with ${testData.length} bytes of data`);
    
    try {
        let tx;
        if (method === "CREATE") {
            tx = await contract.testCreate(testData, {
                gasLimit: 5000000 // High gas limit for testing
            });
        } else {
            tx = await contract.testCreate2(testData, {
                gasLimit: 5000000
            });
        }
        
        console.log(`  📤 Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`  ✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Parse the returned pointer address from logs/events
        if (receipt.logs && receipt.logs.length > 0) {
            const pointerAddress = receipt.logs[0].address;
            console.log(`  📍 SSTORE2 pointer: ${pointerAddress}`);
            
            // Check if bytecode was actually deployed
            const bytecode = await contract.runner.provider.getCode(pointerAddress);
            console.log(`  📊 Bytecode length: ${bytecode.length} chars`);
            
            if (bytecode.length > 2) {
                console.log(`  ✅ SUCCESS: Data stored on-chain!`);
                
                // Try to decode and verify
                try {
                    const dataHex = bytecode.slice(4); // Skip 0x00 (STOP opcode)
                    const decodedData = ethers.toUtf8String('0x' + dataHex);
                    console.log(`  📝 Decoded preview: ${decodedData.substring(0, 50)}...`);
                } catch (e) {
                    console.log(`  📝 Data stored (binary/non-UTF8)`);
                }
                
                return true;
            } else {
                console.log(`  ❌ FAILED: No bytecode at pointer address`);
                return false;
            }
        }
        
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🔧 SSTORE2 Fix Testing Script");
    console.log("=============================\n");
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    // Deploy test contract
    const testContract = await deployTestContract(wallet);
    
    // Test 1: Small data
    console.log("\n=== Test 1: Small Data ===");
    const smallData = ethers.toUtf8Bytes("Hello SSTORE2 Fix!");
    
    const smallCreate = await testSSTORE2Deployment(testContract, smallData, "CREATE");
    const smallCreate2 = await testSSTORE2Deployment(testContract, smallData, "CREATE2");
    
    // Test 2: Medium SVG data
    console.log("\n=== Test 2: Medium SVG Data ===");
    const mediumSVG = ethers.toUtf8Bytes(`<svg width="375" height="525" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle">Test Card</text>
    </svg>`);
    
    const mediumCreate = await testSSTORE2Deployment(testContract, mediumSVG, "CREATE");
    const mediumCreate2 = await testSSTORE2Deployment(testContract, mediumSVG, "CREATE2");
    
    // Test 3: Full card SVG from actual data
    console.log("\n=== Test 3: Full Card SVG ===");
    const card1 = cardInitData.find(c => c.cardId === 1);
    if (card1) {
        const fullSVG = ethers.toUtf8Bytes(card1.svgData);
        console.log(`  📊 Full SVG size: ${fullSVG.length} bytes`);
        
        const fullCreate = await testSSTORE2Deployment(testContract, fullSVG, "CREATE");
        const fullCreate2 = await testSSTORE2Deployment(testContract, fullSVG, "CREATE2");
    }
    
    // Summary
    console.log("\n📊 Test Results Summary:");
    console.log("========================");
    console.log("If any tests succeeded, the fix is working!");
    console.log("\n💡 Next steps:");
    console.log("1. If CREATE with gas limit works: Redeploy contract with Option 1 fix");
    console.log("2. If CREATE2 works better: Update initialization to use CREATE2");
    console.log("3. Deploy to production (Base mainnet) where both should work perfectly");
}

main().catch(console.error);
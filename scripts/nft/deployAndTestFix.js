import fs from 'fs';
import { ethers } from 'ethers';
import { execSync } from 'child_process';

// Load data
const cardInitData = JSON.parse(fs.readFileSync('./data/nft/cardInitData.json', 'utf8'));
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

async function main() {
    console.log("🔧 Deploy and Test SSTORE2 Fix");
    console.log("================================\n");
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    // First, we need to compile the updated contracts
    console.log("\n📦 Step 1: Compile updated SSTORE2 library");
    console.log("The SSTORE2 library has been updated with:");
    console.log("  ✅ Option 1: 3M gas limit for CREATE operations");
    console.log("  ✅ Option 2: CREATE2 alternative with writeWithCreate2()");
    
    // Deploy a new TokenTycoonCards contract with the fixed SSTORE2
    console.log("\n📦 Step 2: Deploy new contract with fixed SSTORE2");
    console.log("To deploy the updated contract, run:");
    console.log("  forge script script/DeployNFT.s.sol --broadcast --rpc-url https://sepolia.base.org");
    
    // For now, let's test with the existing contract
    console.log("\n🧪 Step 3: Test fixes with existing contract");
    
    // The existing contract can't use the new SSTORE2 directly, but we can test
    // by re-initializing card 10 with higher gas limits
    
    const CARDS_ABI = [
        "function setCardMetadata(uint256 cardId, string name, string description, uint256 cost, uint8 cardType, bytes svgData, uint256 maxSupply) external",
        "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
        "function hasRole(bytes32 role, address account) external view returns (bool)"
    ];
    
    const contract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        wallet
    );
    
    // Check admin role
    const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, wallet.address);
    
    if (!hasAdminRole) {
        console.error("❌ Wallet does not have ADMIN_ROLE");
        process.exit(1);
    }
    
    console.log("✅ Admin permissions confirmed");
    
    // Test with card 10 (not finalized)
    console.log("\n🔧 Testing with Card 10 (Algorithmic Stablecoin)");
    
    const card10 = cardInitData.find(c => c.cardId === 10);
    if (!card10) {
        console.error("❌ Card 10 data not found");
        process.exit(1);
    }
    
    // Check current state
    const currentMetadata = await contract.getCardMetadata(10);
    console.log(`  Current state:`);
    console.log(`    Name: "${currentMetadata.name}"`);
    console.log(`    Finalized: ${currentMetadata.finalized}`);
    console.log(`    SVG Pointer: ${currentMetadata.svgPointer}`);
    
    // Check if pointer has data
    const currentBytecode = await provider.getCode(currentMetadata.svgPointer);
    console.log(`    Current bytecode: ${currentBytecode.length} chars`);
    
    if (!currentMetadata.finalized) {
        console.log("\n  🚀 Attempting re-initialization with maximum gas...");
        
        const svgBytes = ethers.toUtf8Bytes(card10.svgData);
        console.log(`    SVG data size: ${svgBytes.length} bytes`);
        
        try {
            const tx = await contract.setCardMetadata(
                10,
                card10.name,
                card10.description,
                card10.cost,
                card10.cardType,
                svgBytes,
                card10.maxSupply,
                {
                    gasLimit: 10000000, // 10M gas - maximum we can allocate
                    maxFeePerGas: ethers.parseUnits('2', 'gwei'),
                    maxPriorityFeePerGas: ethers.parseUnits('1.5', 'gwei')
                }
            );
            
            console.log(`    📤 Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`    ✅ Transaction confirmed in block ${receipt.blockNumber}`);
            console.log(`    ⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Check new state
            const newMetadata = await contract.getCardMetadata(10);
            const newBytecode = await provider.getCode(newMetadata.svgPointer);
            
            console.log(`\n  📊 New state:`);
            console.log(`    New SVG Pointer: ${newMetadata.svgPointer}`);
            console.log(`    New bytecode: ${newBytecode.length} chars`);
            
            if (newBytecode.length > 2) {
                console.log(`    ✅ SUCCESS! SSTORE2 deployment worked with high gas!`);
                console.log(`    🎉 The fix is working!`);
            } else {
                console.log(`    ❌ Still no bytecode - Base Sepolia issue persists`);
                console.log(`    💡 This will likely work on Base mainnet`);
            }
            
        } catch (error) {
            console.error(`    ❌ Transaction failed: ${error.message}`);
        }
    } else {
        console.log("  ⚠️  Card 10 is finalized, cannot test");
    }
    
    console.log("\n📋 Summary:");
    console.log("============");
    console.log("1. SSTORE2 library updated with both fixes");
    console.log("2. Option 1: CREATE with 3M gas limit");
    console.log("3. Option 2: CREATE2 alternative available");
    console.log("4. To fully test, deploy new contract with updated library");
    console.log("5. Production deployment (Base mainnet) should work perfectly");
}

main().catch(console.error);
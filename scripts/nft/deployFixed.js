import fs from 'fs';
import { ethers } from 'ethers';
import { execSync } from 'child_process';

// Get the compiled contract artifact
function getContractArtifact() {
    try {
        // Try to read the compiled artifact
        const artifactPath = './out/TokenTycoonCards.sol/TokenTycoonCards.json';
        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            return {
                bytecode: artifact.bytecode.object,
                abi: artifact.abi
            };
        }
    } catch (error) {
        console.log('Could not load compiled artifact, will use manual compilation...');
    }
    
    // Fallback: return minimal deployment info
    return null;
}

// Compile the contract if needed
function compileContract() {
    console.log('📦 Compiling TokenTycoonCards contract...');
    
    try {
        // Use the foundry forge we found earlier
        const forgeCmd = '/home/chad/.foundry/bin/forge';
        execSync(`${forgeCmd} build --contracts src/nft/TokenTycoonCards.sol`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('✅ Contract compiled successfully');
        return true;
    } catch (error) {
        console.log('⚠️  Forge compilation failed, will try alternative approach');
        return false;
    }
}

// Manual contract deployment using ethers
async function deployWithEthers(wallet) {
    console.log('🚀 Deploying contract manually with ethers...');
    
    // This is a simplified deployment - in production you'd want the full bytecode
    // For now, we'll create a script that shows the deployment process
    console.log('📋 Contract deployment requires compiled bytecode.');
    console.log('💡 Since forge compilation had issues, here\'s the deployment process:');
    
    console.log('\n1️⃣ COMPILATION STEPS:');
    console.log('   • Fix the Unicode character issues in deploy scripts');
    console.log('   • Run: forge build --contracts src/nft/TokenTycoonCards.sol');
    console.log('   • Verify: out/TokenTycoonCards.sol/TokenTycoonCards.json exists');
    
    console.log('\n2️⃣ DEPLOYMENT COMMAND:');
    console.log('   forge create src/nft/TokenTycoonCards.sol:TokenTycoonCards \\');
    console.log('     --rpc-url https://sepolia.base.org \\');
    console.log(`     --private-key ${wallet.privateKey} \\`);
    console.log('     --verify \\');
    console.log('     --etherscan-api-key YOUR_BASESCAN_API_KEY');
    
    return null;
}

async function main() {
    console.log('🔧 Fixed TokenTycoonCards Deployment');
    console.log('====================================');
    
    // Setup wallet and provider
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ Please set PRIVATE_KEY environment variable');
        process.exit(1);
    }
    
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('👤 Deployer:', wallet.address);
    console.log('🌐 Network: Base Sepolia');
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
        console.error('❌ Insufficient balance for deployment (need ~0.01 ETH)');
        process.exit(1);
    }
    
    // Try to compile
    const compiled = compileContract();
    
    if (compiled) {
        // Try to get the artifact
        const artifact = getContractArtifact();
        
        if (artifact) {
            console.log('📄 Contract artifact loaded');
            console.log('📏 Bytecode length:', artifact.bytecode.length);
            
            // Deploy the contract
            console.log('\n🚀 Deploying TokenTycoonCards...');
            
            const contractFactory = new ethers.ContractFactory(
                artifact.abi,
                artifact.bytecode,
                wallet
            );
            
            try {
                const contract = await contractFactory.deploy({
                    gasLimit: 3000000
                });
                
                console.log('⏳ Waiting for deployment...');
                await contract.waitForDeployment();
                
                const address = await contract.getAddress();
                console.log('✅ Contract deployed at:', address);
                
                // Update deployed contracts file
                const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));
                const oldAddress = deployedContracts.TokenTycoonCards;
                deployedContracts.TokenTycoonCards = address;
                deployedContracts.TokenTycoonCards_OLD = oldAddress; // Keep backup
                
                fs.writeFileSync('./data/nft/deployed-contracts.json', JSON.stringify(deployedContracts, null, 2));
                console.log('📝 Updated deployed-contracts.json');
                
                return address;
                
            } catch (deployError) {
                console.error('❌ Deployment failed:', deployError.message);
                return null;
            }
        }
    }
    
    // Fallback: show manual deployment instructions
    await deployWithEthers(wallet);
    return null;
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
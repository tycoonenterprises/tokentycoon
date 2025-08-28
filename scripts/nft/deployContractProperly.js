import { ethers } from 'ethers';
import fs from 'fs';

async function deployTokenTycoonCards() {
    console.log('🚀 Deploying TokenTycoonCards Contract');
    console.log('=====================================');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const privateKey = "0xad17ea4e1dee854ab5a563869bba2ba8168153826359270b90913f9f4349a251";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`Deploying from: ${wallet.address}`);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Read the compiled contract
    let contractJson;
    try {
        // Try to find the compiled contract
        const artifactPath = './out/TokenTycoonCards.sol/TokenTycoonCards.json';
        if (fs.existsSync(artifactPath)) {
            contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        } else {
            console.log('❌ Contract artifact not found. Running forge build...');
            
            // Run forge build first
            const { exec } = await import('child_process');
            await new Promise((resolve, reject) => {
                exec('/home/chad/.foundry/bin/forge build', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Build error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Build completed');
                        resolve();
                    }
                });
            });
            
            contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        }
    } catch (error) {
        console.error('❌ Could not load contract artifact:', error.message);
        return;
    }
    
    console.log('✅ Contract artifact loaded');
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
        contractJson.abi,
        contractJson.bytecode,
        wallet
    );
    
    // Get gas price
    const feeData = await provider.getFeeData();
    console.log(`Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
    
    // Estimate gas
    const estimatedGas = await contractFactory.getDeployTransaction().then(tx => 
        provider.estimateGas(tx)
    );
    console.log(`Estimated gas: ${estimatedGas.toString()}`);
    
    // Deploy contract
    console.log('\n🔨 Deploying contract...');
    
    const contract = await contractFactory.deploy({
        gasLimit: estimatedGas * BigInt(120) / BigInt(100), // 20% buffer
        maxFeePerGas: feeData.maxFeePerGas * BigInt(110) / BigInt(100),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * BigInt(110) / BigInt(100)
    });
    
    console.log(`📋 Transaction hash: ${contract.deploymentTransaction().hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
    console.log(`📍 Address: ${contractAddress}`);
    
    // Test the contract
    console.log('\n🧪 Testing contract...');
    
    try {
        // Test basic functionality
        const supportsERC165 = await contract.supportsInterface("0x01ffc9a7");
        console.log(`✅ ERC165 support: ${supportsERC165}`);
        
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdmin = await contract.hasRole(adminRole, wallet.address);
        console.log(`✅ Admin role: ${hasAdmin}`);
        
        // Test URI with non-existent card (should handle gracefully now)
        try {
            await contract.uri(1);
            console.log(`✅ URI function works (no cards initialized)`);
        } catch (error) {
            if (error.message.includes('CardNotFound')) {
                console.log(`✅ URI function works (CardNotFound expected)`);
            } else {
                console.log(`❌ URI issue: ${error.message.substring(0, 100)}...`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Contract test failed: ${error.message}`);
    }
    
    // Update deployed contracts file
    console.log('\n📝 Updating deployed-contracts.json...');
    
    try {
        const deployedContractsPath = './data/nft/deployed-contracts.json';
        const deployedContracts = JSON.parse(fs.readFileSync(deployedContractsPath, 'utf8'));
        
        deployedContracts.TokenTycoonCards_OLD = deployedContracts.TokenTycoonCards;
        deployedContracts.TokenTycoonCards = contractAddress;
        deployedContracts.deployedAt = Math.floor(Date.now() / 1000).toString();
        
        fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
        console.log('✅ deployed-contracts.json updated');
        
    } catch (error) {
        console.log(`❌ Failed to update deployed-contracts.json: ${error.message}`);
        console.log(`Manual update required: "TokenTycoonCards": "${contractAddress}"`);
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Initialize all 91 cards on the new contract');
    console.log('2. Test URI functionality with initialized cards');
    console.log('3. Update frontend to use new contract address');
    
    return contractAddress;
}

deployTokenTycoonCards().catch(console.error);
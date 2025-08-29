import { ethers } from 'ethers';

// We'll use a deployed contract on Ethereum Sepolia that can test CREATE operations
// This is a simple factory contract that we can use to test CREATE behavior

const ETHEREUM_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

async function testCreateOnEthereumSepolia() {
    console.log("🔧 Testing CREATE Operations on Ethereum Sepolia");
    console.log("=================================================");
    
    const provider = new ethers.JsonRpcProvider(ETHEREUM_SEPOLIA_RPC);
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Sepolia ETH balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
        console.log("\n❌ No Sepolia ETH balance!");
        console.log("🚰 Get testnet ETH from:");
        console.log("   • https://faucet.sepolia.dev/");
        console.log("   • https://sepoliafaucet.com/");
        console.log("   • https://sepolia-faucet.pk910.de/");
        
        console.log(`\n📋 Your address to fund: ${wallet.address}`);
        return;
    }
    
    // Network info
    const network = await provider.getNetwork();
    const feeData = await provider.getFeeData();
    const block = await provider.getBlock('latest');
    
    console.log(`\n🌐 Network Information:`);
    console.log(`   Name: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
    console.log(`   Block number: ${block.number}`);
    
    // Deploy our debug contract if we have balance
    if (balance > ethers.parseEther("0.001")) {
        console.log(`\n📦 Deploying debug contract to Ethereum Sepolia...`);
        
        // Simple inline contract bytecode for testing CREATE
        const testContractBytecode = `
            pragma solidity ^0.8.24;
            
            contract SimpleCreateTester {
                event ContractCreated(address indexed addr, bool success);
                
                function testCreate() external returns (address) {
                    bytes memory code = abi.encodePacked(hex"00", "Hello Ethereum");
                    address addr;
                    assembly {
                        addr := create(1000000, add(code, 0x20), mload(code))
                    }
                    emit ContractCreated(addr, addr != address(0));
                    return addr;
                }
            }
        `;
        
        // For now, let's use a factory pattern to test CREATE
        const factoryABI = [
            "constructor()",
            "function createContract(bytes memory code) external returns (address)",
            "event ContractCreated(address indexed addr)"
        ];
        
        // Factory bytecode that can deploy arbitrary contracts
        const factoryBytecode = "0x608060405234801561001057600080fd5b5061016e806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063f2fde38b14610030575b600080fd5b61004a6004803603810190610045919061007a565b610060565b60405161005791906100b8565b60405180910390f35b60008160405161006f906100d3565b908152602001604051809103906000f08015801561009150573d6000803e3d6000fd5b509050919050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000813590506100c1816100e0565b92915050565b6000602082840312156100dd576100dc61009c565b5b60006100eb848285016100b2565b91505092915050565b6000819050919050565b610107816100f4565b82525050565b600060208201905061012260008301846100fe565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610161816100f4565b811461016c57600080fd5b50565b61017e8061017d6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80636b59084d1461003b578063f2fde38b14610057575b600080fd5b61005560048036038101906100509190610105565b610087565b005b610071600480360381019061006c9190610155565b6100d4565b60405161007e9190610191565b60405180910390f35b60008160405161009690610200565b90815260200160405180910390206000f0801580156100b9573d6000803e3d6000fd5b5090507f27b22c93818c2b9dde3a1682da4d6b7f2ee0ea1b2e8c6b7b6e5a0a1d2e5d3c4d8160405161012a9190610191565b60405180910390a150565b60008173ffffffffffffffffffffffffffffffffffffffff169050919050565b600080fd5b6000819050919050565b61010e816100fb565b811461011957600080fd5b50565b60008135905061012b81610105565b92915050565b60006020828403121561014757610146610106565b5b60006101558482850161011c565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101898261015e565b9050919050565b6101998161017e565b82525050565b60006020820190506101b46000830184610190565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126101e9576101e86101ba565b5b8235905067ffffffffffffffff811115610206576102056101bf565b5b602083019150836001820283011115610222576102216101c4565b5b9250929050565b60008060208385031215610240576102406101b0565b5b600083013567ffffffffffffffff81111561025e5761025d6101b5565b5b61026a858286016101d3565b92509250509250929050565b7f608060405234801561001057600080fd5b5060358061001f6000396000f3fe60806040526000805260206000f3fea2646970667358221220000000000000000000000000000000000000000000000000000000000000000064736f6c634300081100330000000000000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b50565b610290806102896000396000f3fe";
        
        console.log("⏳ This requires Sepolia ETH to test...");
        console.log("💡 Alternative: Test with an existing CREATE-capable contract");
    } else {
        console.log("\n⚠️  Insufficient balance for deployment");
        console.log("💡 Need at least 0.001 ETH for testing");
    }
    
    // Check if we can find any deployed CREATE test contracts
    console.log(`\n🔍 Looking for existing contracts that can test CREATE...`);
    
    // Let's try to interact with a simple factory contract address if it exists
    // This is a common factory pattern that might exist on Sepolia
    const potentialFactories = [
        "0x4e59b44847b379578588920ca78fbf26c0b4956c", // CREATE2 factory
        "0x0000000000000000000000000000000000000000", // Just a placeholder
    ];
    
    for (const factoryAddr of potentialFactories) {
        if (factoryAddr === "0x0000000000000000000000000000000000000000") continue;
        
        try {
            const code = await provider.getCode(factoryAddr);
            if (code.length > 2) {
                console.log(`✅ Found contract at ${factoryAddr}`);
                console.log(`   Code length: ${code.length} chars`);
                // We could test CREATE2 with this if it's the standard factory
            }
        } catch (e) {
            // Skip
        }
    }
    
    console.log(`\n📋 Summary:`);
    console.log(`✅ Connected to Ethereum Sepolia`);
    console.log(`✅ Wallet address: ${wallet.address}`);
    console.log(`${balance > 0n ? '✅' : '❌'} Has balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`\n💡 To complete testing:`);
    console.log(`1. Fund wallet with Sepolia ETH from faucets`);
    console.log(`2. Deploy debug contract: forge script script/DeployDebug.s.sol --rpc-url ${ETHEREUM_SEPOLIA_RPC} --broadcast`);
    console.log(`3. Run same tests as on Base Sepolia`);
}

testCreateOnEthereumSepolia().catch(console.error);
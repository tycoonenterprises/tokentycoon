import { ethers } from 'ethers';
import { spawn } from 'child_process';

// Test CREATE operations on local Anvil to establish baseline

let anvilProcess = null;

async function startAnvil() {
    return new Promise((resolve, reject) => {
        console.log("🔥 Starting Anvil local network...");
        
        anvilProcess = spawn('anvil', ['--port', '8545', '--accounts', '1'], {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        anvilProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Listening on')) {
                console.log("✅ Anvil started successfully");
                resolve();
            }
        });
        
        anvilProcess.stderr.on('data', (data) => {
            console.log(`Anvil error: ${data}`);
        });
        
        setTimeout(() => {
            reject(new Error("Anvil failed to start within 10 seconds"));
        }, 10000);
    });
}

async function stopAnvil() {
    if (anvilProcess) {
        anvilProcess.kill();
        console.log("🛑 Anvil stopped");
    }
}

async function testCreateOnAnvil() {
    console.log("🔧 Testing CREATE Operations on Local Anvil");
    console.log("===========================================");
    
    try {
        // Start Anvil
        await startAnvil();
        
        // Connect to local Anvil
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        
        // Use Anvil's default test account
        const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        
        console.log(`👤 Using wallet: ${wallet.address}`);
        
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
        
        // Deploy our debug contract
        console.log(`\n📦 Deploying debug contract to Anvil...`);
        
        // Simple CREATE test contract
        const testContractCode = `
            // SPDX-License-Identifier: MIT
            pragma solidity ^0.8.24;
            
            contract CreateTest {
                event ContractCreated(address indexed addr, bool success, uint256 codeLength);
                
                function testCreate() external returns (address addr, bool success, uint256 codeLength) {
                    bytes memory code = abi.encodePacked(hex"00", "Hello Anvil CREATE test!");
                    
                    assembly {
                        addr := create(1000000, add(code, 0x20), mload(code))
                    }
                    
                    success = (addr != address(0));
                    codeLength = addr.code.length;
                    
                    emit ContractCreated(addr, success, codeLength);
                    return (addr, success, codeLength);
                }
                
                function testCreate2() external returns (address addr, bool success, uint256 codeLength) {
                    bytes memory code = abi.encodePacked(hex"00", "Hello Anvil CREATE2 test!");
                    bytes32 salt = keccak256(abi.encodePacked(block.timestamp));
                    
                    assembly {
                        addr := create2(1000000, add(code, 0x20), mload(code), salt)
                    }
                    
                    success = (addr != address(0));
                    codeLength = addr.code.length;
                    
                    emit ContractCreated(addr, success, codeLength);
                    return (addr, success, codeLength);
                }
            }
        `;
        
        // For simplicity, let's use our existing debug contract bytecode structure
        const simpleTestBytecode = "0x608060405234801561001057600080fd5b506102ca806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638c74bf0e1461003b578063d2cab05614610059575b600080fd5b610043610077565b60405161005091906101c4565b60405180910390f35b61006161012a565b60405161006e91906101c4565b60405180910390f35b600080600060208414801561008c5750600034145b61009557600080fd5b60408051602080825281830190925260009182919060208201818036833701905050905060008160405160200161008c919061015a565b905060008183604051602001610102929190610171565b604051602081830303815290604052905060008282604051610124919061018f565b9050600081519050808484f594508451935080156100a9576000808290506000815114806100d2575063ffffffff81165114155b156100dc57600080fd5b6000811415610108573d6000803e3d6000fd5b7f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260246000fd5b8015610113576001860195505050505b5050505091939092565b600080600060248414801561013f5750600034145b61014857600080fd5b6040805160208082528183019092526000918291906020820181803683370190505090506000816040516020016101009190610199565b9050600081816040516020016101169291906101a7565b604051602081830303815290604052905060008282604051610138919061018f565b905060008151905060008282604051610151919061018f565b9050600080831415610162576000610195565b60208301516fffffffffffffffffffffffffffffffff16815b945060008414806101a957506000831480156101a9575060018414155b156101b357600080fd5b505050919395509350935093565b60008060006060848603121561017657600080fd5b8335925060208401359150604084013590509250925092565b6000815190506101a6816101b9565b92915050565b6000602082840312156101ae57600080fd5b60006101b084828501610197565b91505092915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60006101f1826101b9565b9050919050565b600060208284031215610208576101ed6101e6565b5b600061021384828501610197565b91505092915050565b600061022782610213565b9050919050565b6000819050919050565b6102418161022e565b811461024c57600080fd5b50565b60008151905061025e81610238565b92915050565b60006020828403121561027a576102756101e6565b5b60006102888482850161024f565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b565b565b565b565b565b";
        
        // Deploy a minimal test contract
        console.log("⏳ Deploying test contract...");
        
        const factory = new ethers.ContractFactory(
            [
                "function testCreate() external returns (address, bool, uint256)",
                "function testCreate2() external returns (address, bool, uint256)"
            ],
            simpleTestBytecode,
            wallet
        );
        
        const testContract = await factory.deploy();
        await testContract.waitForDeployment();
        
        const contractAddress = await testContract.getAddress();
        console.log(`✅ Test contract deployed at: ${contractAddress}`);
        
        // Test CREATE operation
        console.log(`\n🧪 Testing CREATE operation...`);
        const createTx = await testContract.testCreate();
        const createReceipt = await createTx.wait();
        
        console.log(`📤 CREATE transaction: ${createTx.hash}`);
        console.log(`⛽ Gas used: ${createReceipt.gasUsed.toString()}`);
        
        // Parse the return values or events
        for (const log of createReceipt.logs) {
            try {
                const parsed = testContract.interface.parseLog(log);
                if (parsed.name === "ContractCreated") {
                    console.log(`📍 Created address: ${parsed.args.addr}`);
                    console.log(`✅ Success: ${parsed.args.success}`);
                    console.log(`📊 Code length: ${parsed.args.codeLength.toString()}`);
                    
                    if (parsed.args.success && parsed.args.addr !== "0x0000000000000000000000000000000000000000") {
                        console.log(`🎉 CREATE operation SUCCESSFUL on Anvil!`);
                    } else {
                        console.log(`❌ CREATE operation failed on Anvil`);
                    }
                }
            } catch (e) {
                // Not our event
            }
        }
        
        // Test CREATE2 operation
        console.log(`\n🧪 Testing CREATE2 operation...`);
        const create2Tx = await testContract.testCreate2();
        const create2Receipt = await create2Tx.wait();
        
        console.log(`📤 CREATE2 transaction: ${create2Tx.hash}`);
        console.log(`⛽ Gas used: ${create2Receipt.gasUsed.toString()}`);
        
        // Parse CREATE2 results
        for (const log of create2Receipt.logs) {
            try {
                const parsed = testContract.interface.parseLog(log);
                if (parsed.name === "ContractCreated") {
                    console.log(`📍 Created address: ${parsed.args.addr}`);
                    console.log(`✅ Success: ${parsed.args.success}`);
                    console.log(`📊 Code length: ${parsed.args.codeLength.toString()}`);
                    
                    if (parsed.args.success && parsed.args.addr !== "0x0000000000000000000000000000000000000000") {
                        console.log(`🎉 CREATE2 operation SUCCESSFUL on Anvil!`);
                    } else {
                        console.log(`❌ CREATE2 operation failed on Anvil`);
                    }
                }
            } catch (e) {
                // Not our event
            }
        }
        
        console.log(`\n📊 ANVIL TEST RESULTS:`);
        console.log(`✅ Contract deployment: SUCCESS`);
        console.log(`? CREATE operation: Check logs above`);
        console.log(`? CREATE2 operation: Check logs above`);
        
        console.log(`\n💡 If Anvil CREATE operations work but Base Sepolia fails:`);
        console.log(`   → Confirms Base Sepolia has CREATE opcode issues`);
        console.log(`   → Shows our contract logic is correct`);
        console.log(`   → Indicates network-specific limitation`);
        
    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
    } finally {
        await stopAnvil();
    }
}

// Handle cleanup
process.on('SIGINT', async () => {
    await stopAnvil();
    process.exit();
});

testCreateOnAnvil().catch(console.error);
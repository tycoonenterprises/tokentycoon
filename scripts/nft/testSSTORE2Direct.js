import { ethers } from 'ethers';

// Test SSTORE2 functionality directly
async function testSSTORE2Direct() {
    console.log('🧪 Testing SSTORE2 Functionality Directly');
    console.log('========================================');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const privateKey = "0xad17ea4e1dee854ab5a563869bba2ba8168153826359270b90913f9f4349a251";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Simple test contract that uses SSTORE2
    const testContractSource = `
    pragma solidity ^0.8.24;
    
    library SSTORE2Test {
        error DataTooLarge();
        error DeploymentFailed();
        
        function write(bytes memory data) internal returns (address pointer) {
            if (data.length > 24575) revert DataTooLarge();
            
            bytes memory code = abi.encodePacked(
                hex"00", // STOP opcode
                data
            );
            
            assembly {
                pointer := create(0, add(code, 0x20), mload(code))
                if iszero(pointer) {
                    revert(0, 0)
                }
            }
        }
        
        function read(address pointer) internal view returns (bytes memory data) {
            uint256 size = pointer.code.length - 1;
            assembly {
                data := mload(0x40)
                mstore(0x40, add(data, add(size, 0x20)))
                mstore(data, size)
                extcodecopy(pointer, add(data, 0x20), 1, size)
            }
        }
    }
    
    contract SSTORE2Tester {
        address public lastPointer;
        
        function testWrite(bytes memory data) public returns (address) {
            lastPointer = SSTORE2Test.write(data);
            return lastPointer;
        }
        
        function testRead(address pointer) public view returns (bytes memory) {
            return SSTORE2Test.read(pointer);
        }
    }`;
    
    // For now, let's test a simpler approach - manually create a contract with data
    console.log('🔧 Testing manual contract creation with data...');
    
    const testData = "Hello, SSTORE2!";
    const testDataBytes = ethers.toUtf8Bytes(testData);
    
    console.log(`📝 Test data: "${testData}"`);
    console.log(`📊 Data bytes length: ${testDataBytes.length}`);
    
    // Create the bytecode manually: STOP opcode (0x00) + data
    const contractBytecode = "0x00" + ethers.hexlify(testDataBytes).slice(2);
    console.log(`🔧 Contract bytecode: ${contractBytecode.substring(0, 50)}...`);
    console.log(`📏 Bytecode length: ${contractBytecode.length / 2 - 1} bytes`);
    
    try {
        // Deploy the contract using a transaction
        const deployTx = {
            data: contractBytecode,
            gasLimit: 100000
        };
        
        console.log('\n🚀 Deploying test contract...');
        const tx = await wallet.sendTransaction(deployTx);
        console.log(`📋 Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Contract deployed to: ${receipt.contractAddress}`);
        
        // Test reading from the deployed contract
        console.log('\n📖 Testing contract read...');
        const code = await provider.getCode(receipt.contractAddress);
        console.log(`📊 Contract code length: ${code.length} chars`);
        
        if (code.length > 4) { // More than just "0x"
            // Extract data (skip the 0x00 prefix)
            const dataHex = code.slice(4); // Remove "0x00"
            const recoveredData = ethers.toUtf8String("0x" + dataHex);
            console.log(`✅ Recovered data: "${recoveredData}"`);
            console.log(`✅ Data matches: ${recoveredData === testData}`);
        } else {
            console.log('❌ No data found in deployed contract');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

testSSTORE2Direct().catch(console.error);
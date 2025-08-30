import { ethers } from 'ethers';

async function testContract() {
    console.log('🔍 Testing contract directly...');
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contractAddress = "0x39F7f55ff2Ef18763fdFeaF878C9414720dBfBFE";
    
    // Check if code exists
    const code = await provider.getCode(contractAddress);
    console.log(`📋 Contract code length: ${code.length} chars`);
    
    if (code === '0x') {
        console.log('❌ No contract code found at this address');
        return;
    }
    
    // Try simple contract calls
    const minimalABI = [
        "function supportsInterface(bytes4 interfaceId) view returns (bool)"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, minimalABI, provider);
        
        // Test ERC165 interface support (every contract should have this)
        const supportsERC165 = await contract.supportsInterface("0x01ffc9a7");
        console.log(`✅ Supports ERC165: ${supportsERC165}`);
        
        console.log('✅ Contract is responding to calls');
        
    } catch (error) {
        console.log(`❌ Contract call failed: ${error.message}`);
    }
}

testContract().catch(console.error);
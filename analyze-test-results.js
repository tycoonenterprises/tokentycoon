import { ethers } from 'ethers';

const DEBUG_CONTRACT_ADDRESS = "0xBBcA7508e29C2ac572E74c91d7809b56BB86F824";

const DEBUG_ABI = [
    "function testResults(uint256) external view returns (tuple(address pointer, uint256 gasUsed, bool success, uint256 bytecodeLength, bytes32 dataHash))",
    "function getResultCount() external view returns (uint256)",
    "function verifyPointer(address) external view returns (bool exists, uint256 codeLength, bytes32 codeHash)"
];

async function analyzeResults() {
    console.log("🔍 Analyzing Test Results");
    console.log("==========================");
    
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new ethers.Contract(DEBUG_CONTRACT_ADDRESS, DEBUG_ABI, provider);
    
    // Get number of results
    const resultCount = await contract.getResultCount();
    console.log(`📊 Total results stored: ${resultCount.toString()}`);
    
    if (resultCount === 0n) {
        console.log("❌ No results stored - this confirms the CREATE operations failed silently");
        return;
    }
    
    // Analyze each result
    for (let i = 0; i < Number(resultCount); i++) {
        console.log(`\n--- Result ${i + 1} ---`);
        
        const result = await contract.testResults(i);
        console.log(`📍 Pointer: ${result.pointer}`);
        console.log(`⛽ Gas used: ${result.gasUsed.toString()}`);
        console.log(`✅ Success: ${result.success}`);
        console.log(`📊 Bytecode length: ${result.bytecodeLength.toString()}`);
        console.log(`🔑 Data hash: ${result.dataHash}`);
        
        if (result.pointer !== "0x0000000000000000000000000000000000000000") {
            // Verify the pointer
            const verification = await contract.verifyPointer(result.pointer);
            console.log(`🔍 Verification:`);
            console.log(`   Exists: ${verification.exists}`);
            console.log(`   Code length: ${verification.codeLength.toString()}`);
            console.log(`   Code hash: ${verification.codeHash}`);
            
            // Also check directly with provider
            const actualCode = await provider.getCode(result.pointer);
            console.log(`🌐 Direct provider check:`);
            console.log(`   Code length: ${actualCode.length} chars`);
            console.log(`   Has code: ${actualCode.length > 2 ? 'YES' : 'NO'}`);
            
            if (actualCode.length > 2) {
                console.log(`   Code preview: ${actualCode.substring(0, 30)}...`);
            }
        }
    }
}

analyzeResults().catch(console.error);
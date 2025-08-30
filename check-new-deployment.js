import { ethers } from 'ethers';

async function checkDeployment() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const addresses = {
        "TokenTycoonCards (NEW)": "0x34ad54eAfa6C350B92e7AD49f1B74Df08d44f603",
        "TokenTycoonDecks": "0xF0dfFFE60123f32F3218797d2Ac7Bc278aDc5b42",
        "TokenTycoonPacks": "0x573fDFC26F2aDFBF9AaA651f7A55D2481Ee3DE6c"
    };
    
    console.log("🔍 Checking deployment status...\n");
    
    for (const [name, address] of Object.entries(addresses)) {
        const code = await provider.getCode(address);
        console.log(`${name}:`);
        console.log(`  Address: ${address}`);
        console.log(`  Code length: ${code.length} chars`);
        console.log(`  Status: ${code.length > 2 ? '✅ Deployed' : '❌ Not found'}`);
        console.log();
    }
}

checkDeployment();
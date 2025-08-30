import { ethers } from 'ethers';

// Load deployed contracts
import fs from 'fs';
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI
const CARDS_ABI = [
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))"
];

async function checkMultiplePointers() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new ethers.Contract(deployedContracts.TokenTycoonCards, CARDS_ABI, provider);
    
    console.log(`🔍 Checking SSTORE2 pointers for multiple cards`);
    console.log(`📍 Contract: ${deployedContracts.TokenTycoonCards}`);
    
    // Check cards 1, 10, 11, 50, 91
    const cardsToCheck = [1, 10, 11, 50, 91];
    
    for (const cardId of cardsToCheck) {
        console.log(`\n--- Card ${cardId} ---`);
        
        try {
            const metadata = await contract.getCardMetadata(cardId);
            console.log(`   Name: "${metadata.name}"`);
            console.log(`   Finalized: ${metadata.finalized}`);
            console.log(`   SVG Pointer: ${metadata.svgPointer}`);
            console.log(`   JSON Pointer: ${metadata.jsonPointer}`);
            
            // Check if pointers are zero addresses
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            if (metadata.svgPointer === zeroAddress) {
                console.log(`   ⚠️  SVG pointer is zero address`);
            } else {
                const svgBytecode = await provider.getCode(metadata.svgPointer);
                console.log(`   📊 SVG bytecode length: ${svgBytecode.length} chars`);
                
                // Check if it's a real contract on Base Sepolia explorer
                console.log(`   🌐 Base Explorer: https://sepolia.basescan.org/address/${metadata.svgPointer}`);
            }
            
            if (metadata.jsonPointer === zeroAddress) {
                console.log(`   ⚠️  JSON pointer is zero address`);
            } else {
                const jsonBytecode = await provider.getCode(metadata.jsonPointer);
                console.log(`   📊 JSON bytecode length: ${jsonBytecode.length} chars`);
                console.log(`   🌐 Base Explorer: https://sepolia.basescan.org/address/${metadata.jsonPointer}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

checkMultiplePointers();
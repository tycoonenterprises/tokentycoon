import { createPublicClient, http } from 'viem';
import { anvil } from 'viem/chains';

const CARD_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Minimal ABI for getCard function
const cardRegistryAbi = [
  {
    inputs: [{ name: "_cardId", type: "uint256" }],
    name: "getCard",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "cost", type: "uint256" },
          { name: "cardType", type: "uint8" },
          {
            name: "abilities",
            type: "tuple[]",
            components: [
              { name: "name", type: "string" },
              {
                name: "options",
                type: "tuple[]",
                components: [
                  { name: "key", type: "string" },
                  { name: "value", type: "string" }
                ]
              }
            ]
          }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

async function checkCard() {
  const client = createPublicClient({
    chain: anvil,
    transport: http('http://localhost:8545'),
  });

  // Check card ID 47 specifically (from the logs)
  console.log('Checking card ID 47 specifically:\n');
  
  try {
    const card47 = await client.readContract({
      address: CARD_REGISTRY_ADDRESS,
      abi: cardRegistryAbi,
      functionName: 'getCard',
      args: [BigInt(47)],
    });
    
    console.log(`Card ID 47: ${card47.name}`);
    console.log(`Description: ${card47.description}`);
    console.log(`Cost: ${card47.cost}`);
    console.log(`Card Type: ${card47.cardType} (0=Chain, 1=DeFi, 2=EOA, 3=Action)`);
    console.log(`Abilities:`, card47.abilities);
    
    if (card47.abilities && card47.abilities.length > 0) {
      card47.abilities.forEach((ability, idx) => {
        console.log(`  Ability ${idx}: ${ability.name}`);
        if (ability.options && ability.options.length > 0) {
          ability.options.forEach(opt => {
            console.log(`    - ${opt.key}: ${opt.value}`);
          });
        }
      });
    }
  } catch (error) {
    console.log('Error fetching card 47:', error);
  }
  
  console.log('\n---\n');
  
  // Find Dune Research - it should be around card ID 49 based on position in cards.json
  // Let's check a range of cards to find it
  console.log('Searching for Dune Research card...\n');
  
  for (let i = 45; i < 55; i++) {
    try {
      const card = await client.readContract({
        address: CARD_REGISTRY_ADDRESS,
        abi: cardRegistryAbi,
        functionName: 'getCard',
        args: [BigInt(i)],
      });
      
      if (card.name.includes('Dune') || card.name.includes('Research')) {
        console.log(`Found at Card ID ${i}: ${card.name}`);
        console.log(`Description: ${card.description}`);
        console.log(`Cost: ${card.cost}`);
        console.log(`Card Type: ${card.cardType} (0=Chain, 1=DeFi, 2=EOA, 3=Action)`);
        console.log(`Abilities:`, card.abilities);
        
        if (card.abilities && card.abilities.length > 0) {
          card.abilities.forEach((ability, idx) => {
            console.log(`  Ability ${idx}: ${ability.name}`);
            if (ability.options && ability.options.length > 0) {
              ability.options.forEach(opt => {
                console.log(`    - ${opt.key}: ${opt.value}`);
              });
            }
          });
        }
        console.log('---');
      }
    } catch (error) {
      // Card doesn't exist at this ID
    }
  }
  
  // Also check the first few cards to see what's there
  console.log('\nFirst 3 cards in registry:');
  for (let i = 0; i < 3; i++) {
    try {
      const card = await client.readContract({
        address: CARD_REGISTRY_ADDRESS,
        abi: cardRegistryAbi,
        functionName: 'getCard',
        args: [BigInt(i)],
      });
      console.log(`Card ${i}: ${card.name} (Type: ${card.cardType})`);
    } catch (error) {
      console.log(`Card ${i}: Does not exist`);
    }
  }
}

checkCard().catch(console.error);
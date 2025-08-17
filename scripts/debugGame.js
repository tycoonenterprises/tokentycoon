import { createPublicClient, http } from 'viem';
import { anvil } from 'viem/chains';

const GAME_ENGINE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// Minimal ABI for game functions
const gameEngineAbi = [
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "getGameState",
    outputs: [{
      components: [
        { name: "player1", type: "address" },
        { name: "player2", type: "address" },
        { name: "isStarted", type: "bool" },
        { name: "isFinished", type: "bool" },
        { name: "currentTurn", type: "uint256" },
        { name: "turnNumber", type: "uint256" },
        { name: "needsToDraw", type: "bool" },
        { name: "player1ETH", type: "uint256" },
        { name: "player2ETH", type: "uint256" },
        { name: "player1ColdStorage", type: "uint256" },
        { name: "player2ColdStorage", type: "uint256" }
      ],
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_player", type: "address" }
    ],
    name: "getPlayerHand",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  }
];

async function debugGame() {
  const client = createPublicClient({
    chain: anvil,
    transport: http('http://localhost:8545'),
  });

  // Check the most recent games (starting from higher IDs)
  console.log('Checking games...');
  for (let gameId = 0; gameId < 20; gameId++) {
    try {
      const gameState = await client.readContract({
        address: GAME_ENGINE_ADDRESS,
        abi: gameEngineAbi,
        functionName: 'getGameState',
        args: [BigInt(gameId)],
      });
      
      if (gameState.isStarted) {
        console.log(`\n=== GAME ${gameId} ===`);
        console.log(`Player 1: ${gameState.player1}`);
        console.log(`Player 2: ${gameState.player2}`);
        console.log(`Current Turn: ${gameState.currentTurn === 0n ? 'Player 1' : 'Player 2'}`);
        console.log(`Turn Number: ${gameState.turnNumber}`);
        console.log(`Needs to Draw: ${gameState.needsToDraw}`);
        
        // Get hands
        const p1Hand = await client.readContract({
          address: GAME_ENGINE_ADDRESS,
          abi: gameEngineAbi,
          functionName: 'getPlayerHand',
          args: [BigInt(gameId), gameState.player1],
        });
        
        const p2Hand = await client.readContract({
          address: GAME_ENGINE_ADDRESS,
          abi: gameEngineAbi,
          functionName: 'getPlayerHand',
          args: [BigInt(gameId), gameState.player2],
        });
        
        console.log(`Player 1 hand: ${p1Hand.length} cards - IDs: [${p1Hand.join(', ')}]`);
        console.log(`Player 2 hand: ${p2Hand.length} cards - IDs: [${p2Hand.join(', ')}]`);
        
        // Check if card ID 46 (Dune Research) is in either hand
        if (p1Hand.includes(46n)) {
          console.log('⚠️  Player 1 has Dune Research (ID 46) in hand');
        }
        if (p2Hand.includes(46n)) {
          console.log('⚠️  Player 2 has Dune Research (ID 46) in hand');
        }
      }
    } catch (error) {
      // Game doesn't exist
    }
  }
}

debugGame().catch(console.error);
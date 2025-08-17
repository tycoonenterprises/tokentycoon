# Smart Contract Integration Plan

## Overview

This document outlines the plan to integrate the Token Tycoon frontend with the real smart contracts deployed on localhost:8545. The goal is to replace the mock contract system with real blockchain interactions to demonstrate end-to-end functionality.

## Current Smart Contract Architecture

### Contract System
Based on analysis of `../src/*`, the system consists of three main contracts:

1. **CardRegistry** (`CardRegistry.sol`)
   - Stores card definitions/templates (not NFTs)
   - Contains card metadata: id, name, description, cost, cardType, abilities
   - Functions: `getAllCards()`, `getCard(id)`, `getCardByName(name)`, `getCardCount()`

2. **DeckRegistry** (`DeckRegistry.sol`) 
   - Stores predefined deck configurations
   - References CardRegistry for card validation
   - Functions: `getAllDecks()`, `getDeck(id)`, `getDeckByName(name)`, `expandDeck(id)`

3. **GameEngine** (`GameEngine.sol`)
   - Manages actual game sessions between players
   - Handles game flow: create, join, start, turns, hands
   - Functions: `createGame(deckId)`, `joinGame(gameId, deckId)`, `startGame(gameId)`, `drawCard(gameId)`, `getPlayerHand(gameId, player)`

### Data Initialization
- **Cards**: Loaded from `../data/cards.json` (4 cards: Polygon, Uniswap, Validator Node, Read a Whitepaper)
- **Decks**: Loaded from `../data/decks.json` (1 deck: "Starter Deck" with 40 cards total)
- **Deployment**: Uses `../scripts/deployAll.js` and Forge scripts

## Integration Plan

### Phase 1: Contract Deployment & Discovery ✅

**Goal**: Deploy contracts to localhost:8545 and make them discoverable to the frontend

**Tasks**:
1. **Deploy Real Contracts**
   ```bash
   cd ../
   # Start Anvil if not running
   anvil --host 0.0.0.0 --port 8545
   
   # Deploy all contracts and initialize data
   npm run deploy:all  # or node scripts/deployAll.js
   ```

2. **Extract Contract Addresses**
   - Parse `deployed-addresses.json` created by deployment script
   - Update frontend environment variables
   - Create contract ABI files from compiled contracts

3. **Update Frontend Configuration**
   ```typescript
   // Update src/lib/web3/config.ts
   export const CONTRACT_ADDRESSES = {
     CARD_REGISTRY: '0x...', // from deployed-addresses.json
     DECK_REGISTRY: '0x...', 
     GAME_ENGINE: '0x...',
   }
   ```

### Phase 2: Contract ABI Integration 📋

**Goal**: Replace mock contract interfaces with real contract ABIs

**Tasks**:
1. **Generate ABI Files**
   - Copy ABIs from `../out/*/json` files to frontend
   - Create TypeScript ABI definitions
   - Update contract interface types

2. **Update Contract Files**
   ```typescript
   // Replace src/lib/contracts/mockContract.ts with:
   // src/lib/contracts/CardRegistry.ts
   // src/lib/contracts/DeckRegistry.ts  
   // src/lib/contracts/GameEngine.ts
   ```

3. **Create Contract Hooks**
   ```typescript
   // src/lib/hooks/useCardRegistry.ts
   // src/lib/hooks/useDeckRegistry.ts
   // src/lib/hooks/useGameEngine.ts
   ```

### Phase 3: Basic Card Discovery 🃏

**Goal**: Load real cards from CardRegistry and display them in the UI

**Tasks**:
1. **Implement Card Loading**
   ```typescript
   // Hook to load all cards from CardRegistry
   const useCards = () => {
     const { data: cards } = useReadContract({
       address: CONTRACT_ADDRESSES.CARD_REGISTRY,
       abi: CardRegistryABI,
       functionName: 'getAllCards',
     })
     return cards
   }
   ```

2. **Update Game Store**
   - Replace mock card data with real blockchain data
   - Update card interface to match contract structure
   - Handle card abilities parsing

3. **Update UI Components**
   - Modify card display components to show real card data
   - Update hand/board components to work with contract card IDs
   - Add loading states for blockchain calls

### Phase 4: Deck System Integration 📦

**Goal**: Load predefined decks from DeckRegistry and allow deck selection

**Tasks**:
1. **Implement Deck Loading**
   ```typescript
   const useDecks = () => {
     const { data: decks } = useReadContract({
       address: CONTRACT_ADDRESSES.DECK_REGISTRY,
       abi: DeckRegistryABI,
       functionName: 'getAllDecks',
     })
     return decks
   }
   ```

2. **Update Deck Builder**
   - Replace NFT-based deck building with predefined deck selection
   - Show available deck templates from DeckRegistry
   - Display deck composition and card counts

3. **Integrate with Game Creation**
   - Allow players to select from available decks
   - Pass deck ID to GameEngine when creating games

### Phase 5: Real Game Sessions 🎮

**Goal**: Create and manage real game sessions through GameEngine

**Tasks**:
1. **Game Lobby Implementation**
   ```typescript
   // Functions to interact with GameEngine
   const createGame = (deckId: number) => {
     return writeContract({
       address: CONTRACT_ADDRESSES.GAME_ENGINE,
       abi: GameEngineABI,
       functionName: 'createGame',
       args: [deckId],
     })
   }
   ```

2. **Game Flow Integration**
   - Create game with selected deck
   - Join existing games  
   - Start games when both players ready
   - Handle turn management
   - Draw cards from deck
   - Get player hands from contract

3. **Real-time Game State**
   - Poll contract for game state updates
   - Update UI based on blockchain game state
   - Handle game events and turn changes

### Phase 6: Transaction Integration 💰

**Goal**: Handle all game actions as blockchain transactions

**Tasks**:
1. **Transaction Wrapper**
   ```typescript
   const useGameTransaction = () => {
     const { writeContract, isLoading, isSuccess, error } = useWriteContract()
     // Wrap all game actions with transaction handling
   }
   ```

2. **User Experience**
   - Show transaction pending states
   - Handle transaction confirmations
   - Display gas costs and transaction hashes
   - Implement transaction error handling

3. **Game Action Integration**
   - Convert game actions to contract calls
   - Handle transaction timing for turn-based play
   - Implement transaction queuing for multiple actions

### Phase 7: Demo Preparation 🎯

**Goal**: Create a polished demo showing end-to-end functionality

**Tasks**:
1. **Two-Player Demo Setup**
   - Set up two browser windows/accounts
   - Create a complete game flow walkthrough
   - Test all major interactions

2. **Demo Script**
   - Player 1: Connect wallet, create game with deck
   - Player 2: Connect wallet, join game  
   - Both: Start game, take turns, draw cards
   - Show real blockchain transactions throughout

3. **Error Handling & Polish**
   - Add proper error messages for failed transactions
   - Implement loading states for all blockchain calls
   - Add transaction history/log display

## Technical Implementation Details

### Contract Address Management
```typescript
// src/lib/web3/addresses.ts
export const loadContractAddresses = async () => {
  // Load from deployed-addresses.json or environment
  return {
    cardRegistry: process.env.VITE_CARD_REGISTRY_ADDRESS,
    deckRegistry: process.env.VITE_DECK_REGISTRY_ADDRESS, 
    gameEngine: process.env.VITE_GAME_ENGINE_ADDRESS,
  }
}
```

### ABI Integration
```typescript
// src/lib/contracts/abis.ts
export { CardRegistryABI } from './CardRegistry.abi'
export { DeckRegistryABI } from './DeckRegistry.abi'
export { GameEngineABI } from './GameEngine.abi'
```

### Contract Hooks Pattern
```typescript
// src/lib/hooks/useGameEngine.ts
export const useGameEngine = () => {
  const createGame = useMutation({
    mutationFn: async (deckId: number) => {
      return await writeContract({
        address: gameEngineAddress,
        abi: GameEngineABI,
        functionName: 'createGame',
        args: [deckId],
      })
    }
  })
  
  return { createGame }
}
```

## Success Criteria

### Minimum Viable Demo
1. ✅ **Wallet Connection**: Users can connect wallets via Privy
2. ✅ **Card Discovery**: Display real cards from CardRegistry
3. ✅ **Deck Selection**: Choose from predefined decks in DeckRegistry
4. ✅ **Game Creation**: Create game sessions via GameEngine
5. ✅ **Game Play**: Join games, draw cards, manage turns
6. ✅ **Transaction Visibility**: Show all blockchain transactions

### Full Integration Success
1. **End-to-End Flow**: Complete game from wallet connection to game completion
2. **Two-Player Demo**: Full multiplayer game session
3. **Real Transactions**: All game actions recorded on blockchain
4. **No Mock Data**: Zero dependency on mock contracts/data
5. **Production Ready**: Error handling, loading states, transaction management

## Risk Mitigation

### Technical Risks
- **Gas Costs**: Game actions may be expensive - implement gas estimation
- **Transaction Speed**: Blockchain delays - add optimistic updates where possible
- **Contract Bugs**: Test thoroughly in local environment first

### User Experience Risks  
- **Wallet UX**: Complex transaction flows - provide clear explanations
- **Loading Times**: Blockchain calls are slow - implement proper loading states
- **Error Handling**: Failed transactions - provide retry mechanisms

## Timeline Estimate

- **Phase 1-2**: Contract deployment and ABI setup (2-4 hours)
- **Phase 3-4**: Card and deck loading (4-6 hours)  
- **Phase 5-6**: Game session integration (6-8 hours)
- **Phase 7**: Demo polish and testing (2-4 hours)

**Total**: 14-22 hours for complete integration

## Post-Integration Enhancements

Future improvements after basic integration:
1. **Event Listening**: React to blockchain events in real-time
2. **Game History**: Track completed games and statistics  
3. **Advanced Deck Building**: Allow custom deck creation
4. **Tournament System**: Multi-game tournaments
5. **Card Abilities**: Implement actual card ability effects
6. **NFT Integration**: Convert to true NFT ownership system
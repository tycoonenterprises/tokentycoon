# Card Initialization Guide

This guide shows how to properly initialize all 91 cards in the Token Tycoon NFT system.

## Problem Identified

The current deployment has:
- ✅ NFT contracts deployed correctly
- ❌ Cards initialized with incorrect/incomplete metadata
- ❌ SSTORE2 pointer storage issues
- ❌ URI function fails due to broken pointers

## Solution Summary

1. **Complete Card Data Available**: All 91 cards with SVG artwork ready in `/data/nft/cardInitData.json`
2. **Proper Initialization Functions**: `setCardMetadata()`, `setCardAbilities()`, `finalizeMetadata()`
3. **Multiple Initialization Methods**: Forge scripts, Node.js scripts, manual cast commands

## Deployed Contracts (Base Sepolia)

```json
{
  "TokenTycoonCards": "0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16",
  "TokenTycoonDecks": "0x75a850EF4fB0B4665430d7Dc4ccfA510C6498308", 
  "TokenTycoonPacks": "0x99B22E8FfA132C7F6D57Ef3de97Dc143FE7AeC8F"
}
```

## Quick Test - Initialize One Card

```bash
# Set your private key
export PRIVATE_KEY="your_private_key_here"

# Run the manual initialization script
./initialize_cards_manual.sh
```

This will initialize card ID 10 as a test and show you how to query it.

## Full Initialization Options

### Option 1: Node.js Script (Recommended)

```bash
# Install dependencies
npm install ethers

# Set environment variable
export PRIVATE_KEY="your_private_key_here"

# Run full initialization
node scripts/nft/initializeAllCards.js
```

**Features:**
- Processes cards in batches (5 at a time)
- Proper error handling
- Progress tracking
- Gas optimization

### Option 2: Forge Script

```bash
# Set environment variables
export CARDS_CONTRACT="0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16"
export PRIVATE_KEY="your_private_key_here"

# Run forge script
forge script script/InitializeCards.s.sol --rpc-url https://sepolia.base.org --broadcast
```

### Option 3: Cast Commands (Manual)

```bash
# Initialize a single card manually
cast send --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --gas-limit 2000000 \
  0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16 \
  "setCardMetadata(uint256,string,string,uint256,uint8,bytes,uint256)" \
  2 "Bridge Hack" "Destroy target chain and all DeFi Protocols on it." 5 3 "0x3c737667..." 0
```

## Card Data Structure

Each card requires:

```solidity
struct CardMetadata {
    string name;           // e.g., "Bridge Hack"
    string description;    // e.g., "Destroy target chain..."
    uint256 cost;          // e.g., 5 (ETH cost)
    CardType cardType;     // 0=Chain, 1=DeFi, 2=EOA, 3=Action
    bytes svgData;         // Full SVG artwork
    uint256 maxSupply;     // 0 for unlimited
}

struct Ability {
    string abilityType;    // e.g., "destroy", "income", "draw"
    uint256 amount;        // e.g., 1, 2, 3
}
```

## Verification Commands

After initialization, test with:

```bash
CARDS_CONTRACT="0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16"

# Check card metadata
cast call --rpc-url https://sepolia.base.org $CARDS_CONTRACT "getCardMetadata(uint256)" 2

# Check card abilities  
cast call --rpc-url https://sepolia.base.org $CARDS_CONTRACT "getCardAbilities(uint256)" 2

# Check if card URI works (should work after proper initialization)
cast call --rpc-url https://sepolia.base.org $CARDS_CONTRACT "uri(uint256)" 2

# Check balance (should be 0 until cards are minted)
cast call --rpc-url https://sepolia.base.org $CARDS_CONTRACT "balanceOf(address,uint256)" YOUR_ADDRESS 2
```

## Expected Results

After proper initialization:

✅ **Card Metadata**: Correct name, description, cost, type  
✅ **SVG Storage**: SSTORE2 pointers with valid bytecode  
✅ **Abilities**: Proper game mechanics stored  
✅ **URI Function**: Returns valid JSON metadata with base64 SVG  
✅ **Finalized**: Metadata locked and immutable  

## Current Status

- **Cards Deployed**: ✅ Contract ready
- **Test Data**: ❌ Card 1 has corrupted metadata (finalized, can't fix)  
- **Real Data**: ⏳ Needs initialization starting from card 2+
- **All Cards**: ⏳ 91 cards waiting for proper initialization

## Next Steps

1. **Set Private Key**: Export PRIVATE_KEY environment variable
2. **Run Initialization**: Use any of the three methods above
3. **Verify Results**: Test queries to ensure proper data storage
4. **Mint Cards**: After initialization, cards can be minted for gameplay

## File Locations

- **Card Data**: `/data/nft/cardInitData.json` (91 cards)
- **SVG Mapping**: `/data/nft/cardSVGMapping.json` 
- **Forge Script**: `/script/InitializeCards.s.sol`
- **Node Script**: `/scripts/nft/initializeAllCards.js`
- **Manual Script**: `/initialize_cards_manual.sh`

## Troubleshooting

**URI Function Fails**: SSTORE2 pointers are empty - need proper initialization  
**Metadata Incorrect**: Card 1 is corrupted and finalized - start from card 2+  
**Gas Issues**: Use gas limits: metadata=2M, abilities=500K, finalize=300K  
**Permissions**: Ensure wallet has ADMIN_ROLE on the contract  

---

**Ready to initialize all 91 cards with proper SVG artwork and metadata!** 🎴
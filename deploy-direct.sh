#!/bin/bash

# Direct deployment to Base Sepolia using forge create

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    echo "Please run: export PRIVATE_KEY=\"your-private-key-here\""
    exit 1
fi

echo "🚀 Deploying to Base Sepolia..."
echo "Using account with private key starting with: ${PRIVATE_KEY:0:10}..."

# Build first
echo "Building contracts..."
forge build

# Deploy CardRegistry
echo ""
echo "📋 Deploying CardRegistry..."
OUTPUT=$(forge create src/CardRegistry.sol:CardRegistry \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --broadcast \
    2>&1)

echo "Full output:"
echo "$OUTPUT"

CARD_REGISTRY=$(echo "$OUTPUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$CARD_REGISTRY" ]; then
    echo "❌ Failed to deploy CardRegistry"
    echo "Error output: $OUTPUT"
    exit 1
fi

echo "✅ CardRegistry deployed at: $CARD_REGISTRY"

# Deploy DeckRegistry
echo ""
echo "📚 Deploying DeckRegistry..."
DECK_REGISTRY=$(forge create src/DeckRegistry.sol:DeckRegistry \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --constructor-args $CARD_REGISTRY \
    2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$DECK_REGISTRY" ]; then
    echo "❌ Failed to deploy DeckRegistry"
    exit 1
fi

echo "✅ DeckRegistry deployed at: $DECK_REGISTRY"

# Deploy GameEngine
echo ""
echo "🎮 Deploying GameEngine..."
GAME_ENGINE=$(forge create src/GameEngine.sol:GameEngine \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --constructor-args $CARD_REGISTRY $DECK_REGISTRY \
    2>&1 | grep "Deployed to:" | awk '{print $3}')

if [ -z "$GAME_ENGINE" ]; then
    echo "❌ Failed to deploy GameEngine"
    exit 1
fi

echo "✅ GameEngine deployed at: $GAME_ENGINE"

# Save addresses
echo ""
echo "💾 Saving addresses to base-sepolia-addresses.json..."
cat > base-sepolia-addresses.json << EOF
{
  "CARD_REGISTRY": "$CARD_REGISTRY",
  "DECK_REGISTRY": "$DECK_REGISTRY",
  "GAME_ENGINE": "$GAME_ENGINE",
  "CHAIN_ID": 84532,
  "RPC_URL": "https://sepolia.base.org"
}
EOF

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Summary:"
echo "CardRegistry: $CARD_REGISTRY"
echo "DeckRegistry: $DECK_REGISTRY"
echo "GameEngine: $GAME_ENGINE"
echo ""
echo "To initialize cards and decks, run:"
echo "NETWORK=base_sepolia PRIVATE_KEY=\$PRIVATE_KEY CARD_REGISTRY_ADDRESS=$CARD_REGISTRY node scripts/deployCards.js"
echo "NETWORK=base_sepolia PRIVATE_KEY=\$PRIVATE_KEY DECK_REGISTRY_ADDRESS=$DECK_REGISTRY node scripts/deployDecks.js"
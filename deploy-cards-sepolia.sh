#!/bin/bash

# Deploy cards to Base Sepolia one by one

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    echo "Please run: export PRIVATE_KEY=\"your-private-key-here\""
    exit 1
fi

CARD_REGISTRY_ADDRESS="0x8f0c54b31077a505A98fCE72FBc2eeF247F40550"

echo "🎴 Deploying cards to Base Sepolia"
echo "CardRegistry: $CARD_REGISTRY_ADDRESS"
echo ""

# Run the deployCards script in sequential mode
NETWORK=base_sepolia \
PRIVATE_KEY=$PRIVATE_KEY \
CARD_REGISTRY_ADDRESS=$CARD_REGISTRY_ADDRESS \
DEPLOY_MODE=sequential \
node scripts/deployCards.js
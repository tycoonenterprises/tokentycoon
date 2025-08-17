#!/bin/bash

# Deploy to Base Sepolia using forge script

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    echo "Please run: export PRIVATE_KEY=\"your-private-key-here\""
    exit 1
fi

echo "🚀 Deploying to Base Sepolia..."

# Run the deployment script
forge script script/DeployBaseSepolia.s.sol:DeployBaseSepolia \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key ${BASESCAN_API_KEY:-"dummy"} \
    -vvvv

echo "✅ Deployment complete!"
echo ""
echo "Contract addresses saved to base-sepolia-addresses.json"


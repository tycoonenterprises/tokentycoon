#!/bin/bash

# Deploy to Base Sepolia using forge script

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    echo "Please run: export PRIVATE_KEY=\"your-private-key-here\""
    exit 1
fi

echo "🚀 Deploying to Base Sepolia..."

# Run the deployment script with actual broadcast
forge script script/DeployBaseSepolia.s.sol:DeployBaseSepolia \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --slow \
    -vvv

echo "✅ Deployment complete!"
echo ""
echo "Check broadcast/DeployBaseSepolia.s.sol/84532/run-latest.json for deployed addresses"


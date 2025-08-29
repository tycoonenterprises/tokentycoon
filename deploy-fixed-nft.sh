#!/bin/bash

# Deploy NFT contracts with fixed SSTORE2 library

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    exit 1
fi

echo "🚀 Deploying NFT contracts with fixed SSTORE2..."
echo "================================================"

# Run deployment
/home/chad/.foundry/bin/forge script script/DeployNFT.s.sol \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --slow \
    -vvv

echo ""
echo "✅ Deployment complete!"
echo "Check data/nft/deployed-contracts.json for addresses"
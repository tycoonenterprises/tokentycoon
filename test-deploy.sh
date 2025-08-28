#!/bin/bash

echo "🚀 Testing Token Tycoon NFT Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "script/DeployNFT.s.sol" ]; then
    echo "❌ DeployNFT.s.sol not found. Make sure you're in the project root."
    exit 1
fi

# Check if forge is available
if ! command -v /home/chad/.foundry/bin/forge &> /dev/null; then
    echo "❌ Forge not found at expected path"
    exit 1
fi

echo "✅ Found forge at /home/chad/.foundry/bin/forge"

# Set a test private key (for local testing only)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo "✅ Environment variables set"

# Try to compile first
echo "📦 Compiling contracts..."
/home/chad/.foundry/bin/forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Contracts compiled successfully"

# Start a local anvil instance in background
echo "🔨 Starting local Anvil blockchain..."
anvil --port 8545 --host 0.0.0.0 &
ANVIL_PID=$!

# Wait for anvil to start
sleep 3

echo "✅ Anvil started (PID: $ANVIL_PID)"

# Deploy to local network
echo "🚀 Deploying NFT contracts to local network..."
/home/chad/.foundry/bin/forge script script/DeployNFT.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast \
    --private-key $PRIVATE_KEY

DEPLOY_RESULT=$?

# Clean up
echo "🧹 Cleaning up..."
kill $ANVIL_PID 2>/dev/null || true

if [ $DEPLOY_RESULT -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "📁 Check data/nft/deployed-contracts.json for contract addresses"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo "🎉 NFT deployment test completed!"
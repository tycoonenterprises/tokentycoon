#!/bin/bash

# Deploy-once script for Token Tycoon NFTs
# This prevents accidental double deployments

DEPLOYED_FILE="./data/nft/deployed-contracts.json"

echo "🚀 Token Tycoon NFT Deploy-Once Script"
echo "====================================="

# Check if already deployed
if [ -f "$DEPLOYED_FILE" ]; then
    echo "⚠️  EXISTING DEPLOYMENT FOUND!"
    echo "📁 File: $DEPLOYED_FILE"
    echo ""
    cat "$DEPLOYED_FILE"
    echo ""
    
    read -p "❓ Deploy anyway? This will create NEW contracts (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        echo "💡 Use existing addresses above, or delete $DEPLOYED_FILE to force redeploy"
        exit 0
    fi
    
    # Backup existing deployment
    BACKUP_FILE="./data/nft/deployed-contracts-$(date +%s).json.bak"
    cp "$DEPLOYED_FILE" "$BACKUP_FILE"
    echo "📦 Backed up existing deployment to: $BACKUP_FILE"
fi

# Ensure we have required env vars
if [ -z "$PRIVATE_KEY" ]; then
    read -p "🔑 Enter private key (0x...): " PRIVATE_KEY
    export PRIVATE_KEY
fi

if [ -z "$RPC_URL" ]; then
    export RPC_URL="https://sepolia.base.org"
    echo "🌐 Using default RPC: $RPC_URL"
fi

# Show deployment info
ADDRESS=$(/home/chad/.foundry/bin/cast wallet address --private-key $PRIVATE_KEY)
BALANCE=$(/home/chad/.foundry/bin/cast balance $ADDRESS --rpc-url $RPC_URL)

echo "👤 Deployer: $ADDRESS"
echo "💰 Balance: $(/home/chad/.foundry/bin/cast to-unit $BALANCE ether) ETH"
echo "🌐 Network: $RPC_URL"
echo ""

read -p "✅ Proceed with deployment? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Deploy contracts
echo "🚀 Deploying contracts..."
/home/chad/.foundry/bin/forge script script/DeployNFTSafe.s.sol \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "📁 Contract addresses saved to: $DEPLOYED_FILE"
    echo ""
    echo "🔗 Next steps:"
    echo "1. export CARDS_CONTRACT=\$(jq -r '.TokenTycoonCards' $DEPLOYED_FILE)"
    echo "2. export DECKS_CONTRACT=\$(jq -r '.TokenTycoonDecks' $DEPLOYED_FILE)"  
    echo "3. Initialize cards and decks (optional - expensive)"
else
    echo "❌ DEPLOYMENT FAILED!"
    exit 1
fi
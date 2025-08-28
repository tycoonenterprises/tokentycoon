#!/bin/bash

# Test card initialization script
echo "🧪 Token Tycoon Test Card Initialization"
echo "======================================"

# Load deployed addresses
CARDS_CONTRACT=$(jq -r '.TokenTycoonCards' ./data/nft/deployed-contracts.json)
DEPLOYER_ADDRESS=$(jq -r '.deployer' ./data/nft/deployed-contracts.json)

echo "📄 Cards Contract: $CARDS_CONTRACT"
echo "👤 Deployer: $DEPLOYER_ADDRESS"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    read -p "🔑 Enter private key (0x...): " PRIVATE_KEY
    export PRIVATE_KEY
fi

# Get current address from private key
ADDRESS=$(/home/chad/.foundry/bin/cast wallet address --private-key "$PRIVATE_KEY")
echo "🏦 Current Address: $ADDRESS"

# Check if this is the deployer (only deployer can initialize)
if [ "$ADDRESS" != "$DEPLOYER_ADDRESS" ]; then
    echo "❌ ERROR: Only the deployer ($DEPLOYER_ADDRESS) can initialize cards"
    echo "   You are: $ADDRESS"
    exit 1
fi

echo ""
echo "🚀 Initializing test cards..."

# Initialize test cards
/home/chad/.foundry/bin/forge script script/InitializeTestCards.s.sol \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --private-key "$PRIVATE_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 TEST CARDS INITIALIZED!"
    echo ""
    echo "🧪 Test minting with:"
    echo "export CARDS_CONTRACT=$CARDS_CONTRACT"
    echo "/home/chad/.foundry/bin/cast send \$CARDS_CONTRACT \"mintCard(address,uint256,uint256)\" $ADDRESS 1 1 --private-key \$PRIVATE_KEY --rpc-url https://sepolia.base.org"
    echo ""
    echo "Available test cards: 1-5 (Ethereum, Bitcoin, Uniswap, Compound, Vitalik)"
else
    echo "❌ INITIALIZATION FAILED!"
    exit 1
fi
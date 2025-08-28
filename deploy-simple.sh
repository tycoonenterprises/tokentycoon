#!/bin/bash

echo "🚀 Simple TokenTycoonCards Deployment"
echo "====================================="

# Set environment
export PRIVATE_KEY="0xad17ea4e1dee854ab5a563869bba2ba8168153826359270b90913f9f4349a251"
export RPC_URL="https://sepolia.base.org"

echo "📋 Using deployer: 0xBAdAd51de865b9d880b184f3cba6f7240e284506"
echo "🌐 Network: Base Sepolia"

# Build first
echo ""
echo "🔨 Building contract..."
/home/chad/.foundry/bin/forge build src/nft/TokenTycoonCards.sol --silent

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy
echo ""
echo "🚀 Deploying contract..."
output=$(/home/chad/.foundry/bin/forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --gas-limit 5000000 \
    --gas-price 2000000000 \
    --broadcast \
    src/nft/TokenTycoonCards.sol:TokenTycoonCards 2>&1)

echo "$output"

# Extract contract address from output
if echo "$output" | grep -q "Deployed to:"; then
    contract_address=$(echo "$output" | grep "Deployed to:" | awk '{print $3}')
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "📍 Contract Address: $contract_address"
    
    # Update deployed-contracts.json
    echo ""
    echo "📝 Updating deployed-contracts.json..."
    
    # Create backup
    cp data/nft/deployed-contracts.json data/nft/deployed-contracts.json.backup
    
    # Update the file
    node -e "
    const fs = require('fs');
    const path = 'data/nft/deployed-contracts.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data.TokenTycoonCards_OLD = data.TokenTycoonCards;
    data.TokenTycoonCards = '$contract_address';
    data.deployedAt = Math.floor(Date.now() / 1000).toString();
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log('✅ deployed-contracts.json updated');
    "
    
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Test URI functionality: node scripts/nft/testFixedURI.js"
    echo "2. Initialize cards: PRIVATE_KEY=xxx node scripts/nft/initializeAllCardsRobust.js"
    
else
    echo "❌ Deployment failed"
    echo "Output: $output"
    exit 1
fi
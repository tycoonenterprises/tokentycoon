#!/bin/bash

echo "🔧 Deploying Fixed TokenTycoonCards Contract"
echo "============================================"

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is required"
    echo "Usage: PRIVATE_KEY=your_key ./deploy-fixed-cards.sh"
    exit 1
fi

# Set the forge path
FORGE_PATH="/home/chad/.foundry/bin/forge"

# Check if forge exists
if [ ! -f "$FORGE_PATH" ]; then
    echo "❌ Error: Forge not found at $FORGE_PATH"
    echo "Please install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "📦 Building contract..."
$FORGE_PATH build --contracts src/nft/TokenTycoonCards.sol

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Let's try fixing the Unicode issue first..."
    
    # Fix the Unicode characters in deploy scripts
    echo "🔧 Fixing Unicode characters in deploy scripts..."
    
    # Replace Unicode checkmarks with regular text in deploy scripts
    find script/ -name "*.sol" -type f -exec sed -i 's/✅/[SUCCESS]/g' {} \;
    find script/ -name "*.sol" -type f -exec sed -i 's/❌/[ERROR]/g' {} \;
    find script/ -name "*.sol" -type f -exec sed -i 's/🚀/[DEPLOY]/g' {} \;
    
    echo "🔧 Retrying build..."
    $FORGE_PATH build --contracts src/nft/TokenTycoonCards.sol
    
    if [ $? -ne 0 ]; then
        echo "❌ Build still failing. Here's the manual deployment command:"
        echo ""
        echo "$FORGE_PATH create src/nft/TokenTycoonCards.sol:TokenTycoonCards \\"
        echo "  --rpc-url https://sepolia.base.org \\"
        echo "  --private-key $PRIVATE_KEY \\"
        echo "  --gas-limit 3000000"
        echo ""
        exit 1
    fi
fi

echo "✅ Build successful!"
echo ""
echo "🚀 Deploying to Base Sepolia..."

# Deploy the contract
DEPLOYMENT_OUTPUT=$($FORGE_PATH create src/nft/TokenTycoonCards.sol:TokenTycoonCards \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --gas-limit 3000000 \
    2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "$DEPLOYMENT_OUTPUT"
    
    # Extract the contract address (this is a simplified extraction)
    CONTRACT_ADDRESS=$(echo "$DEPLOYMENT_OUTPUT" | grep -oE "0x[a-fA-F0-9]{40}" | tail -1)
    
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        echo ""
        echo "📋 New Contract Address: $CONTRACT_ADDRESS"
        
        # Update the deployed contracts file
        echo "📝 Updating deployed-contracts.json..."
        
        # Read the current file
        if [ -f "data/nft/deployed-contracts.json" ]; then
            # Create a backup
            cp data/nft/deployed-contracts.json data/nft/deployed-contracts.json.backup
            
            # Update with new address (simplified - just show the command)
            echo "📝 Manual update required:"
            echo "   Update TokenTycoonCards address to: $CONTRACT_ADDRESS"
            echo "   in data/nft/deployed-contracts.json"
        fi
        
        echo ""
        echo "🧪 Testing the deployment..."
        echo "node scripts/nft/testFixedURI.js"
        
    else
        echo "⚠️ Could not extract contract address from output"
        echo "Please check the deployment output above"
    fi
else
    echo "❌ Deployment failed!"
    echo "$DEPLOYMENT_OUTPUT"
    exit 1
fi

echo ""
echo "🎉 Deployment complete! Next steps:"
echo "1. Verify contract address updated in deployed-contracts.json" 
echo "2. Run: node scripts/nft/testFixedURI.js"
echo "3. If no cards exist, re-run initialization on new contract"
echo "4. Test metadata sampler: node scripts/nft/sampleCardMetadata.js"
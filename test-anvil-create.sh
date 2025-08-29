#!/bin/bash

echo "🔥 Testing CREATE operations on Anvil vs Base Sepolia"
echo "===================================================="

# Start Anvil in background
echo "🚀 Starting Anvil..."
/home/chad/.foundry/bin/anvil --port 8545 --accounts 1 > /tmp/anvil.log 2>&1 &
ANVIL_PID=$!

# Wait for Anvil to start
sleep 3

# Function to cleanup
cleanup() {
    echo "🛑 Stopping Anvil..."
    kill $ANVIL_PID 2>/dev/null
    wait $ANVIL_PID 2>/dev/null
}

# Trap to ensure cleanup
trap cleanup EXIT

echo "✅ Anvil started (PID: $ANVIL_PID)"

# Deploy debug contract to Anvil
echo ""
echo "📦 Deploying debug contract to Anvil..."
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
/home/chad/.foundry/bin/forge script script/DeployDebug.s.sol \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast \
    --slow

if [ $? -eq 0 ]; then
    echo "✅ Debug contract deployed to Anvil successfully!"
    
    # Extract the deployed address from the broadcast file
    ANVIL_CONTRACT=$(cat broadcast/DeployDebug.s.sol/31337/run-latest.json 2>/dev/null | grep -o '"contractAddress":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$ANVIL_CONTRACT" ]; then
        echo "📍 Anvil contract address: $ANVIL_CONTRACT"
        
        echo ""
        echo "🧪 Running CREATE tests on Anvil..."
        
        # Test basic CREATE
        echo "🔧 Testing basic CREATE..."
        cast call $ANVIL_CONTRACT "testBasicCreate()" --rpc-url http://127.0.0.1:8545
        
        # Send transaction to test CREATE
        echo "📤 Sending CREATE test transaction..."
        PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
        cast send $ANVIL_CONTRACT "testBasicCreate()" \
            --rpc-url http://127.0.0.1:8545 \
            --gas-limit 3000000
        
        echo ""
        echo "🔍 Checking Anvil test results..."
        cast call $ANVIL_CONTRACT "getResultCount()" --rpc-url http://127.0.0.1:8545
        
        # Get first result if any
        RESULT_COUNT=$(cast call $ANVIL_CONTRACT "getResultCount()" --rpc-url http://127.0.0.1:8545)
        if [ "$RESULT_COUNT" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
            echo "📊 First test result:"
            cast call $ANVIL_CONTRACT "testResults(uint256)(address,uint256,bool,uint256,bytes32)" 0 --rpc-url http://127.0.0.1:8545
        fi
        
    else
        echo "❌ Could not find Anvil contract address"
    fi
    
else
    echo "❌ Failed to deploy to Anvil"
fi

echo ""
echo "📊 COMPARISON SUMMARY:"
echo "======================"
echo "🔹 Base Sepolia: CREATE returns address(0) - CONFIRMED FAILING"
echo "🔹 Anvil: See results above"
echo ""
echo "💡 If Anvil works and Base Sepolia fails:"
echo "   → Confirms Base Sepolia has CREATE opcode limitations"
echo "   → Your SSTORE2 library implementation is correct"
echo "   → Issue is network-specific, not code-specific"
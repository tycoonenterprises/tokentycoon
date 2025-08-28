#!/bin/bash

# Manual card initialization script
# This demonstrates how to initialize cards with proper metadata

set -e

CARDS_CONTRACT="0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16"
RPC_URL="https://sepolia.base.org"

echo "=== Manual Card Initialization Demo ==="
echo "Cards Contract: $CARDS_CONTRACT"

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Please set PRIVATE_KEY environment variable"
    exit 1
fi

echo "✅ Private key found"

# Function to initialize a card
init_card() {
    local card_id=$1
    local name="$2"
    local description="$3"
    local cost=$4
    local card_type=$5
    local svg_data="$6"
    
    echo "Initializing Card $card_id: $name"
    
    # Convert SVG to hex bytes
    svg_hex=$(echo -n "$svg_data" | xxd -p | tr -d '\n')
    
    echo "  - Setting metadata..."
    cast send --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-limit 2000000 \
        $CARDS_CONTRACT \
        "setCardMetadata(uint256,string,string,uint256,uint8,bytes,uint256)" \
        $card_id "$name" "$description" $cost $card_type "0x$svg_hex" 0
    
    echo "  - Setting abilities..."
    # Note: This is simplified - real implementation would set proper abilities
    cast send --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-limit 500000 \
        $CARDS_CONTRACT \
        "setCardAbilities(uint256,(string,uint256)[])" \
        $card_id "[(\"income\", 1)]"
    
    echo "  - Finalizing metadata..."
    cast send --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-limit 300000 \
        $CARDS_CONTRACT \
        "finalizeMetadata(uint256)" \
        $card_id
    
    echo "✅ Card $card_id ($name) initialized!"
}

# Initialize Card 3: Bridge Hack (first clean card slot)
init_card 3 "Bridge Hack" "Destroy target chain and all DeFi Protocols on it." 5 3 \
    '<svg width="375" height="525" xmlns="http://www.w3.org/2000/svg"><rect width="375" height="525" fill="#2D1100"/><text x="40" y="55" font-family="Arial" font-size="20" fill="#FFFFFF">Bridge Hack</text><text x="300" y="55" font-size="16" fill="#FFFFFF">5</text><text x="40" y="400" font-size="12" fill="#FFFFFF">Destroy target chain and all DeFi Protocols on it.</text></svg>'

echo ""
echo "=== Testing Initialized Card ==="
echo "Query card metadata:"
echo "cast call --rpc-url $RPC_URL $CARDS_CONTRACT \"getCardMetadata(uint256)\" 3"
echo ""
echo "Try card URI:"
echo "cast call --rpc-url $RPC_URL $CARDS_CONTRACT \"uri(uint256)\" 3"
echo ""
echo "Check abilities:"
echo "cast call --rpc-url $RPC_URL $CARDS_CONTRACT \"getCardAbilities(uint256)\" 3"
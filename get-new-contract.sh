#!/bin/bash

echo "🔍 Finding new contract address..."

# The deployment transaction was successful, but we need to find the contract address
# Let's check the latest transaction for our deployer account

curl -s "https://api.basescan.org/api?module=account&action=txlist&address=0xBAdAd51de865b9d880b184f3cba6f7240e284506&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken" | head -20

echo "🔧 Manual lookup required:"
echo "1. Go to https://sepolia.basescan.org/address/0xBAdAd51de865b9d880b184f3cba6f7240e284506"
echo "2. Find the latest contract creation transaction"
echo "3. Copy the contract address"
echo "4. Update data/nft/deployed-contracts.json"
echo ""
echo "⚡ Quick test (replace CONTRACT_ADDRESS):"
echo "CONTRACT_ADDRESS=0xYOUR_NEW_ADDRESS node scripts/nft/testFixedURI.js"
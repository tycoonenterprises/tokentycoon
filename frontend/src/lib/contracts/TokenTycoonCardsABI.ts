// ERC1155 TokenTycoonCards Contract ABI
// Based on the deployed contract at 0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16

export const TokenTycoonCardsABI = [
  // ERC1155 Standard Functions
  {
    "inputs": [
      {"name": "account", "type": "address"},
      {"name": "id", "type": "uint256"}
    ],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "accounts", "type": "address[]"},
      {"name": "ids", "type": "uint256[]"}
    ],
    "name": "balanceOfBatch",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "uri",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Card Metadata Functions
  {
    "inputs": [{"name": "cardId", "type": "uint256"}],
    "name": "getCardMetadata",
    "outputs": [
      {
        "components": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "cost", "type": "uint256"},
          {"name": "cardType", "type": "uint8"},
          {"name": "svgPointer", "type": "address"},
          {"name": "jsonPointer", "type": "address"},
          {"name": "contentHash", "type": "bytes32"},
          {"name": "maxSupply", "type": "uint256"},
          {"name": "totalMinted", "type": "uint256"},
          {"name": "tradeable", "type": "bool"},
          {"name": "finalized", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "cardId", "type": "uint256"}],
    "name": "getCardAbilities",
    "outputs": [
      {
        "components": [
          {"name": "abilityType", "type": "string"},
          {"name": "amount", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Admin Functions (for completeness)
  {
    "inputs": [
      {"name": "cardId", "type": "uint256"},
      {"name": "name", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "cost", "type": "uint256"},
      {"name": "cardType", "type": "uint8"},
      {"name": "svgData", "type": "bytes"},
      {"name": "maxSupply", "type": "uint256"}
    ],
    "name": "setCardMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "cardId", "type": "uint256"},
      {
        "components": [
          {"name": "abilityType", "type": "string"},
          {"name": "amount", "type": "uint256"}
        ],
        "name": "abilities",
        "type": "tuple[]"
      }
    ],
    "name": "setCardAbilities",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "cardId", "type": "uint256"}],
    "name": "finalizeMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Minting Functions
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "cardId", "type": "uint256"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Access Control
  {
    "inputs": [
      {"name": "role", "type": "bytes32"},
      {"name": "account", "type": "address"}
    ],
    "name": "hasRole",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "operator", "type": "address"},
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "ids", "type": "uint256[]"},
      {"indexed": false, "name": "values", "type": "uint256[]"}
    ],
    "name": "TransferBatch",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "operator", "type": "address"},
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "id", "type": "uint256"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "TransferSingle",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "cardId", "type": "uint256"},
      {"indexed": false, "name": "name", "type": "string"}
    ],
    "name": "CardMetadataSet",
    "type": "event"
  }
] as const
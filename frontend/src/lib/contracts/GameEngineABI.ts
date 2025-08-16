// Auto-generated ABI for GameEngine
export const GameEngineABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_cardRegistry",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_deckRegistry",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "INITIAL_HAND_SIZE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_HAND_SIZE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cardRegistry",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract CardRegistry"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createGame",
    "inputs": [
      {
        "name": "_deckId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deckRegistry",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract DeckRegistry"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "drawCard",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "endTurn",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "gameIds",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "games",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player1",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "player2",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "player1DeckId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player2DeckId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player1State",
        "type": "tuple",
        "internalType": "struct GameEngine.PlayerState",
        "components": [
          {
            "name": "player",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "deckId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deck",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "hand",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "deckIndex",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "player2State",
        "type": "tuple",
        "internalType": "struct GameEngine.PlayerState",
        "components": [
          {
            "name": "player",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "deckId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deck",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "hand",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "deckIndex",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "isStarted",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "isFinished",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "currentTurn",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "createdAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startedAt",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGameState",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "player1",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "player2",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "player1DeckId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player2DeckId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player1HandSize",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player2HandSize",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player1DeckRemaining",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player2DeckRemaining",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "currentTurn",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isStarted",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "isFinished",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOpenGames",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerHand",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_player",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinGame",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_deckId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "nextGameId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "playerGames",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "startGame",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CardDrawn",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "cardId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameCreated",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "deckId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameJoined",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "deckId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameStarted",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player1",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "player2",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TurnChanged",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "newTurn",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyInGame",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeckEmpty",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameAlreadyStarted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameFull",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameNotStarted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "HandFull",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDeck",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotInGame",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotYourTurn",
    "inputs": []
  }
] as const;

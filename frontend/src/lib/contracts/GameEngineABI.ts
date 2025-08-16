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
    "name": "ETH_PER_TURN",
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
    "name": "INITIAL_ETH",
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
    "name": "MAX_COLD_STORAGE_WITHDRAWAL_PER_TURN",
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
    "name": "WIN_CONDITION_ETH",
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
    "name": "cardInstances",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "cardId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "instanceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "turnPlayed",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stakedETH",
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
    "name": "depositToColdStorage",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "drawToStartTurn",
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
            "name": "battlefield",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "deckIndex",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "eth",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "coldStorage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "coldStorageWithdrawnThisTurn",
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
            "name": "battlefield",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "deckIndex",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "eth",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "coldStorage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "coldStorageWithdrawnThisTurn",
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
        "name": "turnNumber",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needsToDraw",
        "type": "bool",
        "internalType": "bool"
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
    "name": "getCardInstance",
    "inputs": [
      {
        "name": "_instanceId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct GameEngine.CardInstance",
        "components": [
          {
            "name": "cardId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "instanceId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "turnPlayed",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "stakedETH",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
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
        "name": "",
        "type": "tuple",
        "internalType": "struct GameEngine.GameView",
        "components": [
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
            "name": "player1ETH",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player2ETH",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player1ColdStorage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player2ColdStorage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player1ColdStorageWithdrawnThisTurn",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player2ColdStorageWithdrawnThisTurn",
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
            "name": "player1BattlefieldSize",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "player2BattlefieldSize",
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
            "name": "turnNumber",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "needsToDraw",
            "type": "bool",
            "internalType": "bool"
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
        ]
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
    "name": "getPlayerBattlefield",
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
    "name": "nextCardInstanceId",
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
    "name": "playCard",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_cardIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "name": "stakeETH",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_instanceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "type": "function",
    "name": "withdrawFromColdStorage",
    "inputs": [
      {
        "name": "_gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_amount",
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
    "name": "CardPlayed",
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
      },
      {
        "name": "instanceId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ColdStorageDeposit",
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
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalColdStorage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ColdStorageWithdrawal",
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
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalColdStorage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ETHStaked",
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
        "name": "cardInstanceId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
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
    "name": "GameFinished",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "reason",
        "type": "string",
        "indexed": false,
        "internalType": "string"
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
    "name": "ResourcesGained",
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
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TurnEnded",
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
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TurnStarted",
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
        "name": "turnNumber",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UpkeepTriggered",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "cardInstanceId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "abilityName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
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
    "name": "CardNotInHand",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CardNotOnBattlefield",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeckEmpty",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ExceedsWithdrawalLimit",
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
    "name": "GameIsFinished",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameNotActive",
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
    "name": "InsufficientColdStorage",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientETH",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientResources",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDeck",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStakeAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCardOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotDeFiCard",
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

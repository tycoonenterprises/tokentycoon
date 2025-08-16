// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CardRegistry.sol";

contract GameLobby {
    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        bool isStarted;
        bool isFinished;
        uint256 createdAt;
        uint256 startedAt;
    }

    uint256 public nextGameId;
    mapping(uint256 => Game) public games;
    uint256[] public gameIds;
    
    mapping(address => uint256[]) public playerGames;
    
    CardRegistry public cardRegistry;

    event GameCreated(uint256 indexed gameId, address indexed creator);
    event GameJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2);

    error GameNotFound();
    error GameAlreadyStarted();
    error GameFull();
    error NotInGame();
    error AlreadyInGame();
    error CardRegistryNotSet();

    constructor(address _cardRegistry) {
        cardRegistry = CardRegistry(_cardRegistry);
    }

    function createGame() external returns (uint256) {
        if (address(cardRegistry) == address(0)) revert CardRegistryNotSet();
        uint256 gameId = nextGameId++;
        
        games[gameId] = Game({
            gameId: gameId,
            player1: msg.sender,
            player2: address(0),
            isStarted: false,
            isFinished: false,
            createdAt: block.timestamp,
            startedAt: 0
        });
        
        gameIds.push(gameId);
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender);
        
        return gameId;
    }

    function joinGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        if (game.player1 == address(0)) revert GameNotFound();
        if (game.isStarted) revert GameAlreadyStarted();
        if (game.player2 != address(0)) revert GameFull();
        if (game.player1 == msg.sender) revert AlreadyInGame();
        
        game.player2 = msg.sender;
        playerGames[msg.sender].push(_gameId);
        
        emit GameJoined(_gameId, msg.sender);
    }

    function startGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        if (game.player1 == address(0)) revert GameNotFound();
        if (game.isStarted) revert GameAlreadyStarted();
        if (game.player2 == address(0)) revert GameFull();
        if (game.player1 != msg.sender && game.player2 != msg.sender) revert NotInGame();
        
        game.isStarted = true;
        game.startedAt = block.timestamp;
        
        emit GameStarted(_gameId, game.player1, game.player2);
    }

    function getOpenGames() external view returns (uint256[] memory) {
        uint256 openCount = 0;
        
        for (uint256 i = 0; i < gameIds.length; i++) {
            Game memory game = games[gameIds[i]];
            if (game.player2 == address(0) && !game.isStarted && !game.isFinished) {
                openCount++;
            }
        }
        
        uint256[] memory openGames = new uint256[](openCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < gameIds.length; i++) {
            Game memory game = games[gameIds[i]];
            if (game.player2 == address(0) && !game.isStarted && !game.isFinished) {
                openGames[index++] = gameIds[i];
            }
        }
        
        return openGames;
    }

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CardRegistry.sol";
import "./DeckRegistry.sol";

contract GameEngine {
    struct PlayerState {
        address player;
        uint256 deckId;
        uint256[] deck;      // Shuffled deck of card IDs
        uint256[] hand;      // Cards in hand
        uint256 deckIndex;   // Current position in deck for drawing
    }
    
    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        uint256 player1DeckId;
        uint256 player2DeckId;
        PlayerState player1State;
        PlayerState player2State;
        bool isStarted;
        bool isFinished;
        uint256 currentTurn; // 0 for player1, 1 for player2
        uint256 createdAt;
        uint256 startedAt;
    }
    
    uint256 public nextGameId;
    mapping(uint256 => Game) public games;
    uint256[] public gameIds;
    
    mapping(address => uint256[]) public playerGames;
    
    CardRegistry public cardRegistry;
    DeckRegistry public deckRegistry;
    
    uint256 public constant INITIAL_HAND_SIZE = 5;
    uint256 public constant MAX_HAND_SIZE = 10;
    
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 deckId);
    event GameJoined(uint256 indexed gameId, address indexed player, uint256 deckId);
    event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2);
    event CardDrawn(uint256 indexed gameId, address indexed player, uint256 cardId);
    event TurnChanged(uint256 indexed gameId, uint256 newTurn);
    
    error GameNotFound();
    error GameAlreadyStarted();
    error GameFull();
    error NotInGame();
    error AlreadyInGame();
    error InvalidDeck();
    error NotYourTurn();
    error DeckEmpty();
    error HandFull();
    error GameNotStarted();
    
    constructor(address _cardRegistry, address _deckRegistry) {
        cardRegistry = CardRegistry(_cardRegistry);
        deckRegistry = DeckRegistry(_deckRegistry);
    }
    
    function createGame(uint256 _deckId) external returns (uint256) {
        // Validate deck exists
        DeckRegistry.Deck memory deck = deckRegistry.getDeck(_deckId);
        if (deck.totalCards == 0) revert InvalidDeck();
        
        uint256 gameId = nextGameId++;
        
        Game storage game = games[gameId];
        game.gameId = gameId;
        game.player1 = msg.sender;
        game.player1DeckId = _deckId;
        game.isStarted = false;
        game.isFinished = false;
        game.createdAt = block.timestamp;
        
        // Initialize player1 state
        game.player1State.player = msg.sender;
        game.player1State.deckId = _deckId;
        
        gameIds.push(gameId);
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, _deckId);
        
        return gameId;
    }
    
    function joinGame(uint256 _gameId, uint256 _deckId) external {
        Game storage game = games[_gameId];
        
        if (game.player1 == address(0)) revert GameNotFound();
        if (game.isStarted) revert GameAlreadyStarted();
        if (game.player2 != address(0)) revert GameFull();
        if (game.player1 == msg.sender) revert AlreadyInGame();
        
        // Validate deck exists
        DeckRegistry.Deck memory deck = deckRegistry.getDeck(_deckId);
        if (deck.totalCards == 0) revert InvalidDeck();
        
        game.player2 = msg.sender;
        game.player2DeckId = _deckId;
        
        // Initialize player2 state
        game.player2State.player = msg.sender;
        game.player2State.deckId = _deckId;
        
        playerGames[msg.sender].push(_gameId);
        
        emit GameJoined(_gameId, msg.sender, _deckId);
    }
    
    function startGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        if (game.player1 == address(0)) revert GameNotFound();
        if (game.isStarted) revert GameAlreadyStarted();
        if (game.player2 == address(0)) revert GameFull();
        if (game.player1 != msg.sender && game.player2 != msg.sender) revert NotInGame();
        
        game.isStarted = true;
        game.startedAt = block.timestamp;
        game.currentTurn = 0; // Player 1 starts
        
        // Initialize decks for both players
        _initializePlayerDeck(game.player1State, game.player1DeckId);
        _initializePlayerDeck(game.player2State, game.player2DeckId);
        
        // Draw initial hands
        _drawInitialHand(game.player1State);
        _drawInitialHand(game.player2State);
        
        emit GameStarted(_gameId, game.player1, game.player2);
    }
    
    function drawCard(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        if (!game.isStarted) revert GameNotStarted();
        if (game.isFinished) revert GameNotFound();
        
        PlayerState storage playerState;
        if (msg.sender == game.player1) {
            if (game.currentTurn != 0) revert NotYourTurn();
            playerState = game.player1State;
        } else if (msg.sender == game.player2) {
            if (game.currentTurn != 1) revert NotYourTurn();
            playerState = game.player2State;
        } else {
            revert NotInGame();
        }
        
        if (playerState.hand.length >= MAX_HAND_SIZE) revert HandFull();
        if (playerState.deckIndex >= playerState.deck.length) revert DeckEmpty();
        
        uint256 cardId = playerState.deck[playerState.deckIndex];
        playerState.hand.push(cardId);
        playerState.deckIndex++;
        
        emit CardDrawn(_gameId, msg.sender, cardId);
    }
    
    function endTurn(uint256 _gameId) external {
        Game storage game = games[_gameId];
        
        if (!game.isStarted) revert GameNotStarted();
        if (game.isFinished) revert GameNotFound();
        
        if (msg.sender == game.player1 && game.currentTurn == 0) {
            game.currentTurn = 1;
        } else if (msg.sender == game.player2 && game.currentTurn == 1) {
            game.currentTurn = 0;
        } else {
            revert NotYourTurn();
        }
        
        emit TurnChanged(_gameId, game.currentTurn);
    }
    
    function getPlayerHand(uint256 _gameId, address _player) external view returns (uint256[] memory) {
        Game storage game = games[_gameId];
        
        if (_player == game.player1) {
            return game.player1State.hand;
        } else if (_player == game.player2) {
            return game.player2State.hand;
        } else {
            revert NotInGame();
        }
    }
    
    function getGameState(uint256 _gameId) external view returns (
        address player1,
        address player2,
        uint256 player1DeckId,
        uint256 player2DeckId,
        uint256 player1HandSize,
        uint256 player2HandSize,
        uint256 player1DeckRemaining,
        uint256 player2DeckRemaining,
        uint256 currentTurn,
        bool isStarted,
        bool isFinished
    ) {
        Game storage game = games[_gameId];
        
        return (
            game.player1,
            game.player2,
            game.player1DeckId,
            game.player2DeckId,
            game.player1State.hand.length,
            game.player2State.hand.length,
            game.player1State.deck.length - game.player1State.deckIndex,
            game.player2State.deck.length - game.player2State.deckIndex,
            game.currentTurn,
            game.isStarted,
            game.isFinished
        );
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
    
    function _initializePlayerDeck(PlayerState storage playerState, uint256 deckId) private {
        uint256[] memory expandedDeck = deckRegistry.expandDeck(deckId);
        
        // Copy and shuffle the deck
        playerState.deck = new uint256[](expandedDeck.length);
        for (uint256 i = 0; i < expandedDeck.length; i++) {
            playerState.deck[i] = expandedDeck[i];
        }
        
        // Simple shuffle using block properties (not truly random but good enough for now)
        for (uint256 i = expandedDeck.length - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, i))) % (i + 1);
            uint256 temp = playerState.deck[i];
            playerState.deck[i] = playerState.deck[j];
            playerState.deck[j] = temp;
        }
        
        playerState.deckIndex = 0;
    }
    
    function _drawInitialHand(PlayerState storage playerState) private {
        for (uint256 i = 0; i < INITIAL_HAND_SIZE && i < playerState.deck.length; i++) {
            playerState.hand.push(playerState.deck[i]);
            playerState.deckIndex++;
        }
    }
}
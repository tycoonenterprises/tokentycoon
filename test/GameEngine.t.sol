// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/GameEngine.sol";
import "../src/CardRegistry.sol";
import "../src/DeckRegistry.sol";

contract GameEngineTest is Test {
    GameEngine public gameEngine;
    CardRegistry public cardRegistry;
    DeckRegistry public deckRegistry;
    
    address public player1 = address(0x1);
    address public player2 = address(0x2);
    address public player3 = address(0x3);
    
    uint256 public testDeckId = 0;

    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 deckId);
    event GameJoined(uint256 indexed gameId, address indexed player, uint256 deckId);
    event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2);
    event CardDrawn(uint256 indexed gameId, address indexed player, uint256 cardId);
    event TurnChanged(uint256 indexed gameId, uint256 newTurn);

    function setUp() public {
        // Deploy registries
        cardRegistry = new CardRegistry();
        deckRegistry = new DeckRegistry(address(cardRegistry));
        gameEngine = new GameEngine(address(cardRegistry), address(deckRegistry));
        
        // Add some test cards
        cardRegistry.addCardSimple("Test Card 1", "Description 1", 1, CardRegistry.CardType.Chain);
        cardRegistry.addCardSimple("Test Card 2", "Description 2", 2, CardRegistry.CardType.DeFi);
        cardRegistry.addCardSimple("Test Card 3", "Description 3", 3, CardRegistry.CardType.Action);
        
        // Create a test deck
        string[] memory cardNames = new string[](3);
        cardNames[0] = "Test Card 1";
        cardNames[1] = "Test Card 2";
        cardNames[2] = "Test Card 3";
        
        uint256[] memory cardCounts = new uint256[](3);
        cardCounts[0] = 10;
        cardCounts[1] = 10;
        cardCounts[2] = 10;
        
        testDeckId = deckRegistry.addDeck("Test Deck", "A test deck", cardNames, cardCounts);
    }

    function testCreateGame() public {
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit GameCreated(0, player1, testDeckId);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        assertEq(gameId, 0);
        
        (
            address p1,
            address p2,
            uint256 p1DeckId,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isStarted,
            
        ) = gameEngine.getGameState(gameId);
        
        assertEq(p1, player1);
        assertEq(p2, address(0));
        assertEq(p1DeckId, testDeckId);
        assertEq(isStarted, false);
    }

    function testJoinGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit GameJoined(gameId, player2, testDeckId);
        gameEngine.joinGame(gameId, testDeckId);
        
        (
            ,
            address p2,
            ,
            uint256 p2DeckId,
            ,
            ,
            ,
            ,
            ,
            ,
            
        ) = gameEngine.getGameState(gameId);
        
        assertEq(p2, player2);
        assertEq(p2DeckId, testDeckId);
    }

    function testCannotJoinFullGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player3);
        vm.expectRevert(GameEngine.GameFull.selector);
        gameEngine.joinGame(gameId, testDeckId);
    }

    function testCannotJoinOwnGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player1);
        vm.expectRevert(GameEngine.AlreadyInGame.selector);
        gameEngine.joinGame(gameId, testDeckId);
    }

    function testStartGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        vm.expectEmit(true, true, true, true);
        emit GameStarted(gameId, player1, player2);
        gameEngine.startGame(gameId);
        
        (
            ,
            ,
            ,
            ,
            uint256 p1HandSize,
            uint256 p2HandSize,
            ,
            ,
            ,
            bool isStarted,
            
        ) = gameEngine.getGameState(gameId);
        
        assertEq(isStarted, true);
        assertEq(p1HandSize, 5); // Initial hand size
        assertEq(p2HandSize, 5); // Initial hand size
    }

    function testCannotStartGameWithoutSecondPlayer() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player1);
        vm.expectRevert(GameEngine.GameFull.selector);
        gameEngine.startGame(gameId);
    }

    function testCannotStartGameTwice() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        vm.prank(player1);
        vm.expectRevert(GameEngine.GameAlreadyStarted.selector);
        gameEngine.startGame(gameId);
    }

    function testDrawCard() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player 1 draws a card (it's their turn)
        vm.prank(player1);
        gameEngine.drawCard(gameId);
        
        (
            ,
            ,
            ,
            ,
            uint256 p1HandSize,
            ,
            ,
            ,
            ,
            ,
            
        ) = gameEngine.getGameState(gameId);
        
        assertEq(p1HandSize, 6); // 5 initial + 1 drawn
    }

    function testCannotDrawCardWhenNotYourTurn() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player 2 tries to draw but it's player 1's turn
        vm.prank(player2);
        vm.expectRevert(GameEngine.NotYourTurn.selector);
        gameEngine.drawCard(gameId);
    }

    function testEndTurn() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player 1 ends their turn
        vm.prank(player1);
        vm.expectEmit(true, false, false, true);
        emit TurnChanged(gameId, 1);
        gameEngine.endTurn(gameId);
        
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 currentTurn,
            ,
            
        ) = gameEngine.getGameState(gameId);
        
        assertEq(currentTurn, 1); // Now player 2's turn
    }

    function testGetOpenGames() public {
        vm.prank(player1);
        uint256 gameId1 = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        uint256 gameId2 = gameEngine.createGame(testDeckId);
        
        vm.prank(player3);
        gameEngine.createGame(testDeckId);
        
        // Join game 2
        vm.prank(player1);
        gameEngine.joinGame(gameId2, testDeckId);
        
        uint256[] memory openGames = gameEngine.getOpenGames();
        assertEq(openGames.length, 2);
        assertEq(openGames[0], gameId1);
        assertEq(openGames[1], 2); // gameId3
    }

    function testGetPlayerHand() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        assertEq(hand.length, 5); // Initial hand size
    }
}
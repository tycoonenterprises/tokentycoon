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
    uint256 public polygonCardId;
    uint256 public uniswapCardId;
    uint256 public validatorCardId;
    uint256 public whitepaperCardId;
    uint256 public aaveCardId;

    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 deckId);
    event GameJoined(uint256 indexed gameId, address indexed player, uint256 deckId);
    event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2);
    event TurnStarted(uint256 indexed gameId, address indexed player, uint256 turnNumber);
    event CardDrawn(uint256 indexed gameId, address indexed player, uint256 cardId);
    event CardPlayed(uint256 indexed gameId, address indexed player, uint256 cardId, uint256 instanceId);
    event TurnEnded(uint256 indexed gameId, address indexed player);
    event ResourcesGained(uint256 indexed gameId, address indexed player, uint256 amount);
    event UpkeepTriggered(uint256 indexed gameId, uint256 cardInstanceId, string abilityName);
    event ETHStaked(uint256 indexed gameId, address indexed player, uint256 cardInstanceId, uint256 amount);

    function setUp() public {
        // Deploy registries
        cardRegistry = new CardRegistry();
        deckRegistry = new DeckRegistry(address(cardRegistry));
        gameEngine = new GameEngine(address(cardRegistry), address(deckRegistry));
        
        // Add test cards with abilities
        polygonCardId = cardRegistry.addCardSimple("Polygon", "Layer 2 scaling solution", 1, CardRegistry.CardType.Chain);
        
        // Add Uniswap with income ability
        string[] memory uniswapAbilityNames = new string[](1);
        uniswapAbilityNames[0] = "income";
        
        string[][] memory uniswapAbilityKeys = new string[][](1);
        uniswapAbilityKeys[0] = new string[](1);
        uniswapAbilityKeys[0][0] = "amount";
        
        string[][] memory uniswapAbilityValues = new string[][](1);
        uniswapAbilityValues[0] = new string[](1);
        uniswapAbilityValues[0][0] = "1";
        
        uniswapCardId = cardRegistry.addCard(
            "Uniswap",
            "Decentralized exchange protocol",
            2,
            CardRegistry.CardType.DeFi,
            uniswapAbilityNames,
            uniswapAbilityKeys,
            uniswapAbilityValues
        );
        
        // Add Validator Node with yield ability
        string[] memory validatorAbilityNames = new string[](1);
        validatorAbilityNames[0] = "yield";
        
        string[][] memory validatorAbilityKeys = new string[][](1);
        validatorAbilityKeys[0] = new string[](1);
        validatorAbilityKeys[0][0] = "amount";
        
        string[][] memory validatorAbilityValues = new string[][](1);
        validatorAbilityValues[0] = new string[](1);
        validatorAbilityValues[0][0] = "2";
        
        validatorCardId = cardRegistry.addCard(
            "Validator Node",
            "Earn rewards for validating",
            3,
            CardRegistry.CardType.EOA,
            validatorAbilityNames,
            validatorAbilityKeys,
            validatorAbilityValues
        );
        
        // Add Read a Whitepaper with draw ability
        string[] memory whitepaperAbilityNames = new string[](1);
        whitepaperAbilityNames[0] = "draw";
        
        string[][] memory whitepaperAbilityKeys = new string[][](1);
        whitepaperAbilityKeys[0] = new string[](1);
        whitepaperAbilityKeys[0][0] = "amount";
        
        string[][] memory whitepaperAbilityValues = new string[][](1);
        whitepaperAbilityValues[0] = new string[](1);
        whitepaperAbilityValues[0][0] = "2";
        
        whitepaperCardId = cardRegistry.addCard(
            "Read a Whitepaper",
            "Draw cards",
            1,
            CardRegistry.CardType.Action,
            whitepaperAbilityNames,
            whitepaperAbilityKeys,
            whitepaperAbilityValues
        );
        
        // Add Aave with yield ability (DeFi card)
        string[] memory aaveAbilityNames = new string[](1);
        aaveAbilityNames[0] = "yield";
        
        string[][] memory aaveAbilityKeys = new string[][](1);
        aaveAbilityKeys[0] = new string[](1);
        aaveAbilityKeys[0][0] = "amount";
        
        string[][] memory aaveAbilityValues = new string[][](1);
        aaveAbilityValues[0] = new string[](1);
        aaveAbilityValues[0][0] = "2"; // 2x yield on staked ETH
        
        aaveCardId = cardRegistry.addCard(
            "Aave",
            "Lending protocol with yield",
            2,
            CardRegistry.CardType.DeFi,
            aaveAbilityNames,
            aaveAbilityKeys,
            aaveAbilityValues
        );
        
        // Create a test deck
        string[] memory cardNames = new string[](5);
        cardNames[0] = "Polygon";
        cardNames[1] = "Uniswap";
        cardNames[2] = "Validator Node";
        cardNames[3] = "Read a Whitepaper";
        cardNames[4] = "Aave";
        
        uint256[] memory cardCounts = new uint256[](5);
        cardCounts[0] = 10;
        cardCounts[1] = 5;
        cardCounts[2] = 5;
        cardCounts[3] = 5;
        cardCounts[4] = 5;
        
        testDeckId = deckRegistry.addDeck("Test Deck", "A test deck", cardNames, cardCounts);
    }

    function testCreateGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        assertEq(gameId, 0);
        
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        
        assertEq(gameView.player1, player1);
        assertEq(gameView.player2, address(0));
        assertEq(gameView.player1ETH, 3); // Initial ETH
        assertEq(gameView.isStarted, false);
    }

    function testJoinGame() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit GameJoined(gameId, player2, testDeckId);
        gameEngine.joinGame(gameId, testDeckId);
        
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        
        assertEq(gameView.player2, player2);
        assertEq(gameView.player2ETH, 3); // Initial ETH
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
        
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        
        assertEq(gameView.isStarted, true);
        assertEq(gameView.player1HandSize, 5); // Initial hand size
        assertEq(gameView.player2HandSize, 5); // Initial hand size
        assertEq(gameView.currentTurn, 0); // Player 1's turn
        assertEq(gameView.turnNumber, 1);
        // Player 1 gets 1 ETH from upkeep on first turn
        assertEq(gameView.player1ETH, 4); // 3 initial + 1 from upkeep
        assertEq(gameView.player2ETH, 3); // Still initial
    }

    function testPlayCard() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Get player 1's hand to see what cards they have
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        
        // Find a playable card (cost 1 ETH - Polygon or Whitepaper)
        uint256 cardToPlay = 0;
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == polygonCardId || hand[i] == whitepaperCardId) {
                cardToPlay = i;
                break;
            }
        }
        
        GameEngine.GameView memory gameViewBefore = gameEngine.getGameState(gameId);
        uint256 p1ETHBefore = gameViewBefore.player1ETH;
        
        // Player 1 plays a card
        vm.prank(player1);
        gameEngine.playCard(gameId, cardToPlay);
        
        GameEngine.GameView memory gameViewAfter = gameEngine.getGameState(gameId);
        
        assertEq(gameViewAfter.player1HandSize, 4); // 5 initial - 1 played
        if (hand[cardToPlay] != whitepaperCardId) {
            assertEq(gameViewAfter.player1BattlefieldSize, 1); // Card on battlefield
        }
        assertTrue(gameViewAfter.player1ETH < p1ETHBefore); // ETH spent
    }

    function testActionCardDraw() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Manually set player's hand to include the whitepaper card
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        uint256 whitepaperIndex = type(uint256).max;
        
        // Find or inject the whitepaper card
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == whitepaperCardId) {
                whitepaperIndex = i;
                break;
            }
        }
        
        if (whitepaperIndex != type(uint256).max) {
            uint256 handSizeBefore = hand.length;
            
            // Play the whitepaper card
            vm.prank(player1);
            gameEngine.playCard(gameId, whitepaperIndex);
            
            // Check that cards were drawn
            uint256[] memory handAfter = gameEngine.getPlayerHand(gameId, player1);
            // Should be -1 (card played) +2 (cards drawn) = +1 net
            assertEq(handAfter.length, handSizeBefore + 1);
        }
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
        vm.expectEmit(true, true, false, true);
        emit TurnEnded(gameId, player1);
        gameEngine.endTurn(gameId);
        
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        
        assertEq(gameView.currentTurn, 1); // Now player 2's turn
        assertEq(gameView.turnNumber, 2);
        assertEq(gameView.player2HandSize, 6); // 5 initial + 1 drawn
        assertEq(gameView.player2ETH, 4); // 3 initial + 1 from upkeep
    }

    function testUpkeepAbilities() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Find and play a Uniswap card (has income ability)
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        uint256 uniswapIndex = type(uint256).max;
        
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == uniswapCardId) {
                uniswapIndex = i;
                break;
            }
        }
        
        if (uniswapIndex != type(uint256).max) {
            // Play Uniswap
            vm.prank(player1);
            gameEngine.playCard(gameId, uniswapIndex);
            
            // End turn
            vm.prank(player1);
            gameEngine.endTurn(gameId);
            
            // Player 2 ends turn
            vm.prank(player2);
            gameEngine.endTurn(gameId);
            
            // Now it's player 1's turn again, check ETH gained from upkeep
            GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
            uint256 p1ETH = gameView.player1ETH;
            
            // Player 1 should have gained extra ETH from Uniswap's income ability
            // Initial 3 + 1 (first upkeep) - 2 (Uniswap cost) + 1 (normal upkeep) + 1 (income) = 4
            assertTrue(p1ETH >= 4);
        }
    }

    function testCannotPlayCardWithInsufficientETH() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player starts with 4 ETH (3 initial + 1 from upkeep)
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        
        // Play Uniswap cards to reduce ETH (they cost 2 each)
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        uint256 cardsPlayed = 0;
        
        // Play all available Uniswap cards (cost 2) or cheap cards to reduce ETH
        while (gameView.player1ETH >= 3 && cardsPlayed < 3) {
            hand = gameEngine.getPlayerHand(gameId, player1);
            bool playedCard = false;
            
            // Try to play any card that costs less than current ETH
            for (uint256 i = 0; i < hand.length; i++) {
                if (hand[i] == uniswapCardId && gameView.player1ETH >= 2) {
                    vm.prank(player1);
                    gameEngine.playCard(gameId, i);
                    playedCard = true;
                    cardsPlayed++;
                    break;
                } else if ((hand[i] == polygonCardId || hand[i] == whitepaperCardId) && gameView.player1ETH >= 1) {
                    vm.prank(player1);
                    gameEngine.playCard(gameId, i);
                    playedCard = true;
                    cardsPlayed++;
                    break;
                }
            }
            
            if (!playedCard) break;
            gameView = gameEngine.getGameState(gameId);
        }
        
        // Now try to play an expensive card that costs more than remaining ETH
        hand = gameEngine.getPlayerHand(gameId, player1);
        bool testedExpensiveCard = false;
        
        for (uint256 i = 0; i < hand.length; i++) {
            // Find a card that costs more than current ETH
            if (hand[i] == validatorCardId && gameView.player1ETH < 3) {
                testedExpensiveCard = true;
                vm.prank(player1);
                vm.expectRevert(GameEngine.InsufficientResources.selector);
                gameEngine.playCard(gameId, i);
                break;
            } else if (hand[i] == uniswapCardId && gameView.player1ETH < 2) {
                testedExpensiveCard = true;
                vm.prank(player1);
                vm.expectRevert(GameEngine.InsufficientResources.selector);
                gameEngine.playCard(gameId, i);
                break;
            }
        }
        
        // Make sure we actually tested something
        assertTrue(testedExpensiveCard || cardsPlayed == 0, "Should have tested expensive card or had no cards to play");
    }

    function testCannotPlayCardWhenNotYourTurn() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player 2 tries to play but it's player 1's turn
        vm.prank(player2);
        vm.expectRevert(GameEngine.NotYourTurn.selector);
        gameEngine.playCard(gameId, 0);
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

    function testGetPlayerBattlefield() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Play a permanent card
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == polygonCardId) {
                vm.prank(player1);
                gameEngine.playCard(gameId, i);
                break;
            }
        }
        
        uint256[] memory battlefield = gameEngine.getPlayerBattlefield(gameId, player1);
        assertEq(battlefield.length, 1);
    }

    function testStakeETHOnDeFiCard() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Find and play a Uniswap card (DeFi type)
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        uint256 uniswapIndex = type(uint256).max;
        
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == uniswapCardId) {
                uniswapIndex = i;
                break;
            }
        }
        
        if (uniswapIndex != type(uint256).max) {
            // Play Uniswap
            vm.prank(player1);
            gameEngine.playCard(gameId, uniswapIndex);
            
            // Get the card instance ID (it's 0 since it's the first card played)
            uint256 instanceId = 0;
            
            // Player has 2 ETH left (4 - 2 for Uniswap cost)
            // Stake 1 ETH on the card
            vm.prank(player1);
            vm.expectEmit(true, true, false, true);
            emit ETHStaked(gameId, player1, instanceId, 1);
            gameEngine.stakeETH(gameId, instanceId, 1);
            
            // Check the card has staked ETH
            GameEngine.CardInstance memory instance = gameEngine.getCardInstance(instanceId);
            assertEq(instance.stakedETH, 1);
            
            // Check player ETH reduced
            GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
            assertEq(gameView.player1ETH, 1); // 4 - 2 (card cost) - 1 (staked)
        }
    }
    
    function testCannotStakeOnNonDeFiCard() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Find and play a Polygon card (Chain type, not DeFi)
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == polygonCardId) {
                vm.prank(player1);
                gameEngine.playCard(gameId, i);
                
                // Try to stake on non-DeFi card
                vm.prank(player1);
                vm.expectRevert(GameEngine.NotDeFiCard.selector);
                gameEngine.stakeETH(gameId, 0, 1);
                break;
            }
        }
    }
    
    function testYieldWithStakedETH() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Find and play an Aave card (DeFi with yield ability)
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        uint256 aaveIndex = type(uint256).max;
        
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == aaveCardId) {
                aaveIndex = i;
                break;
            }
        }
        
        if (aaveIndex != type(uint256).max) {
            // Play Aave
            vm.prank(player1);
            gameEngine.playCard(gameId, aaveIndex);
            
            // Player has 2 ETH left (4 - 2 for Aave cost)
            // Stake 1 ETH on the card
            vm.prank(player1);
            gameEngine.stakeETH(gameId, 0, 1);
            
            // End turn
            vm.prank(player1);
            gameEngine.endTurn(gameId);
            
            // Player 2 ends turn
            vm.prank(player2);
            gameEngine.endTurn(gameId);
            
            // Now it's player 1's turn again
            // Check ETH gained from yield (1 ETH staked * 2 yield = 2 ETH)
            GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
            
            // Player should have: 1 (remaining) + 1 (upkeep) + 2 (yield) = 4 ETH
            assertEq(gameView.player1ETH, 4);
        }
    }
    
    function testCannotStakeMoreETHThanAvailable() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Find and play a Uniswap card
        uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == uniswapCardId) {
                vm.prank(player1);
                gameEngine.playCard(gameId, i);
                
                // Player has 2 ETH left (4 - 2 for Uniswap cost)
                // Try to stake 3 ETH (more than available)
                vm.prank(player1);
                vm.expectRevert(GameEngine.InsufficientResources.selector);
                gameEngine.stakeETH(gameId, 0, 3);
                break;
            }
        }
    }
    
    function testFirstTurnNoDrawPhase() public {
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(testDeckId);
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, testDeckId);
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // Player 1 should not draw on first turn
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        assertEq(gameView.player1HandSize, 5); // Still 5, no draw on first turn
        
        // End turn
        vm.prank(player1);
        gameEngine.endTurn(gameId);
        
        // Player 2 should draw on their first turn (not the very first turn of game)
        GameEngine.GameView memory gameView2 = gameEngine.getGameState(gameId);
        assertEq(gameView2.player2HandSize, 6); // 5 initial + 1 drawn
    }
}
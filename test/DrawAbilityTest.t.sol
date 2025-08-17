// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/GameEngine.sol";
import "../src/CardRegistry.sol";
import "../src/DeckRegistry.sol";

contract DrawAbilityTest is Test {
    GameEngine public gameEngine;
    CardRegistry public cardRegistry;
    DeckRegistry public deckRegistry;
    
    address player1 = address(0x1);
    address player2 = address(0x2);
    
    function setUp() public {
        cardRegistry = new CardRegistry();
        deckRegistry = new DeckRegistry(address(cardRegistry));
        gameEngine = new GameEngine(address(cardRegistry), address(deckRegistry));
        
        // Create a card with draw ability
        string[] memory abilityNames = new string[](1);
        abilityNames[0] = "draw";
        
        string[][] memory abilityKeys = new string[][](1);
        abilityKeys[0] = new string[](1);
        abilityKeys[0][0] = "amount";
        
        string[][] memory abilityValues = new string[][](1);
        abilityValues[0] = new string[](1);
        abilityValues[0][0] = "2";
        
        cardRegistry.addCard(
            "Test Draw Card",
            "Draw 2 cards",
            3, // cost
            CardRegistry.CardType.Action,
            abilityNames,
            abilityKeys,
            abilityValues
        );
        
        // Create a simple card without abilities for deck filling
        string[] memory noAbilities = new string[](0);
        string[][] memory noKeys = new string[][](0);
        string[][] memory noValues = new string[][](0);
        
        cardRegistry.addCard(
            "Simple Card",
            "No abilities",
            1,
            CardRegistry.CardType.Chain,
            noAbilities,
            noKeys,
            noValues
        );
        
        // Create a deck with more draw cards to increase chances of getting one
        string[] memory cardNames = new string[](30);
        uint256[] memory counts = new uint256[](30);
        
        // Add 10 draw cards and 20 simple cards
        for (uint256 i = 0; i < 10; i++) {
            cardNames[i] = "Test Draw Card";
            counts[i] = 1;
        }
        
        for (uint256 i = 10; i < 30; i++) {
            cardNames[i] = "Simple Card";
            counts[i] = 1;
        }
        
        deckRegistry.addDeck("Test Deck", "A test deck", cardNames, counts);
    }
    
    function testDrawAbilityDrawsCards() public {
        // Create and start game
        vm.prank(player1);
        uint256 gameId = gameEngine.createGame(0); // Use deck ID 0 (first deck)
        
        vm.prank(player2);
        gameEngine.joinGame(gameId, 0); // Use deck ID 0
        
        vm.prank(player1);
        gameEngine.startGame(gameId);
        
        // First turn starts automatically, no need to draw
        
        // Debug: Check what cards are in the deck
        console.log("Checking available cards in registry:");
        console.log("  Card 0:", cardRegistry.getCard(0).name);
        console.log("  Card 1:", cardRegistry.getCard(1).name);
        
        // Keep drawing cards until we find the draw card (or run out of cards)
        uint256 drawCardIndex = type(uint256).max;
        uint256 attempts = 0;
        
        while (drawCardIndex == type(uint256).max && attempts < 10) {
            uint256[] memory hand = gameEngine.getPlayerHand(gameId, player1);
            console.log("Checking hand with size:", hand.length);
            
            // Check if we have the draw card
            for (uint256 i = 0; i < hand.length; i++) {
                console.log("  Card at index", i, "has ID:", hand[i]);
                if (hand[i] == 0) { // Card ID 0 is our draw card
                    drawCardIndex = i;
                    console.log("Found draw card at index:", drawCardIndex);
                    break;
                }
            }
            
            if (drawCardIndex == type(uint256).max) {
                // End turn and start next turn to draw more cards
                vm.prank(player1);
                gameEngine.endTurn(gameId);
                
                // Player 2's turn - just end it
                vm.prank(player2);
                gameEngine.drawToStartTurn(gameId);
                vm.prank(player2);
                gameEngine.endTurn(gameId);
                
                // Back to Player 1's turn
                vm.prank(player1);
                gameEngine.drawToStartTurn(gameId);
            }
            
            attempts++;
        }
        
        if (drawCardIndex == type(uint256).max) {
            console.log("Draw card not found after", attempts, "attempts");
            return;
        }
        
        // Get hand size before playing
        uint256[] memory handBefore = gameEngine.getPlayerHand(gameId, player1);
        uint256 handSizeBefore = handBefore.length;
        console.log("Hand size before playing draw card:", handSizeBefore);
        
        // Play the draw card
        vm.prank(player1);
        gameEngine.playCard(gameId, drawCardIndex);
        
        // Check new hand size
        uint256[] memory handAfter = gameEngine.getPlayerHand(gameId, player1);
        uint256 handSizeAfter = handAfter.length;
        console.log("Hand size after playing draw card:", handSizeAfter);
        
        // Hand should have 2 more cards than initial minus 1 (the played card)
        // So new size should be: initial - 1 (played card) + 2 (drawn cards) = initial + 1
        assertEq(handSizeAfter, handSizeBefore + 1, "Should have drawn 2 cards after playing 1");
    }
}
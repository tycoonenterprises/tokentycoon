// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/GameEngine.sol";
import "../src/CardRegistry.sol";
import "../src/DeckRegistry.sol";

contract TestDrawManual is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Get the deployed contracts
        GameEngine gameEngine = GameEngine(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
        
        // Log the current game state for game 1 (or whatever game you're testing)
        uint256 gameId = 1; // Change this to your actual game ID
        
        // Get game state to find players
        GameEngine.GameView memory gameView = gameEngine.getGameState(gameId);
        address player1 = gameView.player1;
        address player2 = gameView.player2;
        
        console.log("=== GAME STATE BEFORE ===");
        console.log("Player 1:", player1);
        console.log("Player 2:", player2);
        
        uint256[] memory p1Hand = gameEngine.getPlayerHand(gameId, player1);
        console.log("Player 1 hand size:", p1Hand.length);
        for (uint256 i = 0; i < p1Hand.length; i++) {
            console.log("  Card ID:", p1Hand[i]);
        }
        
        // Find Dune Research (card ID should be around 49 based on cards.json)
        // Let's check what card IDs are what
        CardRegistry cardRegistry = CardRegistry(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        
        // Check a few card IDs to find Dune Research
        for (uint256 i = 0; i < 5; i++) {
            if (p1Hand.length > i) {
                CardRegistry.Card memory card = cardRegistry.getCard(p1Hand[i]);
                console.log("Card at index", i);
                console.log("  ID:", p1Hand[i]);
                console.log("  Name:", card.name);
            }
        }
        
        vm.stopBroadcast();
    }
}
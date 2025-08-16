// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CardRegistry.sol";
import "../src/DeckRegistry.sol";
import "../src/GameEngine.sol";

contract DeployAll is Script {
    function run() external returns (CardRegistry, DeckRegistry, GameEngine) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CardRegistry first
        CardRegistry cardRegistry = new CardRegistry();
        console.log("CardRegistry deployed at:", address(cardRegistry));
        
        // Deploy DeckRegistry with CardRegistry address
        DeckRegistry deckRegistry = new DeckRegistry(address(cardRegistry));
        console.log("DeckRegistry deployed at:", address(deckRegistry));
        
        // Deploy GameEngine with both registry addresses
        GameEngine gameEngine = new GameEngine(address(cardRegistry), address(deckRegistry));
        console.log("GameEngine deployed at:", address(gameEngine));
        
        vm.stopBroadcast();
        
        return (cardRegistry, deckRegistry, gameEngine);
    }
}
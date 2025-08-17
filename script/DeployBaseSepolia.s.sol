// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CardRegistry.sol";
import "../src/DeckRegistry.sol";
import "../src/GameEngine.sol";

contract DeployBaseSepolia is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy CardRegistry
        CardRegistry cardRegistry = new CardRegistry();
        console.log("CardRegistry deployed at:", address(cardRegistry));

        // Deploy DeckRegistry
        DeckRegistry deckRegistry = new DeckRegistry(address(cardRegistry));
        console.log("DeckRegistry deployed at:", address(deckRegistry));

        // Deploy GameEngine
        GameEngine gameEngine = new GameEngine(address(cardRegistry), address(deckRegistry));
        console.log("GameEngine deployed at:", address(gameEngine));

        vm.stopBroadcast();

        // Write addresses to file for frontend
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "CARD_REGISTRY": "', vm.toString(address(cardRegistry)), '",\n',
            '  "DECK_REGISTRY": "', vm.toString(address(deckRegistry)), '",\n', 
            '  "GAME_ENGINE": "', vm.toString(address(gameEngine)), '",\n',
            '  "CHAIN_ID": 84532,\n',
            '  "RPC_URL": "https://sepolia.base.org"\n',
            '}'
        ));
        
        vm.writeFile("base-sepolia-addresses.json", json);
        console.log("Addresses written to base-sepolia-addresses.json");
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CardRegistry.sol";
import "../src/GameLobby.sol";

contract Deploy is Script {
    function run() external returns (CardRegistry, GameLobby) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CardRegistry first
        CardRegistry cardRegistry = new CardRegistry();
        console.log("CardRegistry deployed at:", address(cardRegistry));
        
        // Deploy GameLobby with CardRegistry address
        GameLobby gameLobby = new GameLobby(address(cardRegistry));
        console.log("GameLobby deployed at:", address(gameLobby));
        
        vm.stopBroadcast();
        
        return (cardRegistry, gameLobby);
    }
}
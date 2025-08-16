// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/GameLobby.sol";

contract DeployGameLobby is Script {
    function run() external returns (GameLobby) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        GameLobby lobby = new GameLobby();
        
        console.log("GameLobby deployed at:", address(lobby));
        
        vm.stopBroadcast();
        
        return lobby;
    }
}
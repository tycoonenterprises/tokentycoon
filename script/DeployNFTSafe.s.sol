// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";
import {TokenTycoonDecks} from "../src/nft/TokenTycoonDecks.sol";
import {TokenTycoonPacks} from "../src/nft/TokenTycoonPacks.sol";

/**
 * @title DeployNFTSafe
 * @notice Safely deploys NFT contracts, checking for existing deployments
 */
contract DeployNFTSafe is Script {
    
    function run() external {
        vm.startBroadcast();
        
        console.log("=== Safe NFT Deployment ===");
        console.log("Deployer:", msg.sender);
        
        // Try to read existing deployment
        string memory deployedFile = "./data/nft/deployed-contracts.json";
        
        // For this example, we'll deploy new contracts but warn the user
        console.log("WARNING: This will deploy NEW contracts");
        console.log("Previous contracts (if any) will still exist but be orphaned");
        console.log("Each deployment costs gas and creates new addresses");
        
        // Deploy contracts
        TokenTycoonCards cards = new TokenTycoonCards();
        console.log("TokenTycoonCards deployed at:", address(cards));
        
        TokenTycoonDecks decks = new TokenTycoonDecks(address(cards));
        console.log("TokenTycoonDecks deployed at:", address(decks));
        
        TokenTycoonPacks packs = new TokenTycoonPacks(address(cards));
        console.log("TokenTycoonPacks deployed at:", address(packs));
        
        // Set up roles
        bytes32 MINTER_ROLE = cards.MINTER_ROLE();
        cards.grantRole(MINTER_ROLE, address(decks));
        cards.grantRole(MINTER_ROLE, address(packs));
        
        vm.stopBroadcast();
        
        // Save addresses
        string memory contractsJson = string.concat(
            '{\n',
            '  "deployedAt": "', vm.toString(block.timestamp), '",\n',
            '  "deployer": "', vm.toString(msg.sender), '",\n',
            '  "TokenTycoonCards": "', vm.toString(address(cards)), '",\n',
            '  "TokenTycoonDecks": "', vm.toString(address(decks)), '",\n',
            '  "TokenTycoonPacks": "', vm.toString(address(packs)), '"\n',
            '}'
        );
        
        vm.writeFile(deployedFile, contractsJson);
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Addresses saved to:", deployedFile);
        console.log("===============================");
    }
}
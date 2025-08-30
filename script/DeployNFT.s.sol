// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";
import {TokenTycoonDecks} from "../src/nft/TokenTycoonDecks.sol";
import {TokenTycoonPacks} from "../src/nft/TokenTycoonPacks.sol";

/**
 * @title DeployNFT
 * @notice Deploys all NFT contracts for Token Tycoon
 */
contract DeployNFT is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying NFT contracts with deployer:", deployer);
        console.log("Deployer balance:", address(deployer).balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy TokenTycoonCards
        console.log("Deploying TokenTycoonCards...");
        TokenTycoonCards cards = new TokenTycoonCards();
        console.log("TokenTycoonCards deployed at:", address(cards));
        
        // 2. Deploy TokenTycoonDecks (requires cards address)
        console.log("Deploying TokenTycoonDecks...");
        TokenTycoonDecks decks = new TokenTycoonDecks(address(cards));
        console.log("TokenTycoonDecks deployed at:", address(decks));
        
        // 3. Deploy TokenTycoonPacks (requires cards address)
        console.log("Deploying TokenTycoonPacks...");
        TokenTycoonPacks packs = new TokenTycoonPacks(address(cards));
        console.log("TokenTycoonPacks deployed at:", address(packs));
        
        // 4. Grant roles between contracts
        console.log("Setting up roles...");
        
        // Allow decks contract to mint cards
        bytes32 MINTER_ROLE = cards.MINTER_ROLE();
        cards.grantRole(MINTER_ROLE, address(decks));
        console.log("Granted MINTER_ROLE to decks contract");
        
        // Allow packs contract to mint cards
        cards.grantRole(MINTER_ROLE, address(packs));
        console.log("Granted MINTER_ROLE to packs contract");
        
        vm.stopBroadcast();
        
        // 5. Save contract addresses
        console.log("\n=== Deployment Complete ===");
        console.log("TokenTycoonCards:", address(cards));
        console.log("TokenTycoonDecks:", address(decks));
        console.log("TokenTycoonPacks:", address(packs));
        
        // Note: Manual update needed for deployed-contracts.json
        console.log("");
        console.log("Update data/nft/deployed-contracts.json with above addresses");
    }
}
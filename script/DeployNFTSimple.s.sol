// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";
import {TokenTycoonDecks} from "../src/nft/TokenTycoonDecks.sol";
import {TokenTycoonPacks} from "../src/nft/TokenTycoonPacks.sol";

/**
 * @title DeployNFTSimple
 * @notice Simple NFT deployment without environment variables for testing
 */
contract DeployNFTSimple is Script {
    
    function run() external {
        // Use the default anvil account
        vm.startBroadcast();
        
        console.log("Deploying NFT contracts...");
        console.log("Deployer:", msg.sender);
        
        // 1. Deploy TokenTycoonCards
        console.log("1. Deploying TokenTycoonCards...");
        TokenTycoonCards cards = new TokenTycoonCards();
        console.log("   TokenTycoonCards deployed at:", address(cards));
        
        // 2. Deploy TokenTycoonDecks (requires cards address)
        console.log("2. Deploying TokenTycoonDecks...");
        TokenTycoonDecks decks = new TokenTycoonDecks(address(cards));
        console.log("   TokenTycoonDecks deployed at:", address(decks));
        
        // 3. Deploy TokenTycoonPacks (requires cards address)
        console.log("3. Deploying TokenTycoonPacks...");
        TokenTycoonPacks packs = new TokenTycoonPacks(address(cards));
        console.log("   TokenTycoonPacks deployed at:", address(packs));
        
        // 4. Grant roles between contracts
        console.log("4. Setting up roles...");
        
        // Allow decks contract to mint cards
        bytes32 MINTER_ROLE = cards.MINTER_ROLE();
        cards.grantRole(MINTER_ROLE, address(decks));
        console.log("   Granted MINTER_ROLE to decks contract");
        
        // Allow packs contract to mint cards
        cards.grantRole(MINTER_ROLE, address(packs));
        console.log("   Granted MINTER_ROLE to packs contract");
        
        vm.stopBroadcast();
        
        // 5. Display results
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("TokenTycoonCards:", address(cards));
        console.log("TokenTycoonDecks:", address(decks));
        console.log("TokenTycoonPacks:", address(packs));
        console.log("===============================\n");
        
        console.log("Next steps:");
        console.log("1. Save these contract addresses");
        console.log("2. Set CARDS_CONTRACT=%s", vm.toString(address(cards)));
        console.log("3. Set DECKS_CONTRACT=%s", vm.toString(address(decks)));
        console.log("4. Run initialization scripts");
    }
}
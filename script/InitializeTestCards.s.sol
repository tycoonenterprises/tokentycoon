// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";

/**
 * @title InitializeTestCards
 * @notice Initialize just a few cards for testing minting functionality
 */
contract InitializeTestCards is Script {
    
    function run() external {
        // Read deployed addresses
        string memory deployedFile = "./data/nft/deployed-contracts.json";
        string memory json = vm.readFile(deployedFile);
        address cardsAddress = vm.parseJsonAddress(json, ".TokenTycoonCards");
        
        TokenTycoonCards cards = TokenTycoonCards(cardsAddress);
        
        vm.startBroadcast();
        
        console.log("=== Initializing Test Cards ===");
        console.log("Cards contract:", address(cards));
        console.log("Initializer:", msg.sender);
        
        // Simple test SVG
        bytes memory testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/><text x="50" y="50" text-anchor="middle" fill="white">TEST</text></svg>';
        
        // Initialize card 1: Ethereum
        cards.setCardMetadata(
            1,
            "Ethereum", 
            "The world computer that started it all",
            3, // cost
            TokenTycoonCards.CardType.Chain,
            testSvg,
            0 // unlimited supply
        );
        
        // Set abilities for card 1
        TokenTycoonCards.Ability[] memory abilities1 = new TokenTycoonCards.Ability[](1);
        abilities1[0] = TokenTycoonCards.Ability("income", 1);
        cards.setCardAbilities(1, abilities1);
        console.log("Initialized card 1: Ethereum");
        
        // Initialize card 2: Bitcoin  
        cards.setCardMetadata(
            2,
            "Bitcoin",
            "Digital gold, the original cryptocurrency", 
            5, // cost
            TokenTycoonCards.CardType.Chain,
            testSvg,
            0 // unlimited supply
        );
        
        TokenTycoonCards.Ability[] memory abilities2 = new TokenTycoonCards.Ability[](1);
        abilities2[0] = TokenTycoonCards.Ability("income", 2);
        cards.setCardAbilities(2, abilities2);
        console.log("Initialized card 2: Bitcoin");
        
        // Initialize card 3: Uniswap
        cards.setCardMetadata(
            3,
            "Uniswap",
            "Decentralized exchange protocol",
            4, // cost
            TokenTycoonCards.CardType.DeFi,
            testSvg,
            0 // unlimited supply
        );
        
        TokenTycoonCards.Ability[] memory abilities3 = new TokenTycoonCards.Ability[](1);
        abilities3[0] = TokenTycoonCards.Ability("yield", 10); // 0.1 as 10 (scaled)
        cards.setCardAbilities(3, abilities3);
        console.log("Initialized card 3: Uniswap");
        
        // Initialize card 4: Compound
        cards.setCardMetadata(
            4,
            "Compound", 
            "Algorithmic money market protocol",
            3, // cost
            TokenTycoonCards.CardType.DeFi,
            testSvg,
            0 // unlimited supply
        );
        
        TokenTycoonCards.Ability[] memory abilities4 = new TokenTycoonCards.Ability[](1);
        abilities4[0] = TokenTycoonCards.Ability("yield", 15); // 0.15 as 15 (scaled)
        cards.setCardAbilities(4, abilities4);
        console.log("Initialized card 4: Compound");
        
        // Initialize card 5: Vitalik Buterin
        cards.setCardMetadata(
            5,
            "Vitalik Buterin",
            "Ethereum's visionary founder",
            2, // cost
            TokenTycoonCards.CardType.EOA,
            testSvg,
            0 // unlimited supply
        );
        
        TokenTycoonCards.Ability[] memory abilities5 = new TokenTycoonCards.Ability[](1);
        abilities5[0] = TokenTycoonCards.Ability("draw", 1);
        cards.setCardAbilities(5, abilities5);
        console.log("Initialized card 5: Vitalik Buterin");
        
        vm.stopBroadcast();
        
        console.log("\n=== Test Cards Initialized Successfully ===");
        console.log("You can now test minting cards 1-5:");
        console.log("export CARDS_CONTRACT=", address(cards));
        console.log("cast send $CARDS_CONTRACT \"mintCard(address,uint256,uint256)\" YOUR_ADDRESS 1 1 --private-key $PRIVATE_KEY --rpc-url https://sepolia.base.org");
        console.log("============================================");
    }
}
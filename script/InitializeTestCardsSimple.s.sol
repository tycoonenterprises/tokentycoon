// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";

/**
 * @title InitializeTestCardsSimple
 * @notice Initialize test cards without file reading
 */
contract InitializeTestCardsSimple is Script {
    
    function run() external {
        // Hard-coded deployed address
        address cardsAddress = 0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16;
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
        
        vm.stopBroadcast();
        
        console.log("\n=== Test Cards Initialized Successfully ===");
        console.log("You can now test minting cards 1-2");
        console.log("============================================");
    }
}
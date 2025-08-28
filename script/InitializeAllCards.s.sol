// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";

/**
 * @title InitializeAllCards
 * @notice Initialize all cards from preprocessed JSON data
 */
contract InitializeAllCards is Script {
    
    function run() external {
        // Use deployed contract address directly
        address cardsContract = 0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16;
        TokenTycoonCards cards = TokenTycoonCards(cardsContract);
        
        console.log("=== Initializing All Cards ===");
        console.log("Cards contract:", cardsContract);
        console.log("Deployer:", msg.sender);
        
        vm.startBroadcast();
        
        // Clear existing incorrect card 1 first by setting new metadata
        console.log("Clearing existing incorrect card data...");
        
        // Initialize first 5 cards as a test batch
        initializeBatch1(cards);
        
        vm.stopBroadcast();
        
        console.log("\n=== First Batch Initialized ===");
        console.log("Cards 2-6 have been properly initialized");
        console.log("Run query tests to verify");
        console.log("===============================");
    }
    
    function initializeBatch1(TokenTycoonCards cards) internal {
        // Card 2: Bridge Hack (skip card 1 since it's corrupted)
        {
            console.log("Initializing card 2: Bridge Hack");
            
            string memory svgData = '<svg width="375" height="525" viewBox="0 0 375 525" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cardBg"><stop offset="0%" style="stop-color:#2D1100"/><stop offset="50%" style="stop-color:#3D1A3D"/><stop offset="100%" style="stop-color:#2D1100"/></linearGradient><linearGradient id="frameGrad"><stop offset="0%" style="stop-color:#FF0000"/><stop offset="100%" style="stop-color:#FF6B00"/></linearGradient><filter id="cardGlow"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="375" height="525" rx="15" fill="url(#cardBg)"/><text x="40" y="55" font-family="Orbitron" font-size="22" fill="#FFFFFF">Bridge Hack</text><text x="317.5" y="57" font-family="Orbitron" font-size="18" fill="#FFFFFF" text-anchor="middle">5</text><text x="75" y="108" font-family="Orbitron" font-size="14" fill="#FF0000" text-anchor="middle">Action</text><text x="40" y="375" font-family="Arial" font-size="13" fill="#FFFFFF"><tspan x="40">Destroy target chain and all DeFi Protocols</tspan><tspan x="40" dy="18">on it.</tspan></text></svg>';
            
            cards.setCardMetadata(
                2, // cardId
                "Bridge Hack", // name
                "Destroy target chain and all DeFi Protocols on it.", // description
                5, // cost
                TokenTycoonCards.CardType.Action, // cardType
                bytes(svgData), // svgData
                0 // maxSupply
            );
            
            TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](1);
            abilities[0] = TokenTycoonCards.Ability("destroy", 1);
            cards.setCardAbilities(2, abilities);
            cards.finalizeMetadata(2);
        }
        
        // Card 3: Study the charts
        {
            console.log("Initializing card 3: Study the charts");
            
            string memory svgData = '<svg width="375" height="525" viewBox="0 0 375 525" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cardBg"><stop offset="0%" style="stop-color:#2D1100"/><stop offset="50%" style="stop-color:#3D1A3D"/><stop offset="100%" style="stop-color:#2D1100"/></linearGradient></defs><rect width="375" height="525" rx="15" fill="url(#cardBg)"/><text x="40" y="55" font-family="Orbitron" font-size="22" fill="#FFFFFF">Study the charts</text><text x="317.5" y="57" font-family="Orbitron" font-size="18" fill="#FFFFFF" text-anchor="middle">2</text><text x="75" y="108" font-family="Orbitron" font-size="14" fill="#00B8E6" text-anchor="middle">Action</text><text x="40" y="375" font-family="Arial" font-size="13" fill="#FFFFFF"><tspan x="40">Draw 2 cards.</tspan></text></svg>';
            
            cards.setCardMetadata(
                3, // cardId
                "Study the charts", // name
                "Draw 2 cards.", // description
                2, // cost
                TokenTycoonCards.CardType.Action, // cardType
                bytes(svgData), // svgData
                0 // maxSupply
            );
            
            TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](1);
            abilities[0] = TokenTycoonCards.Ability("draw", 2);
            cards.setCardAbilities(3, abilities);
            cards.finalizeMetadata(3);
        }
        
        // Card 4: 1inch
        {
            console.log("Initializing card 4: 1inch");
            
            string memory svgData = '<svg width="375" height="525" viewBox="0 0 375 525" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cardBg"><stop offset="0%" style="stop-color:#2D1100"/><stop offset="50%" style="stop-color:#3D1A3D"/><stop offset="100%" style="stop-color:#2D1100"/></linearGradient></defs><rect width="375" height="525" rx="15" fill="url(#cardBg)"/><text x="40" y="55" font-family="Orbitron" font-size="22" fill="#FFFFFF">1inch</text><text x="317.5" y="57" font-family="Orbitron" font-size="18" fill="#FFFFFF" text-anchor="middle">4</text><text x="75" y="108" font-family="Orbitron" font-size="14" fill="#FFA500" text-anchor="middle">DeFi</text><text x="40" y="375" font-family="Arial" font-size="13" fill="#FFFFFF"><tspan x="40">Gain 1 ETH per other DeFi attached to the same chain.</tspan></text></svg>';
            
            cards.setCardMetadata(
                4, // cardId
                "1inch", // name
                "Gain 1 ETH per other DeFi attached to the same chain.", // description
                4, // cost
                TokenTycoonCards.CardType.DeFi, // cardType
                bytes(svgData), // svgData
                0 // maxSupply
            );
            
            TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](1);
            abilities[0] = TokenTycoonCards.Ability("income", 1);
            cards.setCardAbilities(4, abilities);
            cards.finalizeMetadata(4);
        }
        
        // Card 5: CoW Swap
        {
            console.log("Initializing card 5: CoW Swap");
            
            string memory svgData = '<svg width="375" height="525" viewBox="0 0 375 525" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cardBg"><stop offset="0%" style="stop-color:#2D1100"/><stop offset="50%" style="stop-color:#3D1A3D"/><stop offset="100%" style="stop-color:#2D1100"/></linearGradient></defs><rect width="375" height="525" rx="15" fill="url(#cardBg)"/><text x="40" y="55" font-family="Orbitron" font-size="22" fill="#FFFFFF">CoW Swap</text><text x="317.5" y="57" font-family="Orbitron" font-size="18" fill="#FFFFFF" text-anchor="middle">4</text><text x="75" y="108" font-family="Orbitron" font-size="14" fill="#FFA500" text-anchor="middle">DeFi</text><text x="40" y="375" font-family="Arial" font-size="13" fill="#FFFFFF"><tspan x="40">Gain 1 ETH per other DeFi attached to the same chain.</tspan></text></svg>';
            
            cards.setCardMetadata(
                5, // cardId
                "CoW Swap", // name
                "Gain 1 ETH per other DeFi attached to the same chain.", // description
                4, // cost
                TokenTycoonCards.CardType.DeFi, // cardType
                bytes(svgData), // svgData
                0 // maxSupply
            );
            
            TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](1);
            abilities[0] = TokenTycoonCards.Ability("income", 1);
            cards.setCardAbilities(5, abilities);
            cards.finalizeMetadata(5);
        }
        
        // Card 6: Yield Farm
        {
            console.log("Initializing card 6: Yield Farm");
            
            string memory svgData = '<svg width="375" height="525" viewBox="0 0 375 525" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cardBg"><stop offset="0%" style="stop-color:#2D1100"/><stop offset="50%" style="stop-color:#3D1A3D"/><stop offset="100%" style="stop-color:#2D1100"/></linearGradient></defs><rect width="375" height="525" rx="15" fill="url(#cardBg)"/><text x="40" y="55" font-family="Orbitron" font-size="22" fill="#FFFFFF">Yield Farm</text><text x="317.5" y="57" font-family="Orbitron" font-size="18" fill="#FFFFFF" text-anchor="middle">2</text><text x="75" y="108" font-family="Orbitron" font-size="14" fill="#FFA500" text-anchor="middle">DeFi</text><text x="40" y="375" font-family="Arial" font-size="13" fill="#FFFFFF"><tspan x="40">Enters with 3 tokens. Each turn remove 1 token</tspan><tspan x="40" dy="18">and add 2 ETH.</tspan></text></svg>';
            
            cards.setCardMetadata(
                6, // cardId
                "Yield Farm", // name
                "Enters with 3 tokens. Each turn remove 1 token and add 2 ETH.", // description
                2, // cost
                TokenTycoonCards.CardType.DeFi, // cardType
                bytes(svgData), // svgData
                0 // maxSupply
            );
            
            TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](2);
            abilities[0] = TokenTycoonCards.Ability("income", 2);
            abilities[1] = TokenTycoonCards.Ability("scale", 1); // scale by tokens
            cards.setCardAbilities(6, abilities);
            cards.finalizeMetadata(6);
        }
    }
}
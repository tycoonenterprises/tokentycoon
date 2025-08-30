// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenTycoonCards} from "../src/nft/TokenTycoonCards.sol";
import {TokenTycoonDecks} from "../src/nft/TokenTycoonDecks.sol";
import {TokenTycoonPacks} from "../src/nft/TokenTycoonPacks.sol";

/**
 * @title DeployNFTDeterministic
 * @notice Deploys NFT contracts with predictable addresses using CREATE2
 */
contract DeployNFTDeterministic is Script {
    
    // Salt for deterministic deployment (change this to redeploy)
    bytes32 constant SALT = keccak256("TokenTycoonNFT-v1.0.0");
    
    function run() external {
        vm.startBroadcast();
        
        console.log("Deploying NFT contracts deterministically...");
        console.log("Deployer:", msg.sender);
        console.log("Salt:", vm.toString(SALT));
        
        // Calculate expected addresses before deployment
        address expectedCardsAddr = computeCreate2Address(
            SALT,
            keccak256(type(TokenTycoonCards).creationCode),
            msg.sender
        );
        
        console.log("Expected TokenTycoonCards address:", expectedCardsAddr);
        
        // 1. Deploy TokenTycoonCards with CREATE2
        TokenTycoonCards cards;
        bytes memory cardsCreationCode = type(TokenTycoonCards).creationCode;
        
        assembly {
            cards := create2(0, add(cardsCreationCode, 0x20), mload(cardsCreationCode), SALT)
            if iszero(cards) { revert(0, 0) }
        }
        
        require(address(cards) == expectedCardsAddr, "Cards address mismatch");
        console.log("[SUCCESS] TokenTycoonCards deployed at:", address(cards));
        
        // 2. Deploy TokenTycoonDecks with CREATE2
        bytes32 decksSalt = keccak256(abi.encodePacked(SALT, "decks"));
        bytes memory decksCreationCode = abi.encodePacked(
            type(TokenTycoonDecks).creationCode,
            abi.encode(address(cards))
        );
        
        TokenTycoonDecks decks;
        assembly {
            decks := create2(0, add(decksCreationCode, 0x20), mload(decksCreationCode), decksSalt)
            if iszero(decks) { revert(0, 0) }
        }
        console.log("[SUCCESS] TokenTycoonDecks deployed at:", address(decks));
        
        // 3. Deploy TokenTycoonPacks with CREATE2
        bytes32 packsSalt = keccak256(abi.encodePacked(SALT, "packs"));
        bytes memory packsCreationCode = abi.encodePacked(
            type(TokenTycoonPacks).creationCode,
            abi.encode(address(cards))
        );
        
        TokenTycoonPacks packs;
        assembly {
            packs := create2(0, add(packsCreationCode, 0x20), mload(packsCreationCode), packsSalt)
            if iszero(packs) { revert(0, 0) }
        }
        console.log("[SUCCESS] TokenTycoonPacks deployed at:", address(packs));
        
        // 4. Set up roles
        bytes32 MINTER_ROLE = cards.MINTER_ROLE();
        cards.grantRole(MINTER_ROLE, address(decks));
        cards.grantRole(MINTER_ROLE, address(packs));
        console.log("[SUCCESS] Roles configured");
        
        vm.stopBroadcast();
        
        console.log("\n=== DETERMINISTIC DEPLOYMENT COMPLETE ===");
        console.log("TokenTycoonCards:", address(cards));
        console.log("TokenTycoonDecks:", address(decks));
        console.log("TokenTycoonPacks:", address(packs));
        console.log("Salt used:", vm.toString(SALT));
        console.log("=========================================");
    }
    
    function computeCreate2Address(bytes32 salt, bytes32 bytecodeHash, address deployer) 
        internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            deployer,
            salt,
            bytecodeHash
        )))));
    }
}
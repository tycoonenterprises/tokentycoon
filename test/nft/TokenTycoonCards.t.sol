// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {TokenTycoonCards} from "../../src/nft/TokenTycoonCards.sol";

contract TokenTycoonCardsTest is Test {
    TokenTycoonCards public cards;
    address public admin = address(0x123);
    address public user = address(0x456);
    
    bytes constant TEST_SVG = '<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';
    
    function setUp() public {
        vm.prank(admin);
        cards = new TokenTycoonCards();
    }
    
    function testSetCardMetadata() public {
        vm.prank(admin);
        cards.setCardMetadata(
            1,
            "Test Card",
            "A test card",
            3,
            TokenTycoonCards.CardType.DeFi,
            TEST_SVG,
            100
        );
        
        TokenTycoonCards.CardMetadata memory metadata = cards.getCardMetadata(1);
        assertEq(metadata.name, "Test Card");
        assertEq(metadata.cost, 3);
        assertFalse(metadata.finalized);
    }
    
    function testFinalizeMetadata() public {
        // Set metadata
        vm.prank(admin);
        cards.setCardMetadata(
            1,
            "Test Card",
            "A test card", 
            3,
            TokenTycoonCards.CardType.DeFi,
            TEST_SVG,
            100
        );
        
        // Finalize
        vm.prank(admin);
        cards.finalizeMetadata(1);
        
        TokenTycoonCards.CardMetadata memory metadata = cards.getCardMetadata(1);
        assertTrue(metadata.finalized);
        
        // Should revert when trying to modify finalized card
        vm.prank(admin);
        vm.expectRevert(TokenTycoonCards.CardIsFinalized.selector);
        cards.setCardMetadata(
            1,
            "New Name",
            "New desc",
            5,
            TokenTycoonCards.CardType.Chain,
            TEST_SVG,
            200
        );
    }
    
    function testMintCard() public {
        // Set up card
        vm.prank(admin);
        cards.setCardMetadata(
            1,
            "Test Card",
            "A test card",
            3,
            TokenTycoonCards.CardType.DeFi,
            TEST_SVG,
            100
        );
        
        // Mint card
        vm.prank(admin);
        cards.mintCard(user, 1, 5);
        
        assertEq(cards.balanceOf(user, 1), 5);
        
        TokenTycoonCards.CardMetadata memory metadata = cards.getCardMetadata(1);
        assertEq(metadata.totalMinted, 5);
    }
    
    function testMaxSupplyEnforcement() public {
        // Set up card with max supply 10
        vm.prank(admin);
        cards.setCardMetadata(
            1,
            "Limited Card",
            "A limited card",
            5,
            TokenTycoonCards.CardType.Chain,
            TEST_SVG,
            10
        );
        
        // Mint 10 cards (should work)
        vm.prank(admin);
        cards.mintCard(user, 1, 10);
        
        // Try to mint 1 more (should fail)
        vm.prank(admin);
        vm.expectRevert(TokenTycoonCards.ExceedsMaxSupply.selector);
        cards.mintCard(user, 1, 1);
    }
    
    function testURIGeneration() public {
        // Set up card
        vm.prank(admin);
        cards.setCardMetadata(
            1,
            "Test Card",
            "A test card",
            3,
            TokenTycoonCards.CardType.DeFi,
            TEST_SVG,
            0
        );
        
        // Set abilities
        TokenTycoonCards.Ability[] memory abilities = new TokenTycoonCards.Ability[](1);
        abilities[0] = TokenTycoonCards.Ability("income", 2);
        
        vm.prank(admin);
        cards.setCardAbilities(1, abilities);
        
        // Get URI
        string memory uri = cards.uri(1);
        
        // Should be a data URI
        assertTrue(bytes(uri).length > 0);
        
        // Should start with data:application/json;base64,
        bytes memory uriBytes = bytes(uri);
        string memory prefix = "data:application/json;base64,";
        bytes memory prefixBytes = bytes(prefix);
        
        bool hasPrefix = true;
        if (uriBytes.length >= prefixBytes.length) {
            for (uint i = 0; i < prefixBytes.length; i++) {
                if (uriBytes[i] != prefixBytes[i]) {
                    hasPrefix = false;
                    break;
                }
            }
        } else {
            hasPrefix = false;
        }
        
        assertTrue(hasPrefix, "URI should start with data:application/json;base64,");
    }
    
    function testAccessControl() public {
        // Non-admin should not be able to set metadata
        vm.prank(user);
        vm.expectRevert();
        cards.setCardMetadata(
            1,
            "Test Card",
            "A test card",
            3,
            TokenTycoonCards.CardType.DeFi,
            TEST_SVG,
            100
        );
        
        // Non-minter should not be able to mint
        vm.prank(user);
        vm.expectRevert();
        cards.mintCard(user, 1, 1);
    }
}
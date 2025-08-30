// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {TokenTycoonCards} from "../../src/nft/TokenTycoonCards.sol";
import {TokenTycoonDecks} from "../../src/nft/TokenTycoonDecks.sol";
import {TokenTycoonPacks} from "../../src/nft/TokenTycoonPacks.sol";

/**
 * @title NFTIntegrationTest
 * @notice Test integration between all NFT contracts
 */
contract NFTIntegrationTest is Test {
    TokenTycoonCards public cards;
    TokenTycoonDecks public decks;
    TokenTycoonPacks public packs;
    
    address public admin = address(0x123);
    address public user = address(0x456);
    
    bytes constant TEST_SVG = '<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';
    bytes constant DECK_SVG = '<svg width="200" height="300"><rect width="200" height="300" fill="blue"/></svg>';
    bytes constant PACK_SVG = '<svg width="150" height="200"><rect width="150" height="200" fill="green"/></svg>';
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        cards = new TokenTycoonCards();
        decks = new TokenTycoonDecks(address(cards));
        packs = new TokenTycoonPacks(address(cards));
        
        // Grant roles
        bytes32 MINTER_ROLE = cards.MINTER_ROLE();
        cards.grantRole(MINTER_ROLE, address(decks));
        cards.grantRole(MINTER_ROLE, address(packs));
        
        vm.stopPrank();
    }
    
    function testFullNFTFlow() public {
        // 1. Set up cards
        vm.startPrank(admin);
        
        // Card 1: DeFi card
        cards.setCardMetadata(1, "Uniswap", "DEX protocol", 3, TokenTycoonCards.CardType.DeFi, TEST_SVG, 0);
        TokenTycoonCards.Ability[] memory abilities1 = new TokenTycoonCards.Ability[](1);
        abilities1[0] = TokenTycoonCards.Ability("income", 2);
        cards.setCardAbilities(1, abilities1);
        cards.finalizeMetadata(1);
        
        // Card 2: Chain card  
        cards.setCardMetadata(2, "Ethereum", "L1 blockchain", 5, TokenTycoonCards.CardType.Chain, TEST_SVG, 0);
        TokenTycoonCards.Ability[] memory abilities2 = new TokenTycoonCards.Ability[](1);
        abilities2[0] = TokenTycoonCards.Ability("yield", 3);
        cards.setCardAbilities(2, abilities2);
        cards.finalizeMetadata(2);
        
        vm.stopPrank();
        
        // 2. Create deck with 60 cards (30 of each card)
        vm.prank(admin);
        TokenTycoonDecks.CardCount[] memory composition = new TokenTycoonDecks.CardCount[](2);
        composition[0] = TokenTycoonDecks.CardCount(1, 30);
        composition[1] = TokenTycoonDecks.CardCount(2, 30);
        
        decks.setDeckMetadata(
            1,
            "Test Deck",
            "A balanced test deck",
            "Mix of DeFi and Chain cards",
            composition,
            DECK_SVG,
            0,
            true
        );
        decks.finalizeDeck(1);
        
        // 3. Mint sealed deck
        vm.prank(admin);
        uint256 deckTokenId = decks.mintDeck(user, 1, true);
        
        assertEq(decks.balanceOf(user, deckTokenId), 1);
        assertTrue(decks.isSealed(deckTokenId));
        assertEq(cards.balanceOf(user, 1), 0); // No cards yet
        
        // 4. Crack deck to get cards
        vm.prank(user);
        decks.crackDeck(deckTokenId);
        
        assertEq(decks.balanceOf(user, deckTokenId), 0); // Deck NFT burned
        assertFalse(decks.isSealed(deckTokenId));
        assertEq(cards.balanceOf(user, 1), 30); // Received cards
        assertEq(cards.balanceOf(user, 2), 30);
        
        // 5. Set up pack system
        vm.prank(admin);
        packs.setPackMetadata(
            1,
            "Common Pack",
            TokenTycoonPacks.PackType.Common,
            5,
            0.01 ether,
            0,
            PACK_SVG
        );
        
        // Set pack distribution
        TokenTycoonPacks.RarityWeight[] memory distribution = new TokenTycoonPacks.RarityWeight[](2);
        distribution[0] = TokenTycoonPacks.RarityWeight(1, 70, 0); // Card 1, weight 70, common
        distribution[1] = TokenTycoonPacks.RarityWeight(2, 30, 0); // Card 2, weight 30, common
        
        packs.setPackDistribution(1, distribution);
        packs.finalizePack(1);
        
        // 6. Purchase and open pack
        vm.deal(user, 1 ether);
        vm.prank(user);
        uint256 packTokenId = packs.purchasePack{value: 0.01 ether}(1);
        
        assertEq(packs.balanceOf(user, packTokenId), 1);
        
        uint256 cardsBefore1 = cards.balanceOf(user, 1);
        uint256 cardsBefore2 = cards.balanceOf(user, 2);
        
        vm.prank(user);
        packs.openPack(packTokenId);
        
        assertEq(packs.balanceOf(user, packTokenId), 0); // Pack burned
        
        uint256 cardsAfter1 = cards.balanceOf(user, 1);
        uint256 cardsAfter2 = cards.balanceOf(user, 2);
        
        // Should have received 5 total cards from pack
        assertEq((cardsAfter1 + cardsAfter2) - (cardsBefore1 + cardsBefore2), 5);
        
        console.log("=== NFT Integration Test Complete ===");
        console.log("Cards owned (card 1):", cards.balanceOf(user, 1));
        console.log("Cards owned (card 2):", cards.balanceOf(user, 2));
        console.log("Deck tokens owned:", decks.balanceOf(user, deckTokenId));
        console.log("Pack tokens owned:", packs.balanceOf(user, packTokenId));
    }
    
    function testDeckCompositionValidation() public {
        vm.startPrank(admin);
        
        // Set up a card
        cards.setCardMetadata(1, "Test Card", "Test", 1, TokenTycoonCards.CardType.Action, TEST_SVG, 0);
        
        // Try to create deck with wrong number of cards (should fail)
        TokenTycoonDecks.CardCount[] memory composition = new TokenTycoonDecks.CardCount[](1);
        composition[0] = TokenTycoonDecks.CardCount(1, 50); // Only 50 cards, need 60
        
        vm.expectRevert(TokenTycoonDecks.InvalidDeckSize.selector);
        decks.setDeckMetadata(
            1,
            "Bad Deck",
            "Wrong size",
            "Invalid",
            composition,
            DECK_SVG,
            0,
            true
        );
        
        vm.stopPrank();
    }
    
    function testPackRandomness() public {
        vm.startPrank(admin);
        
        // Set up multiple cards
        for (uint i = 1; i <= 5; i++) {
            cards.setCardMetadata(i, string(abi.encodePacked("Card ", i)), "Test card", i, TokenTycoonCards.CardType.Action, TEST_SVG, 0);
        }
        
        // Set up pack
        packs.setPackMetadata(1, "Random Pack", TokenTycoonPacks.PackType.Common, 3, 0, 0, PACK_SVG);
        
        // Set equal distribution
        TokenTycoonPacks.RarityWeight[] memory distribution = new TokenTycoonPacks.RarityWeight[](5);
        for (uint i = 0; i < 5; i++) {
            distribution[i] = TokenTycoonPacks.RarityWeight(i + 1, 20, 0); // Equal weights
        }
        packs.setPackDistribution(1, distribution);
        packs.finalizePack(1);
        
        vm.stopPrank();
        
        // Open multiple packs and verify randomness
        for (uint i = 0; i < 3; i++) {
            vm.prank(admin);
            uint256 packTokenId = packs.mintPack(user, 1);
            
            vm.prank(user);
            packs.openPack(packTokenId);
        }
        
        // Should have received 9 total cards (3 packs × 3 cards each)
        uint256 totalCards = 0;
        for (uint i = 1; i <= 5; i++) {
            totalCards += cards.balanceOf(user, i);
        }
        assertEq(totalCards, 9);
        
        vm.stopPrank();
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CardRegistry.sol";

contract CardRegistryTest is Test {
    CardRegistry public registry;
    address public owner = address(this);
    address public user = address(0x1);

    event CardAdded(uint256 indexed cardId, string name, CardRegistry.CardType cardType);
    event CardsInitialized(uint256 count);

    function setUp() public {
        registry = new CardRegistry();
    }

    function testAddCard() public {
        string[] memory abilityNames = new string[](1);
        abilityNames[0] = "testAbility";
        
        string[][] memory abilityKeys = new string[][](1);
        abilityKeys[0] = new string[](2);
        abilityKeys[0][0] = "power";
        abilityKeys[0][1] = "duration";
        
        string[][] memory abilityValues = new string[][](1);
        abilityValues[0] = new string[](2);
        abilityValues[0][0] = "10";
        abilityValues[0][1] = "3";
        
        vm.expectEmit(true, false, false, true);
        emit CardAdded(0, "Test Card", CardRegistry.CardType.Chain);
        
        uint256 cardId = registry.addCard(
            "Test Card",
            "A test card description",
            5,
            CardRegistry.CardType.Chain,
            abilityNames,
            abilityKeys,
            abilityValues
        );
        
        assertEq(cardId, 0);
        assertEq(registry.getCardCount(), 1);
        
        CardRegistry.Card memory card = registry.getCard(0);
        assertEq(card.name, "Test Card");
        assertEq(card.description, "A test card description");
        assertEq(card.cost, 5);
        assertEq(uint(card.cardType), uint(CardRegistry.CardType.Chain));
        assertEq(card.abilities.length, 1);
        assertEq(card.abilities[0].name, "testAbility");
        assertEq(card.abilities[0].options.length, 2);
    }

    function testAddCardSimple() public {
        vm.expectEmit(true, false, false, true);
        emit CardAdded(0, "Simple Card", CardRegistry.CardType.DeFi);
        
        uint256 cardId = registry.addCardSimple(
            "Simple Card",
            "A simple card with no abilities",
            3,
            CardRegistry.CardType.DeFi
        );
        
        assertEq(cardId, 0);
        assertEq(registry.getCardCount(), 1);
        
        CardRegistry.Card memory card = registry.getCard(0);
        assertEq(card.name, "Simple Card");
        assertEq(card.abilities.length, 0);
    }

    function testGetCardByName() public {
        registry.addCardSimple(
            "Unique Card",
            "A unique card",
            7,
            CardRegistry.CardType.EOA
        );
        
        CardRegistry.Card memory card = registry.getCardByName("Unique Card");
        assertEq(card.name, "Unique Card");
        assertEq(card.cost, 7);
        assertEq(uint(card.cardType), uint(CardRegistry.CardType.EOA));
    }

    function testCannotAddDuplicateCardName() public {
        registry.addCardSimple(
            "Duplicate Name",
            "First card",
            1,
            CardRegistry.CardType.Chain
        );
        
        vm.expectRevert(CardRegistry.DuplicateCardName.selector);
        registry.addCardSimple(
            "Duplicate Name",
            "Second card",
            2,
            CardRegistry.CardType.DeFi
        );
    }

    function testOnlyOwnerCanAddCards() public {
        vm.prank(user);
        vm.expectRevert(CardRegistry.NotOwner.selector);
        registry.addCardSimple(
            "Unauthorized Card",
            "Should fail",
            1,
            CardRegistry.CardType.Chain
        );
    }

    function testMarkInitialized() public {
        assertEq(registry.initialized(), false);
        
        registry.markInitialized();
        
        assertEq(registry.initialized(), true);
    }

    function testOnlyOwnerCanMarkInitialized() public {
        vm.prank(user);
        vm.expectRevert(CardRegistry.NotOwner.selector);
        registry.markInitialized();
    }

    function testGetAllCards() public {
        registry.addCardSimple("Card A", "Desc A", 1, CardRegistry.CardType.Chain);
        registry.addCardSimple("Card B", "Desc B", 2, CardRegistry.CardType.DeFi);
        registry.addCardSimple("Card C", "Desc C", 3, CardRegistry.CardType.Action);
        
        CardRegistry.Card[] memory allCards = registry.getAllCards();
        
        assertEq(allCards.length, 3);
        assertEq(allCards[0].name, "Card A");
        assertEq(allCards[1].name, "Card B");
        assertEq(allCards[2].name, "Card C");
    }

    function testGetCardAbilities() public {
        string[] memory abilityNames = new string[](2);
        abilityNames[0] = "ability1";
        abilityNames[1] = "ability2";
        
        string[][] memory abilityKeys = new string[][](2);
        abilityKeys[0] = new string[](1);
        abilityKeys[0][0] = "strength";
        abilityKeys[1] = new string[](1);
        abilityKeys[1][0] = "speed";
        
        string[][] memory abilityValues = new string[][](2);
        abilityValues[0] = new string[](1);
        abilityValues[0][0] = "100";
        abilityValues[1] = new string[](1);
        abilityValues[1][0] = "50";
        
        registry.addCard(
            "Multi Ability Card",
            "Card with multiple abilities",
            4,
            CardRegistry.CardType.Action,
            abilityNames,
            abilityKeys,
            abilityValues
        );
        
        CardRegistry.Ability[] memory abilities = registry.getCardAbilities(0);
        assertEq(abilities.length, 2);
        assertEq(abilities[0].name, "ability1");
        assertEq(abilities[1].name, "ability2");
    }

    function testGetCardTypes() public view {
        string[] memory types = registry.getCardTypes();
        
        assertEq(types.length, 4);
        assertEq(types[0], "Chain");
        assertEq(types[1], "DeFi");
        assertEq(types[2], "EOA");
        assertEq(types[3], "Action");
    }

    function testGetCardNotFound() public {
        vm.expectRevert(CardRegistry.CardNotFound.selector);
        registry.getCard(999);
    }

    function testGetCardByNameNotFound() public {
        vm.expectRevert(CardRegistry.CardNotFound.selector);
        registry.getCardByName("Nonexistent Card");
    }
}
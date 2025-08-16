// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CardRegistry.sol";

contract DeckRegistry {
    struct CardCount {
        uint256 cardId;
        uint256 count;
    }
    
    struct Deck {
        uint256 id;
        string name;
        string description;
        CardCount[] cards;
        uint256 totalCards;
    }
    
    Deck[] public decks;
    mapping(uint256 => Deck) public deckById;
    mapping(string => uint256) public deckIdByName;
    uint256 public nextDeckId;
    
    CardRegistry public cardRegistry;
    address public owner;
    bool public initialized;
    
    event DeckAdded(uint256 indexed deckId, string name, uint256 totalCards);
    event DecksInitialized(uint256 count);
    
    error NotOwner();
    error DeckNotFound();
    error DuplicateDeckName();
    error CardRegistryNotSet();
    error InvalidCardName();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    constructor(address _cardRegistry) {
        owner = msg.sender;
        cardRegistry = CardRegistry(_cardRegistry);
    }
    
    function addDeck(
        string memory _name,
        string memory _description,
        string[] memory _cardNames,
        uint256[] memory _cardCounts
    ) public onlyOwner returns (uint256) {
        require(_cardNames.length == _cardCounts.length, "Array lengths mismatch");
        
        // Check for duplicate deck name
        if (decks.length > 0 && deckIdByName[_name] != 0) revert DuplicateDeckName();
        if (decks.length > 0 && keccak256(bytes(decks[0].name)) == keccak256(bytes(_name))) {
            revert DuplicateDeckName();
        }
        
        uint256 deckId = nextDeckId++;
        
        // Create new deck in storage
        decks.push();
        Deck storage newDeck = decks[deckId];
        
        newDeck.id = deckId;
        newDeck.name = _name;
        newDeck.description = _description;
        newDeck.totalCards = 0;
        
        // Add cards to deck
        for (uint256 i = 0; i < _cardNames.length; i++) {
            // Get card ID from name using CardRegistry
            CardRegistry.Card memory card = cardRegistry.getCardByName(_cardNames[i]);
            
            newDeck.cards.push(CardCount({
                cardId: card.id,
                count: _cardCounts[i]
            }));
            
            newDeck.totalCards += _cardCounts[i];
        }
        
        deckById[deckId] = newDeck;
        deckIdByName[_name] = deckId + 1; // Store deckId + 1 to differentiate from "not found"
        
        emit DeckAdded(deckId, _name, newDeck.totalCards);
        
        return deckId;
    }
    
    function getDeck(uint256 _deckId) external view returns (Deck memory) {
        if (_deckId >= decks.length) revert DeckNotFound();
        return decks[_deckId];
    }
    
    function getDeckByName(string memory _name) external view returns (Deck memory) {
        uint256 storedId = deckIdByName[_name];
        if (storedId == 0) {
            revert DeckNotFound();
        }
        return decks[storedId - 1];
    }
    
    function getAllDecks() external view returns (Deck[] memory) {
        return decks;
    }
    
    function getDeckCount() external view returns (uint256) {
        return decks.length;
    }
    
    function expandDeck(uint256 _deckId) external view returns (uint256[] memory) {
        if (_deckId >= decks.length) revert DeckNotFound();
        
        Deck storage deck = decks[_deckId];
        uint256[] memory expandedDeck = new uint256[](deck.totalCards);
        uint256 index = 0;
        
        // Expand the deck by repeating each card according to its count
        for (uint256 i = 0; i < deck.cards.length; i++) {
            uint256 cardId = deck.cards[i].cardId;
            uint256 count = deck.cards[i].count;
            
            for (uint256 j = 0; j < count; j++) {
                expandedDeck[index++] = cardId;
            }
        }
        
        return expandedDeck;
    }
    
    function markInitialized() external onlyOwner {
        initialized = true;
    }
}
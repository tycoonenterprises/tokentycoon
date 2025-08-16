// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CardRegistry {
    enum CardType {
        Chain,
        DeFi,
        EOA,
        Action
    }

    struct AbilityOption {
        string key;
        string value;
    }

    struct Ability {
        string name;
        AbilityOption[] options;
    }

    struct Card {
        uint256 id;
        string name;
        string description;
        uint256 cost;
        CardType cardType;
        Ability[] abilities;
    }

    Card[] public cards;
    mapping(uint256 => Card) public cardById;
    mapping(string => uint256) public cardIdByName;
    uint256 public nextCardId;

    address public owner;
    bool public initialized;

    event CardAdded(uint256 indexed cardId, string name, CardType cardType);
    event CardsInitialized(uint256 count);

    error NotOwner();
    error AlreadyInitialized();
    error CardNotFound();
    error DuplicateCardName();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCard(
        string memory _name,
        string memory _description,
        uint256 _cost,
        CardType _cardType,
        string[] memory _abilityNames,
        string[][] memory _abilityKeys,
        string[][] memory _abilityValues
    ) public onlyOwner returns (uint256) {
        // Check for duplicate, but handle the case where this is the first card (id 0)
        if (cards.length > 0 && cardIdByName[_name] != 0) revert DuplicateCardName();
        if (cards.length == 0 && bytes(_name).length > 0 && cardIdByName[_name] != 0) revert DuplicateCardName();
        
        // For non-first cards, check if name already exists at index 0
        if (cards.length > 0 && keccak256(bytes(cards[0].name)) == keccak256(bytes(_name))) {
            revert DuplicateCardName();
        }
        
        uint256 cardId = nextCardId++;
        
        // Create new card in storage first
        cards.push();
        Card storage newCard = cards[cardId];
        
        newCard.id = cardId;
        newCard.name = _name;
        newCard.description = _description;
        newCard.cost = _cost;
        newCard.cardType = _cardType;
        
        // Add abilities
        for (uint256 i = 0; i < _abilityNames.length; i++) {
            Ability storage ability = newCard.abilities.push();
            ability.name = _abilityNames[i];
            
            // Add options for this ability
            for (uint256 j = 0; j < _abilityKeys[i].length; j++) {
                ability.options.push(AbilityOption({
                    key: _abilityKeys[i][j],
                    value: _abilityValues[i][j]
                }));
            }
        }
        
        cardById[cardId] = newCard;
        
        // Store cardId + 1 to differentiate between "not found" (0) and card at index 0
        cardIdByName[_name] = cardId + 1;
        
        emit CardAdded(cardId, _name, _cardType);
        
        return cardId;
    }

    function addCardSimple(
        string memory _name,
        string memory _description,
        uint256 _cost,
        CardType _cardType
    ) external onlyOwner returns (uint256) {
        string[] memory emptyAbilityNames = new string[](0);
        string[][] memory emptyAbilityKeys = new string[][](0);
        string[][] memory emptyAbilityValues = new string[][](0);
        
        return addCard(
            _name,
            _description,
            _cost,
            _cardType,
            emptyAbilityNames,
            emptyAbilityKeys,
            emptyAbilityValues
        );
    }

    function markInitialized() external onlyOwner {
        initialized = true;
    }

    function getCard(uint256 _cardId) external view returns (Card memory) {
        if (_cardId >= cards.length) revert CardNotFound();
        return cards[_cardId];
    }

    function getCardByName(string memory _name) external view returns (Card memory) {
        uint256 storedId = cardIdByName[_name];
        if (storedId == 0) {
            revert CardNotFound();
        }
        // Subtract 1 to get the actual card ID since we store cardId + 1
        return cards[storedId - 1];
    }

    function getAllCards() external view returns (Card[] memory) {
        return cards;
    }

    function getCardCount() external view returns (uint256) {
        return cards.length;
    }

    function getCardAbilities(uint256 _cardId) external view returns (Ability[] memory) {
        if (_cardId >= cards.length) revert CardNotFound();
        return cards[_cardId].abilities;
    }

    function getCardTypes() external pure returns (string[] memory) {
        string[] memory types = new string[](4);
        types[0] = "Chain";
        types[1] = "DeFi";
        types[2] = "EOA";
        types[3] = "Action";
        return types;
    }
}
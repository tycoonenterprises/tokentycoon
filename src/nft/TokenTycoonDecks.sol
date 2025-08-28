// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {SSTORE2} from "./libraries/SSTORE2.sol";
import {Base64} from "./libraries/Base64.sol";
import {TokenTycoonCards} from "./TokenTycoonCards.sol";

/**
 * @title TokenTycoonDecks
 * @notice ERC1155 NFT contract for 60-card deck NFTs
 * @dev Supports sealed decks that can be cracked to receive cards
 */
contract TokenTycoonDecks is ERC1155, AccessControl, ERC2981 {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Constants
    uint256 public constant DECK_SIZE = 60;
    uint256 public constant ROYALTY_BPS = 250; // 2.5%
    
    // Card composition
    struct CardCount {
        uint256 cardId;
        uint256 quantity;
    }
    
    // Deck metadata
    struct DeckMetadata {
        string name;
        string description;
        string strategy;
        address svgPointer;          // SSTORE2 pointer to deck artwork
        CardCount[] composition;     // Array of cards in deck
        uint256 maxSupply;          // 0 for unlimited
        uint256 totalMinted;
        bool isPreconstructed;      // Official vs custom
        bool isSealed;              // Can be traded as sealed
        bool finalized;             // Metadata locked
    }
    
    // Sealed deck tracking
    struct SealedDeck {
        uint256 deckId;
        bool isSealed;
        address owner;
    }
    
    // State variables
    TokenTycoonCards public immutable cardsContract;
    mapping(uint256 => DeckMetadata) public deckMetadata;
    mapping(uint256 => SealedDeck) public sealedDecks; // tokenId => sealed status
    uint256 public nextDeckId = 1;
    uint256 public nextTokenId = 1;
    
    // Events
    event DeckMetadataSet(uint256 indexed deckId, string name);
    event DeckFinalized(uint256 indexed deckId);
    event DeckMinted(address indexed to, uint256 indexed deckId, uint256 tokenId, bool isSealed);
    event DeckCracked(address indexed owner, uint256 indexed tokenId, uint256 deckId);
    
    // Errors
    error DeckNotFound();
    error DeckIsFinalized();
    error InvalidDeckSize();
    error ExceedsMaxSupply();
    error NotSealed();
    error NotOwner();
    error CardsContractNotSet();
    
    constructor(address _cardsContract) ERC1155("") {
        if (_cardsContract == address(0)) revert CardsContractNotSet();
        
        cardsContract = TokenTycoonCards(_cardsContract);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Set default royalty
        _setDefaultRoyalty(msg.sender, uint96(ROYALTY_BPS));
    }
    
    /**
     * @notice Set deck metadata (admin only)
     * @param deckId The deck ID
     * @param name Deck name
     * @param description Deck description
     * @param strategy Deck strategy guide
     * @param composition Array of CardCount structs
     * @param svgData Deck artwork
     * @param maxSupply Maximum supply (0 for unlimited)
     * @param isPreconstructed Whether this is an official deck
     */
    function setDeckMetadata(
        uint256 deckId,
        string memory name,
        string memory description,
        string memory strategy,
        CardCount[] memory composition,
        bytes memory svgData,
        uint256 maxSupply,
        bool isPreconstructed
    ) external onlyRole(ADMIN_ROLE) {
        DeckMetadata storage deck = deckMetadata[deckId];
        if (deck.finalized) revert DeckIsFinalized();
        
        // Validate deck size
        uint256 totalCards = 0;
        for (uint i = 0; i < composition.length; i++) {
            totalCards += composition[i].quantity;
        }
        if (totalCards != DECK_SIZE) revert InvalidDeckSize();
        
        // Store SVG using SSTORE2
        address svgPointer = SSTORE2.write(svgData);
        
        // Clear and set composition
        delete deck.composition;
        deck.name = name;
        deck.description = description;
        deck.strategy = strategy;
        deck.svgPointer = svgPointer;
        deck.maxSupply = maxSupply;
        deck.totalMinted = 0;
        deck.isPreconstructed = isPreconstructed;
        deck.isSealed = true; // All decks start as sealable
        deck.finalized = false;
        
        // Copy composition
        for (uint i = 0; i < composition.length; i++) {
            deck.composition.push(composition[i]);
        }
        
        emit DeckMetadataSet(deckId, name);
    }
    
    /**
     * @notice Finalize deck metadata
     * @param deckId The deck ID
     */
    function finalizeDeck(uint256 deckId) external onlyRole(ADMIN_ROLE) {
        if (deckMetadata[deckId].svgPointer == address(0)) revert DeckNotFound();
        deckMetadata[deckId].finalized = true;
        emit DeckFinalized(deckId);
    }
    
    /**
     * @notice Mint a sealed deck NFT
     * @param to Recipient address
     * @param deckId Deck ID to mint
     * @param isSealedDeck Whether to mint as sealed (tradeable) or opened
     * @return tokenId The minted token ID
     */
    function mintDeck(
        address to,
        uint256 deckId,
        bool isSealedDeck
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        DeckMetadata storage deck = deckMetadata[deckId];
        if (deck.svgPointer == address(0)) revert DeckNotFound();
        
        if (deck.maxSupply > 0) {
            if (deck.totalMinted >= deck.maxSupply) {
                revert ExceedsMaxSupply();
            }
        }
        
        uint256 tokenId = nextTokenId++;
        deck.totalMinted++;
        
        // Mint the deck NFT
        _mint(to, tokenId, 1, "");
        
        // Track sealed status
        if (isSealedDeck) {
            sealedDecks[tokenId] = SealedDeck({
                deckId: deckId,
                isSealed: true,
                owner: to
            });
        } else {
            // If not sealed, immediately mint the cards
            _mintCardsFromDeck(to, deckId);
        }
        
        emit DeckMinted(to, deckId, tokenId, isSealedDeck);
        return tokenId;
    }
    
    /**
     * @notice Crack a sealed deck to receive the cards
     * @param tokenId The sealed deck token ID
     */
    function crackDeck(uint256 tokenId) external {
        SealedDeck storage deck = sealedDecks[tokenId];
        
        if (!deck.isSealed) revert NotSealed();
        if (balanceOf(msg.sender, tokenId) == 0) revert NotOwner();
        
        uint256 deckId = deck.deckId;
        
        // Mark as cracked
        deck.isSealed = false;
        
        // Burn the deck NFT
        _burn(msg.sender, tokenId, 1);
        
        // Mint the cards to the owner
        _mintCardsFromDeck(msg.sender, deckId);
        
        emit DeckCracked(msg.sender, tokenId, deckId);
    }
    
    /**
     * @notice Internal function to mint cards from a deck composition
     * @param to Recipient address
     * @param deckId Deck ID
     */
    function _mintCardsFromDeck(address to, uint256 deckId) internal {
        DeckMetadata storage deck = deckMetadata[deckId];
        
        uint256[] memory cardIds = new uint256[](deck.composition.length);
        uint256[] memory amounts = new uint256[](deck.composition.length);
        
        for (uint i = 0; i < deck.composition.length; i++) {
            cardIds[i] = deck.composition[i].cardId;
            amounts[i] = deck.composition[i].quantity;
        }
        
        // Mint cards through the cards contract
        cardsContract.mintBatchCards(to, cardIds, amounts);
    }
    
    /**
     * @notice Get deck composition
     * @param deckId The deck ID
     * @return Array of CardCount structs
     */
    function getDeckComposition(uint256 deckId) external view returns (CardCount[] memory) {
        return deckMetadata[deckId].composition;
    }
    
    /**
     * @notice Check if a token is a sealed deck
     * @param tokenId The token ID
     * @return Whether the deck is sealed
     */
    function isSealed(uint256 tokenId) external view returns (bool) {
        return sealedDecks[tokenId].isSealed;
    }
    
    /**
     * @notice Generate URI for a deck
     * @param tokenId The token ID
     * @return Data URI with base64 encoded JSON
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        SealedDeck memory deckInfo = sealedDecks[tokenId];
        DeckMetadata memory deck = deckMetadata[deckInfo.deckId];
        
        if (deck.svgPointer == address(0)) revert DeckNotFound();
        
        // Read SVG from pointer
        bytes memory svgData = SSTORE2.read(deck.svgPointer);
        string memory svgBase64 = Base64.encode(svgData);
        
        // Build composition JSON
        string memory compositionJson = "[";
        for (uint i = 0; i < deck.composition.length; i++) {
            if (i > 0) compositionJson = string.concat(compositionJson, ",");
            compositionJson = string.concat(
                compositionJson,
                '{"cardId":', _toString(deck.composition[i].cardId),
                ',"quantity":', _toString(deck.composition[i].quantity), '}'
            );
        }
        compositionJson = string.concat(compositionJson, "]");
        
        // Build complete JSON metadata
        string memory json = string.concat(
            '{"name":"', deck.name,
            deckInfo.isSealed ? ' (Sealed)' : ' (Opened)',
            '","description":"', deck.description,
            '","image":"data:image/svg+xml;base64,', svgBase64,
            '","attributes":[',
                '{"trait_type":"Strategy","value":"', deck.strategy, '"},',
                '{"trait_type":"Type","value":"', deck.isPreconstructed ? 'Preconstructed' : 'Custom', '"},',
                '{"trait_type":"Sealed","value":"', deckInfo.isSealed ? 'Yes' : 'No', '"},',
                '{"trait_type":"Cards","value":', _toString(DECK_SIZE), '}',
            '],',
            '"composition":', compositionJson,
            '}'
        );
        
        // Return data URI
        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }
    
    // Helper function
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @notice Check interface support
     */
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
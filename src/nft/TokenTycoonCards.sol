// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {SSTORE2} from "./libraries/SSTORE2.sol";
import {Base64} from "./libraries/Base64.sol";

/**
 * @title TokenTycoonCards
 * @notice ERC1155 NFT contract for Token Tycoon trading cards
 * @dev Uses SSTORE2 for efficient onchain storage of metadata and artwork
 */
contract TokenTycoonCards is ERC1155, AccessControl, ERC2981 {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    
    // Card types matching game mechanics
    enum CardType {
        Chain,
        DeFi,
        EOA,
        Action
    }
    
    // Card metadata structure
    struct CardMetadata {
        string name;
        string description;
        uint256 cost;
        CardType cardType;
        address svgPointer;      // SSTORE2 pointer to SVG data
        address jsonPointer;     // SSTORE2 pointer to JSON metadata
        bytes32 contentHash;     // Hash of combined data for verification
        uint256 maxSupply;       // 0 for unlimited
        uint256 totalMinted;
        bool tradeable;
        bool finalized;          // Once true, metadata is immutable
    }
    
    // Ability structure for cards
    struct Ability {
        string abilityType;      // "income", "yield", "draw", etc.
        uint256 amount;
    }
    
    // State variables
    mapping(uint256 => CardMetadata) public cardMetadata;
    mapping(uint256 => Ability[]) public cardAbilities;
    mapping(address => mapping(uint256 => bool)) public lockedCards;
    
    uint256 public nextCardId = 1;
    uint256 public constant ROYALTY_BPS = 250; // 2.5%
    
    // Events
    event CardMetadataSet(uint256 indexed cardId, string name);
    event CardMetadataFinalized(uint256 indexed cardId);
    event CardMinted(address indexed to, uint256 indexed cardId, uint256 amount);
    event CardsBatchLocked(address indexed owner, uint256[] cardIds, uint256[] amounts);
    event CardsUnlocked(address indexed owner, uint256[] cardIds, uint256[] amounts);
    
    // Errors
    error CardNotFound();
    error CardIsFinalized();
    error ExceedsMaxSupply();
    error NotTradeable();
    error CardIsLocked();
    error InvalidMetadata();
    error InsufficientBalance();
    
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Set default royalty
        _setDefaultRoyalty(msg.sender, uint96(ROYALTY_BPS));
    }
    
    /**
     * @notice Set metadata for a card (admin only, before finalization)
     * @param cardId The card ID
     * @param name Card name
     * @param description Card description
     * @param cost ETH cost to play
     * @param cardType Type of card
     * @param svgData SVG image data
     * @param maxSupply Maximum supply (0 for unlimited)
     */
    function setCardMetadata(
        uint256 cardId,
        string memory name,
        string memory description,
        uint256 cost,
        CardType cardType,
        bytes memory svgData,
        uint256 maxSupply
    ) external onlyRole(ADMIN_ROLE) {
        if (cardMetadata[cardId].finalized) revert CardIsFinalized();
        
        // Store SVG using SSTORE2
        address svgPointer = SSTORE2.write(svgData);
        
        // Create JSON metadata
        bytes memory jsonData = abi.encodePacked(
            '{"name":"', name,
            '","description":"', description,
            '","cost":', _toString(cost),
            ',"cardType":"', _cardTypeToString(cardType),
            '"}'
        );
        address jsonPointer = SSTORE2.write(jsonData);
        
        // Calculate content hash
        bytes32 contentHash = keccak256(abi.encodePacked(svgData, jsonData));
        
        cardMetadata[cardId] = CardMetadata({
            name: name,
            description: description,
            cost: cost,
            cardType: cardType,
            svgPointer: svgPointer,
            jsonPointer: jsonPointer,
            contentHash: contentHash,
            maxSupply: maxSupply,
            totalMinted: 0,
            tradeable: true,
            finalized: false
        });
        
        emit CardMetadataSet(cardId, name);
    }
    
    /**
     * @notice Set abilities for a card
     * @param cardId The card ID
     * @param abilities Array of abilities
     */
    function setCardAbilities(
        uint256 cardId,
        Ability[] memory abilities
    ) external onlyRole(ADMIN_ROLE) {
        if (cardMetadata[cardId].finalized) revert CardIsFinalized();
        
        delete cardAbilities[cardId];
        for (uint i = 0; i < abilities.length; i++) {
            cardAbilities[cardId].push(abilities[i]);
        }
    }
    
    /**
     * @notice Finalize card metadata, making it immutable
     * @param cardId The card ID to finalize
     */
    function finalizeMetadata(uint256 cardId) external onlyRole(ADMIN_ROLE) {
        if (cardMetadata[cardId].svgPointer == address(0)) revert CardNotFound();
        cardMetadata[cardId].finalized = true;
        emit CardMetadataFinalized(cardId);
    }
    
    /**
     * @notice Mint cards to an address
     * @param to Recipient address
     * @param cardId Card ID to mint
     * @param amount Number of cards to mint
     */
    function mintCard(
        address to,
        uint256 cardId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        CardMetadata storage metadata = cardMetadata[cardId];
        if (metadata.svgPointer == address(0)) revert CardNotFound();
        
        if (metadata.maxSupply > 0) {
            if (metadata.totalMinted + amount > metadata.maxSupply) {
                revert ExceedsMaxSupply();
            }
        }
        
        metadata.totalMinted += amount;
        _mint(to, cardId, amount, "");
        
        emit CardMinted(to, cardId, amount);
    }
    
    /**
     * @notice Mint multiple cards in batch
     * @param to Recipient address
     * @param cardIds Array of card IDs
     * @param amounts Array of amounts
     */
    function mintBatchCards(
        address to,
        uint256[] memory cardIds,
        uint256[] memory amounts
    ) external onlyRole(MINTER_ROLE) {
        for (uint i = 0; i < cardIds.length; i++) {
            CardMetadata storage metadata = cardMetadata[cardIds[i]];
            if (metadata.svgPointer == address(0)) revert CardNotFound();
            
            if (metadata.maxSupply > 0) {
                if (metadata.totalMinted + amounts[i] > metadata.maxSupply) {
                    revert ExceedsMaxSupply();
                }
            }
            
            metadata.totalMinted += amounts[i];
        }
        
        _mintBatch(to, cardIds, amounts, "");
        
        for (uint i = 0; i < cardIds.length; i++) {
            emit CardMinted(to, cardIds[i], amounts[i]);
        }
    }
    
    /**
     * @notice Lock cards during gameplay
     * @param owner Card owner
     * @param cardIds Cards to lock
     * @param amounts Amounts to lock
     */
    function lockCards(
        address owner,
        uint256[] memory cardIds,
        uint256[] memory amounts
    ) external onlyRole(GAME_ROLE) {
        for (uint i = 0; i < cardIds.length; i++) {
            if (balanceOf(owner, cardIds[i]) < amounts[i]) revert InsufficientBalance();
            lockedCards[owner][cardIds[i]] = true;
        }
        emit CardsBatchLocked(owner, cardIds, amounts);
    }
    
    /**
     * @notice Unlock cards after gameplay
     * @param owner Card owner
     * @param cardIds Cards to unlock
     * @param amounts Amounts to unlock
     */
    function unlockCards(
        address owner,
        uint256[] memory cardIds,
        uint256[] memory amounts
    ) external onlyRole(GAME_ROLE) {
        for (uint i = 0; i < cardIds.length; i++) {
            lockedCards[owner][cardIds[i]] = false;
        }
        emit CardsUnlocked(owner, cardIds, amounts);
    }
    
    /**
     * @notice Generate URI for a card
     * @param tokenId The card ID
     * @return Data URI with base64 encoded JSON and SVG
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        CardMetadata memory metadata = cardMetadata[tokenId];
        // Check if card exists (either by having a name or being finalized)
        if (bytes(metadata.name).length == 0 && !metadata.finalized) revert CardNotFound();
        
        // Read SVG from pointer (handle empty pointers gracefully)
        bytes memory svgData;
        string memory svgBase64;
        
        if (metadata.svgPointer != address(0)) {
            // Try to read SVG data safely
            try this.readSVGSafely(metadata.svgPointer) returns (bytes memory data) {
                if (data.length > 0) {
                    svgData = data;
                    svgBase64 = Base64.encode(svgData);
                } else {
                    // Empty data, use placeholder
                    svgData = _createPlaceholderSVG(metadata.name);
                    svgBase64 = Base64.encode(svgData);
                }
            } catch {
                // Failed to read, use placeholder
                svgData = _createPlaceholderSVG(metadata.name);
                svgBase64 = Base64.encode(svgData);
            }
        } else {
            // No SVG pointer, create placeholder
            svgData = _createPlaceholderSVG(metadata.name);
            svgBase64 = Base64.encode(svgData);
        }
        
        // Build abilities JSON array
        string memory abilitiesJson = "[";
        Ability[] memory abilities = cardAbilities[tokenId];
        for (uint i = 0; i < abilities.length; i++) {
            if (i > 0) abilitiesJson = string.concat(abilitiesJson, ",");
            abilitiesJson = string.concat(
                abilitiesJson,
                '{"type":"', abilities[i].abilityType,
                '","amount":', _toString(abilities[i].amount), '}'
            );
        }
        abilitiesJson = string.concat(abilitiesJson, "]");
        
        // Build complete JSON metadata
        string memory json = string.concat(
            '{"name":"', metadata.name,
            '","description":"', metadata.description,
            '","image":"data:image/svg+xml;base64,', svgBase64,
            '","attributes":[',
                '{"trait_type":"Cost","value":', _toString(metadata.cost), '},',
                '{"trait_type":"Type","value":"', _cardTypeToString(metadata.cardType), '"},',
                '{"trait_type":"Total Minted","value":', _toString(metadata.totalMinted), '}',
            '],',
            '"abilities":', abilitiesJson,
            '}'
        );
        
        // Return data URI
        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }

    /**
     * @notice Safely read SVG data from SSTORE2 pointer
     * @param pointer The SSTORE2 pointer address
     * @return The SVG data
     */
    function readSVGSafely(address pointer) external view returns (bytes memory) {
        return SSTORE2.read(pointer);
    }

    /**
     * @notice Create a placeholder SVG for cards without artwork
     * @param name The card name to display
     * @return SVG data as bytes
     */
    function _createPlaceholderSVG(string memory name) internal pure returns (bytes memory) {
        return abi.encodePacked(
            '<svg width="375" height="525" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#2D1100;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#3D1A3D;stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="100%" height="100%" fill="url(#bg)" rx="15" ry="15"/>',
            '<rect x="12" y="12" width="351" height="501" fill="none" stroke="#FFA500" stroke-width="4" rx="10" ry="10"/>',
            '<rect x="25" y="200" width="325" height="125" fill="#000814" rx="12" ry="12"/>',
            '<text x="187.5" y="270" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">',
            name,
            '</text>',
            '<text x="187.5" y="300" font-family="Arial, sans-serif" font-size="14" fill="#FFA500" text-anchor="middle">',
            'Token Tycoon Card',
            '</text>',
            '</svg>'
        );
    }
    
    /**
     * @notice Check if transfer is allowed (prevent transfer of locked cards)
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        // Check if cards are locked
        if (from != address(0)) {
            for (uint i = 0; i < ids.length; i++) {
                if (lockedCards[from][ids[i]]) revert CardIsLocked();
                if (!cardMetadata[ids[i]].tradeable) revert NotTradeable();
            }
        }
        
        super._update(from, to, ids, values);
    }
    
    /**
     * @notice Get card metadata
     * @param cardId The card ID
     * @return The card metadata
     */
    function getCardMetadata(uint256 cardId) external view returns (CardMetadata memory) {
        return cardMetadata[cardId];
    }
    
    /**
     * @notice Get card abilities
     * @param cardId The card ID
     * @return The card abilities
     */
    function getCardAbilities(uint256 cardId) external view returns (Ability[] memory) {
        return cardAbilities[cardId];
    }
    
    // Helper functions
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
    
    function _cardTypeToString(CardType cardType) internal pure returns (string memory) {
        if (cardType == CardType.Chain) return "Chain";
        if (cardType == CardType.DeFi) return "DeFi";
        if (cardType == CardType.EOA) return "EOA";
        if (cardType == CardType.Action) return "Action";
        return "";
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
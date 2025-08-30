// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SSTORE2} from "./libraries/SSTORE2.sol";
import {Base64} from "./libraries/Base64.sol";
import {TokenTycoonCards} from "./TokenTycoonCards.sol";

/**
 * @title TokenTycoonPacks
 * @notice ERC1155 NFT contract for randomized card packs
 * @dev Uses deterministic randomness for pack opening
 */
contract TokenTycoonPacks is ERC1155, AccessControl, ERC2981, ReentrancyGuard {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Constants
    uint256 public constant ROYALTY_BPS = 250; // 2.5%
    
    // Pack types
    enum PackType {
        Common,      // 5 common cards
        Rare,        // 3 common, 2 rare cards
        Legendary    // 2 common, 2 rare, 1 legendary
    }
    
    // Pack metadata
    struct PackMetadata {
        string name;
        PackType packType;
        uint256 cardCount;
        uint256 priceWei;
        uint256 maxSupply;
        uint256 totalMinted;
        uint256 totalOpened;
        address svgPointer;      // SSTORE2 pointer to pack art
        bool finalized;
    }
    
    // Card rarity weights for pack distribution
    struct RarityWeight {
        uint256 cardId;
        uint256 weight;          // Higher weight = more likely
        uint256 rarity;          // 0=common, 1=rare, 2=legendary
    }
    
    // State variables
    TokenTycoonCards public immutable cardsContract;
    mapping(uint256 => PackMetadata) public packMetadata;
    mapping(uint256 => RarityWeight[]) public packDistribution; // packId => possible cards
    mapping(uint256 => uint256[]) public packContents;          // tokenId => opened card IDs
    
    uint256 public nextPackId = 1;
    uint256 public nextTokenId = 1;
    
    // Randomness seed (can be improved with Chainlink VRF)
    uint256 private nonce;
    
    // Events
    event PackMetadataSet(uint256 indexed packId, string name);
    event PackFinalized(uint256 indexed packId);
    event PackPurchased(address indexed buyer, uint256 indexed packId, uint256 tokenId, uint256 price);
    event PackOpened(address indexed opener, uint256 indexed tokenId, uint256[] cardIds);
    event DistributionSet(uint256 indexed packId, uint256 totalCards);
    
    // Errors
    error PackNotFound();
    error PackIsFinalized();
    error InsufficientPayment();
    error ExceedsMaxSupply();
    error PackAlreadyOpened();
    error NotOwner();
    error NoCardsInDistribution();
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
     * @notice Set pack metadata (admin only)
     * @param packId The pack ID
     * @param name Pack name
     * @param packType Type of pack (Common, Rare, Legendary)
     * @param cardCount Number of cards in pack
     * @param priceWei Price in wei
     * @param maxSupply Maximum supply (0 for unlimited)
     * @param svgData Pack artwork
     */
    function setPackMetadata(
        uint256 packId,
        string memory name,
        PackType packType,
        uint256 cardCount,
        uint256 priceWei,
        uint256 maxSupply,
        bytes memory svgData
    ) external onlyRole(ADMIN_ROLE) {
        if (packMetadata[packId].finalized) revert PackIsFinalized();
        
        address svgPointer = SSTORE2.write(svgData);
        
        packMetadata[packId] = PackMetadata({
            name: name,
            packType: packType,
            cardCount: cardCount,
            priceWei: priceWei,
            maxSupply: maxSupply,
            totalMinted: 0,
            totalOpened: 0,
            svgPointer: svgPointer,
            finalized: false
        });
        
        emit PackMetadataSet(packId, name);
    }
    
    /**
     * @notice Set card distribution for a pack type
     * @param packId The pack ID
     * @param cards Array of possible cards with weights
     */
    function setPackDistribution(
        uint256 packId,
        RarityWeight[] memory cards
    ) external onlyRole(ADMIN_ROLE) {
        if (packMetadata[packId].finalized) revert PackIsFinalized();
        
        delete packDistribution[packId];
        for (uint i = 0; i < cards.length; i++) {
            packDistribution[packId].push(cards[i]);
        }
        
        emit DistributionSet(packId, cards.length);
    }
    
    /**
     * @notice Finalize pack metadata
     * @param packId The pack ID
     */
    function finalizePack(uint256 packId) external onlyRole(ADMIN_ROLE) {
        if (packMetadata[packId].svgPointer == address(0)) revert PackNotFound();
        packMetadata[packId].finalized = true;
        emit PackFinalized(packId);
    }
    
    /**
     * @notice Purchase a pack with ETH
     * @param packId The pack ID to purchase
     * @return tokenId The minted pack token ID
     */
    function purchasePack(uint256 packId) external payable nonReentrant returns (uint256) {
        PackMetadata storage pack = packMetadata[packId];
        if (pack.svgPointer == address(0)) revert PackNotFound();
        if (msg.value < pack.priceWei) revert InsufficientPayment();
        
        if (pack.maxSupply > 0) {
            if (pack.totalMinted >= pack.maxSupply) revert ExceedsMaxSupply();
        }
        
        uint256 tokenId = nextTokenId++;
        pack.totalMinted++;
        
        // Mint pack NFT
        _mint(msg.sender, tokenId, 1, "");
        
        emit PackPurchased(msg.sender, packId, tokenId, msg.value);
        return tokenId;
    }
    
    /**
     * @notice Admin mint packs (for rewards, etc.)
     * @param to Recipient address
     * @param packId Pack ID to mint
     * @return tokenId The minted pack token ID
     */
    function mintPack(address to, uint256 packId) external onlyRole(MINTER_ROLE) returns (uint256) {
        PackMetadata storage pack = packMetadata[packId];
        if (pack.svgPointer == address(0)) revert PackNotFound();
        
        if (pack.maxSupply > 0) {
            if (pack.totalMinted >= pack.maxSupply) revert ExceedsMaxSupply();
        }
        
        uint256 tokenId = nextTokenId++;
        pack.totalMinted++;
        
        _mint(to, tokenId, 1, "");
        
        emit PackPurchased(to, packId, tokenId, 0);
        return tokenId;
    }
    
    /**
     * @notice Open a pack to receive cards
     * @param tokenId The pack token ID to open
     */
    function openPack(uint256 tokenId) external nonReentrant {
        if (balanceOf(msg.sender, tokenId) == 0) revert NotOwner();
        if (packContents[tokenId].length > 0) revert PackAlreadyOpened();
        
        // Find the pack ID from token metadata
        uint256 packId = _getPackIdFromToken(tokenId);
        PackMetadata storage pack = packMetadata[packId];
        
        if (packDistribution[packId].length == 0) revert NoCardsInDistribution();
        
        // Burn the pack NFT
        _burn(msg.sender, tokenId, 1);
        
        // Generate random cards
        uint256[] memory cardIds = _generateRandomCards(packId, tokenId);
        packContents[tokenId] = cardIds;
        pack.totalOpened++;
        
        // Mint the cards
        uint256[] memory amounts = new uint256[](cardIds.length);
        for (uint i = 0; i < cardIds.length; i++) {
            amounts[i] = 1;
        }
        
        cardsContract.mintBatchCards(msg.sender, cardIds, amounts);
        
        emit PackOpened(msg.sender, tokenId, cardIds);
    }
    
    /**
     * @notice Generate random cards for pack opening
     * @param packId The pack ID
     * @param tokenId The token ID (for randomness seed)
     * @return Array of card IDs
     */
    function _generateRandomCards(uint256 packId, uint256 tokenId) internal returns (uint256[] memory) {
        PackMetadata memory pack = packMetadata[packId];
        RarityWeight[] memory distribution = packDistribution[packId];
        
        uint256[] memory cards = new uint256[](pack.cardCount);
        
        for (uint i = 0; i < pack.cardCount; i++) {
            uint256 randomValue = _getRandomValue(tokenId, i);
            
            // Determine rarity based on pack type and position
            uint256 targetRarity = _getTargetRarity(pack.packType, i);
            
            // Find cards of target rarity
            uint256[] memory candidateCards = new uint256[](distribution.length);
            uint256[] memory candidateWeights = new uint256[](distribution.length);
            uint256 totalWeight = 0;
            uint256 candidateCount = 0;
            
            for (uint j = 0; j < distribution.length; j++) {
                if (distribution[j].rarity == targetRarity) {
                    candidateCards[candidateCount] = distribution[j].cardId;
                    candidateWeights[candidateCount] = distribution[j].weight;
                    totalWeight += distribution[j].weight;
                    candidateCount++;
                }
            }
            
            // Fallback to common rarity if no cards found
            if (candidateCount == 0 && targetRarity > 0) {
                targetRarity = 0;
                for (uint j = 0; j < distribution.length; j++) {
                    if (distribution[j].rarity == targetRarity) {
                        candidateCards[candidateCount] = distribution[j].cardId;
                        candidateWeights[candidateCount] = distribution[j].weight;
                        totalWeight += distribution[j].weight;
                        candidateCount++;
                    }
                }
            }
            
            // Select random card based on weights
            if (candidateCount > 0) {
                uint256 weightedRandom = randomValue % totalWeight;
                uint256 currentWeight = 0;
                
                for (uint j = 0; j < candidateCount; j++) {
                    currentWeight += candidateWeights[j];
                    if (weightedRandom < currentWeight) {
                        cards[i] = candidateCards[j];
                        break;
                    }
                }
            } else {
                // Ultimate fallback - use first card in distribution
                cards[i] = distribution[0].cardId;
            }
        }
        
        return cards;
    }
    
    /**
     * @notice Determine target rarity for pack slot
     * @param packType The pack type
     * @param slotIndex The slot index in the pack
     * @return Target rarity (0=common, 1=rare, 2=legendary)
     */
    function _getTargetRarity(PackType packType, uint256 slotIndex) internal pure returns (uint256) {
        if (packType == PackType.Common) {
            return 0; // All common
        } else if (packType == PackType.Rare) {
            if (slotIndex < 3) return 0; // First 3 common
            return 1; // Last 2 rare
        } else if (packType == PackType.Legendary) {
            if (slotIndex < 2) return 0; // First 2 common
            if (slotIndex < 4) return 1; // Next 2 rare
            return 2; // Last 1 legendary
        }
        return 0;
    }
    
    /**
     * @notice Generate pseudo-random value
     * @param seed1 First seed value
     * @param seed2 Second seed value
     * @return Random value
     */
    function _getRandomValue(uint256 seed1, uint256 seed2) internal returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            msg.sender,
            seed1,
            seed2,
            nonce,
            block.timestamp
        )));
    }
    
    /**
     * @notice Get pack ID from token (simplified for now)
     * @param tokenId The token ID
     * @return The pack ID
     */
    function _getPackIdFromToken(uint256 tokenId) internal view returns (uint256) {
        // In a real implementation, we'd store this mapping
        // For now, assume tokenId maps to packId (simplified)
        return 1; // Default to pack ID 1
    }
    
    /**
     * @notice Get pack contents (after opening)
     * @param tokenId The token ID
     * @return Array of card IDs that were opened
     */
    function getPackContents(uint256 tokenId) external view returns (uint256[] memory) {
        return packContents[tokenId];
    }
    
    /**
     * @notice Generate URI for a pack
     * @param tokenId The token ID
     * @return Data URI with base64 encoded JSON
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        uint256 packId = _getPackIdFromToken(tokenId);
        PackMetadata memory pack = packMetadata[packId];
        
        if (pack.svgPointer == address(0)) revert PackNotFound();
        
        // Check if pack is opened
        bool isOpened = packContents[tokenId].length > 0;
        
        // Read SVG from pointer
        bytes memory svgData = SSTORE2.read(pack.svgPointer);
        string memory svgBase64 = Base64.encode(svgData);
        
        string memory packTypeName = _packTypeToString(pack.packType);
        
        // Build complete JSON metadata
        string memory json = string.concat(
            '{"name":"', pack.name,
            isOpened ? ' (Opened)' : ' (Sealed)',
            '","description":"', packTypeName, ' pack with ', _toString(pack.cardCount), ' cards',
            '","image":"data:image/svg+xml;base64,', svgBase64,
            '","attributes":[',
                '{"trait_type":"Pack Type","value":"', packTypeName, '"},',
                '{"trait_type":"Card Count","value":', _toString(pack.cardCount), '},',
                '{"trait_type":"Status","value":"', isOpened ? 'Opened' : 'Sealed', '"}',
            ']',
            '}'
        );
        
        // Return data URI
        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
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
    
    function _packTypeToString(PackType packType) internal pure returns (string memory) {
        if (packType == PackType.Common) return "Common";
        if (packType == PackType.Rare) return "Rare";
        if (packType == PackType.Legendary) return "Legendary";
        return "";
    }
    
    /**
     * @notice Withdraw contract balance (admin only)
     */
    function withdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success,) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");
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
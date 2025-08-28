// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Base64
 * @notice Provides base64 encoding functionality for URI generation
 */
library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    /**
     * @notice Encodes bytes to base64 string
     * @param data The bytes to encode
     * @return The base64 encoded string
     */
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        
        string memory result = new string(encodedLen);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 0x20)
            let dataPtr := data
            let endPtr := add(data, mload(data))
            
            for {} lt(dataPtr, endPtr) {} {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d) // =
                mstore8(sub(resultPtr, 1), 0x3d) // =
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d) // =
            }
        }
        
        return result;
    }
}
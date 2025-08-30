// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SSTORE2Enhanced
 * @notice Enhanced SSTORE2 with higher gas limits for Base Sepolia compatibility
 * @dev Stores data in contract bytecode with explicit gas limits
 */
library SSTORE2Enhanced {
    error DataTooLarge();
    error InvalidPointer();
    error DeploymentFailed();
    
    uint256 private constant DATA_OFFSET = 1;
    uint256 private constant DEPLOYMENT_GAS = 3000000; // Higher gas limit for Base Sepolia
    
    /**
     * @notice Stores data by deploying a contract with explicit gas limit
     * @param data The data to store
     * @return pointer The address of the deployed contract containing the data
     */
    function write(bytes memory data) internal returns (address pointer) {
        // Ensure data is not too large for a contract
        if (data.length > 24575) revert DataTooLarge(); // Max contract size - 1KB margin
        
        bytes memory code = abi.encodePacked(
            hex"00", // STOP opcode - contract does nothing when called
            data
        );
        
        assembly {
            // Use explicit gas limit for CREATE operation
            pointer := create(DEPLOYMENT_GAS, add(code, 0x20), mload(code))
            if iszero(pointer) {
                // Deployment failed
                let size := mload(0x40)
                mstore(size, 0x08c379a000000000000000000000000000000000000000000000000000000000)
                mstore(add(size, 0x04), 0x20)
                mstore(add(size, 0x24), 17)
                mstore(add(size, 0x44), "DeploymentFailed")
                revert(size, 0x64)
            }
        }
    }
    
    /**
     * @notice Stores data deterministically using CREATE2 with higher gas
     * @param data The data to store
     * @param salt The salt for CREATE2 deployment
     * @return pointer The address of the deployed contract containing the data
     */
    function writeDeterministic(bytes memory data, bytes32 salt) internal returns (address pointer) {
        if (data.length > 24575) revert DataTooLarge();
        
        bytes memory code = abi.encodePacked(
            hex"00", // STOP opcode
            data
        );
        
        assembly {
            // Use explicit gas limit for CREATE2 operation
            pointer := create2(DEPLOYMENT_GAS, add(code, 0x20), mload(code), salt)
            if iszero(pointer) {
                // Deployment failed
                let size := mload(0x40)
                mstore(size, 0x08c379a000000000000000000000000000000000000000000000000000000000)
                mstore(add(size, 0x04), 0x20)
                mstore(add(size, 0x24), 17)
                mstore(add(size, 0x44), "DeploymentFailed")
                revert(size, 0x64)
            }
        }
    }
    
    /**
     * @notice Alternative write using CREATE2 for better reliability
     * @param data The data to store
     * @return pointer The address of the deployed contract containing the data
     */
    function writeWithSalt(bytes memory data) internal returns (address pointer) {
        // Generate salt from data hash for deterministic but unique deployment
        bytes32 salt = keccak256(data);
        return writeDeterministic(data, salt);
    }
    
    /**
     * @notice Reads data from a pointer address
     * @param pointer The address containing the data
     * @return data The stored data
     */
    function read(address pointer) internal view returns (bytes memory data) {
        return readBytecode(pointer, DATA_OFFSET, pointer.code.length - DATA_OFFSET);
    }
    
    /**
     * @notice Reads bytecode from a given address
     * @param pointer The address to read from
     * @param start Starting position
     * @param length Length to read
     * @return data The extracted data
     */
    function readBytecode(
        address pointer,
        uint256 start,
        uint256 length
    ) internal view returns (bytes memory data) {
        if (pointer == address(0)) revert InvalidPointer();
        
        assembly {
            data := mload(0x40)
            mstore(data, length)
            extcodecopy(pointer, add(data, 0x20), start, length)
            mstore(0x40, add(add(data, length), 0x20))
        }
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SSTORE2
 * @notice Efficient onchain storage using contract bytecode
 * @dev Stores data in contract bytecode for 10-15x gas savings vs SSTORE
 */
library SSTORE2 {
    error DataTooLarge();
    error InvalidPointer();
    error DeploymentFailed();
    
    uint256 private constant DATA_OFFSET = 1;
    
    /**
     * @notice Stores data by deploying a contract with the data as bytecode
     * @param data The data to store
     * @return pointer The address of the deployed contract containing the data
     */
    function write(bytes memory data) internal returns (address pointer) {
        // Ensure data is not too large for a contract
        if (data.length > 24575) revert DataTooLarge(); // Max contract size - 1KB margin
        
        // Build runtime bytecode (what the deployed contract will contain)
        bytes memory runtimeCode = abi.encodePacked(
            hex"00", // STOP opcode - contract does nothing when called
            data
        );
        
        // Build initialization bytecode that deploys the runtime code
        // Format: PUSH2 <length> PUSH1 0x80 PUSH1 0x0E PUSH1 0x00 CODECOPY PUSH1 0x00 RETURN
        bytes memory initCode = abi.encodePacked(
            hex"61", uint16(runtimeCode.length),  // PUSH2 runtimeCode.length
            hex"80600E6000396000F3",              // Init opcodes: DUP1 PUSH1 0x0E PUSH1 0x00 CODECOPY PUSH1 0x00 RETURN
            runtimeCode                          // The actual runtime code to deploy
        );
        
        assembly {
            pointer := create(0, add(initCode, 0x20), mload(initCode))
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
     * @notice Stores data deterministically using CREATE2
     * @param data The data to store
     * @param salt The salt for CREATE2 deployment
     * @return pointer The address of the deployed contract containing the data
     */
    function writeDeterministic(bytes memory data, bytes32 salt) internal returns (address pointer) {
        if (data.length > 24575) revert DataTooLarge();
        
        // Build runtime bytecode (what the deployed contract will contain)
        bytes memory runtimeCode = abi.encodePacked(
            hex"00", // STOP opcode
            data
        );
        
        // Build initialization bytecode that deploys the runtime code
        bytes memory initCode = abi.encodePacked(
            hex"61", uint16(runtimeCode.length),  // PUSH2 runtimeCode.length
            hex"80600E6000396000F3",              // Init opcodes: DUP1 PUSH1 0x0E PUSH1 0x00 CODECOPY PUSH1 0x00 RETURN
            runtimeCode                          // The actual runtime code to deploy
        );
        
        assembly {
            pointer := create2(0, add(initCode, 0x20), mload(initCode), salt)
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
     * @dev Uses data hash as salt for deterministic deployment
     * @param data The data to store
     * @return pointer The address of the deployed contract containing the data
     */
    function writeWithCreate2(bytes memory data) internal returns (address pointer) {
        // Generate unique salt from data hash and block timestamp
        bytes32 salt = keccak256(abi.encodePacked(data, block.timestamp, msg.sender));
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
     * @notice Reads a subset of data from a pointer address
     * @param pointer The address containing the data
     * @param start The offset to start reading from (after the STOP opcode)
     * @param size The number of bytes to read
     * @return data The stored data subset
     */
    function read(address pointer, uint256 start, uint256 size) internal view returns (bytes memory data) {
        return readBytecode(pointer, start + DATA_OFFSET, size);
    }
    
    /**
     * @notice Reads bytecode from an address using EXTCODECOPY
     * @param pointer The address to read from
     * @param offset The offset in the bytecode
     * @param size The number of bytes to read
     * @return data The bytecode data
     */
    function readBytecode(address pointer, uint256 offset, uint256 size) private view returns (bytes memory data) {
        if (pointer.code.length == 0) revert InvalidPointer();
        
        assembly {
            data := mload(0x40)
            mstore(0x40, add(data, add(size, 0x20)))
            mstore(data, size)
            extcodecopy(pointer, add(data, 0x20), offset, size)
        }
    }
    
    /**
     * @notice Computes the CREATE2 address for given bytecode and salt
     * @param data The data that would be stored
     * @param salt The salt for CREATE2
     * @return pointer The address where the contract would be deployed
     */
    function computeAddress(bytes memory data, bytes32 salt) internal view returns (address pointer) {
        bytes memory code = abi.encodePacked(hex"00", data);
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(code)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
    
    /**
     * @notice Returns the content hash of stored data
     * @param pointer The address containing the data
     * @return hash The keccak256 hash of the stored data
     */
    function contentHash(address pointer) internal view returns (bytes32 hash) {
        return keccak256(read(pointer));
    }
}
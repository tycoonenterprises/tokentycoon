// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/SSTORE2.sol";

/**
 * @title TestSSTORE2Fix
 * @notice Test contract for verifying SSTORE2 fixes on Base Sepolia
 */
contract TestSSTORE2Fix {
    event TestResult(string method, address pointer, bool success, uint256 gasUsed);
    
    /**
     * @notice Test standard CREATE with enhanced gas
     */
    function testCreateWithGas(bytes calldata data) external returns (address pointer) {
        uint256 gasStart = gasleft();
        
        try this.deployWithCreate(data) returns (address result) {
            pointer = result;
            emit TestResult("CREATE", pointer, pointer != address(0), gasStart - gasleft());
        } catch {
            emit TestResult("CREATE", address(0), false, gasStart - gasleft());
        }
    }
    
    /**
     * @notice Test CREATE2 with enhanced gas
     */
    function testCreate2WithGas(bytes calldata data) external returns (address pointer) {
        uint256 gasStart = gasleft();
        
        try this.deployWithCreate2(data) returns (address result) {
            pointer = result;
            emit TestResult("CREATE2", pointer, pointer != address(0), gasStart - gasleft());
        } catch {
            emit TestResult("CREATE2", address(0), false, gasStart - gasleft());
        }
    }
    
    /**
     * @notice Internal CREATE deployment
     */
    function deployWithCreate(bytes calldata data) external returns (address) {
        return SSTORE2.write(data);
    }
    
    /**
     * @notice Internal CREATE2 deployment
     */
    function deployWithCreate2(bytes calldata data) external returns (address) {
        return SSTORE2.writeWithCreate2(data);
    }
    
    /**
     * @notice Verify stored data
     */
    function verifyData(address pointer) external view returns (bytes memory, uint256) {
        if (pointer.code.length == 0) {
            return ("", 0);
        }
        
        bytes memory data = SSTORE2.read(pointer);
        return (data, data.length);
    }
}
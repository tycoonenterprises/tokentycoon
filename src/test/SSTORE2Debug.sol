// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SSTORE2Debug
 * @notice Minimal test contract to reproduce and debug SSTORE2 CREATE issues
 */
contract SSTORE2Debug {
    
    event ContractCreated(address indexed pointer, uint256 dataLength, uint256 gasUsed);
    event CreationFailed(string reason, uint256 gasUsed);
    event BytecodeVerified(address indexed pointer, uint256 actualLength, bool hasData);
    
    struct TestResult {
        address pointer;
        uint256 gasUsed;
        bool success;
        uint256 bytecodeLength;
        bytes32 dataHash;
    }
    
    TestResult[] public testResults;
    
    /**
     * @notice Test 1: Basic CREATE with minimal data
     */
    function testBasicCreate() external returns (TestResult memory result) {
        uint256 gasStart = gasleft();
        
        bytes memory data = bytes("Hello World");
        bytes memory bytecode = abi.encodePacked(hex"00", data); // STOP + data
        
        address pointer;
        assembly {
            pointer := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        
        uint256 gasUsed = gasStart - gasleft();
        
        if (pointer == address(0)) {
            emit CreationFailed("CREATE returned zero address", gasUsed);
            result = TestResult(address(0), gasUsed, false, 0, bytes32(0));
        } else {
            uint256 actualLength = pointer.code.length;
            emit ContractCreated(pointer, data.length, gasUsed);
            emit BytecodeVerified(pointer, actualLength, actualLength > 0);
            
            result = TestResult(
                pointer, 
                gasUsed, 
                actualLength > 0, 
                actualLength,
                keccak256(data)
            );
        }
        
        testResults.push(result);
        return result;
    }
    
    /**
     * @notice Test 2: CREATE with explicit gas limit
     */
    function testCreateWithGas() external returns (TestResult memory result) {
        uint256 gasStart = gasleft();
        
        bytes memory data = bytes("Hello World with explicit gas");
        bytes memory bytecode = abi.encodePacked(hex"00", data);
        
        address pointer;
        assembly {
            // Allocate 1M gas explicitly
            pointer := create(1000000, add(bytecode, 0x20), mload(bytecode))
        }
        
        uint256 gasUsed = gasStart - gasleft();
        
        if (pointer == address(0)) {
            emit CreationFailed("CREATE with gas returned zero address", gasUsed);
            result = TestResult(address(0), gasUsed, false, 0, bytes32(0));
        } else {
            uint256 actualLength = pointer.code.length;
            emit ContractCreated(pointer, data.length, gasUsed);
            emit BytecodeVerified(pointer, actualLength, actualLength > 0);
            
            result = TestResult(
                pointer, 
                gasUsed, 
                actualLength > 0, 
                actualLength,
                keccak256(data)
            );
        }
        
        testResults.push(result);
        return result;
    }
    
    /**
     * @notice Test 3: CREATE2 with salt
     */
    function testCreate2() external returns (TestResult memory result) {
        uint256 gasStart = gasleft();
        
        bytes memory data = bytes("Hello CREATE2");
        bytes memory bytecode = abi.encodePacked(hex"00", data);
        bytes32 salt = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        
        address pointer;
        assembly {
            pointer := create2(1000000, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        uint256 gasUsed = gasStart - gasleft();
        
        if (pointer == address(0)) {
            emit CreationFailed("CREATE2 returned zero address", gasUsed);
            result = TestResult(address(0), gasUsed, false, 0, bytes32(0));
        } else {
            uint256 actualLength = pointer.code.length;
            emit ContractCreated(pointer, data.length, gasUsed);
            emit BytecodeVerified(pointer, actualLength, actualLength > 0);
            
            result = TestResult(
                pointer, 
                gasUsed, 
                actualLength > 0, 
                actualLength,
                keccak256(data)
            );
        }
        
        testResults.push(result);
        return result;
    }
    
    /**
     * @notice Test 4: Large data (like SVG)
     */
    function testLargeData() external returns (TestResult memory result) {
        uint256 gasStart = gasleft();
        
        // Create larger data similar to SVG size
        string memory svgData = '<svg width="375" height="525" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1a1a1a"/><text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle">Test Card Data</text><rect x="10" y="10" width="355" height="505" fill="none" stroke="#333" stroke-width="2"/></svg>';
        
        bytes memory data = bytes(svgData);
        bytes memory bytecode = abi.encodePacked(hex"00", data);
        
        address pointer;
        assembly {
            pointer := create(3000000, add(bytecode, 0x20), mload(bytecode))
        }
        
        uint256 gasUsed = gasStart - gasleft();
        
        if (pointer == address(0)) {
            emit CreationFailed("Large data CREATE returned zero address", gasUsed);
            result = TestResult(address(0), gasUsed, false, 0, bytes32(0));
        } else {
            uint256 actualLength = pointer.code.length;
            emit ContractCreated(pointer, data.length, gasUsed);
            emit BytecodeVerified(pointer, actualLength, actualLength > 0);
            
            result = TestResult(
                pointer, 
                gasUsed, 
                actualLength > 0, 
                actualLength,
                keccak256(data)
            );
        }
        
        testResults.push(result);
        return result;
    }
    
    /**
     * @notice Test 5: Deploy actual contract (not just data)
     */
    function testContractDeployment() external returns (TestResult memory result) {
        uint256 gasStart = gasleft();
        
        // Simple contract bytecode that just returns a value
        // This is actual EVM bytecode, not just data
        bytes memory contractBytecode = hex"608060405234801561001057600080fd5b5060358061001f6000396000f3fe6080604052600080fdfea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008110033";
        
        address pointer;
        assembly {
            pointer := create(2000000, add(contractBytecode, 0x20), mload(contractBytecode))
        }
        
        uint256 gasUsed = gasStart - gasleft();
        
        if (pointer == address(0)) {
            emit CreationFailed("Contract deployment returned zero address", gasUsed);
            result = TestResult(address(0), gasUsed, false, 0, bytes32(0));
        } else {
            uint256 actualLength = pointer.code.length;
            emit ContractCreated(pointer, contractBytecode.length, gasUsed);
            emit BytecodeVerified(pointer, actualLength, actualLength > 0);
            
            result = TestResult(
                pointer, 
                gasUsed, 
                actualLength > 0, 
                actualLength,
                keccak256(contractBytecode)
            );
        }
        
        testResults.push(result);
        return result;
    }
    
    /**
     * @notice Run all tests and return results
     */
    function runAllTests() external returns (TestResult[5] memory results) {
        results[0] = this.testBasicCreate();
        results[1] = this.testCreateWithGas();
        results[2] = this.testCreate2();
        results[3] = this.testLargeData();
        results[4] = this.testContractDeployment();
        
        return results;
    }
    
    /**
     * @notice Get number of test results stored
     */
    function getResultCount() external view returns (uint256) {
        return testResults.length;
    }
    
    /**
     * @notice Clear all test results
     */
    function clearResults() external {
        delete testResults;
    }
    
    /**
     * @notice Verify a deployed pointer has actual bytecode
     */
    function verifyPointer(address pointer) external view returns (
        bool exists,
        uint256 codeLength,
        bytes32 codeHash
    ) {
        exists = pointer.code.length > 0;
        codeLength = pointer.code.length;
        codeHash = pointer.codehash;
        
        return (exists, codeLength, codeHash);
    }
}
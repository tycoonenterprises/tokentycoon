import { ethers } from 'ethers';

async function debugSSTORE2Pointer(address) {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    console.log(`\n🔍 Debugging SSTORE2 pointer: ${address}`);
    
    // Get raw bytecode
    const bytecode = await provider.getCode(address);
    console.log(`📊 Raw bytecode length: ${bytecode.length} characters`);
    console.log(`📊 Raw bytecode (first 100 chars): ${bytecode.substring(0, 100)}`);
    console.log(`📊 Raw bytecode (last 50 chars): ${bytecode.substring(Math.max(0, bytecode.length - 50))}`);
    
    if (bytecode.length > 2) {
        console.log(`✅ Contract exists with bytecode!`);
        
        // Try different SSTORE2 decoding methods
        console.log(`\n🔧 Attempting SSTORE2 decode methods:`);
        
        // Method 1: Remove 0x prefix, then skip first 2 bytes (constructor)
        if (bytecode.length > 6) { // 0x + at least 4 hex chars (2 bytes)
            try {
                const dataHex = bytecode.slice(6); // Remove 0x and first 2 bytes
                const dataBytes = ethers.getBytes('0x' + dataHex);
                const decoded = ethers.toUtf8String(dataBytes);
                console.log(`   Method 1 (skip 2 bytes): ${dataBytes.length} bytes`);
                console.log(`   Decoded preview: ${decoded.substring(0, 100)}...`);
                
                if (decoded.includes('<svg')) {
                    console.log(`   ✅ Found SVG content!`);
                }
            } catch (error) {
                console.log(`   Method 1 failed: ${error.message}`);
            }
        }
        
        // Method 2: Skip first byte only
        if (bytecode.length > 4) {
            try {
                const dataHex = bytecode.slice(4); // Remove 0x and first byte
                const dataBytes = ethers.getBytes('0x' + dataHex);
                const decoded = ethers.toUtf8String(dataBytes);
                console.log(`   Method 2 (skip 1 byte): ${dataBytes.length} bytes`);
                console.log(`   Decoded preview: ${decoded.substring(0, 100)}...`);
                
                if (decoded.includes('<svg')) {
                    console.log(`   ✅ Found SVG content!`);
                }
            } catch (error) {
                console.log(`   Method 2 failed: ${error.message}`);
            }
        }
        
        // Method 3: Use entire bytecode minus 0x
        try {
            const dataHex = bytecode.slice(2); // Remove just 0x
            const dataBytes = ethers.getBytes('0x' + dataHex);
            const decoded = ethers.toUtf8String(dataBytes);
            console.log(`   Method 3 (full bytecode): ${dataBytes.length} bytes`);
            console.log(`   Decoded preview: ${decoded.substring(0, 100)}...`);
            
            if (decoded.includes('<svg')) {
                console.log(`   ✅ Found SVG content!`);
            }
        } catch (error) {
            console.log(`   Method 3 failed: ${error.message}`);
        }
        
        // Method 4: Try reading as SSTORE2 library expects
        try {
            // SSTORE2 stores data starting from byte 1 (skipping the STOP opcode)
            const dataHex = bytecode.slice(4); // 0x + 2 hex chars (1 byte)
            if (dataHex.length > 0) {
                const dataBytes = ethers.getBytes('0x' + dataHex);
                console.log(`   Method 4 (SSTORE2 format): ${dataBytes.length} bytes`);
                
                // Try as UTF-8 first
                try {
                    const decoded = ethers.toUtf8String(dataBytes);
                    console.log(`   UTF-8 decoded preview: ${decoded.substring(0, 100)}...`);
                    
                    if (decoded.includes('<svg')) {
                        console.log(`   ✅ Found SVG content!`);
                        return decoded;
                    }
                } catch (e) {
                    console.log(`   UTF-8 decode failed, trying raw bytes`);
                }
                
                // Try interpreting as raw bytes
                const hexString = ethers.hexlify(dataBytes);
                console.log(`   Raw hex preview: ${hexString.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`   Method 4 failed: ${error.message}`);
        }
        
    } else {
        console.log(`❌ No bytecode found (empty contract)`);
    }
}

// Test with card 11's SVG pointer
debugSSTORE2Pointer('0x48B58B1b24334Ac1155c2ACcA8F4a45c0c2db6F5');
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SSTORE2Debug} from "../src/test/SSTORE2Debug.sol";

/**
 * @title DeployDebug
 * @notice Deploy SSTORE2 debug test contract
 */
contract DeployDebug is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying SSTORE2Debug contract with deployer:", deployer);
        console.log("Deployer balance:", address(deployer).balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the debug contract
        console.log("Deploying SSTORE2Debug...");
        SSTORE2Debug debugContract = new SSTORE2Debug();
        console.log("SSTORE2Debug deployed at:", address(debugContract));

        vm.stopBroadcast();

        console.log("");
        console.log("=== Debug Contract Deployed ===");
        console.log("Address:", address(debugContract));
        console.log("");
        console.log("Test it with:");
        console.log("cast call", address(debugContract), '"testBasicCreate()"', "--rpc-url https://sepolia.base.org");
    }
}
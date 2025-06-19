// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MultiSigWallet.sol";

/**
 * @title WalletFactory
 * @dev Factory contract for creating MultiSigWallet instances using minimal proxies
 */
contract WalletFactory is Ownable {
    using Clones for address;

    // Events
    event WalletCreated(
        address indexed wallet,
        address[] owners,
        uint256 required,
        uint256 timeLockDuration,
        bytes32 salt
    );

    // State variables
    address public immutable walletImplementation;
    mapping(address => bool) public isWalletDeployed;
    address[] public deployedWallets;

    constructor() {
        walletImplementation = address(new MultiSigWallet());
    }

    /**
     * @dev Create a new MultiSigWallet instance
     */
    function createWallet(
        address[] memory _owners,
        uint256 _required,
        uint256 _timeLockDuration,
        bytes32 _salt
    ) external returns (address wallet) {
        // Create deterministic address
        wallet = walletImplementation.cloneDeterministic(_salt);
        
        require(!isWalletDeployed[wallet], "Wallet already exists");
        
        // Initialize the wallet
        MultiSigWallet(payable(wallet)).initialize(_owners, _required, _timeLockDuration);
        
        // Update state
        isWalletDeployed[wallet] = true;
        deployedWallets.push(wallet);
        
        emit WalletCreated(wallet, _owners, _required, _timeLockDuration, _salt);
    }

    /**
     * @dev Predict wallet address
     */
    function predictWalletAddress(bytes32 _salt) external view returns (address) {
        return walletImplementation.predictDeterministicAddress(_salt);
    }

    /**
     * @dev Get deployed wallets count
     */
    function getDeployedWalletsCount() external view returns (uint256) {
        return deployedWallets.length;
    }

    /**
     * @dev Get deployed wallets in range
     */
    function getDeployedWallets(uint256 start, uint256 end) 
        external 
        view 
        returns (address[] memory) 
    {
        require(start < end && end <= deployedWallets.length, "Invalid range");
        
        address[] memory wallets = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            wallets[i - start] = deployedWallets[i];
        }
        return wallets;
    }
} 
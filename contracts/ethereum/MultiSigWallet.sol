// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title MultiSigWallet
 * @dev Advanced multi-signature wallet with time locks, spending limits, and social recovery
 */
contract MultiSigWallet is 
    Initializable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable, 
    OwnableUpgradeable,
    IERC1271 
{
    using ECDSA for bytes32;

    // Events
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);
    event TransactionSubmitted(uint256 indexed transactionId);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed owner);
    event TransactionRevoked(uint256 indexed transactionId, address indexed owner);
    event TransactionExecuted(uint256 indexed transactionId);
    event SpendingLimitSet(address indexed token, uint256 dailyLimit, uint256 monthlyLimit);
    event SocialRecoveryInitiated(address indexed newOwner, uint256 recoveryId);
    event SocialRecoveryExecuted(uint256 indexed recoveryId);
    event TimeLockSet(uint256 timeLockDuration);

    // Structs
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        uint256 submitTime;
        address token; // address(0) for ETH
        mapping(address => bool) isConfirmed;
    }

    struct SpendingLimit {
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastResetDay;
        uint256 lastResetMonth;
    }

    struct SocialRecovery {
        address oldOwner;
        address newOwner;
        uint256 confirmations;
        bool executed;
        uint256 initiateTime;
        mapping(address => bool) hasConfirmed;
    }

    // State variables
    mapping(address => bool) public isOwner;
    address[] public owners;
    uint256 public required;
    uint256 public transactionCount;
    uint256 public timeLockDuration;
    
    mapping(uint256 => Transaction) public transactions;
    mapping(address => SpendingLimit) public spendingLimits;
    mapping(uint256 => SocialRecovery) public socialRecoveries;
    mapping(address => bool) public guardians;
    
    uint256 public recoveryCount;
    uint256 public constant SOCIAL_RECOVERY_TIMELOCK = 7 days;
    uint256 public constant MAX_OWNERS = 50;

    // Modifiers
    modifier onlyWallet() {
        require(msg.sender == address(this), "Only wallet can call this function");
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner], "Owner does not exist");
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner], "Owner already exists");
        _;
    }

    modifier transactionExists(uint256 transactionId) {
        require(transactionId < transactionCount, "Transaction does not exist");
        _;
    }

    modifier confirmed(uint256 transactionId, address owner) {
        require(transactions[transactionId].isConfirmed[owner], "Transaction not confirmed");
        _;
    }

    modifier notConfirmed(uint256 transactionId, address owner) {
        require(!transactions[transactionId].isConfirmed[owner], "Transaction already confirmed");
        _;
    }

    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "Transaction already executed");
        _;
    }

    modifier validRequirement(uint256 ownerCount, uint256 _required) {
        require(ownerCount <= MAX_OWNERS && _required <= ownerCount && _required > 0, "Invalid requirements");
        _;
    }

    /**
     * @dev Initialize the wallet with owners and required confirmations
     */
    function initialize(
        address[] memory _owners,
        uint256 _required,
        uint256 _timeLockDuration
    ) public initializer validRequirement(_owners.length, _required) {
        __ReentrancyGuard_init();
        __Pausable_init();
        __Ownable_init();

        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Invalid owner address");
            require(!isOwner[_owners[i]], "Duplicate owner");
            
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
            emit OwnerAdded(_owners[i]);
        }
        
        required = _required;
        timeLockDuration = _timeLockDuration;
        emit RequirementChanged(_required);
        emit TimeLockSet(_timeLockDuration);
    }

    /**
     * @dev Submit a transaction
     */
    function submitTransaction(
        address destination,
        uint256 value,
        bytes memory data,
        address token
    ) public onlyOwner returns (uint256 transactionId) {
        transactionId = addTransaction(destination, value, data, token);
        confirmTransaction(transactionId);
    }

    /**
     * @dev Confirm a transaction
     */
    function confirmTransaction(uint256 transactionId)
        public
        onlyOwner
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        transactions[transactionId].isConfirmed[msg.sender] = true;
        transactions[transactionId].confirmations++;
        
        emit TransactionConfirmed(transactionId, msg.sender);
        
        executeTransaction(transactionId);
    }

    /**
     * @dev Revoke confirmation for a transaction
     */
    function revokeConfirmation(uint256 transactionId)
        public
        onlyOwner
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        transactions[transactionId].isConfirmed[msg.sender] = false;
        transactions[transactionId].confirmations--;
        
        emit TransactionRevoked(transactionId, msg.sender);
    }

    /**
     * @dev Execute a transaction if requirements are met
     */
    function executeTransaction(uint256 transactionId)
        public
        onlyOwner
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
        nonReentrant
    {
        Transaction storage txn = transactions[transactionId];
        
        require(txn.confirmations >= required, "Not enough confirmations");
        require(
            block.timestamp >= txn.submitTime + timeLockDuration,
            "Time lock not expired"
        );
        
        // Check spending limits
        if (!isWithinSpendingLimit(txn.token, txn.value)) {
            require(txn.confirmations >= owners.length, "Exceeds spending limit, need all confirmations");
        }
        
        txn.executed = true;
        
        bool success;
        if (txn.token == address(0)) {
            // ETH transfer
            (success, ) = txn.to.call{value: txn.value}(txn.data);
        } else {
            // ERC20 transfer
            success = IERC20(txn.token).transfer(txn.to, txn.value);
            if (txn.data.length > 0) {
                (success, ) = txn.to.call(txn.data);
            }
        }
        
        require(success, "Transaction execution failed");
        
        updateSpendingLimit(txn.token, txn.value);
        emit TransactionExecuted(transactionId);
    }

    /**
     * @dev Add a new owner (requires wallet confirmation)
     */
    function addOwner(address owner)
        public
        onlyWallet
        ownerDoesNotExist(owner)
        validRequirement(owners.length + 1, required)
    {
        require(owner != address(0), "Invalid owner address");
        
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAdded(owner);
    }

    /**
     * @dev Remove an owner (requires wallet confirmation)
     */
    function removeOwner(address owner) public onlyWallet ownerExists(owner) {
        isOwner[owner] = false;
        
        for (uint256 i = 0; i < owners.length - 1; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        }
        owners.pop();
        
        if (required > owners.length) {
            changeRequirement(owners.length);
        }
        
        emit OwnerRemoved(owner);
    }

    /**
     * @dev Change the required number of confirmations
     */
    function changeRequirement(uint256 _required)
        public
        onlyWallet
        validRequirement(owners.length, _required)
    {
        required = _required;
        emit RequirementChanged(_required);
    }

    /**
     * @dev Set spending limits for a token
     */
    function setSpendingLimit(
        address token,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) public onlyWallet {
        spendingLimits[token] = SpendingLimit({
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit,
            dailySpent: 0,
            monthlySpent: 0,
            lastResetDay: block.timestamp / 1 days,
            lastResetMonth: block.timestamp / 30 days
        });
        
        emit SpendingLimitSet(token, dailyLimit, monthlyLimit);
    }

    /**
     * @dev Initiate social recovery
     */
    function initiateSocialRecovery(address oldOwner, address newOwner)
        public
        returns (uint256 recoveryId)
    {
        require(guardians[msg.sender], "Only guardians can initiate recovery");
        require(isOwner[oldOwner], "Old owner does not exist");
        require(!isOwner[newOwner], "New owner already exists");
        require(newOwner != address(0), "Invalid new owner address");
        
        recoveryId = recoveryCount++;
        SocialRecovery storage recovery = socialRecoveries[recoveryId];
        recovery.oldOwner = oldOwner;
        recovery.newOwner = newOwner;
        recovery.initiateTime = block.timestamp;
        recovery.hasConfirmed[msg.sender] = true;
        recovery.confirmations = 1;
        
        emit SocialRecoveryInitiated(newOwner, recoveryId);
    }

    /**
     * @dev Confirm social recovery
     */
    function confirmSocialRecovery(uint256 recoveryId) public {
        require(guardians[msg.sender], "Only guardians can confirm recovery");
        
        SocialRecovery storage recovery = socialRecoveries[recoveryId];
        require(!recovery.executed, "Recovery already executed");
        require(!recovery.hasConfirmed[msg.sender], "Already confirmed");
        
        recovery.hasConfirmed[msg.sender] = true;
        recovery.confirmations++;
        
        // Execute if enough confirmations and timelock passed
        if (
            recovery.confirmations >= getGuardianCount() / 2 + 1 &&
            block.timestamp >= recovery.initiateTime + SOCIAL_RECOVERY_TIMELOCK
        ) {
            executeSocialRecovery(recoveryId);
        }
    }

    /**
     * @dev Execute social recovery
     */
    function executeSocialRecovery(uint256 recoveryId) internal {
        SocialRecovery storage recovery = socialRecoveries[recoveryId];
        require(!recovery.executed, "Recovery already executed");
        
        recovery.executed = true;
        
        // Replace old owner with new owner
        isOwner[recovery.oldOwner] = false;
        isOwner[recovery.newOwner] = true;
        
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == recovery.oldOwner) {
                owners[i] = recovery.newOwner;
                break;
            }
        }
        
        emit SocialRecoveryExecuted(recoveryId);
    }

    /**
     * @dev Add internal transaction
     */
    function addTransaction(
        address destination,
        uint256 value,
        bytes memory data,
        address token
    ) internal returns (uint256 transactionId) {
        transactionId = transactionCount;
        Transaction storage txn = transactions[transactionId];
        txn.to = destination;
        txn.value = value;
        txn.data = data;
        txn.executed = false;
        txn.confirmations = 0;
        txn.submitTime = block.timestamp;
        txn.token = token;
        
        transactionCount++;
        emit TransactionSubmitted(transactionId);
    }

    /**
     * @dev Check if amount is within spending limit
     */
    function isWithinSpendingLimit(address token, uint256 amount) internal view returns (bool) {
        SpendingLimit storage limit = spendingLimits[token];
        
        if (limit.dailyLimit == 0 && limit.monthlyLimit == 0) {
            return true; // No limits set
        }
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;
        
        uint256 dailySpent = limit.dailySpent;
        uint256 monthlySpent = limit.monthlySpent;
        
        // Reset counters if needed
        if (currentDay > limit.lastResetDay) {
            dailySpent = 0;
        }
        if (currentMonth > limit.lastResetMonth) {
            monthlySpent = 0;
        }
        
        return (dailySpent + amount <= limit.dailyLimit) && 
               (monthlySpent + amount <= limit.monthlyLimit);
    }

    /**
     * @dev Update spending limit counters
     */
    function updateSpendingLimit(address token, uint256 amount) internal {
        SpendingLimit storage limit = spendingLimits[token];
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;
        
        // Reset counters if needed
        if (currentDay > limit.lastResetDay) {
            limit.dailySpent = 0;
            limit.lastResetDay = currentDay;
        }
        if (currentMonth > limit.lastResetMonth) {
            limit.monthlySpent = 0;
            limit.lastResetMonth = currentMonth;
        }
        
        limit.dailySpent += amount;
        limit.monthlySpent += amount;
    }

    /**
     * @dev Get guardian count
     */
    function getGuardianCount() public view returns (uint256 count) {
        // This would be implemented with a guardian registry
        // For now, return a placeholder
        return 3;
    }

    /**
     * @dev EIP-1271 signature validation
     */
    function isValidSignature(bytes32 hash, bytes memory signature)
        public
        view
        override
        returns (bytes4)
    {
        address signer = hash.recover(signature);
        if (isOwner[signer]) {
            return IERC1271.isValidSignature.selector;
        }
        return 0xffffffff;
    }

    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 transactionId)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations,
            uint256 submitTime,
            address token
        )
    {
        Transaction storage txn = transactions[transactionId];
        return (
            txn.to,
            txn.value,
            txn.data,
            txn.executed,
            txn.confirmations,
            txn.submitTime,
            txn.token
        );
    }

    /**
     * @dev Get owners
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev Pause contract (emergency)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
} 
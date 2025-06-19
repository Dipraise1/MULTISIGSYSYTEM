# 🧪 Testnet Deployment & Testing Guide

This guide will walk you through deploying and testing the MultiSig Wallet on various testnets.

## 📋 Prerequisites

### 1. Required Tools
```bash
# Install dependencies
npm install

# Install global tools (if not already installed)
npm install -g hardhat
npm install -g @solana/cli
```

### 2. Environment Setup

Create a `.env` file in the project root:

```bash
# Blockchain Networks
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
NEXT_PUBLIC_SOLANA_CLUSTER=devnet

# RPC URLs (Get from Infura, Alchemy, etc.)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Private Keys (Generate new ones for testing - NEVER use mainnet keys)
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef... # Your testnet private key

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Optional: For production deployment
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Get Testnet Funds

#### Ethereum Testnets
- **Sepolia Faucets:**
  - [Sepolia Faucet](https://sepoliafaucet.com/)
  - [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)
  - [Alchemy Faucet](https://sepoliafaucet.com/)

- **Goerli Faucets:**
  - [Goerli Faucet](https://goerlifaucet.com/)
  - [Paradigm Faucet](https://faucet.paradigm.xyz/)

#### Solana Testnets
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Create a new keypair for testing
solana-keygen new --outfile ./test-keypair.json

# Get SOL tokens on devnet
solana airdrop 2 $(solana-keygen pubkey ./test-keypair.json) --url devnet
```

## 🚀 Deployment Steps

### 1. Compile Contracts

```bash
# Compile Ethereum contracts
npx hardhat compile

# Verify compilation
npx hardhat size-contracts
```

### 2. Deploy to Ethereum Testnet

#### Deploy to Sepolia
```bash
# Deploy contracts
npx hardhat deploy --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <FACTORY_ADDRESS>
npx hardhat verify --network sepolia <IMPLEMENTATION_ADDRESS>
```

#### Deploy to Goerli
```bash
npx hardhat deploy --network goerli
npx hardhat verify --network goerli <FACTORY_ADDRESS>
```

### 3. Deploy to Solana Testnet

```bash
# Build Solana program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to testnet
anchor deploy --provider.cluster testnet
```

### 4. Update Configuration

After deployment, update your `.env` file:

```bash
# Contract addresses from deployment
NEXT_PUBLIC_MULTISIG_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_SOLANA_PROGRAM_ID=...
```

## 🧪 Testing Procedures

### 1. Contract Testing

#### Run Unit Tests
```bash
# Run all tests
npm test

# Run specific test files
npx hardhat test test/MultiSigWallet.test.ts
npx hardhat test test/WalletFactory.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

#### Integration Testing
```bash
# Test deployment verification
npx hardhat run scripts/test-deployment.ts --network sepolia

# Test with different scenarios
npx hardhat run scripts/test-scenarios.ts --network sepolia
```

### 2. Frontend Testing

#### Start Development Server
```bash
# Install frontend dependencies
npm install

# Start Next.js development server
npm run dev
```

#### Test User Flows

1. **Wallet Connection**
   - Connect MetaMask to Sepolia testnet
   - Connect Phantom/Solflare to Solana devnet
   - Verify wallet addresses display correctly

2. **Create MultiSig Wallet**
   - Navigate to dashboard
   - Click "Create Wallet"
   - Add 3 owner addresses
   - Set threshold to 2
   - Submit transaction
   - Verify wallet creation on block explorer

3. **Transaction Flow**
   - Send test funds to multisig wallet
   - Submit a transaction
   - Confirm from required owners
   - Execute transaction
   - Verify on block explorer

### 3. End-to-End Testing

#### Automated E2E Tests
```bash
# Install Playwright (if using)
npm install @playwright/test

# Run E2E tests
npm run test:e2e
```

#### Manual Testing Checklist

- [ ] Wallet connection works for both networks
- [ ] Create multisig wallet successfully
- [ ] View wallet details and owner list
- [ ] Submit transaction with proper validation
- [ ] Confirm transaction from multiple owners
- [ ] Execute transaction when threshold met
- [ ] View transaction history
- [ ] Handle edge cases (insufficient funds, invalid addresses)
- [ ] Responsive design on mobile devices
- [ ] Dark/light mode toggle works
- [ ] Error handling and user feedback

## 📊 Performance Testing

### Gas Usage Analysis
```bash
# Generate gas report
REPORT_GAS=true npx hardhat test

# Analyze contract size
npx hardhat size-contracts

# Profile gas usage
npx hardhat run scripts/gas-analysis.ts --network sepolia
```

### Load Testing
```bash
# Test multiple wallet creation
npx hardhat run scripts/load-test.ts --network sepolia

# Test concurrent transactions
npx hardhat run scripts/concurrent-test.ts --network sepolia
```

## 🔍 Monitoring & Debugging

### 1. Block Explorer Verification

#### Ethereum
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Goerli Etherscan](https://goerli.etherscan.io/)

#### Solana
- [Solana Explorer - Devnet](https://explorer.solana.com/?cluster=devnet)
- [Solana Explorer - Testnet](https://explorer.solana.com/?cluster=testnet)

### 2. Event Monitoring

```bash
# Monitor contract events
npx hardhat run scripts/event-monitor.ts --network sepolia

# Subscribe to real-time events
npx hardhat run scripts/realtime-monitor.ts --network sepolia
```

### 3. Common Issues & Solutions

#### Deployment Issues
```bash
# Issue: "insufficient funds for gas"
# Solution: Get more testnet ETH from faucets

# Issue: "nonce too high"
# Solution: Reset MetaMask account or use --gas-price flag

# Issue: "contract verification failed"  
# Solution: Wait 1-2 minutes after deployment, then verify
```

#### Frontend Issues
```bash
# Issue: RPC rate limiting
# Solution: Use your own RPC endpoint or implement retry logic

# Issue: Wallet not connecting
# Solution: Check network configuration and wallet network selection

# Issue: Transaction not appearing
# Solution: Check block explorer and wait for network confirmation
```

## 🚨 Security Testing

### 1. Access Control Tests
- Verify only owners can confirm transactions
- Test threshold enforcement
- Validate admin functions restrictions

### 2. Reentrancy Protection
- Test external contract calls
- Verify state changes before external calls
- Test against known attack vectors

### 3. Integer Overflow/Underflow
- Test edge cases with large numbers
- Verify SafeMath usage (or Solidity 0.8+ built-ins)

## 📈 Performance Benchmarks

### Expected Gas Costs (Sepolia)
- Factory deployment: ~2,000,000 gas
- Wallet creation: ~500,000 gas
- Transaction submission: ~100,000 gas
- Transaction confirmation: ~80,000 gas
- Transaction execution: ~50,000 gas

### Frontend Performance
- Page load time: <2 seconds
- Wallet connection: <5 seconds
- Transaction submission: <10 seconds

## 🎯 Test Scenarios

### Scenario 1: Basic 2-of-3 Multisig
1. Create wallet with 3 owners, threshold 2
2. Send 0.1 ETH to wallet
3. Submit transfer of 0.05 ETH
4. Confirm from 2 owners
5. Execute transaction

### Scenario 2: Advanced Features
1. Create wallet with timelock enabled
2. Test spending limits
3. Test social recovery
4. Test emergency pause

### Scenario 3: Cross-Chain Operations
1. Create wallets on both Ethereum and Solana
2. Test synchronized operations
3. Verify independent security models

## 📝 Reporting Issues

When reporting issues, include:
1. Network name and chain ID
2. Transaction hash (if applicable)
3. Error message and stack trace
4. Steps to reproduce
5. Browser/wallet versions
6. Screenshots or video recordings

## 🔄 Continuous Integration

### GitHub Actions Setup
```yaml
# .github/workflows/testnet-deploy.yml
name: Testnet Deployment
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx hardhat compile
      - run: npx hardhat test
      - run: npx hardhat deploy --network sepolia
```

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solana Program Library](https://spl.solana.com/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

---

*For issues or questions, please create an issue in the GitHub repository or contact the development team.* 
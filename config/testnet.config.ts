export const testnetConfig = {
  ethereum: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      blockExplorer: 'https://sepolia.etherscan.io',
      currency: {
        name: 'Sepolia Ether',
        symbol: 'SEP',
        decimals: 18,
      },
      faucets: [
        'https://sepoliafaucet.com/',
        'https://faucet.sepolia.dev/',
        'https://faucet.quicknode.com/ethereum/sepolia',
      ],
    },
    goerli: {
      chainId: 5,
      name: 'Goerli Testnet',
      rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      blockExplorer: 'https://goerli.etherscan.io',
      currency: {
        name: 'Goerli Ether',
        symbol: 'GoETH',
        decimals: 18,
      },
      faucets: [
        'https://goerlifaucet.com/',
        'https://faucet.goerli.mudit.blog/',
      ],
    },
  },
  solana: {
    devnet: {
      name: 'Solana Devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      wsUrl: 'wss://api.devnet.solana.com/',
      faucet: 'https://faucet.solana.com/',
      explorer: 'https://explorer.solana.com/?cluster=devnet',
    },
    testnet: {
      name: 'Solana Testnet',
      rpcUrl: 'https://api.testnet.solana.com',
      wsUrl: 'wss://api.testnet.solana.com/',
      faucet: 'https://faucet.solana.com/',
      explorer: 'https://explorer.solana.com/?cluster=testnet',
    },
  },
  contracts: {
    // These will be populated after deployment
    ethereum: {
      multiSigFactory: '',
      multiSigImplementation: '',
    },
    solana: {
      programId: '',
    },
  },
  testing: {
    accounts: {
      // Test account addresses for integration testing
      ethereum: [
        '0x742d35Cc6634C0532925a3b8D5c5C07d9b4E8a5',
        '0x742d35Cc6634C0532925a3b8D5c5C07d9b4E8a6',
        '0x742d35Cc6634C0532925a3b8D5c5C07d9b4E8a7',
      ],
      solana: [
        'H1HtKJk8YkD8G2jQvL5LqHWbmQ8T6QzGJKLjMh9GcJ5m',
        'H2HtKJk8YkD8G2jQvL5LqHWbmQ8T6QzGJKLjMh9GcJ5n',
        'H3HtKJk8YkD8G2jQvL5LqHWbmQ8T6QzGJKLjMh9GcJ5o',
      ],
    },
    scenarios: {
      basic: {
        owners: 3,
        threshold: 2,
        testAmount: '0.1', // ETH or SOL
      },
      advanced: {
        owners: 5,
        threshold: 3,
        testAmount: '1.0',
        timelock: 3600, // 1 hour
      },
    },
  },
  gas: {
    ethereum: {
      gasPrice: '20000000000', // 20 Gwei
      gasLimit: '3000000',
    },
  },
  monitoring: {
    healthCheck: {
      interval: 30000, // 30 seconds
      timeout: 10000, // 10 seconds
    },
    alerts: {
      failedTransactions: true,
      lowBalance: true,
      networkIssues: true,
    },
  },
} 
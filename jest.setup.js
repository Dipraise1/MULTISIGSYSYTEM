import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock wallet providers
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    wallet: null,
    wallets: [],
    select: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    signMessage: jest.fn(),
  }),
  ConnectionProvider: ({ children }) => children,
  WalletProvider: ({ children }) => children,
}))

jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
  }),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [],
    error: null,
    isLoading: false,
    pendingConnector: null,
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  WagmiConfig: ({ children }) => children,
  createConfig: jest.fn(),
  configureChains: jest.fn(() => ({
    chains: [],
    publicClient: {},
    webSocketPublicClient: {},
  })),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Shield: () => <svg data-testid="shield-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Menu: () => <svg data-testid="menu-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Moon: () => <svg data-testid="moon-icon" />,
  Sun: () => <svg data-testid="sun-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
  Wallet: () => <svg data-testid="wallet-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
  Send: () => <svg data-testid="send-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  DollarSign: () => <svg data-testid="dollar-sign-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
}))

// Setup global test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock 
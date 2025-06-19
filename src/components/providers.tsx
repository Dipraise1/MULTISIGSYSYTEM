'use client'

import { ReactNode } from 'react'
import { WagmiConfig, createConfig, configureChains, Connector } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'

// Configure chains for Ethereum
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, polygon, arbitrum],
  [publicProvider()]
)

// Get WalletConnect project ID with fallback
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo_project_id_placeholder'

// Configure connectors conditionally
const getConnectors = (): Connector[] => {
  const baseConnectors: Connector[] = [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ]

  // Only add WalletConnect if we have a valid project ID
  if (walletConnectProjectId && walletConnectProjectId !== 'demo_project_id_placeholder') {
    baseConnectors.push(
      new WalletConnectConnector({
        chains,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: 'MultiSig Wallet',
            description: 'Advanced Multi-Chain Security',
            url: 'https://multisigwallet.app',
            icons: ['https://multisigwallet.app/icon.png'],
          },
        },
      })
    )
  }

  return baseConnectors
}

// Configure Wagmi
const config = createConfig({
  autoConnect: true,
  connectors: getConnectors(),
  publicClient,
  webSocketPublicClient,
})

// Solana configuration
const network = WalletAdapterNetwork.Devnet

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Solana endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [])
  
  // Solana wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  return (
    <WagmiConfig config={config}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WagmiConfig>
  )
} 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'

export interface Transaction {
  id: string
  walletId: string
  to: string
  value: string
  data?: string
  token?: string
  status: 'pending' | 'confirmed' | 'executed' | 'failed'
  confirmations: string[]
  requiredConfirmations: number
  createdAt: Date
  executedAt?: Date
}

export interface MultiSigWallet {
  id: string
  name: string
  address: string
  chain: 'ethereum' | 'solana'
  owners: string[]
  threshold: number
  balance?: string
  transactions: Transaction[]
  createdAt: Date
}

export interface WalletHookReturn {
  // Connection state
  isConnected: boolean
  ethAddress?: string
  solAddress?: string
  
  // Wallet management
  wallets: MultiSigWallet[]
  loading: boolean
  error: string | null
  
  // Actions
  connectEthereum: () => Promise<void>
  connectSolana: () => Promise<void>
  disconnectWallet: () => Promise<void>
  createWallet: (params: CreateWalletParams) => Promise<void>
  submitTransaction: (params: SubmitTransactionParams) => Promise<void>
  confirmTransaction: (walletId: string, transactionId: string) => Promise<void>
  executeTransaction: (walletId: string, transactionId: string) => Promise<void>
  refreshWallets: () => Promise<void>
}

export interface CreateWalletParams {
  name: string
  owners: string[]
  threshold: number
  chain: 'ethereum' | 'solana'
  timelock?: number
  spendingLimit?: string
}

export interface SubmitTransactionParams {
  walletId: string
  to: string
  value: string
  data?: string
  token?: string
}

export function useWallet(): WalletHookReturn {
  const [wallets, setWallets] = useState<MultiSigWallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ethereum wallet connection
  const { address: ethAddress, isConnected: isEthConnected } = useAccount()
  const { connect: ethConnect, connectors } = useConnect()
  const { disconnect: ethDisconnect } = useDisconnect()

  // Solana wallet connection
  const { 
    publicKey: solPublicKey, 
    connected: isSolConnected, 
    connect: solConnect, 
    disconnect: solDisconnect 
  } = useSolanaWallet()

  const isConnected = isEthConnected || isSolConnected
  const solAddress = solPublicKey?.toString()

  const connectEthereum = useCallback(async () => {
    try {
      setError(null)
      const connector = connectors[0] // Use first available connector (MetaMask)
      if (connector) {
        ethConnect({ connector })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Ethereum wallet')
    }
  }, [ethConnect, connectors])

  const connectSolana = useCallback(async () => {
    try {
      setError(null)
      await solConnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Solana wallet')
    }
  }, [solConnect])

  const disconnectWallet = useCallback(async () => {
    try {
      setError(null)
      if (isEthConnected) {
        ethDisconnect()
      }
      if (isSolConnected) {
        await solDisconnect()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }, [isEthConnected, isSolConnected, ethDisconnect, solDisconnect])

  const createWallet = useCallback(async (params: CreateWalletParams) => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock implementation - replace with actual contract interaction
      const newWallet: MultiSigWallet = {
        id: `wallet-${Date.now()}`,
        name: params.name,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        chain: params.chain,
        owners: params.owners,
        threshold: params.threshold,
        balance: '0',
        transactions: [],
        createdAt: new Date()
      }
      
      setWallets(prev => [...prev, newWallet])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitTransaction = useCallback(async (params: SubmitTransactionParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        walletId: params.walletId,
        to: params.to,
        value: params.value,
        data: params.data,
        token: params.token,
        status: 'pending' as const,
        confirmations: [],
        requiredConfirmations: 2, // Default threshold
        createdAt: new Date()
      }
      
      setWallets(prev => prev.map(wallet => 
        wallet.id === params.walletId 
          ? { ...wallet, transactions: [...wallet.transactions, transaction] }
          : wallet
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit transaction')
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmTransaction = useCallback(async (walletId: string, transactionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const currentAddress = ethAddress || solAddress
      if (!currentAddress) {
        throw new Error('No wallet connected')
      }

      setWallets(prev => prev.map(wallet => {
        if (wallet.id !== walletId) return wallet
        
        return {
          ...wallet,
          transactions: wallet.transactions.map(tx => {
            if (tx.id !== transactionId) return tx
            
            const newConfirmations = [...tx.confirmations, currentAddress]
            const newStatus = newConfirmations.length >= tx.requiredConfirmations 
              ? 'confirmed' as const 
              : 'pending' as const
            
            return {
              ...tx,
              confirmations: newConfirmations,
              status: newStatus
            }
          })
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm transaction')
    } finally {
      setLoading(false)
    }
  }, [ethAddress, solAddress])

  const executeTransaction = useCallback(async (walletId: string, transactionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setWallets(prev => prev.map(wallet => {
        if (wallet.id !== walletId) return wallet
        
        return {
          ...wallet,
          transactions: wallet.transactions.map(tx => {
            if (tx.id !== transactionId) return tx
            
            return {
              ...tx,
              status: 'executed' as const,
              executedAt: new Date()
            }
          })
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute transaction')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshWallets = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock implementation - replace with actual data fetching
      // This would typically fetch from your backend or directly from blockchain
      console.log('Refreshing wallets...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh wallets')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (isConnected) {
      refreshWallets()
    }
  }, [isConnected, refreshWallets])

  return {
    isConnected,
    ethAddress,
    solAddress,
    wallets,
    loading,
    error,
    connectEthereum,
    connectSolana,
    disconnectWallet,
    createWallet,
    submitTransaction,
    confirmTransaction,
    executeTransaction,
    refreshWallets
  }
} 
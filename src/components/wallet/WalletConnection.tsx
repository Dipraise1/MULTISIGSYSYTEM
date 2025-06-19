'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, ChevronDown, CheckCircle, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WalletConnection() {
  const { 
    connectEthereum, 
    connectSolana, 
    disconnectWallet, 
    isConnected, 
    ethAddress, 
    solAddress 
  } = useWallet()
  
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (type: 'ethereum' | 'solana') => {
    setIsConnecting(true)
    try {
      if (type === 'ethereum') {
        await connectEthereum()
      } else {
        await connectSolana()
      }
      setShowWalletModal(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowWalletModal(!showWalletModal)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-xl border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          <div className="flex flex-col items-start">
            {ethAddress && (
              <span className="text-xs font-medium">ETH: {formatAddress(ethAddress)}</span>
            )}
            {solAddress && (
              <span className="text-xs font-medium">SOL: {formatAddress(solAddress)}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 p-4"
            >
              <div className="space-y-3">
                <div className="text-sm font-medium text-secondary-900 dark:text-white">
                  Connected Wallets
                </div>
                
                {ethAddress && (
                  <div className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">Ethereum</div>
                      <div className="text-sm font-mono text-secondary-900 dark:text-white">
                        {formatAddress(ethAddress)}
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
                
                {solAddress && (
                  <div className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">Solana</div>
                      <div className="text-sm font-mono text-secondary-900 dark:text-white">
                        {formatAddress(solAddress)}
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}

                <button
                  onClick={handleDisconnect}
                  className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  Disconnect All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>

      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                  Connect Wallet
                </h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                    Ethereum Wallets
                  </h4>
                  <button
                    onClick={() => handleConnect('ethereum')}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-600 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-secondary-900 dark:text-white">MetaMask</div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          Connect using browser wallet
                        </div>
                      </div>
                    </div>
                    {ethAddress ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                    Solana Wallets
                  </h4>
                  <button
                    onClick={() => handleConnect('solana')}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-600 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-secondary-900 dark:text-white">Phantom</div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          Connect using Phantom wallet
                        </div>
                      </div>
                    </div>
                    {solAddress ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> You can connect both Ethereum and Solana wallets to manage multi-chain assets.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 
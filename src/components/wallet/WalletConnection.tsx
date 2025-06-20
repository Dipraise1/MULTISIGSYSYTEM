'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, ChevronDown, CheckCircle, Circle } from 'lucide-react'

export function WalletConnection() {
  const { 
    isConnected, 
    ethAddress, 
    solAddress, 
    connectEthereum, 
    connectSolana, 
    disconnectWallet 
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

        {showWalletModal && (
          <div className="absolute right-0 mt-2 w-64 card p-4 z-10">
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-900 dark:text-white cartoon-font">
                🧡 Connected Wallets
              </div>
              
              {ethAddress && (
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Ethereum</div>
                    <div className="text-sm font-mono text-slate-900 dark:text-white">
                      {formatAddress(ethAddress)}
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              
              {solAddress && (
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Solana</div>
                    <div className="text-sm font-mono text-slate-900 dark:text-white">
                      {formatAddress(solAddress)}
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}

              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors cartoon-font"
              >
                Disconnect All
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        className="btn btn-primary btn-base cartoon-font flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span>🔗 Connect Farm</span>
      </button>

      {showWalletModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="card max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white cartoon-font">
                🔗 Connect Farm Wallet
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-slate-600 hover:text-orange-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 cartoon-font">
                  🌾 Ethereum Wallets
                </h4>
                <button
                  onClick={() => handleConnect('ethereum')}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">M</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900 dark:text-white cartoon-font">MetaMask</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Connect using browser wallet
                      </div>
                    </div>
                  </div>
                  {ethAddress ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 cartoon-font">
                  🚜 Solana Wallets
                </h4>
                <button
                  onClick={() => handleConnect('solana')}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900 dark:text-white cartoon-font">Phantom</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Connect using Phantom wallet
                      </div>
                    </div>
                  </div>
                  {solAddress ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <strong>🌾 Farm Note:</strong> You can connect both Ethereum and Solana wallets to manage multi-chain farm assets.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
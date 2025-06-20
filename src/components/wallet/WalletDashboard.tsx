'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
// Removed framer-motion for build compatibility
import { 
  Shield, 
  Plus, 
  Users, 
  Clock, 
  Send, 
  Eye,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import { CreateWalletModal } from './CreateWalletModal'

export function WalletDashboard() {
  const { wallets, loading } = useWallet()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChain, setFilterChain] = useState<'all' | 'ethereum' | 'solana'>('all')

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChain = filterChain === 'all' || wallet.chain === filterChain
    return matchesSearch && matchesChain
  })

  const totalValue = wallets.reduce((acc, wallet) => acc + parseFloat(wallet.balance || '0'), 0)
  const pendingTransactions = wallets.reduce((acc, wallet) => 
    acc + wallet.transactions.filter(tx => tx.status === 'pending').length, 0
  )

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-white/20 rounded-lg w-64 skeleton"></div>
            <div className="h-4 bg-white/10 rounded w-48 skeleton"></div>
          </div>
          <div className="h-12 bg-white/20 rounded-xl w-40 skeleton"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-white/20 rounded-xl mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-20 mb-2"></div>
                <div className="h-8 bg-white/20 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Wallets Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-white/20 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-32"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-16 bg-white/10 rounded-lg"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-white/10 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-white">
            Multi-Sig <span className="gradient-text">Wallets</span>
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            Manage your secure multi-signature wallets across multiple chains
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="btn-outline btn-sm flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="btn-outline btn-sm flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Wallet</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="wallet-gradient w-14 h-14 rounded-2xl flex items-center justify-center animate-glow">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="text-emerald-500">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Total Wallets</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-white">
              {wallets.length}
            </p>
            <p className="text-xs text-emerald-500 mt-1">+12% from last month</p>
          </div>
        </div>

        <div
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div className="text-emerald-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Total Value</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-white">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-500 mt-1">+8.2% this week</p>
          </div>
        </div>

        <div
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div className="text-amber-500">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-white">
              {pendingTransactions}
            </p>
            <p className="text-xs text-amber-500 mt-1">3 need attention</p>
          </div>
        </div>

        <div
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div className="text-blue-500">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Active</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-white">
              {wallets.filter(w => w.transactions.length > 0).length}
            </p>
            <p className="text-xs text-blue-500 mt-1">24h activity</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-secondary-400" />
            <select
              value={filterChain}
              onChange={(e) => setFilterChain(e.target.value as 'all' | 'ethereum' | 'solana')}
              className="input w-auto"
            >
              <option value="all">All Chains</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
          <Globe className="h-4 w-4" />
          <span>{filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      {/* Enhanced Wallets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredWallets.map((wallet, index) => (
          <div
            key={wallet.id}
            className="wallet-card"
          >
            {/* Wallet Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  wallet.chain === 'ethereum' 
                    ? 'ethereum-gradient' 
                    : 'solana-gradient'
                } animate-float`}>
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">
                    {wallet.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      wallet.chain === 'ethereum' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' 
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        wallet.chain === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      {wallet.chain.charAt(0).toUpperCase() + wallet.chain.slice(1)}
                    </span>
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      Created {new Date(wallet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="btn-outline btn-sm">
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedWallet(wallet.id)}
                  className="btn-primary btn-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2 uppercase tracking-wider">
                Wallet Address
              </p>
              <div className="glass-card p-4">
                <p className="text-sm font-mono text-secondary-900 dark:text-white break-all">
                  {wallet.address}
                </p>
              </div>
            </div>

            {/* Enhanced Wallet Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 glass-card">
                <div className="flex items-center justify-center space-x-1 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  <Users className="h-4 w-4" />
                  <span>Owners</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {wallet.owners.length}
                </p>
              </div>
              
              <div className="text-center p-4 glass-card">
                <div className="flex items-center justify-center space-x-1 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  <Shield className="h-4 w-4" />
                  <span>Threshold</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {wallet.threshold}/{wallet.owners.length}
                </p>
              </div>
              
              <div className="text-center p-4 glass-card">
                <div className="flex items-center justify-center space-x-1 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  <Activity className="h-4 w-4" />
                  <span>Txns</span>
                </div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {wallet.transactions.length}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Recent Activity
                </h4>
                {wallet.transactions.length > 0 && (
                  <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    View all ({wallet.transactions.length})
                  </button>
                )}
              </div>
              
              {wallet.transactions.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Send className="h-6 w-6 text-secondary-400" />
                  </div>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    No transactions yet
                  </p>
                  <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                    Create your first transaction to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallet.transactions.slice(0, 2).map((transaction) => (
                    <div key={transaction.id} className="glass-card p-4 hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <Send className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                              {transaction.value} {wallet.chain === 'ethereum' ? 'ETH' : 'SOL'}
                            </p>
                            <p className="text-xs text-secondary-600 dark:text-secondary-400">
                              To: {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'executed' ? 'status-executed' :
                            transaction.status === 'confirmed' ? 'status-confirmed' :
                            transaction.status === 'pending' ? 'status-pending' :
                            'status-failed'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            {transaction.confirmations.length}/{transaction.requiredConfirmations} confirmations
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-white/10">
              <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
              <button className="btn-outline flex-1 flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </button>
              <button className="btn-outline flex items-center justify-center px-4">
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredWallets.length === 0 && wallets.length === 0 && (
        <div
          className="text-center py-16"
        >
          <div className="glass-card p-12 max-w-md mx-auto">
            <div className="wallet-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
              Welcome to MultiSig
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-8 leading-relaxed">
              Create your first multi-signature wallet to start securing your digital assets with enterprise-grade protection.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary btn-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Wallet
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredWallets.length === 0 && wallets.length > 0 && (
        <div className="text-center py-12">
          <div className="glass-card p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              No wallets found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterChain('all')
              }}
              className="btn-outline btn-sm"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <CreateWalletModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

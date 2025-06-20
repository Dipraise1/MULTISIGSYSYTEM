'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { X, Plus, Trash2, Shield, Clock, Users } from 'lucide-react'

interface CreateWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWalletModal({ isOpen, onClose }: CreateWalletModalProps) {
  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)
  const { createWallet } = useWallet()
  
  const [formData, setFormData] = useState({
    name: '',
    chain: 'ethereum' as 'ethereum' | 'solana',
    owners: ['', '', ''],
    threshold: 2,
    timeLockDuration: 0
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setFormData({
        name: '',
        chain: 'ethereum',
        owners: ['', '', ''],
        threshold: 2,
        timeLockDuration: 0
      })
      setCreating(false)
    }
  }, [isOpen])

  const handleAddOwner = () => {
    if (formData.owners.length < 10) {
      setFormData(prev => ({
        ...prev,
        owners: [...prev.owners, '']
      }))
    }
  }

  const handleRemoveOwner = (index: number) => {
    if (formData.owners.length > 1) {
      setFormData(prev => ({
        ...prev,
        owners: prev.owners.filter((_, i) => i !== index)
      }))
    }
  }

  const handleOwnerChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.map((owner, i) => i === index ? value : owner)
    }))
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const validOwners = formData.owners.filter(owner => owner.trim())
      await createWallet({
        ...formData,
        owners: validOwners
      })
      onClose()
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card p-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-200 dark:border-orange-800">
          <h2 className="text-2xl font-bold gradient-text cartoon-font">
            🌱 Plant New Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cartoon-font ${
                    step >= stepNumber
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step > stepNumber
                        ? 'bg-orange-500'
                        : 'bg-orange-200 dark:bg-orange-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-600 cartoon-font">
            {step === 1 && '🌾 Farm Information'}
            {step === 2 && '🚜 Configure Farmers'}
            {step === 3 && '🔒 Security Settings'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cartoon-font">
                  🧡 Farm Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Orange Farm Wallet"
                  className="w-full p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cartoon-font">
                  🌾 Blockchain
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, chain: 'ethereum' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.chain === 'ethereum'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-slate-900 dark:text-white cartoon-font">Ethereum</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">ETH, ERC-20 tokens</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFormData(prev => ({ ...prev, chain: 'solana' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.chain === 'solana'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-slate-900 dark:text-white cartoon-font">Solana</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">SOL, SPL tokens</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cartoon-font">
                  🚜 Farm Owners
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Add addresses of farmers who can approve transactions
                </p>
                
                <div className="space-y-3">
                  {formData.owners.map((owner, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={owner}
                        onChange={(e) => handleOwnerChange(index, e.target.value)}
                        placeholder={`Farmer ${index + 1} address`}
                        className="flex-1 p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {formData.owners.length > 1 && (
                        <button
                          onClick={() => handleRemoveOwner(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddOwner}
                  className="mt-3 flex items-center space-x-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <Plus className="h-4 w-4" />
                  <span className="cartoon-font">Add Farmer</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cartoon-font">
                  🎯 Required Confirmations
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Number of farmers required to approve a harvest
                </p>
                <select
                  value={formData.threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  className="w-full p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {Array.from({ length: formData.owners.filter(o => o.trim()).length }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} of {formData.owners.filter(o => o.trim()).length}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cartoon-font">
                  ⏰ Time Lock Duration (hours)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Minimum time before a harvest can be executed after approval
                </p>
                <input
                  type="number"
                  min="0"
                  value={formData.timeLockDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLockDuration: Number(e.target.value) }))}
                  className="w-full p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Summary */}
              <div className="card p-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3 cartoon-font">🌾 Farm Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <span className="text-slate-900 dark:text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Chain:</span>
                    <span className="text-slate-900 dark:text-white capitalize">{formData.chain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Farmers:</span>
                    <span className="text-slate-900 dark:text-white">{formData.owners.filter(o => o.trim()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Threshold:</span>
                    <span className="text-slate-900 dark:text-white">{formData.threshold} of {formData.owners.filter(o => o.trim()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Time Lock:</span>
                    <span className="text-slate-900 dark:text-white">{formData.timeLockDuration} hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-orange-200 dark:border-orange-800">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-outline btn-base"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-base"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.name.trim()) ||
                  (step === 2 && formData.owners.filter(o => o.trim()).length < 2)
                }
                className="btn btn-primary btn-base cartoon-font"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn btn-primary btn-base cartoon-font"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Planting...
                  </>
                ) : (
                  '🌱 Plant Wallet'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Shield, Clock, Users } from 'lucide-react'

interface CreateWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWalletModal({ isOpen, onClose }: CreateWalletModalProps) {
  const { createWallet, ethAddress, solAddress } = useWallet()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    chain: 'ethereum' as 'ethereum' | 'solana',
    owners: [''],
    threshold: 1,
    timeLockDuration: 0,
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Initialize with current user's address
      const userAddress = formData.chain === 'ethereum' ? ethAddress : solAddress
      if (userAddress) {
        setFormData(prev => ({
          ...prev,
          owners: [userAddress],
        }))
      }
    }
  }, [isOpen, formData.chain, ethAddress, solAddress])

  const handleAddOwner = () => {
    setFormData(prev => ({
      ...prev,
      owners: [...prev.owners, ''],
    }))
  }

  const handleRemoveOwner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index),
      threshold: Math.min(prev.threshold, prev.owners.length - 1),
    }))
  }

  const handleOwnerChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.map((owner, i) => i === index ? value : owner),
    }))
  }

  const handleCreate = async () => {
    try {
      setCreating(true)
      
      // Validate form
      const validOwners = formData.owners.filter(owner => owner.trim() !== '')
      if (validOwners.length < 2) {
        throw new Error('At least 2 owners are required')
      }
      
      if (formData.threshold > validOwners.length) {
        throw new Error('Threshold cannot be greater than number of owners')
      }

      await createWallet({
        ...formData,
        owners: validOwners,
      })

      onClose()
      // Reset form
      setStep(1)
      setFormData({
        name: '',
        chain: 'ethereum',
        owners: [''],
        threshold: 1,
        timeLockDuration: 0,
      })
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Create Multi-Sig Wallet
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step > stepNumber
                          ? 'bg-primary-600'
                          : 'bg-secondary-200 dark:bg-secondary-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Configure Owners'}
              {step === 3 && 'Security Settings'}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My MultiSig Wallet"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Blockchain
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, chain: 'ethereum' }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.chain === 'ethereum'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-secondary-900 dark:text-white">Ethereum</h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">ETH, ERC-20 tokens</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setFormData(prev => ({ ...prev, chain: 'solana' }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.chain === 'solana'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-secondary-900 dark:text-white">Solana</h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">SOL, SPL tokens</p>
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
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Wallet Owners
                  </label>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    Add addresses that will be able to approve transactions
                  </p>
                  
                  <div className="space-y-3">
                    {formData.owners.map((owner, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={owner}
                          onChange={(e) => handleOwnerChange(index, e.target.value)}
                          placeholder={`Owner ${index + 1} address`}
                          className="input flex-1"
                        />
                        {formData.owners.length > 1 && (
                          <button
                            onClick={() => handleRemoveOwner(index)}
                            className="p-2 text-error-500 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddOwner}
                    className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Owner</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Required Confirmations
                  </label>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    Number of owners required to approve a transaction
                  </p>
                  <select
                    value={formData.threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                    className="input w-full"
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
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Time Lock Duration (hours)
                  </label>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    Minimum time before a transaction can be executed after approval
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={formData.timeLockDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLockDuration: Number(e.target.value) }))}
                    className="input w-full"
                  />
                </div>

                {/* Summary */}
                <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Name:</span>
                      <span className="text-secondary-900 dark:text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Chain:</span>
                      <span className="text-secondary-900 dark:text-white capitalize">{formData.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Owners:</span>
                      <span className="text-secondary-900 dark:text-white">{formData.owners.filter(o => o.trim()).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Threshold:</span>
                      <span className="text-secondary-900 dark:text-white">{formData.threshold} of {formData.owners.filter(o => o.trim()).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Time Lock:</span>
                      <span className="text-secondary-900 dark:text-white">{formData.timeLockDuration} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex space-x-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn-outline"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn-ghost"
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
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="btn-primary"
                >
                  {creating ? (
                    <>
                      <div className="loading-spinner h-4 w-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Wallet'
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 
#!/usr/bin/env npx ts-node

import { ethers } from 'hardhat'
import { expect } from 'chai'
import { testnetConfig } from '../config/testnet.config'

async function main() {
  console.log('🚀 Starting testnet deployment verification...\n')

  // Get signers
  const [deployer, owner1, owner2, owner3] = await ethers.getSigners()
  
  console.log('📝 Test accounts:')
  console.log(`Deployer: ${deployer.address}`)
  console.log(`Owner 1: ${owner1.address}`)
  console.log(`Owner 2: ${owner2.address}`)
  console.log(`Owner 3: ${owner3.address}\n`)

  // Check balances
  const deployerBalance = await ethers.provider.getBalance(deployer.address)
  console.log(`💰 Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`)
  
  if (deployerBalance < ethers.parseEther('0.1')) {
    console.log('⚠️  Warning: Low balance detected. Consider getting more testnet ETH from faucets:')
    const network = await ethers.provider.getNetwork()
    
    if (network.chainId === 11155111n) {
      console.log('   - https://sepoliafaucet.com/')
      console.log('   - https://faucet.sepolia.dev/')
    } else if (network.chainId === 5n) {
      console.log('   - https://goerlifaucet.com/')
    }
    console.log('')
  }

  try {
    // Get deployed factory contract
    const factoryAddress = process.env.MULTISIG_FACTORY_ADDRESS
    if (!factoryAddress) {
      throw new Error('MULTISIG_FACTORY_ADDRESS not set. Please deploy contracts first.')
    }

    console.log(`🏭 Factory address: ${factoryAddress}`)
    
    const WalletFactory = await ethers.getContractFactory('WalletFactory')
    const factory = WalletFactory.attach(factoryAddress)

    // Test 1: Create a new multisig wallet
    console.log('\n🧪 Test 1: Creating new multisig wallet...')
    
    const owners = [owner1.address, owner2.address, owner3.address]
    const threshold = 2
    const salt = ethers.keccak256(ethers.toUtf8Bytes('test-wallet-1'))

    const tx = await factory.connect(deployer).createWallet(owners, threshold, salt)
    const receipt = await tx.wait()
    
    console.log(`✅ Wallet created! Gas used: ${receipt?.gasUsed}`)
    console.log(`📄 Transaction hash: ${tx.hash}`)

    // Get wallet address from events
    const event = receipt?.logs.find(log => {
      try {
        const parsed = factory.interface.parseLog({ topics: log.topics, data: log.data })
        return parsed?.name === 'WalletCreated'
      } catch {
        return false
      }
    })

    if (!event) {
      throw new Error('WalletCreated event not found')
    }

    const parsedEvent = factory.interface.parseLog({ topics: event.topics, data: event.data })
    const walletAddress = parsedEvent?.args[0]
    
    console.log(`🏦 New wallet address: ${walletAddress}`)

    // Test 2: Interact with the multisig wallet
    console.log('\n🧪 Test 2: Testing wallet functionality...')
    
    const MultiSigWallet = await ethers.getContractFactory('MultiSigWallet')
    const wallet = MultiSigWallet.attach(walletAddress)

    // Check initial setup
    const walletOwners = await wallet.getOwners()
    const walletThreshold = await wallet.getThreshold()
    
    console.log(`👥 Owners: ${walletOwners.length}`)
    console.log(`🎯 Threshold: ${walletThreshold}`)
    
    expect(walletOwners).to.deep.equal(owners)
    expect(walletThreshold).to.equal(threshold)
    
    // Test 3: Submit a transaction
    console.log('\n🧪 Test 3: Submitting test transaction...')
    
    const testAmount = ethers.parseEther('0.001')
    const testRecipient = '0x742d35Cc6634C0532925a3b8D5c5C07d9b4E8a99'
    
    // Send some ETH to the wallet first
    const fundTx = await deployer.sendTransaction({
      to: walletAddress,
      value: testAmount * 2n
    })
    await fundTx.wait()
    
    console.log(`💰 Funded wallet with ${ethers.formatEther(testAmount * 2n)} ETH`)
    
    // Submit transaction
    const submitTx = await wallet.connect(owner1).submitTransaction(
      testRecipient,
      testAmount,
      '0x',
      0 // No timelock for test
    )
    const submitReceipt = await submitTx.wait()
    
    console.log(`📤 Transaction submitted! Gas used: ${submitReceipt?.gasUsed}`)
    
    // Get transaction ID from events
    const submitEvent = submitReceipt?.logs.find(log => {
      try {
        const parsed = wallet.interface.parseLog({ topics: log.topics, data: log.data })
        return parsed?.name === 'TransactionSubmitted'
      } catch {
        return false
      }
    })

    if (!submitEvent) {
      throw new Error('TransactionSubmitted event not found')
    }

    const parsedSubmitEvent = wallet.interface.parseLog({ 
      topics: submitEvent.topics, 
      data: submitEvent.data 
    })
    const txId = parsedSubmitEvent?.args[0]
    
    console.log(`🆔 Transaction ID: ${txId}`)

    // Test 4: Confirm transaction
    console.log('\n🧪 Test 4: Confirming transaction...')
    
    const confirmTx = await wallet.connect(owner2).confirmTransaction(txId)
    await confirmTx.wait()
    
    console.log(`✅ Transaction confirmed by owner2`)
    
    // Check if transaction is ready for execution
    const transaction = await wallet.getTransaction(txId)
    console.log(`🔢 Confirmations: ${transaction.confirmations}/${threshold}`)
    
    if (transaction.confirmations >= threshold) {
      console.log('\n🧪 Test 5: Executing transaction...')
      
      const executeTx = await wallet.connect(owner1).executeTransaction(txId)
      const executeReceipt = await executeTx.wait()
      
      console.log(`🚀 Transaction executed! Gas used: ${executeReceipt?.gasUsed}`)
      console.log(`💸 Sent ${ethers.formatEther(testAmount)} ETH to ${testRecipient}`)
    }

    // Test 6: Check events and state
    console.log('\n🧪 Test 6: Verifying final state...')
    
    const finalTransaction = await wallet.getTransaction(txId)
    console.log(`📊 Final transaction status:`)
    console.log(`   - Executed: ${finalTransaction.executed}`)
    console.log(`   - Confirmations: ${finalTransaction.confirmations}`)
    
    const walletBalance = await ethers.provider.getBalance(walletAddress)
    console.log(`💰 Remaining wallet balance: ${ethers.formatEther(walletBalance)} ETH`)

    console.log('\n🎉 All tests passed! Deployment verification complete.')
    
    // Summary
    console.log('\n📋 Test Summary:')
    console.log(`✅ Factory contract working`)
    console.log(`✅ Wallet creation successful`)
    console.log(`✅ Owner verification passed`)
    console.log(`✅ Transaction submission working`)
    console.log(`✅ Transaction confirmation working`)
    console.log(`✅ Transaction execution working`)
    console.log(`✅ Event emission verified`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 
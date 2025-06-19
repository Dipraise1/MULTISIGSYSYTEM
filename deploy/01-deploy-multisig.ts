import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployMultiSig: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log('----------------------------------------------------')
  log('Deploying MultiSig Wallet contracts...')
  log('----------------------------------------------------')

  // Deploy MultiSigWallet implementation
  const multiSigWallet = await deploy('MultiSigWallet', {
    from: deployer,
    args: [], // No constructor args for implementation
    log: true,
    waitConfirmations: network.config.chainId === 31337 ? 1 : 6,
  })

  // Deploy WalletFactory
  const walletFactory = await deploy('WalletFactory', {
    from: deployer,
    args: [], // Constructor will deploy implementation internally
    log: true,
    waitConfirmations: network.config.chainId === 31337 ? 1 : 6,
  })

  log('----------------------------------------------------')
  log(`MultiSigWallet implementation deployed to: ${multiSigWallet.address}`)
  log(`WalletFactory deployed to: ${walletFactory.address}`)
  log('----------------------------------------------------')

  // Verify contracts on Etherscan if not on localhost
  if (network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    log('Verifying contracts...')
    
    try {
      await hre.run('verify:verify', {
        address: multiSigWallet.address,
        constructorArguments: [],
      })
    } catch (error) {
      log('Error verifying MultiSigWallet:', error)
    }

    try {
      await hre.run('verify:verify', {
        address: walletFactory.address,
        constructorArguments: [],
      })
    } catch (error) {
      log('Error verifying WalletFactory:', error)
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contracts: {
      MultiSigWallet: {
        address: multiSigWallet.address,
        implementation: true,
      },
      WalletFactory: {
        address: walletFactory.address,
        factory: true,
      },
    },
    deployer,
    timestamp: new Date().toISOString(),
  }

  log('Deployment completed successfully!')
  log('Contract addresses saved to deployments directory')
}

deployMultiSig.tags = ['MultiSig', 'Factory']
deployMultiSig.dependencies = []

export default deployMultiSig 
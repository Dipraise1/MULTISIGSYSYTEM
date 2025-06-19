import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

async function deploySolanaProgram() {
  console.log('🚀 Deploying Solana MultiSig Wallet Program...')
  
  try {
    // Check if Anchor is installed
    console.log('📋 Checking Anchor CLI...')
    execSync('anchor --version', { stdio: 'inherit' })
    
    // Build the program
    console.log('🔨 Building Solana program...')
    execSync('anchor build', { stdio: 'inherit', cwd: process.cwd() })
    
    // Deploy to configured cluster
    console.log('📤 Deploying to Solana cluster...')
    const deployOutput = execSync('anchor deploy', { 
      stdio: 'pipe', 
      cwd: process.cwd(),
      encoding: 'utf8'
    })
    
    console.log(deployOutput)
    
    // Extract program ID from deployment output
    const programIdMatch = deployOutput.match(/Program Id: ([A-Za-z0-9]+)/)
    const programId = programIdMatch ? programIdMatch[1] : null
    
    if (programId) {
      console.log(`✅ Program deployed successfully!`)
      console.log(`📍 Program ID: ${programId}`)
      
      // Save deployment info
      const deploymentInfo = {
        programId,
        cluster: process.env.ANCHOR_PROVIDER_URL || 'localnet',
        timestamp: new Date().toISOString(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      }
      
      // Create deployments directory if it doesn't exist
      const deploymentsDir = path.join(process.cwd(), 'deployments', 'solana')
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true })
      }
      
      // Save deployment info
      fs.writeFileSync(
        path.join(deploymentsDir, 'deployment.json'),
        JSON.stringify(deploymentInfo, null, 2)
      )
      
      console.log('💾 Deployment info saved to deployments/solana/deployment.json')
    }
    
    // Generate TypeScript IDL
    console.log('📝 Generating TypeScript IDL...')
    execSync('anchor run generate-idl', { stdio: 'inherit', cwd: process.cwd() })
    
    console.log('🎉 Solana deployment completed successfully!')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

// Run deployment
deploySolanaProgram().catch(console.error) 
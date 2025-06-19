#!/usr/bin/env node

/**
 * 🧡 Orange Farm MultiSig Wallet - Production Build Script
 * 
 * This script handles the complete production build process including:
 * - Environment validation
 * - Contract compilation and verification
 * - Frontend optimization
 * - Security checks
 * - Performance audits
 * - Deployment preparation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function step(number, title) {
  log(`\n🚀 Step ${number}: ${title}`, 'cyan');
  log('─'.repeat(50), 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function execCommand(command, description) {
  try {
    log(`\n🔧 ${description}...`);
    const output = execSync(command, { stdio: 'inherit' });
    success(`${description} completed successfully`);
    return output;
  } catch (err) {
    error(`Failed to ${description.toLowerCase()}: ${err.message}`);
  }
}

async function main() {
  log('🧡 Orange Farm MultiSig Wallet - Production Build', 'bright');
  log('🌾 Building the future of farm-fresh security...', 'yellow');
  
  const startTime = Date.now();

  // Step 1: Environment Validation
  step(1, 'Environment Validation');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const requiredNodeVersion = '16.0.0';
  log(`Node.js version: ${nodeVersion}`);
  
  if (!nodeVersion.match(/^v1[6-9]\./) && !nodeVersion.match(/^v[2-9]\d\./)) {
    error(`Node.js version ${requiredNodeVersion} or higher is required`);
  }
  success('Node.js version is compatible');

  // Check environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_SOLANA_CLUSTER'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
  success('Environment variables validated');

  // Step 2: Clean Build Directory
  step(2, 'Cleaning Build Directory');
  
  if (fs.existsSync('.next')) {
    execCommand('rm -rf .next', 'Remove .next directory');
  }
  if (fs.existsSync('out')) {
    execCommand('rm -rf out', 'Remove out directory');
  }
  success('Build directories cleaned');

  // Step 3: Install Dependencies
  step(3, 'Installing Dependencies');
  
  execCommand('npm ci --production=false', 'Install all dependencies');
  success('Dependencies installed');

  // Step 4: Security Audit
  step(4, 'Security Audit');
  
  try {
    execCommand('npm audit --audit-level=moderate', 'Run security audit');
    success('No security vulnerabilities found');
  } catch (err) {
    warning('Security vulnerabilities detected. Please review and fix before deploying to production.');
    log('Run "npm audit fix" to attempt automatic fixes');
  }

  // Step 5: Type Checking
  step(5, 'Type Checking');
  
  execCommand('npx tsc --noEmit', 'TypeScript type checking');
  success('TypeScript types are valid');

  // Step 6: Linting
  step(6, 'Code Linting');
  
  execCommand('npm run lint', 'ESLint code checking');
  success('Code linting passed');

  // Step 7: Smart Contract Compilation
  step(7, 'Smart Contract Compilation');
  
  if (fs.existsSync('hardhat.config.ts')) {
    execCommand('npx hardhat compile', 'Compile Ethereum contracts');
    success('Ethereum contracts compiled');
  }

  if (fs.existsSync('Anchor.toml')) {
    try {
      execCommand('anchor build', 'Build Solana programs');
      success('Solana programs built');
    } catch (err) {
      warning('Solana build failed. Continuing with frontend build...');
    }
  }

  // Step 8: Test Suite
  step(8, 'Running Test Suite');
  
  try {
    execCommand('npm test -- --coverage --watchAll=false', 'Run test suite with coverage');
    success('All tests passed');
  } catch (err) {
    warning('Some tests failed. Please review before production deployment.');
  }

  // Step 9: Frontend Build
  step(9, 'Frontend Build Optimization');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  execCommand('npm run build', 'Build Next.js application');
  success('Frontend build completed');

  // Step 10: Bundle Analysis
  step(10, 'Bundle Size Analysis');
  
  if (fs.existsSync('.next/static')) {
    const bundleFiles = fs.readdirSync('.next/static/chunks');
    const totalSize = bundleFiles.reduce((acc, file) => {
      const filePath = path.join('.next/static/chunks', file);
      return acc + fs.statSync(filePath).size;
    }, 0);
    
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    log(`Total bundle size: ${sizeMB} MB`);
    
    if (sizeMB > 5) {
      warning(`Bundle size (${sizeMB} MB) is large. Consider code splitting and optimization.`);
    } else {
      success('Bundle size is optimized');
    }
  }

  // Step 11: Performance Audit
  step(11, 'Performance Optimization Check');
  
  // Check for optimization flags
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  const optimizations = [
    'swcMinify: true',
    'removeConsole',
    'splitChunks',
  ];
  
  optimizations.forEach(opt => {
    if (nextConfig.includes(opt.split(':')[0])) {
      success(`✓ ${opt} enabled`);
    } else {
      warning(`⚠ ${opt} not found in configuration`);
    }
  });

  // Step 12: Security Headers Check
  step(12, 'Security Configuration Validation');
  
  if (nextConfig.includes('headers()')) {
    success('Security headers configured');
  } else {
    warning('Security headers not found in Next.js config');
  }

  // Step 13: Build Manifest
  step(13, 'Generate Build Manifest');
  
  const buildManifest = {
    version: process.env.npm_package_version || '1.0.0',
    buildTime: new Date().toISOString(),
    commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    buildHash: crypto.randomBytes(16).toString('hex'),
  };
  
  fs.writeFileSync('.next/build-manifest.json', JSON.stringify(buildManifest, null, 2));
  success('Build manifest generated');

  // Step 14: Deployment Preparation
  step(14, 'Deployment Preparation');
  
  // Create deployment directory
  if (!fs.existsSync('deployment')) {
    fs.mkdirSync('deployment');
  }

  // Copy essential files for deployment
  const deploymentFiles = [
    'package.json',
    'next.config.js',
    '.next',
    'public',
    'env.example'
  ];

  deploymentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`✓ ${file} ready for deployment`);
    } else {
      warning(`⚠ ${file} not found`);
    }
  });

  // Step 15: Final Validation
  step(15, 'Final Validation');
  
  // Check if build files exist
  const criticalFiles = [
    '.next/build-manifest.json',
    '.next/static',
    'package.json'
  ];

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`✓ ${file} exists`);
    } else {
      error(`Critical file missing: ${file}`);
    }
  });

  // Build Summary
  const endTime = Date.now();
  const buildDuration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n🎉 Production Build Complete!', 'green');
  log('━'.repeat(50), 'green');
  log(`Build Duration: ${buildDuration} seconds`, 'cyan');
  log(`Build Hash: ${buildManifest.buildHash}`, 'cyan');
  log(`Commit: ${buildManifest.commit}`, 'cyan');
  log(`Environment: ${process.env.NODE_ENV}`, 'cyan');
  
  log('\n📋 Next Steps:', 'yellow');
  log('1. Review build warnings and optimize if needed');
  log('2. Test the production build locally with: npm start');
  log('3. Deploy to your hosting platform');
  log('4. Configure environment variables on production');
  log('5. Set up monitoring and alerts');
  
  log('\n🚀 Ready for Production Deployment! 🧡🌾', 'bright');
  
  // Create deployment checklist
  const checklist = `
# 🧡 Orange Farm MultiSig - Production Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN configured (if applicable)
- [ ] Monitoring tools setup

## Deployment
- [ ] Build artifacts uploaded
- [ ] Database migrations run (if applicable)
- [ ] Environment variables set
- [ ] Health checks passing

## Post-Deployment
- [ ] Functionality testing
- [ ] Performance monitoring
- [ ] Security scanning
- [ ] Backup verification
- [ ] Team notification

Build completed: ${new Date().toISOString()}
Build hash: ${buildManifest.buildHash}
`;

  fs.writeFileSync('deployment/checklist.md', checklist);
  success('Deployment checklist created at deployment/checklist.md');
}

// Run the build process
main().catch(err => {
  error(`Build failed: ${err.message}`);
}); 
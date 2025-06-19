# 🧡 OrangeFarm MultiSig - Production Deployment Guide

Complete guide for deploying OrangeFarm MultiSig to production environments with enterprise-grade security and performance.

## 📋 Table of Contents

1. [Pre-Deployment Requirements](#pre-deployment-requirements)
2. [Environment Configuration](#environment-configuration)
3. [Build & Optimization](#build--optimization)
4. [Deployment Platforms](#deployment-platforms)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Performance Optimization](#performance-optimization)
8. [Post-Deployment Checklist](#post-deployment-checklist)

## 🚀 Pre-Deployment Requirements

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Hardware**: 2GB RAM minimum, 4GB recommended

### Domain & SSL
- [ ] Domain registered and configured
- [ ] SSL certificate installed (Let's Encrypt or commercial)
- [ ] DNS records configured (A, AAAA, CNAME)
- [ ] CDN configured (Cloudflare, AWS CloudFront, etc.)

### Blockchain Infrastructure
- [ ] Ethereum RPC endpoints (Infura, Alchemy, QuickNode)
- [ ] Solana RPC endpoints
- [ ] Smart contracts deployed to mainnet
- [ ] Contract addresses verified on block explorers

## 🔧 Environment Configuration

### 1. Copy Environment Template
```bash
cp env.example .env.production
```

### 2. Configure Production Variables

#### Critical Production Settings
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Blockchain Networks
NEXT_PUBLIC_CHAIN_ID=1  # Ethereum Mainnet
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta

# RPC URLs (Use your own endpoints!)
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Contract Addresses
NEXT_PUBLIC_MULTISIG_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_SOLANA_PROGRAM_ID=...

# Security
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### Monitoring & Analytics
```bash
# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

## 🏗️ Build & Optimization

### 1. Run Production Build
```bash
# Complete production build with all checks
npm run build:production

# Alternative: Standard build
npm run build
```

### 2. Bundle Analysis
```bash
# Analyze bundle size and optimization
npm run build:analyze
```

### 3. Performance Testing
```bash
# Test production build locally
npm run start

# Run comprehensive tests
npm run full-test-suite
```

## 🌐 Deployment Platforms

### Vercel (Recommended)

#### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "name": "orangefarm-multisig",
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Netlify

#### Deploy Commands
```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables
# Set in Netlify dashboard
```

#### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_ENV = "production"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### AWS (Advanced)

#### S3 + CloudFront
```bash
# Build for static export
npm run build
npm run export

# Upload to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### EC2 + Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

### Google Cloud Platform

#### App Engine
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  NEXT_PUBLIC_APP_URL: https://your-app.appspot.com

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

## 🔒 Security Hardening

### 1. Environment Variables Security
- [ ] Use secret management services (AWS Secrets Manager, Azure Key Vault)
- [ ] Never commit `.env` files to version control
- [ ] Rotate API keys regularly
- [ ] Use different keys for different environments

### 2. Content Security Policy (CSP)
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com;
      img-src 'self' data: blob:;
      connect-src 'self' *.infura.io *.solana.com *.walletconnect.org;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### 3. Rate Limiting
```javascript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const limit = 100 // Requests per 15 minutes
  const windowMs = 15 * 60 * 1000 // 15 minutes

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, resetTime: Date.now() + windowMs })
  }

  const requestData = rateLimitMap.get(ip)

  if (Date.now() > requestData.resetTime) {
    requestData.count = 0
    requestData.resetTime = Date.now() + windowMs
  }

  if (requestData.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  requestData.count += 1
  return NextResponse.next()
}
```

## 📊 Monitoring & Analytics

### 1. Sentry Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure sentry.client.config.js
import { init } from '@sentry/nextjs'

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### 2. Google Analytics
```javascript
// lib/gtag.js
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

### 3. Uptime Monitoring
Set up monitoring with:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring and alerting
- **StatusPage**: Public status page for users

### 4. Performance Monitoring
```javascript
// lib/performance.js
export function measurePageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      
      // Send to analytics
      gtag('event', 'page_load_time', {
        value: loadTime,
        event_category: 'Performance'
      })
    })
  }
}
```

## ⚡ Performance Optimization

### 1. CDN Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Database Caching (if applicable)
```javascript
// lib/cache.js
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function cacheGet(key) {
  try {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function cacheSet(key, value, ttl = 3600) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}
```

### 3. Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Compress images (WebP, AVIF)
- Use appropriate image sizes for different devices

## ✅ Post-Deployment Checklist

### Immediate Post-Deployment (Within 1 hour)
- [ ] Site is accessible via production URL
- [ ] SSL certificate is working correctly
- [ ] All environment variables are configured
- [ ] Wallet connections are working
- [ ] Contract interactions are functional
- [ ] Analytics tracking is active
- [ ] Error monitoring is capturing events

### Within 24 Hours
- [ ] Performance audit completed
- [ ] Security scan performed
- [ ] Backup systems verified
- [ ] Monitoring alerts configured
- [ ] Team has been notified of deployment
- [ ] Documentation updated

### Within 1 Week
- [ ] User feedback collected
- [ ] Performance metrics reviewed
- [ ] Security audit scheduled
- [ ] Disaster recovery plan tested
- [ ] Scaling plan reviewed

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables
npm run build:production 2>&1 | grep -i "missing"
```

#### Performance Issues
```bash
# Analyze bundle
npm run build:analyze

# Check server response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

### Support Contacts
- **Technical Issues**: tech@orangefarm-multisig.com
- **Security Issues**: security@orangefarm-multisig.com
- **Emergency**: emergency@orangefarm-multisig.com

## 🎉 Success!

Your OrangeFarm MultiSig is now live in production! 🧡🌾

Remember to:
- Monitor performance and errors
- Keep dependencies updated
- Regularly review security settings
- Backup important data
- Plan for scaling as usage grows

For ongoing support and updates, visit our [documentation](https://docs.orangefarm-multisig.com) or join our [Discord community](https://discord.gg/orangefarm). 
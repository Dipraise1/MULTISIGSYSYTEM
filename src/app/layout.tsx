import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MultiSig Wallet - Advanced Multi-Chain Security',
  description: 'Next-generation multi-signature wallet for Ethereum and Solana with advanced security features',
  keywords: ['multisig', 'wallet', 'ethereum', 'solana', 'web3', 'crypto', 'security'],
  authors: [{ name: 'MultiSig Wallet Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} transition-colors`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 
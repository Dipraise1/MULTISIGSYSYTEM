import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'

// Use system fonts instead of Google Fonts for better reliability
const inter = {
  className: 'font-inter'
}

export const metadata: Metadata = {
  title: {
    default: '🧡 OrangeFarm MultiSig - Farm-Fresh Wallet Security',
    template: '%s | OrangeFarm MultiSig'
  },
  description: 'Next-generation multi-signature wallet for Ethereum and Solana with farm-fresh security. Plant your seeds, harvest your rewards with military-grade multi-sig protection.',
  keywords: [
    'multisig', 'multi-signature', 'wallet', 'ethereum', 'solana', 'web3', 
    'crypto', 'defi', 'security', 'blockchain', 'orange farm', 'yield farming',
    'smart contracts', 'dapp', 'decentralized', 'cryptocurrency'
  ],
  authors: [{ name: 'OrangeFarm MultiSig Team', url: 'https://orangefarm-multisig.com' }],
  creator: 'OrangeFarm MultiSig',
  publisher: 'OrangeFarm MultiSig',
  category: 'Technology',
  classification: 'Blockchain Technology',
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: '🧡 OrangeFarm MultiSig - Farm-Fresh Wallet Security',
    description: 'Plant your seeds, harvest your rewards with military-grade multi-sig protection for Ethereum and Solana.',
    url: 'https://orangefarm-multisig.com',
    siteName: 'OrangeFarm MultiSig',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OrangeFarm MultiSig - Farm-Fresh Security',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: '🧡 OrangeFarm MultiSig - Farm-Fresh Security',
    description: 'Next-generation multi-signature wallet for Ethereum and Solana',
    images: ['/twitter-image.png'],
    creator: '@orangefarm_ms',
  },
  
  // Additional SEO metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // App-specific metadata
  applicationName: 'OrangeFarm MultiSig',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  
  // Verification for search engines
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  
  // Additional meta tags
  other: {
    'theme-color': '#ff9500',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'OrangeFarm MultiSig',
    'msapplication-TileColor': '#ff9500',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ff9500' },
    { media: '(prefers-color-scheme: dark)', color: '#431407' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//api.mainnet-beta.solana.com" />
        <link rel="dns-prefetch" href="//mainnet.infura.io" />
        
        {/* Security headers */}
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OrangeFarm MultiSig" />
        
        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'OrangeFarm MultiSig',
              description: 'Farm-fresh multi-signature wallet for Ethereum and Solana',
              url: 'https://orangefarm-multisig.com',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'OrangeFarm MultiSig Team',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} transition-colors antialiased`}>
        {/* No-script fallback */}
        <noscript>
          <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#ff9500',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            🧡 Please enable JavaScript to use OrangeFarm MultiSig wallet.
          </div>
        </noscript>
        
        <Providers>
          {children}
        </Providers>
        
        {/* Service Worker registration for PWA */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('🧡 Service Worker registered successfully');
                    })
                    .catch((error) => {
                      console.log('Service Worker registration failed:', error);
                    });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  )
} 
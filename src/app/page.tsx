'use client'

import Header from '@/components/layout/Header'
import { WalletDashboard } from '@/components/wallet/WalletDashboard'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-float">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-4 sm:mb-6 cartoon-font">
              🧡 Welcome to OrangeFarm MultiSig 🌾
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto cartoon-font">
              Farm-fresh security for your digital assets! Our multi-signature wallet brings 
              the warmth of an orange grove to the world of decentralized finance.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
            <button className="btn btn-primary btn-lg cartoon-font animate-glow">
              🌱 Plant Your First Wallet
            </button>
            <button className="btn btn-secondary btn-lg cartoon-font">
              🚜 Explore Farm Features
            </button>
          </div>

          {/* Farm Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div className="card p-4 sm:p-6 text-center animate-slide-up">
              <div className="text-3xl sm:text-4xl mb-3">🧡</div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text cartoon-font">12,543</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">Orange Trees Protected</p>
            </div>
            <div className="card p-4 sm:p-6 text-center animate-slide-up">
              <div className="text-3xl sm:text-4xl mb-3">🌾</div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text cartoon-font">$2.1M</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">Farm Value Secured</p>
            </div>
            <div className="card p-4 sm:p-6 text-center animate-slide-up">
              <div className="text-3xl sm:text-4xl mb-3">🚜</div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text cartoon-font">8,912</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">Harvest Transactions</p>
            </div>
            <div className="card p-4 sm:p-6 text-center animate-slide-up">
              <div className="text-3xl sm:text-4xl mb-3">🌱</div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text cartoon-font">99.9%</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">Farm Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="px-4 pb-12 sm:pb-16">
        <div className="container mx-auto">
          <WalletDashboard />
        </div>
      </section>

      {/* Farm Features */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center gradient-text mb-8 sm:mb-12 cartoon-font">
            🌾 Farm-Fresh Features 🌾
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card p-6 sm:p-8 text-center hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🧡</div>
              <h3 className="text-lg sm:text-xl font-bold gradient-text mb-4 cartoon-font">Orange Grove Security</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">
                Multi-signature protection as sweet as fresh oranges, keeping your assets safe and sound.
              </p>
            </div>
            
            <div className="card p-6 sm:p-8 text-center hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🚜</div>
              <h3 className="text-lg sm:text-xl font-bold gradient-text mb-4 cartoon-font">Harvest Transactions</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">
                Efficient transaction processing powered by farm-to-table blockchain technology.
              </p>
            </div>
            
            <div className="card p-6 sm:p-8 text-center hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🌱</div>
              <h3 className="text-lg sm:text-xl font-bold gradient-text mb-4 cartoon-font">Grow Your Portfolio</h3>
              <p className="text-sm sm:text-base text-slate-600 cartoon-font">
                Watch your digital assets flourish in our nurturing DeFi ecosystem.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center mt-12 sm:mt-16">
            <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-4 cartoon-font">
                Ready to Start Farming? 🚜
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6 cartoon-font">
                Join thousands of farmers who trust OrangeFarm MultiSig to protect their digital harvest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary btn-lg cartoon-font">
                  🌱 Start Farming Now
                </button>
                <button className="btn btn-outline btn-lg cartoon-font">
                  📚 Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="container mx-auto text-center">
          <div className="text-white mb-4">
            <h3 className="text-xl sm:text-2xl font-bold cartoon-font mb-2">🧡 OrangeFarm MultiSig 🧡</h3>
            <p className="text-sm sm:text-base cartoon-font">Cultivating security, harvesting trust</p>
          </div>
          <div className="flex justify-center gap-4 text-2xl sm:text-3xl">
            <span className="animate-bounce">🌾</span>
            <span className="animate-bounce">🚜</span>
            <span className="animate-bounce">🧡</span>
            <span className="animate-bounce">🌱</span>
          </div>
          <div className="mt-6 pt-6 border-t border-orange-400">
            <p className="text-sm text-orange-100 cartoon-font">
              © 2024 OrangeFarm MultiSig. All rights reserved. 🌾
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
} 
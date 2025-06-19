'use client'

import Header from '@/components/layout/Header'
import { WalletDashboard } from '@/components/wallet/WalletDashboard'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-float">
            <h1 className="text-5xl font-bold gradient-text mb-6 cartoon-font">
              🧡 Welcome to OrangeFarm MultiSig 🌾
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto cartoon-font">
              Farm-fresh security for your digital assets! Our multi-signature wallet brings 
              the warmth of an orange grove to the world of decentralized finance.
            </p>
          </div>
          
          <div className="flex justify-center gap-6 mb-16">
            <button className="btn btn-primary text-lg px-8 py-4 cartoon-font animate-glow">
              🌱 Plant Your First Wallet
            </button>
            <button className="btn btn-secondary text-lg px-8 py-4 cartoon-font">
              🚜 Explore Farm Features
            </button>
          </div>

          {/* Farm Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="card p-6 text-center animate-slide-up">
              <div className="text-4xl mb-3">🧡</div>
              <h3 className="text-2xl font-bold gradient-text cartoon-font">12,543</h3>
              <p className="text-slate-600 cartoon-font">Orange Trees Protected</p>
            </div>
            <div className="card p-6 text-center animate-slide-up">
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="text-2xl font-bold gradient-text cartoon-font">$2.1M</h3>
              <p className="text-slate-600 cartoon-font">Farm Value Secured</p>
            </div>
            <div className="card p-6 text-center animate-slide-up">
              <div className="text-4xl mb-3">🚜</div>
              <h3 className="text-2xl font-bold gradient-text cartoon-font">8,912</h3>
              <p className="text-slate-600 cartoon-font">Harvest Transactions</p>
            </div>
            <div className="card p-6 text-center animate-slide-up">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="text-2xl font-bold gradient-text cartoon-font">99.9%</h3>
              <p className="text-slate-600 cartoon-font">Farm Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          <WalletDashboard />
        </div>
      </section>

      {/* Farm Features */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center gradient-text mb-12 cartoon-font">
            🌾 Farm-Fresh Features 🌾
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:scale-105 transition-all">
              <div className="text-6xl mb-4 animate-bounce">🧡</div>
              <h3 className="text-xl font-bold gradient-text mb-4 cartoon-font">Orange Grove Security</h3>
              <p className="text-slate-600 cartoon-font">
                Multi-signature protection as sweet as fresh oranges, keeping your assets safe and sound.
              </p>
            </div>
            
            <div className="card p-8 text-center hover:scale-105 transition-all">
              <div className="text-6xl mb-4 animate-bounce">🚜</div>
              <h3 className="text-xl font-bold gradient-text mb-4 cartoon-font">Harvest Transactions</h3>
              <p className="text-slate-600 cartoon-font">
                Efficient transaction processing powered by farm-to-table blockchain technology.
              </p>
            </div>
            
            <div className="card p-8 text-center hover:scale-105 transition-all">
              <div className="text-6xl mb-4 animate-bounce">🌱</div>
              <h3 className="text-xl font-bold gradient-text mb-4 cartoon-font">Grow Your Portfolio</h3>
              <p className="text-slate-600 cartoon-font">
                Watch your digital assets flourish in our nurturing DeFi ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Footer */}
      <footer className="py-12 px-4 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="container mx-auto text-center">
          <div className="text-white mb-4">
            <h3 className="text-2xl font-bold cartoon-font mb-2">🧡 OrangeFarm MultiSig 🧡</h3>
            <p className="cartoon-font">Cultivating security, harvesting trust</p>
          </div>
          <div className="flex justify-center gap-4 text-3xl">
            <span className="animate-bounce">🌾</span>
            <span className="animate-bounce">🚜</span>
            <span className="animate-bounce">🧡</span>
            <span className="animate-bounce">🌱</span>
          </div>
        </div>
      </footer>
    </main>
  )
} 
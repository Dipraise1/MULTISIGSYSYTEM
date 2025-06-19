'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  return (
    <header className="navbar">
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl wallet-gradient flex items-center justify-center shadow-medium animate-float">
              <span className="text-2xl">🧡</span>
            </div>
            <div>
              <h1 className="navbar-brand cartoon-font">
                OrangeFarm MultiSig
              </h1>
              <p className="text-xs text-slate-600 cartoon-font">
                Farm-Fresh Wallet Security 🌾
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <a href="#dashboard" className="nav-link active">
              🏠 Dashboard
            </a>
            <a href="#create" className="nav-link">
              🌱 Create Wallet
            </a>
            <a href="#transactions" className="nav-link">
              🚜 Transactions
            </a>
            <a href="#settings" className="nav-link">
              ⚙️ Settings
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-slow"></div>
              <span className="text-sm font-medium cartoon-font">Testnet</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="theme-toggle animate-glow"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>

            {/* Connect Wallet Button */}
            <button className="btn btn-primary cartoon-font animate-bounce">
              🌾 Connect Farm Wallet
            </button>
          </div>
        </div>

        {/* Farm-themed decorative border */}
        <div className="mt-4 h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-600 rounded-full"></div>
      </div>
    </header>
  )
} 
'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true'
      setIsDark(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { name: '🏠 Dashboard', href: '#dashboard', active: true },
    { name: '🌱 Create Wallet', href: '#create' },
    { name: '🚜 Transactions', href: '#transactions' },
    { name: '⚙️ Settings', href: '#settings' },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }

    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="navbar">
        <div className="container">
          <div className="navbar-content">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="navbar-logo wallet-gradient shadow-medium animate-float">
                <span>🧡</span>
              </div>
              <div className="navbar-title">
                <h1 className="navbar-brand cartoon-font">
                  OrangeFarm MultiSig
                </h1>
                <p className="navbar-subtitle cartoon-font">
                  Farm-Fresh Wallet Security 🌾
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="nav-links">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${item.active ? 'active' : ''}`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="navbar-actions">
              {/* Network Indicator */}
              <div className="network-indicator">
                <div className="network-dot"></div>
                <span className="cartoon-font">Testnet</span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle dark mode"
              >
                {isDark ? '🌞' : '🌙'}
              </button>

              {/* Connect Wallet Button - Hidden on mobile, shown on desktop */}
              <button className="btn btn-primary btn-base cartoon-font hidden lg:flex">
                🌾 Connect Farm Wallet
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className={`mobile-menu-btn lg:hidden ${isMobileMenuOpen ? 'active' : ''}`}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
      )}

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl wallet-gradient flex items-center justify-center">
              <span className="text-lg">🧡</span>
            </div>
            <h2 className="text-lg font-bold cartoon-font gradient-text">
              OrangeFarm
            </h2>
          </div>
          <button
            onClick={closeMobileMenu}
            className="btn btn-ghost btn-icon"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-nav-links">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`mobile-nav-link ${item.active ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {item.name}
            </a>
          ))}
          
          {/* Mobile Connect Button */}
          <div className="p-4 border-t border-orange-200 dark:border-orange-800 mt-4">
            <button 
              className="btn btn-primary btn-base w-full cartoon-font"
              onClick={closeMobileMenu}
            >
              🌾 Connect Farm Wallet
            </button>
          </div>
        </div>
      </nav>
    </>
  )
} 
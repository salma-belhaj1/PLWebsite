import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { session, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang } = useLanguage()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, openCart } = ((): any => {
    try {
      // dynamic import to avoid circular during initial edits
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ctx = require('../context/CartContext')
      return ctx.useCart()
    } catch (e) {
      return { cartCount: 0, openCart: () => {} }
    }
  })()

  // Search state (debounced navigation to /shop?q=...)
  const [searchVal, setSearchVal] = useState('')
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    // initialize from query param when header mounts or location changes
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    setSearchVal(q)
  }, [location.search])

  useEffect(() => {
    // debounce navigation
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const encoded = encodeURIComponent(searchVal || '')
      // navigate only when on shop or to set query param
      navigate(`/shop${encoded ? `?q=${encoded}` : ''}`, { replace: true })
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchVal, navigate])

  async function handleSignOut() {
    try {
      await signOut()
      toast.success(t('signOut'))
    } catch (error) {
      toast.error('Sign out failed')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 py-3 slide-in-down">
      {/* Announcement ribbon */}
      <div className="w-full bg-pl-pink/6 text-center py-2 text-sm font-century tracking-wide overflow-hidden border-b border-pl-pink/10">
        <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 14s linear infinite' }}>
          {t('announcement.welcome')}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(100%) } 100% { transform: translateX(-100%) } }`}</style>
      </div>

      <nav className="theme-navbar max-w-[1440px] mx-auto rounded-2xl backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.2)] px-4 lg:px-7 py-3 flex items-center justify-between gap-4">
        {/* Logo - use theme-specific images stored in public/media */}
        <Link to="/" className="flex items-center gap-3 hover-lift group min-w-0">
          <img
            src={theme === 'dark' ? '/media/logo-dark.png' : '/media/logo-light.png'}
            alt={t('home')}
            className="h-9 lg:h-10 w-auto"
          />
          <div className="hidden sm:block min-w-0">
            <h1 className={`text-2xl font-stayvibes smooth-transition ${theme === 'dark' ? 'text-pl-white' : 'text-pl-pink'}`}>
              Peace & Love
            </h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'} font-century truncate`}>Beauty & Serenity</p>
          </div>
        </Link>

        {/* Desktop Search - center */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-md relative">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full text-sm placeholder:text-stone-400 bg-stone-50 text-pl-black py-2.5 pl-4 pr-10 rounded-full border border-stone-100 focus:outline-none focus:ring-2 focus:ring-pl-pink/30 focus:border-pl-pink transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-pl-white"
              aria-label={t('search.placeholder')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pl-pink/60 text-sm">🔍</span>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="hidden lg:flex items-center justify-center flex-1 gap-8 xl:gap-10 px-4">
          <li>
            <Link 
              to="/" 
              className={`font-century smooth-transition hover:text-pl-pink relative group ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black/80'}`}
            >
              {t('home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </Link>
          </li>
          <li>
            <Link 
              to="/shop" 
              className={`font-century smooth-transition hover:text-pl-pink relative group ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black/80'}`}
            >
              {t('shop')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`font-century smooth-transition hover:text-pl-pink relative group ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black/80'}`}
              >
                {t('admin')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
              </Link>
            </li>
          )}
          <li>
            <a 
              href="https://www.instagram.com/peace.love.tn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-century smooth-transition hover:text-pl-pink relative group ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black/80'}`}
            >
              {t('instagram')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </a>
          </li>
        </ul>

        {/* Auth & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle - pill switch with icons */}
          <button
            aria-label={t('toggleTheme')}
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-8 w-16 rounded-full p-1 focus:outline-none transition-colors border ${theme === 'dark' ? 'bg-pl-white/10 border-pl-white/20' : 'bg-pl-black/10 border-pl-black/10'}`}>
            <span className="absolute left-2 text-sm opacity-90">☀️</span>
            <span className="absolute right-2 text-sm opacity-90">🌙</span>
            <span className={`relative block h-6 w-6 rounded-full shadow-md transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-7 bg-white' : 'translate-x-0 bg-pl-pink'}`}></span>
            <span className="sr-only">{t('toggleTheme')}</span>
          </button>

          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
            className={`bg-transparent border ${theme === 'dark' ? 'border-pl-white/20 text-pl-white' : 'border-pl-black/10 text-pl-black'} rounded-lg px-2 py-1.5 text-sm`}
            aria-label={t('language')}
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>

          {/* Cart / Bag button */}
          <button onClick={() => openCart()} className="relative cursor-pointer p-3 rounded-xl bg-pl-pink text-white hover:bg-pl-red transition-all flex items-center justify-center shadow-md shadow-pl-pink/20 font-century">
            <span className="text-xs font-semibold pl-1 pr-2 hidden sm:inline">{t('cart.bag')}</span>
            <span className="text-sm">👜</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pl-black text-[9px] font-bold text-white border border-white dark:border-zinc-950 font-mono">{cartCount}</span>
            )}
          </button>

          {session && (
            <button onClick={handleSignOut} className="hidden lg:inline-flex btn-outline rounded-xl px-4 py-2 font-century smooth-transition">
              {t('signOut')}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-pl-pink text-2xl hover:text-pl-red smooth-transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`lg:hidden mt-2 rounded-2xl fade-in border backdrop-blur-md ${theme === 'dark' ? 'bg-pl-black/95 border-pl-pink/20' : 'bg-white/95 border-pl-pink/30'}`}>
          <ul className="flex flex-col gap-4 p-4">
            <li>
              <Link 
                to="/" 
                className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition block py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
            </li>
            <li>
              <Link 
                to="/shop" 
                className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition block py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('shop')}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition block py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('admin')}
                </Link>
              </li>
            )}
            {session && (
              <li>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition block py-2 w-full text-left`}
                >
                  {t('signOut')}
                </button>
              </li>
            )}
            <li>
              <a 
                href="https://www.instagram.com/peace.love.tn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition block py-2`}
              >
                {t('instagram')}
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

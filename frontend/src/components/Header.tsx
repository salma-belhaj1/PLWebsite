import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingBag, User, Globe, ChevronDown, Check, LogOut, Package, Shield, UserCircle } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)
  const { session, user, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang } = useLanguage()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, openCart } = useCart()

  // Search state
  const [searchVal, setSearchVal] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('q') || ''
  })
  const debounceRef = useRef<number | null>(null)
  const isFirstRender = useRef(true)

  // Floating hearts on logo hover
  const [hearts, setHearts] = useState<Array<{
    id: number;
    leftPercent: number;
    driftX: number;
    duration: number;
    size: number;
    rotation: number;
    color: string;
  }>>([])
  const heartIdRef = useRef(0)
  const lastSpawnRef = useRef(0)

  const spawnHearts = (count = 4) => {
    const colors = ['#f43f5e', '#ec4899', '#ff6b8b', '#fb7185', '#f472b6', '#fda4af', '#e11d48']
    const newHearts: Array<{
      id: number;
      leftPercent: number;
      driftX: number;
      duration: number;
      size: number;
      rotation: number;
      color: string;
    }> = []

    for (let i = 0; i < count; i++) {
      heartIdRef.current += 1
      newHearts.push({
        id: heartIdRef.current,
        leftPercent: 10 + Math.random() * 80,
        driftX: (Math.random() - 0.5) * 60,
        duration: 1.1 + Math.random() * 0.7,
        size: 11 + Math.floor(Math.random() * 10),
        rotation: (Math.random() - 0.5) * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    setHearts((prev) => [...prev.slice(-20), ...newHearts])

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)))
    }, 2000)
  }

  const handleLogoMouseEnter = () => {
    spawnHearts(4)
    // slight follow up burst
    setTimeout(() => spawnHearts(3), 150)
  }

  const handleLogoMouseMove = () => {
    const now = Date.now()
    if (now - lastSpawnRef.current > 220) {
      lastSpawnRef.current = now
      spawnHearts(2)
    }
  }

  // Handle click outside dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false)
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    if (q !== searchVal) {
      setSearchVal(q)
    }
  }, [location.search])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const encoded = encodeURIComponent(searchVal || '')
      if (searchVal.trim() || location.pathname === '/shop') {
        navigate(`/shop${encoded ? `?q=${encoded}` : ''}`, { replace: true })
      }
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchVal])

  async function handleSignOut() {
    try {
      await signOut()
      setIsAccountMenuOpen(false)
      toast.success(t('signOut') || 'Signed out')
      navigate('/login')
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

      <nav className="theme-navbar max-w-[1440px] mx-auto rounded-2xl backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.2)] px-4 lg:px-7 py-3 flex items-center justify-between gap-2 md:gap-4">
        {/* Left Section: Logo */}
        <div className="flex-1 flex items-center justify-start gap-4 min-w-0">
          <Link 
            to="/" 
            className="flex items-center hover-lift group shrink-0 relative"
            onMouseEnter={handleLogoMouseEnter}
            onMouseMove={handleLogoMouseMove}
          >
            <img
              src={theme === 'dark' ? '/media/logo-dark.png' : '/media/logo-light.png'}
              alt={t('home')}
              className="h-9 lg:h-10 w-auto"
            />
            {/* Flowing Hearts Particles */}
            {hearts.map((h) => (
              <svg
                key={h.id}
                className="heart-particle absolute pointer-events-none select-none z-50 drop-shadow-sm"
                style={{
                  left: `${h.leftPercent}%`,
                  bottom: '50%',
                  width: `${h.size}px`,
                  height: `${h.size}px`,
                  color: h.color,
                  ['--drift-x' as string]: `${h.driftX}px`,
                  ['--rot' as string]: `${h.rotation}deg`,
                  ['--duration' as string]: `${h.duration}s`,
                }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </Link>
        </div>

        {/* Center Section: Desktop Search Bar */}
        <div className="hidden md:flex justify-center w-full max-w-md mx-auto">
          <div className="w-full relative">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full text-sm placeholder:text-stone-400 bg-stone-50 text-pl-black py-2.5 pl-4 pr-10 rounded-full border border-stone-100 focus:outline-none focus:ring-2 focus:ring-pl-pink/30 focus:border-pl-pink transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-pl-white"
              aria-label={t('search.placeholder')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pl-pink/60 text-sm">
              <Search className="w-4 h-4 text-pl-pink" />
            </span>
          </div>
        </div>

        {/* Right Section: Auth & Cart & Controls */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
          {/* Theme toggle */}
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
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-expanded={isLangOpen}
              aria-label={t('language')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-century text-xs font-semibold cursor-pointer smooth-transition ${
                theme === 'dark' 
                  ? 'bg-zinc-900/90 border-zinc-700/80 text-pl-white hover:bg-zinc-800' 
                  : 'bg-stone-100/90 border-stone-200/90 text-stone-800 hover:bg-stone-200/70'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-pl-pink shrink-0" />
              <span className="uppercase">{lang}</span>
              <ChevronDown className={`w-3 h-3 text-pl-pink transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div 
                className={`absolute right-0 top-full mt-2 w-36 rounded-2xl border shadow-xl py-1.5 z-50 backdrop-blur-md animate-fadeIn ${
                  theme === 'dark'
                    ? 'bg-zinc-900/95 border-zinc-700/90 text-pl-white shadow-black/50'
                    : 'bg-white/95 border-stone-200 shadow-stone-300/50 text-pl-black'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLang('en')
                    setIsLangOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-century cursor-pointer smooth-transition ${
                    lang === 'en'
                      ? 'text-pl-pink font-semibold bg-pl-pink/10'
                      : theme === 'dark'
                      ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                      : 'hover:bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">EN</span>
                    <span>English</span>
                  </span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-pl-pink" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('fr')
                    setIsLangOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-century cursor-pointer smooth-transition ${
                    lang === 'fr'
                      ? 'text-pl-pink font-semibold bg-pl-pink/10'
                      : theme === 'dark'
                      ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                      : 'hover:bg-stone-100 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">FR</span>
                    <span>Français</span>
                  </span>
                  {lang === 'fr' && <Check className="w-3.5 h-3.5 text-pl-pink" />}
                </button>
              </div>
            )}
          </div>

          {/* User Account Button / Dropdown */}
          {session ? (
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                aria-label="User menu"
                className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-zinc-900/90 border-zinc-700/80 text-pl-white hover:bg-zinc-800' 
                    : 'bg-stone-100/90 border-stone-200/90 text-stone-800 hover:bg-stone-200/70'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pl-pink to-pl-red text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className={`w-3 h-3 text-pl-pink transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountMenuOpen && (
                <div 
                  className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border shadow-xl py-2 z-50 backdrop-blur-md animate-fadeIn ${
                    theme === 'dark'
                      ? 'bg-zinc-900/95 border-zinc-700/90 text-pl-white shadow-black/50'
                      : 'bg-white/95 border-stone-200 shadow-stone-300/50 text-pl-black'
                  }`}
                >
                  <div className="px-4 py-2 border-b border-pl-pink/10">
                    <p className="text-xs font-stayvibes text-pl-pink truncate font-bold">{user?.full_name || 'Customer'}</p>
                    <p className={`text-[10px] font-century truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>{user?.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-century smooth-transition ${
                      theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-stone-100 text-stone-700 hover:text-black'
                    }`}
                  >
                    <UserCircle className="w-4 h-4 text-pl-pink" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-century smooth-transition ${
                      theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-stone-100 text-stone-700 hover:text-black'
                    }`}
                  >
                    <Package className="w-4 h-4 text-pl-pink" />
                    <span>My Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-century text-amber-500 font-semibold smooth-transition ${
                        theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-stone-100'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Admin Workspace</span>
                    </Link>
                  )}

                  <div className="border-t border-pl-pink/10 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-century text-red-500 hover:bg-red-500/10 smooth-transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t('signOut') || 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              aria-label={t('signIn')}
              title={t('signIn')}
              className="p-2.5 transition-all flex items-center justify-center text-pl-pink hover:text-pl-red hover:scale-110"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Cart / Bag button */}
          <button
            onClick={() => openCart()}
            aria-label={t('cart.title')}
            className="relative cursor-pointer p-2.5 transition-all flex items-center justify-center text-pl-pink hover:text-pl-red hover:scale-110"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pl-pink text-[9px] font-bold text-white font-mono">{cartCount}</span>
            )}
          </button>
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
          <ul className="flex flex-col gap-3 p-4">
            <li className="flex items-center justify-between py-2 border-b border-pl-pink/10">
              <span className={`text-xs font-century font-semibold flex items-center gap-1.5 ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                <Globe className="w-3.5 h-3.5 text-pl-pink shrink-0" />
                {t('language')}
              </span>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
                  className={`appearance-none pl-3 pr-7 py-1.5 rounded-xl border text-xs font-century font-semibold cursor-pointer outline-none smooth-transition ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-700 text-pl-white'
                      : 'bg-stone-100 border-stone-200 text-stone-800'
                  }`}
                  aria-label={t('language')}
                >
                  <option value="en" className={theme === 'dark' ? 'bg-zinc-900 text-pl-white' : 'bg-white text-pl-black'}>English (EN)</option>
                  <option value="fr" className={theme === 'dark' ? 'bg-zinc-900 text-pl-white' : 'bg-white text-pl-black'}>Français (FR)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-pl-pink absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </li>

            {session ? (
              <>
                <li>
                  <Link 
                    to="/account" 
                    className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition flex items-center gap-2 py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="w-5 h-5 text-pl-pink" />
                    <span>My Account</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/orders" 
                    className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition flex items-center gap-2 py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-5 h-5 text-pl-pink" />
                    <span>My Orders</span>
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      className="text-amber-400 hover:text-amber-300 smooth-transition flex items-center gap-2 py-2 font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span>Admin Workspace</span>
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-red-400 hover:text-red-300 smooth-transition flex items-center gap-2 py-2 w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-400" />
                    <span>{t('signOut')}</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  to="/login" 
                  className={`${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'} hover:text-pl-pink smooth-transition flex items-center gap-2 py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-pl-pink" />
                  <span>{t('signIn')}</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

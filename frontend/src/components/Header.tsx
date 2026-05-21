import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { session, isAdmin, signOut } = useAuth()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out')
    } catch (error) {
      toast.error('Sign out failed')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pl-black to-pl-black/95 backdrop-blur-md shadow-xl slide-in-down">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 hover-lift group"
        >
          <div className="text-4xl font-stayvibes text-pl-pink float-animation">❤️</div>
          <div>
            <h1 className="text-2xl font-stayvibes text-pl-pink group-hover:text-pl-red smooth-transition">Peace & Love</h1>
            <p className="text-xs text-pl-white/60 font-century">Beauty & Serenity</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-8 items-center">
          <li>
            <Link 
              to="/" 
              className="text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </Link>
          </li>
          <li>
            <Link 
              to="/shop" 
              className="text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
            >
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className="text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
              >
                Admin
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
              </Link>
            </li>
          )}
          <li>
            <a 
              href="https://www.instagram.com/peace.love.tn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
            >
              Instagram
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </a>
          </li>
        </ul>

        {/* Auth & Cart */}
        <div className="flex items-center gap-4">
          {session ? (
            <button
              onClick={handleSignOut}
              className="hidden md:block text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
            >
              Sign Out
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:block text-pl-white font-century smooth-transition hover:text-pl-pink relative group"
            >
              Sign In
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pl-pink to-pl-red group-hover:w-full smooth-transition"></span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-pl-pink text-2xl hover:text-pl-red smooth-transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-pl-black/95 backdrop-blur-md fade-in border-t border-pl-pink/20">
          <ul className="flex flex-col gap-4 p-4">
            <li>
              <Link 
                to="/" 
                className="text-pl-white hover:text-pl-pink smooth-transition block py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/shop" 
                className="text-pl-white hover:text-pl-pink smooth-transition block py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="text-pl-white hover:text-pl-pink smooth-transition block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            )}
            {session ? (
              <li>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="text-pl-white hover:text-pl-pink smooth-transition block py-2 w-full text-left"
                >
                  Sign Out
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="text-pl-white hover:text-pl-pink smooth-transition block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </li>
            )}
            <li>
              <a 
                href="https://www.instagram.com/peace.love.tn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pl-white hover:text-pl-pink smooth-transition block py-2"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

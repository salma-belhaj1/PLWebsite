import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import CheckoutFlow from './CheckoutFlow'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const CartDrawer: React.FC = () => {
  const { theme } = useTheme()
  const { cartItems, updateQuantity, removeItem, isOpen, closeCart, clearCart } = useCart()
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const { session } = useAuth()
  const navigate = useNavigate()
  const drawerRef = React.useRef<HTMLDivElement | null>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const previousActiveRef = React.useRef<HTMLElement | null>(null)
  const { t } = useTranslation()

  const subtotal = cartItems.reduce((sum, it) => sum + Number(it.product.price) * it.quantity, 0)
  const shipping = cartItems.length > 0 ? 8 : 0
  const total = subtotal + shipping

  React.useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement
      setTimeout(() => closeButtonRef.current?.focus(), 0)
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          closeCart()
        }
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    } else {
      previousActiveRef.current?.focus()
    }
  }, [isOpen, closeCart])

  const handleTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])")
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50"
          aria-hidden={isOpen ? 'false' : 'true'}
        >
          <motion.div 
            className={`absolute inset-0 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/40' : 'bg-black/30'}`} 
            onClick={closeCart} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            ref={drawerRef} 
            onKeyDown={handleTrap} 
            role="dialog" 
            aria-modal="true" 
            aria-label="Shopping bag" 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className={`absolute right-0 top-0 bottom-0 w-full md:w-[480px] p-6 overflow-y-auto flex flex-col ${theme === 'dark' ? 'bg-zinc-900 border-l border-zinc-800' : 'bg-white border-l border-stone-200'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-pl-pink/20">
              <h3 className="text-2xl font-stayvibes text-pl-pink">{t('cart.title')}</h3>
              <motion.button 
                ref={closeButtonRef} 
                onClick={closeCart} 
                aria-label="Close cart"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg text-xl smooth-transition ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-stone-100'}`}
              >
                ✕
              </motion.button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto mb-6">
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-40 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">🛍️</div>
                    <p className={`font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                      {t('cart.empty')}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  {cartItems.map((it, idx) => (
                    <motion.div 
                      key={`${it.product.id}-${it.selectedVariant || ''}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border-2 smooth-transition flex gap-4 ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700 hover:border-pl-pink/30' : 'bg-stone-50 border-stone-200 hover:border-pl-pink/30'}`}
                    >
                      {/* Product Image */}
                      <div className={`h-20 w-20 rounded-lg flex items-center justify-center flex-shrink-0 text-3xl ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white'}`}>
                        ✨
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className={`font-stayvibes line-clamp-1 ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                            {it.product.name}
                          </h4>
                          {it.selectedVariant && (
                            <p className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                              {it.selectedVariant}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button 
                            onClick={() => updateQuantity(it.product.id, it.selectedVariant, -1)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`px-2.5 py-1 rounded-lg text-sm font-semibold border smooth-transition ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white hover:border-pl-pink' : 'bg-white border-stone-200 text-pl-black hover:border-pl-pink'}`}
                          >
                            −
                          </motion.button>
                          <span className={`px-3 py-1 min-w-8 text-center font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                            {it.quantity}
                          </span>
                          <motion.button 
                            onClick={() => updateQuantity(it.product.id, it.selectedVariant, 1)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`px-2.5 py-1 rounded-lg text-sm font-semibold border smooth-transition ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white hover:border-pl-pink' : 'bg-white border-stone-200 text-pl-black hover:border-pl-pink'}`}
                          >
                            +
                          </motion.button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-lg font-stayvibes text-pl-pink">
                          {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(Number(it.product.price) * it.quantity)}
                        </span>
                        <motion.button 
                          onClick={() => removeItem(it.product.id, it.selectedVariant)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-sm font-century text-pl-pink hover:text-pl-red smooth-transition"
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer - Totals & Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-t-2 border-pl-pink/20 pt-4 space-y-4`}
            >
              {/* Totals */}
              <div className="space-y-2 pb-4 border-b border-pl-pink/20">
                <div className={`flex justify-between text-sm font-century ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(subtotal)}
                  </span>
                </div>
                <div className={`flex justify-between text-sm font-century ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                  <span>{t('cart.shipping')}</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(shipping)}
                  </span>
                </div>
                <div className={`flex justify-between items-baseline text-lg font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                  <span>{t('cart.total')}</span>
                  <span className="text-2xl font-stayvibes text-pl-pink">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(total)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button 
                  onClick={() => closeCart()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-century font-semibold smooth-transition border-2 ${theme === 'dark' ? 'bg-zinc-800 text-pl-white border-zinc-700 hover:border-pl-pink' : 'bg-stone-100 text-pl-black border-stone-200 hover:border-pl-pink'}`}
                >
                  {t('cart.returnToShop')}
                </motion.button>
                <motion.button 
                  onClick={() => {
                    if (cartItems.length === 0) return
                    // require login before opening checkout
                    if (!session?.user) {
                      // redirect to login and come back
                      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
                      return
                    }
                    setCheckoutOpen(true)
                  }}
                  disabled={cartItems.length === 0}
                  whileHover={cartItems.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={cartItems.length > 0 ? { scale: 0.98 } : {}}
                  className={`flex-1 px-4 py-3 rounded-lg font-century font-semibold smooth-transition border-2 ${
                    cartItems.length > 0
                      ? 'bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30'
                      : `${theme === 'dark' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-stone-100 text-stone-400 border-stone-200'} cursor-not-allowed`
                  }`}
                >
                  {t('cart.checkout')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {checkoutOpen && (
            <CheckoutFlow
              cartItems={cartItems}
              onClose={() => setCheckoutOpen(false)}
              onSuccess={() => {
                setCheckoutOpen(false)
                closeCart()
                clearCart()
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer

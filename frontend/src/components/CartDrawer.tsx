import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import CheckoutFlow from './CheckoutFlow'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/formatters'
import { ShoppingBag, Package, Trash2 } from 'lucide-react'

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

  const getItemPrice = (it: any) => Number(it.unitPrice !== undefined ? it.unitPrice : it.product.price)
  const subtotal = cartItems.reduce((sum, it) => sum + getItemPrice(it) * it.quantity, 0)
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

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return
    if (!session) {
      closeCart()
      navigate('/login?redirect=/checkout')
      return
    }
    setCheckoutOpen(true)
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
                  <div className="text-center flex flex-col items-center">
                    <ShoppingBag className="w-12 h-12 text-pl-pink/40 mb-3" />
                    <p className={`font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                      {t('cart.empty')}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  {cartItems.map((it, idx) => {
                    const itemImg = it.imageUrl || it.product.image_url
                    const itemUnitPrice = getItemPrice(it)

                    return (
                      <motion.div 
                        key={`${it.product.id}-${it.selectedVariant || ''}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border-2 smooth-transition flex gap-4 ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700 hover:border-pl-pink/30' : 'bg-stone-50 border-stone-200 hover:border-pl-pink/30'}`}
                      >
                        {/* Product Image */}
                        <div className={`h-20 w-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-black/10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
                          {itemImg ? (
                            <img src={itemImg} alt={it.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-pl-pink/60" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className={`font-stayvibes text-lg line-clamp-1 ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                              {it.product.name}
                            </h4>
                            {it.selectedVariant && (
                              <p className={`text-xs font-century font-medium ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-pink'}`}>
                                {it.selectedVariant}
                              </p>
                            )}
                            <p className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                              {formatPrice(itemUnitPrice)} each
                            </p>
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
                          <span className="text-base font-century font-bold text-pl-pink">
                            {formatPrice(itemUnitPrice * it.quantity)}
                          </span>
                          <motion.button 
                            onClick={() => removeItem(it.product.id, it.selectedVariant)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-sm font-century text-zinc-400 hover:text-red-500 smooth-transition p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-pl-pink/20 pt-4 space-y-3">
                <div className="flex justify-between text-sm font-century">
                  <span className={theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}>{t('cart.subtotal')}</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-century">
                  <span className={theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}>{t('cart.shipping')}</span>
                  <span className="font-semibold">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-century font-bold border-t border-pl-pink/10 pt-2 text-pl-pink">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={clearCart}
                    className={`py-3 px-4 rounded-xl font-century font-semibold text-xs border smooth-transition ${theme === 'dark' ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-stone-200 text-zinc-600 hover:bg-stone-100'}`}
                  >
                    {t('cart.clear')}
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="py-3 px-4 rounded-xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white hover:opacity-95 shadow-md shadow-pl-pink/20 smooth-transition flex items-center justify-center gap-1.5"
                  >
                    <span>{t('cart.checkout')}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {checkoutOpen && (
        <CheckoutFlow
          cartItems={cartItems}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            clearCart()
            setCheckoutOpen(false)
            closeCart()
          }}
        />
      )}
    </AnimatePresence>
  )
}

export default CartDrawer

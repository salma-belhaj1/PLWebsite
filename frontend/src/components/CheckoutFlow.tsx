import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CartItem } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { orderService } from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface Props {
  cartItems: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

const CheckoutFlow: React.FC<Props> = ({ cartItems, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [step, setStep] = useState<'details' | 'success'>('details')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const modalRef = React.useRef<HTMLDivElement | null>(null)
  const firstInputRef = React.useRef<HTMLInputElement | null>(null)
  const previousActiveRef = React.useRef<HTMLElement | null>(null)

  const subtotal = cartItems.reduce((s, it) => s + Number(it.product.price) * it.quantity, 0)
  const shipping = cartItems.length > 0 ? 8 : 0
  const total = subtotal + shipping

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = 'Name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email'
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    if (!address.trim()) newErrors.address = 'Address is required'
    if (!city.trim()) newErrors.city = 'City is required'
    if (!zip.trim()) newErrors.zip = 'Postal code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        customer: { fullName, email, phone, address, city, zip },
        items: cartItems.map((it) => ({ productId: it.product.id, quantity: it.quantity, variant: it.selectedVariant })),
        totals: { subtotal, shipping, total }
      }
      const res = await orderService.placeOrder(payload)
      const id = res?.id ? String(res.id) : `PL-${Date.now()}`
      setOrderId(id)
      setStep('success')
      onSuccess()
      toast.success(t('checkout.success'))
    } catch (err) {
      console.error('order failed', err)
      toast.error(t('checkout.error'))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement
    setTimeout(() => {
      firstInputRef.current?.focus()
    }, 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previousActiveRef.current?.focus()
    }
  }, [onClose])

  const handleTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return
    const focusable = modalRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])")
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

  const FormInput = ({
    label,
    value,
    onChange,
    error,
    ...props
  }: {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    [key: string]: any
  }) => (
    <div className="space-y-1.5">
      <label className={`block text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/70'}`}>
        {label}
      </label>
      <input
        {...props}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg font-century smooth-transition border-2 focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
          error
            ? theme === 'dark'
              ? 'bg-red-900/20 border-red-500/50 text-pl-white'
              : 'bg-red-100/50 border-red-300 text-pl-black'
            : theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink'
              : 'bg-white border-stone-200 text-pl-black focus:border-pl-pink'
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 font-century font-semibold">{error}</p>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/60' : 'bg-black/50'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          ref={modalRef} 
          onKeyDown={handleTrap} 
          role="dialog" 
          aria-modal="true" 
          aria-label="Checkout"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
          className={`w-full max-w-2xl rounded-2xl border-2 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}
        >
          {step === 'details' ? (
            <form onSubmit={handleSubmit} className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-pl-pink/20">
                <h3 className="text-3xl font-stayvibes text-pl-pink">{t('checkout.details')}</h3>
                <motion.button 
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg text-2xl smooth-transition ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-stone-100'}`}
                >
                  ✕
                </motion.button>
              </div>

              {/* Form */}
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    ref={firstInputRef}
                    label={t('checkout.fullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                    placeholder="John Doe"
                  />
                  <FormInput
                    label={t('checkout.email')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                  />
                  <FormInput
                    label={t('checkout.phone')}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="+216 123 456 789"
                  />
                  <FormInput
                    label={t('checkout.city')}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    placeholder="Tunis"
                  />
                </div>

                <FormInput
                  label={t('checkout.address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={errors.address}
                  placeholder="123 Main Street"
                />

                <FormInput
                  label={t('checkout.zip')}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  error={errors.zip}
                  placeholder="1000"
                />
              </div>

              {/* Order Summary */}
              <motion.div
                className={`rounded-xl border-2 p-5 mb-8 ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className={`font-stayvibes text-lg text-pl-pink mb-4 ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-pink'}`}>
                  {t('checkout.summary')}
                </h4>
                
                <div className="space-y-3 border-b border-pl-pink/20 pb-4 mb-4">
                  {cartItems.map((it, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex justify-between text-sm font-century ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}
                    >
                      <span>{it.product.name} × {it.quantity}</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(Number(it.product.price) * it.quantity)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2">
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
                  <div className={`flex justify-between items-baseline font-stayvibes text-lg pt-2 border-t border-pl-pink/20 ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                    <span>{t('cart.total')}</span>
                    <span className="text-2xl text-pl-pink">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(total)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-century font-semibold smooth-transition border-2 ${
                    theme === 'dark'
                      ? 'bg-zinc-800 text-pl-white border-zinc-700 hover:border-pl-pink'
                      : 'bg-stone-100 text-pl-black border-stone-200 hover:border-pl-pink'
                  }`}
                >
                  {t('checkout.cancel')}
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className={`flex-1 px-4 py-3 rounded-lg font-century font-semibold smooth-transition border-2 ${
                    loading
                      ? `${theme === 'dark' ? 'bg-zinc-700 text-zinc-400 border-zinc-600' : 'bg-stone-200 text-stone-400 border-stone-300'} cursor-not-allowed`
                      : 'bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30'
                  }`}
                >
                  {loading ? `${t('checkout.processing')}...` : t('checkout.placeOrder')}
                </motion.button>
              </div>
            </form>
          ) : (
            /* Success Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-6xl mb-6"
              >
                ✨
              </motion.div>
              <h3 className="text-3xl font-stayvibes text-pl-pink mb-4">{t('checkout.success')}</h3>
              <p className={`text-lg font-century mb-6 ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/60'}`}>
                {t('checkout.thanks')}
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-lg p-4 mb-8 border-2 font-mono text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-pink' : 'bg-stone-100 border-stone-200 text-pl-pink'}`}
              >
                <p className="text-xs opacity-70 mb-1">{t('checkout.orderNumber')}</p>
                <p className="text-xl font-bold">{orderId}</p>
              </motion.div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pl-pink to-pl-red text-white px-8 py-3 rounded-lg font-century font-semibold smooth-transition hover:shadow-lg hover:shadow-pl-pink/30"
              >
                {t('checkout.continue')} →
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CheckoutFlow

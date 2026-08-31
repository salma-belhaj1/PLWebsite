import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CartItem } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { orderService } from '../services/api'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/formatters'
import { LocationSelector } from './LocationSelector'
import { PhoneInputWithCountry } from './PhoneInputWithCountry'
import toast from 'react-hot-toast'
import { Sparkles, ShoppingBag, CheckCircle } from 'lucide-react'

interface Props {
  cartItems: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

const CheckoutFlow: React.FC<Props> = ({ cartItems, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { user } = useAuth()

  const [step, setStep] = useState<'details' | 'success'>('details')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+216 ')
  const [country, setCountry] = useState('Tunisia')
  const [countryCode, setCountryCode] = useState('TN')
  const [stateVal, setStateVal] = useState('Tunis')
  const [city, setCity] = useState('Tunis')
  const [address, setAddress] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const modalRef = React.useRef<HTMLDivElement | null>(null)
  const firstInputRef = React.useRef<HTMLInputElement | null>(null)
  const previousActiveRef = React.useRef<HTMLElement | null>(null)

  // Pre-fill with authenticated user data
  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name)
      if (user.email) setEmail(user.email)
      if (user.phone) setPhone(user.phone)
      if (user.country) setCountry(user.country)
      if (user.state) setStateVal(user.state)
      if (user.city) setCity(user.city)
      if (user.address) setAddress(user.address)
    }
  }, [user])

  const getItemPrice = (it: any) => Number(it.unitPrice !== undefined && it.unitPrice !== null ? it.unitPrice : it.product.price)
  const subtotal = cartItems.reduce((s, it) => s + getItemPrice(it) * it.quantity, 0)
  const shipping = cartItems.length > 0 ? 8 : 0
  const total = subtotal + shipping

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = t('validation.nameRequired') || 'Name is required'
    if (!email.trim()) newErrors.email = t('validation.emailRequired') || 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t('validation.invalidEmail') || 'Invalid email'
    if (!phone.trim()) newErrors.phone = t('validation.phoneRequired') || 'Phone is required'
    if (!address.trim()) newErrors.address = t('validation.addressRequired') || 'Address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        user_id: user?.id || null,
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        shipping_address: `${address.trim()}, ${city.trim()}, ${stateVal.trim()}, ${country.trim()}`.trim(),
        total_amount: total,
        items: cartItems.map((it) => ({
          product_id: it.product.id,
          variant_id: null,
          quantity: it.quantity,
          price: getItemPrice(it),
        })),
      }
      const res = await orderService.placeOrder(payload)
      const id = res?.id ? String(res.id) : `PL-${Date.now()}`
      setOrderId(id)
      setStep('success')
      onSuccess()
      toast.success(t('checkout.success') || 'Order placed successfully!')
    } catch (err) {
      console.error('Order placement failed', err)
      toast.error(t('checkout.error') || 'Failed to place order')
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
    <div className="space-y-1">
      <label className={`block text-xs font-century font-semibold ${theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`}>
        {label}
      </label>
      <input
        {...props}
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2 rounded-xl font-century text-xs smooth-transition border outline-none focus:ring-2 focus:ring-pl-pink/30 ${
          error
            ? 'bg-red-500/10 border-red-500/50 text-red-500'
            : theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700 text-white focus:border-pl-pink'
              : 'bg-stone-50 border-stone-200 text-black focus:border-pl-pink'
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-500 font-century font-semibold">{error}</p>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-sm`}
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
          className={`w-full max-w-xl rounded-3xl border-2 overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-900'}`}
        >
          {step === 'details' ? (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-pl-pink/20">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-pl-pink/10 text-pl-pink flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-stayvibes text-pl-pink">{t('checkout.details') || 'Shipping & Checkout'}</h3>
                    <p className={`text-[11px] font-century ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>
                      {t('checkout.signedInAs') || 'Signed in as:'} <span className="font-semibold text-pl-pink">{user?.email || (t('auth.customer') || 'Customer')}</span>
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={onClose}
                  className={`p-1.5 rounded-lg text-lg smooth-transition ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
                >
                  ✕
                </button>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    ref={firstInputRef}
                    label={t('checkout.fullName') || 'Full Name'}
                    value={fullName}
                    onChange={(e: any) => setFullName(e.target.value)}
                    error={errors.fullName}
                    placeholder="Jane Doe"
                  />
                  <FormInput
                    label={t('checkout.email') || 'Email'}
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="jane@example.com"
                  />
                </div>

                {/* International Phone */}
                <PhoneInputWithCountry
                  value={phone}
                  onChange={setPhone}
                  defaultDialCode="+216"
                  theme={theme}
                />

                {/* Country, State, City Dropdowns */}
                <LocationSelector
                  selectedCountry={countryCode || country}
                  selectedState={stateVal}
                  selectedCity={city}
                  onCountryChange={(name, code) => {
                    setCountry(name);
                    setCountryCode(code);
                  }}
                  onStateChange={(name) => setStateVal(name)}
                  onCityChange={(cityName) => setCity(cityName)}
                  theme={theme}
                />

                {/* Street Address */}
                <FormInput
                  label={t('checkout.address') || 'Street Address'}
                  value={address}
                  onChange={(e: any) => setAddress(e.target.value)}
                  error={errors.address}
                  placeholder="123 Avenue Habib Bourguiba"
                />
              </div>

              {/* Order Summary Box */}
              <div className={`rounded-2xl border p-4 mb-6 ${theme === 'dark' ? 'bg-zinc-800/40 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}>
                <div className="space-y-2 text-xs font-century pb-3 border-b border-pl-pink/10">
                  <div className="flex justify-between opacity-80">
                    <span>{t('checkout.itemsCount', { count: cartItems.reduce((acc, it) => acc + it.quantity, 0) }) || `Items (${cartItems.reduce((acc, it) => acc + it.quantity, 0)})`}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between opacity-80">
                    <span>{t('cart.shipping') || 'Delivery (8 DT)'}</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-3 font-century">
                  <span className="font-semibold text-sm">{t('checkout.totalPayOnDelivery') || 'Total to pay on delivery'}</span>
                  <span className="text-xl font-bold text-pl-pink">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-century font-semibold border smooth-transition ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t('checkout.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-century font-semibold bg-gradient-to-r from-pl-pink to-pl-red text-white flex items-center justify-center gap-2 shadow-md hover:shadow-pl-pink/30 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? (t('checkout.processing') || 'Placing Order...') : (t('checkout.placeOrder') || 'Confirm Order')}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Success Screen */
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-stayvibes text-pl-pink mb-2">{t('checkout.success') || 'Order Confirmed!'}</h3>
              <p className={`text-xs font-century max-w-sm mx-auto mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`}>
                {t('checkout.thanks') || 'Thank you for your mindful order! We are preparing it with peace & love.'}
              </p>
              
              <div className={`p-4 rounded-xl border mb-6 font-mono text-xs max-w-xs mx-auto ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'
              }`}>
                <span className="text-[10px] uppercase opacity-70 block mb-0.5">{t('checkout.orderNumber') || 'Order #'}</span>
                <span className="font-bold text-pl-pink text-sm">#{orderId}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white shadow-md hover:shadow-pl-pink/30 cursor-pointer"
              >
                {t('checkout.continue') || 'Continue Shopping'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CheckoutFlow

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { LocationSelector } from '../components/LocationSelector';
import { PhoneInputWithCountry } from '../components/PhoneInputWithCountry';
import { EmailVerificationModal } from '../components/EmailVerificationModal';

export default function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useAuth();

  // Mandatory fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional / Profile fields with dropdowns
  const [phone, setPhone] = useState('+216 ');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('Tunisia');
  const [countryCode, setCountryCode] = useState('TN');
  const [city, setCity] = useState('Tunis');
  const [stateVal, setStateVal] = useState('Tunis');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  function generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = t('validation.nameRequired') || 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = t('validation.emailRequired') || 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = t('validation.invalidEmail') || 'Please enter a valid email';
    }

    if (!password) {
      errs.password = t('auth.passwordRequired') || 'Password is required';
    } else if (password.length < 6) {
      errs.password = t('auth.passwordMinLength') || 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = t('auth.passwordsDoNotMatch') || 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Create user account in auth & profiles
      await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        birth_date: birthDate || undefined,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        state: stateVal.trim() || undefined,
        address: address.trim() || undefined,
      });

      // Generate 6-digit confirmation code and open verification modal
      const code = generateRandomCode();
      setGeneratedCode(code);
      setShowVerifyModal(true);
      toast.success(t('auth.codeGeneratedToast') || 'Confirmation code generated! Please confirm your email.');
    } catch (error: any) {
      const msg = error?.message || t('auth.registrationFailed') || 'Failed to create account';
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setLoading(false);
    }
  }

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    navigate('/shop', { replace: true });
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 smooth-transition ${
      theme === 'dark' 
        ? 'bg-zinc-950 text-pl-white' 
        : 'bg-gradient-to-br from-stone-50 via-pink-50/20 to-stone-100 text-pl-black'
    }`}>
      {/* Back Link */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 text-xs font-century font-semibold smooth-transition hover:text-pl-pink ${
            theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.returnToStore') || 'Return to Store'}
        </Link>
      </div>

      <div className="w-full max-w-2xl animate-fadeIn">
        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative overflow-hidden backdrop-blur-md smooth-transition ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-700/80 text-pl-white'
            : 'bg-white border-stone-200 text-pl-black shadow-stone-200/50'
        }`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-md bg-pl-pink/10 text-pl-pink">
              <UserPlus className="w-7 h-7 text-pl-pink" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-stayvibes font-bold text-pl-pink">
              {t('auth.createAccount') || 'Create an Account'}
            </h2>

            <p className={`text-xs font-century mt-1 leading-relaxed ${
              theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'
            }`}>
              {t('auth.createAccountSubtitle') || 'Join Peace & Love for personalized order tracking and mindful wellness living.'}
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-century flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Account Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={`block text-xs font-century font-semibold mb-1.5 ${
                  theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                }`}>
                  {t('checkout.fullName')} <span className="text-pl-pink">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                    errors.fullName ? 'border-red-500' : theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink' : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                  }`}
                  placeholder="Jane Doe"
                />
                {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-xs font-century font-semibold mb-1.5 ${
                  theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                }`}>
                  {t('auth.email')} <span className="text-pl-pink">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                    errors.email ? 'border-red-500' : theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink' : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-xs font-century font-semibold mb-1.5 ${
                  theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                }`}>
                  {t('auth.password')} <span className="text-pl-pink">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                    errors.password ? 'border-red-500' : theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink' : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                  }`}
                  placeholder="Min. 6 characters"
                />
                {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className={`block text-xs font-century font-semibold mb-1.5 ${
                  theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                }`}>
                  {t('auth.confirmPassword')} <span className="text-pl-pink">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                    errors.confirmPassword ? 'border-red-500' : theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink' : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                  }`}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Profile Information with Interactive Dropdowns */}
            <div className={`pt-5 mt-2 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-stone-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-century font-bold uppercase tracking-wider text-pl-pink">
                  {t('auth.profileLocationDetails') || 'Profile & Location Details'}
                </span>
                <span className="text-[11px] text-stone-400 font-century">{t('auth.configurable') || 'Configurable'}</span>
              </div>

              {/* Phone with Tunisia (+216) default & dropdown + Birth Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <PhoneInputWithCountry
                  value={phone}
                  onChange={setPhone}
                  defaultDialCode="+216"
                  theme={theme}
                />

                <div className="space-y-1">
                  <label className={`block text-xs font-century font-semibold ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`}>
                    {t('form.birthDate') || 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                    }`}
                  />
                </div>
              </div>

              {/* Country, State, City Cascading Dropdowns */}
              <div className="mb-4">
                <LocationSelector
                  selectedCountry={countryCode || country}
                  selectedState={stateVal}
                  selectedCity={city}
                  onCountryChange={(name, code) => {
                    setCountry(name);
                    setCountryCode(code);
                  }}
                  onStateChange={(stateName) => setStateVal(stateName)}
                  onCityChange={(cityName) => setCity(cityName)}
                  theme={theme}
                />
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className={`block text-xs font-century font-semibold ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                }`}>
                  {t('account.shippingAddress') || 'Street Address'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                  }`}
                  placeholder="123 Avenue Habib Bourguiba"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-century font-semibold text-sm flex items-center justify-center gap-2 smooth-transition shadow-md cursor-pointer disabled:opacity-50 bg-gradient-to-r from-pl-pink to-pl-red text-white hover:shadow-lg hover:shadow-pl-pink/30 mt-6"
            >
              {loading ? (
                t('auth.creatingAccount') || 'Creating account...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> {t('auth.createAccount') || 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-pl-pink/10 text-center">
            <p className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              {t('auth.alreadyHaveAccount') || 'Already have an account?'}{' '}
              <Link to="/login" className="text-pl-pink font-semibold hover:underline">
                {t('signIn') || 'Sign In'}
              </Link>
            </p>
          </div>
        </div>

        <p className={`text-center text-xs mt-4 leading-relaxed ${
          theme === 'dark' ? 'text-pl-white/40' : 'text-pl-black/40'
        }`}>
          {t('auth.customerAccountNote') || 'Accounts are created with customer access permissions.'}
        </p>
      </div>

      {/* Email Verification Code Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        email={email}
        generatedCode={generatedCode}
        onVerifySuccess={handleVerificationSuccess}
        onClose={() => setShowVerifyModal(false)}
        onResend={() => {
          const newCode = generateRandomCode();
          setGeneratedCode(newCode);
          return newCode;
        }}
      />
    </div>
  );
}

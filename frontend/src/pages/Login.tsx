import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ShoppingBag, ArrowLeft, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { EmailVerificationModal } from '../components/EmailVerificationModal';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signIn, signInWithGoogle, session, user, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification modal state for login confirmation
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingUserSession, setPendingUserSession] = useState<boolean>(false);

  // Parse redirect query param if present
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  function generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Handle redirect after session is verified
  useEffect(() => {
    if (!isLoading && session && user && !showVerifyModal && pendingUserSession) {
      if (redirectParam) {
        navigate(decodeURIComponent(redirectParam), { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    }
  }, [session, user, isLoading, redirectParam, navigate, showVerifyModal, pendingUserSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await signIn(email, password);
      // Generate confirmation code and display verification popup
      const code = generateRandomCode();
      setGeneratedCode(code);
      setShowVerifyModal(true);
      toast.success(t('auth.codeGeneratedToast') || 'Confirmation code generated! Please confirm your login.');
    } catch (error: any) {
      const rawMsg = error?.message || '';
      let friendlyMsg = t('auth.loginFailed') || 'Invalid email or password';
      if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid')) {
        friendlyMsg = t('auth.incorrectCredentials') || 'Incorrect email or password. Please check your credentials and try again.';
      }
      setErrorMsg(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      const target = redirectParam 
        ? decodeURIComponent(redirectParam) 
        : (user?.role === 'admin' ? '/admin' : '/shop');
      if (user?.role === 'admin') {
        toast.success(t('auth.adminWelcome') || 'Signed into Admin Workspace');
      } else {
        toast.success(t('auth.googleSuccess') || 'Signed in with Google!');
      }
      navigate(target, { replace: true });
    } catch (error: any) {
      const msg = error?.message || t('auth.googleFailed') || 'Google sign-in could not be completed';
      setErrorMsg(msg);
      toast.error(msg);
    }
  }

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setPendingUserSession(true);
    const target = redirectParam 
      ? decodeURIComponent(redirectParam) 
      : (user?.role === 'admin' ? '/admin' : '/shop');
    
    if (user?.role === 'admin') {
      toast.success(t('auth.adminWelcome') || 'Signed into Admin Workspace');
    } else {
      toast.success(t('auth.customerWelcome') || 'Logged in successfully! Welcome to Peace & Love.');
    }
    navigate(target, { replace: true });
  };

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error(t('validation.emailRequired') || 'Please enter your email');
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      if (error) throw error;
      toast.success(t('auth.resetLinkSent') || 'Password reset link has been sent to your email.');
      setResetModalOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error?.message || t('auth.resetLinkFailed') || 'Failed to send reset link. Please verify the email address.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 smooth-transition ${
      theme === 'dark' 
        ? 'bg-zinc-950 text-pl-white' 
        : 'bg-gradient-to-br from-stone-50 via-pink-50/20 to-stone-100 text-pl-black'
    }`}>
      {/* Top Header / Back Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 text-xs font-century font-semibold smooth-transition hover:text-pl-pink ${
            theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.returnToStore') || 'Return to Store'}
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md animate-fadeIn">
        <div className={`rounded-3xl p-8 border-2 shadow-2xl relative overflow-hidden backdrop-blur-md smooth-transition ${
          theme === 'dark'
            ? 'bg-zinc-900/90 border-zinc-700/80 text-pl-white'
            : 'bg-white border-stone-200 text-pl-black shadow-stone-200/50'
        }`}>
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-md bg-pl-pink/10 text-pl-pink">
              <ShoppingBag className="w-7 h-7 text-pl-pink" />
            </div>

            <h2 className="text-2xl font-stayvibes font-bold text-pl-pink">
              {t('auth.customerPortal') || 'Peace & Love Shopper'}
            </h2>

            <p className={`text-xs font-century mt-1 leading-relaxed ${
              theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'
            }`}>
              {t('auth.customerSubtitle') || 'Sign in to access your saved bag, track orders, and experience peace & love.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-century flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Social Sign-In (Google) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`w-full py-2.5 px-4 rounded-xl border-2 font-century text-xs font-semibold flex items-center justify-center gap-2.5 smooth-transition mb-4 cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 shadow-sm'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t('auth.continueWithGoogle') || 'Continue with Google'}</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-stone-200'}`} />
            <span className={`absolute px-3 text-[11px] font-century uppercase tracking-wider ${
              theme === 'dark' ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-stone-400'
            }`}>
              {t('auth.or') || 'or'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-century font-semibold mb-1.5 ${
                theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
              }`}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink'
                    : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                }`}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-century font-semibold ${
                  theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                }`}>
                  {t('auth.password')}
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-[11px] font-century text-pl-pink hover:underline cursor-pointer"
                >
                  {t('auth.forgotPassword') || 'Forgot password?'}
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 smooth-transition ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-pl-white focus:border-pl-pink'
                    : 'bg-stone-50 border-stone-200 text-pl-black focus:border-pl-pink'
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs font-century pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-pl-pink focus:ring-pl-pink accent-pl-pink w-4 h-4 cursor-pointer"
                />
                <span className={theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}>
                  {t('auth.rememberMe') || 'Remember me'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-century font-semibold text-sm flex items-center justify-center gap-2 smooth-transition shadow-md cursor-pointer disabled:opacity-50 bg-gradient-to-r from-pl-pink to-pl-red text-white hover:shadow-lg hover:shadow-pl-pink/30 mt-2"
            >
              {loading ? (
                t('auth.authenticating')
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> {t('auth.signIn')}
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-4 border-t border-pl-pink/10 text-center">
            <p className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-pl-pink font-semibold hover:underline">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
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

      {/* Forgot Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 border-2 shadow-2xl ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-pl-pink/20">
              <div className="flex items-center gap-2 text-pl-pink font-stayvibes text-xl">
                <Lock className="w-5 h-5" />
                <span>{t('auth.resetPasswordModalTitle') || 'Reset Password'}</span>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs font-century mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`}>
              {t('auth.resetPasswordDesc') || "Enter your registered email address and we'll send you a link to reset your password."}
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-century font-semibold mb-1">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 font-century text-sm outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-pl-pink'
                        : 'bg-stone-50 border-stone-200 text-black focus:border-pl-pink'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-century font-semibold border ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  {t('checkout.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 rounded-xl text-xs font-century font-semibold bg-gradient-to-r from-pl-pink to-pl-red text-white disabled:opacity-50"
                >
                  {resetLoading ? (t('auth.sending') || 'Sending...') : (t('auth.sendResetLink') || 'Send Reset Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

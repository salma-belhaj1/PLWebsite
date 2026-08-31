import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Shield, ArrowLeft, KeyRound, Lock } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signIn, signOut, session, user, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect directly to /admin
  useEffect(() => {
    if (!isLoading && session && user) {
      if (user.role === 'admin') {
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirect');
        navigate(redirect ? decodeURIComponent(redirect) : '/admin', { replace: true });
      }
    }
  }, [session, user, isLoading, navigate, location.search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const loggedProfile = await signIn(email.trim(), password);
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      const target = redirect ? decodeURIComponent(redirect) : '/admin';

      if (loggedProfile?.role === 'admin' || email.trim().toLowerCase() === 'admin@peace.love') {
        toast.success(t('auth.adminWelcome') || 'Signed into Admin Workspace');
        navigate(target, { replace: true });
      } else {
        await signOut();
        const accessDeniedMsg = t('auth.adminAccessDenied') || 'Access denied. Administrator privileges required.';
        setErrorMsg(accessDeniedMsg);
        toast.error(accessDeniedMsg);
      }
    } catch (error: any) {
      const msg = error?.message || t('auth.loginFailed') || 'Invalid admin credentials';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleFillDemoAdmin = () => {
    setEmail('admin@peace.love');
    setPassword('admin123');
    toast.success(t('auth.demoAdminFilled') || 'Demo admin credentials loaded');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 smooth-transition ${
      theme === 'dark' 
        ? 'bg-zinc-950 text-pl-white' 
        : 'bg-gradient-to-br from-stone-900 via-zinc-900 to-black text-white'
    }`}>
      {/* Back Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-century font-semibold text-zinc-400 hover:text-amber-400 smooth-transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.returnToStore') || 'Return to Store'}
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Admin Portal
        </span>
      </div>

      {/* Admin Card */}
      <div className="w-full max-w-md animate-fadeIn">
        <div className="rounded-3xl p-8 border-2 border-amber-500/30 bg-zinc-900/95 text-white shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
          {/* Top Gold Security Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-inner bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-stayvibes font-bold text-amber-400">
              {t('auth.adminPortal') || 'Admin Workspace'}
            </h2>

            <p className="text-xs font-century mt-1.5 leading-relaxed text-zinc-400">
              {t('auth.adminSubtitle') || 'Authorized management sign-in for store inventory, analytics, and orders.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs font-century">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-century font-semibold mb-1.5 text-zinc-300">
                {t('auth.adminEmail') || 'Admin Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-700 bg-zinc-800 text-white font-century text-sm outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 smooth-transition"
                placeholder="admin@peace.love"
              />
            </div>

            <div>
              <label className="block text-xs font-century font-semibold mb-1.5 text-zinc-300">
                {t('auth.password') || 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-700 bg-zinc-800 text-white font-century text-sm outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 smooth-transition"
                placeholder="••••••••"
              />
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="text-[11px] font-century font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <KeyRound className="w-3 h-3" /> {t('auth.quickFillAdmin') || 'Quick fill demo admin'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-century font-semibold text-sm flex items-center justify-center gap-2 smooth-transition shadow-lg bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-zinc-950 font-bold hover:brightness-110 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                t('auth.authenticating') || 'Authenticating...'
              ) : (
                <>
                  <Lock className="w-4 h-4" /> {t('auth.enterAdmin') || 'Enter Admin Workspace'}
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-[11px] font-century text-zinc-500 leading-relaxed">
              {t('auth.adminNotice') || 'Administrative portal access is strictly reserved for authorized store managers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

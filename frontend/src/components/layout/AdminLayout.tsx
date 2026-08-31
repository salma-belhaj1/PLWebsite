import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  DollarSign,
  LogOut,
  Sun,
  Moon,
  ArrowRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: t('adminNav.dashboard', 'Dashboard'), path: '/admin', icon: LayoutDashboard },
    { label: t('adminNav.inventory', 'Inventory'), path: '/admin/inventory', icon: Package },
    { label: t('adminNav.orders', 'Orders'), path: '/admin/orders', icon: ShoppingCart },
    { label: t('adminNav.expenses', 'Expenses'), path: '/admin/expenses', icon: DollarSign },
    { label: t('adminNav.analytics', 'Analytics'), path: '/admin/analytics', icon: BarChart3 },
  ];

  async function handleSignOut() {
    try {
      await signOut();
      toast.success(t('signOut') || 'Signed out successfully');
    } catch {
      toast.error('Sign out failed');
    }
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50/70 text-zinc-900'}`}>
      {/* Mobile Topbar */}
      <div className={`md:hidden sticky top-0 left-0 right-0 z-40 px-4 py-3 border-b flex items-center justify-between backdrop-blur-md ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-stone-200'
      }`}>
        <Link to="/admin" className="flex items-center gap-2.5">
          <img
            src={isDark ? '/media/logo-dark.png' : '/media/logo-light.png'}
            alt="Peace & Love"
            className="h-8 w-auto object-contain shrink-0"
          />
          <span className="font-bold tracking-tight text-base">Peace & Love</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-xl border transition ${
            isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
          }`}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-72 h-screen flex flex-col justify-between p-5 border-r transition-transform duration-300 z-50 md:translate-x-0 ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-stone-200 text-zinc-800'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src={isDark ? '/media/logo-dark.png' : '/media/logo-light.png'}
                alt="Peace & Love"
                className="h-9 w-auto object-contain shrink-0"
              />
              <span className="font-bold tracking-tight text-base leading-tight">Peace & Love</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/25 font-semibold'
                      : isDark
                      ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls & profile */}
        <div className="space-y-4 pt-4 border-t border-stone-200/80 dark:border-zinc-800">
          {/* Quick shop link */}
          <Link
            to="/shop"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition ${
              isDark
                ? 'border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'border-stone-200 bg-stone-50 text-zinc-700 hover:bg-stone-100 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>{t('adminNav.customerStorefront', 'Customer Storefront')}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          {/* Theme & Language Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                isDark
                  ? 'border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800'
                  : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-100'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
              className={`px-2.5 py-2 rounded-xl text-xs font-medium border outline-none cursor-pointer transition ${
                isDark
                  ? 'border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800'
                  : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-100'
              }`}
            >
              <option value="en">English (EN)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>

          {/* User info & Sign out */}
          <div className="pt-2 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold truncate leading-tight">{user?.email || 'Admin User'}</p>
              <p className="text-[11px] text-emerald-500 font-medium">{t('adminNav.administrator', 'Administrator')}</p>
            </div>
            <button
              onClick={handleSignOut}
              title={t('signOut')}
              className={`p-2 rounded-xl border text-rose-500 hover:bg-rose-500/10 transition ${
                isDark ? 'border-zinc-800' : 'border-stone-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content container */}
      <main className="md:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { label: 'Expenses', path: '/admin/expenses', icon: '💰' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Orders', path: '/admin/orders', icon: '🧾' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Signed out');
    } catch (error) {
      toast.error('Sign out failed');
    }
  }

  const shellBg = theme === 'dark' ? 'bg-zinc-950' : 'bg-stone-50';
  const textMain = theme === 'dark' ? 'text-pl-white' : 'text-pl-black';
  const panelBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-pl-white';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${shellBg}`}>
      {/* Mobile hamburger */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${panelBg} border-b ${borderColor} px-4 py-3 flex items-center justify-between z-40`}>
        <Link to="/admin" className="font-bold text-pl-red text-lg">
          ❤️ P&L
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={textMain}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen ${theme === 'dark' ? 'bg-zinc-900 text-pl-white' : 'bg-pl-black text-pl-white'} p-6 overflow-y-auto transition-transform duration-300 md:translate-x-0 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/admin" className="flex items-center gap-2 mb-8">
          <span className="text-3xl">❤️</span>
          <div>
            <h1 className="font-bold text-lg">Peace & Love</h1>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === item.path
                  ? 'bg-pl-red text-pl-white'
                  : 'text-gray-300 hover:bg-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">{t('toggleTheme')}</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">{t('language')}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
              className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <Link
            to="/shop"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 rounded-lg transition mb-2"
          >
            <span className="text-xl">🛍️</span>
            <span className="font-medium">Shop</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 rounded-lg transition"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { label: 'Expenses', path: '/admin/expenses', icon: '💰' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Customers', path: '/admin/customers', icon: '👥' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Signed out');
    } catch (error) {
      toast.error('Sign out failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-pl-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40">
        <Link to="/admin" className="font-bold text-pl-red text-lg">
          ❤️ P&L
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-pl-black"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-pl-black text-pl-white p-6 overflow-y-auto transition-transform duration-300 md:translate-x-0 z-30 ${
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

        <div className="mt-8 pt-8 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 rounded-lg transition"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Sign Out</span>
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

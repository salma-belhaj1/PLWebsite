import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const statCards = [
    { label: 'Total Products', value: stats?.total_items || 0, icon: '📦', color: theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100' },
    { label: 'In Stock', value: stats?.items_in_stock || 0, icon: '📈', color: theme === 'dark' ? 'bg-green-900/40' : 'bg-green-100' },
    { label: 'Items Sold', value: stats?.items_sold || 0, icon: '🛍️', color: theme === 'dark' ? 'bg-purple-900/40' : 'bg-purple-100' },
    { label: 'Revenue', value: `${(stats?.total_revenue || 0).toFixed(2)} TND`, icon: '💰', color: theme === 'dark' ? 'bg-yellow-900/40' : 'bg-yellow-100' },
    { label: 'Total Profit', value: `${(stats?.total_profit || 0).toFixed(2)} TND`, icon: '📊', color: theme === 'dark' ? 'bg-pl-red/20' : 'bg-pl-red bg-opacity-10' },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>{t('admin')}</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-pl-white/60' : 'text-gray-600'}`}>Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pl-red"></div>
              <p className="mt-4 text-gray-600">Loading stats...</p>
            </div>
          ) : (
            statCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${card.color} rounded-xl p-6 border ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>{card.value}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-pl-white/60' : 'text-gray-600'}`}>{card.label}</div>
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            to="/admin/inventory/new"
            className="bg-gradient-to-r from-pl-red to-red-600 hover:from-red-600 hover:to-red-700 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">📦</div>
            Add Product
          </Link>
          <Link
            to="/admin/inventory"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">📋</div>
            Manage Inventory
          </Link>
          <Link
            to="/admin/expenses"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">💰</div>
            Track Expenses
          </Link>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-xl p-8 border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-pl-white border-gray-200'}`}
        >
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>📈 Growth Insights</h2>
          <div className={`space-y-3 ${theme === 'dark' ? 'text-pl-white/70' : 'text-gray-700'}`}>
            <p>✅ Total inventory value: <span className="font-bold">{(stats?.total_revenue || 0).toFixed(2)} TND</span></p>
            <p>✅ Items in stock: <span className="font-bold">{stats?.items_in_stock || 0}</span></p>
            <p>✅ Conversion rate: <span className="font-bold">{stats?.items_sold && stats?.total_items ? ((stats.items_sold / stats.total_items) * 100).toFixed(1) : 0}%</span></p>
            <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-pl-white/50' : 'text-gray-500'}`}>Analytics and forecasting coming soon...</p>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

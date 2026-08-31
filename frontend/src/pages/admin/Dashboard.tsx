import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Boxes,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  const statCards = [
    {
      label: t('admin.dashboard.totalProducts', 'Total Products'),
      value: stats?.total_items || 0,
      icon: Package,
      color: 'text-rose-500',
      bg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100',
    },
    {
      label: t('admin.dashboard.unitsInStock', 'Units in Stock'),
      value: stats?.items_in_stock || 0,
      icon: Boxes,
      color: 'text-blue-500',
      bg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100',
    },
    {
      label: t('admin.dashboard.productsSold', 'Products Sold'),
      value: stats?.items_sold || 0,
      icon: ShoppingBag,
      color: 'text-purple-500',
      bg: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100',
    },
    {
      label: t('admin.dashboard.grossSales', 'Gross Sales'),
      value: `${(stats?.total_revenue || 0).toFixed(2)} DT`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100',
    },
    {
      label: t('admin.dashboard.estimatedMargin', 'Estimated Margin'),
      value: `${(stats?.total_profit || 0).toFixed(2)} DT`,
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 font-sans">
        {/* Header Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('admin.dashboard.title', 'Welcome to Store Control')}
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('admin.dashboard.subtitle', 'Real-time snapshot of your boutique catalog, stock balance, order throughput, and financial performance.')}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent"></div>
              <p className="mt-2 text-xs text-zinc-400">{t('admin.dashboard.loadingStats', 'Loading store analytics...')}</p>
            </div>
          ) : (
            statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {card.label}
                    </span>
                    <div className={`p-2 rounded-xl ${card.bg}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <div className="mt-3 text-xl font-bold tracking-tight truncate">
                    {card.value}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/inventory"
            className={`p-5 rounded-2xl border transition group flex flex-col justify-between ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900'
                : 'bg-white border-stone-200 hover:border-rose-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base tracking-tight">{t('adminNav.inventory', 'Inventory')}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {t('admin.dashboard.inventoryDesc', 'Add, edit prices, manage variants, and update stock counts.')}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className={`p-5 rounded-2xl border transition group flex flex-col justify-between ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900'
                : 'bg-white border-stone-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base tracking-tight">{t('adminNav.orders', 'Orders')}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {t('admin.dashboard.ordersDesc', 'View customer deliveries, phone numbers, and COD status.')}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/expenses"
            className={`p-5 rounded-2xl border transition group flex flex-col justify-between ${
              isDark
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900'
                : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base tracking-tight">{t('adminNav.expenses', 'Expenses')}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {t('admin.dashboard.expensesDesc', 'Log packaging boxes, inventory purchases, and operating costs.')}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

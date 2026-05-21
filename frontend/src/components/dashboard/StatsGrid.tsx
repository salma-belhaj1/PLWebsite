import { motion } from 'framer-motion';
import { DashboardStats } from '../../types/database';

interface StatsGridProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const statCards = [
    { label: 'Total Items', value: stats?.total_items || 0, icon: '📦', color: 'bg-blue-50' },
    { label: 'In Stock', value: stats?.items_in_stock || 0, icon: '✅', color: 'bg-green-50' },
    { label: 'Sold', value: stats?.items_sold || 0, icon: '🛒', color: 'bg-pl-pink' },
    { label: 'Revenue', value: `${stats?.total_revenue || 0} DT`, icon: '💵', color: 'bg-yellow-50' },
    { label: 'Costs', value: `${stats?.total_cost || 0} DT`, icon: '🏷️', color: 'bg-orange-50' },
    { label: 'Profit', value: `${stats?.total_profit || 0} DT`, icon: '📈', color: 'bg-green-100' },
    { label: 'Expenses', value: `${stats?.total_expenses || 0} DT`, icon: '💸', color: 'bg-red-50' },
    { label: 'Net Profit', value: `${stats?.net_profit || 0} DT`, icon: '⭐', color: 'bg-pl-red' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((card, index) => (
        <motion.div
          key={index}
          variants={item}
          className={`${card.color} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-pl-black mt-2">{card.value}</p>
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

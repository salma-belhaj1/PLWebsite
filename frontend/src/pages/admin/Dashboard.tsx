import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { useDashboardStats } from '../../hooks/useDashboardStats';

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-pl-black">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} isLoading={isLoading} />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            to="/admin/inventory/new"
            className="bg-pl-red hover:bg-red-600 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105"
          >
            + Add Item
          </Link>
          <Link
            to="/admin/inventory"
            className="bg-blue-500 hover:bg-blue-600 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105"
          >
            Manage Inventory
          </Link>
          <Link
            to="/admin/expenses"
            className="bg-green-500 hover:bg-green-600 text-pl-white rounded-xl p-6 text-center font-semibold transition transform hover:scale-105"
          >
            Track Expenses
          </Link>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-pl-white rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-pl-black mb-4">Recent Sales</h2>
          <p className="text-gray-600">Coming soon: Recent sales activity will appear here</p>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

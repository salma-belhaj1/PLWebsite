import { AdminLayout } from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';

export default function Expenses() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-pl-black">Expense Management</h1>
          <p className="text-gray-600 mt-1">Coming soon: Track packaging, fees, and other expenses</p>
        </div>

        <div className="bg-pl-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 text-lg">Expense tracking coming in Phase 2</p>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

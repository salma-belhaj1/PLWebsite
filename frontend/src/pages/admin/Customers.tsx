import { AdminLayout } from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';

export default function Customers() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-pl-black">Customer Tracking</h1>
          <p className="text-gray-600 mt-1">Coming soon: View customer purchase history</p>
        </div>

        <div className="bg-pl-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg">Customer analytics coming in Phase 3</p>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

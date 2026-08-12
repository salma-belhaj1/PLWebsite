import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { ordersService } from '../../services/api';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price: number;
  cost_price: number;
  created_at: string;
  product?: { name: string };
}

interface OrderRecord {
  id: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  total_amount: number;
  payment_status: string;
  status: string;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export default function Orders() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await ordersService.getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(orderId: number, status: string) {
    try {
      await ordersService.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  }

  async function updatePaymentStatus(orderId: number, paymentStatus: string) {
    try {
      await ordersService.updatePaymentStatus(orderId, paymentStatus);
      toast.success('Payment status updated');
      loadOrders();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_email?.toLowerCase().includes(search) ||
        String(order.id).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
              🧾 Orders
            </h1>
            <p className={`mt-2 font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              Manage customer orders and fulfillment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Total Orders</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-red'}`}>{orders.length}</p>
          </div>
          <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Pending</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {orders.filter(order => order.status === 'pending').length}
            </p>
          </div>
          <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Completed</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {orders.filter(order => order.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border-2 p-4 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, or order ID"
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className={`rounded-2xl border-2 overflow-hidden ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Order</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Customer</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Total</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Payment</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Status</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className={`border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`}>
                      <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                        <div className="font-semibold">#{order.id}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                        <div className="font-semibold">{order.customer_name || 'Unknown'}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                          {order.customer_email || 'No email'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-century font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {order.total_amount.toFixed(2)} TND
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.payment_status}
                          onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg border-2 text-sm font-century ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg border-2 text-sm font-century ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-century text-gray-500">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

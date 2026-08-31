import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { ordersService } from '../../services/api';
import {
  ShoppingCart,
  Search,
  RefreshCw,
} from 'lucide-react';

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
  const { t } = useTranslation();
  const isDark = theme === 'dark';
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
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  }

  async function updatePaymentStatus(orderId: number, paymentStatus: string) {
    try {
      await ordersService.updatePaymentStatus(orderId, paymentStatus);
      toast.success('Payment status updated');
      await loadOrders();
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
        !searchTerm ||
        (order.customer_name || '').toLowerCase().includes(search) ||
        (order.customer_email || '').toLowerCase().includes(search) ||
        (order.customer_phone || '').toLowerCase().includes(search) ||
        String(order.id).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    return { count: orders.length, totalRevenue, pendingOrders, deliveredOrders };
  }, [orders]);

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('admin.orders.title', 'Orders')}
              </h1>
              <button
                onClick={loadOrders}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('admin.orders.subtitle', 'Manage incoming boutique orders, shipping dispatches, and COD payment receipts.')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">{t('admin.orders.totalOrders', 'Total Orders')}</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold">{stats.count}</div>
          </div>
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">{t('admin.orders.totalSalesVolume', 'Total Sales Volume')}</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.totalRevenue.toFixed(2)} DT
            </div>
          </div>
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">{t('admin.orders.pendingProcessing', 'Pending Processing')}</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-500">{stats.pendingOrders}</div>
          </div>
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">{t('admin.orders.completedDelivered', 'Completed & Delivered')}</span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-blue-500">{stats.deliveredOrders}</div>
          </div>
        </div>

        {/* Search & filter */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search order #, customer, phone..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-stone-50 border-stone-200 text-zinc-500'
                }`}>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Items</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Fulfillment</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800/70' : 'divide-stone-100'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                        <span className="text-sm font-medium">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                      <ShoppingCart className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className={isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-stone-50/80'}>
                      <td className="px-5 py-4 font-mono font-bold text-xs text-rose-500">
                        #{order.id}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-sm">{order.customer_name || 'Anonymous'}</p>
                        <div className="text-xs text-zinc-400 flex flex-col gap-0.5 mt-0.5">
                          {order.customer_phone && <span>📞 {order.customer_phone}</span>}
                          {order.shipping_address && <span className="truncate max-w-[200px]">📍 {order.shipping_address}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((it) => (
                              <div key={it.id} className="text-zinc-600 dark:text-zinc-300">
                                {it.quantity}x {it.product?.name || `Product #${it.product_id}`}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400">Standard Order</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-bold text-sm">
                        {order.total_amount.toFixed(2)} TND
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : order.status === 'shipped'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : order.status === 'confirmed'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                              : order.status === 'cancelled'
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={order.payment_status || 'unpaid'}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="unpaid">Unpaid (COD)</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

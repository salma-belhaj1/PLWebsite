import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ordersService } from '../services/api';
import { OrderWithItems } from '../services/supabase/orders';
import Header from '../components/Header';
import { formatPrice } from '../utils/formatters';
import { Package, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) return;
      try {
        const data = await ordersService.getUserOrders(user.id);
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user?.id]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-xs font-century font-semibold text-pl-pink hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Account
          </Link>
          <Link
            to="/shop"
            className="text-xs font-century font-semibold hover:text-pl-pink opacity-80"
          >
            Continue Shopping →
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8 pb-6 border-b border-pl-pink/20">
          <span className="text-xs font-century uppercase tracking-widest text-pl-pink font-semibold">
            Order History
          </span>
          <h1 className="text-3xl sm:text-4xl font-stayvibes text-pl-pink mt-1">
            My Orders
          </h1>
          <p className={`text-xs font-century mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`}>
            Track your deliveries and view past purchases.
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-pl-pink/30 border-t-pl-pink rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-century opacity-70">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <ShoppingBag className="w-14 h-14 text-pl-pink/40 mx-auto mb-4" />
            <h3 className="text-xl font-stayvibes text-pl-pink mb-2">No orders placed yet</h3>
            <p className={`text-xs font-century max-w-sm mx-auto mb-6 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`}>
              When you complete an order, details and tracking updates will appear right here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white shadow-md hover:shadow-pl-pink/30"
            >
              Start Exploring Collections
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className={`p-6 rounded-2xl border smooth-transition ${
                    theme === 'dark'
                      ? 'bg-zinc-900/80 border-zinc-800 hover:border-pl-pink/40'
                      : 'bg-white border-stone-200 shadow-sm hover:border-pl-pink/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pl-pink/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pl-pink/10 text-pl-pink flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-pl-pink">Order #{order.id}</p>
                        <p className={`text-[11px] font-century flex items-center gap-1 mt-0.5 ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                        }`}>
                          <Clock className="w-3 h-3" /> {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-century uppercase px-3 py-1 rounded-full font-semibold ${
                        order.status === 'completed' || order.status === 'delivered'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-base font-century font-bold text-pl-pink ml-2">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="py-4 space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-century">
                        <div className="flex items-center gap-2">
                          <span className="text-pl-pink font-semibold">{item.quantity}x</span>
                          <span>{item.product?.name || 'Peace & Love Item'}</span>
                        </div>
                        <span className="opacity-80">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Shipping info */}
                  <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-century ${
                    theme === 'dark' ? 'border-zinc-800 text-zinc-400' : 'border-stone-100 text-stone-500'
                  }`}>
                    <span>Shipping to: {order.shipping_address || 'Address on file'}</span>
                    <span className="font-mono uppercase">Payment: {order.payment_status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { expensesService, inventoryService, ordersService } from '../../services/api';

interface AnalyticsState {
  startBank: number;
  totalExpenses: number;
  otherExpenses: number;
  entering: number;
  profit: number;
  futureProfit: number;
  hope: number;
  bank: number;
  futureBank: number;
  startDate: string;
  today: string;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Analytics() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [startBankInput, setStartBankInput] = useState(localStorage.getItem('pl_start_bank') || '1200');
  const [state, setState] = useState<AnalyticsState>({
    startBank: Number(localStorage.getItem('pl_start_bank') || 1200),
    totalExpenses: 0,
    otherExpenses: 0,
    entering: 0,
    profit: 0,
    futureProfit: 0,
    hope: 0,
    bank: 0,
    futureBank: 0,
    startDate: '',
    today: new Date().toISOString().split('T')[0],
  });
  const [orderCount, setOrderCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Record<string, number>>({});

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const startBank = Number(localStorage.getItem('pl_start_bank') || startBankInput || 1200);

      const [orders, , expenseRows] = await Promise.all([
        ordersService.getAllOrders({ status: 'completed' }),
        inventoryService.getInventoryValueStats(),
        expensesService.getExpenses({ status: 'active' }),
      ]);

      const allInventory = await inventoryService.getInventory();
      const totalOrderRevenue = (orders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOtherExpenses = (expenseRows || []).reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const productCost = allInventory.reduce((sum, item) => sum + (item.stock_quantity || 0) * (item.product?.cost_price || 0), 0);
      const futureProfit = allInventory.reduce(
        (sum, item) => sum + (item.stock_quantity || 0) * (item.product?.profit || 0),
        0
      );
      const hope = allInventory.reduce(
        (sum, item) => sum + (item.stock_quantity || 0) * (item.product?.price || 0),
        0
      );
      const bank = startBank + totalOrderRevenue - productCost - totalOtherExpenses;
      const futureBank = bank + hope;

      const allOrders = orders || [];
      const startDate = allOrders.length
        ? allOrders.reduce(
            (min, order) => (order.created_at < min ? order.created_at : min),
            allOrders[0].created_at
          ).split('T')[0]
        : new Date().toISOString().split('T')[0];

      const monthly: Record<string, number> = {};
      allOrders.forEach(order => {
        const key = order.created_at.slice(0, 7);
        monthly[key] = (monthly[key] || 0) + (order.total_amount || 0);
      });

      setMonthlyRevenue(monthly);
      setOrderCount(allOrders.length);
      setState({
        startBank,
        totalExpenses: productCost,
        otherExpenses: totalOtherExpenses,
        entering: totalOrderRevenue,
        profit: totalOrderRevenue - productCost - totalOtherExpenses,
        futureProfit,
        hope,
        bank,
        futureBank,
        startDate,
        today: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  const months = useMemo(() => Object.keys(monthlyRevenue).sort(), [monthlyRevenue]);
  const peakRevenue = Math.max(...Object.values(monthlyRevenue), 1);

  function saveStartBank() {
    const value = Number(startBankInput || 0);
    localStorage.setItem('pl_start_bank', String(value));
    setState(prev => ({ ...prev, startBank: value }));
    toast.success('Starting bank updated');
    loadAnalytics();
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className={`text-4xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
            📈 Analytics
          </h1>
          <p className={`mt-2 font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
            Financial snapshot based on stock, orders, and operating expenses
          </p>
        </div>

        <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                Start Bank
              </label>
              <input
                type="number"
                value={startBankInput}
                onChange={e => setStartBankInput(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
              />
            </div>
            <button
              onClick={saveStartBank}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition"
            >
              Save Start Bank
            </button>
            <div className={`rounded-xl px-4 py-3 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-stone-100'}`}>
              <div className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Start Date</div>
              <div className={`font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                {state.startDate || 'No orders yet'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Expenses', value: state.totalExpenses, color: 'text-red-500' },
            { label: 'Other Exp', value: state.otherExpenses, color: 'text-orange-500' },
            { label: 'Entering', value: state.entering, color: 'text-blue-500' },
            { label: 'Profit', value: state.profit, color: 'text-green-500' },
            { label: 'Bank', value: state.bank, color: 'text-pl-pink' },
            { label: 'Future Profit', value: state.futureProfit, color: 'text-purple-500' },
            { label: 'Hope', value: state.hope, color: 'text-indigo-500' },
            { label: 'Future Bank', value: state.futureBank, color: 'text-emerald-500' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
              <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>{card.label}</p>
              <p className={`text-3xl font-stayvibes mt-2 ${card.color}`}>{formatMoney(card.value)} TND</p>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                Chart Profit
              </h2>
              <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                Monthly completed order revenue trend
              </p>
            </div>
            <div className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              Orders: {orderCount}
            </div>
          </div>

          {loading ? (
            <div className={`py-16 text-center rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-zinc-700 text-pl-white/60' : 'border-stone-300 text-pl-black/60'}`}>
              Loading analytics...
            </div>
          ) : months.length === 0 ? (
            <div className={`py-16 text-center rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-zinc-700 text-pl-white/60' : 'border-stone-300 text-pl-black/60'}`}>
              No completed order data yet
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="h-72 rounded-xl border border-stone-200 p-4 bg-stone-50/50">
                <div className="h-full flex items-end gap-3">
                  {months.map(month => {
                    const revenue = monthlyRevenue[month];
                    const height = Math.max((revenue / peakRevenue) * 100, 6);
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-full max-w-14 bg-gradient-to-t from-pl-red to-pl-pink rounded-t-lg" style={{ height: `${height}%` }} />
                        <div className={`mt-2 text-xs font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                          {month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`rounded-xl border-2 p-4 min-w-72 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-stone-200'}`}>
                <h3 className={`font-stayvibes text-xl mb-3 ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                  Monthly Revenue
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {months.map(month => (
                    <div key={month} className={`flex items-center justify-between rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'}`}>
                      <span className={`font-century ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>{month}</span>
                      <span className="font-semibold text-pl-pink">{formatMoney(monthlyRevenue[month])} TND</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
}

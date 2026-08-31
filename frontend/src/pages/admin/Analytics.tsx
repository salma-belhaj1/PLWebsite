import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { expensesService, inventoryService, ordersService } from '../../services/api';
import { RefreshCw } from 'lucide-react';

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
  const { t } = useTranslation();
  const isDark = theme === 'dark';
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
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('admin.analytics.title', 'Analytics')}
              </h1>
              <button
                onClick={loadAnalytics}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('admin.analytics.subtitle', 'Financial snapshot based on warehouse stock, customer orders, and operating expenses.')}
            </p>
          </div>
        </div>

        {/* Start Bank Setting */}
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Starting Working Capital (TND)
              </label>
              <input
                type="number"
                value={startBankInput}
                onChange={e => setStartBankInput(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none transition ${
                  isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              />
            </div>
            <button
              onClick={saveStartBank}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-md shadow-rose-500/20 hover:opacity-95 transition"
            >
              Update Working Capital
            </button>
            <p className="text-xs text-zinc-400">
              Period: {state.startDate || '—'} to {state.today} ({orderCount} orders processed)
            </p>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">Estimated Bank Balance</span>
            <div className="text-2xl sm:text-3xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
              {formatMoney(state.bank)} TND
            </div>
            <p className="text-xs text-zinc-400 mt-1">Starting capital + revenues - expenses</p>
          </div>

          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">Realized Net Profit</span>
            <div className="text-2xl sm:text-3xl font-bold mt-2 text-rose-500">
              {formatMoney(state.profit)} TND
            </div>
            <p className="text-xs text-zinc-400 mt-1">Total revenue - total expenses</p>
          </div>

          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <span className="text-xs text-zinc-500 font-medium">Projected Inventory Margin</span>
            <div className="text-2xl sm:text-3xl font-bold mt-2 text-blue-500">
              {formatMoney(state.futureProfit)} TND
            </div>
            <p className="text-xs text-zinc-400 mt-1">Expected profit when current stock sells</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <h2 className="text-base font-bold tracking-tight mb-4">Financial Flow Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40">
              <p className="text-xs text-zinc-400">Inventory Cost Value</p>
              <p className="text-base font-bold mt-1">{formatMoney(state.totalExpenses)} TND</p>
            </div>
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40">
              <p className="text-xs text-zinc-400">Operational Expenses</p>
              <p className="text-base font-bold mt-1 text-rose-500">{formatMoney(state.otherExpenses)} TND</p>
            </div>
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40">
              <p className="text-xs text-zinc-400">Total Order Sales</p>
              <p className="text-base font-bold mt-1 text-emerald-500">{formatMoney(state.entering)} TND</p>
            </div>
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40">
              <p className="text-xs text-zinc-400">Stock Retail Value</p>
              <p className="text-base font-bold mt-1 text-blue-500">{formatMoney(state.hope)} TND</p>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <h2 className="text-base font-bold tracking-tight mb-4">Monthly Revenue Trajectory</h2>
          {months.length === 0 ? (
            <p className="text-sm text-zinc-400 py-8 text-center">No monthly order records yet</p>
          ) : (
            <div className="space-y-3">
              {months.map(month => {
                const amount = monthlyRevenue[month] || 0;
                const pct = Math.max(8, (amount / peakRevenue) * 100);
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="font-mono text-zinc-500">{month}</span>
                      <span>{formatMoney(amount)} TND</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { expensesService } from '../../services/api';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Receipt,
  TrendingDown,
  RefreshCw,
  X,
  PieChart,
} from 'lucide-react';

interface ExpenseFormState {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  notes: string;
  status: 'active' | 'archived';
}

interface ExpenseItem {
  id: number;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface ExpenseStats {
  total_expenses: number;
  by_category: Record<string, number>;
  count: number;
}

const initialFormState: ExpenseFormState = {
  category: '',
  description: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  notes: '',
  status: 'active',
};

export default function Expenses() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<ExpenseFormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setIsLoading(true);
      const [expenseData, statsData, categoryData] = await Promise.all([
        expensesService.getExpenses({ status: 'active' }),
        expensesService.getExpenseStats(),
        expensesService.getExpenseCategories(),
      ]);

      setExpenses(expenseData || []);
      setStats(statsData || null);
      setCategories((categoryData || []) as string[]);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchCat = selectedCategory === 'all' || expense.category === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        expense.category.toLowerCase().includes(query) ||
        (expense.description || '').toLowerCase().includes(query) ||
        (expense.notes || '').toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  function openExpenseModal(expense?: ExpenseItem) {
    if (expense) {
      setEditingId(expense.id);
      setForm({
        category: expense.category,
        description: expense.description || '',
        amount: expense.amount || 0,
        expense_date: expense.expense_date,
        notes: expense.notes || '',
        status: (expense.status as any) || 'active',
      });
    } else {
      setEditingId(null);
      setForm(initialFormState);
    }
    setShowExpenseModal(true);
  }

  function closeExpenseModal() {
    setShowExpenseModal(false);
    setEditingId(null);
    setForm(initialFormState);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category.trim()) {
      toast.error('Expense category is required');
      return;
    }
    if (form.amount <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await expensesService.updateExpense(editingId, form);
        toast.success('Expense updated successfully');
      } else {
        await expensesService.createExpense(form as any);
        toast.success('Expense logged successfully');
      }
      closeExpenseModal();
      await loadExpenses();
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesService.deleteExpense(id);
      toast.success('Expense deleted');
      await loadExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('admin.expenses.title', 'Expenses')}
              </h1>
              <button
                onClick={loadExpenses}
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('admin.expenses.subtitle', 'Track packaging, raw supplies, marketing, and recurring operational costs.')}
            </p>
          </div>

          <button
            onClick={() => openExpenseModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.expenses.addExpense', 'Add Expense')}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Total Recorded Outflow</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-500">
                {(stats?.total_expenses || 0).toFixed(2)} TND
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Expense Entries</span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {stats?.count || 0}
              </span>
              <span className="text-xs text-zinc-400">transactions</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Active Categories</span>
              <PieChart className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {Object.keys(stats?.by_category || {}).length}
              </span>
              <span className="text-xs text-zinc-400">categories</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense description, notes..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              >
                <option value="all">All Expense Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Description & Notes</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800/70' : 'divide-stone-100'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                        <span className="text-sm font-medium">Loading expenses...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                      <Receipt className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No expense records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className={isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-stone-50/80'}>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                        {expense.expense_date}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm">{expense.description || '—'}</p>
                        {expense.notes && (
                          <p className="text-xs text-zinc-400 mt-0.5">{expense.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-bold text-rose-500">
                        -{expense.amount.toFixed(2)} TND
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openExpenseModal(expense)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition ${
                              isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showExpenseModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                }`}
              >
                <div className={`flex items-center justify-between p-5 border-b ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <h2 className="font-bold text-base tracking-tight">
                    {editingId ? 'Edit Expense Record' : 'Record Business Expense'}
                  </h2>
                  <button onClick={closeExpenseModal} className="text-zinc-400 hover:text-zinc-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Expense Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., Packaging, Raw Silk, Advertising"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                        isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Amount (TND) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={form.amount || ''}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none transition ${
                        isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.expense_date}
                      onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                        isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g., 100x Luxury mailing boxes from supplier"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                        isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Invoice reference, supplier phone..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                        isDark ? 'bg-zinc-800 border-zinc-700 focus:border-rose-500 text-zinc-100' : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                      }`}
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={closeExpenseModal}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-md shadow-rose-500/20 hover:opacity-95 transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update' : 'Save Expense'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

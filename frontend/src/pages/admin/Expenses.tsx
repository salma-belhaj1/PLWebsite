import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { expensesService } from '../../services/api';

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
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [form, setForm] = useState<ExpenseFormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  function openExpenseModal() {
    setShowExpenseModal(true);
  }

  function closeExpenseModal() {
    setShowExpenseModal(false);
    resetForm();
  }

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
    if (selectedCategory === 'all') {
      return expenses;
    }

    return expenses.filter(expense => expense.category === selectedCategory);
  }, [expenses, selectedCategory]);

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
  }

  function startEdit(expense: ExpenseItem) {
    setEditingId(expense.id);
    setForm({
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0],
      notes: expense.notes || '',
      status: (expense.status as 'active' | 'archived') || 'active',
    });
    setShowExpenseModal(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.category.trim() || !form.description.trim() || form.amount <= 0) {
      toast.error('Fill all required fields with valid values');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category: form.category.trim(),
        description: form.description.trim(),
        amount: form.amount,
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
        status: form.status,
      };

      if (editingId) {
        await expensesService.updateExpense(editingId, payload);
        toast.success('Expense updated');
      } else {
        await expensesService.createExpense(payload as any);
        toast.success('Expense added');
      }

      resetForm();
      await loadExpenses();
      closeExpenseModal();
    } catch (error) {
      console.error('Expense save failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    try {
      await expensesService.archiveExpense(id);
      toast.success('Expense archived');
      await loadExpenses();
    } catch (error) {
      console.error('Archive failed:', error);
      toast.error('Failed to archive expense');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this expense permanently?')) return;

    try {
      await expensesService.deleteExpense(id);
      toast.success('Expense deleted');
      await loadExpenses();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete expense');
    }
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
              💰 Expense Management
            </h1>
            <p className={`mt-2 font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              Track packaging, shipping, and operating costs
            </p>
          </div>
          <motion.button
            onClick={openExpenseModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition"
          >
            + New Expense
          </motion.button>
        </div>

        {stats && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
              <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Total Expenses</p>
              <p className={`text-2xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-red'}`}>
                {stats.total_expenses.toFixed(2)} TND
              </p>
            </div>
            <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
              <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Expense Count</p>
              <p className={`text-2xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {stats.count}
              </p>
            </div>
            <div className={`rounded-2xl border-2 p-6 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
              <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Categories</p>
              <p className={`text-2xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {Object.keys(stats.by_category).length}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showExpenseModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className={`w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-stone-200'}`}
              >
                <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-stone-50'}`}>
                  <div>
                    <h2 className={`text-2xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                      {editingId ? 'Edit Expense' : 'Add Expense'}
                    </h2>
                    <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                      Create or update operating costs with category, amount, and notes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeExpenseModal}
                    className={`text-2xl ${theme === 'dark' ? 'text-pl-white/60 hover:text-pl-white' : 'text-pl-black/60 hover:text-pl-black'}`}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Category *
                    </label>
                    <input
                      list="expense-categories"
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                      placeholder="Packaging, Shipping, Supplies..."
                    />
                    <datalist id="expense-categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Amount (TND) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={form.expense_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'active' | 'archived' }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Description *
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                      placeholder="Describe the expense"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                      Notes
                    </label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
                      placeholder="Optional notes"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-wrap gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={closeExpenseModal}
                      className={`px-6 py-3 rounded-lg font-century font-semibold border-2 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-100 border-stone-200 text-pl-black'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`rounded-2xl border-2 p-4 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
          <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
            Filter by category
          </label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className={`w-full md:w-80 px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'}`}
          >
            <option value="all">All categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className={`rounded-2xl border-2 overflow-hidden ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Category</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Description</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Amount</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Date</th>
                  <th className={`px-6 py-4 text-left text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No expenses recorded</td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className={`border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`}>
                      <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                        {expense.category}
                      </td>
                      <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                        {expense.description || '—'}
                        {expense.notes && (
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-pl-white/40' : 'text-pl-black/40'}`}>
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-century font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {expense.amount.toFixed(2)} TND
                      </td>
                      <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-century space-x-2">
                        <button
                          onClick={() => startEdit(expense)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${theme === 'dark' ? 'bg-pl-pink/20 text-pl-pink' : 'bg-pl-pink/10 text-pl-pink'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(expense.id)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}
                        >
                          Delete
                        </button>
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

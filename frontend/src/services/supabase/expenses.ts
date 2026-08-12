import { supabase } from '../../lib/supabase';

export interface Expense {
  id: number;
  category: string;
  description: string | null;
  amount: number;
  quantity: number;
  expense_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Get all expenses
export async function getExpenses(filters?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  let query = supabase.from('other_expenses').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

// Get expenses by category
export async function getExpensesByCategory(category: string) {
  const { data, error } = await supabase
    .from('other_expenses')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

// Get unique categories
export async function getExpenseCategories() {
  const { data, error } = await supabase
    .from('other_expenses')
    .select('category')
    .eq('status', 'active');

  if (error) throw error;

  const categories = [...new Set((data || []).map((e: any) => e.category))];
  return categories;
}

// Create expense
export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('other_expenses')
    .insert({
      ...expense,
      status: expense.status || 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

// Update expense
export async function updateExpense(id: number, updates: Partial<Expense>) {
  const { data, error } = await supabase
    .from('other_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

// Archive expense (soft delete)
export async function archiveExpense(id: number) {
  return updateExpense(id, { status: 'archived' });
}

// Delete expense (hard delete)
export async function deleteExpense(id: number) {
  const { error } = await supabase.from('other_expenses').delete().eq('id', id);

  if (error) throw error;
}

// Get expense statistics
export async function getExpenseStats(startDate?: string, endDate?: string) {
  let query = supabase
    .from('other_expenses')
    .select('*')
    .eq('status', 'active');

  if (startDate) {
    query = query.gte('expense_date', startDate);
  }

  if (endDate) {
    query = query.lte('expense_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  const expenses = data || [];
  const totalExpenses = expenses.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  expenses.forEach((e: Expense) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
  });

  return {
    total_expenses: totalExpenses,
    by_category: byCategory,
    count: expenses.length,
  };
}

// Get monthly expense breakdown
export async function getMonthlyExpenses(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const { data, error } = await supabase
    .from('other_expenses')
    .select('*')
    .eq('status', 'active')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: true });

  if (error) throw error;
  return data as Expense[];
}

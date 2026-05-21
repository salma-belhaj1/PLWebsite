import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types/database';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const { data, error: err } = await supabase
          .from('inventory_items')
          .select('*');

        if (err) throw err;

        const items = data || [];
        const soldItems = items.filter(i => i.status === 'vendu');

        const { data: expenses, error: expErr } = await supabase
          .from('expenses')
          .select('*');

        if (expErr) throw expErr;

        const expenseList = expenses || [];
        const totalExpenses = expenseList.reduce((sum, e) => sum + (e.amount || 0), 0);
        const packagingExpenses = expenseList
          .filter(e => e.type === 'packaging')
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        const totalRevenue = soldItems.reduce((sum, i) => sum + (i.selling_price || 0), 0);
        const totalCost = soldItems.reduce((sum, i) => sum + (i.cost_price || 0), 0);
        const totalProfit = totalRevenue - totalCost;

        setStats({
          total_items: items.length,
          items_in_stock: items.filter(i => i.status === 'en_stock').length,
          items_sold: soldItems.length,
          total_revenue: Number(totalRevenue.toFixed(3)),
          total_cost: Number(totalCost.toFixed(3)),
          total_profit: Number(totalProfit.toFixed(3)),
          total_expenses: Number(totalExpenses.toFixed(3)),
          net_profit: Number((totalProfit - totalExpenses).toFixed(3)),
          packaging_expenses: Number(packagingExpenses.toFixed(3)),
          categories_count: 5,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}

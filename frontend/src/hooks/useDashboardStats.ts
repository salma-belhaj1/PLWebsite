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
        
        // Fetch products count
        const { data: products, error: prodErr } = await supabase
          .from('products')
          .select('*', { count: 'exact' });
        if (prodErr) throw prodErr;

        // Fetch inventory items
        const { data: inventory, error: invErr } = await supabase
          .from('inventory_items')
          .select('*');
        if (invErr) throw invErr;

        // Fetch orders
        const { data: orders, error: ordErr } = await supabase
          .from('orders')
          .select('*');
        if (ordErr) throw ordErr;

        const inventoryList = (inventory || []) as any[];
        const orderList = (orders || []) as any[];
        
        const totalRevenue = orderList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        setStats({
          total_items: (products || []).length,
          items_in_stock: inventoryList.filter(i => (i.stock_quantity || 0) > 0).length,
          items_sold: orderList.length,
          total_revenue: Number(totalRevenue.toFixed(2)),
          total_cost: 0,
          total_profit: Number(totalRevenue.toFixed(2)),
          total_expenses: 0,
          net_profit: Number(totalRevenue.toFixed(2)),
          packaging_expenses: 0,
          categories_count: 1,
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

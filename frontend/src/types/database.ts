export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  color: string | null;
  image_url: string | null;
  status: 'en_stock' | 'vendu' | 'reserve' | 'endommage';
  cost_price: number;
  selling_price: number;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  type: 'packaging' | 'bank_fee' | 'shipping' | 'other';
  description: string | null;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  phone: string | null;
  birth_date?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  postal_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface InventoryWithCategory extends InventoryItem {
  category?: Category;
  profit?: number;
}

export interface DashboardStats {
  total_items: number;
  items_in_stock: number;
  items_sold: number;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  total_expenses: number;
  net_profit: number;
  packaging_expenses: number;
  categories_count: number;
}

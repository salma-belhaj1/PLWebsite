import { supabase } from '../../lib/supabase';

export interface InventoryItem {
  id: number;
  product_id: number;
  sku: string | null;
  stock_quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryWithProduct extends InventoryItem {
  product: {
    id: number;
    name: string;
    description: string | null;
    category_id: number | null;
    category?: {
      id: number;
      name: string;
    } | null;
    price: number;
    cost_price: number;
    profit: number;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    status: string;
  };
}

// Get all inventory items
export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, description, category_id, price, cost_price, profit, image_url, is_active, is_featured, status, category:categories(id, name))
    `);

  if (error) throw error;
  return data as InventoryWithProduct[];
}

// Get inventory item for product
export async function getInventoryByProductId(productId: number) {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, description, category_id, price, cost_price, profit, image_url, is_active, is_featured, status, category:categories(id, name))
    `)
    .eq('product_id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as InventoryWithProduct;
}

// Get low stock items
export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, description, category_id, price, cost_price, profit, image_url, is_active, is_featured, status, category:categories(id, name))
    `)
    .lte('stock_quantity', supabase.raw('reorder_level'))
    .order('stock_quantity', { ascending: true });

  if (error) throw error;
  return data as InventoryWithProduct[];
}

// Get out of stock items
export async function getOutOfStockItems() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, description, category_id, price, cost_price, profit, image_url, is_active, is_featured, status, category:categories(id, name))
    `)
    .eq('stock_quantity', 0);

  if (error) throw error;
  return data as InventoryWithProduct[];
}

// Update stock quantity
export async function updateStockQuantity(productId: number, quantity: number) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ stock_quantity: quantity })
    .eq('product_id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

// Add to stock
export async function addStock(productId: number, quantity: number) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      stock_quantity: supabase.raw('stock_quantity + ' + quantity),
      last_restocked: new Date().toISOString(),
    })
    .eq('product_id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

// Remove from stock
export async function removeStock(productId: number, quantity: number) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ stock_quantity: supabase.raw('stock_quantity - ' + quantity) })
    .eq('product_id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

// Update reorder levels
export async function updateReorderLevels(
  productId: number,
  reorderLevel: number,
  reorderQuantity: number
) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ reorder_level: reorderLevel, reorder_quantity: reorderQuantity })
    .eq('product_id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

// Update inventory details (SKU, quantity, reorder values)
export async function updateInventoryItem(
  productId: number,
  updates: Partial<Pick<InventoryItem, 'sku' | 'stock_quantity' | 'reorder_level' | 'reorder_quantity' | 'last_restocked'>>
) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('product_id', productId)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

// Get inventory value statistics
export async function getInventoryValueStats() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, cost_price, category_id, category:categories(id, name))
    `);

  if (error) throw error;

  const inventory = data as InventoryWithProduct[];

  let totalValue = 0;
  let totalItems = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  inventory.forEach((item) => {
    const value = item.stock_quantity * (item.product?.cost_price || 0);
    totalValue += value;
    totalItems += item.stock_quantity;

    if (item.stock_quantity === 0) {
      outOfStockCount++;
    } else if (item.stock_quantity <= item.reorder_level) {
      lowStockCount++;
    }
  });

  return {
    total_inventory_value: totalValue,
    total_items_in_stock: totalItems,
    low_stock_count: lowStockCount,
    out_of_stock_count: outOfStockCount,
    total_products: inventory.length,
  };
}

// Search inventory
export async function searchInventory(query: string) {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(id, name, description, category_id, price, cost_price, profit, image_url, is_active, is_featured, status, category:categories(id, name))
    `)
    .or(`sku.ilike.%${query}%,product.name.ilike.%${query}%`);

  if (error) throw error;
  return data as InventoryWithProduct[];
}

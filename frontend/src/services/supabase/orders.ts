import { supabase } from '../../lib/supabase';

export interface Order {
  id: number;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  total_amount: number;
  payment_status: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price: number;
  cost_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Create order from cart
export async function createOrder(orderData: {
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: { product_id: number; variant_id: number | null; quantity: number; price: number }[];
  total_amount: number;
}) {
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id || null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total_amount,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert order items and update product stock
  for (const item of orderData.items) {
    // Insert order item
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      cost_price: 0, // Could be populated from product data
    });

    if (itemError) throw itemError;

    // Update inventory stock
    if (item.variant_id) {
      const { error: variantError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: supabase.raw('stock_quantity - ' + item.quantity),
        })
        .eq('id', item.variant_id);

      if (variantError) throw variantError;
    }
  }

  return order as Order;
}

// Get order by ID with items
export async function getOrder(orderId: number) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data as OrderWithItems;
}

// Get user's orders
export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, price)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OrderWithItems[];
}

// Get all orders (admin)
export async function getAllOrders(filters?: {
  status?: string;
  payment_status?: string;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(name, price)
      )
    `);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as OrderWithItems[];
}

// Update order status (admin)
export async function updateOrderStatus(orderId: number, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

// Update payment status (admin)
export async function updatePaymentStatus(orderId: number, payment_status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

// Add notes to order (admin)
export async function addOrderNotes(orderId: number, notes: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ notes })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

// Get order statistics (admin)
export async function getOrderStats() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*');

  if (error) throw error;

  const totalOrders = orders?.length || 0;
  const totalRevenue = (orders || []).reduce((sum: number, o: Order) => sum + (o.total_amount || 0), 0);
  const pendingOrders = (orders || []).filter((o: Order) => o.status === 'pending').length;
  const completedOrders = (orders || []).filter((o: Order) => o.status === 'completed').length;

  return {
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    pending_orders: pendingOrders,
    completed_orders: completedOrders,
    average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
}

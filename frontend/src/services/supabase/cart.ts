import { supabase } from '../../lib/supabase';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Get or create cart for user
export async function getOrCreateCart(userId: string) {
  // Try to get existing cart
  const { data: existingCart } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingCart) {
    return existingCart;
  }

  // Create new cart
  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();

  if (createError) throw createError;
  return newCart;
}

// Get cart items with product details
export async function getCartItems(cartId: number) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `)
    .eq('cart_id', cartId);

  if (error) throw error;
  return data as (CartItem & { product: any; variant: any })[];
}

// Add item to cart
export async function addToCart(cartId: number, productId: number, variantId: number | null, quantity: number) {
  // Check if item already exists
  let query = supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId);

  if (variantId) {
    query = query.eq('variant_id', variantId);
  } else {
    query = query.is('variant_id', null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    // Update quantity
    return updateCartItemQuantity(existing.id, existing.quantity + quantity);
  }

  // Insert new item
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CartItem;
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: number, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as CartItem;
}

// Remove item from cart
export async function removeFromCart(itemId: number) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);

  if (error) throw error;
}

// Clear entire cart
export async function clearCart(cartId: number) {
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);

  if (error) throw error;
}

// Get cart total
export async function getCartTotal(cartId: number): Promise<number> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, product:products(price)')
    .eq('cart_id', cartId);

  if (error) throw error;

  return (data || []).reduce((total: number, item: any) => {
    return total + (item.quantity * parseFloat(item.product.price));
  }, 0);
}

// Get item count in cart
export async function getCartCount(cartId: number): Promise<number> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('cart_id', cartId);

  if (error) throw error;

  return (data || []).reduce((total: number, item: any) => total + item.quantity, 0);
}

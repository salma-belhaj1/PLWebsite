import { supabase } from '../../lib/supabase';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  price: number;
  cost_price: number;
  profit: number;
  sku: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_type: string;
  variant_value: string;
  stock_quantity: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

// Get all active products
export async function getProducts(filters?: {
  categoryId?: number;
  search?: string;
  inStock?: boolean;
  featured?: boolean;
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      variants:product_variants(*)
    `)
    .eq('is_active', true);

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Product & { category: Category; variants: ProductVariant[] })[];
}

// Get single product with variants
export async function getProduct(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      variants:product_variants(*),
      inventory:inventory_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product & { 
    category: Category; 
    variants: ProductVariant[];
    inventory: any;
  };
}

// Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

// Upload product image to Supabase Storage and return a public URL
export async function uploadProductImage(file: File) {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('products').getPublicUrl(filePath);
  return data.publicUrl;
}

// Get products by category
export async function getProductsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as (Product & { variants: ProductVariant[] })[];
}

// Get featured products
export async function getFeaturedProducts(limit = 6) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Product & { variants: ProductVariant[] })[];
}

// Create product (admin only)
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;

  // Create inventory item
  if (data.id) {
    await supabase.from('inventory_items').insert({
      product_id: data.id,
      sku: product.sku || `SKU-${data.id}`,
      stock_quantity: 0,
    });
  }

  return data as Product;
}

// Update product (admin only)
export async function updateProduct(id: number, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

// Delete product (admin only)
export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get product stock status
export function getProductStock(variants: ProductVariant[]): number {
  return variants.reduce((total, v) => total + (v.stock_quantity || 0), 0);
}

// Check if product is in stock
export function isProductInStock(variants: ProductVariant[]): boolean {
  return getProductStock(variants) > 0;
}

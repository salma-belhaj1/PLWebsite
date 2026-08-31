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

// Helper to fetch variants for a list of products
async function populateProductVariants(products: any[]) {
  if (!products || products.length === 0) return products;
  
  // Find products that don't have variants array attached yet
  const needsVariants = products.filter((p) => !p.variants || !Array.isArray(p.variants) || p.variants.length === 0);
  if (needsVariants.length === 0) return products;

  try {
    const productIds = needsVariants.map((p) => p.id);
    const { data: variantsData, error } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds);

    if (!error && variantsData && variantsData.length > 0) {
      const varMap = new Map<number, any[]>();
      variantsData.forEach((v: any) => {
        const list = varMap.get(v.product_id) || [];
        list.push(v);
        varMap.set(v.product_id, list);
      });

      return products.map((p) => {
        if (!p.variants || p.variants.length === 0) {
          return { ...p, variants: varMap.get(p.id) || [] };
        }
        return p;
      });
    }
  } catch (e) {
    console.warn('Could not populate product variants separately:', e);
  }

  return products;
}

// Get all active products
export async function getProducts(filters?: {
  categoryId?: number;
  search?: string;
  inStock?: boolean;
  featured?: boolean;
}) {
  try {
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

    if (error) {
      console.warn('Supabase join query error in getProducts (trying fallback):', error);
      // Fallback query without embedded join
      let fallbackQuery = supabase
        .from('products')
        .select(`*, category:categories(id, name)`)
        .eq('is_active', true);

      if (filters?.categoryId) fallbackQuery = fallbackQuery.eq('category_id', filters.categoryId);
      if (filters?.search) fallbackQuery = fallbackQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      if (filters?.featured) fallbackQuery = fallbackQuery.eq('is_featured', true);

      const fallbackRes = await fallbackQuery.order('created_at', { ascending: false });
      if (fallbackRes.error) {
        console.warn('Fallback getProducts error:', fallbackRes.error);
        return [];
      }

      const populated = await populateProductVariants(fallbackRes.data || []);
      return populated as (Product & { category: Category; variants: ProductVariant[] })[];
    }

    const finalData = await populateProductVariants(data || []);
    return (finalData || []) as (Product & { category: Category; variants: ProductVariant[] })[];
  } catch (err) {
    console.warn('Exception in getProducts:', err);
    return [];
  }
}

// Get single product with variants
export async function getProduct(id: number) {
  try {
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

    if (error) {
      console.warn('Supabase getProduct join error, trying fallback:', error);
      const fallback = await supabase
        .from('products')
        .select(`*, category:categories(id, name)`)
        .eq('id', id)
        .single();

      if (fallback.error || !fallback.data) {
        return null;
      }

      const populated = await populateProductVariants([fallback.data]);
      return (populated[0] || fallback.data) as Product & { 
        category: Category; 
        variants: ProductVariant[];
        inventory: any;
      };
    }

    const populated = await populateProductVariants([data]);
    return (populated[0] || data) as Product & { 
      category: Category; 
      variants: ProductVariant[];
      inventory: any;
    };
  } catch (err) {
    console.warn('Exception in getProduct:', err);
    return null;
  }
}

// Get all categories
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase getCategories error:', error);
      return [];
    }
    return (data || []) as Category[];
  } catch (err) {
    console.warn('Exception in getCategories:', err);
    return [];
  }
}

// Create category (admin only)
export async function createCategory(category: { name: string; description?: string | null }) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      name: category.name,
      description: category.description || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

// Update category (admin only)
export async function updateCategory(id: number, updates: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

// Delete category (admin only)
export async function deleteCategory(id: number) {
  try {
    // Unlink products from this category first to prevent constraint errors
    await supabase.from('products').update({ category_id: null }).eq('category_id', id);
  } catch (err) {
    console.warn('Could not unlink products before deleting category:', err);
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Helper to convert file to Base64 data URL as fallback if Supabase storage bucket is not configured
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Upload product image to Supabase Storage and return a public URL (supports .webp, .png, .jpg, .avif)
export async function uploadProductImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Map content-types properly for webp, png, jpeg, etc.
    let contentType = file.type;
    if (!contentType) {
      if (fileExt === 'webp') contentType = 'image/webp';
      else if (fileExt === 'png') contentType = 'image/png';
      else if (fileExt === 'gif') contentType = 'image/gif';
      else if (fileExt === 'avif') contentType = 'image/avif';
      else contentType = 'image/jpeg';
    }

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        upsert: true,
        contentType,
      });

    if (uploadError) {
      console.warn('Supabase storage upload returned error (will fallback to Data URL):', uploadError);
      return await fileToBase64(file);
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data?.publicUrl || (await fileToBase64(file));
  } catch (err) {
    console.warn('Storage upload exception (will fallback to Data URL):', err);
    return await fileToBase64(file);
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: number) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        variants:product_variants(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('getProductsByCategory join error, trying fallback:', error);
      const fallback = await supabase
        .from('products')
        .select(`*, category:categories(id, name)`)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      const populated = await populateProductVariants(fallback.data || []);
      return populated as (Product & { category: Category; variants: ProductVariant[] })[];
    }

    const populated = await populateProductVariants(data || []);
    return populated as (Product & { category: Category; variants: ProductVariant[] })[];
  } catch (err) {
    console.warn('Exception in getProductsByCategory:', err);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(limit = 6) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('getFeaturedProducts join error, trying fallback:', error);
      const fallback = await supabase
        .from('products')
        .select(`*, category:categories(id, name)`)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      const populated = await populateProductVariants(fallback.data || []);
      return populated as (Product & { category: Category; variants: ProductVariant[] })[];
    }

    const populated = await populateProductVariants(data || []);
    return populated as (Product & { category: Category; variants: ProductVariant[] })[];
  } catch (err) {
    console.warn('Exception in getFeaturedProducts:', err);
    return [];
  }
}

// Save product variants (admin only)
export async function saveProductVariants(
  productId: number,
  variants: Array<{ id?: number; variant_type?: string; variant_name?: string; variant_value: string; stock_quantity?: number }>
) {
  try {
    // Delete existing variants for this product
    await supabase.from('product_variants').delete().eq('product_id', productId);

    if (variants.length > 0) {
      const payload = variants.map(v => ({
        product_id: productId,
        variant_type: v.variant_type || v.variant_name || 'Standard',
        variant_value: v.variant_value,
        stock_quantity: v.stock_quantity ?? 1,
      }));

      const { data, error } = await supabase.from('product_variants').insert(payload).select();
      if (error) {
        console.warn('Supabase product_variants insert error:', error);
      }
      return data || [];
    }
  } catch (err) {
    console.warn('saveProductVariants error:', err);
  }
  return [];
}

// Create product (admin only)
export async function createProduct(product: any) {
  const price = Number(product.price || 0);
  const costPrice = Number(product.cost_price || 0);
  const profit = price - costPrice;

  // Build clean payload with only standard database columns
  const productPayload: Record<string, any> = {
    name: product.name,
    description: product.description || null,
    price,
    cost_price: costPrice,
    profit,
    sku: product.sku || null,
    image_url: product.image_url || null,
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
    status: product.status || 'available',
  };

  if (product.category_id !== undefined && product.category_id !== null && product.category_id !== '') {
    productPayload.category_id = Number(product.category_id);
  }

  const { data, error } = await supabase
    .from('products')
    .insert([productPayload])
    .select()
    .single();

  if (error) throw error;

  // Create inventory item
  if (data.id) {
    try {
      await supabase.from('inventory_items').insert({
        product_id: data.id,
        sku: product.sku || `SKU-${data.id}`,
        stock_quantity: 0,
      });
    } catch (invErr) {
      console.warn('Could not auto-create inventory item:', invErr);
    }
  }

  return data as Product;
}

// Update product (admin only)
export async function updateProduct(id: number, updates: any) {
  const productPayload: Record<string, any> = {};

  if (updates.name !== undefined) productPayload.name = updates.name;
  if (updates.description !== undefined) productPayload.description = updates.description;
  if (updates.sku !== undefined) productPayload.sku = updates.sku;
  if (updates.image_url !== undefined) productPayload.image_url = updates.image_url;
  if (updates.is_active !== undefined) productPayload.is_active = updates.is_active;
  if (updates.is_featured !== undefined) productPayload.is_featured = updates.is_featured;
  if (updates.status !== undefined) productPayload.status = updates.status;

  if (updates.category_id !== undefined) {
    productPayload.category_id =
      updates.category_id !== null && updates.category_id !== ''
        ? Number(updates.category_id)
        : null;
  }

  if (updates.price !== undefined || updates.cost_price !== undefined) {
    const price = Number(updates.price ?? 0);
    const costPrice = Number(updates.cost_price ?? 0);
    productPayload.price = price;
    productPayload.cost_price = costPrice;
    productPayload.profit = price - costPrice;
  }

  const { data, error } = await supabase
    .from('products')
    .update(productPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

// Delete product (admin only)
export async function deleteProduct(id: number) {
  // 1. Delete associated inventory items
  try {
    await supabase.from('inventory_items').delete().eq('product_id', id);
  } catch (err) {
    console.warn('Could not pre-delete inventory_items for product', id, err);
  }

  // 2. Delete associated variants
  try {
    await supabase.from('product_variants').delete().eq('product_id', id);
  } catch (err) {
    console.warn('Could not pre-delete product_variants for product', id, err);
  }

  // 3. Delete associated cart items
  try {
    await supabase.from('cart_items').delete().eq('product_id', id);
  } catch (err) {
    console.warn('Could not pre-delete cart_items for product', id, err);
  }

  // 4. Delete the product itself
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteProduct error:', error);
    throw error;
  }
}

// Get product stock status
export function getProductStock(variants: ProductVariant[]): number {
  return variants.reduce((total, v) => total + (v.stock_quantity || 0), 0);
}

// Check if product is in stock
export function isProductInStock(variants: ProductVariant[]): boolean {
  return getProductStock(variants) > 0;
}

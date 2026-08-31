// ========================================
// SERVICE LAYER (Updated)
// Now uses Supabase instead of Express backend
// ========================================

import * as productsService from './supabase/products';
import * as authService from './supabase/auth';
import * as cartService from './supabase/cart';
import * as ordersService from './supabase/orders';
import * as expensesService from './supabase/expenses';
import * as inventoryService from './supabase/inventory';

// Legacy interfaces for backward compatibility
export interface ProductVariant {
  id?: number;
  variant_type?: string;
  variant_value?: string;
  stock_quantity: number;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cost_price?: number;
  profit?: number;
  status: string;
  category_id?: number;
  category?: string | { id: number; name: string } | null;
  image_url?: string | null;
  variants: ProductVariant[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

// ==========================================
// PRODUCTS SERVICE
// ==========================================
export const productService = {
  getAllProducts: async (
    options?: {
      categoryId?: number;
      q?: string;
      sort?: string;
      inStock?: boolean;
      limit?: number;
      offset?: number;
    }
  ) => {
    try {
      const products = await productsService.getProducts({
        categoryId: options?.categoryId,
        search: options?.q,
        featured: false,
      });

      return { data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProduct: async (id: number) => {
    try {
      return await productsService.getProduct(id);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  getFeaturedProducts: async (limit?: number) => {
    try {
      const products = await productsService.getFeaturedProducts(limit || 6);
      return { data: products };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const categories = await productsService.getCategories();
      return { data: categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getProductsByCategory: async (categoryId: number) => {
    try {
      const products = await productsService.getProductsByCategory(categoryId);
      return { data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  createProduct: async (product: any) => {
    try {
      return await productsService.createProduct(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: number, updates: any) => {
    try {
      return await productsService.updateProduct(id, updates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      return await productsService.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  createCategory: async (category: any) => {
    try {
      return await productsService.createCategory(category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id: number, updates: any) => {
    try {
      return await productsService.updateCategory(id, updates);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      return await productsService.deleteCategory(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  saveProductVariants: async (productId: number, variants: any[]) => {
    try {
      return await productsService.saveProductVariants(productId, variants);
    } catch (error) {
      console.error('Error saving variants:', error);
      throw error;
    }
  },
};

// ==========================================
// ORDERS SERVICE
// ==========================================
export const orderService = {
  placeOrder: async (payload: any) => {
    try {
      return await ordersService.createOrder(payload);
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  getOrder: async (orderId: number) => {
    try {
      return await ordersService.getOrder(orderId);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  getUserOrders: async (userId: string) => {
    try {
      return await ordersService.getUserOrders(userId);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
};

// ==========================================
// Export all services for direct use
// ==========================================
export {
  authService,
  cartService,
  ordersService,
  expensesService,
  inventoryService,
  productsService,
};

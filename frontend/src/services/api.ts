import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface ProductVariant {
  variant_type: string;
  variant_value: string;
  stock_quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  status: string;
  category: string;
  variants: ProductVariant[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export const productService = {
  // Get all products with optional filtering
  getAllProducts: async (category?: string, limit = 20, offset = 0) => {
    try {
      const response = await api.get('/products', {
        params: { category, limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id: number) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default api;

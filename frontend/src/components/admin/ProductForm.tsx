import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productsService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import VariantsManager from './VariantsManager';

interface ProductFormProps {
  productId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductData {
  name: string;
  description: string;
  category_id: number | null;
  price: number;
  cost_price: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  status: string;
}

interface Variant {
  id?: number;
  variant_name: string;
  variant_value: string;
  variant_type?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    category_id: null,
    price: 0,
    cost_price: 0,
    sku: '',
    is_active: true,
    is_featured: false,
    status: 'available',
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await productsService.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          const product = await productsService.getProduct(productId);
          if (product) {
            setExistingImageUrl(product.image_url || null);
            setFormData({
              name: product.name || '',
              description: product.description || '',
              category_id: product.category_id,
              price: product.price || 0,
              cost_price: product.cost_price || 0,
              sku: product.sku || '',
              is_active: product.is_active !== false,
              is_featured: product.is_featured || false,
              status: product.status || 'available',
            });
            
            // Load variants if they exist
            // Note: This would require a getProductVariants method in the service
            // For now, variants start empty
            setVariants([]);
          }
        } catch (err) {
          console.error('Failed to load product:', err);
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (formData.price < 0 || formData.cost_price < 0) {
      toast.error('Prices must be positive');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = existingImageUrl;

      if (imageFile) {
        imageUrl = await productsService.uploadProductImage(imageFile);
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
      };

      const { category_id, ...restPayload } = payload;
      const updatePayload = {
        ...restPayload,
        ...(category_id !== null ? { category_id } : {}),
      };

      let newProductId = productId;

      if (productId) {
        // Update existing product
        await productsService.updateProduct(productId, updatePayload);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const result = await productsService.createProduct(payload as any);
        newProductId = result?.id;
        toast.success('Product created successfully');
      }

      // Save variants if any
      if (variants.length > 0 && newProductId) {
        try {
          // Note: This would need to be implemented in the productsService
          // For now, we'll just proceed without saving variants
          // In a full implementation, you'd call:
          // await productsService.saveProductVariants(newProductId, variants);
          console.log('Variants to save:', variants);
        } catch (err) {
          console.warn('Could not save variants:', err);
          // Don't fail the entire operation if variants fail
        }
      }

      onSuccess();
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const profit = formData.price - formData.cost_price;
  const margin = formData.price > 0 ? ((profit / formData.price) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        theme === 'dark' ? 'bg-black/50' : 'bg-black/50'
      }`}
    >
      <div
        className={`rounded-2xl border-2 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          theme === 'dark'
            ? 'bg-zinc-900 border-zinc-700'
            : 'bg-white border-stone-200'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-6 border-b ${
            theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <h2 className={`text-2xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
            {productId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className={`text-2xl ${theme === 'dark' ? 'text-pl-white/60 hover:text-pl-white' : 'text-pl-black/60 hover:text-pl-black'}`}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                  : 'bg-white border-stone-200 text-pl-black'
              }`}
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                  : 'bg-white border-stone-200 text-pl-black'
              }`}
              placeholder="Enter product description"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white file:text-pl-white file:bg-zinc-700'
                  : 'bg-white border-stone-200 text-pl-black file:bg-stone-100 file:text-pl-black'
              }`}
            />
            {(imagePreview || existingImageUrl) && (
              <div className="mt-3 flex items-center gap-4">
                <img
                  src={imagePreview || existingImageUrl || ''}
                  alt="Product preview"
                  className="h-20 w-20 rounded-xl object-cover border-2 border-stone-200"
                />
                <p className={`text-xs font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                  {imageFile ? 'New image selected' : 'Existing image'}
                </p>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                  : 'bg-white border-stone-200 text-pl-black'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Selling Price */}
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                Selling Price (TND) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                    : 'bg-white border-stone-200 text-pl-black'
                }`}
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                Cost Price (TND) *
              </label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                    : 'bg-white border-stone-200 text-pl-black'
                }`}
              />
            </div>

            {/* Profit Display */}
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                Profit / Margin
              </label>
              <div className={`w-full px-4 py-2 rounded-lg border-2 font-century text-center font-semibold ${
                profit >= 0
                  ? theme === 'dark'
                    ? 'bg-green-900/20 text-green-300 border-green-500/30'
                    : 'bg-green-100 text-green-800 border-green-200'
                  : theme === 'dark'
                    ? 'bg-red-900/20 text-red-300 border-red-500/30'
                    : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {profit.toFixed(2)} TND ({margin}%)
              </div>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                  : 'bg-white border-stone-200 text-pl-black'
              }`}
              placeholder="e.g., HAIR-CLIP-001"
            />
          </div>

          {/* Product Variants */}
          <VariantsManager
            variants={variants}
            onChange={setVariants}
            isEditing={!productId || true}
          />

          {/* Status & Flags */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-pl-white'
                    : 'bg-white border-stone-200 text-pl-black'
                }`}
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex items-center justify-center">
              <label className={`flex items-center gap-3 cursor-pointer font-century font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 cursor-pointer"
                />
                <span>Active</span>
              </label>
            </div>

            {/* Featured */}
            <div className="flex items-center justify-center">
              <label className={`flex items-center gap-3 cursor-pointer font-century font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-5 h-5 cursor-pointer"
                />
                <span>Featured</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-6 border-t border-pl-pink/20">
            <motion.button
              type="button"
              onClick={onCancel}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-3 rounded-lg font-century font-semibold border-2 smooth-transition ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white/80 hover:border-pl-pink/50'
                  : 'bg-stone-100 border-stone-200 text-pl-black/80 hover:border-pl-pink/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 rounded-lg font-century font-semibold border-2 bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

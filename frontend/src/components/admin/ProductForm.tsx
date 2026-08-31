import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productsService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import VariantsManager, { Variant } from './VariantsManager';
import { ImageCropModal } from './ImageCropModal';
import { encodeProductDescription, parseProductMetadata } from '../../utils/productMetadata';
import {
  Package,
  DollarSign,
  X,
  Upload,
  Crop,
  Star,
  Trash2,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

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
  original_price?: number;
  cost_price: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  badge?: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Multi-image gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);

  // Image Cropper Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    category_id: null,
    price: 0,
    original_price: 0,
    cost_price: 0,
    sku: '',
    is_active: true,
    is_featured: false,
    badge: 'Auto',
    status: 'available',
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await productsService.getCategories();
        const sorted = (cats || []).sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sorted);
      } catch (err) {
        console.error('Failed to load categories:', err);
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
            const { cleanDescription, badge, original_price, images, variants: metaVariants } = parseProductMetadata(product);

            setGalleryImages(images);
            setPrimaryImageIndex(0);

            setFormData({
              name: product.name || '',
              description: cleanDescription,
              category_id: product.category_id,
              price: product.price || 0,
              original_price: original_price || 0,
              cost_price: product.cost_price || 0,
              sku: product.sku || '',
              is_active: product.is_active !== false,
              is_featured: product.is_featured || false,
              badge: (badge && badge.toLowerCase() !== 'auto') ? badge : '',
              status: product.status || 'available',
            });

            const incomingVariants = (product.variants && Array.isArray(product.variants) && product.variants.length > 0)
              ? product.variants
              : (metaVariants && Array.isArray(metaVariants) && metaVariants.length > 0)
              ? metaVariants
              : [];

            setVariants(
              incomingVariants.map((v: any) => ({
                id: v.id,
                variant_type: v.variant_type || v.type || 'Standard',
                variant_name: v.variant_name || v.variant_type || 'Standard',
                variant_value: v.variant_value || v.value || '',
                stock_quantity: v.stock_quantity ?? v.stock ?? 1,
                color_hex: v.color_hex || v.hex,
                image_url: v.image_url || v.imageUrl,
              }))
            );
          }
        } catch (err) {
          console.error('Failed to load product:', err);
          toast.error('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle multi-image file selection
  const handleMultipleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    e.target.value = ''; // Clean input immediately so selecting the same or new files always triggers cleanly

    // Convert selected files to data URLs and offer cropping for the first one or add all
    const newUrls: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const uploadedUrl = await productsService.uploadProductImage(file);
        newUrls.push(uploadedUrl);
      } catch (err) {
        console.warn('Upload error, fallback to data url:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setGalleryImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    if (newUrls.length > 0) {
      setGalleryImages((prev) => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} image(s) added to gallery!`);
    }
  };

  // Add image from direct URL input
  const handleAddImageUrl = () => {
    if (!customImageUrlInput.trim()) return;
    setGalleryImages((prev) => [...prev, customImageUrlInput.trim()]);
    setCustomImageUrlInput('');
    toast.success('Image link added to gallery!');
  };

  // Open cropper on existing or new image
  const handleOpenCropper = (index: number) => {
    setCropTargetIndex(index);
    setCropSourceUrl(galleryImages[index]);
    setCropModalOpen(true);
  };

  // When crop finishes
  const handleCropComplete = async (croppedDataUrl: string, croppedFile?: File) => {
    setCropModalOpen(false);
    let finalUrl = croppedDataUrl;

    if (croppedFile) {
      try {
        finalUrl = await productsService.uploadProductImage(croppedFile);
      } catch (err) {
        console.warn('Could not upload cropped file to storage:', err);
      }
    }

    if (cropTargetIndex !== null && cropTargetIndex < galleryImages.length) {
      const updated = [...galleryImages];
      updated[cropTargetIndex] = finalUrl;
      setGalleryImages(updated);
      toast.success('Image cropped successfully!');
    } else {
      setGalleryImages((prev) => [...prev, finalUrl]);
      toast.success('Cropped image added to gallery!');
    }

    setCropTargetIndex(null);
    setCropSourceUrl(null);
  };

  // Remove image from gallery
  const handleRemoveImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (primaryImageIndex >= updated.length) {
      setPrimaryImageIndex(Math.max(0, updated.length - 1));
    }
  };

  // Set primary cover image
  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index);
    toast.success('Cover image set!');
  };

  // Reorder images
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= galleryImages.length ||
      toIndex < 0 ||
      toIndex >= galleryImages.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const updated = [...galleryImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Keep primaryImageIndex in sync
    if (primaryImageIndex === fromIndex) {
      setPrimaryImageIndex(toIndex);
    } else if (fromIndex < primaryImageIndex && toIndex >= primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    } else if (fromIndex > primaryImageIndex && toIndex <= primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex + 1);
    }

    setGalleryImages(updated);
  };

  const moveImageLeft = (index: number) => {
    if (index > 0) {
      moveImage(index, index - 1);
    }
  };

  const moveImageRight = (index: number) => {
    if (index < galleryImages.length - 1) {
      moveImage(index, index + 1);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverImageIndex !== index) {
      setDragOverImageIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverImageIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverImageIndex(null);
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) return;
    moveImage(draggedImageIndex, dropIndex);
    setDraggedImageIndex(null);
    toast.success('Images reordered!');
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (formData.price < 0 || formData.cost_price < 0) {
      toast.error('Prices must be valid positive amounts');
      return;
    }

    try {
      setLoading(true);

      // Resolve primary image and gallery array
      const primaryUrl = galleryImages[primaryImageIndex] || galleryImages[0] || null;

      // Encode gallery, badge, original price, and variants into description comment safely
      const finalDescription = encodeProductDescription(formData.description, {
        badge: (formData.badge && formData.badge.toLowerCase() !== 'auto') ? formData.badge : undefined,
        original_price: formData.original_price,
        images: galleryImages,
        variants: variants,
      });

      const payload: any = {
        name: formData.name.trim(),
        description: finalDescription,
        price: Number(formData.price || 0),
        cost_price: Number(formData.cost_price || 0),
        sku: formData.sku?.trim() || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        status: formData.status || 'available',
        image_url: primaryUrl,
      };

      if (formData.category_id !== null && formData.category_id !== undefined) {
        payload.category_id = Number(formData.category_id);
      }

      let newProductId = productId;

      if (productId) {
        await productsService.updateProduct(productId, payload);
        toast.success('Product updated successfully');
      } else {
        const result = await productsService.createProduct(payload);
        newProductId = result?.id;
        toast.success('Product created successfully');
      }

      // Save variants
      if (newProductId) {
        try {
          await productsService.saveProductVariants(newProductId, variants);
        } catch (err) {
          console.warn('Could not save variants:', err);
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
  const margin = formData.price > 0 ? ((profit / formData.price) * 100).toFixed(1) : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden font-sans ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b shrink-0 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {productId ? 'Edit Boutique Product' : 'Add New Boutique Item'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Configure details, gallery images, sizes, color swatches, and pricing
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Name & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Satin Nightgown with Lace"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100'
                    : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  SKU (Optional)
                </label>
                <span
                  title="Leave blank to automatically auto-generate a unique code."
                  className="text-[10px] text-zinc-400 cursor-help flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3 h-3" /> Auto if empty
                </span>
              </div>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., SATIN-NG-01 (or leave blank)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100'
                    : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed description, fabric, dimensions, or instructions..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100'
                  : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
              }`}
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Store Category
              </label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100'
                    : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Card Badge Tag
              </label>
              <select
                name="badge"
                value={formData.badge || ''}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-rose-500 text-zinc-100'
                    : 'bg-stone-50 border-stone-200 focus:border-rose-500 text-zinc-900'
                }`}
              >
                <option value="">None / Automatic (Sale if discounted)</option>
                <option value="Featured">Featured</option>
                <option value="Sale">Sale / Promo</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Bestseller">Bestseller</option>
              </select>
            </div>
          </div>

          {/* Pricing & Profit Calculation */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Base Pricing & Margins (TND)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Cost Price</label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none font-semibold ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none font-semibold ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-zinc-500">
                    Original Price
                  </label>
                  <span
                    title="Setting a higher original price shows a crossed-out strikethrough price with a % discount badge."
                    className="text-[10px] text-zinc-400 cursor-help"
                  >
                    Strikethrough
                  </span>
                </div>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50.00"
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Estimated Profit
                </label>
                <div
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center text-center ${
                    profit >= 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {profit.toFixed(2)} TND ({margin}%)
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Product Images & Gallery Section */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Product Photography & Gallery
                </label>
                <p className="text-[11px] text-zinc-400">
                  Upload multiple photos, drag or use arrows to change image order, and set your main cover image
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/webp,image/png,image/jpeg,image/jpg,image/gif,image/avif,image/*"
                    onChange={handleMultipleImageFiles}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick URL Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste an image URL (https://...)"
                value={customImageUrlInput}
                onChange={(e) => setCustomImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                }`}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white transition"
              >
                Add Link
              </button>
            </div>

            {/* Image Gallery Grid */}
            <div className="pt-2">
              {galleryImages.length === 0 ? (
                <div className="p-6 border-2 border-dashed rounded-2xl text-center border-stone-200 dark:border-zinc-700 text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Package className="w-8 h-8 opacity-40 text-rose-500" />
                  <span>No images uploaded yet. Click "Upload Photos" or paste an image URL above.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span>
                      {galleryImages.length} image{galleryImages.length > 1 ? 's' : ''} (drag to reorder or use arrows)
                    </span>
                    <span className="text-[10px] text-zinc-500 italic">
                      The 1st image will be displayed first in cards & detail views
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {galleryImages.map((imgUrl, idx) => {
                      const isPrimary = idx === primaryImageIndex;
                      const isDragging = draggedImageIndex === idx;
                      const isDragOver = dragOverImageIndex === idx;

                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`group relative rounded-2xl overflow-hidden border-2 aspect-square bg-zinc-950 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                            isDragging
                              ? 'opacity-40 scale-95 border-dashed border-rose-500'
                              : isDragOver
                              ? 'border-rose-400 ring-4 ring-rose-500/40 scale-105 shadow-xl'
                              : isPrimary
                              ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                              : 'border-stone-200 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Product photo ${idx + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                          />

                          {/* Top Badges (Order Index + Primary Tag + Grip Handle) */}
                          <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow flex items-center gap-1 ${
                                isPrimary
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-black/70 text-zinc-200 backdrop-blur-sm'
                              }`}
                            >
                              <span>#{idx + 1}</span>
                              {isPrimary && <span>• Cover</span>}
                            </span>

                            <span className="p-1 rounded-md bg-black/60 text-white/80 backdrop-blur-sm opacity-60 group-hover:opacity-100 transition">
                              <GripVertical className="w-3 h-3" />
                            </span>
                          </div>

                          {/* Quick Bottom Reordering Bar (Always accessible on hover or mobile) */}
                          <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition z-10">
                            {/* Move Left Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveImageLeft(idx);
                              }}
                              disabled={idx === 0}
                              title="Move photo left (earlier in order)"
                              className={`p-1 rounded-md text-white transition ${
                                idx === 0
                                  ? 'opacity-20 cursor-not-allowed bg-black/40'
                                  : 'bg-black/70 hover:bg-rose-500 cursor-pointer shadow-sm'
                              }`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Right Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveImageRight(idx);
                              }}
                              disabled={idx === galleryImages.length - 1}
                              title="Move photo right (later in order)"
                              className={`p-1 rounded-md text-white transition ${
                                idx === galleryImages.length - 1
                                  ? 'opacity-20 cursor-not-allowed bg-black/40'
                                  : 'bg-black/70 hover:bg-rose-500 cursor-pointer shadow-sm'
                              }`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Center Hover Action Controls */}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(idx);
                                }}
                                title="Set as Cover Image"
                                className="p-2 rounded-xl bg-white/25 hover:bg-white text-white hover:text-zinc-900 transition shadow"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCropper(idx);
                              }}
                              title="Crop Image"
                              className="p-2 rounded-xl bg-white/25 hover:bg-rose-500 text-white transition shadow"
                            >
                              <Crop className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              title="Remove Photo"
                              className="p-2 rounded-xl bg-white/25 hover:bg-red-600 text-white transition shadow"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants & Size/Color Matrix */}
          <VariantsManager
            variants={variants}
            basePrice={formData.price}
            onChange={setVariants}
            isEditing={true}
          />

          {/* Visibility and Featured Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <label
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                formData.is_active
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-800/40'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <span className="text-sm font-semibold block">Active in Shop</span>
                <span className="text-[11px] text-zinc-400 block">Available for purchase</span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                formData.is_featured
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-800/40'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <span className="text-sm font-semibold block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured Item
                </span>
                <span className="text-[11px] text-zinc-400 block">Spotlighted on homepage</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                isDark
                  ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropSourceUrl}
        aspectRatio="1:1"
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setCropSourceUrl(null);
          setCropTargetIndex(null);
        }}
      />
    </motion.div>
  );
}

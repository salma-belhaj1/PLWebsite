import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import ProductForm from '../../components/admin/ProductForm';
import CategoriesModal from '../../components/admin/CategoriesModal';
import { inventoryService, productsService } from '../../services/api';
import type { InventoryWithProduct } from '../../services/supabase/inventory';
import {
  Package,
  Plus,
  FolderPlus,
  Search,
  Edit3,
  Trash2,
  Boxes,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

type StockFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function Inventory() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [items, setItems] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<InventoryWithProduct | null>(null);
  const [stockForm, setStockForm] = useState({ stock_quantity: 0 });

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setItems(data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.product.category?.name || 'Uncategorized'))].sort(),
    [items]
  );

  const stats = useMemo(() => {
    const totalProducts = items.length;
    const activeProducts = items.filter((item) => item.product.is_active).length;
    const totalStock = items.reduce((sum, item) => sum + (item.stock_quantity || 0), 0);
    const lowStockCount = items.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= 3).length;
    const outOfStockCount = items.filter((item) => (item.stock_quantity || 0) === 0).length;
    return { totalProducts, activeProducts, totalStock, lowStockCount, outOfStockCount };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const skuMatch = item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const queryMatch = !searchQuery || nameMatch || skuMatch;

      const stockMatch =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && item.stock_quantity > 0) ||
        (stockFilter === 'lowStock' && item.stock_quantity > 0 && item.stock_quantity <= 3) ||
        (stockFilter === 'outOfStock' && (item.stock_quantity || 0) === 0);

      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.product.is_active) ||
        (statusFilter === 'inactive' && !item.product.is_active);

      const categoryName = item.product.category?.name || 'Uncategorized';
      const categoryMatch = categoryFilter === 'all' || categoryFilter === categoryName;

      return queryMatch && stockMatch && statusMatch && categoryMatch;
    });
  }, [items, searchQuery, stockFilter, statusFilter, categoryFilter]);

  function openCreateProduct() {
    setEditingProductId(null);
    setShowProductModal(true);
  }

  function openEditProduct(item: InventoryWithProduct) {
    setEditingProductId(item.product.id);
    setShowProductModal(true);
  }

  function closeProductModal() {
    setEditingProductId(null);
    setShowProductModal(false);
  }

  function openStockModal(item: InventoryWithProduct) {
    setEditingStockItem(item);
    setStockForm({ stock_quantity: item.stock_quantity || 0 });
    setShowStockModal(true);
  }

  function closeStockModal() {
    setEditingStockItem(null);
    setShowStockModal(false);
    setStockForm({ stock_quantity: 0 });
  }

  async function handleToggleActive(item: InventoryWithProduct) {
    try {
      setActionLoading(item.product.id);
      const newStatus = !item.product.is_active;
      await productsService.updateProduct(item.product.id, { is_active: newStatus });
      toast.success(newStatus ? `"${item.product.name}" is now Active in store` : `"${item.product.name}" is now Hidden from store`);
      await loadInventory();
    } catch (error) {
      console.error('Toggle active failed:', error);
      toast.error('Failed to change product status');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleFeatured(item: InventoryWithProduct) {
    try {
      setActionLoading(item.product.id);
      const newFeatured = !item.product.is_featured;
      await productsService.updateProduct(item.product.id, { is_featured: newFeatured });
      toast.success(newFeatured ? `"${item.product.name}" featured on storefront` : `"${item.product.name}" unfeatured`);
      await loadInventory();
    } catch (error) {
      console.error('Toggle featured failed:', error);
      toast.error('Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStockUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStockItem) return;

    try {
      await inventoryService.updateStockQuantity(editingStockItem.product_id, stockForm.stock_quantity);
      toast.success(`Stock updated to ${stockForm.stock_quantity} units`);
      await loadInventory();
      closeStockModal();
    } catch (error) {
      console.error('Stock update failed:', error);
      toast.error('Failed to update stock');
    }
  }

  async function handleDeleteProduct(item: InventoryWithProduct) {
    if (!confirm(`Are you sure you want to delete "${item.product.name}"?\n\nThis will remove the product, variants, and stock record.`)) {
      return;
    }

    try {
      setActionLoading(item.product.id);
      await productsService.deleteProduct(item.product.id);
      toast.success(`"${item.product.name}" deleted successfully`);
      await loadInventory();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product. Make sure RLS is enabled.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('admin.inventory.title', 'Inventory')}
              </h1>
              <button
                onClick={loadInventory}
                title="Refresh catalog"
                className={`p-1.5 rounded-lg border transition ${
                  isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('admin.inventory.subtitle', 'Manage your boutique items, categories, pricing, stock levels, and store visibility.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCategoriesModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition shadow-sm ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                  : 'bg-white border-stone-200 text-zinc-800 hover:bg-stone-50'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-rose-500" />
              <span>{t('admin.inventory.categories', 'Categories')}</span>
            </button>
            
            <button
              type="button"
              onClick={openCreateProduct}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-rose-500/20 transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('admin.inventory.addProduct', 'Add Product')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 sm:p-5 rounded-2xl border transition ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Total Products</span>
              <Package className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.totalProducts}</span>
              <span className="text-xs font-medium text-emerald-500">({stats.activeProducts} Active)</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Total Units in Stock</span>
              <Boxes className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{stats.totalStock}</span>
              <span className="text-xs text-zinc-400">units</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Low Stock (≤3 units)</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.lowStockCount}</span>
              <span className="text-xs text-zinc-400">needs reorder</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border transition ${
            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
              <span>Out of Stock</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{stats.outOfStockCount}</span>
              <span className="text-xs text-zinc-400">0 units</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className={`p-4 rounded-2xl border transition ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product or SKU..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-zinc-900 placeholder-zinc-400 focus:border-rose-500'
                }`}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-zinc-900 focus:border-rose-500'
                }`}
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-zinc-900 focus:border-rose-500'
                }`}
              >
                <option value="all">All Stock Levels</option>
                <option value="inStock">In Stock (&gt; 0)</option>
                <option value="lowStock">Low Stock (1–3 units)</option>
                <option value="outOfStock">Out of Stock (0 units)</option>
              </select>
            </div>

            {/* Product Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-rose-500'
                    : 'bg-stone-50 border-stone-200 text-zinc-900 focus:border-rose-500'
                }`}
              >
                <option value="all">All Visibility</option>
                <option value="active">Active (Visible in Shop)</option>
                <option value="inactive">Hidden (Draft / Packaging)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Products Table */}
        <div className={`rounded-2xl border overflow-hidden transition ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-stone-50 border-stone-200 text-zinc-500'
                }`}>
                  <th className="px-5 py-3.5">Product & SKU</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Cost</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Profit</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5 text-center">Visibility</th>
                  <th className="px-4 py-3.5 text-center">Featured</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800/70' : 'divide-stone-100'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                        <span className="text-sm font-medium">Loading catalog items...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">No products found</p>
                        <p className="text-xs text-zinc-400">
                          {items.length === 0 ? 'Add your first product to get started!' : 'Try adjusting your search or filters.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const price = item.product.price || 0;
                    const costPrice = item.product.cost_price || 0;
                    const profit = price - costPrice;
                    const categoryName = item.product.category?.name || 'Uncategorized';
                    const stock = item.stock_quantity || 0;
                    const isLowStock = stock > 0 && stock <= 3;
                    const isOutOfStock = stock === 0;
                    const isItemLoading = actionLoading === item.product.id;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          !item.product.is_active
                            ? isDark ? 'bg-zinc-950/40 opacity-75' : 'bg-stone-50/60 opacity-80'
                            : isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-stone-50/80'
                        }`}
                      >
                        {/* Product Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200 dark:border-zinc-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate tracking-tight">{item.product.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-zinc-400">
                                  {item.sku || `SKU-${item.product.id}`}
                                </span>
                                {(item.product as any).badge && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-500 font-medium">
                                    {(item.product as any).badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                            {categoryName}
                          </span>
                        </td>

                        {/* Cost */}
                        <td className="px-4 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {costPrice.toFixed(2)} TND
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 font-semibold text-sm">
                          {price.toFixed(2)} TND
                        </td>

                        {/* Profit */}
                        <td className="px-4 py-4 text-xs font-bold">
                          <span className={profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                            {profit > 0 ? '+' : ''}{profit.toFixed(2)} TND
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => openStockModal(item)}
                            title="Click to update stock"
                            className="inline-flex items-center gap-1.5 group cursor-pointer"
                          >
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition group-hover:scale-105 ${
                              isOutOfStock
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : isLowStock
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {stock} units
                            </span>
                            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-zinc-400" />
                          </button>
                        </td>

                        {/* Visibility (Active Toggle) */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(item)}
                            disabled={isItemLoading}
                            title={item.product.is_active ? 'Click to hide from shop' : 'Click to show in shop'}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition ${
                              item.product.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                            }`}
                          >
                            {item.product.is_active ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Featured (Star Toggle) */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(item)}
                            disabled={isItemLoading}
                            title={item.product.is_featured ? 'Featured on storefront' : 'Not featured'}
                            className={`p-1.5 rounded-lg border transition ${
                              item.product.is_featured
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                                : 'text-zinc-300 dark:text-zinc-600 border-transparent hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${item.product.is_featured ? 'fill-amber-500' : ''}`} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProduct(item)}
                              title="Edit product details"
                              className={`p-2 rounded-xl border text-xs font-semibold transition ${
                                isDark
                                  ? 'border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                                  : 'border-stone-200 text-zinc-700 hover:bg-stone-100 hover:text-zinc-900'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openStockModal(item)}
                              title="Update stock count"
                              className={`p-2 rounded-xl border text-xs font-semibold transition ${
                                isDark
                                  ? 'border-zinc-800 text-blue-400 hover:bg-blue-900/30'
                                  : 'border-stone-200 text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <Boxes className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(item)}
                              disabled={isItemLoading}
                              title="Delete product"
                              className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Form Modal (Create / Edit) */}
        <AnimatePresence>
          {showProductModal && (
            <ProductForm
              productId={editingProductId ?? undefined}
              onSuccess={async () => {
                await loadInventory();
                closeProductModal();
              }}
              onCancel={closeProductModal}
            />
          )}
        </AnimatePresence>

        {/* Quick Stock Update Modal */}
        <AnimatePresence>
          {showStockModal && editingStockItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
                }`}
              >
                <div className={`flex items-center justify-between p-5 border-b ${
                  isDark ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-stone-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base tracking-tight">Adjust Stock Level</h2>
                      <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                        {editingStockItem.product.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeStockModal}
                    className="text-zinc-400 hover:text-zinc-100 text-lg p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleStockUpdate} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Available Units on Shelf
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockForm.stock_quantity}
                      onChange={(e) => setStockForm({ stock_quantity: parseInt(e.target.value, 10) || 0 })}
                      className={`w-full px-4 py-3 rounded-xl border text-xl font-bold outline-none transition ${
                        isDark
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-zinc-900 focus:border-rose-500'
                      }`}
                    />
                    
                    {/* Quick increment buttons */}
                    <div className="flex gap-2 mt-3">
                      {[0, 5, 10, 25, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setStockForm({ stock_quantity: preset })}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            stockForm.stock_quantity === preset
                              ? 'bg-rose-500 text-white border-rose-500'
                              : isDark
                              ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                              : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {stockForm.stock_quantity <= 3 && stockForm.stock_quantity > 0 && (
                      <p className="text-xs text-amber-500 font-medium mt-2.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low stock warning will be shown in store
                      </p>
                    )}
                    {stockForm.stock_quantity === 0 && (
                      <p className="text-xs text-rose-500 font-medium mt-2.5 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Item will show as "Out of Stock"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeStockModal}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition"
                    >
                      Save Quantity
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Modal */}
        <CategoriesModal
          isOpen={showCategoriesModal}
          onClose={() => setShowCategoriesModal(false)}
          onCategoryAdded={loadInventory}
        />
      </div>
    </AdminLayout>
  );
}

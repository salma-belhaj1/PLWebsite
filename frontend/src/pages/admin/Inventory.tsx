import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import ProductForm from '../../components/admin/ProductForm';
import CategoriesModal from '../../components/admin/CategoriesModal';
import { inventoryService, productsService } from '../../services/api';
import type { InventoryWithProduct } from '../../services/supabase/inventory';

type StockFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function Inventory() {
  const { theme } = useTheme();
  const [items, setItems] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
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
    const totalStock = items.reduce((sum, item) => sum + item.stock_quantity, 0);
    const lowStockCount = items.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= 3).length;
    const outOfStockCount = items.filter((item) => item.stock_quantity === 0).length;
    return { totalProducts, totalStock, lowStockCount, outOfStockCount };
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
        (stockFilter === 'outOfStock' && item.stock_quantity === 0);

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
    setStockForm({ stock_quantity: item.stock_quantity });
    setShowStockModal(true);
  }

  function closeStockModal() {
    setEditingStockItem(null);
    setShowStockModal(false);
    setStockForm({ stock_quantity: 0 });
  }

  async function handleStockUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStockItem) return;

    try {
      await inventoryService.updateStockQuantity(editingStockItem.product_id, stockForm.stock_quantity);
      toast.success('Stock updated successfully');
      await loadInventory();
      closeStockModal();
    } catch (error) {
      console.error('Stock update failed:', error);
      toast.error('Failed to update stock');
    }
  }

  async function handleDeleteProduct(item: InventoryWithProduct) {
    if (!confirm(`Delete product "${item.product.name}" and all its data?`)) return;

    try {
      setLoading(true);
      await productsService.deleteProduct(item.product.id);
      toast.success('Product deleted successfully');
      await loadInventory();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className={`text-4xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
              📦 Inventory Management
            </h1>
            <p className={`mt-2 font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              Manage all products, categories, stock levels, and pricing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCategoriesModal(true)}
              className={`px-6 py-3 rounded-lg font-century font-semibold border-2 smooth-transition ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-pl-white hover:border-blue-500/50'
                  : 'bg-stone-100 border-stone-200 text-pl-black hover:border-blue-500/50'
              }`}
            >
              📂 Categories
            </button>
            <button
              type="button"
              onClick={openCreateProduct}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition"
            >
              + New Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Total Products</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-red'}`}>{stats.totalProducts}</p>
          </div>
          <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Total Stock</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.totalStock}</p>
          </div>
          <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Low Stock (≤3)</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.lowStockCount}</p>
          </div>
          <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>Out of Stock</p>
            <p className={`text-3xl font-stayvibes mt-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{stats.outOfStockCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200'}`}>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                🔍 Search
              </label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Product name or SKU..."
                className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                📊 Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'
                }`}
              >
                <option value="all">All levels</option>
                <option value="inStock">In stock</option>
                <option value="lowStock">Low stock (≤3)</option>
                <option value="outOfStock">Out of stock</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                ✓ Product Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'
                }`}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                📂 Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'
                }`}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-2xl border-2 overflow-hidden ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-stone-100 border-stone-200'}`}>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Product</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Category</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">SKU</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Cost</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Price</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Profit</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Stock</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Status</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Featured</th>
                  <th className="px-6 py-4 font-century font-semibold text-pl-white/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400 font-century">
                      ⏳ Loading inventory...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400 font-century">
                      {items.length === 0 ? '📭 No products yet' : '🔍 No products match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const profit = item.product.price - item.product.cost_price;
                    const categoryName = item.product.category?.name || 'Uncategorized';
                    const isLowStock = item.stock_quantity > 0 && item.stock_quantity <= 3;

                    return (
                      <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-stone-200'}`}>
                        <td className={`px-6 py-4 font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                          {item.product.name}
                        </td>
                        <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                          {categoryName}
                        </td>
                        <td className={`px-6 py-4 font-century font-mono text-xs ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
                          {item.sku || '—'}
                        </td>
                        <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                          {item.product.cost_price.toFixed(2)} TND
                        </td>
                        <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                          {item.product.price.toFixed(2)} TND
                        </td>
                        <td className={`px-6 py-4 font-century font-semibold ${profit < 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {profit.toFixed(2)} TND
                        </td>
                        <td className="px-6 py-4 font-century font-semibold">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.stock_quantity === 0
                              ? 'bg-red-900/30 text-red-300'
                              : isLowStock
                              ? 'bg-yellow-900/30 text-yellow-300'
                              : 'bg-emerald-900/30 text-emerald-300'
                          }`}>
                            {item.stock_quantity}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-century ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                          {item.product.is_active ? '🟢 Active' : '⚫ Inactive'}
                        </td>
                        <td className="px-6 py-4 font-century">
                          {item.product.is_featured ? '⭐ Yes' : '—'}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(item)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold smooth-transition ${
                              theme === 'dark' ? 'bg-pl-pink/20 text-pl-pink hover:bg-pl-pink/30' : 'bg-pl-pink/10 text-pl-pink hover:bg-pl-pink/20'
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openStockModal(item)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold smooth-transition ${
                              theme === 'dark' ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold smooth-transition ${
                              theme === 'dark' ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Form Modal */}
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

        {/* Stock Update Modal */}
        <AnimatePresence>
          {showStockModal && editingStockItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className={`w-full max-w-md rounded-3xl border-2 shadow-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-stone-200'
                }`}
              >
                <div className={`flex items-center justify-between p-6 border-b ${
                  theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-stone-50'
                }`}>
                  <div>
                    <h2 className={`text-2xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                      📦 Update Stock
                    </h2>
                    <p className={`text-sm font-century mt-1 ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                      {editingStockItem.product.name}
                    </p>
                  </div>
                  <button
                    onClick={closeStockModal}
                    className={`text-2xl ${theme === 'dark' ? 'text-pl-white/60 hover:text-pl-white' : 'text-pl-black/60 hover:text-pl-black'}`}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleStockUpdate} className="p-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-century font-semibold mb-2 ${
                      theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                    }`}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockForm.stock_quantity}
                      onChange={(e) => setStockForm({ stock_quantity: parseInt(e.target.value, 10) || 0 })}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-century text-lg focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-50 border-stone-200 text-pl-black'
                      }`}
                    />
                    {stockForm.stock_quantity <= 3 && stockForm.stock_quantity > 0 && (
                      <p className="text-sm text-yellow-400 font-century mt-2">⚠️ Low stock threshold (≤3)</p>
                    )}
                    {stockForm.stock_quantity === 0 && (
                      <p className="text-sm text-red-400 font-century mt-2">🚨 Out of stock</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={closeStockModal}
                      className={`px-5 py-3 rounded-lg font-century font-semibold border-2 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-pl-white' : 'bg-stone-100 border-stone-200 text-pl-black'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 smooth-transition"
                    >
                      Update Stock
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
      </motion.div>
    </AdminLayout>
  );
}


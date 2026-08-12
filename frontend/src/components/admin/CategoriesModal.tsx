import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { productsService } from '../../services/api';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: () => void;
}

export default function CategoriesModal({ isOpen, onClose, onCategoryAdded }: CategoriesModalProps) {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await productsService.getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // For editing, we would need an updateCategory method in the service
        // For now, we'll just show a toast
        toast.error('Category editing not yet implemented');
      } else {
        // Create new category - need to implement in service
        toast.error('Category creation not yet implemented in service');
      }

      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      await loadCategories();
      onCategoryAdded?.();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: number) => {
    if (!confirm('Delete this category?')) return;

    try {
      setLoading(true);
      // Need to implement deleteCategory in service
      toast.error('Category deletion not yet implemented in service');
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className={`w-full max-w-2xl rounded-3xl border-2 shadow-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-stone-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-stone-50'}`}>
            <div>
              <h2 className={`text-2xl font-stayvibes ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                📂 Manage Categories
              </h2>
              <p className={`text-sm font-century mt-1 ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                Add, edit, or delete product categories.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-2xl ${theme === 'dark' ? 'text-pl-white/60 hover:text-pl-white' : 'text-pl-black/60 hover:text-pl-black'}`}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            {/* Add Button */}
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ name: '', description: '' });
                }}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30"
              >
                + Add New Category
              </button>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-pl-white'
                            : 'bg-white border-stone-200 text-pl-black'
                        }`}
                        placeholder="e.g., Hair Care"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-century font-semibold mb-2 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border-2 font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-pl-white'
                            : 'bg-white border-stone-200 text-pl-black'
                        }`}
                        placeholder="Category description"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                          setFormData({ name: '', description: '' });
                        }}
                        className={`px-4 py-2 rounded-lg font-century font-semibold border-2 ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-zinc-600 text-pl-white'
                            : 'bg-stone-100 border-stone-200 text-pl-black'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-pl-pink to-pl-red text-white font-century font-semibold border-2 border-pl-pink disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Category
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories List */}
            {loading && !showForm ? (
              <p className={`text-center font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className={`text-center font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                No categories yet. Add one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map(category => (
                  <motion.div
                    key={category.id}
                    layout
                    className={`p-4 rounded-xl border-2 ${
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className={`text-sm font-century mt-1 ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFormData({ name: category.name, description: category.description || '' });
                            setEditingId(category.id);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 rounded-lg text-sm font-century font-semibold bg-blue-500/20 text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="px-3 py-1 rounded-lg text-sm font-century font-semibold bg-red-500/20 text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-stone-50'}`}>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-century font-semibold border-2 ${
                theme === 'dark'
                  ? 'bg-zinc-700 border-zinc-600 text-pl-white'
                  : 'bg-stone-100 border-stone-200 text-pl-black'
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

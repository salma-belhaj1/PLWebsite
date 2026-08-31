import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { productsService } from '../../services/api';
import {
  Folder,
  Plus,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';

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
  const isDark = theme === 'dark';
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
      const sorted = (cats || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      setCategories(sorted);
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
        await productsService.updateCategory(editingId, formData);
        toast.success('Category updated successfully');
      } else {
        await productsService.createCategory(formData);
        toast.success('Category created successfully');
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?\n\nProducts in this category will become Uncategorized.`)) return;

    try {
      setLoading(true);
      await productsService.deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
      await loadCategories();
      onCategoryAdded?.();
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
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b ${
            isDark ? 'border-zinc-800 bg-zinc-900/90' : 'border-stone-200 bg-stone-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Manage Store Categories</h2>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Organize your boutique catalog into clean collections
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition ${
                isDark ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'border-stone-200 text-zinc-500 hover:text-zinc-900 hover:bg-stone-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {!showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ name: '', description: '' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-md shadow-rose-500/20 hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition ${
                          isDark ? 'bg-zinc-700/80 border-zinc-600 focus:border-rose-500 text-zinc-100' : 'bg-white border-stone-200 focus:border-rose-500 text-zinc-900'
                        }`}
                        placeholder="e.g., Hair Care, Satin Luxury"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition ${
                          isDark ? 'bg-zinc-700/80 border-zinc-600 focus:border-rose-500 text-zinc-100' : 'bg-white border-stone-200 focus:border-rose-500 text-zinc-900'
                        }`}
                        placeholder="Brief summary of items in this category"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                          setFormData({ name: '', description: '' });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                          isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-sm hover:opacity-95 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories List */}
            {loading && !showForm ? (
              <p className={`text-center py-6 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className={`text-center py-6 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                No categories found. Create your first category above!
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-sm tracking-tight">{category.name}</h3>
                      {category.description && (
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setFormData({ name: category.name, description: category.description || '' });
                          setEditingId(category.id);
                          setShowForm(true);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                          isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-zinc-800 bg-zinc-900/90' : 'border-stone-200 bg-stone-50'}`}>
            <button
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition ${
                isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
              }`}
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

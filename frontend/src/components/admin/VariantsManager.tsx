import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

interface Variant {
  id?: number;
  variant_name: string;
  variant_value: string;
  variant_type?: string;
}

interface VariantsManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  isEditing?: boolean;
}

export default function VariantsManager({ variants, onChange, isEditing = true }: VariantsManagerProps) {
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ variant_name: '', variant_value: '' });

  const handleAdd = () => {
    if (!formData.variant_name.trim() || !formData.variant_value.trim()) {
      toast.error('Please fill in both variant name and value');
      return;
    }

    const newVariant: Variant = {
      variant_name: formData.variant_name,
      variant_value: formData.variant_value,
      variant_type: formData.variant_name,
    };

    if (editingIndex !== null) {
      const updated = [...variants];
      updated[editingIndex] = { ...updated[editingIndex], ...newVariant };
      onChange(updated);
      setEditingIndex(null);
    } else {
      onChange([...variants, newVariant]);
    }

    setFormData({ variant_name: '', variant_value: '' });
    setShowForm(false);
  };

  const handleDelete = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setFormData({
      variant_name: variants[index].variant_name,
      variant_value: variants[index].variant_value,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ variant_name: '', variant_value: '' });
  };

  if (!isEditing) {
    return (
      <div>
        <label className={`block text-sm font-century font-semibold mb-3 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
          Variants (View Only)
        </label>
        <div className="space-y-2">
          {variants.length === 0 ? (
            <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
              No variants added
            </p>
          ) : (
            variants.map((variant, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-stone-50 border-stone-200'}`}>
                <p className={`font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                  {variant.variant_name}: {variant.variant_value}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className={`block text-sm font-century font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
          Product Variants
        </label>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingIndex(null);
            setFormData({ variant_name: '', variant_value: '' });
          }}
          className="px-3 py-1 rounded-lg text-sm font-century font-semibold bg-gradient-to-r from-pl-pink to-pl-red text-white"
        >
          + Add Variant
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-stone-50 border-stone-200'}`}
          >
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-century font-semibold mb-1 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                  Type (e.g., Color, Size, Type)
                </label>
                <input
                  type="text"
                  value={formData.variant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, variant_name: e.target.value }))}
                  placeholder="e.g., Color"
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-600 text-pl-white'
                      : 'bg-white border-stone-200 text-pl-black'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-century font-semibold mb-1 ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'}`}>
                  Value (e.g., Black, Medium)
                </label>
                <input
                  type="text"
                  value={formData.variant_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, variant_value: e.target.value }))}
                  placeholder="e.g., Black"
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-century focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-600 text-pl-white'
                      : 'bg-white border-stone-200 text-pl-black'
                  }`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-3 py-2 rounded-lg text-sm font-century font-semibold ${
                    theme === 'dark'
                      ? 'bg-zinc-600 text-pl-white'
                      : 'bg-stone-200 text-pl-black'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-3 py-2 rounded-lg text-sm font-century font-semibold bg-gradient-to-r from-pl-pink to-pl-red text-white"
                >
                  {editingIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {variants.length === 0 ? (
          <p className={`text-sm font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
            No variants added yet
          </p>
        ) : (
          variants.map((variant, idx) => (
            <motion.div
              key={idx}
              layout
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <p className={`font-century font-semibold ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                {variant.variant_name}: {variant.variant_value}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(idx)}
                  className="px-2 py-1 rounded text-xs font-century font-semibold bg-blue-500/20 text-blue-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="px-2 py-1 rounded text-xs font-century font-semibold bg-red-500/20 text-red-300"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

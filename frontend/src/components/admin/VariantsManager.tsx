import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { productsService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  findColorNameFromHex,
  PRINCIPAL_COLORS,
  PrincipalColorOption,
  parseProductHierarchy,
  HierarchySizeOption,
} from '../../utils/variantUtils';
import { Plus, Trash2, Layers, Palette, DollarSign, Check, Camera, X } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

export interface Variant {
  id?: number;
  variant_name?: string;
  variant_type?: string;
  variant_value: string;
  color_hex?: string;
  image_url?: string;
  stock_quantity?: number;
}

interface VariantsManagerProps {
  variants: Variant[];
  basePrice?: number;
  onChange: (variants: Variant[]) => void;
  isEditing?: boolean;
}

type UploadTarget =
  | { type: 'newSizeColor'; sizeIndex: number }
  | { type: 'existingSizeColor'; sizeIndex: number; colorIndex: number }
  | { type: 'newFlatColor' }
  | { type: 'existingFlatColor'; colorIndex: number }
  | null;

export default function VariantsManager({
  variants,
  basePrice = 0,
  onChange,
  isEditing = true,
}: VariantsManagerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mode: 'matrix' (Size -> Price -> Colors) or 'flat_color' (Simple Color Swatches)
  const [mode, setMode] = useState<'matrix' | 'flat_color'>('matrix');

  // Hierarchy state
  const [sizeGroups, setSizeGroups] = useState<HierarchySizeOption[]>([]);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState(basePrice || 0);

  // Flat color state (Pink preset #ff007b by default)
  const [flatColors, setFlatColors] = useState<Array<{ name: string; hex: string; image_url?: string }>>([]);
  const [flatSelectedHex, setFlatSelectedHex] = useState('#ff007b');
  const [flatSelectedName, setFlatSelectedName] = useState('Pink');
  const [flatColorImage, setFlatColorImage] = useState('');

  // Active color add to specific size
  const [activeSizeIndexForColor, setActiveSizeIndexForColor] = useState<number | null>(null);
  const [sizeSelectedHex, setSizeSelectedHex] = useState('#ff007b');
  const [sizeSelectedName, setSizeSelectedName] = useState('Pink');
  const [sizeColorImage, setSizeColorImage] = useState('');

  // Image upload and crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget>(null);

  // Initial load from variants
  useEffect(() => {
    if (variants && variants.length > 0) {
      const parsed = parseProductHierarchy(variants, basePrice);
      if (parsed.hasHierarchy) {
        setMode('matrix');
        setSizeGroups(parsed.sizes);
      } else if (parsed.standaloneColors.length > 0) {
        setMode('flat_color');
        setFlatColors(
          parsed.standaloneColors.map((c) => ({
            name: c.name,
            hex: c.hex,
            image_url: c.imageUrl || undefined,
          }))
        );
      }
    }
  }, [variants, basePrice]);

  // Sync back to parent whenever sizeGroups or flatColors change
  const syncVariants = (
    updatedSizes: HierarchySizeOption[],
    updatedColors: Array<{ name: string; hex: string; image_url?: string }>,
    currentMode: 'matrix' | 'flat_color'
  ) => {
    if (currentMode === 'matrix') {
      const output: Variant[] = [];
      updatedSizes.forEach((sg) => {
        if (sg.colors.length === 0) {
          // Size with no specific colors
          output.push({
            variant_type: 'SizeMatrix',
            variant_name: 'Size',
            variant_value: `Size:${sg.size}|Price:${sg.price}`,
            stock_quantity: 1,
          });
        } else {
          sg.colors.forEach((col) => {
            output.push({
              variant_type: 'SizeMatrix',
              variant_name: 'Size',
              variant_value: `Size:${sg.size}|Price:${sg.price}|Color:${col.name}|${col.hex}|${col.imageUrl || ''}`,
              color_hex: col.hex,
              image_url: col.imageUrl,
              stock_quantity: col.stock ?? 1,
            });
          });
        }
      });
      onChange(output);
    } else {
      const output: Variant[] = updatedColors.map((c) => ({
        variant_type: 'Color',
        variant_name: 'Color',
        variant_value: `${c.name}|${c.hex}|${c.image_url || ''}`,
        color_hex: c.hex,
        image_url: c.image_url,
        stock_quantity: 1,
      }));
      onChange(output);
    }
  };

  // Add a new Size group
  const handleAddSize = () => {
    if (!newSizeName.trim()) {
      toast.error('Please enter a size name (e.g. S, M, L or 38, 40)');
      return;
    }
    const priceVal = Number(newSizePrice) >= 0 ? Number(newSizePrice) : basePrice;
    const updated = [
      ...sizeGroups,
      {
        size: newSizeName.trim(),
        price: priceVal,
        colors: [],
      },
    ];
    setSizeGroups(updated);
    setNewSizeName('');
    setNewSizePrice(basePrice);
    syncVariants(updated, flatColors, 'matrix');
    toast.success(`Size "${newSizeName}" added!`);
  };

  // Quick preset sizes
  const handleAddSizePreset = (presetSizes: Array<{ size: string; priceDiff?: number }>) => {
    const updated = [...sizeGroups];
    presetSizes.forEach((ps) => {
      if (!updated.some((s) => s.size.toLowerCase() === ps.size.toLowerCase())) {
        updated.push({
          size: ps.size,
          price: basePrice + (ps.priceDiff || 0),
          colors: [],
        });
      }
    });
    setSizeGroups(updated);
    syncVariants(updated, flatColors, 'matrix');
  };

  // Delete size group
  const handleDeleteSize = (index: number) => {
    const updated = sizeGroups.filter((_, i) => i !== index);
    setSizeGroups(updated);
    if (activeSizeIndexForColor === index) {
      setActiveSizeIndexForColor(null);
      setSizeColorImage('');
    }
    syncVariants(updated, flatColors, 'matrix');
  };

  // Update size price
  const handleUpdateSizePrice = (index: number, newPrice: number) => {
    const updated = [...sizeGroups];
    updated[index].price = newPrice;
    setSizeGroups(updated);
    syncVariants(updated, flatColors, 'matrix');
  };

  // Handle choosing a principal color for a size
  const handleSelectSizeColorPreset = (preset: PrincipalColorOption) => {
    setSizeSelectedHex(preset.hex);
    setSizeSelectedName(preset.name);
  };

  // Direct 1-click add color preset to size (clean: does NOT inherit previous uploaded image)
  const handleQuickAddColorToSize = (sizeIndex: number, preset: PrincipalColorOption) => {
    const updated = [...sizeGroups];
    const targetSize = updated[sizeIndex];
    if (targetSize.colors.some((c) => c.hex.toLowerCase() === preset.hex.toLowerCase())) {
      toast.error(`${preset.name} is already added to size ${targetSize.size}`);
      return;
    }
    targetSize.colors.push({
      name: preset.name,
      hex: preset.hex,
      stock: 1,
    });
    setSizeGroups(updated);
    syncVariants(updated, flatColors, 'matrix');
    toast.success(`Added ${preset.name} to ${targetSize.size}`);
  };

  // Add currently selected color under specific size
  const handleAddColorToSize = (sizeIndex: number) => {
    const hex = sizeSelectedHex.trim() || '#ff007b';
    const name = sizeSelectedName.trim() || findColorNameFromHex(hex);

    const updated = [...sizeGroups];
    const targetSize = updated[sizeIndex];
    if (targetSize.colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
      toast.error('This color already exists for this size');
      return;
    }
    targetSize.colors.push({
      name,
      hex,
      imageUrl: sizeColorImage || undefined,
      stock: 1,
    });
    setSizeGroups(updated);
    setSizeColorImage(''); // Clean reset staged image
    setActiveSizeIndexForColor(null);
    syncVariants(updated, flatColors, 'matrix');
    toast.success(`Added ${name} to size ${targetSize.size}`);
  };

  // Delete color from size
  const handleDeleteColorFromSize = (sizeIndex: number, colorIndex: number) => {
    const updated = [...sizeGroups];
    updated[sizeIndex].colors = updated[sizeIndex].colors.filter((_, i) => i !== colorIndex);
    setSizeGroups(updated);
    syncVariants(updated, flatColors, 'matrix');
  };

  // Remove photo from specific existing color in a size
  const handleRemoveImageFromSizeColor = (sizeIndex: number, colorIndex: number) => {
    const updated = [...sizeGroups];
    if (updated[sizeIndex]?.colors[colorIndex]) {
      updated[sizeIndex].colors[colorIndex].imageUrl = undefined;
      setSizeGroups(updated);
      syncVariants(updated, flatColors, 'matrix');
      toast.success('Color photo removed');
    }
  };

  // Direct 1-click quick add flat color
  const handleQuickAddFlatColor = (preset: PrincipalColorOption) => {
    if (flatColors.some((c) => c.hex.toLowerCase() === preset.hex.toLowerCase())) {
      toast.error(`${preset.name} is already in color swatches`);
      return;
    }
    const updated = [
      ...flatColors,
      {
        name: preset.name,
        hex: preset.hex,
      },
    ];
    setFlatColors(updated);
    syncVariants(sizeGroups, updated, 'flat_color');
    toast.success(`Added ${preset.name} swatch`);
  };

  // Add flat color swatch from selected
  const handleAddFlatColor = () => {
    const hex = flatSelectedHex.trim() || '#ff007b';
    const name = flatSelectedName.trim() || findColorNameFromHex(hex);

    if (flatColors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
      toast.error('This color is already in your swatches');
      return;
    }

    const updated = [
      ...flatColors,
      {
        name,
        hex,
        image_url: flatColorImage || undefined,
      },
    ];
    setFlatColors(updated);
    setFlatColorImage(''); // Clean reset staged image
    syncVariants(sizeGroups, updated, 'flat_color');
    toast.success(`Added ${name} swatch`);
  };

  // Delete flat color
  const handleDeleteFlatColor = (index: number) => {
    const updated = flatColors.filter((_, i) => i !== index);
    setFlatColors(updated);
    syncVariants(sizeGroups, updated, 'flat_color');
  };

  // Remove photo from specific existing flat color
  const handleRemoveImageFromFlatColor = (colorIndex: number) => {
    const updated = [...flatColors];
    if (updated[colorIndex]) {
      updated[colorIndex].image_url = undefined;
      setFlatColors(updated);
      syncVariants(sizeGroups, updated, 'flat_color');
      toast.success('Color photo removed');
    }
  };

  // Handle image crop & upload initiation
  const handleStartUpload = (target: UploadTarget, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadTarget(target);
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Clean input element so subsequent uploads always trigger
  };

  // When crop finishes
  const handleCropComplete = async (croppedDataUrl: string, croppedFile?: File) => {
    setCropModalOpen(false);
    const currentTarget = uploadTarget;
    setUploadTarget(null);
    setPendingImageSrc(null);

    try {
      let finalUrl = croppedDataUrl;
      if (croppedFile) {
        try {
          finalUrl = await productsService.uploadProductImage(croppedFile);
        } catch (uploadErr) {
          console.warn('Storage upload fallback to Data URL:', uploadErr);
          finalUrl = croppedDataUrl;
        }
      }

      if (!currentTarget) return;

      if (currentTarget.type === 'newSizeColor') {
        setSizeColorImage(finalUrl);
        toast.success('Photo attached to new color!');
      } else if (currentTarget.type === 'existingSizeColor') {
        const updated = [...sizeGroups];
        if (updated[currentTarget.sizeIndex]?.colors[currentTarget.colorIndex]) {
          updated[currentTarget.sizeIndex].colors[currentTarget.colorIndex].imageUrl = finalUrl;
          setSizeGroups(updated);
          syncVariants(updated, flatColors, 'matrix');
          toast.success('Color photo updated!');
        }
      } else if (currentTarget.type === 'newFlatColor') {
        setFlatColorImage(finalUrl);
        toast.success('Photo attached to swatch!');
      } else if (currentTarget.type === 'existingFlatColor') {
        const updated = [...flatColors];
        if (updated[currentTarget.colorIndex]) {
          updated[currentTarget.colorIndex].image_url = finalUrl;
          setFlatColors(updated);
          syncVariants(sizeGroups, updated, 'flat_color');
          toast.success('Swatch photo updated!');
        }
      }
    } catch (err) {
      console.error('Failed to process cropped image:', err);
      toast.error('Image crop applied locally');
    }
  };

  if (!isEditing) return null;

  return (
    <div className="space-y-4 font-sans">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Product Options & Variants
          </label>
          <p className="text-[11px] text-zinc-400">
            Configure sizes with custom prices & colors, or simple color swatches
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setMode('matrix');
              syncVariants(sizeGroups, flatColors, 'matrix');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === 'matrix'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sizes & Colors</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('flat_color');
              syncVariants(sizeGroups, flatColors, 'flat_color');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === 'flat_color'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors Only</span>
          </button>
        </div>
      </div>

      {/* MATRIX MODE (Sizes with specific prices & child colors) */}
      {mode === 'matrix' && (
        <div className="space-y-4">
          {/* Add Size & Preset Bar */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800/50 border-zinc-700/80' : 'bg-stone-50 border-stone-200'}`}>
            <span className="block text-xs font-bold mb-2 text-zinc-700 dark:text-zinc-300">
              Add Size & Specific Price
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Size (e.g. Small, Medium, XL)"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                className={`flex-1 min-w-[140px] px-3 py-2 rounded-xl border text-xs outline-none ${
                  isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                }`}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">Price (DT):</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newSizePrice}
                  onChange={(e) => setNewSizePrice(parseFloat(e.target.value) || 0)}
                  className={`w-24 px-3 py-2 rounded-xl border text-xs outline-none font-mono ${
                    isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddSize}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:opacity-95 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex items-center gap-2 flex-wrap pt-2 border-t border-stone-200/60 dark:border-zinc-700/60">
              <span className="text-[11px] text-zinc-400">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleAddSizePreset([{ size: 'Small' }, { size: 'Medium' }, { size: 'Large' }])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white transition"
              >
                + S, M, L
              </button>
              <button
                type="button"
                onClick={() => handleAddSizePreset([{ size: 'XS' }, { size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white transition"
              >
                + XS to XL
              </button>
              <button
                type="button"
                onClick={() => handleAddSizePreset([{ size: '36' }, { size: '38' }, { size: '40' }, { size: '42' }])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white transition"
              >
                + Shoes/Pants (36-42)
              </button>
            </div>
          </div>

          {/* Size Groups List */}
          <div className="space-y-3">
            {sizeGroups.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2 text-center">
                No sizes added yet. Use the box above to add sizes (e.g. Small, Medium) and their individual prices.
              </p>
            ) : (
              sizeGroups.map((sizeGroup, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-4 rounded-2xl border transition ${
                    isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  {/* Size Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Size: {sizeGroup.size}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-zinc-400 font-medium">Price:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={sizeGroup.price}
                          onChange={(e) => handleUpdateSizePrice(sIdx, parseFloat(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 rounded-lg border text-xs font-mono font-bold ${
                            isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-stone-50 border-stone-200 text-zinc-900'
                          }`}
                        />
                        <span className="text-zinc-400 font-semibold">DT</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSize(sIdx)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Delete size"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Colors for this size */}
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Colors for Size {sizeGroup.size}:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSizeIndexForColor === sIdx) {
                            setActiveSizeIndexForColor(null);
                            setSizeColorImage('');
                          } else {
                            setActiveSizeIndexForColor(sIdx);
                            setSizeSelectedHex('#ff007b');
                            setSizeSelectedName('Pink');
                            setSizeColorImage(''); // Clean state for new color
                          }
                        }}
                        className="text-[11px] font-semibold text-rose-500 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{activeSizeIndexForColor === sIdx ? 'Close Color Picker' : `Add Color to ${sizeGroup.size}`}</span>
                      </button>
                    </div>

                    {/* Quick 1-Click Color Badges for Fast Addition */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-400 font-medium mr-1">Quick Add:</span>
                      {[
                        { name: 'Pink', hex: '#ff007b' },
                        { name: 'Black', hex: '#18181b' },
                        { name: 'White', hex: '#ffffff' },
                        { name: 'Nude', hex: '#e5d0ba' },
                        { name: 'Red', hex: '#ef4444' },
                        { name: 'Blue', hex: '#3b82f6' },
                        { name: 'Green', hex: '#10b981' },
                        { name: 'Gold', hex: '#eab308' },
                      ].map((preset) => {
                        const isAlreadyAdded = sizeGroup.colors.some(
                          (c) => c.hex.toLowerCase() === preset.hex.toLowerCase()
                        );
                        return (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => handleQuickAddColorToSize(sIdx, preset)}
                            disabled={isAlreadyAdded}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition ${
                              isAlreadyAdded
                                ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-zinc-800 border-transparent text-zinc-400'
                                : 'bg-stone-50 dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-stone-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: preset.hex }}
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                            />
                            <span>+{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Color Form for this size with Droplist & Custom Hex */}
                    {activeSizeIndexForColor === sIdx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-3.5 rounded-xl border my-2 space-y-3 ${
                          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            Choose Principal Color or Enter Code
                          </span>
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-stone-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {sizeSelectedHex}
                          </span>
                        </div>

                        {/* Principal Colors Swatches List */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRINCIPAL_COLORS.map((pc) => {
                            const isSelected = sizeSelectedHex.toLowerCase() === pc.hex.toLowerCase();
                            return (
                              <button
                                key={pc.name + pc.hex}
                                type="button"
                                onClick={() => handleSelectSizeColorPreset(pc)}
                                title={`${pc.name} (${pc.hex})`}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform ${
                                  isSelected
                                    ? 'ring-2 ring-rose-500 scale-110 shadow-sm border-white'
                                    : 'border-black/20 hover:scale-105 opacity-85 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: pc.hex }}
                              >
                                {isSelected && (
                                  <Check className={`w-3 h-3 ${pc.hex === '#ffffff' || pc.hex === '#fbcfe8' || pc.hex === '#f5f5dc' ? 'text-zinc-900' : 'text-white'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Droplist + Custom Hex Input + Photo + Add */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                          {/* Droplist */}
                          <div className="sm:col-span-5">
                            <select
                              value={sizeSelectedHex.toLowerCase()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSizeSelectedHex(val);
                                setSizeSelectedName(findColorNameFromHex(val));
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none cursor-pointer ${
                                isDark ? 'bg-zinc-800 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                              }`}
                            >
                              <optgroup label="Principal Colors (Pink #ff007b preset)">
                                {PRINCIPAL_COLORS.map((pc) => (
                                  <option key={pc.name + pc.hex} value={pc.hex.toLowerCase()}>
                                    {pc.name} ({pc.hex})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {/* Custom Hex input + Color picker */}
                          <div className="sm:col-span-4 flex items-center gap-1.5">
                            <input
                              type="color"
                              value={sizeSelectedHex.startsWith('#') && (sizeSelectedHex.length === 4 || sizeSelectedHex.length === 7) ? sizeSelectedHex : '#ff007b'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSizeSelectedHex(val);
                                setSizeSelectedName(findColorNameFromHex(val));
                              }}
                              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                              title="Pick custom color"
                            />
                            <input
                              type="text"
                              placeholder="#ff007b"
                              value={sizeSelectedHex}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSizeSelectedHex(val);
                                setSizeSelectedName(findColorNameFromHex(val));
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono outline-none ${
                                isDark ? 'bg-zinc-800 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                              }`}
                            />
                          </div>

                          {/* Photo upload + Add button */}
                          <div className="sm:col-span-3 flex items-center gap-1.5">
                            {sizeColorImage ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <img
                                  src={sizeColorImage}
                                  alt="Preview"
                                  className="w-7 h-7 rounded-lg object-cover border border-rose-500/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSizeColorImage('')}
                                  className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 text-[10px]"
                                  title="Clear photo"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex-1 px-2 py-1.5 rounded-lg border border-dashed border-rose-500/40 hover:border-rose-500 text-rose-500 text-[11px] font-semibold cursor-pointer text-center flex items-center justify-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleStartUpload({ type: 'newSizeColor', sizeIndex: sIdx }, e)}
                                  className="hidden"
                                />
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAddColorToSize(sIdx)}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold hover:opacity-95 shadow-sm whitespace-nowrap"
                            >
                              Add Color
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Color Pills for this size */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {sizeGroup.colors.length === 0 ? (
                        <span className="text-[11px] text-zinc-400 italic">
                          No colors added yet for {sizeGroup.size}. Click a Quick Add button above or choose a color.
                        </span>
                      ) : (
                        sizeGroup.colors.map((col, cIdx) => (
                          <div
                            key={cIdx}
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium transition ${
                              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-stone-100 border-stone-200 text-zinc-800'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: col.hex }}
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm flex-shrink-0"
                            />
                            <span>{col.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">({col.hex})</span>

                            {/* Color-specific Image Badge */}
                            {col.imageUrl ? (
                              <div className="relative group/colimg flex items-center gap-1">
                                <img
                                  src={col.imageUrl}
                                  alt={col.name}
                                  className="w-5 h-5 rounded-full object-cover border border-rose-500/40"
                                />
                                <label
                                  title="Replace photo for this color"
                                  className="cursor-pointer text-zinc-400 hover:text-rose-500 transition"
                                >
                                  <Camera className="w-3 h-3" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleStartUpload(
                                        { type: 'existingSizeColor', sizeIndex: sIdx, colorIndex: cIdx },
                                        e
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromSizeColor(sIdx, cIdx)}
                                  className="text-zinc-400 hover:text-rose-500 transition"
                                  title="Remove photo from this color"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label
                                title={`Attach photo specifically for ${col.name}`}
                                className="cursor-pointer text-[10px] text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 transition"
                              >
                                <Camera className="w-2.5 h-2.5" />
                                <span>+Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleStartUpload(
                                      { type: 'existingSizeColor', sizeIndex: sIdx, colorIndex: cIdx },
                                      e
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteColorFromSize(sIdx, cIdx)}
                              className="text-zinc-400 hover:text-rose-500 transition ml-0.5"
                              title="Delete color from size"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FLAT COLOR MODE (Simple swatches) */}
      {mode === 'flat_color' && (
        <div className="space-y-3">
          {/* Quick 1-Click Addition */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Quick Add Swatch:</span>
            {[
              { name: 'Pink', hex: '#ff007b' },
              { name: 'Black', hex: '#18181b' },
              { name: 'White', hex: '#ffffff' },
              { name: 'Nude', hex: '#e5d0ba' },
              { name: 'Red', hex: '#ef4444' },
              { name: 'Blue', hex: '#3b82f6' },
              { name: 'Green', hex: '#10b981' },
              { name: 'Gold', hex: '#eab308' },
            ].map((preset) => {
              const isAlreadyAdded = flatColors.some(
                (c) => c.hex.toLowerCase() === preset.hex.toLowerCase()
              );
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleQuickAddFlatColor(preset)}
                  disabled={isAlreadyAdded}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    isAlreadyAdded
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-zinc-800 border-transparent text-zinc-400'
                      : 'bg-stone-50 dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-stone-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span
                    style={{ backgroundColor: preset.hex }}
                    className="w-3 h-3 rounded-full border border-black/20"
                  />
                  <span>+{preset.name}</span>
                </button>
              );
            })}
          </div>

          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Choose from Principal Droplist or Enter Code
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-stone-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {flatSelectedHex}
              </span>
            </div>

            {/* Principal Colors Swatches List */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRINCIPAL_COLORS.map((pc) => {
                const isSelected = flatSelectedHex.toLowerCase() === pc.hex.toLowerCase();
                return (
                  <button
                    key={pc.name + pc.hex}
                    type="button"
                    onClick={() => {
                      setFlatSelectedHex(pc.hex);
                      setFlatSelectedName(pc.name);
                    }}
                    title={`${pc.name} (${pc.hex})`}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'ring-2 ring-rose-500 scale-110 shadow-sm border-white'
                        : 'border-black/20 hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: pc.hex }}
                  >
                    {isSelected && (
                      <Check className={`w-3 h-3 ${pc.hex === '#ffffff' || pc.hex === '#fbcfe8' || pc.hex === '#f5f5dc' ? 'text-zinc-900' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Droplist + Custom Hex Input + Photo + Add Swatch */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
              <div className="sm:col-span-5">
                <select
                  value={flatSelectedHex.toLowerCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFlatSelectedHex(val);
                    setFlatSelectedName(findColorNameFromHex(val));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none cursor-pointer ${
                    isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                >
                  <optgroup label="Principal Colors (Pink #ff007b preset)">
                    {PRINCIPAL_COLORS.map((pc) => (
                      <option key={pc.name + pc.hex} value={pc.hex.toLowerCase()}>
                        {pc.name} ({pc.hex})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="sm:col-span-4 flex items-center gap-1.5">
                <input
                  type="color"
                  value={flatSelectedHex.startsWith('#') && (flatSelectedHex.length === 4 || flatSelectedHex.length === 7) ? flatSelectedHex : '#ff007b'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFlatSelectedHex(val);
                    setFlatSelectedName(findColorNameFromHex(val));
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="#ff007b"
                  value={flatSelectedHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFlatSelectedHex(val);
                    setFlatSelectedName(findColorNameFromHex(val));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
                  }`}
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-1.5">
                {flatColorImage ? (
                  <div className="flex items-center gap-1 flex-1">
                    <img
                      src={flatColorImage}
                      alt="Swatch preview"
                      className="w-7 h-7 rounded-lg object-cover border border-rose-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setFlatColorImage('')}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-500 text-[10px]"
                      title="Clear photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex-1 px-2 py-2 rounded-xl border border-dashed border-rose-500/40 hover:border-rose-500 text-rose-500 text-xs font-semibold cursor-pointer text-center flex items-center justify-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleStartUpload({ type: 'newFlatColor' }, e)}
                      className="hidden"
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={handleAddFlatColor}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-95 shadow-sm whitespace-nowrap"
                >
                  Add Swatch
                </button>
              </div>
            </div>
          </div>

          {/* Render Active Flat Swatches */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {flatColors.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No color swatches added yet.</p>
            ) : (
              flatColors.map((col, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-stone-100 border-stone-200 text-zinc-800'
                  }`}
                >
                  <span
                    style={{ backgroundColor: col.hex }}
                    className="w-4 h-4 rounded-full border border-black/20 shadow-sm flex-shrink-0"
                  />
                  <span>{col.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">({col.hex})</span>

                  {col.image_url ? (
                    <div className="flex items-center gap-1">
                      <img
                        src={col.image_url}
                        alt={col.name}
                        className="w-5 h-5 rounded-full object-cover border border-rose-500/40"
                      />
                      <label
                        title="Replace photo for this swatch"
                        className="cursor-pointer text-zinc-400 hover:text-rose-500 transition"
                      >
                        <Camera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleStartUpload({ type: 'existingFlatColor', colorIndex: idx }, e)
                          }
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageFromFlatColor(idx)}
                        className="text-zinc-400 hover:text-rose-500 transition"
                        title="Remove photo from swatch"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      title={`Attach photo specifically for ${col.name}`}
                      className="cursor-pointer text-[10px] text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 transition"
                    >
                      <Camera className="w-2.5 h-2.5" />
                      <span>+Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleStartUpload({ type: 'existingFlatColor', colorIndex: idx }, e)
                        }
                        className="hidden"
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteFlatColor(idx)}
                    className="text-zinc-400 hover:text-rose-500 transition ml-1"
                    title="Delete swatch"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={pendingImageSrc}
        aspectRatio="1:1"
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setPendingImageSrc(null);
          setUploadTarget(null);
        }}
      />
    </div>
  );
}

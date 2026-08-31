import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/formatters';
import { parseProductHierarchy } from '../utils/variantUtils';
import { parseProductMetadata } from '../utils/productMetadata';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [overrideImage, setOverrideImage] = useState<string | null>(null);

  // Variant selection state
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  // Extract metadata safely
  const { cleanDescription, badge, original_price: metaOriginalPrice, images: galleryImages } =
    parseProductMetadata(product);

  // Parse variants hierarchy
  const hierarchy = parseProductHierarchy(product, product?.price || 0);
  const hasSizes = hierarchy.hasHierarchy && hierarchy.sizes.length > 0;
  const currentSizeGroup = hasSizes ? hierarchy.sizes[selectedSizeIndex] : null;
  const availableColors =
    currentSizeGroup && currentSizeGroup.colors.length > 0
      ? currentSizeGroup.colors
      : hierarchy.standaloneColors;

  // Active color
  const activeColor = availableColors[selectedColorIndex] || null;

  // Active calculated price
  const activePrice = currentSizeGroup ? currentSizeGroup.price : Number(product?.price || 0);

  // Build aggregate images array for full cycling
  const allImages: string[] = [];
  if (activeColor?.imageUrl && !allImages.includes(activeColor.imageUrl)) {
    allImages.push(activeColor.imageUrl);
  }
  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }
  if (product?.image_url && !allImages.includes(product.image_url)) {
    allImages.push(product.image_url);
  }

  // Reset modal state when product changes
  useEffect(() => {
    setQuantity(1);
    setAdded(false);
    setSelectedSizeIndex(0);
    setSelectedColorIndex(0);
    setActiveImageIndex(0);
    setOverrideImage(null);
  }, [product]);

  // When size changes, reset color index and update override image if color exists
  useEffect(() => {
    setSelectedColorIndex(0);
  }, [selectedSizeIndex]);

  // Update override image when color changes
  useEffect(() => {
    if (activeColor?.imageUrl) {
      setOverrideImage(activeColor.imageUrl);
    } else {
      setOverrideImage(null);
    }
  }, [selectedColorIndex, selectedSizeIndex]);

  if (!product) return null;

  // Resolved display image
  const displayImage =
    overrideImage ||
    (allImages.length > 0 ? allImages[activeImageIndex % allImages.length] : null);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setOverrideImage(null);
    setActiveImageIndex((prev) => (prev <= 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setOverrideImage(null);
    setActiveImageIndex((prev) => (prev >= allImages.length - 1 ? 0 : prev + 1));
  };

  // Discounts
  const prodAny = product as any;
  const originalPrice = metaOriginalPrice || prodAny.original_price || prodAny.compare_at_price;
  const hasDiscount = originalPrice && Number(originalPrice) > Number(activePrice);
  const discountPercent = hasDiscount
    ? Math.round(((Number(originalPrice) - Number(activePrice)) / Number(originalPrice)) * 100)
    : 0;

  const rawBadge = (badge && badge.toLowerCase() !== 'auto' && badge.trim() !== '') ? badge.trim() : null;
  const customBadge =
    rawBadge || (hasDiscount ? 'Sale' : prodAny.is_featured ? 'Featured' : null);

  const getBadgeLabel = (badge: string) => {
    if (!badge || badge.toLowerCase() === 'auto') return '';
    const b = badge.toLowerCase();
    if (b.includes('sale')) return t('product.badges.sale');
    if (b.includes('new')) return t('product.badges.new');
    if (b.includes('best')) return t('product.badges.best');
    if (b.includes('feat')) return t('product.badges.featured');
    return badge;
  };

  // Build variant string for cart
  const getSelectedVariantLabel = () => {
    const parts: string[] = [];
    if (currentSizeGroup) {
      parts.push(`Size: ${currentSizeGroup.size}`);
    }
    if (activeColor) {
      parts.push(`Color: ${activeColor.name}`);
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  };

  const handleAddToCart = () => {
    addToCart(product, getSelectedVariantLabel(), quantity, activePrice, displayImage || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl z-10 max-h-[92vh] flex flex-col md:flex-row ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-700/80 text-pl-white' : 'bg-white border-stone-100 text-pl-black'
          }`}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md smooth-transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-800/80 hover:bg-zinc-700 text-pl-white/80 hover:text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-pl-black/80 hover:text-black'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left side: Image Gallery & Thumbnails with < and > Arrows */}
          <div
            className={`w-full md:w-1/2 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r ${
              theme === 'dark' ? 'bg-zinc-800/40 border-zinc-800' : 'bg-stone-50/70 border-stone-100'
            }`}
          >
            {/* Badge Tag */}
            {customBadge && (
              <span
                className={`absolute top-4 left-4 z-10 text-xs font-century font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-md text-white ${
                  customBadge.toLowerCase().includes('sale')
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : customBadge.toLowerCase().includes('new')
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : customBadge.toLowerCase().includes('best')
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                    : 'bg-gradient-to-r from-pl-pink to-pl-red'
                }`}
              >
                {getBadgeLabel(customBadge)} {hasDiscount ? `(-${discountPercent}%)` : ''}
              </span>
            )}

            {/* Main Active Image Container */}
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden relative flex items-center justify-center bg-stone-100 dark:bg-zinc-800 shadow-inner group/imgmodal">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center smooth-transition duration-300"
                />
              ) : (
                <div className="text-7xl text-pl-pink/40">🌸</div>
              )}

              {/* Prev image arrow (<) */}
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  title="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition shadow-lg hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next image arrow (>) */}
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  title="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition shadow-lg hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Multi-image Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                {allImages.map((imgUrl, idx) => {
                  const isSelected = activeImageIndex === idx && !overrideImage;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setOverrideImage(null);
                      }}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        isSelected
                          ? 'border-rose-500 ring-2 ring-rose-500/30 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side: Product Details, Size Selector, Color Swatches & Actions */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[92vh]">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h2 className="font-stayvibes text-3xl md:text-4xl text-pl-pink leading-tight">
                  {product.name}
                </h2>
                {product.category && (
                  <span className="text-xs font-century uppercase tracking-wider text-zinc-400">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </span>
                )}
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3">
                <span className="font-century text-3xl font-bold text-pl-pink">
                  {formatPrice(activePrice)}
                </span>
                {hasDiscount && (
                  <span
                    className={`text-base line-through font-century ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-stone-400'
                    }`}
                  >
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-century font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                    {t('product.save')} {discountPercent}%
                  </span>
                )}
              </div>

              {/* Size Selector with Price Indicator (Hierarchical) */}
              {hasSizes && (
                <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-century font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Select Size
                    </label>
                    {currentSizeGroup && (
                      <span className="text-xs font-century font-semibold text-rose-500">
                        {currentSizeGroup.size} ({formatPrice(currentSizeGroup.price)})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {hierarchy.sizes.map((sg, idx) => {
                      const isSelected = selectedSizeIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedSizeIndex(idx);
                            setActiveImageIndex(0);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-century font-semibold transition flex items-center gap-1.5 border-2 ${
                            isSelected
                              ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-sm'
                              : theme === 'dark'
                              ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                              : 'border-stone-200 bg-stone-50 text-zinc-700 hover:border-stone-300'
                          }`}
                        >
                          <span>{sg.size}</span>
                          <span className="text-[11px] opacity-75 font-mono">
                            · {formatPrice(sg.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Color Swatches (Filtered by selected Size) */}
              {availableColors.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-century font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {hasSizes ? `Colors for Size "${currentSizeGroup?.size}"` : 'Available Colors'}
                    </label>
                    {activeColor && (
                      <span className="text-xs font-century font-semibold text-pl-pink flex items-center gap-1">
                        <span
                          style={{ backgroundColor: activeColor.hex }}
                          className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                        />
                        {activeColor.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {availableColors.map((color, idx) => {
                      const isSelected = selectedColorIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          title={color.name}
                          onClick={() => {
                            setSelectedColorIndex(idx);
                            setActiveImageIndex(0);
                          }}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition ${
                            isSelected
                              ? 'border-rose-500 bg-rose-500/10 scale-105 shadow-sm'
                              : theme === 'dark'
                              ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/60'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: color.hex }}
                            className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                          />
                          <span className="text-xs font-century font-medium">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800">
                <p
                  className={`font-century text-xs sm:text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'
                  }`}
                >
                  {cleanDescription || t('product.defaultDesc')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 pt-1">
                <span
                  className={`text-xs font-century font-semibold ${
                    theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/80'
                  }`}
                >
                  {t('product.quantity')}
                </span>
                <div
                  className={`flex items-center rounded-xl border-2 overflow-hidden ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 font-bold hover:bg-pl-pink/20 smooth-transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-century font-semibold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 font-bold hover:bg-pl-pink/20 smooth-transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons & Features */}
            <div className="space-y-4 pt-5 mt-4 border-t border-pl-pink/10">
              <div className="w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-century font-semibold text-base flex items-center justify-center gap-2 smooth-transition shadow-md ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-pl-pink to-pl-red text-white hover:shadow-lg hover:shadow-pl-pink/30 cursor-pointer'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" /> {t('product.addedToBag')}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> {t('product.add')} ({formatPrice(activePrice * quantity)})
                    </>
                  )}
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div
                className={`grid grid-cols-3 gap-2 pt-1 text-[10px] font-century ${
                  theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-pl-pink shrink-0" />
                  <span>{t('product.fastDelivery')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pl-pink shrink-0" />
                  <span>{t('product.secureCheckout')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-pl-pink shrink-0" />
                  <span>{t('product.easyReturns')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/formatters';
import { parseProductHierarchy } from '../utils/variantUtils';
import { parseProductMetadata } from '../utils/productMetadata';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  hideAddText?: boolean;
}

export default function ProductCard({ product, onOpenQuickView, hideAddText = false }: ProductCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Extract metadata safely including multi-image gallery
  const { cleanDescription, badge, original_price: metaOriginalPrice, images: galleryImages } =
    parseProductMetadata(product);

  // Parse hierarchy (Sizes with custom prices & child colors)
  const hierarchy = parseProductHierarchy(product, product.price);
  const hasSizes = hierarchy.hasHierarchy && hierarchy.sizes.length > 0;

  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number>(0);

  const currentSizeGroup = hasSizes ? hierarchy.sizes[selectedSizeIndex] : null;
  const availableColors =
    currentSizeGroup && currentSizeGroup.colors.length > 0
      ? currentSizeGroup.colors
      : hierarchy.standaloneColors;

  const activeColor = availableColors[selectedColorIndex] || null;
  const activePrice = currentSizeGroup ? currentSizeGroup.price : Number(product.price);

  // Aggregate all unique images: active color image + gallery images + product main image
  const allImages: string[] = [];
  if (activeColor?.imageUrl && !allImages.includes(activeColor.imageUrl)) {
    allImages.push(activeColor.imageUrl);
  }
  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }
  if (product.image_url && !allImages.includes(product.image_url)) {
    allImages.push(product.image_url);
  }

  // Active display image
  const safeIndex = currentGalleryIndex < allImages.length ? currentGalleryIndex : 0;
  const displayImage = allImages.length > 0 ? allImages[safeIndex] : null;

  // Arrow controls for image gallery (< and >)
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentGalleryIndex((prev) => (prev <= 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentGalleryIndex((prev) => (prev >= allImages.length - 1 ? 0 : prev + 1));
  };

  // Check for discount / original price
  const prodAny = product as any;
  const originalPrice = metaOriginalPrice || prodAny.original_price || prodAny.compare_at_price;
  const hasDiscount = originalPrice && Number(originalPrice) > Number(activePrice);
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

  const getVariantString = () => {
    const parts: string[] = [];
    if (currentSizeGroup) parts.push(`Size: ${currentSizeGroup.size}`);
    if (activeColor) parts.push(`Color: ${activeColor.name}`);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, getVariantString(), 1, activePrice, displayImage || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = () => {
    if (onOpenQuickView) {
      onOpenQuickView(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className={`group relative rounded-3xl border-2 overflow-hidden flex flex-col h-full smooth-transition cursor-pointer ${
        theme === 'dark'
          ? 'bg-zinc-800/40 border-zinc-700/80 hover:border-pl-pink/50 shadow-lg shadow-black/20'
          : 'bg-white border-stone-100 hover:border-pl-pink/40 shadow-sm hover:shadow-xl hover:shadow-pl-pink/10'
      }`}
    >
      {/* Product Image Container with < and > Arrows */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-zinc-800/80 flex items-center justify-center group/img">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover/img:scale-105 smooth-transition duration-500"
          />
        ) : (
          <div className="text-6xl text-pl-pink/40 group-hover/img:scale-110 smooth-transition">
            🌸
          </div>
        )}

        {/* Previous Image Arrow (<) */}
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrevImage}
            title="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition shadow-md hover:scale-110 active:scale-95 opacity-80 group-hover/img:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Next Image Arrow (>) */}
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            title="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition shadow-md hover:scale-110 active:scale-95 opacity-80 group-hover/img:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Image index dots when multiple images exist */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${
                  i === safeIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge Tag (Featured, Sale, New, Bestseller) */}
        {customBadge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-century font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md text-white ${
              customBadge.toLowerCase().includes('sale')
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : customBadge.toLowerCase().includes('new')
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : customBadge.toLowerCase().includes('best')
                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                : 'bg-gradient-to-r from-pl-pink to-pl-red'
            }`}
          >
            {getBadgeLabel(customBadge)}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            className={`font-stayvibes text-2xl mb-1 line-clamp-1 smooth-transition ${
              theme === 'dark' ? 'text-pl-white group-hover:text-pl-pink' : 'text-pl-black group-hover:text-pl-pink'
            }`}
          >
            {product.name}
          </h3>

          {/* Description */}
          {cleanDescription && (
            <p
              className={`font-century text-xs line-clamp-2 mb-2 leading-relaxed ${
                theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'
              }`}
            >
              {cleanDescription}
            </p>
          )}

          {/* Size Pills (if product has sizes) */}
          {hasSizes && (
            <div className="my-2 flex items-center gap-1.5 flex-wrap">
              {hierarchy.sizes.map((sg, idx) => {
                const isSelected = selectedSizeIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSizeIndex(idx);
                      setSelectedColorIndex(0);
                      setCurrentGalleryIndex(0);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-century font-semibold transition border ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
                        : theme === 'dark'
                        ? 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-500'
                        : 'border-stone-200 bg-stone-50 text-zinc-700 hover:border-stone-300'
                    }`}
                  >
                    {sg.size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Color Swatches (Filtered by active size) */}
          {availableColors.length > 0 && (
            <div className="my-2 flex items-center gap-1.5 flex-wrap">
              {availableColors.map((color, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    title={color.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColorIndex(idx);
                      setCurrentGalleryIndex(0);
                    }}
                    style={{ backgroundColor: color.hex }}
                    className={`w-5 h-5 rounded-full border border-black/10 smooth-transition cursor-pointer relative ${
                      isSelected
                        ? 'scale-110 ring-2 ring-pl-pink ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-sm'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 mt-2 border-t border-pl-pink/10 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {hasDiscount && (
              <span
                className={`text-xs line-through font-century ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-stone-400'
                }`}
              >
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="font-century text-lg font-bold text-pl-pink">
              {formatPrice(activePrice)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            title={added ? t('product.addedToBag') : t('product.add')}
            className={`${hideAddText ? 'p-2.5' : 'px-3.5 py-2'} rounded-xl font-century font-semibold text-xs flex items-center justify-center gap-1.5 smooth-transition shadow-sm ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-pl-pink to-pl-red text-white hover:shadow-md hover:shadow-pl-pink/30'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                {!hideAddText && <span>{t('product.added')}</span>}
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {!hideAddText && <span>{t('product.add')}</span>}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

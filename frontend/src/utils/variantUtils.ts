import { parseProductMetadata } from './productMetadata';

export interface ColorVariantInfo {
  name: string;
  hex: string;
  imageUrl?: string | null;
  stock?: number;
  price?: number;
  rawVariant?: any;
}

export interface SizeColorOption {
  name: string;
  hex: string;
  imageUrl?: string;
  stock?: number;
}

export interface HierarchySizeOption {
  size: string;
  price: number;
  colors: SizeColorOption[];
}

export interface ProductHierarchyResult {
  hasHierarchy: boolean;
  sizes: HierarchySizeOption[];
  standaloneColors: ColorVariantInfo[];
  minPrice: number;
  maxPrice: number;
}

export interface PrincipalColorOption {
  name: string;
  hex: string;
  label?: string;
}

export const PRINCIPAL_COLORS: PrincipalColorOption[] = [
  { name: 'Pink', hex: '#ff007b', label: 'Pink (#ff007b)' },
  { name: 'Rose', hex: '#ff007b', label: 'Rose (#ff007b)' },
  { name: 'Hot Pink', hex: '#ff007b', label: 'Hot Pink (#ff007b)' },
  { name: 'Light Pink', hex: '#fbcfe8', label: 'Light Pink (#fbcfe8)' },
  { name: 'Black', hex: '#18181b', label: 'Black / Noir (#18181b)' },
  { name: 'White', hex: '#ffffff', label: 'White / Blanc (#ffffff)' },
  { name: 'Red', hex: '#ef4444', label: 'Red / Rouge (#ef4444)' },
  { name: 'Nude', hex: '#e5d0ba', label: 'Nude / Chair (#e5d0ba)' },
  { name: 'Beige', hex: '#f5f5dc', label: 'Beige (#f5f5dc)' },
  { name: 'Brown', hex: '#78350f', label: 'Brown / Marron (#78350f)' },
  { name: 'Blue', hex: '#3b82f6', label: 'Blue / Bleu (#3b82f6)' },
  { name: 'Navy', hex: '#1e3a8a', label: 'Navy / Marine (#1e3a8a)' },
  { name: 'Sky Blue', hex: '#38bdf8', label: 'Sky Blue / Ciel (#38bdf8)' },
  { name: 'Green', hex: '#10b981', label: 'Green / Vert (#10b981)' },
  { name: 'Olive / Kaki', hex: '#556b2f', label: 'Olive / Kaki (#556b2f)' },
  { name: 'Emerald', hex: '#059669', label: 'Emerald (#059669)' },
  { name: 'Mint', hex: '#6ee7b7', label: 'Mint / Menthe (#6ee7b7)' },
  { name: 'Gold', hex: '#eab308', label: 'Gold / Doré (#eab308)' },
  { name: 'Yellow', hex: '#facc15', label: 'Yellow / Jaune (#facc15)' },
  { name: 'Purple', hex: '#a855f7', label: 'Purple / Violet (#a855f7)' },
  { name: 'Lilac', hex: '#c084fc', label: 'Lilac / Lavande (#c084fc)' },
  { name: 'Orange', hex: '#f97316', label: 'Orange (#f97316)' },
  { name: 'Burgundy', hex: '#800020', label: 'Burgundy / Bordeaux (#800020)' },
  { name: 'Coral', hex: '#fb7185', label: 'Coral / Corail (#fb7185)' },
  { name: 'Gray', hex: '#71717a', label: 'Gray / Gris (#71717a)' },
  { name: 'Silver', hex: '#e5e7eb', label: 'Silver / Argent (#e5e7eb)' },
];

// Color palette map for auto-detecting color hex from color names
const COLOR_MAP: Record<string, string> = {
  pink: '#ff007b',
  rose: '#ff007b',
  'hot pink': '#ff007b',
  fuchsia: '#ff007b',
  magenta: '#ff007b',
  black: '#18181b',
  noir: '#18181b',
  white: '#ffffff',
  blanc: '#ffffff',
  red: '#ef4444',
  rouge: '#ef4444',
  blue: '#3b82f6',
  bleu: '#3b82f6',
  sky: '#38bdf8',
  ciel: '#38bdf8',
  navy: '#1e3a8a',
  marine: '#1e3a8a',
  green: '#10b981',
  vert: '#10b981',
  emerald: '#059669',
  mint: '#6ee7b7',
  menthe: '#6ee7b7',
  gold: '#eab308',
  or: '#eab308',
  yellow: '#facc15',
  jaune: '#facc15',
  purple: '#a855f7',
  violet: '#a855f7',
  lavender: '#c084fc',
  lavande: '#c084fc',
  cream: '#fef3c7',
  creme: '#fef3c7',
  beige: '#f5f5dc',
  brown: '#78350f',
  marron: '#78350f',
  nude: '#e5d0ba',
  gray: '#71717a',
  grey: '#71717a',
  gris: '#71717a',
  silver: '#e5e7eb',
  argent: '#e5e7eb',
  orange: '#f97316',
  burgundy: '#800020',
  bordeaux: '#800020',
  coral: '#fb7185',
  corail: '#fb7185',
  lilac: '#e9d5ff',
  lilas: '#e9d5ff',
};

const COMMON_SIZES = new Set([
  'xs', 's', 'm', 'l', 'xl', 'xxl', '2xl', '3xl', '4xl',
  'small', 'medium', 'large', 'x-large', 'xx-large',
  '34', '36', '38', '40', '42', '44', '46', '48',
  'one size', 'unique', 'tu', 'taille unique', 'standard'
]);

export function isKnownSizeValue(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  return COMMON_SIZES.has(clean);
}

export function isKnownColorValue(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (clean.startsWith('#')) return true;
  return Object.keys(COLOR_MAP).some(k => clean === k || clean.includes(k));
}

export function getColorHex(colorName: string): string {
  if (!colorName) return '#ff007b';
  const clean = colorName.trim().toLowerCase();

  // If it's already a valid hex code
  if (clean.startsWith('#') && (clean.length === 4 || clean.length === 7)) {
    return clean;
  }

  // Check mapped colors
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (clean === key || clean.includes(key)) {
      return hex;
    }
  }

  return '#ff007b'; // Default preset pink
}

export function findColorNameFromHex(hex: string): string {
  if (!hex) return 'Pink';
  const clean = hex.trim().toLowerCase();
  
  const match = PRINCIPAL_COLORS.find(
    (c) => c.hex.toLowerCase() === clean
  );
  if (match) return match.name;

  for (const [name, mapHex] of Object.entries(COLOR_MAP)) {
    if (mapHex.toLowerCase() === clean) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return hex.toUpperCase();
}

/**
 * Parses product variants and resolves both hierarchical (Size -> Price -> Colors)
 * and flat color / size variants. Robust against all schema shapes and encoded comments.
 */
export function parseProductHierarchy(
  variantsOrProduct: any = [],
  defaultPrice: number = 0
): ProductHierarchyResult {
  let rawVariants: any[] = [];
  let basePrice = defaultPrice;

  // Handle case where full product is passed directly
  if (variantsOrProduct && typeof variantsOrProduct === 'object' && !Array.isArray(variantsOrProduct)) {
    basePrice = Number(variantsOrProduct.price) || defaultPrice;
    const dbVariants = Array.isArray(variantsOrProduct.variants) ? variantsOrProduct.variants : [];
    const meta = parseProductMetadata(variantsOrProduct);
    const metaVariants = Array.isArray(meta.variants) ? meta.variants : [];
    rawVariants = [...dbVariants, ...metaVariants];
  } else if (Array.isArray(variantsOrProduct)) {
    rawVariants = [...variantsOrProduct];
  }

  if (rawVariants.length === 0) {
    return {
      hasHierarchy: false,
      sizes: [],
      standaloneColors: [],
      minPrice: basePrice,
      maxPrice: basePrice,
    };
  }

  const sizeMap: Map<string, HierarchySizeOption> = new Map();
  const standaloneColors: ColorVariantInfo[] = [];

  for (const v of rawVariants) {
    if (!v) continue;

    // Handle plain string elements (e.g. ['S', 'M', 'L'] or ['Pink', 'Black'])
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (isKnownSizeValue(trimmed)) {
        if (!sizeMap.has(trimmed.toUpperCase())) {
          sizeMap.set(trimmed.toUpperCase(), { size: trimmed.toUpperCase(), price: basePrice, colors: [] });
        }
        continue;
      }
      if (isKnownColorValue(trimmed)) {
        standaloneColors.push({
          name: trimmed,
          hex: getColorHex(trimmed),
          stock: 1,
        });
        continue;
      }
    }

    const vType = (v.variant_type || v.variant_name || v.type || '').toString().toLowerCase();
    const vVal = (v.variant_value || v.value || v.name || '').toString().trim();
    const explicitPrice = v.price !== undefined ? Number(v.price) : basePrice;

    // Check for JSON encoded variant (e.g. { size: 'S', price: 30, color: 'Pink', hex: '#...', image_url: '...' })
    if (vVal.startsWith('{') && vVal.endsWith('}')) {
      try {
        const parsed = JSON.parse(vVal);
        if (parsed.size) {
          const sizeKey = parsed.size.trim();
          const price = Number(parsed.price) || basePrice;
          const colorName = parsed.color || parsed.name || '';
          const hex = parsed.color_hex || parsed.hex || (colorName ? getColorHex(colorName) : '');
          const imageUrl = parsed.image_url || parsed.imageUrl || null;

          if (!sizeMap.has(sizeKey)) {
            sizeMap.set(sizeKey, {
              size: sizeKey,
              price,
              colors: [],
            });
          }

          if (colorName) {
            const entry = sizeMap.get(sizeKey)!;
            if (!entry.colors.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
              entry.colors.push({
                name: colorName,
                hex: hex || getColorHex(colorName),
                imageUrl: imageUrl || undefined,
                stock: parsed.stock ?? v.stock_quantity ?? 1,
              });
            }
          }
          continue;
        }
      } catch (e) {
        // continue
      }
    }

    // Check for structured size string format: "Size:Small|Price:30|Color:Pink|#ee7aaa|img_url"
    if (vVal.toLowerCase().includes('size:') || vType.includes('sizematrix')) {
      const parts = vVal.split('|');
      let sizeName = '';
      let price = explicitPrice;
      let colorName = '';
      let colorHex = '';
      let imageUrl = '';

      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower.startsWith('size:')) sizeName = part.substring(5).trim();
        else if (lower.startsWith('price:')) price = parseFloat(part.substring(6).trim()) || basePrice;
        else if (lower.startsWith('color:')) colorName = part.substring(6).trim();
        else if (part.startsWith('#')) colorHex = part.trim();
        else if (part.startsWith('http') || part.startsWith('data:image')) imageUrl = part.trim();
      }

      if (sizeName) {
        if (!sizeMap.has(sizeName)) {
          sizeMap.set(sizeName, { size: sizeName, price, colors: [] });
        }
        if (colorName) {
          const entry = sizeMap.get(sizeName)!;
          if (!entry.colors.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
            entry.colors.push({
              name: colorName,
              hex: colorHex || getColorHex(colorName),
              imageUrl: imageUrl || undefined,
              stock: v.stock_quantity ?? 1,
            });
          }
        }
        continue;
      }
    }

    // Check if variant is a Size type
    if (
      vType.includes('size') ||
      vType.includes('taille') ||
      vType.includes('dimension') ||
      vType.includes('pointure') ||
      isKnownSizeValue(vVal)
    ) {
      const sizeKey = vVal.replace(/^size:\s*/i, '').trim();
      if (sizeKey && !sizeMap.has(sizeKey)) {
        sizeMap.set(sizeKey, {
          size: sizeKey,
          price: explicitPrice,
          colors: [],
        });
      }
      continue;
    }

    // Check for standalone color variant
    if (
      vType.includes('color') ||
      vType.includes('couleur') ||
      v.color_hex ||
      vVal.startsWith('#') ||
      isKnownColorValue(vVal) ||
      vVal.includes('|')
    ) {
      let name = vVal;
      let hex = v.color_hex || '';
      let imageUrl = v.image_url || v.imageUrl || null;

      if (vVal.includes('|')) {
        const parts = vVal.split('|');
        name = parts[0] || 'Default';
        if (parts[1]) hex = parts[1];
        if (parts[2]) imageUrl = parts[2];
      }

      if (!hex) hex = getColorHex(name);

      if (!standaloneColors.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.hex === hex)) {
        standaloneColors.push({
          name,
          hex,
          imageUrl,
          stock: v.stock_quantity ?? 1,
          rawVariant: v,
        });
      }
      continue;
    }

    // Generic fallback: If variant has custom value, add as size or standalone
    if (vVal) {
      if (!sizeMap.has(vVal)) {
        sizeMap.set(vVal, { size: vVal, price: explicitPrice, colors: [] });
      }
    }
  }

  const sizes = Array.from(sizeMap.values());

  // If sizes exist but have no per-size colors, and standalone colors exist, attach standalone colors to sizes
  if (sizes.length > 0 && standaloneColors.length > 0) {
    sizes.forEach((s) => {
      if (s.colors.length === 0) {
        s.colors = standaloneColors.map((c) => ({
          name: c.name,
          hex: c.hex,
          imageUrl: c.imageUrl || undefined,
          stock: c.stock ?? 1,
        }));
      }
    });
  }

  const hasHierarchy = sizes.length > 0;
  const allPrices = hasHierarchy ? sizes.map((s) => s.price) : [basePrice];

  return {
    hasHierarchy,
    sizes,
    standaloneColors,
    minPrice: Math.min(...allPrices),
    maxPrice: Math.max(...allPrices),
  };
}

export function parseProductColorVariants(variants: any[] = []): ColorVariantInfo[] {
  const result = parseProductHierarchy(variants);
  if (result.hasHierarchy) {
    // Flatten all unique colors across sizes
    const uniqueColorsMap = new Map<string, ColorVariantInfo>();
    for (const size of result.sizes) {
      for (const col of size.colors) {
        if (!uniqueColorsMap.has(col.name)) {
          uniqueColorsMap.set(col.name, {
            name: col.name,
            hex: col.hex,
            imageUrl: col.imageUrl,
            stock: col.stock,
          });
        }
      }
    }
    return Array.from(uniqueColorsMap.values());
  }
  return result.standaloneColors;
}


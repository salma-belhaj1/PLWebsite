export interface ProductExtraMetadata {
  badge?: string;
  original_price?: number;
  images?: string[];
  variants?: any[];
}

/**
 * Encodes extra product metadata (badge, strikethrough original_price, multi-image gallery, variants)
 * into a hidden HTML comment at the end of the description string.
 * This guarantees 100% persistence and compatibility regardless of Supabase schema variations.
 */
export function encodeProductDescription(
  description: string,
  meta: ProductExtraMetadata
): string {
  // Strip any existing metadata or gallery tags
  const clean = (description || '')
    .replace(/<!--METADATA:[\s\S]*?-->/g, '')
    .replace(/<!--GALLERY:[\s\S]*?-->/g, '')
    .trim();

  const metaObj: ProductExtraMetadata = {};
  if (meta.badge && meta.badge.toLowerCase() !== 'auto' && meta.badge.trim() !== '') {
    metaObj.badge = meta.badge.trim();
  }
  if (meta.original_price && Number(meta.original_price) > 0) {
    metaObj.original_price = Number(meta.original_price);
  }
  if (meta.images && meta.images.length > 0) {
    metaObj.images = meta.images;
  }
  if (meta.variants && meta.variants.length > 0) {
    metaObj.variants = meta.variants;
  }

  if (Object.keys(metaObj).length > 0) {
    return `${clean}\n\n<!--METADATA:${JSON.stringify(metaObj)}-->`;
  }
  return clean;
}

/**
 * Parses a product object and extracts clean description, badge, original_price, gallery images, and metadata variants.
 * Works seamlessly whether attributes come from database columns OR the encoded metadata comment.
 */
export function parseProductMetadata(product: any): {
  cleanDescription: string;
  badge?: string;
  original_price?: number;
  images: string[];
  variants?: any[];
} {
  if (!product) {
    return {
      cleanDescription: '',
      badge: undefined,
      original_price: undefined,
      images: [],
      variants: [],
    };
  }

  let cleanDescription = product.description || '';
  const rawBadge: string | undefined = product.badge || product.badge_label || undefined;
  let badge = (rawBadge && rawBadge.toLowerCase() !== 'auto' && rawBadge.trim() !== '') ? rawBadge.trim() : undefined;
  let original_price: number | undefined =
    product.original_price || product.compare_at_price || product.discount_price || undefined;
  const images: string[] = [];
  let variants: any[] | undefined = undefined;

  // 1. Check direct images array or comma-separated image_url
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images.push(...product.images);
  } else if (product.image_url) {
    if (product.image_url.includes(',')) {
      images.push(...product.image_url.split(',').map((u: string) => u.trim()));
    } else {
      images.push(product.image_url);
    }
  }

  // 2. Parse unified <!--METADATA:{...}--> comment in description
  if (cleanDescription.includes('<!--METADATA:')) {
    const match = cleanDescription.match(/<!--METADATA:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.badge && parsed.badge.toLowerCase() !== 'auto') {
          badge = parsed.badge;
        }
        if (parsed.original_price && !original_price) {
          original_price = Number(parsed.original_price);
        }
        if (Array.isArray(parsed.images)) {
          parsed.images.forEach((img: string) => {
            if (!images.includes(img)) images.push(img);
          });
        }
        if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          variants = parsed.variants;
        }
      } catch (e) {
        console.warn('Failed to parse product metadata JSON:', e);
      }
    }
    cleanDescription = cleanDescription.replace(/<!--METADATA:[\s\S]*?-->/g, '').trim();
  }

  // 3. Parse legacy <!--GALLERY:[...]--> comment if present
  if (cleanDescription.includes('<!--GALLERY:')) {
    const match = cleanDescription.match(/<!--GALLERY:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          parsed.forEach((img: string) => {
            if (!images.includes(img)) images.push(img);
          });
        }
      } catch (e) {
        console.warn('Failed to parse gallery JSON:', e);
      }
    }
    cleanDescription = cleanDescription.replace(/<!--GALLERY:[\s\S]*?-->/g, '').trim();
  }

  return {
    cleanDescription,
    badge,
    original_price: original_price ? Number(original_price) : undefined,
    images,
    variants,
  };
}

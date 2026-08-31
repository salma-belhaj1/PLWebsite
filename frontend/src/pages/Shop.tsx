import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { productService, Product } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Grid, Package, Tag, ArrowUpDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductQuickViewModal from '../components/ProductQuickViewModal'
import LoadingScreen from '../components/LoadingScreen'

export default function Shop() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [filterByStock, setFilterByStock] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [showInitialLoading, setShowInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const options: any = {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          q: searchQuery || undefined,
          sort: sortBy === 'featured' ? undefined : sortBy,
          limit: 100,
        }
        const data = await productService.getAllProducts(options)
        const products = (data && data.data) ? (data.data as Product[]) : []
        setProducts(products || [])

        // Extract category names (handling both string and object formats)
        const categoryNamesFromProducts = products
          .map((p) => {
            if (typeof p.category === 'string') return p.category
            if (p.category && typeof p.category === 'object' && 'name' in p.category) return (p.category as any).name
            return null
          })
          .filter(Boolean) as string[]

        const allCatNames: string[] = [...categoryNamesFromProducts]
        try {
          const catRes = await productService.getCategories()
          if (catRes && catRes.data) {
            catRes.data.forEach((c: any) => {
              if (c?.name) allCatNames.push(c.name)
            })
          }
        } catch (e) {
          // ignore
        }

        // Deduplicate and sort alphabetically
        const sortedAlphabeticalCategories = Array.from(new Set(allCatNames)).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        )
        const cats = ['all', ...sortedAlphabeticalCategories]
        setCategories(cats)
        setError(null)
      } catch (err) {
        setError(t('errors.loadProducts'))
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery, sortBy])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    setSearchQuery(q)
  }, [location.search])

  const getProductStock = (product: Product) => {
    return (product.variants && product.variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)) || 0
  }

  const isProductInStock = (product: Product) => {
    return getProductStock(product) > 0 || product.status !== 'out_of_stock'
  }

  const getCategoryName = (category: any): string => {
    if (typeof category === 'string') return category
    if (category && typeof category === 'object' && 'name' in category) return category.name
    return ''
  }

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || getCategoryName(p.category) === selectedCategory)
    .filter(p => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (getCategoryName(p.category) && getCategoryName(p.category).toLowerCase().includes(q))
      )
    })
    .filter(p => {
      if (filterByStock === 'in-stock') return isProductInStock(p)
      if (filterByStock === 'out-of-stock') return !isProductInStock(p)
      return true
    })
    .filter(p => {
      const price = Number(p.price || 0)
      if (priceRange === 'under-20') return price < 20
      if (priceRange === '20-50') return price >= 20 && price <= 50
      if (priceRange === '50-100') return price >= 50 && price <= 100
      if (priceRange === 'over-100') return price > 100
      return true
    })
    // Apply client-side sorting
    .sort((a, b) => {
      if (sortBy === 'priceLowHigh') return Number(a.price) - Number(b.price)
      if (sortBy === 'priceHighLow') return Number(b.price) - Number(a.price)
      if (sortBy === 'rating') return (b as any).rating - (a as any).rating
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      return 0
    })

  if (showInitialLoading) {
    return <LoadingScreen durationMs={1800} onComplete={() => setShowInitialLoading(false)} />
  }

  return (
    <div className={`min-h-screen pt-28 lg:pt-32 ${theme === 'dark' ? 'dark bg-zinc-950' : 'bg-white'}`}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header with Background Image */}
        <div 
          className="relative text-center mb-12 p-8 md:p-14 min-h-[220px] md:min-h-[250px] flex flex-col justify-center items-center rounded-3xl overflow-hidden shadow-xl border border-pl-pink/20 slide-in-up"
        >
          {/* Background Image across the whole picture */}
          <img
            src="/media/background.jpg"
            alt="Peace & Love Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Gentle overlay across the whole picture for clear image visibility and legibility */}
          <div className={`absolute inset-0 transition-colors ${theme === 'dark' ? 'bg-black/45' : 'bg-white/40'}`}></div>

          <div className="relative z-10 w-full">
            <h1 className="text-4xl md:text-6xl font-stayvibes tracking-wider mb-1 slide-in-up hover:scale-105 smooth-transition cursor-default text-pl-pink drop-shadow-sm">
              {t('shopPage.title')}
            </h1>
            <p className={`text-xs md:text-sm font-century font-semibold uppercase tracking-widest mb-3 drop-shadow-xs ${theme === 'dark' ? 'text-pl-white/90' : 'text-pl-black/80'}`}>
              {t('shopPage.subtitle')}
            </p>
            <p className={`text-sm md:text-base font-century max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black/90'}`}>
              {t('shopPage.description')}
            </p>
          </div>
        </div>

        {/* Category Filter - Modern Horizontal Scroll */}
        {categories.length > 1 && (
          <motion.div 
            className="flex flex-wrap gap-3 justify-center mb-10 slide-in-up"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categories.map((cat, idx) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2.5 rounded-full font-century smooth-transition capitalize text-sm tracking-wide border-2 font-medium flex items-center gap-2
                  ${selectedCategory === cat
                    ? `bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink shadow-lg shadow-pl-pink/30`
                    : `${theme === 'dark' ? 'bg-zinc-800/50 text-pl-white/80 border-zinc-700 hover:border-pl-pink hover:bg-pl-pink/10' : 'bg-stone-100 text-pl-black/70 border-stone-200 hover:border-pl-pink hover:bg-pl-pink/5'}`
                  }`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {cat === 'all' && <Grid className="w-4 h-4" />}
                {cat === 'all' ? t('shopPage.filter.all') : `${cat} (${products.filter(p => getCategoryName(p.category) === cat).length})`}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Modern Filter Bar */}
        <div className={`mb-8 p-3 px-4 rounded-2xl border-2 smooth-transition ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Availability Dropdown */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${
                theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-stone-200'
              }`}>
                <Package className="w-4 h-4 text-pl-pink shrink-0" />
                <select
                  id="availability-select"
                  aria-label={t('filter.availability')}
                  value={filterByStock}
                  onChange={(e) => setFilterByStock(e.target.value as any)}
                  className={`bg-transparent text-sm font-century font-medium focus:outline-none cursor-pointer ${
                    theme === 'dark' ? 'text-pl-white' : 'text-pl-black'
                  }`}
                >
                  <option value="all" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.allAvailability')}</option>
                  <option value="in-stock" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.inStock')}</option>
                  <option value="out-of-stock" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.outOfStock')}</option>
                </select>
              </div>

              {/* Price Range Dropdown */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${
                theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-stone-200'
              }`}>
                <Tag className="w-4 h-4 text-pl-pink shrink-0" />
                <select
                  id="price-range-select"
                  aria-label={t('filter.price')}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className={`bg-transparent text-sm font-century font-medium focus:outline-none cursor-pointer ${
                    theme === 'dark' ? 'text-pl-white' : 'text-pl-black'
                  }`}
                >
                  <option value="all" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.allPrices')}</option>
                  <option value="under-20" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.under20')}</option>
                  <option value="20-50" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.between20and50')}</option>
                  <option value="50-100" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.between50and100')}</option>
                  <option value="over-100" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('filter.over100')}</option>
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${
              theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-stone-200'
            }`}>
              <ArrowUpDown className="w-4 h-4 text-pl-pink shrink-0" />
              <select
                id="sort-select"
                aria-label={t('sort.by')}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`bg-transparent text-sm font-century font-medium focus:outline-none cursor-pointer ${
                  theme === 'dark' ? 'text-pl-white' : 'text-pl-black'
                }`}
              >
                <option value="featured" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('sort.featured')}</option>
                <option value="priceLowHigh" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('sort.priceLowHigh')}</option>
                <option value="priceHighLow" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('sort.priceHighLow')}</option>
                <option value="rating" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('sort.rating')}</option>
                <option value="newest" className={theme === 'dark' ? 'bg-zinc-800 text-pl-white' : 'bg-white text-pl-black'}>{t('sort.newest')}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || filterByStock !== 'all' || priceRange !== 'all') && (
            <div className="mt-4 pt-4 border-t border-pl-pink/20 flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-century font-semibold ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/50'}`}>
                {t('shopPage.activeFilters')}
              </span>
              {selectedCategory !== 'all' && (
                <motion.button
                  onClick={() => setSelectedCategory('all')}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-lg text-xs font-century border-2 smooth-transition ${theme === 'dark' ? 'bg-pl-pink/20 border-pl-pink text-pl-pink' : 'bg-pl-pink/10 border-pl-pink text-pl-pink'}`}
                >
                  {selectedCategory} ✕
                </motion.button>
              )}
              {filterByStock !== 'all' && (
                <motion.button
                  onClick={() => setFilterByStock('all')}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-lg text-xs font-century border-2 smooth-transition ${theme === 'dark' ? 'bg-pl-pink/20 border-pl-pink text-pl-pink' : 'bg-pl-pink/10 border-pl-pink text-pl-pink'}`}
                >
                  {filterByStock === 'in-stock' ? t('filter.inStock') : t('filter.outOfStock')} ✕
                </motion.button>
              )}
              {priceRange !== 'all' && (
                <motion.button
                  onClick={() => setPriceRange('all')}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 rounded-lg text-xs font-century border-2 smooth-transition ${theme === 'dark' ? 'bg-pl-pink/20 border-pl-pink text-pl-pink' : 'bg-pl-pink/10 border-pl-pink text-pl-pink'}`}
                >
                  {priceRange === 'under-20' && t('filter.under20')}
                  {priceRange === '20-50' && t('filter.between20and50')}
                  {priceRange === '50-100' && t('filter.between50and100')}
                  {priceRange === 'over-100' && t('filter.over100')} ✕
                </motion.button>
              )}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl mb-8 text-center border-2 ${theme === 'dark' ? 'bg-pl-red/20 text-pl-white border-pl-red/50' : 'bg-pl-red/10 text-pl-black border-pl-red/30'}`}
          >
            <p className="font-century text-lg font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Results Count */}
        <div className={`mb-6 text-sm font-century ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
          {!loading && (
            <p>
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? t('shopPage.productFound') : t('shopPage.productsFound')}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
              <motion.div
                key={skeleton}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-2xl overflow-hidden h-96 flex flex-col ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} border-2 ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-100'}`}
              >
                <div className={`h-44 w-full animate-pulse ${theme === 'dark' ? 'bg-zinc-700' : 'bg-stone-100'}`}></div>
                <div className="p-4 space-y-3 flex-1">
                  <div className={`h-4 w-3/4 rounded animate-pulse ${theme === 'dark' ? 'bg-zinc-700' : 'bg-stone-100'}`}></div>
                  <div className={`h-3 w-full rounded animate-pulse ${theme === 'dark' ? 'bg-zinc-700' : 'bg-stone-100'}`}></div>
                  <div className={`h-3 w-5/6 rounded animate-pulse ${theme === 'dark' ? 'bg-zinc-700' : 'bg-stone-100'}`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-24 rounded-3xl border-2 ${theme === 'dark' ? 'bg-pl-pink/5 border-pl-pink/20' : 'bg-pl-pink/5 border-pl-pink/20'}`}
          >
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-stayvibes text-pl-pink mb-2">{t('shopPage.empty.title')}</h3>
            <p className={`text-lg font-century max-w-md mx-auto ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/60'}`}>
              {t('shopPage.empty.description')}
            </p>
            <motion.button
              onClick={() => {
                setSelectedCategory('all')
                setFilterByStock('all')
              }}
              whileHover={{ scale: 1.05 }}
              className="mt-8 bg-gradient-to-r from-pl-pink to-pl-red text-white px-8 py-3 rounded-full smooth-transition font-century text-sm tracking-wide font-semibold shadow-lg shadow-pl-pink/30"
            >
              {t('shopPage.empty.back')} →
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  )
}

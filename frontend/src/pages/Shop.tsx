import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { productService, Product } from '../services/api'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'

export default function Shop() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [filterByStock, setFilterByStock] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')

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
        const categoryNames = products
          .map((p) => {
            if (typeof p.category === 'string') return p.category
            if (p.category && typeof p.category === 'object' && 'name' in p.category) return (p.category as any).name
            return null
          })
          .filter(Boolean) as string[]
        const cats = ['all', ...new Set(categoryNames)]
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
    // Apply client-side sorting
    .sort((a, b) => {
      if (sortBy === 'priceLowHigh') return Number(a.price) - Number(b.price)
      if (sortBy === 'priceHighLow') return Number(b.price) - Number(a.price)
      if (sortBy === 'rating') return (b as any).rating - (a as any).rating
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      return 0
    })

  return (
    <div className={`min-h-screen pt-28 lg:pt-32 ${theme === 'dark' ? 'dark bg-zinc-950' : 'bg-white'}`}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12 slide-in-up">
          <h1 className={`text-6xl font-stayvibes mb-4 slide-in-up hover:scale-105 smooth-transition cursor-default ${theme === 'dark' ? 'text-pl-pink' : 'text-pl-pink'}`}>✨ {t('shopPage.title')} ✨</h1>
          <p className={`text-lg font-century max-w-2xl mx-auto ${theme === 'dark' ? 'text-pl-white/70' : 'text-pl-black/70'}`}>
            {t('shopPage.description')}
          </p>
          <div className="h-1.5 w-32 bg-gradient-to-r from-pl-pink to-pl-red mx-auto mt-6 rounded-full shadow-sm"></div>
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
                className={`px-6 py-2.5 rounded-full font-century smooth-transition capitalize text-sm tracking-wide border-2 font-medium
                  ${selectedCategory === cat
                    ? `bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink shadow-lg shadow-pl-pink/30`
                    : `${theme === 'dark' ? 'bg-zinc-800/50 text-pl-white/80 border-zinc-700 hover:border-pl-pink hover:bg-pl-pink/10' : 'bg-stone-100 text-pl-black/70 border-stone-200 hover:border-pl-pink hover:bg-pl-pink/5'}`
                  }`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {cat === 'all' ? t('shopPage.filter.all') : `${cat} (${products.filter(p => getCategoryName(p.category) === cat).length})`}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Modern Filter Bar */}
        <div className={`mb-8 p-4 rounded-2xl border-2 smooth-transition ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700' : 'bg-stone-50 border-stone-200'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stock Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`font-century text-sm font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/60'}`}>
                📦 {t('stock.inStock')}:
              </span>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'in-stock', 'out-of-stock'] as const).map((stock) => (
                  <motion.button
                    key={stock}
                    onClick={() => setFilterByStock(stock)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-century font-medium smooth-transition border ${
                      filterByStock === stock
                        ? 'bg-pl-pink text-white border-pl-pink shadow-md shadow-pl-pink/30'
                        : `${theme === 'dark' ? 'bg-zinc-700/50 text-pl-white/70 border-zinc-600 hover:border-pl-pink' : 'bg-white text-pl-black/60 border-stone-200 hover:border-pl-pink'}`
                    }`}
                  >
                    {stock === 'all' && 'All'}
                    {stock === 'in-stock' && t('stock.inStock')}
                    {stock === 'out-of-stock' && t('stock.outOfStock')}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className={`font-century text-sm font-semibold ${theme === 'dark' ? 'text-pl-white/80' : 'text-pl-black/60'}`}>
                🔄 {t('sort.by')}:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded-lg text-sm font-century smooth-transition border-2 focus:outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600 text-pl-white focus:border-pl-pink' 
                    : 'bg-white border-stone-200 text-pl-black focus:border-pl-pink'
                }`}
              >
                <option value="featured">{t('sort.featured')}</option>
                <option value="priceLowHigh">{t('sort.priceLowHigh')}</option>
                <option value="priceHighLow">{t('sort.priceHighLow')}</option>
                <option value="rating">{t('sort.rating')}</option>
                <option value="newest">{t('sort.newest')}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || filterByStock !== 'all') && (
            <div className="mt-4 pt-4 border-t border-pl-pink/20 flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-century font-semibold ${theme === 'dark' ? 'text-pl-white/60' : 'text-pl-black/50'}`}>
                Active filters:
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
                  {filterByStock === 'in-stock' ? t('stock.inStock') : t('stock.outOfStock')} ✕
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
          {!loading && <p>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</p>}
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
            {filteredProducts.map((product, idx) => {
              const stock = getProductStock(product)
              const inStock = isProductInStock(product)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className={`group rounded-2xl border-2 overflow-hidden h-96 flex flex-col smooth-transition shadow-lg hover:shadow-2xl ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-zinc-700 hover:border-pl-pink/50' 
                      : 'bg-white border-stone-100 hover:border-pl-pink/50'
                  }`}
                >
                  {/* Image Container */}
                  <div className={`relative h-44 flex items-center justify-center overflow-hidden group/image ${theme === 'dark' ? 'bg-gradient-to-br from-pl-pink/10 to-zinc-900' : 'bg-gradient-to-br from-pl-pink/10 to-white'}`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,var(--pl-pink)_0%,transparent_50%)] smooth-transition group-hover:scale-150"></div>
                    <div className="text-6xl drop-shadow-md group-hover/image:scale-110 group-hover/image:rotate-[8deg] smooth-transition relative z-10">✨</div>

                    {/* Category Badge */}
                    <div className={`absolute top-3 right-3 backdrop-blur-md px-3 py-1 rounded-full text-xs font-century font-semibold tracking-wide border-2 shadow-md z-20 capitalize ${
                      theme === 'dark'
                        ? 'bg-zinc-900/80 text-pl-pink border-pl-pink/50'
                        : 'bg-white/80 text-pl-pink border-pl-pink/50'
                    }`}>
                      {getCategoryName(product.category)}
                    </div>

                    {/* Stock Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-century font-semibold z-20 border-2 ${
                      inStock
                        ? theme === 'dark'
                          ? 'bg-green-900/80 text-green-200 border-green-500/50'
                          : 'bg-green-100 text-green-800 border-green-200'
                        : theme === 'dark'
                          ? 'bg-red-900/80 text-red-200 border-red-500/50'
                          : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {inStock ? `${t('stock.inStock')}${stock > 0 ? ` • ${stock}` : ''}` : t('stock.outOfStock')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 flex-1 flex flex-col ${theme === 'dark' ? 'bg-gradient-to-b from-zinc-800 to-zinc-900' : 'bg-gradient-to-b from-white to-pl-pink/[0.02]'}`}>
                    {/* Title */}
                    <h3 className={`text-lg font-stayvibes line-clamp-2 group-hover:text-pl-pink smooth-transition ${theme === 'dark' ? 'text-pl-white' : 'text-pl-black'}`}>
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs line-clamp-2 mt-2 flex-grow leading-relaxed font-century ${theme === 'dark' ? 'text-pl-white/50' : 'text-pl-black/50'}`}>
                      {product.description}
                    </p>

                    {/* Footer - Price & Button */}
                    <div className={`flex items-center justify-between mt-auto pt-3 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-100'}`}>
                      <span className="text-xl font-stayvibes text-pl-pink font-semibold">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'TND', minimumFractionDigits: 0 }).format(Number(product.price))}
                      </span>
                      <motion.button
                        onClick={() => inStock && addToCart(product, undefined, 1)}
                        disabled={!inStock}
                        whileHover={inStock ? { scale: 1.1 } : {}}
                        whileTap={inStock ? { scale: 0.95 } : {}}
                        className={`px-4 py-2 rounded-lg smooth-transition font-century font-semibold text-sm flex items-center gap-1 border-2 ${
                          inStock
                            ? 'bg-gradient-to-r from-pl-pink to-pl-red text-white border-pl-pink hover:shadow-lg hover:shadow-pl-pink/30 cursor-pointer'
                            : `${theme === 'dark' ? 'bg-zinc-700 text-zinc-400 border-zinc-600' : 'bg-stone-100 text-stone-400 border-stone-200'} cursor-not-allowed`
                        }`}
                        title={!inStock ? t('stock.outOfStock') : ''}
                      >
                        {!inStock ? '✕' : '🛍️'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}

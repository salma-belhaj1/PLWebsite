import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { productService, Product } from '@/services/api'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getAllProducts()
        const products = data.data as Product[]; // Explicitly cast to Product[]
        setProducts(products || [])
        
        // Extract unique categories
        const cats = ['all', ...new Set(products.map((p) => p.category))]; // Ensure string[]
        setCategories(cats)
        setError(null)
      } catch (err) {
        setError('Failed to load products. Please try again.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-pl-white pt-24">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12 slide-in-up">
          <h1 className="text-6xl font-stayvibes text-pl-pink mb-4 slide-in-up hover:scale-105 smooth-transition cursor-default">✨ Our Collection ✨</h1>
          <p className="text-lg text-pl-black/70 font-century max-w-2xl mx-auto">
            Discover our carefully curated collection of peace, love, and beauty. Each product is selected with care and crafted with intention.
          </p>
          <div className="h-1.5 w-32 bg-gradient-to-r from-pl-pink to-pl-red mx-auto mt-6 rounded-full shadow-sm"></div>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-4 justify-center mb-16 slide-in-up">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full font-century smooth-transition capitalize text-sm tracking-wide
                  ${selectedCategory === cat
                    ? 'bg-gradient-to-r from-pl-pink to-pl-red text-pl-white shadow-[0_4px_15px_rgba(238,122,170,0.4)] scale-105'
                    : 'bg-pl-white border border-pl-pink/30 text-pl-pink hover:bg-pl-pink/5 hover:border-pl-pink hover:scale-105 hover:shadow-md'
                  }`}
              >
                {cat === 'all' ? '👁️ All Collection' : `${cat} (${products.filter(p => p.category === cat).length})`}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-pl-red text-pl-white p-6 rounded-xl mb-8 fade-in text-center">
            <p className="font-century text-lg">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 fade-in">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
              <div key={skeleton} className="bg-pl-white border border-gray-100 rounded-3xl overflow-hidden h-[450px] flex flex-col shadow-sm">
                <div className="h-56 loading-shimmer w-full"></div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="h-6 w-3/4 rounded-full loading-shimmer"></div>
                  <div className="h-4 w-full rounded-full loading-shimmer"></div>
                  <div className="h-4 w-5/6 rounded-full loading-shimmer"></div>
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="h-6 w-16 rounded-full loading-shimmer"></div>
                    <div className="h-10 w-24 rounded-full loading-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-pl-pink/5 rounded-3xl border border-pl-pink/20 fade-in">
            <div className="text-7xl mb-6 float-animation">🔍</div>
            <h3 className="text-2xl font-stayvibes text-pl-pink mb-2">Nothing found here</h3>
            <p className="text-pl-black/60 text-lg font-century max-w-md mx-auto">We couldn't find any products in this category right now. Spread love and try another category! ✌️</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="mt-8 bg-pl-white border-2 border-pl-pink text-pl-pink px-8 py-3 rounded-full hover:bg-pl-pink hover:text-pl-white smooth-transition font-century text-sm tracking-wide"
            >
              Back to Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, idx) => (
              <div 
                key={product.id} 
                className="hover-lift group fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Product Card */}
                <div className="bg-pl-white border border-gray-100/50 rounded-3xl overflow-hidden h-[450px] flex flex-col smooth-transition shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(238,122,170,0.15)] hover:border-pl-pink/30 group-hover:-translate-y-2 relative">
                  
                  {/* Image Container */}
                  <div className="relative h-56 bg-gradient-to-br from-pl-pink/10 via-[#fafafa] to-pl-pink/5 flex items-center justify-center overflow-hidden group/image">
                    {/* Abstract placeholder shape if no image */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,var(--pl-pink)_0%,transparent_50%)] smooth-transition group-hover:scale-150"></div>
                    <div className="text-7xl drop-shadow-md group-hover/image:scale-110 group-hover/image:rotate-[8deg] smooth-transition relative z-10 transition-transform duration-500">✨</div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-pl-pink border border-pl-pink/20 px-4 py-1.5 rounded-full text-xs font-century font-medium tracking-wide shadow-sm z-20 capitalize">
                      {product.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-pl-pink/[0.02]">
                    {/* Title */}
                    <h3 className="text-xl font-stayvibes text-pl-black mb-2 line-clamp-2 group-hover:text-pl-pink smooth-transition">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-pl-black/50 font-century mb-4 line-clamp-2 flex-grow leading-relaxed">
                      {product.description}
                    </p>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-2">
                          {product.variants.slice(0, 3).map((variant, idx) => (
                            <span 
                              key={idx} 
                              className="bg-pl-white border border-gray-200 text-pl-black/60 px-3 py-1 rounded-lg text-[10px] font-century hover:border-pl-pink hover:text-pl-pink smooth-transition shadow-sm"
                              title={`${variant.variant_value}: ${variant.stock_quantity} in stock`}
                            >
                              {variant.variant_value}
                            </span>
                          ))}
                          {product.variants.length > 3 && (
                            <span className="text-pl-black/40 text-[10px] font-century px-2 py-1 bg-gray-50 rounded-lg">+{product.variants.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-pl-black/40 font-century uppercase tracking-wider mb-0.5">Price</span>
                        <span className="text-2xl font-stayvibes text-pl-pink font-semibold">
                          ${parseFloat(product.price as string).toFixed(2)}
                        </span>
                      </div>
                      <button className="bg-pl-black text-pl-white px-5 py-2.5 rounded-xl hover:bg-pl-pink shadow-md hover:shadow-[0_4px_15px_rgba(238,122,170,0.4)] smooth-transition font-century font-medium text-sm flex items-center gap-2 group/btn">
                        <span>Add</span>
                        <span className="group-hover/btn:rotate-12 smooth-transition transform origin-center">🛍️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

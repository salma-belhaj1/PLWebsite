import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTranslation } from 'react-i18next'
import { productService, Product } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductQuickViewModal from '../components/ProductQuickViewModal'

export default function Home() {
  const { t } = useTranslation()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  useEffect(() => {
    productService.getAllProducts().then((res: any) => {
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (list && list.length > 0) {
        setFeaturedProducts(list.slice(0, 4));
      }
    }).catch((err: unknown) => {
      console.error('Error fetching featured products:', err);
    });
  }, []);
  return (
    <div className="min-h-screen theme-page pt-24">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pl-black via-pl-black to-pl-pink/20 overflow-hidden animate-gradient-shift">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-pl-pink/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pl-pink/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-4 px-6 py-2 rounded-full border border-pl-white/20 bg-white/5 backdrop-blur-sm text-pl-white/90 font-century text-sm slide-in-down tracking-wider uppercase">{t('hero.welcome')}</div>
          <h1 className="text-7xl md:text-[8rem] font-stayvibes text-transparent bg-clip-text bg-gradient-to-r from-pl-pink via-white to-pl-pink mb-6 slide-in-down leading-tight pb-2 hover:scale-105 smooth-transition cursor-default">
            {t('brand.name')}
          </h1>
          <p className="text-xl md:text-3xl font-century text-pl-white mb-6 slide-in-up font-light tracking-wide" style={{ animationDelay: '200ms' }}>
            {t('hero.tagline')}
          </p>
          <p className="text-lg md:text-xl font-century text-pl-white/70 mb-12 max-w-2xl mx-auto slide-in-up font-light" style={{ animationDelay: '300ms' }}>
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center slide-in-up" style={{ animationDelay: '400ms' }}>
            <a 
              href="/shop" 
              className="group inline-flex justify-center items-center gap-3 btn-brand px-10 py-4 rounded-full font-century font-semibold tracking-wide text-sm smooth-transition transform"
            >
              <span>{t('hero.cta.explore')}</span>
              <span className="group-hover:translate-x-1 smooth-transition">➔</span>
            </a>
            <a 
              href="#values" 
              className="inline-flex justify-center items-center px-10 py-4 rounded-full btn-outline text-pl-white border-pl-white/35 hover:bg-white/10 backdrop-blur-sm font-century font-semibold tracking-wide text-sm smooth-transition hover:scale-105 transform"
            >
              {t('hero.cta.learn')}
            </a>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-20 md:py-32 bg-pl-white dark:bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20 slide-in-up">
            <h2 className="text-6xl font-stayvibes text-pl-pink mb-4 hover:scale-105 smooth-transition cursor-default">{t('values.title')}</h2>
            <div className="h-1.5 w-32 bg-gradient-to-r from-pl-pink to-pl-red mx-auto rounded-full shadow-sm"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Peace Card */}
            <div className="hover-lift group relative fade-in h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-pl-pink to-pl-pink/80 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 smooth-transition"></div>
              <div className="relative h-full bg-white border border-gray-100/50 p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] smooth-transition group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgba(238,122,170,0.15)] flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pl-pink/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="text-7xl mb-8 group-hover:scale-125 group-hover:-rotate-6 smooth-transition drop-shadow-sm">🕊️</div>
                <h3 className="text-4xl font-stayvibes mb-4 text-pl-black group-hover:text-pl-pink smooth-transition">{t('values.peace.title')}</h3>
                <p className="font-century text-base leading-relaxed text-pl-black/60 group-hover:text-pl-black/80 smooth-transition mt-auto">
                  {t('values.peace.desc')}
                </p>
              </div>
            </div>

            {/* Love Card */}
            <div className="hover-lift group relative fade-in h-[350px]" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff4b8c] to-[#ff4b8c]/80 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 smooth-transition"></div>
              <div className="relative h-full bg-white border border-gray-100/50 p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] smooth-transition group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgba(255,75,140,0.15)] flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4b8c]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="text-7xl mb-8 group-hover:scale-125 group-hover:rotate-6 smooth-transition heartbeat drop-shadow-sm">❤️</div>
                <h3 className="text-4xl font-stayvibes mb-4 text-pl-black group-hover:text-[#ff4b8c] smooth-transition">{t('values.love.title')}</h3>
                <p className="font-century text-base leading-relaxed text-pl-black/60 group-hover:text-pl-black/80 smooth-transition mt-auto">
                  {t('values.love.desc')}
                </p>
              </div>
            </div>

            {/* Quality Card */}
            <div className="hover-lift group relative fade-in h-[350px]" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-pl-black to-pl-black/80 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-30 smooth-transition"></div>
              <div className="relative h-full bg-white border border-gray-100/50 p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] smooth-transition group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pl-black/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="text-7xl mb-8 group-hover:scale-125 group-hover:rotate-12 smooth-transition drop-shadow-sm">✨</div>
                <h3 className="text-4xl font-stayvibes mb-4 text-pl-black smooth-transition">{t('values.quality.title')}</h3>
                <p className="font-century text-base leading-relaxed text-pl-black/60 group-hover:text-pl-black/80 smooth-transition mt-auto">
                  {t('values.quality.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-pl-white/50 to-pl-white dark:from-[#0d0d0d] dark:to-[#070707]">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="relative text-center mb-16 p-8 md:p-14 min-h-[220px] md:min-h-[260px] flex flex-col justify-center items-center rounded-3xl overflow-hidden shadow-xl border border-pl-pink/20 slide-in-up"
          >
            {/* Background Image across the whole picture */}
            <img
              src="/media/background.jpg"
              alt="Peace & Love Featured Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gentle overlay across the whole picture for clear image visibility and legibility */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/45 transition-colors"></div>
            <div className="relative z-10 w-full">
              <h2 className="text-6xl md:text-7xl font-stayvibes text-pl-pink mb-4 hover:scale-105 smooth-transition cursor-default drop-shadow-sm">{t('featured.title')}</h2>
              <p className="text-lg md:text-xl font-century text-pl-black/90 dark:text-pl-white mb-4 max-w-2xl mx-auto font-semibold drop-shadow-xs">{t('featured.subtitle')}</p>
              <div className="h-1.5 w-32 bg-gradient-to-r from-pl-pink to-pl-red mx-auto rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hideAddText={true}
                  onOpenQuickView={(p) => setQuickViewProduct(p)}
                />
              ))
            ) : (
              [
                { id: 1, name: 'Peace Candle', price: 24.99, description: 'Handcrafted soy candle with soothing lavender and vanilla notes.', image_url: '/media/peace_candle.jpg', variants: [{ variant_type: 'Color', variant_value: 'Rose|#ee7aaa|' }, { variant_type: 'Color', variant_value: 'Cream|#fef3c7|' }] },
                { id: 2, name: 'Love Bracelet', price: 34.99, description: 'Elegant rose gold charm bracelet designed to inspire daily gratitude.', image_url: '/media/love_bracelet.jpg', variants: [{ variant_type: 'Color', variant_value: 'Rose Gold|#d4af37|' }, { variant_type: 'Color', variant_value: 'Silver|#e5e7eb|' }] },
                { id: 3, name: 'Care Journal', price: 19.99, description: 'Hardcover guided reflection journal for daily peace and self care.', image_url: '/media/care_journal.jpg', variants: [{ variant_type: 'Color', variant_value: 'Blush Pink|#ffc0cb|' }, { variant_type: 'Color', variant_value: 'Sage Green|#6ee7b7|' }] },
                { id: 4, name: 'Zen Diffuser', price: 49.99, description: 'Minimalist ceramic essential oil diffuser with soothing ambient glow.', image_url: '/media/zen_diffuser.jpg', variants: [{ variant_type: 'Color', variant_value: 'Matte White|#ffffff|' }, { variant_type: 'Color', variant_value: 'Charcoal|#18181b|' }] },
              ].map((fallbackProduct) => (
                <ProductCard
                  key={fallbackProduct.id}
                  product={fallbackProduct as any}
                  hideAddText={true}
                  onOpenQuickView={(p) => setQuickViewProduct(p)}
                />
              ))
            )}
          </div>

          <div className="text-center mt-20 slide-in-up">
            <a 
              href="/shop" 
              className="inline-flex items-center gap-3 btn-brand px-12 py-5 rounded-full font-century font-semibold tracking-wide text-sm smooth-transition hover:scale-105"
            >
              <span>{t('featured.cta.exploreAll')}</span>
              <span className="text-xl">➔</span>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-pl-black to-pl-black/95 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pl-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-2xl mx-auto px-4 text-center relative z-10 slide-in-up">
          <h2 className="text-5xl font-stayvibes text-pl-pink mb-4">
            {t('newsletter.title')}
          </h2>
          <p className="font-century text-pl-white/80 text-lg mb-12">
            {t('newsletter.subtitle')}
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 mb-6">
            <input 
              type="email" 
              placeholder={t('newsletter.placeholder')} 
              className="flex-1 px-6 py-4 rounded-full font-century smooth-transition focus:outline-none focus:ring-2 focus:ring-pl-pink"
            />
            <button 
              type="submit"
              className="btn-brand px-8 py-4 rounded-full font-stayvibes smooth-transition hover:scale-105 transform whitespace-nowrap"
            >
              {t('newsletter.submit')}
            </button>
          </form>

          <p className="text-pl-white/60 font-century text-sm">
            {t('newsletter.privacy')}
          </p>
        </div>
      </section>

      <Footer />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}

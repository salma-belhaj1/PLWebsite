import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()
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
          <div className="text-center mb-16 slide-in-up">
            <h2 className="text-6xl font-stayvibes text-pl-pink mb-4 hover:scale-105 smooth-transition cursor-default">{t('featured.title')}</h2>
            <p className="text-lg font-century text-pl-black/70 mb-4">{t('featured.subtitle')}</p>
            <div className="h-1.5 w-32 bg-gradient-to-r from-pl-pink to-pl-red mx-auto rounded-full shadow-sm"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className="hover-lift group fade-in relative"
                style={{ animationDelay: `${item * 100}ms` }}
              >
                {/* Product Card */}
                <div className="bg-white border border-gray-100/50 rounded-3xl overflow-hidden h-[450px] flex flex-col smooth-transition shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(238,122,170,0.15)] hover:border-pl-pink/30 group-hover:-translate-y-2 relative">
                  
                  {/* Image Container */}
                  <div className="relative h-56 bg-gradient-to-br from-pl-pink/10 via-[#fafafa] to-pl-pink/5 flex items-center justify-center overflow-hidden group/image">
                    {/* Abstract placeholder shape if no image */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,var(--pl-pink)_0%,transparent_50%)] smooth-transition group-hover:scale-150"></div>
                    <div className="text-7xl drop-shadow-md group-hover/image:scale-110 group-hover/image:rotate-[8deg] smooth-transition relative z-10 transition-transform duration-500">
                      {item === 1 ? '🕊️' : item === 2 ? '❤️' : item === 3 ? '✨' : '🌸'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-pl-pink/[0.02]">
                    <h4 className="font-stayvibes text-xl text-pl-black mb-2 group-hover:text-pl-pink smooth-transition">
                      Featured Item {item}
                    </h4>
                    <p className="font-century text-pl-black/50 text-sm mb-4 flex-grow leading-relaxed">
                      Beautiful and meaningful product to enhance your daily peace
                    </p>
                    
                    {/* Footer */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-pl-black/40 font-century uppercase tracking-wider mb-0.5">{t('product.priceLabel')}</span>
                        <span className="font-stayvibes text-2xl text-pl-pink font-semibold">$24.99</span>
                      </div>
                      <button className="btn-brand px-5 py-2.5 rounded-xl smooth-transition font-century font-medium text-sm flex items-center gap-2 group/btn">
                        <span>{t('product.add')}</span>
                        <span className="group-hover/btn:rotate-12 smooth-transition transform origin-center">✨</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  )
}

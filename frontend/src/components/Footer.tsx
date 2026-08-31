import { useTranslation } from 'react-i18next'
import { Heart, Mail, Phone, MessageSquare } from 'lucide-react'

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gradient-to-b from-pl-black to-pl-black/95 text-pl-white py-16 mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pl-pink/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pl-red/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <div className="slide-in-up group">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-pl-pink fill-pl-pink" />
              <h3 className="text-2xl font-stayvibes text-pl-pink group-hover:text-pl-red smooth-transition">{t('brand.name')}</h3>
            </div>
            <p className="font-century text-pl-white/70 leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Contact Section */}
          <div className="slide-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-pl-pink" />
              <h3 className="text-2xl font-stayvibes text-pl-pink">{t('footer.contact.title')}</h3>
            </div>
            <div className="font-century text-pl-white/70 leading-relaxed space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-pl-pink shrink-0" />
                <a href="mailto:pl.tn.contact@gmail.com" className="hover:text-pl-pink smooth-transition">
                  pl.tn.contact@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-pl-pink shrink-0" />
                <a href="tel:+21693656789" className="hover:text-pl-pink smooth-transition">
                  +216 93 656 789
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-pl-pink shrink-0" />
                <a href="https://www.instagram.com/peace.love.tn/" target="_blank" rel="noopener noreferrer" className="hover:text-pl-pink smooth-transition">
                  @peace.love.tn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-pl-pink to-transparent mb-8"></div>

        {/* Bottom Section */}
        <div className="text-center font-century space-y-2 fade-in">
          <p className="text-pl-white/70">
            {t('footer.copyright')}
          </p>
          <p className="text-pl-pink/80 text-sm italic">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  )
}

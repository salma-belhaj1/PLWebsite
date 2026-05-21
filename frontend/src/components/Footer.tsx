export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-pl-black to-pl-black/95 text-pl-white py-16 mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pl-pink/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pl-red/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="slide-in-up group">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl float-animation">❤️</div>
              <h3 className="text-2xl font-stayvibes text-pl-pink group-hover:text-pl-red smooth-transition">Peace & Love</h3>
            </div>
            <p className="font-century text-pl-white/70 leading-relaxed">
              Spreading peace, love, and positivity through beautiful, intentionally crafted products. Each item is a reminder to live mindfully and love deeply.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.instagram.com/peace.love.tn/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-pl-pink hover:scale-110 smooth-transition">📱</a>
              <a href="mailto:pl.tn.contact@gmail.com" className="text-2xl hover:text-pl-pink hover:scale-110 smooth-transition">✉️</a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="slide-in-up" style={{ animationDelay: '100ms' }}>
            <h4 className="text-lg font-stayvibes text-pl-pink mb-6 flex items-center gap-2">
              <span>🔗</span> Quick Links
            </h4>
            <ul className="font-century space-y-3">
              <li>
                <a href="/" className="text-pl-white/70 hover:text-pl-pink hover:translate-x-1 smooth-transition inline-flex items-center gap-2">
                  <span>→</span> Home
                </a>
              </li>
              <li>
                <a href="/shop" className="text-pl-white/70 hover:text-pl-pink hover:translate-x-1 smooth-transition inline-flex items-center gap-2">
                  <span>→</span> Shop
                </a>
              </li>
              <li>
                <a href="/admin" className="text-pl-white/70 hover:text-pl-pink hover:translate-x-1 smooth-transition inline-flex items-center gap-2">
                  <span>→</span> Admin
                </a>
              </li>
              <li>
                <a href="#contact" className="text-pl-white/70 hover:text-pl-pink hover:translate-x-1 smooth-transition inline-flex items-center gap-2">
                  <span>→</span> Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="slide-in-up" style={{ animationDelay: '200ms' }}>
            <h4 className="text-lg font-stayvibes text-pl-pink mb-6 flex items-center gap-2">
              <span>💌</span> Get In Touch
            </h4>
            <div className="font-century space-y-4">
              <div className="group cursor-pointer">
                <p className="text-pl-white/70 group-hover:text-pl-pink smooth-transition">📧 Email</p>
                <a href="mailto:pl.tn.contact@gmail.com" className="text-pl-pink font-semibold hover:underline">
                  pl.tn.contact@gmail.com
                </a>
              </div>
              <div className="group cursor-pointer">
                <p className="text-pl-white/70 group-hover:text-pl-pink smooth-transition">📱 Phone</p>
                <p className="text-pl-pink font-semibold">+216 93 656 789</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-pl-white/70 group-hover:text-pl-pink smooth-transition">📍 Instagram</p>
                <a href="https://www.instagram.com/peace.love.tn/" target="_blank" rel="noopener noreferrer" className="text-pl-pink font-semibold hover:underline">
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
            &copy; 2024 Peace & Love. All rights reserved. | Made with <span className="text-pl-pink">❤️</span> and <span className="text-pl-pink">✨</span>
          </p>
          <p className="text-pl-pink/80 text-sm italic">
            Spreading peace, love, and beautiful things into the world 🕊️
          </p>
        </div>
      </div>
    </footer>
  )
}

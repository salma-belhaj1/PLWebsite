import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import CheckoutFlow from '../components/CheckoutFlow';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-century font-semibold text-pl-pink hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>

        <div className="mb-8 pb-4 border-b border-pl-pink/20">
          <h1 className="text-3xl font-stayvibes text-pl-pink">Complete Your Order</h1>
          <p className={`text-xs font-century mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`}>
            Review your shopping bag and provide delivery information.
          </p>
        </div>

        {cartItems.length === 0 && !checkoutSuccess ? (
          <div className={`p-12 text-center rounded-3xl border ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
          }`}>
            <ShoppingBag className="w-12 h-12 text-pl-pink/40 mx-auto mb-3" />
            <p className="font-stayvibes text-xl text-pl-pink mb-4">Your bag is empty</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-century font-semibold bg-gradient-to-r from-pl-pink to-pl-red text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <CheckoutFlow
            cartItems={cartItems}
            onClose={() => navigate('/shop')}
            onSuccess={() => {
              clearCart();
              setCheckoutSuccess(true);
            }}
          />
        )}
      </main>
    </div>
  );
}

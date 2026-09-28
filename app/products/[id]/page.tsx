'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, getStockStatus } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { products, categories, addToCart, currentUser } = useStore();

  const product = products.find(
    (p) => p.id === resolvedParams.id || p.slug === resolvedParams.id
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Product Not Found</h2>
        <p className="text-stone-500 text-xs">
          The stationery product you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const stockVal = product.stock ?? product.stock_quantity ?? 0;
  const category = categories.find((c) => c.id === product.category_id);
  const stockInfo = getStockStatus(stockVal);

  // Related products in the same category
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_active)
    .slice(0, 4);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > stockVal) return stockVal;
      return next;
    });
  };

  const handleAddToCart = () => {
    // PRD Section 10: Guests cannot add to cart without logging in!
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!stockInfo.isAvailable) return;
    setIsAdding(true);
    const result = addToCart(product, quantity);

    if (result.success) {
      setSuccessMessage(`Added ${quantity} × ${product.name} to your cart!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsAdding(false);
      }, 2500);
    } else {
      if (result.requireAuth) {
        setShowAuthModal(true);
      } else {
        alert(result.message || 'Could not add to cart.');
      }
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900">Products</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/categories`} className="hover:text-amber-800">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-900 truncate font-semibold">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Showcase (PRD Section 4) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-amber-700 text-white text-[11px] font-bold rounded-full shadow uppercase tracking-wider">
                Featured Product
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Stationery Details & Purchasing */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category */}
            {category && (
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
                {category.name}
              </span>
            )}

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price in MMK (PRD Section 29) */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-900">
                {formatMMK(product.price)}
              </span>
              <span className="text-xs text-stone-500">
                (Tax included • Cash on Delivery)
              </span>
            </div>

            {/* Stock Availability Badge (PRD Section 7) */}
            <div className="pt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${stockInfo.badgeClass}`}>
                {stockInfo.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Specifications if present */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Stationery Details
                </h4>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <dt className="text-stone-400 text-[10px] uppercase font-bold">{key}</dt>
                      <dd className="font-semibold text-stone-800">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart Action */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quantity Picker */}
              <div className="flex items-center justify-between border border-stone-200 rounded-2xl bg-stone-50 p-1 w-full sm:w-36">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || !stockInfo.isAvailable}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-xs transition disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-sm text-stone-900 px-3">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stockVal || !stockInfo.isAvailable}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-xs transition disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!stockInfo.isAvailable || isAdding}
                className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {stockInfo.isAvailable
                    ? `Add to Cart • ${formatMMK(product.price * quantity)}`
                    : 'Out of Stock'}
                </span>
              </button>
            </div>

            {/* Delivery Guarantee Notes */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Cash on Delivery across Myanmar</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>100% genuine stationery guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-stone-900">
              More from this category
            </h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              Browse all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* PRD Section 10: Guest Sign-In Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-stone-900">
                Sign In Required
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Please sign in to add items to your cart.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold transition"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

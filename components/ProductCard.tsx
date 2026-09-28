'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Eye, Lock, ArrowRight, X } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatMMK, getStockStatus } from '@/lib/utils';
import { useStore } from '@/lib/store-context';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, categories, currentUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const stockVal = product.stock ?? product.stock_quantity ?? 0;
  const stockInfo = getStockStatus(stockVal);
  const resolvedCategory =
    categoryName ||
    categories.find((c) => c.id === product.category_id)?.name ||
    'Stationery';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // PRD Section 10: Guests cannot add to cart without logging in!
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!stockInfo.isAvailable) return;

    setIsAdding(true);
    const result = addToCart(product, 1);

    if (result.success) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        setIsAdding(false);
      }, 1400);
    } else {
      if (result.requireAuth) {
        setShowAuthModal(true);
      } else {
        alert(result.message || 'Could not add item to cart.');
      }
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-300/80 transition-all duration-300 flex flex-col h-full">
        {/* Product Image Area */}
        <Link
          href={`/products/${product.id}`}
          className="block relative aspect-4/3 overflow-hidden bg-stone-100"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Overlay Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.featured && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-amber-700 text-white rounded-full shadow-sm">
                Featured
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border shadow-xs backdrop-blur-xs ${stockInfo.badgeClass}`}
            >
              {stockInfo.label}
            </span>
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>
        </Link>

        {/* Product Details Area */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category Tag */}
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
            {resolvedCategory}
          </span>

          {/* Title */}
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug mb-2 font-serif"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>

          {/* Price & Action Button (Pinned to Bottom) */}
          <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-stone-400 block font-normal uppercase tracking-wider">
                Price
              </span>
              <span className="text-sm sm:text-base font-bold text-stone-900 font-mono">
                {formatMMK(product.price)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!stockInfo.isAvailable || isAdding || justAdded}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : stockInfo.isAvailable
                  ? 'bg-stone-900 hover:bg-amber-700 text-white active:scale-95'
                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : stockInfo.isAvailable ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
            </button>
          </div>
        </div>
      </div>

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
    </>
  );
}

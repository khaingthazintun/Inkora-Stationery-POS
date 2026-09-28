'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, currentUser } = useStore();

  const deliveryFee = cartTotal >= 15000 || cartTotal === 0 ? 0 : 1500;
  const grandTotal = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200 shadow-2xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Your Cart is Empty
          </h1>
          <p className="text-stone-500 text-xs max-w-md mx-auto">
            You haven&apos;t added any stationery to your bag yet. Explore our curated pens, journals, and supplies!
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-900 text-white font-semibold text-xs rounded-xl hover:bg-amber-700 transition shadow-md"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review your selected stationery before placing your order.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1.5 self-start sm:self-auto font-medium transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Main Cart Grid: Items List + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
          {cart.map((item) => {
            const maxStock = item.product.stock ?? item.product.stock_quantity ?? 0;
            const isAtMax = item.quantity >= maxStock;

            return (
              <div
                key={item.product_id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-stone-50/50 transition"
              >
                {/* Product Thumbnail */}
                <Link
                  href={`/products/${item.product_id}`}
                  className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="text-sm font-semibold text-stone-900 hover:text-amber-800 transition truncate block font-serif"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-mono font-bold text-stone-900 mt-0.5">
                    {formatMMK(item.product.price)}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Available in stock: {maxStock} units
                  </p>
                </div>

                {/* Quantity Controls (PRD Section 11: Validate stock) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                      disabled={isAtMax}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white transition disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="w-24 text-right">
                    <span className="text-xs font-mono font-bold text-stone-900 block">
                      {formatMMK(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove stationery item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-stone-900">
                {formatMMK(cartTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-500">
              <span>Estimated Delivery</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-700 font-bold uppercase text-[10px]">
                  Free Delivery
                </span>
              ) : (
                <span className="font-mono text-stone-900">{formatMMK(deliveryFee)}</span>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-sm font-bold text-stone-900 font-serif">Grand Total</span>
              <span className="text-xl font-bold font-mono text-stone-900">
                {formatMMK(grandTotal)}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 text-right">
              Cash on Delivery (COD)
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={currentUser ? '/checkout' : '/login?redirect=/checkout'}
              className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/products"
              className="w-full py-2.5 px-4 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold transition text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertCircle,
  Banknote,
  ArrowLeft,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/lib/store-context';
import { formatMMK } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, createOrder, currentUser } = useStore();

  const deliveryFee = cartTotal >= 15000 || cartTotal === 0 ? 0 : 1500;
  const grandTotal = cartTotal + deliveryFee;

  const [formData, setFormData] = useState({
    fullName: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    deliveryAddress: currentUser?.address || '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // PRD Section 10: Guests cannot checkout without logging in!
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-stone-900">
            Sign In to Checkout
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please sign in to your Inkora account to enter delivery details and place your order.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login?redirect=/checkout"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Your Cart is Empty</h2>
        <p className="text-stone-500 text-xs">
          You don&apos;t have any stationery items in your cart to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
        >
          <span>Browse Stationery</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your phone number for delivery contact.');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        customer_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        delivery_address: formData.deliveryAddress.trim(),
        notes: formData.notes.trim() || undefined,
        payment_method: 'cod',
      });

      if (result.success && result.order) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        router.push(`/orders/${result.order.id}`);
      } else {
        setErrorMessage(result.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-medium">
          <Link href="/cart" className="hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
          Order Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Complete your delivery details. Cash on Delivery across Myanmar.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Information & Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base font-bold font-serif text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>1. Delivery Information</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Full Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Su Myat Noe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Phone Number (for Courier Call) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09 798 123 456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Complete Delivery Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Apartment/House #, Street name, Ward, Township, City (e.g. Kamayut, Yangon)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Please call before delivery, leave with reception"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card (PRD Section 12: Cash on Delivery Only) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
            <h2 className="text-base font-bold font-serif text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-700" />
              <span>2. Payment Method</span>
            </h2>

            {/* Cash on Delivery Only */}
            <div className="p-4 rounded-2xl border-2 border-amber-600 bg-amber-50/50 flex items-start gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked
                readOnly
                className="mt-1 accent-amber-700"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Only Accepted Method
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pay cash directly to the delivery courier when your stationery parcel arrives at your doorstep. No prepayment required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Preview & Confirm Button */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
            Order Review ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h2>

          {/* Items mini list */}
          <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-100 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-stone-900 block truncate">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {item.quantity} &times; {formatMMK(item.product.price)}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-stone-900 shrink-0">
                  {formatMMK(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Math */}
          <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-stone-900">
                {formatMMK(cartTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-500">
              <span>Standard Delivery</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-700 font-bold uppercase text-[10px]">
                  Free Delivery
                </span>
              ) : (
                <span className="font-mono text-stone-900">{formatMMK(deliveryFee)}</span>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-sm font-bold text-stone-900 font-serif">Total Due</span>
              <span className="text-xl font-bold font-mono text-stone-900">
                {formatMMK(grandTotal)}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 text-right">
              To be collected via Cash on Delivery
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <span>Place Order with Cash on Delivery</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

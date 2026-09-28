'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  PenTool,
  BookOpen,
  GraduationCap,
  Briefcase,
  Highlighter,
  Truck,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { products, categories } = useStore();

  const featuredProducts = products.filter((p) => p.is_active && p.featured).slice(0, 8);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'writing':
        return <PenTool className="w-5 h-5 text-amber-700" />;
      case 'notebooks':
        return <BookOpen className="w-5 h-5 text-amber-800" />;
      case 'school-supplies':
        return <GraduationCap className="w-5 h-5 text-amber-900" />;
      case 'office-supplies':
        return <Briefcase className="w-5 h-5 text-stone-700" />;
      case 'art-supplies':
        return <Highlighter className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section matching PRD Section 5 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-stone-50/40 to-transparent pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200/70 text-amber-900 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Inkora Mini Stationery Store</span>
              </div>

              {/* Tagline required by PRD Section 5 */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 font-serif leading-[1.15]">
                Everything you need for school, university and{' '}
                <span className="text-amber-800">
                  everyday work
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Discover smooth Japanese gel pens, durable spiral notebooks, pastel highlighters, and desk organization essentials. Fast delivery with <strong>Cash on Delivery (COD)</strong> anywhere in Myanmar.
              </p>

              {/* Shop Now Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-900 text-white font-bold text-sm hover:bg-amber-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/categories"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white text-stone-800 font-semibold text-sm hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Categories</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Curated Japanese Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Same-Day Packing</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/3 rounded-3xl overflow-hidden border border-stone-200/80 shadow-2xl bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80"
                    alt="Inkora Stationery Essentials"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating Highlight Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-xl hidden sm:flex items-center gap-3.5 max-w-xs animate-in slide-in-from-bottom-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Student &amp; Desk Essentials</p>
                    <p className="text-[11px] text-stone-500">Starting from only 1,000 MMK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section (PRD Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-stone-700 hover:text-amber-800 transition flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all group flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-amber-50 group-hover:scale-105 transition flex items-center justify-center shrink-0">
                {getCategoryIcon(category.slug)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition font-serif line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section (PRD Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              Featured Stationery
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-stone-700 hover:text-amber-800 transition flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Simple CTA Section (PRD Section 5) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-14 text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-bold font-serif max-w-xl mx-auto leading-tight">
            Find your everyday essentials.
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
            From precision drafting pens to fountain pen friendly journals, elevate your desk and study routine today.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              <span>Explore the Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

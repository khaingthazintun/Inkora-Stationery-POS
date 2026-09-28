'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import ProductGrid from '@/components/ProductGrid';

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { categories, products } = useStore();

  const category = categories.find(
    (c) => c.slug === resolvedParams.slug || c.id === resolvedParams.slug
  );

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Category Not Found</h2>
        <p className="text-stone-500 text-sm">
          The category you are looking for does not exist or has been modified.
        </p>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </Link>
      </div>
    );
  }

  const categoryProducts = products.filter(
    (p) => p.category_id === category.id && p.is_active
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-stone-900">Categories</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">{category.name}</span>
      </div>

      {/* Category Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 to-stone-800 text-white p-8 sm:p-12 shadow-sm">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif">
            {category.name}
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            {category.description || `Browse all top-rated stationery items in ${category.name}.`}
          </p>
          <p className="text-xs text-amber-400 font-medium pt-1">
            {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} available in stock
          </p>
        </div>
      </div>

      {/* Product List */}
      <main>
        <ProductGrid
          products={categoryProducts}
          emptyMessage={`Currently no stationery items listed under ${category.name}.`}
        />
      </main>
    </div>
  );
}

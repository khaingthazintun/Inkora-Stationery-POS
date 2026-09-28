'use client';

import React from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyMessage = 'No stationery products found matching your criteria.',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-stone-800 mb-1">
          No Products Found
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
          {emptyMessage}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
        >
          View All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

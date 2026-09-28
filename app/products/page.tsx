'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import ProductGrid from '@/components/ProductGrid';
import { Search, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, categories } = useStore();

  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync category changes
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    router.replace(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setMaxPrice(20000);
    setInStockOnly(false);
    router.replace('/products');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.is_active)
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(query);
          const matchesDesc = p.description.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        // Stock filter
        const currentStock = p.stock ?? p.stock_quantity ?? 0;
        if (inStockOnly && currentStock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default 'featured'
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, categories, selectedCategory, searchQuery, maxPrice, inStockOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-medium">
          <span>Home</span>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Stationery Products</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Stationery Catalog
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Showing {filteredProducts.length} of {products.filter((p) => p.is_active).length} items
            </p>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
            >
              <option value="featured">Sort: Featured Picks</option>
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Controls Sidebar */}
        <aside className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 font-semibold text-sm text-stone-900">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Filter Stationery</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-400 hover:text-amber-600 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              Search by Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pen, notebook, stapler..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories List Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              Categories
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-amber-100/70 text-amber-900 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>All Departments</span>
                <span className="text-[10px] text-stone-400">
                  {products.filter((p) => p.is_active).length}
                </span>
              </button>

              {categories
                .filter((c) => c.is_active)
                .map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id && p.is_active).length;
                  const isSelected =
                    selectedCategory === cat.slug || selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-100/70 text-amber-900 font-semibold'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[10px] text-stone-400">{count}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-stone-700 uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-bold text-amber-800">
                {maxPrice.toLocaleString()} MMK
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>1,000 MMK</span>
              <span>20,000 MMK</span>
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>In Stock Only (exclude sold out)</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          <ProductGrid
            products={filteredProducts}
            emptyMessage={
              searchQuery
                ? `No products found matching "${searchQuery}". Try a different keyword or resetting your filters.`
                : 'No stationery items found for the selected filters.'
            }
          />
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

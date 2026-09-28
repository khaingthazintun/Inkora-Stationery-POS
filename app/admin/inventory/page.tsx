'use client';

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { Product } from '@/lib/types';
import { formatMMK, getStockStatus } from '@/lib/utils';

export default function AdminInventoryPage() {
  const {
    products,
    categories,
    updateProductStock,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [quickStockId, setQuickStockId] = useState<string | null>(null);
  const [quickStockVal, setQuickStockVal] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalItems = products.length;
    const outOfStock = products.filter((p) => (p.stock ?? p.stock_quantity ?? 0) === 0).length;
    const lowStock = products.filter((p) => {
      const s = p.stock ?? p.stock_quantity ?? 0;
      return s > 0 && s <= 10;
    }).length;
    const healthyStock = products.filter((p) => (p.stock ?? p.stock_quantity ?? 0) > 10).length;

    return { totalItems, outOfStock, lowStock, healthyStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const s = p.stock ?? p.stock_quantity ?? 0;
        if (filterMode === 'out' && s !== 0) return false;
        if (filterMode === 'low' && (s <= 0 || s > 10)) return false;
        if (filterMode === 'healthy' && s <= 10) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const sA = a.stock ?? a.stock_quantity ?? 0;
        const sB = b.stock ?? b.stock_quantity ?? 0;
        return sA - sB;
      });
  }, [products, filterMode, search]);

  const handleUpdateStock = async (id: string, newStock: number, name: string) => {
    await updateProductStock(id, newStock);
    setQuickStockId(null);
    setNotification(`Stock for "${name}" updated to ${newStock} units`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Stationery Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Monitor real-time warehouse stock, track low supplies, and record restocks.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
        >
          <span>Manage Product Catalog</span>
        </Link>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Inventory KPI Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setFilterMode('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterMode === 'all'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
            All Products
          </span>
          <span className="text-2xl font-bold font-serif">{stats.totalItems}</span>
        </button>

        <button
          onClick={() => setFilterMode('low')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterMode === 'low'
              ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-amber-700">
              Low Stock (&le; 10)
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-serif text-amber-900">{stats.lowStock}</span>
        </button>

        <button
          onClick={() => setFilterMode('out')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterMode === 'out'
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-rose-700">
            Out of Stock
          </span>
          <span className="text-2xl font-bold font-serif text-rose-800">{stats.outOfStock}</span>
        </button>

        <button
          onClick={() => setFilterMode('healthy')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterMode === 'healthy'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-emerald-700">
            Healthy Stock (&gt; 10)
          </span>
          <span className="text-2xl font-bold font-serif text-emerald-800">{stats.healthyStock}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory by stationery item name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-900"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Inventory Table matching PRD Section 21 */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Stationery Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const stockVal = p.stock ?? p.stock_quantity ?? 0;
                const stockStatus = getStockStatus(stockVal);
                const categoryName =
                  categories.find((c) => c.id === p.category_id)?.name || 'Stationery';

                const isEditingThis = quickStockId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-stone-900 block line-clamp-1">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            ID: {p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {categoryName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {formatMMK(p.price)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isEditingThis ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={quickStockVal}
                            onChange={(e) => setQuickStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 px-2 py-1 text-xs border border-amber-400 rounded-lg text-center font-mono font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateStock(p.id, quickStockVal, p.name)}
                            className="px-2 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setQuickStockId(null)}
                            className="px-2 py-1 bg-stone-100 text-stone-500 rounded-lg text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuickStockId(p.id);
                            setQuickStockVal(stockVal);
                          }}
                          className="font-mono font-bold text-sm text-stone-800 hover:text-amber-700 underline decoration-dotted transition"
                          title="Click to edit stock quantity directly"
                        >
                          {stockVal} units
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stockStatus.badgeClass}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStock(p.id, stockVal + 10, p.name)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-semibold transition"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p.id, stockVal + 25, p.name)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold transition"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p.id, stockVal + 50, p.name)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

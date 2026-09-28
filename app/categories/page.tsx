'use client';

import React from 'react';
import Link from 'next/link';
import {
  PenTool,
  BookOpen,
  Highlighter,
  Pencil,
  Ruler,
  Folder,
  GraduationCap,
  Briefcase,
  StickyNote,
  Eraser,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

export default function CategoriesPage() {
  const { categories, products } = useStore();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pens':
        return <PenTool className="w-6 h-6 text-amber-600" />;
      case 'pencils':
        return <Pencil className="w-6 h-6 text-indigo-600" />;
      case 'notebooks':
        return <BookOpen className="w-6 h-6 text-emerald-600" />;
      case 'markers':
        return <Highlighter className="w-6 h-6 text-rose-600" />;
      case 'paper':
        return <StickyNote className="w-6 h-6 text-yellow-600" />;
      case 'erasers':
        return <Eraser className="w-6 h-6 text-cyan-600" />;
      case 'rulers':
        return <Ruler className="w-6 h-6 text-teal-600" />;
      case 'folders':
        return <Folder className="w-6 h-6 text-sky-600" />;
      case 'school-supplies':
        return <GraduationCap className="w-6 h-6 text-orange-600" />;
      case 'office-supplies':
        return <Briefcase className="w-6 h-6 text-stone-700" />;
      default:
        return <Sparkles className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-medium">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Categories</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900">
          Stationery Departments
        </h1>
        <p className="text-stone-500 text-sm mt-1 max-w-xl">
          Browse through our carefully organized stationery categories — from everyday writing instruments to desk filing systems.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const categoryProducts = products.filter(
            (p) => p.category_id === cat.id && p.is_active
          );
          const previewProducts = categoryProducts.slice(0, 3);

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-50 transition-all">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                    {categoryProducts.length} items
                  </span>
                </div>

                <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-amber-700 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'Quality curated stationery accessories and tools.'}
                </p>

                {/* Micro previews */}
                {previewProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      Popular in this category:
                    </span>
                    <ul className="text-xs text-stone-600 space-y-1">
                      {previewProducts.map((p) => (
                        <li key={p.id} className="truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="truncate">{p.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-4 flex items-center text-xs font-semibold text-amber-600 group-hover:text-amber-700 gap-1">
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

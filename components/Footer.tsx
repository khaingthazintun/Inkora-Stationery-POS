'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Truck, ShieldCheck, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      {/* Features Value Strip */}
      <div className="border-b border-stone-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery</h4>
              <p className="text-xs text-stone-400">Pay safely when you receive your order</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Curated Quality</h4>
              <p className="text-xs text-stone-400">Authentic pens, paper &amp; office supplies</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Fast Dispatch</h4>
              <p className="text-xs text-stone-400">Same-day packing &amp; delivery nationwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Stationery Lovers</h4>
              <p className="text-xs text-stone-400">Thoughtfully made for students &amp; professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-serif font-bold text-lg">
                I
              </div>
              <span className="text-xl font-bold font-serif text-white tracking-tight">
                Inkora
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Your neighborhood mini stationery store. Everything you need for school, university, creative art, and everyday work.
            </p>
            <p className="text-xs text-stone-500">
              Payments: <strong>Cash on Delivery (COD)</strong> throughout Myanmar.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Shop Departments
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/products?category=cat-writing" className="hover:text-amber-400 transition">
                  Writing &amp; Pens
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-notebooks" className="hover:text-amber-400 transition">
                  Notebooks &amp; Journals
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-school" className="hover:text-amber-400 transition">
                  School Supplies
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-office" className="hover:text-amber-400 transition">
                  Office Supplies
                </Link>
              </li>
              <li>
                <Link href="/products?category=cat-art" className="hover:text-amber-400 transition">
                  Art Supplies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/products" className="hover:text-amber-400 transition">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-amber-400 transition">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition">
                  Sign In (Admin / Demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} Inkora Mini Stationery Store. All rights reserved.</p>
          <p className="font-mono text-[11px]">Powered by Next.js &amp; Supabase</p>
        </div>
      </div>
    </footer>
  );
}

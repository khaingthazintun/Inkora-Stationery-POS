'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Folder,
  Boxes,
  ShoppingBag,
  BarChart3,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { isAdminEmail } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, isInitialized, logout } = useStore();

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || (!isAdmin && !isAdminEmail(currentUser.email))) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname) + '&adminRequired=true');
      }
    }
  }, [isInitialized, currentUser, isAdmin, pathname, router]);

  // Essential admin navigation items matching PRD Section 15 & 30
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Folder },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3, highlight: true },
  ];

  if (!isInitialized || !currentUser || (!isAdmin && !isAdminEmail(currentUser.email))) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold font-serif text-stone-900">
            Admin Verification Required
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            This management console is restricted to Inkora administrators. Please sign in with <code>admin@example.com</code>.
          </p>
          <Link
            href="/login?redirect=/admin&adminRequired=true"
            className="block w-full py-2.5 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-5 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Inkora Console
              </span>
            </div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Admin Workspace
            </h2>
            <p className="text-[11px] text-stone-400">
              Stationery Operations &amp; Analytics
            </p>
          </div>

          {/* Navigation Items (PRD Section 30) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-stone-900 text-white font-bold shadow-xs'
                      : item.highlight
                      ? 'text-amber-900 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-950 font-bold border border-amber-200/50'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                      Report
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-stone-900 block truncate">
                {currentUser.full_name || 'Admin'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <Link
              href="/"
              className="py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-center font-semibold transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-600 text-center font-semibold transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

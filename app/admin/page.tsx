'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  DollarSign,
  Boxes,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function AdminDashboardPage() {
  const { dashboardStats, orders, products, updateProductStock } = useStore();

  const recentOrders = orders.slice(0, 5);
  const lowStockItems = products.filter((p) => (p.stock ?? p.stock_quantity ?? 0) <= 10);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Store Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Current business metrics and real-time stationery store status.
          </p>
        </div>

        {/* Action Button: Jump to Star Feature (Reports) */}
        <Link
          href="/admin/reports"
          className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Detailed Sales Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Summary Cards (PRD Section 16) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Sales
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            {formatMMK(dashboardStats.totalSales)}
          </div>
          <p className="text-[10px] text-stone-400">All customer orders to date</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {dashboardStats.totalOrders}
          </div>
          <p className="text-[10px] text-stone-400">Completed &amp; pending orders</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Products
            </span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {dashboardStats.totalProducts}
          </div>
          <p className="text-[10px] text-stone-400">Stationery catalog items</p>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Low Stock
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`text-2xl font-bold font-serif ${dashboardStats.lowStockCount > 0 ? 'text-rose-600' : 'text-stone-900'}`}>
            {dashboardStats.lowStockCount}
          </div>
          <p className="text-[10px] text-stone-400">&le; 10 units remaining</p>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Low Stock Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                Recent Orders
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Latest customer stationery transactions
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Total</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 font-mono font-bold text-stone-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3 text-stone-700">
                        {ord.customer_name}
                      </td>
                      <td className="py-3 text-stone-400 text-[11px]">
                        {formatDate(ord.created_at)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-stone-900">
                        {formatMMK(ord.total_amount)}
                      </td>
                      <td className="py-3 text-center">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Inventory
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                All stationery inventory is at healthy levels!
              </div>
            ) : (
              lowStockItems.slice(0, 5).map((item) => {
                const stockVal = item.stock ?? item.stock_quantity ?? 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-amber-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-semibold text-stone-900 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-rose-700 font-bold">
                          {stockVal === 0 ? 'Out of stock' : `${stockVal} left in stock`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => updateProductStock(item.id, stockVal + 25)}
                      className="px-2.5 py-1 bg-white hover:bg-stone-900 hover:text-white border border-stone-200 text-stone-800 rounded-lg text-[10px] font-bold shadow-2xs transition shrink-0"
                    >
                      +25 Restock
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

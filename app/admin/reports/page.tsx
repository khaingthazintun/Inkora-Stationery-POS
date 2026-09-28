'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, formatDate } from '@/lib/utils';
import { Order, OrderItem } from '@/lib/types';

export default function AdminReportsPage() {
  const { orders, products, categories, reloadFromSupabase, isLiveSupabase } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState<'this-month' | 'last-month' | 'all-time' | 'custom'>('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await reloadFromSupabase();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter Orders based on selected date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);

      if (dateFilter === 'this-month') {
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() === currentMonth
        );
      }

      if (dateFilter === 'last-month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return (
          orderDate.getFullYear() === lastMonthYear &&
          orderDate.getMonth() === lastMonth
        );
      }

      if (dateFilter === 'custom') {
        if (customStartDate && orderDate < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
        return true;
      }

      return true; // all-time
    });
  }, [orders, dateFilter, customStartDate, customEndDate]);

  // Dynamic Report Calculations (PRD Section 17 & 37)
  const reportSummary = useMemo(() => {
    let totalSales = 0;
    let unitsSold = 0;

    filteredOrders.forEach((ord) => {
      totalSales += ord.total_amount;
      (ord.items || []).forEach((item) => {
        unitsSold += item.quantity;
      });
    });

    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

    return {
      totalSales,
      orderCount,
      unitsSold,
      avgOrderValue,
    };
  }, [filteredOrders]);

  // Aggregate Sales by Product (PRD Section 18 & 19)
  const productSalesReport = useMemo(() => {
    // Map productId -> { unitsSold, revenue }
    const productStats: Record<string, { unitsSold: number; revenue: number }> = {};

    filteredOrders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = { unitsSold: 0, revenue: 0 };
        }
        productStats[item.product_id].unitsSold += item.quantity;
        productStats[item.product_id].revenue += item.subtotal;
      });
    });

    // Combine with all active products so admin sees stock and zero-sales items too
    return products.map((prod) => {
      const stats = productStats[prod.id] || { unitsSold: 0, revenue: 0 };
      const categoryName =
        categories.find((c) => c.id === prod.category_id)?.name || 'General';
      const currentStock = prod.stock ?? prod.stock_quantity ?? 0;

      return {
        product: prod,
        categoryName,
        unitsSold: stats.unitsSold,
        revenue: stats.revenue,
        currentStock,
        isLowStock: currentStock <= 10,
      };
    });
  }, [filteredOrders, products, categories]);

  // Top Selling Products (Sorted by units sold DESC)
  const topSellingProducts = useMemo(() => {
    return [...productSalesReport]
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [productSalesReport]);

  const maxUnitsSold = useMemo(() => {
    if (topSellingProducts.length === 0) return 1;
    return Math.max(...topSellingProducts.map((p) => p.unitsSold));
  }, [topSellingProducts]);

  // Daily Sales Visualization Data
  const salesByDate = useMemo(() => {
    const dayMap: Record<string, { date: string; amount: number; orderCount: number }> = {};

    filteredOrders.forEach((ord) => {
      const dateKey = new Date(ord.created_at).toISOString().split('T')[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { date: dateKey, amount: 0, orderCount: 0 };
      }
      dayMap[dateKey].amount += ord.total_amount;
      dayMap[dateKey].orderCount += 1;
    });

    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const maxDailyRevenue = useMemo(() => {
    if (salesByDate.length === 0) return 1;
    return Math.max(...salesByDate.map((d) => d.amount));
  }, [salesByDate]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Page Purpose */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Real Sales Analytics &amp; Inventory Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Sales &amp; Revenue Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Answers: <strong className="text-stone-700">&ldquo;What stationery products are selling, how much are we selling, and what needs restocking?&rdquo;</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Sync Supabase</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selection Tabs (PRD Section 17) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs font-semibold text-stone-700">Time Range:</span>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setDateFilter('this-month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'this-month'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('last-month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'last-month'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setDateFilter('all-time')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'all-time'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'custom'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs w-full md:w-auto animate-in fade-in">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-700 bg-stone-50 text-xs"
            />
            <span className="text-stone-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-700 bg-stone-50 text-xs"
            />
          </div>
        )}

        <div className="text-xs text-stone-500 self-end md:self-center">
          Active Orders Evaluated: <strong className="text-stone-900">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* KPI Cards: Dynamic Real Report Metrics (PRD Section 17) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Sales
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            {formatMMK(reportSummary.totalSales)}
          </div>
          <p className="text-[11px] text-stone-400">
            Sum of subtotal revenue
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Number of Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            {reportSummary.orderCount}
          </div>
          <p className="text-[11px] text-stone-400">
            Orders in selected timeframe
          </p>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Units Sold
            </span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-amber-800">
            {reportSummary.unitsSold}
          </div>
          <p className="text-[11px] text-stone-400">
            Total stationery items dispatched
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Average Order Value
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900">
            {formatMMK(reportSummary.avgOrderValue)}
          </div>
          <p className="text-[11px] text-stone-400">
            Revenue per customer purchase
          </p>
        </div>
      </div>

      {/* TOP-SELLING PRODUCTS & VISUAL BAR CHART (PRD Section 18 & 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <span>Top-Selling Products</span>
                <span className="text-xs font-normal text-stone-500 font-sans">
                  (Ranked by units sold)
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Which products sold the most and generated the highest revenue?
              </p>
            </div>
            {topSellingProducts[0] && (
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold shrink-0">
                #1 {topSellingProducts[0].product.name}
              </span>
            )}
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No product sales recorded in this date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Rank</th>
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5 text-right">Units Sold</th>
                    <th className="py-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {topSellingProducts.map((item, idx) => (
                    <tr key={item.product.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 font-mono font-bold text-stone-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-stone-900 block line-clamp-1">
                              {item.product.name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {item.categoryName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-amber-900 font-mono text-sm">
                        {item.unitsSold}
                      </td>
                      <td className="py-3 text-right font-bold text-stone-900 font-mono">
                        {formatMMK(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visual Bar Chart: Units Sold Comparison (PRD Section 20) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-700" />
              <span>Volume Comparison</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Proportional units sold per top item
            </p>
          </div>

          <div className="space-y-4 my-auto pt-2">
            {topSellingProducts.map((item) => {
              const percentage = Math.round((item.unitsSold / maxUnitsSold) * 100);
              return (
                <div key={item.product.id} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="font-semibold truncate max-w-[180px]">
                      {item.product.name}
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      {item.unitsSold} units
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[9px] text-white font-bold"
                      style={{ width: `${Math.max(12, percentage)}%` }}
                    >
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-[11px] text-stone-500">
            Calculated in real-time from Supabase orders and order items snapshot.
          </div>
        </div>
      </div>

      {/* SALES TIMELINE VISUALIZATION (PRD Section 20) */}
      {salesByDate.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                Sales Trend Over Time
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Daily transaction volume and revenue graph
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              Peak: {formatMMK(maxDailyRevenue)}
            </span>
          </div>

          <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-stone-200 overflow-x-auto">
            {salesByDate.map((day) => {
              const heightPct = Math.round((day.amount / maxDailyRevenue) * 100);
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[48px] flex flex-col items-center gap-1.5 group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow">
                    {formatMMK(day.amount)} ({day.orderCount} orders)
                  </div>

                  <div className="w-full bg-stone-100 hover:bg-stone-200 rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-amber-600 group-hover:bg-amber-700 transition-all rounded-t-md"
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {day.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL PRODUCT SALES & INVENTORY REPORT TABLE (PRD Section 19) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900">
            Comprehensive Product Sales &amp; Inventory Report
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Combined overview of product sales performance alongside current inventory levels.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Product</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Units Sold</th>
                <th className="py-2.5 text-right">Total Revenue</th>
                <th className="py-2.5 text-right">Current Stock</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {productSalesReport.map((item) => (
                <tr key={item.product.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 block line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {formatMMK(item.product.price)} each
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-stone-600 font-medium">
                    {item.categoryName}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-stone-900">
                    {item.unitsSold}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-stone-900">
                    {formatMMK(item.revenue)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-stone-700">
                    {item.currentStock}
                  </td>
                  <td className="py-3 text-center">
                    {item.currentStock <= 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                        Out of Stock
                      </span>
                    ) : item.isLowStock ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Restock Needed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

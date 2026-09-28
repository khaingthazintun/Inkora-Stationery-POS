'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  ArrowRight,
  Clock,
  Calendar,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function OrdersPage() {
  const { orders, currentUser } = useStore();

  // PRD Section 10: Guests cannot access orders
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-stone-900">
            Sign In Required
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please sign in to view your stationery orders and tracking timeline.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login?redirect=/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Show orders placed by current user
  const customerOrders = orders.filter(
    (o) =>
      currentUser.role === 'admin' ||
      o.user_id === currentUser.id ||
      o.customer_name.toLowerCase() === (currentUser.full_name || '').toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-medium">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">My Orders</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Track the status of your past and active stationery deliveries.
        </p>
      </div>

      {customerOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-stone-800 mb-1">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
            When you checkout stationery items, your invoices and tracking timeline will appear here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-700 rounded-xl transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Order identifier & date */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-bold font-serif text-stone-900">
                    {order.order_number}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{formatDate(order.created_at)}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Payment: <strong className="uppercase text-stone-700">Cash on Delivery (COD)</strong>
                  </span>
                </div>

                {/* Items preview */}
                <div className="pt-2 text-xs text-stone-600">
                  <span className="text-stone-400 block mb-1">Items in this order:</span>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item) => (
                      <span
                        key={item.id}
                        className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px]"
                      >
                        {item.quantity} &times; {item.product_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount & action */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold font-mono text-stone-900">
                    {formatMMK(order.total_amount)}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 rounded-xl text-xs font-semibold transition"
                >
                  <span>Order Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

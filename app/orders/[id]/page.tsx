'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Truck,
  Package,
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ArrowLeft,
  Clock,
  Printer,
  Sparkles,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, formatDate, getOrderStatusConfig } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { getOrderById } = useStore();

  const order = getOrderById(resolvedParams.id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Order Not Found</h2>
        <p className="text-stone-500 text-xs">
          We could not find an order matching identifier #{resolvedParams.id}.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  // Pipeline steps from PRD Section 13: Pending -> Processing -> Completed
  const steps: { key: string; label: string; icon: any }[] = [
    { key: 'pending', label: 'Order Placed (Pending)', icon: Clock },
    { key: 'processing', label: 'Processing & Packed', icon: RefreshCw },
    { key: 'completed', label: 'Completed (Delivered)', icon: CheckCircle },
  ];

  const currentStepConfig = getOrderStatusConfig(order.status);
  const currentStepIndex = currentStepConfig.stepIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 print:p-0">
      {/* Top Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order History</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Confirmation Hero Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-8">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Inkora Order Confirmation
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {formatDate(order.created_at)}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Current Status
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Visual Progress Stepper (Only for active non-cancelled orders) */}
        {order.status !== 'cancelled' ? (
          <div className="py-2">
            <div className="grid grid-cols-3 gap-2 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-amber-700 text-white shadow-md ring-4 ring-amber-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold block ${isCurrent ? 'text-amber-900 font-bold' : isPassed ? 'text-stone-900' : 'text-stone-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">This order was cancelled</strong>
              <span>Items have been released back to available inventory.</span>
            </div>
          </div>
        )}

        {/* Two-Column Details: Shipping & Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100 text-xs">
          {/* Left: Customer & Address */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">
              Delivery Information
            </h3>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-2.5">
              <div className="flex items-center gap-2 text-stone-800 font-semibold">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 font-mono">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{order.delivery_address || order.address}</span>
              </div>
              {order.notes && (
                <div className="pt-2 border-t border-stone-200 text-stone-500 italic">
                  &ldquo;{order.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-1">
              <span className="font-bold text-amber-950 block text-[11px]">
                Payment Method: Cash on Delivery (COD)
              </span>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Please prepare the exact cash amount ({formatMMK(order.total_amount)}) for the courier upon parcel arrival.
              </p>
            </div>
          </div>

          {/* Right: Items Purchased */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">
              Ordered Stationery Items
            </h3>
            <div className="divide-y divide-stone-100 bg-stone-50 p-4 rounded-2xl border border-stone-100 max-h-64 overflow-y-auto">
              {(order.items || []).map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    )}
                    <div className="overflow-hidden">
                      <span className="font-semibold text-stone-900 block truncate">
                        {item.product_name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.quantity} &times; {formatMMK(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900 shrink-0">
                    {formatMMK(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Math */}
            <div className="bg-stone-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Total Amount Due
                </span>
                <span className="text-xl font-bold font-mono">
                  {formatMMK(order.total_amount)}
                </span>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold uppercase">
                COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

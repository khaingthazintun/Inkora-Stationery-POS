'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { formatMMK, formatDate } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
          Order Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review customer orders, check stationery items, and update fulfillment statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-900"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filter Tabs (PRD Section 24) */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Pending ({orders.filter((o) => o.status.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              statusFilter === 'processing'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Processing ({orders.filter((o) => o.status.toLowerCase() === 'processing').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Completed ({orders.filter((o) => o.status.toLowerCase() === 'completed' || o.status.toLowerCase() === 'delivered').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Cancelled ({orders.filter((o) => o.status.toLowerCase() === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Orders Table matching PRD Section 24 */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const itemsCount = (ord.items || []).reduce(
                    (sum, it) => sum + it.quantity,
                    0
                  );

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-900 block">
                          {ord.customer_name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {ord.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                        {formatDate(ord.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 text-sm">
                        {formatMMK(ord.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={ord.status.toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(ord.id, e.target.value as OrderStatus)
                          }
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-stone-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Order Details
                </span>
                <h2 className="text-lg font-bold font-serif text-stone-900">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Delivery Information */}
            <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">Customer:</span>
                <strong className="text-stone-900">{selectedOrder.customer_name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">Phone:</span>
                <span className="font-mono text-stone-800">{selectedOrder.phone}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-stone-400 font-medium shrink-0">Address:</span>
                <span className="text-right text-stone-800">{selectedOrder.delivery_address || selectedOrder.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">Payment:</span>
                <span className="font-semibold text-emerald-700 uppercase text-[11px]">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                Purchased Stationery Items
              </h3>
              <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {it.image_url && (
                        <img
                          src={it.image_url}
                          alt={it.product_name}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-stone-900 block truncate">
                          {it.product_name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {it.quantity} &times; {formatMMK(it.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-900 shrink-0">
                      {formatMMK(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change & Total */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Total Amount
                </span>
                <span className="text-xl font-bold font-mono text-stone-900">
                  {formatMMK(selectedOrder.total_amount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Status:</span>
                <select
                  value={selectedOrder.status.toLowerCase()}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedOrder.id,
                      e.target.value as OrderStatus
                    )
                  }
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

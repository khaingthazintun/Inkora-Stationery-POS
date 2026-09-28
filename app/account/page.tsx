'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  ShoppingBag,
  LogOut,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, logout, orders } = useStore();

  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Sign In Required</h2>
        <p className="text-stone-500 text-sm">
          Please log in to manage your customer account and view saved delivery details.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition"
        >
          <span>Go to Login</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      updated_at: new Date().toISOString(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const userOrders = orders.filter(
    (o) =>
      o.user_id === currentUser.id ||
      o.customer_name.toLowerCase() === currentUser.full_name.toLowerCase()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Customer Account
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your personal profile and default shipping address.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1.5 self-start sm:self-auto font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card / Overview */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl border-2 border-amber-200 font-serif">
            {currentUser.full_name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-lg font-bold text-stone-900">{currentUser.full_name}</h2>
            <p className="text-xs text-stone-400">{currentUser.email}</p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 capitalize border border-stone-200">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Role: {currentUser.role}</span>
            </span>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2">
            <Link
              href="/orders"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 border border-stone-200 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>View Past Orders ({userOrders.length})</span>
            </Link>

            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-200 transition"
              >
                <span>Store Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* Edit Details Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-2 border-b border-stone-100">
            Edit Profile & Delivery Details
          </h2>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Your profile information has been saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Email address is linked to your authentication login.
              </span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="09 798 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Default Delivery Address</span>
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, township, and city"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center gap-2 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

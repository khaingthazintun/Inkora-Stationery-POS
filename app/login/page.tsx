'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  ArrowRight,
  Mail,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const isAdminRequired = searchParams.get('adminRequired') === 'true';

  const { login, register } = useStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Main Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDemoNotice(null);
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isRegisterMode) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const res = await register({
          email: cleanEmail,
          fullName,
          phone,
          password: password || 'Password123!',
        });
        if (res.success) {
          if (res.role === 'admin' || cleanEmail === 'admin@example.com') {
            router.push('/admin');
          } else {
            router.push(redirectUrl || '/');
          }
        } else {
          setError(res.error || 'Failed to create account');
          setIsSubmitting(false);
        }
      } else {
        const res = await login(cleanEmail, password);
        if (res.success) {
          if (res.role === 'admin' || cleanEmail === 'admin@example.com') {
            router.push(redirectUrl.startsWith('/admin') ? redirectUrl : '/admin');
          } else {
            router.push(redirectUrl || '/');
          }
        } else {
          setError(res.error || 'Invalid credentials');
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
      setIsSubmitting(false);
    }
  };

  // PRD Section 9: Quick Demo Login Handlers
  const handleQuickDemoAdmin = async () => {
    setError(null);
    setDemoNotice('Signing in as Admin...');
    setIsSubmitting(true);
    const adminEmail = 'admin@example.com';
    const adminPass = 'Admin123!';

    setEmail(adminEmail);
    setPassword(adminPass);

    try {
      const res = await login(adminEmail, adminPass, 'admin');
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Failed to sign in demo admin.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Admin sign in failed');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoCustomer = async () => {
    setError(null);
    setDemoNotice('Signing in as Customer...');
    setIsSubmitting(true);
    const custEmail = 'customer@example.com';
    const custPass = 'Customer123!';

    setEmail(custEmail);
    setPassword(custPass);

    try {
      const res = await login(custEmail, custPass, 'customer');
      if (res.success) {
        router.push(redirectUrl || '/');
      } else {
        setError(res.error || 'Failed to sign in demo customer.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Customer sign in failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-serif font-bold text-xl shadow">
            I
          </div>
          <span className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Inkora
          </span>
        </Link>
        <h1 className="text-xl font-bold font-serif text-stone-900 pt-1">
          {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-stone-500">
          {isRegisterMode
            ? 'Sign up to place stationery orders and track deliveries'
            : 'Sign in to Inkora'}
        </p>
      </div>

      {/* Admin Required Alert banner */}
      {isAdminRequired && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Admin Privileges Required</strong>
            <span>
              The route you requested is restricted. Please click <strong>[ Admin ]</strong> below for instant access.
            </span>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Tab switch between Sign In and Register */}
        <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              !isRegisterMode
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              isRegisterMode
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {demoNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600 animate-spin" />
            <span>{demoNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegisterMode && (
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Su Myat Noe"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                />
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 text-xs"
              />
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09 798 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* PRD Section 8 & 9: QUICK DEMO ACCESS SECTION */}
        <div className="pt-2 space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-stone-400 whitespace-nowrap">
              Quick Demo Access
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Demo Admin Button */}
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              disabled={isSubmitting}
              className="group p-3 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-300 transition-all text-left space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Admin
                </span>
                <span className="text-[10px] text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80 font-mono truncate">
                admin@example.com
              </p>
            </button>

            {/* Demo Customer Button */}
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              disabled={isSubmitting}
              className="group p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-all text-left space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                  Customer
                </span>
                <span className="text-[10px] text-stone-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <p className="text-[10px] text-stone-600 font-mono truncate">
                customer@example.com
              </p>
            </button>
          </div>

          <p className="text-[10px] text-center text-stone-400 leading-relaxed">
            One-click fills credentials, signs in, and redirects automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-stone-500 text-xs">
          Loading authentication...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

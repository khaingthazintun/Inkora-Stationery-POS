'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900">
          Get in Touch
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Have questions about specific pens, bulk stationery orders, or Cash on Delivery? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <h2 className="text-lg font-bold font-serif text-stone-900">
            Store Information
          </h2>

          <div className="space-y-4 text-xs text-stone-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Storefront &amp; Dispatch:</strong>
                <span>No. 42, Inya Road, Kamayut Township, Yangon, Myanmar</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Phone Support:</strong>
                <span>+95 9 798 123 456 / +95 9 977 888 999</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Email:</strong>
                <span>support@inkora.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Operating Hours:</strong>
                <span>Monday – Saturday: 9:00 AM – 7:00 PM (Closed Sundays)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold font-serif text-stone-900">
            Send Us a Note
          </h2>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your message has been sent to our stationery team.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Su Myat Noe"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Email or Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@example.com or 09xxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  How can we help?
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Inquire about stationery items, stock availability, or delivery details..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

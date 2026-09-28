import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShieldCheck, Truck, BookOpen, PenTool } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>About Inkora Stationery</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900">
          The Inkora Story
        </h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto">
          Built with care for students, educators, and creators who appreciate smooth ink, bleed-resistant notebooks, and organized desks.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden aspect-21/9 bg-stone-100 border border-stone-200 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80"
          alt="Inkora Stationery Workshop"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-6 text-sm text-stone-600 leading-relaxed">
        <h2 className="text-xl font-bold font-serif text-stone-900">
          Our Philosophy
        </h2>
        <p>
          In a world of glowing digital screens, tactile writing tools give our minds space to pause, reflect, and organize. We founded <strong>Inkora</strong> to bring high quality, smudge-resistant, thoughtfully designed stationery within easy reach.
        </p>
        <p>
          Whether you are a university student preparing for examinations, a journal enthusiast keeping bullet spreads, or an office professional who appreciates a perfectly balanced drafting pencil, our catalog is curated with strict attention to paper weight, ink consistency, and everyday reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <PenTool className="w-6 h-6 text-amber-700" />
          <h3 className="font-bold text-stone-900 text-sm">Tested Ink Flow</h3>
          <p className="text-xs text-stone-500">Every pen is verified for consistent, skip-free glide on everyday paper.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <BookOpen className="w-6 h-6 text-amber-800" />
          <h3 className="font-bold text-stone-900 text-sm">Bleed-Resistant Paper</h3>
          <p className="text-xs text-stone-500">80 GSM to 160 GSM paper that holds ink and pastel highlighters cleanly.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <Truck className="w-6 h-6 text-indigo-600" />
          <h3 className="font-bold text-stone-900 text-sm">Nationwide COD</h3>
          <p className="text-xs text-stone-500">Pay safely in cash when your delivery parcel arrives at your door.</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Laptop, ShieldCheck, HelpCircle, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="text-slate-300 text-xs mt-12">
      {/* Amazon-style Back to Top bar */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 text-center font-bold text-xs transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        <span>Back to top</span>
      </button>

      {/* Main Footer Links */}
      <div className="bg-[#232f3e] py-10 border-b border-slate-700">
        <div className="container-custom grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/marketplace" className="hover:underline">About TechCompanion</a></li>
              <li><a href="/marketplace" className="hover:underline">Verified Hardware Standards</a></li>
              <li><a href="/compare" className="hover:underline">AI Comparison Engine</a></li>
              <li><a href="/marketplace" className="hover:underline">Refurbished Device Festival</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Shop Departments</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/marketplace?category=laptop" className="hover:underline">Coding & Work Laptops</a></li>
              <li><a href="/marketplace?category=camera" className="hover:underline">Mirrorless & 4K Cameras</a></li>
              <li><a href="/marketplace?category=gaming_device" className="hover:underline">Gaming Consoles & Gear</a></li>
              <li><a href="/marketplace?sort=price_asc" className="hover:underline">Today's Deals</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Sell on TechCompanion</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/seller/create-listing" className="hover:underline">List Preowned Device</a></li>
              <li><a href="/seller/dashboard" className="hover:underline">Seller Hub & Diagnostics</a></li>
              <li><a href="/register" className="hover:underline">Seller Protection Program</a></li>
              <li><a href="/marketplace" className="hover:underline">Fulfillment by TechCompanion</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Let Us Help You</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/buyer/dashboard" className="hover:underline">Your Account</a></li>
              <li><a href="/buyer/viewings" className="hover:underline">Returns & Viewings</a></li>
              <li><a href="/compare" className="hover:underline">Side-by-Side Spec Comparison</a></li>
              <li><a href="/buyer/shortlist" className="hover:underline">Shortlist / Wishlist</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#131921] py-6 text-center text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-sm">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-500 to-[#febd69] text-slate-950 flex items-center justify-center font-black text-xs">
            <Laptop className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span>TechCompanion<span className="text-[#febd69]">.in</span></span>
        </div>
        <div className="text-[11px] text-slate-400">
          © 2026 TechCompanion.in, Inc. or its affiliates. All diagnostic benchmarks verified against manufacturer technical manuals.
        </div>
      </div>
    </footer>
  );
}

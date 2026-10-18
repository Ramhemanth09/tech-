import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Battery,
  ShieldCheck,
  AlertCircle,
  Star,
  Check,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export function ListingCard({ listing, onShortlistChange }) {
  const { user, setShortlistCount } = useAuth();
  const navigate = useNavigate();
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const toggleShortlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      alert('Please log in with a buyer account to shortlist devices.');
      return;
    }

    try {
      setLoadingAction(true);
      const res = await api.post('/api/buyer/shortlists', { listingId: listing.id });
      if (res.success) {
        setIsShortlisted(res.data.action === 'added');
        setShortlistCount(res.data.total);
        if (onShortlistChange) onShortlistChange();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const isLaptop = listing.category === 'laptop';
  const batteryHealth = listing.specifications?.batteryHealthPercent;
  const isBatteryDisclosed = batteryHealth !== null && batteryHealth !== undefined;

  // Approximate MRP and discount for Amazon-style pricing display
  const askingPrice = listing.askingPrice || 35000;
  const originalMrp = Math.round((askingPrice * 1.38) / 100) * 100;
  const discountPct = Math.round(((originalMrp - askingPrice) / originalMrp) * 100);

  const handleQuickCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(
      `/compare?category=${listing.category}&budget=${askingPrice + 10000}&prompt=${encodeURIComponent(
        `Compare ${listing.brand} ${listing.modelName || listing.title} with similar preowned ${listing.category}s`
      )}&autoRun=true`
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 p-4 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative">
      {/* Top Badge: Choice / Verified */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {listing.evidenceStatus === 'verified' ? (
          <span className="bg-[#131921] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <span className="text-[#febd69]">TechCompanion's</span>
            <span>Choice</span>
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
            <span>Seller Declared</span>
          </span>
        )}

        {/* Shortlist Heart Button */}
        {user?.role === 'buyer' && (
          <button
            onClick={toggleShortlist}
            disabled={loadingAction}
            aria-label="Add to shortlist"
            className={`p-1.5 rounded-full border transition-all ${
              isShortlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current text-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/listings/${listing.id}`} className="block relative h-44 mb-3 overflow-hidden rounded bg-slate-50 flex items-center justify-center">
        <img
          src={
            listing.images?.[0] ||
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop'
          }
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase backdrop-blur-xs">
          {listing.generalCondition?.replace('_', ' ')}
        </span>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand & City */}
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
            {listing.brand} • {listing.location?.city || 'Bangalore'}
          </div>

          {/* Product Title (Amazon style) */}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            <Link to={`/listings/${listing.id}`} className="no-underline text-inherit">
              {listing.title}
            </Link>
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <div className="flex text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
            </div>
            <span className="text-blue-700 font-semibold text-[11px]">4.6</span>
            <span className="text-slate-400 text-[11px]">(128)</span>
          </div>

          {/* Key Specs Pills */}
          <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
            {listing.specifications?.ramGb > 0 && (
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                {listing.specifications.ramGb}GB RAM
              </span>
            )}
            {listing.specifications?.storageGb > 0 && (
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                {listing.specifications.storageGb}GB {listing.specifications.storageType || 'SSD'}
              </span>
            )}
            {listing.specifications?.cpu && (
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                {listing.specifications.cpu.split(' ').slice(0, 3).join(' ')}
              </span>
            )}
          </div>
        </div>

        {/* Battery Disclosure & Diagnostic Status */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          {isLaptop && (
            <div>
              {isBatteryDisclosed ? (
                <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Battery Health: <strong>{batteryHealth}%</strong> (Diagnosed)</span>
                </div>
              ) : (
                <div className="text-[11px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Battery: <strong>Undisclosed</strong> (Not tested)</span>
                </div>
              )}
            </div>
          )}

          {/* Price Formatting (Amazon style) */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-slate-700 font-semibold">₹</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {askingPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{originalMrp.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-red-600">
                ({discountPct}% off)
              </span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
              <span className="text-blue-700 font-bold">✓ Verified</span>
              <span>• FREE Delivery / Viewing in Bangalore</span>
            </div>
          </div>

          {/* Action Buttons: Compare & Details */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={handleQuickCompare}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 border border-slate-300 transition-colors"
              title="Compare side-by-side with similar tech"
            >
              <Scale className="w-3 h-3 text-slate-600" />
              <span>Compare</span>
            </button>

            <Link
              to={`/listings/${listing.id}`}
              className="flex-1 bg-[#febd69] hover:bg-[#f3a847] text-slate-950 text-xs font-bold py-1.5 px-2 rounded text-center transition-colors shadow-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '../../services/api.js';
import { ListingCard } from '../../components/listings/ListingCard.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRam, setMinRam] = useState(searchParams.get('minRam') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Keep state in sync with URL searchParams (e.g. if user searches from navbar)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRam) params.set('minRam', minRam);
      if (condition) params.set('condition', condition);
      if (sort) params.set('sort', sort);

      setSearchParams(params, { replace: true });

      const res = await api.get(`/api/listings?${params.toString()}`);
      if (res.success) {
        setListings(res.data || []);
        setTotalCount(res.meta?.total || (res.data ? res.data.length : 0));
      }
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, minPrice, maxPrice, minRam, condition, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRam('');
    setCondition('');
    setSort('newest');
  };

  return (
    <div className="bg-[#eaeded] min-h-screen py-5">
      <div className="container-custom space-y-4">
        {/* Amazon-style Results Header Bar */}
        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500">Showing </span>
            <span className="font-bold text-slate-900">1-{listings.length}</span>
            <span className="text-slate-500"> of </span>
            <span className="font-bold text-slate-900">{totalCount} results</span>
            {category && (
              <span className="ml-2 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                {category}
              </span>
            )}
            {search && (
              <span className="ml-2 text-slate-700 italic">
                for <span className="font-bold text-slate-900">"{search}"</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Amazon Filter Strip */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-amber-500 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="">All Categories</option>
            <option value="laptop">Laptops</option>
            <option value="camera">Cameras</option>
            <option value="gaming_device">Gaming Consoles</option>
          </select>

          {/* Condition Filter */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-amber-500 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="">Any Condition</option>
            <option value="like_new">Like New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>

          {/* Min RAM Filter */}
          <select
            value={minRam}
            onChange={(e) => setMinRam(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-amber-500 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="">Any RAM</option>
            <option value="8">Min 8 GB</option>
            <option value="16">Min 16 GB</option>
            <option value="32">Min 32 GB</option>
          </select>

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-28 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-amber-500 bg-slate-50"
          />

          <button
            onClick={clearFilters}
            className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1 font-semibold transition-colors ml-auto"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <LoadingSkeleton count={6} className="h-80" />
        ) : listings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
            <p className="text-xs text-slate-500">
              No devices match your current filters. Try expanding your search or clearing price limits.
            </p>
            <button onClick={clearFilters} className="bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold px-4 py-2 rounded text-xs">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

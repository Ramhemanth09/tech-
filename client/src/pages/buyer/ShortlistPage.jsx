import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ListingCard } from '../../components/listings/ListingCard.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';

export function ShortlistPage() {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/buyer/shortlist');
      if (res.success) {
        setShortlist(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlist();
  }, []);

  return (
    <div className="container-custom py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" /> My Saved Shortlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare and manage devices you have flagged for evaluation.
          </p>
        </div>

        {shortlist.length >= 2 && (
          <Link
            to="/compare"
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm font-bold"
          >
            <Sparkles className="w-4 h-4" /> Compare Shortlisted Devices
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} className="h-64" />
      ) : shortlist.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your shortlist is empty</h3>
          <p className="text-xs text-slate-500">
            Browse active listings in the marketplace and click the heart icon to save devices here.
          </p>
          <Link to="/marketplace" className="btn btn-primary text-xs">Explore Tech Marketplace</Link>
        </div>
      ) : (
        <div className="grid-cols-auto-fit">
          {shortlist.map((item) => (
            <ListingCard
              key={item._id || item.id}
              listing={{ ...item, id: item._id || item.id }}
              onShortlistChange={fetchShortlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

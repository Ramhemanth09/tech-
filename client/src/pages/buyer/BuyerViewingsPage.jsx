import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export function BuyerViewingsPage() {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViewings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/buyer/viewings');
      if (res.success) {
        setViewings(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewings();
  }, []);

  const handleCancel = async (viewingId) => {
    if (!window.confirm('Are you sure you want to cancel this viewing appointment?')) return;
    try {
      const res = await api.patch(`/api/buyer/viewings/${viewingId}/status`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by buyer',
      });
      if (res.success) {
        fetchViewings();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container-custom py-8 space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" /> Physical Inspection Viewings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review appointment slots requested with sellers before making a purchasing decision.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading viewing appointments...</div>
      ) : viewings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Viewings Scheduled</h3>
          <p className="text-xs text-slate-500">
            When you find a device on the marketplace, click "Request Inspection Viewing" to meet the seller.
          </p>
          <Link to="/marketplace" className="btn btn-primary text-xs">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {viewings.map((v) => (
            <div key={v._id} className="tech-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`badge uppercase text-[10px] ${
                    v.status === 'confirmed' ? 'badge-verified' :
                    v.status === 'declined' || v.status === 'cancelled' ? 'badge-warning' :
                    'badge-neutral'
                  }`}>
                    {v.status}
                  </span>
                  <span className="text-xs font-bold text-blue-600">
                    Listing ID: {v.listingRef?._id}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  <Link to={`/listings/${v.listingRef?._id}`} className="hover:underline">
                    {v.listingRef?.title}
                  </Link>
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Slot: {new Date(v.requestedSlot).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {v.locationPreference}
                  </span>
                </div>

                {v.notes && (
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                    Notes: "{v.notes}"
                  </div>
                )}
              </div>

              {v.status === 'requested' && (
                <div>
                  <button
                    onClick={() => handleCancel(v._id)}
                    className="btn btn-outline text-rose-600 hover:bg-rose-50 text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

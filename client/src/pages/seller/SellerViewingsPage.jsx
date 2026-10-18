import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Check, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';

export function SellerViewingsPage() {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViewings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/seller/viewings');
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

  const handleUpdateStatus = async (viewingId, status) => {
    try {
      const res = await api.patch(`/api/buyer/viewings/${viewingId}/status`, { status });
      if (res.success) {
        fetchViewings();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" /> Viewing Appointments
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, confirm or decline buyer inspection slots for your listings.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : viewings.length === 0 ? (
        <div className="tech-card p-12 text-center text-xs text-slate-500">
          No viewing appointments requested for your devices yet.
        </div>
      ) : (
        <div className="space-y-4">
          {viewings.map((v) => (
            <div key={v._id} className="tech-card p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 text-sm">
                  {v.listingRef?.title}
                </span>
                <span className={`badge uppercase text-[10px] ${
                  v.status === 'confirmed' ? 'badge-verified' :
                  v.status === 'declined' ? 'badge-warning' : 'badge-neutral'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Slot: {new Date(v.requestedSlot).toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Location: {v.locationPreference}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded text-slate-700">
                <span className="font-bold">Buyer:</span> {v.buyerRef?.name} ({v.buyerRef?.email})
                {v.notes && <div className="mt-1 text-slate-500">"{v.notes}"</div>}
              </div>

              {v.status === 'requested' && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(v._id, 'declined')}
                    className="btn btn-outline text-rose-600 hover:bg-rose-50 text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(v._id, 'confirmed')}
                    className="btn btn-primary text-xs py-1.5 px-4 flex items-center gap-1 font-bold"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirm Appointment
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

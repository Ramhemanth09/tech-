import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageSquare, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ListingCard } from '../../components/listings/ListingCard.jsx';

export function BuyerDashboardPage() {
  const { user } = useAuth();
  const [shortlist, setShortlist] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [shortlistRes, viewingsRes] = await Promise.all([
          api.get('/api/buyer/shortlist'),
          api.get('/api/buyer/viewings'),
        ]);

        if (shortlistRes.success) setShortlist(shortlistRes.data || []);
        if (viewingsRes.success) setViewings(viewingsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="container-custom py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-xs text-blue-100 max-w-lg">
            Manage your shortlisted devices, scheduled viewing appointments, and grounded AI comparisons.
          </p>
        </div>
        <Link to="/compare" className="btn bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold py-2.5 px-4 shadow-sm self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-blue-600" /> Run Comparison Agent
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/buyer/shortlist" className="tech-card p-5 no-underline text-inherit hover:border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold">Saved Shortlist</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{shortlist.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
        </Link>

        <Link to="/buyer/viewings" className="tech-card p-5 no-underline text-inherit hover:border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold">Viewing Appointments</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{viewings.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <Link to="/compare" className="tech-card p-5 no-underline text-inherit hover:border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold">AI Decision Engine</div>
              <div className="text-sm font-bold text-blue-600 mt-2 flex items-center gap-1">
                Open Matrix <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Viewings Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Device Viewings
          </h2>
          <Link to="/buyer/viewings" className="text-xs text-blue-600 font-bold hover:underline">
            View All
          </Link>
        </div>

        {viewings.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">
            No inspection viewings requested yet. You can request a slot directly on any active listing page.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {viewings.slice(0, 3).map((v) => (
              <div key={v._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{v.listingRef?.title}</div>
                  <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {new Date(v.requestedSlot).toLocaleString()} • Location: {v.locationPreference}
                  </div>
                </div>
                <span className={`badge ${v.status === 'confirmed' ? 'badge-verified' : 'badge-neutral'} uppercase text-[10px]`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shortlist Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Recently Shortlisted Devices
          </h2>
          <Link to="/buyer/shortlist" className="text-xs text-blue-600 font-bold hover:underline">
            Manage Shortlist
          </Link>
        </div>

        {shortlist.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No devices saved in your shortlist. Explore the marketplace to bookmark devices.
          </div>
        ) : (
          <div className="grid-cols-auto-fit">
            {shortlist.slice(0, 3).map((item) => (
              <ListingCard key={item._id || item.id} listing={{ ...item, id: item._id || item.id }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, MessageSquare, Calendar, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function SellerDashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        setLoading(true);
        const [listingsRes, questionsRes, viewingsRes] = await Promise.all([
          api.get('/api/seller/listings'),
          api.get('/api/seller/questions'),
          api.get('/api/seller/viewings'),
        ]);

        if (listingsRes.success) setListings(listingsRes.data || []);
        if (questionsRes.success) setQuestions(questionsRes.data || []);
        if (viewingsRes.success) setViewings(viewingsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSellerData();
  }, []);

  const pendingQuestions = questions.filter((q) => !q.answerText);
  const pendingViewings = viewings.filter((v) => v.status === 'requested');

  return (
    <div className="container-custom py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Seller Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your hardware inventory, buyer inquiries, and viewing appointments.
          </p>
        </div>

        <Link
          to="/seller/create-listing"
          className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm font-bold"
        >
          <PlusCircle className="w-4 h-4" /> Create New Listing
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="tech-card p-5">
          <div className="text-xs text-slate-500 font-semibold">Total Listings</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{listings.length}</div>
        </div>

        <div className="tech-card p-5">
          <div className="text-xs text-slate-500 font-semibold">Pending Questions</div>
          <div className={`text-2xl font-extrabold mt-1 ${pendingQuestions.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {pendingQuestions.length}
          </div>
        </div>

        <div className="tech-card p-5">
          <div className="text-xs text-slate-500 font-semibold">Viewing Inquiries</div>
          <div className={`text-2xl font-extrabold mt-1 ${pendingViewings.length > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
            {pendingViewings.length}
          </div>
        </div>

        <div className="tech-card p-5">
          <div className="text-xs text-slate-500 font-semibold">Reputation Score</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {user?.reputationScore > 0 ? `${user.reputationScore} / 5.0` : 'New Seller'}
          </div>
        </div>
      </div>

      {/* Listings Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> My Device Listings
          </h2>
          <span className="text-xs text-slate-500">{listings.length} devices</span>
        </div>

        {listings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <p>You have not published any device listings yet.</p>
            <Link to="/seller/create-listing" className="btn btn-primary text-xs">
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 pl-6">Device</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Asking Price</th>
                  <th className="p-3">Lifecycle Status</th>
                  <th className="p-3">Evidence</th>
                  <th className="p-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/60">
                    <td className="p-3 pl-6">
                      <div className="font-bold text-slate-900">{l.title}</div>
                      <div className="text-[11px] text-slate-400">{l.brand} {l.modelName}</div>
                    </td>
                    <td className="p-3 uppercase text-[11px] font-semibold text-slate-600">
                      {l.category.replace('_', ' ')}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      ₹{l.askingPrice?.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`badge uppercase text-[10px] ${
                        l.status === 'active' ? 'badge-verified' :
                        l.status === 'submitted' ? 'badge-neutral bg-amber-50 text-amber-800' :
                        l.status === 'suspended' ? 'badge-warning' :
                        'badge-neutral'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-[10px] ${l.evidenceStatus === 'verified' ? 'badge-verified' : 'badge-unverified'}`}>
                        {l.evidenceStatus}
                      </span>
                    </td>
                    <td className="p-3 pr-6 text-right space-x-2">
                      <Link
                        to={`/seller/listings/${l._id}/evidence`}
                        className="btn btn-secondary text-[11px] py-1 px-2"
                      >
                        Evidence
                      </Link>
                      <Link
                        to={`/seller/listings/${l._id}/edit`}
                        className="btn btn-outline text-[11px] py-1 px-2"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/listings/${l._id}`}
                        className="btn btn-outline text-[11px] py-1 px-2 text-blue-600"
                        title="View Public Card"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Questions Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Buyer Questions ({pendingQuestions.length} pending)
            </h3>
            <Link to="/seller/questions" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          {pendingQuestions.length === 0 ? (
            <div className="text-xs text-slate-500 py-3">All buyer questions have been answered.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {pendingQuestions.slice(0, 3).map((q) => (
                <div key={q._id} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="font-semibold text-slate-800">{q.questionText}</div>
                  <div className="text-[10px] text-slate-400 mt-1">On: {q.listingRef?.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Viewings Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> Viewing Requests ({pendingViewings.length} pending)
            </h3>
            <Link to="/seller/viewings" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          {pendingViewings.length === 0 ? (
            <div className="text-xs text-slate-500 py-3">No pending viewing appointments.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {pendingViewings.slice(0, 3).map((v) => (
                <div key={v._id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">{new Date(v.requestedSlot).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">By: {v.buyerRef?.name}</div>
                  </div>
                  <Link to="/seller/viewings" className="btn btn-primary text-[10px] py-1 px-2">Respond</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

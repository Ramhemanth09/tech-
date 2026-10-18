import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, History, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';

export function ModeratorDashboardPage() {
  const [submittedQueue, setSubmittedQueue] = useState([]);
  const [reportedQueue, setReportedQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const [submittedRes, reportedRes] = await Promise.all([
        api.get('/api/moderator/queue/submitted'),
        api.get('/api/moderator/queue/reported'),
      ]);

      if (submittedRes.success) setSubmittedQueue(submittedRes.data || []);
      if (reportedRes.success) setReportedQueue(reportedRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  return (
    <div className="container-custom py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Authorized Moderator Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Moderation Review & Audit Hub</h1>
        </div>

        <Link
          to="/moderator/audit"
          className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
        >
          <History className="w-4 h-4 text-slate-600" /> View Immutable Audit Log
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tech-card p-5 border-l-4 border-l-blue-600">
          <div className="text-xs text-slate-500 font-semibold">Submitted Listings Awaiting Review</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{submittedQueue.length}</div>
        </div>

        <div className="tech-card p-5 border-l-4 border-l-rose-500">
          <div className="text-xs text-slate-500 font-semibold">User Reports Pending Investigation</div>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">{reportedQueue.length}</div>
        </div>
      </div>

      {/* Queue 1: Submitted Listings for Review */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Pending Approval Queue ({submittedQueue.length})
          </h2>
          <span className="text-xs text-slate-500">First In, First Out</span>
        </div>

        {submittedQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No submitted listings currently waiting for moderation.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {submittedQueue.map((item) => (
              <div key={item._id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                  <div className="text-slate-500">
                    Category: <span className="font-semibold uppercase">{item.category}</span> • Asking Price: ₹{item.askingPrice?.toLocaleString()} • Seller: {item.sellerRef?.name}
                  </div>
                </div>
                <Link
                  to={`/moderator/inspect/${item._id}`}
                  className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold"
                >
                  Inspect & Decide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue 2: Reported Listings Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Flagged / Reported Listings ({reportedQueue.length})
          </h2>
          <span className="text-xs text-slate-500">Requires Audit Investigation</span>
        </div>

        {reportedQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active buyer reports pending.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {reportedQueue.map((report) => (
              <div key={report._id} className="p-4 px-6 flex items-center justify-between hover:bg-rose-50/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning text-[10px] uppercase font-bold">
                      {report.reason?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400">Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {report.listingRef?.title || 'Listing'}
                  </div>
                  <div className="text-slate-600 italic">
                    Buyer Note: "{report.details}"
                  </div>
                </div>
                <Link
                  to={`/moderator/inspect/${report.listingRef?._id}?reportId=${report._id}`}
                  className="btn btn-outline text-rose-700 hover:bg-rose-50 text-xs py-1.5 px-3 flex items-center gap-1 font-bold"
                >
                  Investigate Report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

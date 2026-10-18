import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export function ModeratorAuditPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/moderator/audit-history');
        if (res.success) {
          setEvents(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditHistory();
  }, []);

  return (
    <div className="container-custom py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link to="/moderator/dashboard" className="text-xs text-blue-600 flex items-center gap-1 mb-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Moderator Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" /> Immutable Moderation Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete, tamper-resistant trail of all listing approvals, rejections, evidence verifications, and suspensions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading audit records...</div>
      ) : events.length === 0 ? (
        <div className="tech-card p-12 text-center text-xs text-slate-500">
          No moderation events recorded yet.
        </div>
      ) : (
        <div className="tech-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 pl-6">Timestamp</th>
                <th className="p-3">Moderator</th>
                <th className="p-3">Target Device</th>
                <th className="p-3">Decision Taken</th>
                <th className="p-3 pr-6">Reason / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((e) => (
                <tr key={e._id} className="hover:bg-slate-50/50">
                  <td className="p-3 pl-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                    {e.moderatorRef?.name || 'Moderator'}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    {e.listingRef?.title || 'Listing'}
                  </td>
                  <td className="p-3">
                    <span className={`badge uppercase text-[10px] ${
                      e.decision === 'approved' || e.decision === 'evidence_verified' ? 'badge-verified' :
                      e.decision === 'suspended' || e.decision === 'rejected' ? 'badge-warning' : 'badge-neutral'
                    }`}>
                      {e.decision}
                    </span>
                  </td>
                  <td className="p-3 pr-6 text-slate-700 leading-snug">
                    {e.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

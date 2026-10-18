import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, FileText, Lock, Eye } from 'lucide-react';
import { api } from '../../services/api.js';
import { SpecTable } from '../../components/listings/SpecTable.jsx';

export function ModeratorReviewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState('approved');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/moderator/inspect/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [id]);

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      alert('You must provide a clear audit justification (min 5 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/api/moderator/listings/${id}/moderation`, {
        decision,
        reason: reason.trim(),
        reportId: reportId || undefined,
      });

      if (res.success) {
        alert(`Moderation action '${decision}' recorded in the immutable audit log.`);
        navigate('/moderator/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container-custom py-16 text-center text-xs text-slate-500">Loading inspection vault...</div>;
  }

  if (error || !data) {
    return <div className="container-custom py-16 text-center text-xs text-rose-600">{error || 'Inspection data unavailable'}</div>;
  }

  const { listing, evidenceRecords = [], reports = [], pastAuditEvents = [] } = data;

  return (
    <div className="container-custom py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link to="/moderator/dashboard" className="text-xs text-blue-600 flex items-center gap-1 mb-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Moderator Queue
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" /> Moderator Inspection & Decision Console
          </h1>
        </div>
        <span className={`badge uppercase text-xs ${listing.status === 'active' ? 'badge-verified' : 'badge-neutral'}`}>
          Current: {listing.status}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Reported Concern Banner if viewing a report */}
      {reports.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Active User Flagged Inconsistencies ({reports.length}):
          </div>
          {reports.map((r) => (
            <div key={r._id} className="p-2.5 bg-white/80 rounded border border-rose-100">
              <span className="font-semibold text-rose-950 uppercase text-[10px]">{r.reason.replace(/_/g, ' ')}:</span>
              <p className="text-slate-700 mt-0.5">"{r.details}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Device Specifications Overview */}
      <div className="space-y-4">
        <div className="tech-card p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">{listing.title}</h2>
          <div className="text-xs text-slate-600">
            Seller: <span className="font-semibold">{listing.sellerRef?.name}</span> ({listing.sellerRef?.email}) • Asking Price: ₹{listing.askingPrice?.toLocaleString()}
          </div>
          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold">Seller Condition Statement:</span> {listing.detailedConditionDescription}
          </div>
        </div>

        <SpecTable listing={listing} />
      </div>

      {/* Private Evidence Vault Documents for Moderator Inspection */}
      <div className="tech-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" /> Authorized Private Evidence Inspection
          </h2>
          <span className="text-[11px] text-slate-400">Moderator Protected View</span>
        </div>

        {evidenceRecords.length === 0 ? (
          <div className="text-xs text-slate-500 py-2">
            No private evidence documents uploaded by seller for this listing.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {evidenceRecords.map((doc) => (
              <div key={doc._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{doc.originalFileName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Type: <span className="capitalize">{doc.documentType.replace('_', ' ')}</span> • Full Serial: <code className="font-mono bg-slate-200 px-1 rounded">{doc.fullSerialNumber || 'N/A'}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge uppercase text-[10px] ${doc.verificationStatus === 'verified' ? 'badge-verified' : 'badge-unverified'}`}>
                    {doc.verificationStatus}
                  </span>
                  <a
                    href={`/api/evidence/${doc._id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View File
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Form */}
      <form onSubmit={handleSubmitDecision} className="tech-card p-6 space-y-4 text-xs border-amber-200 bg-amber-50/20">
        <h2 className="text-sm font-bold text-slate-900">Record Moderation Decision</h2>
        <p className="text-slate-600 text-[11px]">
          All decisions are recorded with your moderator ID, timestamp, and explanation in an append-only audit trail.
        </p>

        <div>
          <label className="form-label">Action / Decision</label>
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="form-select text-xs font-semibold"
          >
            <option value="approved">Approve & Publish to Active Marketplace</option>
            <option value="evidence_verified">Verify Submitted Evidence (Mark Documents as Verified)</option>
            <option value="suspended">Suspend Listing (Halt Inquiries and Viewings)</option>
            <option value="rejected">Reject Listing (Send back to seller)</option>
            <option value="evidence_rejected">Reject Evidence Documents as Insufficient/Unverifiable</option>
          </select>
        </div>

        <div>
          <label className="form-label">Auditable Justification / Explanation</label>
          <textarea
            required
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Document reasoning: e.g. Validated Dell ePSA battery health report matching declared 84% capacity."
            className="form-textarea text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Link to="/moderator/dashboard" className="btn btn-secondary text-xs">Cancel</Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary text-xs py-2 px-5 font-bold shadow-sm"
          >
            {submitting ? 'Recording Audit Event...' : 'Record Decision in Audit Log'}
          </button>
        </div>
      </form>
    </div>
  );
}

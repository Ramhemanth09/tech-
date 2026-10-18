import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [title, setTitle] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [generalCondition, setGeneralCondition] = useState('good');
  const [detailedConditionDescription, setDetailedConditionDescription] = useState('');
  const [knownDefects, setKnownDefects] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/listings/${id}`);
        if (res.success) {
          const l = res.data;
          setListing(l);
          setTitle(l.title);
          setAskingPrice(l.askingPrice);
          setGeneralCondition(l.generalCondition);
          setDetailedConditionDescription(l.detailedConditionDescription);
          setKnownDefects(l.knownDefects?.join(', ') || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError(null);

    try {
      const res = await api.patch(`/api/listings/${id}`, {
        title,
        askingPrice: Number(askingPrice),
        generalCondition,
        detailedConditionDescription,
        knownDefects: knownDefects ? knownDefects.split(',').map((s) => s.trim()) : [],
      });

      if (res.success) {
        setMessage('Listing changes saved successfully.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSaving(true);
      const res = await api.post(`/api/listings/${id}/submit`);
      if (res.success) {
        setMessage('Listing submitted for moderator approval!');
        setListing((prev) => ({ ...prev, status: 'submitted' }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this listing from the active marketplace?')) return;
    try {
      setSaving(true);
      const res = await api.post(`/api/listings/${id}/withdraw`);
      if (res.success) {
        setMessage('Listing withdrawn.');
        setListing((prev) => ({ ...prev, status: 'withdrawn' }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container-custom py-16 text-center text-xs text-slate-500">Loading listing...</div>;
  }

  return (
    <div className="container-custom py-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link to="/seller/dashboard" className="text-xs text-blue-600 flex items-center gap-1 mb-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Listing</h1>
        </div>
        <span className={`badge uppercase text-xs ${listing?.status === 'active' ? 'badge-verified' : 'badge-neutral'}`}>
          Status: {listing?.status}
        </span>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Lifecycle Actions Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-800">Lifecycle Action:</span>
          <div className="text-[11px] text-slate-500">
            {listing?.status === 'draft' ? 'Draft ready to be submitted for review.' :
             listing?.status === 'submitted' ? 'Currently under moderator inspection.' :
             listing?.status === 'active' ? 'Active on marketplace.' : 'Listing inactive.'}
          </div>
        </div>

        <div className="flex gap-2">
          {listing?.status === 'draft' && (
            <button
              onClick={handleSubmitForReview}
              disabled={saving}
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              Submit for Review
            </button>
          )}

          {listing?.status === 'active' && (
            <button
              onClick={handleWithdraw}
              disabled={saving}
              className="btn btn-danger text-xs py-1.5 px-3"
            >
              Withdraw Listing
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="tech-card p-6 space-y-4 text-xs">
        <div>
          <label className="form-label">Headline / Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label">Asking Price (₹)</label>
          <input
            type="number"
            required
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label">General Condition Rating</label>
          <select
            value={generalCondition}
            onChange={(e) => setGeneralCondition(e.target.value)}
            className="form-select text-xs"
          >
            <option value="like_new">Like New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="form-label">Detailed Condition Notes</label>
          <textarea
            rows="3"
            required
            value={detailedConditionDescription}
            onChange={(e) => setDetailedConditionDescription(e.target.value)}
            className="form-textarea text-xs"
          />
        </div>

        <div>
          <label className="form-label">Known Defects / Flaws</label>
          <input
            type="text"
            value={knownDefects}
            onChange={(e) => setKnownDefects(e.target.value)}
            className="form-input text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Link to={`/seller/listings/${id}/evidence`} className="btn btn-secondary text-xs">
            Manage Evidence Documents
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary text-xs font-bold">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

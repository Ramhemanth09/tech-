import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  Calendar,
  MessageSquare,
  Heart,
  Flag,
  User,
  CheckCircle,
  Wrench,
  Battery,
  AlertTriangle,
  Clock,
  MapPin,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SpecTable } from '../../components/listings/SpecTable.jsx';

export function ListingDetailPage() {
  const { id } = useParams();
  const { user, setShortlistCount } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction Modals
  const [questionModal, setQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);

  const [viewingModal, setViewingModal] = useState(false);
  const [viewingSlot, setViewingSlot] = useState('');
  const [viewingLocation, setViewingLocation] = useState('Public Tech Cafe / Verifiable Public Meeting Spot');
  const [viewingNotes, setViewingNotes] = useState('');

  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('misleading_specifications');
  const [reportDetails, setReportDetails] = useState('');

  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  useEffect(() => {
    fetchListing();
    fetchQuestions();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/listings/${id}`);
      if (res.success) {
        setListing(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/api/buyer/listings/${id}/questions`);
      if (res.success) {
        setQuestions(res.data || []);
      }
    } catch (err) {
      // Questions optional
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in as a buyer to ask questions');
    try {
      setSubmittingAction(true);
      const res = await api.post(`/api/buyer/listings/${id}/questions`, { questionText });
      if (res.success) {
        setQuestionModal(false);
        setQuestionText('');
        setActionSuccessMessage('Question posted! The seller will be notified.');
        fetchQuestions();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestViewing = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in as a buyer to request viewings');
    try {
      setSubmittingAction(true);
      const res = await api.post(`/api/buyer/listings/${id}/viewings`, {
        requestedSlot: viewingSlot,
        locationPreference: viewingLocation,
        notes: viewingNotes,
      });
      if (res.success) {
        setViewingModal(false);
        setActionSuccessMessage('Viewing requested! You can track status in your Viewings tab.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReportListing = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to report listings');
    try {
      setSubmittingAction(true);
      const res = await api.post('/api/buyer/reports', {
        listingId: id,
        reason: reportReason,
        details: reportDetails,
      });
      if (res.success) {
        setReportModal(false);
        setActionSuccessMessage('Report submitted. A moderator will investigate.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading structured specifications...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container-custom py-16 text-center max-w-md mx-auto space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Listing Unavailable</h2>
        <p className="text-xs text-slate-600">{error || 'This listing does not exist or has been withdrawn.'}</p>
        <Link to="/marketplace" className="btn btn-primary text-xs">Return to Marketplace</Link>
      </div>
    );
  }

  const isLaptop = listing.category === 'laptop';
  const batteryHealth = listing.specifications?.batteryHealthPercent;
  const isBatteryDisclosed = batteryHealth !== null && batteryHealth !== undefined;

  return (
    <div className="container-custom py-8 space-y-8 animate-fade-in">
      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {actionSuccessMessage}
          </span>
          <button onClick={() => setActionSuccessMessage('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Top Details & Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Media & Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative">
            <img
              src={listing.images?.[0] || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="badge badge-neutral bg-slate-900/80 text-white text-xs uppercase">
                {listing.generalCondition?.replace('_', ' ')}
              </span>
              <span className="badge badge-neutral bg-blue-600 text-white text-xs uppercase">
                {listing.category?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Title and Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {listing.brand}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {listing.location?.city || 'Bangalore'}, {listing.location?.state || 'Karnataka'}
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {listing.title}
            </h1>
          </div>

          {/* Structured Spec Table */}
          <SpecTable listing={listing} />

          {/* Seller Disclosed Condition & Known Defects (SEPARATED VISUALLY) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Seller Condition Disclosures & Declarations
              </h3>
              <span className="text-[11px] text-slate-400">Seller-declared (Not verified by 3rd party)</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.detailedConditionDescription}
            </p>

            {/* Known Defects Block */}
            {listing.knownDefects?.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                <div className="text-xs font-bold text-rose-900">Declared Known Defects:</div>
                <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
                  {listing.knownDefects.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Repair History */}
            {listing.repairHistory?.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" /> Disclosed Repair History:
                </div>
                {listing.repairHistory.map((r, i) => (
                  <div key={i} className="text-xs text-slate-600">
                    • {r.description} ({r.date || 'Date unknown'}, performed by: {r.performedBy || 'Unspecified'})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Price, Evidence Status, Seller Info & Actions */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs text-slate-500 block">Asking Price</span>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{listing.askingPrice?.toLocaleString()}
              </div>
            </div>

            {/* Evidence Status Card */}
            <div className="p-3.5 rounded-lg border text-xs space-y-1.5 bg-slate-50 border-slate-200">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Documentation & Evidence Status
              </div>
              <div>
                {listing.evidenceStatus === 'verified' ? (
                  <span className="badge badge-verified text-xs">
                    Verified Supporting Documents on File
                  </span>
                ) : (
                  <span className="badge badge-unverified text-xs">
                    Seller-Provided / Not Independently Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {listing.evidenceRecords?.length > 0
                  ? `${listing.evidenceRecords.length} document(s) uploaded by seller. Serial numbers masked for privacy.`
                  : 'No invoices or hardware diagnostic receipts uploaded for this device.'}
              </p>
            </div>

            {/* Battery Disclosure Warning if Laptop */}
            {isLaptop && !isBatteryDisclosed && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-amber-700" /> Battery Health Omitted
                </div>
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  Seller did not declare battery capacity. State is <strong>unknown, not necessarily poor</strong>. Ask for a diagnostic screenshot before purchase.
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setViewingModal(true)}
                className="btn btn-primary w-full text-xs py-2.5 shadow-sm"
              >
                <Calendar className="w-4 h-4" /> Request Inspection Viewing
              </button>

              <button
                onClick={() => setQuestionModal(true)}
                className="btn btn-outline w-full text-xs py-2.5"
              >
                <MessageSquare className="w-4 h-4" /> Ask Seller a Question
              </button>
            </div>

            {/* Report Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <button
                onClick={() => setReportModal(true)}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px]"
              >
                <Flag className="w-3.5 h-3.5" /> Report suspicious listing
              </button>
            </div>
          </div>

          {/* Seller Reputation Summary Card (Actual Stored Data, Never Invented) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> Seller Verification Profile
            </h3>

            {listing.seller ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-sm">{listing.seller.name}</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Reputation Score:</span>
                  <span className="font-bold text-slate-900">
                    {listing.seller.reputationScore > 0 ? `${listing.seller.reputationScore} / 5.0` : 'New Seller'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Completed Sales:</span>
                  <span className="font-bold text-slate-900">{listing.seller.successfulSalesCount || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No seller history available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Public Q&A Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" /> Public Questions & Answers
          </h3>
          <button onClick={() => setQuestionModal(true)} className="btn btn-outline text-xs py-1 px-3">
            Ask Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">
            No questions asked yet. Be the first to ask the seller about this device.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-3">
            {questions.map((q) => (
              <div key={q._id} className="pt-3 space-y-1.5 text-xs">
                <div className="font-bold text-slate-800">Q: {q.questionText}</div>
                {q.answerText ? (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200">
                    <span className="font-bold text-blue-600">A (Seller):</span> {q.answerText}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Awaiting seller response...</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Modal */}
      {questionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Ask the Seller</h3>
            <form onSubmit={handleAskQuestion} className="space-y-3">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ask about battery diagnostic, invoices, or upgradeability..."
                rows="4"
                required
                className="form-textarea text-xs"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setQuestionModal(false)} className="btn btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={submittingAction} className="btn btn-primary text-xs">Submit Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Request Modal */}
      {viewingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Request Physical Inspection</h3>
            <p className="text-xs text-slate-500">Pick a proposed date/time to inspect the device before committing.</p>
            <form onSubmit={handleRequestViewing} className="space-y-3 text-xs">
              <div>
                <label className="form-label">Proposed Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={viewingSlot}
                  onChange={(e) => setViewingSlot(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label">Location Preference</label>
                <input
                  type="text"
                  value={viewingLocation}
                  onChange={(e) => setViewingLocation(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label">Notes for Seller (Optional)</label>
                <textarea
                  value={viewingNotes}
                  onChange={(e) => setViewingNotes(e.target.value)}
                  placeholder="e.g. Would like to test battery and display"
                  rows="2"
                  className="form-textarea text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setViewingModal(false)} className="btn btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={submittingAction} className="btn btn-primary text-xs">Request Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" /> Report Suspicious Listing
            </h3>
            <form onSubmit={handleReportListing} className="space-y-3 text-xs">
              <div>
                <label className="form-label">Violation Category</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-select text-xs"
                >
                  <option value="misleading_specifications">Misleading Specifications</option>
                  <option value="undisclosed_major_defect">Undisclosed Major Defect</option>
                  <option value="suspicious_pricing_or_scam">Suspicious Pricing / Potential Scam</option>
                  <option value="inconsistent_evidence">Inconsistent or Forged Evidence</option>
                  <option value="counterfeit_or_unauthorized">Counterfeit Hardware</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>
              <div>
                <label className="form-label">Details / Observations for Moderator</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the discrepancy..."
                  rows="3"
                  required
                  className="form-textarea text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReportModal(false)} className="btn btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={submittingAction} className="btn btn-danger text-xs">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

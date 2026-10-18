import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Upload, FileText, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

export function SellerEvidencePage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [evidenceRecords, setEvidenceRecords] = useState([]);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('purchase_invoice');
  const [serialNumber, setSerialNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchListingAndEvidence = async () => {
    try {
      const res = await api.get(`/api/listings/${id}`);
      if (res.success) {
        setListing(res.data);
        setEvidenceRecords(res.data.evidenceRecords || []);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchListingAndEvidence();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    setUploading(true);
    setMessage('');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('serialNumber', serialNumber);

    try {
      const res = await api.post(`/api/listings/${id}/evidence`, formData);
      if (res.success) {
        setMessage('Evidence uploaded securely! Document sent for verification.');
        setFile(null);
        setSerialNumber('');
        fetchListingAndEvidence();
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link to="/seller/dashboard" className="text-xs text-blue-600 flex items-center gap-1 mb-1 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Seller Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" /> Evidence & Document Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload store invoices, service receipts, or battery diagnostic logs for: <strong>{listing?.title}</strong>
        </p>
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

      {/* Security notice */}
      <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-1.5 shadow-sm">
        <div className="font-bold flex items-center gap-1.5 text-blue-300">
          <Lock className="w-3.5 h-3.5" /> Privacy & Serial Number Protection Notice:
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Full serial numbers and raw receipts are never exposed to public buyers or included in prompt contexts. Serials are automatically masked (e.g. <code>••••-••••-9210</code>) and stored in encrypted evidence vaults accessible strictly to verified moderators.
        </p>
      </div>

      {/* Upload Form */}
      <div className="tech-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Upload New Proof Document</h2>

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="form-label">Document Classification</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="form-select text-xs"
            >
              <option value="purchase_invoice">Store Purchase Invoice / Receipt</option>
              <option value="battery_diagnostic_report">Battery Diagnostic Log (e.g. ePSA, coconutBattery)</option>
              <option value="warranty_card">Warranty Registration Card</option>
              <option value="service_receipt">Authorized Service / Repair Receipt</option>
              <option value="ownership_affidavit">Ownership Declaration / Affidavit</option>
              <option value="other">Other Technical Document</option>
            </select>
          </div>

          <div>
            <label className="form-label">Hardware Serial Number (Will be Masked for Privacy)</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-8839210"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Select Document (PDF, JPEG, or PNG up to 5MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              className="form-input text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="btn btn-primary text-xs py-2 px-6 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Verifying Magic Bytes & Uploading...' : 'Upload Protected Document'}
          </button>
        </form>
      </div>

      {/* Uploaded Evidence Vault Records */}
      <div className="tech-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Submitted Documents on File</h2>

        {evidenceRecords.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 text-center">
            No evidence documents submitted for this device yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {evidenceRecords.map((doc, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{doc.originalFileName}</div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {doc.documentType.replace('_', ' ')} • Masked Serial: {doc.maskedSerialNumber}
                    </div>
                  </div>
                </div>

                <span className={`badge uppercase text-[10px] ${doc.verificationStatus === 'verified' ? 'badge-verified' : 'badge-unverified'}`}>
                  {doc.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

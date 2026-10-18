import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

export function BuyerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.patch('/api/auth/me', {
        name,
        preferences: { currency },
      });
      if (res.success) {
        setMessage('Profile updated successfully.');
        refreshUser();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Account & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal details and marketplace currency</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
        </div>
      )}

      <div className="tech-card p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <div className="text-xs text-slate-500">{user?.email}</div>
            <div className="mt-1 flex gap-2">
              <span className="badge badge-neutral text-[10px] uppercase font-bold">
                Role: {user?.role}
              </span>
              <span className={`badge text-[10px] uppercase ${user?.isEmailVerified ? 'badge-verified' : 'badge-warning'}`}>
                {user?.isEmailVerified ? 'Verified Email' : 'Email Unverified'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Email Address (Immutable)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="form-input text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="form-label">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="form-select text-xs"
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ United States Dollar)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Security Rule:</span> Role escalation is strictly prohibited. The role field is immutable on the server and cannot be altered via user profile updates.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary text-xs py-2 px-4 font-bold"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

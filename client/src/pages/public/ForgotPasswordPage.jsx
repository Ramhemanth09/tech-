import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.success) {
        setSubmitted(true);
        if (res.data?.devResetToken) {
          setDevToken(res.data.devResetToken);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="tech-card max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500">Enter your email to receive recovery instructions</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600">
              If an account with that email exists, password reset instructions have been sent.
            </p>

            {devToken && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs space-y-1">
                <span className="font-bold text-amber-900">[DEV MODE SHORTCUT]:</span>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="text-blue-600 font-bold underline break-all block"
                >
                  Click here to proceed to Password Reset Form
                </Link>
              </div>
            )}

            <Link to="/login" className="btn btn-outline text-xs w-full">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="form-input pl-9 text-xs"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full text-xs py-2.5 font-bold">
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-blue-600 hover:underline">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

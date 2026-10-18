import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage('Missing verification token in URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/api/auth/verify-email?token=${token}`);
        if (res.success) {
          setSuccess(true);
          setMessage(res.data?.message || 'Email successfully verified!');
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || 'Verification token has expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="tech-card max-w-md w-full p-8 text-center space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-base font-bold text-slate-800">Verifying your email...</h2>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Email Verified</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link to="/login" className="btn btn-primary text-xs w-full flex items-center justify-center gap-1.5">
                Sign In to Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-rose-600 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link to="/login" className="btn btn-outline text-xs w-full">Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.data?.user?.role === 'moderator') {
          navigate('/moderator/dashboard');
        } else if (res.data?.user?.role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate(from === '/login' ? '/marketplace' : from);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="tech-card max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to your verified Tech Companion account</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label mb-0">Password</label>
              <Link to="/forgot-password" className="text-blue-600 hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-xs py-2.5 shadow-sm font-bold"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Evaluator Quick-Fill Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Quick-Fill Demo Evaluator Accounts:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('buyer@demo.local', 'DemoPass123!')}
              className="btn btn-secondary text-[11px] py-1 px-2"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => quickFill('seller1@demo.local', 'DemoPass123!')}
              className="btn btn-secondary text-[11px] py-1 px-2"
            >
              Demo Seller
            </button>
            <button
              type="button"
              onClick={() => quickFill('moderator@demo.local', 'DemoPass123!')}
              className="btn btn-secondary text-[11px] py-1 px-2 text-amber-800 bg-amber-50 border border-amber-200"
            >
              Moderator
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register as Buyer or Seller
          </Link>
        </div>
      </div>
    </div>
  );
}

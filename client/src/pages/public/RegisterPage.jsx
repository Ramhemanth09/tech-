import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Strict: only 'buyer' or 'seller'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register({ name, email, password, role });
      if (res.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="tech-card max-w-md w-full p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Registration Successful</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We sent a verification link to <strong className="text-slate-800">{email}</strong>.
            Please verify your email before accessing your buyer or seller dashboard.
          </p>

          {/* Dev Mode Verification Link if available */}
          {successData.devVerificationToken && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs space-y-1">
              <span className="font-bold text-amber-900">[DEV MODE SHORTCUT]:</span>
              <p className="text-slate-700">Simulated email dispatch captured:</p>
              <Link
                to={`/verify-email?token=${successData.devVerificationToken}`}
                className="text-blue-600 font-bold underline break-all block"
              >
                Click here to verify instantly (Development mode)
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link to="/login" className="btn btn-primary text-xs w-full">Proceed to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="tech-card max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Create Account</h1>
          <p className="text-xs text-slate-500">Join the evidence-based tech buying companion</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

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
            <label className="form-label">Password (Min 8 Characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                minLength="8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                role === 'buyer' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Buyer</span>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === 'buyer'}
                    onChange={() => setRole('buyer')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500">Discover, compare and request viewings</span>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                role === 'seller' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Seller</span>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === 'seller'}
                    onChange={() => setRole('seller')}
                    className="accent-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500">List tech & upload proof documents</span>
              </label>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 italic">
              * Note: Moderator access is restricted to verified admins and cannot be self-selected.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-xs py-2.5 font-bold shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

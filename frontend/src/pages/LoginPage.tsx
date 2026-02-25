import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, User, Eye, EyeOff, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'user'>('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username.trim(), password.trim(), loginType);
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-login flex flex-col items-center justify-center p-4">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'oklch(0.62 0.18 145)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'oklch(0.72 0.18 55)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'oklch(0.62 0.16 195)' }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-green mb-4 card-shadow-lg">
            <img
              src="/assets/generated/bank-logo.dim_256x256.png"
              alt="Student Bank"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Building2 className="w-10 h-10 text-white hidden" />
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">Student Bank</h1>
          <p className="text-white/70 mt-1 text-sm">विद्यार्थी बँक व्यवस्थापन</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 card-shadow-lg border border-white/20">
          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6 bg-white/10 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setUsername('');
                setPassword('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                loginType === 'admin'
                  ? 'gradient-green text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('user');
                setUsername('');
                setPassword('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                loginType === 'user'
                  ? 'gradient-orange text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              User Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                {loginType === 'admin' ? 'Username' : 'Account Number'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={loginType === 'admin' ? 'Enter username' : 'Enter account number'}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 focus:bg-white/15 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 focus:bg-white/15 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg disabled:opacity-60 ${
                loginType === 'admin'
                  ? 'gradient-green hover:opacity-90'
                  : 'gradient-orange hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                `Login as ${loginType === 'admin' ? 'Admin' : 'User'}`
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Student Bank Management System v1.0
        </p>
      </div>
    </div>
  );
}
